"""接口的请求 / 响应模型。

Pydantic 负责三件事：字段校验、类型转换、自动生成 OpenAPI 文档。
前端可以直接用 /openapi.json 生成 TS 类型。
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class CategoryOut(BaseModel):
    id: str
    name: str
    short: str = ""
    icon: str = ""
    bg: str = ""
    desc: str = ""
    total: int = 0
    done: int = 0

    model_config = {"from_attributes": True}


class QuestionBrief(BaseModel):
    id: str
    cat: str
    level: int
    hot: int = 0
    title: str
    short: str = ""
    source: str = ""
    # 列表页要显示「N 条重点」，但详情（points/detail/extend）不进镜像，
    # 这里只给数量，避免前端拿不到字段直接崩（曾导致知识点列表白屏）
    point_count: int = 0

    model_config = {"from_attributes": True}


class NavItem(BaseModel):
    id: str
    title: str


class QuestionDetail(QuestionBrief):
    points: list[str] = []
    detail: list[dict] = []
    extend: list[str] = []
    # 阅读态（登录后才有意义）
    is_favorite: bool = False
    is_done: bool = False
    is_right: bool = False
    prev: NavItem | None = None
    next: NavItem | None = None


class QuestionPage(BaseModel):
    items: list[QuestionBrief]
    total: int
    page: int
    size: int
    has_more: bool


class KnowledgeBrief(BaseModel):
    id: str
    cat: str
    title: str
    summary: str = ""
    # 同 QuestionBrief，只给要点数量，不给正文
    point_count: int = 0

    model_config = {"from_attributes": True}


class KnowledgeDetail(KnowledgeBrief):
    points: list[str] = []
    code: str = ""
    tips: list[str] = []


class HomeOut(BaseModel):
    """首页一次拿全，避免小程序发 4 个请求。"""

    daily: QuestionBrief | None = None
    hot: list[QuestionBrief] = []
    categories: list[CategoryOut] = []
    stats: "StatsOut | None" = None


class RecordIn(BaseModel):
    question_id: str
    correct: bool = True


class RecordOut(BaseModel):
    question_id: str
    correct: bool
    first_time: bool = Field(description="是否首次作答（影响今日进度）")
    today: int = 0
    streak: int = 0


class RecordItem(BaseModel):
    question_id: str
    correct: bool

    model_config = {"from_attributes": True}


class StatsOut(BaseModel):
    done: int = 0
    right: int = 0
    wrong: int = 0
    favorite: int = 0
    rate: int = 0
    progress: int = 0
    streak: int = 0
    today: int = 0
    total: int = 0


class GuestLoginOut(BaseModel):
    token: str
    user_id: int
    nickname: str
    avatar: str = ""
    is_guest: bool = True
    phone: str = ""
    account: str = ""


class PasswordLoginIn(BaseModel):
    """账号密码登录。账号不存在时按这个密码直接注册。

    账号只允许字母 / 数字 / 下划线，避免出现空格、表情等难以输入的字符；
    统一转小写后再入库，防止 Alice 与 alice 变成两个账号。
    """

    account: str = Field(
        min_length=3,
        max_length=20,
        pattern=r"^[A-Za-z0-9_]+$",
        description="3-20 位字母、数字或下划线（可以用手机号）",
    )
    password: str = Field(min_length=6, max_length=32, description="6-32 位密码")
    nickname: str = ""


class PhoneCodeIn(BaseModel):
    """发送验证码。手机号在前端已限制输入，这里再做一次服务端校验。"""

    phone: str = Field(pattern=r"^1[3-9]\d{9}$", description="11 位中国大陆手机号")


class PhoneCodeOut(BaseModel):
    ok: bool = True
    # 调试模式下把验证码直接返回，方便没有短信通道时联调
    debug_code: str | None = Field(default=None, description="仅 sms_debug=true 时返回")
    retry_after: int = Field(default=60, description="多少秒后可以重发")


class PhoneLoginIn(BaseModel):
    phone: str = Field(pattern=r"^1[3-9]\d{9}$")
    code: str = Field(min_length=4, max_length=8, description="短信验证码")
    nickname: str = ""


class WechatLoginIn(BaseModel):
    code: str = Field(min_length=1, description="wx.login 拿到的临时 code")
    nickname: str = "面试鸭用户"
    avatar: str = ""


class ProfileIn(BaseModel):
    """用户自己改昵称 / 头像（微信小程序的「头像昵称填写能力」）。"""

    nickname: str | None = Field(default=None, min_length=1, max_length=32)
    avatar: str | None = Field(default=None, max_length=512)


class MeOut(BaseModel):
    id: int
    nickname: str
    avatar: str = ""
    phone: str = ""
    account: str = ""
    is_guest: bool = True
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


HomeOut.model_rebuild()
