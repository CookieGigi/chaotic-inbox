"""Tests for the Inbox CLI commands."""

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from typer.testing import CliRunner

from inbox.cli.main import app

runner = CliRunner()


@pytest.fixture
def mock_client():
    """Mock httpx client for CLI tests."""
    with patch("inbox.cli.main._client") as mock:
        client = MagicMock()
        mock.return_value = client
        yield client


class TestAddCommand:
    """Tests for `inbox add` command."""

    def test_add_text(self, mock_client) -> None:
        """Add plain text content."""
        mock_client.post.return_value = MagicMock(
            status_code=201,
            json=lambda: {"id": "550e8400-e29b-41d4-a716-446655440000"},
        )
        result = runner.invoke(app, ["add", "hello world"])
        assert result.exit_code == 0
        mock_client.post.assert_called_once()

    def test_add_url(self, mock_client) -> None:
        """Add a URL (auto-detected as type url)."""
        mock_client.post.return_value = MagicMock(
            status_code=201,
            json=lambda: {"id": "550e8400-e29b-41d4-a716-446655440000"},
        )
        result = runner.invoke(app, ["add", "https://example.com"])
        assert result.exit_code == 0
        call_args = mock_client.post.call_args
        assert call_args[1]["json"]["type"] == "url"

    def test_add_stdin(self, mock_client) -> None:
        """Add content from stdin."""
        mock_client.post.return_value = MagicMock(
            status_code=201,
            json=lambda: {"id": "550e8400-e29b-41d4-a716-446655440000"},
        )
        result = runner.invoke(app, ["add", "--stdin"], input="from stdin")
        assert result.exit_code == 0
        mock_client.post.assert_called_once()

    def test_add_file_not_found(self, mock_client) -> None:
        """Add with --file pointing to nonexistent file exits with error."""
        result = runner.invoke(app, ["add", "--file", "/nonexistent/file.txt"])
        assert result.exit_code == 1
        assert "File not found" in result.output

    def test_add_json_output(self, mock_client) -> None:
        """Add with --json outputs raw JSON."""
        mock_client.post.return_value = MagicMock(
            status_code=201,
            json=lambda: {"id": "550e8400-e29b-41d4-a716-446655440000", "type": "text"},
        )
        result = runner.invoke(app, ["add", "hello", "--json"])
        assert result.exit_code == 0
        assert "550e8400" in result.output


class TestListCommand:
    """Tests for `inbox list` command."""

    def test_list_default(self, mock_client) -> None:
        """List items with default limit."""
        mock_client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: [],
        )
        result = runner.invoke(app, ["list"])
        assert result.exit_code == 0
        mock_client.get.assert_called_once()

    def test_list_with_limit(self, mock_client) -> None:
        """List with custom --limit."""
        mock_client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: [],
        )
        result = runner.invoke(app, ["list", "--limit", "5"])
        assert result.exit_code == 0
        call_args = mock_client.get.call_args
        assert call_args[1]["params"]["limit"] == 5

    def test_list_with_type(self, mock_client) -> None:
        """List filtered by --type."""
        mock_client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: [],
        )
        result = runner.invoke(app, ["list", "--type", "url"])
        assert result.exit_code == 0
        call_args = mock_client.get.call_args
        assert call_args[1]["params"]["type"] == "url"

    def test_list_json_output(self, mock_client) -> None:
        """List with --json outputs raw JSON."""
        mock_client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: [{"id": "abc", "type": "text"}],
        )
        result = runner.invoke(app, ["list", "--json"])
        assert result.exit_code == 0
        assert "abc" in result.output


class TestInfoCommand:
    """Tests for `inbox info` command."""

    def test_info(self, mock_client) -> None:
        """Show item info by ID."""
        mock_client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "type": "text",
                "captured_at": "2026-05-24T12:00:00Z",
            },
        )
        result = runner.invoke(app, ["info", "550e8400-e29b-41d4-a716-446655440000"])
        assert result.exit_code == 0
        assert "text" in result.output

    def test_info_json_output(self, mock_client) -> None:
        """Info with --json outputs raw JSON."""
        mock_client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: {"id": "abc", "type": "url"},
        )
        result = runner.invoke(app, ["info", "abc", "--json"])
        assert result.exit_code == 0
        assert "url" in result.output


class TestDeleteCommand:
    """Tests for `inbox delete` command."""

    def test_delete_force(self, mock_client) -> None:
        """Delete item with --force skips confirmation."""
        mock_client.delete.return_value = MagicMock(status_code=204)
        result = runner.invoke(app, ["delete", "abc", "--force"])
        assert result.exit_code == 0
        mock_client.delete.assert_called_once()

    def test_delete_not_found(self, mock_client) -> None:
        """Delete nonexistent item exits with code 3."""
        mock_client.delete.return_value = MagicMock(status_code=404)
        result = runner.invoke(app, ["delete", "nonexistent", "--force"])
        assert result.exit_code == 3
        assert "not found" in result.output

    def test_delete_cancelled(self, mock_client) -> None:
        """Delete without --force and declining confirmation cancels."""
        result = runner.invoke(app, ["delete", "abc"], input="n\n")
        assert result.exit_code == 0
        assert "Cancelled" in result.output
