"""Tests for Inbox CLI HTTP client."""

from unittest.mock import MagicMock

import httpx
import pytest

from inbox.cli.client import InboxClient


@pytest.fixture
def client():
    """InboxClient with a mocked internal httpx client."""
    inbox_client = InboxClient(base_url="http://localhost:8080")
    inbox_client.client = MagicMock(spec=httpx.Client)
    return inbox_client


class TestCreateItem:
    """Tests for InboxClient.create_item."""

    def test_create_text(self, client: InboxClient) -> None:
        """Create item sends correct payload."""
        client.client.post.return_value = MagicMock(
            status_code=201,
            json=lambda: {"id": "abc", "type": "text"},
        )
        result = client.create_item(raw_text="hello")
        assert result["type"] == "text"
        call = client.client.post.call_args
        assert call[1]["json"]["raw_text"] == "hello"

    def test_create_url(self, client: InboxClient) -> None:
        """Create URL item."""
        client.client.post.return_value = MagicMock(
            status_code=201,
            json=lambda: {"id": "abc", "type": "url"},
        )
        result = client.create_item(raw_text="https://example.com")
        assert result["type"] == "url"

    def test_create_raises_on_error(self, client: InboxClient) -> None:
        """HTTP error raises exception."""
        client.client.post.return_value = MagicMock(
            status_code=422,
            raise_for_status=lambda: (_ for _ in ()).throw(
                httpx.HTTPStatusError(
                    "validation error",
                    request=MagicMock(),
                    response=MagicMock(status_code=422),
                )
            ),
        )
        with pytest.raises(httpx.HTTPStatusError):
            client.create_item(raw_text="hello")


class TestListItems:
    """Tests for InboxClient.list_items."""

    def test_list_default(self, client: InboxClient) -> None:
        """List with default parameters."""
        client.client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: [{"id": "abc"}],
        )
        result = client.list_items()
        assert len(result) == 1
        call = client.client.get.call_args
        assert call[1]["params"]["limit"] == 20

    def test_list_with_type_filter(self, client: InboxClient) -> None:
        """List with type filter."""
        client.client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: [],
        )
        client.list_items(item_type="url")
        call = client.client.get.call_args
        assert call[1]["params"]["type"] == "url"


class TestGetItem:
    """Tests for InboxClient.get_item."""

    def test_get_item(self, client: InboxClient) -> None:
        """Get item by ID."""
        client.client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: {"id": "abc", "type": "text"},
        )
        result = client.get_item("abc")
        assert result["type"] == "text"


class TestUpdateItem:
    """Tests for InboxClient.update_item."""

    def test_update_item(self, client: InboxClient) -> None:
        """Update item sends PATCH."""
        client.client.patch.return_value = MagicMock(
            status_code=200,
            json=lambda: {"id": "abc", "capture_meta": {"source": "cli"}},
        )
        result = client.update_item("abc", capture_meta={"source": "cli"})
        assert result["capture_meta"]["source"] == "cli"


class TestDeleteItem:
    """Tests for InboxClient.delete_item."""

    def test_delete_item(self, client: InboxClient) -> None:
        """Delete item sends DELETE."""
        client.client.delete.return_value = MagicMock(status_code=204)
        client.delete_item("abc")
        client.client.delete.assert_called_once_with("/v1/items/abc")


class TestSearch:
    """Tests for InboxClient.search."""

    def test_search(self, client: InboxClient) -> None:
        """Search sends GET with query."""
        client.client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: {"items": [{"id": "abc"}], "total": 1},
        )
        result = client.search("hello")
        assert len(result) == 1
        call = client.client.get.call_args
        assert call[1]["params"]["q"] == "hello"


class TestTags:
    """Tests for tag operations."""

    def test_list_tags(self, client: InboxClient) -> None:
        """List tags."""
        client.client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: [{"id": 1, "name": "python"}],
        )
        result = client.list_tags()
        assert result[0]["name"] == "python"

    def test_create_tag(self, client: InboxClient) -> None:
        """Create tag."""
        client.client.post.return_value = MagicMock(
            status_code=201,
            json=lambda: {"id": 1, "name": "python"},
        )
        result = client.create_tag("python")
        assert result["name"] == "python"

    def test_delete_tag(self, client: InboxClient) -> None:
        """Delete tag."""
        client.client.delete.return_value = MagicMock(status_code=204)
        client.delete_tag(1)
        client.client.delete.assert_called_once_with("/v1/tags/1")


class TestCategories:
    """Tests for category operations."""

    def test_list_categories(self, client: InboxClient) -> None:
        """List categories."""
        client.client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: [{"id": 1, "name": "notes"}],
        )
        result = client.list_categories()
        assert result[0]["name"] == "notes"

    def test_create_category(self, client: InboxClient) -> None:
        """Create category."""
        client.client.post.return_value = MagicMock(
            status_code=201,
            json=lambda: {"id": 1, "name": "notes"},
        )
        result = client.create_category("notes", "General notes")
        assert result["name"] == "notes"


class TestStats:
    """Tests for stats operation."""

    def test_get_stats(self, client: InboxClient) -> None:
        """Get stats."""
        client.client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "total_items": 10,
                "by_type": {"text": 5, "url": 5},
                "total_tags": 3,
                "total_categories": 2,
                "storage_usage_bytes": 0,
            },
        )
        result = client.get_stats()
        assert result["total_items"] == 10
