from fastapi import FastAPI, BackgroundTasks
from datetime import datetime
import uvicorn

from scrape_reddit import run_scraper

app = FastAPI(title="Crash Reports API", version="1.0.0")

# In-memory storage for task results
task_results = {}
task_status = {}

def background_scraper(task_id: str, limit: int, include_comments: bool, days_back: int):
    """Background task to run the scraper"""
    try:
        task_status[task_id] = "running"
        result = run_scraper(limit=limit, include_comments=include_comments, days_back=days_back)
        task_results[task_id] = result
        task_status[task_id] = "completed"
    except Exception as e:
        task_results[task_id] = {
            "success": False,
            "message": f"Error occurred: {str(e)}",
            "posts_found": 0,
            "total_comments": 0,
            "crash_related_comments": 0
        }
        task_status[task_id] = "failed"

@app.get("/")
async def root():
    return {"message": "Crash Reports API", "version": "1.0.0"}

@app.post("/scrape")
async def trigger_scrape(request: dict, background_tasks: BackgroundTasks):
    """Trigger a Reddit scrape operation in the background"""
    # Extract parameters with defaults
    limit = request.get("limit", 1000)
    include_comments = request.get("include_comments", True)
    days_back = request.get("days_back", 365)

    # Generate a unique task ID
    task_id = f"scrape_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"

    # Add the scraping task to background tasks
    background_tasks.add_task(
        background_scraper,
        task_id=task_id,
        limit=limit,
        include_comments=include_comments,
        days_back=days_back
    )

    task_status[task_id] = "queued"

    return {
        "task_id": task_id,
        "status": "queued",
        "message": "Scraping task has been queued and will start shortly"
    }

@app.get("/scrape/{task_id}/status")
async def get_scrape_status(task_id: str):
    """Get the status of a scraping task"""
    if task_id not in task_status:
        return {"error": "Task not found"}, 404

    status = task_status[task_id]
    response = {"task_id": task_id, "status": status}

    if status == "completed" and task_id in task_results:
        response["result"] = task_results[task_id]
    elif status == "failed" and task_id in task_results:
        response["error"] = task_results[task_id]

    return response

@app.get("/scrape/{task_id}/result")
async def get_scrape_result(task_id: str):
    """Get the result of a completed scraping task"""
    if task_id not in task_status:
        return {"error": "Task not found"}, 404

    if task_status[task_id] != "completed":
        return {"error": f"Task is not completed. Current status: {task_status[task_id]}"}, 400

    if task_id not in task_results:
        return {"error": "Task result not found"}, 404

    return task_results[task_id]

@app.get("/tasks")
async def list_tasks():
    """List all tasks and their current status"""
    return {
        "tasks": [
            {
                "task_id": task_id,
                "status": status,
                "has_result": task_id in task_results
            }
            for task_id, status in task_status.items()
        ]
    }

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)