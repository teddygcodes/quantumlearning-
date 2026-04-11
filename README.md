# Quantum Primer

A Duolingo-style quantum computing learning app built for iPad with Apple Pencil support. Takes students from basic algebra through quantum circuits with interactive lessons, practice problems, and quizzes.

## Curriculum

### Phase 1 — Math Foundations
| Ch | Title | Topics |
|----|-------|--------|
| 1 | Algebra Refresher | Linear equations, substitution, square roots, exponents |
| 2 | Vectors in 2D | Vector addition, scalar multiplication, magnitude |
| 3 | Unit Vectors | Normalization, unit vector checks, quantum probability |
| 4 | Complex Numbers | Addition, multiplication, conjugate, magnitude |
| 5 | Matrices | Matrix-vector multiply, matrix-matrix multiply, identity |

### Phase 2 — Quantum Computing
| Ch | Title | Topics |
|----|-------|--------|
| 6 | Dirac Notation | Bra-ket formalism, inner products, orthogonality, probability |
| 7 | Quantum Gates | Pauli X/Y/Z, Hadamard, gate composition |
| 8 | Measurement | Born rule, state collapse, expected counts |
| 9 | Tensor Products | Two-qubit basis, tensor products, separability |
| 10 | Entanglement | CNOT gate, Bell states, entangled measurement |
| 11 | Quantum Circuits | Circuit tracing, output probabilities, equivalence |

## Features

- **41 problem generators** with deterministic grading (no AI required)
- **Worked examples** in every lesson before practice problems
- **Worked solutions** shown on incorrect answers
- **Apple Pencil notepad** for working out problems by hand
- **Optional AI tutor** — vision-based feedback on handwritten work via Claude API
- **Progress tracking** — localStorage persistence, sequential chapter unlocking
- **Quiz gates** — pass the quiz to unlock the next chapter

## Running

```bash
pip install fastapi uvicorn anthropic python-dotenv
python app.py          # serves at http://0.0.0.0:8000
```

The app is fully functional without an API key. Set `ANTHROPIC_API_KEY` in `.env` for the optional AI tutor feature.

## Architecture

- `app.py` — FastAPI server + `/api/review-work` (optional AI feedback)
- `static/app.js` — SPA router, state machine, all screen renderers
- `static/problems.js` — 41 problem generators + answer checker (numeric, vector, vector4, complex, matrix, yesno)
- `static/chapters.js` — 11 chapters of curriculum with lesson HTML
- `static/canvas.js` — Apple Pencil drawing engine with palm rejection
- `static/style.css` — Duolingo-inspired dark theme design system

All grading runs in the browser. The server only handles static files and the optional AI review endpoint.

## Tech Stack

- **Frontend:** Vanilla JS (ES modules), HTML5 Canvas
- **Backend:** Python, FastAPI
- **AI (optional):** Anthropic Claude API for vision-based work review
- **Target device:** iPad with Apple Pencil (also works on desktop)
