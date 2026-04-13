import { makeBtn } from './helpers.js';
import { CircuitSimulator, showToast } from '../experiment-ui.js?v=7';

const experiment14 = {
  title: 'Gate Wiring Lab',
  subtitle: 'Decompose gates — become the compiler',
  icon: '🔧',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let puzzlesExplored = 0;

    container.style.flexDirection = 'column';

    // ─ Puzzle definitions ─
    const PUZZLES = [
      {
        label: 'Build CZ',
        description: 'Negate only the |11⟩ component',
        target(inputIdx) {
          const out = Array.from({ length: 4 }, (_, i) => i === inputIdx ? { re: 1, im: 0 } : { re: 0, im: 0 });
          if (inputIdx === 3) out[3] = { re: -1, im: 0 };
          return out;
        },
      },
      {
        label: 'Build SWAP',
        description: 'Exchange the two qubits',
        target(inputIdx) {
          const out = [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }];
          const map = [0, 2, 1, 3];
          out[map[inputIdx]] = { re: 1, im: 0 };
          return out;
        },
      },
      {
        label: 'Build CZ (reversed)',
        description: "Same as CZ — prove it's symmetric!",
        target(inputIdx) {
          const out = Array.from({ length: 4 }, (_, i) => i === inputIdx ? { re: 1, im: 0 } : { re: 0, im: 0 });
          if (inputIdx === 3) out[3] = { re: -1, im: 0 };
          return out;
        },
      },
      {
        label: 'Create |Φ+⟩',
        description: 'Make a Bell state from |00⟩',
        target(inputIdx) {
          const sim = new CircuitSimulator(2);
          const st = Array.from({ length: 4 }, (_, i) => i === inputIdx ? { re: 1, im: 0 } : { re: 0, im: 0 });
          sim.setState(st);
          sim.applyGate('H', 0);
          sim.applyGate('X', 1, 0);
          return sim.getState();
        },
      },
      {
        label: 'Free Build',
        description: 'Build anything — test any circuit',
        target: null,
      },
    ];

    let puzzleIdx = 0;

    // ─ Puzzle header ─
    const puzzleHeader = document.createElement('div');
    puzzleHeader.style.cssText = `
      text-align:center;font-family:'Fira Code',monospace;font-weight:700;
      font-size:16px;color:var(--text);
    `;

    const puzzleDescEl = document.createElement('div');
    puzzleDescEl.style.cssText = "text-align:center;font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);margin-top:2px;";

    // ─ Circuit builder (Ch 11 pattern) ─
    const NUM_SLOTS = 6;
    const circuitGates = [];
    const slotEls = [[], []];
    let selectedGate = null;
    let cnotControlSlot = null;

    const instrDiv = document.createElement('div');
    instrDiv.style.cssText = "text-align:center;font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);min-height:20px;";
    instrDiv.textContent = 'Tap a gate, then tap a slot on the wire';

    const circuitArea = document.createElement('div');
    circuitArea.style.cssText = 'display:flex;flex-direction:column;gap:2px;';

    for (let wire = 0; wire < 2; wire++) {
      const wireRow = document.createElement('div');
      wireRow.style.cssText = 'display:flex;align-items:center;gap:0;';

      const wireLabel = document.createElement('div');
      wireLabel.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);min-width:42px;";
      wireLabel.textContent = `q${wire} |0⟩`;
      wireRow.appendChild(wireLabel);

      const slotsContainer = document.createElement('div');
      slotsContainer.style.cssText = 'display:flex;gap:4px;flex:1;position:relative;';

      const wireLine = document.createElement('div');
      wireLine.style.cssText = 'position:absolute;top:50%;left:0;right:0;height:2px;background:var(--border);transform:translateY(-50%);z-index:0;';
      slotsContainer.appendChild(wireLine);

      for (let s = 0; s < NUM_SLOTS; s++) {
        const slotEl = document.createElement('div');
        slotEl.style.cssText = `
          width:38px;height:38px;border:2px dashed var(--border);border-radius:var(--radius);
          display:flex;align-items:center;justify-content:center;font-family:'Fira Code',monospace;
          font-size:12px;font-weight:700;color:var(--text);background:var(--bg);
          cursor:pointer;z-index:1;position:relative;
        `;

        slotEl.addEventListener('click', () => handleSlotClick(wire, s, slotEl));
        slotsContainer.appendChild(slotEl);
        slotEls[wire].push(slotEl);
      }

      wireRow.appendChild(slotsContainer);
      circuitArea.appendChild(wireRow);
    }

    // ─ Toolbox ─
    const toolbox = document.createElement('div');
    toolbox.style.cssText = 'display:flex;gap:6px;justify-content:center;flex-wrap:wrap;';

    const TOOL_GATES = ['X', 'H', 'Z', 'T', 'T†', 'CNOT'];
    const toolBtns = {};

    TOOL_GATES.forEach(g => {
      const btn = document.createElement('button');
      btn.className = 'btn experiment-block-btn';
      btn.style.cssText = "padding:8px 12px;font-family:'Fira Code',monospace;font-weight:700;font-size:13px;min-width:44px;";
      btn.textContent = g;
      btn.addEventListener('click', () => {
        selectedGate = g;
        cnotControlSlot = null;
        Object.values(toolBtns).forEach(b => { b.style.boxShadow = ''; });
        btn.style.boxShadow = `0 0 0 3px ${chapterColor}`;
        instrDiv.textContent = g === 'CNOT' ? 'Tap control qubit slot, then target slot' : `Tap a slot to place ${g}`;
      });
      toolbox.appendChild(btn);
      toolBtns[g] = btn;
    });

    function handleSlotClick(wire, si, slotEl) {
      if (!selectedGate) {
        const existing = circuitGates.find(g => g.si === si && (g.wire === wire || g.wire2 === wire));
        if (existing) {
          circuitGates.splice(circuitGates.indexOf(existing), 1);
          renderCircuitView();
        }
        return;
      }

      if (selectedGate === 'CNOT') {
        if (cnotControlSlot === null) {
          cnotControlSlot = { wire, si };
          instrDiv.textContent = `CNOT control on q${wire}. Now tap the target slot.`;
          slotEl.style.border = `2px solid ${chapterColor}`;
          return;
        }
        const ctrl = cnotControlSlot;
        if (ctrl.si !== si) {
          instrDiv.textContent = 'CNOT control and target must be in the same column. Try again.';
          cnotControlSlot = null;
          renderCircuitView();
          return;
        }
        if (ctrl.wire === wire) {
          instrDiv.textContent = 'CNOT target must be on a different wire. Try again.';
          cnotControlSlot = null;
          renderCircuitView();
          return;
        }
        for (let i = circuitGates.length - 1; i >= 0; i--) {
          if (circuitGates[i].si === si) circuitGates.splice(i, 1);
        }
        circuitGates.push({ gate: 'CNOT', wire: ctrl.wire, wire2: wire, si });
        cnotControlSlot = null;
        selectedGate = null;
        Object.values(toolBtns).forEach(b => { b.style.boxShadow = ''; });
        instrDiv.textContent = 'Tap a gate, then tap a slot on the wire';
        renderCircuitView();
        return;
      }

      // Single-qubit gate
      for (let i = circuitGates.length - 1; i >= 0; i--) {
        if (circuitGates[i].si === si && circuitGates[i].wire === wire) circuitGates.splice(i, 1);
      }
      const simGate = selectedGate === 'T†' ? 'Tdg' : selectedGate;
      circuitGates.push({ gate: simGate, displayGate: selectedGate, wire, si });
      selectedGate = null;
      Object.values(toolBtns).forEach(b => { b.style.boxShadow = ''; });
      instrDiv.textContent = 'Tap a gate, then tap a slot on the wire';
      renderCircuitView();
    }

    function renderCircuitView() {
      for (let w = 0; w < 2; w++) {
        for (let s = 0; s < NUM_SLOTS; s++) {
          slotEls[w][s].textContent = '';
          slotEls[w][s].style.border = '2px dashed var(--border)';
          slotEls[w][s].style.background = 'var(--bg)';
        }
      }
      for (const g of circuitGates) {
        if (g.gate === 'CNOT') {
          slotEls[g.wire][g.si].textContent = '●';
          slotEls[g.wire][g.si].style.border = `2px solid ${chapterColor}`;
          slotEls[g.wire2][g.si].textContent = '⊕';
          slotEls[g.wire2][g.si].style.border = `2px solid ${chapterColor}`;
        } else {
          slotEls[g.wire][g.si].textContent = g.displayGate || g.gate;
          slotEls[g.wire][g.si].style.border = `2px solid ${chapterColor}`;
        }
      }
    }

    // ─ Action row ─
    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;gap:8px;';

    const testBtn = makeBtn('▶ Test All Inputs', 'btn');
    testBtn.style.cssText += `flex:2;background:${chapterColor};color:#fff;border:none;`;

    const clearBtn = makeBtn('Clear', 'btn experiment-block-btn');
    clearBtn.style.cssText += 'flex:1;';

    const nextBtn = makeBtn('Next Puzzle', 'btn experiment-block-btn');
    nextBtn.style.cssText += 'flex:1;';

    actionRow.append(testBtn, clearBtn, nextBtn);

    // ─ Results table ─
    const resultsWrap = document.createElement('div');
    resultsWrap.style.cssText = 'display:none;overflow-x:auto;';

    // ─ Discovery prompt ─
    const discoveryDiv = document.createElement('div');
    discoveryDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);text-align:center;opacity:0;transition:opacity 0.5s;line-height:1.5;";
    discoveryDiv.textContent = "💡 Try building CZ with the qubits swapped. Same result? CZ is symmetric — there's no control or target!";

    // ─ Counter ─
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = 'font-size:13px;color:var(--text-muted);text-align:center;';

    container.append(puzzleHeader, puzzleDescEl, instrDiv, circuitArea, toolbox, actionRow, resultsWrap, discoveryDiv, counterDiv);

    function loadPuzzle() {
      const p = PUZZLES[puzzleIdx];
      puzzleHeader.textContent = p.label;
      puzzleDescEl.textContent = p.description;
      circuitGates.length = 0;
      selectedGate = null;
      cnotControlSlot = null;
      Object.values(toolBtns).forEach(b => { b.style.boxShadow = ''; });
      instrDiv.textContent = 'Tap a gate, then tap a slot on the wire';
      resultsWrap.style.display = 'none';
      renderCircuitView();
      counterDiv.textContent = `Puzzles explored: ${puzzlesExplored}`;
    }

    function runStudentCircuit(inputIdx) {
      const sim = new CircuitSimulator(2);
      const st = Array.from({ length: 4 }, (_, i) => i === inputIdx ? { re: 1, im: 0 } : { re: 0, im: 0 });
      sim.setState(st);
      const sorted = [...circuitGates].sort((a, b) => a.si - b.si);
      for (const g of sorted) {
        if (g.gate === 'CNOT') {
          sim.applyGate('X', g.wire2, g.wire);
        } else {
          sim.applyGate(g.gate, g.wire);
        }
      }
      return sim.getState();
    }

    function statesMatch(a, b) {
      const TOL = 0.05;
      for (let i = 0; i < 4; i++) {
        if (Math.abs(a[i].re - b[i].re) > TOL || Math.abs(a[i].im - b[i].im) > TOL) return false;
      }
      return true;
    }

    function fmtState4(st) {
      const labels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
      const parts = [];
      for (let i = 0; i < 4; i++) {
        const re = Math.round(st[i].re * 100) / 100;
        const im = Math.round(st[i].im * 100) / 100;
        if (Math.abs(re) < 0.005 && Math.abs(im) < 0.005) continue;
        let coeff;
        if (Math.abs(im) < 0.005) coeff = `${re}`;
        else if (Math.abs(re) < 0.005) coeff = `${im}i`;
        else coeff = `${re}${im >= 0 ? '+' : ''}${im}i`;
        if (coeff === '1') coeff = '';
        else if (coeff === '-1') coeff = '−';
        parts.push(`${coeff}${labels[i]}`);
      }
      return parts.join(' + ') || '0';
    }

    function buildResultsTable(puzzle) {
      // Build results table using DOM methods (no innerHTML)
      const labels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];

      // Clear previous results
      while (resultsWrap.firstChild) resultsWrap.removeChild(resultsWrap.firstChild);

      const table = document.createElement('table');
      table.style.cssText = 'width:100%;border-collapse:collapse;font-family:"Fira Code",monospace;font-size:12px;';

      // Header row
      const thead = document.createElement('tr');
      thead.style.cssText = 'border-bottom:1px solid var(--border);';
      const headers = ['Input'];
      if (puzzle.target) headers.push('Target');
      headers.push('Yours');
      if (puzzle.target) headers.push('Match');
      for (const h of headers) {
        const th = document.createElement('th');
        th.style.cssText = `padding:6px;text-align:${h === 'Match' ? 'center' : 'left'};`;
        th.textContent = h;
        thead.appendChild(th);
      }
      table.appendChild(thead);

      let allMatch = true;
      for (let i = 0; i < 4; i++) {
        const yours = runStudentCircuit(i);
        const target = puzzle.target ? puzzle.target(i) : null;
        const match = target ? statesMatch(yours, target) : null;
        if (match === false) allMatch = false;

        const bgColor = match === true ? 'rgba(88,204,2,0.08)' : match === false ? 'rgba(255,75,75,0.08)' : 'transparent';
        const tr = document.createElement('tr');
        tr.style.cssText = `background:${bgColor};border-bottom:1px solid var(--border);`;

        const tdInput = document.createElement('td');
        tdInput.style.cssText = 'padding:6px;';
        tdInput.textContent = labels[i];
        tr.appendChild(tdInput);

        if (target) {
          const tdTarget = document.createElement('td');
          tdTarget.style.cssText = 'padding:6px;';
          tdTarget.textContent = fmtState4(target);
          tr.appendChild(tdTarget);
        }

        const tdYours = document.createElement('td');
        tdYours.style.cssText = 'padding:6px;';
        tdYours.textContent = fmtState4(yours);
        tr.appendChild(tdYours);

        if (match !== null) {
          const tdMatch = document.createElement('td');
          tdMatch.style.cssText = 'padding:6px;text-align:center;';
          tdMatch.textContent = match ? '✅' : '❌';
          tr.appendChild(tdMatch);
        }

        table.appendChild(tr);
      }

      resultsWrap.appendChild(table);
      resultsWrap.style.display = '';

      return allMatch;
    }

    testBtn.addEventListener('click', () => {
      const puzzle = PUZZLES[puzzleIdx];
      const allMatch = buildResultsTable(puzzle);

      if (allMatch && puzzle.target) {
        showToast(container, 'All inputs match!', 'success');
        puzzlesExplored++;
        counterDiv.textContent = `Puzzles explored: ${puzzlesExplored}`;
        if (puzzlesExplored >= 1) discoveryDiv.style.opacity = '1';
      }

      if (!completed) {
        completed = true;
        onComplete({ puzzlesExplored });
      }
    });

    clearBtn.addEventListener('click', () => {
      circuitGates.length = 0;
      selectedGate = null;
      cnotControlSlot = null;
      Object.values(toolBtns).forEach(b => { b.style.boxShadow = ''; });
      instrDiv.textContent = 'Tap a gate, then tap a slot on the wire';
      resultsWrap.style.display = 'none';
      renderCircuitView();
    });

    nextBtn.addEventListener('click', () => {
      puzzleIdx = (puzzleIdx + 1) % PUZZLES.length;
      loadPuzzle();
    });

    loadPuzzle();

    return () => {};
  },
};

export default experiment14;
