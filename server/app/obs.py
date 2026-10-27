"""可观测性：结构化日志 + 请求追踪 + 运行指标。

三件事，互相配合：

1. **结构化日志**：一行一个 JSON，``journalctl -u duck-api -o cat | jq`` 直接可读，
   不用再靠 ``print`` 拼字符串。业务日志用 ``logger.info("事件名", extra={"data": {...}})``，
   字段会平铺进这条 JSON。
2. **请求追踪**：每个请求分配一个 trace id（客户端带了 ``X-Request-ID`` 就沿用），
   通过 ContextVar 传给本次请求里所有日志，响应头也会带回。线上出问题时，
   让用户把报错弹窗里的 trace id 发过来，``grep`` 一下就定位到那一次请求。
3. **运行指标**：``/metrics`` 输出 Prometheus 文本格式，手写不引第三方依赖。

刻意没做的事：不接 OpenTelemetry、不接 Prometheus client。单机 SQLite 的规模下，
上面的信息量已经足够定位问题，接大件反而增加维护成本。
"""

from __future__ import annotations

import json
import logging
import re
import sys
import time
import uuid
from collections import Counter
from contextvars import ContextVar
from datetime import datetime
from typing import Any

from .config import get_settings
from .security import parse_user_id

# 每个请求一个 trace id；不在请求里时为空串，日志不带该字段
trace_var: ContextVar[str] = ContextVar("trace_id", default="")

# 进程启动时间，用于 /health 和 /metrics 里的 uptime
STARTED_AT = time.time()

logger = logging.getLogger("duck")

# 兜底：路由没匹配上时（404 扫描、错误 URL），把路径里的数字和长 hash 折叠，
# 避免指标标签无限增长
_ID_LIKE = re.compile(r"/[0-9]+(?=/|$)|/[0-9a-zA-Z_-]{16,}(?=/|$)")


def new_trace_id() -> str:
    return uuid.uuid4().hex[:16]


def get_trace_id() -> str:
    return trace_var.get()


def log_event(event: str, level: int = logging.INFO, **fields: Any) -> None:
    """记一条业务事件。字段会平铺到 JSON 顶层，trace id 自动带上。"""
    logger.log(level, event, extra={"data": fields})


# --------------------------------------------------------------------------
# 日志格式
# --------------------------------------------------------------------------


class JsonFormatter(logging.Formatter):
    """把 LogRecord 渲染成单行 JSON。

    时间用本地时区带偏移（北京时间看的日志，比 UTC 好读），毫秒精度。
    """

    def format(self, record: logging.LogRecord) -> str:
        item: dict[str, Any] = {
            "ts": datetime.fromtimestamp(record.created).astimezone().isoformat(timespec="milliseconds"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }

        tid = trace_var.get()
        if tid:
            item["trace"] = tid

        data = getattr(record, "data", None)
        if isinstance(data, dict):
            item.update(data)

        if record.exc_info:
            item["exc"] = self.formatException(record.exc_info)

        # 兜底：任何不可序列化的值转成字符串，日志永远不能因为格式化而抛异常
        return json.dumps(item, ensure_ascii=False, default=str)


def setup_logging(level: str | None = None) -> None:
    """装配根日志。可重复调用（uvicorn 会先配一遍自己的，启动后再覆盖回来）。"""
    settings = get_settings()
    resolved = (level or settings.log_level).upper()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())

    root = logging.getLogger()
    for old in list(root.handlers):
        root.removeHandler(old)
    root.addHandler(handler)
    root.setLevel(resolved)

    # uvicorn 默认给 access 单独配 handler + propagate=False，会和本模块的
    # 请求日志重复。这里把 uvicorn 的 logger 收编到根日志，统一走 JSON。
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        lg = logging.getLogger(name)
        for old in list(lg.handlers):
            lg.removeHandler(old)
        lg.propagate = True

    # 访问日志由中间件负责（带耗时/trace/uid），uvicorn 那份只留警告以上
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


# --------------------------------------------------------------------------
# 指标
# --------------------------------------------------------------------------


class Metrics:
    """极简指标收集：请求数 + 耗时 + 并发数。

    只保留累加值，不做分位数（那需要直方图桶，等上了 Prometheus 再补）。
    """

    def __init__(self) -> None:
        self.requests: Counter[tuple[str, str, str]] = Counter()
        self.duration_sum: Counter[tuple[str, str, str]] = Counter()
        self.in_flight = 0
        self.started_at = STARTED_AT

    def observe(self, method: str, path: str, status: int, seconds: float) -> None:
        key = (method, path, str(status))
        self.requests[key] += 1
        self.duration_sum[key] += seconds

    def render(self) -> str:
        lines: list[str] = [
            "# HELP duck_http_requests_total 累计请求数，按方法/路由/状态码分组",
            "# TYPE duck_http_requests_total counter",
        ]
        for (method, path, status), count in sorted(self.requests.items()):
            labels = f'method="{method}",path="{_escape(path)}",status="{status}"'
            lines.append(f"duck_http_requests_total{{{labels}}} {count}")

        lines += [
            "# HELP duck_http_request_duration_seconds 请求耗时累计（秒）",
            "# TYPE duck_http_request_duration_seconds summary",
        ]
        for (method, path, status), total in sorted(self.duration_sum.items()):
            labels = f'method="{method}",path="{_escape(path)}",status="{status}"'
            count = self.requests[(method, path, status)]
            lines.append(f'duck_http_request_duration_seconds_sum{{{labels}}} {total:.6f}')
            lines.append(f'duck_http_request_duration_seconds_count{{{labels}}} {count}')

        lines += [
            "# HELP duck_http_requests_in_flight 当前正在处理的请求数",
            "# TYPE duck_http_requests_in_flight gauge",
            f"duck_http_requests_in_flight {self.in_flight}",
            "# HELP duck_uptime_seconds 进程已运行秒数",
            "# TYPE duck_uptime_seconds gauge",
            f"duck_uptime_seconds {time.time() - self.started_at:.0f}",
        ]
        return "\n".join(lines) + "\n"


def _escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ")


metrics = Metrics()


# --------------------------------------------------------------------------
# 中间件
# --------------------------------------------------------------------------

# 探活/指标接口被监控每分钟打很多次，正常时只记 DEBUG，避免淹没业务日志
_QUIET_PATHS = {"/health", "/health/live", "/metrics"}


def _headers(scope: dict) -> dict[str, str]:
    return {k.decode("latin-1").lower(): v.decode("latin-1") for k, v in scope.get("headers", [])}


def _client_ip(scope: dict, headers: dict[str, str]) -> str:
    forwarded = headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return headers.get("x-real-ip") or (scope.get("client") or ("-", 0))[0]


def _route_label(scope: dict) -> tuple[str, bool]:
    """返回 (标签, 是否命中路由)。

    优先用路由模板（``/api/questions/{qid}``），保证指标标签不随 id 膨胀；
    没命中路由时返回折叠过 id 的路径，并标记 False —— 指标里归到
    ``__unmatched__``，避免扫描器用随机路径把标签撑爆。
    """
    route = scope.get("route")
    path = getattr(route, "path", None)
    if path:
        return path, True
    raw = scope.get("path", "") or "/"
    return _ID_LIKE.sub("/{id}", raw)[:120], False


class ObservabilityMiddleware:
    """纯 ASGI 实现，比 BaseHTTPMiddleware 少一层任务开销。

    职责：生成 trace id → 打响应头 → 记一条访问日志 → 更新指标。
    """

    def __init__(self, app) -> None:
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        settings = get_settings()
        headers = _headers(scope)
        # 客户端/网关已经生成过 trace id 就沿用，方便 nginx 到应用的串联
        tid = (headers.get("x-request-id") or "").strip()[:64] or new_trace_id()
        token = trace_var.set(tid)

        method = scope.get("method", "-")
        raw_path = scope.get("path", "/") or "/"
        ip = _client_ip(scope, headers)
        uid = _token_user_id(headers)
        started = time.perf_counter()
        status = 500
        route, matched = raw_path, False

        async def send_wrapper(message):
            nonlocal status, route, matched
            if message["type"] == "http.response.start":
                status = message["status"]
                # 路由匹配在 app 内部完成，此时已经能拿到模板路径
                route, matched = _route_label(scope)
                elapsed_ms = (time.perf_counter() - started) * 1000
                raw = list(message.get("headers") or [])
                raw.append((b"x-request-id", tid.encode()))
                raw.append((b"x-response-time", f"{elapsed_ms:.1f}ms".encode()))
                message["headers"] = raw
            await send(message)

        metrics.in_flight += 1
        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            elapsed = time.perf_counter() - started
            metrics.in_flight -= 1
            log_path = route if matched else raw_path
            metrics.observe(method, route if matched else "__unmatched__", status, elapsed)

            data = {
                "method": method,
                "path": log_path[:200],
                "status": status,
                "ms": round(elapsed * 1000, 1),
                "ip": ip,
                "uid": uid,
            }
            ua = headers.get("user-agent")
            if ua:
                data["ua"] = ua[:80]

            if status >= 500:
                logger.error("http", extra={"data": data})
            elif log_path in _QUIET_PATHS and status < 400 and elapsed * 1000 < settings.slow_request_ms:
                logger.debug("http", extra={"data": data})
            elif elapsed * 1000 >= settings.slow_request_ms:
                data["slow"] = True
                logger.warning("http", extra={"data": data})
            else:
                logger.info("http", extra={"data": data})

            trace_var.reset(token)


def _token_user_id(headers: dict[str, str]) -> int | None:
    """从 Authorization 里取用户 id，只做 JWT 验签，不查库。"""
    auth_header = headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        return None
    try:
        return parse_user_id(auth_header[7:].strip())
    except Exception:  # 日志不能因为解析失败而中断请求
        return None
