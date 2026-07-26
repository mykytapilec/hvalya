from abc import ABC, abstractmethod


class BaseRecommender(ABC):
    """
    Abstract base class for all recommendation models.
    Future models (collaborative filtering, content-based, hybrid)
    must implement this interface to be pluggable into the API layer.
    """

    @abstractmethod
    async def recommend(self, user_id: str, limit: int = 10) -> list[str]:
        """Returns a list of recommended track IDs for the given user."""
        raise NotImplementedError
