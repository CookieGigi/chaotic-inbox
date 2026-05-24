"""Categories router — CRUD for categories."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from inbox.database import get_session
from inbox.models import Category
from inbox.server.exceptions import ConflictError, NotFoundError
from inbox.server.schemas import CategoryCreate, CategoryResponse

router = APIRouter()
SessionDep = Annotated[AsyncSession, Depends(get_session)]


def _category_response(category: Category) -> CategoryResponse:
    return CategoryResponse(
        id=category.id,
        name=category.name,
        description=category.description,
        created_at=category.created_at,
    )


@router.get("")
async def list_categories(session: SessionDep) -> list[CategoryResponse]:
    """List all categories."""
    result = await session.execute(select(Category).order_by(Category.name))
    categories = result.scalars().all()
    return [_category_response(c) for c in categories]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_category(session: SessionDep, data: CategoryCreate) -> CategoryResponse:
    """Create a new category."""
    category = Category(name=data.name, description=data.description)
    session.add(category)
    try:
        await session.commit()
    except IntegrityError as err:
        await session.rollback()
        raise ConflictError(f"Category '{data.name}' already exists") from err
    await session.refresh(category)
    return _category_response(category)


@router.get("/{category_id}")
async def get_category(session: SessionDep, category_id: int) -> CategoryResponse:
    """Get a category by ID."""
    category = await session.get(Category, category_id)
    if not category:
        raise NotFoundError(f"Category {category_id} not found")
    return _category_response(category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(session: SessionDep, category_id: int) -> None:
    """Delete a category."""
    category = await session.get(Category, category_id)
    if not category:
        raise NotFoundError(f"Category {category_id} not found")
    await session.delete(category)
    await session.commit()
