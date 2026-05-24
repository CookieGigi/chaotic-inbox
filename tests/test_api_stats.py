"""Tests for Stats API endpoint."""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from inbox.models import Category, Item, Tag


class TestGetStats:
    """Tests for GET /v1/stats."""

    async def test_empty_stats(self, client: AsyncClient) -> None:
        """Empty inbox returns zero counts."""
        resp = await client.get("/v1/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_items"] == 0
        assert data["by_type"] == {}
        assert data["total_tags"] == 0
        assert data["total_categories"] == 0

    async def test_counts_items(self, client: AsyncClient, session: AsyncSession) -> None:
        """Stats reflect item counts by type."""
        session.add_all(
            [
                Item(raw_text="text1"),
                Item(raw_text="text2"),
                Item(raw_text="https://example.com"),
            ]
        )
        await session.commit()

        resp = await client.get("/v1/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_items"] == 3
        assert data["by_type"]["text"] == 2
        assert data["by_type"]["url"] == 1

    async def test_counts_tags(self, client: AsyncClient, session: AsyncSession) -> None:
        """Stats include tag count."""
        session.add_all([Tag(name="a"), Tag(name="b")])
        await session.commit()

        resp = await client.get("/v1/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_tags"] == 2

    async def test_counts_categories(self, client: AsyncClient, session: AsyncSession) -> None:
        """Stats include category count."""
        session.add_all([Category(name="a"), Category(name="b"), Category(name="c")])
        await session.commit()

        resp = await client.get("/v1/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_categories"] == 3

    async def test_excludes_deleted_items(self, client: AsyncClient, session: AsyncSession) -> None:
        """Deleted items are not counted."""
        from datetime import UTC, datetime

        active = Item(raw_text="active")
        deleted = Item(raw_text="deleted")
        session.add_all([active, deleted])
        await session.commit()

        deleted.deleted_at = datetime.now(UTC)
        await session.commit()

        resp = await client.get("/v1/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_items"] == 1
