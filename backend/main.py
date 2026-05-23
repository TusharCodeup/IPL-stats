import logging
from logging.handlers import RotatingFileHandler
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .app.core.config import settings
from .app.database.connection import engine, Base
from .app.api.router import api_router
from .app.api import websocket as ws_router

# 1. Setup Logging
log_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
settings.LOGS_DIR.mkdir(parents=True, exist_ok=True)
log_file = settings.LOGS_DIR / "app.log"

# Rotating file handler (max 5MB per file, keeping 5 backup files)
file_handler = RotatingFileHandler(
    log_file, 
    maxBytes=5 * 1024 * 1024, 
    backupCount=5,
    encoding='utf-8'
)
file_handler.setFormatter(log_formatter)
file_handler.setLevel(logging.INFO)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)
console_handler.setLevel(logging.INFO)

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    handlers=[file_handler, console_handler]
)
logger = logging.getLogger("app")

# 2. Database Initialization
try:
    logger.info("Initializing database tables...")
    # Import models to ensure they register on Base
    from .app.database import models
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
    
    # Auto-seed default admin user if database is clean
    from .app.database.connection import SessionLocal
    from .app.database import crud
    from .app.core import security
    
    db = SessionLocal()
    try:
        admin_user = crud.get_user_by_username(db, "admin")
        if not admin_user:
            logger.info("No admin user found. Seeding default admin user: admin/admin123")
            hashed_pw = security.get_password_hash("admin123")
            crud.create_user(db, username="admin", hashed_pw=hashed_pw, role="admin")
            logger.info("Default admin user seeded successfully.")
    finally:
        db.close()
except Exception as e:
    logger.error(f"Error initializing database: {e}")

# 3. Create FastAPI AppInstance
app = FastAPI(
    title="IPL Match Winner Prediction Platform API",
    description="Startup-grade machine learning platform for IPL cricket match winner analytics and live probability simulation.",
    version="1.0.0"
)

# 4. CORS Middleware Setup
# Merge any additional origins from CORS_ORIGINS env var
allowed_origins = list(settings.ALLOWED_ORIGINS)
if settings.CORS_ORIGINS:
    extra = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
    allowed_origins.extend(extra)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Middleware for latency tracking
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"API {request.method} {request.url.path} completed in {duration:.4f}s - Status {response.status_code}")
    return response

# 6. REST API and WebSocket Route Registry
app.include_router(api_router, prefix="/api/v1")
app.include_router(ws_router.router, prefix="/api/ws")

# 7. Root Welcome Route
@app.get("/", tags=["Root"])
def root():
    """Welcome endpoint for IPL Prediction API."""
    return {
        "message": "Welcome to the IPL Match Winner Prediction Platform API!",
        "version": "1.0.0",
        "documentation": "/docs",
        "health": "/health",
        "status": "online"
    }

# 8. Health Check Route
@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    """Service health status check."""
    return {
        "status": "ok",
        "timestamp": time.time(),
        "service": "ipl_prediction_backend",
        "database": settings.DATABASE_URL.split("://")[0]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=True
    )
