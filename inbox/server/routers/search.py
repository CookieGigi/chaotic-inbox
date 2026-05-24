"""Search router — full-text and vector similarity search."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from inbox.database import get_session
from inbox.models import Item
from inbox.server.schemas import ItemResponse, SearchResponse, SimilarRequest

router = APIRouter()
SessionDep = Annotated[AsyncSession, Depends(get_session)]


def _item_response(item: Item) -> ItemResponse:
    return ItemResponse(
        id=str(item.id),
        type=item.type,
        captured_at=item.captured_at,
        updated_at=item.updated_at,
        raw_text=item.raw_text,
        blob_path=item.blob_path,
        capture_meta=item.capture_meta or {},
        enrichment=item.enrichment or {},
        deleted_at=item.deleted_at,
        tags=[
            {
                "id": t.id,
                "name": t.name,
                "auto_generated": t.auto_generated,
                "created_at": t.created_at,
            }
            for t in (item.tags or [])
        ],
        categories=[
            {
                "id": c.id,
                "name": c.name,
                "description": c.description,
                "created_at": c.created_at,
            }
            for c in (item.categories or [])
        ],
    )


@router.get("")
async def search_items(
    session: SessionDep,
    q: str = Query(..., min_length=1),
    type: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
) -> SearchResponse:
    """Full-text search across items."""
    # SQLite fallback: ILIKE on raw_text
    stmt = select(Item).where(Item.deleted_at.is_(None))
    stmt = stmt.where(Item.raw_text.ilike(f"%{q}%"))
    if type:
        stmt = stmt.where(Item.type == type)
    stmt = stmt.order_by(Item.captured_at.desc()).limit(limit)
    stmt = stmt.options(selectinload(Item.tags), selectinload(Item.categories))
    result = await session.execute(stmt)
    items = result.scalars().all()
    return SearchResponse(
        items=[_item_response(i) for i in items],
        total=len(items),
    )


@router.post("/similar")
async def similar_items(session: SessionDep, req: SimilarRequest) -> SearchResponse:
    """Vector similarity search — placeholder for Phase 4."""
    return SearchResponse(items=[], total=0)
