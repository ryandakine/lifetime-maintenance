from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.core.config import settings
import asyncio

# For SQLite (synchronous)
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# For async operations (if using PostgreSQL)
async_engine = None
if not settings.DATABASE_URL.startswith("sqlite"):
    async_engine = create_async_engine(
        settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
        echo=True,
    )

Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Async dependency
async def get_async_db():
    if async_engine:
        async with AsyncSession(async_engine) as session:
            yield session
    else:
        # Fallback to sync for SQLite
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close() 