"""业务逻辑集中在这里，路由只做参数接收和响应组装。

好处：统计口径只写一遍，HTTP 层换框架（FastAPI → Flask）不用改业务。
"""

from __future__ import annotations

from datetime import date, datetime, timedelta

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from .models import DailyStat, Favorite, Question, Record, User, Wrong


def today_str() -> str:
    return date.today().isoformat()


def bump_daily(db: Session, user_id: int) -> int:
    """当天已读数 +1（只有首次作答才调用）。"""
    day = today_str()
    stat = db.scalar(select(DailyStat).where(DailyStat.user_id == user_id, DailyStat.day == day))
    if stat is None:
        stat = DailyStat(user_id=user_id, day=day, count=1)
        db.add(stat)
    else:
        stat.count += 1
    db.flush()
    return stat.count


def today_count(db: Session, user_id: int) -> int:
    value = db.scalar(
        select(DailyStat.count).where(DailyStat.user_id == user_id, DailyStat.day == today_str())
    )
    return int(value or 0)


def compute_streak(db: Session, user_id: int) -> int:
    """连续打卡天数：从今天（或昨天）往前数连续有记录的日期。

    不落库、每次现算 —— 相比前端存 { last, days }，不会因为漏改而算错。
    """
    days = db.scalars(
        select(DailyStat.day).where(DailyStat.user_id == user_id).order_by(DailyStat.day.desc())
    ).all()
    if not days:
        return 0

    parsed = [datetime.strptime(d, "%Y-%m-%d").date() for d in days]
    today = date.today()
    # 今天还没做题，但昨天做了，连续天数依然保留
    if parsed[0] not in (today, today - timedelta(days=1)):
        return 0

    streak = 1
    cursor = parsed[0]
    for d in parsed[1:]:
        if d == cursor - timedelta(days=1):
            streak += 1
            cursor = d
        else:
            break
    return streak


def is_favorite(db: Session, user_id: int, question_id: str) -> bool:
    return (
        db.scalar(
            select(Favorite.id).where(
                Favorite.user_id == user_id, Favorite.question_id == question_id
            )
        )
        is not None
    )


def add_favorite(db: Session, user_id: int, question_id: str) -> None:
    if not is_favorite(db, user_id, question_id):
        db.add(Favorite(user_id=user_id, question_id=question_id))
        db.commit()


def remove_favorite(db: Session, user_id: int, question_id: str) -> None:
    db.execute(
        delete(Favorite).where(
            Favorite.user_id == user_id, Favorite.question_id == question_id
        )
    )
    db.commit()


def add_wrong(db: Session, user_id: int, question_id: str) -> None:
    exists = db.scalar(
        select(Wrong.id).where(Wrong.user_id == user_id, Wrong.question_id == question_id)
    )
    if exists is None:
        db.add(Wrong(user_id=user_id, question_id=question_id))


def remove_wrong(db: Session, user_id: int, question_id: str) -> int:
    result = db.execute(
        delete(Wrong).where(Wrong.user_id == user_id, Wrong.question_id == question_id)
    )
    return result.rowcount or 0


def record_answer(
    db: Session, user: User, question_id: str, correct: bool
) -> tuple[bool, int, int]:
    """记录一次作答，返回 (是否首次, 今日已读, 连续天数)。

    规则与前端 interview-store.recordAnswer 一致：
        - 答对 → 从错题本移除；答错 → 进错题本
        - 只有首次作答才累加今日进度
    """
    rec = db.scalar(
        select(Record).where(Record.user_id == user.id, Record.question_id == question_id)
    )
    first_time = rec is None
    if rec is None:
        db.add(Record(user_id=user.id, question_id=question_id, correct=correct))
    else:
        rec.correct = correct

    if correct:
        remove_wrong(db, user.id, question_id)
    else:
        add_wrong(db, user.id, question_id)

    if first_time:
        bump_daily(db, user.id)
    db.commit()

    return first_time, today_count(db, user.id), compute_streak(db, user.id)


def get_stats(db: Session, user: User) -> dict:
    """与前端 getStats(total) 返回同名字段，前端只改数据来源不改模板。"""
    total = db.scalar(select(func.count()).select_from(Question)) or 0
    done = (
        db.scalar(select(func.count()).select_from(Record).where(Record.user_id == user.id)) or 0
    )
    right = (
        db.scalar(
            select(func.count())
            .select_from(Record)
            .where(Record.user_id == user.id, Record.correct.is_(True))
        )
        or 0
    )
    wrong = db.scalar(select(func.count()).select_from(Wrong).where(Wrong.user_id == user.id)) or 0
    favorite = (
        db.scalar(select(func.count()).select_from(Favorite).where(Favorite.user_id == user.id))
        or 0
    )

    return {
        "done": done,
        "right": right,
        "wrong": wrong,
        "favorite": favorite,
        "rate": round(right / done * 100) if done else 0,
        "progress": round(done / total * 100) if total else 0,
        "streak": compute_streak(db, user.id),
        "today": today_count(db, user.id),
        "total": total,
    }


def merge_user_data(db: Session, src: User, dst: User) -> dict:
    """把游客账号的学习数据并入正式账号（微信登录时调用）。

    规则：
        - 收藏 / 错题：并集，重复的丢掉多余那条
        - 答题记录：按题去重，游客的覆盖目标（更近的一次作答）
        - 每日打卡：同一天累加，保证「今天读了几题」不丢

    返回各类迁移条数，方便日志与前端提示。
    因 SQLite 默认不启用外键级联，最后要显式清掉源账号的残留行。
    """
    moved = {"favorites": 0, "wrongs": 0, "records": 0, "daily": 0}

    # 收藏：目标已有的直接删源行，其余的改归属
    dst_fav = set(db.scalars(select(Favorite.question_id).where(Favorite.user_id == dst.id)).all())
    for row in db.scalars(select(Favorite).where(Favorite.user_id == src.id)).all():
        if row.question_id in dst_fav:
            db.delete(row)
        else:
            row.user_id = dst.id
            dst_fav.add(row.question_id)
            moved["favorites"] += 1

    # 错题：同收藏
    dst_wrong = set(db.scalars(select(Wrong.question_id).where(Wrong.user_id == dst.id)).all())
    for row in db.scalars(select(Wrong).where(Wrong.user_id == src.id)).all():
        if row.question_id in dst_wrong:
            db.delete(row)
        else:
            row.user_id = dst.id
            dst_wrong.add(row.question_id)
            moved["wrongs"] += 1

    # 记录：游客是最近在用的账号，值以游客为准
    dst_rec = {
        r.question_id: r
        for r in db.scalars(select(Record).where(Record.user_id == dst.id)).all()
    }
    for row in db.scalars(select(Record).where(Record.user_id == src.id)).all():
        hit = dst_rec.get(row.question_id)
        if hit is None:
            row.user_id = dst.id
            dst_rec[row.question_id] = row
            moved["records"] += 1
        else:
            hit.correct = row.correct
            hit.updated_at = row.updated_at
            db.delete(row)

    # 打卡：同一天相加，避免合并后「今日进度」变回 0
    dst_daily = {
        d.day: d
        for d in db.scalars(select(DailyStat).where(DailyStat.user_id == dst.id)).all()
    }
    for row in db.scalars(select(DailyStat).where(DailyStat.user_id == src.id)).all():
        hit = dst_daily.get(row.day)
        if hit is None:
            row.user_id = dst.id
            dst_daily[row.day] = row
            moved["daily"] += 1
        else:
            hit.count += row.count
            db.delete(row)

    db.flush()

    # 源账号理论上已空，兜底清一遍再删除（SQLite 外键级联不生效）
    for model in (Favorite, Wrong, Record, DailyStat):
        db.execute(delete(model).where(model.user_id == src.id))
    db.delete(src)
    db.commit()
    return moved
