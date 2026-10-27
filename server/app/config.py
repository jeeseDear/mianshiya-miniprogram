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
    app_version: str = "1.0.0"
    api_prefix: str = "/api"

    # ---------------- 可观测性 ----------------
    # 日志级别：DEBUG / INFO / WARNING / ERROR
    log_level: str = "INFO"
    # 超过这个耗时就打 WARNING 并标记 slow=true，用来发现慢接口
    slow_request_ms: int = 500

    # SQLite 默认落在 server/data/app.db，换 PostgreSQL 只改这一行
    database_url: str = f"sqlite:///{(BASE_DIR / 'data' / 'app.db').as_posix()}"

    # 允许跨域的前端地址，逗号分隔；* 表示全部（仅开发用）
    cors_origins: str = "*"

    # 微信小程序登录（不配则只能游客登录）
    wx_appid: str = ""
    wx_secret: str = ""

    # ---------------- JWT ----------------
    # 留空则自动生成并写入 server/.jwt_secret（权限 600）；
    # 多台机器共用一套 token 时才需要显式配置成同一个值。
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    # token 有效期（天）。小程序里过期后需要重新登录，7 天算比较宽松。
    jwt_expire_days: int = 7

    # ---------------- 手机号验证码登录 ----------------
    # 验证码有效期（秒）与同一号码的最小重发间隔（秒）
    sms_code_ttl: int = 300
    sms_resend_interval: int = 60
    # 单个验证码最多允许输错几次，超过作废，防止暴力撞码
    sms_max_attempts: int = 5
    # 调试模式：不真发短信，只在响应体和日志里带出验证码。
    # 接真实短信服务（阿里云 SMS / 腾讯云 SMS）后设为 false。
    sms_debug: bool = True
    # 短信服务商，接真实通道时把 sms_debug 关掉并在这里选一个
    sms_provider: str = "debug"

    # ---------------- AI 解析（大模型） ----------------
    # 走 OpenAI 兼容的 /chat/completions 协议，DeepSeek / 通义 / 智谱 /
    # 自建 vLLM 都能直接用，换服务商只改这三行。
    # llm_api_key 留空时接口返回 503（前端弹窗提示「AI 解析未开启」），
    # 不会伪装成有结果。
    llm_base_url: str = "https://api.deepseek.com/v1"
    llm_api_key: str = ""
    llm_model: str = "deepseek-chat"
    # 生成一段解析通常 5~20 秒，超时给足；前端请求超时要同步放大
    llm_timeout: int = 60
    llm_max_tokens: int = 1200
    # 偏低一点，让输出稳定贴合 JSON 结构，不发挥
    llm_temperature: float = 0.4

    # 种子数据目录
    seed_dir: Path = BASE_DIR / "seed"

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
