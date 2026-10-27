"""登录：游客 + 账号密码 + 手机验证码 + 微信小程序。

几种入口共用 users 表，判定账号类型只看一个条件：
``openid``、``phone``、``account`` 全为空即游客。

任一正式登录发生时，如果请求头里还带着游客 token，会把游客名下的
收藏 / 错题 / 记录 / 打卡并到正式账号上——否则用户刷了几十题再登录，
进度会凭空消失。
"""

from __future__ import annotations

import secrets

import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import captcha
from ..config import get_settings
from ..db import get_db
from ..deps import get_current_user, get_optional_user
from ..models import User
from ..password import hash_password, verify_password
from ..schemas import (
    CaptchaOut,
    GuestLoginOut,
    MeOut,
    PasswordLoginIn,
    PhoneCodeIn,
    PhoneCodeOut,
    PhoneLoginIn,
    ProfileIn,
    RegisterIn,
    WechatLoginIn,
)
from ..security import create_access_token
from ..services import merge_user_data
from ..sms import issue_code, verify_code

router = APIRouter(prefix="/api/auth", tags=["登录"])

WX_CODE2SESSION = "https://api.weixin.qq.com/sns/jscode2session"


def _is_guest(user: User) -> bool:
    return user.openid is None and user.phone is None and user.account is None


def _mask_phone(phone: str | None) -> str:
    """返回给前端只给打码后的号码，完整号码留在服务端。"""
    if not phone or len(phone) < 7:
        return phone or ""
    return f"{phone[:3]}****{phone[-4:]}"


def _login_out(user: User) -> GuestLoginOut:
    """统一的登录返回：token 是 JWT，``expires_in`` 给前端做提前提示。

    ``users.token`` 仍然保留（老版本存在这里的固定串），但新签发的
    凭证不再写库，改为自包含的 JWT，服务端无需查表即可校验。
    """
    settings = get_settings()
    return GuestLoginOut(
        token=create_access_token(user.id),
        user_id=user.id,
        nickname=user.nickname,
        avatar=user.avatar,
        is_guest=_is_guest(user),
        phone=_mask_phone(user.phone),
        account=user.account or "",
        expires_in=settings.jwt_expire_days * 86400,
    )


def _check_captcha(payload) -> None:
    if not captcha.verify(payload.captcha_id, payload.captcha_code):
        raise HTTPException(status_code=400, detail="验证码不正确或已过期，请刷新后重试")


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


@router.get("/captcha", response_model=CaptchaOut, summary="获取图形验证码")
def get_captcha() -> CaptchaOut:
    """返回一张 4 位图形验证码（PNG base64），登录时回传 captcha_id + captcha_code。

    答案只存在服务端内存里，接口不返回字符本身；校验一次即作废。
    """
    captcha_id, image = captcha.issue()
    return CaptchaOut(captcha_id=captcha_id, image=image, ttl=captcha.TTL)


@router.post(
    "/register",
    response_model=GuestLoginOut,
    status_code=201,
    summary="注册账号",
)
def register(
    payload: RegisterIn,
    db: Session = Depends(get_db),
    current: User | None = Depends(get_optional_user),
) -> GuestLoginOut:
    """用账号密码注册新号，成功后直接返回 JWT，前端不需要再调一次登录。

    - 账号已存在 → 409，提示去登录（**不会**覆盖原密码）
    - 账号统一转小写入库，避免 Alice 和 alice 变成两个账号
    - 密码 PBKDF2-HMAC-SHA256 加盐，明文不落库
    - 当前若带着游客 token，会把游客的收藏 / 错题 / 记录 / 打卡并过来
    """
    _check_captcha(payload)

    account = payload.account.strip().lower()
    if db.scalar(select(User).where(User.account == account)) is not None:
        raise HTTPException(status_code=409, detail="该账号已被注册，请直接登录")

    user = User(
        account=account,
        # 这一列是历史遗留的固定 token，为了满足 NOT NULL + 唯一约束占位
        token=secrets.token_urlsafe(24),
        # 没填昵称就用账号名，比「面试鸭用户」更好认
        nickname=payload.nickname.strip() or account,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        # 并发注册同一个账号时唯一索引会先挡住，转成同样的 409
        db.rollback()
        raise HTTPException(status_code=409, detail="该账号已被注册，请直接登录") from None
    db.refresh(user)

    if current is not None and current.id != user.id and _is_guest(current):
        merge_user_data(db, current, user)

    return _login_out(user)


@router.post("/login", response_model=GuestLoginOut, summary="账号密码登录")
def password_login(
    payload: PasswordLoginIn,
    db: Session = Depends(get_db),
    current: User | None = Depends(get_optional_user),
) -> GuestLoginOut:
    """校验账号密码并签发 JWT。

    账号不存在和密码错误返回同一句「账号或密码不正确」，避免被拿来
    枚举哪些账号存在。调用前必须先通过图形验证码，且验证码一次性，
    脚本既绕不过人眼识别，也没法拿一张图反复撞密码。

    登录成功后若请求头还带着游客 token，会把游客期间的数据并过来。
    """
    _check_captcha(payload)

    account = payload.account.strip().lower()
    user = db.scalar(select(User).where(User.account == account))

    if (
        user is None
        or not user.password_hash
        or not verify_password(payload.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=401,
            detail="账号或密码不正确",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if current is not None and current.id != user.id and _is_guest(current):
        merge_user_data(db, current, user)

    return _login_out(user)


@router.post("/phone/code", response_model=PhoneCodeOut, summary="发送手机验证码")
def send_phone_code(
    payload: PhoneCodeIn,
    db: Session = Depends(get_db),
) -> PhoneCodeOut:
    """给手机号发一条验证码。

    - 同一号码 60 秒内只能发一次（429）
    - 调试模式（默认）不真发短信，``debug_code`` 直接返回验证码，前端会
      自动填上，方便没接短信通道时跑通流程
    """
    settings = get_settings()
    code, retry_after = issue_code(db, payload.phone, settings)
    return PhoneCodeOut(
        ok=True,
        debug_code=code if settings.sms_debug else None,
        retry_after=retry_after,
    )


@router.post("/phone", response_model=GuestLoginOut, summary="手机号验证码登录")
def phone_login(
    payload: PhoneLoginIn,
    db: Session = Depends(get_db),
    current: User | None = Depends(get_optional_user),
) -> GuestLoginOut:
    """验证码正确即登录；号码没注册过就自动注册。

    登录成功后服务端把手机号绑到账号上，换设备再用同一号码登录，
    收藏和进度都还在。
    """
    settings = get_settings()
    verify_code(db, payload.phone, payload.code, settings)

    user = db.scalar(select(User).where(User.phone == payload.phone))
    if user is None:
        user = User(
            phone=payload.phone,
            token=secrets.token_urlsafe(24),
            # 没填昵称时默认用打码手机号，比「面试鸭用户」更好认
            nickname=payload.nickname.strip() or f"鸭友{payload.phone[-4:]}",
        )
        db.add(user)
        db.flush()
    elif payload.nickname.strip():
        user.nickname = payload.nickname.strip()

    db.commit()
    db.refresh(user)

    # 游客转正式账号：把游客期间刷的题并过来
    if current is not None and current.id != user.id and _is_guest(current):
        merge_user_data(db, current, user)

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
    if current is not None and current.id != user.id and _is_guest(current):
        merge_user_data(db, current, user)

    return _login_out(user)


def _me_out(user: User) -> MeOut:
    return MeOut(
        id=user.id,
        nickname=user.nickname,
        avatar=user.avatar,
        phone=_mask_phone(user.phone),
        account=user.account or "",
        is_guest=_is_guest(user),
        created_at=user.created_at,
    )


@router.get("/me", response_model=MeOut, summary="当前登录用户")
def me(user: User = Depends(get_current_user)) -> MeOut:
    return _me_out(user)


@router.patch("/me", response_model=MeOut, summary="修改昵称 / 头像")
def update_me(
    payload: ProfileIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> MeOut:
    """小程序的头像昵称由用户自己填，填完调这个接口存下来。"""
    if payload.nickname is not None:
        user.nickname = payload.nickname.strip() or user.nickname
    if payload.avatar is not None:
        user.avatar = payload.avatar
    db.commit()
    db.refresh(user)
    return _me_out(user)
