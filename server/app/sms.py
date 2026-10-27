"""手机号验证码：发送与校验。

设计要点（面试常问的那几个点都在这里）：

1. **验证码落库**，不放内存 —— 重启不丢，多进程也能共用；
   单个手机号只保留最新一条，重发即覆盖，旧码自动作废。
2. **一次性使用** —— 校验通过立刻删除，同一个码不能登录两次。
3. **发送频控** —— 同一号码 60 秒内只能发一次，避免被当成短信轰炸工具。
4. **错误次数上限** —— 连错 5 次直接作废，防止 6 位数字被暴力撞开。
5. **调试模式** —— 没接短信通道时不真发，把验证码放在响应里。

接真实通道时，只需要把 ``_deliver`` 换成阿里云 / 腾讯云 SMS 的调用，
其余逻辑不用动。
"""

from __future__ import annotations

import logging
import secrets
import time

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import Settings
from .models import SmsCode
from .obs import log_event


def _now_ts() -> int:
    return int(time.time())


def _deliver(phone: str, code: str, settings: Settings) -> None:
    """把短信发出去。

    现在只有 debug 通道：不联网、不花钱，验证码打到控制台。
    换成真实服务时在这里加 provider 分支，例如：
        if settings.sms_provider == "aliyun": ...
    """
    if settings.sms_provider == "debug" or settings.sms_debug:
        log_event("sms_debug_send", phone=phone, code=code)
        return
    raise HTTPException(
        status_code=501,
        detail=f"未接入短信服务商（sms_provider={settings.sms_provider}），请先配置短信通道",
    )


def issue_code(db: Session, phone: str, settings: Settings) -> tuple[str, int]:
    """生成并发送验证码。

    返回 ``(code, retry_after)``；code 仅调试模式会回给前端。
    """
    ts = _now_ts()
    row = db.scalar(select(SmsCode).where(SmsCode.phone == phone))

    if row is not None:
        waited = ts - row.sent_at
        if waited < settings.sms_resend_interval:
            retry = settings.sms_resend_interval - waited
            raise HTTPException(
                status_code=429,
                detail=f"发送太频繁，请 {retry} 秒后再试",
                headers={"Retry-After": str(retry)},
            )

    # 6 位数字，用 secrets 而不是 random：验证码属于安全凭证
    code = f"{secrets.randbelow(1_000_000):06d}"

    if row is None:
        row = SmsCode(phone=phone, code=code, expired_at=0, sent_at=0, attempts=0)
        db.add(row)
    # 覆盖旧码：重发后之前的验证码立刻失效
    row.code = code
    row.expired_at = ts + settings.sms_code_ttl
    row.sent_at = ts
    row.attempts = 0
    db.commit()

    _deliver(phone, code, settings)
    return code, settings.sms_resend_interval


def verify_code(db: Session, phone: str, code: str, settings: Settings) -> None:
    """校验验证码，失败抛 HTTPException，成功则消费掉这条记录。"""
    row = db.scalar(select(SmsCode).where(SmsCode.phone == phone))
    if row is None:
        log_event("sms_verify_failed", level=logging.WARNING, phone=phone, reason="no_code")
        raise HTTPException(status_code=400, detail="请先获取验证码")

    if _now_ts() > row.expired_at:
        db.delete(row)
        db.commit()
        log_event("sms_verify_failed", level=logging.WARNING, phone=phone, reason="expired")
        raise HTTPException(status_code=400, detail="验证码已过期，请重新获取")

    if row.attempts >= settings.sms_max_attempts:
        db.delete(row)
        db.commit()
        log_event("sms_verify_failed", level=logging.WARNING, phone=phone, reason="too_many_attempts")
        raise HTTPException(status_code=400, detail="错误次数过多，请重新获取验证码")

    if not secrets.compare_digest(row.code, code):
        row.attempts += 1
        left = settings.sms_max_attempts - row.attempts
        db.commit()
        log_event("sms_verify_failed", level=logging.WARNING, phone=phone, reason="mismatch", attempts=row.attempts)
        raise HTTPException(status_code=400, detail=f"验证码不正确，还可尝试 {max(left, 0)} 次")

    # 一次性：验过即焚，避免同一个码被重复使用
    db.delete(row)
    db.commit()
