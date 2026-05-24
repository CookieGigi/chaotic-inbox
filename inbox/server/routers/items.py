"""Item CRUD and search endpoints."""

from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from inbox.database import get_session
from inbox.models import Category, Item, Tag
from inbox.server.exceptions import ValidationError
from inbox.server.schemas import ItemCreate, ItemResponse, ItemUpdate

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


async def _resolve_tags(session: AsyncSession, names: list[str] | None) -> list[Tag]:
    if not names:
        return []
    result = await session.execute(select(Tag).where(Tag.name.in_(names)))
    found = {t.name: t for t in result.scalars().all()}
    missing = set(names) - set(found)
    if missing:
        raise ValidationError(f"Tag(s) not found: {sorted(missing)}")
    return [found[name] for name in names]


async def _resolve_categories(session: AsyncSession, names: list[str] | None) -> list[Category]:
    if not names:
        return []
    result = await session.execute(select(Category).where(Category.name.in_(names)))
    found = {c.name: c for c in result.scalars().all()}
    missing = set(names) - set(found)
    if missing:
        raise ValidationError(f"Category(s) not found: {sorted(missing)}")
    return [found[name] for name in names]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_item(session: SessionDep, data: ItemCreate) -> ItemResponse:
    """Create a new inbox item."""
    item = Item(
        raw_text=data.raw_text,
        blob_path=data.blob_path,
        type=data.type,
        capture_meta=data.capture_meta or {},
    )
    item.tags = await _resolve_tags(session, data.tag_names)
    item.categories = await _resolve_categories(session, data.category_names)
    session.add(item)
    await session.commit()
    await session.refresh(item, ["tags", "categories"])
    return _item_response(item)


@router.get("")
async def list_items(
    session: SessionDep,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    type: str | None = Query(default=None),
) -> list[ItemResponse]:
    """List items with pagination."""
    stmt = (
        select(Item)
        .where(Item.deleted_at.is_(None))
        .order_by(Item.captured_at.desc())
        .limit(limit)
        .offset(offset)
    )
    if type:
        stmt = stmt.where(Item.type == type)
    stmt = stmt.options(selectinload(Item.tags), selectinload(Item.categories))
    result = await session.execute(stmt)
    items = result.scalars().all()
    return [_item_response(i) for i in items]


@router.get("/{item_id}")
async def get_item(session: SessionDep, item_id: UUID) -> ItemResponse:
    """Get a single item by ID."""
    stmt = (
        select(Item)
        .where(Item.id == item_id)
        .where(Item.deleted_at.is_(None))
        .options(selectinload(Item.tags), selectinload(Item.categories))
    )
    result = await session.execute(stmt)
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return _item_response(item)


@router.patch("/{item_id}")
async def update_item(session: SessionDep, item_id: UUID, patch: ItemUpdate) -> ItemResponse:
    """Partially update an item."""
    stmt = (
        select(Item)
        .where(Item.id == item_id)
        .where(Item.deleted_at.is_(None))
        .options(selectinload(Item.tags), selectinload(Item.categories))
    )
    result = await session.execute(stmt)
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    patch_data = patch.model_dump(exclude_unset=True)

    # Handle simple field updates
    for key in ("capture_meta", "enrichment"):
        if key in patch_data:
            setattr(item, key, patch_data[key])

    # Handle tag/category replacement
    if "tag_names" in patch_data:
        item.tags = await _resolve_tags(session, patch_data["tag_names"])
    if "category_names" in patch_data:
        item.categories = await _resolve_categories(session, patch_data["category_names"])

    item.updated_at = datetime.now(UTC)
    await session.commit()
    await session.refresh(item, ["tags", "categories"])
    return _item_response(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(session: SessionDep, item_id: UUID) -> None:
    """Soft-delete an item."""
    item = await session.get(Item, item_id)
    if not item or item.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    item.deleted_at = datetime.now(UTC)
    await session.commit()
