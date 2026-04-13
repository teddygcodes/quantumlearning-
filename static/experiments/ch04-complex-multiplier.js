import { rnd, snap, makeLabel, makeBtn, fmtN, fmtComplex, fmtAngle, addLine } from './helpers.js';
import { GridCanvas, showToast } from '../experiment-ui.js?v=7';

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

export default experiment4;
