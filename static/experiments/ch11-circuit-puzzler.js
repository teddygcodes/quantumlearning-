import { makeBtn, fmtKet2Q } from './helpers.js';
import { CircuitSimulator, HistogramRenderer, showToast } from '../experiment-ui.js?v=7';

const experiment11 = {
  title: 'Circuit Puzzler',
  subtitle: 'Build circuits — see what they do',
  icon: '🔧',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let circuitsRun = 0;
    let selectedGate = null;
    let cnotStep = null;
    const NUM_SLOTS = 6;

    const wire0 = new Array(NUM_SLOTS).fill(null);
    const wire1 = new Array(NUM_SLOTS).fill(null);

    const sim = new CircuitSimulator(2);

    let target = null;

    container.style.flexDirection = 'column';

    // ─ Instruction bar ─
    const instrDiv = document.createElement('div');
    instrDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);text-align:center;min-height:20px;";
    instrDiv.textContent = 'Tap a gate, then tap a slot on the wire';

    // ─ Circuit area ─
    const circuitArea = document.createElement('div');
    circuitArea.style.cssText = `
      background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-lg);
      padding:16px 12px;position:relative;
    `;

    const gateColors = { X: '#FF4B4B', H: '#1CB0F6', Z: '#CE82FF', CNOT: '#FF9600' };

    function makeWireRow(qubitIdx) {
      const row = document.createElement('div');
      row.className = 'circuit-wire-row';
      const label = document.createElement('div');
      label.className = 'circuit-wire-label';
      label.textContent = `q${qubitIdx} |0⟩`;
      const slotsDiv = document.createElement('div');
      slotsDiv.style.cssText = 'display:flex;gap:4px;flex:1;align-items:center;position:relative;';

      const wireLine = document.createElement('div');
      wireLine.style.cssText = 'position:absolute;left:0;right:0;top:50%;height:2px;background:var(--text-muted);opacity:0.3;z-index:0;';
      slotsDiv.appendChild(wireLine);

      const slotEls = [];
      for (let i = 0; i < NUM_SLOTS; i++) {
        const slot = document.createElement('div');
        slot.className = 'circuit-gate-slot';
        slot.dataset.qubit = qubitIdx;
        slot.dataset.col = i;
        slot.addEventListener('click', () => onSlotClick(qubitIdx, i));
        slotsDiv.appendChild(slot);
        slotEls.push(slot);
      }
      row.append(label, slotsDiv);
      return { row, slotEls, slotsDiv };
    }

    const wireRow0 = makeWireRow(0);
    const wireRow1 = makeWireRow(1);
    circuitArea.append(wireRow0.row, wireRow1.row);

    // ─ Toolbox ─
    const toolbox = document.createElement('div');
    toolbox.className = 'circuit-toolbox';
    const gateNames = ['X', 'H', 'Z', 'CNOT'];
    const gateBtns = {};

    gateNames.forEach(name => {
      const btn = makeBtn(name, 'btn experiment-block-btn');
      btn.style.cssText += 'flex:1;font-size:16px;font-weight:800;padding:12px 6px;min-width:60px;';
      btn.addEventListener('click', () => selectGate(name));
      toolbox.appendChild(btn);
      gateBtns[name] = btn;
    });

    // ─ Action row ─
    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;gap:8px;';
    const runBtn = makeBtn('▶ Run', 'btn');
    runBtn.style.cssText += `flex:2;padding:14px;font-size:16px;background:${chapterColor};color:#fff;border:none;border-bottom:4px solid rgba(0,0,0,0.2);`;
    const clearBtn = makeBtn('Clear', 'btn btn-ghost');
    clearBtn.style.cssText += 'flex:1;font-size:14px;';
    const targetBtn = makeBtn('🎯 Target', 'btn btn-ghost');
    targetBtn.style.cssText += 'flex:1;font-size:14px;';
    actionRow.append(runBtn, clearBtn, targetBtn);

    // ─ Target display ─
    const targetDiv = document.createElement('div');
    targetDiv.style.cssText = 'display:none;background:var(--surface);border:2px dashed var(--border);border-radius:var(--radius-lg);padding:10px 14px;text-align:center;';
    const targetLabel = document.createElement('div');
    targetLabel.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);margin-bottom:4px;";
    const matchIndicator = document.createElement('div');
    matchIndicator.style.cssText = 'font-size:24px;min-height:32px;';
    targetDiv.append(targetLabel, matchIndicator);

    // ─ Result area ─
    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = 'display:none;';
    const stateDisplay = document.createElement('div');
    stateDisplay.style.cssText = `
      background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-lg);
      padding:12px;text-align:center;font-family:'Fira Code',monospace;font-size:14px;
      font-weight:700;color:var(--text);word-break:break-word;
    `;
    const histWrap = document.createElement('div');
    histWrap.style.cssText = 'width:100%;';
    const histogram = new HistogramRenderer(histWrap, {
      labels: ['|00⟩', '|01⟩', '|10⟩', '|11⟩'],
      colors: [chapterColor, '#FF9600', '#CE82FF', '#FF4B4B'],
      height: 100,
    });
    resultDiv.append(stateDisplay, histWrap);

    // ─ Stats ─
    const statsRow = document.createElement('div');
    statsRow.style.cssText = 'display:flex;justify-content:space-between;';
    const gateCountDiv = document.createElement('div');
    gateCountDiv.style.cssText = 'font-size:13px;color:var(--text-muted);';
    gateCountDiv.textContent = 'Gates: 0';
    const circuitCountDiv = document.createElement('div');
    circuitCountDiv.style.cssText = 'font-size:13px;color:var(--text-muted);';
    circuitCountDiv.textContent = 'Circuits run: 0';
    statsRow.append(gateCountDiv, circuitCountDiv);

    container.append(instrDiv, circuitArea, toolbox, actionRow, targetDiv, resultDiv, statsRow);

    function selectGate(name) {
      if (selectedGate === name && !cnotStep) {
        selectedGate = null;
        cnotStep = null;
        updateToolboxHighlight();
        instrDiv.textContent = 'Tap a gate, then tap a slot on the wire';
        return;
      }
      selectedGate = name;
      cnotStep = null;
      updateToolboxHighlight();
      if (name === 'CNOT') {
        instrDiv.textContent = 'Tap the CONTROL qubit wire slot';
      } else {
        instrDiv.textContent = `Tap a slot to place ${name}`;
      }
    }

    function updateToolboxHighlight() {
      gateNames.forEach(n => {
        gateBtns[n].style.borderColor = (n === selectedGate) ? gateColors[n] : '';
        gateBtns[n].style.boxShadow = (n === selectedGate) ? `0 0 8px ${gateColors[n]}40` : '';
      });
    }

    function onSlotClick(qubit, col) {
      const wire = qubit === 0 ? wire0 : wire1;

      if (wire[col]) {
        if (wire[col].gate === 'CNOT') {
          wire0[col] = null;
          wire1[col] = null;
        } else {
          wire[col] = null;
        }
        renderCircuit();
        return;
      }

      if (!selectedGate) return;

      if (selectedGate === 'CNOT') {
        if (!cnotStep) {
          cnotStep = { control: qubit, col };
          instrDiv.textContent = 'Now tap the TARGET qubit wire (same column)';
          renderCircuit();
          return;
        } else {
          if (qubit === cnotStep.control) {
            showToast(container, 'Target must be a different wire', 'info');
            return;
          }
          const cCol = cnotStep.col;
          wire0[cCol] = { gate: 'CNOT', control: cnotStep.control, target: qubit, col: cCol };
          wire1[cCol] = { gate: 'CNOT', control: cnotStep.control, target: qubit, col: cCol };
          cnotStep = null;
          instrDiv.textContent = 'Tap a gate, then tap a slot on the wire';
          renderCircuit();
          return;
        }
      }

      wire[col] = { gate: selectedGate, qubit };
      renderCircuit();
    }

    function renderCircuit() {
      for (let col = 0; col < NUM_SLOTS; col++) {
        const slot0 = wireRow0.slotEls[col];
        const slot1 = wireRow1.slotEls[col];
        const g0 = wire0[col];

        // Remove old CNOT connectors
        const oldConn = circuitArea.querySelector(`.cnot-conn-${col}`);
        if (oldConn) oldConn.remove();

        if (g0 && g0.gate === 'CNOT') {
          const isControl0 = g0.control === 0;
          slot0.textContent = isControl0 ? '●' : '⊕';
          slot0.className = 'circuit-gate-slot filled';
          slot0.style.color = gateColors.CNOT;
          slot0.style.borderColor = gateColors.CNOT;
          slot0.style.fontSize = isControl0 ? '18px' : '22px';

          slot1.textContent = isControl0 ? '⊕' : '●';
          slot1.className = 'circuit-gate-slot filled';
          slot1.style.color = gateColors.CNOT;
          slot1.style.borderColor = gateColors.CNOT;
          slot1.style.fontSize = isControl0 ? '22px' : '18px';

          const conn = document.createElement('div');
          conn.className = `cnot-conn-${col}`;
          conn.style.cssText = `position:absolute;width:2px;background:${gateColors.CNOT};opacity:0.6;z-index:1;`;
          requestAnimationFrame(() => {
            const top0 = slot0.offsetTop + slot0.offsetHeight;
            const top1 = slot1.offsetTop;
            conn.style.top = `${top0}px`;
            conn.style.height = `${top1 - top0}px`;
            conn.style.left = `${slot0.offsetLeft + slot0.offsetWidth / 2 - 1}px`;
          });
          circuitArea.appendChild(conn);
        } else {
          renderSlot(slot0, g0, 0, col);
          renderSlot(slot1, wire1[col], 1, col);
        }
      }
      updateGateCount();
    }

    function renderSlot(slotEl, gateData, qubit, col) {
      if (gateData && gateData.gate !== 'CNOT') {
        slotEl.textContent = gateData.gate;
        slotEl.className = 'circuit-gate-slot filled';
        slotEl.style.color = gateColors[gateData.gate] || '#fff';
        slotEl.style.borderColor = gateColors[gateData.gate] || 'var(--border)';
        slotEl.style.fontSize = '14px';
      } else if (!gateData) {
        slotEl.textContent = '';
        slotEl.className = 'circuit-gate-slot';
        slotEl.style.color = '';
        slotEl.style.borderColor = '';
        slotEl.style.fontSize = '';
        if (cnotStep && cnotStep.col === col && qubit !== cnotStep.control) {
          slotEl.style.borderColor = gateColors.CNOT;
        }
      }
    }

    function updateGateCount() {
      let count = 0;
      for (let col = 0; col < NUM_SLOTS; col++) {
        if (wire0[col]) {
          if (wire0[col].gate === 'CNOT') count++;
          else count++;
        }
        if (wire1[col] && (!wire1[col] || wire1[col].gate !== 'CNOT')) {
          count++;
        }
      }
      gateCountDiv.textContent = `Gates: ${count}`;
    }

    runBtn.addEventListener('click', () => {
      sim.clearCircuit();

      for (let col = 0; col < NUM_SLOTS; col++) {
        const g0 = wire0[col];
        const g1 = wire1[col];

        if (g0 && g0.gate === 'CNOT') {
          sim.addGate('X', g0.target, g0.control);
        } else {
          if (g0) sim.addGate(g0.gate, 0);
          if (g1) sim.addGate(g1.gate, 1);
        }
      }

      sim.run();
      const probs = sim.probabilities();
      const state = sim.getState();

      resultDiv.style.display = 'flex';
      resultDiv.style.flexDirection = 'column';
      resultDiv.style.gap = '8px';

      stateDisplay.textContent = fmtKet2Q(state);
      histogram.setData(probs);

      if (target) {
        const isMatch = target.probs.every((tp, i) => Math.abs(tp - probs[i]) < 0.05);
        matchIndicator.textContent = isMatch ? '✅ Match!' : '❌ Not quite';
        matchIndicator.style.color = isMatch ? '#58CC02' : '#FF4B4B';
        histogram.setExpected(target.probs);
      }

      circuitsRun++;
      circuitCountDiv.textContent = `Circuits run: ${circuitsRun}`;

      if (!completed) {
        completed = true;
        onComplete({ circuitsRun });
      }
    });

    clearBtn.addEventListener('click', () => {
      wire0.fill(null);
      wire1.fill(null);
      selectedGate = null;
      cnotStep = null;
      updateToolboxHighlight();
      instrDiv.textContent = 'Tap a gate, then tap a slot on the wire';
      resultDiv.style.display = 'none';
      histogram.reset();

      for (let col = 0; col < NUM_SLOTS; col++) {
        const c = circuitArea.querySelector(`.cnot-conn-${col}`);
        if (c) c.remove();
      }
      renderCircuit();
    });

    const targets = [
      { label: 'Make |01⟩', probs: [0, 1, 0, 0] },
      { label: 'Make |10⟩', probs: [0, 0, 1, 0] },
      { label: 'Equal superposition', probs: [0.25, 0.25, 0.25, 0.25] },
      { label: 'Bell state |Φ+⟩', probs: [0.5, 0, 0, 0.5] },
      { label: 'Make |+0⟩', probs: [0.5, 0, 0.5, 0] },
      { label: 'Make |11⟩', probs: [0, 0, 0, 1] },
    ];
    let targetIdx = -1;

    targetBtn.addEventListener('click', () => {
      targetIdx = (targetIdx + 1) % targets.length;
      target = targets[targetIdx];
      targetDiv.style.display = '';
      targetLabel.textContent = `Target: ${target.label}`;
      matchIndicator.textContent = '';
      histogram.setExpected(target.probs);
    });

    renderCircuit();

    return () => { histogram.destroy(); };
  },
};

export default experiment11;
