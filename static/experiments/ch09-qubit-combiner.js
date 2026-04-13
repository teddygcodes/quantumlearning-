import { makeBtn, blochToState, tensorProduct, fmtKet2Q } from './helpers.js';
import { BlochSphere, HistogramRenderer, showToast } from '../experiment-ui.js?v=7';

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

export default experiment9;
