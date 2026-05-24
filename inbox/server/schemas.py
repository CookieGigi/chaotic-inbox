"""Pydantic request/response schemas for the Inbox API."""

from datetime import datetime

from pydantic import ConfigDict, model_validator
from sqlmodel import Field, SQLModel


class ItemCreate(SQLModel):
    """Fields required to create a new item."""

    raw_text: str | None = None
    blob_path: str | None = None
    type: str | None = None
    capture_meta: dict | None = None
    tag_names: list[str] | None = None
    category_names: list[str] | None = None

    model_config = ConfigDict(extra="forbid")

    @model_validator(mode="after")
    def _require_content(self):
        if not self.raw_text and not self.blob_path:
            raise ValueError("Either raw_text or blob_path must be provided")
        return self

    @model_validator(mode="after")
    def _no_empty_names(self):
        for field in ("tag_names", "category_names"):
            names = getattr(self, field)
            if names is not None:
                for name in names:
                    if not name or not name.strip():
                        raise ValueError(f"{field} must not contain empty strings")
        return self


class ItemUpdate(SQLModel):
    """Fields allowed for partial update."""

    capture_meta: dict | None = None
    enrichment: dict | None = None
    tag_names: list[str] | None = None
    category_names: list[str] | None = None

    model_config = ConfigDict(extra="forbid")


class TagResponse(SQLModel):
    """Tag serialization."""

    id: int
    name: str
    auto_generated: bool
    created_at: datetime


class CategoryResponse(SQLModel):
    """Category serialization."""

    id: int
    name: str
    description: str | None
    created_at: datetime


class ItemResponse(SQLModel):
    """Full item serialization."""

    id: str
    type: str
    captured_at: datetime
    updated_at: datetime
    raw_text: str | None
    blob_path: str | None
    capture_meta: dict
    enrichment: dict
    deleted_at: datetime | None
    tags: list[TagResponse] = []
    categories: list[CategoryResponse] = []


class SearchRequest(SQLModel):
    """Search parameters."""

    query: str
    type: str | None = None
    limit: int = 20


class SearchResponse(SQLModel):
    """Search results."""

    items: list[ItemResponse]
    total: int


class SimilarRequest(SQLModel):
    """Vector similarity search parameters."""

    item_id: str | None = None
    embedding: list[float] | None = None
    limit: int = 20


class TagCreate(SQLModel):
    """Fields required to create a tag."""

    name: str = Field(min_length=1)


class CategoryCreate(SQLModel):
    """Fields required to create a category."""

    name: str = Field(min_length=1)
    description: str | None = None


class StatsResponse(SQLModel):
    """Inbox usage statistics."""

    total_items: int
    by_type: dict[str, int]
    total_tags: int
    total_categories: int
    storage_usage_bytes: int
