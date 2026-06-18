from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Hvalya AI Service"
    api_v1_prefix: str = "/api/v1"
    environment: str = "development"
    port: int = 8000

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()