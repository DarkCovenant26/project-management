"""
Pydantic schemas for Project validation.
Security principle: Every user input is a threat.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import bleach


def sanitize_text(value: str) -> str:
    """Remove any HTML/script tags from input text."""
    return bleach.clean(value, tags=[], strip=True)


class ProjectCreateSchema(BaseModel):
    """Schema for creating a new project."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    color: Optional[str] = Field(default=None, max_length=20)

    @field_validator("title", "description", mode="before")
    @classmethod
    def sanitize_strings(cls, v):
        if v is not None and isinstance(v, str):
            return sanitize_text(v)
        return v


class ProjectUpdateSchema(BaseModel):
    """Schema for updating a project."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    color: Optional[str] = Field(default=None, max_length=20)

    @field_validator("title", "description", mode="before")
    @classmethod
    def sanitize_strings(cls, v):
        if v is not None and isinstance(v, str):
            return sanitize_text(v)
        return v

    class Config:
        populate_by_name = True


class MemberAddSchema(BaseModel):
    """Schema for adding a project member."""
    email: str = Field(..., min_length=5, max_length=254)
    role: str = Field(default="member")

    @field_validator("email", mode="before")
    @classmethod
    def sanitize_email(cls, v):
        if v is not None and isinstance(v, str):
            return sanitize_text(v.strip().lower())
        return v

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        allowed = {"admin", "member", "viewer"}
        if v not in allowed:
            raise ValueError(f"Role must be one of {allowed}")
        return v


class MemberUpdateSchema(BaseModel):
    """Schema for updating a member's role."""
    role: str = Field(...)

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        allowed = {"admin", "member", "viewer"}
        if v not in allowed:
            raise ValueError(f"Role must be one of {allowed}")
        return v
