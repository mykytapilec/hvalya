from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    user_id: str
    track_ids: list[str]
