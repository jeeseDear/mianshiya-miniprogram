"""用户学习数据：答题记录、收藏、错题、统计。

每个接口都要求登录（Bearer token）。业务规则集中在 services.py，
这里只做「参数校验 + 组装响应」。
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import get_current_user
from ..models import AiHistory, DailyStat, Favorite, Question, Record, User, Wrong, now
from ..schemas import (
    AiHistoryItem,
    QuestionBrief,
    RecordIn,
    RecordItem,
    RecordOut,
    StatsOut,
)
from ..services import get_stats, record_answer

router = APIRouter(prefix="/api/me", tags=["我的"])


def _ensure_question(db: Session, question_id: str) -> None:
    if db.get(Question, question_id) is None:
        raise HTTPException(status_code=404, detail=f"题目 {question_id} 不存在")


# ---------------- 答题记录 ----------------


@router.post("/records", response_model=RecordOut, summary="记录一次作答")
def create_record(
    payload: RecordIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> RecordOut:
    """答对自动移出错题本，答错自动进错题本；首答才累加今日进度。"""
    _ensure_question(db, payload.question_id)
    first, today, streak = record_answer(db, user, payload.question_id, payload.correct)
    return RecordOut(
        question_id=payload.question_id,
        correct=payload.correct,
        first_time=first,
        today=today,
        streak=streak,
    )


@router.get("/records", response_model=list[RecordItem], summary="全部答题记录")
def list_records(
    cat: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[RecordItem]:
    stmt = (
        select(Record.question_id, Record.correct)
        .join(Question, Question.id == Record.question_id)
        .where(Record.user_id == user.id)
    )
    if cat:
        stmt = stmt.where(Question.cat == cat)
    rows = db.execute(stmt.order_by(Record.updated_at.desc())).all()
    return [RecordItem(question_id=qid, correct=bool(ok)) for qid, ok in rows]


# ---------------- 收藏 ----------------


@router.get("/favorites", response_model=list[QuestionBrief], summary="收藏列表")
def list_favorites(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[QuestionBrief]:
    items = db.scalars(
        select(Question)
        .join(Favorite, Favorite.question_id == Question.id)
        .where(Favorite.user_id == user.id)
        .order_by(Favorite.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    ).all()
    return [QuestionBrief.model_validate(q) for q in items]


@router.post("/favorites/{question_id}", status_code=201, summary="收藏")
def add_favorite(
    question_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> dict:
    _ensure_question(db, question_id)
    exists = db.scalar(
        select(Favorite.id).where(
            Favorite.user_id == user.id, Favorite.question_id == question_id
        )
    )
    if exists is None:
        db.add(Favorite(user_id=user.id, question_id=question_id))
        db.commit()
    return {"question_id": question_id, "favorite": True}


@router.delete("/favorites/{question_id}", summary="取消收藏")
def delete_favorite(
    question_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> dict:
    db.execute(
        delete(Favorite).where(
            Favorite.user_id == user.id, Favorite.question_id == question_id
        )
    )
    db.commit()
    return {"question_id": question_id, "favorite": False}


# ---------------- 错题 ----------------


@router.get("/wrongs", response_model=list[QuestionBrief], summary="错题列表")
def list_wrongs(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[QuestionBrief]:
    items = db.scalars(
        select(Question)
        .join(Wrong, Wrong.question_id == Question.id)
        .where(Wrong.user_id == user.id)
        .order_by(Wrong.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    ).all()
    return [QuestionBrief.model_validate(q) for q in items]


@router.delete("/wrongs/{question_id}", summary="移出错题本")
def delete_wrong(
    question_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> dict:
    db.execute(
        delete(Wrong).where(Wrong.user_id == user.id, Wrong.question_id == question_id)
    )
    db.commit()
    return {"question_id": question_id, "wrong": False}


# ---------------- AI 解析历史 ----------------


@router.post("/ai-history/{question_id}", summary="记录一次 AI 解析浏览")
def record_ai_history(
    question_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """同一道题看多次只占一行：刷新时间 + 次数累加，列表按时间倒序。

    没有做频率限制，因为前端只在「解析真正拿到内容」时调用一次，
    连点打开也不会重复触发。
    """
    _ensure_question(db, question_id)
    row = db.scalar(
        select(AiHistory).where(
            AiHistory.user_id == user.id, AiHistory.question_id == question_id
        )
    )
    if row is None:
        db.add(AiHistory(user_id=user.id, question_id=question_id, view_count=1))
    else:
        row.view_count += 1
        row.viewed_at = now()
    db.commit()
    return {"question_id": question_id, "viewed": True}


@router.get("/ai-history", response_model=list[AiHistoryItem], summary="AI 解析历史")
def list_ai_history(
    page: int = Query(1, ge=1),
    size: int = Query(30, ge=1, le=100),
    cat: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[AiHistoryItem]:
    """最近看过的排最前，可按分类过滤。"""
    stmt = (
        select(Question, AiHistory.viewed_at, AiHistory.view_count)
        .join(AiHistory, AiHistory.question_id == Question.id)
        .where(AiHistory.user_id == user.id)
    )
    if cat:
        stmt = stmt.where(Question.cat == cat)
    rows = db.execute(
        stmt.order_by(AiHistory.viewed_at.desc()).offset((page - 1) * size).limit(size)
    ).all()
    return [
        AiHistoryItem(
            id=q.id,
            cat=q.cat,
            level=q.level,
            title=q.title,
            source=q.source or "",
            viewed_at=viewed_at,
            view_count=count,
        )
        for q, viewed_at, count in rows
    ]


@router.delete("/ai-history/{question_id}", summary="删除一条 AI 解析历史")
def delete_ai_history(
    question_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    db.execute(
        delete(AiHistory).where(
            AiHistory.user_id == user.id, AiHistory.question_id == question_id
        )
    )
    db.commit()
    return {"question_id": question_id, "removed": True}


@router.delete("/ai-history", summary="清空 AI 解析历史")
def clear_ai_history(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> dict:
    db.execute(delete(AiHistory).where(AiHistory.user_id == user.id))
    db.commit()
    return {"cleared": True}


# ---------------- 统计 ----------------


@router.get("/stats", response_model=StatsOut, summary="学习统计")
def stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> StatsOut:
    return StatsOut(**get_stats(db, user))


@router.delete("/progress", summary="清空我的学习数据（对应前端 resetAll）")
def reset_progress(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> dict:
    for model in (Record, Favorite, Wrong, DailyStat, AiHistory):
        db.execute(delete(model).where(model.user_id == user.id))
    db.commit()
    return {"reset": True, "user_id": user.id}


@router.get("/summary", summary="我的页聚合（用户信息 + 统计）")
def summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> dict:
    total = db.scalar(select(func.count()).select_from(Question)) or 0
    return {
        "user": {"id": user.id, "nickname": user.nickname, "avatar": user.avatar},
        "stats": get_stats(db, user),
        "question_total": total,
    }
