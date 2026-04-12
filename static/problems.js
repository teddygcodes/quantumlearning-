/**
 * problems.js — Problem generation engine + deterministic answer checker.
 *
 * Each generator returns:
 *   { type, question, answer, answerDisplay, answerType, difficulty, steps }
 *
 * steps: string[] — worked solution shown when student answers incorrectly in practice.
 *
 * answerType values: 'numeric' | 'vector' | 'vector4' | 'vector8' | 'complex' | 'matrix' | 'yesno' | 'angle' | 'gate_name' | 'choice'
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rndNZ(min, max) {
  let n;
  do { n = rnd(min, max); } while (n === 0);
  return n;
}

function fmt(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function signStr(n) {
  return n >= 0 ? `+ ${Math.abs(n)}` : `- ${Math.abs(n)}`;
}

function fmtComplex(r, i) {
  if (i === 0)  return `${fmt(r)}`;
  if (r === 0) {
    if (i === 1)  return 'i';
    if (i === -1) return '-i';
    return `${fmt(i)}i`;
  }
  const sign    = i > 0 ? '+' : '-';
  const mag     = Math.abs(i);
  const imagStr = mag === 1 ? 'i' : `${fmt(mag)}i`;
  return `${fmt(r)} ${sign} ${imagStr}`;
}

// ── Answer Parsers ────────────────────────────────────────────────────────────

function parseNumeric(s) {
  const n = parseFloat(s.trim());
  return isNaN(n) ? null : n;
}

function parseVector(s) {
  const nums = s.replace(/[()[\]]/g, '').trim().split(/[\s,]+/).map(Number);
  return nums.length === 2 && !nums.some(isNaN) ? nums : null;
}

function parseVector4(s) {
  const nums = s.replace(/[()[\]]/g, '').trim().split(/[\s,]+/).map(Number);
  return nums.length === 4 && !nums.some(isNaN) ? nums : null;
}

function parseComplex(s) {
  const n = s.replace(/\s+/g, '').toLowerCase();
  if (/^-?\d+\.?\d*$/.test(n)) return [parseFloat(n), 0];
  const pi = n.match(/^(-?)(\d*\.?\d*)i$/);
  if (pi) {
    const sg = pi[1] === '-' ? -1 : 1;
    const m  = pi[2] === '' ? 1 : parseFloat(pi[2]);
    return [0, sg * (isNaN(m) ? 1 : m)];
  }
  const fc = n.match(/^(-?\d+\.?\d*)([+-])(\d*\.?\d*)i$/);
  if (fc) {
    const sg = fc[2] === '+' ? 1 : -1;
    const im = fc[3] === '' ? 1 : parseFloat(fc[3]);
    return [parseFloat(fc[1]), sg * im];
  }
  return null;
}

function parseMatrix(s) {
  const nums = s.replace(/[\[\]();]/g, ' ').split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
  return nums.length === 4 ? [[nums[0], nums[1]], [nums[2], nums[3]]] : null;
}

function parseVector8(s) {
  const nums = s.replace(/[()[\]]/g, '').trim().split(/[\s,]+/).map(Number);
  return nums.length === 8 && !nums.some(isNaN) ? nums : null;
}

function parseAngle(s) {
  const n = s.trim().toLowerCase().replace(/π/g, 'pi');
  if (/^-?\d+\.?\d*$/.test(n)) return parseFloat(n);
  const m = n.match(/^(-?)(\d*\.?\d*)\s*\*?\s*pi\s*(?:\/\s*(\d+\.?\d*))?$/);
  if (!m) return null;
  const sign  = m[1] === '-' ? -1 : 1;
  const coeff = m[2] === '' || m[2] === '.' ? 1 : parseFloat(m[2]);
  const denom = m[3] ? parseFloat(m[3]) : 1;
  if (isNaN(coeff) || isNaN(denom) || denom === 0) return null;
  return sign * coeff * Math.PI / denom;
}

function parseGateName(s) {
  return s.trim().toUpperCase().replace(/†/g, '†').replace(/\+/g, '+');
}

function parseChoice(s) {
  const c = s.trim().toUpperCase().replace(/[).:\s]/g, '');
  return c.length >= 1 ? c[0] : null;
}

// ── Answer Checker ────────────────────────────────────────────────────────────

const TOL = 0.02;

export function checkAnswer(userInput, problem) {
  const s = (userInput || '').trim();
  const { answerType: t, answer: a, answerDisplay } = problem;
  const fail = { correct: false, formattedAnswer: answerDisplay };
  if (!s) return fail;
  switch (t) {
    case 'numeric': {
      const p = parseNumeric(s);
      if (p === null) return fail;
      const ok = Math.abs(p - a) < TOL || (problem.acceptAlternate != null && Math.abs(p - problem.acceptAlternate) < TOL);
      return { correct: ok, formattedAnswer: answerDisplay };
    }
    case 'vector': {
      const p = parseVector(s);
      if (!p) return fail;
      return { correct: Math.abs(p[0]-a[0]) < TOL && Math.abs(p[1]-a[1]) < TOL, formattedAnswer: answerDisplay };
    }
    case 'vector4': {
      const p = parseVector4(s);
      if (!p) return fail;
      return { correct: p.every((v,i) => Math.abs(v - a[i]) < TOL), formattedAnswer: answerDisplay };
    }
    case 'complex': {
      const p = parseComplex(s);
      if (!p) return fail;
      return { correct: Math.abs(p[0]-a[0]) < TOL && Math.abs(p[1]-a[1]) < TOL, formattedAnswer: answerDisplay };
    }
    case 'matrix': {
      const p = parseMatrix(s);
      if (!p) return fail;
      return { correct: p.every((row,i) => row.every((v,j) => Math.abs(v-a[i][j]) < TOL)), formattedAnswer: answerDisplay };
    }
    case 'yesno': {
      const yn = s.toLowerCase();
      const got = yn === 'yes' || yn === 'y';
      return { correct: got === a, formattedAnswer: a ? 'yes' : 'no' };
    }
    case 'vector8': {
      const p = parseVector8(s);
      if (!p) return fail;
      return { correct: p.every((v,i) => Math.abs(v - a[i]) < TOL), formattedAnswer: answerDisplay };
    }
    case 'angle': {
      const p = parseAngle(s);
      if (p === null) return fail;
      return { correct: Math.abs(p - a) < TOL, formattedAnswer: answerDisplay };
    }
    case 'gate_name': {
      const p = parseGateName(s);
      if (!p) return fail;
      return { correct: p === a.toUpperCase(), formattedAnswer: answerDisplay };
    }
    case 'choice': {
      const p = parseChoice(s);
      if (!p) return fail;
      return { correct: p === a, formattedAnswer: answerDisplay };
    }
    default: return fail;
  }
}

// ── Chapter 1: Algebra ────────────────────────────────────────────────────────

function linearEquation(d, variation = 'basic') {
  let a, x, b;
  switch (variation) {
    case 'with_negatives':
      a = rnd(2, 5);
      x = rnd(1, 9);
      b = rnd(-9, -1);
      break;
    case 'larger_values':
      a = rnd(2, 9);
      x = rnd(-4, 9);
      b = rnd(-9, 9);
      break;
    case 'negative_solution':
      a = rnd(2, d < 2 ? 5 : 9);
      x = rnd(-8, -1);
      b = rnd(d < 2 ? 1 : -9, 9);
      break;
    default: // basic
      a = rnd(2, d < 2 ? 5 : 9);
      x = rnd(d < 2 ? 1 : -4, d < 2 ? 9 : 9);
      b = rnd(d < 2 ? 1 : -9, 9);
      break;
  }
  const c = a * x + b;
  return {
    type: 'linear_equation',
    question: `${a}x ${signStr(b)} = ${c}`,
    answer: x,
    answerDisplay: `${x}`,
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `Start: ${a}x ${signStr(b)} = ${c}`,
      `Subtract ${b >= 0 ? b : `(${b})`} from both sides: ${a}x = ${c} − ${b} = ${c - b}`,
      `Divide both sides by ${a}: x = ${c - b} ÷ ${a} = ${x}`,
      `Check: ${a}(${x}) ${signStr(b)} = ${a * x} ${signStr(b)} = ${c} ✓`,
    ],
  };
}

function substitution(d, variation = 'basic') {
  let x;
  switch (variation) {
    case 'with_negatives':
      x = rnd(-6, -1);
      break;
    case 'quadratic':
      x = rnd(d < 2 ? 1 : -4, d < 2 ? 6 : 8);
      break;
    default: // basic
      x = rnd(d < 2 ? 1 : -4, d < 2 ? 6 : 8);
      break;
  }
  const a      = rnd(1, 4);
  const b      = rnd(1, 9);
  const exprIdx = variation === 'quadratic' ? 2 : (d < 2 ? rnd(0, 1) : rnd(0, 2));
  let question, answer, steps;

  if (exprIdx === 0) {
    answer   = a * x + b;
    question = `If x = ${x}, find: ${a}x ${signStr(b)}`;
    steps = [
      `Substitute x = ${x}: ${a}(${x}) ${signStr(b)}`,
      `Multiply: ${a} × ${x} = ${a * x}`,
      `Add: ${a * x} ${signStr(b)} = ${answer}`,
    ];
  } else if (exprIdx === 1) {
    answer   = a * x * x + b;
    question = `If x = ${x}, find: ${a}x² ${signStr(b)}`;
    steps = [
      `Substitute x = ${x}: ${a}(${x})² ${signStr(b)}`,
      `Square first: ${x}² = ${x * x}`,
      `Multiply: ${a} × ${x * x} = ${a * x * x}`,
      `Add: ${a * x * x} ${signStr(b)} = ${answer}`,
    ];
  } else {
    const bSub = rnd(-5, 5);
    answer   = x * x + a * x + bSub;
    question = `If x = ${x}, find: x² + ${a}x ${signStr(bSub)}`;
    steps = [
      `Substitute x = ${x}: (${x})² + ${a}(${x}) ${signStr(bSub)}`,
      `x² = ${x * x}`,
      `${a}x = ${a * x}`,
      `Sum: ${x * x} + ${a * x} ${signStr(bSub)} = ${answer}`,
    ];
  }
  return { type: 'substitution', question, answer, answerDisplay: `${answer}`, answerType: 'numeric', difficulty: d, steps };
}

function squareRoot(d, variation = 'basic') {
  let bases;
  switch (variation) {
    case 'larger':
      bases = [11,12,13,14,15];
      break;
    case 'perfect_square_check':
      bases = [11,12,13,14,15,16,17,18,19,20];
      break;
    default: { // basic
      const smallBases = [2,3,4,5,6,7,8,9,10];
      const medBases   = [11,12,13,14,15];
      bases = d < 2 ? smallBases : d < 3 ? [...smallBases,...medBases] : [...smallBases,...medBases,rnd(16,25)];
      break;
    }
  }
  const base       = bases[rnd(0, bases.length - 1)];
  const n          = base * base;
  return {
    type: 'square_root',
    question: `√${n} = ?`,
    answer: base,
    answerDisplay: `${base}`,
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `We need a number that, multiplied by itself, gives ${n}.`,
      `${base} × ${base} = ${n}`,
      `Therefore √${n} = ${base}`,
    ],
  };
}

function exponent(d, variation = 'basic') {
  let base, exp;
  switch (variation) {
    case 'larger_base':
      base = rnd(2, 8);
      exp  = rnd(2, 3);
      break;
    case 'higher_power':
      base = rnd(2, 5);
      exp  = rnd(3, 5);
      break;
    default: // basic
      base = rnd(2, d < 2 ? 5 : 8);
      exp  = rnd(2, d < 2 ? 4 : 5);
      break;
  }
  const ans  = Math.pow(base, exp);
  const expansion = Array.from({length: exp}, () => base).join(' × ');
  return {
    type: 'exponent',
    question: `${base}^${exp} = ?`,
    answer: ans,
    answerDisplay: `${ans}`,
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `${base}^${exp} means multiply ${base} by itself ${exp} times.`,
      `${expansion} = ${ans}`,
    ],
  };
}

// ── Chapter 2: Vectors ────────────────────────────────────────────────────────

function vectorAddition(d, variation = 'basic') {
  let a, b, c, e;
  if (variation === 'with_negatives') {
    // Force at least one negative component
    [a, b, c, e] = [rnd(-8,8), rnd(-8,8), rnd(-8,8), rnd(-8,8)];
    // Ensure at least one is negative
    if (a >= 0 && b >= 0 && c >= 0 && e >= 0) {
      const idx = rnd(0, 3);
      const vals = [a, b, c, e];
      vals[idx] = rnd(-8, -1);
      [a, b, c, e] = vals;
    }
  } else if (variation === 'subtraction') {
    const r  = d < 2 ? 8 : 12;
    const lo = d < 2 ? 1 : -r;
    [a, b, c, e] = [rnd(lo,r), rnd(lo,r), rnd(lo,r), rnd(lo,r)];
    return {
      type: 'vector_addition',
      question: `(${a}, ${b}) - (${c}, ${e}) = ?`,
      answer: [a-c, b-e],
      answerDisplay: `(${a-c}, ${b-e})`,
      answerType: 'vector',
      difficulty: d,
      steps: [
        `Subtract x-components: ${a} - ${c} = ${a-c}`,
        `Subtract y-components: ${b} - ${e} = ${b-e}`,
        `Result: (${a-c}, ${b-e})`,
      ],
    };
  } else {
    // basic
    const r  = d < 2 ? 8 : 12;
    const lo = d < 2 ? 1 : -r;
    [a, b, c, e] = [rnd(lo,r), rnd(lo,r), rnd(lo,r), rnd(lo,r)];
  }
  return {
    type: 'vector_addition',
    question: `(${a}, ${b}) + (${c}, ${e}) = ?`,
    answer: [a+c, b+e],
    answerDisplay: `(${a+c}, ${b+e})`,
    answerType: 'vector',
    difficulty: d,
    steps: [
      `Add x-components: ${a} + ${c} = ${a+c}`,
      `Add y-components: ${b} + ${e} = ${b+e}`,
      `Result: (${a+c}, ${b+e})`,
    ],
  };
}

function scalarMultiplication(d, variation = 'basic') {
  let k, lo;
  switch (variation) {
    case 'negative_scalar':
      k  = rnd(-5, -2);
      lo = 1;
      break;
    case 'larger':
      k  = rndNZ(-6, 6);
      lo = -6;
      break;
    default: // basic
      k  = d < 2 ? rnd(2,5) : rndNZ(-6,6);
      lo = d < 2 ? 1 : -6;
      break;
  }
  const [a, b] = [rnd(lo,6), rnd(lo,6)];
  return {
    type: 'scalar_multiplication',
    question: `${k} × (${a}, ${b}) = ?`,
    answer: [k*a, k*b],
    answerDisplay: `(${k*a}, ${k*b})`,
    answerType: 'vector',
    difficulty: d,
    steps: [
      `Multiply each component by ${k}:`,
      `x: ${k} × ${a} = ${k*a}`,
      `y: ${k} × ${b} = ${k*b}`,
      `Result: (${k*a}, ${k*b})`,
    ],
  };
}

function vectorMagnitude(d, variation = 'basic') {
  const triples = [[3,4,5],[5,12,13],[6,8,10],[8,6,10],[4,3,5]];
  let a, b, mag;
  if (variation === 'with_negatives') {
    // Use Pythagorean triples but randomly negate components
    [a, b, mag] = triples[rnd(0, triples.length-1)];
    if (Math.random() < 0.5) a = -a;
    if (Math.random() < 0.5) b = -b;
    // Ensure at least one is negative
    if (a > 0 && b > 0) a = -a;
  } else if (variation === 'non_integer') {
    a   = rnd(1, 8);
    b   = rnd(1, 8);
    mag = Math.round(Math.sqrt(a*a + b*b) * 100) / 100;
  } else {
    // basic
    if (d < 2) {
      [a, b, mag] = triples[rnd(0, triples.length-1)];
    } else {
      a   = rnd(1, 8);
      b   = rnd(1, 8);
      mag = Math.round(Math.sqrt(a*a + b*b) * 100) / 100;
    }
  }
  // For triples (basic and with_negatives), mag is already set; for non_integer it's set above
  if (variation === 'with_negatives') {
    // mag stays the same (magnitude is always positive)
  }
  return {
    type: 'vector_magnitude',
    question: `|(${a}, ${b})| = ?`,
    answer: mag,
    answerDisplay: `${mag}`,
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `Formula: |(a, b)| = √(a² + b²)`,
      `Square each component: ${a}² = ${a*a},  ${b}² = ${b*b}`,
      `Add: ${a*a} + ${b*b} = ${a*a + b*b}`,
      `Square root: √${a*a + b*b} = ${mag}`,
    ],
  };
}

// ── Chapter 3: Unit Vectors ───────────────────────────────────────────────────

function normalizeVector(d, variation = 'basic') {
  const triples = [[3,4,5],[5,12,13],[6,8,10],[4,3,5],[12,5,13]];
  let a, b, magVal;
  if (variation === 'with_negatives') {
    const [ta,tb,tm] = triples[rnd(0, triples.length-1)];
    a = ta; b = tb; magVal = tm;
    // Randomly negate one component
    if (Math.random() < 0.5) { a = -a; } else { b = -b; }
  } else if (variation === 'non_triple') {
    a      = rndNZ(1,6);
    b      = rndNZ(1,6);
    magVal = Math.sqrt(a*a + b*b);
  } else {
    // basic
    if (d < 2) {
      const [ta,tb,tm] = triples[rnd(0, triples.length-1)];
      [a, b, magVal]   = [ta, tb, tm];
    } else {
      a      = rndNZ(1,6);
      b      = rndNZ(1,6);
      magVal = Math.sqrt(a*a + b*b);
    }
  }
  const n1 = Math.round((a/magVal)*100)/100;
  const n2 = Math.round((b/magVal)*100)/100;
  return {
    type: 'normalize_vector',
    question: `Normalize (${a}, ${b}):`,
    answer: [n1, n2],
    answerDisplay: `(${n1}, ${n2})`,
    answerType: 'vector',
    difficulty: d,
    steps: [
      `Step 1 — find magnitude: |(${a}, ${b})| = √(${a}² + ${b}²) = √${a*a + b*b} = ${fmt(magVal)}`,
      `Step 2 — divide each component by ${fmt(magVal)}:`,
      `x: ${a} ÷ ${fmt(magVal)} = ${n1}`,
      `y: ${b} ÷ ${fmt(magVal)} = ${n2}`,
      `Result: (${n1}, ${n2})`,
      `Check: √(${n1}² + ${n2}²) = √(${(n1*n1+n2*n2).toFixed(2)}) ≈ 1 ✓`,
    ],
  };
}

function unitVectorCheck(d, variation = 'basic') {
  let isUnit, a, b;
  if (variation === 'diagonal') {
    isUnit = Math.random() > 0.5;
    if (isUnit) {
      // Diagonal unit vectors: (1/sqrt2, 1/sqrt2) and similar
      const s = Math.round(1/Math.sqrt(2)*100)/100; // 0.71
      const opts = [[s, s], [s, -s], [-s, s], [-s, -s]];
      [a, b] = opts[rnd(0, opts.length-1)];
    } else {
      a = rnd(2,6);
      b = rnd(1,5);
    }
  } else if (variation === 'tricky_no') {
    isUnit = false;
    // Vectors with magnitude close to 1 but not exactly 1
    const trickyPairs = [[0.6, 0.7], [0.5, 0.8], [0.7, 0.8], [0.3, 0.9], [0.8, 0.5]];
    [a, b] = trickyPairs[rnd(0, trickyPairs.length-1)];
  } else {
    // basic
    isUnit = Math.random() > 0.5;
    if (isUnit) {
      const units = [[1,0],[0,1],[-1,0],[0,-1]];
      [a, b] = units[rnd(0, units.length-1)];
    } else {
      a = rnd(2,6);
      b = rnd(1,5);
    }
  }
  const mag    = Math.round(Math.sqrt(a*a+b*b)*100)/100;
  return {
    type: 'unit_vector_check',
    question: `Is (${a}, ${b}) a unit vector? (yes or no)`,
    answer: isUnit,
    answerDisplay: isUnit ? 'yes' : 'no',
    answerType: 'yesno',
    difficulty: d,
    steps: [
      `Compute the magnitude: |(${a}, ${b})| = √(${a}² + ${b}²)`,
      `= √(${a*a} + ${b*b}) = √${a*a+b*b} = ${mag}`,
      isUnit
        ? `${mag} = 1, so yes — this is a unit vector.`
        : `${mag} ≠ 1, so no — this is not a unit vector.`,
    ],
  };
}

function probabilityFromComponents(d, variation = 'basic') {
  if (variation === 'simple_fractions') {
    // Use 1/sqrt(2) so P = 0.5
    const s = (1/Math.sqrt(2)).toFixed(2); // "0.71"
    return {
      type: 'probability_from_components',
      question: `|ψ⟩ = ${s}|0⟩ + ${s}|1⟩\nP(measure |0⟩) = ?`,
      answer: 0.5,
      answerDisplay: `0.5`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `P(|0⟩) = α² where α is the amplitude of |0⟩`,
        `α = ${s} = 1/√2`,
        `α² = (1/√2)² = 1/2 = 0.5`,
        `Check: β² = ${s}² = 0.5,  α²+β² = 0.5 + 0.5 = 1.00 ✓`,
      ],
    };
  }

  const triples = [[3,4,5],[5,12,13],[4,3,5],[6,8,10]];
  const [ta,tb,tm] = triples[rnd(0, triples.length-1)];
  const alpha = (ta/tm).toFixed(2);
  const beta  = (tb/tm).toFixed(2);

  if (variation === 'find_beta') {
    // Ask for P(|1⟩) = beta² instead of P(|0⟩) = alpha²
    const prob = Math.round((tb/tm)**2 * 100)/100;
    return {
      type: 'probability_from_components',
      question: `|ψ⟩ = ${alpha}|0⟩ + ${beta}|1⟩\nP(measure |1⟩) = ?`,
      answer: prob,
      answerDisplay: `${prob}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `P(|1⟩) = β² where β is the amplitude of |1⟩`,
        `β = ${beta}`,
        `β² = ${beta}² = ${prob}`,
        `Check: α² = ${alpha}² = ${Math.round((ta/tm)**2*100)/100},  α²+β² = ${Math.round((ta/tm)**2*100)/100} + ${prob} = 1.00 ✓`,
      ],
    };
  }

  // basic
  const prob  = Math.round((ta/tm)**2 * 100)/100;
  return {
    type: 'probability_from_components',
    question: `|ψ⟩ = ${alpha}|0⟩ + ${beta}|1⟩\nP(measure |0⟩) = ?`,
    answer: prob,
    answerDisplay: `${prob}`,
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `P(|0⟩) = α² where α is the amplitude of |0⟩`,
      `α = ${alpha}`,
      `α² = ${alpha}² = ${prob}`,
      `Check: β² = ${beta}² = ${Math.round((tb/tm)**2*100)/100},  α²+β² = ${prob} + ${Math.round((tb/tm)**2*100)/100} = 1.00 ✓`,
    ],
  };
}

// ── Chapter 4: Complex Numbers ────────────────────────────────────────────────

function complexAddition(d, variation = 'basic') {
  if (variation === 'with_negatives') {
    const [a,b,c,e] = [rndNZ(-6,6), rndNZ(-6,6), rndNZ(-6,6), rndNZ(-6,6)];
    return {
      type: 'complex_addition',
      question: `(${fmtComplex(a,b)}) + (${fmtComplex(c,e)}) = ?`,
      answer: [a+c, b+e],
      answerDisplay: fmtComplex(a+c, b+e),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `Add real parts: ${a} + ${c} = ${a+c}`,
        `Add imaginary parts: ${b} + ${e} = ${b+e}`,
        `Result: ${fmtComplex(a+c, b+e)}`,
      ],
    };
  } else if (variation === 'one_pure_real') {
    const r = 8;
    const a = rnd(1,r), b = rnd(1,r), c = rnd(1,r), e = rnd(1,r);
    const zeroFirst = Math.random() > 0.5;
    const rb = zeroFirst ? 0 : b;
    const re = zeroFirst ? e : 0;
    return {
      type: 'complex_addition',
      question: `(${fmtComplex(a,rb)}) + (${fmtComplex(c,re)}) = ?`,
      answer: [a+c, rb+re],
      answerDisplay: fmtComplex(a+c, rb+re),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `Add real parts: ${a} + ${c} = ${a+c}`,
        `Add imaginary parts: ${rb} + ${re} = ${rb+re}`,
        `Result: ${fmtComplex(a+c, rb+re)}`,
      ],
    };
  } else if (variation === 'three_terms') {
    const r = 6;
    const [a1,b1,a2,b2,a3,b3] = [rnd(1,r),rnd(1,r),rnd(1,r),rnd(1,r),rnd(1,r),rnd(1,r)];
    const rr = a1+a2+a3, ri = b1+b2+b3;
    return {
      type: 'complex_addition',
      question: `(${fmtComplex(a1,b1)}) + (${fmtComplex(a2,b2)}) + (${fmtComplex(a3,b3)}) = ?`,
      answer: [rr, ri],
      answerDisplay: fmtComplex(rr, ri),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `Add real parts: ${a1} + ${a2} + ${a3} = ${rr}`,
        `Add imaginary parts: ${b1} + ${b2} + ${b3} = ${ri}`,
        `Result: ${fmtComplex(rr, ri)}`,
      ],
    };
  } else {
    // basic — identical to original
    const r  = d < 2 ? 6 : 8;
    const lo = d < 2 ? 1 : -r;
    const [a,b,c,e] = [rnd(lo,r), rnd(lo,r), rnd(lo,r), rnd(lo,r)];
    return {
      type: 'complex_addition',
      question: `(${fmtComplex(a,b)}) + (${fmtComplex(c,e)}) = ?`,
      answer: [a+c, b+e],
      answerDisplay: fmtComplex(a+c, b+e),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `Add real parts: ${a} + ${c} = ${a+c}`,
        `Add imaginary parts: ${b} + ${e} = ${b+e}`,
        `Result: ${fmtComplex(a+c, b+e)}`,
      ],
    };
  }
}

function complexMultiplication(d, variation = 'basic') {
  let a, b, c, e;
  if (variation === 'by_i') {
    const r = 4;
    a = rnd(1,r); b = rndNZ(-r,r);
    c = 0; e = 1;
  } else if (variation === 'with_negatives') {
    const r = 6;
    a = rndNZ(-r,r); b = rndNZ(-r,r); c = rndNZ(-r,r); e = rndNZ(-r,r);
  } else {
    // basic — identical to original
    const r = d < 2 ? 4 : 6;
    a = rnd(1,r); b = rndNZ(-r,r); c = rnd(1,r); e = rndNZ(-r,r);
  }
  const re = a*c - b*e;
  const im = a*e + b*c;
  return {
    type: 'complex_multiplication',
    question: `(${fmtComplex(a,b)}) × (${fmtComplex(c,e)}) = ?`,
    answer: [re, im],
    answerDisplay: fmtComplex(re, im),
    answerType: 'complex',
    difficulty: d,
    steps: [
      `FOIL: (${a})(${c}) + (${a})(${e}i) + (${b}i)(${c}) + (${b}i)(${e}i)`,
      `= ${a*c} + ${a*e}i + ${b*c}i + ${b*e}i²`,
      `Replace i² = −1:  ${b*e}i² = ${b*e}(−1) = ${-b*e}`,
      `Real part: ${a*c} + (${-b*e}) = ${re}`,
      `Imaginary part: ${a*e} + ${b*c} = ${im}`,
      `Result: ${fmtComplex(re, im)}`,
    ],
  };
}

function complexConjugate(d, variation = 'basic') {
  if (variation === 'pure_imaginary') {
    const b = rndNZ(-6,6);
    return {
      type: 'complex_conjugate',
      question: `Conjugate of ${fmtComplex(0,b)} = ?`,
      answer: [0, -b],
      answerDisplay: fmtComplex(0, -b),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `The conjugate flips the sign of the imaginary part only.`,
        `Original: ${fmtComplex(0,b)}`,
        `Flip sign of imaginary part (${b} → ${-b}):`,
        `Conjugate: ${fmtComplex(0,-b)}`,
      ],
    };
  } else if (variation === 'double_conjugate') {
    const a = rnd(-6,6), b = rndNZ(-6,6);
    return {
      type: 'complex_conjugate',
      question: `What is the conjugate of the conjugate of ${fmtComplex(a,b)}?`,
      answer: [a, b],
      answerDisplay: fmtComplex(a, b),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `The conjugate flips the sign of the imaginary part.`,
        `First conjugate of ${fmtComplex(a,b)}: ${fmtComplex(a,-b)}`,
        `Second conjugate of ${fmtComplex(a,-b)}: ${fmtComplex(a,b)}`,
        `The conjugate of the conjugate returns the original number.`,
      ],
    };
  } else {
    // basic — identical to original
    const a = rnd(-6,6), b = rndNZ(-6,6);
    return {
      type: 'complex_conjugate',
      question: `Conjugate of ${fmtComplex(a,b)} = ?`,
      answer: [a, -b],
      answerDisplay: fmtComplex(a, -b),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `The conjugate flips the sign of the imaginary part only.`,
        `Original: ${fmtComplex(a,b)}`,
        `Flip sign of imaginary part (${b} → ${-b}):`,
        `Conjugate: ${fmtComplex(a,-b)}`,
      ],
    };
  }
}

function complexMagnitude(d, variation = 'basic') {
  if (variation === 'with_negatives') {
    const triples = [[3,4,5],[5,12,13],[6,8,10],[4,3,5],[8,6,10]];
    const [ta,tb,tm] = triples[rnd(0, triples.length-1)];
    const a = Math.random() > 0.5 ? -ta : ta;
    const b = Math.random() > 0.5 ? -tb : tb;
    return {
      type: 'complex_magnitude',
      question: `|${fmtComplex(a,b)}| = ?`,
      answer: tm,
      answerDisplay: `${tm}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `Formula: |a + bi| = √(a² + b²)`,
        `Square each part: ${a}² = ${a*a},  ${b}² = ${b*b}`,
        `Add: ${a*a} + ${b*b} = ${a*a + b*b}`,
        `Square root: √${a*a + b*b} = ${tm}`,
      ],
    };
  } else if (variation === 'pure_real_or_imag') {
    const val = rnd(1, 12);
    const useReal = Math.random() > 0.5;
    const a = useReal ? val : 0;
    const b = useReal ? 0 : val;
    return {
      type: 'complex_magnitude',
      question: `|${fmtComplex(a,b)}| = ?`,
      answer: val,
      answerDisplay: `${val}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `Formula: |a + bi| = √(a² + b²)`,
        `Square each part: ${a}² = ${a*a},  ${b}² = ${b*b}`,
        `Add: ${a*a} + ${b*b} = ${a*a + b*b}`,
        `Square root: √${a*a + b*b} = ${val}`,
      ],
    };
  } else {
    // basic — identical to original
    const triples = [[3,4,5],[5,12,13],[6,8,10],[4,3,5],[8,6,10]];
    const [ta,tb,tm] = triples[rnd(0, triples.length-1)];
    const a = d > 1 && Math.random() > 0.5 ? -ta : ta;
    const b = d > 1 && Math.random() > 0.5 ? -tb : tb;
    return {
      type: 'complex_magnitude',
      question: `|${fmtComplex(a,b)}| = ?`,
      answer: tm,
      answerDisplay: `${tm}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `Formula: |a + bi| = √(a² + b²)`,
        `Square each part: ${a}² = ${a*a},  ${b}² = ${b*b}`,
        `Add: ${a*a} + ${b*b} = ${a*a + b*b}`,
        `Square root: √${a*a + b*b} = ${tm}`,
      ],
    };
  }
}

// ── Chapter 5: Matrices ───────────────────────────────────────────────────────

function matrixVectorMultiply(d, variation = 'basic') {
  let a, b, c, e, x, y;
  if (variation === 'with_negatives') {
    const r = 3;
    [a,b,c,e] = [rnd(-3,r), rnd(-3,r), rnd(-3,r), rnd(-3,r)];
    [x,y]     = [rnd(-3, r), rnd(-3, r)];
  } else if (variation === 'identity_check') {
    a = 1; b = 0; c = 0; e = 1;
    const r = 5;
    [x,y] = [rnd(1, r), rnd(1, r)];
  } else {
    // basic — identical to original
    const r  = d < 2 ? 3 : 5;
    const lo = d < 2 ? 0 : -r;
    [a,b,c,e] = [rnd(lo,r), rnd(lo,r), rnd(lo,r), rnd(lo,r)];
    [x,y]     = [rnd(d<2?1:-r, r), rnd(d<2?1:-r, r)];
  }
  const r1 = a*x + b*y;
  const r2 = c*x + e*y;
  return {
    type: 'matrix_vector_multiply',
    question: `[[${a},${b}],[${c},${e}]] × (${x},${y}) = ?`,
    answer: [r1, r2],
    answerDisplay: `(${r1}, ${r2})`,
    answerType: 'vector',
    difficulty: d,
    steps: [
      `Multiply each row by the vector:`,
      `Row 1: ${a}×${x} + ${b}×${y} = ${a*x} + ${b*y} = ${r1}`,
      `Row 2: ${c}×${x} + ${e}×${y} = ${c*x} + ${e*y} = ${r2}`,
      `Result: (${r1}, ${r2})`,
    ],
  };
}

function matrixMatrixMultiply(d, variation = 'basic') {
  let a, b, c, e, f, g, h, k;
  if (variation === 'with_negatives') {
    const r = 3;
    [a,b,c,e] = [rnd(-3,r), rnd(-3,r), rnd(-3,r), rnd(-3,r)];
    [f,g,h,k] = [rnd(-3,r), rnd(-3,r), rnd(-3,r), rnd(-3,r)];
  } else if (variation === 'identity_product') {
    const r = 4;
    const lo = 0;
    if (Math.random() > 0.5) {
      [a,b,c,e] = [rnd(lo,r), rnd(lo,r), rnd(lo,r), rnd(lo,r)];
      [f,g,h,k] = [1, 0, 0, 1];
    } else {
      [a,b,c,e] = [1, 0, 0, 1];
      [f,g,h,k] = [rnd(lo,r), rnd(lo,r), rnd(lo,r), rnd(lo,r)];
    }
  } else {
    // basic — identical to original
    const r  = d < 2 ? 3 : 4;
    const lo = d < 2 ? 0 : -r;
    [a,b,c,e] = [rnd(lo,r), rnd(lo,r), rnd(lo,r), rnd(lo,r)];
    [f,g,h,k] = [rnd(lo,r), rnd(lo,r), rnd(lo,r), rnd(lo,r)];
  }
  const r11=a*f+b*h, r12=a*g+b*k, r21=c*f+e*h, r22=c*g+e*k;
  return {
    type: 'matrix_matrix_multiply',
    question: `[[${a},${b}],[${c},${e}]] × [[${f},${g}],[${h},${k}]] = ?\n(format: a b; c d)`,
    answer: [[r11,r12],[r21,r22]],
    answerDisplay: `${r11} ${r12}; ${r21} ${r22}`,
    answerType: 'matrix',
    difficulty: d,
    steps: [
      `Top-left:   ${a}×${f} + ${b}×${h} = ${a*f} + ${b*h} = ${r11}`,
      `Top-right:  ${a}×${g} + ${b}×${k} = ${a*g} + ${b*k} = ${r12}`,
      `Bot-left:   ${c}×${f} + ${e}×${h} = ${c*f} + ${e*h} = ${r21}`,
      `Bot-right:  ${c}×${g} + ${e}×${k} = ${c*g} + ${e*k} = ${r22}`,
      `Result: [[${r11}, ${r12}], [${r21}, ${r22}]]`,
    ],
  };
}

function identityMatrix(d, variation = 'basic') {
  if (variation === 'varied_matrix') {
    const [a,b,c,e] = [rnd(1,9), rnd(0,9), rnd(0,9), rnd(1,9)];
    return {
      type: 'identity_matrix',
      question: `[[${a},${b}],[${c},${e}]] × I = ?\n(format: a b; c d)`,
      answer: [[a,b],[c,e]],
      answerDisplay: `${a} ${b}; ${c} ${e}`,
      answerType: 'matrix',
      difficulty: d,
      steps: [
        `Multiplying any matrix A by the identity matrix I gives A back unchanged.`,
        `A × I = A`,
        `Result: [[${a}, ${b}], [${c}, ${e}]]`,
      ],
    };
  } else {
    // basic — identical to original
    if (Math.random() > 0.5) {
      return {
        type: 'identity_matrix',
        question: 'What is the 2×2 identity matrix?\n(format: a b; c d)',
        answer: [[1,0],[0,1]],
        answerDisplay: '1 0; 0 1',
        answerType: 'matrix',
        difficulty: d,
        steps: [
          `The identity matrix I leaves any vector unchanged: I×v = v.`,
          `It has 1s on the diagonal and 0s everywhere else.`,
          `I = [[1, 0], [0, 1]]`,
        ],
      };
    }
    const [a,b,c,e] = [rnd(1,5), rnd(0,4), rnd(0,4), rnd(1,5)];
    return {
      type: 'identity_matrix',
      question: `[[${a},${b}],[${c},${e}]] × I = ?\n(format: a b; c d)`,
      answer: [[a,b],[c,e]],
      answerDisplay: `${a} ${b}; ${c} ${e}`,
      answerType: 'matrix',
      difficulty: d,
      steps: [
        `Multiplying any matrix A by the identity matrix I gives A back unchanged.`,
        `A × I = A`,
        `Result: [[${a}, ${b}], [${c}, ${e}]]`,
      ],
    };
  }
}

// ── Chapter 6: Dirac Notation ────────────────────────────────────────────────

function ketToVector(d, variation = 'basic') {
  let a, b;
  if (variation === 'with_negatives') {
    a = rndNZ(-6, 6);
    b = rndNZ(-6, 6);
  } else if (variation === 'decimal') {
    const triples = [[3,4,5],[6,8,10],[5,12,13],[4,3,5]];
    const [ta,tb,tm] = triples[rnd(0, triples.length-1)];
    a = Math.round((ta / tm) * 100) / 100;
    b = Math.round((tb / tm) * 100) / 100;
  } else {
    // basic — identical to original
    a = d < 2 ? rnd(1, 6) : rndNZ(-6, 6);
    b = d < 2 ? rnd(1, 6) : rndNZ(-6, 6);
  }
  return {
    type: 'ket_to_vector',
    question: `Write ${a}|0⟩ + ${b}|1⟩ as a vector (x, y):`,
    answer: [a, b],
    answerDisplay: `(${a}, ${b})`,
    answerType: 'vector',
    difficulty: d,
    steps: [
      `|0⟩ = (1, 0) and |1⟩ = (0, 1)`,
      `α|0⟩ + β|1⟩ = (α, β)`,
      `Here α = ${a}, β = ${b}`,
      `Result: (${a}, ${b})`,
    ],
  };
}

function innerProduct(d, variation = 'basic') {
  let a1, a2, b1, b2;
  if (variation === 'with_negatives') {
    const r = 5;
    a1 = rndNZ(-r, r); a2 = rndNZ(-r, r);
    b1 = rndNZ(-r, r); b2 = rndNZ(-r, r);
  } else if (variation === 'orthogonal') {
    a1 = rndNZ(1, 5); a2 = rndNZ(1, 5);
    if (Math.random() > 0.5) {
      b1 = -a2; b2 = a1;
    } else {
      b1 = a2; b2 = -a1;
    }
  } else {
    // basic — identical to original
    const r = d < 2 ? 5 : 8;
    const lo = d < 2 ? 1 : -r;
    a1 = rnd(lo, r); a2 = rnd(lo, r);
    b1 = rnd(lo, r); b2 = rnd(lo, r);
  }
  const dot = a1 * b1 + a2 * b2;
  return {
    type: 'inner_product',
    question: `⟨ψ|φ⟩ where |ψ⟩ = (${a1}, ${a2}), |φ⟩ = (${b1}, ${b2}):`,
    answer: dot,
    answerDisplay: `${dot}`,
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `⟨ψ|φ⟩ = ψ₁φ₁ + ψ₂φ₂`,
      `= ${a1}×${b1} + ${a2}×${b2}`,
      `= ${a1 * b1} + ${a2 * b2}`,
      `= ${dot}`,
    ],
  };
}

function orthogonalityCheck(d, variation = 'basic') {
  let a1, a2, b1, b2;
  if (variation === 'forced_yes') {
    a1 = rndNZ(1, 5);
    a2 = rndNZ(1, 5);
    if (Math.random() > 0.5) {
      b1 = -a2; b2 = a1;
    } else {
      b1 = a2; b2 = -a1;
    }
  } else if (variation === 'close_but_no') {
    // Generate vectors with a small but non-zero inner product (1 or 2)
    a1 = rndNZ(1, 5);
    a2 = rndNZ(1, 5);
    // Start with orthogonal, then perturb
    if (Math.random() > 0.5) {
      b1 = -a2; b2 = a1;
    } else {
      b1 = a2; b2 = -a1;
    }
    // Add 1 to b2 to make inner product small but non-zero
    const target = Math.random() > 0.5 ? 1 : 2;
    b2 += target;
    // If somehow still zero, bump again
    if (a1 * b1 + a2 * b2 === 0) b2 += 1;
  } else {
    // basic — identical to original
    const isOrtho = Math.random() > 0.5;
    if (isOrtho) {
      a1 = rndNZ(1, 5);
      a2 = rndNZ(1, 5);
      if (Math.random() > 0.5) {
        b1 = -a2; b2 = a1;
      } else {
        b1 = a2; b2 = -a1;
      }
    } else {
      a1 = rndNZ(1, 5);
      a2 = rndNZ(1, 5);
      b1 = rndNZ(1, 5);
      b2 = rndNZ(1, 5);
      if (a1 * b1 + a2 * b2 === 0) b2 += 1;
    }
  }
  const dot = a1 * b1 + a2 * b2;
  return {
    type: 'orthogonality_check',
    question: `Are (${a1}, ${a2}) and (${b1}, ${b2}) orthogonal? (yes or no)`,
    answer: dot === 0,
    answerDisplay: dot === 0 ? 'yes' : 'no',
    answerType: 'yesno',
    difficulty: d,
    steps: [
      `Compute the inner product: ${a1}×${b1} + ${a2}×${b2}`,
      `= ${a1 * b1} + ${a2 * b2} = ${dot}`,
      dot === 0
        ? `Inner product = 0 → orthogonal ✓`
        : `Inner product = ${dot} ≠ 0 → not orthogonal ✗`,
    ],
  };
}

function diracProbability(d, variation = 'basic') {
  if (variation === 'measure_one') {
    const triples = [[3,4,5],[5,12,13],[4,3,5],[6,8,10],[8,6,10]];
    const [ta, tb, tm] = triples[rnd(0, triples.length - 1)];
    const alpha = Math.round((ta / tm) * 100) / 100;
    const beta  = Math.round((tb / tm) * 100) / 100;
    const prob = Math.round(beta * beta * 100) / 100;
    return {
      type: 'dirac_probability',
      question: `|ψ⟩ = ${alpha}|0⟩ + ${beta}|1⟩\nP(|1⟩) = ?`,
      answer: prob,
      answerDisplay: `${prob}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `P(|1⟩) = |⟨1|ψ⟩|²`,
        `The amplitude for |1⟩ is ${beta}`,
        `P = ${beta}² = ${prob}`,
      ],
    };
  } else if (variation === 'equal_superposition') {
    const alpha = 0.71;
    const beta = 0.71;
    const prob = Math.round(alpha * alpha * 100) / 100;
    const measureZero = Math.random() > 0.5;
    const label = measureZero ? '|0⟩' : '|1⟩';
    return {
      type: 'dirac_probability',
      question: `|ψ⟩ = ${alpha}|0⟩ + ${beta}|1⟩\nP(${label}) = ?`,
      answer: prob,
      answerDisplay: `${prob}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `P(${label}) = |⟨${label.replace(/[|⟩]/g, '')}|ψ⟩|²`,
        `The amplitude for ${label} is ${alpha}`,
        `P = ${alpha}² = ${prob}`,
      ],
    };
  } else {
    // basic — identical to original
    const triples = [[3,4,5],[5,12,13],[4,3,5],[6,8,10],[8,6,10]];
    const [ta, tb, tm] = triples[rnd(0, triples.length - 1)];
    const alpha = Math.round((ta / tm) * 100) / 100;
    const beta  = Math.round((tb / tm) * 100) / 100;
    const measureZero = d < 2 || Math.random() > 0.5;
    const prob = measureZero
      ? Math.round(alpha * alpha * 100) / 100
      : Math.round(beta * beta * 100) / 100;
    const label = measureZero ? '|0⟩' : '|1⟩';
    const amp   = measureZero ? alpha : beta;
    return {
      type: 'dirac_probability',
      question: `|ψ⟩ = ${alpha}|0⟩ + ${beta}|1⟩\nP(${label}) = ?`,
      answer: prob,
      answerDisplay: `${prob}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `P(${label}) = |⟨${label.replace(/[|⟩]/g, '')}|ψ⟩|²`,
        `The amplitude for ${label} is ${amp}`,
        `P = ${amp}² = ${prob}`,
      ],
    };
  }
}

// ── Chapter 7: Quantum Gates ─────────────────────────────────────────────────

function pauliGateApply(d, variation = 'basic') {
  let useX, a, b;
  if (variation === 'x_only') {
    useX = true;
    const r = d < 2 ? 5 : 8;
    const lo = d < 2 ? 1 : -r;
    a = rnd(lo, r); b = rnd(lo, r);
  } else if (variation === 'z_only') {
    useX = false;
    const r = d < 2 ? 5 : 8;
    const lo = d < 2 ? 1 : -r;
    a = rnd(lo, r); b = rnd(lo, r);
  } else if (variation === 'superposition_input') {
    useX = Math.random() > 0.5;
    const triples = [[3,4,5],[4,3,5],[6,8,10],[8,6,10]];
    const [ta, tb, tm] = triples[rnd(0, triples.length-1)];
    a = Math.round((ta / tm) * 100) / 100;
    b = Math.round((tb / tm) * 100) / 100;
  } else {
    // basic — identical to original
    useX = Math.random() > 0.5;
    const r = d < 2 ? 5 : 8;
    const lo = d < 2 ? 1 : -r;
    a = rnd(lo, r); b = rnd(lo, r);
  }
  const gateName = useX ? 'X' : 'Z';
  let r1, r2;
  if (useX) {
    r1 = b; r2 = a;
  } else {
    r1 = a; r2 = -b;
  }
  // Round for decimal inputs
  r1 = Math.round(r1 * 100) / 100;
  r2 = Math.round(r2 * 100) / 100;
  const matrix = useX ? '[[0,1],[1,0]]' : '[[1,0],[0,−1]]';
  return {
    type: 'pauli_gate_apply',
    question: `Apply ${gateName} to (${a}, ${b}):\n${gateName} = ${matrix}`,
    answer: [r1, r2],
    answerDisplay: `(${r1}, ${r2})`,
    answerType: 'vector',
    difficulty: d,
    steps: useX ? [
      `X = [[0,1],[1,0]] swaps the two components.`,
      `Row 1: 0×${a} + 1×${b} = ${r1}`,
      `Row 2: 1×${a} + 0×${b} = ${r2}`,
      `Result: (${r1}, ${r2})`,
    ] : [
      `Z = [[1,0],[0,−1]] negates the second component.`,
      `Row 1: 1×${a} + 0×${b} = ${r1}`,
      `Row 2: 0×${a} + (−1)×${b} = ${r2}`,
      `Result: (${r1}, ${r2})`,
    ],
  };
}

function hadamardApply(d, variation = 'basic') {
  const h = 0.71;
  let a, b;
  if (variation === 'basis_only') {
    const useBasis0 = Math.random() > 0.5;
    a = useBasis0 ? 1 : 0;
    b = useBasis0 ? 0 : 1;
  } else if (variation === 'general_input') {
    a = rndNZ(-3, 3);
    b = rndNZ(-3, 3);
  } else {
    // basic: original logic
    if (d < 2) {
      const useBasis0 = Math.random() > 0.5;
      a = useBasis0 ? 1 : 0;
      b = useBasis0 ? 0 : 1;
    } else {
      a = rndNZ(-3, 3);
      b = rndNZ(-3, 3);
    }
  }
  const r1 = Math.round((h * a + h * b) * 100) / 100;
  const r2 = Math.round((h * a - h * b) * 100) / 100;
  return {
    type: 'hadamard_apply',
    question: `Apply H to (${a}, ${b}):\nH = (1/√2)[[1,1],[1,−1]]`,
    answer: [r1, r2],
    answerDisplay: `(${fmt(r1)}, ${fmt(r2)})`,
    answerType: 'vector',
    difficulty: d,
    steps: [
      `H ≈ [[0.71, 0.71], [0.71, −0.71]]`,
      `Row 1: 0.71×${a} + 0.71×${b} = ${fmt(r1)}`,
      `Row 2: 0.71×${a} + (−0.71)×${b} = ${fmt(r2)}`,
      `Result: (${fmt(r1)}, ${fmt(r2)})`,
    ],
  };
}

function gateThenMeasure(d, variation = 'basic') {
  const triples = [[3,4,5],[4,3,5],[6,8,10],[8,6,10]];
  const [ta, tb, tm] = triples[rnd(0, triples.length - 1)];
  const alpha = Math.round((ta / tm) * 100) / 100;
  const beta  = Math.round((tb / tm) * 100) / 100;
  const h = 0.71;

  if (variation === 'measure_one') {
    const newBeta = Math.round((h * alpha - h * beta) * 100) / 100;
    const prob = Math.round(newBeta * newBeta * 100) / 100;
    return {
      type: 'gate_then_measure',
      question: `Apply H to (${alpha}, ${beta}), then find P(|1⟩):`,
      answer: prob,
      answerDisplay: `${prob}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `Step 1 — Apply H: new β' = 0.71×${alpha} − 0.71×${beta}`,
        `= 0.71×${(alpha - beta).toFixed(2)} = ${fmt(newBeta)}`,
        `Step 2 — P(|1⟩) = β'² = ${fmt(newBeta)}² = ${prob}`,
      ],
    };
  }

  if (variation === 'x_then_measure') {
    // X gate swaps components: (alpha, beta) -> (beta, alpha), then P(|0⟩) = beta²
    const prob = Math.round(beta * beta * 100) / 100;
    return {
      type: 'gate_then_measure',
      question: `Apply X to (${alpha}, ${beta}), then find P(|0⟩):`,
      answer: prob,
      answerDisplay: `${prob}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `Step 1 — Apply X: swaps components (${alpha}, ${beta}) → (${beta}, ${alpha})`,
        `Step 2 — P(|0⟩) = ${beta}² = ${prob}`,
      ],
    };
  }

  // basic: original logic
  const newAlpha = Math.round((h * alpha + h * beta) * 100) / 100;
  const prob = Math.round(newAlpha * newAlpha * 100) / 100;
  return {
    type: 'gate_then_measure',
    question: `Apply H to (${alpha}, ${beta}), then find P(|0⟩):`,
    answer: prob,
    answerDisplay: `${prob}`,
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `Step 1 — Apply H: new α' = 0.71×${alpha} + 0.71×${beta}`,
      `= 0.71×${(alpha + beta).toFixed(2)} = ${fmt(newAlpha)}`,
      `Step 2 — P(|0⟩) = α'² = ${fmt(newAlpha)}² = ${prob}`,
    ],
  };
}

function twoGateCompose(d, variation = 'basic') {
  const gates = ['X', 'Z'];
  let g1, g2;
  if (variation === 'same_gate') {
    const g = gates[rnd(0, 1)];
    g1 = g; g2 = g;
  } else {
    g1 = gates[rnd(0, 1)];
    g2 = gates[rnd(0, 1)];
  }
  let r_range, lo;
  if (variation === 'with_negatives') {
    r_range = d < 2 ? 5 : 8;
    lo = -r_range;
  } else {
    r_range = d < 2 ? 5 : 8;
    lo = d < 2 ? 1 : -r_range;
  }
  const a = variation === 'with_negatives' ? rndNZ(-r_range, r_range) : rnd(lo, r_range);
  const b = variation === 'with_negatives' ? rndNZ(-r_range, r_range) : rnd(lo, r_range);

  let m1, m2;
  if (g1 === 'X') { m1 = b; m2 = a; }
  else             { m1 = a; m2 = -b; }

  let r1, r2;
  if (g2 === 'X') { r1 = m2; r2 = m1; }
  else             { r1 = m1; r2 = -m2; }

  return {
    type: 'two_gate_compose',
    question: `Apply ${g1} then ${g2} to (${a}, ${b}):`,
    answer: [r1, r2],
    answerDisplay: `(${r1}, ${r2})`,
    answerType: 'vector',
    difficulty: d,
    steps: [
      `Step 1 — Apply ${g1} to (${a}, ${b}):`,
      g1 === 'X'
        ? `X swaps: (${a}, ${b}) → (${m1}, ${m2})`
        : `Z negates 2nd: (${a}, ${b}) → (${m1}, ${m2})`,
      `Step 2 — Apply ${g2} to (${m1}, ${m2}):`,
      g2 === 'X'
        ? `X swaps: (${m1}, ${m2}) → (${r1}, ${r2})`
        : `Z negates 2nd: (${m1}, ${m2}) → (${r1}, ${r2})`,
      `Result: (${r1}, ${r2})`,
    ],
  };
}

// ── Chapter 8: Measurement ───────────────────────────────────────────────────

function bornRuleComplex(d, variation = 'basic') {
  let a, b;
  if (variation === 'with_negatives') {
    const triples = [[3,4,5],[5,12,13],[6,8,10],[4,3,5],[8,6,10]];
    const [ta, tb, tm] = triples[rnd(0, triples.length - 1)];
    a = -ta;
    b = tb;
  } else if (variation === 'pure_real') {
    a = rnd(1, 5);
    b = 0;
  } else {
    // basic: original logic
    const triples = [[3,4,5],[5,12,13],[6,8,10],[4,3,5],[8,6,10]];
    const [ta, tb, tm] = triples[rnd(0, triples.length - 1)];
    a = d > 1 && Math.random() > 0.5 ? -ta : ta;
    b = d > 1 && Math.random() > 0.5 ? -tb : tb;
  }
  const magSq = a * a + b * b;
  return {
    type: 'born_rule_complex',
    question: `α = ${fmtComplex(a, b)}. Find |α|² =`,
    answer: magSq,
    answerDisplay: `${magSq}`,
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `|α|² = a² + b² where α = a + bi`,
      `a = ${a}, b = ${b}`,
      `|α|² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${magSq}`,
    ],
  };
}

function validStateCheck(d, variation = 'basic') {
  let isValid;
  if (variation === 'forced_valid') {
    isValid = true;
  } else if (variation === 'close_invalid') {
    isValid = false;
  } else {
    isValid = Math.random() > 0.5;
  }
  let a, b;
  if (variation === 'close_invalid') {
    // State that looks close but is NOT valid
    const closeStates = [[0.7, 0.7], [0.6, 0.6], [0.8, 0.5], [0.5, 0.8]];
    [a, b] = closeStates[rnd(0, closeStates.length - 1)];
  } else if (isValid) {
    const triples = [[3,4,5],[5,12,13],[4,3,5],[6,8,10]];
    const [ta, tb, tm] = triples[rnd(0, triples.length - 1)];
    a = Math.round((ta / tm) * 100) / 100;
    b = Math.round((tb / tm) * 100) / 100;
  } else {
    a = (rnd(2, 8) / 10);
    b = (rnd(2, 8) / 10);
    const sum = Math.round((a * a + b * b) * 100) / 100;
    if (Math.abs(sum - 1) < 0.02) {
      b = Math.round((b + 0.1) * 100) / 100;
    }
  }
  const sumSq = Math.round((a * a + b * b) * 100) / 100;
  const valid = Math.abs(sumSq - 1) < 0.02;
  return {
    type: 'valid_state_check',
    question: `Is (${a}, ${b}) a valid quantum state? (yes or no)`,
    answer: valid,
    answerDisplay: valid ? 'yes' : 'no',
    answerType: 'yesno',
    difficulty: d,
    steps: [
      `Check: |α|² + |β|² = 1?`,
      `|${a}|² + |${b}|² = ${fmt(a * a)} + ${fmt(b * b)} = ${fmt(sumSq)}`,
      valid
        ? `${fmt(sumSq)} ≈ 1 → valid quantum state ✓`
        : `${fmt(sumSq)} ≠ 1 → not a valid quantum state ✗`,
    ],
  };
}

function expectedCounts(d, variation = 'basic') {
  const triples = [[3,4,5],[5,12,13],[4,3,5],[6,8,10]];
  const [ta, tb, tm] = triples[rnd(0, triples.length - 1)];
  const alpha = Math.round((ta / tm) * 100) / 100;
  const beta  = Math.round((tb / tm) * 100) / 100;
  let N, measureZero;
  if (variation === 'large_n') {
    N = 1000;
    measureZero = Math.random() > 0.5;
  } else if (variation === 'measure_one') {
    N = d < 2 ? [100, 200, 500][rnd(0, 2)] : [100, 200, 500, 1000][rnd(0, 3)];
    measureZero = false; // always measure |1⟩
  } else {
    // basic: original logic
    N = d < 2 ? [100, 200, 500][rnd(0, 2)] : [100, 200, 500, 1000][rnd(0, 3)];
    measureZero = Math.random() > 0.5;
  }
  const amp  = measureZero ? alpha : beta;
  const prob = Math.round(amp * amp * 100) / 100;
  const expected = Math.round(N * prob);
  const label = measureZero ? '|0⟩' : '|1⟩';
  return {
    type: 'expected_counts',
    question: `|ψ⟩ = ${alpha}|0⟩ + ${beta}|1⟩\nMeasure ${N} copies. Expected ${label} count?`,
    answer: expected,
    answerDisplay: `${expected}`,
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `P(${label}) = ${amp}² = ${prob}`,
      `Expected count = N × P = ${N} × ${prob}`,
      `= ${expected}`,
    ],
  };
}

function missingAmplitude(d, variation = 'basic') {
  if (variation === 'decimal_given') {
    // Give a decimal α not from Pythagorean triple, compute β
    const options = [
      { alpha: 0.5, beta: 0.87 },
      { alpha: 0.3, beta: 0.95 },
    ];
    const pick = options[rnd(0, options.length - 1)];
    const given = pick.alpha;
    const missing = pick.beta;
    const givenSq = Math.round(given * given * 100) / 100;
    const missingSq = Math.round((1 - givenSq) * 100) / 100;
    return {
      type: 'missing_amplitude',
      question: `|ψ⟩ = α|0⟩ + β|1⟩ with α = ${given}.\nFind β (positive):`,
      answer: missing,
      answerDisplay: `${missing}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `|α|² = ${given}² = ${givenSq}`,
        `|β|² = 1 − ${givenSq} = ${missingSq}`,
        `β = √${missingSq} ≈ ${missing}`,
      ],
    };
  }

  const triples = [[3,4,5],[5,12,13],[4,3,5],[6,8,10],[8,6,10]];
  const [ta, tb, tm] = triples[rnd(0, triples.length - 1)];
  const alpha = Math.round((ta / tm) * 100) / 100;
  const beta  = Math.round((tb / tm) * 100) / 100;
  let giveAlpha;
  if (variation === 'given_beta') {
    giveAlpha = false; // give β, ask for α
  } else {
    giveAlpha = Math.random() > 0.5;
  }
  const given   = giveAlpha ? alpha : beta;
  const missing = giveAlpha ? beta : alpha;
  const label   = giveAlpha ? 'β' : 'α';
  const givenLabel = giveAlpha ? 'α' : 'β';
  const givenSq = Math.round(given * given * 100) / 100;
  const missingSq = Math.round((1 - givenSq) * 100) / 100;
  return {
    type: 'missing_amplitude',
    question: `|ψ⟩ = α|0⟩ + β|1⟩ with ${givenLabel} = ${given}.\nFind ${label} (positive):`,
    answer: missing,
    answerDisplay: `${missing}`,
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `|${givenLabel}|² = ${given}² = ${givenSq}`,
      `|${label}|² = 1 − ${givenSq} = ${missingSq}`,
      `${label} = √${missingSq} = ${missing}`,
    ],
  };
}

// ── Chapter 9: Two-Qubit Systems (Tensor Products) ───────────────────────────

function twoQubitBasis(d, variation = 'basic') {
  const labels = ['00', '01', '10', '11'];
  const vectors = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
  const idx = rnd(0, 3);
  const label = labels[idx];
  const ans = vectors[idx];

  if (variation === 'harder_labels') {
    const q1 = label[0], q2 = label[1];
    return {
      type: 'two_qubit_basis',
      question: `If qubit 1 is |${q1}⟩ and qubit 2 is |${q2}⟩, write the two-qubit state as a 4-vector (a, b, c, d):`,
      answer: ans,
      answerDisplay: `(${ans.join(', ')})`,
      answerType: 'vector4',
      difficulty: d,
      steps: [
        `Qubit 1 = |${q1}⟩, Qubit 2 = |${q2}⟩ → combined state |${label}⟩`,
        `The two-qubit basis states map to standard 4-vectors:`,
        `|00⟩ = (1, 0, 0, 0),  |01⟩ = (0, 1, 0, 0)`,
        `|10⟩ = (0, 0, 1, 0),  |11⟩ = (0, 0, 0, 1)`,
        `|${label}⟩ is the ${idx+1}th basis vector → (${ans.join(', ')})`,
      ],
    };
  }

  if (variation === 'superposition') {
    // Express a superposition of two basis states as a 4-vector
    const pairs = [
      { label: '(|00⟩ + |11⟩)/√2', vec: [0.71, 0, 0, 0.71] },
      { label: '(|00⟩ − |11⟩)/√2', vec: [0.71, 0, 0, -0.71] },
      { label: '(|01⟩ + |10⟩)/√2', vec: [0, 0.71, 0.71, 0] },
      { label: '(|01⟩ − |10⟩)/√2', vec: [0, 0.71, -0.71, 0] },
      { label: '(|00⟩ + |01⟩)/√2', vec: [0.71, 0.71, 0, 0] },
      { label: '(|10⟩ + |11⟩)/√2', vec: [0, 0, 0.71, 0.71] },
    ];
    const pick = pairs[rnd(0, pairs.length - 1)];
    return {
      type: 'two_qubit_basis',
      question: `Write ${pick.label} as a 4-vector (a, b, c, d):`,
      answer: pick.vec,
      answerDisplay: `(${pick.vec.join(', ')})`,
      answerType: 'vector4',
      difficulty: d,
      steps: [
        `Recall: |00⟩=(1,0,0,0), |01⟩=(0,1,0,0), |10⟩=(0,0,1,0), |11⟩=(0,0,0,1)`,
        `${pick.label} adds the two basis vectors and divides by √2 ≈ 1.414`,
        `1/√2 ≈ 0.71`,
        `Answer: (${pick.vec.join(', ')})`,
      ],
    };
  }

  // basic (and all other variations): original logic
  return {
    type: 'two_qubit_basis',
    question: `Write |${label}⟩ as a 4-vector (a, b, c, d):`,
    answer: ans,
    answerDisplay: `(${ans.join(', ')})`,
    answerType: 'vector4',
    difficulty: d,
    steps: [
      `The two-qubit basis states map to standard 4-vectors:`,
      `|00⟩ = (1, 0, 0, 0),  |01⟩ = (0, 1, 0, 0)`,
      `|10⟩ = (0, 0, 1, 0),  |11⟩ = (0, 0, 0, 1)`,
      `|${label}⟩ is the ${idx+1}th basis vector → (${ans.join(', ')})`,
    ],
  };
}

function tensorProduct(d, variation = 'basic') {
  // Generate two 2-vectors and compute their tensor product
  let a1, a2, b1, b2;
  if (variation === 'basis_states') {
    const basis = [[1,0],[0,1]];
    [a1, a2] = basis[rnd(0, 1)];
    [b1, b2] = basis[rnd(0, 1)];
  } else if (variation === 'with_negatives') {
    a1 = rndNZ(-2, 2);
    a2 = rndNZ(-2, 2);
    b1 = rndNZ(-2, 2);
    b2 = rndNZ(-2, 2);
  } else if (d < 2) {
    // basic easy: use basis-like states or simple values
    const simple = [[1,0],[0,1],[1,1],[1,-1],[0.71,0.71],[0.71,-0.71],[2,1],[1,2]];
    const v1 = simple[rnd(0, simple.length - 1)];
    const v2 = simple[rnd(0, simple.length - 1)];
    [a1, a2] = v1;
    [b1, b2] = v2;
  } else {
    a1 = rndNZ(-2, 2);
    a2 = rndNZ(-2, 2);
    b1 = rndNZ(-2, 2);
    b2 = rndNZ(-2, 2);
  }
  const r = [a1*b1, a1*b2, a2*b1, a2*b2];
  return {
    type: 'tensor_product',
    question: `(${a1}, ${a2}) ⊗ (${b1}, ${b2}) = ?`,
    answer: r,
    answerDisplay: `(${r.join(', ')})`,
    answerType: 'vector4',
    difficulty: d,
    steps: [
      `Tensor product formula: (a, b) ⊗ (c, d) = (ac, ad, bc, bd)`,
      `a·c = ${a1}×${b1} = ${a1*b1}`,
      `a·d = ${a1}×${b2} = ${a1*b2}`,
      `b·c = ${a2}×${b1} = ${a2*b1}`,
      `b·d = ${a2}×${b2} = ${a2*b2}`,
      `Result: (${r.join(', ')})`,
    ],
  };
}

function twoQubitState(d, variation = 'basic') {
  if (variation === 'both_general') {
    // Both qubits are general (not basis) states using two different Pythagorean triples
    const allTriples = [[3,4,5],[4,3,5],[5,12,13],[12,5,13],[6,8,10],[8,6,10]];
    const i1 = rnd(0, 1); // pick from first pair
    const i2 = rnd(2, allTriples.length - 1); // pick from remaining
    const [ta1,tb1,tm1] = allTriples[i1];
    const [ta2,tb2,tm2] = allTriples[i2];
    const a1 = Math.round((ta1/tm1)*100)/100;
    const a2 = Math.round((tb1/tm1)*100)/100;
    const b1 = Math.round((ta2/tm2)*100)/100;
    const b2 = Math.round((tb2/tm2)*100)/100;
    const r = [
      Math.round(a1*b1*100)/100,
      Math.round(a1*b2*100)/100,
      Math.round(a2*b1*100)/100,
      Math.round(a2*b2*100)/100,
    ];
    return {
      type: 'two_qubit_state',
      question: `Qubit A = (${a1}, ${a2}), Qubit B = (${b1}, ${b2}).\nFind A ⊗ B:`,
      answer: r,
      answerDisplay: `(${r.join(', ')})`,
      answerType: 'vector4',
      difficulty: d,
      steps: [
        `Tensor product: (${a1}, ${a2}) ⊗ (${b1}, ${b2})`,
        `= (${a1}×${b1}, ${a1}×${b2}, ${a2}×${b1}, ${a2}×${b2})`,
        `= (${r.join(', ')})`,
      ],
    };
  }

  // basic: original logic
  // Build a two-qubit state from individual qubit states using tensor product
  const triples = [[3,4,5],[4,3,5]];
  const [ta,tb,tm] = triples[rnd(0, triples.length - 1)];
  const alpha = Math.round((ta/tm)*100)/100;
  const beta  = Math.round((tb/tm)*100)/100;
  // Second qubit: use basis state for simplicity
  const basis = rnd(0, 1);
  const c1 = basis === 0 ? 1 : 0;
  const c2 = basis === 0 ? 0 : 1;
  const r = [
    Math.round(alpha*c1*100)/100,
    Math.round(alpha*c2*100)/100,
    Math.round(beta*c1*100)/100,
    Math.round(beta*c2*100)/100,
  ];
  return {
    type: 'two_qubit_state',
    question: `Qubit A = (${alpha}, ${beta}), Qubit B = (${c1}, ${c2}).\nFind A ⊗ B:`,
    answer: r,
    answerDisplay: `(${r.join(', ')})`,
    answerType: 'vector4',
    difficulty: d,
    steps: [
      `Tensor product: (${alpha}, ${beta}) ⊗ (${c1}, ${c2})`,
      `= (${alpha}×${c1}, ${alpha}×${c2}, ${beta}×${c1}, ${beta}×${c2})`,
      `= (${r.join(', ')})`,
    ],
  };
}

function separableCheck(d, variation = 'basic') {
  let isSeparable;
  if (variation === 'forced_separable') {
    isSeparable = true;
  } else if (variation === 'forced_entangled') {
    isSeparable = false;
  } else {
    isSeparable = Math.random() > 0.4;
  }
  let state, label;
  if (isSeparable) {
    // Generate as tensor product so it's separable
    const pool = [[1,0],[0,1],[0.71,0.71],[0.71,-0.71],[0.6,0.8],[0.8,0.6]];
    const v1 = d < 2 ? pool[rnd(0, 1)] : pool[rnd(0, pool.length - 1)];
    const v2 = d < 2 ? pool[rnd(0, 1)] : pool[rnd(0, pool.length - 1)];
    state = [
      Math.round(v1[0]*v2[0]*100)/100, Math.round(v1[0]*v2[1]*100)/100,
      Math.round(v1[1]*v2[0]*100)/100, Math.round(v1[1]*v2[1]*100)/100,
    ];
    label = `(${state.join(', ')})`;
  } else {
    // Entangled states (not factorable)
    const entangled = [
      { v: [0.71, 0, 0, 0.71], name: '(0.71, 0, 0, 0.71)' },
      { v: [0.71, 0, 0, -0.71], name: '(0.71, 0, 0, -0.71)' },
      { v: [0, 0.71, 0.71, 0], name: '(0, 0.71, 0.71, 0)' },
      { v: [0, 0.71, -0.71, 0], name: '(0, 0.71, -0.71, 0)' },
      { v: [0.5, 0.5, 0.5, -0.5], name: '(0.5, 0.5, 0.5, -0.5)' },
      { v: [0.5, -0.5, 0.5, 0.5], name: '(0.5, -0.5, 0.5, 0.5)' },
      { v: [0.5, 0.5, -0.5, 0.5], name: '(0.5, 0.5, -0.5, 0.5)' },
    ];
    const pick = entangled[rnd(0, entangled.length - 1)];
    state = pick.v;
    label = pick.name;
  }
  return {
    type: 'separable_check',
    question: `Is the state ${label} separable? (yes or no)`,
    answer: isSeparable,
    answerDisplay: isSeparable ? 'yes' : 'no',
    answerType: 'yesno',
    difficulty: d,
    steps: [
      `A state (a, b, c, d) is separable if it can be written as (x, y) ⊗ (z, w).`,
      `This requires a·d = b·c (the factorization condition).`,
      `Here: a·d = ${fmt(state[0]*state[3])},  b·c = ${fmt(state[1]*state[2])}`,
      isSeparable
        ? `${fmt(state[0]*state[3])} = ${fmt(state[1]*state[2])}, so yes — this state is separable.`
        : `${fmt(state[0]*state[3])} ≠ ${fmt(state[1]*state[2])}, so no — this state is entangled.`,
    ],
  };
}

function tensorComponentIdentify(d, variation = 'basic') {
  // Reverse problem: given a tensor product result and one qubit, find the other
  const triples = [[3,4,5],[4,3,5],[5,12,13],[12,5,13]];
  const pick = d < 2 ? triples[rnd(0,1)] : triples[rnd(0, triples.length - 1)];
  const a1 = Math.round((pick[0]/pick[2])*100)/100;
  const a2 = Math.round((pick[1]/pick[2])*100)/100;

  // Second qubit: basis state for basic, general for harder
  let b1, b2;
  if (variation === 'general' || d >= 3) {
    const pick2 = triples[rnd(0,1)];
    b1 = Math.round((pick2[0]/pick2[2])*100)/100;
    b2 = Math.round((pick2[1]/pick2[2])*100)/100;
  } else {
    const basis = [[1,0],[0,1]];
    [b1, b2] = basis[rnd(0,1)];
  }

  const tp = [
    Math.round(a1*b1*100)/100, Math.round(a1*b2*100)/100,
    Math.round(a2*b1*100)/100, Math.round(a2*b2*100)/100,
  ];

  // Randomly decide whether to reveal qubit A or qubit B
  const revealFirst = Math.random() > 0.5;
  if (revealFirst) {
    return {
      type: 'tensor_component_identify',
      question: `The state (${tp.join(', ')}) = (${a1}, ${a2}) ⊗ (x, y).\nFind (x, y):`,
      answer: [b1, b2],
      answerDisplay: `(${b1}, ${b2})`,
      answerType: 'vector',
      difficulty: d,
      steps: [
        `We know: (${a1}, ${a2}) ⊗ (x, y) = (${tp.join(', ')})`,
        `From the formula: first component = ${a1}·x = ${tp[0]}`,
        `So x = ${tp[0]} / ${a1} = ${b1}`,
        `Second component = ${a1}·y = ${tp[1]}`,
        `So y = ${tp[1]} / ${a1} = ${b2}`,
        `Answer: (${b1}, ${b2})`,
      ],
    };
  } else {
    return {
      type: 'tensor_component_identify',
      question: `The state (${tp.join(', ')}) = (x, y) ⊗ (${b1}, ${b2}).\nFind (x, y):`,
      answer: [a1, a2],
      answerDisplay: `(${a1}, ${a2})`,
      answerType: 'vector',
      difficulty: d,
      steps: [
        `We know: (x, y) ⊗ (${b1}, ${b2}) = (${tp.join(', ')})`,
        `From the formula: first component = x·${b1} = ${tp[0]}`,
        `So x = ${tp[0]} / ${b1} = ${a1}`,
        `Third component = y·${b1} = ${tp[2]}`,
        `So y = ${tp[2]} / ${b1} = ${a2}`,
        `Answer: (${a1}, ${a2})`,
      ],
    };
  }
}

function tensorProbability(d, variation = 'basic') {
  // Compute P(|ab⟩) from a two-qubit tensor product state
  const triples = [[3,4,5],[4,3,5],[5,12,13],[12,5,13]];
  const pick1 = d < 2 ? triples[rnd(0,1)] : triples[rnd(0, triples.length - 1)];
  const a1 = Math.round((pick1[0]/pick1[2])*100)/100;
  const a2 = Math.round((pick1[1]/pick1[2])*100)/100;

  let b1, b2;
  if (variation === 'general' || d >= 2) {
    const pick2 = triples[rnd(0,1)];
    b1 = Math.round((pick2[0]/pick2[2])*100)/100;
    b2 = Math.round((pick2[1]/pick2[2])*100)/100;
  } else {
    const basis = [[1,0],[0,1]];
    [b1, b2] = basis[rnd(0,1)];
  }

  const tp = [
    Math.round(a1*b1*100)/100, Math.round(a1*b2*100)/100,
    Math.round(a2*b1*100)/100, Math.round(a2*b2*100)/100,
  ];
  const labels = ['00', '01', '10', '11'];
  const idx = rnd(0, 3);
  const amp = tp[idx];
  const prob = Math.round(amp * amp * 100) / 100;

  return {
    type: 'tensor_probability',
    question: `Qubit A = (${a1}, ${a2}), Qubit B = (${b1}, ${b2}).\nWhat is P(|${labels[idx]}⟩)?`,
    answer: prob,
    answerDisplay: `${prob}`,
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `First compute A ⊗ B = (${a1}, ${a2}) ⊗ (${b1}, ${b2})`,
      `= (${tp.join(', ')})`,
      `The amplitude of |${labels[idx]}⟩ is ${amp}`,
      `P(|${labels[idx]}⟩) = |${amp}|² = ${prob}`,
    ],
  };
}

// ── Chapter 10: Entanglement & Bell States ───────────────────────────────────

function entanglementCheck(d, variation = 'basic') {
  let isEntangled;
  if (variation === 'forced_entangled') {
    isEntangled = true;
  } else if (variation === 'forced_separable') {
    isEntangled = false;
  } else {
    isEntangled = Math.random() > 0.5;
  }
  let state, label;
  if (!isEntangled) {
    // Separable: tensor product of basis states
    const basis = [[1,0],[0,1]];
    const v1 = basis[rnd(0,1)];
    const v2 = basis[rnd(0,1)];
    state = [v1[0]*v2[0], v1[0]*v2[1], v1[1]*v2[0], v1[1]*v2[1]];
    label = `(${state.join(', ')})`;
  } else {
    const bellStates = [
      { v: [0.71, 0, 0, 0.71], name: '(0.71, 0, 0, 0.71)' },
      { v: [0.71, 0, 0, -0.71], name: '(0.71, 0, 0, -0.71)' },
      { v: [0, 0.71, 0.71, 0], name: '(0, 0.71, 0.71, 0)' },
    ];
    const pick = bellStates[rnd(0, bellStates.length - 1)];
    state = pick.v;
    label = pick.name;
  }
  return {
    type: 'entanglement_check',
    question: `Is the state ${label} entangled? (yes or no)`,
    answer: isEntangled,
    answerDisplay: isEntangled ? 'yes' : 'no',
    answerType: 'yesno',
    difficulty: d,
    steps: [
      `A state is entangled if it CANNOT be written as a tensor product of two single-qubit states.`,
      `Check: does a·d = b·c?`,
      `a·d = ${fmt(state[0]*state[3])},  b·c = ${fmt(state[1]*state[2])}`,
      isEntangled
        ? `${fmt(state[0]*state[3])} ≠ ${fmt(state[1]*state[2])}, so yes — this state is entangled.`
        : `${fmt(state[0]*state[3])} = ${fmt(state[1]*state[2])}, so no — this state is separable (not entangled).`,
    ],
  };
}

function cnotApply(d, variation = 'basic') {
  // CNOT on basis states: |00⟩→|00⟩, |01⟩→|01⟩, |10⟩→|11⟩, |11⟩→|10⟩
  const inputs  = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
  const outputs = [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]];
  const labels  = ['|00⟩','|01⟩','|10⟩','|11⟩'];
  const outLabels = ['|00⟩','|01⟩','|11⟩','|10⟩'];

  if (variation === 'control_one') {
    // Only pick indices 2 or 3 (where control=|1⟩, so flip happens)
    const idx = rnd(2, 3);
    const out = outputs[idx];
    return {
      type: 'cnot_apply',
      question: `Apply CNOT to ${labels[idx]}. Result as a 4-vector:`,
      answer: out,
      answerDisplay: `(${out.join(', ')})`,
      answerType: 'vector4',
      difficulty: d,
      steps: [
        `CNOT flips the second qubit if the first qubit is |1⟩.`,
        `${labels[idx]} → ${outLabels[idx]}`,
        `As a 4-vector: (${out.join(', ')})`,
      ],
    };
  }

  if (variation === 'superposition') {
    // Superposition case (existing d>=2 logic)
    const sup = [0.71, 0, 0.71, 0]; // (|00⟩ + |10⟩)/√2
    const out = [0.71, 0, 0, 0.71]; // (|00⟩ + |11⟩)/√2
    return {
      type: 'cnot_apply',
      question: `Apply CNOT to (0.71, 0, 0.71, 0). Result:`,
      answer: out,
      answerDisplay: `(${out.join(', ')})`,
      answerType: 'vector4',
      difficulty: d,
      steps: [
        `CNOT maps: |00⟩→|00⟩, |01⟩→|01⟩, |10⟩→|11⟩, |11⟩→|10⟩`,
        `Input: 0.71|00⟩ + 0|01⟩ + 0.71|10⟩ + 0|11⟩`,
        `Apply CNOT to each basis component:`,
        `0.71|00⟩ → 0.71|00⟩,  0.71|10⟩ → 0.71|11⟩`,
        `Result: (0.71, 0, 0, 0.71)`,
      ],
    };
  }

  // basic: original logic
  let idx;
  if (d < 2) {
    idx = rnd(0, 3);
    const out = outputs[idx];
    return {
      type: 'cnot_apply',
      question: `Apply CNOT to ${labels[idx]}. Result as a 4-vector:`,
      answer: out,
      answerDisplay: `(${out.join(', ')})`,
      answerType: 'vector4',
      difficulty: d,
      steps: [
        `CNOT flips the second qubit if the first qubit is |1⟩.`,
        `${labels[idx]} → ${outLabels[idx]}`,
        `As a 4-vector: (${out.join(', ')})`,
      ],
    };
  } else {
    // Harder: CNOT on a superposition
    const sup = [0.71, 0, 0.71, 0]; // (|00⟩ + |10⟩)/√2
    const out = [0.71, 0, 0, 0.71]; // (|00⟩ + |11⟩)/√2
    return {
      type: 'cnot_apply',
      question: `Apply CNOT to (0.71, 0, 0.71, 0). Result:`,
      answer: out,
      answerDisplay: `(${out.join(', ')})`,
      answerType: 'vector4',
      difficulty: d,
      steps: [
        `CNOT maps: |00⟩→|00⟩, |01⟩→|01⟩, |10⟩→|11⟩, |11⟩→|10⟩`,
        `Input: 0.71|00⟩ + 0|01⟩ + 0.71|10⟩ + 0|11⟩`,
        `Apply CNOT to each basis component:`,
        `0.71|00⟩ → 0.71|00⟩,  0.71|10⟩ → 0.71|11⟩`,
        `Result: (0.71, 0, 0, 0.71)`,
      ],
    };
  }
}

function buildBellState(d, variation = 'basic') {
  // Apply H⊗I then CNOT to a basis state
  // H = 1/√2 [[1,1],[1,-1]], I = [[1,0],[0,1]]
  // H⊗I on |00⟩ = (1/√2)(|00⟩+|10⟩) = (0.71, 0, 0.71, 0), then CNOT → (0.71, 0, 0, 0.71)
  const cases = [
    { input: '|00⟩', afterH: [0.71, 0, 0.71, 0], output: [0.71, 0, 0, 0.71], bellName: '|Φ+⟩' },
    { input: '|01⟩', afterH: [0, 0.71, 0, 0.71], output: [0, 0.71, 0.71, 0], bellName: '|Ψ+⟩' },
    { input: '|10⟩', afterH: [0.71, 0, -0.71, 0], output: [0.71, 0, 0, -0.71], bellName: '|Φ-⟩' },
    { input: '|11⟩', afterH: [0, 0.71, 0, -0.71], output: [0, 0.71, -0.71, 0], bellName: '|Ψ-⟩' },
  ];
  let pick;
  if (variation === 'phi_states') {
    pick = cases[rnd(0, 1) === 0 ? 0 : 2]; // |00⟩ or |10⟩ → Φ+ or Φ-
  } else if (variation === 'psi_states') {
    pick = cases[rnd(0, 1) === 0 ? 1 : 3]; // |01⟩ or |11⟩ → Ψ+ or Ψ-
  } else {
    // basic: original logic
    pick = d < 2 ? cases[rnd(0, 1)] : cases[rnd(0, 3)];
  }
  return {
    type: 'build_bell_state',
    question: `Apply (H⊗I) then CNOT to ${pick.input}. Result:`,
    answer: pick.output,
    answerDisplay: `(${pick.output.join(', ')})`,
    answerType: 'vector4',
    difficulty: d,
    steps: [
      `Step 1 — Apply H to first qubit (H⊗I):`,
      `H⊗I on ${pick.input} → (${pick.afterH.join(', ')})`,
      `Step 2 — Apply CNOT:`,
      `CNOT maps each basis component:`,
      `Result: (${pick.output.join(', ')}) = ${pick.bellName}`,
    ],
  };
}

function entangledMeasurement(d, variation = 'basic') {
  // Given a Bell state and qubit 1 measurement, what is qubit 2?
  const scenarios = [
    { bell: '(0.71, 0, 0, 0.71)', name: '|Φ+⟩', m1: '|0⟩', q2: [1, 0], explain: 'Measuring |0⟩ on qubit 1 collapses qubit 2 to |0⟩' },
    { bell: '(0.71, 0, 0, 0.71)', name: '|Φ+⟩', m1: '|1⟩', q2: [0, 1], explain: 'Measuring |1⟩ on qubit 1 collapses qubit 2 to |1⟩' },
    { bell: '(0, 0.71, 0.71, 0)', name: '|Ψ+⟩', m1: '|0⟩', q2: [0, 1], explain: 'Measuring |0⟩ on qubit 1 collapses qubit 2 to |1⟩' },
    { bell: '(0, 0.71, 0.71, 0)', name: '|Ψ+⟩', m1: '|1⟩', q2: [1, 0], explain: 'Measuring |1⟩ on qubit 1 collapses qubit 2 to |0⟩' },
    { bell: '(0.71, 0, 0, -0.71)', name: '|Φ-⟩', m1: '|0⟩', q2: [1, 0], explain: 'Measuring |0⟩ on qubit 1 collapses qubit 2 to |0⟩' },
    { bell: '(0.71, 0, 0, -0.71)', name: '|Φ-⟩', m1: '|1⟩', q2: [0, -1], explain: 'Measuring |1⟩ on qubit 1 collapses qubit 2 to -|1⟩, which is (0, -1)' },
  ];
  let pick;
  if (variation === 'phi_plus') {
    pick = scenarios[rnd(0, 1)]; // indices 0,1 are Φ+
  } else if (variation === 'psi_plus') {
    pick = scenarios[rnd(2, 3)]; // indices 2,3 are Ψ+
  } else {
    // basic: original logic
    pick = d < 2 ? scenarios[rnd(0, 3)] : scenarios[rnd(0, scenarios.length - 1)];
  }
  return {
    type: 'entangled_measurement',
    question: `Bell state ${pick.bell}. Qubit 1 measured as ${pick.m1}. What is qubit 2?`,
    answer: pick.q2,
    answerDisplay: `(${pick.q2.join(', ')})`,
    answerType: 'vector',
    difficulty: d,
    steps: [
      `The Bell state is ${pick.name} = ${pick.bell}.`,
      `When qubit 1 is measured as ${pick.m1}:`,
      pick.explain,
      `Qubit 2 = (${pick.q2.join(', ')})`,
    ],
  };
}

// ── Chapter 11: Quantum Circuits ─────────────────────────────────────────────

function traceSingleQubit(d, variation = 'basic') {
  // Chain 2 gates from {X, Z, H} on |0⟩ or |1⟩
  let gatesPool;
  if (variation === 'xz_only') {
    gatesPool = ['X', 'Z'];
  } else if (variation === 'with_h') {
    gatesPool = ['X', 'Z', 'H'];
  } else {
    gatesPool = ['X', 'Z', 'H'];
  }
  const maxIdx = variation === 'xz_only' ? 1 : (variation === 'with_h' ? 2 : (d < 2 ? 1 : 2));
  const g1 = gatesPool[rnd(0, maxIdx)];
  const g2 = gatesPool[rnd(0, maxIdx)];
  const inputIdx = rnd(0, 1);
  const inputLabel = inputIdx === 0 ? '|0⟩' : '|1⟩';
  let state = inputIdx === 0 ? [1, 0] : [0, 1];

  function applyGate(s, gate) {
    if (gate === 'X') return [s[1], s[0]];
    if (gate === 'Z') return [s[0], -s[1]];
    // H: 1/√2 * [[1,1],[1,-1]]
    const a = Math.round((s[0] + s[1]) * 0.71 * 100) / 100;
    const b = Math.round((s[0] - s[1]) * 0.71 * 100) / 100;
    return [a, b];
  }

  const after1 = applyGate(state, g1);
  const after2 = applyGate(after1, g2);
  const ans = [Math.round(after2[0]*100)/100, Math.round(after2[1]*100)/100];

  return {
    type: 'trace_single_qubit',
    question: `Start with ${inputLabel}. Apply ${g1} then ${g2}. Output state:`,
    answer: ans,
    answerDisplay: `(${ans.join(', ')})`,
    answerType: 'vector',
    difficulty: d,
    steps: [
      `Start: ${inputLabel} = (${state.join(', ')})`,
      `After ${g1}: (${after1.map(v => fmt(v)).join(', ')})`,
      `After ${g2}: (${ans.map(v => fmt(v)).join(', ')})`,
    ],
  };
}

function traceTwoQubit(d, variation = 'basic') {
  // Apply a gate to a two-qubit basis state
  // Use X⊗I or I⊗X on basis states
  const basisLabels = ['|00⟩','|01⟩','|10⟩','|11⟩'];
  const basisVecs   = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
  const idx = rnd(0, 3);

  let gateName, output;
  if (variation === 'x_tensor_i' || (variation === 'basic' && d < 2)) {
    // X⊗I: flips first qubit
    // |00⟩→|10⟩, |01⟩→|11⟩, |10⟩→|00⟩, |11⟩→|01⟩
    const xIOutputs = [[0,0,1,0],[0,0,0,1],[1,0,0,0],[0,1,0,0]];
    gateName = 'X⊗I';
    output = xIOutputs[idx];
  } else {
    // CNOT
    const cnotOutputs = [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]];
    gateName = 'CNOT';
    output = cnotOutputs[idx];
  }

  return {
    type: 'trace_two_qubit',
    question: `Apply ${gateName} to ${basisLabels[idx]}. Output as 4-vector:`,
    answer: output,
    answerDisplay: `(${output.join(', ')})`,
    answerType: 'vector4',
    difficulty: d,
    steps: [
      `Input: ${basisLabels[idx]} = (${basisVecs[idx].join(', ')})`,
      `Apply ${gateName}:`,
      `Result: (${output.join(', ')})`,
    ],
  };
}

function circuitProbabilities(d, variation = 'basic') {
  // Apply a gate sequence and compute probability of measuring |0⟩
  // H on |0⟩ → (0.71, 0.71) → P(|0⟩) = 0.5
  // X then H on |0⟩ → (0.71, -0.71) → P(|0⟩) = 0.5
  // H on |1⟩ → (0.71, -0.71) → P(|0⟩) = 0.5
  // X on |0⟩ → |1⟩ → P(|0⟩) = 0
  // Z on |0⟩ → |0⟩ → P(|0⟩) = 1
  const scenarios = [
    { circuit: 'H on |0⟩', prob: 0.5, steps: ['H|0⟩ = (0.71, 0.71)', 'P(|0⟩) = 0.71² = 0.50'] },
    { circuit: 'H on |1⟩', prob: 0.5, steps: ['H|1⟩ = (0.71, -0.71)', 'P(|0⟩) = 0.71² = 0.50'] },
    { circuit: 'X on |0⟩', prob: 0, steps: ['X|0⟩ = |1⟩ = (0, 1)', 'P(|0⟩) = 0² = 0'] },
    { circuit: 'X on |1⟩', prob: 1, steps: ['X|1⟩ = |0⟩ = (1, 0)', 'P(|0⟩) = 1² = 1'] },
    { circuit: 'Z on |0⟩', prob: 1, steps: ['Z|0⟩ = |0⟩ = (1, 0)', 'P(|0⟩) = 1² = 1'] },
    { circuit: 'X then H on |0⟩', prob: 0.5, steps: ['X|0⟩ = |1⟩', 'H|1⟩ = (0.71, -0.71)', 'P(|0⟩) = 0.71² = 0.50'] },
    { circuit: 'H then Z on |0⟩', prob: 0.5, steps: ['H|0⟩ = (0.71, 0.71)', 'Z(0.71, 0.71) = (0.71, -0.71)', 'P(|0⟩) = 0.71² = 0.50'] },
    { circuit: 'H then X on |0⟩', prob: 0.5, steps: ['H|0⟩ = (0.71, 0.71)', 'X(0.71, 0.71) = (0.71, 0.71)', 'P(|0⟩) = 0.71² = 0.50'] },
  ];
  let pick;
  if (variation === 'single_gate') {
    pick = scenarios[rnd(0, 4)]; // indices 0-4 are single-gate
  } else if (variation === 'two_gate') {
    pick = scenarios[rnd(5, 7)]; // indices 5-7 are two-gate
  } else {
    // basic: original logic
    pick = d < 2 ? scenarios[rnd(0, 4)] : scenarios[rnd(0, scenarios.length - 1)];
  }
  return {
    type: 'circuit_probabilities',
    question: `Circuit: ${pick.circuit}. What is P(measure |0⟩)?`,
    answer: pick.prob,
    answerDisplay: `${pick.prob}`,
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `Trace the circuit:`,
      ...pick.steps,
    ],
  };
}

function circuitEquivalence(d, variation = 'basic') {
  // Known: HZH=X, HXH=Z, XX=I, ZZ=I, HH=I
  const cases = [
    { seq1: 'HZH', seq2: 'X', equiv: true, explain: 'HZH = X is a known identity.' },
    { seq1: 'HXH', seq2: 'Z', equiv: true, explain: 'HXH = Z is a known identity.' },
    { seq1: 'XX', seq2: 'I', equiv: true, explain: 'X applied twice returns to the original state.' },
    { seq1: 'HH', seq2: 'I', equiv: true, explain: 'H applied twice returns to the original state.' },
    { seq1: 'ZZ', seq2: 'I', equiv: true, explain: 'Z applied twice returns to the original state.' },
    { seq1: 'HZ', seq2: 'X', equiv: false, explain: 'HZ on |0⟩ = H(1,0) = (0.71,0.71) then... no, HZ ≠ X. HZ|0⟩=(0.71,0.71) but X|0⟩=(0,1).' },
    { seq1: 'XZ', seq2: 'ZX', equiv: false, explain: 'XZ|0⟩ = X(1,0) = (0,1) then Z(0,-1). ZX|0⟩ = Z(0,1) then (0,-1) wait... let us check: XZ|0⟩=X·Z|0⟩=X(1,0)=(0,1). ZX|0⟩=Z·X|0⟩=Z(0,1)=(0,-1). Different, so not equivalent.' },
    { seq1: 'XH', seq2: 'HZ', equiv: true, explain: 'XH = HZ: both produce the same output on |0⟩ and |1⟩.' },
  ];
  let pick;
  if (variation === 'self_inverse') {
    // XX=I, ZZ=I, HH=I (indices 2-4)
    pick = cases[rnd(2, 4)];
  } else if (variation === 'conjugation') {
    // HZH=X, HXH=Z, XH=HZ (indices 0, 1, 7)
    const conjugationIndices = [0, 1, 7];
    pick = cases[conjugationIndices[rnd(0, 2)]];
  } else {
    // basic: original logic
    pick = d < 2 ? cases[rnd(0, 4)] : cases[rnd(0, cases.length - 1)];
  }
  return {
    type: 'circuit_equivalence',
    question: `Are the gate sequences "${pick.seq1}" and "${pick.seq2}" equivalent? (yes or no)`,
    answer: pick.equiv,
    answerDisplay: pick.equiv ? 'yes' : 'no',
    answerType: 'yesno',
    difficulty: d,
    steps: [
      `Two gate sequences are equivalent if they produce the same output for ALL inputs.`,
      `Test on |0⟩ and |1⟩:`,
      pick.explain,
      `Answer: ${pick.equiv ? 'yes' : 'no'}`,
    ],
  };
}

// ── Chapter 12: Rotation Gates ───────────────────────────────────────────────

// Pre-computed trig values: ANGLE_TABLE[i] stores cos(θ/2) and sin(θ/2)
const ANGLE_TABLE = [
  { label: 'π/6', halfLabel: 'π/12', cosH: 0.97, sinH: 0.26 },
  { label: 'π/4', halfLabel: 'π/8',  cosH: 0.92, sinH: 0.38 },
  { label: 'π/3', halfLabel: 'π/6',  cosH: 0.87, sinH: 0.5  },
  { label: 'π/2', halfLabel: 'π/4',  cosH: 0.71, sinH: 0.71 },
  { label: 'π',   halfLabel: 'π/2',  cosH: 0,    sinH: 1    },
];

function r2(n) { return Math.round(n * 100) / 100; }

function blochIdentification(d, variation = 'basic') {
  const items = {
    ket0: {
      q: 'Where is |0⟩ on the Bloch sphere?',
      choices: ['North pole', 'South pole', 'On the equator (positive x)', 'On the equator (negative x)'],
      answer: 'A', display: 'A) North pole',
      steps: ['|0⟩ corresponds to θ=0 on the Bloch sphere, which is the north pole.'],
    },
    ket1: {
      q: 'Where is |1⟩ on the Bloch sphere?',
      choices: ['North pole', 'South pole', 'On the equator (positive x)', 'On the equator (negative x)'],
      answer: 'B', display: 'B) South pole',
      steps: ['|0⟩ is the north pole.', '|1⟩ is the opposite — the south pole.'],
    },
    plus: {
      q: 'Where is |+⟩ = (|0⟩ + |1⟩)/√2 on the Bloch sphere?',
      choices: ['North pole', 'South pole', 'On the equator (positive x)', 'On the equator (negative x)'],
      answer: 'C', display: 'C) On the equator (positive x)',
      steps: ['|+⟩ is an equal superposition with no relative phase.', 'On the Bloch sphere this is the +x direction, on the equator.'],
    },
    minus: {
      q: 'Where is |−⟩ = (|0⟩ − |1⟩)/√2 on the Bloch sphere?',
      choices: ['North pole', 'South pole', 'On the equator (positive x)', 'On the equator (negative x)'],
      answer: 'D', display: 'D) On the equator (negative x)',
      steps: ['|−⟩ has a relative phase of π between its components.', 'On the Bloch sphere this is the −x direction, on the equator.'],
    },
    plusI: {
      q: 'Where is (|0⟩ + i|1⟩)/√2 on the Bloch sphere?',
      choices: ['North pole', 'On the equator (positive x)', 'On the equator (positive y)', 'On the equator (negative y)'],
      answer: 'C', display: 'C) On the equator (positive y)',
      steps: ['This state has equal amplitudes with a relative phase of π/2 (the factor i).', 'A phase of π/2 corresponds to the +y direction on the Bloch sphere equator.'],
    },
    minusI: {
      q: 'Where is (|0⟩ − i|1⟩)/√2 on the Bloch sphere?',
      choices: ['North pole', 'On the equator (positive x)', 'On the equator (positive y)', 'On the equator (negative y)'],
      answer: 'D', display: 'D) On the equator (negative y)',
      steps: ['This state has equal amplitudes with a relative phase of −π/2 (the factor −i).', 'A phase of −π/2 corresponds to the −y direction on the Bloch sphere equator.'],
    },
  };

  let pool;
  if (variation === 'basis_states') pool = ['ket0', 'ket1'];
  else if (variation === 'superposition') pool = ['plus', 'minus'];
  else if (variation === 'phase_state') pool = ['plusI', 'minusI'];
  else pool = ['ket0', 'ket1', 'plus', 'minus']; // basic

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'bloch_identification', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function rzApply(d, variation = 'basic') {
  // Rz(θ)|0⟩ = (e^(-iθ/2), 0)  →  first component = cos(θ/2) − i·sin(θ/2)
  // Rz(θ)|1⟩ = (0, e^(iθ/2))   →  second component = cos(θ/2) + i·sin(θ/2)

  const pick = ANGLE_TABLE[rnd(0, ANGLE_TABLE.length - 1)];

  if (variation === 'simple_angle') {
    // Use only π and π/2 for cleaner mental math
    const simpleIdx = rnd(3, 4); // π/2 or π
    const a = ANGLE_TABLE[simpleIdx];
    const useKet1 = Math.random() > 0.5;
    const re = r2(a.cosH);
    const im = useKet1 ? r2(a.sinH) : r2(-a.sinH);
    const state = useKet1 ? '|1⟩' : '|0⟩';
    const sign = useKet1 ? '+' : '−';
    return {
      type: 'rz_apply',
      question: `Apply Rz(${a.label}) to ${state}. What is the ${useKet1 ? 'second' : 'first'} component?\nRz(θ) = [[e^(−iθ/2), 0], [0, e^(iθ/2)]]`,
      answer: [re, im], answerDisplay: fmtComplex(re, im), answerType: 'complex', difficulty: d,
      steps: [
        `Rz(${a.label})${state}: the ${useKet1 ? 'second' : 'first'} component is e^(${sign}i${a.halfLabel})`,
        `= cos(${a.halfLabel}) ${sign} i·sin(${a.halfLabel})`,
        `= ${fmt(a.cosH)} ${sign} ${fmt(a.sinH)}i`,
        `= ${fmtComplex(re, im)}`,
      ],
    };
  }

  if (variation === 'superposition') {
    // Rz(θ)(0.71, 0.71): first component = 0.71·e^(-iθ/2)
    const a = ANGLE_TABLE[rnd(0, ANGLE_TABLE.length - 1)];
    const re1 = r2(0.71 * a.cosH);
    const im1 = r2(-0.71 * a.sinH);
    return {
      type: 'rz_apply',
      question: `Apply Rz(${a.label}) to (0.71, 0.71). What is the first component?\nRz(θ) = [[e^(−iθ/2), 0], [0, e^(iθ/2)]]`,
      answer: [re1, im1], answerDisplay: fmtComplex(re1, im1), answerType: 'complex', difficulty: d,
      steps: [
        `First component = α · e^(−i${a.halfLabel}) where α = 0.71`,
        `e^(−i${a.halfLabel}) = cos(${a.halfLabel}) − i·sin(${a.halfLabel}) = ${fmt(a.cosH)} − ${fmt(a.sinH)}i`,
        `0.71 × (${fmt(a.cosH)} − ${fmt(a.sinH)}i) = ${fmtComplex(re1, im1)}`,
      ],
    };
  }

  if (variation === 'verify_probability') {
    // Rz only changes phase, not probabilities
    const triples = [[3,4,5],[4,3,5],[6,8,10],[8,6,10]];
    const [ta, tb, tm] = triples[rnd(0, triples.length-1)];
    const alpha = r2(ta / tm);
    const beta = r2(tb / tm);
    const probZero = r2(alpha * alpha);
    const a = ANGLE_TABLE[rnd(0, ANGLE_TABLE.length - 1)];
    return {
      type: 'rz_apply',
      question: `Apply Rz(${a.label}) to (${alpha}, ${beta}). What is P(|0⟩) after applying Rz?`,
      answer: probZero, answerDisplay: `${probZero}`, answerType: 'numeric', difficulty: d,
      steps: [
        `Rz only multiplies each component by a phase factor (e^(iφ)).`,
        `|e^(iφ)|² = 1, so probabilities are unchanged.`,
        `P(|0⟩) = |α|² = ${alpha}² = ${probZero}`,
      ],
    };
  }

  // basic: Rz(θ) on a basis state
  const useKet1 = Math.random() > 0.5;
  const re = r2(pick.cosH);
  const im = useKet1 ? r2(pick.sinH) : r2(-pick.sinH);
  const state = useKet1 ? '|1⟩' : '|0⟩';
  const sign = useKet1 ? '+' : '−';
  return {
    type: 'rz_apply',
    question: `Apply Rz(${pick.label}) to ${state}. What is the ${useKet1 ? 'second' : 'first'} component?\nRz(θ) = [[e^(−iθ/2), 0], [0, e^(iθ/2)]]`,
    answer: [re, im], answerDisplay: fmtComplex(re, im), answerType: 'complex', difficulty: d,
    steps: [
      `Rz(${pick.label})${state}: the ${useKet1 ? 'second' : 'first'} component is e^(${sign}i${pick.halfLabel})`,
      `= cos(${pick.halfLabel}) ${sign} i·sin(${pick.halfLabel})`,
      `= ${fmtComplex(re, im)}`,
    ],
  };
}

function rxApply(d, variation = 'basic') {
  // Rx(θ)|0⟩ = (cos(θ/2), -i·sin(θ/2))
  // P(|0⟩) = cos²(θ/2), P(|1⟩) = sin²(θ/2)

  const pick = ANGLE_TABLE[rnd(0, ANGLE_TABLE.length - 1)];
  const c = pick.cosH;
  const s = pick.sinH;

  if (variation === 'half_pi') {
    // Rx(π/2)|0⟩ = (cos(π/4), −i·sin(π/4)) = (0.71, −0.71i)
    const p0 = r2(0.71 * 0.71); // 0.50
    const p1 = r2(0.71 * 0.71); // 0.50
    return {
      type: 'rx_apply',
      question: `Apply Rx(π/2) to |0⟩. What are [P(|0⟩), P(|1⟩)]?\nRx(θ) = [[cos(θ/2), −i·sin(θ/2)], [−i·sin(θ/2), cos(θ/2)]]`,
      answer: [p0, p1], answerDisplay: `(${p0}, ${p1})`, answerType: 'vector', difficulty: d,
      steps: [
        `Rx(π/2)|0⟩ = (cos(π/4), −i·sin(π/4)) = (0.71, −0.71i)`,
        `P(|0⟩) = |cos(π/4)|² = 0.71² = ${p0}`,
        `P(|1⟩) = |−i·sin(π/4)|² = 0.71² = ${p1}`,
      ],
    };
  }

  if (variation === 'superposition_input') {
    // Rx(θ)(0.71, 0.71): each component gets magnitude 0.71·1 = 0.71, so P = 0.50 each
    return {
      type: 'rx_apply',
      question: `Apply Rx(${pick.label}) to (0.71, 0.71). What are [P(|0⟩), P(|1⟩)]?\nRx(θ) = [[cos(θ/2), −i·sin(θ/2)], [−i·sin(θ/2), cos(θ/2)]]`,
      answer: [0.5, 0.5], answerDisplay: `(0.5, 0.5)`, answerType: 'vector', difficulty: d,
      steps: [
        `Component 1 = cos(${pick.halfLabel})·0.71 − i·sin(${pick.halfLabel})·0.71 = 0.71·e^(−i${pick.halfLabel})`,
        `Component 2 = −i·sin(${pick.halfLabel})·0.71 + cos(${pick.halfLabel})·0.71 = 0.71·e^(−i${pick.halfLabel})`,
        `|0.71·e^(−i${pick.halfLabel})|² = 0.71² = 0.50 for both`,
        `Result: [P(|0⟩), P(|1⟩)] = (0.5, 0.5)`,
      ],
    };
  }

  if (variation === 'probability_after') {
    const p0 = r2(c * c);
    const p1 = r2(s * s);
    return {
      type: 'rx_apply',
      question: `Apply Rx(${pick.label}) to |0⟩. What are [P(|0⟩), P(|1⟩)]?\nRx(θ) = [[cos(θ/2), −i·sin(θ/2)], [−i·sin(θ/2), cos(θ/2)]]`,
      answer: [p0, p1], answerDisplay: `(${fmt(p0)}, ${fmt(p1)})`, answerType: 'vector', difficulty: d,
      steps: [
        `Rx(${pick.label})|0⟩ = (cos(${pick.halfLabel}), −i·sin(${pick.halfLabel})) = (${fmt(c)}, −${fmt(s)}i)`,
        `P(|0⟩) = cos²(${pick.halfLabel}) = ${fmt(c)}² = ${fmt(p0)}`,
        `P(|1⟩) = sin²(${pick.halfLabel}) = ${fmt(s)}² = ${fmt(p1)}`,
      ],
    };
  }

  // basic
  const p0 = r2(c * c);
  const p1 = r2(s * s);
  return {
    type: 'rx_apply',
    question: `Apply Rx(${pick.label}) to |0⟩. What are [P(|0⟩), P(|1⟩)]?\nRx(θ) = [[cos(θ/2), −i·sin(θ/2)], [−i·sin(θ/2), cos(θ/2)]]`,
    answer: [p0, p1], answerDisplay: `(${fmt(p0)}, ${fmt(p1)})`, answerType: 'vector', difficulty: d,
    steps: [
      `Rx(${pick.label})|0⟩ = (cos(${pick.halfLabel}), −i·sin(${pick.halfLabel}))`,
      `P(|0⟩) = |cos(${pick.halfLabel})|² = ${fmt(c)}² = ${fmt(p0)}`,
      `P(|1⟩) = |−i·sin(${pick.halfLabel})|² = ${fmt(s)}² = ${fmt(p1)}`,
    ],
  };
}

function ryApply(d, variation = 'basic') {
  // Ry(θ)|0⟩ = (cos(θ/2), sin(θ/2)) — all real
  // Ry(θ)|1⟩ = (−sin(θ/2), cos(θ/2))

  const pick = ANGLE_TABLE[rnd(0, ANGLE_TABLE.length - 1)];
  const c = pick.cosH;
  const s = pick.sinH;

  if (variation === 'half_pi') {
    return {
      type: 'ry_apply',
      question: `Apply Ry(π/2) to |0⟩. What is the output state vector?\nRy(θ) = [[cos(θ/2), −sin(θ/2)], [sin(θ/2), cos(θ/2)]]`,
      answer: [0.71, 0.71], answerDisplay: '(0.71, 0.71)', answerType: 'vector', difficulty: d,
      steps: [
        `Ry(π/2)|0⟩: first component = cos(π/4) = 0.71`,
        `Second component = sin(π/4) = 0.71`,
        `Result: (0.71, 0.71)`,
      ],
    };
  }

  if (variation === 'create_target_state') {
    const useKet1 = Math.random() > 0.5;
    let r1v, r2v;
    if (useKet1) {
      r1v = r2(-s); r2v = r2(c);
    } else {
      r1v = r2(c); r2v = r2(s);
    }
    const state = useKet1 ? '|1⟩' : '|0⟩';
    return {
      type: 'ry_apply',
      question: `Apply Ry(${pick.label}) to ${state}. What is the output state vector?\nRy(θ) = [[cos(θ/2), −sin(θ/2)], [sin(θ/2), cos(θ/2)]]`,
      answer: [r1v, r2v], answerDisplay: `(${fmt(r1v)}, ${fmt(r2v)})`, answerType: 'vector', difficulty: d,
      steps: useKet1 ? [
        `Ry(${pick.label})|1⟩: first component = −sin(${pick.halfLabel}) = ${fmt(r1v)}`,
        `Second component = cos(${pick.halfLabel}) = ${fmt(r2v)}`,
        `Result: (${fmt(r1v)}, ${fmt(r2v)})`,
      ] : [
        `Ry(${pick.label})|0⟩: first component = cos(${pick.halfLabel}) = ${fmt(r1v)}`,
        `Second component = sin(${pick.halfLabel}) = ${fmt(r2v)}`,
        `Result: (${fmt(r1v)}, ${fmt(r2v)})`,
      ],
    };
  }

  if (variation === 'compare_rx_ry') {
    const r1v = r2(c);
    const r2v = r2(s);
    return {
      type: 'ry_apply',
      question: `Apply Ry(${pick.label}) to |0⟩. What is the output state vector?\nRy(θ) = [[cos(θ/2), −sin(θ/2)], [sin(θ/2), cos(θ/2)]]`,
      answer: [r1v, r2v], answerDisplay: `(${fmt(r1v)}, ${fmt(r2v)})`, answerType: 'vector', difficulty: d,
      steps: [
        `Ry(${pick.label})|0⟩ = (cos(${pick.halfLabel}), sin(${pick.halfLabel}))`,
        `= (${fmt(r1v)}, ${fmt(r2v)})`,
        `Note: Unlike Rx, Ry always produces real amplitudes from real inputs.`,
      ],
    };
  }

  // basic
  const r1v = r2(c);
  const r2v = r2(s);
  return {
    type: 'ry_apply',
    question: `Apply Ry(${pick.label}) to |0⟩. What is the output state vector?\nRy(θ) = [[cos(θ/2), −sin(θ/2)], [sin(θ/2), cos(θ/2)]]`,
    answer: [r1v, r2v], answerDisplay: `(${fmt(r1v)}, ${fmt(r2v)})`, answerType: 'vector', difficulty: d,
    steps: [
      `Ry(${pick.label})|0⟩: first component = cos(${pick.halfLabel}) = ${fmt(r1v)}`,
      `Second component = sin(${pick.halfLabel}) = ${fmt(r2v)}`,
      `Result: (${fmt(r1v)}, ${fmt(r2v)})`,
    ],
  };
}

function eulerDecompose(d, variation = 'basic') {
  // Rz(α)·Ry(β)·Rz(γ)|0⟩: probabilities depend only on β
  // P(|0⟩) = cos²(β/2), P(|1⟩) = sin²(β/2)

  if (variation === 'hadamard') {
    // H ≈ Rz(π)·Ry(π/2) up to global phase
    return {
      type: 'euler_decompose',
      question: `H ≈ Rz(π)·Ry(π/2). Apply this to |0⟩. What are [P(|0⟩), P(|1⟩)]?`,
      answer: [0.5, 0.5], answerDisplay: '(0.5, 0.5)', answerType: 'vector', difficulty: d,
      steps: [
        `Step 1: Ry(π/2)|0⟩ = (cos(π/4), sin(π/4)) = (0.71, 0.71)`,
        `Step 2: Rz(π) only changes phases, not magnitudes.`,
        `P(|0⟩) = 0.71² = 0.50, P(|1⟩) = 0.71² = 0.50`,
      ],
    };
  }

  if (variation === 'compose_two') {
    const beta = ANGLE_TABLE[rnd(0, ANGLE_TABLE.length - 1)];
    const alpha = ANGLE_TABLE[rnd(0, ANGLE_TABLE.length - 1)];
    const p0 = r2(beta.cosH * beta.cosH);
    const p1 = r2(beta.sinH * beta.sinH);
    return {
      type: 'euler_decompose',
      question: `Apply Rz(${alpha.label})·Ry(${beta.label}) to |0⟩. What are [P(|0⟩), P(|1⟩)]?`,
      answer: [p0, p1], answerDisplay: `(${fmt(p0)}, ${fmt(p1)})`, answerType: 'vector', difficulty: d,
      steps: [
        `Step 1: Ry(${beta.label})|0⟩ = (cos(${beta.halfLabel}), sin(${beta.halfLabel})) = (${fmt(beta.cosH)}, ${fmt(beta.sinH)})`,
        `Step 2: Rz(${alpha.label}) multiplies each component by a phase factor.`,
        `Phases don't change magnitudes, so probabilities come from Ry alone.`,
        `P(|0⟩) = cos²(${beta.halfLabel}) = ${fmt(p0)}, P(|1⟩) = sin²(${beta.halfLabel}) = ${fmt(p1)}`,
      ],
    };
  }

  // basic: full Euler Rz·Ry·Rz
  const beta = ANGLE_TABLE[rnd(0, ANGLE_TABLE.length - 1)];
  const alpha = ANGLE_TABLE[rnd(0, ANGLE_TABLE.length - 1)];
  const gamma = ANGLE_TABLE[rnd(0, ANGLE_TABLE.length - 1)];
  const p0 = r2(beta.cosH * beta.cosH);
  const p1 = r2(beta.sinH * beta.sinH);
  return {
    type: 'euler_decompose',
    question: `Apply Rz(${alpha.label})·Ry(${beta.label})·Rz(${gamma.label}) to |0⟩. What are [P(|0⟩), P(|1⟩)]?`,
    answer: [p0, p1], answerDisplay: `(${fmt(p0)}, ${fmt(p1)})`, answerType: 'vector', difficulty: d,
    steps: [
      `Step 1: Rz(${gamma.label})|0⟩ = (e^(−i${gamma.halfLabel}), 0) — just a phase on |0⟩`,
      `Step 2: Ry(${beta.label}) determines the split: (cos(${beta.halfLabel}), sin(${beta.halfLabel})) = (${fmt(beta.cosH)}, ${fmt(beta.sinH)})`,
      `Step 3: Rz(${alpha.label}) adds phases but doesn't change magnitudes.`,
      `P(|0⟩) = cos²(${beta.halfLabel}) = ${fmt(p0)}, P(|1⟩) = sin²(${beta.halfLabel}) = ${fmt(p1)}`,
    ],
  };
}

// ── Chapter 13: Phase Gates ──────────────────────────────────────────────────

function sGateApply(d, variation = 'basic') {
  // S = [[1,0],[0,i]]: |0⟩ component unchanged, |1⟩ component multiplied by i
  // For state α|0⟩ + β|1⟩ with β = (re + im·i), S gives α|0⟩ + (i·β)|1⟩
  // i·(re + im·i) = (−im) + re·i = [−im, re]

  if (variation === 'superposition') {
    // S applied to (1/√2)(|0⟩ + |1⟩) — |1⟩ coeff is real 0.71, multiplied by i → (0, 0.71)
    const h = 0.71;
    // α = 0.71 (real), β = 0.71 (real)
    // After S: α unchanged = 0.71, new β = i × 0.71 = 0 + 0.71i → [0, 0.71]
    return {
      type: 's_gate_apply',
      question: `Apply S to the |1⟩ component of (1/√2)(|0⟩ + |1⟩).\nThe |1⟩ coefficient is ${h}. What is S × ${h}?\nS multiplies the |1⟩ amplitude by i.\nAnswer as a complex number (re, im):`,
      answer: [0, 0.71],
      answerDisplay: fmtComplex(0, 0.71),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `The |1⟩ coefficient is ${h} (a real number).`,
        `S multiplies the |1⟩ amplitude by i.`,
        `i × ${h} = ${h}i = (0, ${h})`,
        `Answer: ${fmtComplex(0, 0.71)}`,
      ],
    };
  }

  if (variation === 'double_s') {
    // S² = Z: applying S twice multiplies |1⟩ by i² = −1
    const a = rndNZ(1, 5);
    const result = -a;
    return {
      type: 's_gate_apply',
      question: `Apply S twice to the |1⟩ coefficient ${a}.\nWhat is S·S × ${a}? (complex answer)`,
      answer: [result, 0],
      answerDisplay: fmtComplex(result, 0),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `First S: i × ${a} = ${a}i = (0, ${a})`,
        `Second S: i × ${a}i = ${a}i² = ${a}(−1) = ${result}`,
        `S² = Z, which negates the |1⟩ component.`,
        `Answer: ${fmtComplex(result, 0)}`,
      ],
    };
  }

  if (variation === 'probability_unchanged') {
    // |i·β|² = |β|² so probabilities don't change
    const a = rndNZ(1, 5);
    // S × a = ai → |ai|² = a²
    const prob = a * a;
    return {
      type: 's_gate_apply',
      question: `If the |1⟩ coefficient is ${a}, what is |S × ${a}|²?\n(The measurement probability after applying S)`,
      answer: [prob, 0],
      answerDisplay: fmtComplex(prob, 0),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `S × ${a} = i × ${a} = ${a}i`,
        `|${a}i|² = ${a}² = ${prob}`,
        `The probability is unchanged — S only changes phase, not magnitude.`,
        `Answer: ${fmtComplex(prob, 0)}`,
      ],
    };
  }

  // basic: S applied to |1⟩ coefficient (integer)
  const a = rndNZ(1, 5);
  // i × a = (0, a)
  return {
    type: 's_gate_apply',
    question: `Apply the S gate to the |1⟩ coefficient ${a}.\nS multiplies the |1⟩ amplitude by i.\nAnswer as a complex number (re, im):`,
    answer: [0, a],
    answerDisplay: fmtComplex(0, a),
    answerType: 'complex',
    difficulty: d,
    steps: [
      `S = [[1,0],[0,i]] multiplies the |1⟩ amplitude by i.`,
      `i × ${a} = ${a}i = (0, ${a})`,
      `Answer: ${fmtComplex(0, a)}`,
    ],
  };
}

function sDaggerApply(d, variation = 'basic') {
  // S† = [[1,0],[0,−i]]: multiplies |1⟩ component by −i
  // −i × (re + im·i) = (im) + (−re)·i = [im, −re]

  if (variation === 'undo_s') {
    // S then S† = I, so result is original value
    const a = rndNZ(1, 5);
    // S × a = ai, then S† × ai = −i × ai = −ai² = −a(−1) = a
    return {
      type: 's_dagger_apply',
      question: `Apply S then S† to the |1⟩ coefficient ${a}.\nWhat is the result? (complex answer)`,
      answer: [a, 0],
      answerDisplay: fmtComplex(a, 0),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `First S: i × ${a} = ${a}i`,
        `Then S†: (−i) × ${a}i = −${a}i² = −${a}(−1) = ${a}`,
        `S†S = I (identity), so we get back the original.`,
        `Answer: ${fmtComplex(a, 0)}`,
      ],
    };
  }

  if (variation === 'superposition') {
    const h = 0.71;
    // S† on |1⟩ coeff 0.71: −i × 0.71 = (0, −0.71)
    return {
      type: 's_dagger_apply',
      question: `Apply S† to the |1⟩ component of (1/√2)(|0⟩ + |1⟩).\nThe |1⟩ coefficient is ${h}. What is S† × ${h}?\nS† multiplies the |1⟩ amplitude by −i.\nAnswer as a complex number (re, im):`,
      answer: [0, -0.71],
      answerDisplay: fmtComplex(0, -0.71),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `The |1⟩ coefficient is ${h}.`,
        `S† multiplies the |1⟩ amplitude by −i.`,
        `(−i) × ${h} = −${h}i = (0, −${h})`,
        `Answer: ${fmtComplex(0, -0.71)}`,
      ],
    };
  }

  // basic: S† applied to |1⟩ coefficient (integer)
  const a = rndNZ(1, 5);
  // −i × a = (0, −a)
  return {
    type: 's_dagger_apply',
    question: `Apply the S† gate to the |1⟩ coefficient ${a}.\nS† multiplies the |1⟩ amplitude by −i.\nAnswer as a complex number (re, im):`,
    answer: [0, -a],
    answerDisplay: fmtComplex(0, -a),
    answerType: 'complex',
    difficulty: d,
    steps: [
      `S† = [[1,0],[0,−i]] multiplies the |1⟩ amplitude by −i.`,
      `(−i) × ${a} = −${a}i = (0, −${a})`,
      `Answer: ${fmtComplex(0, -a)}`,
    ],
  };
}

function tGateApply(d, variation = 'basic') {
  // T = [[1,0],[0,e^(iπ/4)]]: multiplies |1⟩ by e^(iπ/4) ≈ (0.71 + 0.71i)
  const tRe = 0.71;
  const tIm = 0.71;

  if (variation === 'compute_phase') {
    // What is e^(iπ/4)? Answer: (0.71, 0.71)
    return {
      type: 't_gate_apply',
      question: `The T gate multiplies |1⟩ by e^(iπ/4).\nUsing Euler's formula: e^(iθ) = cos θ + i sin θ.\nWhat is e^(iπ/4)? (complex answer, use 0.71 ≈ 1/√2)`,
      answer: [0.71, 0.71],
      answerDisplay: fmtComplex(0.71, 0.71),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `e^(iπ/4) = cos(π/4) + i·sin(π/4)`,
        `cos(π/4) = 1/√2 ≈ 0.71`,
        `sin(π/4) = 1/√2 ≈ 0.71`,
        `Answer: ${fmtComplex(0.71, 0.71)}`,
      ],
    };
  }

  if (variation === 'double_t') {
    // T² = S: e^(iπ/4) × e^(iπ/4) = e^(iπ/2) = i
    // So T²|1⟩ coeff a → i × a = (0, a)
    const a = rndNZ(1, 5);
    return {
      type: 't_gate_apply',
      question: `Apply T twice to the |1⟩ coefficient ${a}.\nT² = S, which multiplies by i.\nWhat is the result? (complex answer)`,
      answer: [0, a],
      answerDisplay: fmtComplex(0, a),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `T² = S (since e^(iπ/4) × e^(iπ/4) = e^(iπ/2) = i)`,
        `S multiplies |1⟩ by i.`,
        `i × ${a} = ${a}i = (0, ${a})`,
        `Answer: ${fmtComplex(0, a)}`,
      ],
    };
  }

  if (variation === 'quad_t') {
    // T⁴ = Z: multiplies |1⟩ by −1
    const a = rndNZ(1, 5);
    const result = -a;
    return {
      type: 't_gate_apply',
      question: `Apply T four times to the |1⟩ coefficient ${a}.\nT⁴ = Z, which multiplies by −1.\nWhat is the result? (complex answer)`,
      answer: [result, 0],
      answerDisplay: fmtComplex(result, 0),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `T⁴ = Z (since e^(iπ/4)⁴ = e^(iπ) = −1)`,
        `Z multiplies |1⟩ by −1.`,
        `(−1) × ${a} = ${result}`,
        `Answer: ${fmtComplex(result, 0)}`,
      ],
    };
  }

  if (variation === 'superposition') {
    const h = 0.71;
    // T × 0.71 = (0.71 + 0.71i) × 0.71 = (0.50, 0.50) (rounded)
    const resRe = Math.round(tRe * h * 100) / 100;  // 0.71*0.71 = 0.5041 → 0.50
    const resIm = Math.round(tIm * h * 100) / 100;  // 0.50
    return {
      type: 't_gate_apply',
      question: `Apply T to the |1⟩ component of (1/√2)(|0⟩ + |1⟩).\nThe |1⟩ coefficient is ${h}. What is T × ${h}?\nT multiplies by e^(iπ/4) ≈ (0.71 + 0.71i).\nAnswer as a complex number (re, im):`,
      answer: [resRe, resIm],
      answerDisplay: fmtComplex(resRe, resIm),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `T multiplies |1⟩ by e^(iπ/4) ≈ 0.71 + 0.71i.`,
        `(0.71 + 0.71i) × ${h}`,
        `Real: 0.71 × ${h} = ${fmt(resRe)}`,
        `Imag: 0.71 × ${h} = ${fmt(resIm)}`,
        `Answer: ${fmtComplex(resRe, resIm)}`,
      ],
    };
  }

  // basic: T applied to integer |1⟩ coefficient
  const a = rndNZ(1, 4);
  const resRe = Math.round(tRe * a * 100) / 100;
  const resIm = Math.round(tIm * a * 100) / 100;
  return {
    type: 't_gate_apply',
    question: `Apply the T gate to the |1⟩ coefficient ${a}.\nT multiplies the |1⟩ amplitude by e^(iπ/4) ≈ (0.71 + 0.71i).\nAnswer as a complex number (re, im):`,
    answer: [resRe, resIm],
    answerDisplay: fmtComplex(resRe, resIm),
    answerType: 'complex',
    difficulty: d,
    steps: [
      `T = [[1,0],[0,e^(iπ/4)]] multiplies |1⟩ by e^(iπ/4) ≈ 0.71 + 0.71i.`,
      `(0.71 + 0.71i) × ${a}`,
      `Real: 0.71 × ${a} = ${fmt(resRe)}`,
      `Imag: 0.71 × ${a} = ${fmt(resIm)}`,
      `Answer: ${fmtComplex(resRe, resIm)}`,
    ],
  };
}

function tDaggerApply(d, variation = 'basic') {
  // T† = [[1,0],[0,e^(−iπ/4)]]: multiplies |1⟩ by e^(−iπ/4) ≈ (0.71 − 0.71i)
  const tdRe = 0.71;
  const tdIm = -0.71;

  if (variation === 'undo_t') {
    // T then T† = I
    const a = rndNZ(1, 5);
    return {
      type: 't_dagger_apply',
      question: `Apply T then T† to the |1⟩ coefficient ${a}.\nWhat is the result? (complex answer)`,
      answer: [a, 0],
      answerDisplay: fmtComplex(a, 0),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `T multiplies by e^(iπ/4), T† multiplies by e^(−iπ/4).`,
        `e^(iπ/4) × e^(−iπ/4) = e^0 = 1`,
        `T†T = I, so ${a} → ${a}`,
        `Answer: ${fmtComplex(a, 0)}`,
      ],
    };
  }

  if (variation === 'superposition') {
    const h = 0.71;
    // T† × 0.71 = (0.71 − 0.71i) × 0.71 = (0.50, −0.50)
    const resRe = Math.round(tdRe * h * 100) / 100;  // 0.50
    const resIm = Math.round(tdIm * h * 100) / 100;  // -0.50
    return {
      type: 't_dagger_apply',
      question: `Apply T† to the |1⟩ component of (1/√2)(|0⟩ + |1⟩).\nThe |1⟩ coefficient is ${h}. What is T† × ${h}?\nT† multiplies by e^(−iπ/4) ≈ (0.71 − 0.71i).\nAnswer as a complex number (re, im):`,
      answer: [resRe, resIm],
      answerDisplay: fmtComplex(resRe, resIm),
      answerType: 'complex',
      difficulty: d,
      steps: [
        `T† multiplies |1⟩ by e^(−iπ/4) ≈ 0.71 − 0.71i.`,
        `(0.71 − 0.71i) × ${h}`,
        `Real: 0.71 × ${h} = ${fmt(resRe)}`,
        `Imag: (−0.71) × ${h} = ${fmt(resIm)}`,
        `Answer: ${fmtComplex(resRe, resIm)}`,
      ],
    };
  }

  // basic: T† applied to integer |1⟩ coefficient
  const a = rndNZ(1, 4);
  const resRe = Math.round(tdRe * a * 100) / 100;
  const resIm = Math.round(tdIm * a * 100) / 100;
  return {
    type: 't_dagger_apply',
    question: `Apply the T† gate to the |1⟩ coefficient ${a}.\nT† multiplies the |1⟩ amplitude by e^(−iπ/4) ≈ (0.71 − 0.71i).\nAnswer as a complex number (re, im):`,
    answer: [resRe, resIm],
    answerDisplay: fmtComplex(resRe, resIm),
    answerType: 'complex',
    difficulty: d,
    steps: [
      `T† = [[1,0],[0,e^(−iπ/4)]] multiplies |1⟩ by e^(−iπ/4) ≈ 0.71 − 0.71i.`,
      `(0.71 − 0.71i) × ${a}`,
      `Real: 0.71 × ${a} = ${fmt(resRe)}`,
      `Imag: (−0.71) × ${a} = ${fmt(resIm)}`,
      `Answer: ${fmtComplex(resRe, resIm)}`,
    ],
  };
}

function phaseFamily(d, variation = 'basic') {
  // Identify phase gates from angles, compose phase gates

  if (variation === 'sequence_to_gate') {
    const sequences = [
      { seq: 'T·T', result: 'S', explain: 'T² = S because e^(iπ/4) × e^(iπ/4) = e^(iπ/2) = i.' },
      { seq: 'S·S', result: 'Z', explain: 'S² = Z because i × i = i² = −1.' },
      { seq: 'T·T·T·T', result: 'Z', explain: 'T⁴ = Z because e^(iπ/4)⁴ = e^(iπ) = −1.' },
      { seq: 'T·T·S', result: 'Z', explain: 'T²·S = S·S = Z.' },
      { seq: 'S·T·T', result: 'Z', explain: 'S·T² = S·S = Z.' },
    ];
    const pick = sequences[rnd(0, sequences.length - 1)];
    return {
      type: 'phase_family',
      question: `What single gate is equivalent to ${pick.seq}?`,
      answer: pick.result,
      answerDisplay: pick.result,
      answerType: 'gate_name',
      difficulty: d,
      steps: [
        pick.explain,
        `Answer: ${pick.result}`,
      ],
    };
  }

  if (variation === 'find_angle') {
    const gates = [
      { name: 'T', angle: 'π/4', explain: 'P(π/4) applies a 45° phase — that is the T gate.' },
      { name: 'S', angle: 'π/2', explain: 'P(π/2) applies a 90° phase — that is the S gate.' },
      { name: 'Z', angle: 'π', explain: 'P(π) applies a 180° phase (sign flip) — that is the Z gate.' },
    ];
    const pick = gates[rnd(0, gates.length - 1)];
    return {
      type: 'phase_family',
      question: `Which named gate equals P(${pick.angle})?\nP(θ) = [[1,0],[0,e^(iθ)]]`,
      answer: pick.name,
      answerDisplay: pick.name,
      answerType: 'gate_name',
      difficulty: d,
      steps: [
        pick.explain,
        `Answer: ${pick.name}`,
      ],
    };
  }

  // basic (identify_gate): P(angle) → gate name
  const gates = [
    { angle: 'π', result: 'Z', explain: 'P(π) applies phase e^(iπ) = −1, which is the Z gate.' },
    { angle: 'π/2', result: 'S', explain: 'P(π/2) applies phase e^(iπ/2) = i, which is the S gate.' },
    { angle: 'π/4', result: 'T', explain: 'P(π/4) applies phase e^(iπ/4), which is the T gate.' },
  ];
  const pick = gates[rnd(0, gates.length - 1)];
  return {
    type: 'phase_family',
    question: `The phase gate P(θ) = [[1,0],[0,e^(iθ)]].\nWhat named gate is P(${pick.angle})?`,
    answer: pick.result,
    answerDisplay: pick.result,
    answerType: 'gate_name',
    difficulty: d,
    steps: [
      pick.explain,
      `Answer: ${pick.result}`,
    ],
  };
}

// ── Chapter 14: Multi-Qubit Gates ────────────────────────────────────────────

function czApply(d, variation = 'basic') {
  // CZ = diag(1,1,1,-1): only negates the |11⟩ component
  const labels = ['|00⟩','|01⟩','|10⟩','|11⟩'];

  if (variation === 'basic_00') {
    // CZ|00⟩ = |00⟩ (no change)
    const basisIdx = rnd(0, 1); // pick |00⟩ or |01⟩
    const inp = [0,0,0,0]; inp[basisIdx] = 1;
    const out = inp.slice(); // same — no sign change
    return {
      type: 'cz_apply', question: `Apply CZ to ${labels[basisIdx]}. Result as a 4-vector:`,
      answer: out, answerDisplay: `(${out.join(', ')})`, answerType: 'vector4', difficulty: d,
      steps: [
        `CZ = diag(1,1,1,−1). It only negates the |11⟩ component.`,
        `${labels[basisIdx]} has no |11⟩ component, so CZ leaves it unchanged.`,
        `Result: (${out.join(', ')})`,
      ],
    };
  }

  if (variation === 'basic_11') {
    // CZ|11⟩ = −|11⟩, or CZ|10⟩ = |10⟩
    const pick11 = rnd(0, 1) === 0;
    if (pick11) {
      return {
        type: 'cz_apply', question: `Apply CZ to |11⟩. Result as a 4-vector:`,
        answer: [0,0,0,-1], answerDisplay: `(0, 0, 0, -1)`, answerType: 'vector4', difficulty: d,
        steps: [
          `CZ = diag(1,1,1,−1). The |11⟩ coefficient gets multiplied by −1.`,
          `CZ|11⟩ = −|11⟩ = (0, 0, 0, −1)`,
        ],
      };
    } else {
      return {
        type: 'cz_apply', question: `Apply CZ to |10⟩. Result as a 4-vector:`,
        answer: [0,0,1,0], answerDisplay: `(0, 0, 1, 0)`, answerType: 'vector4', difficulty: d,
        steps: [
          `CZ = diag(1,1,1,−1). Only |11⟩ gets negated.`,
          `|10⟩ has no |11⟩ component, so CZ|10⟩ = |10⟩ = (0, 0, 1, 0)`,
        ],
      };
    }
  }

  if (variation === 'superposition') {
    // CZ on a Bell-like superposition
    const cases = [
      { inVec: [0.71, 0, 0, 0.71], outVec: [0.71, 0, 0, -0.71],
        inLabel: '0.71|00⟩ + 0.71|11⟩', outLabel: '0.71|00⟩ − 0.71|11⟩' },
      { inVec: [0, 0.71, 0.71, 0], outVec: [0, 0.71, 0.71, 0],
        inLabel: '0.71|01⟩ + 0.71|10⟩', outLabel: '0.71|01⟩ + 0.71|10⟩ (unchanged — no |11⟩)' },
      { inVec: [0.5, 0.5, 0.5, 0.5], outVec: [0.5, 0.5, 0.5, -0.5],
        inLabel: '0.5|00⟩ + 0.5|01⟩ + 0.5|10⟩ + 0.5|11⟩', outLabel: '0.5|00⟩ + 0.5|01⟩ + 0.5|10⟩ − 0.5|11⟩' },
    ];
    const pick = cases[rnd(0, cases.length - 1)];
    return {
      type: 'cz_apply', question: `Apply CZ to (${pick.inVec.join(', ')}). Result:`,
      answer: pick.outVec, answerDisplay: `(${pick.outVec.join(', ')})`, answerType: 'vector4', difficulty: d,
      steps: [
        `CZ = diag(1,1,1,−1). Only the |11⟩ coefficient is negated.`,
        `Input: ${pick.inLabel}`,
        `Negate only the |11⟩ component:`,
        `Result: ${pick.outLabel}`,
        `As a 4-vector: (${pick.outVec.join(', ')})`,
      ],
    };
  }

  if (variation === 'symmetry') {
    // Show CZ is symmetric: swapping qubits then applying CZ gives same result
    // CZ applied to |10⟩ = |10⟩, CZ applied to |01⟩ = |01⟩
    // CZ applied to |11⟩ = -|11⟩ (same regardless of which qubit is "control")
    const idx = rnd(0, 3);
    const diag = [1, 1, 1, -1];
    const inp = [0, 0, 0, 0]; inp[idx] = 1;
    const out = inp.slice(); out[idx] = diag[idx];
    return {
      type: 'cz_apply', question: `Apply CZ to ${labels[idx]}. Result as a 4-vector:`,
      answer: out, answerDisplay: `(${out.join(', ')})`, answerType: 'vector4', difficulty: d,
      steps: [
        `CZ = diag(1,1,1,−1). It is symmetric — it doesn't matter which qubit is "control."`,
        `The ${labels[idx]} coefficient is multiplied by ${diag[idx]}.`,
        `Result: (${out.join(', ')})`,
      ],
    };
  }

  // default basic: random basis state
  const idx = rnd(0, 3);
  const diag = [1, 1, 1, -1];
  const inp = [0, 0, 0, 0]; inp[idx] = 1;
  const out = inp.slice(); out[idx] = diag[idx];
  return {
    type: 'cz_apply', question: `Apply CZ to ${labels[idx]}. Result as a 4-vector:`,
    answer: out, answerDisplay: `(${out.join(', ')})`, answerType: 'vector4', difficulty: d,
    steps: [
      `CZ = diag(1,1,1,−1). Only the |11⟩ component gets negated.`,
      `${labels[idx]} → coefficient multiplied by ${diag[idx]}`,
      `Result: (${out.join(', ')})`,
    ],
  };
}

function swapApply(d, variation = 'basic') {
  // SWAP: (a,b,c,d) → (a,c,b,d) — swaps indices 1↔2
  const labels = ['|00⟩','|01⟩','|10⟩','|11⟩'];

  if (variation === 'basic_basis') {
    // SWAP on |01⟩ or |10⟩
    const pick01 = rnd(0, 1) === 0;
    if (pick01) {
      return {
        type: 'swap_apply', question: `Apply SWAP to |01⟩. Result as a 4-vector:`,
        answer: [0,0,1,0], answerDisplay: `(0, 0, 1, 0)`, answerType: 'vector4', difficulty: d,
        steps: [
          `SWAP exchanges the two qubits: |01⟩ → |10⟩`,
          `|10⟩ = (0, 0, 1, 0)`,
        ],
      };
    } else {
      return {
        type: 'swap_apply', question: `Apply SWAP to |10⟩. Result as a 4-vector:`,
        answer: [0,1,0,0], answerDisplay: `(0, 1, 0, 0)`, answerType: 'vector4', difficulty: d,
        steps: [
          `SWAP exchanges the two qubits: |10⟩ → |01⟩`,
          `|01⟩ = (0, 1, 0, 0)`,
        ],
      };
    }
  }

  if (variation === 'both_same') {
    // SWAP|00⟩ = |00⟩ or SWAP|11⟩ = |11⟩
    const pick00 = rnd(0, 1) === 0;
    const idx = pick00 ? 0 : 3;
    const vec = [0, 0, 0, 0]; vec[idx] = 1;
    return {
      type: 'swap_apply', question: `Apply SWAP to ${labels[idx]}. Result as a 4-vector:`,
      answer: vec, answerDisplay: `(${vec.join(', ')})`, answerType: 'vector4', difficulty: d,
      steps: [
        `SWAP exchanges qubits: ${labels[idx]} → ${labels[idx]}`,
        `Both qubits are the same, so swapping changes nothing.`,
        `Result: (${vec.join(', ')})`,
      ],
    };
  }

  if (variation === 'superposition') {
    // SWAP on superposition: (a,b,c,d) → (a,c,b,d)
    const cases = [
      { inVec: [0, 0.71, 0.71, 0], outVec: [0, 0.71, 0.71, 0],
        explain: 'SWAP: (0, 0.71, 0.71, 0) → (0, 0.71, 0.71, 0) — swapping |01⟩↔|10⟩ with equal amplitudes gives same state' },
      { inVec: [0.71, 0, 0, 0.71], outVec: [0.71, 0, 0, 0.71],
        explain: 'SWAP: (0.71, 0, 0, 0.71) → (0.71, 0, 0, 0.71) — |00⟩ and |11⟩ are unchanged by SWAP' },
      { inVec: [0.5, 0.5, 0.5, 0.5], outVec: [0.5, 0.5, 0.5, 0.5],
        explain: 'SWAP: all equal amplitudes → same state' },
      { inVec: [0, 1, 0, 0], outVec: [0, 0, 1, 0],
        explain: 'SWAP|01⟩ = |10⟩: (0, 1, 0, 0) → (0, 0, 1, 0)' },
      { inVec: [0.5, 0.87, 0, 0], outVec: [0.5, 0, 0.87, 0],
        explain: 'SWAP: (a,b,c,d) → (a,c,b,d), so (0.5, 0.87, 0, 0) → (0.5, 0, 0.87, 0)' },
    ];
    const pick = cases[rnd(0, cases.length - 1)];
    return {
      type: 'swap_apply', question: `Apply SWAP to (${pick.inVec.join(', ')}). Result:`,
      answer: pick.outVec, answerDisplay: `(${pick.outVec.join(', ')})`, answerType: 'vector4', difficulty: d,
      steps: [
        `SWAP rule: (a, b, c, d) → (a, c, b, d) — swap indices 1 and 2.`,
        pick.explain,
        `Result: (${pick.outVec.join(', ')})`,
      ],
    };
  }

  if (variation === 'three_cnots') {
    // SWAP = CNOT₁₂ · CNOT₂₁ · CNOT₁₂ — verify on a basis state
    // Use |01⟩ or |10⟩ to show the swap happens
    const pick01 = rnd(0, 1) === 0;
    if (pick01) {
      // Verify SWAP|01⟩ = |10⟩ through 3 CNOTs
      return {
        type: 'swap_apply', question: `SWAP = CNOT₁₂·CNOT₂₁·CNOT₁₂. Apply SWAP to |01⟩. Result:`,
        answer: [0, 0, 1, 0], answerDisplay: `(0, 0, 1, 0)`, answerType: 'vector4', difficulty: d,
        steps: [
          `Step 1: CNOT₁₂|01⟩ = |01⟩ (control=0, no flip)`,
          `Step 2: CNOT₂₁|01⟩ = |11⟩ (control=1 on 2nd qubit, flip 1st)`,
          `Step 3: CNOT₁₂|11⟩ = |10⟩ (control=1, flip 2nd)`,
          `Result: |01⟩ → |10⟩ = (0, 0, 1, 0) ✓ SWAP confirmed`,
        ],
      };
    } else {
      return {
        type: 'swap_apply', question: `SWAP = CNOT₁₂·CNOT₂₁·CNOT₁₂. Apply SWAP to |10⟩. Result:`,
        answer: [0, 1, 0, 0], answerDisplay: `(0, 1, 0, 0)`, answerType: 'vector4', difficulty: d,
        steps: [
          `Step 1: CNOT₁₂|10⟩ = |11⟩ (control=1, flip target)`,
          `Step 2: CNOT₂₁|11⟩ = |01⟩ (control=1 on 2nd, flip 1st)`,
          `Step 3: CNOT₁₂|01⟩ = |01⟩ (control=0, no flip)`,
          `Result: |10⟩ → |01⟩ = (0, 1, 0, 0) ✓ SWAP confirmed`,
        ],
      };
    }
  }

  // default basic: random basis state
  const idx = rnd(0, 3);
  const inp = [0, 0, 0, 0]; inp[idx] = 1;
  // SWAP: swap indices 1 and 2
  const out = [inp[0], inp[2], inp[1], inp[3]];
  const swappedLabels = ['|00⟩','|10⟩','|01⟩','|11⟩']; // SWAP of each basis
  return {
    type: 'swap_apply', question: `Apply SWAP to ${labels[idx]}. Result as a 4-vector:`,
    answer: out, answerDisplay: `(${out.join(', ')})`, answerType: 'vector4', difficulty: d,
    steps: [
      `SWAP exchanges the two qubits: ${labels[idx]} → ${swappedLabels[idx]}`,
      `Result: (${out.join(', ')})`,
    ],
  };
}

function toffoliApply(d, variation = 'basic') {
  // Toffoli (CCX): 3-qubit gate. Flips target (3rd qubit) only when BOTH controls (qubits 1,2) are |1⟩.
  // In 8-element vector [|000⟩,...,|111⟩], swaps indices 6↔7: (a,b,c,d,e,f,g,h) → (a,b,c,d,e,f,h,g)
  const labels8 = ['|000⟩','|001⟩','|010⟩','|011⟩','|100⟩','|101⟩','|110⟩','|111⟩'];

  if (variation === 'both_controls_1') {
    // |110⟩ → |111⟩ or |111⟩ → |110⟩
    const pick110 = rnd(0, 1) === 0;
    if (pick110) {
      return {
        type: 'toffoli_apply', question: `Apply Toffoli to |110⟩. Result as an 8-vector:`,
        answer: [0,0,0,0,0,0,0,1], answerDisplay: `(0, 0, 0, 0, 0, 0, 0, 1)`, answerType: 'vector8', difficulty: d,
        steps: [
          `Toffoli flips the target qubit when both controls are |1⟩.`,
          `|110⟩: both controls = |1⟩, so target flips: 0 → 1`,
          `|110⟩ → |111⟩ = (0, 0, 0, 0, 0, 0, 0, 1)`,
        ],
      };
    } else {
      return {
        type: 'toffoli_apply', question: `Apply Toffoli to |111⟩. Result as an 8-vector:`,
        answer: [0,0,0,0,0,0,1,0], answerDisplay: `(0, 0, 0, 0, 0, 0, 1, 0)`, answerType: 'vector8', difficulty: d,
        steps: [
          `Toffoli flips the target qubit when both controls are |1⟩.`,
          `|111⟩: both controls = |1⟩, so target flips: 1 → 0`,
          `|111⟩ → |110⟩ = (0, 0, 0, 0, 0, 0, 1, 0)`,
        ],
      };
    }
  }

  if (variation === 'one_control_0') {
    // Only one control is |1⟩ — no flip. Pick from |100⟩, |101⟩, |010⟩, |011⟩
    const choices = [4, 5, 2, 3]; // indices of |100⟩, |101⟩, |010⟩, |011⟩
    const idx = choices[rnd(0, choices.length - 1)];
    const out = [0,0,0,0,0,0,0,0]; out[idx] = 1;
    return {
      type: 'toffoli_apply', question: `Apply Toffoli to ${labels8[idx]}. Result as an 8-vector:`,
      answer: out, answerDisplay: `(${out.join(', ')})`, answerType: 'vector8', difficulty: d,
      steps: [
        `Toffoli only flips the target when BOTH controls are |1⟩.`,
        `${labels8[idx]}: not both controls are |1⟩, so no change.`,
        `Result: (${out.join(', ')})`,
      ],
    };
  }

  if (variation === 'both_controls_0') {
    // Neither control is |1⟩: |000⟩ or |001⟩
    const idx = rnd(0, 1);
    const out = [0,0,0,0,0,0,0,0]; out[idx] = 1;
    return {
      type: 'toffoli_apply', question: `Apply Toffoli to ${labels8[idx]}. Result as an 8-vector:`,
      answer: out, answerDisplay: `(${out.join(', ')})`, answerType: 'vector8', difficulty: d,
      steps: [
        `Toffoli only acts when both controls are |1⟩.`,
        `${labels8[idx]}: both controls are |0⟩, so nothing happens.`,
        `Result: (${out.join(', ')})`,
      ],
    };
  }

  if (variation === 'superposition_controls') {
    // Superposition involving |110⟩ and |111⟩
    const cases = [
      { inVec: [0, 0, 0, 0, 0, 0, 0.71, 0.71], outVec: [0, 0, 0, 0, 0, 0, 0.71, 0.71],
        explain: 'Both |110⟩ and |111⟩ have both controls=|1⟩, so Toffoli swaps them: 0.71|110⟩+0.71|111⟩ → 0.71|111⟩+0.71|110⟩ = same state' },
      { inVec: [0.71, 0, 0, 0, 0, 0, 0.71, 0], outVec: [0.71, 0, 0, 0, 0, 0, 0, 0.71],
        explain: '|000⟩ unchanged, |110⟩ flips to |111⟩: (0.71, 0, 0, 0, 0, 0, 0.71, 0) → (0.71, 0, 0, 0, 0, 0, 0, 0.71)' },
      { inVec: [0, 0, 0, 0, 0.71, 0, 0, 0.71], outVec: [0, 0, 0, 0, 0.71, 0, 0.71, 0],
        explain: '|100⟩ unchanged (one control=0), |111⟩ flips to |110⟩: (0, 0, 0, 0, 0.71, 0, 0, 0.71) → (0, 0, 0, 0, 0.71, 0, 0.71, 0)' },
    ];
    const pick = cases[rnd(0, cases.length - 1)];
    return {
      type: 'toffoli_apply', question: `Apply Toffoli to (${pick.inVec.join(', ')}). Result:`,
      answer: pick.outVec, answerDisplay: `(${pick.outVec.join(', ')})`, answerType: 'vector8', difficulty: d,
      steps: [
        `Toffoli swaps indices 6↔7 (|110⟩↔|111⟩). All other basis states unchanged.`,
        pick.explain,
        `Result: (${pick.outVec.join(', ')})`,
      ],
    };
  }

  // default basic: random basis state
  const idx = rnd(0, 7);
  const out = [0,0,0,0,0,0,0,0]; out[idx] = 1;
  // Toffoli swaps 6↔7 only
  if (idx === 6) { out[6] = 0; out[7] = 1; }
  else if (idx === 7) { out[7] = 0; out[6] = 1; }
  const outIdx = idx === 6 ? 7 : idx === 7 ? 6 : idx;
  return {
    type: 'toffoli_apply', question: `Apply Toffoli to ${labels8[idx]}. Result as an 8-vector:`,
    answer: out, answerDisplay: `(${out.join(', ')})`, answerType: 'vector8', difficulty: d,
    steps: [
      `Toffoli flips the target only when both controls are |1⟩.`,
      idx === 6 || idx === 7
        ? `${labels8[idx]}: both controls = |1⟩, target flips → ${labels8[outIdx]}`
        : `${labels8[idx]}: not both controls |1⟩, no change`,
      `Result: (${out.join(', ')})`,
    ],
  };
}

function controlledGate(d, variation = 'basic') {
  // General controlled-U gates acting on 2-qubit states

  if (variation === 'controlled_h') {
    // CH: if control=|1⟩, apply H to target. H = [[1,1],[1,-1]]/√2
    // CH|10⟩ = |1⟩⊗H|0⟩ = |1⟩⊗(|0⟩+|1⟩)/√2 = (0, 0, 0.71, 0.71)
    // CH|11⟩ = |1⟩⊗H|1⟩ = |1⟩⊗(|0⟩−|1⟩)/√2 = (0, 0, 0.71, -0.71)
    const cases = [
      { input: '|10⟩', outVec: [0, 0, 0.71, 0.71],
        explain: 'Control=|1⟩, apply H to target |0⟩: H|0⟩ = (|0⟩+|1⟩)/√2 ≈ (0.71, 0.71). Result: |1⟩⊗(0.71, 0.71) = (0, 0, 0.71, 0.71)' },
      { input: '|11⟩', outVec: [0, 0, 0.71, -0.71],
        explain: 'Control=|1⟩, apply H to target |1⟩: H|1⟩ = (|0⟩−|1⟩)/√2 ≈ (0.71, −0.71). Result: |1⟩⊗(0.71, −0.71) = (0, 0, 0.71, −0.71)' },
      { input: '|00⟩', outVec: [1, 0, 0, 0],
        explain: 'Control=|0⟩, no gate applied. |00⟩ unchanged: (1, 0, 0, 0)' },
      { input: '|01⟩', outVec: [0, 1, 0, 0],
        explain: 'Control=|0⟩, no gate applied. |01⟩ unchanged: (0, 1, 0, 0)' },
    ];
    const pick = cases[rnd(0, cases.length - 1)];
    return {
      type: 'controlled_gate', question: `Apply Controlled-H (CH) to ${pick.input}. Result:`,
      answer: pick.outVec, answerDisplay: `(${pick.outVec.join(', ')})`, answerType: 'vector4', difficulty: d,
      steps: [
        `CH: if control qubit (1st) is |1⟩, apply H to target (2nd). Otherwise do nothing.`,
        pick.explain,
        `Result: (${pick.outVec.join(', ')})`,
      ],
    };
  }

  if (variation === 'controlled_s') {
    // CS: if control=|1⟩, apply S to target. S = [[1,0],[0,i]]
    // CS|11⟩ = |1⟩⊗S|1⟩ = |1⟩⊗(i|1⟩) — but we use real approx: i ≈ complex
    // For vector4 (real-valued), CS on basis states:
    // CS|00⟩ = |00⟩ = (1,0,0,0), CS|01⟩ = |01⟩ = (0,1,0,0), CS|10⟩ = |10⟩ = (0,0,1,0)
    // CS|11⟩ = i|11⟩ — but this is complex. Let's use the CZ-like framing.
    // Actually, for CS on |10⟩+|11⟩ type superpositions we'd need complex answers.
    // Keep it simple: CS on basis states where answer is real, or note the phase.
    // Since the app supports only real vector4, we use CZ-style: show that CS|11⟩ picks up phase i.
    // Actually, we can test on |10⟩ (no change) and |00⟩ (no change) for clean real answers.
    const cases = [
      { input: '|10⟩', outVec: [0, 0, 1, 0],
        explain: 'Control=|1⟩, apply S to target |0⟩: S|0⟩ = |0⟩ (S only changes |1⟩). Result: |10⟩ = (0, 0, 1, 0)' },
      { input: '|00⟩', outVec: [1, 0, 0, 0],
        explain: 'Control=|0⟩, no gate applied. |00⟩ unchanged: (1, 0, 0, 0)' },
      { input: '|01⟩', outVec: [0, 1, 0, 0],
        explain: 'Control=|0⟩, no gate applied. |01⟩ unchanged: (0, 1, 0, 0)' },
    ];
    const pick = cases[rnd(0, cases.length - 1)];
    return {
      type: 'controlled_gate', question: `Apply Controlled-S (CS) to ${pick.input}. Result:`,
      answer: pick.outVec, answerDisplay: `(${pick.outVec.join(', ')})`, answerType: 'vector4', difficulty: d,
      steps: [
        `CS: if control qubit is |1⟩, apply S to target. S = [[1,0],[0,i]].`,
        `S leaves |0⟩ unchanged and multiplies |1⟩ by i.`,
        pick.explain,
        `Result: (${pick.outVec.join(', ')})`,
      ],
    };
  }

  if (variation === 'controlled_vs_uncontrolled') {
    // Compare: what's different between applying H vs CH?
    // CH|00⟩ = |00⟩ (no change), but (I⊗H)|00⟩ = |0⟩⊗|+⟩ = (0.71, 0.71, 0, 0)
    // Or: CH|10⟩ = (0, 0, 0.71, 0.71), and H⊗I|10⟩ wouldn't make sense (different operation)
    // Let's ask about CZ vs Z: CZ|01⟩ = |01⟩ but (I⊗Z)|01⟩ = |0⟩⊗Z|1⟩ = -|01⟩
    // Actually keep it about CH for consistency:
    const cases = [
      { input: '|00⟩', gate: 'CH', outVec: [1, 0, 0, 0],
        explain: 'CH|00⟩: control=|0⟩, so H is NOT applied. State unchanged: (1, 0, 0, 0)' },
      { input: '|10⟩', gate: 'CH', outVec: [0, 0, 0.71, 0.71],
        explain: 'CH|10⟩: control=|1⟩, so H IS applied to target |0⟩. Result: (0, 0, 0.71, 0.71)' },
      { input: '|00⟩', gate: 'CZ', outVec: [1, 0, 0, 0],
        explain: 'CZ|00⟩ = |00⟩. No |11⟩ component to negate. Result: (1, 0, 0, 0)' },
      { input: '|11⟩', gate: 'CZ', outVec: [0, 0, 0, -1],
        explain: 'CZ|11⟩ = −|11⟩. The |11⟩ component is negated. Result: (0, 0, 0, −1)' },
    ];
    const pick = cases[rnd(0, cases.length - 1)];
    return {
      type: 'controlled_gate', question: `Apply ${pick.gate} to ${pick.input}. Result:`,
      answer: pick.outVec, answerDisplay: `(${pick.outVec.join(', ')})`, answerType: 'vector4', difficulty: d,
      steps: [
        `Controlled gates only apply the gate when the control qubit is |1⟩.`,
        pick.explain,
        `Result: (${pick.outVec.join(', ')})`,
      ],
    };
  }

  // default basic: CH on a random basis state
  const basisCH = [
    { input: '|00⟩', outVec: [1, 0, 0, 0], explain: 'Control=|0⟩, nothing happens.' },
    { input: '|01⟩', outVec: [0, 1, 0, 0], explain: 'Control=|0⟩, nothing happens.' },
    { input: '|10⟩', outVec: [0, 0, 0.71, 0.71], explain: 'Control=|1⟩, H applied to target |0⟩: (0, 0, 0.71, 0.71)' },
    { input: '|11⟩', outVec: [0, 0, 0.71, -0.71], explain: 'Control=|1⟩, H applied to target |1⟩: (0, 0, 0.71, −0.71)' },
  ];
  const pick = basisCH[rnd(0, basisCH.length - 1)];
  return {
    type: 'controlled_gate', question: `Apply Controlled-H (CH) to ${pick.input}. Result:`,
    answer: pick.outVec, answerDisplay: `(${pick.outVec.join(', ')})`, answerType: 'vector4', difficulty: d,
    steps: [
      `CH: if control (1st qubit) is |1⟩, apply H to target (2nd qubit).`,
      pick.explain,
      `Result: (${pick.outVec.join(', ')})`,
    ],
  };
}

// ── Chapter 15: Quantum Teleportation ────────────────────────────────────────

function teleportationConcept(d, variation = 'basic') {
  const items = {
    why_not_copy: {
      q: 'Why can\'t Alice simply copy |ψ⟩ and send the copy to Bob?',
      choices: [
        'Copying would take too long',
        'The no-cloning theorem forbids copying an unknown quantum state',
        'Bob\'s qubit would interfere with the copy',
        'Quantum states can only travel at the speed of light',
      ],
      answer: 'B', display: 'B) The no-cloning theorem forbids copying an unknown quantum state',
      steps: [
        'The no-cloning theorem says no quantum operation can duplicate an arbitrary unknown state.',
        'This is a fundamental result — there is no "quantum photocopier."',
        'Teleportation gets around this by destroying the original state at Alice\'s end.',
      ],
    },
    why_not_measure: {
      q: 'Why can\'t Alice just measure |ψ⟩ and send the result to Bob?',
      choices: [
        'Measurement takes too much energy',
        'Measurement destroys the superposition — Bob would only get a basis state',
        'Classical bits cannot travel between Alice and Bob',
        'Measurement always gives the same result',
      ],
      answer: 'B', display: 'B) Measurement destroys the superposition — Bob would only get a basis state',
      steps: [
        'Measuring |ψ⟩ = α|0⟩ + β|1⟩ collapses it to either |0⟩ or |1⟩.',
        'The amplitudes α and β are lost — Bob cannot reconstruct the original state.',
        'Teleportation preserves the full quantum state, including superposition and phase.',
      ],
    },
    what_is_shared: {
      q: 'What resource must Alice and Bob share before teleportation can begin?',
      choices: [
        'A classical communication channel only',
        'A shared Bell pair (entangled qubits)',
        'A copy of the state |ψ⟩',
        'A quantum computer',
      ],
      answer: 'B', display: 'B) A shared Bell pair (entangled qubits)',
      steps: [
        'Teleportation requires a pre-shared entangled pair, typically |Φ+⟩ = (1/√2)(|00⟩ + |11⟩).',
        'Alice holds one qubit of the pair, Bob holds the other.',
        'They also need a classical channel (2 bits), but the entanglement is the key quantum resource.',
      ],
    },
  };

  let pool;
  if (variation === 'why_not_copy') pool = ['why_not_copy'];
  else if (variation === 'why_not_measure') pool = ['why_not_measure'];
  else if (variation === 'what_is_shared') pool = ['what_is_shared'];
  else pool = ['why_not_copy', 'why_not_measure', 'what_is_shared'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'teleportation_concept', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function teleportSetup(d, variation = 'basic') {
  const s = 0.71; // 1/√2 ≈ 0.71

  if (variation === 'general') {
    // (α|0⟩ + β|1⟩) ⊗ (1/√2)(|00⟩ + |11⟩)
    // = (α/√2)|000⟩ + (α/√2)|011⟩ + (β/√2)|100⟩ + (β/√2)|111⟩
    const pairs = [
      { a: 0, b: 1, label: '|1⟩' },
      { a: s, b: s, label: '|+⟩ = (0.71|0⟩ + 0.71|1⟩)' },
      { a: s, b: -s, label: '|−⟩ = (0.71|0⟩ − 0.71|1⟩)' },
    ];
    const pick = pairs[rnd(0, pairs.length - 1)];
    const alpha = pick.a, beta = pick.b;
    // 8-vector: |000⟩,|001⟩,|010⟩,|011⟩,|100⟩,|101⟩,|110⟩,|111⟩
    const ans = [
      r2(alpha * s), 0, 0, r2(alpha * s),
      r2(beta * s), 0, 0, r2(beta * s),
    ];
    return {
      type: 'teleport_setup',
      question: `Write the initial 3-qubit state ${pick.label} ⊗ |Φ+⟩ as an 8-vector.\n|Φ+⟩ = (1/√2)(|00⟩ + |11⟩). Basis order: |000⟩,|001⟩,...,|111⟩. Round to 0.01.`,
      answer: ans,
      answerDisplay: `(${ans.join(', ')})`,
      answerType: 'vector8',
      difficulty: d,
      steps: [
        `${pick.label} ⊗ |Φ+⟩ = (α|0⟩ + β|1⟩) ⊗ (1/√2)(|00⟩ + |11⟩)`,
        `= (α/√2)|000⟩ + (α/√2)|011⟩ + (β/√2)|100⟩ + (β/√2)|111⟩`,
        `α = ${fmt(alpha)}, β = ${fmt(beta)}`,
        `8-vector: (${ans.join(', ')})`,
      ],
    };
  }

  // basic: |0⟩ ⊗ |Φ+⟩ = (1/√2)(|000⟩ + |011⟩)
  const ans = [s, 0, 0, s, 0, 0, 0, 0];
  return {
    type: 'teleport_setup',
    question: `Write |0⟩ ⊗ |Φ+⟩ as an 8-vector.\n|Φ+⟩ = (1/√2)(|00⟩ + |11⟩). Basis order: |000⟩,|001⟩,...,|111⟩. Round to 0.01.`,
    answer: ans,
    answerDisplay: `(${ans.join(', ')})`,
    answerType: 'vector8',
    difficulty: d,
    steps: [
      `|0⟩ ⊗ |Φ+⟩ = |0⟩ ⊗ (1/√2)(|00⟩ + |11⟩)`,
      `= (1/√2)(|000⟩ + |011⟩)`,
      `8-vector: (${s}, 0, 0, ${s}, 0, 0, 0, 0)`,
    ],
  };
}

function teleportAliceOps(d, variation = 'basic') {
  const s = 0.71; // 1/√2

  if (variation === 'cnot_step') {
    // Alice applies CNOT (her ψ-qubit controls Bell qubit)
    const inputs = [
      { in: [s, 0, s, 0], out: [s, 0, 0, s], label: '(0.71, 0, 0.71, 0)', outLabel: '(0.71, 0, 0, 0.71)',
        explain: 'CNOT flips target when control=|1⟩: |00⟩→|00⟩, |10⟩→|11⟩' },
      { in: [0, s, 0, s], out: [0, s, s, 0], label: '(0, 0.71, 0, 0.71)', outLabel: '(0, 0.71, 0.71, 0)',
        explain: 'CNOT flips target when control=|1⟩: |01⟩→|01⟩, |11⟩→|10⟩' },
    ];
    const pick = inputs[rnd(0, 1)];
    return {
      type: 'teleport_alice_ops',
      question: `In teleportation, Alice applies CNOT (her ψ-qubit controls the Bell qubit).\nApply CNOT to ${pick.label}. Result as a 4-vector:`,
      answer: pick.out,
      answerDisplay: pick.outLabel,
      answerType: 'vector4',
      difficulty: d,
      steps: [
        pick.explain,
        `Result: ${pick.outLabel}`,
      ],
    };
  }

  if (variation === 'hadamard_step') {
    // After CNOT, Alice applies H⊗I
    const cases = [
      { in: [s, 0, 0, s], out: [0.5, 0.5, 0.5, -0.5], inLabel: '(0.71, 0, 0, 0.71)',
        steps: [
          'Apply H⊗I: H acts on first qubit only.',
          '0.71|00⟩ → 0.71·(0.71|00⟩ + 0.71|10⟩) = 0.5|00⟩ + 0.5|10⟩',
          '0.71|11⟩ → 0.71·(0.71|01⟩ − 0.71|11⟩) = 0.5|01⟩ − 0.5|11⟩',
          'Result: (0.5, 0.5, 0.5, -0.5)',
        ]},
      { in: [0, s, s, 0], out: [0.5, -0.5, 0.5, 0.5], inLabel: '(0, 0.71, 0.71, 0)',
        steps: [
          'Apply H⊗I: H acts on first qubit only.',
          '0.71|01⟩ → 0.71·(0.71|01⟩ + 0.71|11⟩) = 0.5|01⟩ + 0.5|11⟩',
          '0.71|10⟩ → 0.71·(0.71|00⟩ − 0.71|10⟩) = 0.5|00⟩ − 0.5|10⟩',
          'Result: (0.5, -0.5, 0.5, 0.5)',
        ]},
    ];
    const pick = cases[rnd(0, 1)];
    return {
      type: 'teleport_alice_ops',
      question: `Alice applies H⊗I to the 2-qubit state ${pick.inLabel}.\nResult as a 4-vector:`,
      answer: pick.out,
      answerDisplay: `(${pick.out.join(', ')})`,
      answerType: 'vector4',
      difficulty: d,
      steps: pick.steps,
    };
  }

  // full_alice (default/basic): CNOT then H⊗I
  const cases = [
    { in: [s, 0, s, 0], inLabel: '(0.71, 0, 0.71, 0)',
      afterCnot: [s, 0, 0, s], out: [0.5, 0.5, 0.5, -0.5],
      steps: [
        'Step 1 — CNOT: |00⟩→|00⟩, |10⟩→|11⟩',
        'After CNOT: (0.71, 0, 0, 0.71)',
        'Step 2 — H⊗I on first qubit:',
        '0.71|00⟩ → 0.5|00⟩ + 0.5|10⟩',
        '0.71|11⟩ → 0.5|01⟩ − 0.5|11⟩',
        'Result: (0.5, 0.5, 0.5, -0.5)',
      ]},
    { in: [0, s, 0, s], inLabel: '(0, 0.71, 0, 0.71)',
      afterCnot: [0, s, s, 0], out: [0.5, -0.5, 0.5, 0.5],
      steps: [
        'Step 1 — CNOT: |01⟩→|01⟩, |11⟩→|10⟩',
        'After CNOT: (0, 0.71, 0.71, 0)',
        'Step 2 — H⊗I on first qubit:',
        '0.71|01⟩ → 0.5|01⟩ + 0.5|11⟩',
        '0.71|10⟩ → 0.5|00⟩ − 0.5|10⟩',
        'Result: (0.5, -0.5, 0.5, 0.5)',
      ]},
  ];
  const pick = cases[rnd(0, 1)];
  return {
    type: 'teleport_alice_ops',
    question: `In teleportation, Alice applies CNOT then H⊗I to ${pick.inLabel}.\nFinal 4-vector:`,
    answer: pick.out,
    answerDisplay: `(${pick.out.join(', ')})`,
    answerType: 'vector4',
    difficulty: d,
    steps: pick.steps,
  };
}

function teleportMeasurement(d, variation = 'basic') {
  const items = {
    outcome_00: {
      q: 'Alice measures her two qubits and gets 00. What correction gate(s) must Bob apply?',
      choices: ['No gate needed (identity)', 'X gate', 'Z gate', 'X then Z'],
      answer: 'A', display: 'A) No gate needed (identity)',
      steps: [
        'Measurement outcome 00 means Bob already has |ψ⟩.',
        'No correction is needed — the identity operation.',
      ],
    },
    outcome_01: {
      q: 'Alice measures her two qubits and gets 01. What correction gate(s) must Bob apply?',
      choices: ['No gate needed (identity)', 'X gate', 'Z gate', 'X then Z'],
      answer: 'B', display: 'B) X gate',
      steps: [
        'Measurement outcome 01 means Bob has X|ψ⟩ (bit-flipped).',
        'Bob applies X to undo the flip: X · X|ψ⟩ = |ψ⟩.',
      ],
    },
    outcome_10: {
      q: 'Alice measures her two qubits and gets 10. What correction gate(s) must Bob apply?',
      choices: ['No gate needed (identity)', 'X gate', 'Z gate', 'X then Z'],
      answer: 'C', display: 'C) Z gate',
      steps: [
        'Measurement outcome 10 means Bob has Z|ψ⟩ (phase-flipped).',
        'Bob applies Z to undo: Z · Z|ψ⟩ = |ψ⟩.',
      ],
    },
    outcome_11: {
      q: 'Alice measures her two qubits and gets 11. What correction gate(s) must Bob apply?',
      choices: ['No gate needed (identity)', 'X gate', 'Z gate', 'X then Z'],
      answer: 'D', display: 'D) X then Z',
      steps: [
        'Measurement outcome 11 means Bob has ZX|ψ⟩.',
        'Bob applies X first, then Z: Z·X · ZX|ψ⟩ = |ψ⟩.',
        'Order matters: X undoes the bit-flip, Z undoes the phase-flip.',
      ],
    },
  };

  let pool;
  if (variation === 'outcome_00') pool = ['outcome_00'];
  else if (variation === 'outcome_01') pool = ['outcome_01'];
  else if (variation === 'outcome_10') pool = ['outcome_10'];
  else if (variation === 'outcome_11') pool = ['outcome_11'];
  else pool = ['outcome_00', 'outcome_01', 'outcome_10', 'outcome_11'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'teleport_measurement', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function teleportCorrection(d, variation = 'basic') {
  // Bob receives a state and must apply correction gate to recover |ψ⟩
  // X gate: (a,b)→(b,a), Z gate: (a,b)→(a,-b)

  function makeState() {
    const options = [
      { a: 0.71, b: 0.71, label: '(0.71, 0.71)' },
      { a: 0.71, b: -0.71, label: '(0.71, -0.71)' },
      { a: 1, b: 0, label: '(1, 0)' },
      { a: 0, b: 1, label: '(0, 1)' },
      { a: 0.87, b: 0.5, label: '(0.87, 0.5)' },
      { a: 0.5, b: 0.87, label: '(0.5, 0.87)' },
      { a: 0.5, b: -0.87, label: '(0.5, -0.87)' },
    ];
    return options[rnd(0, options.length - 1)];
  }

  if (variation === 'apply_x') {
    const psi = makeState();
    // Bob has X|ψ⟩ = (b, a). Applying X recovers (a, b).
    const bobHas = [r2(psi.b), r2(psi.a)];
    const answer = [r2(psi.a), r2(psi.b)];
    return {
      type: 'teleport_correction',
      question: `Bob received (${bobHas.join(', ')}) which is X|ψ⟩.\nHe applies X to correct. What is the result?`,
      answer: answer,
      answerDisplay: `(${answer.join(', ')})`,
      answerType: 'vector',
      difficulty: d,
      steps: [
        `X gate swaps components: (a, b) → (b, a)`,
        `X · (${bobHas.join(', ')}) = (${answer.join(', ')})`,
        `Bob recovers |ψ⟩ = (${answer.join(', ')})`,
      ],
    };
  }

  if (variation === 'apply_z') {
    const psi = makeState();
    // Bob has Z|ψ⟩ = (a, -b). Applying Z recovers (a, b).
    const bobHas = [r2(psi.a), r2(-psi.b)];
    const answer = [r2(psi.a), r2(psi.b)];
    return {
      type: 'teleport_correction',
      question: `Bob received (${bobHas.join(', ')}) which is Z|ψ⟩.\nHe applies Z to correct. What is the result?`,
      answer: answer,
      answerDisplay: `(${answer.join(', ')})`,
      answerType: 'vector',
      difficulty: d,
      steps: [
        `Z gate negates the second component: (a, b) → (a, -b)`,
        `Z · (${bobHas.join(', ')}) = (${answer.join(', ')})`,
        `Bob recovers |ψ⟩ = (${answer.join(', ')})`,
      ],
    };
  }

  if (variation === 'apply_zx') {
    // Bob has ZX|ψ⟩. To recover, apply (ZX)⁻¹ = XZ (since X²=Z²=I).
    // Use: |ψ⟩ = (0.87, 0.5). ZX|ψ⟩ = Z(0.5, 0.87) = (0.5, -0.87).
    // Correction XZ: Z(0.5, -0.87) = (0.5, 0.87), then X(0.5, 0.87) = (0.87, 0.5).
    const scenarios = [
      { psi: [0.87, 0.5], bobHas: [0.5, -0.87], afterZ: [0.5, 0.87], result: [0.87, 0.5] },
      { psi: [0.5, 0.87], bobHas: [0.87, -0.5], afterZ: [0.87, 0.5], result: [0.5, 0.87] },
    ];
    const pick = scenarios[rnd(0, 1)];
    return {
      type: 'teleport_correction',
      question: `Bob has (${pick.bobHas.join(', ')}) which is ZX|ψ⟩ (outcome 11).\nHe applies Z then X to correct. What is the final state?`,
      answer: pick.result,
      answerDisplay: `(${pick.result.join(', ')})`,
      answerType: 'vector',
      difficulty: d,
      steps: [
        `Start: (${pick.bobHas.join(', ')})`,
        `Apply Z: (a, b) → (a, -b) → (${pick.afterZ.join(', ')})`,
        `Apply X: (a, b) → (b, a) → (${pick.result.join(', ')})`,
        `Bob recovers |ψ⟩ = (${pick.result.join(', ')})`,
      ],
    };
  }

  if (variation === 'full_protocol') {
    const scenarios = [
      { outcome: '01', bobHas: [0.5, 0.87], gate: 'X', result: [0.87, 0.5],
        steps: ['Outcome 01 → apply X gate', 'X swaps: (0.5, 0.87) → (0.87, 0.5)'] },
      { outcome: '10', bobHas: [0.87, -0.5], gate: 'Z', result: [0.87, 0.5],
        steps: ['Outcome 10 → apply Z gate', 'Z negates second: (0.87, -0.5) → (0.87, 0.5)'] },
      { outcome: '01', bobHas: [0.71, -0.71], gate: 'X', result: [-0.71, 0.71],
        steps: ['Outcome 01 → apply X gate', 'X swaps: (0.71, -0.71) → (-0.71, 0.71)'] },
      { outcome: '10', bobHas: [0.5, -0.87], gate: 'Z', result: [0.5, 0.87],
        steps: ['Outcome 10 → apply Z gate', 'Z negates second: (0.5, -0.87) → (0.5, 0.87)'] },
    ];
    const pick = scenarios[rnd(0, scenarios.length - 1)];
    return {
      type: 'teleport_correction',
      question: `Alice measured ${pick.outcome}. Bob has (${pick.bobHas.join(', ')}).\nApply the correction (${pick.gate}) to recover |ψ⟩:`,
      answer: pick.result,
      answerDisplay: `(${pick.result.join(', ')})`,
      answerType: 'vector',
      difficulty: d,
      steps: pick.steps,
    };
  }

  // basic: apply_x default
  const psi = makeState();
  const bobHas = [r2(psi.b), r2(psi.a)];
  const answer = [r2(psi.a), r2(psi.b)];
  return {
    type: 'teleport_correction',
    question: `Bob received (${bobHas.join(', ')}) which is X|ψ⟩.\nHe applies X to correct. What is the result?`,
    answer: answer,
    answerDisplay: `(${answer.join(', ')})`,
    answerType: 'vector',
    difficulty: d,
    steps: [
      `X gate swaps components: (a, b) → (b, a)`,
      `X · (${bobHas.join(', ')}) = (${answer.join(', ')})`,
    ],
  };
}

// ── Chapter 16: Deutsch-Jozsa Algorithm ─────────────────────────────────────

function djProblemType(d, variation = 'basic') {
  const items = {
    identify_constant: {
      q: 'A function f maps {0,1}→{0,1}. Given f(0) = 1, f(1) = 1, is f constant or balanced?',
      choices: ['Constant', 'Balanced', 'Neither', 'Cannot determine'],
      answer: 'A', display: 'A) Constant',
      steps: [
        'A constant function returns the same value for all inputs.',
        'f(0) = 1 and f(1) = 1 — both outputs are the same.',
        'Therefore f is constant.',
      ],
    },
    identify_balanced: {
      q: 'A function f maps {0,1}→{0,1}. Given f(0) = 0, f(1) = 1, is f constant or balanced?',
      choices: ['Constant', 'Balanced', 'Neither', 'Cannot determine'],
      answer: 'B', display: 'B) Balanced',
      steps: [
        'A balanced function returns 0 for exactly half of inputs and 1 for the other half.',
        'f(0) = 0 and f(1) = 1 — the outputs differ.',
        'For a 1-bit function, this means f is balanced.',
      ],
    },
    classical_queries: {
      q: 'How many queries to f does a classical computer need (worst case) to determine if a 1-bit function is constant or balanced?',
      choices: ['1', '2', '3', '4'],
      answer: 'B', display: 'B) 2',
      steps: [
        'Classically, you must check f(0) and f(1) to compare outputs.',
        'If f(0) = f(1), f is constant. If f(0) ≠ f(1), f is balanced.',
        'You need 2 queries — checking only one input tells you nothing.',
      ],
    },
    quantum_queries: {
      q: 'How many queries to the oracle does the Deutsch-Jozsa algorithm need to determine if a 1-bit function is constant or balanced?',
      choices: ['1', '2', '3', '0'],
      answer: 'A', display: 'A) 1',
      steps: [
        'The Deutsch-Jozsa algorithm queries the oracle exactly once.',
        'It uses superposition and interference to extract global information about f.',
        'After one query and measurement, the result deterministically reveals constant vs balanced.',
      ],
    },
  };

  let pool;
  if (variation === 'identify_constant') pool = ['identify_constant'];
  else if (variation === 'identify_balanced') pool = ['identify_balanced'];
  else if (variation === 'classical_queries') pool = ['classical_queries'];
  else if (variation === 'quantum_queries') pool = ['quantum_queries'];
  else pool = ['identify_constant', 'identify_balanced', 'classical_queries', 'quantum_queries'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'dj_problem_type', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function djOracle(d, variation = 'basic') {
  const items = {
    constant_0: {
      q: 'For f(x) = 0 (constant), what gate(s) does the oracle U_f apply to the ancilla qubit?',
      choices: ['Identity (do nothing)', 'X gate on ancilla', 'CNOT (control=input, target=ancilla)', 'CNOT then X on ancilla'],
      answer: 'A', display: 'A) Identity (do nothing)',
      steps: [
        'U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩.',
        'If f(x) = 0 for all x, then y ⊕ 0 = y — the ancilla is unchanged.',
        'The oracle is just the identity gate.',
      ],
    },
    constant_1: {
      q: 'For f(x) = 1 (constant), what gate(s) does the oracle U_f apply?',
      choices: ['Identity (do nothing)', 'X gate on ancilla', 'CNOT (control=input, target=ancilla)', 'CNOT then X on ancilla'],
      answer: 'B', display: 'B) X gate on ancilla',
      steps: [
        'U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩.',
        'If f(x) = 1 for all x, then y ⊕ 1 = NOT(y) — the ancilla is always flipped.',
        'This is just an X gate on the ancilla, regardless of x.',
      ],
    },
    balanced_identity: {
      q: 'For f(x) = x (balanced), what gate implements the oracle U_f?',
      choices: ['Identity (do nothing)', 'X gate on ancilla', 'CNOT (control=input, target=ancilla)', 'CNOT then X on ancilla'],
      answer: 'C', display: 'C) CNOT (control=input, target=ancilla)',
      steps: [
        'U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩ = |x⟩|y ⊕ x⟩.',
        'When x=0: ancilla unchanged. When x=1: ancilla flipped.',
        'This is exactly a CNOT gate with input as control and ancilla as target.',
      ],
    },
    balanced_not: {
      q: 'For f(x) = NOT(x) (balanced), what gate(s) implement the oracle U_f?',
      choices: ['Identity (do nothing)', 'X gate on ancilla', 'CNOT (control=input, target=ancilla)', 'X on ancilla, then CNOT'],
      answer: 'D', display: 'D) X on ancilla, then CNOT',
      steps: [
        'U_f|x⟩|y⟩ = |x⟩|y ⊕ NOT(x)⟩.',
        'NOT(x) = 1 ⊕ x, so y ⊕ NOT(x) = y ⊕ 1 ⊕ x.',
        'First flip ancilla (X), then CNOT: ancilla becomes (y ⊕ 1) ⊕ x = y ⊕ NOT(x). ✓',
      ],
    },
  };

  let pool;
  if (variation === 'constant_0') pool = ['constant_0'];
  else if (variation === 'constant_1') pool = ['constant_1'];
  else if (variation === 'balanced_identity') pool = ['balanced_identity'];
  else if (variation === 'balanced_not') pool = ['balanced_not'];
  else pool = ['constant_0', 'constant_1', 'balanced_identity', 'balanced_not'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'dj_oracle', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function djTrace(d, variation = 'basic') {
  const s = 0.71; // 1/√2
  const h = 0.5;  // 1/2

  if (variation === 'after_hadamards') {
    return {
      type: 'dj_trace',
      question: `In the Deutsch-Jozsa circuit, the input is |01⟩. After applying H⊗H, what is the state?\nBasis: |00⟩,|01⟩,|10⟩,|11⟩. Give as 4-vector, round to 0.01.`,
      answer: [h, -h, h, -h],
      answerDisplay: '(0.5, -0.5, 0.5, -0.5)',
      answerType: 'vector4',
      difficulty: d,
      steps: [
        '|01⟩ = |0⟩⊗|1⟩',
        'H|0⟩ = (1/√2)(|0⟩+|1⟩), H|1⟩ = (1/√2)(|0⟩−|1⟩)',
        'H|0⟩⊗H|1⟩ = (1/2)(|0⟩+|1⟩)(|0⟩−|1⟩)',
        '= (1/2)(|00⟩ − |01⟩ + |10⟩ − |11⟩)',
        '= (0.5, −0.5, 0.5, −0.5)',
      ],
    };
  }

  if (variation === 'after_oracle') {
    const oracles = [
      { name: 'f(x)=0 (identity)', vec: [h, -h, h, -h],
        steps: ['After H⊗H: (0.5, -0.5, 0.5, -0.5)', 'f(x)=0 oracle is identity — state unchanged.', 'Result: (0.5, -0.5, 0.5, -0.5)'] },
      { name: 'f(x)=x (CNOT)', vec: [h, -h, -h, h],
        steps: ['After H⊗H: (0.5, -0.5, 0.5, -0.5)', 'CNOT: |10⟩→|11⟩ and |11⟩→|10⟩.', 'Swaps coefficients of |10⟩ and |11⟩: (0.5, -0.5, -0.5, 0.5)'] },
    ];
    const pick = oracles[rnd(0, oracles.length - 1)];
    return {
      type: 'dj_trace',
      question: `In the DJ circuit starting from |01⟩, after H⊗H and the oracle for ${pick.name}, what is the state?\nBasis: |00⟩,|01⟩,|10⟩,|11⟩.`,
      answer: pick.vec,
      answerDisplay: `(${pick.vec.join(', ')})`,
      answerType: 'vector4',
      difficulty: d,
      steps: pick.steps,
    };
  }

  if (variation === 'constant_trace') {
    return {
      type: 'dj_trace',
      question: `Trace the full Deutsch-Jozsa circuit with a constant oracle (f(x)=0). Start: |01⟩ → H⊗H → U_f (identity) → H⊗I → ?.\nGive the final 4-vector. Round to 0.01.`,
      answer: [s, -s, 0, 0],
      answerDisplay: '(0.71, -0.71, 0, 0)',
      answerType: 'vector4',
      difficulty: d,
      steps: [
        'Start: |01⟩ = (0, 1, 0, 0)',
        'After H⊗H: (0.5, -0.5, 0.5, -0.5)',
        'After U_f (identity): (0.5, -0.5, 0.5, -0.5)',
        'Apply H⊗I: H on first qubit only.',
        '|00⟩ coeff 0.5 and |10⟩ coeff 0.5 combine under H: 0.5·H|0⟩⊗|0⟩ + 0.5·H|1⟩⊗|0⟩',
        '|01⟩ coeff −0.5 and |11⟩ coeff −0.5 combine: −0.5·H|0⟩⊗|1⟩ + (−0.5)·H|1⟩⊗|1⟩',
        'Result: |00⟩ = 0.5·0.71+0.5·0.71 = 0.71; |10⟩ = 0.5·0.71−0.5·0.71 = 0',
        'Final: (0.71, -0.71, 0, 0) = |0⟩⊗|−⟩ → measure first qubit = 0 → constant!',
      ],
    };
  }

  if (variation === 'balanced_trace') {
    return {
      type: 'dj_trace',
      question: `Trace the full Deutsch-Jozsa circuit with a balanced oracle (f(x)=x, CNOT). Start: |01⟩ → H⊗H → CNOT → H⊗I → ?.\nGive the final 4-vector. Round to 0.01.`,
      answer: [0, 0, s, -s],
      answerDisplay: '(0, 0, 0.71, -0.71)',
      answerType: 'vector4',
      difficulty: d,
      steps: [
        'Start: |01⟩ = (0, 1, 0, 0)',
        'After H⊗H: (0.5, -0.5, 0.5, -0.5)',
        'After CNOT: |10⟩↔|11⟩ swap → (0.5, -0.5, -0.5, 0.5)',
        'Apply H⊗I: H on first qubit only.',
        '|00⟩ coeff 0.5 and |10⟩ coeff −0.5 combine: |00⟩ = 0.5·0.71+(−0.5)·0.71 = 0',
        '|10⟩ = 0.5·0.71−(−0.5)·0.71 = 0.71',
        'Final: (0, 0, 0.71, -0.71) = |1⟩⊗|−⟩ → measure first qubit = 1 → balanced!',
      ],
    };
  }

  // basic — random constant or balanced
  const isConst = Math.random() > 0.5;
  if (isConst) {
    return {
      type: 'dj_trace',
      question: `Trace the DJ circuit with constant oracle f(x)=0. Start |01⟩ → H⊗H → identity → H⊗I. Give the final 4-vector (round to 0.01).`,
      answer: [s, -s, 0, 0],
      answerDisplay: '(0.71, -0.71, 0, 0)',
      answerType: 'vector4',
      difficulty: d,
      steps: [
        '|01⟩ → H⊗H → (0.5, -0.5, 0.5, -0.5)',
        'Identity oracle: unchanged.',
        'H⊗I: (0.71, -0.71, 0, 0) — first qubit is |0⟩, so f is constant.',
      ],
    };
  }
  return {
    type: 'dj_trace',
    question: `Trace the DJ circuit with balanced oracle f(x)=x (CNOT). Start |01⟩ → H⊗H → CNOT → H⊗I. Give the final 4-vector (round to 0.01).`,
    answer: [0, 0, s, -s],
    answerDisplay: '(0, 0, 0.71, -0.71)',
    answerType: 'vector4',
    difficulty: d,
    steps: [
      '|01⟩ → H⊗H → (0.5, -0.5, 0.5, -0.5)',
      'CNOT swaps |10⟩↔|11⟩ coefficients: (0.5, -0.5, -0.5, 0.5)',
      'H⊗I: (0, 0, 0.71, -0.71) — first qubit is |1⟩, so f is balanced.',
    ],
  };
}

function phaseKickback(d, variation = 'basic') {
  const items = {
    basic: {
      q: 'When U_f acts on |x⟩|−⟩, the result is (−1)^f(x)|x⟩|−⟩. What is this phenomenon called?',
      choices: ['Quantum tunneling', 'Phase kickback', 'Entanglement swapping', 'Decoherence'],
      answer: 'B', display: 'B) Phase kickback',
      steps: [
        'U_f|x⟩|−⟩ = U_f|x⟩(|0⟩−|1⟩)/√2 = |x⟩(|f(x)⊕0⟩−|f(x)⊕1⟩)/√2.',
        'If f(x)=0: |x⟩(|0⟩−|1⟩)/√2 = |x⟩|−⟩ (phase +1).',
        'If f(x)=1: |x⟩(|1⟩−|0⟩)/√2 = −|x⟩|−⟩ (phase −1).',
        'The phase (−1)^f(x) "kicks back" onto the input register. This is phase kickback.',
      ],
    },
    constant_phase: {
      q: 'If f is constant with f(x)=0 for all x, what is U_f|+⟩|−⟩?',
      choices: ['|+⟩|−⟩', '−|+⟩|−⟩', '|−⟩|−⟩', '|+⟩|+⟩'],
      answer: 'A', display: 'A) |+⟩|−⟩',
      steps: [
        'Phase kickback: U_f|x⟩|−⟩ = (−1)^f(x)|x⟩|−⟩.',
        'f(x)=0 for all x, so (−1)^0 = +1.',
        'U_f|+⟩|−⟩ = (+1)|+⟩|−⟩ = |+⟩|−⟩ — no phase change.',
      ],
    },
    balanced_phase: {
      q: 'If f(x)=x (balanced), what is U_f|+⟩|−⟩? Use phase kickback: U_f|x⟩|−⟩ = (−1)^f(x)|x⟩|−⟩.',
      choices: ['|+⟩|−⟩', '|−⟩|−⟩', '−|+⟩|−⟩', '|1⟩|−⟩'],
      answer: 'B', display: 'B) |−⟩|−⟩',
      steps: [
        '|+⟩ = (|0⟩+|1⟩)/√2. Apply phase kickback to each term:',
        'U_f|0⟩|−⟩ = (−1)^f(0)|0⟩|−⟩ = (−1)^0|0⟩|−⟩ = |0⟩|−⟩',
        'U_f|1⟩|−⟩ = (−1)^f(1)|1⟩|−⟩ = (−1)^1|1⟩|−⟩ = −|1⟩|−⟩',
        'U_f|+⟩|−⟩ = (|0⟩−|1⟩)/√2 ⊗ |−⟩ = |−⟩|−⟩.',
      ],
    },
    interference: {
      q: 'After phase kickback in Deutsch-Jozsa, applying H to the input qubit causes interference. For a balanced function, this interference is:',
      choices: ['Constructive — amplifies |0⟩', 'Destructive — cancels |0⟩, amplifies |1⟩', 'No interference occurs', 'Random — depends on measurement'],
      answer: 'B', display: 'B) Destructive — cancels |0⟩, amplifies |1⟩',
      steps: [
        'For balanced f(x)=x, after kickback the input is |−⟩ = (|0⟩−|1⟩)/√2.',
        'H|−⟩ = |1⟩. The phases interfere destructively for |0⟩ and constructively for |1⟩.',
        'This is why measuring |1⟩ signals a balanced function.',
      ],
    },
  };

  let pool;
  if (variation === 'constant_phase') pool = ['constant_phase'];
  else if (variation === 'balanced_phase') pool = ['balanced_phase'];
  else if (variation === 'interference') pool = ['interference'];
  else pool = ['basic'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'phase_kickback', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function djGeneralize(d, variation = 'basic') {
  if (variation === 'classical_cost') {
    const nVals = [2, 3, 4, 5, 10];
    const n = nVals[rnd(0, nVals.length - 1)];
    const cost = Math.pow(2, n - 1) + 1;
    return {
      type: 'dj_generalize',
      question: `For an n=${n} bit function, what is the worst-case number of classical queries needed to determine if f is constant or balanced?`,
      answer: cost,
      answerDisplay: String(cost),
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `A balanced function has equal 0s and 1s among its 2^n outputs.`,
        `In the worst case, the first 2^(n−1) queries could all return the same value.`,
        `You need one more query to be sure: 2^(${n}−1) + 1 = ${cost}.`,
      ],
    };
  }

  if (variation === 'quantum_cost') {
    const nVals = [2, 3, 4, 5, 10, 100];
    const n = nVals[rnd(0, nVals.length - 1)];
    return {
      type: 'dj_generalize',
      question: `For an n=${n} bit function, how many queries does the Deutsch-Jozsa algorithm need to determine if f is constant or balanced?`,
      answer: 1,
      answerDisplay: '1',
      answerType: 'numeric',
      difficulty: d,
      steps: [
        'The Deutsch-Jozsa algorithm always uses exactly 1 query, regardless of n.',
        'It puts all n input qubits into superposition, queries once, then uses interference.',
        `For n=${n}: classical needs up to ${Math.pow(2, n - 1) + 1} queries, quantum needs 1.`,
      ],
    };
  }

  if (variation === 'speedup_factor') {
    return {
      type: 'dj_generalize',
      question: 'The Deutsch-Jozsa algorithm achieves what type of speedup over classical computation?',
      choices: ['Constant', 'Polynomial', 'Exponential', 'Logarithmic'],
      answer: 'C', answerDisplay: 'C) Exponential',
      answerType: 'choice',
      difficulty: d,
      steps: [
        'Classical: O(2^(n−1) + 1) = O(2^n) queries.',
        'Quantum: O(1) query — always exactly 1.',
        'The speedup is exponential: from 2^n to 1.',
        'Deutsch-Jozsa was the first algorithm to show an exponential quantum advantage.',
      ],
    };
  }

  // basic: default to classical cost with small n
  const n = rnd(2, 4);
  const cost = Math.pow(2, n - 1) + 1;
  return {
    type: 'dj_generalize',
    question: `For an n=${n} bit function, what is the worst-case number of classical queries to determine constant vs balanced?`,
    answer: cost,
    answerDisplay: String(cost),
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `Worst case: 2^(n−1) + 1 = 2^(${n}−1) + 1 = ${cost}.`,
    ],
  };
}

// ── Chapter 17: Grover's Search Algorithm ────────────────────────────────────

function groverProblem(d, variation = 'basic') {
  // Classical vs quantum search cost comparisons
  if (variation === 'classical_cost') {
    const Ns = [8, 16, 32, 64, 256];
    const N = Ns[rnd(0, Ns.length - 1)];
    const ans = N / 2;
    return {
      type: 'grover_problem',
      question: `A database has ${N} items. On average, how many lookups does a classical search need to find one marked item?`,
      answer: ans,
      answerDisplay: `${ans}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `Classical search checks items one by one in random order.`,
        `On average, you check half the items: ${N}/2 = ${ans}.`,
      ],
    };
  }

  if (variation === 'quantum_cost') {
    const Ns = [16, 64, 256];
    const N = Ns[rnd(0, Ns.length - 1)];
    const sqrtN = Math.round(Math.sqrt(N));
    const iters = Math.round(Math.PI / 4 * sqrtN);
    return {
      type: 'grover_problem',
      question: `A database has ${N} items. Approximately how many Grover iterations are needed to find one marked item? (Round to nearest integer.)`,
      answer: iters,
      answerDisplay: `${iters}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `Grover's algorithm needs approximately (π/4)√N iterations.`,
        `√${N} = ${sqrtN}`,
        `(π/4) × ${sqrtN} ≈ ${(Math.PI / 4 * sqrtN).toFixed(2)} → ${iters} iterations`,
      ],
    };
  }

  if (variation === 'speedup') {
    const exps = [4, 6, 8];
    const exp = exps[rnd(0, exps.length - 1)];
    const N = Math.pow(10, exp);
    const classical = N / 2;
    const quantum = Math.round(Math.PI / 4 * Math.sqrt(N));
    const speedup = Math.round(classical / quantum);
    return {
      type: 'grover_problem',
      question: `A database has 10^${exp} = ${N.toLocaleString()} items. Classical search averages ${(classical).toLocaleString()} lookups. Grover needs ~${quantum.toLocaleString()} iterations. What is the approximate speedup factor? (Round to nearest integer.)`,
      answer: speedup,
      answerDisplay: `${speedup}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `Classical: N/2 = ${classical.toLocaleString()} lookups`,
        `Grover: (π/4)√N ≈ ${quantum.toLocaleString()} iterations`,
        `Speedup: ${classical.toLocaleString()} / ${quantum.toLocaleString()} ≈ ${speedup}`,
      ],
    };
  }

  // Default: classical_cost
  const N = 16;
  return {
    type: 'grover_problem',
    question: `A database has ${N} items. On average, how many lookups does a classical search need?`,
    answer: 8,
    answerDisplay: '8',
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `Classical search checks items one at a time.`,
      `On average: ${N}/2 = 8 lookups.`,
    ],
  };
}

function groverOracle(d, variation = 'basic') {
  // Oracle phase-flips a marked item in equal superposition (4 elements)
  const labels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];

  if (variation === 'basic_2qubit' || variation === 'basic') {
    // Mark |11⟩ (index 3)
    const markedIdx = 3;
    const ans = [0.5, 0.5, 0.5, -0.5];
    return {
      type: 'grover_oracle',
      question: `Equal superposition: (0.5, 0.5, 0.5, 0.5) for ${labels.join(', ')}.\nThe oracle marks ${labels[markedIdx]}. What is the state after the oracle? (4-vector)`,
      answer: ans,
      answerDisplay: `(${ans.join(', ')})`,
      answerType: 'vector4',
      difficulty: d,
      steps: [
        `The oracle flips the phase (sign) of the marked item's amplitude.`,
        `Marked item: ${labels[markedIdx]} at index ${markedIdx}.`,
        `Amplitude at index ${markedIdx}: 0.5 → −0.5`,
        `Result: (0.5, 0.5, 0.5, −0.5)`,
      ],
    };
  }

  if (variation === 'mark_specific') {
    // Mark |01⟩ (index 1)
    const markedIdx = rnd(0, 2); // indices 0, 1, or 2 for variety
    const ans = [0.5, 0.5, 0.5, 0.5];
    ans[markedIdx] = -0.5;
    return {
      type: 'grover_oracle',
      question: `Equal superposition: (0.5, 0.5, 0.5, 0.5) for ${labels.join(', ')}.\nThe oracle marks ${labels[markedIdx]}. What is the state after the oracle? (4-vector)`,
      answer: ans,
      answerDisplay: `(${ans.join(', ')})`,
      answerType: 'vector4',
      difficulty: d,
      steps: [
        `The oracle flips the sign of the marked item's amplitude.`,
        `Marked item: ${labels[markedIdx]} at index ${markedIdx}.`,
        `Amplitude at index ${markedIdx}: 0.5 → −0.5`,
        `Result: (${ans.join(', ')})`,
      ],
    };
  }

  if (variation === 'phase_flip_only') {
    // Verify that only the phase changes, not the magnitude
    const markedIdx = rnd(0, 3);
    const ans = [0.5, 0.5, 0.5, 0.5];
    ans[markedIdx] = -0.5;
    return {
      type: 'grover_oracle',
      question: `Equal superposition: (0.5, 0.5, 0.5, 0.5).\nThe oracle marks ${labels[markedIdx]}. Give the state after the oracle. (4-vector)`,
      answer: ans,
      answerDisplay: `(${ans.join(', ')})`,
      answerType: 'vector4',
      difficulty: d,
      steps: [
        `The oracle only changes the sign (phase) of the marked amplitude.`,
        `|amplitude| stays the same: 0.5. Only the sign flips to −0.5.`,
        `Result: (${ans.join(', ')})`,
      ],
    };
  }

  // Default
  const ans = [0.5, 0.5, 0.5, -0.5];
  return {
    type: 'grover_oracle',
    question: `Equal superposition: (0.5, 0.5, 0.5, 0.5). Oracle marks |11⟩. State after oracle? (4-vector)`,
    answer: ans,
    answerDisplay: `(${ans.join(', ')})`,
    answerType: 'vector4',
    difficulty: d,
    steps: [
      `Oracle flips the sign of the marked item.`,
      `|11⟩ amplitude: 0.5 → −0.5`,
      `Result: (0.5, 0.5, 0.5, −0.5)`,
    ],
  };
}

function groverDiffusion(d, variation = 'basic') {
  // Inversion about the mean

  if (variation === 'compute_mean') {
    // Given amplitudes after oracle, compute the mean
    const markedIdx = rnd(0, 3);
    const amps = [0.5, 0.5, 0.5, 0.5];
    amps[markedIdx] = -0.5;
    const mean = r2((amps[0] + amps[1] + amps[2] + amps[3]) / 4);
    return {
      type: 'grover_diffusion',
      question: `After the oracle, the amplitudes are (${amps.join(', ')}). What is the mean of these amplitudes?`,
      answer: mean,
      answerDisplay: `${mean}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `Mean = (${amps.join(' + ')})/4`,
        `= ${r2(amps[0] + amps[1] + amps[2] + amps[3])}/4`,
        `= ${mean}`,
      ],
    };
  }

  if (variation === 'reflect_about_mean') {
    // Apply 2*mean - amplitude to one element
    const markedIdx = rnd(0, 3);
    const amps = [0.5, 0.5, 0.5, 0.5];
    amps[markedIdx] = -0.5;
    const mean = r2((amps[0] + amps[1] + amps[2] + amps[3]) / 4);
    // Ask about the marked element (most interesting)
    const oldAmp = amps[markedIdx];
    const newAmp = r2(2 * mean - oldAmp);
    return {
      type: 'grover_diffusion',
      question: `The mean amplitude is ${mean}. The marked item's amplitude is ${oldAmp}. After reflection about the mean (2 × mean − amplitude), what is the marked item's new amplitude?`,
      answer: newAmp,
      answerDisplay: `${newAmp}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `Reflection formula: new = 2 × mean − old`,
        `= 2 × ${mean} − (${oldAmp})`,
        `= ${r2(2 * mean)} − (${oldAmp})`,
        `= ${newAmp}`,
      ],
    };
  }

  if (variation === 'after_one_iteration') {
    // Full oracle + diffusion on 2-qubit system
    const labels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
    const markedIdx = rnd(0, 3);
    // After oracle
    const afterOracle = [0.5, 0.5, 0.5, 0.5];
    afterOracle[markedIdx] = -0.5;
    // Diffusion
    const mean = (afterOracle[0] + afterOracle[1] + afterOracle[2] + afterOracle[3]) / 4;
    const result = afterOracle.map(a => r2(2 * mean - a));
    return {
      type: 'grover_diffusion',
      question: `2-qubit Grover: start with equal superposition (0.5, 0.5, 0.5, 0.5), oracle marks ${labels[markedIdx]}. After one full iteration (oracle + diffusion), what is the state? (4-vector)`,
      answer: result,
      answerDisplay: `(${result.join(', ')})`,
      answerType: 'vector4',
      difficulty: d,
      steps: [
        `After oracle: (${afterOracle.join(', ')})`,
        `Mean = (${afterOracle.join(' + ')})/4 = ${r2(mean)}`,
        `Diffusion: new[i] = 2 × ${r2(mean)} − old[i]`,
        `Unmarked: 2 × ${r2(mean)} − 0.5 = ${r2(2 * mean - 0.5)}`,
        `Marked: 2 × ${r2(mean)} − (−0.5) = ${r2(2 * mean + 0.5)}`,
        `Result: (${result.join(', ')})`,
      ],
    };
  }

  if (variation === 'amplitude_growth') {
    // Track amplitude of marked item across iterations (conceptual)
    // For N=4, after 1 iteration marked amplitude = 1.0
    return {
      type: 'grover_diffusion',
      question: `In a 2-qubit system (N=4), the marked item starts with amplitude 0.5. After one full Grover iteration, what is the marked item's amplitude?`,
      answer: 1,
      answerDisplay: '1',
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `Start: all amplitudes = 0.5`,
        `After oracle: marked becomes −0.5, others stay 0.5`,
        `Mean = (0.5 + 0.5 + 0.5 + (−0.5))/4 = 0.25`,
        `Diffusion on marked: 2 × 0.25 − (−0.5) = 0.5 + 0.5 = 1`,
        `The marked item's amplitude is 1 after one iteration.`,
      ],
    };
  }

  // Default: compute_mean
  const amps = [0.5, 0.5, 0.5, -0.5];
  const mean = r2((amps[0] + amps[1] + amps[2] + amps[3]) / 4);
  return {
    type: 'grover_diffusion',
    question: `Amplitudes after oracle: (${amps.join(', ')}). What is the mean?`,
    answer: mean,
    answerDisplay: `${mean}`,
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `Mean = (0.5 + 0.5 + 0.5 + (−0.5))/4 = 1.0/4 = ${mean}`,
    ],
  };
}

function groverFull(d, variation = 'basic') {
  // Full algorithm on small systems

  if (variation === 'two_qubit' || variation === 'basic') {
    // N=4, 1 iteration, probability of finding marked item = 100%
    return {
      type: 'grover_full',
      question: `Grover's algorithm on N = 4 items (2 qubits). After 1 iteration, what is the probability of measuring the marked item? (Give as a percentage, e.g. 100)`,
      answer: 100,
      answerDisplay: '100',
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `N = 4, equal superposition: each amplitude = 1/√4 = 0.5`,
        `After oracle (mark one item): (0.5, 0.5, 0.5, −0.5) [example marking |11⟩]`,
        `Mean = (0.5 + 0.5 + 0.5 − 0.5)/4 = 0.25`,
        `Diffusion: unmarked → 2(0.25) − 0.5 = 0, marked → 2(0.25) + 0.5 = 1`,
        `Probability = |1|² = 1 = 100%`,
        `N = 4 is special: Grover finds the answer with certainty in 1 iteration.`,
      ],
    };
  }

  if (variation === 'optimal_iterations') {
    const cases = [
      { N: 16, sqrtN: 4, iters: 3 },
      { N: 64, sqrtN: 8, iters: 6 },
      { N: 256, sqrtN: 16, iters: 12 },
    ];
    const c = cases[rnd(0, cases.length - 1)];
    return {
      type: 'grover_full',
      question: `For N = ${c.N} items, how many Grover iterations are optimal? Use ⌊(π/4)√N⌋. (Round down to nearest integer.)`,
      answer: c.iters,
      answerDisplay: `${c.iters}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `Optimal iterations ≈ (π/4)√N`,
        `√${c.N} = ${c.sqrtN}`,
        `(π/4) × ${c.sqrtN} = ${(Math.PI / 4 * c.sqrtN).toFixed(2)}`,
        `⌊${(Math.PI / 4 * c.sqrtN).toFixed(2)}⌋ = ${c.iters}`,
      ],
    };
  }

  if (variation === 'probability_after_k') {
    // After k iterations, probability ≈ sin²((2k+1)θ) where sin(θ) = 1/√N
    // For N=4: θ = π/6 (since sin(π/6) = 0.5 = 1/√4), after k=1: sin²(3π/6) = sin²(π/2) = 1
    // Keep it simple: N=4, k=1 → 100%
    return {
      type: 'grover_full',
      question: `For N = 4 with 1 marked item, the initial angle is θ where sin(θ) = 1/√4 = 0.5, so θ = π/6. After k = 1 iteration, the probability is sin²((2k+1)θ). What is sin²(3π/6) = sin²(π/2)? (Give as a percentage.)`,
      answer: 100,
      answerDisplay: '100',
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `θ = arcsin(1/√N) = arcsin(1/2) = π/6`,
        `After k iterations: probability = sin²((2k+1)θ)`,
        `k = 1: sin²((2×1+1) × π/6) = sin²(3π/6) = sin²(π/2)`,
        `sin(π/2) = 1, so sin²(π/2) = 1 = 100%`,
      ],
    };
  }

  if (variation === 'too_many_iterations') {
    // Too many iterations causes probability to decrease
    // N=4: after 2 iterations, amplitude oscillates back toward 0
    // k=2: sin²(5π/6) = sin²(150°) = (0.5)² = 0.25 = 25%
    return {
      type: 'grover_full',
      question: `For N = 4 (θ = π/6), after k = 2 iterations the probability is sin²((2×2+1)π/6) = sin²(5π/6). What is this probability as a percentage?`,
      answer: 25,
      answerDisplay: '25',
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `After k = 2: probability = sin²(5π/6)`,
        `5π/6 = 150°`,
        `sin(150°) = sin(30°) = 0.5`,
        `sin²(150°) = 0.25 = 25%`,
        `Too many iterations! The probability decreased from 100% back to 25%.`,
        `This is why the number of iterations must be chosen carefully.`,
      ],
    };
  }

  // Default: two_qubit
  return {
    type: 'grover_full',
    question: `Grover on N = 4: after 1 iteration, probability of the marked item? (percentage)`,
    answer: 100,
    answerDisplay: '100',
    answerType: 'numeric',
    difficulty: d,
    steps: [
      `For N = 4, one iteration gives probability 100%.`,
    ],
  };
}

function groverOptimality(d, variation = 'basic') {
  const items = {
    not_exponential: {
      q: 'Is Grover\'s speedup over classical search exponential?',
      choices: [
        'Yes — it is exponentially faster',
        'No — it is a quadratic speedup (square root)',
        'No — it is only a constant factor improvement',
        'Yes — it solves search in O(1)',
      ],
      answer: 'B', display: 'B) No — it is a quadratic speedup (square root)',
      steps: [
        'Classical search: O(N) lookups.',
        'Grover\'s algorithm: O(√N) iterations.',
        'This is a quadratic speedup, not exponential.',
        'For N = 10^6: classical ~ 500,000, Grover ~ 785.',
      ],
    },
    compare_dj: {
      q: 'How does Grover\'s speedup compare to Deutsch-Jozsa\'s?',
      choices: [
        'Both give quadratic speedup',
        'Deutsch-Jozsa gives exponential speedup; Grover gives quadratic',
        'Grover gives exponential speedup; Deutsch-Jozsa gives quadratic',
        'Both give exponential speedup',
      ],
      answer: 'B', display: 'B) Deutsch-Jozsa gives exponential speedup; Grover gives quadratic',
      steps: [
        'Deutsch-Jozsa: 1 query vs 2^(n-1)+1 classically → exponential speedup.',
        'Grover: O(√N) vs O(N) → quadratic speedup.',
        'Grover\'s speedup is more modest but applies to a much broader class of problems.',
      ],
    },
    practical_impact: {
      q: 'A classical search of 10^12 items takes ~5 × 10^11 lookups on average. Grover would need ~785,398 iterations. By what factor is Grover faster?',
      choices: [
        'About 10× faster',
        'About 1,000× faster',
        'About 636,000× faster',
        'About 10^12× faster',
      ],
      answer: 'C', display: 'C) About 636,000× faster',
      steps: [
        'Classical: N/2 = 5 × 10^11 lookups.',
        'Grover: (π/4)√(10^12) ≈ (π/4) × 10^6 ≈ 785,398 iterations.',
        'Speedup: 5 × 10^11 / 785,398 ≈ 636,620 ≈ 636,000×.',
        'Significant, but not exponential — it scales as √N.',
      ],
    },
  };

  let pool;
  if (variation === 'not_exponential') pool = ['not_exponential'];
  else if (variation === 'compare_dj') pool = ['compare_dj'];
  else if (variation === 'practical_impact') pool = ['practical_impact'];
  else pool = ['not_exponential', 'compare_dj', 'practical_impact'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'grover_optimality', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

// ── Chapter 18: Quantum Error Correction ─────────────────────────────────────

function errorConcept(d, variation = 'basic') {
  const items = {
    bit_flip: {
      q: 'What does a bit-flip (X) error do to the state α|0⟩ + β|1⟩?',
      choices: [
        'It gives α|0⟩ − β|1⟩',
        'It gives β|0⟩ + α|1⟩ (swaps amplitudes)',
        'It gives α|1⟩ + β|0⟩ (swaps basis states)',
        'It destroys the state completely',
      ],
      answer: 'C', display: 'C) It gives α|1⟩ + β|0⟩ (swaps basis states)',
      steps: [
        'The X (Pauli-X) gate is the quantum bit-flip: X|0⟩ = |1⟩, X|1⟩ = |0⟩.',
        'Applied to α|0⟩ + β|1⟩: X(α|0⟩ + β|1⟩) = α|1⟩ + β|0⟩.',
        'The amplitudes stay with their original basis states, but the basis states swap.',
      ],
    },
    phase_flip: {
      q: 'What does a phase-flip (Z) error do to the state α|0⟩ + β|1⟩?',
      choices: [
        'It gives α|1⟩ + β|0⟩',
        'It gives α|0⟩ − β|1⟩ (flips the sign of |1⟩)',
        'It gives −α|0⟩ + β|1⟩',
        'It gives −α|0⟩ − β|1⟩',
      ],
      answer: 'B', display: 'B) It gives α|0⟩ − β|1⟩ (flips the sign of |1⟩)',
      steps: [
        'The Z (Pauli-Z) gate is the phase-flip: Z|0⟩ = |0⟩, Z|1⟩ = −|1⟩.',
        'Applied to α|0⟩ + β|1⟩: Z(α|0⟩ + β|1⟩) = α|0⟩ − β|1⟩.',
        'This changes the relative phase but not the probabilities of measuring 0 or 1.',
      ],
    },
    why_no_copy: {
      q: 'Why can\'t we protect quantum information by simply copying it, as in classical repetition codes?',
      choices: [
        'Copying quantum states requires too much energy',
        'The no-cloning theorem forbids copying unknown quantum states',
        'Quantum states are always entangled and cannot be separated for copying',
        'Quantum computers don\'t have enough memory',
      ],
      answer: 'B', display: 'B) The no-cloning theorem forbids copying unknown quantum states',
      steps: [
        'Classical error correction copies bits: 0 → 000, 1 → 111.',
        'The no-cloning theorem proves no operation can duplicate an arbitrary quantum state.',
        'Quantum error correction must protect without copying — it uses entanglement instead.',
      ],
    },
    classical_vs_quantum: {
      q: 'How many independent types of single-qubit errors must quantum error correction handle?',
      choices: [
        '1 — just the bit-flip',
        '2 — bit-flip and phase-flip',
        '3 — bit-flip, phase-flip, and both combined (Y error)',
        '4 — X, Y, Z, and the identity',
      ],
      answer: 'C', display: 'C) 3 — bit-flip, phase-flip, and both combined (Y error)',
      steps: [
        'Classical bits have one error type: bit-flip (0↔1).',
        'Qubits have three: bit-flip (X), phase-flip (Z), and both combined (Y = iXZ).',
        'Any single-qubit error can be written as a combination of I, X, Y, Z.',
        'If a code corrects X and Z errors, it automatically corrects Y errors too.',
      ],
    },
  };

  const poolMap = {
    bit_flip: ['bit_flip'],
    phase_flip: ['phase_flip'],
    why_no_copy: ['why_no_copy'],
    classical_vs_quantum: ['classical_vs_quantum'],
  };
  const pool = poolMap[variation] || ['bit_flip', 'phase_flip', 'why_no_copy', 'classical_vs_quantum'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'error_concept', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function bitFlipCode(d, variation = 'basic') {
  const items = {
    encode: {
      q: 'In the 3-qubit bit-flip code, how is the logical |0⟩ encoded?',
      choices: [
        '|0⟩ → |000⟩ and |1⟩ → |111⟩',
        '|0⟩ → |+++⟩ and |1⟩ → |−−−⟩',
        '|0⟩ → (|000⟩ + |111⟩)/√2',
        '|0⟩ → |001⟩ and |1⟩ → |110⟩',
      ],
      answer: 'A', display: 'A) |0⟩ → |000⟩ and |1⟩ → |111⟩',
      steps: [
        'The 3-qubit bit-flip code uses 3 physical qubits per logical qubit.',
        'Logical |0⟩_L = |000⟩, logical |1⟩_L = |111⟩.',
        'A general state α|0⟩ + β|1⟩ is encoded as α|000⟩ + β|111⟩.',
        'This protects against a single X error on any one of the three qubits.',
      ],
    },
    detect_error: {
      q: 'Starting from |000⟩, a bit-flip error occurs on qubit 2 (middle). What is the resulting state?',
      choices: [
        '|100⟩',
        '|010⟩',
        '|001⟩',
        '|110⟩',
      ],
      answer: 'B', display: 'B) |010⟩',
      steps: [
        'The state |000⟩ has all three qubits in |0⟩.',
        'A bit-flip on qubit 2 flips the middle qubit: 0 → 1.',
        '|000⟩ → |010⟩.',
        'The syndrome measurement compares neighboring qubits to find which one disagrees.',
      ],
    },
    correct_error: {
      q: 'The syndrome measurement shows qubit 3 disagrees with qubits 1 and 2. Which gate corrects the error?',
      choices: [
        'Apply X to qubit 1',
        'Apply X to qubit 2',
        'Apply X to qubit 3',
        'Apply Z to qubit 3',
      ],
      answer: 'C', display: 'C) Apply X to qubit 3',
      steps: [
        'The syndrome tells us which qubit was flipped.',
        'Qubits 1 and 2 agree, but qubit 3 disagrees → qubit 3 has the error.',
        'Apply X (bit-flip) to qubit 3 to flip it back.',
        'This restores the original codeword without measuring the encoded information.',
      ],
    },
    no_error: {
      q: 'In the 3-qubit bit-flip code, what syndrome do you get when no error occurred?',
      choices: [
        'Both syndrome bits are 1',
        'First syndrome bit is 1, second is 0',
        'First syndrome bit is 0, second is 1',
        'Both syndrome bits are 0 (all qubits agree)',
      ],
      answer: 'D', display: 'D) Both syndrome bits are 0 (all qubits agree)',
      steps: [
        'Syndrome measurement compares pairs of qubits without revealing their values.',
        'First syndrome bit: qubit 1 ⊕ qubit 2. Second: qubit 2 ⊕ qubit 3.',
        'If no error: all qubits match, so both comparisons give 0.',
        'Syndrome (0,0) means "no error detected."',
      ],
    },
  };

  const poolMap = {
    encode: ['encode'],
    detect_error: ['detect_error'],
    correct_error: ['correct_error'],
    no_error: ['no_error'],
  };
  const pool = poolMap[variation] || ['encode', 'detect_error', 'correct_error', 'no_error'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'bit_flip_code', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function phaseFlipCode(d, variation = 'basic') {
  const items = {
    encode: {
      q: 'In the 3-qubit phase-flip code, how is the logical |0⟩ encoded?',
      choices: [
        '|0⟩ → |000⟩',
        '|0⟩ → |+++⟩',
        '|0⟩ → (|000⟩ + |111⟩)/√2',
        '|0⟩ → |+0+⟩',
      ],
      answer: 'B', display: 'B) |0⟩ → |+++⟩',
      steps: [
        'The phase-flip code works in the Hadamard basis.',
        'Logical |0⟩_L = |+++⟩, logical |1⟩_L = |−−−⟩.',
        'Recall |+⟩ = (|0⟩ + |1⟩)/√2 and |−⟩ = (|0⟩ − |1⟩)/√2.',
        'A Z error in this basis acts like an X error: Z|+⟩ = |−⟩.',
      ],
    },
    detect_phase_error: {
      q: 'Why does a Z error on |+⟩ look like a bit-flip?',
      choices: [
        'Because Z|+⟩ = |−⟩, which is a flip in the {|+⟩, |−⟩} basis',
        'Because Z = X in all bases',
        'Because phase errors don\'t actually change anything',
        'Because Z|0⟩ = |1⟩',
      ],
      answer: 'A', display: 'A) Because Z|+⟩ = |−⟩, which is a flip in the {|+⟩, |−⟩} basis',
      steps: [
        'In the computational basis: Z|0⟩ = |0⟩, Z|1⟩ = −|1⟩.',
        'But |+⟩ = (|0⟩ + |1⟩)/√2, so Z|+⟩ = (|0⟩ − |1⟩)/√2 = |−⟩.',
        'In the {|+⟩, |−⟩} basis, Z swaps |+⟩ ↔ |−⟩ — exactly like a bit-flip!',
        'This is why the phase-flip code is just the bit-flip code conjugated by H.',
      ],
    },
    relationship_to_bit_flip: {
      q: 'What is the relationship between the 3-qubit phase-flip code and the 3-qubit bit-flip code?',
      choices: [
        'They are completely unrelated codes',
        'The phase-flip code is the bit-flip code conjugated by Hadamard (H⊗H⊗H)',
        'The phase-flip code uses twice as many qubits',
        'The phase-flip code also corrects bit-flip errors',
      ],
      answer: 'B', display: 'B) The phase-flip code is the bit-flip code conjugated by Hadamard (H⊗H⊗H)',
      steps: [
        'Bit-flip code: |0⟩→|000⟩, |1⟩→|111⟩ — corrects X errors.',
        'Apply H to each qubit: |000⟩→|+++⟩, |111⟩→|−−−⟩ — the phase-flip encoding!',
        'The Hadamard transform exchanges X↔Z errors.',
        'So the bit-flip code in the H basis automatically corrects Z errors.',
      ],
    },
  };

  const poolMap = {
    encode: ['encode'],
    detect_phase_error: ['detect_phase_error'],
    relationship_to_bit_flip: ['relationship_to_bit_flip'],
  };
  const pool = poolMap[variation] || ['encode', 'detect_phase_error', 'relationship_to_bit_flip'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'phase_flip_code', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function shorCode(d, variation = 'basic') {
  const items = {
    structure: {
      q: 'How many physical qubits does the Shor code use per logical qubit?',
      choices: [
        '3 physical qubits',
        '5 physical qubits',
        '7 physical qubits',
        '9 physical qubits',
      ],
      answer: 'D', display: 'D) 9 physical qubits',
      steps: [
        'The Shor code combines the 3-qubit bit-flip and 3-qubit phase-flip codes.',
        'Each logical qubit is first encoded into 3 blocks (phase-flip protection).',
        'Each block is then encoded into 3 physical qubits (bit-flip protection).',
        'Total: 3 × 3 = 9 physical qubits per logical qubit.',
      ],
    },
    bit_flip_layer: {
      q: 'Which layer of the Shor code protects against bit-flip (X) errors?',
      choices: [
        'The outer layer (3 blocks of 3)',
        'The inner layer (repetition within each block)',
        'Both layers equally',
        'Neither — bit-flip protection comes from a separate code',
      ],
      answer: 'B', display: 'B) The inner layer (repetition within each block)',
      steps: [
        'Each block of 3 qubits uses the bit-flip repetition code.',
        'Within a block: |0⟩→|000⟩, |1⟩→|111⟩.',
        'A single X error within any block can be detected and corrected by majority vote.',
        'The outer layer handles phase-flip errors.',
      ],
    },
    phase_flip_layer: {
      q: 'Which layer of the Shor code protects against phase-flip (Z) errors?',
      choices: [
        'The inner layer (repetition within each block)',
        'The outer layer (encoding across 3 blocks in the |+⟩/|−⟩ basis)',
        'A separate Z-correction circuit after decoding',
        'Phase-flip errors cannot be corrected',
      ],
      answer: 'B', display: 'B) The outer layer (encoding across 3 blocks in the |+⟩/|−⟩ basis)',
      steps: [
        'The outer code encodes across 3 blocks using the phase-flip code structure.',
        'Logical |0⟩ uses |+++⟩ across blocks, logical |1⟩ uses |−−−⟩.',
        'A Z error on any single qubit causes one block to flip sign.',
        'Comparing blocks detects and corrects which block was affected.',
      ],
    },
    combined_protection: {
      q: 'Why does correcting both X and Z errors mean the Shor code can correct ANY single-qubit error?',
      choices: [
        'Because X and Z are the only possible errors',
        'Because any single-qubit error is a linear combination of I, X, Z, and Y = iXZ',
        'Because the Shor code also includes a Y-correction layer',
        'It actually cannot correct Y errors',
      ],
      answer: 'B', display: 'B) Because any single-qubit error is a linear combination of I, X, Z, and Y = iXZ',
      steps: [
        'Any 2×2 matrix (any single-qubit error) can be decomposed as aI + bX + cY + dZ.',
        'Since Y = iXZ, correcting X and Z automatically handles Y.',
        'Quantum error correction works linearly: if it corrects X and Z individually,',
        'it corrects any superposition of these errors — including arbitrary single-qubit errors.',
      ],
    },
  };

  const poolMap = {
    structure: ['structure'],
    bit_flip_layer: ['bit_flip_layer'],
    phase_flip_layer: ['phase_flip_layer'],
    combined_protection: ['combined_protection'],
  };
  const pool = poolMap[variation] || ['structure', 'bit_flip_layer', 'phase_flip_layer', 'combined_protection'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'shor_code', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function thresholdConcept(d, variation = 'basic') {
  const items = {
    overhead: {
      q: 'In surface codes (a leading error correction approach), roughly how many physical qubits are estimated per logical qubit for useful computation?',
      choices: [
        'About 3 physical per logical',
        'About 10 physical per logical',
        'About 1,000 or more physical per logical',
        'About 1 million physical per logical',
      ],
      answer: 'C', display: 'C) About 1,000 or more physical per logical',
      steps: [
        'Current estimates for useful fault-tolerant computation require ~1,000 to ~10,000 physical qubits per logical qubit.',
        'This depends on the physical error rate and the code distance needed.',
        'A million-qubit quantum computer might only have ~1,000 logical qubits.',
        'Reducing this overhead is a major goal of quantum error correction research.',
      ],
    },
    threshold: {
      q: 'What happens if the physical error rate is ABOVE the threshold of an error-correcting code?',
      choices: [
        'Error correction still works but more slowly',
        'Adding more qubits makes things worse, not better',
        'The code automatically switches to a different strategy',
        'The logical error rate stays the same as the physical rate',
      ],
      answer: 'B', display: 'B) Adding more qubits makes things worse, not better',
      steps: [
        'The threshold theorem: if physical error rate p < p_threshold, adding redundancy reduces errors.',
        'But if p > p_threshold, each additional qubit introduces more errors than it corrects.',
        'More redundancy = worse performance above threshold.',
        'For surface codes, the threshold is approximately 1% per gate.',
      ],
    },
    current_state: {
      q: 'What is the approximate error threshold for surface codes, and have physical qubits achieved it?',
      choices: [
        'Threshold ~10%; yes, easily achieved',
        'Threshold ~1%; some systems are near or below it',
        'Threshold ~0.001%; no system has achieved it',
        'Threshold ~50%; all systems are below it',
      ],
      answer: 'B', display: 'B) Threshold ~1%; some systems are near or below it',
      steps: [
        'Surface codes have a threshold around 1% error per gate.',
        'Several platforms (superconducting, trapped ions) have demonstrated gate errors near or below 1%.',
        'However, sustaining below-threshold performance across an entire computation remains challenging.',
        'This is why fault-tolerant quantum computing is still an active area of development.',
      ],
    },
  };

  const poolMap = {
    overhead: ['overhead'],
    threshold: ['threshold'],
    current_state: ['current_state'],
  };
  const pool = poolMap[variation] || ['overhead', 'threshold', 'current_state'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'threshold_concept', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

// ── Chapter 19: Shor's Algorithm ─────────────────────────────────────────────

/** Helper: compute a^x mod N */
function modPow(base, exp, mod) {
  let result = 1;
  base = base % mod;
  for (let i = 0; i < exp; i++) result = (result * base) % mod;
  return result;
}

/** Helper: greatest common divisor */
function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

/** Helper: find period of a^x mod N */
function findPeriod(a, N) {
  for (let r = 1; r <= N; r++) {
    if (modPow(a, r, N) === 1) return r;
  }
  return N;
}

function factoringProblem(d, variation = 'basic') {
  if (variation === 'small_factor') {
    const composites = [
      { N: 15, factors: [3, 5] },
      { N: 21, factors: [3, 7] },
      { N: 35, factors: [5, 7] },
      { N: 33, factors: [3, 11] },
      { N: 55, factors: [5, 11] },
    ];
    const c = composites[rnd(0, composites.length - 1)];
    const ans = c.factors[0]; // accept the smaller factor
    return {
      type: 'factoring_problem',
      question: `Find a non-trivial factor of N = ${c.N}.`,
      answer: ans,
      answerDisplay: `${c.factors[0]} (since ${c.N} = ${c.factors[0]} × ${c.factors[1]})`,
      answerType: 'numeric',
      difficulty: d,
      acceptAlternate: c.factors[1], // either factor is correct
      steps: [
        `We need a factor of ${c.N} other than 1 and ${c.N}.`,
        `Try small primes: ${c.factors[0]} × ${c.factors[1]} = ${c.N}.`,
        `So ${c.factors[0]} is a factor (and so is ${c.factors[1]}).`,
      ],
    };
  }

  if (variation === 'why_hard') {
    return {
      type: 'factoring_problem',
      question: 'Why is factoring large numbers believed to be hard for classical computers?',
      choices: [
        'No one has ever factored a number',
        'The number of possible factors grows exponentially with the number of digits',
        'Multiplication is also hard',
        'Computers cannot do division',
      ],
      answer: 'B',
      answerDisplay: 'B) The number of possible factors grows exponentially with the number of digits',
      answerType: 'choice',
      difficulty: d,
      steps: [
        'An n-digit number has roughly 10^(n/2) possible prime factors to check.',
        'No known classical algorithm factors in polynomial time.',
        'The best classical algorithm (General Number Field Sieve) runs in sub-exponential but super-polynomial time.',
      ],
    };
  }

  if (variation === 'rsa_connection') {
    return {
      type: 'factoring_problem',
      question: 'Why does Shor\'s algorithm threaten RSA encryption?',
      choices: [
        'RSA keys are too short',
        'RSA security relies on the difficulty of factoring large semiprimes',
        'RSA uses quantum mechanics internally',
        'Shor\'s algorithm can guess passwords',
      ],
      answer: 'B',
      answerDisplay: 'B) RSA security relies on the difficulty of factoring large semiprimes',
      answerType: 'choice',
      difficulty: d,
      steps: [
        'RSA: choose two large primes p, q; publish N = p × q.',
        'Breaking RSA requires finding p and q from N.',
        'Shor\'s algorithm factors N in polynomial time on a quantum computer.',
        'This would make RSA insecure.',
      ],
    };
  }

  if (variation === 'classical_time') {
    return {
      type: 'factoring_problem',
      question: 'A 2048-bit RSA key would take classical computers millions of years to factor. Shor\'s algorithm (with a large enough quantum computer) could do it in:',
      choices: [
        'Millions of years (same as classical)',
        'Thousands of years',
        'Hours to days',
        'It cannot factor RSA keys',
      ],
      answer: 'C',
      answerDisplay: 'C) Hours to days',
      answerType: 'choice',
      difficulty: d,
      steps: [
        'Shor\'s algorithm runs in O((log N)³) time — polynomial in the number of digits.',
        'For a 2048-bit number, this is roughly (2048)³ ≈ 8.6 billion operations.',
        'On a sufficiently large quantum computer, this would take hours, not years.',
        'The bottleneck is building a quantum computer with enough error-corrected qubits.',
      ],
    };
  }

  // Default: small_factor
  return factoringProblem(d, 'small_factor');
}

function periodFinding(d, variation = 'basic') {
  // Curated examples with verified periods
  const examples = [
    { a: 7,  N: 15, powers: [7, 4, 13, 1], period: 4 },
    { a: 11, N: 15, powers: [11, 1],        period: 2 },
    { a: 2,  N: 15, powers: [2, 4, 8, 1],   period: 4 },
    { a: 4,  N: 15, powers: [4, 1],          period: 2 },
    { a: 13, N: 15, powers: [13, 4, 7, 1],   period: 4 },
    { a: 2,  N: 21, powers: [2, 4, 8, 16, 11, 1], period: 6 },
    { a: 4,  N: 21, powers: [4, 16, 1],      period: 3 },
  ];

  if (variation === 'compute_powers') {
    const ex = examples[rnd(0, examples.length - 1)];
    // Ask for a specific power in the sequence
    const expIdx = rnd(1, Math.min(3, ex.period));
    const ans = modPow(ex.a, expIdx, ex.N);
    const stps = [];
    for (let i = 1; i <= expIdx; i++) {
      const val = modPow(ex.a, i, ex.N);
      const raw = Math.pow(ex.a, i);
      stps.push(`${ex.a}^${i} = ${raw} mod ${ex.N} = ${val}`);
    }
    return {
      type: 'period_finding',
      question: `Compute ${ex.a}^${expIdx} mod ${ex.N}.`,
      answer: ans,
      answerDisplay: `${ans}`,
      answerType: 'numeric',
      difficulty: d,
      steps: stps,
    };
  }

  if (variation === 'find_period') {
    const ex = examples[rnd(0, examples.length - 1)];
    const seqStr = ex.powers.map((v, i) => `${ex.a}^${i + 1} mod ${ex.N} = ${v}`).join(', ');
    return {
      type: 'period_finding',
      question: `Given the sequence: ${seqStr}. What is the period r of ${ex.a}^x mod ${ex.N}?`,
      answer: ex.period,
      answerDisplay: `${ex.period}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `The period r is the smallest positive integer where ${ex.a}^r mod ${ex.N} = 1.`,
        `From the sequence, ${ex.a}^${ex.period} mod ${ex.N} = 1.`,
        `So r = ${ex.period}.`,
      ],
    };
  }

  if (variation === 'small_example') {
    const pool = examples.filter(e => e.N === 15);
    const ex = pool[rnd(0, pool.length - 1)];
    const seqStr = ex.powers.map((v, i) => `${ex.a}^${i + 1}≡${v}`).join(', ');
    return {
      type: 'period_finding',
      question: `Find the period of ${ex.a}^x mod ${ex.N}. (Sequence: ${seqStr})`,
      answer: ex.period,
      answerDisplay: `${ex.period}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `Compute powers of ${ex.a} mod ${ex.N}:`,
        ...ex.powers.map((v, i) => `${ex.a}^${i + 1} mod ${ex.N} = ${v}`),
        `${ex.a}^${ex.period} mod ${ex.N} = 1, so the period r = ${ex.period}.`,
      ],
    };
  }

  // Default: compute_powers
  return periodFinding(d, 'compute_powers');
}

function periodToFactors(d, variation = 'basic') {
  // Curated examples with correct math
  const examples = [
    { N: 15, a: 7,  r: 4, halfPow: 49,  plus1: 50,  minus1: 48,  gcd1: 5, gcd2: 3 },
    { N: 15, a: 11, r: 2, halfPow: 121, plus1: 122, minus1: 120, gcd1: 1, gcd2: 15 }, // trivial — bad
    { N: 15, a: 2,  r: 4, halfPow: 4,   plus1: 5,   minus1: 3,   gcd1: 5, gcd2: 3 },
    { N: 15, a: 13, r: 4, halfPow: 169, plus1: 170, minus1: 168, gcd1: 5, gcd2: 3 },
    { N: 21, a: 4,  r: 3, halfPow: -1,  plus1: -1,  minus1: -1,  gcd1: -1, gcd2: -1 }, // r odd — bad
  ];
  // Filter to examples with even r and non-trivial factors
  const good = examples.filter(e => e.r % 2 === 0 && e.gcd1 !== 1 && e.gcd1 !== e.N);

  if (variation === 'basic' || variation === 'different_a') {
    const ex = good[rnd(0, good.length - 1)];
    const halfR = ex.r / 2;
    const aHalf = modPow(ex.a, halfR, ex.N);
    const f1 = gcd(aHalf + 1, ex.N);
    const f2 = gcd(aHalf - 1, ex.N);
    // Ensure we get the right factors
    const factors = [f1, f2].filter(f => f > 1 && f < ex.N).sort((a, b) => a - b);
    const ans = factors[0];
    return {
      type: 'period_to_factors',
      question: `N = ${ex.N}, a = ${ex.a}, period r = ${ex.r}. Use these to find a non-trivial factor of ${ex.N}.`,
      answer: ans,
      answerDisplay: `${factors.join(' and ')} (since ${ex.N} = ${factors[0]} × ${factors[1]})`,
      answerType: 'numeric',
      difficulty: d,
      acceptAlternate: factors.length > 1 ? factors[1] : null,
      steps: [
        `r = ${ex.r} is even, so compute a^(r/2) = ${ex.a}^${halfR} mod ${ex.N} = ${aHalf}.`,
        `gcd(${aHalf} + 1, ${ex.N}) = gcd(${aHalf + 1}, ${ex.N}) = ${f1}`,
        `gcd(${aHalf} - 1, ${ex.N}) = gcd(${aHalf - 1}, ${ex.N}) = ${f2}`,
        `Non-trivial factors: ${factors.join(' and ')}.`,
      ],
    };
  }

  if (variation === 'gcd_step') {
    // Specific: N=15, a=7, r=4 → gcd(50, 15)=5
    const cases = [
      { N: 15, a: 7, r: 4, halfR: 2, aHalf: 4, plus: 50, gcdVal: 5, label: '7² + 1 = 50' },
      { N: 15, a: 2, r: 4, halfR: 2, aHalf: 4, plus: 5,  gcdVal: 5, label: '2² + 1 = 5' },
      { N: 15, a: 13, r: 4, halfR: 2, aHalf: 4, plus: 170, gcdVal: 5, label: '13² + 1 = 170' },
    ];
    const c = cases[rnd(0, cases.length - 1)];
    // For gcd_step, ask them to compute gcd(a^(r/2)+1, N)
    const rawPow = Math.pow(c.a, c.halfR);
    const gcdResult = gcd(rawPow + 1, c.N);
    return {
      type: 'period_to_factors',
      question: `Compute gcd(${c.a}^${c.halfR} + 1, ${c.N}). (Hint: ${c.a}^${c.halfR} = ${rawPow})`,
      answer: gcdResult,
      answerDisplay: `${gcdResult}`,
      answerType: 'numeric',
      difficulty: d,
      steps: [
        `${c.a}^${c.halfR} = ${rawPow}`,
        `${rawPow} + 1 = ${rawPow + 1}`,
        `gcd(${rawPow + 1}, ${c.N}) = ${gcdResult}`,
      ],
    };
  }

  if (variation === 'why_even') {
    return {
      type: 'period_to_factors',
      question: 'What happens if the period r found by Shor\'s algorithm is odd?',
      choices: [
        'The algorithm still works — just use r directly',
        'The algorithm fails for this a; try a different random a',
        'An odd period means N is prime',
        'You double r to make it even',
      ],
      answer: 'B',
      answerDisplay: 'B) The algorithm fails for this a; try a different random a',
      answerType: 'choice',
      difficulty: d,
      steps: [
        'Shor\'s algorithm requires r to be even so we can compute a^(r/2).',
        'If r is odd, a^(r/2) is not an integer — we cannot compute gcd.',
        'Solution: pick a new random a and try again.',
        'For most N, a random a gives an even period with probability ≥ 1/2.',
      ],
    };
  }

  // Default: basic
  return periodToFactors(d, 'basic');
}

function qftConcept(d, variation = 'basic') {
  const items = {
    classical_vs_quantum: {
      q: 'The classical Fast Fourier Transform (FFT) on N points takes O(N log N) time. How does the Quantum Fourier Transform (QFT) compare?',
      choices: [
        'O(N log N) — same as classical',
        'O(N²) — slower than classical',
        'O((log N)²) — exponentially faster',
        'O(1) — instant',
      ],
      answer: 'C', display: 'C) O((log N)²) — exponentially faster',
      steps: [
        'Classical FFT: O(N log N) where N = 2^n.',
        'QFT: O(n²) = O((log N)²) gates on n qubits.',
        'This is an exponential speedup: O((log N)²) vs O(N log N).',
        'The QFT acts on a superposition of all N states simultaneously.',
      ],
    },
    qft_analogy: {
      q: 'The QFT is analogous to which everyday process?',
      choices: [
        'A magnifying glass focusing light',
        'A prism splitting light into its frequency components',
        'A mirror reflecting a signal',
        'A battery storing energy',
      ],
      answer: 'B', display: 'B) A prism splitting light into its frequency components',
      steps: [
        'A Fourier transform decomposes a signal into its frequency components.',
        'Just as a prism splits white light into a spectrum of colors (frequencies),',
        'the QFT transforms a quantum state from the computational basis to the frequency basis.',
        'In Shor\'s algorithm, this reveals the hidden period in the modular exponentiation.',
      ],
    },
    where_speedup: {
      q: 'In Shor\'s algorithm, which step provides the quantum speedup?',
      choices: [
        'Choosing random a',
        'Computing a^x mod N',
        'The Quantum Fourier Transform for period finding',
        'Computing the GCD',
      ],
      answer: 'C', display: 'C) The Quantum Fourier Transform for period finding',
      steps: [
        'Choosing a: classical, O(1).',
        'Modular exponentiation: done in superposition, but the key insight is the QFT.',
        'QFT: transforms the state to reveal the period — this is the quantum speedup.',
        'GCD: classical Euclidean algorithm, O((log N)²).',
      ],
    },
  };

  let pool;
  if (variation === 'classical_vs_quantum') pool = ['classical_vs_quantum'];
  else if (variation === 'qft_analogy') pool = ['qft_analogy'];
  else if (variation === 'where_speedup') pool = ['where_speedup'];
  else pool = ['classical_vs_quantum', 'qft_analogy', 'where_speedup'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'qft_concept', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function shorFull(d, variation = 'basic') {
  const items = {
    steps_in_order: {
      q: 'What is the correct order of steps in Shor\'s algorithm?',
      choices: [
        '1) QFT → 2) Pick random a → 3) Factor → 4) Compute GCD',
        '1) Pick random a → 2) Compute a^x mod N in superposition → 3) QFT to find period → 4) Compute GCD to get factors',
        '1) Compute GCD → 2) QFT → 3) Pick random a → 4) Factor',
        '1) Factor N → 2) Verify with QFT → 3) Compute GCD → 4) Pick a',
      ],
      answer: 'B',
      display: 'B) Pick random a → Compute a^x mod N → QFT → Compute GCD',
      steps: [
        'Step 1: Pick a random a < N, check gcd(a, N) = 1.',
        'Step 2: Use quantum circuits to compute a^x mod N in superposition.',
        'Step 3: Apply QFT to find the period r of a^x mod N.',
        'Step 4: Classically compute gcd(a^(r/2) ± 1, N) to get factors.',
      ],
    },
    quantum_vs_classical_steps: {
      q: 'Which part of Shor\'s algorithm is performed on a quantum computer?',
      choices: [
        'All steps are quantum',
        'Only the GCD computation',
        'Period finding via modular exponentiation + QFT',
        'Only choosing random a',
      ],
      answer: 'C',
      display: 'C) Period finding via modular exponentiation + QFT',
      steps: [
        'Picking random a: classical.',
        'Modular exponentiation in superposition + QFT: quantum.',
        'GCD computation: classical (Euclidean algorithm).',
        'Shor\'s algorithm is a hybrid classical-quantum algorithm.',
      ],
    },
    complexity: {
      q: 'What is the time complexity of Shor\'s algorithm for factoring an n-digit number?',
      choices: [
        'O(2^n) — exponential',
        'O(n³) — polynomial (cubic in number of digits)',
        'O(n!) — factorial',
        'O(√(2^n)) — same as Grover on factoring',
      ],
      answer: 'B',
      display: 'B) O(n³) — polynomial (cubic in number of digits)',
      steps: [
        'Shor\'s algorithm runs in O((log N)³) time, where N is the number to factor.',
        'Since n = log N (number of digits), this is O(n³) — polynomial!',
        'Classical best: sub-exponential (Number Field Sieve).',
        'This exponential-to-polynomial speedup is what makes Shor\'s algorithm revolutionary.',
      ],
    },
    implications: {
      q: 'Which cryptographic system would be broken by a large-scale quantum computer running Shor\'s algorithm?',
      choices: [
        'AES-256 symmetric encryption',
        'SHA-256 hashing',
        'RSA and elliptic curve cryptography',
        'One-time pads',
      ],
      answer: 'C',
      display: 'C) RSA and elliptic curve cryptography',
      steps: [
        'RSA: security based on factoring — broken by Shor\'s algorithm.',
        'Elliptic curve: security based on discrete log — also broken by Shor\'s.',
        'AES: symmetric — only quadratically weakened by Grover (still secure with doubled key).',
        'SHA-256: hash — not directly broken by Shor\'s.',
        'One-time pads: information-theoretically secure — unbreakable.',
      ],
    },
  };

  let pool;
  if (variation === 'steps_in_order') pool = ['steps_in_order'];
  else if (variation === 'quantum_vs_classical_steps') pool = ['quantum_vs_classical_steps'];
  else if (variation === 'complexity') pool = ['complexity'];
  else if (variation === 'implications') pool = ['implications'];
  else pool = ['steps_in_order', 'quantum_vs_classical_steps', 'complexity', 'implications'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'shor_full', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

// ── Chapter 20: The Landscape — Where Quantum Computing Is Now ───────────────

function qubitTech(d, variation = 'basic') {
  const items = {
    match_ibm: {
      q: 'What qubit technology does IBM primarily use in its quantum processors (e.g., Eagle, Heron)?',
      choices: [
        'Trapped ions',
        'Superconducting transmon qubits',
        'Photonic qubits',
        'Neutral atoms',
      ],
      answer: 'B', display: 'B) Superconducting transmon qubits',
      steps: [
        'IBM builds its quantum processors using superconducting transmon qubits.',
        'These operate at ~15 millikelvin in dilution refrigerators.',
        'IBM\'s Heron processor (2024) has 133 qubits with improved error rates.',
      ],
    },
    match_ionq: {
      q: 'What qubit technology does IonQ use?',
      choices: [
        'Superconducting circuits',
        'Topological qubits',
        'Trapped ions (ytterbium)',
        'Photonic qubits',
      ],
      answer: 'C', display: 'C) Trapped ions (ytterbium)',
      steps: [
        'IonQ uses trapped ytterbium ions confined by electromagnetic fields.',
        'Trapped ions have very long coherence times and high gate fidelities.',
        'IonQ\'s Forte system achieves #AQ 35 (algorithmic qubits).',
      ],
    },
    match_google: {
      q: 'What qubit technology did Google use in its Sycamore and Willow processors?',
      choices: [
        'Neutral atoms in optical tweezers',
        'Superconducting transmon qubits',
        'Nitrogen-vacancy centers in diamond',
        'Trapped ions',
      ],
      answer: 'B', display: 'B) Superconducting transmon qubits',
      steps: [
        'Google Quantum AI uses superconducting transmon qubits, like IBM.',
        'Sycamore (2019) had 53 qubits; Willow (2024) has 105 qubits.',
        'Google focuses on achieving below-threshold error correction with surface codes.',
      ],
    },
    match_quantinuum: {
      q: 'What qubit technology does Quantinuum (formerly Honeywell Quantum) use?',
      choices: [
        'Superconducting qubits',
        'Photonic qubits',
        'Trapped ions',
        'Spin qubits in silicon',
      ],
      answer: 'C', display: 'C) Trapped ions',
      steps: [
        'Quantinuum uses trapped-ion technology inherited from Honeywell.',
        'Their H2 processor achieves very high two-qubit gate fidelities (>99.8%).',
        'Trapped ions allow all-to-all connectivity, unlike fixed-topology superconducting chips.',
      ],
    },
    tradeoff_ions: {
      q: 'What is a key advantage of trapped-ion qubits over superconducting qubits?',
      choices: [
        'Faster gate speeds',
        'Higher gate fidelities and longer coherence times',
        'Easier to manufacture at scale',
        'No need for vacuum systems',
      ],
      answer: 'B', display: 'B) Higher gate fidelities and longer coherence times',
      steps: [
        'Trapped ions have coherence times of seconds (vs microseconds for superconducting).',
        'Two-qubit gate fidelities exceed 99.8% in leading trapped-ion systems.',
        'The tradeoff: gate operations are slower (~ms vs ~ns for superconducting).',
      ],
    },
    tradeoff_sc: {
      q: 'What is a key advantage of superconducting qubits over trapped ions?',
      choices: [
        'Longer coherence times',
        'Higher gate fidelity',
        'Much faster gate speeds (~10-100 nanoseconds)',
        'All-to-all qubit connectivity',
      ],
      answer: 'C', display: 'C) Much faster gate speeds (~10-100 nanoseconds)',
      steps: [
        'Superconducting gates operate in ~10-100 ns, roughly 1000x faster than trapped-ion gates.',
        'This speed advantage partially compensates for shorter coherence times (~100 us).',
        'Superconducting chips also leverage established semiconductor fabrication techniques.',
      ],
    },
    current_scale: {
      q: 'As of 2025, roughly how many physical qubits do the largest quantum processors have?',
      choices: [
        'About 10-50',
        'About 100-200',
        'About 1,000-1,200',
        'About 100,000+',
      ],
      answer: 'C', display: 'C) About 1,000-1,200',
      steps: [
        'IBM\'s Condor processor (2023) reached 1,121 superconducting qubits.',
        'Atom Computing demonstrated a 1,225-qubit neutral atom system in 2023.',
        'Most practical quantum computers operate with 50-200 high-quality qubits.',
      ],
    },
    neutral_atoms: {
      q: 'Which company is a leading developer of neutral-atom quantum computers?',
      choices: [
        'IBM',
        'IonQ',
        'QuEra Computing',
        'Quantinuum',
      ],
      answer: 'C', display: 'C) QuEra Computing',
      steps: [
        'QuEra Computing uses arrays of neutral atoms held in optical tweezers.',
        'Neutral atoms can be rearranged dynamically, enabling flexible connectivity.',
        'Their approach has shown promise for scaling to thousands of physical qubits.',
      ],
    },
  };

  let pool;
  if (variation === 'match_company') pool = ['match_ibm', 'match_ionq', 'match_google', 'match_quantinuum'];
  else if (variation === 'tradeoffs') pool = ['tradeoff_ions', 'tradeoff_sc'];
  else if (variation === 'current_scale') pool = ['current_scale', 'neutral_atoms'];
  else pool = ['match_ibm', 'match_ionq', 'match_google', 'tradeoff_ions', 'current_scale'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'qubit_tech', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function nisqConcept(d, variation = 'basic') {
  const items = {
    define_nisq: {
      q: 'What does NISQ stand for?',
      choices: [
        'New Intermediate-Scale Quantum',
        'Noisy Intermediate-Scale Quantum',
        'Non-Ideal Scalable Quantum',
        'Narrow Input Superposition Quantum',
      ],
      answer: 'B', display: 'B) Noisy Intermediate-Scale Quantum',
      steps: [
        'NISQ was coined by John Preskill in 2018.',
        '"Noisy" — qubits suffer errors that cannot yet be fully corrected.',
        '"Intermediate-Scale" — 50 to a few thousand qubits, too few for full error correction.',
      ],
    },
    nisq_era_meaning: {
      q: 'What defines the NISQ era of quantum computing?',
      choices: [
        'Quantum computers that can run any algorithm perfectly',
        'Quantum computers with 50-1000+ qubits but limited error correction',
        'Quantum computers that simulate noise for research',
        'Quantum computers that only work at room temperature',
      ],
      answer: 'B', display: 'B) Quantum computers with 50-1000+ qubits but limited error correction',
      steps: [
        'NISQ devices have enough qubits for non-trivial computations.',
        'But errors accumulate, limiting circuit depth to ~100-1000 gates.',
        'Full fault-tolerant quantum computing requires millions of physical qubits.',
      ],
    },
    why_not_shor: {
      q: 'Why can\'t current quantum computers break RSA encryption using Shor\'s algorithm?',
      choices: [
        'Shor\'s algorithm hasn\'t been invented yet',
        'RSA doesn\'t use numbers',
        'Breaking RSA-2048 requires ~4,000 logical (millions of physical) qubits with error correction',
        'Shor\'s algorithm only works on classical computers',
      ],
      answer: 'C', display: 'C) Breaking RSA-2048 requires ~4,000 logical (millions of physical) qubits with error correction',
      steps: [
        'Shor\'s algorithm is known but requires fault-tolerant qubits.',
        'Estimates: ~4,000 logical qubits to factor RSA-2048.',
        'With error correction overhead, that means millions of physical qubits.',
        'Current devices have ~1,000 noisy physical qubits — far from sufficient.',
      ],
    },
    what_works_vqe: {
      q: 'Which type of algorithm is best suited for NISQ devices?',
      choices: [
        'Shor\'s factoring algorithm',
        'Variational algorithms like VQE and QAOA',
        'Grover\'s search on databases with 10^18 entries',
        'Full quantum error correction codes',
      ],
      answer: 'B', display: 'B) Variational algorithms like VQE and QAOA',
      steps: [
        'Variational algorithms use short circuits, tolerating noise better.',
        'VQE (Variational Quantum Eigensolver) estimates molecular ground-state energies.',
        'QAOA (Quantum Approximate Optimization) tackles combinatorial optimization.',
        'These hybrid classical-quantum approaches are designed for the NISQ era.',
      ],
    },
    what_works_chemistry: {
      q: 'What is a leading near-term application of NISQ quantum computers?',
      choices: [
        'Replacing all classical computers',
        'Simulating small molecules and chemical reactions',
        'Cracking all encryption worldwide',
        'Running artificial general intelligence',
      ],
      answer: 'B', display: 'B) Simulating small molecules and chemical reactions',
      steps: [
        'Quantum computers naturally simulate quantum systems like molecules.',
        'Small molecules (e.g., LiH, H2O, FeMoco) have been simulated on NISQ devices.',
        'Drug discovery and materials science are promising near-term applications.',
      ],
    },
    noise_source: {
      q: 'What is the primary source of errors in current NISQ quantum computers?',
      choices: [
        'Software bugs in the control systems',
        'Decoherence and imperfect gate operations',
        'Incorrect measurement of classical bits',
        'Interference from other quantum computers nearby',
      ],
      answer: 'B', display: 'B) Decoherence and imperfect gate operations',
      steps: [
        'Decoherence: qubits lose quantum information through interaction with the environment.',
        'Gate errors: each gate operation is slightly imperfect (fidelity < 100%).',
        'These compound over a circuit — 1000 gates each at 99.9% fidelity gives ~37% success overall.',
      ],
    },
  };

  let pool;
  if (variation === 'define_nisq') pool = ['define_nisq', 'nisq_era_meaning'];
  else if (variation === 'why_not_shor') pool = ['why_not_shor'];
  else if (variation === 'what_works') pool = ['what_works_vqe', 'what_works_chemistry', 'noise_source'];
  else pool = ['define_nisq', 'why_not_shor', 'what_works_vqe'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'nisq_concept', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function quantumAdvantage(d, variation = 'basic') {
  const items = {
    google_claim: {
      q: 'In 2019, Google claimed "quantum supremacy" with its Sycamore processor. What did it demonstrate?',
      choices: [
        'Breaking RSA encryption in minutes',
        'Simulating a large protein molecule',
        'Completing a specific sampling task in 200 seconds that would take a classical supercomputer ~10,000 years',
        'Factoring a 2048-bit number',
      ],
      answer: 'C', display: 'C) A sampling task in 200 seconds vs ~10,000 years classically',
      steps: [
        'Google\'s Sycamore (53 qubits) performed random circuit sampling.',
        'Google estimated the classical time at 10,000 years on Summit supercomputer.',
        'This was the first claim of quantum computational advantage ("supremacy").',
      ],
    },
    ibm_dispute: {
      q: 'Why did IBM dispute Google\'s 2019 quantum supremacy claim?',
      choices: [
        'IBM said Google\'s circuits had too many errors',
        'IBM argued the classical simulation could be done in 2.5 days with better algorithms and more storage',
        'IBM claimed their own quantum computer was faster',
        'IBM said the experiment violated the laws of physics',
      ],
      answer: 'B', display: 'B) IBM argued classical simulation could be done in ~2.5 days with better algorithms',
      steps: [
        'IBM proposed using 250 PB of disk storage to reduce the classical simulation time.',
        'This showed the "supremacy" boundary depends on the best known classical algorithm.',
        'The debate highlighted that quantum advantage is relative to classical optimization.',
      ],
    },
    practical_vs_theoretical: {
      q: 'What is the difference between "quantum advantage" and "quantum utility"?',
      choices: [
        'They mean exactly the same thing',
        '"Advantage" means faster at any task; "utility" means solving a useful real-world problem faster',
        '"Utility" is just a marketing term with no technical meaning',
        '"Advantage" applies only to cryptography',
      ],
      answer: 'B', display: 'B) "Advantage" = faster at any task; "utility" = solving a useful real-world problem faster',
      steps: [
        'Quantum advantage: outperforming classical on ANY well-defined computational task.',
        'Quantum utility: outperforming classical on a PRACTICAL, useful problem.',
        'Google\'s 2019 result showed advantage on an artificial task, not a useful one.',
        'The field is now focused on demonstrating quantum utility for real applications.',
      ],
    },
    willow_2024: {
      q: 'What breakthrough did Google\'s Willow chip (2024) demonstrate?',
      choices: [
        'The first 1 million qubit processor',
        'Below-threshold quantum error correction — adding qubits reduced rather than increased errors',
        'Room-temperature superconducting qubits',
        'Running Shor\'s algorithm to factor RSA-2048',
      ],
      answer: 'B', display: 'B) Below-threshold error correction — more qubits reduced errors',
      steps: [
        'Willow (105 qubits) showed that increasing code distance reduced logical error rates.',
        'This is a critical milestone: it proves error correction can work as theory predicts.',
        'Below threshold means error correction overhead shrinks as you add more qubits.',
      ],
    },
    no_useful_yet: {
      q: 'As of 2025, have quantum computers solved any commercially important problem faster than classical computers?',
      choices: [
        'Yes, quantum computers routinely outperform classical ones in drug discovery',
        'Yes, quantum computers have broken RSA encryption',
        'Not yet — demonstrations of advantage have been on specially constructed problems, not practical applications',
        'Yes, quantum computers run all of Google\'s search algorithms',
      ],
      answer: 'C', display: 'C) Not yet — advantage shown only on specialized, non-practical problems',
      steps: [
        'Quantum advantage has been demonstrated on sampling tasks (Google, Xanadu).',
        'No commercially relevant problem has been solved faster on a quantum computer yet.',
        'Near-term candidates: molecular simulation, optimization, and machine learning.',
      ],
    },
  };

  let pool;
  if (variation === 'google_claim') pool = ['google_claim'];
  else if (variation === 'debate') pool = ['ibm_dispute'];
  else if (variation === 'practical_vs_theoretical') pool = ['practical_vs_theoretical', 'willow_2024', 'no_useful_yet'];
  else pool = ['google_claim', 'ibm_dispute', 'practical_vs_theoretical'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'quantum_advantage', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function faultTolerancePath(d, variation = 'basic') {
  const items = {
    physical_per_logical: {
      q: 'Roughly how many physical qubits are needed to create one fault-tolerant logical qubit using surface codes?',
      choices: [
        '1-5',
        '10-50',
        '1,000-10,000',
        'Exactly 2',
      ],
      answer: 'C', display: 'C) 1,000-10,000',
      steps: [
        'Surface codes are the leading error correction approach.',
        'Each logical qubit requires a large array of physical qubits for redundancy.',
        'Current estimates: ~1,000 to 10,000 physical qubits per logical qubit, depending on error rates.',
      ],
    },
    shor_logical: {
      q: 'Approximately how many error-corrected logical qubits are needed to run Shor\'s algorithm on RSA-2048?',
      choices: [
        'About 50',
        'About 4,000',
        'About 10',
        'About 1 million',
      ],
      answer: 'B', display: 'B) About 4,000',
      steps: [
        'Shor\'s algorithm for RSA-2048 needs ~4,000 logical qubits.',
        'This includes qubits for the quantum Fourier transform and modular exponentiation.',
        'The 4,000 figure assumes optimized circuit implementations (Gidney & Ekera, 2021).',
      ],
    },
    total_physical: {
      q: 'To factor RSA-2048 with Shor\'s algorithm, roughly how many total physical qubits would be needed?',
      choices: [
        'About 10,000',
        'About 100,000',
        'Several million to tens of millions',
        'About 1,000',
      ],
      answer: 'C', display: 'C) Several million to tens of millions',
      steps: [
        '~4,000 logical qubits x ~1,000-10,000 physical per logical = millions of physical qubits.',
        'Estimates range from ~4 million (optimistic) to ~20 million (conservative).',
        'Current devices have ~1,000 physical qubits — a factor of ~1,000-10,000x short.',
      ],
    },
    error_correction_idea: {
      q: 'What is the basic idea behind quantum error correction?',
      choices: [
        'Simply repeat each quantum computation multiple times and take the majority vote',
        'Encode one logical qubit across many physical qubits so errors can be detected and corrected',
        'Use classical computers to double-check quantum results',
        'Cool the qubits to absolute zero to eliminate all errors',
      ],
      answer: 'B', display: 'B) Encode one logical qubit across many physical qubits to detect and correct errors',
      steps: [
        'Quantum error correction spreads quantum information across multiple physical qubits.',
        'Syndrome measurements detect errors without collapsing the logical state.',
        'Unlike classical repetition, you can\'t simply copy qubits (no-cloning theorem).',
      ],
    },
    timeline: {
      q: 'What is the current expert consensus on when fault-tolerant quantum computers might be available?',
      choices: [
        'They already exist today',
        'Within the next 1-2 years (by 2027)',
        'Likely 5-15+ years away (2030s or later)',
        'It has been proven mathematically impossible',
      ],
      answer: 'C', display: 'C) Likely 5-15+ years away (2030s or later)',
      steps: [
        'Building millions of high-quality physical qubits remains an immense engineering challenge.',
        'Google\'s Willow (2024) showed below-threshold error correction — a key milestone.',
        'Most roadmaps target initial fault-tolerant demonstrations in the late 2020s.',
        'Commercially useful fault-tolerant computers are generally expected in the 2030s.',
      ],
    },
    surface_code: {
      q: 'What is the surface code?',
      choices: [
        'A programming language for quantum computers',
        'A leading quantum error correction code that arranges qubits in a 2D grid',
        'A way to encrypt data using quantum states',
        'A classical error correction code used in hard drives',
      ],
      answer: 'B', display: 'B) A leading QEC code that arranges qubits in a 2D grid',
      steps: [
        'The surface code arranges physical qubits on a 2D lattice.',
        'It has a high error threshold (~1%) — meaning it tolerates realistic error rates.',
        'Its 2D layout matches the physical connectivity of superconducting chips.',
      ],
    },
  };

  let pool;
  if (variation === 'physical_to_logical') pool = ['physical_per_logical', 'error_correction_idea'];
  else if (variation === 'shor_requirements') pool = ['shor_logical'];
  else if (variation === 'total_physical') pool = ['total_physical', 'timeline', 'surface_code'];
  else pool = ['physical_per_logical', 'shor_logical', 'total_physical'];

  const key = pool[rnd(0, pool.length - 1)];
  const it = items[key];
  return {
    type: 'fault_tolerance_path', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

function graduation(d, variation = 'basic') {
  const items = {
    next_step: {
      q: 'You\'ve completed Quantum Primer! Which resource would you explore first to start building quantum circuits?',
      choices: [
        'IBM Qiskit — open-source Python SDK with real hardware access',
        'Google Cirq — Python framework for NISQ algorithms',
        'Xanadu PennyLane — framework for quantum machine learning',
        'Read research papers on arXiv quant-ph',
      ],
      answer: 'A', display: 'A) IBM Qiskit (all choices are great — Qiskit has the largest community and free hardware access)',
      steps: [
        'All four are excellent choices for continuing your quantum journey.',
        'Qiskit has the largest community, extensive tutorials, and free access to real quantum hardware via IBM Quantum.',
        'Cirq is great if you\'re interested in Google\'s quantum hardware and NISQ algorithms.',
        'PennyLane excels at quantum machine learning and is hardware-agnostic.',
      ],
    },
  };

  const it = items['next_step'];
  return {
    type: 'graduation', question: it.q, choices: it.choices,
    answer: it.answer, answerDisplay: it.display, answerType: 'choice', difficulty: d, steps: it.steps,
  };
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

const GENS = {
  linear_equation:             linearEquation,
  substitution:                substitution,
  square_root:                 squareRoot,
  exponent:                    exponent,
  vector_addition:             vectorAddition,
  scalar_multiplication:       scalarMultiplication,
  vector_magnitude:            vectorMagnitude,
  normalize_vector:            normalizeVector,
  unit_vector_check:           unitVectorCheck,
  probability_from_components: probabilityFromComponents,
  complex_addition:            complexAddition,
  complex_multiplication:      complexMultiplication,
  complex_conjugate:           complexConjugate,
  complex_magnitude:           complexMagnitude,
  matrix_vector_multiply:      matrixVectorMultiply,
  matrix_matrix_multiply:      matrixMatrixMultiply,
  identity_matrix:             identityMatrix,
  // Chapter 6: Dirac Notation
  ket_to_vector:               ketToVector,
  inner_product:               innerProduct,
  orthogonality_check:         orthogonalityCheck,
  dirac_probability:           diracProbability,
  // Chapter 7: Quantum Gates
  pauli_gate_apply:            pauliGateApply,
  hadamard_apply:              hadamardApply,
  gate_then_measure:           gateThenMeasure,
  two_gate_compose:            twoGateCompose,
  // Chapter 8: Measurement
  born_rule_complex:           bornRuleComplex,
  valid_state_check:           validStateCheck,
  expected_counts:             expectedCounts,
  missing_amplitude:           missingAmplitude,
  // Chapter 9: Two-Qubit Systems
  two_qubit_basis:             twoQubitBasis,
  tensor_product:              tensorProduct,
  two_qubit_state:             twoQubitState,
  separable_check:             separableCheck,
  tensor_component_identify:   tensorComponentIdentify,
  tensor_probability:          tensorProbability,
  // Chapter 10: Entanglement & Bell States
  entanglement_check:          entanglementCheck,
  cnot_apply:                  cnotApply,
  build_bell_state:            buildBellState,
  entangled_measurement:       entangledMeasurement,
  // Chapter 11: Quantum Circuits
  trace_single_qubit:          traceSingleQubit,
  trace_two_qubit:             traceTwoQubit,
  circuit_probabilities:       circuitProbabilities,
  circuit_equivalence:         circuitEquivalence,
  // Chapter 12: Rotation Gates
  bloch_identification:        blochIdentification,
  rz_apply:                    rzApply,
  rx_apply:                    rxApply,
  ry_apply:                    ryApply,
  euler_decompose:             eulerDecompose,
  // Chapter 13: Phase Gates
  s_gate_apply:                sGateApply,
  s_dagger_apply:              sDaggerApply,
  t_gate_apply:                tGateApply,
  t_dagger_apply:              tDaggerApply,
  phase_family:                phaseFamily,
  // Chapter 14: Multi-Qubit Gates
  cz_apply:                    czApply,
  swap_apply:                  swapApply,
  toffoli_apply:               toffoliApply,
  controlled_gate:             controlledGate,
  // Chapter 15: Quantum Teleportation
  teleportation_concept:       teleportationConcept,
  teleport_setup:              teleportSetup,
  teleport_alice_ops:          teleportAliceOps,
  teleport_measurement:        teleportMeasurement,
  teleport_correction:         teleportCorrection,
  // Chapter 16: Deutsch-Jozsa Algorithm
  dj_problem_type:             djProblemType,
  dj_oracle:                   djOracle,
  dj_trace:                    djTrace,
  phase_kickback:              phaseKickback,
  dj_generalize:               djGeneralize,
  // Chapter 17: Grover's Search Algorithm
  grover_problem:              groverProblem,
  grover_oracle:               groverOracle,
  grover_diffusion:            groverDiffusion,
  grover_full:                 groverFull,
  grover_optimality:           groverOptimality,
  // Chapter 18: Quantum Error Correction
  error_concept:               errorConcept,
  bit_flip_code:               bitFlipCode,
  phase_flip_code:             phaseFlipCode,
  shor_code:                   shorCode,
  threshold_concept:           thresholdConcept,
  // Chapter 19: Shor's Algorithm
  factoring_problem:           factoringProblem,
  period_finding:              periodFinding,
  period_to_factors:           periodToFactors,
  qft_concept:                 qftConcept,
  shor_full:                   shorFull,
  // Chapter 20: The Landscape
  qubit_tech:                  qubitTech,
  nisq_concept:                nisqConcept,
  quantum_advantage:           quantumAdvantage,
  fault_tolerance_path:        faultTolerancePath,
  graduation:                  graduation,
};

export function generateProblem(chapterId, type, difficulty = 1, variation = 'basic') {
  const gen = GENS[type];
  if (!gen) throw new Error(`Unknown problem type: ${type}`);
  return { ...gen(difficulty, variation), chapterId };
}

export function generateRandomProblem(chapter, difficulty = 1) {
  const type = chapter.problemTypes[Math.floor(Math.random() * chapter.problemTypes.length)];

  // Collect variations taught in lessons for this type, gated by difficulty
  const taughtVariations = [];
  for (const step of chapter.lessonSteps || []) {
    if (step.problemType === type && step.progression) {
      for (const p of step.progression) {
        if (p.difficulty <= difficulty && !taughtVariations.includes(p.variation)) {
          taughtVariations.push(p.variation);
        }
      }
    }
  }

  const variation = taughtVariations.length > 0
    ? taughtVariations[Math.floor(Math.random() * taughtVariations.length)]
    : 'basic';

  return generateProblem(chapter.id, type, difficulty, variation);
}
