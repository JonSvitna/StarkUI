from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from pydantic import BaseModel, Field
from app.models.models import RunStatus, TaskStatus, EventType, PatchStatus


# Task schemas
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    run_id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Event schemas
class EventCreate(BaseModel):
    event_type: EventType = EventType.INFO
    message: str = Field(..., min_length=1)
    event_metadata: Optional[str] = None


class EventResponse(BaseModel):
    id: int
    run_id: int
    event_type: EventType
    message: str
    event_metadata: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Run schemas
class RunCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class RunResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: RunStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class RunDetail(RunResponse):
    tasks: List[TaskResponse] = []
    recent_events: List[EventResponse] = []
    
    class Config:
        from_attributes = True


# Patch schemas
class PatchPreviewRequest(BaseModel):
    file_path: str = Field(..., min_length=1, max_length=512)
    diff_content: str = Field(..., min_length=1)


class PatchApplyRequest(BaseModel):
    run_id: int
    file_path: str = Field(..., min_length=1, max_length=512)
    diff_content: str = Field(..., min_length=1)


class PatchResponse(BaseModel):
    id: int
    run_id: int
    file_path: str
    diff_content: str
    status: PatchStatus
    created_at: datetime
    applied_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Health check
class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
