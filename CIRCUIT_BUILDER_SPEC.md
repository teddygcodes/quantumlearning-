# Quantum Circuit Builder & Sandbox — Complete Spec

## Overview

A drag-and-drop quantum circuit editor with a built-in state vector simulator. The student places gates on qubit wires, steps through execution gate-by-gate, and sees the actual matrix multiplication at every step. Includes a measurement simulator that runs 1000 shots and displays a histogram.

**Two access modes:**
1. **Sandbox** — free-form circuit building, accessible from home screen, unlocked after Chapter 11 quiz
2. **Circuit Challenges** — structured puzzles accessed from Chapter 11's experiment and referenced by later chapters

**This is NOT a chapter.** It is a persistent tool that grows with the student. New gates unlock as chapters are completed.

---

## Files to Create

| File | Purpose | Approx Lines |
|---|---|---|
| `static/simulator.js` | State vector simulator — all quantum math | ~400 |
| `static/circuit.js` | Circuit data model — grid, gate placement, serialization | ~250 |
| `static/circuit-ui.js` | Drag-and-drop UI, rendering, step-through controls, math panel, histogram | ~800 |

## Files to Modify

| File | Change |
|---|---|
| `static/app.js` | Add route `#/sandbox`, sandbox button on home screen, gate unlock logic, state persistence |
| `static/style.css` | Circuit builder layout, gate palette, wire grid, math panel, histogram, step controls, responsive |
| `static/index.html` | Bump cache version |
| `CLAUDE.md` | Document sandbox feature |

## Files NOT Modified

| File | Reason |
|---|---|
| `static/problems.js` | Sandbox has its own simulator; problem generators unchanged |
| `static/chapters.js` | Sandbox isn't a chapter; no chapter definition needed |
| `static/templates.js` | No teaching units in sandbox |
| `static/canvas.js` | Sandbox uses its own canvas; Apple Pencil notepad unchanged |
| `static/experiments.js` | Ch 11 experiment (Circuit Puzzler) calls into circuit-ui.js but is defined in experiments.js |

---

## 1. State Vector Simulator (`static/simulator.js`)

### Complex Number Utilities

```js
// All complex numbers are { re: number, im: number }

export function cAdd(a, b)        // → { re: a.re+b.re, im: a.im+b.im }
export function cSub(a, b)        // → { re: a.re-b.re, im: a.im-b.im }
export function cMul(a, b)        // → { re: a.re*b.re - a.im*b.im, im: a.re*b.im + a.im*b.re }
export function cConj(a)          // → { re: a.re, im: -a.im }
export function cAbs2(a)          // → a.re*a.re + a.im*a.im  (magnitude squared, returns real number)
export function cAbs(a)           // → Math.sqrt(cAbs2(a))
export function cScale(a, s)      // → { re: a.re*s, im: a.im*s }  (multiply by real scalar)
export function cDiv(a, s)        // → { re: a.re/s, im: a.im/s }  (divide by real scalar)
export function cEq(a, b, tol=1e-9) // → |a-b| < tol
export function cFromPolar(r, theta) // → { re: r*cos(theta), im: r*sin(theta) }
export function cZero()           // → { re: 0, im: 0 }
export function cOne()            // → { re: 1, im: 0 }
export function cI()              // → { re: 0, im: 1 }
```

### Gate Matrix Definitions

```js
export const GATE_MATRICES = {
  // --- Unlocked after Chapter 11 ---
  I: [[cOne(), cZero()], [cZero(), cOne()]],
  X: [[cZero(), cOne()], [cOne(), cZero()]],
  Y: [[cZero(), {re:0,im:-1}], [{re:0,im:1}, cZero()]],
  Z: [[cOne(), cZero()], [cZero(), {re:-1,im:0}]],
  H: [[cScale(cOne(),1/Math.SQRT2), cScale(cOne(),1/Math.SQRT2)],
      [cScale(cOne(),1/Math.SQRT2), cScale(cOne(),-1/Math.SQRT2)]],
  // CNOT is handled specially (not a 2x2 matrix)

  // --- Unlocked after Chapter 12 ---
  // Rx, Ry, Rz are functions that return matrices given theta
  // Stored as generator functions, not static matrices

  // --- Unlocked after Chapter 13 ---
  S:  [[cOne(), cZero()], [cZero(), cI()]],
  Sd: [[cOne(), cZero()], [cZero(), {re:0,im:-1}]],  // S-dagger
  T:  [[cOne(), cZero()], [cZero(), cFromPolar(1, Math.PI/4)]],
  Td: [[cOne(), cZero()], [cZero(), cFromPolar(1, -Math.PI/4)]], // T-dagger

  // --- Unlocked after Chapter 14 ---
  // CZ, SWAP, Toffoli handled specially (multi-qubit)
};

// Parameterized gate generators (Chapter 12)
export function rxMatrix(theta) {
  const c = Math.cos(theta/2), s = Math.sin(theta/2);
  return [[{re:c,im:0}, {re:0,im:-s}], [{re:0,im:-s}, {re:c,im:0}]];
}
export function ryMatrix(theta) {
  const c = Math.cos(theta/2), s = Math.sin(theta/2);
  return [[{re:c,im:0}, {re:-s,im:0}], [{re:s,im:0}, {re:c,im:0}]];
}
export function rzMatrix(theta) {
  return [[cFromPolar(1,-theta/2), cZero()], [cZero(), cFromPolar(1,theta/2)]];
}
```

### Simulator Class

```js
export class Simulator {
  constructor(numQubits) {
    this.numQubits = numQubits;           // 1–4
    this.size = 2 ** numQubits;           // state vector length: 2, 4, 8, or 16
    this.stateVector = null;              // Array of { re, im }
    this.history = [];                    // Array of StepSnapshot
    this.currentStep = 0;                 // index into gate sequence
    this.gates = [];                      // ordered gate list from circuit
    this.reset();
  }

  // --- Initialization ---

  reset() {
    // Initialize to |00...0⟩: first amplitude = 1, rest = 0
    this.stateVector = Array.from({ length: this.size }, (_, i) =>
      i === 0 ? cOne() : cZero()
    );
    this.history = [{
      stepIndex: -1,
      gateApplied: null,
      state: this.stateVector.map(c => ({ ...c })),  // deep copy
      matrixUsed: null,
      description: 'Initial state |' + '0'.repeat(this.numQubits) + '⟩'
    }];
    this.currentStep = 0;
  }

  loadGates(orderedGates) {
    // orderedGates: array from circuit.getGatesInOrder()
    this.gates = orderedGates;
    this.reset();
  }

  // --- Gate Application (core math) ---

  applySingleQubitGate(matrix, targetQubit) {
    // Apply 2x2 matrix to targetQubit without building full tensor product.
    // For each pair of indices that differ only in the targetQubit bit:
    //   newState[i0] = m[0][0]*state[i0] + m[0][1]*state[i1]
    //   newState[i1] = m[1][0]*state[i0] + m[1][1]*state[i1]
    //
    // Bit logic: targetQubit is counted from 0 (top qubit = most significant bit).
    // For an n-qubit system, qubit 0 is the leftmost/top wire.
    // The bit position in the state index is (numQubits - 1 - targetQubit).

    const bitPos = this.numQubits - 1 - targetQubit;
    const newState = this.stateVector.map(c => ({ ...c }));

    for (let i = 0; i < this.size; i++) {
      if ((i >> bitPos) & 1) continue;  // only process pairs once (when target bit is 0)
      const i0 = i;                     // index with target bit = 0
      const i1 = i | (1 << bitPos);     // index with target bit = 1

      const a0 = this.stateVector[i0];
      const a1 = this.stateVector[i1];

      newState[i0] = cAdd(cMul(matrix[0][0], a0), cMul(matrix[0][1], a1));
      newState[i1] = cAdd(cMul(matrix[1][0], a0), cMul(matrix[1][1], a1));
    }

    this.stateVector = newState;
  }

  applyCNOT(controlQubit, targetQubit) {
    // For each basis state: if control bit is 1, flip target bit.
    const controlBit = this.numQubits - 1 - controlQubit;
    const targetBit = this.numQubits - 1 - targetQubit;
    const newState = this.stateVector.map(c => cZero());

    for (let i = 0; i < this.size; i++) {
      if ((i >> controlBit) & 1) {
        // Control is 1: flip target
        const j = i ^ (1 << targetBit);
        newState[j] = { ...this.stateVector[i] };
      } else {
        // Control is 0: no change
        newState[i] = { ...this.stateVector[i] };
      }
    }

    this.stateVector = newState;
  }

  applyCZ(controlQubit, targetQubit) {
    // Apply -1 phase to states where both control and target bits are 1.
    const controlBit = this.numQubits - 1 - controlQubit;
    const targetBit = this.numQubits - 1 - targetQubit;

    for (let i = 0; i < this.size; i++) {
      if (((i >> controlBit) & 1) && ((i >> targetBit) & 1)) {
        this.stateVector[i] = cScale(this.stateVector[i], -1);
      }
    }
  }

  applySWAP(qubit0, qubit1) {
    // Swap amplitudes for states that differ in the two qubit positions.
    const bit0 = this.numQubits - 1 - qubit0;
    const bit1 = this.numQubits - 1 - qubit1;

    for (let i = 0; i < this.size; i++) {
      const b0 = (i >> bit0) & 1;
      const b1 = (i >> bit1) & 1;
      if (b0 !== b1) {
        // Swap with the index that has these bits flipped
        const j = i ^ (1 << bit0) ^ (1 << bit1);
        if (i < j) {  // only swap once per pair
          const tmp = { ...this.stateVector[i] };
          this.stateVector[i] = { ...this.stateVector[j] };
          this.stateVector[j] = tmp;
        }
      }
    }
  }

  applyToffoli(control0, control1, target) {
    // Flip target only when both controls are 1.
    const cBit0 = this.numQubits - 1 - control0;
    const cBit1 = this.numQubits - 1 - control1;
    const tBit = this.numQubits - 1 - target;
    const newState = this.stateVector.map(c => cZero());

    for (let i = 0; i < this.size; i++) {
      if (((i >> cBit0) & 1) && ((i >> cBit1) & 1)) {
        const j = i ^ (1 << tBit);
        newState[j] = { ...this.stateVector[i] };
      } else {
        newState[i] = { ...this.stateVector[i] };
      }
    }

    this.stateVector = newState;
  }

  // --- High-Level Gate Dispatch ---

  applyGate(gate) {
    // gate: object from circuit.getGatesInOrder()
    // Returns the matrix used (for math panel display)

    let matrixUsed = null;
    let description = '';

    switch (gate.type) {
      case 'I':
      case 'X':
      case 'Y':
      case 'Z':
      case 'H':
      case 'S':
      case 'Sd':
      case 'T':
      case 'Td': {
        const m = GATE_MATRICES[gate.type];
        matrixUsed = m;
        this.applySingleQubitGate(m, gate.qubit);
        description = `Applied ${gate.type} to q${gate.qubit}`;
        break;
      }
      case 'Rx': {
        const m = rxMatrix(gate.theta);
        matrixUsed = m;
        this.applySingleQubitGate(m, gate.qubit);
        description = `Applied Rx(${formatAngle(gate.theta)}) to q${gate.qubit}`;
        break;
      }
      case 'Ry': {
        const m = ryMatrix(gate.theta);
        matrixUsed = m;
        this.applySingleQubitGate(m, gate.qubit);
        description = `Applied Ry(${formatAngle(gate.theta)}) to q${gate.qubit}`;
        break;
      }
      case 'Rz': {
        const m = rzMatrix(gate.theta);
        matrixUsed = m;
        this.applySingleQubitGate(m, gate.qubit);
        description = `Applied Rz(${formatAngle(gate.theta)}) to q${gate.qubit}`;
        break;
      }
      case 'CNOT': {
        this.applyCNOT(gate.control, gate.target);
        matrixUsed = 'CNOT';  // special case — not a 2x2 matrix
        description = `Applied CNOT: control=q${gate.control}, target=q${gate.target}`;
        break;
      }
      case 'CZ': {
        this.applyCZ(gate.control, gate.target);
        matrixUsed = 'CZ';
        description = `Applied CZ: q${gate.control}, q${gate.target}`;
        break;
      }
      case 'SWAP': {
        this.applySWAP(gate.qubit0, gate.qubit1);
        matrixUsed = 'SWAP';
        description = `Applied SWAP: q${gate.qubit0} ↔ q${gate.qubit1}`;
        break;
      }
      case 'Toffoli': {
        this.applyToffoli(gate.control0, gate.control1, gate.target);
        matrixUsed = 'Toffoli';
        description = `Applied Toffoli: controls=q${gate.control0},q${gate.control1}, target=q${gate.target}`;
        break;
      }
      default:
        throw new Error(`Unknown gate type: ${gate.type}`);
    }

    return { matrixUsed, description };
  }

  // --- Step-Through ---

  stepForward() {
    if (this.currentStep >= this.gates.length) return null;  // no more gates

    const gate = this.gates[this.currentStep];
    const stateBefore = this.stateVector.map(c => ({ ...c }));
    const { matrixUsed, description } = this.applyGate(gate);
    const stateAfter = this.stateVector.map(c => ({ ...c }));

    const snapshot = {
      stepIndex: this.currentStep,
      gateApplied: gate,
      stateBefore,
      stateAfter,
      matrixUsed,
      description
    };

    this.history.push(snapshot);
    this.currentStep++;
    return snapshot;
  }

  stepBack() {
    if (this.currentStep <= 0) return null;  // already at start

    this.currentStep--;
    this.history.pop();

    // Restore state from the last history entry
    const lastSnapshot = this.history[this.history.length - 1];
    this.stateVector = lastSnapshot.stateAfter
      ? lastSnapshot.stateAfter.map(c => ({ ...c }))
      : lastSnapshot.state.map(c => ({ ...c }));  // initial state case

    return lastSnapshot;
  }

  runAll() {
    const snapshots = [];
    while (this.currentStep < this.gates.length) {
      snapshots.push(this.stepForward());
    }
    return snapshots;
  }

  goToStart() {
    while (this.currentStep > 0) {
      this.stepBack();
    }
  }

  goToEnd() {
    return this.runAll();
  }

  // --- Measurement ---

  getProbabilities() {
    // Returns object: { '00': 0.5, '01': 0, '10': 0, '11': 0.5 }
    const probs = {};
    for (let i = 0; i < this.size; i++) {
      const label = i.toString(2).padStart(this.numQubits, '0');
      probs[label] = cAbs2(this.stateVector[i]);
    }
    return probs;
  }

  measure(numShots = 1000) {
    // Returns object: { '00': 503, '01': 0, '10': 0, '11': 497 }
    const probs = this.getProbabilities();
    const labels = Object.keys(probs);
    const cumulative = [];
    let sum = 0;
    for (const label of labels) {
      sum += probs[label];
      cumulative.push({ label, cumProb: sum });
    }

    const counts = Object.fromEntries(labels.map(l => [l, 0]));
    for (let shot = 0; shot < numShots; shot++) {
      const r = Math.random();
      for (const { label, cumProb } of cumulative) {
        if (r < cumProb) {
          counts[label]++;
          break;
        }
      }
    }
    return counts;
  }

  // --- State Display Helpers ---

  getStateKet() {
    // Returns string: "0.707|00⟩ + 0.707|11⟩"
    const terms = [];
    for (let i = 0; i < this.size; i++) {
      const amp = this.stateVector[i];
      if (cAbs2(amp) < 1e-10) continue;  // skip zero amplitudes
      const label = i.toString(2).padStart(this.numQubits, '0');
      terms.push({ amp, label });
    }
    if (terms.length === 0) return '0';
    return terms.map(({ amp, label }, idx) => {
      const sign = (idx > 0 && amp.re >= 0 && amp.im === 0) ? ' + ' :
                   (idx > 0 && amp.re < 0 && amp.im === 0) ? ' − ' :
                   (idx > 0) ? ' + ' : '';
      return `${sign}${formatComplex(amp)}|${label}⟩`;
    }).join('');
  }

  getStateVector() {
    // Returns array of { re, im } — the raw state vector
    return this.stateVector.map(c => ({ ...c }));
  }
}
```

### Display Formatting Helpers

```js
export function formatComplex(c) {
  // Format complex number for display
  // { re: 0.707, im: 0 } → "0.707"
  // { re: 0, im: 0.707 } → "0.707i"
  // { re: 0.5, im: 0.5 } → "(0.5+0.5i)"
  // { re: 0.707, im: 0 } where 0.707 ≈ 1/√2 → "1/√2"
  // Recognize common values: 1/√2, -1/√2, 1/2, -1/2, 0, 1, -1, i, -i

  const SPECIAL = [
    { re: 1/Math.SQRT2, im: 0, display: '1/√2' },
    { re: -1/Math.SQRT2, im: 0, display: '-1/√2' },
    { re: 0, im: 1/Math.SQRT2, display: 'i/√2' },
    { re: 0, im: -1/Math.SQRT2, display: '-i/√2' },
    { re: 0.5, im: 0.5, display: '(1+i)/2' },
    { re: 0.5, im: -0.5, display: '(1-i)/2' },
    { re: -0.5, im: 0.5, display: '(-1+i)/2' },
    { re: -0.5, im: -0.5, display: '(-1-i)/2' },
    { re: 1, im: 0, display: '1' },
    { re: -1, im: 0, display: '-1' },
    { re: 0, im: 1, display: 'i' },
    { re: 0, im: -1, display: '-i' },
    { re: 0.5, im: 0, display: '1/2' },
    { re: -0.5, im: 0, display: '-1/2' },
  ];

  for (const s of SPECIAL) {
    if (Math.abs(c.re - s.re) < 1e-6 && Math.abs(c.im - s.im) < 1e-6) {
      return s.display;
    }
  }

  // Generic formatting
  const re = Math.abs(c.re) < 1e-10 ? 0 : +c.re.toFixed(3);
  const im = Math.abs(c.im) < 1e-10 ? 0 : +c.im.toFixed(3);

  if (im === 0) return `${re}`;
  if (re === 0) return im === 1 ? 'i' : im === -1 ? '-i' : `${im}i`;
  const sign = im > 0 ? '+' : '';
  const imStr = im === 1 ? 'i' : im === -1 ? '-i' : `${im}i`;
  return `(${re}${sign}${imStr})`;
}

export function formatAngle(theta) {
  // Format angle in terms of π
  // π → "π", π/2 → "π/2", π/4 → "π/4", 2π/3 → "2π/3"
  const ratio = theta / Math.PI;
  const KNOWN = [
    { r: 1, d: 'π' }, { r: -1, d: '-π' },
    { r: 0.5, d: 'π/2' }, { r: -0.5, d: '-π/2' },
    { r: 0.25, d: 'π/4' }, { r: -0.25, d: '-π/4' },
    { r: 1/3, d: 'π/3' }, { r: -1/3, d: '-π/3' },
    { r: 2/3, d: '2π/3' }, { r: -2/3, d: '-2π/3' },
    { r: 1/6, d: 'π/6' }, { r: -1/6, d: '-π/6' },
    { r: 3/4, d: '3π/4' }, { r: -3/4, d: '-3π/4' },
    { r: 0, d: '0' },
    { r: 2, d: '2π' },
  ];
  for (const k of KNOWN) {
    if (Math.abs(ratio - k.r) < 1e-9) return k.d;
  }
  return `${+(theta).toFixed(3)}`;
}
```

---

## 2. Circuit Data Model (`static/circuit.js`)

### Gate Object Shapes

```js
// Single-qubit gate (fixed)
{ id: 'g1', type: 'H', qubit: 0, slot: 2 }

// Single-qubit gate (parameterized)
{ id: 'g2', type: 'Rx', qubit: 0, slot: 3, theta: Math.PI / 2 }

// Two-qubit gate
{ id: 'g3', type: 'CNOT', control: 0, target: 1, slot: 4 }
{ id: 'g4', type: 'CZ', control: 0, target: 1, slot: 5 }
{ id: 'g5', type: 'SWAP', qubit0: 0, qubit1: 1, slot: 6 }

// Three-qubit gate
{ id: 'g6', type: 'Toffoli', control0: 0, control1: 1, target: 2, slot: 7 }
```

### Circuit Class

```js
export class QuantumCircuit {
  constructor(numQubits = 2, numSlots = 10) {
    this.numQubits = numQubits;   // 1–4
    this.numSlots = numSlots;     // 10 default, auto-expands
    this.gates = [];              // flat array of gate objects
    this._nextId = 1;
  }

  // --- Gate Management ---

  addGate(gateConfig) {
    // gateConfig: { type, qubit/control/target/etc, slot, theta? }
    // Validates: no collision, slot in range, qubits in range
    // Returns gate id or throws

    const id = 'g' + (this._nextId++);
    const gate = { ...gateConfig, id };

    // Validate qubit range
    const qubits = this._getGateQubits(gate);
    for (const q of qubits) {
      if (q < 0 || q >= this.numQubits) throw new Error(`Qubit ${q} out of range`);
    }

    // Validate no collision
    if (this._hasCollision(gate)) throw new Error(`Slot ${gate.slot} occupied on affected qubit(s)`);

    // Auto-expand slots if needed
    if (gate.slot >= this.numSlots) {
      this.numSlots = gate.slot + 2;  // leave room for more
    }

    this.gates.push(gate);
    return id;
  }

  removeGate(gateId) {
    const idx = this.gates.findIndex(g => g.id === gateId);
    if (idx === -1) throw new Error(`Gate ${gateId} not found`);
    this.gates.splice(idx, 1);
  }

  moveGate(gateId, newSlot, newQubit) {
    // Move gate to new position. For multi-qubit gates, newQubit applies to primary qubit.
    const gate = this.gates.find(g => g.id === gateId);
    if (!gate) throw new Error(`Gate ${gateId} not found`);

    // Temporarily remove to check collision at new position
    const saved = { ...gate };
    this.removeGate(gateId);

    try {
      const updated = { ...saved, slot: newSlot };
      if (gate.qubit !== undefined) updated.qubit = newQubit;
      if (gate.control !== undefined) {
        const offset = gate.target - gate.control;
        updated.control = newQubit;
        updated.target = newQubit + offset;
      }
      // Re-add at new position
      this.gates.push(updated);
    } catch (e) {
      // Collision at new position — restore original
      this.gates.push(saved);
      throw e;
    }
  }

  clear() {
    this.gates = [];
    this._nextId = 1;
  }

  // --- Queries ---

  getGatesInOrder() {
    // Returns gates sorted by slot (left to right). Gates in the same slot are grouped.
    return [...this.gates].sort((a, b) => a.slot - b.slot);
  }

  getGateAt(qubit, slot) {
    return this.gates.find(g => {
      const qubits = this._getGateQubits(g);
      return qubits.includes(qubit) && g.slot === slot;
    }) || null;
  }

  getGatesAtSlot(slot) {
    return this.gates.filter(g => g.slot === slot);
  }

  getOccupiedSlots() {
    return [...new Set(this.gates.map(g => g.slot))].sort((a, b) => a - b);
  }

  isEmpty() {
    return this.gates.length === 0;
  }

  // --- Qubit Count Management ---

  setNumQubits(n) {
    if (n < 1 || n > 4) throw new Error('Qubit count must be 1-4');
    // Remove gates that reference qubits >= n
    this.gates = this.gates.filter(g => {
      const qubits = this._getGateQubits(g);
      return qubits.every(q => q < n);
    });
    this.numQubits = n;
  }

  // --- Serialization ---

  serialize() {
    return JSON.stringify({
      numQubits: this.numQubits,
      numSlots: this.numSlots,
      gates: this.gates,
      _nextId: this._nextId
    });
  }

  static deserialize(json) {
    const data = JSON.parse(json);
    const circuit = new QuantumCircuit(data.numQubits, data.numSlots);
    circuit.gates = data.gates;
    circuit._nextId = data._nextId;
    return circuit;
  }

  // --- Internal Helpers ---

  _getGateQubits(gate) {
    // Returns array of qubit indices this gate occupies
    switch (gate.type) {
      case 'CNOT':
      case 'CZ':
        return [gate.control, gate.target];
      case 'SWAP':
        return [gate.qubit0, gate.qubit1];
      case 'Toffoli':
        return [gate.control0, gate.control1, gate.target];
      default:
        return [gate.qubit];
    }
  }

  _hasCollision(newGate) {
    const newQubits = this._getGateQubits(newGate);
    for (const existing of this.gates) {
      if (existing.id === newGate.id) continue;
      if (existing.slot !== newGate.slot) continue;
      const existingQubits = this._getGateQubits(existing);
      if (newQubits.some(q => existingQubits.includes(q))) return true;
    }
    return false;
  }
}
```

---

## 3. Circuit Builder UI (`static/circuit-ui.js`)

### Exports

```js
export function mountSandbox(container, options) → cleanup function
// options: { unlockedGates: [...], savedCircuitJSON: string|null, onSave: fn }

export function mountChallenge(container, options) → cleanup function
// options: { challenge: { target, availableGates, hint }, onComplete: fn }
```

### Screen Layout

```
┌───────────────────────────────────────────────────────────────┐
│  ← Back         Quantum Sandbox           [Qubits: 2 ▼]     │
├────────┬──────────────────────────────────────────────────────┤
│        │  CIRCUIT GRID                                        │
│ GATE   │                                                      │
│ PALETTE│  q0: ─── [H] ─── [●] ─── [ ] ─── [ ] ─── [ ] ──  │
│        │                    │                                  │
│  [H]   │  q1: ─── [ ] ─── [⊕] ─── [ ] ─── [ ] ─── [ ] ──  │
│  [X]   │                                                      │
│  [Y]   │──────────────────────────────────────────────────────│
│  [Z]   │  STATE VECTOR                                        │
│  [I]   │                                                      │
│  CNOT  │  0.707|00⟩ + 0.707|11⟩                              │
│        │                                                      │
│  [Rx]  │  |00⟩: ████████░░░░░░░░ 0.500                      │
│  [Ry]  │  |01⟩: ░░░░░░░░░░░░░░░░ 0.000                      │
│  [Rz]  │  |10⟩: ░░░░░░░░░░░░░░░░ 0.000                      │
│        │  |11⟩: ████████░░░░░░░░ 0.500                      │
│  [🗑]  │                                                      │
│        ├──────────────────────────────────────────────────────┤
│        │  MATH PANEL (visible during step-through)            │
│        │                                                      │
│        │  Step 1/2: Applied H to q0                           │
│        │                                                      │
│        │  ┌          ┐   ┌   ┐       ┌       ┐              │
│        │  │ 1/√2  1/√2│   │ 1 │       │ 1/√2 │              │
│        │  │           │ × │   │   =   │       │              │
│        │  │ 1/√2 -1/√2│   │ 0 │       │ 1/√2 │              │
│        │  └          ┘   └   ┘       └       ┘              │
│        │                                                      │
├────────┴──────────────────────────────────────────────────────┤
│ CONTROLS                                                       │
│  [|← ] [◀ Back] [ Step 1/2 ] [Next ▶] [ ►|] [📊 Run 1000x] │
│                                                                │
│  [💾 Save] [📋 Presets ▼] [🗑 Clear]                          │
└────────────────────────────────────────────────────────────────┘
```

### Gate Palette — Detail

**Layout**: Vertical strip, left side, scrollable if needed.

**Rendering per gate**:
```
┌──────┐
│      │
│  H   │  ← gate letter, 24px bold monospace
│      │
└──────┘
  Hadamard   ← label, 10px, color: text-muted
```

**Gate colors** (consistent throughout app):
| Gate | Color | Hex |
|---|---|---|
| H | Blue | #4dabf7 |
| X | Red | #ff6b6b |
| Y | Green | #51cf66 |
| Z | Purple | #cc5de8 |
| I | Gray | #868e96 |
| S, S† | Teal | #20c997 |
| T, T† | Orange | #ff922b |
| Rx, Ry, Rz | Yellow | #fcc419 |
| CNOT | Blue-gray | #74c0fc |
| CZ | Purple-gray | #b197fc |
| SWAP | Pink | #f06595 |
| Toffoli | Gold | #ffd43b |

**CNOT palette icon**: Shows ● and ⊕ vertically connected by a line.

**Parameterized gates (Rx, Ry, Rz)**: When dragged onto the grid, a small popup appears asking for θ. Options: preset buttons (π/4, π/3, π/2, 2π/3, π) + custom input field. Default: π/2.

**Trash zone**: Last item in palette. Drag a gate to it to delete. Visual: gate turns red and shrinks when hovering over trash.

**Gate visibility**: Only show gates the student has unlocked. The palette grows as they progress.

### Gate Unlock Schedule

```js
export const GATE_UNLOCKS = {
  // gateType: chapterId that unlocks it
  I: 11, X: 11, Y: 11, Z: 11, H: 11, CNOT: 11,
  Rx: 12, Ry: 12, Rz: 12,
  S: 13, Sd: 13, T: 13, Td: 13,
  CZ: 14, SWAP: 14, Toffoli: 14,
};

export function getUnlockedGates(chapterStates) {
  // Returns array of gate type strings the student can use
  return Object.entries(GATE_UNLOCKS)
    .filter(([_, chId]) => chapterStates[chId]?.completed)
    .map(([type]) => type);
}
```

### Circuit Grid — Detail

**Wire rendering**:
- Horizontal lines, one per qubit
- Label at left: `q0`, `q1`, `q2`, `q3` in monospace
- Wire color: #555 (subtle)
- Wire extends full width of grid area

**Slot rendering**:
- Evenly spaced vertical positions along each wire
- Empty slot: dashed rectangle outline, 48×48px, border: #333
- Drop target highlight: when dragging a gate over an empty slot, the outline turns bright (chapter color) and thickens

**Placed gate rendering**:
- Solid rounded rectangle, 44×44px, filled with gate color
- Gate letter centered, white, 18px bold monospace
- On tap: selected state — glowing border (2px, white, with box-shadow)
- On tap when selected: deselect
- On drag: lifts off grid, follows pointer, original position shows ghost outline

**CNOT rendering**:
- Control qubit: filled circle (●), 12px diameter, gate color
- Target qubit: circled plus (⊕), 24px diameter, gate color
- Connecting line: vertical, 2px, gate color
- Both occupy the same slot column

**CZ rendering**:
- Both qubits: filled circle (●), 12px diameter
- Connecting line between them

**SWAP rendering**:
- Both qubits: × symbol, 18px
- Connecting line between them

**Toffoli rendering**:
- Two control qubits: filled circles (●)
- Target qubit: circled plus (⊕)
- Vertical line connecting all three

**Active gate highlight** (during step-through):
- Current gate has animated glowing border: `box-shadow: 0 0 8px 2px <gate-color>; animation: gatePulse 1.5s infinite`
- Already-applied gates: slightly dimmed (opacity: 0.6)
- Not-yet-applied gates: full opacity, no glow

**Grid scrolling**:
- If more than 6 slots used, grid scrolls horizontally
- Scroll indicator (fade gradient) at right edge when more content exists

### Drag-and-Drop — Detail

**From palette to grid (new gate)**:
1. Pointer down on palette gate → create floating copy at pointer position
2. Pointer move → floating copy follows pointer
3. Pointer over empty slot → slot highlights as drop target
4. Pointer up over valid slot → `circuit.addGate(...)`, re-render grid
5. Pointer up over invalid area → floating copy animates back to palette and disappears

**From grid to grid (move gate)**:
1. Pointer down on placed gate (300ms hold to distinguish from tap) → gate lifts, ghost remains
2. Same as above for move/drop
3. Pointer up over new valid slot → `circuit.moveGate(...)`, re-render
4. Pointer up over invalid area → gate returns to original position

**From grid to trash (delete)**:
1. While dragging a placed gate, move pointer over trash icon
2. Trash icon enlarges, turns red
3. Pointer up → `circuit.removeGate(...)`, re-render

**CNOT/CZ/SWAP placement (two-qubit)**:
1. Drag CNOT icon to a slot on a specific qubit wire → that qubit becomes control
2. A prompt appears: "Tap the target qubit wire" (highlight valid qubit wires)
3. Student taps another wire → target set, gate placed
4. Alternative: drag from one wire to another within the same slot column

**Toffoli placement (three-qubit)**:
1. Drag to a slot → first control
2. "Tap second control qubit" → student taps
3. "Tap target qubit" → student taps
4. Gate placed

**Touch specifics**:
- `touch-action: none` on grid canvas
- Use pointer events (pointerdown/move/up), not touch events
- All interactive elements minimum 44×44px hit target
- Works with both finger and Apple Pencil

### State Vector Display — Detail

**Location**: Below circuit grid, always visible.

**Ket notation line**:
- Full width, monospace font, 16px
- Example: `0.707|00⟩ + 0.707|11⟩`
- Updates after each step
- Amplitude colors: real positive = green (#51cf66), real negative = red (#ff6b6b), imaginary = blue (#4dabf7), zero = gray (#555)
- Changed amplitudes flash briefly (yellow background fade, 500ms) after each step

**Probability bars**:
- One row per basis state
- Label: `|00⟩`, `|01⟩`, `|10⟩`, `|11⟩` in monospace
- Bar: horizontal, max width = available space, filled proportional to probability
- Bar color: gradient from chapter color to darker shade
- Numeric label at end of bar: `0.500`
- Zero-probability bars: thin gray line, `0.000` in muted color
- Bars animate (grow/shrink over 300ms) when state changes

### Math Panel — Detail

**Location**: Below state vector, visible during step-through mode.

**Content per step**:
```
Step 1/2: Applied H to q0

┌          ┐   ┌   ┐       ┌       ┐
│ 1/√2  1/√2│   │ 1 │       │ 1/√2 │
│           │ × │   │   =   │       │
│ 1/√2 -1/√2│   │ 0 │       │ 1/√2 │
└          ┘   └   ┘       └       ┘
```

**Rendering approach**: HTML divs with CSS grid, NOT canvas. This allows:
- Text selection
- Easy styling with colors
- Responsive layout
- Screen reader accessibility

**Matrix rendering**:
```html
<div class="matrix">
  <div class="matrix-bracket left"></div>
  <div class="matrix-body">
    <div class="matrix-row">
      <span class="matrix-cell positive">1/√2</span>
      <span class="matrix-cell positive">1/√2</span>
    </div>
    <div class="matrix-row">
      <span class="matrix-cell positive">1/√2</span>
      <span class="matrix-cell negative">-1/√2</span>
    </div>
  </div>
  <div class="matrix-bracket right"></div>
</div>
```

**Matrix cell colors**: Same as amplitude colors — green positive, red negative, blue imaginary.

**For multi-qubit gates (CNOT, CZ, SWAP, Toffoli)**:
- Don't show the full 4×4/8×8 matrix (too large, not illuminating)
- Instead show a text description:
  - CNOT: "Control q0 is in superposition → target q1 gets conditionally flipped"
  - Show the input state, the rule applied, and the output state
  - Optional "Show Full Math" toggle that expands to show the full matrix (collapsed by default)

**Step description line**: `Step 1/2: Applied H to q0` — bold, above the matrix display.

### Histogram Display — Detail

**Triggered by**: "📊 Run 1000x" button.

**Layout**: Overlays the math panel area (or expands below it).

```
┌──────────────────────────────────────────────────┐
│  MEASUREMENT RESULTS (1000 shots)                │
│                                                   │
│  |00⟩  ████████████████████████░░░░░  503 (50.3%)│
│  |01⟩  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0 (0.0%) │
│  |10⟩  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0 (0.0%) │
│  |11⟩  ███████████████████████░░░░░░  497 (49.7%)│
│                                                   │
│  Theory: P(|00⟩)=0.500  P(|11⟩)=0.500           │
│                                                   │
│  [🔄 Run Again]           [✕ Close]              │
└──────────────────────────────────────────────────┘
```

**Bar animation**: Bars grow from zero to final width over 800ms with ease-out timing.

**"Run Again"**: Re-samples 1000 shots. Bars animate to new values. Student sees the counts shift slightly each time — demonstrating probabilistic nature.

**Theory line**: Exact probabilities from `getProbabilities()`, shown for comparison.

**Bar colors**: Same as probability bars in state vector display.

### Step Controls — Detail

**Layout**: Horizontal bar below circuit/state area.

```
[|← First] [◀ Back] [  Step 1 / 2  ] [Next ▶] [Last ►|]  [📊 Run 1000x]
```

**Button states**:
- `|← First`: disabled when at step 0
- `◀ Back`: disabled when at step 0
- `Next ▶`: disabled when all gates applied
- `Last ►|`: disabled when all gates applied
- `📊 Run 1000x`: always enabled (runs all gates first if not already at end)

**Step counter**: `Step 0 / 2` (before any gates), `Step 1 / 2` (after first gate), `Step 2 / 2` (all applied).

**Keyboard shortcuts** (desktop):
- Left arrow: step back
- Right arrow: step forward
- Home: go to start
- End: go to end
- Space: run 1000x

### Bottom Toolbar — Detail

```
[💾 Save] [📋 Presets ▼] [🗑 Clear]
```

**Save**: Serializes circuit to localStorage under key `sandbox_circuits`. Also copies JSON to clipboard with toast "Circuit copied!".

**Presets dropdown**: Shows list of pre-built circuits. Selecting one loads it into the editor.

**Clear**: Confirmation toast "Clear circuit? [Yes] [No]". Resets circuit and simulator.

### Preset Circuits

```js
export const PRESETS = [
  {
    name: 'Bell State (Φ+)',
    description: 'Entanglement: H then CNOT produces (1/√2)|00⟩ + (1/√2)|11⟩',
    circuit: { numQubits: 2, gates: [
      { type: 'H', qubit: 0, slot: 0 },
      { type: 'CNOT', control: 0, target: 1, slot: 1 }
    ]}
  },
  {
    name: 'Bell State (Φ−)',
    description: 'Z then H then CNOT produces (1/√2)|00⟩ − (1/√2)|11⟩',
    circuit: { numQubits: 2, gates: [
      { type: 'X', qubit: 0, slot: 0 },
      { type: 'H', qubit: 0, slot: 1 },
      { type: 'CNOT', control: 0, target: 1, slot: 2 }
    ]}
  },
  {
    name: 'Bell State (Ψ+)',
    description: 'H on q0, X on q1, then CNOT produces (1/√2)|01⟩ + (1/√2)|10⟩',
    circuit: { numQubits: 2, gates: [
      { type: 'H', qubit: 0, slot: 0 },
      { type: 'X', qubit: 1, slot: 0 },
      { type: 'CNOT', control: 0, target: 1, slot: 1 }
    ]}
  },
  {
    name: 'Quantum Coin Flip',
    description: 'H on |0⟩ creates perfect 50/50 superposition',
    circuit: { numQubits: 1, gates: [
      { type: 'H', qubit: 0, slot: 0 }
    ]}
  },
  {
    name: 'HZH = X',
    description: 'Three gates that equal a single X gate',
    circuit: { numQubits: 1, gates: [
      { type: 'H', qubit: 0, slot: 0 },
      { type: 'Z', qubit: 0, slot: 1 },
      { type: 'H', qubit: 0, slot: 2 }
    ]}
  },
  {
    name: 'GHZ State (3 qubit)',
    description: 'H then two CNOTs: (1/√2)|000⟩ + (1/√2)|111⟩',
    circuit: { numQubits: 3, gates: [
      { type: 'H', qubit: 0, slot: 0 },
      { type: 'CNOT', control: 0, target: 1, slot: 1 },
      { type: 'CNOT', control: 0, target: 2, slot: 2 }
    ]}
  },
  {
    name: 'Quantum Teleportation',
    description: 'Full teleportation protocol (3 qubits)',
    circuit: { numQubits: 3, gates: [
      // Prepare Bell pair (q1, q2)
      { type: 'H', qubit: 1, slot: 0 },
      { type: 'CNOT', control: 1, target: 2, slot: 1 },
      // Alice's operations (q0, q1)
      { type: 'CNOT', control: 0, target: 1, slot: 2 },
      { type: 'H', qubit: 0, slot: 3 },
    ]}
  },
  {
    name: 'SWAP from CNOTs',
    description: 'Three CNOTs implement a SWAP gate',
    circuit: { numQubits: 2, gates: [
      { type: 'CNOT', control: 0, target: 1, slot: 0 },
      { type: 'CNOT', control: 1, target: 0, slot: 1 },
      { type: 'CNOT', control: 0, target: 1, slot: 2 }
    ]}
  },
];
```

---

## 4. Integration with `app.js`

### New State Fields

```js
// In DEFAULT_STATE, add:
sandbox: {
  lastCircuit: null,          // serialized JSON of last circuit
  savedCircuits: [],          // array of { name, json, savedAt }
}
```

### New Route

```js
// In route() switch:
case 'sandbox':
  renderSandbox();
  break;
```

### Home Screen Button

```html
<!-- Next to the Tutor toggle and settings gear -->
<button id="sandbox-btn" class="sandbox-btn" onclick="navigate('/sandbox')">
  🔬 Sandbox
</button>
```

**Visibility**: Only shown when Chapter 11 is completed.

**Home screen node badge**: After sandbox is first used, chapter 11 node shows 🔬 icon.

### renderSandbox() Function

```js
function renderSandbox() {
  const ch11 = state.chapters[11];
  if (!ch11?.completed) {
    navigate('/');
    return;
  }

  const unlockedGates = getUnlockedGates(state.chapters);
  const savedCircuit = state.sandbox.lastCircuit;

  setContent(`
    <div class="sandbox-screen">
      <div class="sandbox-topbar">
        <button onclick="navigate('/')" class="btn-back">← Back</button>
        <h2>Quantum Sandbox</h2>
        <div class="qubit-selector">
          <label>Qubits:</label>
          <select id="qubit-count">
            <option value="1">1</option>
            <option value="2" selected>2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
      </div>
      <div id="sandbox-container" class="sandbox-body"></div>
    </div>
  `);

  requestAnimationFrame(() => {
    const container = document.getElementById('sandbox-container');
    sandboxCleanup = mountSandbox(container, {
      unlockedGates,
      savedCircuitJSON: savedCircuit,
      onSave: (json) => {
        state.sandbox.lastCircuit = json;
        saveState();
      }
    });
  });
}
```

### Cleanup

```js
let sandboxCleanup = null;

// At top of route():
if (sandboxCleanup) {
  sandboxCleanup();
  sandboxCleanup = null;
}
```

---

## 5. CSS Additions (`static/style.css`)

### Layout Classes

```css
/* Sandbox screen */
.sandbox-screen { display: flex; flex-direction: column; height: 100vh; background: var(--bg); }
.sandbox-topbar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
.sandbox-topbar h2 { flex: 1; margin: 0; font-size: 18px; color: var(--text); }
.sandbox-body { flex: 1; overflow: hidden; display: flex; }

/* Gate palette */
.gate-palette {
  width: 72px; min-width: 72px;
  display: flex; flex-direction: column; gap: 6px;
  padding: 8px 6px; border-right: 1px solid var(--border);
  overflow-y: auto; background: var(--surface);
}
.gate-palette-item {
  width: 56px; height: 56px; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: grab; user-select: none; touch-action: none;
  border: 2px solid transparent; transition: border-color 0.15s, transform 0.15s;
}
.gate-palette-item:active { transform: scale(0.95); }
.gate-palette-item .gate-letter { font-size: 20px; font-weight: 700; font-family: var(--mono); color: #fff; }
.gate-palette-item .gate-label { font-size: 9px; color: var(--text-muted); margin-top: 2px; }
.gate-palette-trash {
  width: 56px; height: 56px; border-radius: 8px; margin-top: auto;
  display: flex; align-items: center; justify-content: center;
  border: 2px dashed #555; font-size: 24px; transition: all 0.15s;
}
.gate-palette-trash.active { border-color: #ff6b6b; background: rgba(255,107,107,0.1); transform: scale(1.1); }

/* Circuit grid */
.circuit-grid-wrap {
  flex: 1; overflow-x: auto; overflow-y: hidden;
  touch-action: pan-x; position: relative;
}
.circuit-grid {
  position: relative; min-width: 100%; height: 100%;
}
.circuit-wire {
  position: absolute; left: 0; right: 0; height: 2px;
  background: #555;
}
.circuit-wire-label {
  position: absolute; left: 8px; font-family: var(--mono);
  font-size: 13px; color: var(--text-muted); transform: translateY(-50%);
}
.circuit-slot {
  position: absolute; width: 48px; height: 48px;
  border: 2px dashed #333; border-radius: 6px;
  transform: translate(-50%, -50%);
}
.circuit-slot.drop-target { border-color: var(--ch-color, var(--blue)); border-style: solid; }
.circuit-gate {
  position: absolute; width: 44px; height: 44px;
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-weight: 700; font-size: 18px; color: #fff;
  cursor: grab; user-select: none; touch-action: none;
  transform: translate(-50%, -50%);
  transition: box-shadow 0.2s, opacity 0.2s;
}
.circuit-gate.selected { box-shadow: 0 0 0 2px #fff, 0 0 8px 2px rgba(255,255,255,0.3); }
.circuit-gate.active { animation: gatePulse 1.5s ease-in-out infinite; }
.circuit-gate.dimmed { opacity: 0.5; }

/* CNOT visual */
.cnot-control { width: 12px; height: 12px; border-radius: 50%; position: absolute; transform: translate(-50%, -50%); }
.cnot-target { width: 24px; height: 24px; border-radius: 50%; border: 2px solid; position: absolute; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; font-size: 16px; }
.cnot-line { position: absolute; width: 2px; transform: translateX(-50%); }

/* State vector display */
.state-display { padding: 12px 16px; border-top: 1px solid var(--border); }
.state-ket { font-family: var(--mono); font-size: 15px; color: var(--text); margin-bottom: 8px; white-space: nowrap; overflow-x: auto; }
.state-bars { display: flex; flex-direction: column; gap: 4px; }
.state-bar-row { display: flex; align-items: center; gap: 8px; height: 24px; }
.state-bar-label { font-family: var(--mono); font-size: 12px; color: var(--text-muted); width: 40px; text-align: right; }
.state-bar { flex: 1; height: 16px; background: var(--border); border-radius: 3px; overflow: hidden; }
.state-bar-fill { height: 100%; border-radius: 3px; transition: width 300ms ease-out; }
.state-bar-value { font-family: var(--mono); font-size: 11px; color: var(--text-muted); width: 44px; }
.state-bar-flash { animation: ampFlash 500ms ease-out; }

/* Math panel */
.math-panel { padding: 12px 16px; border-top: 1px solid var(--border); }
.math-step-label { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.math-equation { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center; }
.matrix { display: inline-flex; align-items: center; }
.matrix-bracket { width: 6px; min-height: 40px; border: 2px solid var(--text); }
.matrix-bracket.left { border-right: none; border-radius: 3px 0 0 3px; }
.matrix-bracket.right { border-left: none; border-radius: 0 3px 3px 0; }
.matrix-body { display: flex; flex-direction: column; padding: 2px 6px; }
.matrix-row { display: flex; gap: 12px; }
.matrix-cell { font-family: var(--mono); font-size: 13px; min-width: 40px; text-align: center; padding: 2px 0; }
.matrix-cell.positive { color: #51cf66; }
.matrix-cell.negative { color: #ff6b6b; }
.matrix-cell.imaginary { color: #4dabf7; }
.matrix-cell.zero { color: #555; }
.math-operator { font-size: 18px; color: var(--text-muted); padding: 0 4px; }

/* Histogram */
.histogram-overlay { padding: 16px; border-top: 1px solid var(--border); }
.histogram-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
.histogram-bar-row { display: flex; align-items: center; gap: 8px; height: 28px; margin-bottom: 4px; }
.histogram-bar-label { font-family: var(--mono); font-size: 13px; width: 40px; text-align: right; color: var(--text-muted); }
.histogram-bar { flex: 1; height: 20px; background: var(--border); border-radius: 3px; overflow: hidden; }
.histogram-bar-fill { height: 100%; border-radius: 3px; transition: width 800ms ease-out; }
.histogram-bar-count { font-family: var(--mono); font-size: 11px; width: 80px; color: var(--text-muted); }
.histogram-theory { font-size: 11px; color: var(--text-muted); margin-top: 8px; font-family: var(--mono); }
.histogram-actions { display: flex; gap: 8px; margin-top: 12px; }

/* Step controls */
.step-controls {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-top: 1px solid var(--border);
  flex-wrap: wrap; justify-content: center;
}
.step-btn { padding: 8px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; min-height: 44px; min-width: 44px; }
.step-counter { font-family: var(--mono); font-size: 13px; color: var(--text-muted); padding: 0 8px; }

/* Bottom toolbar */
.sandbox-toolbar {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px; border-top: 1px solid var(--border);
}

/* Floating gate (during drag) */
.gate-floating {
  position: fixed; pointer-events: none; z-index: 1000;
  width: 44px; height: 44px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-weight: 700; font-size: 18px; color: #fff;
  opacity: 0.9; box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

/* Animations */
@keyframes gatePulse {
  0%, 100% { box-shadow: 0 0 4px 1px currentColor; }
  50% { box-shadow: 0 0 12px 4px currentColor; }
}
@keyframes ampFlash {
  0% { background: rgba(255, 204, 0, 0.3); }
  100% { background: transparent; }
}

/* Qubit selector */
.qubit-selector { display: flex; align-items: center; gap: 6px; }
.qubit-selector label { font-size: 13px; color: var(--text-muted); }
.qubit-selector select { background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; font-size: 14px; }

/* Responsive: landscape optimization */
@media (min-width: 768px) and (orientation: landscape) {
  .sandbox-body { flex-direction: row; }
  .circuit-main { flex: 2; display: flex; flex-direction: column; }
  .circuit-info { flex: 1; display: flex; flex-direction: column; overflow-y: auto; border-left: 1px solid var(--border); }
}

/* Responsive: portrait */
@media (orientation: portrait) {
  .sandbox-body { flex-direction: column; }
  .circuit-grid-wrap { height: 200px; min-height: 200px; }
}

/* Home screen sandbox button */
.sandbox-btn {
  padding: 8px 16px; border-radius: 20px;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--text); font-size: 14px; cursor: pointer;
}
```

---

## 6. Implementation Order

### Phase 1: Simulator Engine
1. Create `static/simulator.js` with all complex math utilities
2. Implement `Simulator` class: reset, applySingleQubitGate, applyCNOT
3. Implement step-through: stepForward, stepBack, history
4. Implement measurement: getProbabilities, measure
5. Implement display helpers: formatComplex, formatAngle, getStateKet
6. **Test in console**:
   ```js
   const sim = new Simulator(2);
   sim.loadGates([{type:'H',qubit:0,slot:0}, {type:'CNOT',control:0,target:1,slot:1}]);
   sim.runAll();
   console.log(sim.getStateKet()); // Should be: 0.707|00⟩ + 0.707|11⟩
   console.log(sim.getProbabilities()); // { '00': 0.5, '01': 0, '10': 0, '11': 0.5 }
   console.log(sim.measure(1000)); // { '00': ~500, '01': 0, '10': 0, '11': ~500 }
   ```

### Phase 2: Circuit Data Model
1. Create `static/circuit.js` with QuantumCircuit class
2. Implement addGate, removeGate, moveGate, clear
3. Implement collision detection, qubit range validation
4. Implement serialize/deserialize
5. **Test in console**:
   ```js
   const c = new QuantumCircuit(2);
   c.addGate({type:'H', qubit:0, slot:0});
   c.addGate({type:'CNOT', control:0, target:1, slot:1});
   const json = c.serialize();
   const c2 = QuantumCircuit.deserialize(json);
   // c2 should have same gates
   ```

### Phase 3: Basic UI — Grid + Palette + State Display
1. Create `static/circuit-ui.js` with mountSandbox
2. Render qubit wires and empty slots (HTML/CSS positioning)
3. Render gate palette with Ch 11 gates only (H, X, Y, Z, I, CNOT)
4. Implement drag from palette to grid (single-qubit gates only)
5. Render placed gates on grid
6. Render state vector (ket notation + probability bars)
7. "Run All" button — applies all gates, updates state display
8. Wire up to app.js route
9. **Test on iPad**: Place H on q0, tap Run, see state vector update

### Phase 4: Step-Through + Math Panel
1. Add step controls (first, back, counter, next, last)
2. Wire stepForward/stepBack to simulator
3. Highlight active gate on grid (glow animation)
4. Dim already-applied gates
5. Render math panel with matrix × vector = result
6. Amplitude change flash animation
7. **Test**: H→CNOT circuit, step through, verify math panel at each step

### Phase 5: Drag-and-Drop Polish
1. Gate movement (drag from grid to grid)
2. Tap-to-select, tap-again-to-delete
3. Drag-to-trash deletion
4. CNOT two-step placement (drag to slot, tap target wire)
5. Floating gate visual during drag
6. **Test on iPad**: Full drag-and-drop workflow with finger and Apple Pencil

### Phase 6: Histogram + Measurement
1. "Run 1000x" button
2. Histogram bar chart rendering
3. Bar growth animation (800ms ease-out)
4. "Run Again" button (re-sample)
5. Theory line showing exact probabilities
6. **Test**: H(q0) circuit — histogram ~500/500 split

### Phase 7: Persistence + Presets
1. Save circuit to localStorage on every change
2. Restore last circuit on mount
3. Preset circuits dropdown
4. Clear circuit with confirmation
5. **Test**: Build circuit, navigate away, return — circuit is preserved

### Phase 8: Multi-Qubit Gate UI
1. CNOT rendering (dot + circled-plus + line)
2. CZ, SWAP, Toffoli rendering
3. Qubit count selector (1-4)
4. Gate unlock logic based on chapter completion
5. Add multi-qubit gate math panel descriptions
6. Implement applyCZ, applySWAP, applyToffoli
7. **Test**: Build GHZ state (3 qubits), verify output

### Phase 9: Parameterized Gates (after Ch 12)
1. Rx, Ry, Rz palette items with angle input popup
2. Preset angle buttons (π/4, π/2, π, etc.)
3. Custom angle input
4. **Test**: Rx(π/2) on |0⟩, verify superposition output

### Phase 10: Polish
1. Keyboard shortcuts (desktop)
2. Landscape layout optimization
3. Grid horizontal scroll for long circuits
4. Gate palette scroll for many gates
5. Animations: gate placement, removal, state transitions
6. Error handling: invalid operations show toast messages
7. Accessibility: semantic HTML, aria labels on controls

---

## 7. Verification Checklist

### Simulator Correctness
- [ ] H|0⟩ = (1/√2)|0⟩ + (1/√2)|1⟩
- [ ] X|0⟩ = |1⟩
- [ ] X|1⟩ = |0⟩
- [ ] Z|0⟩ = |0⟩
- [ ] Z|1⟩ = -|1⟩
- [ ] Y|0⟩ = i|1⟩
- [ ] Y|1⟩ = -i|0⟩
- [ ] HH|0⟩ = |0⟩ (H is self-inverse)
- [ ] XX|0⟩ = |0⟩ (X is self-inverse)
- [ ] H then CNOT on |00⟩ = (1/√2)|00⟩ + (1/√2)|11⟩ (Bell state)
- [ ] CNOT|00⟩ = |00⟩ (control 0, no flip)
- [ ] CNOT|10⟩ = |11⟩ (control 1, flip)
- [ ] CNOT|01⟩ = |01⟩ (control 0, no flip)
- [ ] CNOT|11⟩ = |10⟩ (control 1, flip)
- [ ] CZ|11⟩ = -|11⟩
- [ ] CZ|00⟩ = |00⟩
- [ ] SWAP|01⟩ = |10⟩
- [ ] SWAP|10⟩ = |01⟩
- [ ] Toffoli|110⟩ = |111⟩
- [ ] Toffoli|100⟩ = |100⟩
- [ ] GHZ: H(q0) CNOT(0,1) CNOT(0,2) on |000⟩ = (1/√2)|000⟩ + (1/√2)|111⟩
- [ ] HZH|0⟩ = X|0⟩ = |1⟩
- [ ] Step forward then back = original state (no floating point drift over 10 steps)
- [ ] Measurement distribution matches theory within expected statistical variance (χ² test)
- [ ] Rx(π)|0⟩ = -i|1⟩
- [ ] Ry(π)|0⟩ = |1⟩
- [ ] Rz(π)|0⟩ = e^(-iπ/2)|0⟩ = -i|0⟩
- [ ] S|1⟩ = i|1⟩
- [ ] T applied 4 times to |1⟩ = Z|1⟩ = -|1⟩
- [ ] SS = Z
- [ ] TT = S

### Circuit Data Model
- [ ] addGate succeeds on empty slot
- [ ] addGate throws on occupied slot
- [ ] addGate throws on out-of-range qubit
- [ ] removeGate removes correct gate
- [ ] moveGate moves to new position
- [ ] moveGate throws on collision at destination
- [ ] clear removes all gates
- [ ] getGatesInOrder returns slot-sorted array
- [ ] serialize → deserialize produces identical circuit
- [ ] setNumQubits removes gates on removed qubits

### UI Interactions
- [ ] Drag gate from palette to empty slot → gate appears
- [ ] Drag gate from palette to occupied slot → rejected (no action)
- [ ] Drag placed gate to new empty slot → gate moves
- [ ] Drag placed gate to trash → gate removed
- [ ] Tap placed gate → selected (glow)
- [ ] Tap selected gate → deselected
- [ ] CNOT placement: drag to slot, tap target wire → CNOT placed
- [ ] Step forward → correct gate highlighted, state updates, math panel shows
- [ ] Step back → previous state restored, highlight moves back
- [ ] Run 1000x → histogram appears with animated bars
- [ ] Run Again → bars re-animate to new counts
- [ ] Qubit selector: change from 2 to 3 → wire added, grid re-renders
- [ ] Qubit selector: change from 3 to 2 → gates on q2 removed, wire removed

### iPad-Specific
- [ ] All touch targets ≥ 44×44px
- [ ] Drag works with finger
- [ ] Drag works with Apple Pencil
- [ ] No hover-dependent interactions
- [ ] Landscape layout: palette left, grid center, state/math right
- [ ] Portrait layout: stacked vertically
- [ ] Circuit grid scrolls horizontally for long circuits
- [ ] Gate palette scrolls vertically if many gates unlocked

### Persistence
- [ ] Build circuit, navigate to home, return → circuit preserved
- [ ] Build circuit, close browser, reopen → circuit preserved
- [ ] Load preset → circuit replaces current
- [ ] Clear → circuit emptied, confirmed with toast

### Integration
- [ ] Sandbox button hidden when Ch 11 not completed
- [ ] Sandbox button visible when Ch 11 completed
- [ ] Gate palette shows only unlocked gates
- [ ] Complete Ch 12 → Rx, Ry, Rz appear in palette on next sandbox visit
- [ ] Complete Ch 13 → S, S†, T, T† appear
- [ ] Complete Ch 14 → CZ, SWAP, Toffoli appear
- [ ] No external JS dependencies — all math is vanilla JS
- [ ] State vector display matches ket notation from Chapter 6
- [ ] Probabilities match Born rule from Chapter 8
- [ ] Complex amplitude display format consistent with Chapter 4
