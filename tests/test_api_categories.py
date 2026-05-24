"""Tests for Categories API endpoints."""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from inbox.models import Category, Item, ItemCategory


class TestCreateCategory:
    """Tests for POST /v1/categories."""

    async def test_create_category(self, client: AsyncClient) -> None:
        """Create a new category."""
        resp = await client.post("/v1/categories", json={"name": "notes"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "notes"
        assert "id" in data

    async def test_create_category_with_description(self, client: AsyncClient) -> None:
        """Create category with description."""
        resp = await client.post(
            "/v1/categories",
            json={"name": "notes", "description": "General notes"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["description"] == "General notes"

    async def test_create_duplicate_category(self, client: AsyncClient) -> None:
        """Duplicate category name returns 409."""
        await client.post("/v1/categories", json={"name": "notes"})
        resp = await client.post("/v1/categories", json={"name": "notes"})
        assert resp.status_code == 409


class TestListCategories:
    """Tests for GET /v1/categories."""

    async def test_list_empty(self, client: AsyncClient) -> None:
        """No categories returns empty list."""
        resp = await client.get("/v1/categories")
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_list_ordered_by_name(self, client: AsyncClient, session: AsyncSession) -> None:
        """Categories are ordered by name."""
        session.add_all([Category(name="zebra"), Category(name="alpha")])
        await session.commit()

        resp = await client.get("/v1/categories")
        assert resp.status_code == 200
        data = resp.json()
        assert data[0]["name"] == "alpha"
        assert data[1]["name"] == "zebra"


class TestGetCategory:
    """Tests for GET /v1/categories/{id}."""

    async def test_get_category(self, client: AsyncClient, session: AsyncSession) -> None:
        """Retrieve category by ID."""
        category = Category(name="notes")
        session.add(category)
        await session.commit()
        await session.refresh(category)

        resp = await client.get(f"/v1/categories/{category.id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "notes"

    async def test_get_category_not_found(self, client: AsyncClient) -> None:
        """Nonexistent category ID returns 404."""
        resp = await client.get("/v1/categories/999")
        assert resp.status_code == 404


class TestDeleteCategory:
    """Tests for DELETE /v1/categories/{id}."""

    async def test_delete_category(self, client: AsyncClient, session: AsyncSession) -> None:
        """Delete a category."""
        category = Category(name="temp")
        session.add(category)
        await session.commit()
        await session.refresh(category)

        resp = await client.delete(f"/v1/categories/{category.id}")
        assert resp.status_code == 204

        from sqlmodel import select

        result = await session.execute(select(Category).where(Category.id == category.id))
        assert result.scalar_one_or_none() is None

    async def test_delete_category_not_found(self, client: AsyncClient) -> None:
        """Delete nonexistent category returns 404."""
        resp = await client.delete("/v1/categories/999")
        assert resp.status_code == 404


class TestCategoryItemAssociation:
    """Tests for category-item relationships via API."""

    async def test_item_shows_categories(self, client: AsyncClient, session: AsyncSession) -> None:
        """Item response includes associated categories."""
        item = Item(raw_text="hello")
        category = Category(name="greeting")
        session.add_all([item, category])
        await session.commit()

        link = ItemCategory(item_id=item.id, category_id=category.id)
        session.add(link)
        await session.commit()

        resp = await client.get(f"/v1/items/{item.id}")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data.get("categories", [])) == 1
        assert data["categories"][0]["name"] == "greeting"
