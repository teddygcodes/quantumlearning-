import { makeBtn, snap, stateToBloch, blochToState, SQRT2_INV } from './helpers.js';
import { BlochSphere, HistogramRenderer, showToast } from '../experiment-ui.js?v=7';

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

export default experiment8;
