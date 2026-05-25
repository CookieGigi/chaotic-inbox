"""Unit tests for domain schemas, exceptions, config, and pure functions."""

from datetime import UTC, datetime
from unittest.mock import (
    AsyncMock,
    MagicMock,
    patch,
)

import pytest

from inbox.config import Settings
from inbox.models import Category, Item, Tag
from inbox.server.exceptions import (
    ConflictError,
    InboxError,
    NotFoundError,
    ValidationError,
)
from inbox.server.routers.items import (
    _item_response,
    _resolve_categories,
    _resolve_tags,
)
from inbox.server.schemas import (
    CategoryCreate,
    ItemCreate,
    ItemUpdate,
    TagCreate,
)

# ---------------------------------------------------------------------------
# Schema validation
# ---------------------------------------------------------------------------


class TestItemCreate:
    """Tests for ItemCreate request schema."""

    def test_valid_with_raw_text(self) -> None:
        """ItemCreate accepts raw_text alone."""
        data = ItemCreate(raw_text="hello")
        assert data.raw_text == "hello"

    def test_valid_with_blob_path(self) -> None:
        """ItemCreate accepts blob_path alone."""
        data = ItemCreate(blob_path="/path/to/file.pdf")
        assert data.blob_path == "/path/to/file.pdf"

    def test_valid_with_both(self) -> None:
        """ItemCreate accepts both raw_text and blob_path."""
        data = ItemCreate(raw_text="hello", blob_path="/path")
        assert data.raw_text == "hello"
        assert data.blob_path == "/path"

    def test_rejects_neither_raw_text_nor_blob_path(self) -> None:
        """ItemCreate requires at least one content field."""
        with pytest.raises(ValueError, match="raw_text or blob_path"):
            ItemCreate()

    def test_rejects_empty_tag_names(self) -> None:
        """ItemCreate rejects empty strings in tag_names."""
        with pytest.raises(ValueError, match="tag_names"):
            ItemCreate(raw_text="hello", tag_names=["valid", ""])

    def test_rejects_whitespace_only_tag_names(self) -> None:
        """ItemCreate rejects whitespace-only strings in tag_names."""
        with pytest.raises(ValueError, match="tag_names"):
            ItemCreate(raw_text="hello", tag_names=["  "])

    def test_rejects_empty_category_names(self) -> None:
        """ItemCreate rejects empty strings in category_names."""
        with pytest.raises(ValueError, match="category_names"):
            ItemCreate(raw_text="hello", category_names=[""])

    def test_rejects_unknown_fields(self) -> None:
        """ItemCreate rejects extra fields."""
        with pytest.raises(ValueError):
            ItemCreate(raw_text="hello", unknown_field=True)

    def test_tag_names_and_category_names_optional(self) -> None:
        """ItemCreate works without tag_names or category_names."""
        data = ItemCreate(raw_text="hello")
        assert data.tag_names is None
        assert data.category_names is None


class TestItemUpdate:
    """Tests for ItemUpdate request schema."""

    def test_empty_update_allowed(self) -> None:
        """ItemUpdate with no fields is valid (no-op)."""
        data = ItemUpdate()
        assert data.capture_meta is None
        assert data.enrichment is None

    def test_partial_update(self) -> None:
        """ItemUpdate accepts partial fields."""
        data = ItemUpdate(capture_meta={"source": "cli"})
        assert data.capture_meta == {"source": "cli"}

    def test_rejects_unknown_fields(self) -> None:
        """ItemUpdate rejects extra fields."""
        with pytest.raises(ValueError):
            ItemUpdate(raw_text="not allowed")


class TestTagCreate:
    """Tests for TagCreate request schema."""

    def test_valid_name(self) -> None:
        """TagCreate accepts a non-empty name."""
        data = TagCreate(name="python")
        assert data.name == "python"

    def test_rejects_empty_name(self) -> None:
        """TagCreate rejects empty string."""
        with pytest.raises(ValueError):
            TagCreate(name="")


class TestCategoryCreate:
    """Tests for CategoryCreate request schema."""

    def test_valid_name_and_description(self) -> None:
        """CategoryCreate accepts name with optional description."""
        data = CategoryCreate(name="notes", description="General notes")
        assert data.name == "notes"
        assert data.description == "General notes"

    def test_rejects_empty_name(self) -> None:
        """CategoryCreate rejects empty string."""
        with pytest.raises(ValueError):
            CategoryCreate(name="")

    def test_description_optional(self) -> None:
        """CategoryCreate works without description."""
        data = CategoryCreate(name="notes")
        assert data.description is None


# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------


class TestInboxExceptions:
    """Tests for custom exception hierarchy."""

    def test_base_error_has_message_and_code(self) -> None:
        """InboxError stores message and code."""
        exc = InboxError("something went wrong", code="custom")
        assert exc.message == "something went wrong"
        assert exc.code == "custom"
        assert str(exc) == "something went wrong"

    def test_not_found_error_defaults(self) -> None:
        """NotFoundError has sensible defaults."""
        exc = NotFoundError()
        assert exc.message == "Not found"
        assert exc.code == "not_found"

    def test_not_found_error_custom_message(self) -> None:
        """NotFoundError accepts custom message."""
        exc = NotFoundError("Item 123 not found")
        assert exc.message == "Item 123 not found"

    def test_validation_error_defaults(self) -> None:
        """ValidationError has sensible defaults."""
        exc = ValidationError()
        assert exc.message == "Validation error"
        assert exc.code == "validation_error"

    def test_conflict_error_defaults(self) -> None:
        """ConflictError has sensible defaults."""
        exc = ConflictError()
        assert exc.message == "Conflict"
        assert exc.code == "conflict"

    def test_exception_is_catchable_as_base(self) -> None:
        """All errors can be caught as InboxError."""
        errors = [
            NotFoundError("x"),
            ValidationError("x"),
            ConflictError("x"),
        ]
        for exc in errors:
            with pytest.raises(InboxError):
                raise exc


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------


class TestSettings:
    """Tests for Settings configuration."""

    def test_default_database_url(self) -> None:
        """Settings has a default database URL."""
        settings = Settings()
        assert "postgresql" in settings.database_url

    def test_default_bind_address(self) -> None:
        """Settings defaults to 0.0.0.0:8080."""
        settings = Settings()
        assert settings.bind_address == "0.0.0.0:8080"

    def test_host_property(self) -> None:
        """host property extracts IP from bind_address."""
        settings = Settings()
        assert settings.host == "0.0.0.0"

    def test_port_property(self) -> None:
        """port property extracts port from bind_address."""
        settings = Settings()
        assert settings.port == 8080

    def test_custom_bind_address(self) -> None:
        """host/port work with custom bind_address."""
        settings = Settings(bind_address="127.0.0.1:3000")
        assert settings.host == "127.0.0.1"
        assert settings.port == 3000

    def test_env_prefix(self) -> None:
        """Settings loads with INBOX_ env prefix."""
        with patch.dict("os.environ", {"INBOX_LOG_LEVEL": "DEBUG"}, clear=False):
            settings = Settings()
            assert settings.log_level == "DEBUG"


# ---------------------------------------------------------------------------
# Pure domain functions (response serialization)
# ---------------------------------------------------------------------------


class TestItemResponseSerialization:
    """Tests for _item_response pure function."""

    def _make_item(
        self,
        raw_text: str = "hello",
        item_type: str = "text",
        tags: list[Tag] | None = None,
        categories: list[Category] | None = None,
    ) -> Item:
        """Build a minimal Item with mocked relationships."""
        item = Item(raw_text=raw_text, type=item_type)
        mock_id = MagicMock()
        mock_id.__str__ = MagicMock(return_value="test-uuid")
        object.__setattr__(item, "id", mock_id)
        object.__setattr__(item, "captured_at", datetime(2026, 1, 1, 12, 0, 0, tzinfo=UTC))
        object.__setattr__(item, "updated_at", datetime(2026, 1, 1, 12, 0, 0, tzinfo=UTC))
        object.__setattr__(item, "deleted_at", None)
        object.__setattr__(item, "capture_meta", {"source": "test"})
        object.__setattr__(item, "enrichment", {"summary": "test summary"})
        object.__setattr__(item, "tags", tags or [])
        object.__setattr__(item, "categories", categories or [])
        return item

    def test_basic_fields(self) -> None:
        """_item_response maps basic fields correctly."""
        item = self._make_item(raw_text="hello world", item_type="text")
        resp = _item_response(item)
        assert resp.id == "test-uuid"
        assert resp.type == "text"
        assert resp.raw_text == "hello world"
        assert resp.capture_meta == {"source": "test"}
        assert resp.enrichment == {"summary": "test summary"}
        assert resp.deleted_at is None

    def test_empty_tags_and_categories(self) -> None:
        """_item_response handles empty relationships."""
        item = self._make_item()
        resp = _item_response(item)
        assert resp.tags == []
        assert resp.categories == []

    def test_with_tags(self) -> None:
        """_item_response serializes tags."""
        tag = Tag(name="python")
        object.__setattr__(tag, "id", 1)
        object.__setattr__(tag, "auto_generated", False)
        object.__setattr__(tag, "created_at", datetime(2026, 1, 1, 12, 0, 0, tzinfo=UTC))
        item = self._make_item(tags=[tag])
        resp = _item_response(item)
        assert len(resp.tags) == 1
        assert resp.tags[0].name == "python"
        assert resp.tags[0].id == 1

    def test_with_categories(self) -> None:
        """_item_response serializes categories."""
        cat = Category(name="notes", description="General")
        object.__setattr__(cat, "id", 1)
        object.__setattr__(cat, "created_at", datetime(2026, 1, 1, 12, 0, 0, tzinfo=UTC))
        item = self._make_item(categories=[cat])
        resp = _item_response(item)
        assert len(resp.categories) == 1
        assert resp.categories[0].name == "notes"
        assert resp.categories[0].description == "General"

    def test_none_meta_defaults_to_empty_dict(self) -> None:
        """_item_response coerces None capture_meta to {}."""
        item = self._make_item()
        object.__setattr__(item, "capture_meta", None)
        object.__setattr__(item, "enrichment", None)
        resp = _item_response(item)
        assert resp.capture_meta == {}
        assert resp.enrichment == {}

    def test_deleted_item(self) -> None:
        """_item_response preserves deleted_at timestamp."""
        deleted_at = datetime(2026, 1, 2, 12, 0, 0, tzinfo=UTC)
        item = self._make_item()
        item.deleted_at = deleted_at
        resp = _item_response(item)
        assert resp.deleted_at == deleted_at


# ---------------------------------------------------------------------------
# Async domain helpers (require mocked session)
# ---------------------------------------------------------------------------


class TestResolveTags:
    """Tests for _resolve_tags helper."""

    @pytest.mark.asyncio
    async def test_empty_names_returns_empty(self) -> None:
        """_resolve_tags with no names returns empty list."""
        session = MagicMock()
        result = await _resolve_tags(session, None)
        assert result == []
        session.execute.assert_not_called()

    @pytest.mark.asyncio
    async def test_resolves_existing_tags(self) -> None:
        """_resolve_tags returns matching tags in order."""
        tag_a = MagicMock(spec=Tag, name="tag_a")
        tag_a.name = "python"
        tag_b = MagicMock(spec=Tag, name="tag_b")
        tag_b.name = "rust"

        result_mock = MagicMock()
        result_mock.scalars.return_value.all.return_value = [tag_a, tag_b]
        session = MagicMock()
        session.execute = AsyncMock(return_value=result_mock)

        result = await _resolve_tags(session, ["python", "rust"])
        assert len(result) == 2
        assert result[0].name == "python"
        assert result[1].name == "rust"

    @pytest.mark.asyncio
    async def test_missing_tags_raises_validation_error(self) -> None:
        """_resolve_tags raises ValidationError for missing tags."""
        tag = MagicMock(spec=Tag)
        tag.name = "python"

        result_mock = MagicMock()
        result_mock.scalars.return_value.all.return_value = [tag]
        session = MagicMock()
        session.execute = AsyncMock(return_value=result_mock)

        with pytest.raises(ValidationError, match="missing"):
            await _resolve_tags(session, ["python", "missing"])


class TestResolveCategories:
    """Tests for _resolve_categories helper."""

    @pytest.mark.asyncio
    async def test_empty_names_returns_empty(self) -> None:
        """_resolve_categories with no names returns empty list."""
        session = MagicMock()
        result = await _resolve_categories(session, None)
        assert result == []
        session.execute.assert_not_called()

    @pytest.mark.asyncio
    async def test_missing_categories_raises_validation_error(self) -> None:
        """_resolve_categories raises ValidationError for missing categories."""
        cat = MagicMock(spec=Category)
        cat.name = "notes"

        result_mock = MagicMock()
        result_mock.scalars.return_value.all.return_value = [cat]
        session = MagicMock()
        session.execute = AsyncMock(return_value=result_mock)

        with pytest.raises(ValidationError, match="missing"):
            await _resolve_categories(session, ["notes", "missing"])
