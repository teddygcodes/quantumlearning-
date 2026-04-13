# Codebase Refactor — Split Monoliths & Polish

## Problem

Three files have grown too large through 8 phases of rapid feature shipping:

| File | Lines | Issue |
|------|-------|-------|
| `problems.js` | 6,061 | 50+ generators + parsing logic, all top-level functions in one file |
| `experiments.js` | 5,288 | 20 independent experiments inlined, 274 cssText assignments |
| `app.js` | 1,600 | Router + state + 5 screen renderers mixed together |
| `style.css` | 1,975 | No utility classes, experiment styles live in JS instead |

`experiment-ui.js` (1,359 lines) is already well-factored — 10 clean exports, no changes needed.

## Goals

1. **No file over ~500 lines** (experiments) or ~800 lines (renderers/generators)
2. **Zero behavior changes** — pure structural refactor, all features identical
3. **Inline styles → CSS classes** where repeated across experiments
4. **Shared parsing utilities** extracted from checkAnswer
5. **Clean import graph** with no circular dependencies

## Non-Goals

- No new features
- No accessibility overhaul (separate effort)
- No build tooling / bundler — stays as vanilla ES modules
- No TypeScript migration

---

## Session 1: Split experiments.js (20 files)

**Current:** `experiments.js` exports a flat `EXPERIMENTS` object with 20 keys. Each experiment is a self-contained `{ title, subtitle, icon, mount(container, callbacks) → cleanup }` object. They share 5 small inline helpers (`rnd`, `shuffle`, `snap`, `makeLabel`, `makeBtn`) at the top of the file.

**Target structure:**
```
static/
  experiments/
    helpers.js          — rnd, shuffle, snap, makeLabel, makeBtn (~50 lines)
    ch01-equation-balancer.js
    ch02-vector-playground.js
    ch03-normalization-machine.js
    ch04-complex-multiplier.js
    ch05-transformation-sandbox.js
    ch06-state-explorer.js
    ch07-gate-laboratory.js
    ch08-quantum-coin-toss.js
    ch09-qubit-combiner.js
    ch10-entanglement-lab.js
    ch11-circuit-puzzler.js
    ch12-bloch-sphere-painter.js
    ch13-phase-clock.js
    ch14-gate-wiring-lab.js
    ch15-teleportation-simulator.js
    ch16-oracle-detective.js
    ch17-quantum-search-race.js
    ch18-noisy-quantum-lab.js
    ch19-period-finder.js
    ch20-hardware-explorer.js
  experiments.js        — barrel file: imports all 20 + re-exports EXPERIMENTS object (~30 lines)
```

**Steps:**
1. Create `static/experiments/helpers.js` — extract the 5 shared helpers
2. For each of the 20 experiments:
   - Create `static/experiments/chNN-name.js`
   - Move the experiment object from `experiments.js` into it
   - Add `import { rnd, shuffle, ... } from './helpers.js'`
   - Add any `experiment-ui.js` imports the experiment uses
   - Export default the experiment object
3. Rewrite `experiments.js` as a barrel file that imports all 20 and exports `EXPERIMENTS`
4. Update cache-bust version on `experiments.js` import in `app.js`
5. Verify: run app, navigate to each experiment route, confirm mount/cleanup works

**Risk:** Each experiment file needs the right subset of `experiment-ui.js` imports. Scan each experiment for which shared components it uses (GridCanvas, BlochSphere, etc.) and add only those imports.

**Estimated effort:** 1 session

---

## Session 2: Split app.js into router + screen modules

**Current:** `app.js` (1,600 lines) contains:
- State management: `DEFAULT_STATE`, `loadState()`, `saveState()` (lines 19-57)
- Router: `route()` + `hashchange` listener (lines 75-92)
- DOM helpers: `setContent()`, `navigate()` (lines 59-73)
- 5 render functions: `renderHome` (170 lines), `renderSandbox` (60 lines), `renderExperiment` (80 lines), `renderLesson` (430 lines), `renderProblemScreen` (670 lines)

**Target structure:**
```
static/
  screens/
    home.js             — renderHome (~200 lines)
    sandbox.js          — renderSandbox (~80 lines)
    experiment.js       — renderExperiment (~100 lines)
    lesson.js           — renderLesson (~450 lines)
    problem.js          — renderProblemScreen (~700 lines)
  state.js              — DEFAULT_STATE, loadState, saveState, state object (~60 lines)
  app.js                — router + imports + DOM helpers (~120 lines)
```

**Steps:**
1. Extract `state.js` — move DEFAULT_STATE, loadState(), saveState(), and the `state` object. Export `state`, `saveState`, `loadState`, `DEFAULT_STATE`.
2. For each render function:
   - Create `static/screens/{name}.js`
   - Move the function into it
   - Import `state`, `saveState` from `../state.js`
   - Import any other deps (CHAPTERS, TEMPLATES, problems, KB, etc.)
   - Export the render function
3. Rewrite `app.js` as router-only: imports screens, calls `route()` on hashchange
4. Update `index.html` cache bust
5. Verify: test all routes (#/, #/lesson/N, #/practice/N, #/quiz/N, #/experiment/N, #/sandbox)

**Key decision:** `state` is mutated in-place throughout the app. The `state.js` module exports the singleton object — all screens import the same reference. This preserves current behavior without a state management rewrite.

**Risk:** `renderLesson` and `renderProblemScreen` are tightly coupled (lesson uses problem screen sub-components). May need shared helpers in a `screens/shared.js`. Examine during extraction.

**Estimated effort:** 1 session

---

## Session 3: Extract shared parsing utilities from problems.js + organize generators

**Current:** `problems.js` (6,061 lines) contains:
- 8 parsers (parseNumeric, parseVector, parseVector4, parseComplex, parseMatrix, parseVector8, parseAngle, parseGateName) — lines 47-100, each called once in checkAnswer
- `checkAnswer()` — line 115, large switch on answerType
- 50+ generator functions — lines ~200-5930, all top-level
- `GENS` object mapping type strings to generators — line 5930
- `generateProblem()` and `generateRandomProblem()` — lines 6035-6061

**Target structure:**
```
static/
  problems/
    parsers.js          — all 8 parsers + checkAnswer (~150 lines)
    generators/
      ch01-algebra.js   — generators for chapter 1 problems
      ch02-vectors.js   — generators for chapter 2 problems
      ...
      ch20-landscape.js
    index.js            — imports all generators, builds GENS, exports generateProblem/generateRandomProblem/checkAnswer
  problems.js           — barrel re-export for backward compatibility (~5 lines)
```

**Steps:**
1. Create `static/problems/parsers.js` — extract parsers + checkAnswer
2. Group generators by chapter (inspect which GENS keys map to which chapters)
3. Create one file per chapter's generators
4. Create `static/problems/index.js` — imports all, builds GENS, exports public API
5. Replace `problems.js` with a barrel re-export (preserves existing imports in app.js)
6. Update cache bust
7. Verify: run lesson mode, practice mode, quiz mode — all answer types work

**Risk:** Generator functions reference each other or share helpers (random number utils, formatting). Identify shared math helpers during extraction and put in `problems/helpers.js`.

**Estimated effort:** 1 session

---

## Session 4: CSS cleanup — extract experiment styles from JS into stylesheet

**Current:** 274 `cssText` assignments in experiments.js, many with repeated patterns:
- `font-family: 'Fira Code', monospace` (hardcoded 15+ times)
- Common button styles, label styles, panel layouts
- Inline `background`, `border-radius`, `padding` patterns

**Target:**
- Add utility classes to `style.css`: `.mono`, `.label`, `.exp-btn`, `.exp-panel`, `.exp-readout`, etc.
- Replace inline `el.style.cssText = "font-family:..."` with `el.className = 'mono exp-readout'`
- Keep truly unique one-off styles inline (position-specific, animation-specific)

**Steps:**
1. Audit all 274 cssText assignments — categorize into repeated patterns vs unique
2. Define 10-15 utility classes in `style.css` covering the most common patterns
3. Replace cssText assignments in each experiment file (from Session 1 split) with class assignments
4. Remove `[data-ch="N"]` color rules — replace with CSS custom properties set via JS (already partially done)
5. Verify: visually check 3-4 experiments to confirm no style regressions

**Estimated effort:** 1 session

---

## Session 5: Event listener cleanup + final polish

**Current:** 30+ `addEventListener` calls across circuit-ui.js and experiments, each manually pushed to `cleanupFns[]`. Easy to miss one.

**Deliverables:**
1. Create `attachListener(el, event, fn, opts)` utility that returns a remove function and auto-registers with a cleanup set
2. Refactor circuit-ui.js to use the utility
3. Refactor experiment files to use it (each experiment's mount() already returns cleanup)
4. Audit for any leaked listeners (ResizeObserver, IntersectionObserver, setInterval)
5. Final pass: verify all 20 experiments, circuit builder, and lesson flow
6. Update line counts in CLAUDE.md

**Estimated effort:** 1 session (lighter session, good for cleanup)

---

## Summary

| Session | Scope | Files touched | Estimated lines moved |
|---------|-------|---------------|----------------------|
| 1 | Split experiments.js → 20 modules + helpers + barrel | experiments.js → 22 new files | ~5,250 |
| 2 | Split app.js → router + state + 5 screens | app.js → 7 new files | ~1,480 |
| 3 | Split problems.js → parsers + chapter generators + barrel | problems.js → ~22 new files | ~5,900 |
| 4 | CSS cleanup — inline styles → utility classes | style.css + 20 experiment files | ~300 new CSS, ~274 JS edits |
| 5 | Event listener utility + final polish | circuit-ui.js + experiment files | ~100 new, ~60 edits |

**Total: 5 sessions.** Each session is independent and shippable — the app works correctly after every session. No session depends on another being complete first, though doing them in order (1→5) is cleanest.

## Verification per session

After each session:
- [ ] App loads with no console errors
- [ ] All 20 chapter routes work (#/lesson/N, #/practice/N, #/quiz/N)
- [ ] All 20 experiment routes work (#/experiment/N)
- [ ] Circuit sandbox works (#/sandbox)
- [ ] localStorage state persists across reload
- [ ] No visual regressions in any screen
