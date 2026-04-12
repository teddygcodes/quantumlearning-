# Chapter Experiments — Spec

## Concept

Each chapter gets an **Experiment** — an interactive sandbox that unlocks after completing the chapter's lessons. Experiments build intuition through free-form play and discovery, not more problem sets.

The key difference from lessons:
- **Lessons**: "Here's how to do this. Now do it." → Structured, scaffolded, graded
- **Experiments**: "Here's a toy. Play with it." → Open-ended, exploratory, no pass/fail

### Sandbox Design Principles
- **No scoring** — track engagement silently (e.g. equations explored) but never grade
- **No rounds** — no "Round 1/5", no forced progression, user explores freely
- **No completion screen** — `onComplete` silently marks state, user stays in sandbox
- **Live feedback** — show formulas, readouts, and visual changes in real time as user interacts
- **Endless play** — "New Equation" / "Random Vector" / "Reset" buttons for infinite exploration
- **Discovery prompts** — optional callouts that appear after engagement, never required

---

## Architecture

### New File: `static/experiments.js`
Contains experiment definitions, game logic, and rendering for each chapter's experiment.

### New File: `static/experiment-ui.js`
Shared UI components: GridCanvas, PhysicsBeam, drag handler, tween, toast.

### Files Modified
| File | Change |
|---|---|
| `static/app.js` | New route `/experiment/:chapterId`, unlock logic, badge tracking |
| `static/style.css` | Experiment-specific styles, game UI |

### Home Screen Integration
After completing a chapter's lessons + quiz, the chapter node on the home screen shows a new icon:
```
[Chapter 5: Matrices]
✅ Complete
🔬 Experiment available
```

### State Tracking
```js
// Added to chapter state
{
  unlocked, completed, quizScore, bestScore, practiceCount, lessonProgress,
  experimentCompleted: false,  // true after student engages
  experimentStats: {}          // chapter-specific tracking
}
```

---

## Experiments by Chapter

### Chapter 1: Algebra Refresher
**Experiment: "Equation Balancer"**

A visual balance beam where the student performs algebra operations to isolate x. The beam tilts based on whether the equation is balanced.

**How it works**:
- Screen shows an equation (e.g., "3x + 2 = 14") and a balance beam
- Three operation buttons: "Subtract 2", "Add 3", "Divide by 3" (one correct, two distractors)
- Choosing the correct operation → beam balances with smooth animation, equation simplifies
- Choosing wrong → beam wobbles, try again (no penalty)
- After solving: "New Equation" button generates a fresh equation at varying difficulty
- Engagement counter: "Equations explored: N" (shown subtly, not as a score)
- Difficulty ramps naturally — early equations are `x + 3 = 7`, later ones are `4x - 5 = 2x + 11`
- The student sees algebra as *maintaining balance*, not symbol manipulation

**Live feedback**: Beam physics respond in real time. Each operation shows the algebraic step.

**Built in Session 1** ✅

---

### Chapter 2: Vectors in 2D
**Experiment: "Vector Playground"**

A free-form 2D grid sandbox for dragging vectors, adding them tip-to-tail, and scaling with a slider.

**How it works**:
- Canvas with x/y grid, origin at center
- Drag Vector A freely — components and magnitude update in real time
- Toggle Vector B on/off — shows tip-to-tail addition with resultant vector
- Scale slider (-3x to 3x) — watch vectors grow, shrink, and flip direction in real time
- Live readouts always visible: components (x, y), magnitude |v|, angle θ
- "Random Vector" button for quick exploration
- No challenges, no prompts — pure exploration of how vectors combine

**Live feedback**: All readouts (components, magnitude, angle, sum) update continuously as user drags.

**Built in Session 1** ✅

---

### Chapter 3: Unit Vectors
**Experiment: "Normalization Machine"**

Drag any vector and watch the normalization formula compute in real time, with the unit vector drawn on the unit circle.

**How it works**:
- Student drags a vector freely on the grid
- Unit circle drawn as dashed overlay
- Normalized vector drawn in green, always touching the unit circle
- Live formula display updates continuously: v, |v|, v̂ = v/|v|, |v̂|
- "Random Vector" button generates a new starting vector
- Endless exploration — drag as many vectors as you want, watch them all normalize to the same circle
- The "aha" comes naturally: every vector, no matter how big or small, maps to the same circle

**Live feedback**: Formula, magnitude, and normalized vector all update in real time during drag.

**Built in Session 1** ✅

---

### Chapter 4: Complex Numbers
**Experiment: "Complex Number Explorer"**

An interactive Argand diagram (complex plane) where the student plots and manipulates complex numbers visually.

**How it works**:
- Complex plane with real axis (horizontal) and imaginary axis (vertical)
- Tap/drag to place a complex number — coordinates, magnitude, and phase shown live
- Operation buttons: "Add", "Multiply", "Conjugate"
  - Place two numbers → tap Add → parallelogram rule animates
  - Place two numbers → tap Multiply → one rotates and scales the other (rotation = phase addition, scaling = magnitude multiplication)
  - Tap Conjugate → point reflects across real axis
- "i Machine" button: tap repeatedly to multiply by i — watch the point rotate 90° each time: 1 → i → -1 → -i → 1. The i-cycle from lessons, now visible.
- "Random" button for quick exploration
- Live readouts: rectangular form (a + bi), polar form (r∠θ), magnitude, phase

**Live feedback**: All readouts update as user drags. Multiplication visually shows rotation + scaling.

**Discovery prompts** (appear after some exploration, optional):
- "Multiply 1+i by itself repeatedly. What shape does it trace?" → Spiral
- "What does multiplying by i always do to the angle?" → Adds 90°

---

### Chapter 5: Matrices
**Experiment: "Transformation Sandbox"**

A 2D grid with a shape (letter F) that the student transforms by applying matrices. See rotation, reflection, scaling, and shearing happen visually.

**How it works**:
- An asymmetric shape (letter F) sits on the grid — asymmetry makes every transformation visible
- Pre-built transform buttons: Rotate 90°, Reflect X, Reflect Y, Scale 2x, Shear, Identity
- Custom matrix input: 2×2 grid [[a,b],[c,d]] with an "Apply" button
- Transformations chain — apply multiple and see cumulative effect
- "Undo" pops the last transformation (applies inverse matrix)
- "Reset" returns to original shape
- Live display: current transformation matrix shown, determinant computed
- The student discovers that matrices ARE transformations — not just numbers in a grid

**Live feedback**: Shape transforms instantly. Matrix and determinant update in real time.

**Discovery prompts** (optional):
- "Apply Rotate 90° four times. What happens?" → Returns to original (rotation by 360°)
- "Apply two transforms in different orders. Same result?" → Usually not (AB ≠ BA)

---

### Chapter 6: Dirac Notation
**Experiment: "State Space Navigator"**

An interactive visualization showing how ket notation maps to the Bloch sphere and how inner products measure similarity between states.

**How it works**:
- Split display: ket notation on one side, Bloch sphere on the other
- Sliders for α and β: |ψ⟩ = α|0⟩ + β|1⟩ — point on Bloch sphere moves in real time
- Probability bars: P(|0⟩) = |α|² and P(|1⟩) = |β|² update live
- Inner product tool: set two states, see ⟨ψ|φ⟩ computed live — value shrinks as states separate, hits 0 when orthogonal, hits 1 when identical
- Orthogonality indicator: fires when ⟨ψ|φ⟩ = 0 (arrows are perpendicular on sphere)
- Preset states: |0⟩, |1⟩, |+⟩, |−⟩ buttons for quick exploration
- Free exploration — drag sliders endlessly, watch everything respond

**Live feedback**: Bloch sphere, probabilities, and inner product all update continuously.

---

### Chapter 7: Quantum Gates
**Experiment: "Gate Laboratory"**

Pick a gate, pick an input state, watch the transformation on the Bloch sphere. Chain gates and discover identities through play.

**How it works**:
- Bloch sphere with a state arrow
- Gate buttons: X, Y, Z, H — tap to apply with smooth animation
  - X: 180° rotation around X-axis (|0⟩ ↔ |1⟩)
  - Z: 180° rotation around Z-axis (phase flip)
  - Y: 180° rotation around Y-axis
  - H: rotation to equator (|0⟩ → |+⟩)
- State display: current |ψ⟩ in ket notation, updated after each gate
- "Reset to |0⟩" / "Reset to |1⟩" / "Reset to |+⟩" buttons
- Gate history log: shows sequence of gates applied (e.g., "H → Z → H")
- "Undo" button pops last gate
- Free exploration — apply gates in any order, any number of times

**Live feedback**: Bloch sphere animates smoothly for each gate. State notation updates instantly.

**Discovery prompts** (appear after some exploration, optional):
- "Apply any gate twice. What happens?" → Most return to start (X² = I, Z² = I, H² = I)
- "Apply H, then Z, then H. Compare to just X." → HZH = X

---

### Chapter 8: Measurement
**Experiment: "Quantum Coin Toss Lab"**

Create quantum states and measure them repeatedly, building up histograms and experiencing quantum randomness firsthand.

**How it works**:
- Sliders set the state: |ψ⟩ = α|0⟩ + β|1⟩
- Born rule probabilities shown live: P(|0⟩) = |α|², P(|1⟩) = |β|²
- Big "MEASURE" button — each tap collapses the state, result appears as a ball dropping into a bin
- Histogram builds up over time — watch it start noisy and gradually converge
- Rapid-fire button: "Measure 100x" for quick histogram building
- State collapse visualization: after measuring, Bloch sphere arrow snaps to |0⟩ or |1⟩
- "Reset State" prepares a new copy (because measurement destroys)
- Measurement counter: "Measurements: N" (engagement tracking, not scoring)

**Live feedback**: Histogram updates with each measurement. Probabilities shown alongside actual frequencies.

**Discovery prompts** (optional):
- "Set P(|0⟩) = 0.5. Measure 10 times. Did you get exactly 5-5?" → Probably not — randomness is real
- "Can you find a state where measurement is ALWAYS |1⟩?" → |1⟩ pure state

---

### Chapter 9: Tensor Products
**Experiment: "Qubit Combiner"**

Combine two single-qubit states into a two-qubit state, seeing the tensor product computed visually in real time.

**How it works**:
- Two Bloch spheres side by side (Qubit A, Qubit B)
- Sliders set each qubit's state independently
- Below: 4-element state vector |00⟩, |01⟩, |10⟩, |11⟩ with probability bars — updates live
- Separability indicator: always shows "This state IS separable" (green) — because you're constructing from independent qubits
- Preset buttons: |0⟩⊗|0⟩, |+⟩⊗|−⟩, etc.
- Free exploration — adjust either qubit, watch the 4-element vector respond

**Live feedback**: State vector and probability bars update continuously as sliders move.

**Discovery prompt** (optional):
- "Can you make P(|00⟩) = P(|11⟩) = 0.5 with P(|01⟩) = P(|10⟩) = 0?" → Impossible with this tool — that's a Bell state (entangled). Teases Chapter 10.

---

### Chapter 10: Entanglement
**Experiment: "Entanglement Lab"**

Build Bell states and measure one qubit — watch the other qubit's state instantly update. Repeated measurements reveal perfect correlations.

**How it works**:
- Pre-loaded Bell state circuit: H on qubit 0, CNOT from qubit 0 to qubit 1
- "Prepare Bell State" button creates the entangled pair
- Two measure buttons: "Measure Qubit 0" and "Measure Qubit 1"
- Measure one → result appears → other qubit's state INSTANTLY updates to match
- Measurement log fills up: each row shows (Qubit 0, Qubit 1) results
- Correlation counter: "Times matched: N/N" — updates after each measurement
- Bell state selector: switch between |Φ+⟩ (correlated) and |Ψ+⟩ (anti-correlated)
- "New Pair" button prepares a fresh entangled state
- Free exploration — measure as many pairs as you want

**Live feedback**: Measurement results appear instantly. Correlation counter updates in real time.

**Discovery prompt** (optional):
- "Switch to |Ψ+⟩. Now what happens?" → Always opposite results

---

### Chapter 11: Quantum Circuits
**Experiment: "Circuit Puzzler"**

A sandbox circuit builder where the student drags gates onto wires and tests circuits against target outputs.

**How it works**:
- Available gates in a toolbox: X, H, Z, CNOT (more unlock as you explore)
- 1-2 qubit wires — drag gates onto them freely
- "Run" button executes the circuit, shows output state and measurement histogram
- Optional target mode: a target output is shown, student builds a circuit to match it
  - Targets are suggestions, not requirements — student can ignore and build anything
  - Green check when output matches a target, but no penalty for not matching
- "Clear Circuit" resets wires
- "Random Target" generates a new goal to aim for (optional)
- Gate count display: shows how many gates used (for self-optimization, not scoring)
- Free-build mode is the default — targets are just for inspiration

**Live feedback**: Output state and histogram update each time the circuit runs.

---

### Chapter 12: Rotation Gates
**Experiment: "Bloch Sphere Painter"**

Use rotation gate sliders as brushes to paint trails on the Bloch sphere, discovering how Rx, Ry, Rz each trace different paths.

**How it works**:
- Bloch sphere with a state arrow that leaves a colored trail
- Three sliders: Rx(θ), Ry(θ), Rz(θ) — drag to rotate continuously
  - Rx: traces a vertical circle (front-to-back)
  - Ry: traces a vertical circle (left-to-right)
  - Rz: traces a horizontal circle (latitude line)
- Trails persist — creating geometric patterns on the sphere
- "Clear Trails" button resets the sphere
- "Reset to |0⟩" returns the state arrow to the north pole
- Color picker for trail color (optional — different colors for different rotation axes)
- Free exploration — paint patterns endlessly

**Live feedback**: Trail draws in real time as sliders move. State notation updates continuously.

**Discovery prompt** (optional):
- "Start at |0⟩. Can you move using ONLY Rz?" → No — Rz only changes phase at the poles, the arrow doesn't visibly move

---

### Chapter 13: Phase Gates
**Experiment: "Phase Clock"**

A clock face showing the phase of |1⟩'s amplitude. Phase gates rotate the clock hand in fixed increments.

**How it works**:
- Circular clock display labeled 0 to 2π
- State: |ψ⟩ = (1/√2)(|0⟩ + e^(iφ)|1⟩) — φ shown as clock hand angle
- Gate buttons: T (+π/4), S (+π/2), Z (+π), T† (−π/4), S† (−π/2)
- Each tap rotates the clock hand by the gate's phase angle
- Running phase display: shows accumulated phase as both angle and gate decomposition
  - e.g., "π/4 + π/4 + π/2 = π" → "T + T + S = Z"
- "Reset" returns phase to 0
- Free exploration — apply gates in any order, watch the hand spin

**Live feedback**: Clock hand animates smoothly. Phase formula updates after each gate.

**Discovery prompt** (optional):
- "How many T gates equal one Z gate?" → 4 (because 4 × π/4 = π)

---

### Chapter 14: Multi-Qubit Gates
**Experiment: "Gate Wiring Lab"**

Build multi-qubit gates from simpler ones and verify equivalence by testing all inputs.

**How it works**:
- Split view: left shows a target gate (e.g., SWAP), right is a blank circuit
- Gate toolbox: CNOT, H, T, T†, X, Z
- Student drags gates to build an equivalent circuit
- "Test All Inputs" button: runs every basis state through both circuits, compares outputs
  - Green table: all match. Red cells: mismatches found.
- Pre-loaded puzzles (suggestions, not requirements):
  - SWAP from three CNOTs
  - CZ from H + CNOT + H
  - Toffoli decomposition (hard — "Show Hint" available)
- "New Puzzle" cycles through equivalences
- "Free Build" mode: build any circuit, test any equivalence
- No scoring — the green/red table IS the feedback

**Live feedback**: Test results appear instantly. Matching outputs highlighted in green.

---

### Chapter 15: Quantum Teleportation
**Experiment: "Teleportation Simulator"**

Step-by-step interactive simulation of the teleportation protocol with Alice and Bob on opposite sides of the screen.

**How it works**:
- Split screen: Alice (left), Bob (right), classical channel (bottom)
- Alice has |ψ⟩ on her Bloch sphere — student sets it with sliders
- Shared entangled pair shown as a glowing line connecting Alice and Bob
- Step buttons walk through the protocol:
  1. "Apply CNOT" on Alice's side
  2. "Apply H" on Alice's qubit
  3. "Measure" Alice's qubits → result appears (e.g., "01")
  4. Classical bits animate traveling to Bob
  5. Student chooses Bob's correction gate based on Alice's bits
- If wrong correction: Bob's state doesn't match → "Try a different gate"
- If correct: Bob's sphere matches Alice's original → visual confirmation
- "New State" resets with a new |ψ⟩ for another run
- State vector shown at every step for the full 3-qubit system
- Key visual: Alice's qubit is DESTROYED after measurement — the state moved without traveling

**Live feedback**: State vector and Bloch spheres update at each protocol step. Classical bits animate across the channel.

---

### Chapter 16: Deutsch-Jozsa Algorithm
**Experiment: "Oracle Detective"**

Explore how quantum queries solve oracle problems faster than classical ones. Compare classical vs quantum approaches side by side.

**How it works**:
- A hidden function f: input → output (constant or balanced)
- Classical mode: feed in inputs one at a time, see outputs, figure out the function type
  - Student can query as many times as they want — counter shows "Queries used: N"
- Quantum mode: one button runs the Deutsch circuit — output |0⟩ = constant, |1⟩ = balanced
  - Always takes exactly 1 query
- Side-by-side comparison: classical query count vs quantum query count
- "New Oracle" button generates a fresh hidden function
- Scale selector: 1-bit, 2-bit, 3-bit inputs — watch the classical query count grow while quantum stays at 1
- Running tally: "Classical total queries: N, Quantum total queries: M" across all oracles explored
- Free exploration — try as many oracles as you want at any scale

**Live feedback**: Query results appear instantly. Tally updates after each oracle solved.

---

### Chapter 17: Grover's Search
**Experiment: "Quantum Search Race"**

Visual side-by-side race between classical search and Grover's algorithm. Watch amplitude amplification happen in real time.

**How it works**:
- Grid of N items (adjustable: 4, 8, 16, 32) with one marked item (hidden)
- Left panel: "Classical Search" — highlights cells one by one, sequentially
- Right panel: "Grover's Search" — amplitude bars for all items
  - Oracle step: marked item's bar dips negative
  - Diffusion step: bars reflect about the mean — marked item grows, others shrink
  - After ~√N iterations: marked item dominates → "Measure" picks it
- "Race!" button runs both simultaneously
- Step-by-step mode: tap through each Grover iteration manually, watching the bars shift
- Size selector: change N to see the gap widen (N=4: 2 vs 1, N=64: ~32 vs ~6)
- "New Search" randomizes the marked item
- Free exploration — race at any size, step through at any pace

**Live feedback**: Amplitude bars animate in real time. Classical search highlights cells one by one. Speed comparison visible immediately.

---

### Chapter 18: Quantum Error Correction
**Experiment: "Noisy Quantum Lab"**

Run circuits with and without error correction. A noise slider lets you feel how errors degrade results and how error correction fights back.

**How it works**:
- Simple circuit: prepare a state, measure
- Noise slider: 0% to 50% error probability
- "Run 100 Measurements" button — histogram shows results
- Without error correction:
  - 0% noise: clean results
  - 10% noise: histogram gets messy
  - 30% noise: nearly random
- Toggle "Error Correction: ON" (3-qubit bit-flip code)
  - Same noise levels but results stay much cleaner
- Side-by-side comparison: corrected vs uncorrected at same noise level
- "Errors caught" counter: "Detected and fixed: N out of 100 runs"
- Noise slider is freely adjustable — explore any noise level
- Free exploration — run measurements endlessly at any noise setting

**Live feedback**: Histogram updates with each batch. Error counter updates in real time.

**Discovery prompt** (optional):
- "Crank noise above ~45%. Does error correction still help?" → No — too much noise overwhelms the code (threshold effect)

---

### Chapter 19: Shor's Algorithm
**Experiment: "Period Finder"**

Interactive visualization of period finding in modular exponentiation — the heart of Shor's algorithm.

**How it works**:
- Student picks N to factor (15, 21, 35) and a base a
- Table fills in: a¹ mod N, a² mod N, a³ mod N, ... — student can see the repeating pattern
- Graph plots values — the periodic structure is visible
- "Find Period" prompt: student identifies r from the pattern
- Calculator: plug in r to compute gcd(a^(r/2) ± 1, N) → factors appear
- QFT visualization: same sequence shown as frequency spectrum
  - Before QFT: pattern spread across all inputs
  - After QFT: sharp peaks at multiples of N/r → period readable from peak spacing
  - Caption: "The quantum computer does this step exponentially faster"
- "New Number" button to try different N and a values
- Sometimes it fails (odd period, trivial factor) — student discovers you sometimes need to retry

**Live feedback**: Table, graph, and QFT spectrum all update as parameters change.

---

### Chapter 20: The Landscape
**Experiment: "Quantum Hardware Explorer"**

Interactive comparison of quantum computing platforms, plus a "build your quantum computer" configurator.

**How it works**:
- Comparison view: 5 qubit technologies (Superconducting, Trapped Ion, Photonic, Neutral Atom, Topological)
  - Radar charts showing strengths/weaknesses on 5 axes: qubit count, gate fidelity, coherence time, connectivity, operating temperature
  - Tap a technology for details: which companies use it, current records, key tradeoffs
- "Build Your Quantum Computer" configurator:
  - Choose technology → sets base parameters
  - Qubit slider → shows what algorithms you can run at that scale:
    - 5 qubits: toy problems
    - 50 qubits: quantum advantage demonstrations
    - 100 logical qubits: useful chemistry simulation
    - 4000 logical qubits: Shor's on RSA-2048
  - Physical qubit calculator: "4000 logical × ~1000 physical per logical = 4M physical qubits needed"
- "Your Journey" section:
  - Visual map of every concept learned across 20 chapters
  - Total engagement stats (not scores)
  - Links to next steps: Qiskit, Cirq, textbooks, courses

**Live feedback**: Radar charts and configurator update in real time as selections change.

---

## Implementation Summary

| Chapter | Experiment Name | Core Mechanic | Key Library Needs |
|---|---|---|---|
| 1 | Equation Balancer | Balance beam + operation buttons | Canvas animation |
| 2 | Vector Playground | Drag vectors + live readouts | Canvas, vector math |
| 3 | Normalization Machine | Drag → normalize with live formula | Canvas, unit circle |
| 4 | Complex Number Explorer | Interactive Argand diagram | Canvas, complex math |
| 5 | Transformation Sandbox | Matrix transforms on shapes | Canvas, matrix math |
| 6 | State Space Navigator | Bloch sphere + sliders + inner product | 2D Bloch projection |
| 7 | Gate Laboratory | Gate buttons + Bloch sphere animation | 2D Bloch sphere |
| 8 | Quantum Coin Toss Lab | Measure button + histogram builder | Canvas, RNG |
| 9 | Qubit Combiner | Dual Bloch spheres + tensor product | Bloch sphere × 2 |
| 10 | Entanglement Lab | Bell state measurement + correlation log | Circuit sim, RNG |
| 11 | Circuit Puzzler | Drag-and-drop circuit builder | Circuit sim |
| 12 | Bloch Sphere Painter | Rotation sliders + trail rendering | Bloch sphere + paths |
| 13 | Phase Clock | Clock face + phase gate buttons | CSS/Canvas clock |
| 14 | Gate Wiring Lab | Build + test equivalences | Circuit sim |
| 15 | Teleportation Simulator | Step-through protocol + Alice/Bob | Circuit sim, animation |
| 16 | Oracle Detective | Classical vs quantum query comparison | Oracle sim |
| 17 | Quantum Search Race | Side-by-side race + amplitude bars | Bar animation |
| 18 | Noisy Quantum Lab | Noise slider + error correction toggle | Noisy sim |
| 19 | Period Finder | Modular exponentiation + QFT viz | Graphing |
| 20 | Hardware Explorer | Radar charts + configurator | Data viz |

### Shared Components Needed
- **Bloch sphere renderer**: Used in Ch 6, 7, 8, 9, 10, 12. Build once, reuse. 2D projection is fine.
- **Circuit simulator**: Used in Ch 10, 11, 14, 15. Gate application + state tracking.
- **Histogram renderer**: Used in Ch 8, 10, 17, 18. Animatable HTML/CSS bar chart.
- **GridCanvas**: Already built (experiment-ui.js). Used in Ch 1-5.

### Build Order (by session)

| Session | Experiments | Key shared component |
|---------|-------------|----------------------|
| 1 ✅ | Ch 1-3 (Equation Balancer, Vector Playground, Normalization Machine) | GridCanvas, PhysicsBeam |
| 2 | Ch 4-5 (Complex Number Explorer, Transformation Sandbox) | Extend GridCanvas for complex plane |
| 3 | Ch 6-8 (State Space Navigator, Gate Laboratory, Quantum Coin Toss Lab) | BlochSphere renderer, HistogramRenderer |
| 4 | Ch 9-11 (Qubit Combiner, Entanglement Lab, Circuit Puzzler) | CircuitSimulator |
| 5 | Ch 12-14 (Bloch Sphere Painter, Phase Clock, Gate Wiring Lab) | BlochSphere trails, clock face |
| 6 | Ch 15-17 (Teleportation Simulator, Oracle Detective, Quantum Search Race) | Animation sequencer |
| 7 | Ch 18-20 (Noisy Quantum Lab, Period Finder, Hardware Explorer) | Noise sim, RadarChart |
