import math
import random

from app.models.base import BaseRecommender
from app.services.nest_api_client import NestApiClient


class ContentBasedRecommender(BaseRecommender):
    """
    Content-based recommender using cosine similarity over genre-frequency
    vectors. Builds a user taste profile from listening history and ranks
    unseen tracks by similarity to that profile.

    Falls back to a random sample of the catalog for cold-start users
    (no listening history yet).
    """

    def __init__(self, api_client: NestApiClient | None = None) -> None:
        self._api_client = api_client or NestApiClient()

    async def recommend(self, user_id: str, limit: int = 10) -> list[str]:
        catalog = await self._api_client.get_track_catalog()
        if not catalog:
            return []

        history = await self._api_client.get_user_history(user_id)
        played_track_ids = {play["trackId"] for play in history}

        candidates = [track for track in catalog if track["id"] not in played_track_ids]
        if not candidates:
            candidates = catalog

        if not history:
            return self._cold_start(candidates, limit)

        genre_universe = self._build_genre_universe(catalog)
        user_vector = self._build_user_vector(catalog, history, genre_universe)

        if not any(user_vector.values()):
            return self._cold_start(candidates, limit)

        scored = [
            (
                track["id"],
                self._cosine_similarity(user_vector, self._track_vector(track, genre_universe)),
            )
            for track in candidates
        ]
        scored.sort(key=lambda item: item[1], reverse=True)

        ranked_ids = [track_id for track_id, score in scored if score > 0]
        if len(ranked_ids) < limit:
            remaining = [track_id for track_id, _ in scored if track_id not in ranked_ids]
            ranked_ids.extend(remaining)

        return ranked_ids[:limit]

    def _cold_start(self, candidates: list[dict], limit: int) -> list[str]:
        sample_size = min(limit, len(candidates))
        sampled = random.sample(candidates, sample_size)
        return [track["id"] for track in sampled]

    def _build_genre_universe(self, catalog: list[dict]) -> list[str]:
        genres: set[str] = set()
        for track in catalog:
            genres.update(track.get("genres", []))
        return sorted(genres)

    def _track_vector(self, track: dict, genre_universe: list[str]) -> dict[str, float]:
        track_genres = set(track.get("genres", []))
        return {genre: (1.0 if genre in track_genres else 0.0) for genre in genre_universe}

    def _build_user_vector(
        self,
        catalog: list[dict],
        history: list[dict],
        genre_universe: list[str],
    ) -> dict[str, float]:
        tracks_by_id = {track["id"]: track for track in catalog}
        vector = {genre: 0.0 for genre in genre_universe}

        for play in history:
            track = tracks_by_id.get(play["trackId"])
            if not track:
                continue
            for genre in track.get("genres", []):
                if genre in vector:
                    vector[genre] += 1.0

        return vector

    def _cosine_similarity(self, vec_a: dict[str, float], vec_b: dict[str, float]) -> float:
        dot = sum(vec_a[genre] * vec_b[genre] for genre in vec_a)
        norm_a = math.sqrt(sum(value ** 2 for value in vec_a.values()))
        norm_b = math.sqrt(sum(value ** 2 for value in vec_b.values()))

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        return dot / (norm_a * norm_b)