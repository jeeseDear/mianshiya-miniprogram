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
    is_guest: bool = True
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


HomeOut.model_rebuild()
