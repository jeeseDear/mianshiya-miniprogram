"""面试鸭后端入口。

启动：
    python run.py                 # 开发
    uvicorn app.main:app --reload # 等价写法

文档：http://127.0.0.1:8100/docs
运维：/health（含数据库探测）、/health/live（仅进程存活）、/metrics（Prometheus 文本）
"""

from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from sqlalchemy import func, select, text

from .config import get_settings
from .db import SessionLocal, init_db
from .models import Question
from .obs import (
    ObservabilityMiddleware,
    get_trace_id,
    log_event,
    logger,
    metrics,
    setup_logging,
)
from .routers import auth, catalog, practice
from .seed import seed_if_empty

settings = get_settings()

# 越早装配越好：import 阶段就生效，连 uvicorn 自己的启动日志也能变成 JSON
setup_logging()


def _db_label() -> str:
    """给日志看的库标识，不带密码。"""
    url = settings.database_url
    if url.startswith("sqlite"):
        return "sqlite:" + url.rsplit("/", 1)[-1]
    return url.split("://", 1)[0]


def _probe_db() -> tuple[bool, float, int, str | None]:
    """探一次数据库：连通性 + 题目数。返回 (ok, 耗时ms, 题目数, 错误信息)。"""
    started = time.perf_counter()
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
            total = db.scalar(select(func.count()).select_from(Question)) or 0
    except Exception as exc:  # 探测失败不能让 /health 本身 500
        return False, (time.perf_counter() - started) * 1000, 0, f"{type(exc).__name__}: {exc}"
    return True, (time.perf_counter() - started) * 1000, int(total), None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # uvicorn 会在 import 前后按自己的配置初始化日志，这里再收编一次
    setup_logging()

    # 启动时建表 + 首次导入题库（幂等，第二次启动直接跳过）
    init_db()
    with SessionLocal() as db:
        result = seed_if_empty(db)

    ok, latency_ms, total, error = _probe_db()
    log_event(
        "startup",
        version=settings.app_version,
        db=_db_label(),
        db_ok=ok,
        db_ms=round(latency_ms, 1),
        questions=total,
        seed=result,
        **({"db_error": error} if error else {}),
    )
    yield
    log_event("shutdown", uptime_s=round(time.time() - metrics.started_at))


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="前端面试鸭小程序的后端：题库、搜索、收藏、错题、学习统计",
        version=settings.app_version,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins,
        allow_credentials="*" not in settings.origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    # 注意顺序：后加的在更外层，这样访问日志能覆盖 CORS 预检与错误响应
    app.add_middleware(ObservabilityMiddleware)

    app.include_router(auth.router)
    app.include_router(catalog.router)
    app.include_router(practice.router)

    # ---------------- 异常：统一记日志并回传 trace id ----------------

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        log_event(
            "value_error",
            level=logging.WARNING,
            path=request.url.path,
            method=request.method,
            error=str(exc),
        )
        return JSONResponse(status_code=400, content={"detail": str(exc), "trace_id": get_trace_id()})

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        errors = exc.errors()[:5]
        log_event(
            "bad_request",
            level=logging.WARNING,
            path=request.url.path,
            method=request.method,
            errors=errors,
        )
        return JSONResponse(
            status_code=422,
            content={"detail": jsonable_encoder(errors), "trace_id": get_trace_id()},
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception):
        # 带上完整堆栈，trace id 会平铺在同一行 JSON 里
        log_event(
            "unhandled",
            level=logging.ERROR,
            path=request.url.path,
            method=request.method,
        )
        logger.error("unhandled_exception", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={"detail": "服务器内部错误，请稍后重试", "trace_id": get_trace_id()},
        )

    # ---------------- 运维接口 ----------------

    @app.get("/health", tags=["运维"], summary="健康检查（含数据库探测）")
    def health() -> JSONResponse:
        """给监控和人工排查用。

        数据库不通时返回 503 + ``status=degraded``，这样告警能直接识别，
        而不是像以前那样只要进程活着就报 ok。
        """
        ok, latency_ms, total, error = _probe_db()
        body = {
            "status": "ok" if ok else "degraded",
            "app": settings.app_name,
            "version": settings.app_version,
            "uptime_seconds": round(time.time() - metrics.started_at),
            "db": {
                "ok": ok,
                "kind": _db_label(),
                "latency_ms": round(latency_ms, 2),
                **({"error": error} if error else {}),
            },
            "questions": total,
        }
        if not ok:
            log_event("health_degraded", level=logging.ERROR, db_error=error)
        return JSONResponse(status_code=200 if ok else 503, content=body)

    @app.get("/health/live", tags=["运维"], summary="存活检查（不查数据库）")
    def health_live() -> dict:
        return {"status": "ok", "uptime_seconds": round(time.time() - metrics.started_at)}

    @app.get("/metrics", tags=["运维"], summary="Prometheus 指标", include_in_schema=False)
    def prometheus_metrics() -> PlainTextResponse:
        return PlainTextResponse(
            metrics.render(),
            media_type="text/plain; version=0.0.4; charset=utf-8",
        )

    @app.get("/", include_in_schema=False)
    def root() -> dict:
        return {
            "service": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "health": "/health",
        }

    return app


app = create_app()
