# Quantum Primer — Dev Notes

## Running
```bash
python app.py          # serves at http://0.0.0.0:8000
# iPad: http://192.168.254.34:8000
```

## Key files
- `app.py`             — FastAPI server + `/api/ask`, `/api/read-answer`, `/api/review-work`
- `static/app.js`      — SPA router + all screen renderers + sub-problem progression loop
- `static/templates.js` — 87 dynamic teaching unit templates (teaching text + worked example + problem per variation)
- `static/problems.js` — 87 problem generators with variation support + answer checkers (10 answer types)
- `static/chapters.js` — 20 chapters of curriculum with progression arrays and lesson structure
- `static/keyboard.js`  — Custom answer keyboard (context-aware per answer type)
- `static/canvas.js`   — Apple Pencil drawing engine
- `static/experiments.js` — Interactive experiment definitions per chapter (mount/cleanup pattern)
- `static/experiment-ui.js` — Shared experiment components (GridCanvas, PhysicsBeam, BlochSphere, HistogramRenderer, CircuitSimulator, ClockFace, drag, tween, toast)
- `static/style.css`   — Full Duolingo-inspired design system

## Architecture
- **Deterministic grading** runs entirely in the browser — never uses AI.
- **Ask Tutor** (`/api/ask`) — context-aware AI chat, available before and after answering.
- **Vision feedback** (`/api/review-work`) is the optional enhancement layer.
- App is fully functional without an API key.
- Progress persists in `localStorage` under key `qp`.
- Hash-based client routing: `#/`, `#/lesson/N`, `#/practice/N`, `#/quiz/N`, `#/experiment/N`.

## Dynamic teaching unit system
Templates in `templates.js` generate complete teaching units per sub-problem:
- `TEMPLATES[problemType].generate(difficulty, variation)` returns `{ teachingText, workedExample, tryIt }`
- Worked example and practice problem are structurally identical but use different random numbers
- On retry, the entire left panel re-renders with fresh numbers (both example and problem)
- All 87 problem types fully migrated — no static HTML fallback needed
- The static fallback path in `app.js` is retained for safety but never triggered

### tryIt shape (must match checkAnswer interface)
```js
tryIt: {
  question: string,        // problem text
  answer: ...,             // numeric→number, vector→[x,y], complex→[re,im], matrix→[[a,b],[c,d]], yesno→boolean, angle→radians, gate_name→string, choice→letter
  answerType: string,      // 'numeric' | 'vector' | 'vector4' | 'vector8' | 'complex' | 'matrix' | 'yesno' | 'angle' | 'gate_name' | 'choice'
  answerDisplay: string,   // formatted answer string for display on wrong answer
  steps: string[],         // step-by-step solution
  whyItMatters: string,    // shown after answering
  choices: string[],       // (choice type only) e.g. ['A) ...', 'B) ...', 'C) ...', 'D) ...']
  acceptAlternate: any,    // (optional) alternate accepted answer (e.g. either factor in factoring problems)
}
```

## Lesson progression system
Each lesson step has a `progression` array of 3-5 sub-problems with escalating difficulty/variation.
- `subProbIdx` tracks position within the current step's progression
- `lessonProgress: { stepIdx, subProbIdx }` persists to localStorage for resume
- Progress bar reflects sub-problem granularity, not just step count
- Anti-frustration: after 2 wrong attempts on the same variation, worked solution shows inline
- Practice and quiz modes are unaffected — they use `problems.js` generators directly

## Generator variation system
All 87 generators accept `(d, variation = 'basic')`. The `variation` param controls problem
structure (negatives, edge cases, extended operations). The `difficulty` param controls number
ranges. When no variation is passed (practice/quiz), generators produce identical output to
the original code.

## Answer types
| Type | Parser | Checker | UI |
|------|--------|---------|----|
| `numeric` | `parseFloat` | Tolerance (TOL=0.02) | Custom KB: 0-9, `.`, `−` |
| `vector` | Split on comma, 2 elements | Element-wise tolerance | Custom KB: 0-9, `.`, `−`, `,` |
| `vector4` | Split on comma, 4 elements | Element-wise tolerance | Custom KB: 0-9, `.`, `−`, `,` |
| `vector8` | Split on comma, 8 elements | Element-wise tolerance | Custom KB: 0-9, `.`, `−`, `,` |
| `complex` | Regex for `a + bi` format | Real + imag tolerance | Custom KB: 0-9, `.`, `−`, `+`, `i` |
| `matrix` | Split on `;` then spaces, 2x2 | Element-wise tolerance | Custom KB: 0-9, `.`, `−`, `;`, space |
| `yesno` | Boolean string parse | Exact match | Yes / No buttons |
| `angle` | Handles `pi/4`, `π/4`, `3pi/2` → radians | Tolerance | Custom KB: 0-9, `π`, `/` |
| `gate_name` | Trim, case-insensitive | Exact match (lowered) | Custom KB: X,Y,Z,H,S,T,†,CNOT |
| `choice` | Trim, uppercase first char | Exact letter match | A/B/C/D choice buttons |

## Cache busting
ES module imports in app.js use query params: `./chapters.js?v=14`, `./problems.js?v=13`, `./templates.js?v=9`, `./keyboard.js?v=2`, `./experiments.js?v=6`, `./experiment-ui.js?v=5`.
Bump these when modifying those files. Also bump `app.js?v=N` in index.html (currently v=51).

## Security note on innerHTML
`root.innerHTML` is used only with HTML strings generated by our own code (hardcoded templates,
chapter content, problem text, and choice button labels). User input (typed answers) is read
via `.value` only and never injected into the DOM.

## Phases built
- **Phase 1:** Chapters 1-5 (math foundations) — algebra, vectors, complex numbers, matrices
- **Phase 2:** Chapters 6-11 (quantum computing fundamentals) — Dirac notation, gates, measurement, tensor products, entanglement, circuits
- **Phase 3:** Multi-problem lesson progressions — 361 sub-problems across 102 steps with structural variations
- **Phase 4:** Dynamic teaching unit system — all 87 problem types migrated to templates, static HTML fully removed from chapters.js
- **Phase 5:** Chapters 12-20 (advanced quantum) — rotation gates, phase gates, multi-qubit gates, teleportation, Deutsch-Jozsa, Grover's, error correction, Shor's algorithm, quantum landscape. Added 4 new answer types (angle, gate_name, vector8, choice) with multiple-choice button UI.
- **Phase 6:** Custom answer keyboard — context-aware on-screen keyboard per answer type (suppresses native keyboard via `inputmode="none"`). Yes/no converted to choice-style buttons. Keyboard in `keyboard.js`, integrated into both lesson and practice/quiz modes.
- **Phase 7 (in progress):** Chapter Experiments — sandbox-style interactive labs that unlock after completing each chapter. No scoring, no rounds, no pass/fail — pure exploration. Session 1 built: architecture + Ch 1 (Equation Balancer), Ch 2 (Vector Playground), Ch 3 (Normalization Machine). Session 2 built: Ch 4 (Complex Multiplier — drag complex numbers, multiply by i or arbitrary numbers, see rotation + scaling animated on complex plane), Ch 5 (Transformation Sandbox — apply preset/custom 2×2 matrices to F-shape, chain transforms, undo, animated morphing with determinant display). Added GridCanvas methods: `drawArc`, `drawPolygon`, `drawAxisLabels`. Session 3 built: Ch 6 (State Explorer — α/β sliders with auto-normalization, probability bars, preset states), Ch 7 (Gate Laboratory — Bloch sphere with X/Y/Z/H gate buttons, animated rotations, gate history, undo), Ch 8 (Quantum Coin Toss — measurement with histogram buildup, rapid-fire 100× mode, Born rule overlay). Added shared components: `BlochSphere` (2D projected Bloch sphere renderer with animated state transitions), `HistogramRenderer` (DOM-based animated bar chart with expected-value overlay). Added quantum math helpers: complex arithmetic, gate matrices, Bloch↔state conversions. Session 4 built: Ch 9 (Qubit Combiner — dual Bloch spheres with θ sliders, live tensor product to 4-element state vector, probability histogram, separability badge, discovery prompt teasing entanglement), Ch 10 (Entanglement Lab — Bell state preparation via CircuitSimulator, measure one qubit → other collapses, correlation tracking, measurement log table, |Φ+⟩/|Ψ+⟩ selector), Ch 11 (Circuit Puzzler — tap-to-place circuit builder with X/H/Z/CNOT on 2 wires, two-tap CNOT flow, run → output state + histogram, optional target mode with match detection). Added shared component: `CircuitSimulator` (1-2 qubit state simulator with single-qubit gates, controlled gates, full/partial measurement, Born rule sampling). Added math helpers: `tensorProduct`, `fmtKet2Q`.
- **Keyboard scroll fix:** Custom keyboard now shrinks `.problem-screen` via `--kb-height` CSS var, makes `.problem-left` scrollable, and scrolls input into view above the keyboard.
- Session 5 built: Ch 12 (Bloch Sphere Painter — Rx/Ry/Rz incremental rotation sliders paint colored trails on the Bloch sphere, snap-back slider UX, live ket notation + probability display, discovery prompt for Rz global phase insight), Ch 13 (Phase Clock — canvas clock face with phase hand, T/S/Z/T†/S† gate buttons animate hand in fixed increments, running gate decomposition formula with equivalence detection T²=S/S²=Z/T⁴=Z, probability bars showing phase doesn't change probabilities), Ch 14 (Gate Wiring Lab — tap-to-place 2-wire circuit builder with CNOT/H/X/Z/T/T† toolbox, 5 puzzles mapping to Ch 14 lesson content: Build CZ, Build SWAP, CZ symmetry, Create Bell state, Free Build, test-all-inputs truth table with green/red match indicators). Added shared components: `ClockFace` (DPR-aware canvas clock with π/4 tick marks, animated hand, phase arc fill), BlochSphere trail rendering (`addTrailPoint`/`clearTrails`), `T†`/`S†` gates in CircuitSimulator.
- Session 6 built: Ch 15 (Teleportation Simulator — Alice/Bob split screen with dual Bloch spheres, step-through 5-stage protocol: Bell pair → CNOT → H → measure → Bob's correction gate picker, 3-qubit state vector display at every step, classical bits animate across channel, Alice's qubit destroyed on measurement, wrong correction feedback), Ch 16 (Oracle Detective — side-by-side classical vs quantum panels, classical query-by-query with guess button, quantum Deutsch-Jozsa one-shot solve, 1/2/3-bit scale selector showing exponential query gap, running tally scoreboard), Ch 17 (Quantum Search Race — amplitude bar visualization with negative values below zero line, manual Oracle/Diffusion/Measure step-by-step mode, automated Race mode with classical grid animation vs Grover iterations, mean amplitude line, size selector N=4/8/16, formula display). Added shared component: `StepSequencer` (async step-by-step animation controller). Extended `CircuitSimulator` usage to 3 qubits for teleportation. Added `fmtKet3Q` helper for 8-amplitude state display.

## Experiment system
Each chapter gets an interactive experiment that unlocks after chapter completion. Experiments are **sandboxes** — exploratory, no pass/fail, no scoring. They teach through free-form interaction and live feedback. `onComplete` silently marks engagement in state without navigating away; the user stays in the sandbox.

### Architecture
- `EXPERIMENTS[chapterId]` in `experiments.js` — each has `{ title, subtitle, icon, mount(container, callbacks) → cleanup }`
- `mount()` builds DOM, starts game logic, returns a cleanup function for animation/listener teardown
- `experiment-ui.js` provides shared components: `GridCanvas`, `PhysicsBeam`, `BlochSphere`, `HistogramRenderer`, `CircuitSimulator`, `ClockFace`, `StepSequencer`, `createDragHandler`, `animateValue`, `showToast`
- State: `experimentCompleted` and `experimentStats` fields per chapter in localStorage
- Route: `#/experiment/N` — guarded by `cs.completed` (must finish chapter first)
- Cleanup: `experimentCleanup` var at module scope, called on every route change

### State migration
State merge in `loadState()` uses per-field merge so existing users get new experiment fields:
```js
chapters: Object.fromEntries(
  CHAPTERS.map(ch => [ch.id, { ...DEFAULT_STATE.chapters[ch.id], ...(saved.chapters?.[ch.id] || {}) }])
),
```

## Experiment sessions remaining
Build experiments alongside shared components. Each session adds 2-3 experiments + any needed shared UI.

| Session | Experiments | Key shared component to build |
|---------|-------------|-------------------------------|
| 2 ✅ | Ch 4: Complex Multiplier, Ch 5: Transformation Sandbox | Extended GridCanvas: drawArc, drawPolygon, drawAxisLabels |
| 3 ✅ | Ch 6: State Explorer, Ch 7: Gate Laboratory, Ch 8: Quantum Coin Toss Lab | BlochSphere renderer (2D projection), HistogramRenderer |
| 4 ✅ | Ch 9: Qubit Combiner, Ch 10: Entanglement Lab, Ch 11: Circuit Puzzler | CircuitSimulator (gate application + state tracking) |
| 5 ✅ | Ch 12: Bloch Sphere Painter, Ch 13: Phase Clock, Ch 14: Gate Wiring Lab | BlochSphere trail rendering, ClockFace component, T†/S† gates |
| 6 ✅ | Ch 15: Teleportation Simulator, Ch 16: Oracle Detective, Ch 17: Quantum Search Race | StepSequencer, 3-qubit CircuitSimulator usage |
| 7 | Ch 18: Noisy Quantum Lab, Ch 19: Period Finder, Ch 20: Hardware Explorer | Noise simulation, RadarChart, data viz |

### Sandbox design principles
Experiments are NOT quizzes. They must follow these rules:
- **No scoring** — track engagement (e.g. "equations solved: N") but never grade
- **No rounds** — no "Round 1/5", no forced progression, user explores freely
- **No completion screen** — `onComplete` silently marks state, user stays in sandbox
- **Live feedback** — show formulas, readouts, and visual changes in real time as user interacts
- **Endless play** — "New Equation" / "Random Vector" buttons for infinite exploration

### Keyboard scroll behavior
When the custom keyboard appears, it sets `--kb-height` CSS var on `:root`. CSS shrinks `.problem-screen` to `height: calc(100dvh - var(--kb-height))` and makes `.problem-left` scrollable with `overflow-y: auto`. After layout reflow (double rAF), `keyboard.js` calls `input.scrollIntoView({ block: 'center', behavior: 'instant' })` to ensure the input field is visible above the keyboard.

### Experiment spec reference
Full spec for all 20 experiments is in `EXPERIMENT_SPEC.md` at the project root. It contains detailed game mechanics, completion criteria, and pedagogical rationale for each experiment. Refer to it when building Sessions 6-7.
