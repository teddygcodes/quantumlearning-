import { makeBtn, snap, GATES, applyGate, stateToBloch, blochToState, normalizeGlobalPhase, fmtKet } from './helpers.js';
import { BlochSphere, showToast } from '../experiment-ui.js?v=7';

// ── Chapter 7: Gate Laboratory ──────────────────────────────────────────────

/**
 * Ch 7 — Gate Laboratory (sandbox)
 *
 * Pick a gate, watch the Bloch sphere arrow rotate. Chain gates, undo,
 * discover identities. The insight: gates are rotations of the state vector.
 */
const experiment7 = {
  title: 'Gate Laboratory',
  subtitle: 'Apply gates — watch the Bloch sphere rotate',
  icon: '⚡',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let gateCount = 0;
    let animating = false;

    // State as complex 2-vector
    let state = [{ re: 1, im: 0 }, { re: 0, im: 0 }]; // |0⟩
    let stateStack = []; // for undo
    let gateHistory = [];

    container.style.flexDirection = 'column';

    // ─ Bloch sphere ─
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'experiment-canvas-wrap';
    const canvasEl = document.createElement('canvas');
    canvasWrap.appendChild(canvasEl);

    // ─ Controls ─
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'experiment-controls';

    container.append(canvasWrap, controlsDiv);

    const bloch = new BlochSphere(canvasEl, { color: chapterColor });

    // ─ State display ─
    const stateDiv = document.createElement('div');
    stateDiv.style.cssText = `
      font-family:'Fira Code',monospace;font-size:16px;font-weight:700;
      color:var(--text);text-align:center;padding:8px;
      background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);
    `;

    // ─ Gate buttons (2×2) ─
    const gateGrid = document.createElement('div');
    gateGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;';
    ['X', 'Y', 'Z', 'H'].forEach(name => {
      const btn = makeBtn(name, 'btn experiment-block-btn');
      btn.style.cssText += `font-size:18px;padding:14px;font-weight:800;`;
      btn.addEventListener('click', () => {
        if (animating) return;
        applyGateAction(name);
      });
      gateGrid.appendChild(btn);
    });

    // ─ Reset buttons ─
    const resetRow = document.createElement('div');
    resetRow.style.cssText = 'display:flex;gap:8px;';
    [
      { label: 'Reset |0⟩', t: 0, p: 0 },
      { label: 'Reset |1⟩', t: Math.PI, p: 0 },
      { label: 'Reset |+⟩', t: Math.PI / 2, p: 0 },
    ].forEach(r => {
      const btn = makeBtn(r.label, 'btn btn-ghost');
      btn.style.cssText += 'flex:1;font-size:12px;';
      btn.addEventListener('click', () => {
        if (animating) return;
        state = blochToState(r.t, r.p);
        stateStack = [];
        gateHistory = [];
        animating = true;
        bloch.animateState(r.t, r.p, 300).then(() => {
          animating = false;
          updateDisplay();
        });
        updateDisplay();
      });
      resetRow.appendChild(btn);
    });

    // ─ Gate history ─
    const historyLabel = document.createElement('div');
    historyLabel.style.cssText = "font-size:11px;text-transform:uppercase;font-weight:800;letter-spacing:1px;color:var(--text-muted);";
    historyLabel.textContent = 'Gate History';
    const historyDiv = document.createElement('div');
    historyDiv.style.cssText = `
      font-family:'Fira Code',monospace;font-size:14px;color:${chapterColor};
      min-height:24px;overflow-x:auto;white-space:nowrap;padding:6px 0;
    `;
    historyDiv.textContent = '(none)';

    // ─ Undo ─
    const undoBtn = makeBtn('Undo', 'btn btn-ghost btn-full');
    undoBtn.addEventListener('click', () => {
      if (animating || stateStack.length === 0) return;
      state = stateStack.pop();
      gateHistory.pop();
      const { theta, phi } = stateToBloch(state[0], state[1]);
      animating = true;
      bloch.animateState(theta, phi, 300).then(() => {
        animating = false;
        updateDisplay();
      });
      gateCount++;
      updateDisplay();
    });

    // ─ Counter ─
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = 'font-size:13px;color:var(--text-muted);text-align:center;';
    counterDiv.textContent = 'Gates applied: 0';

    // ─ Discovery prompt ─
    const discoveryDiv = document.createElement('div');
    discoveryDiv.style.cssText = 'font-size:12px;color:var(--text-muted);text-align:center;opacity:0;transition:opacity 0.5s;padding:4px;';
    discoveryDiv.textContent = 'Try applying any gate twice. What happens?';

    controlsDiv.append(stateDiv, gateGrid, resetRow, historyLabel, historyDiv, undoBtn, counterDiv, discoveryDiv);

    function applyGateAction(name) {
      stateStack.push([{ ...state[0] }, { ...state[1] }]);
      gateHistory.push(name);

      const gate = GATES[name];
      state = applyGate(gate, state[0], state[1]);
      state = normalizeGlobalPhase(state[0], state[1]);

      const { theta, phi } = stateToBloch(state[0], state[1]);
      animating = true;
      bloch.animateState(theta, phi, 400).then(() => {
        animating = false;
        updateDisplay();
      });

      gateCount++;
      counterDiv.textContent = `Gates applied: ${gateCount}`;
      if (gateCount >= 5) discoveryDiv.style.opacity = '1';

      updateDisplay();

      if (!completed) {
        completed = true;
        onComplete({ explored: true });
      }
    }

    function updateDisplay() {
      const [a, b] = normalizeGlobalPhase(state[0], state[1]);
      stateDiv.textContent = fmtKet(a, b);
      historyDiv.textContent = gateHistory.length > 0 ? gateHistory.join(' → ') : '(none)';
      counterDiv.textContent = `Gates applied: ${gateCount}`;
    }

    bloch.setState(0, 0);
    updateDisplay();

    return () => { bloch.destroy(); };
  },
};

export default experiment7;
