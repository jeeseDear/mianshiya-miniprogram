"""AI 解析：把「标准答案」翻译成「面试现场怎么答」。

几个设计取舍，读代码前先看这段：

1. **不引入 openai SDK**。项目一共 6 个依赖，而 /chat/completions 就是
   一个普通 POST，requests 足够。少一个包就少一处版本冲突。
2. **模型输出带标记的纯文本，不是 JSON**。原因有两个：
   - 流式场景下 JSON 是半截的，前端没法解析；标记格式可以边收边切
   - JSON 要求模型转义引号，中文长文本容易出错，标记格式不会
   输出的东西长这样，前端按行实时切成五块：

       @@CORE@@      一句话核心（一行）
       @@ANSWER@@    面试时的回答顺序（每行一条）
       @@BONUS@@     加分点
       @@TRAP@@      容易踩的坑
       @@FOLLOW@@    可能的追问

3. **生成过程流式转发**。首次生成要 5~20 秒，一次性返回用户会盯着空白
   弹窗；流式输出第二秒就有字，观感完全不同。
4. **结果落库缓存**。见 ``models.AiExplanation``：同一题只调一次模型。
   缓存命中时直接把存好的内容转回标记格式，前端代码只有一条路径。
5. **没配 key 就返回 503 / 错误标记**。宁可明确说「未开启」，也不返回
   编造的内容——一旦用户以为是模型生成的，信任就没了。
"""

from __future__ import annotations

import json
import logging
import re
import threading
from collections.abc import Iterator

import requests
from fastapi import HTTPException
from sqlalchemy.orm import Session

from .config import get_settings
from .db import SessionLocal
from .models import AiExplanation, Question
from .obs import log_event

MARK_CORE = "@@CORE@@"
MARK_ANSWER = "@@ANSWER@@"
MARK_BONUS = "@@BONUS@@"
MARK_TRAP = "@@TRAP@@"
MARK_FOLLOW = "@@FOLLOW@@"

_MARKS: dict[str, str] = {
    MARK_CORE: "core",
    MARK_ANSWER: "answer",
    MARK_BONUS: "bonus",
    MARK_TRAP: "trap",
    MARK_FOLLOW: "followup",
}

# 模型爱在行首加 "- " 或 "1. "，统一剥掉，编号由前端渲染
_LEADING_MARK = re.compile(r"^(?:[-*·]\s*|\d+[.、)]\s*)+")

_SYSTEM = (
    "你是一位有十年经验的前端面试官，正在帮候选人理解一道面试题。"
    "你的回答要具体、可直接照做，不要复述题目，不要写客套话。"
    "只按用户给的标记格式输出，不要用 Markdown，不要加代码块围栏。"
)

# 同一道题并发请求时只让一个去调模型，其余等锁后直接读缓存。
# 不加这个，用户连点两下就会付两次钱。
_LOCKS: dict[str, threading.Lock] = {}
_LOCKS_GUARD = threading.Lock()


def enabled() -> bool:
    return bool(get_settings().llm_api_key)


def _lock_for(question_id: str) -> threading.Lock:
    with _LOCKS_GUARD:
        lock = _LOCKS.get(question_id)
        if lock is None:
            lock = threading.Lock()
            _LOCKS[question_id] = lock
        return lock


# ---------------------------------------------------------------- 提示词


def _build_messages(q: Question) -> list[dict]:
    points = "\n".join(f"- {p}" for p in (q.points or []))
    detail = "\n".join(
        f"- {d.get('h', '')}：{d.get('p', '')}"
        for d in (q.detail or [])
        if isinstance(d, dict)
    )
    extend = "\n".join(f"- {e}" for e in (q.extend or []))

    user = f"""题目：{q.title}
分类：{q.cat}
难度：{q.level}/3（3 最难）
简要答案：{q.short or "（无）"}

标准要点：
{points or "（无）"}

详细答案：
{detail or "（无）"}

扩展知识：
{extend or "（无）"}

请严格按下面的格式输出。标记行必须原样出现，每条内容单独一行，
不要加编号或列表符号，不要输出格式之外的任何文字：

{MARK_CORE}
用一句话点出这道题真正在考什么，40 字以内，只写一行
{MARK_ANSWER}
面试时按顺序这样答的第一条，40~80 字
面试时按顺序这样答的第二条
面试时按顺序这样答的第三条
{MARK_BONUS}
能让面试官眼前一亮的加分点，1~3 条，每条一行
{MARK_TRAP}
候选人最容易说错或答偏的地方，1~3 条，每条一行
{MARK_FOLLOW}
面试官大概率会追问的问题，2~4 条，每条一行"""

    return [
        {"role": "system", "content": _SYSTEM},
        {"role": "user", "content": user},
    ]


# ---------------------------------------------------------------- 解析


def parse_marked(text: str) -> dict:
    """把标记格式的文本切成五块。半截输入也能解析（流式末行就靠这个）。"""
    out: dict = {"core": "", "answer": [], "bonus": [], "trap": [], "followup": []}
    current: str | None = None

    for raw in (text or "").splitlines():
        line = raw.strip()
        if not line:
            continue
        key = _MARKS.get(line)
        if key:
            current = key
            continue
        if current is None:
            continue

        line = _LEADING_MARK.sub("", line).strip()
        if not line:
            continue

        if current == "core":
            # 核心只保留第一行，模型偶尔会多写几句
            if not out["core"]:
                out["core"] = line[:200]
        elif len(out[current]) < 6:
            out[current].append(line)

    return out


def to_marked(content: dict) -> str:
    """把缓存里的结构转回标记格式，让流式接口和首次生成走同一套输出。"""
    lines = [MARK_CORE, content.get("core", ""), MARK_ANSWER]
    lines += list(content.get("answer") or [])
    lines += [MARK_BONUS]
    lines += list(content.get("bonus") or [])
    lines += [MARK_TRAP, *(content.get("trap") or [])]
    lines += [MARK_FOLLOW, *(content.get("followup") or [])]
    return "\n".join(x for x in lines if x is not None) + "\n"


def _as_list(value, limit: int = 6) -> list[str]:
    """兜底：兼容模型偶尔返回对象数组的情况。"""
    if isinstance(value, str):
        value = [value]
    if not isinstance(value, list):
        return []
    out: list[str] = []
    for item in value[:limit]:
        if isinstance(item, str) and item.strip():
            out.append(item.strip())
        elif isinstance(item, dict):
            for key in ("text", "content", "point", "step", "title"):
                if isinstance(item.get(key), str) and item[key].strip():
                    out.append(item[key].strip())
                    break
    return out


# ---------------------------------------------------------------- 调模型


def _post(payload: dict, timeout: int, stream: bool = False) -> requests.Response:
    settings = get_settings()
    return requests.post(
        settings.llm_base_url.rstrip("/") + "/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.llm_api_key}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream" if stream else "application/json",
        },
        json=payload,
        timeout=timeout,
        stream=stream,
    )


def _base_payload(q: Question) -> dict:
    settings = get_settings()
    return {
        "model": settings.llm_model,
        "messages": _build_messages(q),
        "temperature": settings.llm_temperature,
        "max_tokens": settings.llm_max_tokens,
    }


def _explain_failure(resp: requests.Response) -> str:
    """把上游错误翻成一句人话，同时把细节写进日志。"""
    if resp.status_code in (401, 403):
        return "AI 服务鉴权失败，请检查服务端 LLM_API_KEY"
    if resp.status_code == 429:
        return "AI 服务繁忙，请稍后再试"
    return f"AI 服务返回错误（HTTP {resp.status_code}）"


def call_model(q: Question) -> str:
    """非流式调用，一次性拿到完整文本。"""
    settings = get_settings()
    try:
        resp = _post(_base_payload(q), settings.llm_timeout)
    except requests.Timeout as exc:
        log_event("ai_timeout", level=logging.ERROR, model=settings.llm_model, qid=q.id)
        raise HTTPException(status_code=504, detail="AI 生成超时，请稍后重试") from exc
    except requests.RequestException as exc:
        log_event("ai_network_error", level=logging.ERROR, error=str(exc))
        raise HTTPException(status_code=502, detail=f"无法连接 AI 服务：{exc}") from exc

    if resp.status_code >= 400:
        log_event("ai_bad_response", level=logging.ERROR, status=resp.status_code, body=resp.text[:300])
        raise HTTPException(status_code=502, detail=_explain_failure(resp))

    try:
        return resp.json()["choices"][0]["message"]["content"] or ""
    except (ValueError, KeyError, IndexError, TypeError) as exc:
        log_event("ai_bad_payload", level=logging.ERROR, body=resp.text[:300])
        raise HTTPException(status_code=502, detail="AI 服务返回格式异常") from exc


def stream_model(q: Question) -> Iterator[str]:
    """流式调用，逐段 yield 文本增量。"""
    settings = get_settings()
    payload = _base_payload(q)
    payload["stream"] = True

    try:
        resp = _post(payload, settings.llm_timeout, stream=True)
    except requests.Timeout as exc:
        raise RuntimeError("AI 生成超时，请稍后重试") from exc
    except requests.RequestException as exc:
        raise RuntimeError(f"无法连接 AI 服务：{exc}") from exc

    if resp.status_code >= 400:
        text = resp.text[:300]
        resp.close()
        log_event("ai_bad_response", level=logging.ERROR, status=resp.status_code, body=text)
        raise RuntimeError(_explain_failure(resp))

    try:
        for raw in resp.iter_lines(decode_unicode=False):
            if not raw:
                continue
            line = raw.decode("utf-8", "ignore") if isinstance(raw, bytes) else raw
            if not line.startswith("data:"):
                continue
            data = line[5:].strip()
            if data == "[DONE]":
                break
            if not data:
                continue
            try:
                obj = json.loads(data)
            except json.JSONDecodeError:
                continue
            choices = obj.get("choices") or []
            if not choices:
                continue
            piece = (choices[0].get("delta") or {}).get("content")
            if piece:
                yield piece
    finally:
        resp.close()


# ---------------------------------------------------------------- 对外


def _to_out(row: AiExplanation, cached: bool) -> dict:
    content = row.content or {}
    return {
        "question_id": row.question_id,
        "model": row.model,
        "cached": cached,
        "core": content.get("core", ""),
        "answer": _as_list(content.get("answer")),
        "bonus": _as_list(content.get("bonus")),
        "trap": _as_list(content.get("trap")),
        "followup": _as_list(content.get("followup")),
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


def _save(db: Session, q: Question, content: dict) -> AiExplanation:
    settings = get_settings()
    row = db.get(AiExplanation, q.id)
    if row is None:
        row = AiExplanation(question_id=q.id, model=settings.llm_model, content=content)
        db.add(row)
    else:
        row.model = settings.llm_model
        row.content = content
    db.commit()
    db.refresh(row)
    return row


def get_explanation(db: Session, question: Question) -> dict:
    """非流式接口：先读缓存，没有再调模型并写回。"""
    row = db.get(AiExplanation, question.id)
    if row is not None and row.content:
        return _to_out(row, cached=True)

    if not enabled():
        raise HTTPException(
            status_code=503,
            detail="AI 解析未开启：请在服务端 .env 里配置 LLM_API_KEY",
        )

    with _lock_for(question.id):
        row = db.get(AiExplanation, question.id)
        if row is not None and row.content:
            return _to_out(row, cached=True)

        content = parse_marked(call_model(question))
        row = _save(db, question, content)
        log_event("ai_generated", qid=question.id, model=row.model, mode="sync")
        return _to_out(row, cached=False)


def stream_explanation(question_id: str) -> Iterator[str]:
    """流式接口的生成器。

    自己开 session，不复用请求依赖：生成器的存活时间比请求处理函数长，
    依赖注入的会话到那时可能已经关了。

    任何异常都转成 ``@@ERROR@@`` 标记往下发——响应头早就发出去了，
    这时候再抛 HTTPException 前端是收不到的。
    """
    with SessionLocal() as db:
        q = db.get(Question, question_id)
        if q is None:
            yield "@@ERROR@@\n题目不存在\n"
            return

        row = db.get(AiExplanation, question_id)
        if row is not None and row.content:
            # 缓存命中：内容一次性发完，前端瞬间渲染
            log_event("ai_cache_hit", qid=question_id)
            yield to_marked(row.content)
            return

        if not enabled():
            yield "@@ERROR@@\nAI 解析未开启：请在服务端 .env 里配置 LLM_API_KEY\n"
            return

        with _lock_for(question_id):
            row = db.get(AiExplanation, question_id)
            if row is not None and row.content:
                yield to_marked(row.content)
                return

            buf: list[str] = []
            try:
                for piece in stream_model(q):
                    buf.append(piece)
                    yield piece
            except RuntimeError as exc:
                log_event("ai_stream_failed", level=logging.ERROR, qid=question_id, error=str(exc))
                yield f"\n@@ERROR@@\n{exc}\n"
                return
            except Exception as exc:  # 兜底：不让生成器把 500 抛在流中间
                log_event("ai_stream_crash", level=logging.ERROR, qid=question_id, error=str(exc))
                yield "\n@@ERROR@@\nAI 生成中断，请重试\n"
                return

            content = parse_marked("".join(buf))
            if not content["core"] and not content["answer"]:
                log_event("ai_empty_result", level=logging.WARNING, qid=question_id)
                yield "\n@@ERROR@@\nAI 返回内容无法解析，请重试\n"
                return

            _save(db, q, content)
            log_event(
                "ai_generated",
                qid=question_id,
                model=get_settings().llm_model,
                mode="stream",
                answer=len(content["answer"]),
            )
