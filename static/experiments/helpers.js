/**
 * helpers.js — Shared helpers for all experiments.
 *
 * Basic utilities, formatting, complex arithmetic, quantum gates,
 * Bloch sphere conversions, rotation gates, and ket formatting.
 */

// ── Basic utilities ──────────────────────────────────────────────────────────

export function rnd(lo, hi) { return Math.floor(Math.random() * (hi - lo + 1)) + lo; }
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function snap(val, step) { return Math.round(val / step) * step; }

export function makeLabel(text, style = '') {
  const el = document.createElement('div');
  el.style.cssText = `font-family:'Fira Code',monospace;font-size:14px;color:var(--text-muted);${style}`;
  el.textContent = text;
  return el;
}

export function makeBtn(text, cls = 'btn') {
  const btn = document.createElement('button');
  btn.className = cls;
  btn.style.cssText = "padding:10px 16px;font-size:14px;font-family:'Fira Code',monospace;font-weight:700;";
  btn.textContent = text;
  return btn;
}


// ── Formatting ───────────────────────────────────────────────────────────────

export function fmtN(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function fmtComplex(re, im) {
  const r = +re.toFixed(2);
  const i = +im.toFixed(2);
  if (i === 0) return `${r}`;
  if (r === 0) return i === 1 ? 'i' : i === -1 ? '\u2212i' : `${i}i`;
  const sign = i > 0 ? ' + ' : ' \u2212 ';
  const ai = Math.abs(i) === 1 ? '' : Math.abs(i);
  return `${r}${sign}${ai}i`;
}

export function fmtAngle(rad) {
  return (rad * 180 / Math.PI).toFixed(1) + '\u00B0';
}

export function addLine(parent, text) {
  const div = document.createElement('div');
  div.textContent = text;
  parent.appendChild(div);
}


// ── Complex arithmetic ───────────────────────────────────────────────────────

export function cmul(a, b) { return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }; }
export function cadd(a, b) { return { re: a.re + b.re, im: a.im + b.im }; }
export function cabs2(a) { return a.re * a.re + a.im * a.im; }
export function cabs(a) { return Math.sqrt(cabs2(a)); }


// ── Quantum gates & state ────────────────────────────────────────────────────

export const SQRT2_INV = 1 / Math.sqrt(2);
export const GATES = {
  X: [{ re: 0, im: 0 }, { re: 1, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }],
  Y: [{ re: 0, im: 0 }, { re: 0, im: -1 }, { re: 0, im: 1 }, { re: 0, im: 0 }],
  Z: [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: -1, im: 0 }],
  H: [{ re: SQRT2_INV, im: 0 }, { re: SQRT2_INV, im: 0 }, { re: SQRT2_INV, im: 0 }, { re: -SQRT2_INV, im: 0 }],
};

export function applyGate(gate, alpha, beta) {
  return [
    cadd(cmul(gate[0], alpha), cmul(gate[1], beta)),
    cadd(cmul(gate[2], alpha), cmul(gate[3], beta)),
  ];
}

export function stateToBloch(alpha, beta) {
  const absAlpha = cabs(alpha);
  const theta = 2 * Math.acos(Math.min(1, Math.max(0, absAlpha)));
  let phi = Math.atan2(beta.im, beta.re) - Math.atan2(alpha.im, alpha.re);
  phi = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return { theta, phi };
}

export function blochToState(theta, phi) {
  return [
    { re: Math.cos(theta / 2), im: 0 },
    { re: Math.sin(theta / 2) * Math.cos(phi), im: Math.sin(theta / 2) * Math.sin(phi) },
  ];
}

// Remove global phase so alpha is real and non-negative
export function normalizeGlobalPhase(alpha, beta) {
  if (cabs(alpha) < 1e-10) return [{ re: 0, im: 0 }, { re: cabs(beta), im: 0 }];
  const phase = Math.atan2(alpha.im, alpha.re);
  const c = Math.cos(-phase), s = Math.sin(-phase);
  return [
    { re: alpha.re * c - alpha.im * s, im: alpha.re * s + alpha.im * c },
    { re: beta.re * c - beta.im * s, im: beta.re * s + beta.im * c },
  ];
}

export function fmtKet(alpha, beta) {
  const a = Math.abs(alpha.re) < 0.005 ? 0 : +alpha.re.toFixed(2);
  const bre = +beta.re.toFixed(2);
  const bim = +beta.im.toFixed(2);
  let bStr;
  if (Math.abs(bim) < 0.005) {
    bStr = `${bre}`;
  } else if (Math.abs(bre) < 0.005) {
    bStr = bim === 1 ? 'i' : bim === -1 ? '\u2212i' : `${bim}i`;
  } else {
    const sign = bim > 0 ? '+' : '';
    bStr = `(${bre}${sign}${bim}i)`;
  }
  if (a === 0 && bre === 0 && bim === 0) return '|ψ⟩ = 0';
  if (a === 0) return `|ψ⟩ = ${bStr}|1⟩`;
  if (Math.abs(bre) < 0.005 && Math.abs(bim) < 0.005) return `|ψ⟩ = ${a}|0⟩`;
  const sign = bre >= 0 && bim >= 0 ? ' + ' : ' \u2212 ';
  const absB = sign === ' \u2212 ' ? fmtKetCoeff(-bre, -bim) : bStr;
  return `|ψ⟩ = ${a}|0⟩${sign}${absB}|1⟩`;
}

export function fmtKetCoeff(re, im) {
  if (Math.abs(im) < 0.005) return `${+re.toFixed(2)}`;
  if (Math.abs(re) < 0.005) return im === 1 ? 'i' : im === -1 ? '\u2212i' : `${+im.toFixed(2)}i`;
  const sign = im > 0 ? '+' : '';
  return `(${+re.toFixed(2)}${sign}${+im.toFixed(2)}i)`;
}

export function tensorProduct(stateA, stateB) {
  const result = [];
  for (let i = 0; i < stateA.length; i++) {
    for (let j = 0; j < stateB.length; j++) {
      result.push(cmul(stateA[i], stateB[j]));
    }
  }
  return result;
}

export function fmtKet2Q(state) {
  const labels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
  const terms = [];
  for (let i = 0; i < 4; i++) {
    const amp = state[i];
    if (cabs(amp) < 0.005) continue;
    const c = fmtKetCoeff(amp.re, amp.im);
    terms.push({ c, label: labels[i] });
  }
  if (terms.length === 0) return '|ψ⟩ = 0';
  let s = '|ψ⟩ = ';
  terms.forEach((t, idx) => {
    if (idx > 0) {
      if (t.c.startsWith('\u2212') || t.c.startsWith('-')) {
        s += ' \u2212 ' + (t.c.startsWith('\u2212') ? t.c.slice(1) : t.c.slice(1));
      } else {
        s += ' + ' + t.c;
      }
    } else {
      s += t.c;
    }
    s += t.label;
  });
  return s;
}


// ── Rotation gates ───────────────────────────────────────────────────────────

export function applyRx(state, theta) {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  // Rx(θ) = [[cos(θ/2), -i·sin(θ/2)], [-i·sin(θ/2), cos(θ/2)]]
  const [a, b] = state;
  return [
    { re: c * a.re + s * b.im, im: c * a.im - s * b.re },
    { re: s * a.im + c * b.re, im: -s * a.re + c * b.im },
  ];
}

export function applyRy(state, theta) {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  // Ry(θ) = [[cos(θ/2), -sin(θ/2)], [sin(θ/2), cos(θ/2)]]
  const [a, b] = state;
  return [
    { re: c * a.re - s * b.re, im: c * a.im - s * b.im },
    { re: s * a.re + c * b.re, im: s * a.im + c * b.im },
  ];
}

export function applyRz(state, theta) {
  // Rz(θ) = [[e^(-iθ/2), 0], [0, e^(iθ/2)]]
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  const [a, b] = state;
  return [
    { re: c * a.re + s * a.im, im: c * a.im - s * a.re },  // e^(-iθ/2) * a
    { re: c * b.re - s * b.im, im: c * b.im + s * b.re },  // e^(+iθ/2) * b
  ];
}

export function fmtKetFull(alpha, beta) {
  // Like fmtKet but shows complex alpha (needed when Rz introduces phase on |0⟩)
  function fc(c) {
    const re = Math.round(c.re * 100) / 100;
    const im = Math.round(c.im * 100) / 100;
    if (Math.abs(im) < 0.005) return `${re}`;
    if (Math.abs(re) < 0.005) return `${im}i`;
    return `(${re}${im >= 0 ? '+' : ''}${im}i)`;
  }
  const aStr = fc(alpha);
  const bStr = fc(beta);
  if (aStr === '0' && bStr === '0') return '|ψ⟩ = 0';
  if (aStr === '0') return `|ψ⟩ = ${bStr}|1⟩`;
  if (bStr === '0') return `|ψ⟩ = ${aStr}|0⟩`;
  return `|ψ⟩ = ${aStr}|0⟩ + ${bStr}|1⟩`;
}


// ── 3-qubit formatting ──────────────────────────────────────────────────────

export function fmtKet3Q(state) {
  const labels = ['|000⟩','|001⟩','|010⟩','|011⟩','|100⟩','|101⟩','|110⟩','|111⟩'];
  const terms = [];
  for (let i = 0; i < 8; i++) {
    const amp = state[i];
    if (cabs(amp) < 0.005) continue;
    const c = fmtKetCoeff(amp.re, amp.im);
    terms.push({ c, label: labels[i] });
  }
  if (terms.length === 0) return '0';
  let s = '';
  terms.forEach((t, idx) => {
    if (idx > 0) {
      if (t.c.startsWith('\u2212') || t.c.startsWith('-')) {
        s += ' \u2212 ' + (t.c.startsWith('\u2212') ? t.c.slice(1) : t.c.slice(1));
      } else {
        s += ' + ' + t.c;
      }
    } else {
      s += t.c;
    }
    s += t.label;
  });
  return s;
}
