import httpx

from app.core.config import settings


class NestApiClient:
    """
    HTTP client for pulling catalog and listening-history data from the
    NestJS internal API. The ai-service never touches the database directly.
    """

    def __init__(self) -> None:
        self._base_url = settings.nest_api_url
        self._headers = {"x-internal-api-key": settings.internal_api_key}

    async def get_track_catalog(self) -> list[dict]:
        async with httpx.AsyncClient(base_url=self._base_url, headers=self._headers) as client:
            response = await client.get("/internal/tracks")
            response.raise_for_status()
            return response.json()

    async def get_user_history(self, user_id: str, limit: int = 100) -> list[dict]:
        async with httpx.AsyncClient(base_url=self._base_url, headers=self._headers) as client:
            response = await client.get(
                f"/internal/users/{user_id}/history",
                params={"limit": limit},
            )
            response.raise_for_status()
            return response.json()