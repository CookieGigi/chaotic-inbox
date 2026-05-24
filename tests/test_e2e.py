"""End-to-end tests for all Inbox API endpoints.

These tests exercise every endpoint with multiple configurations and edge cases
to catch the gaps left by narrower unit tests.
"""

from datetime import UTC, datetime
from uuid import uuid4

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from inbox.models import Category, Item, ItemCategory, ItemTag, Tag

# ---------------------------------------------------------------------------
# Items
# ---------------------------------------------------------------------------


class TestCreateItem:
    """POST /v1/items — comprehensive create scenarios."""

    async def test_create_text_item(self, client: AsyncClient) -> None:
        resp = await client.post("/v1/items", json={"raw_text": "hello world"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["type"] == "text"
        assert data["raw_text"] == "hello world"
        assert data["capture_meta"] == {}
        assert data["enrichment"] == {}
        assert data["tags"] == []
        assert data["categories"] == []

    async def test_create_url_item(self, client: AsyncClient) -> None:
        resp = await client.post("/v1/items", json={"raw_text": "https://example.com"})
        assert resp.status_code == 201
        assert resp.json()["type"] == "url"

    async def test_create_with_explicit_type(self, client: AsyncClient) -> None:
        resp = await client.post("/v1/items", json={"raw_text": "hello", "type": "file"})
        assert resp.status_code == 201
        assert resp.json()["type"] == "file"

    async def test_create_with_capture_meta(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/v1/items",
            json={"raw_text": "note", "capture_meta": {"source": "cli"}},
        )
        assert resp.status_code == 201
        assert resp.json()["capture_meta"]["source"] == "cli"

    async def test_create_with_existing_tags(self, client: AsyncClient) -> None:
        await client.post("/v1/tags", json={"name": "important"})
        resp = await client.post(
            "/v1/items",
            json={"raw_text": "hello", "tag_names": ["important"]},
        )
        assert resp.status_code == 201
        tags = resp.json()["tags"]
        assert len(tags) == 1
        assert tags[0]["name"] == "important"

    async def test_create_with_existing_categories(self, client: AsyncClient) -> None:
        await client.post("/v1/categories", json={"name": "notes"})
        resp = await client.post(
            "/v1/items",
            json={"raw_text": "hello", "category_names": ["notes"]},
        )
        assert resp.status_code == 201
        categories = resp.json()["categories"]
        assert len(categories) == 1
        assert categories[0]["name"] == "notes"

    async def test_create_with_nonexistent_tag_returns_422(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/v1/items",
            json={"raw_text": "hello", "tag_names": ["missing"]},
        )
        assert resp.status_code == 422
        assert "missing" in resp.text

    async def test_create_with_nonexistent_category_returns_422(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/v1/items",
            json={"raw_text": "hello", "category_names": ["missing"]},
        )
        assert resp.status_code == 422
        assert "missing" in resp.text

    async def test_create_with_empty_tag_name_returns_422(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/v1/items",
            json={"raw_text": "hello", "tag_names": [""]},
        )
        assert resp.status_code == 422

    async def test_create_with_empty_category_name_returns_422(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/v1/items",
            json={"raw_text": "hello", "category_names": [""]},
        )
        assert resp.status_code == 422

    async def test_create_requires_content(self, client: AsyncClient) -> None:
        resp = await client.post("/v1/items", json={})
        assert resp.status_code == 422

    async def test_create_rejects_unknown_fields(self, client: AsyncClient) -> None:
        resp = await client.post("/v1/items", json={"raw_text": "x", "unknown_field": 1})
        assert resp.status_code == 422

    async def test_create_with_empty_raw_text(self, client: AsyncClient) -> None:
        resp = await client.post("/v1/items", json={"raw_text": ""})
        assert resp.status_code == 422


class TestListItems:
    """GET /v1/items — list with filters and pagination."""

    async def test_list_empty(self, client: AsyncClient) -> None:
        resp = await client.get("/v1/items")
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_list_default_order_newest_first(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        session.add_all([Item(raw_text="first"), Item(raw_text="second")])
        await session.commit()
        resp = await client.get("/v1/items")
        data = resp.json()
        assert data[0]["raw_text"] == "second"
        assert data[1]["raw_text"] == "first"

    async def test_list_pagination(self, client: AsyncClient, session: AsyncSession) -> None:
        for i in range(5):
            session.add(Item(raw_text=f"item {i}"))
        await session.commit()
        resp = await client.get("/v1/items?limit=2&offset=1")
        data = resp.json()
        assert len(data) == 2

    async def test_list_type_filter(self, client: AsyncClient, session: AsyncSession) -> None:
        session.add_all([Item(raw_text="https://a.com"), Item(raw_text="plain")])
        await session.commit()
        resp = await client.get("/v1/items?type=url")
        data = resp.json()
        assert len(data) == 1
        assert data[0]["type"] == "url"

    async def test_list_type_filter_no_match(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        session.add(Item(raw_text="text"))
        await session.commit()
        resp = await client.get("/v1/items?type=image")
        assert resp.json() == []

    async def test_list_excludes_deleted(self, client: AsyncClient, session: AsyncSession) -> None:
        active = Item(raw_text="active")
        deleted = Item(raw_text="deleted")
        session.add_all([active, deleted])
        await session.commit()
        deleted.deleted_at = datetime.now(UTC)
        await session.commit()
        resp = await client.get("/v1/items")
        assert len(resp.json()) == 1

    async def test_list_invalid_limit_low(self, client: AsyncClient) -> None:
        resp = await client.get("/v1/items?limit=0")
        assert resp.status_code == 422

    async def test_list_invalid_limit_high(self, client: AsyncClient) -> None:
        resp = await client.get("/v1/items?limit=101")
        assert resp.status_code == 422

    async def test_list_invalid_offset(self, client: AsyncClient) -> None:
        resp = await client.get("/v1/items?offset=-1")
        assert resp.status_code == 422


class TestGetItem:
    """GET /v1/items/{id} — retrieve single item."""

    async def test_get_item(self, client: AsyncClient, session: AsyncSession) -> None:
        item = Item(raw_text="hello")
        session.add(item)
        await session.commit()
        await session.refresh(item)
        resp = await client.get(f"/v1/items/{item.id}")
        assert resp.status_code == 200
        assert resp.json()["raw_text"] == "hello"

    async def test_get_item_includes_tags_and_categories(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        item = Item(raw_text="hello")
        tag = Tag(name="greeting")
        category = Category(name="general")
        session.add_all([item, tag, category])
        await session.commit()
        link_tag = ItemTag(item_id=item.id, tag_id=tag.id)
        link_cat = ItemCategory(item_id=item.id, category_id=category.id)
        session.add_all([link_tag, link_cat])
        await session.commit()

        resp = await client.get(f"/v1/items/{item.id}")
        data = resp.json()
        assert len(data["tags"]) == 1
        assert data["tags"][0]["name"] == "greeting"
        assert len(data["categories"]) == 1
        assert data["categories"][0]["name"] == "general"

    async def test_get_not_found(self, client: AsyncClient) -> None:
        resp = await client.get(f"/v1/items/{uuid4()}")
        assert resp.status_code == 404

    async def test_get_invalid_uuid(self, client: AsyncClient) -> None:
        resp = await client.get("/v1/items/not-a-uuid")
        assert resp.status_code == 422

    async def test_get_deleted_returns_404(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        item = Item(raw_text="gone")
        session.add(item)
        await session.commit()
        item.deleted_at = datetime.now(UTC)
        await session.commit()
        resp = await client.get(f"/v1/items/{item.id}")
        assert resp.status_code == 404


class TestUpdateItem:
    """PATCH /v1/items/{id} — partial updates."""

    async def test_update_capture_meta(self, client: AsyncClient, session: AsyncSession) -> None:
        item = Item(raw_text="hello")
        session.add(item)
        await session.commit()
        await session.refresh(item)
        resp = await client.patch(f"/v1/items/{item.id}", json={"capture_meta": {"source": "cli"}})
        assert resp.status_code == 200
        assert resp.json()["capture_meta"]["source"] == "cli"

    async def test_update_enrichment(self, client: AsyncClient, session: AsyncSession) -> None:
        item = Item(raw_text="hello")
        session.add(item)
        await session.commit()
        await session.refresh(item)
        resp = await client.patch(f"/v1/items/{item.id}", json={"enrichment": {"title": "T"}})
        assert resp.status_code == 200
        assert resp.json()["enrichment"]["title"] == "T"

    async def test_update_replaces_tags(self, client: AsyncClient, session: AsyncSession) -> None:
        item = Item(raw_text="hello")
        tag1 = Tag(name="old")
        session.add_all([item, tag1])
        await session.commit()
        link = ItemTag(item_id=item.id, tag_id=tag1.id)
        session.add(link)
        await session.commit()

        tag2 = Tag(name="new")
        session.add(tag2)
        await session.commit()

        resp = await client.patch(f"/v1/items/{item.id}", json={"tag_names": ["new"]})
        assert resp.status_code == 200
        tags = resp.json()["tags"]
        assert len(tags) == 1
        assert tags[0]["name"] == "new"

    async def test_update_clears_tags(self, client: AsyncClient, session: AsyncSession) -> None:
        item = Item(raw_text="hello")
        tag = Tag(name="t")
        session.add_all([item, tag])
        await session.commit()
        session.add(ItemTag(item_id=item.id, tag_id=tag.id))
        await session.commit()

        resp = await client.patch(f"/v1/items/{item.id}", json={"tag_names": []})
        assert resp.status_code == 200
        assert resp.json()["tags"] == []

    async def test_update_rejects_raw_text(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        item = Item(raw_text="hello")
        session.add(item)
        await session.commit()
        await session.refresh(item)
        resp = await client.patch(f"/v1/items/{item.id}", json={"raw_text": "changed"})
        assert resp.status_code == 422

    async def test_update_rejects_type(self, client: AsyncClient, session: AsyncSession) -> None:
        item = Item(raw_text="hello")
        session.add(item)
        await session.commit()
        await session.refresh(item)
        resp = await client.patch(f"/v1/items/{item.id}", json={"type": "url"})
        assert resp.status_code == 422

    async def test_update_rejects_unknown_fields(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        item = Item(raw_text="hello")
        session.add(item)
        await session.commit()
        await session.refresh(item)
        resp = await client.patch(f"/v1/items/{item.id}", json={"bad_field": 1})
        assert resp.status_code == 422

    async def test_update_not_found(self, client: AsyncClient) -> None:
        resp = await client.patch(f"/v1/items/{uuid4()}", json={"capture_meta": {}})
        assert resp.status_code == 404

    async def test_update_empty_body(self, client: AsyncClient, session: AsyncSession) -> None:
        item = Item(raw_text="hello")
        session.add(item)
        await session.commit()
        await session.refresh(item)
        resp = await client.patch(f"/v1/items/{item.id}", json={})
        assert resp.status_code == 200
        data = resp.json()
        assert data["raw_text"] == "hello"


class TestDeleteItem:
    """DELETE /v1/items/{id} — soft delete."""

    async def test_soft_delete(self, client: AsyncClient, session: AsyncSession) -> None:
        item = Item(raw_text="to delete")
        session.add(item)
        await session.commit()
        await session.refresh(item)
        resp = await client.delete(f"/v1/items/{item.id}")
        assert resp.status_code == 204
        await session.refresh(item)
        assert item.deleted_at is not None

    async def test_delete_not_found(self, client: AsyncClient) -> None:
        resp = await client.delete(f"/v1/items/{uuid4()}")
        assert resp.status_code == 404

    async def test_delete_already_deleted(self, client: AsyncClient, session: AsyncSession) -> None:
        item = Item(raw_text="gone")
        item.deleted_at = datetime.now(UTC)
        session.add(item)
        await session.commit()
        resp = await client.delete(f"/v1/items/{item.id}")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Tags
# ---------------------------------------------------------------------------


class TestCreateTag:
    """POST /v1/tags."""

    async def test_create_tag(self, client: AsyncClient) -> None:
        resp = await client.post("/v1/tags", json={"name": "python"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "python"
        assert data["auto_generated"] is False

    async def test_create_duplicate_returns_409(self, client: AsyncClient) -> None:
        await client.post("/v1/tags", json={"name": "python"})
        resp = await client.post("/v1/tags", json={"name": "python"})
        assert resp.status_code == 409

    async def test_create_empty_name_returns_422(self, client: AsyncClient) -> None:
        resp = await client.post("/v1/tags", json={"name": ""})
        assert resp.status_code == 422

    async def test_create_missing_name_returns_422(self, client: AsyncClient) -> None:
        resp = await client.post("/v1/tags", json={})
        assert resp.status_code == 422


class TestListTags:
    """GET /v1/tags."""

    async def test_list_ordered_by_name(self, client: AsyncClient, session: AsyncSession) -> None:
        session.add_all([Tag(name="zebra"), Tag(name="alpha")])
        await session.commit()
        resp = await client.get("/v1/tags")
        data = resp.json()
        assert data[0]["name"] == "alpha"
        assert data[1]["name"] == "zebra"


class TestGetTag:
    """GET /v1/tags/{id}."""

    async def test_get_tag(self, client: AsyncClient, session: AsyncSession) -> None:
        tag = Tag(name="python")
        session.add(tag)
        await session.commit()
        await session.refresh(tag)
        resp = await client.get(f"/v1/tags/{tag.id}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "python"

    async def test_get_not_found(self, client: AsyncClient) -> None:
        resp = await client.get("/v1/tags/999")
        assert resp.status_code == 404

    async def test_get_invalid_id(self, client: AsyncClient) -> None:
        resp = await client.get("/v1/tags/abc")
        assert resp.status_code == 422


class TestDeleteTag:
    """DELETE /v1/tags/{id}."""

    async def test_delete_tag(self, client: AsyncClient, session: AsyncSession) -> None:
        tag = Tag(name="temp")
        session.add(tag)
        await session.commit()
        await session.refresh(tag)
        resp = await client.delete(f"/v1/tags/{tag.id}")
        assert resp.status_code == 204
        result = await session.execute(select(Tag).where(Tag.id == tag.id))
        assert result.scalar_one_or_none() is None

    async def test_delete_not_found(self, client: AsyncClient) -> None:
        resp = await client.delete("/v1/tags/999")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Categories
# ---------------------------------------------------------------------------


class TestCreateCategory:
    """POST /v1/categories."""

    async def test_create_category(self, client: AsyncClient) -> None:
        resp = await client.post("/v1/categories", json={"name": "notes"})
        assert resp.status_code == 201
        assert resp.json()["name"] == "notes"

    async def test_create_with_description(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/v1/categories",
            json={"name": "notes", "description": "General notes"},
        )
        assert resp.status_code == 201
        assert resp.json()["description"] == "General notes"

    async def test_create_duplicate_returns_409(self, client: AsyncClient) -> None:
        await client.post("/v1/categories", json={"name": "notes"})
        resp = await client.post("/v1/categories", json={"name": "notes"})
        assert resp.status_code == 409

    async def test_create_empty_name_returns_422(self, client: AsyncClient) -> None:
        resp = await client.post("/v1/categories", json={"name": ""})
        assert resp.status_code == 422

    async def test_create_missing_name_returns_422(self, client: AsyncClient) -> None:
        resp = await client.post("/v1/categories", json={})
        assert resp.status_code == 422


class TestListCategories:
    """GET /v1/categories."""

    async def test_list_ordered_by_name(self, client: AsyncClient, session: AsyncSession) -> None:
        session.add_all([Category(name="zebra"), Category(name="alpha")])
        await session.commit()
        resp = await client.get("/v1/categories")
        data = resp.json()
        assert data[0]["name"] == "alpha"
        assert data[1]["name"] == "zebra"


class TestGetCategory:
    """GET /v1/categories/{id}."""

    async def test_get_category(self, client: AsyncClient, session: AsyncSession) -> None:
        category = Category(name="notes")
        session.add(category)
        await session.commit()
        await session.refresh(category)
        resp = await client.get(f"/v1/categories/{category.id}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "notes"

    async def test_get_not_found(self, client: AsyncClient) -> None:
        resp = await client.get("/v1/categories/999")
        assert resp.status_code == 404


class TestDeleteCategory:
    """DELETE /v1/categories/{id}."""

    async def test_delete_category(self, client: AsyncClient, session: AsyncSession) -> None:
        category = Category(name="temp")
        session.add(category)
        await session.commit()
        await session.refresh(category)
        resp = await client.delete(f"/v1/categories/{category.id}")
        assert resp.status_code == 204
        result = await session.execute(select(Category).where(Category.id == category.id))
        assert result.scalar_one_or_none() is None

    async def test_delete_not_found(self, client: AsyncClient) -> None:
        resp = await client.delete("/v1/categories/999")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------


class TestSearchItems:
    """GET /v1/search."""

    async def test_search_returns_matches(self, client: AsyncClient, session: AsyncSession) -> None:
        session.add_all([Item(raw_text="hello world"), Item(raw_text="goodbye")])
        await session.commit()
        resp = await client.get("/v1/search?q=hello")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["items"][0]["raw_text"] == "hello world"

    async def test_search_no_results(self, client: AsyncClient, session: AsyncSession) -> None:
        session.add(Item(raw_text="hello"))
        await session.commit()
        resp = await client.get("/v1/search?q=xyz")
        assert resp.json()["total"] == 0

    async def test_search_empty_query(self, client: AsyncClient) -> None:
        resp = await client.get("/v1/search?q=")
        assert resp.status_code == 422

    async def test_search_missing_query(self, client: AsyncClient) -> None:
        resp = await client.get("/v1/search")
        assert resp.status_code == 422

    async def test_search_with_type_filter(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        session.add_all([Item(raw_text="https://example.com"), Item(raw_text="hello")])
        await session.commit()
        resp = await client.get("/v1/search?q=e&type=url")
        data = resp.json()
        assert data["total"] == 1
        assert data["items"][0]["type"] == "url"

    async def test_search_respects_limit(self, client: AsyncClient, session: AsyncSession) -> None:
        for i in range(10):
            session.add(Item(raw_text=f"item {i}"))
        await session.commit()
        resp = await client.get("/v1/search?q=item&limit=3")
        assert resp.json()["total"] == 3

    async def test_search_invalid_limit(self, client: AsyncClient) -> None:
        resp = await client.get("/v1/search?q=test&limit=0")
        assert resp.status_code == 422

    async def test_search_excludes_deleted(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        active = Item(raw_text="active hello")
        deleted = Item(raw_text="deleted hello")
        session.add_all([active, deleted])
        await session.commit()
        deleted.deleted_at = datetime.now(UTC)
        await session.commit()
        resp = await client.get("/v1/search?q=hello")
        assert resp.json()["total"] == 1

    async def test_search_escapes_wildcards(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        """Ensure % and _ are treated as literal characters, not SQL wildcards."""
        session.add_all(
            [
                Item(raw_text="100% complete"),
                Item(raw_text="hello_world"),
                Item(raw_text="regular text"),
            ]
        )
        await session.commit()

        # '%' should NOT match everything
        resp = await client.get("/v1/search?q=%25")
        data = resp.json()
        assert data["total"] == 1
        assert data["items"][0]["raw_text"] == "100% complete"

        # '_' should NOT match any single character
        resp2 = await client.get("/v1/search?q=_")
        data2 = resp2.json()
        assert data2["total"] == 1
        assert data2["items"][0]["raw_text"] == "hello_world"


class TestSimilarItems:
    """POST /v1/search/similar."""

    async def test_similar_placeholder(self, client: AsyncClient) -> None:
        resp = await client.post("/v1/search/similar", json={"item_id": "abc"})
        assert resp.status_code == 200
        assert resp.json()["total"] == 0


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------


class TestGetStats:
    """GET /v1/stats."""

    async def test_empty_stats(self, client: AsyncClient) -> None:
        resp = await client.get("/v1/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_items"] == 0
        assert data["by_type"] == {}
        assert data["total_tags"] == 0
        assert data["total_categories"] == 0

    async def test_counts(self, client: AsyncClient, session: AsyncSession) -> None:
        session.add_all(
            [
                Item(raw_text="t1"),
                Item(raw_text="t2"),
                Item(raw_text="https://a.com"),
                Tag(name="a"),
                Category(name="c"),
            ]
        )
        await session.commit()
        resp = await client.get("/v1/stats")
        data = resp.json()
        assert data["total_items"] == 3
        assert data["by_type"]["text"] == 2
        assert data["by_type"]["url"] == 1
        assert data["total_tags"] == 1
        assert data["total_categories"] == 1

    async def test_excludes_deleted(self, client: AsyncClient, session: AsyncSession) -> None:
        active = Item(raw_text="active")
        deleted = Item(raw_text="deleted")
        session.add_all([active, deleted])
        await session.commit()
        deleted.deleted_at = datetime.now(UTC)
        await session.commit()
        resp = await client.get("/v1/stats")
        assert resp.json()["total_items"] == 1


# ---------------------------------------------------------------------------
# Full workflow
# ---------------------------------------------------------------------------


class TestFullWorkflow:
    """End-to-end usage scenarios."""

    async def test_capture_tag_search_delete(self, client: AsyncClient) -> None:
        """A realistic user workflow."""
        # Create tags
        await client.post("/v1/tags", json={"name": "work"})
        await client.post("/v1/tags", json={"name": "personal"})

        # Create category
        await client.post("/v1/categories", json={"name": "ideas"})

        # Capture items
        resp = await client.post(
            "/v1/items",
            json={
                "raw_text": "Meeting notes from standup",
                "tag_names": ["work"],
                "category_names": ["ideas"],
            },
        )
        assert resp.status_code == 201
        item_id = resp.json()["id"]

        # Search
        resp = await client.get("/v1/search?q=meeting")
        assert resp.json()["total"] == 1

        # Update tags
        resp = await client.patch(f"/v1/items/{item_id}", json={"tag_names": ["work", "personal"]})
        assert resp.status_code == 200
        assert len(resp.json()["tags"]) == 2

        # List filtered
        resp = await client.get("/v1/items?type=text")
        assert len(resp.json()) == 1

        # Stats
        resp = await client.get("/v1/stats")
        data = resp.json()
        assert data["total_items"] == 1
        assert data["total_tags"] == 2

        # Delete
        resp = await client.delete(f"/v1/items/{item_id}")
        assert resp.status_code == 204

        # Verify gone from list
        resp = await client.get("/v1/items")
        assert resp.json() == []

        # Verify gone from search
        resp = await client.get("/v1/search?q=meeting")
        assert resp.json()["total"] == 0

        # Stats reflect deletion
        resp = await client.get("/v1/stats")
        assert resp.json()["total_items"] == 0

    async def test_cannot_reference_missing_resources(self, client: AsyncClient) -> None:
        """Creating items with missing tags or categories fails fast."""
        resp = await client.post(
            "/v1/items",
            json={
                "raw_text": "orphan",
                "tag_names": ["missing_tag"],
                "category_names": ["missing_cat"],
            },
        )
        assert resp.status_code == 422
        body = resp.json()
        assert "missing_tag" in str(body) or "missing_cat" in str(body)
