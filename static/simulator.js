// Quantum State Vector Simulator
// 1-4 qubit simulator with step-through history, measurement, and formatted output

// ── Complex Number Utilities ──────────────────────────────────────

export function cAdd(a, b)  { return { re: a.re + b.re, im: a.im + b.im }; }
export function cSub(a, b)  { return { re: a.re - b.re, im: a.im - b.im }; }
export function cMul(a, b)  { return { re: a.re*b.re - a.im*b.im, im: a.re*b.im + a.im*b.re }; }
export function cConj(a)    { return { re: a.re, im: -a.im }; }
export function cAbs2(a)    { return a.re*a.re + a.im*a.im; }
export function cAbs(a)     { return Math.sqrt(cAbs2(a)); }
export function cScale(a,s) { return { re: a.re*s, im: a.im*s }; }
export function cDiv(a,s)   { return { re: a.re/s, im: a.im/s }; }
export function cEq(a,b,tol=1e-9) { return cAbs2(cSub(a,b)) < tol*tol; }
export function cFromPolar(r, theta) { return { re: r*Math.cos(theta), im: r*Math.sin(theta) }; }
export function cZero() { return { re: 0, im: 0 }; }
export function cOne()  { return { re: 1, im: 0 }; }
export function cI()    { return { re: 0, im: 1 }; }

// ── Gate Matrix Definitions ───────────────────────────────────────

const S2 = 1 / Math.SQRT2;

export const GATE_MATRICES = {
  I: [[cOne(), cZero()], [cZero(), cOne()]],
  X: [[cZero(), cOne()], [cOne(), cZero()]],
  Y: [[cZero(), {re:0,im:-1}], [{re:0,im:1}, cZero()]],
  Z: [[cOne(), cZero()], [cZero(), {re:-1,im:0}]],
  H: [[{re:S2,im:0}, {re:S2,im:0}], [{re:S2,im:0}, {re:-S2,im:0}]],
  S:  [[cOne(), cZero()], [cZero(), cI()]],
  Sd: [[cOne(), cZero()], [cZero(), {re:0,im:-1}]],
  T:  [[cOne(), cZero()], [cZero(), cFromPolar(1, Math.PI/4)]],
  Td: [[cOne(), cZero()], [cZero(), cFromPolar(1, -Math.PI/4)]],
};

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

// ── Display Formatting ────────────────────────────────────────────

const SPECIAL_VALUES = [
  { re: S2, im: 0, display: '1/√2' },
  { re: -S2, im: 0, display: '-1/√2' },
  { re: 0, im: S2, display: 'i/√2' },
  { re: 0, im: -S2, display: '-i/√2' },
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
  { re: 0, im: 0.5, display: 'i/2' },
  { re: 0, im: -0.5, display: '-i/2' },
];

export function formatComplex(c) {
  for (const s of SPECIAL_VALUES) {
    if (Math.abs(c.re - s.re) < 1e-6 && Math.abs(c.im - s.im) < 1e-6) return s.display;
  }
  const re = Math.abs(c.re) < 1e-10 ? 0 : +c.re.toFixed(3);
  const im = Math.abs(c.im) < 1e-10 ? 0 : +c.im.toFixed(3);
  if (im === 0) return `${re}`;
  if (re === 0) return im === 1 ? 'i' : im === -1 ? '-i' : `${im}i`;
  const sign = im > 0 ? '+' : '';
  const imStr = im === 1 ? 'i' : im === -1 ? '-i' : `${im}i`;
  return `(${re}${sign}${imStr})`;
}

export function formatAngle(theta) {
  const ratio = theta / Math.PI;
  const KNOWN = [
    { r: 0, d: '0' }, { r: 1, d: 'π' }, { r: -1, d: '-π' }, { r: 2, d: '2π' },
    { r: 0.5, d: 'π/2' }, { r: -0.5, d: '-π/2' },
    { r: 0.25, d: 'π/4' }, { r: -0.25, d: '-π/4' },
    { r: 1/3, d: 'π/3' }, { r: -1/3, d: '-π/3' },
    { r: 2/3, d: '2π/3' }, { r: -2/3, d: '-2π/3' },
    { r: 1/6, d: 'π/6' }, { r: -1/6, d: '-π/6' },
    { r: 3/4, d: '3π/4' }, { r: -3/4, d: '-3π/4' },
  ];
  for (const k of KNOWN) {
    if (Math.abs(ratio - k.r) < 1e-9) return k.d;
  }
  return `${+(theta).toFixed(3)}`;
}

// ── Simulator Class ───────────────────────────────────────────────

export class Simulator {
  constructor(numQubits) {
    this.numQubits = numQubits;
    this.size = 2 ** numQubits;
    this.stateVector = null;
    this.history = [];
    this.currentStep = 0;
    this.gates = [];
    this.reset();
  }

  reset() {
    this.stateVector = Array.from({ length: this.size }, (_, i) =>
      i === 0 ? cOne() : cZero()
    );
    this.history = [{
      stepIndex: -1,
      gateApplied: null,
      state: this.stateVector.map(c => ({ ...c })),
      matrixUsed: null,
      description: 'Initial state |' + '0'.repeat(this.numQubits) + '⟩'
    }];
    this.currentStep = 0;
  }

  loadGates(orderedGates) {
    this.gates = orderedGates;
    this.reset();
  }

  // ── Gate Application ──

  applySingleQubitGate(matrix, targetQubit) {
    const bitPos = this.numQubits - 1 - targetQubit;
    const newState = this.stateVector.map(c => ({ ...c }));
    for (let i = 0; i < this.size; i++) {
      if ((i >> bitPos) & 1) continue;
      const i0 = i;
      const i1 = i | (1 << bitPos);
      const a0 = this.stateVector[i0];
      const a1 = this.stateVector[i1];
      newState[i0] = cAdd(cMul(matrix[0][0], a0), cMul(matrix[0][1], a1));
      newState[i1] = cAdd(cMul(matrix[1][0], a0), cMul(matrix[1][1], a1));
    }
    this.stateVector = newState;
  }

  applyCNOT(controlQubit, targetQubit) {
    const controlBit = this.numQubits - 1 - controlQubit;
    const targetBit = this.numQubits - 1 - targetQubit;
    const newState = this.stateVector.map(() => cZero());
    for (let i = 0; i < this.size; i++) {
      if ((i >> controlBit) & 1) {
        const j = i ^ (1 << targetBit);
        newState[j] = { ...this.stateVector[i] };
      } else {
        newState[i] = { ...this.stateVector[i] };
      }
    }
    this.stateVector = newState;
  }

  applyCZ(controlQubit, targetQubit) {
    const controlBit = this.numQubits - 1 - controlQubit;
    const targetBit = this.numQubits - 1 - targetQubit;
    for (let i = 0; i < this.size; i++) {
      if (((i >> controlBit) & 1) && ((i >> targetBit) & 1)) {
        this.stateVector[i] = cScale(this.stateVector[i], -1);
      }
    }
  }

  applySWAP(qubit0, qubit1) {
    const bit0 = this.numQubits - 1 - qubit0;
    const bit1 = this.numQubits - 1 - qubit1;
    for (let i = 0; i < this.size; i++) {
      const b0 = (i >> bit0) & 1;
      const b1 = (i >> bit1) & 1;
      if (b0 !== b1) {
        const j = i ^ (1 << bit0) ^ (1 << bit1);
        if (i < j) {
          const tmp = { ...this.stateVector[i] };
          this.stateVector[i] = { ...this.stateVector[j] };
          this.stateVector[j] = tmp;
        }
      }
    }
  }

  applyToffoli(control0, control1, target) {
    const cBit0 = this.numQubits - 1 - control0;
    const cBit1 = this.numQubits - 1 - control1;
    const tBit = this.numQubits - 1 - target;
    const newState = this.stateVector.map(() => cZero());
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

  // ── Gate Dispatch ──

  applyGate(gate) {
    let matrixUsed = null;
    let description = '';

    switch (gate.type) {
      case 'I': case 'X': case 'Y': case 'Z': case 'H':
      case 'S': case 'Sd': case 'T': case 'Td': {
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
        matrixUsed = 'CNOT';
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

  // ── Step-Through ──

  stepForward() {
    if (this.currentStep >= this.gates.length) return null;
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
    if (this.currentStep <= 0) return null;
    this.currentStep--;
    this.history.pop();
    const last = this.history[this.history.length - 1];
    this.stateVector = (last.stateAfter || last.state).map(c => ({ ...c }));
    return last;
  }

  runAll() {
    const snapshots = [];
    while (this.currentStep < this.gates.length) snapshots.push(this.stepForward());
    return snapshots;
  }

  goToStart() { while (this.currentStep > 0) this.stepBack(); }
  goToEnd()   { return this.runAll(); }

  // ── Measurement ──

  getProbabilities() {
    const probs = {};
    for (let i = 0; i < this.size; i++) {
      const label = i.toString(2).padStart(this.numQubits, '0');
      probs[label] = cAbs2(this.stateVector[i]);
    }
    return probs;
  }

  measure(numShots = 1000) {
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
        if (r < cumProb) { counts[label]++; break; }
      }
    }
    return counts;
  }

  // ── Display Helpers ──

  getStateKet() {
    const terms = [];
    for (let i = 0; i < this.size; i++) {
      const amp = this.stateVector[i];
      if (cAbs2(amp) < 1e-10) continue;
      const label = i.toString(2).padStart(this.numQubits, '0');
      terms.push({ amp, label });
    }
    if (terms.length === 0) return '0';
    return terms.map(({ amp, label }, idx) => {
      const sign = (idx > 0 && amp.re >= 0 && amp.im === 0) ? ' + ' :
                   (idx > 0 && amp.re < 0 && amp.im === 0) ? ' − ' :
                   (idx > 0) ? ' + ' : '';
      const fc = formatComplex(idx > 0 && amp.re < 0 && amp.im === 0
        ? { re: -amp.re, im: 0 } : amp);
      return `${sign}${fc}|${label}⟩`;
    }).join('');
  }

  getStateVector() { return this.stateVector.map(c => ({ ...c })); }
}
