"""JWT 签发与校验。

密钥来源优先级：

1. 环境变量 / ``.env`` 里的 ``JWT_SECRET``
2. ``server/.jwt_secret`` 文件（不存在时首次启动随机生成并写入，权限 600）

密钥落文件而不是写死在代码里，原因有两个：进程重启后已签发的 token 仍然有效；
文件不进 git，不会泄漏。线上也可以用 ``JWT_SECRET`` 覆盖，方便多机共用同一密钥。
"""

from __future__ import annotations

import secrets
import time
from functools import lru_cache

import jwt

from .config import BASE_DIR, get_settings

_SECRET_FILE = BASE_DIR / ".jwt_secret"

# 只用于 access token，后续要加刷新机制时再区分
TOKEN_TYPE = "access"


@lru_cache(maxsize=1)
def _secret() -> str:
    settings = get_settings()
    if settings.jwt_secret:
        return settings.jwt_secret

    try:
        if _SECRET_FILE.exists():
            stored = _SECRET_FILE.read_text(encoding="utf-8").strip()
            if stored:
                return stored
    except OSError:
        # 读不到就继续往下生成，宁可重启后旧 token 失效也不能起不来
        pass

    generated = secrets.token_urlsafe(48)
    try:
        _SECRET_FILE.write_text(generated, encoding="utf-8")
        _SECRET_FILE.chmod(0o600)
    except OSError:
        pass
    return generated


def create_access_token(user_id: int) -> str:
    """签发 access token。``sub`` 放用户 id，其余只放时间戳。"""
    settings = get_settings()
    now = int(time.time())
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + settings.jwt_expire_days * 86400,
        "typ": TOKEN_TYPE,
    }
    return jwt.encode(payload, _secret(), algorithm=settings.jwt_algorithm)


def parse_user_id(token: str) -> int | None:
    """校验签名与有效期，返回用户 id；任何异常都当成无效 token。

    返回 None 时调用方还可以走「数据库 token」兜底，所以这里不抛异常。
    """
    if not token:
        return None

    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            _secret(),
            algorithms=[settings.jwt_algorithm],
            options={"require": ["exp", "sub"]},
        )
    except jwt.PyJWTError:
        return None

    if payload.get("typ") not in (None, TOKEN_TYPE):
        return None

    try:
        return int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        return None
