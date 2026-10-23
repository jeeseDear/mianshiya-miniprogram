"""服务配置。

所有可变配置都从环境变量 / .env 读取，代码里不出现密钥。
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "面试鸭 API"
    api_prefix: str = "/api"

    # SQLite 默认落在 server/data/app.db，换 PostgreSQL 只改这一行
    database_url: str = f"sqlite:///{(BASE_DIR / 'data' / 'app.db').as_posix()}"

    # 允许跨域的前端地址，逗号分隔；* 表示全部（仅开发用）
    cors_origins: str = "*"

    # 微信小程序登录（不配则只能游客登录）
    wx_appid: str = ""
    wx_secret: str = ""

    # 种子数据目录
    seed_dir: Path = BASE_DIR / "seed"

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
