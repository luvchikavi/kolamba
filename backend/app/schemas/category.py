"""Category schemas for API validation."""

from pydantic import BaseModel


class CategoryBase(BaseModel):
    """Base category schema."""
    name_he: str
    name_en: str
    slug: str
    icon: str | None = None
    sort_order: int = 0


class CategoryResponse(CategoryBase):
    """Schema for category response."""
    id: int

    class Config:
        from_attributes = True
