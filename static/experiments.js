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

import { GridCanvas, PhysicsBeam, BlochSphere, HistogramRenderer, showToast, animateValue } from './experiment-ui.js?v=3';

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
};
