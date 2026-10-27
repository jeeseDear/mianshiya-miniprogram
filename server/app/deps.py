"""公共依赖：从请求头解析登录用户。

token 支持两种：

1. JWT（现在签发的都是这种，自包含、不用查库）
2. 数据库里存的固定串（老版本签发的 token，保留兜底，避免升级后所有人被登出）
"""

from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import get_db
from .models import User
from .security import parse_user_id

# auto_error=False：没带 token 时不直接 403，交给下面区分「游客可访问」与「必须登录」
bearer = HTTPBearer(auto_error=False)


def get_optional_user(
    cred: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User | None:
    """公开接口也能识别用户，用来返回「是否已收藏」这类个性化字段。"""
    if cred is None:
        return None

    token = cred.credentials

    # 先按 JWT 解析：签名或有效期不对才回落到查库
    user_id = parse_user_id(token)
    if user_id is not None:
        user = db.get(User, user_id)
        if user is not None:
            return user

    return db.scalar(select(User).where(User.token == token))


def get_current_user(user: User | None = Depends(get_optional_user)) -> User:
    """需要登录的接口用它，未登录统一 401。"""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未登录或 token 已过期，请重新登录",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
