# Quantum Primer

An interactive, Duolingo-inspired math tutor that builds the prerequisite skills for quantum mechanics — optimized for Apple Pencil on iPad.

## Tech Stack

- **Backend**: Python · FastAPI · Anthropic Claude (optional vision feedback)
- **Frontend**: Vanilla ES modules · HTML5 Canvas (Pointer Events API)
- **Fonts**: Nunito 800 · Fira Code 500

## Quick Start

```bash
git clone https://github.com/your-username/quantum-primer.git
cd quantum-primer
pip install -r requirements.txt
cp .env.example .env          # add your ANTHROPIC_API_KEY (optional)
python app.py                 # http://localhost:8000
```

iPad access (on the same network):

```
http://192.168.254.34:8000
```

## Features

- **5 progressive chapters** — Algebra → Vectors → Unit Vectors → Complex Numbers → 2×2 Matrices
- **Duolingo-style skill tree** — chapters unlock as you pass quizzes (8/10 to pass)
- **Apple Pencil canvas** — Bézier smoothing, pressure-sensitive line width, stroke-level undo
- **Deterministic grading** — works fully offline with no API key
- **AI tutor feedback** — optional Claude vision reviews your handwritten work (enable Tutor Mode)

## Project Structure

| File | Responsibility |
|------|----------------|
| `app.py` | FastAPI server — SPA fallback + `/api/review-work` vision endpoint |
| `static/app.js` | SPA router, screen renderers, quiz logic, vision wiring |
| `static/problems.js` | 17 problem generators + deterministic answer checking |
| `static/chapters.js` | Curriculum — 5 chapters, lesson HTML, quiz thresholds |
| `static/canvas.js` | Apple Pencil drawing engine — Bézier smoothing, undo, DPR scaling |
| `static/style.css` | Duolingo-inspired design system (dark theme, 3D buttons, animations) |
| `static/index.html` | SPA shell |

## Architecture Notes

- Grading is **always deterministic** (browser-only, no API calls). Vision is an optional enhancement layer that never affects pass/fail.
- Progress persists in `localStorage` under key `qp`.
- Hash-based routing (`#/`, `#/lesson/N`, `#/practice/N`, `#/quiz/N`) — full SPA with no server-side routing.
- Canvas uses `setTransform(d,0,0,d,0,0)` instead of `scale()` to prevent cumulative DPR transform stacking on resize.

## Phase 2 (planned)

Dirac notation · Pauli matrices · Bloch sphere visualization · Qubit state simulation

---

*Screenshot placeholder — add after first run on iPad.*
