import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_get_recommendations() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/recommend/user-123")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "user-123"
    assert len(data["track_ids"]) == 10


@pytest.mark.asyncio
async def test_get_recommendations_with_limit() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/recommend/user-123?limit=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data["track_ids"]) == 3