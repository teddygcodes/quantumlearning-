import { makeBtn, stateToBloch, applyRx, applyRy, applyRz, fmtKetFull } from './helpers.js';
import { BlochSphere, showToast } from '../experiment-ui.js?v=7';

const experiment12 = {
  title: 'Bloch Sphere Painter',
  subtitle: 'Paint rotation trails on the Bloch sphere',
  icon: '🎨',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let rotationsExplored = 0;

    // Quantum state as complex amplitudes [α, β]
    let state = [{ re: 1, im: 0 }, { re: 0, im: 0 }]; // |0⟩

    container.style.flexDirection = 'column';

    // ─ Bloch sphere (large) ─
    const sphereWrap = document.createElement('div');
    sphereWrap.className = 'experiment-canvas-wrap';
    sphereWrap.style.cssText += 'min-height:220px;max-height:280px;width:100%;';
    const sphereCanvas = document.createElement('canvas');
    sphereWrap.appendChild(sphereCanvas);
    const bloch = new BlochSphere(sphereCanvas, { color: chapterColor, showTrails: true });

    // ─ State display ─
    const stateDiv = document.createElement('div');
    stateDiv.style.cssText = `
      background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-lg);
      padding:12px;text-align:center;font-family:'Fira Code',monospace;font-size:14px;
      font-weight:700;color:var(--text);line-height:1.4;
    `;

    // ─ Probability readout ─
    const probDiv = document.createElement('div');
    probDiv.style.cssText = "text-align:center;font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);";

    // ─ Rotation sliders ─
    const AXES = [
      { name: 'Rx', color: '#FF4B4B', apply: applyRx },
      { name: 'Ry', color: '#58CC02', apply: applyRy },
      { name: 'Rz', color: '#1CB0F6', apply: applyRz },
    ];

    const sliderSection = document.createElement('div');
    sliderSection.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

    const sliderRefs = AXES.map(axis => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;';

      const label = document.createElement('div');
      label.style.cssText = `font-family:'Fira Code',monospace;font-size:13px;font-weight:700;color:${axis.color};min-width:28px;`;
      label.textContent = axis.name;

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = String(-Math.PI);
      slider.max = String(Math.PI);
      slider.step = '0.03';
      slider.value = '0';
      slider.style.cssText = `flex:1;accent-color:${axis.color};`;

      const valEl = document.createElement('div');
      valEl.style.cssText = `font-family:'Fira Code',monospace;font-size:11px;color:${axis.color};min-width:44px;text-align:right;`;
      valEl.textContent = '0';

      row.append(label, slider, valEl);
      sliderSection.appendChild(row);

      let lastVal = 0;

      slider.addEventListener('input', () => {
        const val = parseFloat(slider.value);
        const delta = val - lastVal;
        lastVal = val;

        if (Math.abs(delta) < 0.001) return;

        state = axis.apply(state, delta);

        const blochAngles = stateToBloch(state[0], state[1]);
        bloch.addTrailPoint(blochAngles.theta, blochAngles.phi, axis.color);

        rotationsExplored++;
        update();

        if (!completed) {
          completed = true;
          onComplete({ rotationsExplored });
        }
      });

      const resetSlider = () => {
        slider.value = '0';
        lastVal = 0;
        valEl.textContent = '0';
        bloch._currentTrail = null;
      };
      slider.addEventListener('pointerup', resetSlider);
      slider.addEventListener('touchend', resetSlider);

      return { slider, valEl, resetSlider };
    });

    // ─ Action buttons ─
    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;gap:8px;';

    const clearBtn = makeBtn('Clear Trails', 'btn experiment-block-btn');
    clearBtn.addEventListener('click', () => {
      bloch.clearTrails();
      bloch.render();
      showToast(container, 'Trails cleared', 'info');
    });

    const resetBtn = makeBtn('Reset to |0⟩', 'btn experiment-block-btn');
    resetBtn.addEventListener('click', () => {
      state = [{ re: 1, im: 0 }, { re: 0, im: 0 }];
      bloch.clearTrails();
      sliderRefs.forEach(s => s.resetSlider());
      update();
      showToast(container, 'Reset to |0⟩', 'info');
    });

    actionRow.append(clearBtn, resetBtn);

    // ─ Discovery prompt ─
    const discoveryDiv = document.createElement('div');
    discoveryDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);text-align:center;opacity:0;transition:opacity 0.5s;line-height:1.5;";
    discoveryDiv.textContent = "💡 Start at |0⟩. Try using ONLY Rz — can you move the arrow? Now try Ry, then combine both.";

    // ─ Counter ─
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = 'font-size:13px;color:var(--text-muted);text-align:center;';
    counterDiv.textContent = 'Rotations explored: 0';

    container.append(sphereWrap, stateDiv, probDiv, sliderSection, actionRow, discoveryDiv, counterDiv);

    function update() {
      const blochAngles = stateToBloch(state[0], state[1]);
      bloch.setState(blochAngles.theta, blochAngles.phi);
      stateDiv.textContent = fmtKetFull(state[0], state[1]);

      const p0 = state[0].re * state[0].re + state[0].im * state[0].im;
      probDiv.textContent = `P(|0⟩) = ${(p0).toFixed(3)}   P(|1⟩) = ${(1 - p0).toFixed(3)}`;

      sliderRefs.forEach(s => {
        s.valEl.textContent = parseFloat(s.slider.value).toFixed(2);
      });

      counterDiv.textContent = `Rotations explored: ${rotationsExplored}`;
      if (rotationsExplored >= 10) discoveryDiv.style.opacity = '1';
    }

    update();

    return () => { bloch.destroy(); };
  },
};

export default experiment12;
