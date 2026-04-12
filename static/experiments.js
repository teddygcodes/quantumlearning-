/**
 * experiments.js — Interactive experiment definitions for each chapter.
 *
 * Each experiment is keyed by chapter ID and provides:
 *   { title, subtitle, icon, mount(container, callbacks) → cleanup }
 *
 * mount() receives the container DOM element and a callbacks object:
 *   { chapterColor, chapterColorDk, onComplete(stats), getChapterState() }
 *
 * mount() returns a cleanup function that cancels animations and removes listeners.
 *
 * Experiments are SANDBOXES — exploratory, no pass/fail, no scoring.
 * They teach through free-form interaction and live feedback.
 */

import { GridCanvas, PhysicsBeam, showToast, animateValue } from './experiment-ui.js?v=1';

// ── Helpers ───────────────────────────────────────────────────────────────────

function rnd(lo, hi) { return Math.floor(Math.random() * (hi - lo + 1)) + lo; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function snap(val, step) { return Math.round(val / step) * step; }

function makeLabel(text, style = '') {
  const el = document.createElement('div');
  el.style.cssText = `font-family:'Fira Code',monospace;font-size:14px;color:var(--text-muted);${style}`;
  el.textContent = text;
  return el;
}

function makeBtn(text, cls = 'btn') {
  const btn = document.createElement('button');
  btn.className = cls;
  btn.style.cssText = "padding:10px 16px;font-size:14px;font-family:'Fira Code',monospace;font-weight:700;";
  btn.textContent = text;
  return btn;
}


// ── Chapter 1: Equation Balancer ──────────────────────────────────────────────

function generateEquation(difficulty) {
  const configs = [
    { aRange: [2, 4], bRange: [1, 6], xRange: [1, 5] },
    { aRange: [2, 6], bRange: [-5, 8], xRange: [1, 7] },
    { aRange: [3, 7], bRange: [-6, 10], xRange: [2, 8] },
    { aRange: [3, 9], bRange: [-8, 12], xRange: [2, 10] },
  ];
  const cfg = configs[Math.min(difficulty, configs.length - 1)];
  const a = rnd(cfg.aRange[0], cfg.aRange[1]);
  const x = rnd(cfg.xRange[0], cfg.xRange[1]);
  const b = rnd(cfg.bRange[0], cfg.bRange[1]);
  const c = a * x + b;
  return { a, b, x, c };
}

/**
 * Ch 1 — Equation Balancer (sandbox)
 *
 * Endless equation solving. Pick operations to isolate x. The beam tilts
 * when you choose wrong. Solve as many as you like — "New Equation" generates
 * fresh ones with increasing difficulty.
 */
const experiment1 = {
  title: 'Equation Balancer',
  subtitle: 'Keep the balance while you isolate x',
  icon: '\u2696\uFE0F',

  mount(container, { chapterColor, onComplete }) {
    let difficulty = 0;
    let totalSolved = 0;
    let busy = false;
    let completed = false;

    // Current equation state
    let left = { coeff: 0, constant: 0 };
    let right = { value: 0 };
    let solved = false;

    // Build DOM
    container.style.flexDirection = 'column';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'experiment-challenge';
    const headerLabel = document.createElement('div');
    headerLabel.className = 'experiment-challenge-label';
    headerLabel.textContent = 'Isolate x by applying operations to both sides';
    const solvedCounter = document.createElement('div');
    solvedCounter.style.cssText = 'font-size:13px;color:var(--text-muted);margin-top:4px;';
    solvedCounter.textContent = 'Equations solved: 0';
    headerDiv.append(headerLabel, solvedCounter);

    // Equation display
    const balanceDiv = document.createElement('div');
    balanceDiv.style.cssText = `
      display:flex;align-items:center;justify-content:center;gap:20px;
      padding:24px 16px;background:var(--surface);border:2px solid var(--border);
      border-radius:var(--radius-lg);min-height:120px;
    `;
    const leftSide = document.createElement('div');
    leftSide.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;';
    const equalsSign = document.createElement('div');
    equalsSign.style.cssText = "font-size:32px;font-weight:800;color:var(--text-muted);font-family:'Fira Code',monospace;";
    equalsSign.textContent = '=';
    const rightSide = document.createElement('div');
    rightSide.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;';
    balanceDiv.append(leftSide, equalsSign, rightSide);

    // Beam canvas
    const canvasWrap = document.createElement('div');
    canvasWrap.style.cssText = 'position:relative;width:100%;height:100px;flex:none;';
    const beamCanvasEl = document.createElement('canvas');
    beamCanvasEl.style.cssText = 'width:100%;height:100%;';
    canvasWrap.appendChild(beamCanvasEl);

    // History log
    const historyDiv = document.createElement('div');
    historyDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:13px;color:var(--text-muted);text-align:center;min-height:20px;";

    // Operation buttons
    const opsDiv = document.createElement('div');
    opsDiv.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:center;gap:8px;';

    container.append(headerDiv, balanceDiv, canvasWrap, historyDiv, opsDiv);

    const beam = new PhysicsBeam(beamCanvasEl, { fulcrumColor: chapterColor });

    function makeBlock(text, color) {
      const el = document.createElement('div');
      el.style.cssText = `
        display:inline-flex;align-items:center;justify-content:center;
        padding:10px 16px;border-radius:10px;font-family:'Fira Code',monospace;
        font-size:22px;font-weight:800;color:#fff;background:${color};
        border-bottom:3px solid rgba(0,0,0,0.2);
        transition:transform 0.3s,opacity 0.3s;
      `;
      el.textContent = text;
      return el;
    }

    function renderBalance() {
      leftSide.textContent = '';
      rightSide.textContent = '';

      if (solved) {
        leftSide.appendChild(makeBlock('x', chapterColor));
        rightSide.appendChild(makeBlock(`${right.value}`, '#FF9600'));
        equalsSign.style.color = '#58CC02';
        return;
      }

      if (left.coeff !== 0) {
        const coeffText = left.coeff === 1 ? 'x' : left.coeff === -1 ? '-x' : `${left.coeff}x`;
        leftSide.appendChild(makeBlock(coeffText, chapterColor));
      }
      if (left.constant !== 0) {
        const sign = left.constant > 0 ? '+' : '';
        const opEl = document.createElement('span');
        opEl.style.cssText = "font-size:20px;font-weight:800;color:var(--text-muted);font-family:'Fira Code',monospace;";
        opEl.textContent = sign;
        leftSide.appendChild(opEl);
        leftSide.appendChild(makeBlock(`${Math.abs(left.constant)}`, '#1CB0F6'));
      }

      rightSide.appendChild(makeBlock(`${right.value}`, '#FF9600'));
      equalsSign.style.color = 'var(--text-muted)';
    }

    function renderOps() {
      opsDiv.textContent = '';

      if (solved) {
        const newBtn = makeBtn('New Equation', 'btn btn-green');
        newBtn.style.cssText += 'padding:14px 28px;font-size:16px;';
        newBtn.addEventListener('click', () => loadEquation());
        opsDiv.appendChild(newBtn);
        return;
      }

      const ops = [];

      if (left.constant > 0) {
        ops.push({ label: `Subtract ${left.constant} from both sides`, action: 'sub_const' });
      } else if (left.constant < 0) {
        ops.push({ label: `Add ${Math.abs(left.constant)} to both sides`, action: 'add_const' });
      }

      if (left.coeff !== 1 && left.coeff !== 0 && left.constant === 0) {
        ops.push({ label: `Divide both sides by ${left.coeff}`, action: 'divide' });
      }

      // Distractors
      if (left.constant !== 0) {
        ops.push({ label: 'Multiply both sides by 2', action: 'wrong' });
      }
      if (left.coeff !== 1 && left.constant !== 0) {
        ops.push({ label: `Divide both sides by ${left.coeff}`, action: 'wrong' });
      }
      if (left.constant > 0) {
        ops.push({ label: `Add ${left.constant} to both sides`, action: 'wrong' });
      } else if (left.constant < 0) {
        ops.push({ label: `Subtract ${Math.abs(left.constant)} from both sides`, action: 'wrong' });
      }

      shuffle(ops).forEach(op => {
        const btn = makeBtn(op.label, 'btn experiment-block-btn');
        btn.addEventListener('click', () => {
          if (busy) return;
          handleOp(op.action);
        });
        opsDiv.appendChild(btn);
      });
    }

    function handleOp(action) {
      busy = true;

      if (action === 'sub_const' && left.constant > 0) {
        historyDiv.textContent = `\u2212${left.constant} from both sides`;
        right.value -= left.constant;
        left.constant = 0;
        beam.animateTilt(0, 400);
        showToast(container, 'Both sides stay equal!', 'success');
      } else if (action === 'add_const' && left.constant < 0) {
        historyDiv.textContent = `+${Math.abs(left.constant)} to both sides`;
        right.value += Math.abs(left.constant);
        left.constant = 0;
        beam.animateTilt(0, 400);
        showToast(container, 'Both sides stay equal!', 'success');
      } else if (action === 'divide' && left.constant === 0 && left.coeff !== 1) {
        historyDiv.textContent = `\u00F7${left.coeff} on both sides`;
        right.value = right.value / left.coeff;
        left.coeff = 1;
        beam.animateTilt(0, 400);
        showToast(container, 'Both sides stay equal!', 'success');
      } else {
        historyDiv.textContent = 'That makes it harder, not simpler!';
        beam.animateTilt(0.15, 200).then(() => beam.animateTilt(-0.15, 200)).then(() => beam.animateTilt(0, 200));
        showToast(container, 'Try a different operation', 'error');
        setTimeout(() => { busy = false; historyDiv.textContent = ''; }, 800);
        return;
      }

      if (left.coeff === 1 && left.constant === 0) {
        solved = true;
        totalSolved++;
        solvedCounter.textContent = `Equations solved: ${totalSolved}`;
        if (!completed) {
          completed = true;
          onComplete({ totalSolved });
        }
      }

      renderBalance();
      setTimeout(() => {
        renderOps();
        busy = false;
      }, 600);
    }

    function loadEquation() {
      solved = false;
      busy = false;
      const eq = generateEquation(difficulty);
      left = { coeff: eq.a, constant: eq.b };
      right = { value: eq.c };
      difficulty = Math.min(difficulty + 1, 3);
      historyDiv.textContent = '';
      beam.tilt = 0;
      beam.render();
      renderBalance();
      renderOps();
    }

    loadEquation();

    return () => { beam.destroy(); };
  },
};


// ── Chapter 2: Vector Playground ─────────────────────────────────────────────

/**
 * Ch 2 — Vector Playground (sandbox)
 *
 * A free-form 2D vector exploration tool. Drag to place vectors, see live
 * readouts of components/magnitude/angle, add vectors together, scale them.
 * No challenges, no score — just play and discover.
 */
const experiment2 = {
  title: 'Vector Playground',
  subtitle: 'Explore vectors in 2D — drag, add, scale',
  icon: '\uD83D\uDCD0',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;

    // Vector state
    let vecA = [3, 2];
    let vecB = [0, 0];
    let showB = false;
    let showSum = false;
    let scaleFactor = 1;
    let dragging = 'a'; // which vector is being dragged

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'experiment-canvas-wrap';
    const gridCanvasEl = document.createElement('canvas');
    canvasWrap.appendChild(gridCanvasEl);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'experiment-controls';

    container.append(canvasWrap, controlsDiv);

    const grid = new GridCanvas(gridCanvasEl, { range: [-6, 6] });

    // ─ Live readout panel ─
    const readout = document.createElement('div');
    readout.style.cssText = "font-family:'Fira Code',monospace;font-size:14px;line-height:2;color:var(--text-muted);";

    // ─ Toggle buttons ─
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';

    const toggleBBtn = makeBtn('+ Add Vector B', 'btn btn-ghost');
    toggleBBtn.style.cssText += 'flex:1;min-width:120px;';
    toggleBBtn.addEventListener('click', () => {
      showB = !showB;
      if (showB && vecB[0] === 0 && vecB[1] === 0) vecB = [-2, 3];
      toggleBBtn.textContent = showB ? '\u2212 Hide Vector B' : '+ Add Vector B';
      sumBtn.style.display = showB ? '' : 'none';
      if (!showB) showSum = false;
      sumBtn.textContent = showSum ? 'Hide A + B' : 'Show A + B';
      renderScene();
      updateReadout();
    });

    const sumBtn = makeBtn('Show A + B', 'btn btn-ghost');
    sumBtn.style.cssText += 'flex:1;min-width:120px;';
    sumBtn.style.display = 'none';
    sumBtn.addEventListener('click', () => {
      showSum = !showSum;
      sumBtn.textContent = showSum ? 'Hide A + B' : 'Show A + B';
      renderScene();
      updateReadout();
    });

    // ─ Scale slider ─
    const scaleRow = document.createElement('div');
    scaleRow.style.cssText = 'display:flex;align-items:center;gap:10px;';
    const scaleLabel = document.createElement('div');
    scaleLabel.style.cssText = "font-family:'Fira Code',monospace;font-size:13px;color:var(--text-muted);white-space:nowrap;";
    scaleLabel.textContent = 'Scale A: 1.0x';
    const scaleSlider = document.createElement('input');
    scaleSlider.type = 'range';
    scaleSlider.min = '-3';
    scaleSlider.max = '3';
    scaleSlider.step = '0.5';
    scaleSlider.value = '1';
    scaleSlider.style.cssText = 'flex:1;accent-color:var(--green);';
    scaleSlider.addEventListener('input', () => {
      scaleFactor = parseFloat(scaleSlider.value);
      scaleLabel.textContent = `Scale A: ${scaleFactor.toFixed(1)}x`;
      renderScene();
      updateReadout();
    });
    scaleRow.append(scaleLabel, scaleSlider);

    // ─ Drag mode selector ─
    const dragRow = document.createElement('div');
    dragRow.style.cssText = 'display:flex;gap:8px;';
    const dragABtn = makeBtn('Drag: Vector A', 'btn btn-green');
    dragABtn.style.cssText += 'flex:1;';
    const dragBBtn = makeBtn('Drag: Vector B', 'btn btn-ghost');
    dragBBtn.style.cssText += 'flex:1;';
    dragABtn.addEventListener('click', () => {
      dragging = 'a';
      dragABtn.className = 'btn btn-green';
      dragBBtn.className = 'btn btn-ghost';
    });
    dragBBtn.addEventListener('click', () => {
      if (!showB) return;
      dragging = 'b';
      dragBBtn.className = 'btn btn-green';
      dragABtn.className = 'btn btn-ghost';
    });
    dragRow.append(dragABtn, dragBBtn);

    btnRow.append(toggleBBtn, sumBtn);
    controlsDiv.append(readout, scaleRow, btnRow, dragRow);

    function renderScene() {
      grid.clear();
      grid.drawGrid();

      const scaledA = [vecA[0] * scaleFactor, vecA[1] * scaleFactor];

      // Draw scaled vector A
      grid.drawVector([0, 0], scaledA, chapterColor, `A(${fmtN(scaledA[0])}, ${fmtN(scaledA[1])})`);

      // Draw original A as ghost if scaled
      if (scaleFactor !== 1) {
        grid.drawVector([0, 0], vecA, 'rgba(255,255,255,0.15)', '');
      }

      if (showB) {
        // Draw B from origin
        grid.drawVector([0, 0], vecB, '#1CB0F6', `B(${fmtN(vecB[0])}, ${fmtN(vecB[1])})`);

        if (showSum) {
          // Tip-to-tail: draw B starting from tip of A
          const sum = [scaledA[0] + vecB[0], scaledA[1] + vecB[1]];
          grid.drawVector(scaledA, sum, 'rgba(28,176,246,0.4)', '');
          // Draw resultant
          grid.drawVector([0, 0], sum, '#FF9600', `A+B(${fmtN(sum[0])}, ${fmtN(sum[1])})`);
        }
      }
    }

    function updateReadout() {
      readout.textContent = '';
      const scaledA = [vecA[0] * scaleFactor, vecA[1] * scaleFactor];
      const magA = Math.hypot(scaledA[0], scaledA[1]);
      const angleA = Math.atan2(scaledA[1], scaledA[0]) * 180 / Math.PI;

      addLine(readout, `A = (${fmtN(scaledA[0])}, ${fmtN(scaledA[1])})`);
      addLine(readout, `|A| = ${magA.toFixed(2)}   \u2220 ${angleA.toFixed(1)}\u00B0`);

      if (showB) {
        const magB = Math.hypot(vecB[0], vecB[1]);
        const angleB = Math.atan2(vecB[1], vecB[0]) * 180 / Math.PI;
        addLine(readout, `B = (${fmtN(vecB[0])}, ${fmtN(vecB[1])})`);
        addLine(readout, `|B| = ${magB.toFixed(2)}   \u2220 ${angleB.toFixed(1)}\u00B0`);

        if (showSum) {
          const sum = [scaledA[0] + vecB[0], scaledA[1] + vecB[1]];
          const magS = Math.hypot(sum[0], sum[1]);
          addLine(readout, `A+B = (${fmtN(sum[0])}, ${fmtN(sum[1])})`);
          addLine(readout, `|A+B| = ${magS.toFixed(2)}`);
        }
      }

      // Mark experiment as completed after any interaction
      if (!completed) {
        completed = true;
        onComplete({ explored: true });
      }
    }

    grid.onDrag((wx, wy) => {
      const sx = snap(wx, 0.5);
      const sy = snap(wy, 0.5);
      if (dragging === 'a') {
        vecA = [sx, sy];
      } else if (showB) {
        vecB = [sx, sy];
      }
      renderScene();
      updateReadout();
    });

    renderScene();
    updateReadout();

    return () => { grid.destroy(); };
  },
};


// ── Chapter 3: Normalization Machine ─────────────────────────────────────────

/**
 * Ch 3 — Normalization Machine (sandbox)
 *
 * Drag any vector on the grid. The display always shows the original vector,
 * its magnitude, and the computed unit vector. A ghost unit circle and the
 * normalized vector are always visible. The formula updates live.
 * No rounds — just explore what normalization means visually.
 */
const experiment3 = {
  title: 'Normalization Machine',
  subtitle: 'See how any vector becomes a unit vector',
  icon: '\u2B55',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let vec = [3, 4]; // starting vector

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'experiment-canvas-wrap';
    const normCanvasEl = document.createElement('canvas');
    canvasWrap.appendChild(normCanvasEl);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'experiment-controls';

    container.append(canvasWrap, controlsDiv);

    const grid = new GridCanvas(normCanvasEl, { range: [-6, 6] });

    // ─ Info panel ─
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:14px;line-height:2.2;color:var(--text-muted);";

    const instrDiv = document.createElement('div');
    instrDiv.style.cssText = 'font-size:13px;color:var(--text-muted);margin-top:8px;text-align:center;';
    instrDiv.textContent = 'Drag anywhere on the grid to place a vector';

    // Random vector button
    const randomBtn = makeBtn('Random Vector', 'btn btn-ghost btn-full');
    randomBtn.addEventListener('click', () => {
      vec = [rnd(-5, 5), rnd(-5, 5)];
      if (vec[0] === 0 && vec[1] === 0) vec = [1, 0];
      renderScene();
      updateInfo();
    });

    controlsDiv.append(infoDiv, instrDiv, randomBtn);

    function renderScene() {
      grid.clear();
      grid.drawGrid();

      // Unit circle
      grid.drawCircle(0, 0, 1, chapterColor, true);

      const mag = Math.hypot(vec[0], vec[1]);

      // Original vector
      grid.drawVector([0, 0], vec, chapterColor, `(${fmtN(vec[0])}, ${fmtN(vec[1])})`);

      // Normalized vector (if non-zero)
      if (mag > 0.01) {
        const norm = [vec[0] / mag, vec[1] / mag];
        grid.drawVector([0, 0], norm, '#58CC02', '', 3);
        grid.drawPoint(norm[0], norm[1], '#58CC02', 6);
      }

      // Unit circle label
      grid.drawPoint(0, 1, 'rgba(255,255,255,0.1)', 3, 'r=1');
    }

    function updateInfo() {
      infoDiv.textContent = '';
      const mag = Math.hypot(vec[0], vec[1]);

      addLine(infoDiv, `v = (${fmtN(vec[0])}, ${fmtN(vec[1])})`);
      addLine(infoDiv, `|v| = \u221A(${fmtN(vec[0])}\u00B2 + ${fmtN(vec[1])}\u00B2) = ${mag.toFixed(2)}`);

      if (mag > 0.01) {
        const nx = (vec[0] / mag).toFixed(3);
        const ny = (vec[1] / mag).toFixed(3);
        addLine(infoDiv, `v\u0302 = v / |v| = (${nx}, ${ny})`);
        addLine(infoDiv, `|v\u0302| = 1.000`);
      } else {
        addLine(infoDiv, 'Zero vector \u2014 cannot normalize');
      }

      if (!completed) {
        completed = true;
        onComplete({ explored: true });
      }
    }

    grid.onDrag((wx, wy) => {
      vec = [snap(wx, 0.5), snap(wy, 0.5)];
      renderScene();
      updateInfo();
    });

    renderScene();
    updateInfo();

    return () => { grid.destroy(); };
  },
};


// ── Shared utilities ─────────────────────────────────────────────────────────

function fmtN(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function addLine(parent, text) {
  const div = document.createElement('div');
  div.textContent = text;
  parent.appendChild(div);
}


// ── Export ─────────────────────────────────────────────────────────────────────

export const EXPERIMENTS = {
  1: experiment1,
  2: experiment2,
  3: experiment3,
};
