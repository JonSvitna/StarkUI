import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "StarkUI Backend"
    DEBUG: bool = False
    
    # Server
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = "0.0.0.0"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/starkui"
    )
    
    # CORS - comma-separated list of allowed origins
    BACKEND_CORS_ORIGINS: str = os.getenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000"
    )
    
    # JWT (optional - app works without it)
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60 * 24  # 24 hours
    
    # Feature Flags
    ENABLE_JWT_PROTECTION: bool = os.getenv("ENABLE_JWT_PROTECTION", "false").lower() == "true"
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]
    
    class Config:
        case_sensitive = True


settings = Settings()
