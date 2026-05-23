import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # Points to /backend/

class Settings(BaseSettings):
    # App Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"
    
    # Security
    JWT_SECRET_KEY: str = "9a1f28b3c4d5e6f7a8b9c0d1e2f3a4b5"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # CORS Origins (can override via CORS_ORIGINS env var, comma-separated)
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    CORS_ORIGINS: str = ""  # Comma-separated override, e.g. "https://myapp.vercel.app,https://custom.com"
    
    # DB & Cache
    DATABASE_URL: str = "sqlite:///./app/ipl_platform.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Razorpay Payment & n8n Automation Keys
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    N8N_WEBHOOK_URL: str = ""
    
    # UPI Direct Payment
    UPI_ID: str = "8122061903@axl"
    UPI_PAYEE_NAME: str = "Tushar Kumar Tiwari"
    
    # ML & Data
    MLFLOW_TRACKING_URI: str = "./mlruns"
    DATASET_URL: str = "https://cricsheet.org/downloads/ipl_male_csv2.zip"

    
    # Derived paths
    DATASET_DIR: Path = BASE_DIR / "app" / "datasets"
    MODELS_DIR: Path = BASE_DIR / "app" / "models"
    LOGS_DIR: Path = BASE_DIR / "logs"

    # SettingsConfigDict specifies configuration for settings (Pydantic v2)
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Create folders if they don't exist
settings = Settings()

# Resolve SQLite database URL relative to BASE_DIR if it is a relative path
if settings.DATABASE_URL.startswith("sqlite:///"):
    path_part = settings.DATABASE_URL.replace("sqlite:///", "")
    # Check if the path is not absolute (does not start with '/' and does not have drive letter like 'C:')
    is_absolute = path_part.startswith("/") or (len(path_part) > 1 and path_part[1] == ":")
    if not is_absolute:
        clean_path = path_part.lstrip("./")
        settings.DATABASE_URL = f"sqlite:///{BASE_DIR / clean_path}"

settings.DATASET_DIR.mkdir(parents=True, exist_ok=True)
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
settings.LOGS_DIR.mkdir(parents=True, exist_ok=True)
