"""
Pydantic schemas for strict input validation.
Security principle: Every user input is a threat.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID
import bleach


def sanitize_text(value: str) -> str:
    """Remove any HTML/script tags from input text."""
    return bleach.clean(value, tags=[], strip=True)


class TaskCreateSchema(BaseModel):
    """Schema for creating a new task."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    priority: str = Field(default="Medium")
    status: Optional[str] = Field(default="backlog")
    task_type: Optional[str] = Field(default="Feature")
    
    start_date: Optional[datetime] = Field(default=None, alias="startDate")
    due_date: Optional[datetime] = Field(default=None, alias="dueDate")
    actual_completion_date: Optional[datetime] = Field(default=None, alias="actualCompletionDate")
    
    story_points: Optional[int] = Field(default=0, alias="storyPoints", ge=0)
    time_estimate: Optional[float] = Field(default=None, alias="timeEstimate", ge=0)
    time_spent: Optional[float] = Field(default=None, alias="timeSpent", ge=0)
    
    project: Optional[UUID] = Field(default=None) # UUID
    tag_ids: Optional[List[UUID]] = Field(default_factory=list)
    assignee_ids: Optional[List[int]] = Field(default_factory=list)
    blocked_by_ids: Optional[List[UUID]] = Field(default_factory=list)

    @field_validator("title", "description", mode="before")
    @classmethod
    def sanitize_strings(cls, v):
        if v is not None and isinstance(v, str):
            return sanitize_text(v)
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v):
        allowed = {"Low", "Medium", "High", "Critical"}
        if v not in allowed:
            raise ValueError(f"Priority must be one of {allowed}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        allowed = {"backlog", "todo", "in_progress", "review", "done"}
        if v is not None and v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v
        
    @field_validator("task_type")
    @classmethod
    def validate_type(cls, v):
        allowed = {"Feature", "Bug", "Chore", "Improvement", "Story"}
        if v is not None and v not in allowed:
            raise ValueError(f"Type must be one of {allowed}")
        return v

    class Config:
        populate_by_name = True


class TaskUpdateSchema(BaseModel):
    """Schema for updating an existing task."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    priority: Optional[str] = Field(default=None)
    status: Optional[str] = Field(default=None)
    task_type: Optional[str] = Field(default=None)
    
    start_date: Optional[datetime] = Field(default=None, alias="startDate")
    due_date: Optional[datetime] = Field(default=None, alias="dueDate")
    actual_completion_date: Optional[datetime] = Field(default=None, alias="actualCompletionDate")
    
    story_points: Optional[int] = Field(default=None, alias="storyPoints", ge=0)
    time_estimate: Optional[float] = Field(default=None, alias="timeEstimate", ge=0)
    time_spent: Optional[float] = Field(default=None, alias="timeSpent", ge=0)

    project: Optional[UUID] = Field(default=None) # UUID
    is_completed: Optional[bool] = Field(default=None, alias="isCompleted")
    tag_ids: Optional[List[UUID]] = Field(default=None)
    assignee_ids: Optional[List[int]] = Field(default=None)
    blocked_by_ids: Optional[List[UUID]] = Field(default=None)

    @field_validator("title", "description", mode="before")
    @classmethod
    def sanitize_strings(cls, v):
        if v is not None and isinstance(v, str):
            return sanitize_text(v)
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v):
        allowed = {"Low", "Medium", "High", "Critical"}
        if v is not None and v not in allowed:
            raise ValueError(f"Priority must be one of {allowed}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        allowed = {"backlog", "todo", "in_progress", "review", "done"}
        if v is not None and v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v
        
    @field_validator("task_type")
    @classmethod
    def validate_type(cls, v):
        allowed = {"Feature", "Bug", "Chore", "Improvement", "Story"}
        if v is not None and v not in allowed:
            raise ValueError(f"Type must be one of {allowed}")
        return v

    class Config:
        populate_by_name = True


class StatusUpdateSchema(BaseModel):
    """Schema for quick status updates (Kanban drag-and-drop)."""
    status: str = Field(...)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        allowed = {"backlog", "in_progress", "review", "done"}
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v


class BulkActionSchema(BaseModel):
    """Schema for bulk task operations."""
    ids: List[int] = Field(..., min_length=1, max_length=50)
    action: str = Field(...)
    value: Optional[str] = Field(default=None)

    @field_validator("action")
    @classmethod
    def validate_action(cls, v):
        allowed = {"complete", "delete", "move", "set_priority", "set_status"}
        if v not in allowed:
            raise ValueError(f"Action must be one of {allowed}")
        return v


class SubtaskCreateSchema(BaseModel):
    """Schema for creating a subtask."""
    title: str = Field(..., min_length=1, max_length=200)

    @field_validator("title", mode="before")
    @classmethod
    def sanitize_title(cls, v):
        if v is not None and isinstance(v, str):
            return sanitize_text(v)
        return v


class SubtaskUpdateSchema(BaseModel):
    """Schema for updating a subtask."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    is_completed: Optional[bool] = Field(default=None, alias="isCompleted")
    order: Optional[int] = Field(default=None)

    @field_validator("title", mode="before")
    @classmethod
    def sanitize_title(cls, v):
        if v is not None and isinstance(v, str):
            return sanitize_text(v)
        return v

    class Config:
        populate_by_name = True
