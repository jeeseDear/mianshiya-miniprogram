"""图形验证码。

不依赖 Pillow：点阵字体 + 手写 PNG 编码（zlib + CRC32），
所以在 `pip install -r requirements.txt` 的依赖清单里不用加任何东西。

设计要点：
- **答案只存在服务端**。接口只把图片（base64 PNG）和 captcha_id 给前端，
  返回体里没有字符本身，脚本没法直接读出来绕过。
- **一次性**：校验通过或失败都会把这条记录删掉，想再试必须重新拿图，
  避免拿同一张图暴力撞码。
- 字符集去掉了 0/O、1/I/L 这类容易看错的，肉眼识别成本更低。
- H5 和小程序都能直接渲染 `data:image/png;base64,...`（小程序 image 组件
  支持 base64，但不支持 svg，所以这里必须是 PNG）。
"""

from __future__ import annotations

import base64
import math
import random
import secrets
import struct
import threading
import time
import zlib

# 4 位，去掉易混淆的 0 O 1 I L
CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

LENGTH = 4
TTL = 180  # 秒，够慢吞吞输入，又不至于放着不刷新

# captcha_id -> (code, expire_at)
_STORE: dict[str, tuple[str, float]] = {}
_LOCK = threading.Lock()


# ---------------------------------------------------------------- 点阵字体
# 每个字符 7 行 × 5 列，'1' 表示点亮
FONT: dict[str, tuple[str, ...]] = {
    "A": ("01110", "10001", "10001", "11111", "10001", "10001", "10001"),
    "B": ("11110", "10001", "10001", "11110", "10001", "10001", "11110"),
    "C": ("01110", "10001", "10000", "10000", "10000", "10001", "01110"),
    "D": ("11110", "10001", "10001", "10001", "10001", "10001", "11110"),
    "E": ("11111", "10000", "10000", "11110", "10000", "10000", "11111"),
    "F": ("11111", "10000", "10000", "11110", "10000", "10000", "10000"),
    "G": ("01110", "10001", "10000", "10111", "10001", "10001", "01110"),
    "H": ("10001", "10001", "10001", "11111", "10001", "10001", "10001"),
    "J": ("00111", "00010", "00010", "00010", "00010", "10010", "01100"),
    "K": ("10001", "10010", "10100", "11000", "10100", "10010", "10001"),
    "M": ("10001", "11011", "10101", "10101", "10001", "10001", "10001"),
    "N": ("10001", "11001", "10101", "10011", "10001", "10001", "10001"),
    "P": ("11110", "10001", "10001", "11110", "10000", "10000", "10000"),
    "Q": ("01110", "10001", "10001", "10001", "10101", "10010", "01101"),
    "R": ("11110", "10001", "10001", "11110", "10100", "10010", "10001"),
    "S": ("01111", "10000", "10000", "01110", "00001", "00001", "11110"),
    "T": ("11111", "00100", "00100", "00100", "00100", "00100", "00100"),
    "U": ("10001", "10001", "10001", "10001", "10001", "10001", "01110"),
    "V": ("10001", "10001", "10001", "10001", "10001", "01010", "00100"),
    "W": ("10001", "10001", "10001", "10101", "10101", "11011", "10001"),
    "X": ("10001", "10001", "01010", "00100", "01010", "10001", "10001"),
    "Y": ("10001", "10001", "01010", "00100", "00100", "00100", "00100"),
    "Z": ("11111", "00001", "00010", "00100", "01000", "10000", "11111"),
    "2": ("01110", "10001", "00001", "00010", "00100", "01000", "11111"),
    "3": ("11111", "00010", "00100", "00010", "00001", "10001", "01110"),
    "4": ("00010", "00110", "01010", "10010", "11111", "00010", "00010"),
    "5": ("11111", "10000", "11110", "00001", "00001", "10001", "01110"),
    "6": ("00110", "01000", "10000", "11110", "10001", "10001", "01110"),
    "7": ("11111", "00001", "00010", "00100", "01000", "01000", "01000"),
    "8": ("01110", "10001", "10001", "01110", "10001", "10001", "01110"),
    "9": ("01110", "10001", "10001", "01111", "00001", "00010", "01100"),
}

GLYPH_W, GLYPH_H = 5, 7
SCALE = 4  # 每个点放大成 4×4 像素
GAP = 6
PAD_X, PAD_Y = 6, 6
IMG_W = PAD_X * 2 + LENGTH * GLYPH_W * SCALE + (LENGTH - 1) * GAP
IMG_H = PAD_Y * 2 + GLYPH_H * SCALE

# 都挑带一点冷调的深色，跟登录页的绿白调性搭，不会突然跳出一块暗红
DARK_COLORS = (
    (31, 41, 55),
    (12, 96, 78),
    (16, 82, 110),
    (66, 42, 110),
    (45, 62, 92),
)


# ---------------------------------------------------------------- PNG 编码
def _chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def _encode_png(width: int, height: int, rows: list[list[int]]) -> bytes:
    """rows 每行是 width*4 个 0-255 的 RGBA 值。"""
    raw = b"".join(b"\x00" + bytes(row) for row in rows)
    return (
        b"\x89PNG\r\n\x1a\n"
        # color type 6 = RGBA，配合全透明底图，放进任何底色的输入框都不突兀
        + _chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
        + _chunk(b"IDAT", zlib.compress(raw, 9))
        + _chunk(b"IEND", b"")
    )


# ---------------------------------------------------------------- 画图
def _canvas() -> list[list[int]]:
    """全透明画布。底色交给页面，图片本身不带白/灰底。"""
    return [[0] * (IMG_W * 4) for _ in range(IMG_H)]


def _put(canvas: list[list[int]], x: int, y: int, color: tuple[int, ...]) -> None:
    if 0 <= x < IMG_W and 0 <= y < IMG_H:
        i = x * 4
        canvas[y][i] = color[0]
        canvas[y][i + 1] = color[1]
        canvas[y][i + 2] = color[2]
        canvas[y][i + 3] = color[3] if len(color) > 3 else 255


def _draw_noise(canvas: list[list[int]], rnd: random.Random) -> None:
    """半透明噪点：不影响辨认，但让简单的二值化脚本不好切"""
    for _ in range(60):
        x = rnd.randrange(IMG_W)
        y = rnd.randrange(IMG_H)
        g = rnd.randint(120, 170)
        _put(canvas, x, y, (g, g, g, rnd.randint(40, 80)))


def _draw_wave(canvas: list[list[int]], rnd: random.Random) -> None:
    """一条横穿的正弦干扰线（半透明，压在字下面不挡笔画）"""
    amp = rnd.uniform(2.0, 5.0)
    freq = rnd.uniform(0.06, 0.14)
    phase = rnd.uniform(0, math.pi * 2)
    base = rnd.randint(IMG_H // 3, IMG_H * 2 // 3)
    color = rnd.choice(((13, 120, 90), (20, 100, 140), (150, 160, 155)))
    for x in range(IMG_W):
        y = int(base + amp * math.sin(freq * x + phase))
        _put(canvas, x, y, color + (rnd.randint(55, 90),))


def _draw_char(
    canvas: list[list[int]], ch: str, x0: int, y0: int, color: tuple[int, int, int]
) -> None:
    glyph = FONT.get(ch)
    if not glyph:
        return
    shear = random.uniform(-0.45, 0.45)  # 逐行横向偏移，做出轻微倾斜
    for r, line in enumerate(glyph):
        shift = int(round((r - GLYPH_H / 2) * shear))
        for c, bit in enumerate(line):
            if bit != "1":
                continue
            px = x0 + c * SCALE + shift
            py = y0 + r * SCALE
            for dy in range(SCALE):
                for dx in range(SCALE):
                    _put(canvas, px + dx, py + dy, color)


def _render(code: str) -> bytes:
    rnd = random.Random()
    canvas = _canvas()
    _draw_noise(canvas, rnd)
    _draw_wave(canvas, rnd)
    _draw_wave(canvas, rnd)

    # 四个字用同一个颜色：比每字一色干净，也更符合登录页的整体调性
    color = rnd.choice(DARK_COLORS)

    step = GLYPH_W * SCALE + GAP
    for i, ch in enumerate(code):
        x0 = PAD_X + i * step
        # 上下随机浮动几个像素，避免四个字像印刷体一样排得笔直
        y0 = PAD_Y + rnd.randint(-3, 3)
        _draw_char(canvas, ch, x0, y0, color)

    return _encode_png(IMG_W, IMG_H, canvas)


# ---------------------------------------------------------------- 对外接口
def _purge(now: float) -> None:
    for cid, (_, expire_at) in list(_STORE.items()):
        if expire_at < now:
            _STORE.pop(cid, None)


def issue() -> tuple[str, str]:
    """生成一张新验证码，返回 (captcha_id, data-url)。

    答案留在服务端，只把图片和 id 交给前端。
    """
    code = "".join(secrets.choice(CHARSET) for _ in range(LENGTH))
    cid = secrets.token_urlsafe(16)
    png = _render(code)
    data_url = "data:image/png;base64," + base64.b64encode(png).decode("ascii")

    now = time.time()
    with _LOCK:
        _purge(now)
        _STORE[cid] = (code, now + TTL)
    return cid, data_url


def verify(captcha_id: str, code: str) -> bool:
    """校验并**立即作废**这张图，无论对错。

    一次性是刻意的：保证同一张图不能被反复拿来试密码，也顺便防重放。
    所以前端登录失败后必须换一张新图（login.vue 里做在 catch 里）。
    """
    cid = (captcha_id or "").strip()
    guess = (code or "").strip().upper()
    if not cid or not guess:
        return False

    with _LOCK:
        item = _STORE.pop(cid, None)

    if item is None:
        return False
    answer, expire_at = item
    if expire_at < time.time():
        return False
    return secrets.compare_digest(answer, guess)
