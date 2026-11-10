from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from app import schemas
from app.api import deps
from app.services.aigc_mock import aigc_service

router = APIRouter()

@router.post("/generate", response_model=schemas.TryOnResponse)
async def create_tryon_task(
    *,
    request: schemas.TryOnRequest,
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Submit a virtual try-on task.
    """
    return await aigc_service.create_tryon_task(request, current_user.user_id)

@router.get("/task/{task_id}", response_model=schemas.TryOnStatus)
async def get_tryon_status(
    task_id: str,
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Check the status of a try-on task.
    """
    return await aigc_service.get_task_status(task_id, current_user.user_id)
