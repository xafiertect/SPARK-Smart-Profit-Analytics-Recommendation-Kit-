from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://spark:spark_secret@localhost:5432/spark_db"
    SECRET_KEY: str = "change-me-to-a-random-32-char-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DEBUG: bool = False

    # Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    LLM_TIMEOUT_SECONDS: int = 15

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
