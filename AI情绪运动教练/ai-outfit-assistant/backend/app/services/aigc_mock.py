import asyncio
import uuid
from app.schemas.tryon import TryOnResponse, TryOnStatus, TryOnRequest

# Simple in-memory storage for mock tasks
_MOCK_TASKS = {}

class MockAIGCService:
    async def create_tryon_task(self, request: TryOnRequest, user_id: int) -> TryOnResponse:
        task_id = str(uuid.uuid4())
        
        # Simulate processing time based on quality
        est_time = 5.0
        if request.quality == "fast":
            est_time = 2.0
        elif request.quality == "hd":
            est_time = 10.0
            
        task_info = {
            "user_id": user_id,
            "task_id": task_id,
            "status": "processing",
            "progress": 0,
            "result_image_url": None,
            "request": request
        }
        
        _MOCK_TASKS[task_id] = task_info
        
        # Simulate background processing (in a real app, this would be a Celery/Redis queue)
        asyncio.create_task(self._simulate_processing(task_id, est_time))
        
        return TryOnResponse(
            task_id=task_id,
            status="processing",
            queue_position=1,
            estimated_time=est_time
        )

    async def get_task_status(self, task_id: str, user_id: int) -> TryOnStatus:
        task = _MOCK_TASKS.get(task_id)
        # Match a missing task so callers cannot discover another user's task.
        if not task or task["user_id"] != user_id:
            return TryOnStatus(task_id=task_id, status="not_found", progress=0)
        
        return TryOnStatus(
            task_id=task_id,
            status=task["status"],
            progress=task["progress"],
            result_image_url=task["result_image_url"]
        )

    async def _simulate_processing(self, task_id: str, duration: float):
        steps = 10
        step_time = duration / steps
        
        for i in range(steps):
            await asyncio.sleep(step_time)
            if task_id in _MOCK_TASKS:
                _MOCK_TASKS[task_id]["progress"] = (i + 1) * 10
        
        # Complete
        if task_id in _MOCK_TASKS:
            _MOCK_TASKS[task_id]["status"] = "completed"
            _MOCK_TASKS[task_id]["progress"] = 100
            # Return a fast placeholder image (picsum)
            _MOCK_TASKS[task_id]["result_image_url"] = "https://picsum.photos/seed/tryon/400/600" # Random standardized image

aigc_service = MockAIGCService()
