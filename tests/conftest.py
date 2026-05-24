"""Test fixtures and utilities for the Inbox test suite."""

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from inbox.database import get_session
from inbox.server.app import app


@pytest_asyncio.fixture
async def engine():
    """Create a fresh in-memory SQLite engine for each test."""
    _engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
        future=True,
    )
    async with _engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield _engine
    await _engine.dispose()


@pytest_asyncio.fixture
async def session(engine):
    """Yield a fresh database session for each test."""
    async_session = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
    )
    async with async_session() as _session:
        yield _session


@pytest_asyncio.fixture
async def client(session):
    """Yield an HTTP async client with DB session overridden."""

    async def override_get_session():
        yield session

    app.dependency_overrides[get_session] = override_get_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
