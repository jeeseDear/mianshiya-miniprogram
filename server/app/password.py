"""密码哈希：只依赖标准库，不引入 passlib / bcrypt。

用 PBKDF2-HMAC-SHA256 + 每条密码独立随机盐：
    - 同样的密码每次哈希结果都不同（盐不同），彩虹表失效
    - 迭代 20 万次，暴力破解单个密码的成本远高于明文或裸 md5
    - 存储格式自带算法与迭代次数，以后想升级参数不用改表结构

校验用 ``secrets.compare_digest``（常数时间比较），避免通过响应时间
侧信道逐字节猜密码。
"""

from __future__ import annotations

import hashlib
import secrets

ALGO = "pbkdf2_sha256"
ITERATIONS = 200_000


def hash_password(password: str) -> str:
    """生成 ``pbkdf2_sha256$迭代次数$盐$摘要`` 格式的字符串。"""
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), bytes.fromhex(salt), ITERATIONS
    )
    return f"{ALGO}${ITERATIONS}${salt}${digest.hex()}"


def verify_password(password: str, stored: str | None) -> bool:
    """校验密码。存储值损坏或格式不认识时一律返回 False，不抛异常。"""
    if not stored:
        return False
    try:
        algo, iterations, salt, expected = stored.split("$")
        if algo != ALGO:
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), bytes.fromhex(salt), int(iterations)
        )
    except (ValueError, TypeError):
        return False
    return secrets.compare_digest(digest.hex(), expected)
