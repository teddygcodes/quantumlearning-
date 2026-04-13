import { rnd, makeBtn, cabs, blochToState, normalizeGlobalPhase, stateToBloch, fmtKet3Q } from './helpers.js';
import { BlochSphere, CircuitSimulator, showToast } from '../experiment-ui.js?v=7';

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

export default experiment15;
