from fastapi import APIRouter
from app.schemas.recommendation import RecommendationResponse
from app.models.content_based_recommender import ContentBasedRecommender

router = APIRouter()
recommender = ContentBasedRecommender()


@router.get("/recommend/{user_id}", response_model=RecommendationResponse)
async def get_recommendations(user_id: str, limit: int = 10) -> RecommendationResponse:
    track_ids = await recommender.recommend(user_id, limit)
    return RecommendationResponse(user_id=user_id, track_ids=track_ids)