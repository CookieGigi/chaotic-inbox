"""HTTP API client for the Inbox CLI."""

import httpx


class InboxClient:
    """Reusable httpx client for the Inbox REST API."""

    def __init__(self, base_url: str = "http://localhost:8080", timeout: float = 30.0):
        self.client = httpx.Client(base_url=base_url, timeout=timeout)

    def create_item(
        self,
        raw_text: str | None = None,
        blob_path: str | None = None,
        item_type: str | None = None,
        capture_meta: dict | None = None,
    ) -> dict:
        """Create a new inbox item."""
        payload = {
            "raw_text": raw_text,
            "blob_path": blob_path,
            "type": item_type,
            "capture_meta": capture_meta,
        }
        resp = self.client.post(
            "/v1/items", json={k: v for k, v in payload.items() if v is not None}
        )
        resp.raise_for_status()
        return resp.json()

    def list_items(
        self, limit: int = 20, offset: int = 0, item_type: str | None = None
    ) -> list[dict]:
        """List inbox items."""
        params: dict = {"limit": limit, "offset": offset}
        if item_type:
            params["type"] = item_type
        resp = self.client.get("/v1/items", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_item(self, item_id: str) -> dict:
        """Get a single item by ID."""
        resp = self.client.get(f"/v1/items/{item_id}")
        resp.raise_for_status()
        return resp.json()

    def update_item(self, item_id: str, **fields) -> dict:
        """Partially update an item."""
        resp = self.client.patch(f"/v1/items/{item_id}", json=fields)
        resp.raise_for_status()
        return resp.json()

    def delete_item(self, item_id: str) -> None:
        """Soft-delete an item."""
        resp = self.client.delete(f"/v1/items/{item_id}")
        resp.raise_for_status()

    def search(self, query: str, item_type: str | None = None, limit: int = 20) -> list[dict]:
        """Full-text search."""
        params: dict = {"q": query, "limit": limit}
        if item_type:
            params["type"] = item_type
        resp = self.client.get("/v1/search", params=params)
        resp.raise_for_status()
        return resp.json().get("items", [])

    def list_tags(self) -> list[dict]:
        """List all tags."""
        resp = self.client.get("/v1/tags")
        resp.raise_for_status()
        return resp.json()

    def create_tag(self, name: str) -> dict:
        """Create a new tag."""
        resp = self.client.post("/v1/tags", json={"name": name})
        resp.raise_for_status()
        return resp.json()

    def delete_tag(self, tag_id: int) -> None:
        """Delete a tag."""
        resp = self.client.delete(f"/v1/tags/{tag_id}")
        resp.raise_for_status()

    def list_categories(self) -> list[dict]:
        """List all categories."""
        resp = self.client.get("/v1/categories")
        resp.raise_for_status()
        return resp.json()

    def create_category(self, name: str, description: str | None = None) -> dict:
        """Create a new category."""
        resp = self.client.post("/v1/categories", json={"name": name, "description": description})
        resp.raise_for_status()
        return resp.json()

    def get_stats(self) -> dict:
        """Get inbox statistics."""
        resp = self.client.get("/v1/stats")
        resp.raise_for_status()
        return resp.json()
