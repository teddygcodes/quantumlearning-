import { rnd, shuffle, snap, makeLabel, makeBtn, fmtN, addLine } from './helpers.js';
import { GridCanvas, showToast } from '../experiment-ui.js?v=7';

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

export default experiment5;
