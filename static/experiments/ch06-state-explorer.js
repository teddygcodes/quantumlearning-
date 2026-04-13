import { makeBtn, snap, SQRT2_INV } from './helpers.js';
import { showToast } from '../experiment-ui.js?v=7';

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

export default experiment6;
