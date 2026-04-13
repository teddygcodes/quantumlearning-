// Quantum Circuit Data Model
// Gate placement, collision detection, serialization, gate unlock schedule

// ── Gate Unlock Schedule ──────────────────────────────────────────

export const GATE_UNLOCKS = {
  I: 11, X: 11, Y: 11, Z: 11, H: 11, CNOT: 11,
  Rx: 12, Ry: 12, Rz: 12,
  S: 13, Sd: 13, T: 13, Td: 13,
  CZ: 14, SWAP: 14, Toffoli: 14,
};

export function getUnlockedGates(chapterStates) {
  return Object.entries(GATE_UNLOCKS)
    .filter(([_, chId]) => chapterStates[chId]?.completed)
    .map(([type]) => type);
}

// ── Gate Metadata ─────────────────────────────────────────────────

export const GATE_INFO = {
  I:       { label: 'I',    name: 'Identity',   color: '#868e96', qubits: 1 },
  X:       { label: 'X',    name: 'Pauli-X',    color: '#ff6b6b', qubits: 1 },
  Y:       { label: 'Y',    name: 'Pauli-Y',    color: '#51cf66', qubits: 1 },
  Z:       { label: 'Z',    name: 'Pauli-Z',    color: '#cc5de8', qubits: 1 },
  H:       { label: 'H',    name: 'Hadamard',   color: '#4dabf7', qubits: 1 },
  CNOT:    { label: 'CX',   name: 'CNOT',       color: '#74c0fc', qubits: 2 },
  Rx:      { label: 'Rx',   name: 'Rotate X',   color: '#fcc419', qubits: 1, param: true },
  Ry:      { label: 'Ry',   name: 'Rotate Y',   color: '#fcc419', qubits: 1, param: true },
  Rz:      { label: 'Rz',   name: 'Rotate Z',   color: '#fcc419', qubits: 1, param: true },
  S:       { label: 'S',    name: 'S gate',      color: '#20c997', qubits: 1 },
  Sd:      { label: 'S†',   name: 'S-dagger',    color: '#20c997', qubits: 1 },
  T:       { label: 'T',    name: 'T gate',      color: '#ff922b', qubits: 1 },
  Td:      { label: 'T†',   name: 'T-dagger',    color: '#ff922b', qubits: 1 },
  CZ:      { label: 'CZ',   name: 'Controlled-Z', color: '#b197fc', qubits: 2 },
  SWAP:    { label: 'SW',   name: 'SWAP',        color: '#f06595', qubits: 2 },
  Toffoli: { label: 'CCX',  name: 'Toffoli',     color: '#ffd43b', qubits: 3 },
};

// ── Circuit Class ─────────────────────────────────────────────────

export class QuantumCircuit {
  constructor(numQubits = 2, numSlots = 10) {
    this.numQubits = numQubits;
    this.numSlots = numSlots;
    this.gates = [];
    this._nextId = 1;
  }

  addGate(gateConfig) {
    const id = 'g' + (this._nextId++);
    const gate = { ...gateConfig, id };

    const qubits = this._getGateQubits(gate);
    for (const q of qubits) {
      if (q < 0 || q >= this.numQubits) throw new Error(`Qubit ${q} out of range`);
    }
    if (this._hasCollision(gate)) throw new Error(`Slot ${gate.slot} occupied`);
    if (gate.slot >= this.numSlots) this.numSlots = gate.slot + 2;

    this.gates.push(gate);
    return id;
  }

  removeGate(gateId) {
    const idx = this.gates.findIndex(g => g.id === gateId);
    if (idx === -1) throw new Error(`Gate ${gateId} not found`);
    this.gates.splice(idx, 1);
  }

  moveGate(gateId, newSlot, newQubit) {
    const gate = this.gates.find(g => g.id === gateId);
    if (!gate) throw new Error(`Gate ${gateId} not found`);
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
      this.gates.push(updated);
    } catch (e) {
      this.gates.push(saved);
      throw e;
    }
  }

  clear() {
    this.gates = [];
    this._nextId = 1;
  }

  getGatesInOrder() {
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

  isEmpty() { return this.gates.length === 0; }

  setNumQubits(n) {
    if (n < 1 || n > 4) throw new Error('Qubit count must be 1-4');
    this.gates = this.gates.filter(g => {
      const qubits = this._getGateQubits(g);
      return qubits.every(q => q < n);
    });
    this.numQubits = n;
  }

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

  _getGateQubits(gate) {
    switch (gate.type) {
      case 'CNOT': case 'CZ': return [gate.control, gate.target];
      case 'SWAP': return [gate.qubit0, gate.qubit1];
      case 'Toffoli': return [gate.control0, gate.control1, gate.target];
      default: return [gate.qubit];
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
