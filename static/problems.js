/**
 * problems.js — Problem generation engine + deterministic answer checker.
 *
 * Each generator returns:
 *   { type, question, answer, answerDisplay, answerType, difficulty, chapterId }
 *
 * answerType values: 'numeric' | 'vector' | 'complex' | 'matrix' | 'yesno'
 *
 * checkAnswer(userInput, problem) returns:
 *   { correct: boolean, formattedAnswer: string }
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rndNZ(min, max) {
  let n;
  do { n = rnd(min, max); } while (n === 0);
  return n;
}

/** Format a number: integer → no decimals, float → 2 decimal places. */
function fmt(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

/** "3" → "+ 3", "-2" → "- 2" */
function signStr(n) {
  return n >= 0 ? `+ ${Math.abs(n)}` : `- ${Math.abs(n)}`;
}

/** Format a complex number r+i as a readable string. */
function fmtComplex(r, i) {
  if (i === 0)  return `${fmt(r)}`;
  if (r === 0) {
    if (i === 1)  return 'i';
    if (i === -1) return '-i';
    return `${fmt(i)}i`;
  }
  const sign = i > 0 ? '+' : '-';
  const mag  = Math.abs(i);
  const imagStr = mag === 1 ? 'i' : `${fmt(mag)}i`;
  return `${fmt(r)} ${sign} ${imagStr}`;
}

// ── Answer Parsers ────────────────────────────────────────────────────────────

function parseNumeric(s) {
  const n = parseFloat(s.trim());
  return isNaN(n) ? null : n;
}

function parseVector(s) {
  // Accept "(x, y)", "x, y", "x y"
  const nums = s.replace(/[()[\]]/g, '').trim().split(/[\s,]+/).map(Number);
  return nums.length === 2 && !nums.some(isNaN) ? nums : null;
}

function parseComplex(s) {
  // Accept: "3+4i", "3-4i", "3 + 4i", "3", "4i", "-2i", "i", "-i"
  const n = s.replace(/\s+/g, '').toLowerCase();

  // Pure real: "3", "-2.5"
  if (/^-?\d+\.?\d*$/.test(n)) return [parseFloat(n), 0];

  // Pure imaginary: "3i", "-2i", "i", "-i"
  const pi = n.match(/^(-?)(\d*\.?\d*)i$/);
  if (pi) {
    const sg = pi[1] === '-' ? -1 : 1;
    const m  = pi[2] === '' ? 1 : parseFloat(pi[2]);
    return [0, sg * (isNaN(m) ? 1 : m)];
  }

  // Full form: "3+4i", "3-4i"
  const fc = n.match(/^(-?\d+\.?\d*)([+-])(\d*\.?\d*)i$/);
  if (fc) {
    const sg = fc[2] === '+' ? 1 : -1;
    const im = fc[3] === '' ? 1 : parseFloat(fc[3]);
    return [parseFloat(fc[1]), sg * im];
  }

  return null;
}

function parseMatrix(s) {
  // Accept: "1 2; 3 4", "1,2,3,4", "[[1,2],[3,4]]"
  const nums = s.replace(/[\[\]();]/g, ' ').split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
  return nums.length === 4 ? [[nums[0], nums[1]], [nums[2], nums[3]]] : null;
}

// ── Answer Checker ────────────────────────────────────────────────────────────

const TOL = 0.02;

/**
 * Deterministic answer checker.
 * Returns { correct: boolean, formattedAnswer: string }
 * Never throws — returns incorrect on parse failure.
 */
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
      return {
        correct: Math.abs(p[0] - a[0]) < TOL && Math.abs(p[1] - a[1]) < TOL,
        formattedAnswer: answerDisplay,
      };
    }
    case 'complex': {
      const p = parseComplex(s);
      if (!p) return fail;
      return {
        correct: Math.abs(p[0] - a[0]) < TOL && Math.abs(p[1] - a[1]) < TOL,
        formattedAnswer: answerDisplay,
      };
    }
    case 'matrix': {
      const p = parseMatrix(s);
      if (!p) return fail;
      return {
        correct: p.every((row, i) => row.every((v, j) => Math.abs(v - a[i][j]) < TOL)),
        formattedAnswer: answerDisplay,
      };
    }
    case 'yesno': {
      const yn = s.toLowerCase();
      const got = yn === 'yes' || yn === 'y';
      return { correct: got === a, formattedAnswer: a ? 'yes' : 'no' };
    }
    default:
      return fail;
  }
}

// ── Chapter 1: Algebra ────────────────────────────────────────────────────────

function linearEquation(d) {
  const a = rnd(2, d < 2 ? 5 : 9);
  const x = rnd(d < 2 ? 1 : -4, d < 2 ? 9 : 9);
  const b = rnd(d < 2 ? 1 : -9, 9);
  const c = a * x + b;
  return {
    type: 'linear_equation',
    question: `${a}x ${signStr(b)} = ${c}`,
    answer: x,
    answerDisplay: `${x}`,
    answerType: 'numeric',
    difficulty: d,
  };
}

function substitution(d) {
  const x = rnd(d < 2 ? 1 : -4, d < 2 ? 6 : 8);
  const a = rnd(1, 4);
  const b = rnd(1, 9);

  // Pick expression complexity based on difficulty
  const exprIdx = d < 2 ? rnd(0, 1) : rnd(0, 2);
  let question, answer;

  if (exprIdx === 0) {
    // ax + b
    answer   = a * x + b;
    question = `If x = ${x}, find: ${a}x ${signStr(b)}`;
  } else if (exprIdx === 1) {
    // ax² + b
    answer   = a * x * x + b;
    question = `If x = ${x}, find: ${a}x² ${signStr(b)}`;
  } else {
    // x² + ax + b (b can be negative)
    const bSub = rnd(-5, 5);
    answer   = x * x + a * x + bSub;
    question = `If x = ${x}, find: x² + ${a}x ${signStr(bSub)}`;
  }

  return {
    type: 'substitution',
    question,
    answer,
    answerDisplay: `${answer}`,
    answerType: 'numeric',
    difficulty: d,
  };
}

function squareRoot(d) {
  const smallBases  = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  const medBases    = [11, 12, 13, 14, 15];
  const bases       = d < 2 ? smallBases : d < 3 ? [...smallBases, ...medBases] : [...smallBases, ...medBases, rnd(16, 25)];
  const base        = bases[rnd(0, bases.length - 1)];
  const n           = base * base;
  return {
    type: 'square_root',
    question: `√${n} = ?`,
    answer: base,
    answerDisplay: `${base}`,
    answerType: 'numeric',
    difficulty: d,
  };
}

function exponent(d) {
  const base = rnd(2, d < 2 ? 5 : 8);
  const exp  = rnd(2, d < 2 ? 4 : 5);
  const ans  = Math.pow(base, exp);
  return {
    type: 'exponent',
    question: `${base}^${exp} = ?`,
    answer: ans,
    answerDisplay: `${ans}`,
    answerType: 'numeric',
    difficulty: d,
  };
}

// ── Chapter 2: Vectors ────────────────────────────────────────────────────────

function vectorAddition(d) {
  const r  = d < 2 ? 8 : 12;
  const lo = d < 2 ? 1 : -r;
  const [a, b, c, e] = [rnd(lo, r), rnd(lo, r), rnd(lo, r), rnd(lo, r)];
  return {
    type: 'vector_addition',
    question: `(${a}, ${b}) + (${c}, ${e}) = ?`,
    answer: [a + c, b + e],
    answerDisplay: `(${a + c}, ${b + e})`,
    answerType: 'vector',
    difficulty: d,
  };
}

function scalarMultiplication(d) {
  const k    = d < 2 ? rnd(2, 5) : rndNZ(-6, 6);
  const lo   = d < 2 ? 1 : -6;
  const [a, b] = [rnd(lo, 6), rnd(lo, 6)];
  return {
    type: 'scalar_multiplication',
    question: `${k} × (${a}, ${b}) = ?`,
    answer: [k * a, k * b],
    answerDisplay: `(${k * a}, ${k * b})`,
    answerType: 'vector',
    difficulty: d,
  };
}

function vectorMagnitude(d) {
  // Use Pythagorean triples at d=1 for clean integer answers
  const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 6, 10], [4, 3, 5]];
  let a, b, mag;
  if (d < 2) {
    [a, b, mag] = triples[rnd(0, triples.length - 1)];
  } else {
    a   = rnd(1, 8);
    b   = rnd(1, 8);
    mag = Math.round(Math.sqrt(a * a + b * b) * 100) / 100;
  }
  return {
    type: 'vector_magnitude',
    question: `|(${a}, ${b})| = ?`,
    answer: mag,
    answerDisplay: `${mag}`,
    answerType: 'numeric',
    difficulty: d,
  };
}

// ── Chapter 3: Unit Vectors ───────────────────────────────────────────────────

function normalizeVector(d) {
  const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [4, 3, 5], [12, 5, 13]];
  let a, b, magVal;
  if (d < 2) {
    const [ta, tb, tm] = triples[rnd(0, triples.length - 1)];
    [a, b, magVal] = [ta, tb, tm];
  } else {
    a      = rndNZ(1, 6);
    b      = rndNZ(1, 6);
    magVal = Math.sqrt(a * a + b * b);
  }
  const n1 = Math.round((a / magVal) * 100) / 100;
  const n2 = Math.round((b / magVal) * 100) / 100;
  return {
    type: 'normalize_vector',
    question: `Normalize (${a}, ${b}):`,
    answer: [n1, n2],
    answerDisplay: `(${n1}, ${n2})`,
    answerType: 'vector',
    difficulty: d,
  };
}

function unitVectorCheck(d) {
  const isUnit = Math.random() > 0.5;
  let a, b;
  if (isUnit) {
    const units = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    [a, b] = units[rnd(0, units.length - 1)];
  } else {
    // Non-unit: magnitude clearly > 1
    a = rnd(2, 6);
    b = rnd(1, 5);
  }
  return {
    type: 'unit_vector_check',
    question: `Is (${a}, ${b}) a unit vector? (yes or no)`,
    answer: isUnit,
    answerDisplay: isUnit ? 'yes' : 'no',
    answerType: 'yesno',
    difficulty: d,
  };
}

function probabilityFromComponents(d) {
  // Use exact Pythagorean triples so probabilities come out clean
  const triples = [[3, 4, 5], [5, 12, 13], [4, 3, 5], [6, 8, 10]];
  const [ta, tb, tm] = triples[rnd(0, triples.length - 1)];
  const alpha = (ta / tm).toFixed(2);
  const beta  = (tb / tm).toFixed(2);
  const prob  = Math.round((ta / tm) ** 2 * 100) / 100;
  return {
    type: 'probability_from_components',
    question: `|ψ⟩ = ${alpha}|0⟩ + ${beta}|1⟩\nP(measure |0⟩) = ?`,
    answer: prob,
    answerDisplay: `${prob}`,
    answerType: 'numeric',
    difficulty: d,
  };
}

// ── Chapter 4: Complex Numbers ────────────────────────────────────────────────

function complexAddition(d) {
  const r  = d < 2 ? 6 : 8;
  const lo = d < 2 ? 1 : -r;
  const [a, b, c, e] = [rnd(lo, r), rnd(lo, r), rnd(lo, r), rnd(lo, r)];
  return {
    type: 'complex_addition',
    question: `(${fmtComplex(a, b)}) + (${fmtComplex(c, e)}) = ?`,
    answer: [a + c, b + e],
    answerDisplay: fmtComplex(a + c, b + e),
    answerType: 'complex',
    difficulty: d,
  };
}

function complexMultiplication(d) {
  const r = d < 2 ? 4 : 6;
  const a = rnd(1, r);
  const b = rndNZ(-r, r);
  const c = rnd(1, r);
  const e = rndNZ(-r, r);
  // (a+bi)(c+ei) = (ac - be) + (ae + bc)i
  const re = a * c - b * e;
  const im = a * e + b * c;
  return {
    type: 'complex_multiplication',
    question: `(${fmtComplex(a, b)}) × (${fmtComplex(c, e)}) = ?`,
    answer: [re, im],
    answerDisplay: fmtComplex(re, im),
    answerType: 'complex',
    difficulty: d,
  };
}

function complexConjugate(d) {
  const a = rnd(-6, 6);
  const b = rndNZ(-6, 6);
  return {
    type: 'complex_conjugate',
    question: `Conjugate of ${fmtComplex(a, b)} = ?`,
    answer: [a, -b],
    answerDisplay: fmtComplex(a, -b),
    answerType: 'complex',
    difficulty: d,
  };
}

function complexMagnitude(d) {
  const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [4, 3, 5], [8, 6, 10]];
  const [ta, tb, tm] = triples[rnd(0, triples.length - 1)];
  // Optionally negate components at higher difficulty (doesn't change magnitude)
  const a = d > 1 && Math.random() > 0.5 ? -ta : ta;
  const b = d > 1 && Math.random() > 0.5 ? -tb : tb;
  return {
    type: 'complex_magnitude',
    question: `|${fmtComplex(a, b)}| = ?`,
    answer: tm,
    answerDisplay: `${tm}`,
    answerType: 'numeric',
    difficulty: d,
  };
}

// ── Chapter 5: Matrices ───────────────────────────────────────────────────────

function matrixVectorMultiply(d) {
  const r  = d < 2 ? 3 : 5;
  const lo = d < 2 ? 0 : -r;
  const [a, b, c, e] = [rnd(lo, r), rnd(lo, r), rnd(lo, r), rnd(lo, r)];
  const [x, y]       = [rnd(d < 2 ? 1 : -r, r), rnd(d < 2 ? 1 : -r, r)];
  const r1 = a * x + b * y;
  const r2 = c * x + e * y;
  return {
    type: 'matrix_vector_multiply',
    question: `[[${a},${b}],[${c},${e}]] × (${x},${y}) = ?`,
    answer: [r1, r2],
    answerDisplay: `(${r1}, ${r2})`,
    answerType: 'vector',
    difficulty: d,
  };
}

function matrixMatrixMultiply(d) {
  const r  = d < 2 ? 3 : 4;
  const lo = d < 2 ? 0 : -r;
  const [a, b, c, e] = [rnd(lo, r), rnd(lo, r), rnd(lo, r), rnd(lo, r)];
  const [f, g, h, k] = [rnd(lo, r), rnd(lo, r), rnd(lo, r), rnd(lo, r)];
  // [[a,b],[c,e]] × [[f,g],[h,k]]
  const r11 = a * f + b * h;
  const r12 = a * g + b * k;
  const r21 = c * f + e * h;
  const r22 = c * g + e * k;
  return {
    type: 'matrix_matrix_multiply',
    question: `[[${a},${b}],[${c},${e}]] × [[${f},${g}],[${h},${k}]] = ?\n(format: a b; c d)`,
    answer: [[r11, r12], [r21, r22]],
    answerDisplay: `${r11} ${r12}; ${r21} ${r22}`,
    answerType: 'matrix',
    difficulty: d,
  };
}

function identityMatrix(d) {
  if (Math.random() > 0.5) {
    // "What is the 2×2 identity matrix?"
    return {
      type: 'identity_matrix',
      question: 'What is the 2×2 identity matrix?\n(format: a b; c d)',
      answer: [[1, 0], [0, 1]],
      answerDisplay: '1 0; 0 1',
      answerType: 'matrix',
      difficulty: d,
    };
  }
  // "A × I = ?"
  const [a, b, c, e] = [rnd(1, 5), rnd(0, 4), rnd(0, 4), rnd(1, 5)];
  return {
    type: 'identity_matrix',
    question: `[[${a},${b}],[${c},${e}]] × I = ?\n(format: a b; c d)`,
    answer: [[a, b], [c, e]],
    answerDisplay: `${a} ${b}; ${c} ${e}`,
    answerType: 'matrix',
    difficulty: d,
  };
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

const GENS = {
  linear_equation:           linearEquation,
  substitution:              substitution,
  square_root:               squareRoot,
  exponent:                  exponent,
  vector_addition:           vectorAddition,
  scalar_multiplication:     scalarMultiplication,
  vector_magnitude:          vectorMagnitude,
  normalize_vector:          normalizeVector,
  unit_vector_check:         unitVectorCheck,
  probability_from_components: probabilityFromComponents,
  complex_addition:          complexAddition,
  complex_multiplication:    complexMultiplication,
  complex_conjugate:         complexConjugate,
  complex_magnitude:         complexMagnitude,
  matrix_vector_multiply:    matrixVectorMultiply,
  matrix_matrix_multiply:    matrixMatrixMultiply,
  identity_matrix:           identityMatrix,
};

export function generateProblem(chapterId, type, difficulty = 1) {
  const gen = GENS[type];
  if (!gen) throw new Error(`Unknown problem type: ${type}`);
  return { ...gen(difficulty), chapterId };
}

export function generateRandomProblem(chapter, difficulty = 1) {
  const types = chapter.problemTypes;
  const type  = types[Math.floor(Math.random() * types.length)];
  return generateProblem(chapter.id, type, difficulty);
}
