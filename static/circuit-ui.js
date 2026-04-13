// Quantum Circuit Builder UI
// Drag-and-drop gate palette, circuit grid, step-through, math panel, state display,
// preset circuits, parameterized gate angle popup
//
// Security note: All innerHTML usage renders only our own code-generated strings
// (gate labels, formatted numbers, CSS classes). No user input is injected into the DOM.

import { Simulator, formatComplex, formatAngle, cAbs2, GATE_MATRICES } from './simulator.js?v=1';
import { QuantumCircuit, GATE_INFO, getUnlockedGates } from './circuit.js?v=1';
import { showToast } from './experiment-ui.js?v=7';

// ── Helpers ───────────────────────────────────────────────────────

function gateColor(type) { return GATE_INFO[type]?.color || '#868e96'; }

const MULTI_QUBIT_DESC = {
  CNOT: (g) => `If control q${g.control} is |1⟩, flip target q${g.target}`,
  CZ:   (g) => `Apply −1 phase when both q${g.control} and q${g.target} are |1⟩`,
  SWAP: (g) => `Swap amplitudes of q${g.qubit0} and q${g.qubit1}`,
  Toffoli: (g) => `If both q${g.control0} and q${g.control1} are |1⟩, flip q${g.target}`,
};

// ── Preset Circuits ───────────────────────────────────────────────

const PRESETS = [
  {
    name: 'Bell State (Φ+)',
    desc: 'H then CNOT → (1/√2)|00⟩ + (1/√2)|11⟩',
    qubits: 2,
    gates: [
      { type: 'H', qubit: 0, slot: 0 },
      { type: 'CNOT', control: 0, target: 1, slot: 1 },
    ]
  },
  {
    name: 'Bell State (Φ−)',
    desc: 'X then H then CNOT → (1/√2)|00⟩ − (1/√2)|11⟩',
    qubits: 2,
    gates: [
      { type: 'X', qubit: 0, slot: 0 },
      { type: 'H', qubit: 0, slot: 1 },
      { type: 'CNOT', control: 0, target: 1, slot: 2 },
    ]
  },
  {
    name: 'Bell State (Ψ+)',
    desc: 'H+X then CNOT → (1/√2)|01⟩ + (1/√2)|10⟩',
    qubits: 2,
    gates: [
      { type: 'H', qubit: 0, slot: 0 },
      { type: 'X', qubit: 1, slot: 0 },
      { type: 'CNOT', control: 0, target: 1, slot: 1 },
    ]
  },
  {
    name: 'Quantum Coin Flip',
    desc: 'H on |0⟩ → 50/50 superposition',
    qubits: 1,
    gates: [{ type: 'H', qubit: 0, slot: 0 }]
  },
  {
    name: 'HZH = X',
    desc: 'Three gates that equal a single X',
    qubits: 1,
    gates: [
      { type: 'H', qubit: 0, slot: 0 },
      { type: 'Z', qubit: 0, slot: 1 },
      { type: 'H', qubit: 0, slot: 2 },
    ]
  },
  {
    name: 'GHZ State (3 qubit)',
    desc: 'H then two CNOTs → (1/√2)|000⟩ + (1/√2)|111⟩',
    qubits: 3,
    gates: [
      { type: 'H', qubit: 0, slot: 0 },
      { type: 'CNOT', control: 0, target: 1, slot: 1 },
      { type: 'CNOT', control: 0, target: 2, slot: 2 },
    ]
  },
  {
    name: 'Teleportation Setup',
    desc: 'Bell pair + Alice CNOT + H (3 qubits)',
    qubits: 3,
    gates: [
      { type: 'H', qubit: 1, slot: 0 },
      { type: 'CNOT', control: 1, target: 2, slot: 1 },
      { type: 'CNOT', control: 0, target: 1, slot: 2 },
      { type: 'H', qubit: 0, slot: 3 },
    ]
  },
  {
    name: 'SWAP from CNOTs',
    desc: 'Three CNOTs implement SWAP',
    qubits: 2,
    gates: [
      { type: 'CNOT', control: 0, target: 1, slot: 0 },
      { type: 'CNOT', control: 1, target: 0, slot: 1 },
      { type: 'CNOT', control: 0, target: 1, slot: 2 },
    ]
  },
];

// ── Mount Sandbox ─────────────────────────────────────────────────

export function mountSandbox(container, options) {
  const { unlockedGates = ['H','X','Y','Z','I','CNOT'], savedCircuitJSON = null, onSave = null, savedCircuits: initialSavedCircuits = [], onSaveCircuit = null } = options;
  let savedCircuits = [...initialSavedCircuits];

  let circuit = savedCircuitJSON
    ? QuantumCircuit.deserialize(savedCircuitJSON)
    : new QuantumCircuit(2, 10);
  let sim = new Simulator(circuit.numQubits);
  let selectedPaletteGate = null;
  let cnotPendingSlot = null;
  let stepping = false;

  // ── Drag state ──
  let dragState = null;    // { source, type, gateId?, floatingEl, offsetX, offsetY }
  let dragHoldTimer = null;
  let pointerStartX = 0, pointerStartY = 0;
  let paletteDragStart = null;  // { type, x, y } — set on palette pointerdown, promoted to dragState on move
  let lastPlacedId = null;     // gate ID to animate on next render (set automatically)
  let removingId = null;       // gate ID currently animating removal
  const cleanupFns = [];   // event listener cleanup

  // ── Build DOM ──
  // Safe: all strings below are hardcoded template literals from our own code

  container.innerHTML = '';
  const layout = document.createElement('div');
  layout.className = 'sandbox-layout';
  layout.innerHTML = `
    <div class="gate-palette" id="sb-palette"></div>
    <div class="circuit-main">
      <div class="circuit-grid-wrap" id="sb-grid-wrap">
        <div class="circuit-grid" id="sb-grid"></div>
      </div>
      <div class="circuit-info-panel">
        <div class="state-display" id="sb-state"></div>
        <div class="math-panel" id="sb-math" style="display:none"></div>
        <div class="step-controls" id="sb-controls"></div>
      </div>
      <div class="sandbox-toolbar" id="sb-toolbar"></div>
    </div>
  `;
  container.appendChild(layout);

  const paletteEl = container.querySelector('#sb-palette');
  const gridEl = container.querySelector('#sb-grid');
  const gridWrap = container.querySelector('#sb-grid-wrap');
  const stateEl = container.querySelector('#sb-state');
  const mathEl = container.querySelector('#sb-math');
  const controlsEl = container.querySelector('#sb-controls');
  const toolbarEl = container.querySelector('#sb-toolbar');

  // ── Drag-and-Drop Helpers ──

  function createFloatingGate(type, x, y) {
    const color = gateColor(type);
    const info = GATE_INFO[type];
    const el = document.createElement('div');
    el.className = 'gate-floating';
    el.style.background = color;
    el.style.left = (x - 22) + 'px';
    el.style.top = (y - 22) + 'px';
    el.textContent = info.label;
    container.appendChild(el);
    return el;
  }

  function moveFloating(el, x, y) {
    el.style.left = (x - 22) + 'px';
    el.style.top = (y - 22) + 'px';
  }

  function removeFloating() {
    if (dragState?.floatingEl) {
      dragState.floatingEl.remove();
    }
    dragState = null;
    paletteDragStart = null;
    if (dragHoldTimer) { clearTimeout(dragHoldTimer); dragHoldTimer = null; }
    // Remove drop-target highlights
    gridEl.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    // Remove trash active
    const trash = paletteEl.querySelector('#sb-trash');
    if (trash) trash.classList.remove('active');
  }

  function hitTestSlot(clientX, clientY) {
    const gridRect = gridEl.getBoundingClientRect();
    const scrollLeft = gridWrap.scrollLeft;
    const gx = clientX - gridRect.left + scrollLeft;
    const gy = clientY - gridRect.top;

    const nq = circuit.numQubits;
    const ns = Math.max(circuit.numSlots, 8);

    let bestDist = Infinity, bestQ = -1, bestS = -1;
    for (let q = 0; q < nq; q++) {
      for (let s = 0; s < ns; s++) {
        const sx = slotX(s);
        const sy = wireY(q);
        const dx = gx - sx;
        const dy = gy - sy;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist && dist < 40 * 40) {
          bestDist = dist;
          bestQ = q;
          bestS = s;
        }
      }
    }
    if (bestQ >= 0) return { qubit: bestQ, slot: bestS };
    return null;
  }

  function isOverTrash(clientX, clientY) {
    const trash = paletteEl.querySelector('#sb-trash');
    if (!trash) return false;
    const r = trash.getBoundingClientRect();
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
  }

  function updateDropHighlight(clientX, clientY) {
    // Clear old highlights
    gridEl.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    const trash = paletteEl.querySelector('#sb-trash');

    if (isOverTrash(clientX, clientY)) {
      if (trash) trash.classList.add('active');
      return;
    }
    if (trash) trash.classList.remove('active');

    const hit = hitTestSlot(clientX, clientY);
    if (hit && !circuit.getGateAt(hit.qubit, hit.slot)) {
      const slotEl = gridEl.querySelector(`.circuit-slot[data-q="${hit.qubit}"][data-s="${hit.slot}"]`);
      if (slotEl) slotEl.classList.add('drop-target');
    }
  }

  // ── Palette Events (drag from palette) ──

  function onPalettePointerDown(e) {
    const item = e.target.closest('.gate-palette-item');
    if (!item) return;
    const type = item.dataset.gate;
    if (!type) return;

    e.preventDefault();

    // If in CNOT pending mode, cancel it
    if (cnotPendingSlot !== null) {
      cnotPendingSlot = null;
      selectedPaletteGate = null;
    }

    // Record start position — don't create floating gate until pointer moves
    paletteDragStart = { type, x: e.clientX, y: e.clientY };
    selectedPaletteGate = type;
    renderPalette();
  }

  // ── Grid Events (drag existing gate or tap slot) ──

  function onGridPointerDown(e) {
    const slotEl = e.target.closest('.circuit-slot');
    const gateEl = e.target.closest('.circuit-gate, .cnot-control, .cnot-target, .swap-x');

    if (gateEl && gateEl.dataset.id) {
      // Pointer down on existing gate — start hold timer for drag
      e.preventDefault();
      const gateId = gateEl.dataset.id;
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;

      dragHoldTimer = setTimeout(() => {
        // Start dragging existing gate
        const gate = circuit.gates.find(g => g.id === gateId);
        if (!gate) return;
        dragState = {
          source: 'grid',
          type: gate.type,
          gateId,
          floatingEl: createFloatingGate(gate.type, e.clientX, e.clientY),
        };
        // Add ghost class to original
        gateEl.classList.add('ghost');
      }, 200);
      return;
    }

    if (slotEl) {
      const q = +slotEl.dataset.q;
      const s = +slotEl.dataset.s;
      handleSlotTap(q, s);
    }
  }

  // ── Global pointer move/up (attached to container) ──

  function onPointerMove(e) {
    if (!dragState) {
      // Promote palette tap to drag once pointer moves enough
      if (paletteDragStart) {
        const dx = e.clientX - paletteDragStart.x;
        const dy = e.clientY - paletteDragStart.y;
        if (dx * dx + dy * dy > 64) {
          dragState = {
            source: 'palette',
            type: paletteDragStart.type,
            floatingEl: createFloatingGate(paletteDragStart.type, e.clientX, e.clientY),
          };
          paletteDragStart = null;
        }
      }
      // Check if pointer moved too far before hold timer fired — cancel hold
      if (dragHoldTimer) {
        const dx = e.clientX - pointerStartX;
        const dy = e.clientY - pointerStartY;
        if (dx * dx + dy * dy > 64) {
          clearTimeout(dragHoldTimer);
          dragHoldTimer = null;
        }
      }
      if (!dragState) return;
    }
    e.preventDefault();
    moveFloating(dragState.floatingEl, e.clientX, e.clientY);
    updateDropHighlight(e.clientX, e.clientY);
  }

  function onPointerUp(e) {
    // Clear palette drag start (tap without move = just select, don't drag)
    paletteDragStart = null;

    if (dragHoldTimer) {
      clearTimeout(dragHoldTimer);
      dragHoldTimer = null;

      // Hold timer didn't fire — this was a quick tap on a gate = remove it
      const gateEl = e.target.closest('.circuit-gate, .cnot-control, .cnot-target, .swap-x');
      if (gateEl && gateEl.dataset.id && !dragState) {
        handleGateTap(gateEl.dataset.id);
        return;
      }
    }

    if (!dragState) return;

    const { source, type, gateId } = dragState;

    // Check drop target
    if (isOverTrash(e.clientX, e.clientY) && source === 'grid' && gateId) {
      // Drop on trash — delete gate
      try { circuit.removeGate(gateId); } catch (err) { showToast(container, 'Could not remove gate', 'error'); }
      removeFloating();
      onCircuitChange();
      return;
    }

    const hit = hitTestSlot(e.clientX, e.clientY);
    if (hit && !circuit.getGateAt(hit.qubit, hit.slot)) {
      const info = GATE_INFO[type];

      if (source === 'grid' && gateId) {
        // Move existing gate
        try {
          circuit.moveGate(gateId, hit.slot, hit.qubit);
        } catch (err) { showToast(container, 'Slot occupied', 'error'); }
        removeFloating();
        onCircuitChange();
        return;
      }

      // New gate from palette
      if (info.param) {
        // Parameterized gate — show angle popup
        removeFloating();
        selectedPaletteGate = null;
        showAnglePopup(type, hit.qubit, hit.slot);
        return;
      }

      if (info.qubits >= 2) {
        // Multi-qubit: set control, enter pending mode for target tap
        cnotPendingSlot = { type, controlQubit: hit.qubit, slot: hit.slot };
        removeFloating();
        selectedPaletteGate = null;
        fullRender();
        return;
      }

      // Single-qubit gate
      try { circuit.addGate({ type, qubit: hit.qubit, slot: hit.slot }); } catch (err) { showToast(container, 'Slot occupied', 'error'); }
      removeFloating();
      selectedPaletteGate = null;
      onCircuitChange();
      return;
    }

    // Drop on invalid area — cancel
    removeFloating();
    selectedPaletteGate = null;
    renderPalette();
  }

  // Attach global pointer listeners to container
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);
  cleanupFns.push(() => {
    container.removeEventListener('pointermove', onPointerMove);
    container.removeEventListener('pointerup', onPointerUp);
    container.removeEventListener('pointercancel', onPointerUp);
  });

  // ── Keyboard Shortcuts ──

  function onKeyDown(e) {
    // Don't handle if an input is focused
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') return;

    switch (e.key) {
      case 'ArrowRight': stepping = true; sim.stepForward(); fullRender(); e.preventDefault(); break;
      case 'ArrowLeft':  stepping = true; sim.stepBack();    fullRender(); e.preventDefault(); break;
      case 'Home':       stepping = true; sim.goToStart();   fullRender(); e.preventDefault(); break;
      case 'End':        stepping = true; sim.goToEnd();     fullRender(); e.preventDefault(); break;
      case ' ':          showHistogram(); e.preventDefault(); break;
      case 'Escape':
        if (document.querySelector('.angle-popup')) {
          document.querySelector('.angle-popup').remove();
        } else if (document.querySelector('.manage-saves-overlay')) {
          document.querySelector('.manage-saves-overlay').remove();
        } else if (cnotPendingSlot !== null) {
          cnotPendingSlot = null; selectedPaletteGate = null; fullRender();
        }
        break;
      case 'Backspace': case 'Delete':
        if (!circuit.isEmpty()) {
          const last = circuit.gates[circuit.gates.length - 1];
          try { circuit.removeGate(last.id); } catch (err) {}
          onCircuitChange();
        }
        e.preventDefault();
        break;
    }
  }
  document.addEventListener('keydown', onKeyDown);
  cleanupFns.push(() => document.removeEventListener('keydown', onKeyDown));

  // ── Angle Popup (Rx, Ry, Rz) ──

  function showAnglePopup(type, qubit, slot) {
    const presets = [
      { label: 'π/4', value: Math.PI / 4 },
      { label: 'π/3', value: Math.PI / 3 },
      { label: 'π/2', value: Math.PI / 2 },
      { label: '2π/3', value: Math.PI * 2 / 3 },
      { label: 'π', value: Math.PI },
    ];

    // Safe: all values are hardcoded angle strings
    const popup = document.createElement('div');
    popup.className = 'angle-popup';
    popup.innerHTML = `
      <div class="angle-popup-title">Angle for ${type}</div>
      <div class="angle-popup-presets">
        ${presets.map((p, i) => `<button class="angle-preset-btn" data-idx="${i}">${p.label}</button>`).join('')}
      </div>
      <div class="angle-popup-custom">
        <input type="text" class="angle-input" placeholder="e.g. 1.57" inputmode="decimal">
        <button class="angle-ok-btn">OK</button>
      </div>
      <button class="angle-cancel-btn">Cancel</button>
    `;
    container.appendChild(popup);

    // Center popup
    requestAnimationFrame(() => {
      popup.style.left = '50%';
      popup.style.top = '50%';
      popup.style.transform = 'translate(-50%, -50%)';
    });

    function placeWithAngle(theta) {
      popup.remove();
      try {
        circuit.addGate({ type, qubit, slot, theta });
      } catch (err) { showToast(container, err.message, 'error'); }
      onCircuitChange();
    }

    popup.querySelectorAll('.angle-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = +btn.dataset.idx;
        placeWithAngle(presets[idx].value);
      });
    });

    popup.querySelector('.angle-ok-btn').addEventListener('click', () => {
      const input = popup.querySelector('.angle-input');
      const val = parseFloat(input.value);
      if (!isNaN(val)) placeWithAngle(val);
    });

    popup.querySelector('.angle-cancel-btn').addEventListener('click', () => {
      popup.remove();
    });
  }

  // ── Palette ──

  function renderPalette() {
    const visible = unlockedGates.filter(type => {
      const info = GATE_INFO[type];
      if (!info) return false;
      if (info.qubits > circuit.numQubits) return false;
      return true;
    });

    // Safe: gate labels and colors are from our GATE_INFO constants
    paletteEl.innerHTML = visible.map(type => {
      const info = GATE_INFO[type];
      const sel = selectedPaletteGate === type ? ' selected' : '';
      return `<div class="gate-palette-item${sel}" data-gate="${type}" style="background:${info.color}20;border-color:${sel ? info.color : 'transparent'}">
        <span class="gate-letter" style="color:${info.color}">${info.label}</span>
        <span class="gate-label">${info.name}</span>
      </div>`;
    }).join('') + `<div class="gate-palette-trash" id="sb-trash">🗑</div>`;

    // Attach drag start to palette items
    paletteEl.addEventListener('pointerdown', onPalettePointerDown);
  }

  // ── Grid ──

  const SLOT_W = 56;
  const WIRE_SPACING = 64;
  const WIRE_Y_START = 40;
  const SLOT_X_START = 48;

  function wireY(q) { return WIRE_Y_START + q * WIRE_SPACING; }
  function slotX(s) { return SLOT_X_START + s * SLOT_W; }

  function renderGrid() {
    const nq = circuit.numQubits;
    const ns = Math.max(circuit.numSlots, 8);
    const gridW = SLOT_X_START + ns * SLOT_W + 24;
    const gridH = WIRE_Y_START + nq * WIRE_SPACING;
    gridEl.style.width = gridW + 'px';
    gridEl.style.height = gridH + 'px';

    // Safe: all values are computed from circuit model
    let html = '';

    // Wires
    for (let q = 0; q < nq; q++) {
      const y = wireY(q);
      html += `<div class="circuit-wire" style="top:${y}px;left:${SLOT_X_START - 8}px;right:8px"></div>`;
      html += `<div class="circuit-wire-label" style="top:${y}px;left:4px">q${q}</div>`;
    }

    // Empty slots
    for (let q = 0; q < nq; q++) {
      for (let s = 0; s < ns; s++) {
        if (!circuit.getGateAt(q, s)) {
          const highlight = dragState || selectedPaletteGate || cnotPendingSlot !== null;
          html += `<div class="circuit-slot${highlight ? ' droppable' : ''}" data-q="${q}" data-s="${s}" style="left:${slotX(s)}px;top:${wireY(q)}px"></div>`;
        }
      }
    }

    // Placed gates
    for (const gate of circuit.getGatesInOrder()) {
      const color = gateColor(gate.type);
      const info = GATE_INFO[gate.type];

      let stepClass = '';
      if (stepping) {
        const gateIdx = sim.gates.findIndex(g => g.id === gate.id);
        if (gateIdx !== -1) {
          if (gateIdx < sim.currentStep) stepClass = ' dimmed';
          else if (gateIdx === sim.currentStep) stepClass = ' active';
        }
      }

      if (gate.type === 'CNOT' || gate.type === 'CZ') {
        const cy = wireY(gate.control);
        const ty = wireY(gate.target);
        const x = slotX(gate.slot);
        const minY = Math.min(cy, ty);
        const maxY = Math.max(cy, ty);
        html += `<div class="cnot-line${stepClass}" style="left:${x}px;top:${minY}px;height:${maxY - minY}px;background:${color}" data-id="${gate.id}"></div>`;
        html += `<div class="cnot-control${stepClass}" style="left:${x}px;top:${cy}px;background:${color}" data-id="${gate.id}"></div>`;
        if (gate.type === 'CNOT') {
          html += `<div class="cnot-target${stepClass}" style="left:${x}px;top:${ty}px;border-color:${color};color:${color}" data-id="${gate.id}">⊕</div>`;
        } else {
          html += `<div class="cnot-control${stepClass}" style="left:${x}px;top:${ty}px;background:${color}" data-id="${gate.id}"></div>`;
        }
      } else if (gate.type === 'SWAP') {
        const y0 = wireY(gate.qubit0);
        const y1 = wireY(gate.qubit1);
        const x = slotX(gate.slot);
        const minY = Math.min(y0, y1);
        const maxY = Math.max(y0, y1);
        html += `<div class="cnot-line${stepClass}" style="left:${x}px;top:${minY}px;height:${maxY - minY}px;background:${color}" data-id="${gate.id}"></div>`;
        html += `<div class="swap-x${stepClass}" style="left:${x}px;top:${y0}px;color:${color}" data-id="${gate.id}">×</div>`;
        html += `<div class="swap-x${stepClass}" style="left:${x}px;top:${y1}px;color:${color}" data-id="${gate.id}">×</div>`;
      } else if (gate.type === 'Toffoli') {
        const c0y = wireY(gate.control0);
        const c1y = wireY(gate.control1);
        const ty = wireY(gate.target);
        const x = slotX(gate.slot);
        const ys = [c0y, c1y, ty];
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        html += `<div class="cnot-line${stepClass}" style="left:${x}px;top:${minY}px;height:${maxY - minY}px;background:${color}" data-id="${gate.id}"></div>`;
        html += `<div class="cnot-control${stepClass}" style="left:${x}px;top:${c0y}px;background:${color}" data-id="${gate.id}"></div>`;
        html += `<div class="cnot-control${stepClass}" style="left:${x}px;top:${c1y}px;background:${color}" data-id="${gate.id}"></div>`;
        html += `<div class="cnot-target${stepClass}" style="left:${x}px;top:${ty}px;border-color:${color};color:${color}" data-id="${gate.id}">⊕</div>`;
      } else {
        // Single-qubit gate — show angle label for parameterized gates
        const x = slotX(gate.slot);
        const y = wireY(gate.qubit);
        const angleLabel = gate.theta !== undefined ? `<span class="gate-angle">${formatAngle(gate.theta)}</span>` : '';
        html += `<div class="circuit-gate${stepClass}" style="left:${x}px;top:${y}px;background:${color}" data-id="${gate.id}">${info.label}${angleLabel}</div>`;
      }
    }

    if (cnotPendingSlot !== null) {
      html += `<div class="cnot-prompt">Tap target qubit wire</div>`;
    }

    gridEl.innerHTML = html;

    // Attach grid pointer handler for slots and gate taps/drags
    gridEl.addEventListener('pointerdown', onGridPointerDown);

    // Update scroll indicators
    updateScrollIndicators();
  }

  function updateScrollIndicators() {
    const w = gridWrap;
    w.classList.toggle('has-scroll-left', w.scrollLeft > 4);
    w.classList.toggle('has-scroll-right', w.scrollLeft + w.clientWidth < w.scrollWidth - 4);
  }
  gridWrap.addEventListener('scroll', updateScrollIndicators);
  cleanupFns.push(() => gridWrap.removeEventListener('scroll', updateScrollIndicators));

  // ── Slot Tap Logic ──

  function handleSlotTap(qubit, slot) {
    if (!selectedPaletteGate && cnotPendingSlot === null) return;

    if (cnotPendingSlot !== null) {
      const pending = cnotPendingSlot;
      cnotPendingSlot = null;

      if (qubit === pending.controlQubit) {
        showToast(container, 'Target must be a different wire', 'error');
        selectedPaletteGate = null;
        fullRender();
        return;
      }

      try {
        if (pending.type === 'SWAP') {
          circuit.addGate({ type: 'SWAP', qubit0: pending.controlQubit, qubit1: qubit, slot: pending.slot });
        } else {
          circuit.addGate({ type: pending.type, control: pending.controlQubit, target: qubit, slot: pending.slot });
        }
      } catch (e) { showToast(container, e.message, 'error'); }

      selectedPaletteGate = null;
      onCircuitChange();
      return;
    }

    const type = selectedPaletteGate;
    const info = GATE_INFO[type];

    if (info.param) {
      selectedPaletteGate = null;
      showAnglePopup(type, qubit, slot);
      return;
    }

    if (info.qubits >= 2) {
      cnotPendingSlot = { type, controlQubit: qubit, slot };
      fullRender();
      return;
    }

    try { circuit.addGate({ type, qubit, slot }); } catch (e) { showToast(container, 'Slot occupied', 'error'); }
    onCircuitChange();
  }

  function handleGateTap(gateId) {
    if (removingId) return; // animation in progress
    const el = gridEl.querySelector(`[data-id="${gateId}"]`);
    if (el) {
      removingId = gateId;
      el.classList.add('removing');
      setTimeout(() => {
        removingId = null;
        try { circuit.removeGate(gateId); } catch (e) { showToast(container, 'Could not remove gate', 'error'); }
        onCircuitChange();
      }, 150);
    } else {
      try { circuit.removeGate(gateId); } catch (e) { showToast(container, 'Could not remove gate', 'error'); }
      onCircuitChange();
    }
  }

  // ── State Vector Display ──

  function renderState() {
    const ket = sim.getStateKet();
    const probs = sim.getProbabilities();
    const labels = Object.keys(probs);

    // Safe: ket notation and labels are computed from simulator
    let html = `<div class="state-ket">${ket}</div><div class="state-bars">`;
    for (const label of labels) {
      const p = probs[label];
      const pct = p * 100;
      const amp = sim.stateVector[parseInt(label, 2)];
      const colorClass = ampColorClass(amp);
      html += `<div class="state-bar-row">
        <span class="state-bar-label">|${label}⟩</span>
        <div class="state-bar"><div class="state-bar-fill ${colorClass}" style="width:${pct}%"></div></div>
        <span class="state-bar-value">${p.toFixed(3)}</span>
      </div>`;
    }
    html += '</div>';
    stateEl.innerHTML = html;
  }

  function ampColorClass(amp) {
    if (cAbs2(amp) < 1e-10) return 'amp-zero';
    if (Math.abs(amp.im) < 1e-10) return amp.re >= 0 ? 'amp-pos' : 'amp-neg';
    return 'amp-imag';
  }

  // ── Math Panel ──

  function renderMathPanel() {
    if (!stepping || sim.currentStep === 0) {
      mathEl.style.display = 'none';
      return;
    }

    mathEl.style.display = '';
    const snapshot = sim.history[sim.history.length - 1];
    if (!snapshot || snapshot.stepIndex === -1) {
      mathEl.style.display = 'none';
      return;
    }

    const gate = snapshot.gateApplied;
    const desc = snapshot.description;
    const total = sim.gates.length;

    // Safe: all values from simulator
    let html = `<div class="math-step-label">Step ${snapshot.stepIndex + 1}/${total}: ${desc}</div>`;

    if (typeof snapshot.matrixUsed === 'string') {
      const descFn = MULTI_QUBIT_DESC[snapshot.matrixUsed];
      const explanation = descFn ? descFn(gate) : snapshot.matrixUsed;
      html += `<div class="math-description">${explanation}</div>`;
      html += renderStateTransition(snapshot.stateBefore, snapshot.stateAfter);
    } else if (snapshot.matrixUsed) {
      html += renderMatrixEquation(snapshot.matrixUsed, gate, snapshot.stateBefore, snapshot.stateAfter);
    }

    mathEl.innerHTML = html;
  }

  function renderMatrixEquation(matrix, gate, stateBefore, stateAfter) {
    const nq = sim.numQubits;
    const bitPos = nq - 1 - gate.qubit;
    let i0 = 0, i1 = 1 << bitPos;
    for (let i = 0; i < sim.size; i++) {
      if ((i >> bitPos) & 1) continue;
      const j = i | (1 << bitPos);
      if (cAbs2(stateBefore[i]) > 1e-10 || cAbs2(stateBefore[j]) > 1e-10) {
        i0 = i; i1 = j; break;
      }
    }
    return `<div class="math-equation">
      ${renderMatrix(matrix)}
      <span class="math-operator">×</span>
      ${renderColumnVector([stateBefore[i0], stateBefore[i1]])}
      <span class="math-operator">=</span>
      ${renderColumnVector([stateAfter[i0], stateAfter[i1]])}
    </div>`;
  }

  function renderMatrix(m) {
    return `<div class="matrix"><div class="matrix-bracket left"></div><div class="matrix-body">
      ${m.map(row => `<div class="matrix-row">${row.map(c =>
        `<span class="matrix-cell ${cellColorClass(c)}">${formatComplex(c)}</span>`
      ).join('')}</div>`).join('')}
    </div><div class="matrix-bracket right"></div></div>`;
  }

  function renderColumnVector(vals) {
    return `<div class="matrix"><div class="matrix-bracket left"></div><div class="matrix-body">
      ${vals.map(c => `<div class="matrix-row"><span class="matrix-cell ${cellColorClass(c)}">${formatComplex(c)}</span></div>`).join('')}
    </div><div class="matrix-bracket right"></div></div>`;
  }

  function renderStateTransition(before, after) {
    const nq = sim.numQubits;
    const bTerms = [], aTerms = [];
    for (let i = 0; i < before.length; i++) {
      const label = i.toString(2).padStart(nq, '0');
      if (cAbs2(before[i]) > 1e-10) bTerms.push(`${formatComplex(before[i])}|${label}⟩`);
      if (cAbs2(after[i]) > 1e-10) aTerms.push(`${formatComplex(after[i])}|${label}⟩`);
    }
    return `<div class="math-transition">
      <span class="math-state-label">Before:</span> <span class="state-ket">${bTerms.join(' + ') || '|' + '0'.repeat(nq) + '⟩'}</span><br>
      <span class="math-state-label">After:</span> <span class="state-ket">${aTerms.join(' + ') || '0'}</span>
    </div>`;
  }

  function cellColorClass(c) {
    if (cAbs2(c) < 1e-10) return 'zero';
    if (Math.abs(c.im) < 1e-10) return c.re >= 0 ? 'positive' : 'negative';
    return 'imaginary';
  }

  // ── Step Controls ──

  function renderControls() {
    const total = sim.gates.length;
    const step = sim.currentStep;
    const atStart = step === 0;
    const atEnd = step >= total;

    // Safe: only integers and fixed button labels
    controlsEl.innerHTML = `
      <button class="step-btn" id="sb-first" ${atStart ? 'disabled' : ''}>|◀</button>
      <button class="step-btn" id="sb-back" ${atStart ? 'disabled' : ''}>◀ Back</button>
      <span class="step-counter">Step ${step} / ${total}</span>
      <button class="step-btn" id="sb-next" ${atEnd ? 'disabled' : ''}>Next ▶</button>
      <button class="step-btn" id="sb-last" ${atEnd ? 'disabled' : ''}>▶|</button>
      <button class="step-btn sb-measure-btn" id="sb-measure">📊 Run 1000×</button>
    `;

    controlsEl.querySelector('#sb-first').addEventListener('click', () => { stepping = true; sim.goToStart(); fullRender(); });
    controlsEl.querySelector('#sb-back').addEventListener('click', () => { stepping = true; sim.stepBack(); fullRender(); });
    controlsEl.querySelector('#sb-next').addEventListener('click', () => { stepping = true; sim.stepForward(); fullRender(); });
    controlsEl.querySelector('#sb-last').addEventListener('click', () => { stepping = true; sim.goToEnd(); fullRender(); });
    controlsEl.querySelector('#sb-measure').addEventListener('click', () => {
      if (sim.currentStep < sim.gates.length) { stepping = true; sim.goToEnd(); }
      showHistogram();
    });
  }

  // ── Histogram ──

  function showHistogram() {
    const counts = sim.measure(1000);
    const probs = sim.getProbabilities();
    const labels = Object.keys(counts);
    const maxCount = Math.max(...Object.values(counts), 1);

    // Safe: counts/labels are computed numeric values and binary strings
    let html = `<div class="histogram-title">Measurement Results (1000 shots)</div>`;
    for (let idx = 0; idx < labels.length; idx++) {
      const label = labels[idx];
      const count = counts[label];
      const pct = (count / 1000 * 100).toFixed(1);
      const barPct = (count / maxCount) * 100;
      html += `<div class="histogram-bar-row">
        <span class="histogram-bar-label">|${label}⟩</span>
        <div class="histogram-bar"><div class="histogram-bar-fill" style="width:0%;background:${barColor(count, maxCount)}" data-w="${barPct}"></div></div>
        <span class="histogram-bar-count">${count} (${pct}%)</span>
      </div>`;
    }
    html += `<div class="histogram-theory">Theory: ${labels.map(l => `P(|${l}⟩)=${probs[l].toFixed(3)}`).join('  ')}</div>`;
    html += `<div class="histogram-actions">
      <button class="step-btn" id="sb-rerun">🔄 Run Again</button>
      <button class="step-btn" id="sb-close-hist">✕ Close</button>
    </div>`;

    mathEl.style.display = '';
    mathEl.innerHTML = html;

    // Staggered bar animation
    requestAnimationFrame(() => {
      mathEl.querySelectorAll('.histogram-bar-fill').forEach((bar, i) => {
        setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, i * 80);
      });
    });

    mathEl.querySelector('#sb-rerun').addEventListener('click', showHistogram);
    mathEl.querySelector('#sb-close-hist').addEventListener('click', () => { mathEl.style.display = 'none'; fullRender(); });
  }

  function barColor(count, max) {
    const t = count / max;
    return `hsl(210, ${60 + t * 20}%, ${40 + t * 15}%)`;
  }

  // ── Bottom Toolbar (Save + Presets + Clear) ──

  function renderToolbar() {
    // Safe: preset names and saved circuit names are our own strings
    const savedOpts = savedCircuits.length
      ? `<optgroup label="── Your Circuits ──">
          ${savedCircuits.map((s, i) => `<option value="s${i}">${s.name}</option>`).join('')}
          <option value="manage">Manage Saves...</option>
         </optgroup>`
      : '';

    toolbarEl.innerHTML = `
      <button class="step-btn" id="sb-save">💾 Save</button>
      <select class="preset-select" id="sb-presets">
        <option value="">📋 Load Preset...</option>
        ${PRESETS.map((p, i) => `<option value="p${i}">${p.name}</option>`).join('')}
        ${savedOpts}
      </select>
      <button class="step-btn" id="sb-clear">🗑 Clear</button>
    `;

    // Save button
    toolbarEl.querySelector('#sb-save').addEventListener('click', () => {
      if (circuit.isEmpty()) { showToast(container, 'Nothing to save', 'error'); return; }
      showSaveInput();
    });

    // Presets + saved circuits dropdown
    toolbarEl.querySelector('#sb-presets').addEventListener('change', (e) => {
      const val = e.target.value;
      if (!val) return;

      if (val === 'manage') {
        e.target.value = '';
        showManageSaves();
        return;
      }

      if (val.startsWith('p')) {
        const preset = PRESETS[+val.slice(1)];
        if (preset) loadPreset(preset);
      } else if (val.startsWith('s')) {
        const saved = savedCircuits[+val.slice(1)];
        if (saved) {
          circuit = QuantumCircuit.deserialize(saved.json);
          const sel = document.getElementById('qubit-count');
          if (sel) sel.value = circuit.numQubits;
          sim = new Simulator(circuit.numQubits);
          stepping = false;
          if (onSave) onSave(circuit.serialize());
          fullRender();
          showToast(container, 'Loaded: ' + saved.name, 'info');
        }
      }
      e.target.value = '';
    });

    // Clear button
    toolbarEl.querySelector('#sb-clear').addEventListener('click', () => {
      if (circuit.isEmpty()) return;
      const btn = toolbarEl.querySelector('#sb-clear');
      if (btn.dataset.confirm) {
        circuit.clear();
        onCircuitChange();
        showToast(container, 'Circuit cleared', 'info');
        btn.dataset.confirm = '';
        btn.textContent = '🗑 Clear';
      } else {
        btn.dataset.confirm = '1';
        btn.textContent = 'Confirm Clear?';
        setTimeout(() => {
          if (btn.dataset.confirm) {
            btn.dataset.confirm = '';
            btn.textContent = '🗑 Clear';
          }
        }, 2000);
      }
    });
  }

  function showSaveInput() {
    const saveBtn = toolbarEl.querySelector('#sb-save');
    if (!saveBtn) return;
    // Replace save button area with inline input
    saveBtn.outerHTML = `<div class="save-input-wrap" id="sb-save-wrap">
      <input class="save-name-input" id="sb-save-name" placeholder="Circuit name..." maxlength="30">
      <button class="step-btn save-ok-btn" id="sb-save-ok">OK</button>
      <button class="step-btn save-cancel-btn" id="sb-save-cancel">✕</button>
    </div>`;
    const input = toolbarEl.querySelector('#sb-save-name');
    input.focus();

    const doSave = () => {
      const name = input.value.trim();
      if (!name) { showToast(container, 'Enter a name', 'error'); return; }
      savedCircuits.push({ name, json: circuit.serialize(), date: new Date().toISOString().slice(0, 10) });
      if (savedCircuits.length > 20) savedCircuits.shift();
      if (onSaveCircuit) onSaveCircuit(savedCircuits);
      showToast(container, 'Saved: ' + name, 'success');
      renderToolbar();
    };

    toolbarEl.querySelector('#sb-save-ok').addEventListener('click', doSave);
    toolbarEl.querySelector('#sb-save-cancel').addEventListener('click', () => renderToolbar());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSave();
      if (e.key === 'Escape') renderToolbar();
    });
  }

  function showManageSaves() {
    if (!savedCircuits.length) return;
    const overlay = document.createElement('div');
    overlay.className = 'manage-saves-overlay';
    // Safe: saved circuit names are user-provided but rendered as textContent below
    const list = savedCircuits.map((s, i) => {
      const div = document.createElement('div');
      div.className = 'manage-save-row';
      const nameSpan = document.createElement('span');
      nameSpan.className = 'manage-save-name';
      nameSpan.textContent = s.name;
      const dateSpan = document.createElement('span');
      dateSpan.className = 'manage-save-date';
      dateSpan.textContent = s.date || '';
      const delBtn = document.createElement('button');
      delBtn.className = 'manage-save-del';
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => {
        savedCircuits.splice(i, 1);
        if (onSaveCircuit) onSaveCircuit(savedCircuits);
        overlay.remove();
        renderToolbar();
        showToast(container, 'Deleted: ' + s.name, 'info');
      });
      div.appendChild(nameSpan);
      div.appendChild(dateSpan);
      div.appendChild(delBtn);
      return div;
    });

    const title = document.createElement('div');
    title.className = 'manage-saves-title';
    title.textContent = 'Saved Circuits';
    overlay.appendChild(title);
    list.forEach(row => overlay.appendChild(row));
    const closeBtn = document.createElement('button');
    closeBtn.className = 'angle-cancel-btn';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => overlay.remove());
    overlay.appendChild(closeBtn);
    container.appendChild(overlay);
  }

  function loadPreset(preset) {
    circuit = new QuantumCircuit(preset.qubits, 10);
    for (const g of preset.gates) {
      try { circuit.addGate({ ...g }); } catch (e) {}
    }
    // Update qubit selector in parent
    const sel = document.getElementById('qubit-count');
    if (sel) sel.value = preset.qubits;
    sim = new Simulator(preset.qubits);
    stepping = false;
    if (onSave) onSave(circuit.serialize());
    fullRender();
    showToast(container, 'Loaded: ' + preset.name, 'info');
  }

  // ── Circuit Change Handler ──

  let prevGateCount = circuit.gates.length;

  function onCircuitChange() {
    // Detect newly placed gate for animation
    if (circuit.gates.length > prevGateCount) {
      lastPlacedId = circuit.gates[circuit.gates.length - 1]?.id;
    }
    prevGateCount = circuit.gates.length;

    sim = new Simulator(circuit.numQubits);
    sim.loadGates(circuit.getGatesInOrder());
    stepping = false;
    if (onSave) onSave(circuit.serialize());
    fullRender();

    // Animate newly placed gate
    if (lastPlacedId) {
      const el = gridEl.querySelector(`[data-id="${lastPlacedId}"]`);
      if (el) el.classList.add('just-placed');
      lastPlacedId = null;
    }

    // Auto-scroll grid to keep latest gate visible
    if (!circuit.isEmpty()) {
      const lastSlot = Math.max(...circuit.gates.map(g => g.slot), 0);
      const targetX = slotX(lastSlot) - gridWrap.clientWidth + SLOT_W * 2;
      if (targetX > gridWrap.scrollLeft) {
        gridWrap.scrollTo({ left: targetX, behavior: 'smooth' });
      }
    }
  }

  // ── Full Render ──

  function fullRender() {
    if (!stepping) {
      sim.loadGates(circuit.getGatesInOrder());
      sim.runAll();
    }
    renderPalette();
    renderGrid();
    renderState();
    renderMathPanel();
    renderControls();
    renderToolbar();
  }

  // ── Qubit Count Change (called from app.js) ──
  container._setQubits = function(n) {
    circuit.setNumQubits(n);
    sim = new Simulator(n);
    stepping = false;
    onCircuitChange();
  };

  // ── Init ──
  fullRender();

  // ── Cleanup ──
  return function cleanup() {
    cleanupFns.forEach(fn => fn());
    if (dragHoldTimer) clearTimeout(dragHoldTimer);
    container.innerHTML = '';
  };
}
