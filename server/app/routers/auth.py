"""登录：游客 + 微信小程序。

游客模式让前端「不接微信也能联调」，微信登录只需补两个环境变量。

两种账号共用 users 表：openid 为空即游客。微信登录时如果请求头里还带着
游客 token，会把游客名下的收藏 / 错题 / 记录 / 打卡并到微信账号上
——否则用户刷了几十题再登录，进度会凭空消失。
"""

from __future__ import annotations

import secrets

import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import get_settings
from ..db import get_db
from ..deps import get_current_user, get_optional_user
from ..models import User
from ..schemas import GuestLoginOut, MeOut, ProfileIn, WechatLoginIn
from ..services import merge_user_data

router = APIRouter(prefix="/api/auth", tags=["登录"])

WX_CODE2SESSION = "https://api.weixin.qq.com/sns/jscode2session"


def _login_out(user: User) -> GuestLoginOut:
    return GuestLoginOut(
        token=user.token,
        user_id=user.id,
        nickname=user.nickname,
        avatar=user.avatar,
        is_guest=user.openid is None,
    )


@router.post("/guest", response_model=GuestLoginOut, summary="游客登录")
def guest_login(db: Session = Depends(get_db)) -> GuestLoginOut:
    """生成匿名用户并返回 token。数据只属于这个 token，换设备即换账号。"""
    user = User(
        token=secrets.token_urlsafe(24),
        nickname=f"游客{secrets.randbelow(9000) + 1000}",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _login_out(user)


@router.post("/wechat", response_model=GuestLoginOut, summary="微信小程序登录")
def wechat_login(
    payload: WechatLoginIn,
    db: Session = Depends(get_db),
    current: User | None = Depends(get_optional_user),
) -> GuestLoginOut:
    settings = get_settings()
    if not settings.wx_appid or not settings.wx_secret:
        raise HTTPException(
            status_code=501,
            detail="服务端未配置 WX_APPID / WX_SECRET，请先用 /api/auth/guest 调试",
        )

    try:
        resp = requests.get(
            WX_CODE2SESSION,
            params={
                "appid": settings.wx_appid,
                "secret": settings.wx_secret,
                "js_code": payload.code,
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
        data = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise HTTPException(status_code=502, detail=f"无法连接微信服务器：{exc}") from exc

    openid = data.get("openid")
    if not openid:
        raise HTTPException(status_code=400, detail=f"微信登录失败：{data}")

    user = db.scalar(select(User).where(User.openid == openid))
    if user is None:
        user = User(
            openid=openid,
            token=secrets.token_urlsafe(24),
            nickname=payload.nickname or "面试鸭用户",
            avatar=payload.avatar,
        )
        db.add(user)
        db.flush()
    else:
        # 用户可能改过昵称/头像，登录时同步
        user.nickname = payload.nickname or user.nickname
        user.avatar = payload.avatar or user.avatar
    db.commit()
    db.refresh(user)

    # 游客身份登录成微信账号：把游客的学习数据并过来，再把游客删掉
    if current is not None and current.id != user.id and current.openid is None:
        merge_user_data(db, current, user)

    return _login_out(user)


@router.get("/me", response_model=MeOut, summary="当前登录用户")
def me(user: User = Depends(get_current_user)) -> MeOut:
    return MeOut.model_validate(user)


@router.patch("/me", response_model=MeOut, summary="修改昵称 / 头像")
def update_me(
    payload: ProfileIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> MeOut:
    """微信小程序的头像昵称由用户自己填，填完调这个接口存下来。"""
    if payload.nickname is not None:
        user.nickname = payload.nickname.strip() or user.nickname
    if payload.avatar is not None:
        user.avatar = payload.avatar
    db.commit()
    db.refresh(user)
    return MeOut.model_validate(user)
