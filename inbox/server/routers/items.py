"""Item CRUD and search endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from inbox.database import get_session
from inbox.models import Item

router = APIRouter()

SessionDep = Annotated[AsyncSession, Depends(get_session)]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_item(session: SessionDep, item: Item) -> Item:
    """Create a new inbox item."""
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item


@router.get("")
async def list_items(
    session: SessionDep,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[Item]:
    """List items with pagination."""
    result = await session.execute(
        select(Item)
        .where(Item.deleted_at.is_(None))
        .order_by(Item.captured_at)
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()


@router.get("/{item_id}")
async def get_item(session: SessionDep, item_id: UUID) -> Item:
    """Get a single item by ID."""
    item = await session.get(Item, item_id)
    if not item or item.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.patch("/{item_id}")
async def update_item(session: SessionDep, item_id: UUID, patch: Item) -> Item:
    """Partially update an item."""
    item = await session.get(Item, item_id)
    if not item or item.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    patch_data = patch.model_dump(exclude_unset=True)
    for key, value in patch_data.items():
        if key == "id":
            continue
        setattr(item, key, value)

    await session.commit()
    await session.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(session: SessionDep, item_id: UUID) -> None:
    """Soft-delete an item."""
    item = await session.get(Item, item_id)
    if not item or item.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    item.deleted_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
    await session.commit()
