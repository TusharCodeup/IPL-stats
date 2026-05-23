from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from ..core.config import settings

DATABASE_URL = settings.DATABASE_URL

# Rewrite legacy 'postgres://' scheme to newer standard 'postgresql://' if needed
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configure engine arguments based on DB type
engine_kwargs = {
    "pool_pre_ping": True
}

if DATABASE_URL.startswith("sqlite"):
    # Allow multiple threads for SQLite local testing
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Postgres specific pooling settings (Supabase compatible)
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_engine(
    DATABASE_URL, 
    **engine_kwargs
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI dependency to yield database sessions with safe cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
