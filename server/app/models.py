"""ORM 模型。

对应前端的两类数据：
    1. 内容（只读）：Category / Question / Knowledge —— 来自 common/ 下的题库
    2. 用户数据（读写）：User / Favorite / Wrong / Record / DailyStat
       —— 对应前端 uni.getStorageSync 里的 duck:favorites / duck:wrongs / duck:records / duck:daily
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def now() -> datetime:
    return datetime.now(timezone.utc)


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(64))
    short: Mapped[str] = mapped_column(String(32), default="")
    icon: Mapped[str] = mapped_column(String(16), default="")
    bg: Mapped[str] = mapped_column(String(16), default="")
    desc: Mapped[str] = mapped_column(String(255), default="")
    sort: Mapped[int] = mapped_column(Integer, default=0, index=True)


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    cat: Mapped[str] = mapped_column(String(32), ForeignKey("categories.id"), index=True)
    level: Mapped[int] = mapped_column(Integer, default=1, index=True)
    hot: Mapped[int] = mapped_column(Integer, default=0, index=True)
    source: Mapped[str] = mapped_column(String(128), default="")
    title: Mapped[str] = mapped_column(String(255))
    short: Mapped[str] = mapped_column(Text, default="")
    # JSON 列在 SQLite 里存 TEXT，读写时自动序列化
    points: Mapped[list] = mapped_column(JSON, default=list)
    detail: Mapped[list] = mapped_column(JSON, default=list)
    extend: Mapped[list] = mapped_column(JSON, default=list)

    __table_args__ = (Index("ix_questions_cat_hot", "cat", "hot"),)


class Knowledge(Base):
    __tablename__ = "knowledge"

    id: Mapped[str] = mapped_column(String(48), primary_key=True)
    cat: Mapped[str] = mapped_column(String(32), ForeignKey("categories.id"), index=True)
    title: Mapped[str] = mapped_column(String(128))
    summary: Mapped[str] = mapped_column(Text, default="")
    points: Mapped[list] = mapped_column(JSON, default=list)
    code: Mapped[str] = mapped_column(Text, default="")
    tips: Mapped[list] = mapped_column(JSON, default=list)


class User(Base):
    """游客与微信用户共用一张表；openid 为空即游客。"""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    openid: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    nickname: Mapped[str] = mapped_column(String(64), default="面试鸭用户")
    avatar: Mapped[str] = mapped_column(String(255), default="")
    token: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    favorites: Mapped[list["Favorite"]] = relationship(cascade="all, delete-orphan", lazy="select")


class Favorite(Base):
    __tablename__ = "favorites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[str] = mapped_column(ForeignKey("questions.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    __table_args__ = (UniqueConstraint("user_id", "question_id", name="uq_fav_user_question"),)


class Wrong(Base):
    __tablename__ = "wrongs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[str] = mapped_column(ForeignKey("questions.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    __table_args__ = (UniqueConstraint("user_id", "question_id", name="uq_wrong_user_question"),)


class Record(Base):
    """答题记录：一题一行，correct 为最近一次结果。

    前端用 { [qid]: 1|0 } 的 map 表示，这里规范化成行，便于按分类统计。
    """

    __tablename__ = "records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[str] = mapped_column(ForeignKey("questions.id"), index=True)
    correct: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=now, onupdate=now)

    __table_args__ = (UniqueConstraint("user_id", "question_id", name="uq_record_user_question"),)


class DailyStat(Base):
    """每日新增已读题数，用于「今日进度」与「连续打卡」。

    连续天数不落库，按日期倒序现算，避免漏打卡导致数据不一致。
    """

    __tablename__ = "daily_stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    day: Mapped[str] = mapped_column(String(10), index=True)  # YYYY-MM-DD
    count: Mapped[int] = mapped_column(Integer, default=0)

    __table_args__ = (UniqueConstraint("user_id", "day", name="uq_daily_user_day"),)
