from fastapi.testclient import TestClient

from app import models
from app.core import security
from app.main import app

client = TestClient(app)


def test_models_package_exports_user():
    assert models.User.__tablename__ == "users"
    assert models.UserProfile.__tablename__ == "user_profiles"


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_openapi_lists_routers():
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    paths = response.json()["paths"]
    assert "/api/v1/users/me" in paths
    assert "/api/v1/login/access-token" in paths
    assert "/api/v1/tryon/generate" in paths


def test_docs():
    assert client.get("/docs").status_code == 200


def test_me_requires_token():
    assert client.get("/api/v1/users/me").status_code == 401
    response = client.get("/api/v1/users/me", headers={"Authorization": "Bearer not-a-jwt"})
    assert response.status_code == 401


def test_password_hash_round_trip():
    hashed = security.get_password_hash("correct horse")
    assert security.verify_password("correct horse", hashed)
    assert not security.verify_password("wrong", hashed)


def test_access_token_round_trip():
    import jwt
    from app.core.config import settings

    token = security.create_access_token(42)
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
    assert payload["sub"] == "42"
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}x"})
    assert response.status_code == 401
