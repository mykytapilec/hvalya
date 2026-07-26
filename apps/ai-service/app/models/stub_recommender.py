from app.models.base import BaseRecommender


class StubRecommender(BaseRecommender):
    """
    Placeholder recommender returning static track IDs.
    Will be replaced by a real model (e.g. collaborative filtering) later.
    """

    async def recommend(self, user_id: str, limit: int = 10) -> list[str]:
        stub_track_ids = [f"track-stub-{i}" for i in range(1, limit + 1)]
        return stub_track_ids
