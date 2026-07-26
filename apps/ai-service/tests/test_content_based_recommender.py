import pytest

from app.models.content_based_recommender import ContentBasedRecommender


class FakeNestApiClient:
    """Test double for NestApiClient — returns canned catalog/history data."""

    def __init__(self, catalog: list[dict], history: list[dict]) -> None:
        self._catalog = catalog
        self._history = history

    async def get_track_catalog(self) -> list[dict]:
        return self._catalog

    async def get_user_history(self, user_id: str, limit: int = 100) -> list[dict]:
        return self._history


CATALOG = [
    {"id": "rock-1", "genres": ["rock", "alternative"]},
    {"id": "rock-2", "genres": ["rock"]},
    {"id": "jazz-1", "genres": ["jazz"]},
    {"id": "jazz-2", "genres": ["jazz", "blues"]},
    {"id": "pop-1", "genres": ["pop"]},
]


@pytest.mark.asyncio
async def test_cold_start_returns_sample_when_no_history():
    client = FakeNestApiClient(catalog=CATALOG, history=[])
    recommender = ContentBasedRecommender(api_client=client)

    result = await recommender.recommend("user-1", limit=3)

    assert len(result) == 3
    assert set(result).issubset({track["id"] for track in CATALOG})


@pytest.mark.asyncio
async def test_cold_start_when_catalog_smaller_than_limit():
    client = FakeNestApiClient(catalog=CATALOG, history=[])
    recommender = ContentBasedRecommender(api_client=client)

    result = await recommender.recommend("user-1", limit=100)

    assert len(result) == len(CATALOG)


@pytest.mark.asyncio
async def test_empty_catalog_returns_empty_list():
    client = FakeNestApiClient(catalog=[], history=[])
    recommender = ContentBasedRecommender(api_client=client)

    result = await recommender.recommend("user-1", limit=5)

    assert result == []


@pytest.mark.asyncio
async def test_recommends_similar_genre_tracks_first():
    # User has only listened to rock-1, so their taste vector is rock/alternative.
    history = [{"trackId": "rock-1", "playedAt": "2026-07-01T00:00:00Z"}]
    client = FakeNestApiClient(catalog=CATALOG, history=history)
    recommender = ContentBasedRecommender(api_client=client)

    result = await recommender.recommend("user-1", limit=4)

    # rock-1 was already played, so it must be excluded from candidates.
    assert "rock-1" not in result
    # rock-2 shares the "rock" genre and should outrank jazz/pop tracks.
    assert result[0] == "rock-2"


@pytest.mark.asyncio
async def test_excludes_already_played_tracks():
    history = [
        {"trackId": "rock-1", "playedAt": "2026-07-01T00:00:00Z"},
        {"trackId": "rock-2", "playedAt": "2026-07-02T00:00:00Z"},
    ]
    client = FakeNestApiClient(catalog=CATALOG, history=history)
    recommender = ContentBasedRecommender(api_client=client)

    result = await recommender.recommend("user-1", limit=10)

    assert "rock-1" not in result
    assert "rock-2" not in result


@pytest.mark.asyncio
async def test_falls_back_to_cold_start_when_no_genre_overlap():
    # History references a track that isn't in the catalog (edge case /
    # deleted track) — user vector ends up all-zero, so we must not crash
    # and should fall back to a random sample instead.
    history = [{"trackId": "unknown-track", "playedAt": "2026-07-01T00:00:00Z"}]
    client = FakeNestApiClient(catalog=CATALOG, history=history)
    recommender = ContentBasedRecommender(api_client=client)

    result = await recommender.recommend("user-1", limit=3)

    assert len(result) == 3
    assert set(result).issubset({track["id"] for track in CATALOG})


@pytest.mark.asyncio
async def test_respects_limit():
    history = [{"trackId": "jazz-1", "playedAt": "2026-07-01T00:00:00Z"}]
    client = FakeNestApiClient(catalog=CATALOG, history=history)
    recommender = ContentBasedRecommender(api_client=client)

    result = await recommender.recommend("user-1", limit=2)

    assert len(result) == 2