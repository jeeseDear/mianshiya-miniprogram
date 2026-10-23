"""题库内容接口：分类、题目、每日一题、搜索、知识点。

全部是只读接口，未登录也能访问；带上 token 时会额外返回个性化字段。
"""

from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import get_optional_user
from ..models import Category, Knowledge, Question, Record, User
from ..schemas import (
    CategoryOut,
    HomeOut,
    KnowledgeBrief,
    KnowledgeDetail,
    NavItem,
    QuestionBrief,
    QuestionDetail,
    QuestionPage,
    StatsOut,
)
from ..services import get_stats, is_favorite

router = APIRouter(prefix="/api", tags=["题库"])


# ---------------- 内部工具 ----------------


def _brief(q: Question) -> QuestionBrief:
    """题目摘要。

    不直接用 ``model_validate``：``point_count`` 在数据库里没有对应列，
    需要从 ``points`` 数组算出来，否则前端列表拿不到这个字段。
    """
    return QuestionBrief(
        id=q.id,
        cat=q.cat,
        level=q.level,
        hot=q.hot or 0,
        title=q.title,
        short=q.short or "",
        source=q.source or "",
        point_count=len(q.points or []),
    )


def _k_brief(k: Knowledge) -> KnowledgeBrief:
    """知识点摘要（同理，要点数量从 JSON 列算）"""
    return KnowledgeBrief(
        id=k.id,
        cat=k.cat,
        title=k.title,
        summary=k.summary or "",
        point_count=len(k.points or []),
    )


def _category_counts(db: Session) -> dict[str, int]:
    rows = db.execute(
        select(Question.cat, func.count(Question.id)).group_by(Question.cat)
    ).all()
    return {cat: int(n) for cat, n in rows}


def _done_counts(db: Session, user: User | None) -> dict[str, int]:
    if user is None:
        return {}
    rows = db.execute(
        select(Question.cat, func.count(Record.id))
        .join(Record, Record.question_id == Question.id)
        .where(Record.user_id == user.id)
        .group_by(Question.cat)
    ).all()
    return {cat: int(n) for cat, n in rows}


def _categories_out(db: Session, user: User | None) -> list[CategoryOut]:
    totals = _category_counts(db)
    dones = _done_counts(db, user)
    items = db.scalars(select(Category).order_by(Category.sort, Category.id)).all()
    return [
        CategoryOut(
            id=c.id,
            name=c.name,
            short=c.short,
            icon=c.icon,
            bg=c.bg,
            desc=c.desc,
            total=totals.get(c.id, 0),
            done=dones.get(c.id, 0),
        )
        for c in items
    ]


def _neighbors(db: Session, q: Question) -> tuple[NavItem | None, NavItem | None]:
    """同分类内的上一题 / 下一题（按 id 排序，与前端 indexOfQa 语义一致）。"""
    prev_row = db.execute(
        select(Question.id, Question.title)
        .where(Question.cat == q.cat, Question.id < q.id)
        .order_by(Question.id.desc())
        .limit(1)
    ).first()
    next_row = db.execute(
        select(Question.id, Question.title)
        .where(Question.cat == q.cat, Question.id > q.id)
        .order_by(Question.id.asc())
        .limit(1)
    ).first()
    prev_item = NavItem(id=prev_row[0], title=prev_row[1]) if prev_row else None
    next_item = NavItem(id=next_row[0], title=next_row[1]) if next_row else None
    return prev_item, next_item


# ---------------- 首页聚合 ----------------


@router.get("/home", response_model=HomeOut, summary="首页聚合数据")
def home(
    db: Session = Depends(get_db), user: User | None = Depends(get_optional_user)
) -> HomeOut:
    """一次请求拿齐首页需要的四块数据，减少小程序的首屏请求数。"""
    total = db.scalar(select(func.count()).select_from(Question)) or 0
    offset = 0
    if total:
        d = date.today()
        offset = (d.year * 10000 + d.month * 100 + d.day) % total

    daily = db.scalars(select(Question).order_by(Question.id).offset(offset).limit(1)).first()
    hot = db.scalars(select(Question).order_by(Question.hot.desc(), Question.id).limit(5)).all()

    return HomeOut(
        daily=_brief(daily) if daily else None,
        hot=[_brief(q) for q in hot],
        categories=_categories_out(db, user),
        stats=StatsOut(**get_stats(db, user)) if user else None,
    )


# ---------------- 分类 ----------------


@router.get("/categories", response_model=list[CategoryOut], summary="分类列表（含题量与已读）")
def list_categories(
    db: Session = Depends(get_db), user: User | None = Depends(get_optional_user)
) -> list[CategoryOut]:
    return _categories_out(db, user)


# ---------------- 题目 ----------------


@router.get("/questions", response_model=QuestionPage, summary="题目列表（分页/筛选）")
def list_questions(
    cat: str | None = Query(None, description="分类 id，如 js / vue"),
    level: int | None = Query(None, ge=1, le=3),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    sort: str = Query("default", pattern="^(default|hot|level)$"),
    db: Session = Depends(get_db),
) -> QuestionPage:
    stmt = select(Question)
    count_stmt = select(func.count()).select_from(Question)

    if cat:
        stmt = stmt.where(Question.cat == cat)
        count_stmt = count_stmt.where(Question.cat == cat)
    if level:
        stmt = stmt.where(Question.level == level)
        count_stmt = count_stmt.where(Question.level == level)

    if sort == "hot":
        stmt = stmt.order_by(Question.hot.desc(), Question.id)
    elif sort == "level":
        stmt = stmt.order_by(Question.level.asc(), Question.id)
    else:
        stmt = stmt.order_by(Question.id)

    total = db.scalar(count_stmt) or 0
    items = db.scalars(stmt.offset((page - 1) * size).limit(size)).all()

    return QuestionPage(
        items=[_brief(q) for q in items],
        total=total,
        page=page,
        size=size,
        has_more=page * size < total,
    )


@router.get("/questions/daily", response_model=QuestionBrief, summary="每日一题")
def daily_question(db: Session = Depends(get_db)) -> QuestionBrief:
    """用日期做种子，同一天所有人拿到同一题（与前端 dailyQa 同思路）。"""
    total = db.scalar(select(func.count()).select_from(Question)) or 0
    if not total:
        raise HTTPException(status_code=404, detail="题库为空")
    d = date.today()
    offset = (d.year * 10000 + d.month * 100 + d.day) % total
    q = db.scalars(select(Question).order_by(Question.id).offset(offset).limit(1)).first()
    if q is None:
        raise HTTPException(status_code=404, detail="题目不存在")
    return _brief(q)


@router.get("/questions/hot", response_model=list[QuestionBrief], summary="高频题目")
def hot_questions(n: int = Query(5, ge=1, le=50), db: Session = Depends(get_db)):
    items = db.scalars(select(Question).order_by(Question.hot.desc(), Question.id).limit(n)).all()
    return [_brief(q) for q in items]


@router.get("/questions/random", response_model=QuestionBrief, summary="随机一题")
def random_question(
    cat: str | None = None,
    exclude: str | None = Query(None, description="排除的题目 id，用于「换一题」"),
    db: Session = Depends(get_db),
):
    stmt = select(Question)
    if cat:
        stmt = stmt.where(Question.cat == cat)
    if exclude:
        stmt = stmt.where(Question.id != exclude)
    q = db.scalars(stmt.order_by(func.random()).limit(1)).first()
    if q is None:
        raise HTTPException(status_code=404, detail="没有符合条件的题目")
    return _brief(q)


@router.get("/questions/{question_id}", response_model=QuestionDetail, summary="题目详情")
def question_detail(
    question_id: str,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> QuestionDetail:
    q = db.get(Question, question_id)
    if q is None:
        raise HTTPException(status_code=404, detail=f"题目 {question_id} 不存在")

    prev_item, next_item = _neighbors(db, q)
    rec = None
    if user:
        rec = db.scalar(
            select(Record).where(Record.user_id == user.id, Record.question_id == q.id)
        )

    return QuestionDetail(
        **_brief(q).model_dump(),
        points=q.points or [],
        detail=q.detail or [],
        extend=q.extend or [],
        is_favorite=is_favorite(db, user.id, q.id) if user else False,
        is_done=rec is not None,
        is_right=bool(rec and rec.correct),
        prev=prev_item,
        next=next_item,
    )


# ---------------- 搜索 ----------------


@router.get("/search", summary="搜索题目与知识点")
def search(
    q: str = Query(..., min_length=1, description="关键词"),
    cat: str | None = None,
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
) -> dict:
    like = f"%{q.strip()}%"

    qa_stmt = select(Question).where(
        or_(
            Question.title.ilike(like),
            Question.short.ilike(like),
            cast(Question.points, String).ilike(like),
            cast(Question.detail, String).ilike(like),
            cast(Question.extend, String).ilike(like),
        )
    )
    kb_stmt = select(Knowledge).where(
        or_(
            Knowledge.title.ilike(like),
            Knowledge.summary.ilike(like),
            cast(Knowledge.points, String).ilike(like),
        )
    )
    if cat:
        qa_stmt = qa_stmt.where(Question.cat == cat)
        kb_stmt = kb_stmt.where(Knowledge.cat == cat)

    qa = db.scalars(qa_stmt.order_by(Question.hot.desc()).limit(limit)).all()
    kb = db.scalars(kb_stmt.order_by(Knowledge.id).limit(limit)).all()

    return {
        "keyword": q,
        "qa": [_brief(x) for x in qa],
        "knowledge": [_k_brief(x) for x in kb],
        "total": len(qa) + len(kb),
    }


# ---------------- 知识点 ----------------


@router.get("/knowledge", summary="知识点列表")
def list_knowledge(
    cat: str | None = None,
    with_points: bool = Query(False, description="是否返回要点全文"),
    db: Session = Depends(get_db),
):
    stmt = select(Knowledge)
    if cat:
        stmt = stmt.where(Knowledge.cat == cat)
    items = db.scalars(stmt.order_by(Knowledge.id)).all()
    if with_points:
        return [KnowledgeDetail.model_validate(k) for k in items]
    return [_k_brief(k) for k in items]


@router.get("/knowledge/{kid}", response_model=KnowledgeDetail, summary="知识点详情")
def knowledge_detail(kid: str, db: Session = Depends(get_db)) -> KnowledgeDetail:
    k = db.get(Knowledge, kid)
    if k is None:
        raise HTTPException(status_code=404, detail=f"知识点 {kid} 不存在")
    return KnowledgeDetail.model_validate(k)


# ---------------- 题库镜像（离线优先） ----------------


@router.get("/catalog/mirror", summary="题库镜像：分类 + 全部题目摘要 + 知识点摘要")
def catalog_mirror(
    db: Session = Depends(get_db), user: User | None = Depends(get_optional_user)
) -> dict:
    """一次返回全站题目的「目录级」数据，供小程序本地缓存与离线展示。

    只含摘要（id/cat/level/hot/title/short/source），不含 points/detail/extend，
    553 题的响应约 100 KB。详情仍走 /api/questions/{id} 按需拉取。

    为什么要有这个接口：前端列表页、分类页、搜索都依赖「同步可读」的题库结构，
    逐页拉分页接口既要 6 次往返，又无法保证翻页时数据是同一快照。
    """
    q_rows = db.scalars(select(Question).order_by(Question.id)).all()
    k_rows = db.scalars(select(Knowledge).order_by(Knowledge.id)).all()
    cats = _categories_out(db, user)

    return {
        # 题目/知识点只增不减，用三者数量做版本号即可判断缓存是否过期。
        # 末尾的 -2 是「镜像结构版本」：加了 point_count 之后旧缓存缺少该字段，
        # 必须让版本号变化才能把客户端的老缓存换掉，否则列表会一直显示 0 条。
        "version": f"{len(q_rows)}-{len(k_rows)}-{len(cats)}-2",
        "categories": cats,
        "questions": [_brief(q) for q in q_rows],
        "knowledge": [_k_brief(k) for k in k_rows],
    }
