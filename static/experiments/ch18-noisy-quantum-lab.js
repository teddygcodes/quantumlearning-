import { rnd, makeBtn } from './helpers.js';
import { HistogramRenderer, showToast } from '../experiment-ui.js?v=7';

const experiment18 = {
  title: 'Noisy Quantum Lab',
  subtitle: 'See error correction fight noise',
  icon: '📡',

  mount(container, { chapterColor, chapterColorDk, onComplete }) {
    let completed = false;
    let noiseRate = 0;
    let logicalBit = 0;
    let running = false;
    let totalRuns = 0;
    let errorsCaught = 0;

    container.style.cssText += 'display:flex;flex-direction:column;gap:8px;padding:12px;';

    // Title
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = "font-size:15px;font-weight:800;color:var(--text);text-align:center;font-family:'Nunito',sans-serif;";
    titleDiv.textContent = '3-Qubit Bit-Flip Code';

    // State toggle row
    const stateRow = document.createElement('div');
    stateRow.style.cssText = 'display:flex;gap:6px;justify-content:center;align-items:center;';
    const stateLabel = document.createElement('div');
    stateLabel.style.cssText = "font-size:13px;color:var(--text-muted);font-family:'Fira Code',monospace;";
    stateLabel.textContent = 'Send:';
    const btn0 = makeBtn('|0⟩', 'btn experiment-block-btn');
    const btn1 = makeBtn('|1⟩', 'btn experiment-block-btn');
    btn0.style.cssText += 'min-width:52px;padding:6px 12px;font-size:14px;';
    btn1.style.cssText += 'min-width:52px;padding:6px 12px;font-size:14px;';
    function updateBitBtns() {
      btn0.style.background = logicalBit === 0 ? chapterColor : 'var(--surface)';
      btn0.style.color = logicalBit === 0 ? '#fff' : 'var(--text)';
      btn1.style.background = logicalBit === 1 ? chapterColor : 'var(--surface)';
      btn1.style.color = logicalBit === 1 ? '#fff' : 'var(--text)';
    }
    btn0.addEventListener('click', () => { logicalBit = 0; updateBitBtns(); });
    btn1.addEventListener('click', () => { logicalBit = 1; updateBitBtns(); });
    stateRow.append(stateLabel, btn0, btn1);
    updateBitBtns();

    // Noise slider
    const sliderRow = document.createElement('div');
    sliderRow.style.cssText = 'display:flex;align-items:center;gap:8px;padding:0 4px;';
    const sliderLabel = document.createElement('div');
    sliderLabel.style.cssText = "font-size:13px;color:var(--text-muted);font-family:'Fira Code',monospace;white-space:nowrap;";
    sliderLabel.textContent = 'Noise:';
    const slider = document.createElement('input');
    slider.type = 'range'; slider.min = '0'; slider.max = '50'; slider.step = '1'; slider.value = '0';
    slider.style.cssText = 'flex:1;accent-color:' + chapterColor + ';height:28px;';
    const sliderVal = document.createElement('div');
    sliderVal.style.cssText = "font-size:14px;font-weight:700;color:var(--text);font-family:'Fira Code',monospace;min-width:38px;text-align:right;";
    sliderVal.textContent = '0%';
    slider.addEventListener('input', () => {
      noiseRate = parseInt(slider.value) / 100;
      sliderVal.textContent = slider.value + '%';
    });
    sliderRow.append(sliderLabel, slider, sliderVal);

    // Circuit diagram
    const circuitDiv = document.createElement('div');
    circuitDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted);text-align:center;padding:4px 0;line-height:1.5;";
    circuitDiv.textContent = 'Encode |ψ⟩→|ψψψ⟩  ▸  Noise (random flips)  ▸  Majority vote decode';

    // Side-by-side panels
    const panelsRow = document.createElement('div');
    panelsRow.style.cssText = 'display:flex;gap:8px;flex:1;min-height:0;';

    function makePanelBox(title) {
      const panel = document.createElement('div');
      panel.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;background:var(--surface);border-radius:12px;padding:8px 4px;border:1px solid var(--border);';
      const t = document.createElement('div');
      t.style.cssText = "font-size:11px;font-weight:800;color:var(--text-muted);letter-spacing:0.5px;font-family:'Nunito',sans-serif;";
      t.textContent = title;
      const histWrap = document.createElement('div');
      histWrap.style.cssText = 'width:100%;flex:1;min-height:80px;';
      const accDiv = document.createElement('div');
      accDiv.style.cssText = "font-size:14px;font-weight:700;color:var(--text);font-family:'Fira Code',monospace;";
      accDiv.textContent = '—';
      panel.append(t, histWrap, accDiv);
      return { panel, histWrap, accDiv };
    }

    const unc = makePanelBox('NO CORRECTION');
    const cor = makePanelBox('3-QUBIT CODE');
    panelsRow.append(unc.panel, cor.panel);

    const uncHist = new HistogramRenderer(unc.histWrap, {
      labels: ['Correct', 'Wrong'], colors: ['#58CC02', '#FF4B4B'], height: 90,
    });
    const corHist = new HistogramRenderer(cor.histWrap, {
      labels: ['Correct', 'Wrong'], colors: ['#58CC02', '#FF4B4B'], height: 90,
    });

    // Errors caught
    const statsDiv = document.createElement('div');
    statsDiv.style.cssText = "font-size:13px;color:var(--text-muted);text-align:center;font-family:'Fira Code',monospace;";
    statsDiv.textContent = 'Errors detected & fixed: 0';

    // Action row
    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;gap:8px;justify-content:center;';
    const runBtn = makeBtn('▶  Run 100 Measurements', 'btn experiment-block-btn');
    runBtn.style.cssText += `background:${chapterColor};color:#fff;font-weight:800;padding:10px 16px;font-size:14px;border-radius:10px;min-width:180px;`;
    const resetBtn = makeBtn('Reset', 'btn experiment-block-btn');
    resetBtn.style.cssText += 'padding:10px 14px;font-size:13px;';
    actionRow.append(runBtn, resetBtn);

    // Discovery
    const discoveryDiv = document.createElement('div');
    discoveryDiv.style.cssText = "font-size:12px;color:#FF9600;text-align:center;font-family:'Nunito',sans-serif;font-style:italic;opacity:0;transition:opacity 0.5s;padding:2px 0;";
    discoveryDiv.textContent = '⚡ Crank noise above ~40% — even error correction starts to fail!';

    container.append(titleDiv, stateRow, sliderRow, circuitDiv, panelsRow, statsDiv, actionRow, discoveryDiv);

    // Simulation
    function simulateUncorrected() {
      let correct = 0;
      for (let i = 0; i < 100; i++) {
        const flipped = Math.random() < noiseRate ? 1 : 0;
        const result = logicalBit ^ flipped;
        if (result === logicalBit) correct++;
      }
      return correct;
    }

    function simulateCorrected() {
      let correct = 0;
      let caught = 0;
      for (let i = 0; i < 100; i++) {
        let b0 = logicalBit, b1 = logicalBit, b2 = logicalBit;
        if (Math.random() < noiseRate) b0 ^= 1;
        if (Math.random() < noiseRate) b1 ^= 1;
        if (Math.random() < noiseRate) b2 ^= 1;
        const decoded = (b0 + b1 + b2) >= 2 ? 1 : 0;
        const hadError = (b0 !== logicalBit || b1 !== logicalBit || b2 !== logicalBit);
        if (decoded === logicalBit) {
          correct++;
          if (hadError) caught++;
        }
      }
      return { correct, caught };
    }

    function runExperiment() {
      if (running) return;
      running = true;
      runBtn.disabled = true;

      const uncCorrect = simulateUncorrected();
      const { correct: corCorrect, caught } = simulateCorrected();
      totalRuns++;
      errorsCaught += caught;

      uncHist.setData([uncCorrect / 100, (100 - uncCorrect) / 100]);
      unc.accDiv.textContent = uncCorrect + '% accurate';
      unc.accDiv.style.color = uncCorrect >= 90 ? '#58CC02' : uncCorrect >= 70 ? '#FF9600' : '#FF4B4B';

      corHist.setData([corCorrect / 100, (100 - corCorrect) / 100]);
      cor.accDiv.textContent = corCorrect + '% accurate';
      cor.accDiv.style.color = corCorrect >= 90 ? '#58CC02' : corCorrect >= 70 ? '#FF9600' : '#FF4B4B';

      statsDiv.textContent = 'Errors detected & fixed: ' + errorsCaught;

      if (noiseRate >= 0.35) discoveryDiv.style.opacity = '1';

      running = false;
      runBtn.disabled = false;
      if (!completed) { completed = true; onComplete({ totalRuns, errorsCaught }); }
    }

    function resetAll() {
      totalRuns = 0;
      errorsCaught = 0;
      uncHist.reset();
      corHist.reset();
      unc.accDiv.textContent = '—';
      unc.accDiv.style.color = 'var(--text)';
      cor.accDiv.textContent = '—';
      cor.accDiv.style.color = 'var(--text)';
      statsDiv.textContent = 'Errors detected & fixed: 0';
    }

    runBtn.addEventListener('click', runExperiment);
    resetBtn.addEventListener('click', resetAll);

    return () => { uncHist.destroy(); corHist.destroy(); };
  },
};

export default experiment18;
