"""数据库连接与会话。"""

from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings

settings = get_settings()

_is_sqlite = settings.database_url.startswith("sqlite")

if _is_sqlite:
    # 确保 db 文件所在目录存在，否则 create_engine 会报 unable to open database file
    db_path = settings.database_url.replace("sqlite:///", "")
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    settings.database_url,
    # SQLite 默认禁止跨线程复用连接，FastAPI 的线程池需要关掉这个检查
    connect_args={"check_same_thread": False} if _is_sqlite else {},
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """所有 ORM 模型的基类。"""


def get_db() -> Iterator[Session]:
    """FastAPI 依赖：每个请求一个会话，用完自动关闭。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """建表（幂等，已存在不会报错）。"""
    from . import models  # noqa: F401  必须先导入模型，metadata 才有表定义

    Base.metadata.create_all(bind=engine)
    _ensure_columns()


# 新增字段的最小迁移：create_all 只建表不改表，本地已有的 app.db 不会
# 自动多出新列。这里按 PRAGMA 检查一遍，缺什么补什么。
# 正式项目请换 Alembic，几十行的临时方案只适合 SQLite 早中期开发。
_EXPECTED_COLUMNS: dict[str, dict[str, str]] = {
    "users": {
        "phone": "VARCHAR(20)",
        "account": "VARCHAR(64)",
        "password_hash": "VARCHAR(160)",
    },
}

# ALTER TABLE ADD COLUMN 带不了 UNIQUE，唯一性另外补索引。
# SQLite 里 NULL 不参与唯一约束，所以多个游客（account 为空）不会冲突。
_UNIQUE_INDEXES: tuple[tuple[str, str, str], ...] = (
    ("ux_users_account", "users", "account"),
)


def _ensure_columns() -> None:
    if not _is_sqlite:
        return
    from sqlalchemy import text

    with engine.begin() as conn:
        for table, columns in _EXPECTED_COLUMNS.items():
            rows = conn.execute(text(f"PRAGMA table_info({table})")).fetchall()
            if not rows:
                continue
            existing = {row[1] for row in rows}
            for name, ddl in columns.items():
                if name not in existing:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl}"))
                    print(f"[migrate] {table}.{name} 已补齐")

        for idx_name, table, columns in _UNIQUE_INDEXES:
            try:
                conn.execute(
                    text(f"CREATE UNIQUE INDEX IF NOT EXISTS {idx_name} ON {table}({columns})")
                )
            except Exception as exc:  # 已有重复数据时建索引会失败，不影响启动
                print(f"[migrate] 唯一索引 {idx_name} 创建失败：{exc}")
