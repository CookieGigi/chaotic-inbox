"""Tests for Item API endpoints."""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from inbox.models import Item


class TestCreateItem:
    """Tests for POST /v1/items."""

    async def test_create_text_item(self, client: AsyncClient) -> None:
        """Create a plain text item."""
        resp = await client.post("/v1/items", json={"raw_text": "hello world"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["type"] == "text"
        assert data["raw_text"] == "hello world"
        assert "id" in data

    async def test_create_url_item(self, client: AsyncClient) -> None:
        """Create a URL item with auto-detected type."""
        resp = await client.post("/v1/items", json={"raw_text": "https://example.com"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["type"] == "url"

    async def test_create_requires_content(self, client: AsyncClient) -> None:
        """Creating an item with no content returns 422."""
        resp = await client.post("/v1/items", json={})
        assert resp.status_code == 422

    async def test_create_explicit_type(self, client: AsyncClient) -> None:
        """Explicit type overrides auto-detection."""
        resp = await client.post(
            "/v1/items",
            json={"raw_text": "hello", "type": "file"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["type"] == "file"

    async def test_create_with_tags(self, client: AsyncClient) -> None:
        """Create item with associated tags."""
        # First create a tag
        await client.post("/v1/tags", json={"name": "important"})
        # Then create item referencing it
        resp = await client.post(
            "/v1/items",
            json={"raw_text": "hello", "tag_names": ["important"]},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert any(t["name"] == "important" for t in data.get("tags", []))


class TestListItems:
    """Tests for GET /v1/items."""

    async def test_list_empty(self, client: AsyncClient) -> None:
        """Empty inbox returns empty list."""
        resp = await client.get("/v1/items")
        assert resp.status_code == 200
        data = resp.json()
        assert data == []

    async def test_list_default_order_newest_first(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        """Items are returned newest first."""
        item1 = Item(raw_text="first")
        item2 = Item(raw_text="second")
        session.add_all([item1, item2])
        await session.commit()

        resp = await client.get("/v1/items")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2
        assert data[0]["raw_text"] == "second"
        assert data[1]["raw_text"] == "first"

    async def test_list_pagination(self, client: AsyncClient, session: AsyncSession) -> None:
        """Limit and offset work."""
        for i in range(5):
            session.add(Item(raw_text=f"item {i}"))
        await session.commit()

        resp = await client.get("/v1/items?limit=2&offset=1")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    async def test_list_type_filter(self, client: AsyncClient, session: AsyncSession) -> None:
        """Filter by type returns only matching items."""
        session.add_all(
            [
                Item(raw_text="https://a.com"),
                Item(raw_text="plain text"),
            ]
        )
        await session.commit()

        resp = await client.get("/v1/items?type=url")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["type"] == "url"

    async def test_list_excludes_deleted(self, client: AsyncClient, session: AsyncSession) -> None:
        """Soft-deleted items are not listed."""
        from datetime import UTC, datetime

        active = Item(raw_text="active")
        deleted = Item(raw_text="deleted")
        session.add_all([active, deleted])
        await session.commit()

        deleted.deleted_at = datetime.now(UTC)
        await session.commit()

        resp = await client.get("/v1/items")
        data = resp.json()
        assert len(data) == 1
        assert data[0]["raw_text"] == "active"


class TestGetItem:
    """Tests for GET /v1/items/{id}."""

    async def test_get_item(self, client: AsyncClient, session: AsyncSession) -> None:
        """Retrieve item by ID."""
        item = Item(raw_text="hello")
        session.add(item)
        await session.commit()
        await session.refresh(item)

        resp = await client.get(f"/v1/items/{item.id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["raw_text"] == "hello"

    async def test_get_item_not_found(self, client: AsyncClient) -> None:
        """Nonexistent ID returns 404."""
        resp = await client.get("/v1/items/550e8400-e29b-41d4-a716-446655440000")
        assert resp.status_code == 404

    async def test_get_deleted_item_returns_404(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        """Soft-deleted item returns 404."""
        from datetime import UTC, datetime

        item = Item(raw_text="deleted")
        session.add(item)
        await session.commit()
        await session.refresh(item)

        item.deleted_at = datetime.now(UTC)
        await session.commit()

        resp = await client.get(f"/v1/items/{item.id}")
        assert resp.status_code == 404


class TestUpdateItem:
    """Tests for PATCH /v1/items/{id}."""

    async def test_update_capture_meta(self, client: AsyncClient, session: AsyncSession) -> None:
        """PATCH allowed field updates item."""
        item = Item(raw_text="hello")
        session.add(item)
        await session.commit()
        await session.refresh(item)

        resp = await client.patch(
            f"/v1/items/{item.id}",
            json={"capture_meta": {"source": "cli"}},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["capture_meta"]["source"] == "cli"

    async def test_update_rejects_raw_text(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        """PATCH with raw_text is rejected."""
        item = Item(raw_text="hello")
        session.add(item)
        await session.commit()
        await session.refresh(item)

        resp = await client.patch(
            f"/v1/items/{item.id}",
            json={"raw_text": "changed"},
        )
        assert resp.status_code == 422

    async def test_update_rejects_type(self, client: AsyncClient, session: AsyncSession) -> None:
        """PATCH with type is rejected."""
        item = Item(raw_text="hello")
        session.add(item)
        await session.commit()
        await session.refresh(item)

        resp = await client.patch(
            f"/v1/items/{item.id}",
            json={"type": "url"},
        )
        assert resp.status_code == 422

    async def test_update_adds_tags(self, client: AsyncClient, session: AsyncSession) -> None:
        """PATCH with tag_names associates tags."""
        item = Item(raw_text="hello")
        session.add(item)
        await session.commit()
        await session.refresh(item)

        # Create tag first
        await client.post("/v1/tags", json={"name": "important"})

        resp = await client.patch(
            f"/v1/items/{item.id}",
            json={"tag_names": ["important"]},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert any(t["name"] == "important" for t in data.get("tags", []))

    async def test_update_not_found(self, client: AsyncClient) -> None:
        """PATCH nonexistent item returns 404."""
        resp = await client.patch(
            "/v1/items/550e8400-e29b-41d4-a716-446655440000",
            json={"capture_meta": {}},
        )
        assert resp.status_code == 404


class TestDeleteItem:
    """Tests for DELETE /v1/items/{id}."""

    async def test_soft_delete(self, client: AsyncClient, session: AsyncSession) -> None:
        """DELETE soft-deletes item."""
        item = Item(raw_text="to delete")
        session.add(item)
        await session.commit()
        await session.refresh(item)

        resp = await client.delete(f"/v1/items/{item.id}")
        assert resp.status_code == 204

        # Verify soft delete in DB
        await session.refresh(item)
        assert item.deleted_at is not None

    async def test_delete_not_found(self, client: AsyncClient) -> None:
        """DELETE nonexistent item returns 404."""
        resp = await client.delete("/v1/items/550e8400-e29b-41d4-a716-446655440000")
        assert resp.status_code == 404

    async def test_delete_already_deleted(self, client: AsyncClient, session: AsyncSession) -> None:
        """DELETE already-deleted item returns 404."""
        from datetime import UTC, datetime

        item = Item(raw_text="already deleted")
        item.deleted_at = datetime.now(UTC)
        session.add(item)
        await session.commit()
        await session.refresh(item)

        resp = await client.delete(f"/v1/items/{item.id}")
        assert resp.status_code == 404
