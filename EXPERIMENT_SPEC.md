# Chapter Experiments — Spec

## Concept

Each chapter gets an **Experiment** — an interactive game or lab that unlocks after completing the chapter's lessons. Experiments reinforce the chapter's concepts through play, discovery, and open-ended exploration, not more problem sets.

The key difference from lessons:
- **Lessons**: "Here's how to do this. Now do it." → Structured, scaffolded, graded
- **Experiments**: "Here's a toy. What happens when you..." → Exploratory, surprising, memorable

Experiments don't grade you. They track engagement (time spent, things tried) and award a badge/star on completion, but there's no pass/fail. The goal is intuition and wonder, not correct answers.

---

## Architecture

### New File: `static/experiments.js`
Contains experiment definitions, game logic, and rendering for each chapter's experiment.

### New File: `static/experiment-ui.js`
Shared UI components: sliders, interactive canvases, histogram displays, side-by-side comparisons, scoreboards.

### Files Modified
| File | Change |
|---|---|
| `static/app.js` | New route `/experiment/:chapterId`, unlock logic, badge tracking |
| `static/chapters.js` | Add `experiment` field to each chapter definition |
| `static/style.css` | Experiment-specific styles, game UI |

### Home Screen Integration
After completing a chapter's lessons + quiz, the chapter node on the home screen shows a new icon:
```
[Chapter 5: Matrices]
✅ Complete
🧪 Experiment available
```

Tapping the experiment icon launches the experiment. A small flask/beaker emoji distinguishes it from lessons.

### State Tracking
```js
// Added to chapter state
{
  unlocked, completed, quizScore, bestScore, practiceCount, lessonProgress,
  experimentCompleted: false,  // true after student engages sufficiently
  experimentStats: {}          // chapter-specific tracking (time, attempts, discoveries)
}
```

---

## Experiments by Chapter

### Chapter 1: Algebra Refresher
**Experiment: "Equation Balancer"**

A visual scale/balance with weights on each side. The student drags number blocks and variable blocks to balance the equation. The scale physically tips when unbalanced and levels when solved.

**How it works**:
- Screen shows a seesaw/balance beam
- Left side has blocks representing one side of an equation (e.g., "3x + 2")
- Right side has blocks for the other side (e.g., "14")
- Student drags blocks between sides — whatever you do to one side, you must do to the other
- Remove a "+2" block from the left → must remove "+2" from the right
- Scale animates: tips, balances, wobbles
- Generates 10 equations of increasing complexity
- The student sees algebra as *maintaining balance*, not symbol manipulation

**Completion**: Balance 8 of 10 equations

**Why this works for Ch 1**: Algebra is about equality — both sides must balance. The visual scale makes this visceral. Every operation (add, subtract, divide) has a physical meaning.

---

### Chapter 2: Vectors in 2D
**Experiment: "Vector Playground"**

An interactive 2D grid where the student drags vector arrows around. Adding vectors tip-to-tail, scaling them with a slider, watching magnitude change in real time.

**How it works**:
- Canvas with x/y grid, origin at center
- Drag to draw vectors from any point
- Two vectors snap tip-to-tail to show addition, result vector appears in different color
- Slider controls scalar multiplication — watch the arrow grow/shrink/flip in real time
- Magnitude displays live as you drag: |v| = √(x² + y²) updates continuously
- Challenge prompts appear: "Can you make a vector with magnitude exactly 5?" "Can you add two vectors that cancel to zero?"
- Free exploration mode: draw as many vectors as you want, watch them combine

**Completion**: Complete 5 of 8 challenge prompts

**Why this works for Ch 2**: Vectors are spatial. Seeing them as arrows that combine visually builds the geometric intuition that purely numeric problems miss.

---

### Chapter 3: Unit Vectors
**Experiment: "The Normalization Machine"**

A visual "machine" that takes in any vector and shows the normalization process step by step, with a bullseye target circle of radius 1.

**How it works**:
- Student draws a vector on the grid (any length, any direction)
- The "machine" animates: calculates magnitude, divides, shows the unit vector landing on the unit circle
- All arrows stay visible — original vector (faded) + unit vector (bold) + unit circle
- Student can draw 20+ vectors and watch them all normalize to the same circle
- Key "aha" prompt: "Draw 5 completely different vectors. What do all the unit vectors have in common?" → They all touch the unit circle
- Probability connection: "If these are quantum amplitudes, why does the unit circle matter?" → Total probability = 1

**Completion**: Normalize 10 vectors, answer the "aha" prompt

**Why this works for Ch 3**: Seeing every vector — no matter how big or small — map to the same circle makes normalization intuitive. The unit circle isn't abstract; it's the thing every vector points to.

---

### Chapter 4: Complex Numbers
**Experiment: "Complex Number Explorer"**

An interactive Argand diagram (complex plane) where the student plots complex numbers and performs operations visually.

**How it works**:
- Complex plane with real axis (horizontal) and imaginary axis (vertical)
- Tap to plot a complex number — shows coordinates and magnitude
- Plot two numbers, tap "Add" — watch the parallelogram rule animate
- Plot two numbers, tap "Multiply" — watch one number rotate and scale the other
- Plot a number, tap "Conjugate" — watch it reflect across the real axis
- "i Machine": tap i repeatedly — watch the point rotate 90° each time around the unit circle: 1 → i → -1 → -i → 1. The cycle from Chapter 4 lessons, now visible.
- Challenge: "Multiply 1+i by itself repeatedly. What shape does it trace?" → Spiral

**Completion**: Perform 15 operations, complete 3 of 5 challenges

**Why this works for Ch 4**: Complex multiplication is rotation. This is nearly impossible to internalize from arithmetic alone. Watching i rotate a point 90° makes the i-cycle from the lesson physically obvious.

---

### Chapter 5: Matrices
**Experiment: "Transformation Sandbox"**

A 2D grid with a shape (square, triangle, letter F) that the student transforms by applying matrices. See rotation, reflection, scaling, and shearing happen visually.

**How it works**:
- A shape sits on the grid (default: the letter F — chosen because it's asymmetric, so you can see every transformation)
- Matrix input: 2×2 grid of number inputs [[a,b],[c,d]]
- "Apply" button transforms the shape by multiplying every vertex by the matrix
- Pre-built buttons for common transformations: rotate 90°, reflect across x, scale 2x, shear
- Student can chain transformations — see how order matters (AB ≠ BA)
- "Undo" button pops the last transformation (inverse matrix applied)
- Challenge: "Can you rotate the F by 45°?" "Can you reflect it and scale it in one matrix?"
- Identity matrix button: shows the shape not changing — drives home what I does

**Completion**: Apply 10 transformations, complete 3 challenges

**Why this works for Ch 5**: Matrices ARE transformations. A 2×2 matrix isn't just numbers in a grid — it's an instruction for reshaping space. Seeing the letter F shear, rotate, and flip makes matrix multiplication meaningful.

---

### Chapter 6: Dirac Notation
**Experiment: "State Space Navigator"**

An interactive visualization of the qubit state space, showing how ket notation maps to the Bloch sphere and how inner products measure similarity.

**How it works**:
- Split screen: left shows ket notation, right shows Bloch sphere
- Student types a state: α|0⟩ + β|1⟩ (using sliders for α and β to avoid keyboard issues)
- The point on the Bloch sphere moves in real time as sliders change
- Inner product tool: select two states, see ⟨ψ|φ⟩ computed live. The value shrinks as states move apart, hits 0 when orthogonal, hits 1 when identical.
- Orthogonality detector: when ⟨ψ|φ⟩ = 0, a visual indicator fires (the two arrows on the sphere are perpendicular)
- Probability display: P(|0⟩) and P(|1⟩) shown as a bar chart that updates in real time as sliders move
- Challenge: "Find two states that are orthogonal." "Find a state with P(|0⟩) = 0.75."

**Completion**: Explore 10 states, find 3 orthogonal pairs, complete 2 challenges

**Why this works for Ch 6**: Bra-ket notation is abstract. Seeing ⟨0|ψ⟩ change as you drag |ψ⟩ around the Bloch sphere makes inner products geometric. Orthogonality becomes "perpendicular," not just "dot product equals zero."

---

### Chapter 7: Quantum Gates
**Experiment: "Gate Laboratory"**

Interactive gate-by-gate exploration. Pick a gate, pick an input state, watch the transformation on the Bloch sphere. Then chain gates and predict where the state ends up.

**How it works**:
- Bloch sphere visualization with a state arrow
- Gate buttons: X, Y, Z, H
- Tap a gate → watch the state arrow move on the sphere with smooth animation
  - X: 180° rotation around X-axis (north pole ↔ south pole)
  - Z: 180° rotation around Z-axis (phase flip — arrow stays at same latitude but rotates)
  - Y: 180° rotation around Y-axis
  - H: rotation to specific position (|0⟩ → equator)
- "Predict Mode": sphere shows current state, a gate is queued. Student taps where they think the arrow will go. Then gate applies — see if prediction was right. Score: distance between prediction and actual.
- Gate sequences: apply 2-3 gates, predict the final position
- Discovery prompt: "Apply H, then Z, then H. What single gate does this equal?" → X (student discovers HZH = X by playing)
- Discovery prompt: "Apply any gate twice. What happens?" → Most return to start (X² = I, Z² = I, H² = I)

**Completion**: Make 15 predictions, discover 2 of 3 gate identities

**Why this works for Ch 7**: Gates are rotations on the Bloch sphere. The predict-then-verify loop builds physical intuition that no amount of matrix multiplication can match. Discovering HZH = X through experimentation is far more memorable than being told.

---

### Chapter 8: Measurement
**Experiment: "Quantum Coin Toss Lab"**

The student creates quantum states and "measures" them repeatedly, building up histograms and experiencing the probabilistic nature of quantum measurement firsthand.

**How it works**:
- Student sets a state using α/β sliders: |ψ⟩ = α|0⟩ + β|1⟩
- Born rule probabilities shown: P(|0⟩) = |α|², P(|1⟩) = |β|²
- Big "MEASURE" button — each tap collapses the state to |0⟩ or |1⟩ (randomly, weighted by probabilities)
- Each measurement result appears as a ball dropping into one of two bins (like a Plinko/Galton board)
- Histogram builds up over time — after 10 measurements, 50, 100, 500
- The histogram starts noisy and gradually converges to the theoretical probabilities
- State collapse visualization: after measuring |0⟩, the state arrow on Bloch sphere snaps to north pole
- "Reset" prepares a new copy of the same state (because measurement destroys the state)
- Challenge: "Set the sliders so that |0⟩ appears exactly 3 out of 4 times on average."
- Challenge: "Set a state where measurement is always |1⟩, no matter how many times you try."
- Surprise moment: "Set P(|0⟩) = 0.5. Measure 10 times. Did you get exactly 5-5? Probably not." → Randomness is real.

**Completion**: Perform 100+ measurements across at least 3 different states, complete 2 challenges

**Why this works for Ch 8**: Students learn the Born rule as a formula. This makes them FEEL it. The histogram slowly converging — never perfectly — teaches that quantum mechanics is genuinely probabilistic. Getting a 7-3 split on a 50/50 state is the moment it becomes real.

---

### Chapter 9: Tensor Products
**Experiment: "Qubit Combiner"**

Visual tool that combines two single-qubit states into a two-qubit state, showing the tensor product geometrically.

**How it works**:
- Two Bloch spheres side by side (qubit A, qubit B)
- Student sets each qubit's state independently using sliders
- Below: a 4-element state vector display showing the tensor product result in real time
- Basis state labels: |00⟩, |01⟩, |10⟩, |11⟩ with probability bars
- The student can see: changing qubit A affects the first and third components, changing qubit B affects differently
- Separability indicator: "This state IS separable" (green) — always true in this tool because you're constructing from two independent qubits
- Preview: "Some 2-qubit states can't be built this way. Those are entangled." → Teases Chapter 10
- Challenge: "Make a state where P(|00⟩) = P(|11⟩) = 0.5 and P(|01⟩) = P(|10⟩) = 0." → Impossible with this tool (that's the entangled Bell state). Student discovers entanglement by hitting the wall.

**Completion**: Create 8 different 2-qubit states, attempt the impossible challenge, read the explanation

**Why this works for Ch 9**: The tensor product is the hardest conceptual jump so far. Seeing two independent Bloch spheres produce a 4-element vector makes the math concrete. And discovering that some states CAN'T be built from independent qubits is the perfect setup for Chapter 10.

---

### Chapter 10: Entanglement
**Experiment: "Entanglement Lab"**

The student builds Bell states with a mini circuit builder, then measures one qubit and watches the other collapse. Repeated measurements reveal perfect correlation.

**How it works**:
- Simple 2-qubit circuit area: pre-loaded with H on qubit 0, CNOT from qubit 0 to qubit 1 (the Bell state circuit from lessons)
- "Prepare" button creates the Bell state
- Two measurement buttons: "Measure Qubit 0" and "Measure Qubit 1"
- Measure Qubit 0 → result appears (|0⟩ or |1⟩) → Qubit 1's state INSTANTLY updates to match
- Log table fills up: each row is a trial showing (Qubit 0 result, Qubit 1 result)
- After 20 trials: "Notice anything?" → They always match
- Correlation counter: "Times they matched: 20/20 (100%)"
- Switch to |Ψ+⟩ Bell state: now they're anti-correlated (always opposite)
- "Distance" visualization (optional): show the two qubits "far apart" on screen to emphasize that measurement of one instantly determines the other — non-local correlation
- Challenge: "Build a state where Qubit 0 and Qubit 1 always give OPPOSITE results" → |Ψ+⟩
- Challenge: "Can you build an entangled state using only H gates (no CNOT)?" → No, student discovers CNOT is essential

**Completion**: Run 20+ measurements on 2 different Bell states, observe correlation, complete 1 challenge

**Why this works for Ch 10**: Reading "measuring one qubit determines the other" is one thing. Watching it happen 20 times in a row — perfectly correlated, every single time — is something else entirely. This is the experiment that makes people understand why Einstein called it spooky.

---

### Chapter 11: Quantum Circuits
**Experiment: "Circuit Puzzler"**

A set of puzzle challenges where the student must build circuits that produce specific output states or probability distributions.

**How it works**:
- Each puzzle shows a TARGET: either a specific output state or a histogram
- Available gates depend on the puzzle (constrained toolbox)
- Student drags gates onto wires to build a circuit
- "Test" button runs the circuit and shows the result
- Green check if it matches the target, red X if not
- 10 puzzles, increasing difficulty:

| # | Target | Available Gates | Hint |
|---|---|---|---|
| 1 | Output \|1⟩ from \|0⟩ | X, H | Just one gate |
| 2 | Equal superposition from \|0⟩ | X, H, Z | One gate |
| 3 | Output \|0⟩ from \|1⟩ | X, H, Z | Same gate works forward and backward |
| 4 | Output -\|1⟩ from \|1⟩ | X, Z, H | Phase matters |
| 5 | 50/50 histogram on 2 qubits: only \|00⟩ and \|11⟩ | H, CNOT | Bell state |
| 6 | Output \|10⟩ from \|00⟩ | X, H, CNOT | Think about which qubit to flip |
| 7 | HZH = X: produce \|1⟩ from \|0⟩ using H, Z, H | H, Z | Three gates |
| 8 | 25% each: \|00⟩, \|01⟩, \|10⟩, \|11⟩ | H, CNOT | H on both qubits |
| 9 | 50/50: only \|01⟩ and \|10⟩ | X, H, CNOT | Which Bell state? |
| 10 | Produce \|0⟩ from (1/√2)(\|0⟩+\|1⟩) | H, X, Z | Undo the superposition |

- Star rating: 3 stars for minimum gates, 2 for one extra, 1 for solving at all

**Completion**: Solve 7 of 10 puzzles

**Why this works for Ch 11**: Circuit building is the synthesis skill. These puzzles require understanding gates (Ch 7), measurement (Ch 8), entanglement (Ch 10), and circuit tracing (Ch 11) simultaneously. The constrained toolbox forces creative thinking.

---

### Chapter 12: Rotation Gates
**Experiment: "Bloch Sphere Painter"**

The student uses rotation gates as brushes to "paint" paths on the Bloch sphere, discovering how Rx, Ry, Rz reach different parts of the sphere.

**How it works**:
- Bloch sphere with a state arrow that leaves a trail (like drawing on a globe)
- Three sliders: Rx(θ), Ry(θ), Rz(θ) — drag to rotate continuously
- The trail shows the path the state takes during rotation
- Rx slider: arrow traces a circle around the X-axis (vertical circle, front-to-back)
- Ry slider: arrow traces a circle around the Y-axis (vertical circle, left-to-right)
- Rz slider: arrow traces a circle around the Z-axis (horizontal circle, like a latitude line)
- "Paint" mode: trails persist, creating geometric patterns on the sphere
- Challenge: "Start at |0⟩. Can you reach the south pole using ONLY Rz?" → No (Rz only moves along latitude lines, |0⟩ is at the pole — it doesn't move)
- Challenge: "Reach the point (1/√2)|0⟩ + (i/√2)|1⟩ from |0⟩" → Rx(π/2) or Ry(π/2) then Rz(π/2)
- Challenge: "What path does Rx(θ) trace starting from |+⟩?" → Great circle through |+⟩

**Completion**: Paint 3 distinct paths, complete 2 of 4 challenges

**Why this works for Ch 12**: Rotation gates are fundamentally geometric. Moving sliders and watching the sphere is worth a thousand matrix multiplications. Discovering that Rz can't move |0⟩ teaches more about the Z-axis than any formula.

---

### Chapter 13: Phase Gates
**Experiment: "Phase Clock"**

A visual clock face showing the phase of |1⟩'s amplitude. Each phase gate rotates the clock hand. Student discovers the phase gate family by watching the hand move in fixed increments.

**How it works**:
- Circular display like a clock face, labeled 0 to 2π
- State display: |ψ⟩ = (1/√2)(|0⟩ + e^(iφ)|1⟩) — φ shown as the clock hand angle
- Gate buttons: T, S, Z, T†, S†
- T moves the hand by π/4 (45°, one "hour")
- S moves by π/2 (90°, two "hours")
- Z moves by π (180°, six "hours")
- T† and S† move backward
- Counter shows total phase accumulated
- Challenge: "Start at φ=0. Get to φ=π using only T gates." → Hit T 4 times (4 × π/4 = π). "What single gate does the same thing?" → Z
- Challenge: "Apply S then T. What's the total phase?" → 3π/4. "What three T gates give the same phase?" → T, T, T (3 × π/4)
- Challenge: "Get back to φ=0 from φ=3π/4 using the fewest gates." → T† three times, or S† then T†
- Running total display: shows phase as both angle and gate sequence (e.g., "π/4 + π/4 + π/2 = π = Z")

**Completion**: Reach 5 target phases, discover T⁴ = Z, complete 2 challenges

**Why this works for Ch 13**: Phase is the most abstract concept in quantum computing. You can't see it in measurement probabilities. The clock makes it visible — each gate physically turns the hand. The student discovers the T/S/Z family structure by playing, not memorizing.

---

### Chapter 14: Multi-Qubit Gates
**Experiment: "Gate Wiring Lab"**

Build multi-qubit gates from simpler ones. Verify equivalences by testing inputs.

**How it works**:
- Circuit builder focused on equivalence testing
- Left side: the target gate (e.g., SWAP, Toffoli)
- Right side: blank circuit where student builds an equivalent from basic gates
- "Test All Inputs" button: runs every possible basis state through both circuits, compares outputs
- Green table: all outputs match. Red: mismatch found.

| Puzzle | Target | Build From |
|---|---|---|
| 1 | SWAP | Three CNOTs |
| 2 | CZ | H on target, CNOT, H on target |
| 3 | Toffoli | Hint: requires H, T, T†, CNOT (show gate count only) |

- For Toffoli: this is genuinely hard (requires ~6 CNOTs + several T gates). Give the student the gate count as a hint and let them experiment. A "Show Solution" button available after 5 minutes of trying.
- Bonus visualization: when circuits match, both animate side-by-side processing the same input

**Completion**: Build SWAP from CNOTs, build CZ from H+CNOT, attempt Toffoli decomposition

**Why this works for Ch 14**: Building complex gates from simple ones is how real quantum compilation works. The student becomes the compiler. Testing all inputs is the verification method used in real hardware calibration.

---

### Chapter 15: Quantum Teleportation
**Experiment: "Teleportation Simulator"**

Step-by-step interactive simulation of the teleportation protocol with two "users" (Alice and Bob) on opposite sides of the screen.

**How it works**:
- Split screen: Alice (left), Bob (right), classical channel (bottom)
- Alice has an unknown qubit |ψ⟩ shown on her Bloch sphere (student sets it with sliders)
- Shared entangled pair visualized as a glowing line connecting Alice and Bob
- Step 1: Student taps "Apply CNOT" on Alice's side → state updates shown
- Step 2: Student taps "Apply H" on Alice's qubit → state updates
- Step 3: Student taps "Measure" on Alice's two qubits → result appears (e.g., "01")
- Classical bits animate traveling from Alice to Bob (moving dots along the bottom channel)
- Step 4: Student selects which correction gate(s) Bob should apply based on Alice's bits
  - If student picks wrong gate: Bob's state doesn't match |ψ⟩, try again
  - If student picks right gate: Bob's Bloch sphere arrow matches Alice's original |ψ⟩ → Success!
- State vector displayed at every step showing the full 3-qubit system
- Run it 10 times with different |ψ⟩ states and different measurement outcomes
- Key moment: Alice's qubit is DESTROYED after measurement. She no longer has |ψ⟩. Bob does. The state moved without any qubit traveling.

**Completion**: Successfully teleport 5 different states with correct corrections

**Why this works for Ch 15**: Teleportation has too many moving parts to hold in your head from a textbook. The visual simulation with Alice and Bob, the classical bits traveling, the correction step — it makes the protocol a PROCEDURE you can run, not just equations you can trace.

---

### Chapter 16: Deutsch-Jozsa Algorithm
**Experiment: "Oracle Detective"**

A mystery game where the student must determine if a hidden function is constant or balanced — first classically (limited queries), then quantumly (one query).

**How it works**:
- Phase 1 — Classical Detective:
  - Black box with an input slot and output display
  - Student feeds in 0 or 1, sees f(0) or f(1)
  - "Is it constant or balanced?" → Must use 2 queries to be sure
  - 5 rounds. Track: "Classical queries used: 10 for 5 puzzles"

- Phase 2 — Quantum Detective:
  - Same black box, but now wrapped in the Deutsch circuit
  - Student presses one button: "Run Quantum Circuit"
  - Output: |0⟩ = constant, |1⟩ = balanced
  - Same 5 puzzles (new oracles). Track: "Quantum queries used: 5 for 5 puzzles"

- Phase 3 — Scale Up:
  - Same game but now f takes 3-bit input (8 possible inputs)
  - Classical: need up to 5 queries
  - Quantum: still just 1
  - Scoreboard shows the gap widening

- Total scoreboard: "Classical: 25 queries. Quantum: 10 queries. Quantum advantage: 2.5x"
- For 10-bit input: "Classical: up to 513 queries. Quantum: 1. Advantage: 513x"

**Completion**: Solve all 15 puzzles (5 per phase), see the scaling advantage

**Why this works for Ch 16**: The student EXPERIENCES the advantage. They feel the frustration of needing 2 classical queries when the quantum circuit needs 1. The scaling phase makes the exponential advantage tangible.

---

### Chapter 17: Grover's Search
**Experiment: "Quantum Search Race"**

Visual race between classical search (checking items one by one) and Grover's algorithm (amplitude amplification). Both run simultaneously, student watches Grover win.

**How it works**:
- Grid of N items (start with N=8, can increase to 16, 32)
- One item is marked (hidden star behind one cell)
- Left side: "Classical Search" — highlights cells one at a time, randomly
- Right side: "Grover's Search" — shows amplitude bars for all items, with oracle + diffusion animated
  - Oracle: marked item's bar turns negative (dips below zero)
  - Diffusion: all bars reflect about mean — marked item grows, others shrink
  - After ~√N iterations: marked item's bar dominates
  - "Measure" — almost certainly picks the marked item
- Race timer: both start simultaneously
- Classical: O(N/2) average steps, checking one at a time
- Grover: O(√N) iterations of oracle+diffusion
- After the race: scoreboard shows "Classical: 4 steps. Grover: 2 iterations" (for N=8)
- Increase N: "Try N=64." Classical: ~32 steps. Grover: ~6 iterations. The gap widens.
- Amplitude visualization is the key — watching the marked item's amplitude grow while others shrink IS amplitude amplification. The student sees the algorithm's core mechanism.

**Completion**: Run 3 races at different N values, see Grover win each time

**Why this works for Ch 17**: Amplitude amplification is the key concept and it's completely non-intuitive from equations. Watching the bars move — one growing, others shrinking, the "inversion about the mean" physically visible — is the moment Grover's algorithm clicks.

---

### Chapter 18: Quantum Error Correction
**Experiment: "Noisy Quantum Lab"**

The student runs circuits with and without error correction, experiencing how noise degrades results and how error correction fixes it.

**How it works**:
- Simple circuit: prepare Bell state, measure
- "Noise slider": controls error probability (0% to 50%)
- Without error correction:
  - Run 100 measurements at noise=0%: perfect 50/50 split between |00⟩ and |11⟩
  - Crank noise to 10%: histogram gets messy — |01⟩ and |10⟩ start appearing
  - Crank noise to 30%: results are nearly random
  - Visible degradation — the student watches their clean results fall apart
- Toggle "Error Correction: ON" (3-qubit bit-flip code)
  - Same noise levels — but results stay cleaner
  - At 10% noise: histogram is nearly as clean as 0% without correction
  - At 30% noise: still some errors, but WAY better than uncorrected
- Side-by-side comparison: corrected vs uncorrected at same noise level
- "Threshold" demonstration: crank noise above ~45% → error correction makes it WORSE (more physical qubits = more chances for uncorrectable multi-qubit errors)
- Counter: "Errors detected and fixed: 47 out of 100 runs"

**Completion**: Run comparisons at 3 noise levels, observe threshold effect

**Why this works for Ch 18**: Error correction is abstract until you see noise destroy your results and then watch error correction save them. The threshold effect — where too much noise overwhelms the code — is the kind of nuance that only experimentation reveals.

---

### Chapter 19: Shor's Algorithm
**Experiment: "Period Finder"**

Interactive visualization of the classical part of Shor's algorithm — finding the period of modular exponentiation — with a visual QFT demonstration.

**How it works**:
- Student picks N to factor (small: 15, 21, 35) and a random base a
- Table fills in: a^1 mod N, a^2 mod N, a^3 mod N, ...
- Graph plots the values — student can SEE the repeating pattern
- "Find the period" prompt — student identifies r from the graph
- Period finder: "r = 4. Now compute gcd(a^(r/2) ± 1, N)"
- Calculator tool: student plugs in values, factors pop out
- QFT visualization: same sequence of values, but now shown as a frequency spectrum
  - Before QFT: the pattern exists but is spread across all inputs
  - After QFT: sharp peaks at multiples of N/r → period is visible as peak spacing
  - "The quantum computer does this step exponentially faster"
- Multiple rounds: try different N and a values, see how sometimes it fails (odd period, trivial factor) and you need to try again
- Progress tracker: "Numbers you've factored: 15 ✓, 21 ✓, 35 ✓"

**Completion**: Factor 3 different numbers, see the QFT visualization for each

**Why this works for Ch 19**: Shor's is too complex to implement end-to-end at this level, but the KEY INSIGHT — that factoring reduces to period finding and QFT finds periods — can be experienced directly. Seeing the repeating pattern in the modular exponentiation, then seeing QFT extract it, is the "aha" moment.

---

### Chapter 20: The Landscape
**Experiment: "Quantum Hardware Explorer"**

An interactive comparison tool for current quantum computing platforms, plus a "build your ideal quantum computer" configurator.

**How it works**:
- Interactive comparison table of qubit technologies:
  - Superconducting, Trapped Ion, Photonic, Neutral Atom, Topological
  - Axes: qubit count, gate fidelity, coherence time, connectivity, operating temperature
  - Radar charts for each technology — visual strengths/weaknesses
  - Tap a technology to see: which companies use it, current records, key tradeoffs

- "Build Your Quantum Computer" configurator:
  - Choose a technology → sets base parameters
  - Slider: number of qubits → shows what algorithms you can run at that scale
    - 5 qubits: toy problems only
    - 50 qubits: possible quantum advantage demonstrations
    - 100 logical qubits: useful chemistry simulation
    - 4000 logical qubits: Shor's algorithm on RSA-2048
  - Physical qubit calculator: "4000 logical qubits × ~1000 physical qubits per logical = 4 million physical qubits needed"
  - "When could this exist?" timeline based on current scaling trends

- "Your Journey" summary:
  - Visual map of every concept learned across 20 chapters
  - Count: problems solved, experiments completed, time spent
  - "You now know more about quantum computing than 99% of people"
  - Links to next steps: Qiskit, Cirq, textbooks, courses, communities

**Completion**: Explore all 5 technologies, configure 2 quantum computers, view journey summary

**Why this works for Ch 20**: The final experiment brings it back to reality. The student has spent 19 chapters in abstract math and theory. Now they see the actual engineering landscape, understand the practical constraints, and realize the math they learned is the same math running on real hardware right now.

---

## Implementation Summary

| Chapter | Experiment Name | Core Mechanic | Key Library Needs |
|---|---|---|---|
| 1 | Equation Balancer | Physics-based balance animation | Canvas/CSS animation |
| 2 | Vector Playground | Drag-to-draw vectors on grid | Canvas, vector math |
| 3 | Normalization Machine | Vector → unit circle mapping | Canvas, unit circle |
| 4 | Complex Number Explorer | Interactive Argand diagram | Canvas, complex math |
| 5 | Transformation Sandbox | Matrix transforms on shapes | Canvas, matrix math |
| 6 | State Space Navigator | Bloch sphere + inner product | 3D rendering or 2D projection |
| 7 | Gate Laboratory | Bloch sphere + predict mode | 3D or 2D Bloch sphere |
| 8 | Quantum Coin Toss Lab | Measurement histogram builder | Canvas, random sampling |
| 9 | Qubit Combiner | Dual Bloch spheres + tensor product | Bloch sphere × 2 |
| 10 | Entanglement Lab | Bell state measurement log | Circuit sim, RNG |
| 11 | Circuit Puzzler | Constrained circuit building + verification | Circuit sim |
| 12 | Bloch Sphere Painter | Rotation trails on sphere | Bloch sphere + path rendering |
| 13 | Phase Clock | Clock face phase display | CSS/Canvas clock |
| 14 | Gate Wiring Lab | Equivalence testing | Circuit sim, exhaustive test |
| 15 | Teleportation Simulator | Split-screen Alice/Bob protocol | Circuit sim, animation |
| 16 | Oracle Detective | Classical vs quantum query game | Oracle sim |
| 17 | Quantum Search Race | Side-by-side race visualization | Amplitude bar animation |
| 18 | Noisy Quantum Lab | Noise slider + error correction toggle | Noisy sim |
| 19 | Period Finder | Modular exponentiation + QFT visualization | Graphing, FFT visualization |
| 20 | Hardware Explorer | Interactive comparison + configurator | Data viz, radar charts |

### Shared Components Needed
- **Bloch sphere renderer**: Used in Ch 6, 7, 8, 9, 10, 12. Build once, reuse everywhere. Can be 2D projection (circle with axis lines) for simplicity, or basic 3D with Three.js if available. 2D is fine and lighter.
- **Circuit simulator**: Already specified in the sandbox spec. Experiments in Ch 10, 11, 14, 15 reuse it.
- **Histogram renderer**: Used in Ch 8, 10, 17, 18. HTML/CSS bar chart, animate-able.
- **Canvas drawing system**: Already exists (canvas.js for Apple Pencil). Adapt for vector/shape drawing in Ch 1-5 experiments.

### Implementation Order
Build experiments alongside their chapters. When implementing Chapter 7's lessons + templates, also build the Gate Laboratory experiment. This keeps context tight and ensures the experiment matches the lesson content exactly.

Exception: build the Bloch sphere renderer early (with Ch 6) since it's reused in Ch 7, 8, 9, 10, and 12.
