import json
import os
from pathlib import Path

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.types import Scope

load_dotenv()
STATIC_DIR = Path(__file__).parent / "static"


class SPAStaticFiles(StaticFiles):
    """Serve static files with SPA fallback to index.html for any missing path."""
    async def get_response(self, path: str, scope: Scope):
        try:
            return await super().get_response(path, scope)
        except Exception:
            return await super().get_response("index.html", scope)


app = FastAPI()

_review_in_flight = False


class ReviewRequest(BaseModel):
    image: str          # base64 data-URL or raw base64 PNG
    problem: dict
    student_answer: str
    was_correct: bool


@app.post("/api/review-work")
async def review_work(req: ReviewRequest):
    global _review_in_flight
    if _review_in_flight:
        return JSONResponse(
            status_code=429,
            content={"error": "Review already in progress."},
        )

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set")

    image_data = req.image
    if image_data.startswith("data:"):
        image_data = image_data.split(",", 1)[1]

    verdict = "correct" if req.was_correct else "incorrect"
    prompt = (
        "You are a patient math tutor reviewing handwritten work — NOT grading it. "
        "The answer was already checked.\n\n"
        f"Problem: {req.problem.get('question', '')}\n"
        f"Correct answer: {req.problem.get('answerDisplay', '')}\n"
        f"Student typed: {req.student_answer}\n"
        f"That was: {verdict}\n\n"
        "Look at the handwritten work. 2-3 sentences max, conversational tone.\n"
        "- If correct: note if process was clean or sloppy\n"
        "- If incorrect: say WHERE they went wrong specifically\n"
        "- Note if work was shown at all\n\n"
        "Respond ONLY with valid JSON (no markdown, no backticks):\n"
        '{"feedback":"...","work_shown":true,"mistake_location":null}'
    )

    _review_in_flight = True
    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=300,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": image_data,
                            },
                        },
                        {"type": "text", "text": prompt},
                    ],
                }
            ],
        )
        return JSONResponse(content=json.loads(response.content[0].text.strip()))
    except Exception:
        return JSONResponse(
            content={
                "feedback": "Tutor feedback unavailable right now.",
                "work_shown": False,
                "mistake_location": None,
            }
        )
    finally:
        _review_in_flight = False


# SPA mount — MUST come after all API routes
app.mount("/", SPAStaticFiles(directory=str(STATIC_DIR), html=True), name="spa")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
