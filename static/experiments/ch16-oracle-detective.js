import { rnd, shuffle, makeBtn } from './helpers.js';
import { showToast } from '../experiment-ui.js?v=7';

const experiment16 = {
  title: 'Oracle Detective',
  subtitle: 'Constant or balanced? One query to know.',
  icon: '🔍',

  mount(container, { chapterColor, onComplete }) {
    let completed = false;
    let oraclesExplored = 0;
    let totalClassical = 0;
    let totalQuantum = 0;

    container.style.flexDirection = 'column';

    // ─ State ─
    let nBits = 1;
    let oracle = null; // { type: 'constant'|'balanced', outputs: Map<string, 0|1> }
    let queriedInputs = new Set();
    let classicalQueriesThisRound = 0;
    let oracleSolved = false;

    function generateOracle(n) {
      const numInputs = 1 << n;
      const inputs = [];
      for (let i = 0; i < numInputs; i++) inputs.push(i.toString(2).padStart(n, '0'));

      const isConstant = Math.random() < 0.5;
      const outputs = new Map();

      if (isConstant) {
        const val = Math.random() < 0.5 ? 0 : 1;
        inputs.forEach(inp => outputs.set(inp, val));
      } else {
        // balanced: exactly half 0, half 1
        const half = numInputs / 2;
        const shuffled = shuffle(inputs);
        shuffled.forEach((inp, idx) => outputs.set(inp, idx < half ? 0 : 1));
      }

      return { type: isConstant ? 'constant' : 'balanced', outputs, inputs };
    }

    // ─ Title ─
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = "text-align:center;font-family:'Fira Code',monospace;font-weight:700;font-size:15px;color:var(--text);margin-bottom:2px;";
    titleDiv.textContent = 'Mystery function f(x) → ?';

    const subtitleDiv = document.createElement('div');
    subtitleDiv.style.cssText = "text-align:center;font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);margin-bottom:6px;";
    subtitleDiv.textContent = 'Is it CONSTANT or BALANCED?';

    // ─ Scale selector ─
    const scaleRow = document.createElement('div');
    scaleRow.style.cssText = 'display:flex;gap:6px;justify-content:center;margin-bottom:6px;';
    const scaleBtns = {};
    [1, 2, 3].forEach(n => {
      const btn = makeBtn(`${n}-bit`, 'btn experiment-block-btn');
      btn.style.cssText += 'padding:6px 12px;font-size:12px;';
      btn.addEventListener('click', () => {
        nBits = n;
        newOracle();
      });
      scaleRow.appendChild(btn);
      scaleBtns[n] = btn;
    });

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
    classicalTitle.style.cssText = "font-family:'Fira Code',monospace;font-weight:700;font-size:13px;color:var(--text);text-align:center;";
    classicalTitle.textContent = 'CLASSICAL';

    const queryTable = document.createElement('div');
    queryTable.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);min-height:50px;max-height:100px;overflow-y:auto;";

    const queryBtnsDiv = document.createElement('div');
    queryBtnsDiv.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:center;';

    const classicalCountDiv = document.createElement('div');
    classicalCountDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted);text-align:center;";

    const guessRow = document.createElement('div');
    guessRow.style.cssText = 'display:flex;gap:4px;justify-content:center;margin-top:4px;';
    const guessConstBtn = makeBtn('Constant', 'btn experiment-block-btn');
    guessConstBtn.style.cssText += 'padding:6px 10px;font-size:11px;';
    const guessBalBtn = makeBtn('Balanced', 'btn experiment-block-btn');
    guessBalBtn.style.cssText += 'padding:6px 10px;font-size:11px;';
    guessRow.append(guessConstBtn, guessBalBtn);

    const classicalResultDiv = document.createElement('div');
    classicalResultDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;text-align:center;min-height:18px;font-weight:700;";

    classicalPanel.append(classicalTitle, queryTable, queryBtnsDiv, classicalCountDiv, guessRow, classicalResultDiv);

    // Quantum panel
    const quantumPanel = document.createElement('div');
    quantumPanel.style.cssText = `
      flex:1;display:flex;flex-direction:column;gap:4px;align-items:center;
      background:var(--surface);border-radius:var(--radius);padding:8px;
    `;
    const quantumTitle = document.createElement('div');
    quantumTitle.style.cssText = "font-family:'Fira Code',monospace;font-weight:700;font-size:13px;color:var(--text);text-align:center;";
    quantumTitle.textContent = 'QUANTUM';

    const circuitDiv = document.createElement('div');
    circuitDiv.style.cssText = `
      font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted);
      text-align:center;line-height:1.6;min-height:40px;
    `;

    const djBtn = makeBtn('Run Deutsch-Jozsa', 'btn');
    djBtn.style.cssText += `background:${chapterColor};color:#fff;border:none;padding:10px 16px;`;

    const quantumResultDiv = document.createElement('div');
    quantumResultDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;text-align:center;min-height:18px;font-weight:700;";

    const quantumCountDiv = document.createElement('div');
    quantumCountDiv.style.cssText = "font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted);text-align:center;";

    quantumPanel.append(quantumTitle, circuitDiv, djBtn, quantumResultDiv, quantumCountDiv);

    panelsRow.append(classicalPanel, quantumPanel);

    // ─ Scoreboard ─
    const scoreDiv = document.createElement('div');
    scoreDiv.style.cssText = `
      font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);
      text-align:center;background:var(--surface);border-radius:var(--radius);
      padding:8px;width:100%;line-height:1.8;
    `;

    // ─ Action row ─
    const newOracleBtn = makeBtn('New Oracle', 'btn experiment-block-btn');
    newOracleBtn.style.cssText += 'width:100%;';

    // ─ Counter ─
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = "font-size:13px;color:var(--text-muted);text-align:center;font-family:'Fira Code',monospace;";

    container.append(titleDiv, subtitleDiv, scaleRow, panelsRow, scoreDiv, newOracleBtn, counterDiv);

    function updateScore() {
      scoreDiv.textContent = `Classical total queries: ${totalClassical}  |  Quantum total queries: ${totalQuantum}`;
    }

    function renderCircuit() {
      const hStr = nBits === 1 ? 'H' : `H⊗${nBits}`;
      circuitDiv.textContent = `|0⟩⊗${nBits}|1⟩ → ${hStr}⊗H → Uf → ${hStr}⊗I → Measure`;
    }

    function newOracle() {
      oracle = generateOracle(nBits);
      queriedInputs = new Set();
      classicalQueriesThisRound = 0;
      oracleSolved = false;

      // Highlight active scale button
      Object.entries(scaleBtns).forEach(([n, btn]) => {
        btn.style.boxShadow = parseInt(n) === nBits ? `0 0 0 3px ${chapterColor}` : '';
      });

      // Reset classical panel
      queryTable.textContent = '';
      classicalCountDiv.textContent = 'Queries: 0';
      classicalResultDiv.textContent = '';
      classicalResultDiv.style.color = '';
      guessConstBtn.disabled = false;
      guessBalBtn.disabled = false;

      // Build query buttons
      queryBtnsDiv.textContent = '';
      oracle.inputs.forEach(inp => {
        const btn = makeBtn(inp, 'btn experiment-block-btn');
        btn.style.cssText += 'padding:4px 8px;font-size:11px;min-width:36px;';
        btn.addEventListener('click', () => {
          if (oracleSolved || queriedInputs.has(inp)) return;
          queriedInputs.add(inp);
          classicalQueriesThisRound++;
          totalClassical++;
          btn.disabled = true;
          btn.style.opacity = '0.5';

          const row = document.createElement('div');
          row.textContent = `f(${inp}) = ${oracle.outputs.get(inp)}`;
          queryTable.appendChild(row);
          queryTable.scrollTop = queryTable.scrollHeight;

          classicalCountDiv.textContent = `Queries: ${classicalQueriesThisRound}`;

          // Check if certainty is now possible
          const needed = (1 << (nBits - 1)) + 1;
          if (classicalQueriesThisRound >= needed) {
            classicalCountDiv.textContent = `Queries: ${classicalQueriesThisRound} (certainty possible!)`;
            classicalCountDiv.style.color = chapterColor;
          }

          updateScore();
        });
        queryBtnsDiv.appendChild(btn);
      });

      // Reset quantum panel
      quantumResultDiv.textContent = '';
      quantumCountDiv.textContent = '';
      djBtn.disabled = false;
      renderCircuit();

      updateScore();
      counterDiv.textContent = `Oracles explored: ${oraclesExplored}`;
    }

    function handleGuess(guess) {
      if (oracleSolved) return;
      if (guess === oracle.type) {
        classicalResultDiv.textContent = `✓ Correct! (${classicalQueriesThisRound} queries)`;
        classicalResultDiv.style.color = '#58CC02';
        oracleSolved = true;
        guessConstBtn.disabled = true;
        guessBalBtn.disabled = true;
        oraclesExplored++;
        counterDiv.textContent = `Oracles explored: ${oraclesExplored}`;
        if (!completed) { completed = true; onComplete({ oraclesExplored }); }
      } else {
        classicalResultDiv.textContent = '✗ Wrong — keep querying!';
        classicalResultDiv.style.color = '#FF4B4B';
        setTimeout(() => { classicalResultDiv.textContent = ''; }, 1500);
      }
    }

    guessConstBtn.addEventListener('click', () => handleGuess('constant'));
    guessBalBtn.addEventListener('click', () => handleGuess('balanced'));

    djBtn.addEventListener('click', () => {
      if (djBtn.disabled) return;
      djBtn.disabled = true;
      totalQuantum++;

      // DJ always gets it right in 1 query
      const result = oracle.type;
      const allZeros = '0'.repeat(nBits);
      const measured = result === 'constant' ? allZeros : '1'.padEnd(nBits, '0');
      quantumResultDiv.textContent = `Measured |${measured}⟩ → ${result.toUpperCase()}`;
      quantumResultDiv.style.color = '#58CC02';
      quantumCountDiv.textContent = '1 query used';

      if (!oracleSolved) {
        oracleSolved = true;
        oraclesExplored++;
        counterDiv.textContent = `Oracles explored: ${oraclesExplored}`;
        if (!completed) { completed = true; onComplete({ oraclesExplored }); }
      }

      updateScore();
    });

    newOracleBtn.addEventListener('click', newOracle);

    newOracle();

    return () => {};
  },
};

export default experiment16;
