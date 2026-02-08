"""
Pydantic schemas for Quick Capture validation.
Security principle: Every user input is a threat.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import bleach


def sanitize_text(value: str) -> str:
    """Remove any HTML/script tags from input text."""
    return bleach.clean(value, tags=[], strip=True)


class QuickNoteCreateSchema(BaseModel):
    """Schema for creating a quick note."""
    content: str = Field(..., min_length=1, max_length=5000)

    @field_validator("content", mode="before")
    @classmethod
    def sanitize_content(cls, v):
        if v is not None and isinstance(v, str):
            return sanitize_text(v)
        return v


class QuickNoteUpdateSchema(BaseModel):
    """Schema for updating a quick note."""
    content: Optional[str] = Field(default=None, min_length=1, max_length=5000)
    is_archived: Optional[bool] = Field(default=None, alias="isArchived")

    @field_validator("content", mode="before")
    @classmethod
    def sanitize_content(cls, v):
        if v is not None and isinstance(v, str):
            return sanitize_text(v)
        return v

    class Config:
        populate_by_name = True


class ConvertToTaskSchema(BaseModel):
    """Schema for converting a note to a task."""
    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    priority: Optional[str] = Field(default="Medium")
    status: Optional[str] = Field(default="backlog")
    project: Optional[int] = Field(default=None)

    @field_validator("title", "description", mode="before")
    @classmethod
    def sanitize_strings(cls, v):
        if v is not None and isinstance(v, str):
            return sanitize_text(v)
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v):
        allowed = {"Low", "Medium", "High"}
        if v is not None and v not in allowed:
            raise ValueError(f"Priority must be one of {allowed}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        allowed = {"backlog", "in_progress", "review", "done"}
        if v is not None and v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v
