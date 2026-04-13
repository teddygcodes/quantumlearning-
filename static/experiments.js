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

import { GridCanvas, PhysicsBeam, BlochSphere, HistogramRenderer, CircuitSimulator, ClockFace, StepSequencer, showToast, animateValue } from './experiment-ui.js?v=6';

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

    grid.onResize(() => { renderScene(); updateReadout(); });
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

    grid.onResize(() => { renderScene(); updateInfo(); });
    renderScene();
    updateInfo();

    return () => { grid.destroy(); };
  },
};


// ── Shared utilities ─────────────────────────────────────────────────────────

function fmtN(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function fmtComplex(re, im) {
  const r = +re.toFixed(2);
  const i = +im.toFixed(2);
  if (i === 0) return `${r}`;
  if (r === 0) return i === 1 ? 'i' : i === -1 ? '\u2212i' : `${i}i`;
  const sign = i > 0 ? ' + ' : ' \u2212 ';
  const ai = Math.abs(i) === 1 ? '' : Math.abs(i);
  return `${r}${sign}${ai}i`;
}

function fmtAngle(rad) {
  return (rad * 180 / Math.PI).toFixed(1) + '\u00B0';
}

function addLine(parent, text) {
  const div = document.createElement('div');
  div.textContent = text;
  parent.appendChild(div);
}


// ── Quantum math helpers ────────────────────────────────────────────────────
// Complex arithmetic, gate matrices, Bloch sphere conversions.

function cmul(a, b) { return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }; }
function cadd(a, b) { return { re: a.re + b.re, im: a.im + b.im }; }
function cabs2(a) { return a.re * a.re + a.im * a.im; }
function cabs(a) { return Math.sqrt(cabs2(a)); }

const SQRT2_INV = 1 / Math.sqrt(2);
const GATES = {
  X: [{ re: 0, im: 0 }, { re: 1, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }],
  Y: [{ re: 0, im: 0 }, { re: 0, im: -1 }, { re: 0, im: 1 }, { re: 0, im: 0 }],
  Z: [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: -1, im: 0 }],
  H: [{ re: SQRT2_INV, im: 0 }, { re: SQRT2_INV, im: 0 }, { re: SQRT2_INV, im: 0 }, { re: -SQRT2_INV, im: 0 }],
};

function applyGate(gate, alpha, beta) {
  return [
    cadd(cmul(gate[0], alpha), cmul(gate[1], beta)),
    cadd(cmul(gate[2], alpha), cmul(gate[3], beta)),
  ];
}

function stateToBloch(alpha, beta) {
  const absAlpha = cabs(alpha);
  const theta = 2 * Math.acos(Math.min(1, Math.max(0, absAlpha)));
  let phi = Math.atan2(beta.im, beta.re) - Math.atan2(alpha.im, alpha.re);
  phi = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return { theta, phi };
}

function blochToState(theta, phi) {
  return [
    { re: Math.cos(theta / 2), im: 0 },
    { re: Math.sin(theta / 2) * Math.cos(phi), im: Math.sin(theta / 2) * Math.sin(phi) },
  ];
}

// Remove global phase so alpha is real and non-negative
function normalizeGlobalPhase(alpha, beta) {
  if (cabs(alpha) < 1e-10) return [{ re: 0, im: 0 }, { re: cabs(beta), im: 0 }];
  const phase = Math.atan2(alpha.im, alpha.re);
  const c = Math.cos(-phase), s = Math.sin(-phase);
  return [
    { re: alpha.re * c - alpha.im * s, im: alpha.re * s + alpha.im * c },
    { re: beta.re * c - beta.im * s, im: beta.re * s + beta.im * c },
  ];
}

function fmtKet(alpha, beta) {
  const a = Math.abs(alpha.re) < 0.005 ? 0 : +alpha.re.toFixed(2);
  const bre = +beta.re.toFixed(2);
  const bim = +beta.im.toFixed(2);
  let bStr;
  if (Math.abs(bim) < 0.005) {
    bStr = `${bre}`;
  } else if (Math.abs(bre) < 0.005) {
    bStr = bim === 1 ? 'i' : bim === -1 ? '\u2212i' : `${bim}i`;
  } else {
    const sign = bim > 0 ? '+' : '';
    bStr = `(${bre}${sign}${bim}i)`;
  }
  if (a === 0 && bre === 0 && bim === 0) return '|ψ⟩ = 0';
  if (a === 0) return `|ψ⟩ = ${bStr}|1⟩`;
  if (Math.abs(bre) < 0.005 && Math.abs(bim) < 0.005) return `|ψ⟩ = ${a}|0⟩`;
  const sign = bre >= 0 && bim >= 0 ? ' + ' : ' \u2212 ';
  const absB = sign === ' \u2212 ' ? fmtKetCoeff(-bre, -bim) : bStr;
  return `|ψ⟩ = ${a}|0⟩${sign}${absB}|1⟩`;
}

function fmtKetCoeff(re, im) {
  if (Math.abs(im) < 0.005) return `${+re.toFixed(2)}`;
  if (Math.abs(re) < 0.005) return im === 1 ? 'i' : im === -1 ? '\u2212i' : `${+im.toFixed(2)}i`;
  const sign = im > 0 ? '+' : '';
  return `(${+re.toFixed(2)}${sign}${+im.toFixed(2)}i)`;
}

function tensorProduct(stateA, stateB) {
  const result = [];
  for (let i = 0; i < stateA.length; i++) {
    for (let j = 0; j < stateB.length; j++) {
      result.push(cmul(stateA[i], stateB[j]));
    }
  }
  return result;
}

function fmtKet2Q(state) {
  const labels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
  const terms = [];
  for (let i = 0; i < 4; i++) {
    const amp = state[i];
    if (cabs(amp) < 0.005) continue;
    const c = fmtKetCoeff(amp.re, amp.im);
    terms.push({ c, label: labels[i] });
  }
  if (terms.length === 0) return '|ψ⟩ = 0';
  let s = '|ψ⟩ = ';
  terms.forEach((t, idx) => {
    if (idx > 0) {
      if (t.c.startsWith('\u2212') || t.c.startsWith('-')) {
        s += ' \u2212 ' + (t.c.startsWith('\u2212') ? t.c.slice(1) : t.c.slice(1));
      } else {
        s += ' + ' + t.c;
      }
    } else {
      s += t.c;
    }
    s += t.label;
  });
  return s;
}


// ── Chapter 4: Complex Multiplier ───────────────────────────────────────────

/**
 * Ch 4 — Complex Multiplier (sandbox)
 *
 * Drag to place complex numbers on the complex plane. Multiply by i to see
 * 90° rotations, or multiply by an arbitrary complex number to see rotation
 * + scaling. The key insight: multiplication IS rotation.
 */
const experiment4 = {
  title: 'Complex Multiplier',
  subtitle: 'See how multiplication rotates the complex plane',
  icon: '\uD83D\uDD04',

  mount(container, { chapterColor, onComplete }) {
    let z = { re: 2, im: 1 };
    let multiplier = { re: 0, im: 1 };
    let mode = 'i';           // 'i' | 'other'
    let dragging = 'z';       // 'z' | 'multiplier'
    let history = [];
    let animating = false;
    let completed = false;
    let mulCount = 0;
    let cancelAnim = null;

    container.style.flexDirection = 'column';

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'experiment-canvas-wrap';
    const canvasEl = document.createElement('canvas');
    canvasWrap.appendChild(canvasEl);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'experiment-controls';

    container.append(canvasWrap, controlsDiv);

    const grid = new GridCanvas(canvasEl, { range: [-5, 5] });

    // ─ Readout ─
    const readout = document.createElement('div');
    readout.style.cssText = "font-family:'Fira Code',monospace;font-size:14px;line-height:2;color:var(--text-muted);";

    // ─ Mode buttons ─
    const modeRow = document.createElement('div');
    modeRow.style.cssText = 'display:flex;gap:8px;';
    const modeIBtn = makeBtn('\u00D7 i', 'btn btn-green');
    modeIBtn.style.cssText += 'flex:1;';
    const modeOtherBtn = makeBtn('\u00D7 other', 'btn btn-ghost');
    modeOtherBtn.style.cssText += 'flex:1;';

    modeIBtn.addEventListener('click', () => {
      if (animating) return;
      mode = 'i'; dragging = 'z';
      modeIBtn.className = 'btn btn-green'; modeOtherBtn.className = 'btn btn-ghost';
      multiplierSection.style.display = 'none';
      dragRow.style.display = 'none';
      renderScene(); updateReadout();
    });
    modeOtherBtn.addEventListener('click', () => {
      if (animating) return;
      mode = 'other';
      modeOtherBtn.className = 'btn btn-green'; modeIBtn.className = 'btn btn-ghost';
      multiplierSection.style.display = '';
      dragRow.style.display = 'flex';
      renderScene(); updateReadout();
    });
    modeRow.append(modeIBtn, modeOtherBtn);

    // ─ Multiply button ─
    const multiplyBtn = makeBtn('Multiply', 'btn');
    multiplyBtn.style.cssText += `width:100%;padding:14px;font-size:16px;background:${chapterColor};color:#fff;border:none;border-bottom:4px solid rgba(0,0,0,0.2);`;
    multiplyBtn.addEventListener('click', () => {
      if (animating) return;
      doMultiply();
    });

    // ─ Multiplier section (hidden in 'i' mode) ─
    const multiplierSection = document.createElement('div');
    multiplierSection.style.cssText = 'display:none;';
    const mulReadout = document.createElement('div');
    mulReadout.style.cssText = "font-family:'Fira Code',monospace;font-size:13px;color:var(--text-muted);margin-bottom:6px;";
    const randomBtn = makeBtn('Random Multiplier', 'btn btn-ghost btn-full');
    randomBtn.addEventListener('click', () => {
      if (animating) return;
      multiplier = { re: (rnd(-4, 4) || 1) * 0.5, im: (rnd(-4, 4) || 1) * 0.5 };
      renderScene(); updateReadout();
    });
    multiplierSection.append(mulReadout, randomBtn);

    // ─ Drag mode selector (hidden in 'i' mode) ─
    const dragRow = document.createElement('div');
    dragRow.style.cssText = 'display:none;gap:8px;';
    const dragZBtn = makeBtn('Drag: z', 'btn btn-green');
    dragZBtn.style.cssText += 'flex:1;';
    const dragMBtn = makeBtn('Drag: multiplier', 'btn btn-ghost');
    dragMBtn.style.cssText += 'flex:1;';
    dragZBtn.addEventListener('click', () => {
      dragging = 'z'; dragZBtn.className = 'btn btn-green'; dragMBtn.className = 'btn btn-ghost';
    });
    dragMBtn.addEventListener('click', () => {
      dragging = 'multiplier'; dragMBtn.className = 'btn btn-green'; dragZBtn.className = 'btn btn-ghost';
    });
    dragRow.append(dragZBtn, dragMBtn);

    // ─ Reset ─
    const resetBtn = makeBtn('Reset', 'btn btn-ghost btn-full');
    resetBtn.addEventListener('click', () => {
      if (animating) return;
      z = { re: 2, im: 1 }; history = []; mulCount = 0;
      renderScene(); updateReadout();
    });

    // ─ Discovery prompt ─
    const discoveryDiv = document.createElement('div');
    discoveryDiv.style.cssText = 'font-size:12px;color:var(--text-muted);text-align:center;opacity:0;transition:opacity 0.5s;padding:8px;';
    discoveryDiv.textContent = 'Try: multiply 1+i by itself repeatedly \u2014 what path does it trace?';

    controlsDiv.append(readout, modeRow, multiplyBtn, multiplierSection, dragRow, resetBtn, discoveryDiv);

    // ─ Rendering ─

    function renderScene() {
      grid.clear();
      grid.drawGrid();
      grid.drawAxisLabels('Re', 'Im', chapterColor);
      grid.drawCircle(0, 0, 1, 'rgba(255,255,255,0.12)', true);

      // History trail
      for (let i = 0; i < history.length; i++) {
        const alpha = 0.15 + 0.35 * (i / Math.max(1, history.length));
        const h = history[i];
        grid.drawPoint(h.re, h.im, `rgba(255,150,0,${alpha.toFixed(2)})`, 4);
        // Connect trail dots
        if (i > 0) {
          grid.drawDashedLine([history[i - 1].re, history[i - 1].im], [h.re, h.im], `rgba(255,150,0,${(alpha * 0.5).toFixed(2)})`);
        }
      }
      // Connect last trail dot to current z
      if (history.length > 0) {
        const last = history[history.length - 1];
        grid.drawDashedLine([last.re, last.im], [z.re, z.im], 'rgba(255,150,0,0.25)');
      }

      // Dashed projection lines
      if (Math.abs(z.re) > 0.05 && Math.abs(z.im) > 0.05) {
        grid.drawDashedLine([z.re, z.im], [z.re, 0], 'rgba(255,255,255,0.15)');
        grid.drawDashedLine([z.re, z.im], [0, z.im], 'rgba(255,255,255,0.15)');
      }

      // Phase angle arc
      const theta = Math.atan2(z.im, z.re);
      if (Math.hypot(z.re, z.im) > 0.2) {
        grid.drawArc(0, 0, 0.6, 0, theta, chapterColor, 2);
      }

      // z vector + point
      grid.drawVector([0, 0], [z.re, z.im], chapterColor, '');
      grid.drawPoint(z.re, z.im, chapterColor, 7);

      // In "other" mode, draw multiplier
      if (mode === 'other') {
        grid.drawVector([0, 0], [multiplier.re, multiplier.im], '#1CB0F6', '');
        grid.drawPoint(multiplier.re, multiplier.im, '#1CB0F6', 6);
      }
    }

    function updateReadout() {
      readout.textContent = '';
      const r = Math.hypot(z.re, z.im);
      const theta = Math.atan2(z.im, z.re);
      addLine(readout, `z = ${fmtComplex(z.re, z.im)}`);
      addLine(readout, `|z| = ${r.toFixed(2)}   \u2220 ${fmtAngle(theta)}`);

      if (mode === 'other') {
        mulReadout.textContent = '';
        const mr = Math.hypot(multiplier.re, multiplier.im);
        const mt = Math.atan2(multiplier.im, multiplier.re);
        addLine(mulReadout, `w = ${fmtComplex(multiplier.re, multiplier.im)}`);
        addLine(mulReadout, `|w| = ${mr.toFixed(2)}   \u2220 ${fmtAngle(mt)}`);
      }

      if (!completed) { completed = true; onComplete({ explored: true }); }
    }

    // ─ Multiply logic ─

    function doMultiply() {
      history.push({ re: z.re, im: z.im });
      mulCount++;

      const m = mode === 'i' ? { re: 0, im: 1 } : multiplier;
      const newRe = z.re * m.re - z.im * m.im;
      const newIm = z.re * m.im + z.im * m.re;

      // Animate via polar interpolation
      const r0 = Math.hypot(z.re, z.im);
      const t0 = Math.atan2(z.im, z.re);
      const r1 = Math.hypot(newRe, newIm);
      const t1Raw = Math.atan2(newIm, newRe);
      // Ensure we rotate the short way in the correct direction
      let dt = t1Raw - t0;
      // For multiply-by-i, always rotate +pi/2
      if (mode === 'i') {
        dt = Math.PI / 2;
      } else {
        // Normalize dt to [-pi, pi]
        while (dt > Math.PI) dt -= 2 * Math.PI;
        while (dt < -Math.PI) dt += 2 * Math.PI;
      }

      animating = true;
      const duration = mode === 'i' ? 400 : 500;
      const startTime = performance.now();
      let frameId;

      function step(now) {
        const p = Math.min(1, (now - startTime) / duration);
        const ease = 1 - Math.pow(1 - p, 3);
        const r = r0 + (r1 - r0) * ease;
        const t = t0 + dt * ease;
        z.re = r * Math.cos(t);
        z.im = r * Math.sin(t);
        renderScene();
        updateReadout();
        if (p < 1) {
          frameId = requestAnimationFrame(step);
        } else {
          // Snap to exact
          z.re = +newRe.toFixed(6);
          z.im = +newIm.toFixed(6);
          animating = false;
          cancelAnim = null;
          renderScene();
          updateReadout();
          // Show discovery prompt after a few multiplications
          if (mulCount >= 4) discoveryDiv.style.opacity = '1';
        }
      }
      frameId = requestAnimationFrame(step);
      cancelAnim = () => cancelAnimationFrame(frameId);
    }

    // ─ Drag ─

    grid.onDrag((wx, wy) => {
      if (animating) return;
      const sx = snap(wx, 0.25);
      const sy = snap(wy, 0.25);
      if (dragging === 'z' || mode === 'i') {
        z.re = sx; z.im = sy;
      } else {
        multiplier.re = sx; multiplier.im = sy;
      }
      renderScene();
      updateReadout();
    });

    grid.onResize(() => { renderScene(); updateReadout(); });
    renderScene();
    updateReadout();

    return () => { if (cancelAnim) cancelAnim(); grid.destroy(); };
  },
};


// ── Chapter 5: Transformation Sandbox ───────────────────────────────────────

/**
 * Ch 5 — Transformation Sandbox (sandbox)
 *
 * Apply matrices to an asymmetric F-shape on the grid. See rotation,
 * reflection, scaling, and shearing happen visually. Chain transforms,
 * undo, or enter custom matrices. The insight: matrices ARE transformations.
 */
const experiment5 = {
  title: 'Transformation Sandbox',
  subtitle: 'Apply matrices — see space reshape',
  icon: '\uD83D\uDD36',

  mount(container, { chapterColor, onComplete }) {
    // ── Matrix math helpers ──
    function mat2mul(A, B) {
      return [
        [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
        [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
      ];
    }
    function mat2det(M) { return M[0][0] * M[1][1] - M[0][1] * M[1][0]; }
    function mat2apply(M, p) {
      return [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]];
    }

    const F_SHAPE = [
      [0, 0], [0, 3], [2, 3], [2, 2.5],
      [0.5, 2.5], [0.5, 1.75], [1.5, 1.75], [1.5, 1.25],
      [0.5, 1.25], [0.5, 0],
    ];

    const TRANSFORMS = [
      { name: 'Rotate 90\u00B0', m: [[0, -1], [1, 0]] },
      { name: 'Reflect X',  m: [[1, 0], [0, -1]] },
      { name: 'Reflect Y',  m: [[-1, 0], [0, 1]] },
      { name: 'Scale 2\u00D7', m: [[2, 0], [0, 2]] },
      { name: 'Shear',      m: [[1, 0.5], [0, 1]] },
      { name: 'Scale \u00BD', m: [[0.5, 0], [0, 0.5]] },
    ];

    let currentMatrix = [[1, 0], [0, 1]];
    let matrixStack = [];
    let animating = false;
    let completed = false;
    let cancelAnim = null;

    container.style.flexDirection = 'column';

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'experiment-canvas-wrap';
    const canvasEl = document.createElement('canvas');
    canvasWrap.appendChild(canvasEl);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'experiment-controls';

    container.append(canvasWrap, controlsDiv);

    const grid = new GridCanvas(canvasEl, { range: [-5, 5] });

    // ─ Matrix display ─
    const matDisplay = document.createElement('div');
    matDisplay.style.cssText = "font-family:'Fira Code',monospace;font-size:14px;line-height:1.8;color:var(--text-muted);text-align:center;";

    // ─ Preset buttons (3 per row) ─
    const presetGrid = document.createElement('div');
    presetGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;';
    TRANSFORMS.forEach(t => {
      const btn = makeBtn(t.name, 'btn experiment-block-btn');
      btn.style.cssText += 'font-size:12px;padding:10px 4px;';
      btn.addEventListener('click', () => {
        if (animating) return;
        applyTransform(t.m);
      });
      presetGrid.appendChild(btn);
    });

    // ─ Custom matrix input ─
    const customLabel = document.createElement('div');
    customLabel.style.cssText = "font-size:11px;text-transform:uppercase;font-weight:800;letter-spacing:1px;color:var(--text-muted);margin-top:4px;";
    customLabel.textContent = 'Custom Matrix';

    const customGrid = document.createElement('div');
    customGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;';
    const inputs = [1, 0, 0, 1].map((val, i) => {
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.step = '0.5';
      inp.inputMode = 'decimal';
      inp.value = val;
      inp.style.cssText = "width:100%;min-height:48px;text-align:center;font-family:'Fira Code',monospace;font-size:16px;font-weight:700;background:var(--surface);color:var(--text);border:2px solid var(--border);border-radius:var(--radius);padding:8px;box-sizing:border-box;";
      customGrid.appendChild(inp);
      return inp;
    });

    const applyCustomBtn = makeBtn('Apply Custom', 'btn btn-ghost btn-full');
    applyCustomBtn.addEventListener('click', () => {
      if (animating) return;
      const vals = inputs.map(inp => parseFloat(inp.value));
      if (vals.some(v => isNaN(v))) { showToast(container, 'Enter valid numbers', 'error'); return; }
      applyTransform([[vals[0], vals[1]], [vals[2], vals[3]]]);
    });

    // ─ Action buttons ─
    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;gap:8px;';
    const undoBtn = makeBtn('Undo', 'btn btn-ghost');
    undoBtn.style.cssText += 'flex:1;';
    undoBtn.addEventListener('click', () => {
      if (animating || matrixStack.length === 0) return;
      const prev = matrixStack.pop();
      animateMatrix(currentMatrix, prev, () => {
        currentMatrix = prev;
        showToast(container, 'Undid last transform', 'info');
      });
    });
    const resetBtnT = makeBtn('Reset', 'btn btn-ghost');
    resetBtnT.style.cssText += 'flex:1;';
    resetBtnT.addEventListener('click', () => {
      if (animating) return;
      const identity = [[1, 0], [0, 1]];
      if (currentMatrix[0][0] === 1 && currentMatrix[0][1] === 0 && currentMatrix[1][0] === 0 && currentMatrix[1][1] === 1) return;
      matrixStack = [];
      animateMatrix(currentMatrix, identity, () => {
        currentMatrix = identity;
        showToast(container, 'Reset to original', 'info');
      });
    });
    actionRow.append(undoBtn, resetBtnT);

    // ─ Transform counter ─
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = 'font-size:13px;color:var(--text-muted);text-align:center;';
    counterDiv.textContent = 'Transforms applied: 0';

    controlsDiv.append(matDisplay, presetGrid, customLabel, customGrid, applyCustomBtn, actionRow, counterDiv);

    // ─ Rendering ─

    function renderScene(matrix) {
      const M = matrix || currentMatrix;
      grid.clear();
      grid.drawGrid();

      // Ghost original shape
      grid.drawPolygon(F_SHAPE, 'rgba(255,75,75,0.15)', 'rgba(255,75,75,0.05)');

      // Transformed shape
      const transformed = F_SHAPE.map(p => mat2apply(M, p));
      grid.drawPolygon(transformed, chapterColor, 'rgba(255,75,75,0.2)', 2.5);

      // Transformed basis vectors (show how matrix reshapes axes)
      const e1 = mat2apply(M, [1, 0]);
      const e2 = mat2apply(M, [0, 1]);
      grid.drawVector([0, 0], e1, '#FF9600', '', 2);
      grid.drawVector([0, 0], e2, '#1CB0F6', '', 2);
    }

    function updateMatDisplay(matrix) {
      const M = matrix || currentMatrix;
      const d = mat2det(M);
      matDisplay.textContent = '';
      addLine(matDisplay, `[ ${fmtN(M[0][0])}  ${fmtN(M[0][1])} ]`);
      addLine(matDisplay, `[ ${fmtN(M[1][0])}  ${fmtN(M[1][1])} ]`);
      const detLine = document.createElement('div');
      detLine.style.cssText = 'margin-top:4px;font-size:12px;';
      if (Math.abs(d) < 0.01) {
        detLine.style.color = '#FF4B4B';
        detLine.textContent = `det \u2248 0 (singular!)`;
      } else {
        detLine.textContent = `det = ${d.toFixed(2)}`;
      }
      matDisplay.appendChild(detLine);
    }

    // ─ Transform logic ─

    function applyTransform(T) {
      matrixStack.push(currentMatrix.map(r => [...r]));
      const newM = mat2mul(T, currentMatrix);
      animateMatrix(currentMatrix, newM, () => {
        currentMatrix = newM;
        counterDiv.textContent = `Transforms applied: ${matrixStack.length}`;
      });
    }

    function animateMatrix(from, to, onDone) {
      animating = true;
      const duration = 400;
      const startTime = performance.now();
      let frameId;

      function step(now) {
        const p = Math.min(1, (now - startTime) / duration);
        const ease = 1 - Math.pow(1 - p, 3);
        const interp = [
          [from[0][0] + (to[0][0] - from[0][0]) * ease, from[0][1] + (to[0][1] - from[0][1]) * ease],
          [from[1][0] + (to[1][0] - from[1][0]) * ease, from[1][1] + (to[1][1] - from[1][1]) * ease],
        ];
        renderScene(interp);
        updateMatDisplay(interp);
        if (p < 1) {
          frameId = requestAnimationFrame(step);
        } else {
          animating = false;
          cancelAnim = null;
          if (onDone) onDone();
          renderScene();
          updateMatDisplay();
          if (!completed) { completed = true; onComplete({ explored: true }); }
        }
      }
      frameId = requestAnimationFrame(step);
      cancelAnim = () => cancelAnimationFrame(frameId);
    }

    grid.onResize(() => { renderScene(); updateMatDisplay(); });
    renderScene();
    updateMatDisplay();

    return () => { if (cancelAnim) cancelAnim(); grid.destroy(); };
  },
};


// ── Chapter 6: State Explorer ───────────────────────────────────────────────

/**
 * Ch 6 — State Explorer (sandbox)
 *
 * Adjust α and β sliders to build qubit states. Watch probability bars
 * respond in real time. Presets for |0⟩, |1⟩, |+⟩, |−⟩. The insight:
 * amplitudes control measurement probabilities and must sum to 1.
 */
const experiment6 = {
  title: 'State Explorer',
  subtitle: 'Build qubit states — see probabilities change',
  icon: '🎚️',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let statesExplored = 0;
    let rawA = 1, rawB = 0; // slider values before normalization

    container.style.flexDirection = 'column';

    // ─ Ket display ─
    const ketDiv = document.createElement('div');
    ketDiv.style.cssText = `
      background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-lg);
      padding:20px;text-align:center;font-family:'Fira Code',monospace;font-size:20px;
      font-weight:700;color:var(--text);line-height:1.6;
    `;

    // ─ Probability bars ─
    const probDiv = document.createElement('div');
    probDiv.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

    function makeProbBar(label, color) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;';
      const lbl = document.createElement('div');
      lbl.style.cssText = `font-family:'Fira Code',monospace;font-size:13px;color:var(--text);font-weight:700;min-width:50px;`;
      lbl.textContent = label;
      const barBg = document.createElement('div');
      barBg.style.cssText = `flex:1;height:28px;background:var(--surface);border:1px solid var(--border);border-radius:6px;overflow:hidden;position:relative;`;
      const fill = document.createElement('div');
      fill.style.cssText = `height:100%;width:0%;background:${color};border-radius:5px;transition:width 0.25s ease;`;
      const val = document.createElement('div');
      val.style.cssText = `position:absolute;right:8px;top:50%;transform:translateY(-50%);font-family:'Fira Code',monospace;font-size:12px;color:var(--text);font-weight:700;`;
      barBg.append(fill, val);
      row.append(lbl, barBg);
      return { row, fill, val };
    }

    const p0 = makeProbBar('P(|0⟩)', chapterColor);
    const p1 = makeProbBar('P(|1⟩)', '#FF9600');
    const normBar = makeProbBar('Σ', '#58CC02');
    probDiv.append(p0.row, p1.row, normBar.row);

    // ─ Sliders ─
    const slidersDiv = document.createElement('div');
    slidersDiv.style.cssText = 'display:flex;flex-direction:column;gap:10px;';

    function makeSlider(label, min, max, initial, color) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;';
      const lbl = document.createElement('div');
      lbl.style.cssText = `font-family:'Fira Code',monospace;font-size:14px;color:${color};font-weight:700;min-width:24px;`;
      lbl.textContent = label;
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = min;
      slider.max = max;
      slider.step = '0.01';
      slider.value = initial;
      slider.style.cssText = `flex:1;accent-color:${color};`;
      const valEl = document.createElement('div');
      valEl.style.cssText = `font-family:'Fira Code',monospace;font-size:13px;color:var(--text-muted);min-width:48px;text-align:right;`;
      row.append(lbl, slider, valEl);
      return { row, slider, valEl };
    }

    const alphaSlider = makeSlider('α', '0', '1', '1', chapterColor);
    const betaSlider = makeSlider('β', '-1', '1', '0', '#FF9600');
    slidersDiv.append(alphaSlider.row, betaSlider.row);

    alphaSlider.slider.addEventListener('input', () => {
      rawA = parseFloat(alphaSlider.slider.value);
      update();
    });
    betaSlider.slider.addEventListener('input', () => {
      rawB = parseFloat(betaSlider.slider.value);
      update();
    });

    // ─ Preset buttons ─
    const presetDiv = document.createElement('div');
    presetDiv.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;';
    const presets = [
      { label: '|0⟩', a: 1, b: 0 },
      { label: '|1⟩', a: 0, b: 1 },
      { label: '|+⟩', a: SQRT2_INV, b: SQRT2_INV },
      { label: '|−⟩', a: SQRT2_INV, b: -SQRT2_INV },
    ];
    presets.forEach(p => {
      const btn = makeBtn(p.label, 'btn experiment-block-btn');
      btn.style.cssText += 'font-size:15px;padding:12px 4px;';
      btn.addEventListener('click', () => {
        rawA = p.a;
        rawB = p.b;
        alphaSlider.slider.value = rawA;
        betaSlider.slider.value = rawB;
        update();
        showToast(container, `Set to ${p.label}`, 'info');
      });
      presetDiv.appendChild(btn);
    });

    // ─ Counter ─
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = 'font-size:13px;color:var(--text-muted);text-align:center;';
    counterDiv.textContent = 'States explored: 0';

    container.append(ketDiv, probDiv, slidersDiv, presetDiv, counterDiv);

    function update() {
      const norm = Math.sqrt(rawA * rawA + rawB * rawB);
      let alpha, beta;
      if (norm < 1e-10) {
        alpha = 1; beta = 0; // default to |0⟩ if both zero
      } else {
        alpha = rawA / norm;
        beta = rawB / norm;
      }

      const p0v = alpha * alpha;
      const p1v = beta * beta;

      // Ket display
      const aStr = Math.abs(alpha) < 0.005 ? '0' : alpha.toFixed(2);
      const bAbs = Math.abs(beta);
      const bStr = bAbs < 0.005 ? '0' : bAbs.toFixed(2);
      const sign = beta >= 0 ? ' + ' : ' − ';
      if (bAbs < 0.005) {
        ketDiv.textContent = `|ψ⟩ = ${aStr}|0⟩`;
      } else if (Math.abs(alpha) < 0.005) {
        ketDiv.textContent = `|ψ⟩ = ${beta.toFixed(2)}|1⟩`;
      } else {
        ketDiv.textContent = `|ψ⟩ = ${aStr}|0⟩${sign}${bStr}|1⟩`;
      }

      // Slider value displays
      alphaSlider.valEl.textContent = alpha.toFixed(2);
      betaSlider.valEl.textContent = beta.toFixed(2);

      // Probability bars
      p0.fill.style.width = `${(p0v * 100).toFixed(1)}%`;
      p0.val.textContent = `${(p0v * 100).toFixed(0)}%`;
      p1.fill.style.width = `${(p1v * 100).toFixed(1)}%`;
      p1.val.textContent = `${(p1v * 100).toFixed(0)}%`;
      normBar.fill.style.width = '100%';
      normBar.val.textContent = '= 1.00';

      statesExplored++;
      counterDiv.textContent = `States explored: ${statesExplored}`;

      if (!completed) {
        completed = true;
        onComplete({ statesExplored });
      }
    }

    update();
    return () => {};
  },
};


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


// ── Chapter 8: Quantum Coin Toss Lab ────────────────────────────────────────

/**
 * Ch 8 — Quantum Coin Toss Lab (sandbox)
 *
 * Set a quantum state, hit MEASURE, watch the histogram build up.
 * Experience quantum randomness firsthand. The insight: measurement
 * is genuinely random and the histogram converges but never perfectly.
 */
const experiment8 = {
  title: 'Quantum Coin Toss',
  subtitle: 'Measure qubits — experience quantum randomness',
  icon: '🎲',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let rawA = SQRT2_INV, rawB = SQRT2_INV; // start at |+⟩
    let counts = [0, 0];
    let totalMeasurements = 0;
    let collapsed = false;
    let animating = false;

    container.style.flexDirection = 'column';

    // ─ Top row: Bloch sphere + histogram ─
    const topRow = document.createElement('div');
    topRow.style.cssText = 'display:flex;gap:12px;min-height:180px;';

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'experiment-canvas-wrap';
    canvasWrap.style.cssText += 'flex:1;min-height:160px;';
    const canvasEl = document.createElement('canvas');
    canvasWrap.appendChild(canvasEl);

    const histWrap = document.createElement('div');
    histWrap.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:8px 0;';

    topRow.append(canvasWrap, histWrap);

    // ─ Controls ─
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'experiment-controls';

    container.append(topRow, controlsDiv);

    const bloch = new BlochSphere(canvasEl, { color: chapterColor });
    const histogram = new HistogramRenderer(histWrap, {
      labels: ['|0⟩', '|1⟩'],
      colors: [chapterColor, '#FF9600'],
      height: 100,
    });

    // ─ State + probability display ─
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
      font-family:'Fira Code',monospace;font-size:14px;color:var(--text);
      text-align:center;line-height:1.8;
      background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);
      padding:10px;
    `;

    // ─ Sliders ─
    const slidersDiv = document.createElement('div');
    slidersDiv.style.cssText = 'display:flex;flex-direction:column;gap:6px;';

    function makeSlider8(label, min, max, initial, color) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;';
      const lbl = document.createElement('div');
      lbl.style.cssText = `font-family:'Fira Code',monospace;font-size:13px;color:${color};font-weight:700;min-width:20px;`;
      lbl.textContent = label;
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = min;
      slider.max = max;
      slider.step = '0.01';
      slider.value = initial;
      slider.style.cssText = `flex:1;accent-color:${color};`;
      row.append(lbl, slider);
      return { row, slider };
    }

    const aSlider = makeSlider8('α', '0', '1', SQRT2_INV.toFixed(2), chapterColor);
    const bSlider = makeSlider8('β', '-1', '1', SQRT2_INV.toFixed(2), '#FF9600');
    slidersDiv.append(aSlider.row, bSlider.row);

    aSlider.slider.addEventListener('input', () => {
      rawA = parseFloat(aSlider.slider.value);
      collapsed = false;
      updateState();
    });
    bSlider.slider.addEventListener('input', () => {
      rawB = parseFloat(bSlider.slider.value);
      collapsed = false;
      updateState();
    });

    // ─ Measure buttons ─
    const measureBtn = makeBtn('MEASURE', 'btn');
    measureBtn.style.cssText += `width:100%;padding:16px;font-size:18px;font-weight:800;background:${chapterColor};color:#fff;border:none;border-bottom:4px solid rgba(0,0,0,0.2);`;
    measureBtn.addEventListener('click', () => {
      if (animating) return;
      doMeasure();
    });

    const rapidBtn = makeBtn('Measure 100×', 'btn btn-ghost btn-full');
    rapidBtn.addEventListener('click', () => {
      if (animating) return;
      doRapidMeasure();
    });

    // ─ Reset + counter ─
    const bottomRow = document.createElement('div');
    bottomRow.style.cssText = 'display:flex;gap:8px;align-items:center;';
    const resetBtn = makeBtn('Reset State', 'btn btn-ghost');
    resetBtn.style.cssText += 'flex:1;';
    resetBtn.addEventListener('click', () => {
      if (animating) return;
      collapsed = false;
      counts = [0, 0];
      totalMeasurements = 0;
      histogram.reset();
      updateState();
      showToast(container, 'Fresh quantum state prepared', 'info');
    });
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:13px;color:var(--text-muted);text-align:right;flex:1;";
    counterDiv.textContent = 'Measurements: 0';
    bottomRow.append(resetBtn, counterDiv);

    // ─ Discovery prompt ─
    const discoveryDiv = document.createElement('div');
    discoveryDiv.style.cssText = 'font-size:12px;color:var(--text-muted);text-align:center;opacity:0;transition:opacity 0.5s;padding:4px;';
    discoveryDiv.textContent = 'Set P(|0⟩) = 50%. Measure 10 times. Exactly 5-5?';

    controlsDiv.append(infoDiv, slidersDiv, measureBtn, rapidBtn, bottomRow, discoveryDiv);

    function getNormalized() {
      const norm = Math.sqrt(rawA * rawA + rawB * rawB);
      if (norm < 1e-10) return { alpha: 1, beta: 0 };
      return { alpha: rawA / norm, beta: rawB / norm };
    }

    function updateState() {
      const { alpha, beta } = getNormalized();
      const p0 = alpha * alpha;
      const p1 = beta * beta;

      // Info display
      infoDiv.textContent = '';
      const ketLine = document.createElement('div');
      ketLine.style.fontWeight = '700';
      ketLine.textContent = `|ψ⟩ = ${alpha.toFixed(2)}|0⟩ ${beta >= 0 ? '+' : '−'} ${Math.abs(beta).toFixed(2)}|1⟩`;
      const probLine = document.createElement('div');
      probLine.style.cssText = 'font-size:13px;color:var(--text-muted);';
      probLine.textContent = `P(|0⟩) = ${p0.toFixed(2)}    P(|1⟩) = ${p1.toFixed(2)}`;
      infoDiv.append(ketLine, probLine);

      // Update expected on histogram
      if (totalMeasurements > 0) {
        histogram.setExpected([p0, p1]);
      }

      // Bloch sphere — show the superposition state
      if (!collapsed) {
        const theta = 2 * Math.acos(Math.max(0, Math.min(1, Math.abs(alpha))));
        const phi = beta < 0 ? Math.PI : 0;
        bloch.setState(theta, phi);
      }
    }

    function doMeasure() {
      const { alpha, beta } = getNormalized();
      const p0 = alpha * alpha;
      const result = Math.random() < p0 ? 0 : 1;

      counts[result]++;
      totalMeasurements++;
      collapsed = true;

      // Animate Bloch sphere to collapsed state
      const targetTheta = result === 0 ? 0 : Math.PI;
      animating = true;
      bloch.animateState(targetTheta, 0, 250).then(() => {
        animating = false;
      });

      // Flash effect
      showToast(container, result === 0 ? 'Measured |0⟩' : 'Measured |1⟩', result === 0 ? 'info' : 'success');

      updateHistogram();
      counterDiv.textContent = `Measurements: ${totalMeasurements}`;

      if (totalMeasurements >= 20) discoveryDiv.style.opacity = '1';

      if (!completed) {
        completed = true;
        onComplete({ totalMeasurements });
      }
    }

    function doRapidMeasure() {
      const { alpha } = getNormalized();
      const p0 = alpha * alpha;

      for (let i = 0; i < 100; i++) {
        const result = Math.random() < p0 ? 0 : 1;
        counts[result]++;
      }
      totalMeasurements += 100;
      collapsed = true;

      // Snap Bloch sphere to whichever was the last result
      const lastResult = Math.random() < p0 ? 0 : 1;
      bloch.setState(lastResult === 0 ? 0 : Math.PI, 0);

      updateHistogram();
      counterDiv.textContent = `Measurements: ${totalMeasurements}`;
      showToast(container, `+100 measurements`, 'info');

      if (totalMeasurements >= 20) discoveryDiv.style.opacity = '1';

      if (!completed) {
        completed = true;
        onComplete({ totalMeasurements });
      }
    }

    function updateHistogram() {
      const total = counts[0] + counts[1];
      if (total === 0) return;
      histogram.setData([counts[0] / total, counts[1] / total]);

      // Show expected overlay
      const { alpha, beta } = getNormalized();
      histogram.setExpected([alpha * alpha, beta * beta]);
    }

    // Initial render
    updateState();

    return () => { bloch.destroy(); histogram.destroy(); };
  },
};


// ── Chapter 9: Qubit Combiner ─────────────────────────────────────────────────

/**
 * Ch 9 — Qubit Combiner (sandbox)
 *
 * Two independent qubits combine into a 4-element state vector via tensor
 * product. Adjust each qubit's state and watch the combined probabilities
 * update live. The insight: independent qubits CAN'T create entanglement.
 */
const experiment9 = {
  title: 'Qubit Combiner',
  subtitle: 'Combine two qubits — see the tensor product live',
  icon: '🔗',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let combosExplored = 0;

    let thetaA = 0, phiA = 0;
    let thetaB = 0, phiB = 0;

    container.style.flexDirection = 'column';

    // ─ Bloch sphere row ─
    const sphereRow = document.createElement('div');
    sphereRow.style.cssText = 'display:flex;gap:12px;';

    function makeSphereCol(label) {
      const col = document.createElement('div');
      col.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;';
      const lbl = document.createElement('div');
      lbl.style.cssText = "font-family:'Fira Code',monospace;font-size:13px;font-weight:700;color:var(--text);";
      lbl.textContent = label;
      const wrap = document.createElement('div');
      wrap.className = 'experiment-canvas-wrap';
      wrap.style.cssText += 'min-height:140px;max-height:180px;width:100%;';
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas);
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '0';
      slider.max = String(Math.PI);
      slider.step = '0.02';
      slider.value = '0';
      slider.style.cssText = `width:100%;accent-color:${chapterColor};`;
      const valEl = document.createElement('div');
      valEl.style.cssText = "font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted);";
      valEl.textContent = 'θ = 0';
      col.append(lbl, wrap, slider, valEl);
      return { col, canvas, slider, valEl };
    }

    const colA = makeSphereCol('Qubit A');
    const colB = makeSphereCol('Qubit B');
    sphereRow.append(colA.col, colB.col);

    const blochA = new BlochSphere(colA.canvas, { color: chapterColor });
    const blochB = new BlochSphere(colB.canvas, { color: '#FF9600' });

    // ─ Ket display ─
    const ketDiv = document.createElement('div');
    ketDiv.style.cssText = `
      background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-lg);
      padding:14px;text-align:center;font-family:'Fira Code',monospace;font-size:15px;
      font-weight:700;color:var(--text);line-height:1.5;word-break:break-word;
    `;

    // ─ Histogram ─
    const histWrap = document.createElement('div');
    histWrap.style.cssText = 'width:100%;';
    const histogram = new HistogramRenderer(histWrap, {
      labels: ['|00⟩', '|01⟩', '|10⟩', '|11⟩'],
      colors: [chapterColor, '#FF9600', '#CE82FF', '#FF4B4B'],
      height: 100,
    });

    // ─ Separability badge ─
    const sepDiv = document.createElement('div');
    sepDiv.style.cssText = `
      text-align:center;padding:8px 16px;border-radius:var(--radius);
      background:rgba(88,204,2,0.12);border:1px solid rgba(88,204,2,0.3);
      font-family:'Fira Code',monospace;font-size:13px;font-weight:700;color:#58CC02;
    `;
    sepDiv.textContent = '✓ This state IS separable';

    // ─ Presets ─
    const presetDiv = document.createElement('div');
    presetDiv.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;';
    const presets = [
      { label: '|0⟩⊗|0⟩', a: [0, 0], b: [0, 0] },
      { label: '|+⟩⊗|−⟩', a: [Math.PI / 2, 0], b: [Math.PI / 2, Math.PI] },
      { label: '|1⟩⊗|+⟩', a: [Math.PI, 0], b: [Math.PI / 2, 0] },
      { label: '|0⟩⊗|1⟩', a: [0, 0], b: [Math.PI, 0] },
      { label: '|+⟩⊗|+⟩', a: [Math.PI / 2, 0], b: [Math.PI / 2, 0] },
      { label: '|1⟩⊗|1⟩', a: [Math.PI, 0], b: [Math.PI, 0] },
    ];
    presets.forEach(p => {
      const btn = makeBtn(p.label, 'btn experiment-block-btn');
      btn.style.cssText += 'font-size:13px;padding:10px 4px;';
      btn.addEventListener('click', () => {
        thetaA = p.a[0]; phiA = p.a[1];
        thetaB = p.b[0]; phiB = p.b[1];
        colA.slider.value = thetaA;
        colB.slider.value = thetaB;
        update();
        showToast(container, `Set to ${p.label}`, 'info');
      });
      presetDiv.appendChild(btn);
    });

    // ─ Discovery prompt ─
    const discoveryDiv = document.createElement('div');
    discoveryDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);text-align:center;opacity:0;transition:opacity 0.5s;line-height:1.5;";
    discoveryDiv.textContent = '💡 Can you make P(|00⟩) = P(|11⟩) = 0.5 with P(|01⟩) = P(|10⟩) = 0? Try it — then come back for Chapter 10.';

    // ─ Counter ─
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = 'font-size:13px;color:var(--text-muted);text-align:center;';
    counterDiv.textContent = 'Combinations explored: 0';

    container.append(sphereRow, ketDiv, histWrap, sepDiv, presetDiv, discoveryDiv, counterDiv);

    colA.slider.addEventListener('input', () => {
      thetaA = parseFloat(colA.slider.value);
      phiA = 0;
      update();
    });
    colB.slider.addEventListener('input', () => {
      thetaB = parseFloat(colB.slider.value);
      phiB = 0;
      update();
    });

    function update() {
      blochA.setState(thetaA, phiA);
      blochB.setState(thetaB, phiB);

      colA.valEl.textContent = `θ = ${(thetaA / Math.PI).toFixed(2)}π`;
      colB.valEl.textContent = `θ = ${(thetaB / Math.PI).toFixed(2)}π`;

      const stA = blochToState(thetaA, phiA);
      const stB = blochToState(thetaB, phiB);
      const combined = tensorProduct(stA, stB);

      ketDiv.textContent = fmtKet2Q(combined);

      const probs = combined.map(c => c.re * c.re + c.im * c.im);
      histogram.setData(probs);

      combosExplored++;
      counterDiv.textContent = `Combinations explored: ${combosExplored}`;

      if (combosExplored >= 5) discoveryDiv.style.opacity = '1';

      if (!completed) {
        completed = true;
        onComplete({ combosExplored });
      }
    }

    update();

    return () => { blochA.destroy(); blochB.destroy(); histogram.destroy(); };
  },
};


// ── Chapter 10: Entanglement Lab ──────────────────────────────────────────────

/**
 * Ch 10 — Entanglement Lab (sandbox)
 *
 * Prepare Bell states and measure one qubit — the other instantly collapses.
 * Repeated measurements build up a log showing perfect correlations.
 * The insight: entangled qubits are correlated in a way no classical system can replicate.
 */
const experiment10 = {
  title: 'Entanglement Lab',
  subtitle: 'Measure one qubit — the other instantly responds',
  icon: '🔮',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let pairsMeasured = 0;
    let matched = 0;
    let bellType = 'phi+';
    let measured = false;

    const sim = new CircuitSimulator(2);

    container.style.flexDirection = 'column';

    // ─ Bell state display ─
    const bellDisplay = document.createElement('div');
    bellDisplay.style.cssText = `
      background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-lg);
      padding:14px;text-align:center;font-family:'Fira Code',monospace;font-size:16px;
      font-weight:700;color:var(--text);line-height:1.5;
    `;

    // ─ Sphere row ─
    const sphereRow = document.createElement('div');
    sphereRow.style.cssText = 'display:flex;gap:12px;';

    function makeMeasureCol(label, color) {
      const col = document.createElement('div');
      col.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;';
      const lbl = document.createElement('div');
      lbl.style.cssText = `font-family:'Fira Code',monospace;font-size:13px;font-weight:700;color:${color};`;
      lbl.textContent = label;
      const wrap = document.createElement('div');
      wrap.className = 'experiment-canvas-wrap';
      wrap.style.cssText += 'min-height:140px;max-height:180px;width:100%;';
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas);
      const statusEl = document.createElement('div');
      statusEl.style.cssText = `font-family:'Fira Code',monospace;font-size:12px;font-weight:700;color:${color};text-align:center;min-height:18px;`;
      const btn = makeBtn(`Measure ${label}`, 'btn');
      btn.style.cssText += `width:100%;background:${color};color:#fff;border:none;border-bottom:4px solid rgba(0,0,0,0.2);padding:12px;font-size:14px;`;
      col.append(lbl, wrap, statusEl, btn);
      return { col, canvas, statusEl, btn };
    }

    const colQ0 = makeMeasureCol('Qubit 0', chapterColor);
    const colQ1 = makeMeasureCol('Qubit 1', '#FF9600');
    sphereRow.append(colQ0.col, colQ1.col);

    const blochQ0 = new BlochSphere(colQ0.canvas, { color: chapterColor });
    const blochQ1 = new BlochSphere(colQ1.canvas, { color: '#FF9600' });

    // ─ Bell selector ─
    const bellRow = document.createElement('div');
    bellRow.style.cssText = 'display:flex;gap:8px;';
    const btnPhi = makeBtn('|Φ+⟩ correlated', 'btn btn-green');
    btnPhi.style.cssText += 'flex:1;font-size:13px;';
    const btnPsi = makeBtn('|Ψ+⟩ anti-corr.', 'btn btn-ghost');
    btnPsi.style.cssText += 'flex:1;font-size:13px;';
    bellRow.append(btnPhi, btnPsi);

    btnPhi.addEventListener('click', () => {
      bellType = 'phi+';
      btnPhi.className = 'btn btn-green'; btnPsi.className = 'btn btn-ghost';
      preparePair();
    });
    btnPsi.addEventListener('click', () => {
      bellType = 'psi+';
      btnPsi.className = 'btn btn-green'; btnPhi.className = 'btn btn-ghost';
      preparePair();
    });

    // ─ New Pair button ─
    const newPairBtn = makeBtn('New Pair', 'btn btn-full');
    newPairBtn.style.cssText += `width:100%;padding:14px;font-size:16px;background:${chapterColor};color:#fff;border:none;border-bottom:4px solid rgba(0,0,0,0.2);`;
    newPairBtn.addEventListener('click', () => preparePair());

    // ─ Correlation display ─
    const corrDiv = document.createElement('div');
    corrDiv.style.cssText = `
      background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-lg);
      padding:12px 16px;font-family:'Fira Code',monospace;font-size:14px;color:var(--text);
      text-align:center;font-weight:700;
    `;

    // ─ Measurement log ─
    const logWrap = document.createElement('div');
    logWrap.style.cssText = 'max-height:140px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius);';
    const logTable = document.createElement('table');
    logTable.style.cssText = "width:100%;border-collapse:collapse;font-family:'Fira Code',monospace;font-size:12px;";
    const logHead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.style.cssText = 'color:var(--text-muted);border-bottom:1px solid var(--border);';
    ['#', 'Q0', 'Q1', 'Match?'].forEach(text => {
      const th = document.createElement('th');
      th.style.cssText = 'padding:6px;';
      th.textContent = text;
      headRow.appendChild(th);
    });
    logHead.appendChild(headRow);
    const logBody = document.createElement('tbody');
    logTable.append(logHead, logBody);
    logWrap.appendChild(logTable);

    // ─ Counter ─
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = 'font-size:13px;color:var(--text-muted);text-align:center;';

    // ─ Discovery prompt ─
    const discoveryDiv = document.createElement('div');
    discoveryDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);text-align:center;opacity:0;transition:opacity 0.5s;line-height:1.5;";
    discoveryDiv.textContent = '💡 Switch to |Ψ+⟩. Now what happens when you measure?';

    container.append(bellDisplay, sphereRow, bellRow, newPairBtn, corrDiv, logWrap, counterDiv, discoveryDiv);

    // ─ Measure handlers ─
    colQ0.btn.addEventListener('click', () => doMeasure(0));
    colQ1.btn.addEventListener('click', () => doMeasure(1));

    function preparePair() {
      measured = false;
      sim.reset();
      sim.applyGate('H', 0);
      sim.applyGate('X', 1, 0); // CNOT
      if (bellType === 'psi+') {
        sim.applyGate('X', 1);
      }

      blochQ0.setState(Math.PI / 2, 0);
      blochQ1.setState(Math.PI / 2, 0);
      colQ0.statusEl.textContent = '~ entangled ~';
      colQ0.statusEl.style.opacity = '0.6';
      colQ1.statusEl.textContent = '~ entangled ~';
      colQ1.statusEl.style.opacity = '0.6';
      colQ0.btn.disabled = false;
      colQ1.btn.disabled = false;
      colQ0.btn.style.opacity = '1';
      colQ1.btn.style.opacity = '1';

      updateBellDisplay();
    }

    function updateBellDisplay() {
      if (bellType === 'phi+') {
        bellDisplay.textContent = '|Φ+⟩ = (1/√2)(|00⟩ + |11⟩)';
      } else {
        bellDisplay.textContent = '|Ψ+⟩ = (1/√2)(|01⟩ + |10⟩)';
      }
    }

    function doMeasure(qubit) {
      if (measured) return;
      measured = true;

      const result = sim.measureQubit(qubit);
      const otherQubit = qubit === 0 ? 1 : 0;
      const otherResult = sim.measureQubit(otherQubit);

      const q0Result = qubit === 0 ? result : otherResult;
      const q1Result = qubit === 1 ? result : otherResult;

      blochQ0.animateState(q0Result === 0 ? 0 : Math.PI, 0, 300);
      blochQ1.animateState(q1Result === 0 ? 0 : Math.PI, 0, 300);

      colQ0.statusEl.textContent = q0Result === 0 ? '|0⟩' : '|1⟩';
      colQ0.statusEl.style.opacity = '1';
      colQ1.statusEl.textContent = q1Result === 0 ? '|0⟩' : '|1⟩';
      colQ1.statusEl.style.opacity = '1';

      colQ0.btn.disabled = true;
      colQ1.btn.disabled = true;
      colQ0.btn.style.opacity = '0.5';
      colQ1.btn.style.opacity = '0.5';

      pairsMeasured++;
      const isMatch = q0Result === q1Result;
      if (bellType === 'phi+') {
        if (isMatch) matched++;
      } else {
        if (!isMatch) matched++;
      }

      const pct = pairsMeasured > 0 ? ((matched / pairsMeasured) * 100).toFixed(0) : '0';
      const corrLabel = bellType === 'phi+' ? 'matched' : 'anti-correlated';
      corrDiv.textContent = `${corrLabel}: ${matched}/${pairsMeasured} (${pct}%)`;

      // Add log row via DOM
      const row = document.createElement('tr');
      row.style.cssText = 'border-bottom:1px solid var(--border);';
      const matchOk = bellType === 'phi+' ? isMatch : !isMatch;
      const cells = [
        { text: String(pairsMeasured), color: 'var(--text-muted)' },
        { text: q0Result === 0 ? '|0⟩' : '|1⟩', color: chapterColor },
        { text: q1Result === 0 ? '|0⟩' : '|1⟩', color: '#FF9600' },
        { text: matchOk ? '✓' : '✗', color: matchOk ? '#58CC02' : '#FF4B4B' },
      ];
      cells.forEach(c => {
        const td = document.createElement('td');
        td.style.cssText = `padding:4px 6px;text-align:center;font-weight:700;color:${c.color};`;
        td.textContent = c.text;
        row.appendChild(td);
      });
      logBody.prepend(row);

      counterDiv.textContent = `Pairs measured: ${pairsMeasured}`;

      if (pairsMeasured >= 3) discoveryDiv.style.opacity = '1';

      if (!completed) {
        completed = true;
        onComplete({ pairsMeasured });
      }
    }

    // Initial state
    preparePair();
    corrDiv.textContent = 'Correlation: 0/0 (—)';

    return () => { blochQ0.destroy(); blochQ1.destroy(); };
  },
};


// ── Chapter 11: Circuit Puzzler ───────────────────────────────────────────────

/**
 * Ch 11 — Circuit Puzzler (sandbox)
 *
 * Tap gates from the toolbox, then tap wire slots to place them. CNOT uses
 * a two-tap flow (control then target). Run the circuit to see output state
 * and histogram. Optional targets give inspiration without pressure.
 */
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


// ── Rotation gate helpers (Ch 12) ────────────────────────────────────────────

function applyRx(state, theta) {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  // Rx(θ) = [[cos(θ/2), -i·sin(θ/2)], [-i·sin(θ/2), cos(θ/2)]]
  const [a, b] = state;
  return [
    { re: c * a.re + s * b.im, im: c * a.im - s * b.re },
    { re: s * a.im + c * b.re, im: -s * a.re + c * b.im },
  ];
}

function applyRy(state, theta) {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  // Ry(θ) = [[cos(θ/2), -sin(θ/2)], [sin(θ/2), cos(θ/2)]]
  const [a, b] = state;
  return [
    { re: c * a.re - s * b.re, im: c * a.im - s * b.im },
    { re: s * a.re + c * b.re, im: s * a.im + c * b.im },
  ];
}

function applyRz(state, theta) {
  // Rz(θ) = [[e^(-iθ/2), 0], [0, e^(iθ/2)]]
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  const [a, b] = state;
  return [
    { re: c * a.re + s * a.im, im: c * a.im - s * a.re },  // e^(-iθ/2) * a
    { re: c * b.re - s * b.im, im: c * b.im + s * b.re },  // e^(+iθ/2) * b
  ];
}

// stateToBloch and fmtKet already defined above (line ~640)

function fmtKetFull(alpha, beta) {
  // Like fmtKet but shows complex alpha (needed when Rz introduces phase on |0⟩)
  function fc(c) {
    const re = Math.round(c.re * 100) / 100;
    const im = Math.round(c.im * 100) / 100;
    if (Math.abs(im) < 0.005) return `${re}`;
    if (Math.abs(re) < 0.005) return `${im}i`;
    return `(${re}${im >= 0 ? '+' : ''}${im}i)`;
  }
  const aStr = fc(alpha);
  const bStr = fc(beta);
  if (aStr === '0' && bStr === '0') return '|ψ⟩ = 0';
  if (aStr === '0') return `|ψ⟩ = ${bStr}|1⟩`;
  if (bStr === '0') return `|ψ⟩ = ${aStr}|0⟩`;
  return `|ψ⟩ = ${aStr}|0⟩ + ${bStr}|1⟩`;
}


// ── Chapter 12: Bloch Sphere Painter ─────────────────────────────────────────

/**
 * Ch 12 — Bloch Sphere Painter (sandbox)
 *
 * Rotation gate sliders paint colored trails on the Bloch sphere.
 * Rx = red, Ry = green, Rz = blue. Each axis traces a different circle.
 * Students discover: Rz from |0⟩ doesn't visibly move (global phase).
 */
const experiment12 = {
  title: 'Bloch Sphere Painter',
  subtitle: 'Paint rotation trails on the Bloch sphere',
  icon: '🎨',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let rotationsExplored = 0;

    // Quantum state as complex amplitudes [α, β]
    let state = [{ re: 1, im: 0 }, { re: 0, im: 0 }]; // |0⟩

    container.style.flexDirection = 'column';

    // ─ Bloch sphere (large) ─
    const sphereWrap = document.createElement('div');
    sphereWrap.className = 'experiment-canvas-wrap';
    sphereWrap.style.cssText += 'min-height:220px;max-height:280px;width:100%;';
    const sphereCanvas = document.createElement('canvas');
    sphereWrap.appendChild(sphereCanvas);
    const bloch = new BlochSphere(sphereCanvas, { color: chapterColor, showTrails: true });

    // ─ State display ─
    const stateDiv = document.createElement('div');
    stateDiv.style.cssText = `
      background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-lg);
      padding:12px;text-align:center;font-family:'Fira Code',monospace;font-size:14px;
      font-weight:700;color:var(--text);line-height:1.4;
    `;

    // ─ Probability readout ─
    const probDiv = document.createElement('div');
    probDiv.style.cssText = "text-align:center;font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);";

    // ─ Rotation sliders ─
    const AXES = [
      { name: 'Rx', color: '#FF4B4B', apply: applyRx },
      { name: 'Ry', color: '#58CC02', apply: applyRy },
      { name: 'Rz', color: '#1CB0F6', apply: applyRz },
    ];

    const sliderSection = document.createElement('div');
    sliderSection.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

    const sliderRefs = AXES.map(axis => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;';

      const label = document.createElement('div');
      label.style.cssText = `font-family:'Fira Code',monospace;font-size:13px;font-weight:700;color:${axis.color};min-width:28px;`;
      label.textContent = axis.name;

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = String(-Math.PI);
      slider.max = String(Math.PI);
      slider.step = '0.03';
      slider.value = '0';
      slider.style.cssText = `flex:1;accent-color:${axis.color};`;

      const valEl = document.createElement('div');
      valEl.style.cssText = `font-family:'Fira Code',monospace;font-size:11px;color:${axis.color};min-width:44px;text-align:right;`;
      valEl.textContent = '0';

      row.append(label, slider, valEl);
      sliderSection.appendChild(row);

      let lastVal = 0;

      slider.addEventListener('input', () => {
        const val = parseFloat(slider.value);
        const delta = val - lastVal;
        lastVal = val;

        if (Math.abs(delta) < 0.001) return;

        state = axis.apply(state, delta);

        const blochAngles = stateToBloch(state[0], state[1]);
        bloch.addTrailPoint(blochAngles.theta, blochAngles.phi, axis.color);

        rotationsExplored++;
        update();

        if (!completed) {
          completed = true;
          onComplete({ rotationsExplored });
        }
      });

      const resetSlider = () => {
        slider.value = '0';
        lastVal = 0;
        valEl.textContent = '0';
        bloch._currentTrail = null;
      };
      slider.addEventListener('pointerup', resetSlider);
      slider.addEventListener('touchend', resetSlider);

      return { slider, valEl, resetSlider };
    });

    // ─ Action buttons ─
    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;gap:8px;';

    const clearBtn = makeBtn('Clear Trails', 'btn experiment-block-btn');
    clearBtn.addEventListener('click', () => {
      bloch.clearTrails();
      bloch.render();
      showToast(container, 'Trails cleared', 'info');
    });

    const resetBtn = makeBtn('Reset to |0⟩', 'btn experiment-block-btn');
    resetBtn.addEventListener('click', () => {
      state = [{ re: 1, im: 0 }, { re: 0, im: 0 }];
      bloch.clearTrails();
      sliderRefs.forEach(s => s.resetSlider());
      update();
      showToast(container, 'Reset to |0⟩', 'info');
    });

    actionRow.append(clearBtn, resetBtn);

    // ─ Discovery prompt ─
    const discoveryDiv = document.createElement('div');
    discoveryDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);text-align:center;opacity:0;transition:opacity 0.5s;line-height:1.5;";
    discoveryDiv.textContent = "💡 Start at |0⟩. Try using ONLY Rz — can you move the arrow? Now try Ry, then combine both.";

    // ─ Counter ─
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = 'font-size:13px;color:var(--text-muted);text-align:center;';
    counterDiv.textContent = 'Rotations explored: 0';

    container.append(sphereWrap, stateDiv, probDiv, sliderSection, actionRow, discoveryDiv, counterDiv);

    function update() {
      const blochAngles = stateToBloch(state[0], state[1]);
      bloch.setState(blochAngles.theta, blochAngles.phi);
      stateDiv.textContent = fmtKetFull(state[0], state[1]);

      const p0 = state[0].re * state[0].re + state[0].im * state[0].im;
      probDiv.textContent = `P(|0⟩) = ${(p0).toFixed(3)}   P(|1⟩) = ${(1 - p0).toFixed(3)}`;

      sliderRefs.forEach(s => {
        s.valEl.textContent = parseFloat(s.slider.value).toFixed(2);
      });

      counterDiv.textContent = `Rotations explored: ${rotationsExplored}`;
      if (rotationsExplored >= 10) discoveryDiv.style.opacity = '1';
    }

    update();

    return () => { bloch.destroy(); };
  },
};


// ── Chapter 13: Phase Clock ──────────────────────────────────────────────────

/**
 * Ch 13 — Phase Clock (sandbox)
 *
 * Clock face showing the phase of |1⟩'s amplitude. Phase gates (T, S, Z)
 * rotate the clock hand in fixed increments. Students discover the hierarchy:
 * T² = S, S² = Z, T⁴ = Z. Running decomposition formula shows equivalences.
 */
const experiment13 = {
  title: 'Phase Clock',
  subtitle: 'Step through phase gates — see the hierarchy',
  icon: '🕐',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let gatesApplied = 0;
    let phase = 0;
    let gateHistory = [];

    container.style.flexDirection = 'column';

    // ─ Clock face ─
    const clockWrap = document.createElement('div');
    clockWrap.className = 'experiment-canvas-wrap';
    clockWrap.style.cssText += 'min-height:200px;max-height:240px;width:100%;';
    const clockCanvas = document.createElement('canvas');
    clockWrap.appendChild(clockCanvas);
    const clock = new ClockFace(clockCanvas, { color: chapterColor });

    // ─ State display ─
    const stateDiv = document.createElement('div');
    stateDiv.style.cssText = `
      background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-lg);
      padding:12px;text-align:center;font-family:'Fira Code',monospace;font-size:14px;
      font-weight:700;color:var(--text);line-height:1.4;
    `;

    // ─ Phase formula ─
    const formulaDiv = document.createElement('div');
    formulaDiv.style.cssText = `
      background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
      padding:10px;text-align:center;font-family:'Fira Code',monospace;font-size:13px;
      color:var(--text-muted);line-height:1.5;min-height:40px;
    `;

    // ─ Probability bars (always 50/50) ─
    const probDiv = document.createElement('div');
    probDiv.style.cssText = "text-align:center;font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);";
    probDiv.textContent = 'P(|0⟩) = 0.500   P(|1⟩) = 0.500 — phase never changes probabilities';

    // ─ Gate buttons ─
    const PHASE_GATES = [
      { label: 'T', sublabel: '+π/4', angle: Math.PI / 4, primary: true },
      { label: 'S', sublabel: '+π/2', angle: Math.PI / 2, primary: true },
      { label: 'Z', sublabel: '+π', angle: Math.PI, primary: true },
      { label: 'T†', sublabel: '−π/4', angle: -Math.PI / 4, primary: false },
      { label: 'S†', sublabel: '−π/2', angle: -Math.PI / 2, primary: false },
    ];

    const gateRow = document.createElement('div');
    gateRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;';

    PHASE_GATES.forEach(gate => {
      const btn = document.createElement('button');
      btn.className = gate.primary ? 'btn' : 'btn experiment-block-btn';
      btn.style.cssText = `
        padding:10px 14px;font-family:'Fira Code',monospace;font-weight:700;
        font-size:15px;display:flex;flex-direction:column;align-items:center;gap:2px;
        min-width:60px;
        ${gate.primary ? `background:${chapterColor};color:#fff;border:none;` : ''}
      `;
      const nameSpan = document.createElement('span');
      nameSpan.textContent = gate.label;
      const subSpan = document.createElement('span');
      subSpan.style.cssText = 'font-size:10px;opacity:0.7;';
      subSpan.textContent = gate.sublabel;
      btn.append(nameSpan, subSpan);

      btn.addEventListener('click', async () => {
        const oldPhase = phase;
        phase += gate.angle;
        gateHistory.push(gate.label);
        gatesApplied++;

        await clock.animatePhase(oldPhase, phase, 300);
        updateDisplay();

        if (!completed) {
          completed = true;
          onComplete({ gatesApplied });
        }
      });

      gateRow.appendChild(btn);
    });

    // ─ Reset button ─
    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;gap:8px;justify-content:center;';

    const resetBtn = makeBtn('Reset Phase', 'btn experiment-block-btn');
    resetBtn.addEventListener('click', () => {
      phase = 0;
      gateHistory = [];
      clock.setPhase(0);
      updateDisplay();
      showToast(container, 'Phase reset to 0', 'info');
    });
    actionRow.appendChild(resetBtn);

    // ─ Discovery prompt ─
    const discoveryDiv = document.createElement('div');
    discoveryDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);text-align:center;opacity:0;transition:opacity 0.5s;line-height:1.5;";
    discoveryDiv.textContent = '💡 How many T gates equal one Z gate? Try it!';

    // ─ Counter ─
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = 'font-size:13px;color:var(--text-muted);text-align:center;';

    container.append(clockWrap, stateDiv, formulaDiv, probDiv, gateRow, actionRow, discoveryDiv, counterDiv);

    function formatPhaseAngle(rad) {
      let r = rad % (2 * Math.PI);
      if (r < -1e-9) r += 2 * Math.PI;
      if (Math.abs(r) < 1e-9 || Math.abs(r - 2 * Math.PI) < 1e-9) return '0';
      const frac = r / Math.PI;
      const fracs = [
        [1/4, 'π/4'], [1/2, 'π/2'], [3/4, '3π/4'], [1, 'π'],
        [5/4, '5π/4'], [3/2, '3π/2'], [7/4, '7π/4'],
      ];
      for (const [f, label] of fracs) {
        if (Math.abs(frac - f) < 0.01) return label;
      }
      return `${(r).toFixed(2)}`;
    }

    function getEquivalence() {
      const phaseNorm = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      if (Math.abs(phaseNorm) < 0.01 || Math.abs(phaseNorm - 2 * Math.PI) < 0.01) return '= I (full circle!)';
      if (Math.abs(phaseNorm - Math.PI) < 0.01) return '= Z';
      if (Math.abs(phaseNorm - Math.PI / 2) < 0.01) return '= S';
      if (Math.abs(phaseNorm - Math.PI / 4) < 0.01) return '= T';
      if (Math.abs(phaseNorm - 3 * Math.PI / 2) < 0.01) return '= S†';
      if (Math.abs(phaseNorm - 7 * Math.PI / 4) < 0.01) return '= T†';
      return '';
    }

    function updateDisplay() {
      const pNorm = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const cosP = Math.cos(pNorm);
      const sinP = Math.sin(pNorm);
      const phaseStr = formatPhaseAngle(phase);

      if (Math.abs(pNorm) < 0.01 || Math.abs(pNorm - 2 * Math.PI) < 0.01) {
        stateDiv.textContent = '|ψ⟩ = (1/√2)(|0⟩ + |1⟩) = |+⟩';
      } else {
        const reCoeff = Math.round(cosP * 100) / 100;
        const imCoeff = Math.round(sinP * 100) / 100;
        let coeffStr;
        if (Math.abs(imCoeff) < 0.005) coeffStr = `${reCoeff}`;
        else if (Math.abs(reCoeff) < 0.005) coeffStr = `${imCoeff}i`;
        else coeffStr = `${reCoeff}${imCoeff >= 0 ? '+' : ''}${imCoeff}i`;
        stateDiv.textContent = `|ψ⟩ = (1/√2)(|0⟩ + ${coeffStr}|1⟩)   φ = ${phaseStr}`;
      }

      if (gateHistory.length === 0) {
        formulaDiv.textContent = 'Apply phase gates to build up phase...';
      } else {
        const seq = gateHistory.join(' + ');
        const total = formatPhaseAngle(phase);
        const equiv = getEquivalence();
        formulaDiv.textContent = `${seq} = ${total} ${equiv}`;
      }

      counterDiv.textContent = `Gates applied: ${gatesApplied}`;
      if (gatesApplied >= 6) discoveryDiv.style.opacity = '1';
    }

    updateDisplay();

    return () => { clock.destroy(); };
  },
};


// ── Chapter 14: Gate Wiring Lab ──────────────────────────────────────────────

/**
 * Ch 14 — Gate Wiring Lab (sandbox)
 *
 * Build multi-qubit gates from simpler ones and verify equivalence
 * by testing all basis state inputs. Puzzles map to Ch 14 lesson content:
 * CZ decomposition, SWAP from 3 CNOTs, CZ symmetry.
 */
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


// ── Chapter 15: Teleportation Simulator ──────────────────────────────────────

/**
 * Ch 15 — Teleportation Simulator (sandbox)
 *
 * Step through the quantum teleportation protocol: Alice picks a state,
 * shares a Bell pair with Bob, applies CNOT + H, measures, sends classical
 * bits, and Bob applies the right correction gate. Full 3-qubit state
 * vector shown at every step.
 */

function fmtKet3Q(state) {
  const labels = ['|000⟩','|001⟩','|010⟩','|011⟩','|100⟩','|101⟩','|110⟩','|111⟩'];
  const terms = [];
  for (let i = 0; i < 8; i++) {
    const amp = state[i];
    if (cabs(amp) < 0.005) continue;
    const c = fmtKetCoeff(amp.re, amp.im);
    terms.push({ c, label: labels[i] });
  }
  if (terms.length === 0) return '0';
  let s = '';
  terms.forEach((t, idx) => {
    if (idx > 0) {
      if (t.c.startsWith('\u2212') || t.c.startsWith('-')) {
        s += ' \u2212 ' + (t.c.startsWith('\u2212') ? t.c.slice(1) : t.c.slice(1));
      } else {
        s += ' + ' + t.c;
      }
    } else {
      s += t.c;
    }
    s += t.label;
  });
  return s;
}

const experiment15 = {
  title: 'Teleportation Simulator',
  subtitle: 'Beam a qubit from Alice to Bob',
  icon: '📡',

  mount(container, { chapterColor, chapterColorDk, onComplete }) {
    let completed = false;
    let teleportations = 0;

    container.style.flexDirection = 'column';

    // ─ Alice's state (theta slider) ─
    let aliceTheta = Math.PI / 3; // default interesting state
    let originalState = blochToState(aliceTheta, 0);

    // ─ Header ─
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = "text-align:center;font-family:'Fira Code',monospace;font-weight:700;font-size:15px;color:var(--text);margin-bottom:4px;";
    titleDiv.textContent = 'Quantum Teleportation Protocol';

    // ─ Alice / Bob panels ─
    const panelsRow = document.createElement('div');
    panelsRow.style.cssText = 'display:flex;gap:8px;width:100%;';

    function makePanel(label) {
      const panel = document.createElement('div');
      panel.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;';
      const lbl = document.createElement('div');
      lbl.style.cssText = "font-family:'Fira Code',monospace;font-weight:700;font-size:13px;color:var(--text);";
      lbl.textContent = label;
      panel.appendChild(lbl);
      const wrap = document.createElement('div');
      wrap.className = 'experiment-canvas-wrap';
      wrap.style.cssText += 'min-height:130px;max-height:160px;width:100%;';
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas);
      panel.appendChild(wrap);
      return { panel, canvas, wrap };
    }

    const alice = makePanel('ALICE');
    const bob = makePanel('BOB');

    // Classical channel between them
    const channelDiv = document.createElement('div');
    channelDiv.style.cssText = `
      display:flex;align-items:center;justify-content:center;flex-direction:column;
      width:40px;align-self:center;position:relative;
    `;
    const channelLine = document.createElement('div');
    channelLine.style.cssText = `
      width:2px;height:80px;background:var(--border);position:relative;
    `;
    const channelBits = document.createElement('div');
    channelBits.style.cssText = `
      font-family:'Fira Code',monospace;font-size:16px;font-weight:700;
      color:${chapterColor};opacity:0;transition:opacity 0.3s;
      text-align:center;margin-top:4px;
    `;
    channelDiv.append(channelLine, channelBits);

    panelsRow.append(alice.panel, channelDiv, bob.panel);

    const aliceBloch = new BlochSphere(alice.canvas, { color: chapterColor, showLabels: true });
    const bobBloch = new BlochSphere(bob.canvas, { color: chapterColor, showLabels: true });
    aliceBloch.setState(aliceTheta, 0);
    bobBloch.setState(0, 0);

    // ─ State slider ─
    const sliderRow = document.createElement('div');
    sliderRow.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;';
    const sliderLabel = document.createElement('div');
    sliderLabel.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);min-width:50px;";
    sliderLabel.textContent = 'Alice |ψ⟩:';
    const slider = document.createElement('input');
    slider.type = 'range'; slider.min = '0'; slider.max = '314';
    slider.value = String(Math.round(aliceTheta * 100));
    slider.style.cssText = 'flex:1;accent-color:' + chapterColor;
    const randomBtn = makeBtn('Random', 'btn experiment-block-btn');
    randomBtn.style.cssText += 'padding:6px 10px;font-size:12px;';
    sliderRow.append(sliderLabel, slider, randomBtn);

    // ─ State vector display ─
    const stateDiv = document.createElement('div');
    stateDiv.style.cssText = `
      font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted);
      text-align:center;min-height:18px;word-break:break-all;line-height:1.5;
      max-height:40px;overflow-y:auto;
    `;

    // ─ Protocol log ─
    const logDiv = document.createElement('div');
    logDiv.style.cssText = `
      font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);
      min-height:60px;max-height:100px;overflow-y:auto;line-height:1.6;
      background:var(--surface);border-radius:var(--radius);padding:8px;width:100%;
    `;

    // ─ Bob's correction buttons (hidden until step 5) ─
    const correctionDiv = document.createElement('div');
    correctionDiv.style.cssText = 'display:none;flex-direction:column;align-items:center;gap:6px;width:100%;';
    const corrLabel = document.createElement('div');
    corrLabel.style.cssText = "font-family:'Fira Code',monospace;font-size:13px;color:var(--text);font-weight:700;";
    const corrBtnsRow = document.createElement('div');
    corrBtnsRow.style.cssText = 'display:flex;gap:6px;justify-content:center;flex-wrap:wrap;';
    correctionDiv.append(corrLabel, corrBtnsRow);

    // ─ Action row ─
    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;gap:8px;width:100%;';
    const nextBtn = makeBtn('▶ Next Step', 'btn');
    nextBtn.style.cssText += `flex:2;background:${chapterColor};color:#fff;border:none;`;
    const newStateBtn = makeBtn('New State', 'btn experiment-block-btn');
    newStateBtn.style.cssText += 'flex:1;';
    actionRow.append(nextBtn, newStateBtn);

    // ─ Counter ─
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = "font-size:13px;color:var(--text-muted);text-align:center;font-family:'Fira Code',monospace;";
    counterDiv.textContent = 'Teleportations: 0';

    // ─ Discovery prompt ─
    const discoveryDiv = document.createElement('div');
    discoveryDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);text-align:center;opacity:0;transition:opacity 0.5s;line-height:1.5;";
    discoveryDiv.textContent = "💡 Notice: Alice's qubit is destroyed after measurement — the state moved to Bob without copying!";

    container.append(titleDiv, panelsRow, sliderRow, stateDiv, logDiv, correctionDiv, actionRow, discoveryDiv, counterDiv);

    // ─ Protocol state ─
    let sim = null;
    let protocolStep = 0; // 0=ready, 1=bell, 2=cnot, 3=H, 4=measure, 5=correct
    let measureResult = -1;
    let sliderEnabled = true;

    function updateAliceState() {
      aliceTheta = parseInt(slider.value) / 100;
      originalState = blochToState(aliceTheta, 0);
      aliceBloch.setState(aliceTheta, 0);
      stateDiv.textContent = `|ψ⟩ = ${(+Math.cos(aliceTheta / 2).toFixed(3))}|0⟩ + ${(+Math.sin(aliceTheta / 2).toFixed(3))}|1⟩`;
    }

    function addLog(text, isCurrent) {
      const line = document.createElement('div');
      line.style.cssText = isCurrent ? `color:${chapterColor};font-weight:700;` : '';
      line.textContent = (isCurrent ? '→ ' : '✓ ') + text;
      logDiv.appendChild(line);
      logDiv.scrollTop = logDiv.scrollHeight;
    }

    function resetProtocol() {
      protocolStep = 0;
      measureResult = -1;
      sim = null;
      sliderEnabled = true;
      slider.disabled = false;
      logDiv.textContent = '';
      correctionDiv.style.display = 'none';
      channelBits.style.opacity = '0';
      channelBits.textContent = '';
      nextBtn.textContent = '▶ Start Protocol';
      nextBtn.disabled = false;
      alice.wrap.style.opacity = '1';
      updateAliceState();
      bobBloch.setState(0, 0);
      stateDiv.textContent = `|ψ⟩ = ${(+Math.cos(aliceTheta / 2).toFixed(3))}|0⟩ + ${(+Math.sin(aliceTheta / 2).toFixed(3))}|1⟩`;
    }

    function showStateVector() {
      if (sim) stateDiv.textContent = fmtKet3Q(sim.getState());
    }

    slider.addEventListener('input', () => { if (sliderEnabled) updateAliceState(); });
    randomBtn.addEventListener('click', () => {
      if (!sliderEnabled) return;
      slider.value = String(rnd(10, 304));
      updateAliceState();
    });

    async function doStep() {
      if (protocolStep === 0) {
        // Step 1: Share Bell pair
        sliderEnabled = false;
        slider.disabled = true;
        sim = new CircuitSimulator(3);
        // qubit 0 = Alice's ψ, qubit 1 = Alice's Bell half, qubit 2 = Bob's Bell half
        // Set initial state: |ψ⟩ ⊗ |00⟩
        const initState = Array.from({ length: 8 }, () => ({ re: 0, im: 0 }));
        const cosH = Math.cos(aliceTheta / 2);
        const sinH = Math.sin(aliceTheta / 2);
        // |ψ⟩|00⟩ = cosH|000⟩ + sinH|100⟩
        initState[0] = { re: cosH, im: 0 }; // |000⟩
        initState[4] = { re: sinH, im: 0 }; // |100⟩
        sim.setState(initState);
        // Create Bell pair between qubits 1 and 2
        sim.applyGate('H', 1);
        sim.applyGate('X', 2, 1); // CNOT: control=1, target=2
        addLog('Bell pair |Φ+⟩ shared between Alice & Bob', false);
        showStateVector();
        channelLine.style.background = chapterColor;
        channelLine.style.boxShadow = `0 0 8px ${chapterColor}`;
        protocolStep = 1;
        nextBtn.textContent = '▶ Alice: CNOT';
      } else if (protocolStep === 1) {
        // Step 2: Alice's CNOT (control=ψ qubit 0, target=Bell qubit 1)
        sim.applyGate('X', 1, 0);
        addLog("Alice applied CNOT (ψ→Bell)", false);
        showStateVector();
        protocolStep = 2;
        nextBtn.textContent = '▶ Alice: Hadamard';
      } else if (protocolStep === 2) {
        // Step 3: Alice's Hadamard on qubit 0
        sim.applyGate('H', 0);
        addLog("Alice applied Hadamard on ψ-qubit", false);
        showStateVector();
        protocolStep = 3;
        nextBtn.textContent = '▶ Alice: Measure';
      } else if (protocolStep === 3) {
        // Step 4: Alice measures qubits 0 and 1
        const bit0 = sim.measureQubit(0);
        const bit1 = sim.measureQubit(1);
        measureResult = bit0 * 2 + bit1;
        const bits = `${bit0}${bit1}`;
        addLog(`Alice measured: ${bits}`, false);
        showStateVector();

        // Gray out Alice's sphere (qubit destroyed)
        alice.wrap.style.opacity = '0.3';

        // Animate classical bits across channel
        channelBits.textContent = bits;
        channelBits.style.opacity = '1';

        // Show Bob's current (uncorrected) state on Bloch sphere
        const st = sim.getState();
        // Bob's qubit is qubit 2. Extract his reduced state.
        // After measuring qubits 0,1, only two amplitudes are nonzero
        let bobAlpha = { re: 0, im: 0 };
        let bobBeta = { re: 0, im: 0 };
        for (let i = 0; i < 8; i++) {
          if (cabs(st[i]) < 1e-10) continue;
          const q2bit = i & 1;
          if (q2bit === 0) bobAlpha = st[i];
          else bobBeta = st[i];
        }
        const [nAlpha, nBeta] = normalizeGlobalPhase(bobAlpha, bobBeta);
        const bCoords = stateToBloch(nAlpha, nBeta);
        await bobBloch.animateState(bCoords.theta, bCoords.phi, 400);

        protocolStep = 4;
        nextBtn.style.display = 'none';

        // Show correction buttons
        const corrections = ['I (none)', 'X', 'Z', 'ZX'];
        const correctIdx = measureResult; // 00→I, 01→X, 10→Z, 11→ZX
        corrLabel.textContent = `Bob received bits "${bits}" — pick correction gate:`;
        corrBtnsRow.textContent = '';
        corrections.forEach((label, idx) => {
          const btn = makeBtn(label, 'btn experiment-block-btn');
          btn.style.cssText += `min-width:60px;padding:8px 12px;font-size:13px;`;
          btn.addEventListener('click', async () => {
            if (idx === correctIdx) {
              // Apply correct correction
              if (idx === 1 || idx === 3) sim.applyGate('X', 2);
              if (idx === 2 || idx === 3) sim.applyGate('Z', 2);

              // Verify Bob's state matches original
              const finalSt = sim.getState();
              let fAlpha = { re: 0, im: 0 }, fBeta = { re: 0, im: 0 };
              for (let i = 0; i < 8; i++) {
                if (cabs(finalSt[i]) < 1e-10) continue;
                if ((i & 1) === 0) fAlpha = finalSt[i]; else fBeta = finalSt[i];
              }
              const [fnA, fnB] = normalizeGlobalPhase(fAlpha, fBeta);
              const fCoords = stateToBloch(fnA, fnB);
              await bobBloch.animateState(fCoords.theta, fCoords.phi, 500);

              addLog(`Bob applied ${label} — state teleported!`, true);
              showToast(container, 'Teleportation successful!', 'success');
              teleportations++;
              counterDiv.textContent = `Teleportations: ${teleportations}`;
              if (teleportations >= 2) discoveryDiv.style.opacity = '1';

              correctionDiv.style.display = 'none';
              nextBtn.style.display = '';
              nextBtn.textContent = '🔄 New State';
              nextBtn.disabled = false;
              protocolStep = 5;

              if (!completed) { completed = true; onComplete({ teleportations }); }
            } else {
              showToast(container, 'Wrong gate — try another!', 'warning');
            }
          });
          corrBtnsRow.appendChild(btn);
        });
        correctionDiv.style.display = 'flex';
      } else if (protocolStep === 5) {
        resetProtocol();
      }
    }

    nextBtn.addEventListener('click', doStep);
    newStateBtn.addEventListener('click', resetProtocol);

    resetProtocol();

    return () => { aliceBloch.destroy(); bobBloch.destroy(); };
  },
};


// ── Chapter 16: Oracle Detective ─────────────────────────────────────────────

/**
 * Ch 16 — Oracle Detective (sandbox)
 *
 * A mystery function is either constant or balanced. Classically, you query
 * inputs one by one. Quantum (Deutsch-Jozsa) solves it in one shot.
 * Scale from 1-bit to 3-bit and watch the classical query count grow
 * while quantum stays at 1.
 */

const experiment16 = {
  title: 'Oracle Detective',
  subtitle: 'Constant or balanced? One query to know.',
  icon: '🔍',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let oraclesExplored = 0;
    let totalClassical = 0;
    let totalQuantum = 0;

    container.style.flexDirection = 'column';

    // ─ State ─
    let nBits = 1;
    let oracle = null; // { type: 'constant'|'balanced', outputs: Map<string, 0|1> }
    let queriedInputs = new Set();
    let classicalQueriesThisRound = 0;
    let oracleSolved = false;

    function generateOracle(n) {
      const numInputs = 1 << n;
      const inputs = [];
      for (let i = 0; i < numInputs; i++) inputs.push(i.toString(2).padStart(n, '0'));

      const isConstant = Math.random() < 0.5;
      const outputs = new Map();

      if (isConstant) {
        const val = Math.random() < 0.5 ? 0 : 1;
        inputs.forEach(inp => outputs.set(inp, val));
      } else {
        // balanced: exactly half 0, half 1
        const half = numInputs / 2;
        const shuffled = shuffle(inputs);
        shuffled.forEach((inp, idx) => outputs.set(inp, idx < half ? 0 : 1));
      }

      return { type: isConstant ? 'constant' : 'balanced', outputs, inputs };
    }

    // ─ Title ─
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = "text-align:center;font-family:'Fira Code',monospace;font-weight:700;font-size:15px;color:var(--text);margin-bottom:2px;";
    titleDiv.textContent = 'Mystery function f(x) → ?';

    const subtitleDiv = document.createElement('div');
    subtitleDiv.style.cssText = "text-align:center;font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);margin-bottom:6px;";
    subtitleDiv.textContent = 'Is it CONSTANT or BALANCED?';

    // ─ Scale selector ─
    const scaleRow = document.createElement('div');
    scaleRow.style.cssText = 'display:flex;gap:6px;justify-content:center;margin-bottom:6px;';
    const scaleBtns = {};
    [1, 2, 3].forEach(n => {
      const btn = makeBtn(`${n}-bit`, 'btn experiment-block-btn');
      btn.style.cssText += 'padding:6px 12px;font-size:12px;';
      btn.addEventListener('click', () => {
        nBits = n;
        newOracle();
      });
      scaleRow.appendChild(btn);
      scaleBtns[n] = btn;
    });

    // ─ Side-by-side panels ─
    const panelsRow = document.createElement('div');
    panelsRow.style.cssText = 'display:flex;gap:8px;width:100%;';

    // Classical panel
    const classicalPanel = document.createElement('div');
    classicalPanel.style.cssText = `
      flex:1;display:flex;flex-direction:column;gap:4px;
      background:var(--surface);border-radius:var(--radius);padding:8px;
    `;
    const classicalTitle = document.createElement('div');
    classicalTitle.style.cssText = "font-family:'Fira Code',monospace;font-weight:700;font-size:13px;color:var(--text);text-align:center;";
    classicalTitle.textContent = 'CLASSICAL';

    const queryTable = document.createElement('div');
    queryTable.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);min-height:50px;max-height:100px;overflow-y:auto;";

    const queryBtnsDiv = document.createElement('div');
    queryBtnsDiv.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:center;';

    const classicalCountDiv = document.createElement('div');
    classicalCountDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted);text-align:center;";

    const guessRow = document.createElement('div');
    guessRow.style.cssText = 'display:flex;gap:4px;justify-content:center;margin-top:4px;';
    const guessConstBtn = makeBtn('Constant', 'btn experiment-block-btn');
    guessConstBtn.style.cssText += 'padding:6px 10px;font-size:11px;';
    const guessBalBtn = makeBtn('Balanced', 'btn experiment-block-btn');
    guessBalBtn.style.cssText += 'padding:6px 10px;font-size:11px;';
    guessRow.append(guessConstBtn, guessBalBtn);

    const classicalResultDiv = document.createElement('div');
    classicalResultDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;text-align:center;min-height:18px;font-weight:700;";

    classicalPanel.append(classicalTitle, queryTable, queryBtnsDiv, classicalCountDiv, guessRow, classicalResultDiv);

    // Quantum panel
    const quantumPanel = document.createElement('div');
    quantumPanel.style.cssText = `
      flex:1;display:flex;flex-direction:column;gap:4px;align-items:center;
      background:var(--surface);border-radius:var(--radius);padding:8px;
    `;
    const quantumTitle = document.createElement('div');
    quantumTitle.style.cssText = "font-family:'Fira Code',monospace;font-weight:700;font-size:13px;color:var(--text);text-align:center;";
    quantumTitle.textContent = 'QUANTUM';

    const circuitDiv = document.createElement('div');
    circuitDiv.style.cssText = `
      font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted);
      text-align:center;line-height:1.6;min-height:40px;
    `;

    const djBtn = makeBtn('Run Deutsch-Jozsa', 'btn');
    djBtn.style.cssText += `background:${chapterColor};color:#fff;border:none;padding:10px 16px;`;

    const quantumResultDiv = document.createElement('div');
    quantumResultDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;text-align:center;min-height:18px;font-weight:700;";

    const quantumCountDiv = document.createElement('div');
    quantumCountDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted);text-align:center;";

    quantumPanel.append(quantumTitle, circuitDiv, djBtn, quantumResultDiv, quantumCountDiv);

    panelsRow.append(classicalPanel, quantumPanel);

    // ─ Scoreboard ─
    const scoreDiv = document.createElement('div');
    scoreDiv.style.cssText = `
      font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);
      text-align:center;background:var(--surface);border-radius:var(--radius);
      padding:8px;width:100%;line-height:1.8;
    `;

    // ─ Action row ─
    const newOracleBtn = makeBtn('New Oracle', 'btn experiment-block-btn');
    newOracleBtn.style.cssText += 'width:100%;';

    // ─ Counter ─
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = "font-size:13px;color:var(--text-muted);text-align:center;font-family:'Fira Code',monospace;";

    container.append(titleDiv, subtitleDiv, scaleRow, panelsRow, scoreDiv, newOracleBtn, counterDiv);

    function updateScore() {
      scoreDiv.textContent = `Classical total queries: ${totalClassical}  |  Quantum total queries: ${totalQuantum}`;
    }

    function renderCircuit() {
      const hStr = nBits === 1 ? 'H' : `H⊗${nBits}`;
      circuitDiv.textContent = `|0⟩⊗${nBits}|1⟩ → ${hStr}⊗H → Uf → ${hStr}⊗I → Measure`;
    }

    function newOracle() {
      oracle = generateOracle(nBits);
      queriedInputs = new Set();
      classicalQueriesThisRound = 0;
      oracleSolved = false;

      // Highlight active scale button
      Object.entries(scaleBtns).forEach(([n, btn]) => {
        btn.style.boxShadow = parseInt(n) === nBits ? `0 0 0 3px ${chapterColor}` : '';
      });

      // Reset classical panel
      queryTable.textContent = '';
      classicalCountDiv.textContent = 'Queries: 0';
      classicalResultDiv.textContent = '';
      classicalResultDiv.style.color = '';
      guessConstBtn.disabled = false;
      guessBalBtn.disabled = false;

      // Build query buttons
      queryBtnsDiv.textContent = '';
      oracle.inputs.forEach(inp => {
        const btn = makeBtn(inp, 'btn experiment-block-btn');
        btn.style.cssText += 'padding:4px 8px;font-size:11px;min-width:36px;';
        btn.addEventListener('click', () => {
          if (oracleSolved || queriedInputs.has(inp)) return;
          queriedInputs.add(inp);
          classicalQueriesThisRound++;
          totalClassical++;
          btn.disabled = true;
          btn.style.opacity = '0.5';

          const row = document.createElement('div');
          row.textContent = `f(${inp}) = ${oracle.outputs.get(inp)}`;
          queryTable.appendChild(row);
          queryTable.scrollTop = queryTable.scrollHeight;

          classicalCountDiv.textContent = `Queries: ${classicalQueriesThisRound}`;

          // Check if certainty is now possible
          const needed = (1 << (nBits - 1)) + 1;
          if (classicalQueriesThisRound >= needed) {
            classicalCountDiv.textContent = `Queries: ${classicalQueriesThisRound} (certainty possible!)`;
            classicalCountDiv.style.color = chapterColor;
          }

          updateScore();
        });
        queryBtnsDiv.appendChild(btn);
      });

      // Reset quantum panel
      quantumResultDiv.textContent = '';
      quantumCountDiv.textContent = '';
      djBtn.disabled = false;
      renderCircuit();

      updateScore();
      counterDiv.textContent = `Oracles explored: ${oraclesExplored}`;
    }

    function handleGuess(guess) {
      if (oracleSolved) return;
      if (guess === oracle.type) {
        classicalResultDiv.textContent = `✓ Correct! (${classicalQueriesThisRound} queries)`;
        classicalResultDiv.style.color = '#58CC02';
        oracleSolved = true;
        guessConstBtn.disabled = true;
        guessBalBtn.disabled = true;
        oraclesExplored++;
        counterDiv.textContent = `Oracles explored: ${oraclesExplored}`;
        if (!completed) { completed = true; onComplete({ oraclesExplored }); }
      } else {
        classicalResultDiv.textContent = '✗ Wrong — keep querying!';
        classicalResultDiv.style.color = '#FF4B4B';
        setTimeout(() => { classicalResultDiv.textContent = ''; }, 1500);
      }
    }

    guessConstBtn.addEventListener('click', () => handleGuess('constant'));
    guessBalBtn.addEventListener('click', () => handleGuess('balanced'));

    djBtn.addEventListener('click', () => {
      if (djBtn.disabled) return;
      djBtn.disabled = true;
      totalQuantum++;

      // DJ always gets it right in 1 query
      const result = oracle.type;
      const allZeros = '0'.repeat(nBits);
      const measured = result === 'constant' ? allZeros : '1'.padEnd(nBits, '0');
      quantumResultDiv.textContent = `Measured |${measured}⟩ → ${result.toUpperCase()}`;
      quantumResultDiv.style.color = '#58CC02';
      quantumCountDiv.textContent = '1 query used';

      if (!oracleSolved) {
        oracleSolved = true;
        oraclesExplored++;
        counterDiv.textContent = `Oracles explored: ${oraclesExplored}`;
        if (!completed) { completed = true; onComplete({ oraclesExplored }); }
      }

      updateScore();
    });

    newOracleBtn.addEventListener('click', newOracle);

    newOracle();

    return () => {};
  },
};


// ── Chapter 17: Quantum Search Race ──────────────────────────────────────────

/**
 * Ch 17 — Quantum Search Race (sandbox)
 *
 * Visual side-by-side race: classical sequential search vs Grover's algorithm.
 * Step through oracle + diffusion manually, or race them head-to-head.
 * Watch amplitude amplification happen in real time.
 */

const experiment17 = {
  title: 'Quantum Search Race',
  subtitle: 'Watch amplitude amplification crush classical search',
  icon: '⚡',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let searches = 0;

    container.style.flexDirection = 'column';

    // ─ State ─
    let N = 4;
    let numQubits = 2;
    let markedIdx = 0;
    let amplitudes = [];
    let groverIteration = 0;
    let optimalIter = 1;
    let classicalChecked = 0;
    let classicalFound = false;
    let groverDone = false;
    let stepPhase = 'oracle'; // 'oracle', 'diffusion', 'measure'
    let raceTimer = null;

    function initSearch() {
      N = 1 << numQubits;
      markedIdx = Math.floor(Math.random() * N);
      amplitudes = Array(N).fill(1 / Math.sqrt(N));
      groverIteration = 0;
      optimalIter = Math.max(1, Math.floor(Math.PI / 4 * Math.sqrt(N)));
      classicalChecked = 0;
      classicalFound = false;
      groverDone = false;
      stepPhase = 'oracle';
      if (raceTimer) { clearInterval(raceTimer); raceTimer = null; }
    }

    // ─ Size selector ─
    const sizeRow = document.createElement('div');
    sizeRow.style.cssText = 'display:flex;gap:6px;justify-content:center;margin-bottom:4px;';
    const sizeBtns = {};
    [{ n: 2, label: '4' }, { n: 3, label: '8' }, { n: 4, label: '16' }].forEach(({ n, label }) => {
      const btn = makeBtn(`N=${label}`, 'btn experiment-block-btn');
      btn.style.cssText += 'padding:6px 12px;font-size:12px;';
      btn.addEventListener('click', () => {
        numQubits = n;
        newSearch();
      });
      sizeRow.appendChild(btn);
      sizeBtns[n] = btn;
    });

    // ─ Info row ─
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted);text-align:center;margin-bottom:4px;line-height:1.6;";

    // ─ Side-by-side panels ─
    const panelsRow = document.createElement('div');
    panelsRow.style.cssText = 'display:flex;gap:8px;width:100%;';

    // Classical panel
    const classicalPanel = document.createElement('div');
    classicalPanel.style.cssText = `
      flex:1;display:flex;flex-direction:column;gap:4px;
      background:var(--surface);border-radius:var(--radius);padding:8px;
    `;
    const classicalTitle = document.createElement('div');
    classicalTitle.style.cssText = "font-family:'Fira Code',monospace;font-weight:700;font-size:12px;color:var(--text);text-align:center;";
    classicalTitle.textContent = 'CLASSICAL';
    const classicalGrid = document.createElement('div');
    classicalGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:3px;justify-content:center;';
    const classicalStatus = document.createElement('div');
    classicalStatus.style.cssText = "font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted);text-align:center;min-height:18px;";
    classicalPanel.append(classicalTitle, classicalGrid, classicalStatus);

    // Grover panel
    const groverPanel = document.createElement('div');
    groverPanel.style.cssText = `
      flex:1.2;display:flex;flex-direction:column;gap:4px;
      background:var(--surface);border-radius:var(--radius);padding:8px;
    `;
    const groverTitle = document.createElement('div');
    groverTitle.style.cssText = "font-family:'Fira Code',monospace;font-weight:700;font-size:12px;color:var(--text);text-align:center;";
    groverTitle.textContent = "GROVER'S";
    const barsContainer = document.createElement('div');
    barsContainer.style.cssText = 'position:relative;min-height:120px;display:flex;align-items:flex-end;gap:1px;justify-content:center;';
    const groverStatus = document.createElement('div');
    groverStatus.style.cssText = "font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted);text-align:center;min-height:18px;";
    const meanDiv = document.createElement('div');
    meanDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:10px;color:var(--text-muted);text-align:center;min-height:14px;";

    groverPanel.append(groverTitle, barsContainer, meanDiv, groverStatus);

    panelsRow.append(classicalPanel, groverPanel);

    // ─ Step-by-step controls ─
    const stepRow = document.createElement('div');
    stepRow.style.cssText = 'display:flex;gap:6px;justify-content:center;flex-wrap:wrap;';

    const oracleBtn = makeBtn('Oracle', 'btn experiment-block-btn');
    oracleBtn.style.cssText += 'padding:8px 12px;font-size:12px;';
    const diffusionBtn = makeBtn('Diffusion', 'btn experiment-block-btn');
    diffusionBtn.style.cssText += 'padding:8px 12px;font-size:12px;';
    const measureBtn = makeBtn('Measure', 'btn experiment-block-btn');
    measureBtn.style.cssText += 'padding:8px 12px;font-size:12px;';

    stepRow.append(oracleBtn, diffusionBtn, measureBtn);

    // ─ Action row ─
    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;gap:8px;width:100%;';
    const raceBtn = makeBtn('▶ Race!', 'btn');
    raceBtn.style.cssText += `flex:2;background:${chapterColor};color:#fff;border:none;`;
    const newSearchBtn = makeBtn('New Search', 'btn experiment-block-btn');
    newSearchBtn.style.cssText += 'flex:1;';
    actionRow.append(raceBtn, newSearchBtn);

    // ─ Formula ─
    const formulaDiv = document.createElement('div');
    formulaDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted);text-align:center;line-height:1.6;min-height:28px;";

    // ─ Counter ─
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = "font-size:13px;color:var(--text-muted);text-align:center;font-family:'Fira Code',monospace;";

    // ─ Discovery ─
    const discoveryDiv = document.createElement('div');
    discoveryDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);text-align:center;opacity:0;transition:opacity 0.5s;line-height:1.5;";
    discoveryDiv.textContent = "💡 Try N=16: classical checks ~8 items on average, Grover needs only ~3 iterations!";

    container.append(sizeRow, infoDiv, panelsRow, stepRow, actionRow, formulaDiv, discoveryDiv, counterDiv);

    function ketLabel(i) {
      return '|' + i.toString(2).padStart(numQubits, '0') + '⟩';
    }

    function renderClassicalGrid() {
      classicalGrid.textContent = '';
      const cellSize = N <= 8 ? 32 : 24;
      for (let i = 0; i < N; i++) {
        const cell = document.createElement('div');
        cell.style.cssText = `
          width:${cellSize}px;height:${cellSize}px;border-radius:4px;
          display:flex;align-items:center;justify-content:center;
          font-family:'Fira Code',monospace;font-size:${N <= 8 ? 10 : 8}px;
          font-weight:700;border:2px solid var(--border);color:var(--text-muted);
          transition:all 0.2s;
        `;
        cell.textContent = ketLabel(i);
        cell.dataset.idx = i;
        classicalGrid.appendChild(cell);
      }
    }

    function updateClassicalCell(idx, state) {
      const cells = classicalGrid.children;
      if (idx >= cells.length) return;
      const cell = cells[idx];
      if (state === 'checking') {
        cell.style.borderColor = '#FFB020';
        cell.style.background = 'rgba(255,176,32,0.15)';
        cell.style.color = '#FFB020';
      } else if (state === 'found') {
        cell.style.borderColor = '#58CC02';
        cell.style.background = 'rgba(88,204,2,0.2)';
        cell.style.color = '#58CC02';
      } else if (state === 'checked') {
        cell.style.borderColor = 'var(--border)';
        cell.style.background = 'rgba(255,255,255,0.03)';
        cell.style.color = 'var(--text-muted)';
        cell.style.opacity = '0.4';
      }
    }

    function renderBars() {
      barsContainer.textContent = '';
      const maxBarH = 100;
      const barW = Math.max(12, Math.floor((barsContainer.offsetWidth || 200) / N) - 2);

      // Zero line
      const zeroLine = document.createElement('div');
      zeroLine.style.cssText = `
        position:absolute;left:0;right:0;top:50%;height:1px;
        background:var(--border);z-index:0;
      `;
      barsContainer.appendChild(zeroLine);

      // Mean line
      const mean = amplitudes.reduce((s, a) => s + a, 0) / N;
      const meanPx = mean * maxBarH;
      const meanLine = document.createElement('div');
      meanLine.style.cssText = `
        position:absolute;left:0;right:0;bottom:${50 + meanPx}%;height:1px;
        border-top:1px dashed ${chapterColor};opacity:0.5;z-index:1;
      `;
      barsContainer.appendChild(meanLine);

      meanDiv.textContent = `Mean: ${mean.toFixed(3)} | Formula: new = 2×mean − old`;

      for (let i = 0; i < N; i++) {
        const col = document.createElement('div');
        col.style.cssText = `
          display:flex;flex-direction:column;align-items:center;z-index:2;
          width:${barW}px;position:relative;
        `;

        const amp = amplitudes[i];
        const barH = Math.abs(amp) * maxBarH;
        const isNeg = amp < 0;
        const isMarked = i === markedIdx;

        const barWrap = document.createElement('div');
        barWrap.style.cssText = `
          width:100%;height:${maxBarH}px;position:relative;
          display:flex;flex-direction:column;justify-content:center;
        `;

        const bar = document.createElement('div');
        const color = isMarked ? chapterColor : 'var(--text-muted)';
        if (isNeg) {
          bar.style.cssText = `
            width:100%;height:${barH}px;background:${color};
            border-radius:0 0 2px 2px;opacity:${isMarked ? 1 : 0.5};
            position:absolute;top:50%;transition:height 0.3s;
          `;
        } else {
          bar.style.cssText = `
            width:100%;height:${barH}px;background:${color};
            border-radius:2px 2px 0 0;opacity:${isMarked ? 1 : 0.5};
            position:absolute;bottom:50%;transition:height 0.3s;
          `;
        }
        barWrap.appendChild(bar);

        const label = document.createElement('div');
        label.style.cssText = `
          font-family:'Fira Code',monospace;font-size:${N <= 8 ? 9 : 7}px;
          color:${isMarked ? chapterColor : 'var(--text-muted)'};text-align:center;
          font-weight:${isMarked ? 700 : 400};margin-top:2px;
        `;
        label.textContent = N <= 8 ? ketLabel(i) : i.toString();

        const ampLabel = document.createElement('div');
        ampLabel.style.cssText = `font-family:'Fira Code',monospace;font-size:8px;color:var(--text-muted);text-align:center;`;
        ampLabel.textContent = amp.toFixed(2);

        col.append(barWrap, label, ampLabel);
        barsContainer.appendChild(col);
      }
    }

    function applyOracle() {
      if (groverDone) return;
      amplitudes[markedIdx] *= -1;
      stepPhase = 'diffusion';
      renderBars();
      formulaDiv.textContent = `Oracle: flipped ${ketLabel(markedIdx)} amplitude → ${amplitudes[markedIdx].toFixed(3)}`;
      groverStatus.textContent = `Iteration ${groverIteration + 1} — oracle applied`;
      updateStepBtnStates();
    }

    function applyDiffusion() {
      if (groverDone || stepPhase !== 'diffusion') return;
      const mean = amplitudes.reduce((s, a) => s + a, 0) / N;
      amplitudes = amplitudes.map(a => 2 * mean - a);
      groverIteration++;
      stepPhase = 'oracle';
      renderBars();
      formulaDiv.textContent = `Diffusion: reflected about mean (${mean.toFixed(3)}). Marked item: ${amplitudes[markedIdx].toFixed(3)}`;
      groverStatus.textContent = `Iteration ${groverIteration}/${optimalIter}`;
      updateStepBtnStates();
    }

    function applyMeasure() {
      if (groverDone) return;
      // Sample based on probabilities
      const probs = amplitudes.map(a => a * a);
      const r = Math.random();
      let cum = 0, result = N - 1;
      for (let i = 0; i < N; i++) {
        cum += probs[i];
        if (r < cum) { result = i; break; }
      }
      groverDone = true;
      const found = result === markedIdx;
      groverStatus.textContent = `Measured ${ketLabel(result)} — ${found ? 'FOUND!' : 'miss'}`;
      groverStatus.style.color = found ? '#58CC02' : '#FF4B4B';
      formulaDiv.textContent = `P(${ketLabel(markedIdx)}) = ${(amplitudes[markedIdx] ** 2 * 100).toFixed(1)}% | Used ${groverIteration} iteration${groverIteration !== 1 ? 's' : ''}`;

      searches++;
      counterDiv.textContent = `Searches: ${searches}`;
      if (searches >= 3) discoveryDiv.style.opacity = '1';
      if (!completed) { completed = true; onComplete({ searches }); }
      updateStepBtnStates();
    }

    function updateStepBtnStates() {
      oracleBtn.disabled = groverDone || stepPhase !== 'oracle';
      diffusionBtn.disabled = groverDone || stepPhase !== 'diffusion';
      measureBtn.disabled = groverDone;
      oracleBtn.style.opacity = oracleBtn.disabled ? '0.4' : '1';
      diffusionBtn.style.opacity = diffusionBtn.disabled ? '0.4' : '1';
      measureBtn.style.opacity = measureBtn.disabled ? '0.4' : '1';
    }

    function newSearch() {
      initSearch();
      Object.entries(sizeBtns).forEach(([n, btn]) => {
        btn.style.boxShadow = parseInt(n) === numQubits ? `0 0 0 3px ${chapterColor}` : '';
      });
      infoDiv.textContent = `N = ${N} items | Optimal Grover iterations: ⌊(π/4)√${N}⌋ = ${optimalIter} | Classical expected: ~${Math.ceil(N / 2)}`;
      groverStatus.textContent = 'Equal superposition — ready';
      groverStatus.style.color = '';
      classicalStatus.textContent = `Checked: 0 / ${N}`;
      formulaDiv.textContent = '';
      renderClassicalGrid();
      renderBars();
      updateStepBtnStates();
      counterDiv.textContent = `Searches: ${searches}`;
    }

    oracleBtn.addEventListener('click', applyOracle);
    diffusionBtn.addEventListener('click', applyDiffusion);
    measureBtn.addEventListener('click', applyMeasure);

    raceBtn.addEventListener('click', () => {
      if (raceTimer || groverDone) {
        newSearch();
        return;
      }
      // Run Grover optimally
      for (let iter = 0; iter < optimalIter; iter++) {
        amplitudes[markedIdx] *= -1;
        const mean = amplitudes.reduce((s, a) => s + a, 0) / N;
        amplitudes = amplitudes.map(a => 2 * mean - a);
        groverIteration++;
      }
      renderBars();
      groverStatus.textContent = `${groverIteration} iterations done — measuring...`;

      // Race: animate classical search
      let classIdx = 0;
      // Random permutation for classical search order
      const searchOrder = shuffle(Array.from({ length: N }, (_, i) => i));

      raceTimer = setInterval(() => {
        if (classIdx > 0) {
          updateClassicalCell(searchOrder[classIdx - 1], searchOrder[classIdx - 1] === markedIdx ? 'found' : 'checked');
        }
        if (classicalFound || classIdx >= N) {
          clearInterval(raceTimer);
          raceTimer = null;
          if (!classicalFound) {
            classicalStatus.textContent = `Checked all ${N} — not great!`;
          }
          // Now measure Grover
          applyMeasure();
          return;
        }
        const checkingIdx = searchOrder[classIdx];
        updateClassicalCell(checkingIdx, 'checking');
        classicalChecked++;
        classicalStatus.textContent = `Checked: ${classicalChecked} / ${N}`;

        if (checkingIdx === markedIdx) {
          classicalFound = true;
          updateClassicalCell(checkingIdx, 'found');
          classicalStatus.textContent = `Found ${ketLabel(markedIdx)} after ${classicalChecked} checks`;
          classicalStatus.style.color = '#58CC02';
          clearInterval(raceTimer);
          raceTimer = null;
          applyMeasure();
          return;
        }
        classIdx++;
      }, N <= 4 ? 500 : N <= 8 ? 300 : 180);
    });

    newSearchBtn.addEventListener('click', newSearch);

    newSearch();

    return () => { if (raceTimer) clearInterval(raceTimer); };
  },
};


// ── Export ─────────────────────────────────────────────────────────────────────

export const EXPERIMENTS = {
  1: experiment1,
  2: experiment2,
  3: experiment3,
  4: experiment4,
  5: experiment5,
  6: experiment6,
  7: experiment7,
  8: experiment8,
  9: experiment9,
  10: experiment10,
  11: experiment11,
  12: experiment12,
  13: experiment13,
  14: experiment14,
  15: experiment15,
  16: experiment16,
  17: experiment17,
};
