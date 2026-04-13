import { makeBtn, stateToBloch, blochToState } from './helpers.js';
import { BlochSphere, CircuitSimulator, showToast } from '../experiment-ui.js?v=7';

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

export default experiment10;
