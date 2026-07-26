from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.recommendations import router as recommendations_router

app = FastAPI(title=settings.app_name)

app.include_router(recommendations_router, prefix=settings.api_v1_prefix)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
