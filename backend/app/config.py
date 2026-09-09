"""Investigation Intelligence Platform — Backend Configuration"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/investigation_db"

    # Google Gemini
    GEMINI_API_KEY: str = ""

    # LLM
    LLM_PROVIDER: str = "gemini"
    LLM_MODEL: str = "gemini-2.0-flash"
    EMBEDDING_MODEL: str = "gemini-embedding-001"
    EMBEDDING_DIMENSIONS: int = 768

    # JWT
    JWT_SECRET: str = "change-this-to-a-random-secret-key-at-least-32-chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24

    # Search
    BM25_WEIGHT: float = 0.4
    SEMANTIC_WEIGHT: float = 0.6
    SEARCH_TOP_K: int = 10

    # Chunking
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 150

    # Upload
    UPLOAD_DIR: str = "storage/uploads"
    MAX_FILE_SIZE_MB: int = 50

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ("../.env", ".env")
        env_file_encoding = "utf-8"


settings = Settings()
