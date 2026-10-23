"""后端冒烟测试：跑通「登录 → 列表 → 详情 → 作答 → 统计」主链路。

运行：.venv\\Scripts\\python.exe -m pytest -q
"""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

import pytest

# 必须在导入 app 之前设置，保证测试用独立数据库
_tmp = Path(tempfile.mkdtemp(prefix="duck-test-"))
os.environ["DATABASE_URL"] = f"sqlite:///{(_tmp / 'test.db').as_posix()}"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def auth(client):
    token = client.post("/api/auth/guest").json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_health_and_seed(client):
    data = client.get("/health").json()
    assert data["status"] == "ok"
    assert data["questions"] > 500  # 题库已导入


def test_categories(client):
    items = client.get("/api/categories").json()
    assert len(items) == 11
    assert sum(x["total"] for x in items) == 553


def test_question_list_and_detail(client, auth):
    page = client.get("/api/questions", params={"cat": "js", "size": 3}).json()
    assert page["total"] == 50
    assert len(page["items"]) == 3
    assert page["has_more"] is True

    qid = page["items"][0]["id"]
    detail = client.get(f"/api/questions/{qid}", headers=auth).json()
    assert detail["id"] == qid
    assert detail["points"]
    assert detail["next"] is not None


def test_search(client):
    data = client.get("/api/search", params={"q": "闭包"}).json()
    assert data["total"] > 0


def test_practice_flow(client, auth):
    qid = client.get("/api/questions", params={"size": 1}).json()["items"][0]["id"]

    # 答错 → 进错题本
    res = client.post("/api/me/records", json={"question_id": qid, "correct": False}, headers=auth)
    body = res.json()
    assert body["first_time"] is True
    assert body["today"] >= 1

    wrongs = client.get("/api/me/wrongs", headers=auth).json()
    assert qid in [x["id"] for x in wrongs]

    # 再答对 → 自动移出
    client.post("/api/me/records", json={"question_id": qid, "correct": True}, headers=auth)
    wrongs = client.get("/api/me/wrongs", headers=auth).json()
    assert qid not in [x["id"] for x in wrongs]

    stats = client.get("/api/me/stats", headers=auth).json()
    assert stats["done"] >= 1
    assert stats["right"] >= 1
    assert stats["rate"] == 100


def test_auth_required(client):
    assert client.get("/api/me/stats").status_code == 401


def test_favorite_idempotent(client, auth):
    qid = "css-001"
    first = client.post(f"/api/me/favorites/{qid}", headers=auth)
    second = client.post(f"/api/me/favorites/{qid}", headers=auth)
    assert first.status_code == 201 and second.status_code == 201
    assert qid in [x["id"] for x in client.get("/api/me/favorites", headers=auth).json()]

    client.delete(f"/api/me/favorites/{qid}", headers=auth)
    assert qid not in [x["id"] for x in client.get("/api/me/favorites", headers=auth).json()]
