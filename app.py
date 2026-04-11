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


class AskQuestionRequest(BaseModel):
    question: str        # student's follow-up question
    lesson_title: str    # e.g. "Bras and Inner Products"
    lesson_html: str     # lesson concept card content (plain text)
    problem_text: str    # the Try It problem text
    student_answer: str  # what the student entered
    correct_answer: str  # the correct answer
    was_correct: bool | None = None  # None if student hasn't answered yet


class ReadAnswerRequest(BaseModel):
    image: str   # base64 PNG of the handwritten answer
    problem: dict  # { question, answerType }


class ReviewRequest(BaseModel):
    image: str          # base64 data-URL or raw base64 PNG
    problem: dict
    student_answer: str
    was_correct: bool


@app.post("/api/ask")
async def ask_question(req: AskQuestionRequest):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set")

    has_answered = req.was_correct is not None and req.correct_answer != '(not yet answered)'
    if has_answered:
        answer_context = (
            f"Student answered: {req.student_answer} ({'correct' if req.was_correct else 'incorrect'})\n"
            f"Correct answer: {req.correct_answer}\n"
        )
    else:
        answer_context = "The student has NOT answered yet — they are still working on the problem.\n"

    prompt = (
        "You are a friendly, patient quantum computing tutor for a beginner student. "
        "The student is working on a practice problem and has a question.\n\n"
        f"Lesson: {req.lesson_title}\n"
        f"Concept taught: {req.lesson_html}\n"
        f"Problem: {req.problem_text}\n"
        f"{answer_context}\n"
        f"Student's question: {req.question}\n\n"
        "Rules:\n"
        "- Answer in 2-3 sentences max, plain English, no jargon\n"
        "- Relate your answer to the specific problem they are working on\n"
        "- If they ask about physical meaning, connect to real-world quantum computing\n"
        "- If they haven't answered yet, give hints and guidance WITHOUT giving away the answer\n"
        "- Be encouraging and conversational\n"
        "- Do NOT use markdown formatting, LaTeX, or code blocks\n"
        "- Use simple notation like |0> instead of complex formatting"
    )

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        return JSONResponse(content={"answer": response.content[0].text.strip()})
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"answer": "Sorry, I couldn't process that question right now.", "error": str(e)},
        )


@app.post("/api/read-answer")
async def read_answer(req: ReadAnswerRequest):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set")

    image_data = req.image
    if image_data.startswith("data:"):
        image_data = image_data.split(",", 1)[1]

    answer_type = req.problem.get("answerType", "numeric")
    format_hints = {
        "numeric": 'a number, e.g. "42" or "-3" or "1.41"',
        "vector":  'two numbers separated by comma, e.g. "3, 4" or "-2, 5"',
        "complex": 'a complex number, e.g. "3 + 4i" or "2 - i" or "5"',
        "matrix":  'four numbers as two rows, e.g. "1 2; 3 4"',
        "yesno":   '"yes" or "no"',
    }

    prompt = (
        f"Read the handwritten math answer in this image.\n\n"
        f"Problem: {req.problem.get('question', '')}\n"
        f"Expected format: {format_hints.get(answer_type, 'a number')}\n\n"
        "Return ONLY the answer — no explanation, no punctuation, just the value. "
        "If the handwriting is completely illegible, return exactly: unreadable"
    )

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=60,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_data}},
                    {"type": "text", "text": prompt},
                ],
            }],
        )
        return JSONResponse(content={"answer": response.content[0].text.strip()})
    except Exception as e:
        return JSONResponse(status_code=500, content={"answer": None, "error": str(e)})


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
