import os
from typing import List
from pydantic_settings import BaseSettings

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_DB_PATH = os.path.join(PROJECT_ROOT, "smartstay.db").replace("\\", "/")

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartStay – Dynamic Hotel Pricing & Revenue Optimization System"
    ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
    
    # Security
    SECRET_KEY: str = "smartstay-super-secret-key-change-in-production-hotel-revenue"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    # External APIs
    OPENWEATHER_API_KEY: str = ""
    DEFAULT_HOTEL_CITY: str = "Jaipur"
    
    # Default Rule Boundaries
    DEFAULT_MIN_PRICE_PCT: float = 70.0
    DEFAULT_MAX_PRICE_PCT: float = 200.0
    DEFAULT_MAX_DAILY_CHANGE_PCT: float = 20.0
    AUTO_PRICING_DEFAULT: bool = False
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
