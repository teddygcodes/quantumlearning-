import { makeLabel, makeBtn } from './helpers.js';
import { ClockFace, showToast } from '../experiment-ui.js?v=7';

const experiment13 = {
  title: 'Phase Clock',
  subtitle: 'Step through phase gates — see the hierarchy',
  icon: '🕐',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let gatesApplied = 0;
    let phase = 0;
    let gateHistory = [];

    container.style.flexDirection = 'column';

    // ─ Clock face ─
    const clockWrap = document.createElement('div');
    clockWrap.className = 'experiment-canvas-wrap';
    clockWrap.style.cssText += 'min-height:200px;max-height:240px;width:100%;';
    const clockCanvas = document.createElement('canvas');
    clockWrap.appendChild(clockCanvas);
    const clock = new ClockFace(clockCanvas, { color: chapterColor });

    // ─ State display ─
    const stateDiv = document.createElement('div');
    stateDiv.style.cssText = `
      background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-lg);
      padding:12px;text-align:center;font-family:'Fira Code',monospace;font-size:14px;
      font-weight:700;color:var(--text);line-height:1.4;
    `;

    // ─ Phase formula ─
    const formulaDiv = document.createElement('div');
    formulaDiv.style.cssText = `
      background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
      padding:10px;text-align:center;font-family:'Fira Code',monospace;font-size:13px;
      color:var(--text-muted);line-height:1.5;min-height:40px;
    `;

    // ─ Probability bars (always 50/50) ─
    const probDiv = document.createElement('div');
    probDiv.style.cssText = "text-align:center;font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);";
    probDiv.textContent = 'P(|0⟩) = 0.500   P(|1⟩) = 0.500 — phase never changes probabilities';

    // ─ Gate buttons ─
    const PHASE_GATES = [
      { label: 'T', sublabel: '+π/4', angle: Math.PI / 4, primary: true },
      { label: 'S', sublabel: '+π/2', angle: Math.PI / 2, primary: true },
      { label: 'Z', sublabel: '+π', angle: Math.PI, primary: true },
      { label: 'T†', sublabel: '−π/4', angle: -Math.PI / 4, primary: false },
      { label: 'S†', sublabel: '−π/2', angle: -Math.PI / 2, primary: false },
    ];

    const gateRow = document.createElement('div');
    gateRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;';

    PHASE_GATES.forEach(gate => {
      const btn = document.createElement('button');
      btn.className = gate.primary ? 'btn' : 'btn experiment-block-btn';
      btn.style.cssText = `
        padding:10px 14px;font-family:'Fira Code',monospace;font-weight:700;
        font-size:15px;display:flex;flex-direction:column;align-items:center;gap:2px;
        min-width:60px;
        ${gate.primary ? `background:${chapterColor};color:#fff;border:none;` : ''}
      `;
      const nameSpan = document.createElement('span');
      nameSpan.textContent = gate.label;
      const subSpan = document.createElement('span');
      subSpan.style.cssText = 'font-size:10px;opacity:0.7;';
      subSpan.textContent = gate.sublabel;
      btn.append(nameSpan, subSpan);

      btn.addEventListener('click', async () => {
        const oldPhase = phase;
        phase += gate.angle;
        gateHistory.push(gate.label);
        gatesApplied++;

        await clock.animatePhase(oldPhase, phase, 300);
        updateDisplay();

        if (!completed) {
          completed = true;
          onComplete({ gatesApplied });
        }
      });

      gateRow.appendChild(btn);
    });

    // ─ Reset button ─
    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;gap:8px;justify-content:center;';

    const resetBtn = makeBtn('Reset Phase', 'btn experiment-block-btn');
    resetBtn.addEventListener('click', () => {
      phase = 0;
      gateHistory = [];
      clock.setPhase(0);
      updateDisplay();
      showToast(container, 'Phase reset to 0', 'info');
    });
    actionRow.appendChild(resetBtn);

    // ─ Discovery prompt ─
    const discoveryDiv = document.createElement('div');
    discoveryDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);text-align:center;opacity:0;transition:opacity 0.5s;line-height:1.5;";
    discoveryDiv.textContent = '💡 How many T gates equal one Z gate? Try it!';

    // ─ Counter ─
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = 'font-size:13px;color:var(--text-muted);text-align:center;';

    container.append(clockWrap, stateDiv, formulaDiv, probDiv, gateRow, actionRow, discoveryDiv, counterDiv);

    function formatPhaseAngle(rad) {
      let r = rad % (2 * Math.PI);
      if (r < -1e-9) r += 2 * Math.PI;
      if (Math.abs(r) < 1e-9 || Math.abs(r - 2 * Math.PI) < 1e-9) return '0';
      const frac = r / Math.PI;
      const fracs = [
        [1/4, 'π/4'], [1/2, 'π/2'], [3/4, '3π/4'], [1, 'π'],
        [5/4, '5π/4'], [3/2, '3π/2'], [7/4, '7π/4'],
      ];
      for (const [f, label] of fracs) {
        if (Math.abs(frac - f) < 0.01) return label;
      }
      return `${(r).toFixed(2)}`;
    }

    function getEquivalence() {
      const phaseNorm = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      if (Math.abs(phaseNorm) < 0.01 || Math.abs(phaseNorm - 2 * Math.PI) < 0.01) return '= I (full circle!)';
      if (Math.abs(phaseNorm - Math.PI) < 0.01) return '= Z';
      if (Math.abs(phaseNorm - Math.PI / 2) < 0.01) return '= S';
      if (Math.abs(phaseNorm - Math.PI / 4) < 0.01) return '= T';
      if (Math.abs(phaseNorm - 3 * Math.PI / 2) < 0.01) return '= S†';
      if (Math.abs(phaseNorm - 7 * Math.PI / 4) < 0.01) return '= T†';
      return '';
    }

    function updateDisplay() {
      const pNorm = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const cosP = Math.cos(pNorm);
      const sinP = Math.sin(pNorm);
      const phaseStr = formatPhaseAngle(phase);

      if (Math.abs(pNorm) < 0.01 || Math.abs(pNorm - 2 * Math.PI) < 0.01) {
        stateDiv.textContent = '|ψ⟩ = (1/√2)(|0⟩ + |1⟩) = |+⟩';
      } else {
        const reCoeff = Math.round(cosP * 100) / 100;
        const imCoeff = Math.round(sinP * 100) / 100;
        let coeffStr;
        if (Math.abs(imCoeff) < 0.005) coeffStr = `${reCoeff}`;
        else if (Math.abs(reCoeff) < 0.005) coeffStr = `${imCoeff}i`;
        else coeffStr = `${reCoeff}${imCoeff >= 0 ? '+' : ''}${imCoeff}i`;
        stateDiv.textContent = `|ψ⟩ = (1/√2)(|0⟩ + ${coeffStr}|1⟩)   φ = ${phaseStr}`;
      }

      if (gateHistory.length === 0) {
        formulaDiv.textContent = 'Apply phase gates to build up phase...';
      } else {
        const seq = gateHistory.join(' + ');
        const total = formatPhaseAngle(phase);
        const equiv = getEquivalence();
        formulaDiv.textContent = `${seq} = ${total} ${equiv}`;
      }

      counterDiv.textContent = `Gates applied: ${gatesApplied}`;
      if (gatesApplied >= 6) discoveryDiv.style.opacity = '1';
    }

    updateDisplay();

    return () => { clock.destroy(); };
  },
};

export default experiment13;
