"""把前端题库导入数据库（幂等：已有数据则跳过）。"""

from __future__ import annotations

import json

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .config import get_settings
from .models import Category, Knowledge, Question


def _load(name: str) -> list[dict]:
    path = get_settings().seed_dir / name
    if not path.exists():
        raise FileNotFoundError(f"缺少种子文件 {path}，请先运行 scripts/export-seed.mjs")
    return json.loads(path.read_text(encoding="utf-8"))


def seed_if_empty(db: Session, force: bool = False) -> dict:
    existing = db.scalar(select(func.count()).select_from(Question)) or 0
    if existing and not force:
        return {"seeded": False, "questions": existing}

    categories = _load("categories.json")
    questions = _load("questions.json")
    knowledge = _load("knowledge.json")

    if force:
        db.query(Question).delete()
        db.query(Knowledge).delete()
        db.query(Category).delete()
        db.commit()

    for i, c in enumerate(categories):
        db.add(
            Category(
                id=c["id"],
                name=c["name"],
                short=c.get("short", ""),
                icon=c.get("icon", ""),
                bg=c.get("bg", ""),
                desc=c.get("desc", ""),
                sort=i,
            )
        )
    db.flush()

    for q in questions:
        db.add(
            Question(
                id=q["id"],
                cat=q["cat"],
                level=int(q.get("level", 1)),
                hot=int(q.get("hot", 0)),
                source=q.get("source", ""),
                title=q["title"],
                short=q.get("short", ""),
                points=q.get("points", []),
                detail=q.get("detail", []),
                extend=q.get("extend", []),
            )
        )

    for k in knowledge:
        db.add(
            Knowledge(
                id=k["id"],
                cat=k["cat"],
                title=k["title"],
                summary=k.get("summary", ""),
                points=k.get("points", []),
                code=k.get("code", ""),
                tips=k.get("tips", []),
            )
        )

    db.commit()
    return {
        "seeded": True,
        "categories": len(categories),
        "questions": len(questions),
        "knowledge": len(knowledge),
    }
