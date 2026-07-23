"""Database connection and session management."""
import os, asyncio, logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

logger = logging.getLogger("karabu.db")
DATABASE_URL = os.environ["DATABASE_URL"]
# Ensure async driver prefix for SQLAlchemy async engine
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

# Create engine with connection retry on startup
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=5,
    connect_args={"timeout": 10, "ssl": "require"},
)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    """FastAPI dependency: yields an async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db(retries=10, delay=2):
    """Create all tables, retrying connection if Postgres isn't ready yet."""
    for i in range(retries):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully")
            return
        except Exception as e:
            if i < retries - 1:
                logger.warning(f"DB connection attempt {i+1}/{retries} failed: {e}. Retrying in {delay}s...")
                await asyncio.sleep(delay)
            else:
                logger.error(f"DB connection failed after {retries} attempts: {e}")
                raise
