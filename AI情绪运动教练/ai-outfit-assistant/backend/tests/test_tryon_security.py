from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.api import deps
from app.main import app
from app.services.aigc_mock import _MOCK_TASKS


@pytest.fixture
def client(monkeypatch):
    # Complete processing immediately; no sleeping jobs outlive a test.
    async def complete(self, task_id, duration):
        _MOCK_TASKS[task_id].update(status="completed", progress=100)

    monkeypatch.setattr("app.services.aigc_mock.MockAIGCService._simulate_processing", complete)
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
    _MOCK_TASKS.clear()


def as_user(user_id):
    app.dependency_overrides[deps.get_current_user] = lambda: SimpleNamespace(user_id=user_id)


def test_task_owner_can_poll_but_another_user_cannot(client):
    as_user(1)
    created = client.post("/api/v1/tryon/generate", json={"quality": "fast"})
    assert created.status_code == 200
    task_id = created.json()["task_id"]
    path = f"/api/v1/tryon/task/{task_id}"
    owned = client.get(path)
    assert owned.status_code == 200
    assert owned.json()["status"] == "completed"
    assert "user_id" not in owned.json()

    as_user(2)
    denied = client.get(path)
    missing = client.get("/api/v1/tryon/task/missing")
    assert denied.status_code == missing.status_code == 200
    assert denied.json() == {**missing.json(), "task_id": task_id}
    assert denied.json()["result_image_url"] is None
    assert denied.json()["status"] == "not_found"

    as_user(1)
    assert client.get(path).json()["status"] == "completed"


def test_tryon_routes_require_authentication(client):
    assert client.post("/api/v1/tryon/generate", json={}).status_code == 401
    assert client.get("/api/v1/tryon/task/missing").status_code == 401


def test_debug_tracebacks_are_disabled_by_default(monkeypatch):
    from app.core.config import Settings

    monkeypatch.delenv("DEBUG", raising=False)
    assert Settings(_env_file=None).DEBUG is False
