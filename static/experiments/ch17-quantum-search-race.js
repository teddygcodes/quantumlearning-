import { rnd, shuffle, makeBtn } from './helpers.js';
import { showToast } from '../experiment-ui.js?v=7';

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

export default experiment17;
