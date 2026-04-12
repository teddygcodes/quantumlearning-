/**
 * Custom answer keyboard — shows only the keys relevant to each answer type.
 * Suppresses the native keyboard via readonly on the target input.
 * All innerHTML is built from hardcoded key labels — no user input is injected.
 */

const LAYOUTS = {
  numeric: [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['\u2212', '0', '.'],
  ],
  vector: [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['\u2212', '0', '.'],
    [','],
  ],
  vector4: [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['\u2212', '0', '.'],
    [','],
  ],
  vector8: [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['\u2212', '0', '.'],
    [','],
  ],
  complex: [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['\u2212', '0', '.'],
    ['+', 'i'],
  ],
  matrix: [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['\u2212', '0', '.'],
    [';', 'space'],
  ],
  angle: [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['\u03C0', '0', '/'],
  ],
  gate_name: [
    ['X', 'Y', 'Z'],
    ['H', 'S', 'T'],
    ['\u2020', 'CNOT'],
  ],
};

let activeInput = null;
let activeSubmitFn = null;
let kbElement = null;

function buildKeyboard() {
  if (kbElement) return kbElement;
  const kb = document.createElement('div');
  kb.id = 'custom-keyboard';
  kb.className = 'custom-kb';
  document.body.appendChild(kb);
  kbElement = kb;
  return kb;
}

function renderKeys(answerType) {
  const kb = buildKeyboard();
  const layout = LAYOUTS[answerType];
  if (!layout) { hide(); return; }

  // Build key rows — all values are hardcoded, no user input
  const rows = layout.map(row => {
    const keys = row.map(key => {
      const display = key === 'space' ? '\u2423' : key;
      const value = key === 'space' ? ' ' : key === '\u2212' ? '-' : key;
      const wide = key === 'CNOT' ? ' kb-wide' : '';
      return `<button class="kb-key${wide}" data-value="${escAttr(value)}">${display}</button>`;
    });
    return `<div class="kb-row">${keys.join('')}</div>`;
  });

  // Action row: backspace + submit
  rows.push(`<div class="kb-row kb-actions">
    <button class="kb-key kb-backspace" data-action="backspace">\u232B</button>
    <button class="kb-key kb-submit" data-action="submit">Check</button>
  </div>`);

  kb.textContent = '';
  const inner = document.createElement('div');
  inner.className = 'kb-inner';
  inner.innerHTML = rows.join('');
  kb.appendChild(inner);

  // Prevent input blur on key press
  inner.addEventListener('pointerdown', (e) => {
    e.preventDefault();
  });
  inner.addEventListener('click', handleKey);
}

function handleKey(e) {
  const btn = e.target.closest('[data-value], [data-action]');
  if (!btn || !activeInput) return;

  if (btn.dataset.action === 'backspace') {
    activeInput.value = activeInput.value.slice(0, -1);
    return;
  }
  if (btn.dataset.action === 'submit') {
    if (activeSubmitFn) activeSubmitFn();
    return;
  }
  if (btn.dataset.value) {
    activeInput.value += btn.dataset.value;
  }
}

function escAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * Show the custom keyboard for a given input element and answer type.
 */
export function show(input, answerType, submitFn) {
  if (answerType === 'choice' || answerType === 'yesno') return;
  if (!LAYOUTS[answerType]) return;

  activeInput = input;
  activeSubmitFn = submitFn;
  input.setAttribute('inputmode', 'none');
  input.setAttribute('readonly', '');
  renderKeys(answerType);

  kbElement.classList.add('kb-visible');
  document.body.classList.add('kb-active');
}

export function hide() {
  if (kbElement) {
    kbElement.classList.remove('kb-visible');
  }
  document.body.classList.remove('kb-active');
  if (activeInput) {
    activeInput.removeAttribute('readonly');
  }
  activeInput = null;
  activeSubmitFn = null;
}

export function isVisible() {
  return kbElement && kbElement.classList.contains('kb-visible');
}
