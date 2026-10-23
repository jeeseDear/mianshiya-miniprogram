"""公共依赖：从请求头解析登录用户。"""

from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import get_db
from .models import User

# auto_error=False：没带 token 时不直接 403，交给下面区分「游客可访问」与「必须登录」
bearer = HTTPBearer(auto_error=False)


def get_optional_user(
    cred: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User | None:
    """公开接口也能识别用户，用来返回「是否已收藏」这类个性化字段。"""
    if cred is None:
        return None
    user = db.scalar(select(User).where(User.token == cred.credentials))
    return user


def get_current_user(user: User | None = Depends(get_optional_user)) -> User:
    """需要登录的接口用它，未登录统一 401。"""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未登录或 token 失效，请调用 /api/auth/guest 获取游客 token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
