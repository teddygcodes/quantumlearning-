/**
 * problems.js — Problem generation engine + deterministic answer checker.
 *
 * Each generator returns:
 *   { type, question, answer, answerDisplay, answerType, difficulty, steps }
 *
 * steps: string[] — worked solution shown when student answers incorrectly in practice.
 *
 * answerType values: 'numeric' | 'vector' | 'complex' | 'matrix' | 'yesno'
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
    steps: [
      `Start: ${a}x ${signStr(b)} = ${c}`,
      `Subtract ${b >= 0 ? b : `(${b})`} from both sides: ${a}x = ${c} − ${b} = ${c - b}`,
      `Divide both sides by ${a}: x = ${c - b} ÷ ${a} = ${x}`,
      `Check: ${a}(${x}) ${signStr(b)} = ${a * x} ${signStr(b)} = ${c} ✓`,
    ],
  };
}

function substitution(d) {
  const x      = rnd(d < 2 ? 1 : -4, d < 2 ? 6 : 8);
  const a      = rnd(1, 4);
  const b      = rnd(1, 9);
  const exprIdx = d < 2 ? rnd(0, 1) : rnd(0, 2);
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

function squareRoot(d) {
  const smallBases = [2,3,4,5,6,7,8,9,10];
  const medBases   = [11,12,13,14,15];
  const bases      = d < 2 ? smallBases : d < 3 ? [...smallBases,...medBases] : [...smallBases,...medBases,rnd(16,25)];
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

function exponent(d) {
  const base = rnd(2, d < 2 ? 5 : 8);
  const exp  = rnd(2, d < 2 ? 4 : 5);
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

function vectorAddition(d) {
  const r  = d < 2 ? 8 : 12;
  const lo = d < 2 ? 1 : -r;
  const [a, b, c, e] = [rnd(lo,r), rnd(lo,r), rnd(lo,r), rnd(lo,r)];
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

function scalarMultiplication(d) {
  const k      = d < 2 ? rnd(2,5) : rndNZ(-6,6);
  const lo     = d < 2 ? 1 : -6;
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

function vectorMagnitude(d) {
  const triples = [[3,4,5],[5,12,13],[6,8,10],[8,6,10],[4,3,5]];
  let a, b, mag;
  if (d < 2) {
    [a, b, mag] = triples[rnd(0, triples.length-1)];
  } else {
    a   = rnd(1, 8);
    b   = rnd(1, 8);
    mag = Math.round(Math.sqrt(a*a + b*b) * 100) / 100;
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

function normalizeVector(d) {
  const triples = [[3,4,5],[5,12,13],[6,8,10],[4,3,5],[12,5,13]];
  let a, b, magVal;
  if (d < 2) {
    const [ta,tb,tm] = triples[rnd(0, triples.length-1)];
    [a, b, magVal]   = [ta, tb, tm];
  } else {
    a      = rndNZ(1,6);
    b      = rndNZ(1,6);
    magVal = Math.sqrt(a*a + b*b);
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

function unitVectorCheck(d) {
  const isUnit = Math.random() > 0.5;
  let a, b;
  if (isUnit) {
    const units = [[1,0],[0,1],[-1,0],[0,-1]];
    [a, b] = units[rnd(0, units.length-1)];
  } else {
    a = rnd(2,6);
    b = rnd(1,5);
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

function probabilityFromComponents(d) {
  const triples = [[3,4,5],[5,12,13],[4,3,5],[6,8,10]];
  const [ta,tb,tm] = triples[rnd(0, triples.length-1)];
  const alpha = (ta/tm).toFixed(2);
  const beta  = (tb/tm).toFixed(2);
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

function complexAddition(d) {
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

function complexMultiplication(d) {
  const r = d < 2 ? 4 : 6;
  const a = rnd(1,r), b = rndNZ(-r,r), c = rnd(1,r), e = rndNZ(-r,r);
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

function complexConjugate(d) {
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

function complexMagnitude(d) {
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

// ── Chapter 5: Matrices ───────────────────────────────────────────────────────

function matrixVectorMultiply(d) {
  const r  = d < 2 ? 3 : 5;
  const lo = d < 2 ? 0 : -r;
  const [a,b,c,e] = [rnd(lo,r), rnd(lo,r), rnd(lo,r), rnd(lo,r)];
  const [x,y]     = [rnd(d<2?1:-r, r), rnd(d<2?1:-r, r)];
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

function matrixMatrixMultiply(d) {
  const r  = d < 2 ? 3 : 4;
  const lo = d < 2 ? 0 : -r;
  const [a,b,c,e] = [rnd(lo,r), rnd(lo,r), rnd(lo,r), rnd(lo,r)];
  const [f,g,h,k] = [rnd(lo,r), rnd(lo,r), rnd(lo,r), rnd(lo,r)];
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

function identityMatrix(d) {
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
};

export function generateProblem(chapterId, type, difficulty = 1) {
  const gen = GENS[type];
  if (!gen) throw new Error(`Unknown problem type: ${type}`);
  return { ...gen(difficulty), chapterId };
}

export function generateRandomProblem(chapter, difficulty = 1) {
  const type = chapter.problemTypes[Math.floor(Math.random() * chapter.problemTypes.length)];
  return generateProblem(chapter.id, type, difficulty);
}
