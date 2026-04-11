/**
 * problems.js — Problem generation engine + deterministic answer checker.
 *
 * Each generator returns:
 *   { type, question, answer, answerDisplay, answerType, difficulty, steps }
 *
 * steps: string[] — worked solution shown when student answers incorrectly in practice.
 *
 * answerType values: 'numeric' | 'vector' | 'vector4' | 'complex' | 'matrix' | 'yesno'
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
      return { correct: Math.abs(p - a) < TOL, formattedAnswer: answerDisplay };
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
    const simple = [[1,0],[0,1],[1,1]];
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
    const allTriples = [[3,4,5],[4,3,5],[6,8,10],[8,6,10]];
    const i1 = rnd(0, 1); // pick from first pair
    const i2 = rnd(2, 3); // pick from second pair
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
    const simple = [[1,0],[0,1]];
    const v1 = simple[rnd(0, 1)];
    const v2 = simple[rnd(0, 1)];
    state = [v1[0]*v2[0], v1[0]*v2[1], v1[1]*v2[0], v1[1]*v2[1]];
    label = `(${state.join(', ')})`;
  } else {
    // Bell-like entangled states (not factorable)
    const bellStates = [
      { v: [0.71, 0, 0, 0.71], name: '(0.71, 0, 0, 0.71)' },
      { v: [0.71, 0, 0, -0.71], name: '(0.71, 0, 0, -0.71)' },
      { v: [0, 0.71, 0.71, 0], name: '(0, 0.71, 0.71, 0)' },
      { v: [0, 0.71, -0.71, 0], name: '(0, 0.71, -0.71, 0)' },
    ];
    const pick = bellStates[rnd(0, bellStates.length - 1)];
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
};

export function generateProblem(chapterId, type, difficulty = 1, variation = 'basic') {
  const gen = GENS[type];
  if (!gen) throw new Error(`Unknown problem type: ${type}`);
  return { ...gen(difficulty, variation), chapterId };
}

export function generateRandomProblem(chapter, difficulty = 1) {
  const type = chapter.problemTypes[Math.floor(Math.random() * chapter.problemTypes.length)];
  return generateProblem(chapter.id, type, difficulty);
}
