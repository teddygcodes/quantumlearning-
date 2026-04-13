import { rnd, makeBtn } from './helpers.js';

const experiment19 = {
  title: 'Period Finder',
  subtitle: 'Factor numbers like a quantum computer',
  icon: '🔁',

  mount(container, { chapterColor, chapterColorDk, onComplete }) {
    let completed = false;
    let N = 15, a = 2;
    let powers = [];
    let period = null;
    let revealedCount = 0;
    let factorizations = 0;
    let animTimer = null;
    let guessedCorrect = false;

    function gcd(x, y) { while (y) { [x, y] = [y, x % y]; } return x; }
    function modPow(base, exp, mod) {
      let r = 1; base = base % mod;
      for (let i = 0; i < exp; i++) r = (r * base) % mod;
      return r;
    }
    function getValidBases(n) {
      const bases = [];
      for (let b = 2; b < n && bases.length < 8; b++) {
        if (gcd(b, n) === 1) bases.push(b);
      }
      return bases;
    }

    container.style.cssText += 'display:flex;flex-direction:column;gap:6px;padding:12px;';

    // Title
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = "font-size:15px;font-weight:800;color:var(--text);text-align:center;font-family:'Nunito',sans-serif;";
    titleDiv.textContent = 'Period Finder';

    // Selector row
    const selectorRow = document.createElement('div');
    selectorRow.style.cssText = 'display:flex;gap:12px;justify-content:center;align-items:center;flex-wrap:wrap;';
    const nLabel = document.createElement('span');
    nLabel.style.cssText = "font-family:'Fira Code',monospace;font-size:13px;color:var(--text-muted);";
    nLabel.textContent = 'N =';
    const nBtnWrap = document.createElement('div');
    nBtnWrap.style.cssText = 'display:flex;gap:4px;';
    const aLabel = document.createElement('span');
    aLabel.style.cssText = "font-family:'Fira Code',monospace;font-size:13px;color:var(--text-muted);";
    aLabel.textContent = 'a =';
    const aBtnWrap = document.createElement('div');
    aBtnWrap.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;';
    selectorRow.append(nLabel, nBtnWrap, aLabel, aBtnWrap);

    // Formula
    const formulaDiv = document.createElement('div');
    formulaDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:14px;color:var(--text);text-align:center;font-weight:700;";

    // Main area: table + graph
    const mainArea = document.createElement('div');
    mainArea.style.cssText = 'display:flex;gap:8px;flex:1;min-height:0;overflow:hidden;';

    // Table panel
    const tablePanel = document.createElement('div');
    tablePanel.style.cssText = 'flex:1;display:flex;flex-direction:column;background:var(--surface);border-radius:12px;border:1px solid var(--border);overflow:hidden;';
    const tableTitle = document.createElement('div');
    tableTitle.style.cssText = "font-size:11px;font-weight:800;color:var(--text-muted);letter-spacing:0.5px;padding:6px 8px;font-family:'Nunito',sans-serif;";
    tableTitle.textContent = 'MODULAR POWERS';
    const tableScroll = document.createElement('div');
    tableScroll.style.cssText = 'flex:1;overflow-y:auto;padding:0 6px 6px;';
    const tableEl = document.createElement('table');
    tableEl.style.cssText = "width:100%;border-collapse:collapse;font-family:'Fira Code',monospace;font-size:12px;";
    tableScroll.appendChild(tableEl);
    tablePanel.append(tableTitle, tableScroll);

    // Graph panel
    const graphPanel = document.createElement('div');
    graphPanel.style.cssText = 'flex:1.2;display:flex;flex-direction:column;background:var(--surface);border-radius:12px;border:1px solid var(--border);overflow:hidden;';
    const graphTitle = document.createElement('div');
    graphTitle.style.cssText = "font-size:11px;font-weight:800;color:var(--text-muted);letter-spacing:0.5px;padding:6px 8px;font-family:'Nunito',sans-serif;";
    graphTitle.textContent = 'PATTERN';
    const graphWrap = document.createElement('div');
    graphWrap.style.cssText = 'flex:1;position:relative;min-height:80px;';
    const graphCanvas = document.createElement('canvas');
    graphCanvas.style.cssText = 'width:100%;height:100%;display:block;';
    graphWrap.appendChild(graphCanvas);
    graphPanel.append(graphTitle, graphWrap);
    mainArea.append(tablePanel, graphPanel);

    // Period guess row
    const periodRow = document.createElement('div');
    periodRow.style.cssText = 'display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap;';
    const periodLabel = document.createElement('span');
    periodLabel.style.cssText = "font-family:'Fira Code',monospace;font-size:13px;color:var(--text-muted);";
    periodLabel.textContent = 'Period r =';
    const periodBtns = document.createElement('div');
    periodBtns.style.cssText = 'display:flex;gap:4px;';
    const periodFeedback = document.createElement('div');
    periodFeedback.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;font-weight:700;min-height:18px;";
    periodRow.append(periodLabel, periodBtns, periodFeedback);

    // Factor result
    const factorDiv = document.createElement('div');
    factorDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:14px;color:var(--text);text-align:center;font-weight:700;min-height:20px;padding:2px 0;";

    // QFT caption
    const qftDiv = document.createElement('div');
    qftDiv.style.cssText = "font-size:12px;color:#CE82FF;text-align:center;font-family:'Nunito',sans-serif;font-style:italic;opacity:0;transition:opacity 0.5s;";
    qftDiv.textContent = '⚡ A quantum computer finds this period exponentially faster using QFT';

    // Action row
    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;gap:8px;justify-content:center;';
    const fillBtn = makeBtn('▶  Fill Table', 'btn experiment-block-btn');
    fillBtn.style.cssText += `background:${chapterColor};color:#fff;font-weight:800;padding:10px 16px;font-size:14px;border-radius:10px;`;
    const newBtn = makeBtn('New Number', 'btn experiment-block-btn');
    newBtn.style.cssText += 'padding:10px 14px;font-size:13px;';
    actionRow.append(fillBtn, newBtn);

    // Counter
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = "font-size:13px;color:var(--text-muted);text-align:center;font-family:'Fira Code',monospace;";
    counterDiv.textContent = 'Numbers factored: 0';

    container.append(titleDiv, selectorRow, formulaDiv, mainArea, periodRow, factorDiv, qftDiv, actionRow, counterDiv);

    // Graph rendering
    function renderGraph() {
      const c = graphCanvas;
      const parent = c.parentElement;
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      if (w === 0 || h === 0) return;
      const dpr = window.devicePixelRatio || 1;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      const ctx = c.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (revealedCount === 0) return;

      const pad = { top: 8, bottom: 20, left: 28, right: 8 };
      const plotW = w - pad.left - pad.right;
      const plotH = h - pad.top - pad.bottom;
      const maxX = Math.max(revealedCount, 8);
      const maxY = N;
      const xStep = plotW / maxX;
      const yScale = plotH / maxY;

      // Axes
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, pad.top);
      ctx.lineTo(pad.left, h - pad.bottom);
      ctx.lineTo(w - pad.right, h - pad.bottom);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = "9px 'Fira Code',monospace";
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const yTick = Math.ceil(maxY / 4);
      for (let v = 0; v <= maxY; v += yTick) {
        const y = h - pad.bottom - v * yScale;
        ctx.fillText(String(v), pad.left - 4, y);
      }

      // Period highlight bands
      if (guessedCorrect && period) {
        const colors = ['rgba(88,204,2,0.08)', 'rgba(28,176,246,0.08)'];
        for (let i = 0; i < revealedCount; i++) {
          const band = Math.floor(i / period) % 2;
          const x = pad.left + (i + 0.5) * xStep;
          ctx.fillStyle = colors[band];
          ctx.fillRect(x - xStep * 0.45, pad.top, xStep * 0.9, plotH);
        }
      }

      // Dots + lines
      ctx.strokeStyle = chapterColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < revealedCount; i++) {
        const x = pad.left + (i + 0.5) * xStep;
        const y = h - pad.bottom - powers[i] * yScale;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      for (let i = 0; i < revealedCount; i++) {
        const x = pad.left + (i + 0.5) * xStep;
        const y = h - pad.bottom - powers[i] * yScale;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = chapterColor;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // X label
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = "9px 'Fira Code',monospace";
        ctx.textAlign = 'center';
        ctx.fillText(String(i + 1), x, h - pad.bottom + 12);
      }
    }

    // Setup
    function computePowers() {
      powers = [];
      const maxSteps = 20;
      for (let x = 1; x <= maxSteps; x++) {
        powers.push(modPow(a, x, N));
      }
      period = null;
      for (let r = 1; r <= powers.length; r++) {
        if (modPow(a, r, N) === 1) { period = r; break; }
      }
    }

    function buildTable() {
      tableEl.textContent = '';
      const hdr = document.createElement('tr');
      ['x', a + '^x mod ' + N].forEach(t => {
        const th = document.createElement('th');
        th.style.cssText = "text-align:center;padding:3px 6px;color:var(--text-muted);border-bottom:1px solid var(--border);font-size:11px;";
        th.textContent = t;
        hdr.appendChild(th);
      });
      tableEl.appendChild(hdr);
    }

    function revealRow(idx) {
      const tr = document.createElement('tr');
      [idx + 1, powers[idx]].forEach((v, ci) => {
        const td = document.createElement('td');
        td.style.cssText = 'text-align:center;padding:3px 6px;color:var(--text);border-bottom:1px solid var(--border);' + (ci === 1 ? 'font-weight:700;' : '');
        td.textContent = String(v);
        if (ci === 1 && period && (idx + 1) % period === 0) {
          td.style.color = '#58CC02';
        }
        tr.appendChild(td);
      });
      tableEl.appendChild(tr);
      tableScroll.scrollTop = tableScroll.scrollHeight;
    }

    function buildPeriodBtns() {
      periodBtns.textContent = '';
      for (let r = 1; r <= 12; r++) {
        const b = makeBtn(String(r), 'btn experiment-block-btn');
        b.style.cssText += 'min-width:36px;padding:6px 8px;font-size:13px;';
        b.addEventListener('click', () => checkPeriod(r));
        periodBtns.appendChild(b);
      }
    }

    function checkPeriod(guess) {
      if (guessedCorrect) return;
      if (guess !== period) {
        periodFeedback.textContent = 'Not quite — look at the pattern!';
        periodFeedback.style.color = '#FF4B4B';
        setTimeout(() => { if (!guessedCorrect) periodFeedback.textContent = ''; }, 1500);
        return;
      }
      guessedCorrect = true;
      periodFeedback.textContent = '✓  r = ' + period;
      periodFeedback.style.color = '#58CC02';

      if (period % 2 !== 0) {
        factorDiv.textContent = 'Period is odd — try a different base!';
        factorDiv.style.color = '#FF9600';
        return;
      }
      const halfPow = modPow(a, period / 2, N);
      if (halfPow === N - 1) {
        factorDiv.textContent = 'a^(r/2) ≡ −1 mod N — try a different base!';
        factorDiv.style.color = '#FF9600';
        return;
      }
      const f1 = gcd(halfPow + 1, N);
      const f2 = gcd(Math.abs(halfPow - 1), N);
      if (f1 <= 1 || f1 >= N || f2 <= 1 || f2 >= N) {
        factorDiv.textContent = 'Trivial factors — try a different base!';
        factorDiv.style.color = '#FF9600';
        return;
      }
      // Build factor display using DOM (no innerHTML)
      factorDiv.textContent = '';
      const prefix = document.createTextNode('gcd(' + a + '^' + (period / 2) + '±1, ' + N + ') → ');
      const resultSpan = document.createElement('span');
      resultSpan.style.cssText = 'color:#58CC02;font-size:16px;';
      resultSpan.textContent = N + ' = ' + Math.min(f1, f2) + ' × ' + Math.max(f1, f2);
      factorDiv.append(prefix, resultSpan);
      qftDiv.style.opacity = '1';
      factorizations++;
      counterDiv.textContent = 'Numbers factored: ' + factorizations;
      renderGraph();
      if (!completed) { completed = true; onComplete({ factorizations }); }
    }

    function setupProblem() {
      if (animTimer) { clearInterval(animTimer); animTimer = null; }
      revealedCount = 0;
      guessedCorrect = false;
      periodFeedback.textContent = '';
      factorDiv.textContent = '';
      qftDiv.style.opacity = '0';
      computePowers();
      buildTable();
      buildPeriodBtns();
      formulaDiv.textContent = 'f(x) = ' + a + '^x mod ' + N;
      fillBtn.disabled = false;
      fillBtn.textContent = '▶  Fill Table';
      renderGraph();
    }

    function buildNButtons() {
      nBtnWrap.textContent = '';
      [15, 21, 35].forEach(n => {
        const b = makeBtn(String(n), 'btn experiment-block-btn');
        b.style.cssText += 'min-width:42px;padding:6px 10px;font-size:14px;font-weight:700;';
        b.style.background = n === N ? chapterColor : 'var(--surface)';
        b.style.color = n === N ? '#fff' : 'var(--text)';
        b.addEventListener('click', () => { N = n; a = getValidBases(n)[0]; buildNButtons(); buildAButtons(); setupProblem(); });
        nBtnWrap.appendChild(b);
      });
    }

    function buildAButtons() {
      aBtnWrap.textContent = '';
      const bases = getValidBases(N);
      bases.slice(0, 6).forEach(base => {
        const b = makeBtn(String(base), 'btn experiment-block-btn');
        b.style.cssText += 'min-width:36px;padding:6px 8px;font-size:13px;';
        b.style.background = base === a ? chapterColor : 'var(--surface)';
        b.style.color = base === a ? '#fff' : 'var(--text)';
        b.addEventListener('click', () => { a = base; buildAButtons(); setupProblem(); });
        aBtnWrap.appendChild(b);
      });
    }

    fillBtn.addEventListener('click', () => {
      if (animTimer) return;
      if (revealedCount >= powers.length) return;
      fillBtn.disabled = true;
      fillBtn.textContent = 'Filling...';
      const target = period ? Math.min(period * 2 + 2, powers.length) : Math.min(12, powers.length);
      animTimer = setInterval(() => {
        if (revealedCount >= target) {
          clearInterval(animTimer);
          animTimer = null;
          fillBtn.disabled = false;
          fillBtn.textContent = '▶  Fill More';
          return;
        }
        revealRow(revealedCount);
        revealedCount++;
        renderGraph();
      }, 220);
    });

    newBtn.addEventListener('click', () => {
      const bases = getValidBases(N);
      const others = bases.filter(b => b !== a);
      a = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : bases[0];
      buildAButtons();
      setupProblem();
    });

    buildNButtons();
    buildAButtons();
    setupProblem();

    const gro = new ResizeObserver(() => renderGraph());
    gro.observe(graphWrap);

    return () => {
      if (animTimer) clearInterval(animTimer);
      gro.disconnect();
    };
  },
};

export default experiment19;
