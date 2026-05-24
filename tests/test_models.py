"""Tests for SQLModel domain validation and relationships."""

from sqlalchemy.ext.asyncio import AsyncSession

from inbox.models import Category, Item, ItemCategory, ItemTag, Tag


class TestItemValidation:
    """Tests for Item model validators."""

    def test_type_auto_detect_text(self) -> None:
        """Plain text raw_text defaults to type 'text'."""
        item = Item(raw_text="hello world")
        assert item.type == "text"

    def test_type_auto_detect_url(self) -> None:
        """URL raw_text auto-detects type 'url'."""
        item = Item(raw_text="https://example.com")
        assert item.type == "url"

    def test_type_auto_detect_http_url(self) -> None:
        """HTTP URL also auto-detects type 'url'."""
        item = Item(raw_text="http://example.com")
        assert item.type == "url"

    def test_explicit_type_overrides_detection(self) -> None:
        """Providing an explicit type skips auto-detection."""
        item = Item(raw_text="hello", type="file")
        assert item.type == "file"

    def test_allows_empty_init(self) -> None:
        """Item() without args is allowed at the ORM level; API schema validates content."""
        item = Item()
        assert item.type == "text"

    def test_blob_path_alone_is_valid(self) -> None:
        """Item with only blob_path is valid."""
        item = Item(blob_path="/path/to/file.pdf")
        assert item.type == "text"  # default when no raw_text
        assert item.blob_path == "/path/to/file.pdf"

    def test_raw_text_and_blob_path_both_present(self) -> None:
        """Item with both fields is valid."""
        item = Item(raw_text="hello", blob_path="/path")
        assert item.raw_text == "hello"
        assert item.blob_path == "/path"

    def test_capture_meta_defaults_to_empty_dict(self) -> None:
        """capture_meta defaults to empty dict."""
        item = Item(raw_text="hello")
        assert item.capture_meta == {}

    def test_enrichment_defaults_to_empty_dict(self) -> None:
        """enrichment defaults to empty dict."""
        item = Item(raw_text="hello")
        assert item.enrichment == {}


class TestItemPersistence:
    """Tests for Item CRUD via async session."""

    async def test_create_item(self, session: AsyncSession) -> None:
        """Item can be persisted and retrieved."""
        item = Item(raw_text="test content")
        session.add(item)
        await session.commit()
        await session.refresh(item)

        assert item.id is not None
        assert item.type == "text"
        assert item.captured_at is not None

    async def test_soft_delete(self, session: AsyncSession) -> None:
        """Soft delete sets deleted_at timestamp."""
        from datetime import UTC, datetime

        item = Item(raw_text="to delete")
        session.add(item)
        await session.commit()
        await session.refresh(item)

        item.deleted_at = datetime.now(UTC)
        await session.commit()
        await session.refresh(item)

        assert item.deleted_at is not None

    async def test_list_excludes_deleted(self, session: AsyncSession) -> None:
        """Query can filter out soft-deleted items."""
        from datetime import UTC, datetime

        active = Item(raw_text="active")
        deleted = Item(raw_text="deleted")
        session.add_all([active, deleted])
        await session.commit()

        deleted.deleted_at = datetime.now(UTC)
        await session.commit()

        from sqlmodel import select

        result = await session.execute(select(Item).where(Item.deleted_at.is_(None)))
        items = result.scalars().all()
        assert len(items) == 1
        assert items[0].raw_text == "active"


class TestTagPersistence:
    """Tests for Tag CRUD."""

    async def test_create_tag(self, session: AsyncSession) -> None:
        """Tag can be persisted and retrieved."""
        tag = Tag(name="python")
        session.add(tag)
        await session.commit()
        await session.refresh(tag)

        assert tag.id is not None
        assert tag.name == "python"
        assert tag.auto_generated is False

    async def test_tag_items_relationship(self, session: AsyncSession) -> None:
        """Item can be linked to a tag via junction table."""
        item = Item(raw_text="hello")
        tag = Tag(name="greeting")
        session.add_all([item, tag])
        await session.commit()
        await session.refresh(item)
        await session.refresh(tag)

        link = ItemTag(item_id=item.id, tag_id=tag.id)
        session.add(link)
        await session.commit()

        # Verify via query
        from sqlmodel import select

        result = await session.execute(select(Item).where(Item.id == item.id))
        result.scalar_one()
        # SQLModel lazy-loads relationships automatically in sync mode;
        # in async we need to eagerly load or access via separate query.
        tag_result = await session.execute(
            select(Tag).join(ItemTag).where(ItemTag.item_id == item.id)
        )
        linked_tags = tag_result.scalars().all()
        assert len(linked_tags) == 1
        assert linked_tags[0].name == "greeting"


class TestCategoryPersistence:
    """Tests for Category CRUD."""

    async def test_create_category(self, session: AsyncSession) -> None:
        """Category can be persisted."""
        category = Category(name="notes", description="General notes")
        session.add(category)
        await session.commit()
        await session.refresh(category)

        assert category.id is not None
        assert category.name == "notes"

    async def test_category_items_relationship(self, session: AsyncSession) -> None:
        """Item can be linked to a category."""
        item = Item(raw_text="hello")
        category = Category(name="greeting")
        session.add_all([item, category])
        await session.commit()

        link = ItemCategory(item_id=item.id, category_id=category.id)
        session.add(link)
        await session.commit()

        from sqlmodel import select

        result = await session.execute(
            select(Category).join(ItemCategory).where(ItemCategory.item_id == item.id)
        )
        linked = result.scalars().all()
        assert len(linked) == 1
        assert linked[0].name == "greeting"
