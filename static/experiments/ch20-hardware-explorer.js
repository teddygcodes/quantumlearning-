import { makeLabel, makeBtn } from './helpers.js';
import { RadarChart, showToast } from '../experiment-ui.js?v=7';

const experiment20 = {
  title: 'Hardware Explorer',
  subtitle: 'Compare real quantum technologies',
  icon: '🖥️',

  mount(container, { chapterColor, chapterColorDk, onComplete }) {
    let completed = false;
    let selectedTech = 0;
    let compareTech = null;
    let compareMode = false;
    const techsViewed = new Set([0]);

    const TECHS = [
      {
        name: 'Superconducting', icon: '🧊', color: '#1CB0F6',
        stats: [0.85, 0.75, 0.25, 0.5, 0.1],
        companies: 'Google, IBM, Rigetti',
        record: '1,121 qubits (IBM Condor)',
        pros: 'Fast gates (~20ns), mature fabrication, largest qubit counts',
        cons: 'Needs 15mK cooling, short coherence (~100μs), crosstalk',
        desc: ['Most qubits', 'High fidelity', 'Short-lived', 'Nearest-neighbor', 'Ultra-cold'],
      },
      {
        name: 'Trapped Ion', icon: '⚛️', color: '#58CC02',
        stats: [0.25, 0.95, 0.9, 0.95, 0.5],
        companies: 'IonQ, Quantinuum, AQT',
        record: '56 qubits (Quantinuum H2)',
        pros: 'Highest fidelity (99.9%), all-to-all connectivity, long coherence',
        cons: 'Slow gates (~ms), hard to scale beyond ~50 qubits',
        desc: ['Few qubits', 'Best fidelity', 'Long-lived', 'All-to-all', 'Room-temp trap'],
      },
      {
        name: 'Photonic', icon: '💡', color: '#FF9600',
        stats: [0.45, 0.55, 0.95, 0.35, 0.95],
        companies: 'Xanadu, PsiQuantum, Quandela',
        record: '216 squeezed modes (Borealis)',
        pros: 'Room temperature, natural for quantum networking, low noise',
        cons: 'Probabilistic gates, photon loss, hard to store',
        desc: ['Medium count', 'Moderate', 'No decoherence', 'Limited', 'Room temp'],
      },
      {
        name: 'Neutral Atom', icon: '🔵', color: '#CE82FF',
        stats: [0.7, 0.7, 0.6, 0.7, 0.4],
        companies: 'QuEra, Pasqal, Atom Computing',
        record: '1,225 atoms (Atom Computing)',
        pros: 'Scalable arrays, reconfigurable connectivity, mid-circuit measurement',
        cons: 'Atom loss during operation, slower gate speeds',
        desc: ['Many atoms', 'Good fidelity', 'Moderate', 'Reconfigurable', 'Laser-cooled'],
      },
      {
        name: 'Topological', icon: '🪢', color: '#FF4B4B',
        stats: [0.05, 0.4, 0.5, 0.3, 0.15],
        companies: 'Microsoft',
        record: 'First topological qubit (2025)',
        pros: 'Inherently error-protected (theoretical), braiding-based gates',
        cons: 'Earliest stage, very few qubits demonstrated, unproven at scale',
        desc: ['Fewest', 'Unproven', 'Protected', 'TBD', 'Ultra-cold'],
      },
    ];

    const AXES = ['Qubits', 'Fidelity', 'Coherence', 'Connect.', 'Temp'];

    container.style.cssText += 'display:flex;flex-direction:column;gap:6px;padding:12px;';

    // Title
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = "font-size:15px;font-weight:800;color:var(--text);text-align:center;font-family:'Nunito',sans-serif;";
    titleDiv.textContent = 'Quantum Hardware Technologies';

    // Tech strip
    const techStrip = document.createElement('div');
    techStrip.style.cssText = 'display:flex;gap:6px;justify-content:center;flex-wrap:wrap;';

    const techBtns = TECHS.map((tech, idx) => {
      const b = makeBtn(tech.icon + ' ' + tech.name, 'btn experiment-block-btn');
      b.style.cssText += 'padding:7px 10px;font-size:12px;font-weight:700;border-radius:8px;white-space:nowrap;';
      b.addEventListener('click', () => {
        if (compareMode && selectedTech !== idx) {
          compareTech = idx;
          techsViewed.add(idx);
          if (techsViewed.size >= 3 && !completed) { completed = true; onComplete({ techsViewed: techsViewed.size }); }
          updateAll();
        } else {
          selectedTech = idx;
          compareTech = null;
          techsViewed.add(idx);
          if (techsViewed.size >= 3 && !completed) { completed = true; onComplete({ techsViewed: techsViewed.size }); }
          updateAll();
        }
      });
      techStrip.appendChild(b);
      return b;
    });

    // Main area
    const mainArea = document.createElement('div');
    mainArea.style.cssText = 'display:flex;gap:8px;flex:1;min-height:0;';

    // Radar panel
    const radarPanel = document.createElement('div');
    radarPanel.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;min-width:0;';
    const radarWrap = document.createElement('div');
    radarWrap.style.cssText = 'width:100%;flex:1;min-height:120px;position:relative;';
    const radarCanvas = document.createElement('canvas');
    radarCanvas.style.cssText = 'width:100%;height:100%;display:block;';
    radarWrap.appendChild(radarCanvas);
    radarPanel.appendChild(radarWrap);

    // Details panel
    const detailsPanel = document.createElement('div');
    detailsPanel.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:6px;background:var(--surface);border-radius:12px;border:1px solid var(--border);padding:10px;overflow-y:auto;';

    mainArea.append(radarPanel, detailsPanel);

    // Compare row
    const compareRow = document.createElement('div');
    compareRow.style.cssText = 'display:flex;gap:8px;justify-content:center;align-items:center;';
    const compareBtn = makeBtn('Compare', 'btn experiment-block-btn');
    compareBtn.style.cssText += 'padding:8px 14px;font-size:13px;font-weight:700;';
    const matchupBtn = makeBtn('🎲 Random Matchup', 'btn experiment-block-btn');
    matchupBtn.style.cssText += 'padding:8px 14px;font-size:13px;';
    const compareInfo = document.createElement('div');
    compareInfo.style.cssText = "font-size:12px;color:var(--text-muted);font-family:'Nunito',sans-serif;font-style:italic;";
    compareRow.append(compareBtn, matchupBtn, compareInfo);

    container.append(titleDiv, techStrip, mainArea, compareRow);

    // Initialize RadarChart
    const radar = new RadarChart(radarCanvas, { axes: AXES, color: TECHS[0].color });

    function renderDetails() {
      detailsPanel.textContent = '';
      const tech = TECHS[selectedTech];

      const nameDiv = document.createElement('div');
      nameDiv.style.cssText = 'font-size:16px;font-weight:800;color:' + tech.color + ";font-family:'Nunito',sans-serif;";
      nameDiv.textContent = tech.icon + ' ' + tech.name;
      detailsPanel.appendChild(nameDiv);

      // Stats bars
      AXES.forEach((axis, i) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:6px;';
        const label = document.createElement('div');
        label.style.cssText = "font-size:11px;color:var(--text-muted);font-family:'Fira Code',monospace;min-width:62px;";
        label.textContent = axis;
        const barOuter = document.createElement('div');
        barOuter.style.cssText = 'flex:1;height:10px;background:var(--bg);border-radius:5px;overflow:hidden;';
        const barInner = document.createElement('div');
        barInner.style.cssText = 'height:100%;width:' + (tech.stats[i] * 100) + '%;background:' + tech.color + ';border-radius:5px;transition:width 0.3s ease;';
        barOuter.appendChild(barInner);
        const descEl = document.createElement('div');
        descEl.style.cssText = "font-size:10px;color:var(--text-muted);font-family:'Fira Code',monospace;min-width:75px;text-align:right;";
        descEl.textContent = tech.desc[i];
        row.append(label, barOuter, descEl);
        detailsPanel.appendChild(row);
      });

      // Info rows helper
      function addInfoRow(icon, lbl, text) {
        const d = document.createElement('div');
        d.style.cssText = "font-size:12px;color:var(--text);font-family:'Nunito',sans-serif;line-height:1.4;";
        const iconSpan = document.createElement('span');
        iconSpan.style.opacity = '0.6';
        iconSpan.textContent = icon + ' ';
        const strong = document.createElement('strong');
        strong.textContent = lbl + ': ';
        d.append(iconSpan, strong, document.createTextNode(text));
        detailsPanel.appendChild(d);
      }
      addInfoRow('🏢', 'Companies', tech.companies);
      addInfoRow('🏆', 'Record', tech.record);
      addInfoRow('✅', 'Strengths', tech.pros);
      addInfoRow('⚠️', 'Challenges', tech.cons);

      // If comparing, show second tech
      if (compareTech !== null) {
        const tech2 = TECHS[compareTech];
        const sep = document.createElement('div');
        sep.style.cssText = 'border-top:1px solid var(--border);margin:4px 0;';
        detailsPanel.appendChild(sep);

        const name2 = document.createElement('div');
        name2.style.cssText = 'font-size:14px;font-weight:800;color:' + tech2.color + ";font-family:'Nunito',sans-serif;";
        name2.textContent = tech2.icon + ' ' + tech2.name;
        detailsPanel.appendChild(name2);

        addInfoRow('🏢', 'Companies', tech2.companies);
        addInfoRow('🏆', 'Record', tech2.record);
        addInfoRow('✅', 'Strengths', tech2.pros);
        addInfoRow('⚠️', 'Challenges', tech2.cons);
      }
    }

    function updateAll() {
      const tech = TECHS[selectedTech];
      techBtns.forEach((b, i) => {
        const isSel = i === selectedTech;
        const isComp = i === compareTech;
        b.style.background = isSel ? tech.color : isComp ? TECHS[i].color : 'var(--surface)';
        b.style.color = (isSel || isComp) ? '#fff' : 'var(--text)';
        b.style.borderColor = isComp ? TECHS[i].color : 'var(--border)';
      });
      radar.setColor(tech.color);
      radar.setData(tech.stats);
      if (compareTech !== null) {
        radar.setOverlay(TECHS[compareTech].stats, TECHS[compareTech].color);
      } else {
        radar.clearOverlay();
      }
      compareBtn.style.background = compareMode ? chapterColor : 'var(--surface)';
      compareBtn.style.color = compareMode ? '#fff' : 'var(--text)';
      compareInfo.textContent = compareMode && compareTech === null ? 'Tap another technology to compare' : '';
      renderDetails();
    }

    compareBtn.addEventListener('click', () => {
      compareMode = !compareMode;
      if (!compareMode) { compareTech = null; }
      updateAll();
    });

    matchupBtn.addEventListener('click', () => {
      const idx1 = Math.floor(Math.random() * TECHS.length);
      let idx2 = Math.floor(Math.random() * (TECHS.length - 1));
      if (idx2 >= idx1) idx2++;
      selectedTech = idx1;
      compareTech = idx2;
      compareMode = true;
      techsViewed.add(idx1);
      techsViewed.add(idx2);
      if (techsViewed.size >= 3 && !completed) { completed = true; onComplete({ techsViewed: techsViewed.size }); }
      updateAll();
    });

    updateAll();

    return () => { radar.destroy(); };
  },
};

export default experiment20;
