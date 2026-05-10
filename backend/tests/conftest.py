import asyncio
import os
from collections.abc import AsyncGenerator, Generator
from typing import Callable

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool
from alembic.config import Config
from alembic import command

from main import app
from core.database import get_db
from core.security import create_access_token, hash_password
from models.user import User

# Test Database URL (port 5433)
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://spark:spark_secret@localhost:5433/spark_test_db"
)

# Test engine
engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
TestingSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)

@pytest.fixture(scope="session", autouse=True)
def apply_migrations() -> Generator[None, None, None]:
    """Apply Alembic migrations to the test database before tests, then tear down."""
    # We must use synchronous psycopg2 for Alembic if it uses sync connections,
    # or just run it via command line or async helper.
    # Alembic expects a sync engine for upgrade() by default in its env.py unless configured.
    # Let's override sqlalchemy.url in alembic config.
    alembic_cfg = Config("alembic.ini")
    # Replace asyncpg with psycopg2 for the sync Alembic runner if needed, 
    # but our env.py uses run_migrations_online which handles async engines!
    alembic_cfg.set_main_option("sqlalchemy.url", TEST_DATABASE_URL)
    
    # Run upgrade head
    command.upgrade(alembic_cfg, "head")
    
    yield
    
    # We could downgrade or drop all tables here, but dropping schema is cleaner
    command.downgrade(alembic_cfg, "base")

@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Yields a database session and rolls back the transaction after each test."""
    async with engine.begin() as conn:
        # Create a nested transaction (savepoint)
        await conn.begin_nested()
        
        # Create a session mapped to this transaction
        async_session = async_sessionmaker(
            bind=conn, class_=AsyncSession, expire_on_commit=False, autoflush=False
        )
        
        async with async_session() as session:
            yield session
            # Rollback to the savepoint when test finishes
            await session.rollback()

@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provides a test client with the get_db dependency overridden to use the test session."""
    
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
        
    app.dependency_overrides.clear()

@pytest_asyncio.fixture
async def create_test_user(db_session: AsyncSession) -> Callable:
    """Factory to create a user and return their access token."""
    async def _create(email: str = "test@spark.id", business_name: str = "Test Store") -> dict:
        user = User(
            email=email,
            hashed_pw=hash_password("Password123!"),
            business_name=business_name,
            is_active=True
        )
        db_session.add(user)
        await db_session.flush()
        await db_session.refresh(user)
        
        token = create_access_token(user.id)
        return {"Authorization": f"Bearer {token}", "user_id": str(user.id)}
    
    return _create

@pytest_asyncio.fixture
async def auth_headers(create_test_user: Callable) -> dict:
    """Provides auth headers for a default test user."""
    auth_data = await create_test_user()
    return {"Authorization": auth_data["Authorization"]}
