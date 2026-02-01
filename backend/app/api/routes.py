import asyncio
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Run, Task, Event, Patch, RunStatus, PatchStatus
from app.schemas.schemas import (
    RunCreate, RunResponse, RunDetail,
    TaskCreate, TaskResponse,
    EventCreate, EventResponse,
    PatchPreviewRequest, PatchApplyRequest, PatchResponse
)
from app.core.events import broadcaster

router = APIRouter()


# Runs endpoints
@router.post("/runs", response_model=RunResponse, status_code=201)
def create_run(run_data: RunCreate, db: Session = Depends(get_db)):
    """Create a new run"""
    run = Run(
        title=run_data.title,
        description=run_data.description,
        status=RunStatus.PENDING
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


@router.get("/runs", response_model=List[RunResponse])
def list_runs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all runs"""
    runs = db.query(Run).order_by(Run.created_at.desc()).offset(skip).limit(limit).all()
    return runs


@router.get("/runs/{run_id}", response_model=RunDetail)
def get_run(run_id: int, db: Session = Depends(get_db)):
    """Get run details with tasks and recent events"""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    # Get recent events (last 50)
    recent_events = db.query(Event).filter(Event.run_id == run_id).order_by(Event.created_at.desc()).limit(50).all()
    
    # Prepare response
    run_dict = {
        "id": run.id,
        "title": run.title,
        "description": run.description,
        "status": run.status,
        "created_at": run.created_at,
        "updated_at": run.updated_at,
        "tasks": run.tasks,
        "recent_events": list(reversed(recent_events))  # Show oldest first
    }
    
    return run_dict


# Tasks endpoints
@router.post("/runs/{run_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(run_id: int, task_data: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task for a run"""
    # Verify run exists
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    task = Task(
        run_id=run_id,
        title=task_data.title,
        description=task_data.description
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Broadcast event
    await broadcaster.publish(run_id, {
        "type": "task_created",
        "task_id": task.id,
        "task_title": task.title
    })
    
    return task


@router.get("/runs/{run_id}/tasks", response_model=List[TaskResponse])
def list_tasks(run_id: int, db: Session = Depends(get_db)):
    """List all tasks for a run"""
    # Verify run exists
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    tasks = db.query(Task).filter(Task.run_id == run_id).order_by(Task.created_at).all()
    return tasks


# Events endpoints
@router.post("/runs/{run_id}/events", response_model=EventResponse, status_code=201)
async def create_event(run_id: int, event_data: EventCreate, db: Session = Depends(get_db)):
    """Append an event to a run"""
    # Verify run exists
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    event = Event(
        run_id=run_id,
        event_type=event_data.event_type,
        message=event_data.message,
        metadata=event_data.metadata
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    
    # Broadcast to SSE subscribers
    await broadcaster.publish(run_id, {
        "type": "event",
        "id": event.id,
        "event_type": event.event_type.value,
        "message": event.message,
        "metadata": event.metadata,
        "created_at": event.created_at.isoformat()
    })
    
    return event


@router.get("/runs/{run_id}/stream")
async def stream_events(run_id: int, db: Session = Depends(get_db)):
    """SSE stream of events for a run"""
    # Verify run exists
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    async def event_generator():
        queue = broadcaster.subscribe(run_id)
        try:
            # Send initial connected event
            yield f"data: {json.dumps({'type': 'connected', 'run_id': run_id})}\n\n"
            
            while True:
                # Wait for event with timeout for keep-alive
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    # Send keep-alive ping
                    yield f"data: {json.dumps({'type': 'ping'})}\n\n"
        except Exception as e:
            print(f"SSE error for run {run_id}: {e}")
        finally:
            broadcaster.unsubscribe(run_id, queue)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


# Patches endpoints
@router.post("/patches/preview", response_model=dict)
def preview_patch(patch_data: PatchPreviewRequest):
    """Preview a patch (normalize diff)"""
    return {
        "file_path": patch_data.file_path,
        "diff_content": patch_data.diff_content,
        "preview": "Patch preview ready",
        "status": "preview"
    }


@router.post("/patches/apply", response_model=PatchResponse, status_code=201)
async def apply_patch(patch_data: PatchApplyRequest, db: Session = Depends(get_db)):
    """Apply a patch (placeholder - stores patch for now)"""
    # Verify run exists
    run = db.query(Run).filter(Run.id == patch_data.run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    patch = Patch(
        run_id=patch_data.run_id,
        file_path=patch_data.file_path,
        diff_content=patch_data.diff_content,
        status=PatchStatus.PENDING
    )
    db.add(patch)
    db.commit()
    db.refresh(patch)
    
    # Broadcast event
    await broadcaster.publish(patch_data.run_id, {
        "type": "patch_created",
        "patch_id": patch.id,
        "file_path": patch.file_path
    })
    
    return patch
