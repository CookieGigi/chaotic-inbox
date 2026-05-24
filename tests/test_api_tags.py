"""Tests for Tags API endpoints."""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from inbox.models import Item, ItemTag, Tag


class TestCreateTag:
    """Tests for POST /v1/tags."""

    async def test_create_tag(self, client: AsyncClient) -> None:
        """Create a new tag."""
        resp = await client.post("/v1/tags", json={"name": "python"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "python"
        assert "id" in data

    async def test_create_duplicate_tag(self, client: AsyncClient) -> None:
        """Duplicate tag name returns 409."""
        await client.post("/v1/tags", json={"name": "python"})
        resp = await client.post("/v1/tags", json={"name": "python"})
        assert resp.status_code == 409


class TestListTags:
    """Tests for GET /v1/tags."""

    async def test_list_empty(self, client: AsyncClient) -> None:
        """No tags returns empty list."""
        resp = await client.get("/v1/tags")
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_list_ordered_by_name(self, client: AsyncClient, session: AsyncSession) -> None:
        """Tags are ordered by name."""
        session.add_all([Tag(name="zebra"), Tag(name="alpha")])
        await session.commit()

        resp = await client.get("/v1/tags")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2
        assert data[0]["name"] == "alpha"
        assert data[1]["name"] == "zebra"


class TestGetTag:
    """Tests for GET /v1/tags/{id}."""

    async def test_get_tag(self, client: AsyncClient, session: AsyncSession) -> None:
        """Retrieve tag by ID."""
        tag = Tag(name="python")
        session.add(tag)
        await session.commit()
        await session.refresh(tag)

        resp = await client.get(f"/v1/tags/{tag.id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "python"

    async def test_get_tag_not_found(self, client: AsyncClient) -> None:
        """Nonexistent tag ID returns 404."""
        resp = await client.get("/v1/tags/999")
        assert resp.status_code == 404


class TestDeleteTag:
    """Tests for DELETE /v1/tags/{id}."""

    async def test_delete_tag(self, client: AsyncClient, session: AsyncSession) -> None:
        """Delete a tag."""
        tag = Tag(name="temp")
        session.add(tag)
        await session.commit()
        await session.refresh(tag)

        resp = await client.delete(f"/v1/tags/{tag.id}")
        assert resp.status_code == 204

        # Verify deletion
        from sqlmodel import select

        result = await session.execute(select(Tag).where(Tag.id == tag.id))
        assert result.scalar_one_or_none() is None

    async def test_delete_tag_not_found(self, client: AsyncClient) -> None:
        """Delete nonexistent tag returns 404."""
        resp = await client.delete("/v1/tags/999")
        assert resp.status_code == 404


class TestTagItemAssociation:
    """Tests for tag-item relationships via API."""

    async def test_item_shows_tags(self, client: AsyncClient, session: AsyncSession) -> None:
        """Item response includes associated tags."""
        item = Item(raw_text="hello")
        tag = Tag(name="greeting")
        session.add_all([item, tag])
        await session.commit()
        await session.refresh(item)
        await session.refresh(tag)

        link = ItemTag(item_id=item.id, tag_id=tag.id)
        session.add(link)
        await session.commit()

        resp = await client.get(f"/v1/items/{item.id}")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data.get("tags", [])) == 1
        assert data["tags"][0]["name"] == "greeting"
