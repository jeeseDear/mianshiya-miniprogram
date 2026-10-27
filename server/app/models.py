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
    """游客 / 账号密码 / 手机号 / 微信用户共用一张表。

    账号类型的判定只看一个条件：``openid``、``phone``、``account``
    三个都为空即游客。这样多种入口（游客、账号密码、手机号、微信）
    互不冲突，同一个人先游客后登录也能把数据并过去。
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    openid: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True, index=True)
    # 账号密码登录：account 存账号（统一小写），password_hash 存
    # `pbkdf2_sha256$迭代次数$salt$hash`，明文密码不落库
    account: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True, index=True)
    password_hash: Mapped[str | None] = mapped_column(String(160), nullable=True)
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


class SmsCode(Base):
    """手机号验证码。

    落库而不是放内存，原因有两个：进程重启后用户不用重发；同一手机号的
    发送频率限制可以直接查表，不需要额外的 Redis。单个手机号只保留最新
    一条，重发时覆盖旧的，避免多码都能用的安全问题。

    时间戳用 int（秒级 epoch）：验证码只关心「过期没」，存本地时间字符串
    还要处理时区，得不偿失。
    """

    __tablename__ = "sms_codes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    code: Mapped[str] = mapped_column(String(8))
    expired_at: Mapped[int] = mapped_column(Integer)
    sent_at: Mapped[int] = mapped_column(Integer)
    # 已验证次数，防止同一验证码被撞库反复试探
    attempts: Mapped[int] = mapped_column(Integer, default=0)


class AiExplanation(Base):
    """AI 解析缓存：一道题一行。

    为什么落库而不是每次现调模型：一次调用要 5~20 秒、按 token 计费，
    而解析内容对同一道题是稳定的。缓存之后只有第一个用户会等，其余
    瞬间返回，也不会重复花钱。

    用 ``question_id`` 直接做主键——天然保证一题一条，不需要额外唯一索引。
    ``model`` 记录生成时用的模型名，方便以后换模型时判断哪些需要重生成。
    """

    __tablename__ = "ai_explanations"

    question_id: Mapped[str] = mapped_column(ForeignKey("questions.id"), primary_key=True)
    model: Mapped[str] = mapped_column(String(64), default="")
    # 结构化内容：core / answer / bonus / trap / followup
    content: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
