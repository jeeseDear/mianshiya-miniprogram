"""面试鸭后端入口。

启动：
    python run.py                 # 开发
    uvicorn app.main:app --reload # 等价写法

文档：http://127.0.0.1:8100/docs
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .db import SessionLocal, init_db
from .routers import auth, catalog, practice
from .seed import seed_if_empty

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时建表 + 首次导入题库（幂等，第二次启动直接跳过）
    init_db()
    with SessionLocal() as db:
        result = seed_if_empty(db)
    print(f"[seed] {result}")
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="前端面试鸭小程序的后端：题库、搜索、收藏、错题、学习统计",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins,
        allow_credentials="*" not in settings.origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(catalog.router)
    app.include_router(practice.router)

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.get("/health", tags=["运维"], summary="健康检查")
    def health() -> dict:
        from sqlalchemy import func, select

        from .models import Question

        with SessionLocal() as db:
            total = db.scalar(select(func.count()).select_from(Question)) or 0
        return {"status": "ok", "app": settings.app_name, "questions": total}

    @app.get("/", include_in_schema=False)
    def root() -> dict:
        return {"service": settings.app_name, "docs": "/docs", "health": "/health"}

    return app


app = create_app()
