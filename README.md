# Quantum Primer

An interactive, Duolingo-style quantum computing course built for iPad with Apple Pencil support. Takes students from basic algebra through Shor's algorithm and the quantum computing landscape across **20 chapters**, **361 practice problems**, and **86 unique problem types** — all with deterministic grading that runs entirely in the browser.

## Curriculum

### Phase 1 — Math Foundations (Chapters 1-5)

| Ch | Title | Topics |
|----|-------|--------|
| 1 | Algebra Refresher | Linear equations, substitution, square roots, exponents |
| 2 | Vectors in 2D | Vector addition, scalar multiplication, magnitude |
| 3 | Unit Vectors | Normalization, unit vector checks, quantum probability |
| 4 | Complex Numbers | Addition, multiplication, conjugate, magnitude |
| 5 | Matrices | Matrix-vector multiply, matrix-matrix multiply, identity |

### Phase 2 — Quantum Computing Fundamentals (Chapters 6-11)

| Ch | Title | Topics |
|----|-------|--------|
| 6 | Dirac Notation | Bra-ket formalism, inner products, orthogonality, probability |
| 7 | Quantum Gates | Pauli X/Z, Hadamard, gate-then-measure, gate composition |
| 8 | Measurement | Born rule (complex amplitudes), valid states, expected counts, missing amplitude |
| 9 | Tensor Products | Two-qubit basis, tensor products, joint states, decomposition, measurement probabilities, separability |
| 10 | Entanglement | CNOT gate, Bell states, entangled measurement |
| 11 | Quantum Circuits | Circuit tracing (1- and 2-qubit), output probabilities, equivalence |

### Phase 3 — Advanced Gates & Protocols (Chapters 12-15)

| Ch | Title | Topics |
|----|-------|--------|
| 12 | Rotation Gates | Bloch sphere, Rx/Ry/Rz rotation matrices, Euler decomposition |
| 13 | Phase Gates | S, S-dagger, T, T-dagger gates, phase family relationships |
| 14 | Multi-Qubit Gates | CZ, SWAP, Toffoli (3-qubit), controlled-H/S gates |
| 15 | Quantum Teleportation | Bell pair setup, Alice's operations, measurement, Bob's correction |

### Phase 4 — Algorithms & Applications (Chapters 16-20)

| Ch | Title | Topics |
|----|-------|--------|
| 16 | Deutsch-Jozsa | Constant vs balanced functions, oracle circuits, phase kickback |
| 17 | Grover's Search | Oracle marking, diffusion operator, quadratic speedup, optimality |
| 18 | Error Correction | Bit-flip code, phase-flip code, Shor code, threshold theorem |
| 19 | Shor's Algorithm | Period finding, modular arithmetic, QFT concept, factoring |
| 20 | The Landscape | Qubit technologies, NISQ era, quantum advantage, fault tolerance |

## Features

- **361 sub-problems** across 102 lesson steps in 20 chapters
- **86 problem generators** with structural variations (negatives, edge cases, extended operations) and 10 answer types (numeric, vector, vector4, vector8, complex, matrix, yesno, angle, gate_name, choice)
- **Dynamic teaching units** — teaching text, worked examples, and practice problems advance together in lockstep per sub-problem. The worked example always matches the problem being asked, with different random numbers so students can't copy answers
- **Multiple-choice UI** — conceptual questions (teleportation, algorithms, error correction) render as styled choice buttons rather than text input
- **Anti-frustration system** — after 2 wrong attempts on the same variation, the worked solution appears inline so students don't get stuck
- **"Why This Matters"** — every problem shows a plain-English explanation connecting the math to real quantum computing
- **Ask Tutor** — AI chat powered by Claude, available before, during, and after answering. Gives hints while you work (without spoiling the answer) and explains concepts after you answer
- **Worked solutions** shown on incorrect answers with step-by-step breakdowns
- **Apple Pencil notepad** for working out problems by hand, with palm rejection
- **Optional AI work review** — vision-based feedback on handwritten work via Claude API
- **Progress tracking** — localStorage persistence, sequential chapter unlocking, lesson progress resume
- **Quiz gates** — pass the quiz to unlock the next chapter
- **Chapter Experiments** — sandbox-style interactive labs that unlock after completing each chapter. No scoring, no rounds — pure exploration with live feedback. 11 experiments built so far:
  - Ch 1: Equation Balancer — solve and balance algebraic equations
  - Ch 2: Vector Playground — drag vectors, see addition and magnitude in real time
  - Ch 3: Normalization Machine — stretch and normalize vectors with physics beam
  - Ch 4: Complex Multiplier — multiply complex numbers, see rotation + scaling animated on the complex plane
  - Ch 5: Transformation Sandbox — apply 2×2 matrices to shapes, chain transforms, see determinant
  - Ch 6: State Explorer — adjust α/β amplitudes, watch probability bars change, preset quantum states
  - Ch 7: Gate Laboratory — apply X/Y/Z/H gates to a Bloch sphere, see animated rotations, undo and history
  - Ch 8: Quantum Coin Toss — measure qubits with Born rule, histogram buildup, rapid-fire 100× mode
  - Ch 9: Qubit Combiner — combine two independent qubits via tensor product, dual Bloch spheres, 4-element probability histogram
  - Ch 10: Entanglement Lab — prepare Bell states, measure one qubit and watch the other instantly collapse, correlation tracking
  - Ch 11: Circuit Puzzler — tap-to-place circuit builder with X/H/Z/CNOT gates, run circuits, target matching challenges

## Getting Started

### Prerequisites

- Python 3.10+
- `pip install fastapi uvicorn anthropic python-dotenv`

### Running

```bash
python app.py          # serves at http://0.0.0.0:8000
```

The app is fully functional without an API key. All grading runs deterministically in the browser. To enable the optional AI tutoring chat and vision-based work review, set `ANTHROPIC_API_KEY` in a `.env` file.

### Accessing on iPad

Connect your iPad to the same network and navigate to `http://<your-ip>:8000`.

## Architecture

```
app.py                  FastAPI server + 3 AI endpoints
static/
  app.js                SPA router, state machine, screen renderers, progression loop
  templates.js          86 dynamic teaching unit templates
  problems.js           86 problem generators + answer checker (10 answer types)
  chapters.js           20 chapters with progression arrays and lesson structure
  experiments.js        Interactive experiment definitions per chapter (mount/cleanup pattern)
  experiment-ui.js      Shared experiment components (GridCanvas, BlochSphere, HistogramRenderer, CircuitSimulator)
  keyboard.js           Custom answer keyboard (context-aware per answer type)
  canvas.js             Apple Pencil drawing engine with palm rejection
  style.css             Duolingo-inspired dark theme design system
  index.html            Single-page shell
```

### Server Endpoints

| Endpoint | Purpose | Model |
|----------|---------|-------|
| `/api/ask` | Context-aware AI tutor chat | Claude Sonnet |
| `/api/read-answer` | OCR for handwritten answers | Claude Sonnet (vision) |
| `/api/review-work` | AI feedback on handwritten work | Claude Sonnet (vision) |

### Client-Side Systems

**Dynamic Teaching Units** — Teaching content is generated programmatically from templates defined per problem type. Each template produces a complete teaching unit for a given difficulty and variation:

```js
TEMPLATES[problemType].generate(difficulty, variation)
// Returns: { teachingText, workedExample: { problem, steps, insight }, tryIt: { question, answer, ... } }
```

The worked example and practice problem are structurally identical but use different random numbers. When a student retries, the entire panel re-renders with fresh numbers for both.

**Lesson Progression** — Each lesson step defines a `progression` array of 3-5 sub-problems that escalate in difficulty:

```js
progression: [
  { difficulty: 1, variation: 'basic' },         // mirrors the worked example
  { difficulty: 1, variation: 'with_negatives' }, // introduces negative values
  { difficulty: 2, variation: 'edge_case' },      // zero components, purely real, etc.
  { difficulty: 2, variation: 'extended' },        // more operands or combined operations
]
```

The `variation` parameter controls problem **structure** (negatives, pure-real terms, three operands), while `difficulty` controls **number ranges**. Students must complete all sub-problems in a step before advancing.

**Answer Types** — The client-side grader supports 10 answer formats:

| Type | Format | Example |
|------|--------|---------|
| `numeric` | Number | `42`, `-3`, `1.41` |
| `vector` | 2D vector | `3, 4` |
| `vector4` | 4D vector (2-qubit) | `0.71, 0, 0, 0.71` |
| `vector8` | 8D vector (3-qubit) | `1, 0, 0, 0, 0, 0, 0, 0` |
| `complex` | Complex number | `3 + 4i` |
| `matrix` | 2x2 matrix | `1 2; 3 4` |
| `yesno` | Boolean | `yes` / `no` |
| `angle` | Angle in terms of pi | `pi/4`, `3pi/2` |
| `gate_name` | Gate identifier | `X`, `CNOT`, `S` |
| `choice` | Multiple choice | `A`, `B`, `C`, `D` |

## Tech Stack

- **Frontend:** Vanilla JavaScript (ES modules), HTML5 Canvas, no build step
- **Backend:** Python, FastAPI, Uvicorn
- **AI (optional):** Anthropic Claude API (Sonnet) for tutoring chat and vision-based work review
- **Target device:** iPad with Apple Pencil (also works on desktop browsers)
- **Storage:** localStorage (no database required)

## Screenshots

| Home Screen | Lesson + Notepad |
|:-----------:|:----------------:|
| ![Home screen with skill path](screenshot-home.jpg) | ![Lesson with Apple Pencil notepad](screenshot-app.png) |

## License

This project is for educational use.
