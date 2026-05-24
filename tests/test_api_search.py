"""Tests for Search API endpoints."""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from inbox.models import Item


class TestSearchItems:
    """Tests for GET /v1/search."""

    async def test_search_returns_matching_items(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        """Search query returns items matching raw_text."""
        session.add_all(
            [
                Item(raw_text="hello world"),
                Item(raw_text="goodbye moon"),
            ]
        )
        await session.commit()

        resp = await client.get("/v1/search?q=hello")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["raw_text"] == "hello world"

    async def test_search_empty_query(self, client: AsyncClient) -> None:
        """Empty query is rejected."""
        resp = await client.get("/v1/search?q=")
        assert resp.status_code == 422

    async def test_search_no_results(self, client: AsyncClient, session: AsyncSession) -> None:
        """Search with no matches returns empty."""
        session.add(Item(raw_text="hello"))
        await session.commit()

        resp = await client.get("/v1/search?q=xyz")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 0
        assert data["items"] == []

    async def test_search_with_type_filter(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        """Search filtered by type."""
        session.add_all(
            [
                Item(raw_text="https://example.com"),
                Item(raw_text="hello"),
            ]
        )
        await session.commit()

        resp = await client.get("/v1/search?q=e&type=url")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["items"][0]["type"] == "url"

    async def test_search_respects_limit(self, client: AsyncClient, session: AsyncSession) -> None:
        """Search limit parameter works."""
        for i in range(10):
            session.add(Item(raw_text=f"item {i}"))
        await session.commit()

        resp = await client.get("/v1/search?q=item&limit=3")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 3
        assert len(data["items"]) == 3

    async def test_search_excludes_deleted(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        """Deleted items do not appear in search."""
        from datetime import UTC, datetime

        active = Item(raw_text="active hello")
        deleted = Item(raw_text="deleted hello")
        session.add_all([active, deleted])
        await session.commit()

        deleted.deleted_at = datetime.now(UTC)
        await session.commit()

        resp = await client.get("/v1/search?q=hello")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["items"][0]["raw_text"] == "active hello"


class TestSimilarItems:
    """Tests for POST /v1/search/similar."""

    async def test_similar_placeholder(self, client: AsyncClient) -> None:
        """Vector similarity returns placeholder empty result."""
        resp = await client.post("/v1/search/similar", json={"item_id": "abc"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 0
        assert data["items"] == []
