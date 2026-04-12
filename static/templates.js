/**
 * templates.js — Dynamic teaching unit templates.
 *
 * Each template generates a complete teaching unit (teaching text + worked
 * example + practice problem) for a given difficulty/variation. The worked
 * example and practice problem are structurally identical but use different
 * numbers, so the student always sees a relevant example.
 *
 * tryIt fields match the checkAnswer interface in problems.js:
 *   { question, answer, answerType, answerDisplay, steps, whyItMatters }
 * answer shapes: numeric→number, vector→[x,y], vector4→[a,b,c,d],
 *   complex→[re,im], matrix→[[a,b],[c,d]], yesno→boolean
 */

// ── Utilities ────────────────────────────────────────────────────────────────

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randIntNZ(min, max) {
  let n;
  do { n = randInt(min, max); } while (n === 0);
  return n;
}

/** Format sign for display: 5 → "+ 5", -3 → "− 3" */
function fmtSign(n) {
  return n >= 0 ? `+ ${n}` : `− ${Math.abs(n)}`;
}

/** Format imaginary part for display: 5 → "+ 5i", -3 → "− 3i", 0 → "" */
function fmtIm(n) {
  if (n === 0) return '+ 0i';
  if (n === 1) return '+ i';
  if (n === -1) return '− i';
  return n > 0 ? `+ ${n}i` : `− ${Math.abs(n)}i`;
}

/** Format complex number: [3, -2] → "3 − 2i" */
function fmtComplex(re, im) {
  if (im === 0) return `${re}`;
  if (re === 0) {
    if (im === 1) return 'i';
    if (im === -1) return '−i';
    return `${im}i`;
  }
  return `${re} ${fmtIm(im)}`;
}

/** Format vector: [3, 4] → "(3, 4)" */
function fmtVec(arr) {
  return `(${arr.join(', ')})`;
}

/** Format a 4-vector for display */
function fmtVec4(arr) { return `(${arr.join(', ')})`; }

/** Round to 2 decimal places */
function r2(n) { return Math.round(n * 100) / 100; }

/** Format number: integer as-is, decimal to 2 places */
function fmt(n) { return Number.isInteger(n) ? String(n) : n.toFixed(2); }

// ── Templates ────────────────────────────────────────────────────────────────

export const TEMPLATES = {
// ── Chapter 1: Algebra ────────────────────────────────────────────────────────

linear_equation: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'basic': {
        const wa = randInt(2, 5), wx = randInt(1, 9), wb = randInt(1, 9);
        const wc = wa * wx + wb;
        let pa, px, pb;
        do {
          pa = randInt(2, 5); px = randInt(1, 9); pb = randInt(1, 9);
        } while (pa === wa && px === wx && pb === wb);
        const pc = pa * px + pb;
        return {
          teachingText:
            `To solve an equation like ax + b = c, you need to isolate x. ` +
            `Think of it as "undoing" what was done to x — first undo the addition ` +
            `(subtract b from both sides), then undo the multiplication (divide both ` +
            `sides by a). Whatever you do to one side, you must do to the other.`,
          workedExample: {
            problem: `${wa}x ${fmtSign(wb)} = ${wc}`,
            steps: [
              `Start: ${wa}x ${fmtSign(wb)} = ${wc}`,
              `Subtract ${wb} from both sides: ${wa}x = ${wc} − ${wb} = ${wc - wb}`,
              `Divide both sides by ${wa}: x = ${wc - wb} ÷ ${wa} = ${wx}`,
              `Check: ${wa}(${wx}) ${fmtSign(wb)} = ${wa * wx} ${fmtSign(wb)} = ${wc} ✓`,
            ],
            insight: `Isolate x by reversing operations — subtract first, then divide.`,
          },
          tryIt: {
            question: `${pa}x ${fmtSign(pb)} = ${pc}`,
            answer: px,
            answerType: 'numeric',
            answerDisplay: `${px}`,
            steps: [
              `Subtract ${pb} from both sides: ${pa}x = ${pc} − ${pb} = ${pc - pb}`,
              `Divide both sides by ${pa}: x = ${pc - pb} ÷ ${pa} = ${px}`,
              `Check: ${pa}(${px}) ${fmtSign(pb)} = ${pa * px} ${fmtSign(pb)} = ${pc} ✓`,
            ],
            whyItMatters:
              `Solving for unknowns is the foundation of all physics and engineering. ` +
              `In quantum computing, you'll solve for amplitudes, phases, and probabilities ` +
              `using exactly these algebraic moves.`,
          },
        };
      }

      case 'with_negatives': {
        const wa = randInt(2, 5), wx = randInt(1, 9), wb = -randInt(1, 9);
        const wc = wa * wx + wb;
        let pa, px, pb;
        do {
          pa = randInt(2, 5); px = randInt(1, 9); pb = -randInt(1, 9);
        } while (pa === wa && px === wx && pb === wb);
        const pc = pa * px + pb;
        return {
          teachingText:
            `When the equation has negative numbers, the process is the same — ` +
            `isolate x by undoing operations. The only twist: subtracting a negative ` +
            `is the same as adding. For example, subtracting −3 from both sides means ` +
            `adding 3 to both sides.`,
          workedExample: {
            problem: `${wa}x ${fmtSign(wb)} = ${wc}`,
            steps: [
              `Start: ${wa}x ${fmtSign(wb)} = ${wc}`,
              `Subtract (${wb}) from both sides: ${wa}x = ${wc} − (${wb}) = ${wc - wb}`,
              `Divide both sides by ${wa}: x = ${wc - wb} ÷ ${wa} = ${wx}`,
              `Check: ${wa}(${wx}) ${fmtSign(wb)} = ${wa * wx} ${fmtSign(wb)} = ${wc} ✓`,
            ],
            insight: `Subtracting a negative is the same as adding — watch your signs carefully.`,
          },
          tryIt: {
            question: `${pa}x ${fmtSign(pb)} = ${pc}`,
            answer: px,
            answerType: 'numeric',
            answerDisplay: `${px}`,
            steps: [
              `Subtract (${pb}) from both sides: ${pa}x = ${pc} − (${pb}) = ${pc - pb}`,
              `Divide both sides by ${pa}: x = ${pc - pb} ÷ ${pa} = ${px}`,
              `Check: ${pa}(${px}) ${fmtSign(pb)} = ${pa * px} ${fmtSign(pb)} = ${pc} ✓`,
            ],
            whyItMatters:
              `Negative numbers appear everywhere in quantum mechanics — negative ` +
              `amplitudes, negative phases. Being comfortable with sign manipulation ` +
              `is essential.`,
          },
        };
      }

      case 'larger_values': {
        const wa = randInt(2, 9), wx = randInt(1, 9), wb = randIntNZ(-9, 9);
        const wc = wa * wx + wb;
        let pa, px, pb;
        do {
          pa = randInt(2, 9); px = randInt(1, 9); pb = randIntNZ(-9, 9);
        } while (pa === wa && px === wx && pb === wb);
        const pc = pa * px + pb;
        return {
          teachingText:
            `Bigger coefficients don't change the method — the steps are identical. ` +
            `Subtract, then divide. The numbers get larger but the logic stays the same. ` +
            `Focus on the process: isolate the term with x, then isolate x itself.`,
          workedExample: {
            problem: `${wa}x ${fmtSign(wb)} = ${wc}`,
            steps: [
              `Start: ${wa}x ${fmtSign(wb)} = ${wc}`,
              `Subtract ${wb >= 0 ? wb : `(${wb})`} from both sides: ${wa}x = ${wc - wb}`,
              `Divide both sides by ${wa}: x = ${wc - wb} ÷ ${wa} = ${wx}`,
              `Check: ${wa}(${wx}) ${fmtSign(wb)} = ${wc} ✓`,
            ],
            insight: `Larger numbers, same method. Stay organized and the answer falls out.`,
          },
          tryIt: {
            question: `${pa}x ${fmtSign(pb)} = ${pc}`,
            answer: px,
            answerType: 'numeric',
            answerDisplay: `${px}`,
            steps: [
              `Subtract ${pb >= 0 ? pb : `(${pb})`} from both sides: ${pa}x = ${pc - pb}`,
              `Divide both sides by ${pa}: x = ${pc - pb} ÷ ${pa} = ${px}`,
              `Check: ${pa}(${px}) ${fmtSign(pb)} = ${pc} ✓`,
            ],
            whyItMatters:
              `Real quantum computations involve large matrices and many terms. ` +
              `Fluency with bigger numbers builds the confidence you need when the ` +
              `algebra scales up.`,
          },
        };
      }

      case 'negative_solution': {
        const wa = randInt(2, 5), wx = -randInt(1, 8), wb = randIntNZ(1, 9);
        const wc = wa * wx + wb;
        let pa, px, pb;
        do {
          pa = randInt(2, 5); px = -randInt(1, 8); pb = randIntNZ(1, 9);
        } while (pa === wa && px === wx && pb === wb);
        const pc = pa * px + pb;
        return {
          teachingText:
            `Sometimes x turns out to be negative — and that's perfectly fine. ` +
            `The method is the same: subtract, then divide. If the result is negative, ` +
            `that's the answer. Don't second-guess a negative solution — just verify ` +
            `by plugging it back in.`,
          workedExample: {
            problem: `${wa}x ${fmtSign(wb)} = ${wc}`,
            steps: [
              `Start: ${wa}x ${fmtSign(wb)} = ${wc}`,
              `Subtract ${wb} from both sides: ${wa}x = ${wc} − ${wb} = ${wc - wb}`,
              `Divide both sides by ${wa}: x = ${wc - wb} ÷ ${wa} = ${wx}`,
              `Check: ${wa}(${wx}) ${fmtSign(wb)} = ${wa * wx} ${fmtSign(wb)} = ${wc} ✓`,
            ],
            insight: `A negative answer is still a valid answer — always verify by substituting back.`,
          },
          tryIt: {
            question: `${pa}x ${fmtSign(pb)} = ${pc}`,
            answer: px,
            answerType: 'numeric',
            answerDisplay: `${px}`,
            steps: [
              `Subtract ${pb} from both sides: ${pa}x = ${pc} − ${pb} = ${pc - pb}`,
              `Divide both sides by ${pa}: x = ${pc - pb} ÷ ${pa} = ${px}`,
              `Check: ${pa}(${px}) ${fmtSign(pb)} = ${pc} ✓`,
            ],
            whyItMatters:
              `Quantum amplitudes are often negative. The minus sign in a state ` +
              `like |ψ⟩ = |0⟩ − |1⟩ is physically meaningful — it causes destructive ` +
              `interference. Comfort with negative solutions starts here.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

substitution: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'basic': {
        const wx = randInt(1, 6), wa = randInt(1, 4), wb = randInt(1, 9);
        const wans = wa * wx + wb;
        let px, pa, pb;
        do {
          px = randInt(1, 6); pa = randInt(1, 4); pb = randInt(1, 9);
        } while (px === wx && pa === wa && pb === wb);
        const pans = pa * px + pb;
        return {
          teachingText:
            `Substitution means replacing a variable with its value, then simplifying. ` +
            `If x = 3 and the expression is 2x + 5, replace every x with 3: ` +
            `2(3) + 5 = 6 + 5 = 11. Follow the order of operations: multiply first, ` +
            `then add.`,
          workedExample: {
            problem: `If x = ${wx}, find: ${wa}x ${fmtSign(wb)}`,
            steps: [
              `Substitute x = ${wx}: ${wa}(${wx}) ${fmtSign(wb)}`,
              `Multiply: ${wa} × ${wx} = ${wa * wx}`,
              `Add: ${wa * wx} ${fmtSign(wb)} = ${wans}`,
            ],
            insight: `Replace, multiply, then add — follow the order of operations.`,
          },
          tryIt: {
            question: `If x = ${px}, find: ${pa}x ${fmtSign(pb)}`,
            answer: pans,
            answerType: 'numeric',
            answerDisplay: `${pans}`,
            steps: [
              `Substitute x = ${px}: ${pa}(${px}) ${fmtSign(pb)}`,
              `Multiply: ${pa} × ${px} = ${pa * px}`,
              `Add: ${pa * px} ${fmtSign(pb)} = ${pans}`,
            ],
            whyItMatters:
              `Substitution is how you evaluate quantum circuits step by step — ` +
              `you plug the output of one gate into the input of the next. ` +
              `It's the most fundamental operation in computation.`,
          },
        };
      }

      case 'with_negatives': {
        const wx = -randInt(1, 6), wa = randInt(1, 4), wb = randInt(1, 9);
        const wans = wa * wx + wb;
        let px, pa, pb;
        do {
          px = -randInt(1, 6); pa = randInt(1, 4); pb = randInt(1, 9);
        } while (px === wx && pa === wa && pb === wb);
        const pans = pa * px + pb;
        return {
          teachingText:
            `When x is negative, be careful with multiplication signs. ` +
            `A positive times a negative gives a negative: 3 × (−2) = −6. ` +
            `Then continue with addition as normal. Parentheses around the ` +
            `negative value help keep track.`,
          workedExample: {
            problem: `If x = ${wx}, find: ${wa}x ${fmtSign(wb)}`,
            steps: [
              `Substitute x = ${wx}: ${wa}(${wx}) ${fmtSign(wb)}`,
              `Multiply: ${wa} × (${wx}) = ${wa * wx}`,
              `Add: ${wa * wx} ${fmtSign(wb)} = ${wans}`,
            ],
            insight: `Positive × negative = negative. Use parentheses to avoid sign errors.`,
          },
          tryIt: {
            question: `If x = ${px}, find: ${pa}x ${fmtSign(pb)}`,
            answer: pans,
            answerType: 'numeric',
            answerDisplay: `${pans}`,
            steps: [
              `Substitute x = ${px}: ${pa}(${px}) ${fmtSign(pb)}`,
              `Multiply: ${pa} × (${px}) = ${pa * px}`,
              `Add: ${pa * px} ${fmtSign(pb)} = ${pans}`,
            ],
            whyItMatters:
              `Quantum gates frequently introduce negative signs. The Z gate, ` +
              `for example, flips the sign of the |1⟩ amplitude. You need to ` +
              `evaluate expressions with negatives confidently.`,
          },
        };
      }

      case 'quadratic': {
        const wx = randInt(1, 6), wa = randInt(1, 4), wb = randInt(1, 9);
        const wans = wa * wx * wx + wb;
        let px, pa, pb;
        do {
          px = randInt(1, 6); pa = randInt(1, 4); pb = randInt(1, 9);
        } while (px === wx && pa === wa && pb === wb);
        const pans = pa * px * px + pb;
        return {
          teachingText:
            `With x² in the expression, you need to square x first (order of operations: ` +
            `exponents before multiplication). If x = 3 and the expression is 2x² + 1, ` +
            `compute 3² = 9 first, then 2 × 9 = 18, then 18 + 1 = 19.`,
          workedExample: {
            problem: `If x = ${wx}, find: ${wa}x² ${fmtSign(wb)}`,
            steps: [
              `Substitute x = ${wx}: ${wa}(${wx})² ${fmtSign(wb)}`,
              `Square first: ${wx}² = ${wx * wx}`,
              `Multiply: ${wa} × ${wx * wx} = ${wa * wx * wx}`,
              `Add: ${wa * wx * wx} ${fmtSign(wb)} = ${wans}`,
            ],
            insight: `Always handle exponents before multiplication — order of operations matters.`,
          },
          tryIt: {
            question: `If x = ${px}, find: ${pa}x² ${fmtSign(pb)}`,
            answer: pans,
            answerType: 'numeric',
            answerDisplay: `${pans}`,
            steps: [
              `Substitute x = ${px}: ${pa}(${px})² ${fmtSign(pb)}`,
              `Square first: ${px}² = ${px * px}`,
              `Multiply: ${pa} × ${px * px} = ${pa * px * px}`,
              `Add: ${pa * px * px} ${fmtSign(pb)} = ${pans}`,
            ],
            whyItMatters:
              `Squaring amplitudes is how you get probabilities in quantum mechanics. ` +
              `The Born rule says P = |α|², so evaluating squared expressions is ` +
              `directly connected to measurement outcomes.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

square_root: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'basic': {
        const wbase = randInt(2, 10);
        const wn = wbase * wbase;
        let pbase;
        do { pbase = randInt(2, 10); } while (pbase === wbase);
        const pn = pbase * pbase;
        return {
          teachingText:
            `A square root asks: "What number multiplied by itself gives N?" ` +
            `For example, √25 = 5 because 5 × 5 = 25. Perfect squares are ` +
            `numbers like 4, 9, 16, 25, 36 — each is some integer times itself. ` +
            `Memorizing the first dozen or so makes this fast.`,
          workedExample: {
            problem: `√${wn} = ?`,
            steps: [
              `We need a number that, multiplied by itself, gives ${wn}.`,
              `${wbase} × ${wbase} = ${wn}`,
              `Therefore √${wn} = ${wbase}`,
            ],
            insight: `√N asks "what times itself equals N?" — just find the factor.`,
          },
          tryIt: {
            question: `√${pn} = ?`,
            answer: pbase,
            answerType: 'numeric',
            answerDisplay: `${pbase}`,
            steps: [
              `We need a number that, multiplied by itself, gives ${pn}.`,
              `${pbase} × ${pbase} = ${pn}`,
              `Therefore √${pn} = ${pbase}`,
            ],
            whyItMatters:
              `Square roots appear constantly in quantum computing — normalizing ` +
              `state vectors requires dividing by √(sum of squares). The state ` +
              `1/√2 (|0⟩ + |1⟩) is the most common qubit state.`,
          },
        };
      }

      case 'larger': {
        const wbase = randInt(11, 15);
        const wn = wbase * wbase;
        let pbase;
        do { pbase = randInt(11, 15); } while (pbase === wbase);
        const pn = pbase * pbase;
        return {
          teachingText:
            `Larger perfect squares follow the same logic — you just need to ` +
            `know (or figure out) squares beyond 10. Here are some to remember: ` +
            `11² = 121, 12² = 144, 13² = 169, 14² = 196, 15² = 225. ` +
            `With practice, you'll recognize these instantly.`,
          workedExample: {
            problem: `√${wn} = ?`,
            steps: [
              `We need a number that, multiplied by itself, gives ${wn}.`,
              `${wbase} × ${wbase} = ${wn}`,
              `Therefore √${wn} = ${wbase}`,
            ],
            insight: `Knowing squares up to 15 makes many quantum calculations faster.`,
          },
          tryIt: {
            question: `√${pn} = ?`,
            answer: pbase,
            answerType: 'numeric',
            answerDisplay: `${pbase}`,
            steps: [
              `We need a number that, multiplied by itself, gives ${pn}.`,
              `${pbase} × ${pbase} = ${pn}`,
              `Therefore √${pn} = ${pbase}`,
            ],
            whyItMatters:
              `In quantum error correction and multi-qubit systems, normalization ` +
              `constants involve larger square roots. Being fluent with them ` +
              `keeps you from getting bogged down.`,
          },
        };
      }

      case 'perfect_square_check': {
        const wbase = randInt(11, 20);
        const wn = wbase * wbase;
        let pbase;
        do { pbase = randInt(11, 20); } while (pbase === wbase);
        const pn = pbase * pbase;
        return {
          teachingText:
            `A perfect square is a number whose square root is a whole number. ` +
            `144 is a perfect square (√144 = 12), but 150 is not. To check, ` +
            `try integers near where you think the root is. If none work exactly, ` +
            `it's not a perfect square. For this problem, the answer is always ` +
            `a perfect square — find the integer root.`,
          workedExample: {
            problem: `√${wn} = ?`,
            steps: [
              `We need a number that, multiplied by itself, gives ${wn}.`,
              `Try ${wbase}: ${wbase} × ${wbase} = ${wn} ✓`,
              `Therefore √${wn} = ${wbase}`,
            ],
            insight: `Recognizing perfect squares quickly is a useful mental math skill.`,
          },
          tryIt: {
            question: `√${pn} = ?`,
            answer: pbase,
            answerType: 'numeric',
            answerDisplay: `${pbase}`,
            steps: [
              `We need a number that, multiplied by itself, gives ${pn}.`,
              `Try ${pbase}: ${pbase} × ${pbase} = ${pn} ✓`,
              `Therefore √${pn} = ${pbase}`,
            ],
            whyItMatters:
              `Quantum state normalization requires recognizing when sums of ` +
              `squares yield perfect squares, giving clean probabilities instead ` +
              `of messy decimals.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

exponent: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'basic': {
        const wbase = randInt(2, 5), wexp = randInt(2, 4);
        const wans = Math.pow(wbase, wexp);
        const wexpansion = Array.from({length: wexp}, () => wbase).join(' × ');
        let pbase, pexp;
        do {
          pbase = randInt(2, 5); pexp = randInt(2, 4);
        } while (pbase === wbase && pexp === wexp);
        const pans = Math.pow(pbase, pexp);
        const pexpansion = Array.from({length: pexp}, () => pbase).join(' × ');
        return {
          teachingText:
            `Exponents are repeated multiplication. 3⁴ means 3 × 3 × 3 × 3. ` +
            `The base (3) tells you what to multiply, and the exponent (4) ` +
            `tells you how many times. Start from the left and multiply step ` +
            `by step: 3 × 3 = 9, then 9 × 3 = 27, then 27 × 3 = 81.`,
          workedExample: {
            problem: `${wbase}^${wexp} = ?`,
            steps: [
              `${wbase}^${wexp} means multiply ${wbase} by itself ${wexp} times.`,
              `${wexpansion} = ${wans}`,
            ],
            insight: `Exponents are just repeated multiplication — count the factors carefully.`,
          },
          tryIt: {
            question: `${pbase}^${pexp} = ?`,
            answer: pans,
            answerType: 'numeric',
            answerDisplay: `${pans}`,
            steps: [
              `${pbase}^${pexp} means multiply ${pbase} by itself ${pexp} times.`,
              `${pexpansion} = ${pans}`,
            ],
            whyItMatters:
              `Quantum systems with N qubits have 2^N possible states. Exponents ` +
              `tell you how fast quantum systems scale — this exponential growth ` +
              `is why quantum computers are powerful.`,
          },
        };
      }

      case 'larger_base': {
        const wbase = randInt(2, 8), wexp = randInt(2, 3);
        const wans = Math.pow(wbase, wexp);
        const wexpansion = Array.from({length: wexp}, () => wbase).join(' × ');
        let pbase, pexp;
        do {
          pbase = randInt(2, 8); pexp = randInt(2, 3);
        } while (pbase === wbase && pexp === wexp);
        const pans = Math.pow(pbase, pexp);
        const pexpansion = Array.from({length: pexp}, () => pbase).join(' × ');
        return {
          teachingText:
            `With larger bases, the numbers grow quickly but the method is the same. ` +
            `7² = 7 × 7 = 49. 8³ = 8 × 8 × 8 = 512. Take it one multiplication ` +
            `at a time and you won't make errors.`,
          workedExample: {
            problem: `${wbase}^${wexp} = ?`,
            steps: [
              `${wbase}^${wexp} means multiply ${wbase} by itself ${wexp} times.`,
              `${wexpansion} = ${wans}`,
            ],
            insight: `Larger bases, same process — just bigger intermediate products.`,
          },
          tryIt: {
            question: `${pbase}^${pexp} = ?`,
            answer: pans,
            answerType: 'numeric',
            answerDisplay: `${pans}`,
            steps: [
              `${pbase}^${pexp} means multiply ${pbase} by itself ${pexp} times.`,
              `${pexpansion} = ${pans}`,
            ],
            whyItMatters:
              `Gate matrices are often powers of simpler matrices. Understanding ` +
              `exponents with larger numbers prepares you for matrix exponentiation ` +
              `in quantum gate design.`,
          },
        };
      }

      case 'higher_power': {
        const wbase = randInt(2, 5), wexp = randInt(3, 5);
        const wans = Math.pow(wbase, wexp);
        const wexpansion = Array.from({length: wexp}, () => wbase).join(' × ');
        let pbase, pexp;
        do {
          pbase = randInt(2, 5); pexp = randInt(3, 5);
        } while (pbase === wbase && pexp === wexp);
        const pans = Math.pow(pbase, pexp);
        const pexpansion = Array.from({length: pexp}, () => pbase).join(' × ');
        return {
          teachingText:
            `Higher exponents mean more multiplications. 2⁵ = 2×2×2×2×2 = 32. ` +
            `A useful trick: break it into smaller pieces. 2⁵ = 2³ × 2² = 8 × 4 = 32. ` +
            `This "divide and conquer" approach works for any exponent.`,
          workedExample: {
            problem: `${wbase}^${wexp} = ?`,
            steps: [
              `${wbase}^${wexp} means multiply ${wbase} by itself ${wexp} times.`,
              `${wexpansion} = ${wans}`,
            ],
            insight: `For large exponents, build up step by step or split into smaller powers.`,
          },
          tryIt: {
            question: `${pbase}^${pexp} = ?`,
            answer: pans,
            answerType: 'numeric',
            answerDisplay: `${pans}`,
            steps: [
              `${pbase}^${pexp} means multiply ${pbase} by itself ${pexp} times.`,
              `${pexpansion} = ${pans}`,
            ],
            whyItMatters:
              `The number of quantum states grows as 2^N. With 5 qubits you have ` +
              `2⁵ = 32 basis states. Evaluating higher powers tells you the size ` +
              `of the space you're working in.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

// ── Chapter 2: Vectors ────────────────────────────────────────────────────────

vector_addition: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'basic': {
        const wa = randInt(1, 8), wb = randInt(1, 8), wc = randInt(1, 8), wd = randInt(1, 8);
        let pa, pb, pc, pd;
        do {
          pa = randInt(1, 8); pb = randInt(1, 8); pc = randInt(1, 8); pd = randInt(1, 8);
        } while (pa === wa && pb === wb && pc === wc && pd === wd);
        return {
          teachingText:
            `Vector addition is done component by component. To add (a, b) + (c, d), ` +
            `add the first components together (a + c) and the second components ` +
            `together (b + d). The result is a new vector (a+c, b+d). Think of it ` +
            `as adding matching slots independently.`,
          workedExample: {
            problem: `(${wa}, ${wb}) + (${wc}, ${wd}) = ?`,
            steps: [
              `Add x-components: ${wa} + ${wc} = ${wa + wc}`,
              `Add y-components: ${wb} + ${wd} = ${wb + wd}`,
              `Result: (${wa + wc}, ${wb + wd})`,
            ],
            insight: `Vectors add slot by slot — x's with x's, y's with y's.`,
          },
          tryIt: {
            question: `(${pa}, ${pb}) + (${pc}, ${pd}) = ?`,
            answer: [pa + pc, pb + pd],
            answerType: 'vector',
            answerDisplay: `(${pa + pc}, ${pb + pd})`,
            steps: [
              `Add x-components: ${pa} + ${pc} = ${pa + pc}`,
              `Add y-components: ${pb} + ${pd} = ${pb + pd}`,
              `Result: (${pa + pc}, ${pb + pd})`,
            ],
            whyItMatters:
              `Quantum states are vectors. When you combine quantum amplitudes ` +
              `(superposition), you're doing vector addition. This is the ` +
              `mathematical core of quantum superposition.`,
          },
        };
      }

      case 'with_negatives': {
        const wa = randIntNZ(-8, 8), wb = randIntNZ(-8, 8);
        const wc = randIntNZ(-8, 8), wd = randIntNZ(-8, 8);
        // Ensure at least one negative
        const wvals = [wa, wb, wc, wd];
        if (wvals.every(v => v > 0)) wvals[randInt(0, 3)] = -randInt(1, 8);
        const [wa2, wb2, wc2, wd2] = wvals;
        let pa, pb, pc, pd;
        do {
          pa = randIntNZ(-8, 8); pb = randIntNZ(-8, 8);
          pc = randIntNZ(-8, 8); pd = randIntNZ(-8, 8);
          const pvals = [pa, pb, pc, pd];
          if (pvals.every(v => v > 0)) pvals[randInt(0, 3)] = -randInt(1, 8);
          [pa, pb, pc, pd] = pvals;
        } while (pa === wa2 && pb === wb2 && pc === wc2 && pd === wd2);
        return {
          teachingText:
            `Negative components in vectors work just like negative numbers in ` +
            `regular addition. Add each pair of components normally — if one is ` +
            `negative, it reduces the sum. For example, 5 + (−3) = 2.`,
          workedExample: {
            problem: `(${wa2}, ${wb2}) + (${wc2}, ${wd2}) = ?`,
            steps: [
              `Add x-components: ${wa2} + ${wc2 < 0 ? `(${wc2})` : wc2} = ${wa2 + wc2}`,
              `Add y-components: ${wb2} + ${wd2 < 0 ? `(${wd2})` : wd2} = ${wb2 + wd2}`,
              `Result: (${wa2 + wc2}, ${wb2 + wd2})`,
            ],
            insight: `Negative components just mean the vector points in the opposite direction along that axis.`,
          },
          tryIt: {
            question: `(${pa}, ${pb}) + (${pc}, ${pd}) = ?`,
            answer: [pa + pc, pb + pd],
            answerType: 'vector',
            answerDisplay: `(${pa + pc}, ${pb + pd})`,
            steps: [
              `Add x-components: ${pa} + ${pc < 0 ? `(${pc})` : pc} = ${pa + pc}`,
              `Add y-components: ${pb} + ${pd < 0 ? `(${pd})` : pd} = ${pb + pd}`,
              `Result: (${pa + pc}, ${pb + pd})`,
            ],
            whyItMatters:
              `Quantum states routinely have negative amplitudes. The state ` +
              `(1, −1)/√2 is just as valid as (1, 1)/√2. Adding states with ` +
              `negative components is how interference works.`,
          },
        };
      }

      case 'subtraction': {
        const wa = randInt(1, 8), wb = randInt(1, 8), wc = randInt(1, 8), wd = randInt(1, 8);
        let pa, pb, pc, pd;
        do {
          pa = randInt(1, 8); pb = randInt(1, 8); pc = randInt(1, 8); pd = randInt(1, 8);
        } while (pa === wa && pb === wb && pc === wc && pd === wd);
        return {
          teachingText:
            `Vector subtraction works the same as addition, but you subtract ` +
            `each component. (a, b) − (c, d) = (a−c, b−d). This gives you ` +
            `the vector "difference" — geometrically, it points from the second ` +
            `vector to the first.`,
          workedExample: {
            problem: `(${wa}, ${wb}) − (${wc}, ${wd}) = ?`,
            steps: [
              `Subtract x-components: ${wa} − ${wc} = ${wa - wc}`,
              `Subtract y-components: ${wb} − ${wd} = ${wb - wd}`,
              `Result: (${wa - wc}, ${wb - wd})`,
            ],
            insight: `Subtraction is component-wise too — same pattern as addition but with minus signs.`,
          },
          tryIt: {
            question: `(${pa}, ${pb}) - (${pc}, ${pd}) = ?`,
            answer: [pa - pc, pb - pd],
            answerType: 'vector',
            answerDisplay: `(${pa - pc}, ${pb - pd})`,
            steps: [
              `Subtract x-components: ${pa} − ${pc} = ${pa - pc}`,
              `Subtract y-components: ${pb} − ${pd} = ${pb - pd}`,
              `Result: (${pa - pc}, ${pb - pd})`,
            ],
            whyItMatters:
              `State differences matter in quantum error correction — you compare ` +
              `the expected state to the measured state by subtraction to find ` +
              `and fix errors.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

scalar_multiplication: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'basic': {
        const wk = randInt(2, 5), wa = randInt(1, 6), wb = randInt(1, 6);
        let pk, pa, pb;
        do {
          pk = randInt(2, 5); pa = randInt(1, 6); pb = randInt(1, 6);
        } while (pk === wk && pa === wa && pb === wb);
        return {
          teachingText:
            `Scalar multiplication means multiplying every component of a vector ` +
            `by the same number (the "scalar"). If k = 3 and the vector is (2, 5), ` +
            `then 3 × (2, 5) = (3×2, 3×5) = (6, 15). The scalar stretches or ` +
            `shrinks the vector uniformly.`,
          workedExample: {
            problem: `${wk} × (${wa}, ${wb}) = ?`,
            steps: [
              `Multiply each component by ${wk}:`,
              `x: ${wk} × ${wa} = ${wk * wa}`,
              `y: ${wk} × ${wb} = ${wk * wb}`,
              `Result: (${wk * wa}, ${wk * wb})`,
            ],
            insight: `The scalar multiplies every component — it scales the whole vector uniformly.`,
          },
          tryIt: {
            question: `${pk} × (${pa}, ${pb}) = ?`,
            answer: [pk * pa, pk * pb],
            answerType: 'vector',
            answerDisplay: `(${pk * pa}, ${pk * pb})`,
            steps: [
              `Multiply each component by ${pk}:`,
              `x: ${pk} × ${pa} = ${pk * pa}`,
              `y: ${pk} × ${pb} = ${pk * pb}`,
              `Result: (${pk * pa}, ${pk * pb})`,
            ],
            whyItMatters:
              `Quantum gates scale amplitudes — applying a gate often multiplies ` +
              `part of the state vector by a constant. Scalar multiplication is ` +
              `the simplest form of this operation.`,
          },
        };
      }

      case 'negative_scalar': {
        const wk = -randInt(2, 5), wa = randInt(1, 6), wb = randInt(1, 6);
        let pk, pa, pb;
        do {
          pk = -randInt(2, 5); pa = randInt(1, 6); pb = randInt(1, 6);
        } while (pk === wk && pa === wa && pb === wb);
        return {
          teachingText:
            `A negative scalar flips the vector's direction. Every component ` +
            `gets multiplied by the negative number, so positive components ` +
            `become negative and vice versa. −2 × (3, 4) = (−6, −8). ` +
            `The vector now points the opposite way.`,
          workedExample: {
            problem: `${wk} × (${wa}, ${wb}) = ?`,
            steps: [
              `Multiply each component by ${wk}:`,
              `x: ${wk} × ${wa} = ${wk * wa}`,
              `y: ${wk} × ${wb} = ${wk * wb}`,
              `Result: (${wk * wa}, ${wk * wb})`,
            ],
            insight: `A negative scalar reverses the direction of the vector.`,
          },
          tryIt: {
            question: `${pk} × (${pa}, ${pb}) = ?`,
            answer: [pk * pa, pk * pb],
            answerType: 'vector',
            answerDisplay: `(${pk * pa}, ${pk * pb})`,
            steps: [
              `Multiply each component by ${pk}:`,
              `x: ${pk} × ${pa} = ${pk * pa}`,
              `y: ${pk} × ${pb} = ${pk * pb}`,
              `Result: (${pk * pa}, ${pk * pb})`,
            ],
            whyItMatters:
              `The Z gate in quantum computing multiplies the |1⟩ amplitude by −1. ` +
              `That's a scalar multiplication by a negative number — it flips the ` +
              `phase, which changes how the state interferes.`,
          },
        };
      }

      case 'larger': {
        const wk = randIntNZ(-6, 6), wa = randIntNZ(-6, 6), wb = randIntNZ(-6, 6);
        let pk, pa, pb;
        do {
          pk = randIntNZ(-6, 6); pa = randIntNZ(-6, 6); pb = randIntNZ(-6, 6);
        } while (pk === wk && pa === wa && pb === wb);
        return {
          teachingText:
            `With larger numbers and mixed signs, the process is unchanged — ` +
            `multiply each component by the scalar. Be methodical with signs: ` +
            `positive × positive = positive, positive × negative = negative, ` +
            `negative × negative = positive.`,
          workedExample: {
            problem: `${wk} × (${wa}, ${wb}) = ?`,
            steps: [
              `Multiply each component by ${wk}:`,
              `x: ${wk} × ${wa < 0 ? `(${wa})` : wa} = ${wk * wa}`,
              `y: ${wk} × ${wb < 0 ? `(${wb})` : wb} = ${wk * wb}`,
              `Result: (${wk * wa}, ${wk * wb})`,
            ],
            insight: `Track signs carefully: negative × negative = positive.`,
          },
          tryIt: {
            question: `${pk} × (${pa}, ${pb}) = ?`,
            answer: [pk * pa, pk * pb],
            answerType: 'vector',
            answerDisplay: `(${pk * pa}, ${pk * pb})`,
            steps: [
              `Multiply each component by ${pk}:`,
              `x: ${pk} × ${pa < 0 ? `(${pa})` : pa} = ${pk * pa}`,
              `y: ${pk} × ${pb < 0 ? `(${pb})` : pb} = ${pk * pb}`,
              `Result: (${pk * pa}, ${pk * pb})`,
            ],
            whyItMatters:
              `Quantum operations scale state vectors by complex numbers. ` +
              `Comfort with larger scalar multiplications — including mixed ` +
              `signs — builds the foundation for understanding gate operations.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

vector_magnitude: {
  generate(difficulty, variation) {
    const triples = [[3,4,5],[5,12,13],[6,8,10],[8,6,10],[4,3,5]];

    switch (variation) {

      case 'basic': {
        const [wa, wb, wmag] = triples[randInt(0, triples.length - 1)];
        let pa, pb, pmag;
        do {
          [pa, pb, pmag] = triples[randInt(0, triples.length - 1)];
        } while (pa === wa && pb === wb);
        return {
          teachingText:
            `The magnitude (length) of a vector (a, b) is found using the Pythagorean ` +
            `theorem: |(a, b)| = √(a² + b²). Square each component, add them, ` +
            `then take the square root. For vectors based on Pythagorean triples ` +
            `like (3, 4), the answer is a clean integer: √(9 + 16) = √25 = 5.`,
          workedExample: {
            problem: `|(${wa}, ${wb})| = ?`,
            steps: [
              `Formula: |(a, b)| = √(a² + b²)`,
              `Square each component: ${wa}² = ${wa * wa},  ${wb}² = ${wb * wb}`,
              `Add: ${wa * wa} + ${wb * wb} = ${wa * wa + wb * wb}`,
              `Square root: √${wa * wa + wb * wb} = ${wmag}`,
            ],
            insight: `Magnitude uses the Pythagorean theorem — it's the hypotenuse of a right triangle.`,
          },
          tryIt: {
            question: `|(${pa}, ${pb})| = ?`,
            answer: pmag,
            answerType: 'numeric',
            answerDisplay: `${pmag}`,
            steps: [
              `Formula: |(a, b)| = √(a² + b²)`,
              `Square each component: ${pa}² = ${pa * pa},  ${pb}² = ${pb * pb}`,
              `Add: ${pa * pa} + ${pb * pb} = ${pa * pa + pb * pb}`,
              `Square root: √${pa * pa + pb * pb} = ${pmag}`,
            ],
            whyItMatters:
              `The magnitude of a quantum state vector must equal 1 (normalization). ` +
              `Computing magnitudes tells you whether a state is valid and how to ` +
              `normalize it if it isn't.`,
          },
        };
      }

      case 'with_negatives': {
        let wa, wb, wmag;
        [wa, wb, wmag] = triples[randInt(0, triples.length - 1)];
        if (Math.random() < 0.5) wa = -wa; else wb = -wb;
        let pa, pb, pmag;
        do {
          [pa, pb, pmag] = triples[randInt(0, triples.length - 1)];
          if (Math.random() < 0.5) pa = -pa; else pb = -pb;
        } while (Math.abs(pa) === Math.abs(wa) && Math.abs(pb) === Math.abs(wb));
        return {
          teachingText:
            `Negative components don't affect the magnitude because squaring ` +
            `eliminates the sign: (−3)² = 9, just like 3² = 9. The magnitude ` +
            `is always positive — it measures length, and length can't be negative.`,
          workedExample: {
            problem: `|(${wa}, ${wb})| = ?`,
            steps: [
              `Formula: |(a, b)| = √(a² + b²)`,
              `Square each component: (${wa})² = ${wa * wa},  (${wb})² = ${wb * wb}`,
              `Add: ${wa * wa} + ${wb * wb} = ${wa * wa + wb * wb}`,
              `Square root: √${wa * wa + wb * wb} = ${wmag}`,
            ],
            insight: `Squaring removes the sign — magnitude is always positive.`,
          },
          tryIt: {
            question: `|(${pa}, ${pb})| = ?`,
            answer: pmag,
            answerType: 'numeric',
            answerDisplay: `${pmag}`,
            steps: [
              `Formula: |(a, b)| = √(a² + b²)`,
              `Square each component: (${pa})² = ${pa * pa},  (${pb})² = ${pb * pb}`,
              `Add: ${pa * pa} + ${pb * pb} = ${pa * pa + pb * pb}`,
              `Square root: √${pa * pa + pb * pb} = ${pmag}`,
            ],
            whyItMatters:
              `Quantum amplitudes can be negative, but probabilities (amplitude ` +
              `squared) are always positive. The magnitude operation mirrors ` +
              `this: sign doesn't matter, only size.`,
          },
        };
      }

      case 'non_integer': {
        const wa = randInt(1, 8), wb = randInt(1, 8);
        const wmag = Math.round(Math.sqrt(wa * wa + wb * wb) * 100) / 100;
        let pa, pb;
        do {
          pa = randInt(1, 8); pb = randInt(1, 8);
        } while (pa === wa && pb === wb);
        const pmag = Math.round(Math.sqrt(pa * pa + pb * pb) * 100) / 100;
        return {
          teachingText:
            `Most vectors don't have clean integer magnitudes. When the sum of ` +
            `squares isn't a perfect square, the magnitude is a decimal. ` +
            `For example, |(1, 2)| = √(1 + 4) = √5 ≈ 2.24. Round to two ` +
            `decimal places.`,
          workedExample: {
            problem: `|(${wa}, ${wb})| = ?`,
            steps: [
              `Formula: |(a, b)| = √(a² + b²)`,
              `Square each component: ${wa}² = ${wa * wa},  ${wb}² = ${wb * wb}`,
              `Add: ${wa * wa} + ${wb * wb} = ${wa * wa + wb * wb}`,
              `Square root: √${wa * wa + wb * wb} = ${wmag}`,
            ],
            insight: `Non-integer magnitudes are common — round to two decimal places.`,
          },
          tryIt: {
            question: `|(${pa}, ${pb})| = ?`,
            answer: pmag,
            answerType: 'numeric',
            answerDisplay: `${pmag}`,
            steps: [
              `Formula: |(a, b)| = √(a² + b²)`,
              `Square each component: ${pa}² = ${pa * pa},  ${pb}² = ${pb * pb}`,
              `Add: ${pa * pa} + ${pb * pb} = ${pa * pa + pb * pb}`,
              `Square root: √${pa * pa + pb * pb} = ${pmag}`,
            ],
            whyItMatters:
              `Real quantum normalization constants are usually irrational numbers ` +
              `like 1/√5 or 1/√3. Getting comfortable with non-integer magnitudes ` +
              `prepares you for realistic calculations.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

// ── Chapter 3: Unit Vectors ───────────────────────────────────────────────────

unit_vector_check: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'basic': {
        const wIsUnit = Math.random() > 0.5;
        let wa, wb;
        if (wIsUnit) {
          const units = [[1,0],[0,1],[-1,0],[0,-1]];
          [wa, wb] = units[randInt(0, units.length - 1)];
        } else {
          wa = randInt(2, 6); wb = randInt(1, 5);
        }
        const wmag = Math.round(Math.sqrt(wa * wa + wb * wb) * 100) / 100;

        const pIsUnit = Math.random() > 0.5;
        let pa, pb;
        if (pIsUnit) {
          const units = [[1,0],[0,1],[-1,0],[0,-1]];
          [pa, pb] = units[randInt(0, units.length - 1)];
        } else {
          pa = randInt(2, 6); pb = randInt(1, 5);
        }
        // Ensure different from worked example
        if (pa === wa && pb === wb) {
          pa = randInt(2, 6); pb = randInt(1, 5);
        }
        const pmag = Math.round(Math.sqrt(pa * pa + pb * pb) * 100) / 100;
        const pIsUnitActual = Math.abs(pmag - 1) < 0.01;

        return {
          teachingText:
            `A unit vector has a magnitude (length) of exactly 1. To check, ` +
            `compute the magnitude using √(a² + b²) and see if it equals 1. ` +
            `The vectors (1, 0) and (0, 1) are unit vectors. The vector (3, 4) ` +
            `is not — its magnitude is 5.`,
          workedExample: {
            problem: `Is (${wa}, ${wb}) a unit vector? (yes or no)`,
            steps: [
              `Compute the magnitude: |(${wa}, ${wb})| = √(${wa}² + ${wb}²)`,
              `= √(${wa * wa} + ${wb * wb}) = √${wa * wa + wb * wb} = ${wmag}`,
              wIsUnit
                ? `${wmag} = 1, so yes — this is a unit vector.`
                : `${wmag} ≠ 1, so no — this is not a unit vector.`,
            ],
            insight: `A unit vector's magnitude is exactly 1 — no more, no less.`,
          },
          tryIt: {
            question: `Is (${pa}, ${pb}) a unit vector? (yes or no)`,
            answer: pIsUnitActual,
            answerType: 'yesno',
            answerDisplay: pIsUnitActual ? 'yes' : 'no',
            steps: [
              `Compute the magnitude: |(${pa}, ${pb})| = √(${pa}² + ${pb}²)`,
              `= √(${pa * pa} + ${pb * pb}) = √${pa * pa + pb * pb} = ${pmag}`,
              pIsUnitActual
                ? `${pmag} = 1, so yes — this is a unit vector.`
                : `${pmag} ≠ 1, so no — this is not a unit vector.`,
            ],
            whyItMatters:
              `Every valid quantum state must be a unit vector — the probabilities ` +
              `of all outcomes must add to 1. Checking if a vector is "unit" is ` +
              `how you verify a quantum state is physically valid.`,
          },
        };
      }

      case 'diagonal': {
        const s = Math.round(1 / Math.sqrt(2) * 100) / 100; // 0.71
        const wIsUnit = Math.random() > 0.5;
        let wa, wb;
        if (wIsUnit) {
          const opts = [[s, s], [s, -s], [-s, s], [-s, -s]];
          [wa, wb] = opts[randInt(0, opts.length - 1)];
        } else {
          wa = randInt(2, 6); wb = randInt(1, 5);
        }
        const wmag = Math.round(Math.sqrt(wa * wa + wb * wb) * 100) / 100;

        const pIsUnit = Math.random() > 0.5;
        let pa, pb;
        if (pIsUnit) {
          const opts = [[s, s], [s, -s], [-s, s], [-s, -s]];
          [pa, pb] = opts[randInt(0, opts.length - 1)];
        } else {
          pa = randInt(2, 6); pb = randInt(1, 5);
        }
        if (pa === wa && pb === wb) {
          pa = randInt(2, 6); pb = randInt(1, 5);
        }
        const pmag = Math.round(Math.sqrt(pa * pa + pb * pb) * 100) / 100;
        const pIsUnitActual = Math.abs(pmag - 1) < 0.02;

        return {
          teachingText:
            `Unit vectors don't have to be axis-aligned. The vector (0.71, 0.71) ` +
            `is approximately (1/√2, 1/√2), and its magnitude is ` +
            `√(0.71² + 0.71²) = √(0.5 + 0.5) = √1 = 1. This diagonal unit ` +
            `vector represents a qubit in an equal superposition of |0⟩ and |1⟩.`,
          workedExample: {
            problem: `Is (${wa}, ${wb}) a unit vector? (yes or no)`,
            steps: [
              `Compute the magnitude: |(${wa}, ${wb})| = √(${wa}² + ${wb}²)`,
              `= √(${(wa * wa).toFixed ? (wa * wa).toFixed(2) : wa * wa} + ${(wb * wb).toFixed ? (wb * wb).toFixed(2) : wb * wb}) = ${wmag}`,
              wIsUnit
                ? `${wmag} ≈ 1, so yes — this is a unit vector.`
                : `${wmag} ≠ 1, so no — this is not a unit vector.`,
            ],
            insight: `1/√2 ≈ 0.71 appears constantly in quantum computing — it's the equal-superposition amplitude.`,
          },
          tryIt: {
            question: `Is (${pa}, ${pb}) a unit vector? (yes or no)`,
            answer: pIsUnitActual,
            answerType: 'yesno',
            answerDisplay: pIsUnitActual ? 'yes' : 'no',
            steps: [
              `Compute the magnitude: |(${pa}, ${pb})| = √(${pa}² + ${pb}²)`,
              `= √(${(pa * pa).toFixed ? (pa * pa).toFixed(2) : pa * pa} + ${(pb * pb).toFixed ? (pb * pb).toFixed(2) : pb * pb}) = ${pmag}`,
              pIsUnitActual
                ? `${pmag} ≈ 1, so yes — this is a unit vector.`
                : `${pmag} ≠ 1, so no — this is not a unit vector.`,
            ],
            whyItMatters:
              `The |+⟩ state = (1/√2)|0⟩ + (1/√2)|1⟩ is one of the most important ` +
              `quantum states. Its amplitudes are (0.71, 0.71) — a diagonal unit vector. ` +
              `Recognizing these is essential.`,
          },
        };
      }

      case 'tricky_no': {
        const trickyPairs = [[0.6, 0.7], [0.5, 0.8], [0.7, 0.8], [0.3, 0.9], [0.8, 0.5]];
        const [wa, wb] = trickyPairs[randInt(0, trickyPairs.length - 1)];
        const wmag = Math.round(Math.sqrt(wa * wa + wb * wb) * 100) / 100;

        let pa, pb;
        do {
          [pa, pb] = trickyPairs[randInt(0, trickyPairs.length - 1)];
        } while (pa === wa && pb === wb);
        const pmag = Math.round(Math.sqrt(pa * pa + pb * pb) * 100) / 100;

        return {
          teachingText:
            `Some vectors look like they might be unit vectors but aren't. ` +
            `A vector like (0.6, 0.7) has components less than 1, but is it a ` +
            `unit vector? Check: √(0.36 + 0.49) = √0.85 ≈ 0.92 ≠ 1. Close, ` +
            `but not 1. You must always compute the magnitude — don't guess.`,
          workedExample: {
            problem: `Is (${wa}, ${wb}) a unit vector? (yes or no)`,
            steps: [
              `Compute the magnitude: |(${wa}, ${wb})| = √(${wa}² + ${wb}²)`,
              `= √(${(wa * wa).toFixed(2)} + ${(wb * wb).toFixed(2)}) = √${(wa * wa + wb * wb).toFixed(2)} = ${wmag}`,
              `${wmag} ≠ 1, so no — this is not a unit vector.`,
            ],
            insight: `"Close to 1" is not the same as 1. Always compute, don't eyeball.`,
          },
          tryIt: {
            question: `Is (${pa}, ${pb}) a unit vector? (yes or no)`,
            answer: false,
            answerType: 'yesno',
            answerDisplay: 'no',
            steps: [
              `Compute the magnitude: |(${pa}, ${pb})| = √(${pa}² + ${pb}²)`,
              `= √(${(pa * pa).toFixed(2)} + ${(pb * pb).toFixed(2)}) = √${(pa * pa + pb * pb).toFixed(2)} = ${pmag}`,
              `${pmag} ≠ 1, so no — this is not a unit vector.`,
            ],
            whyItMatters:
              `An invalid quantum state (one that's not a unit vector) gives ` +
              `probabilities that don't sum to 1 — which is physically meaningless. ` +
              `You must be precise about normalization.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

normalize_vector: {
  generate(difficulty, variation) {
    const triples = [[3,4,5],[5,12,13],[6,8,10],[4,3,5],[12,5,13]];

    switch (variation) {

      case 'basic': {
        const [wa, wb, wmag] = triples[randInt(0, triples.length - 1)];
        const wn1 = Math.round((wa / wmag) * 100) / 100;
        const wn2 = Math.round((wb / wmag) * 100) / 100;
        let pa, pb, pmag;
        do {
          [pa, pb, pmag] = triples[randInt(0, triples.length - 1)];
        } while (pa === wa && pb === wb);
        const pn1 = Math.round((pa / pmag) * 100) / 100;
        const pn2 = Math.round((pb / pmag) * 100) / 100;
        return {
          teachingText:
            `Normalizing a vector means scaling it so its magnitude becomes 1, ` +
            `while keeping its direction the same. To normalize (a, b): ` +
            `first find the magnitude m = √(a² + b²), then divide each component ` +
            `by m. The result (a/m, b/m) is a unit vector pointing in the same direction.`,
          workedExample: {
            problem: `Normalize (${wa}, ${wb}):`,
            steps: [
              `Step 1 — find magnitude: |(${wa}, ${wb})| = √(${wa}² + ${wb}²) = √${wa * wa + wb * wb} = ${wmag}`,
              `Step 2 — divide each component by ${wmag}:`,
              `x: ${wa} ÷ ${wmag} = ${wn1}`,
              `y: ${wb} ÷ ${wmag} = ${wn2}`,
              `Result: (${wn1}, ${wn2})`,
            ],
            insight: `Normalizing preserves direction but sets the length to exactly 1.`,
          },
          tryIt: {
            question: `Normalize (${pa}, ${pb}):`,
            answer: [pn1, pn2],
            answerType: 'vector',
            answerDisplay: `(${pn1}, ${pn2})`,
            steps: [
              `Step 1 — find magnitude: |(${pa}, ${pb})| = √(${pa}² + ${pb}²) = √${pa * pa + pb * pb} = ${pmag}`,
              `Step 2 — divide each component by ${pmag}:`,
              `x: ${pa} ÷ ${pmag} = ${pn1}`,
              `y: ${pb} ÷ ${pmag} = ${pn2}`,
              `Result: (${pn1}, ${pn2})`,
            ],
            whyItMatters:
              `Every quantum state must be normalized — its amplitude vector must ` +
              `have magnitude 1. Normalization is how you turn any vector into a ` +
              `valid quantum state.`,
          },
        };
      }

      case 'with_negatives': {
        let wa, wb, wmag;
        [wa, wb, wmag] = triples[randInt(0, triples.length - 1)];
        if (Math.random() < 0.5) wa = -wa; else wb = -wb;
        const wn1 = Math.round((wa / wmag) * 100) / 100;
        const wn2 = Math.round((wb / wmag) * 100) / 100;

        let pa, pb, pmag;
        do {
          [pa, pb, pmag] = triples[randInt(0, triples.length - 1)];
          if (Math.random() < 0.5) pa = -pa; else pb = -pb;
        } while (Math.abs(pa) === Math.abs(wa) && Math.abs(pb) === Math.abs(wb));
        const pn1 = Math.round((pa / pmag) * 100) / 100;
        const pn2 = Math.round((pb / pmag) * 100) / 100;

        return {
          teachingText:
            `Normalizing with negative components works the same way — the magnitude ` +
            `is always positive (squaring removes the sign), and dividing a negative ` +
            `component by a positive magnitude keeps it negative. The normalized ` +
            `vector preserves the sign of each component.`,
          workedExample: {
            problem: `Normalize (${wa}, ${wb}):`,
            steps: [
              `Step 1 — find magnitude: |(${wa}, ${wb})| = √((${wa})² + (${wb})²) = √${wa * wa + wb * wb} = ${wmag}`,
              `Step 2 — divide each component by ${wmag}:`,
              `x: ${wa} ÷ ${wmag} = ${wn1}`,
              `y: ${wb} ÷ ${wmag} = ${wn2}`,
              `Result: (${wn1}, ${wn2})`,
            ],
            insight: `Negative components stay negative after normalization — only the scale changes.`,
          },
          tryIt: {
            question: `Normalize (${pa}, ${pb}):`,
            answer: [pn1, pn2],
            answerType: 'vector',
            answerDisplay: `(${pn1}, ${pn2})`,
            steps: [
              `Step 1 — find magnitude: |(${pa}, ${pb})| = √((${pa})² + (${pb})²) = √${pa * pa + pb * pb} = ${pmag}`,
              `Step 2 — divide each component by ${pmag}:`,
              `x: ${pa} ÷ ${pmag} = ${pn1}`,
              `y: ${pb} ÷ ${pmag} = ${pn2}`,
              `Result: (${pn1}, ${pn2})`,
            ],
            whyItMatters:
              `Quantum states like |−⟩ = (1/√2)|0⟩ − (1/√2)|1⟩ have negative ` +
              `components. Normalization with negatives gives you states that ` +
              `exhibit destructive interference — a key quantum resource.`,
          },
        };
      }

      case 'non_triple': {
        const wa = randIntNZ(1, 6), wb = randIntNZ(1, 6);
        const wmag = Math.sqrt(wa * wa + wb * wb);
        const wn1 = Math.round((wa / wmag) * 100) / 100;
        const wn2 = Math.round((wb / wmag) * 100) / 100;
        const wmagRound = Math.round(wmag * 100) / 100;

        let pa, pb;
        do {
          pa = randIntNZ(1, 6); pb = randIntNZ(1, 6);
        } while (pa === wa && pb === wb);
        const pmag = Math.sqrt(pa * pa + pb * pb);
        const pn1 = Math.round((pa / pmag) * 100) / 100;
        const pn2 = Math.round((pb / pmag) * 100) / 100;
        const pmagRound = Math.round(pmag * 100) / 100;

        return {
          teachingText:
            `When the magnitude isn't a clean integer, the process is the same — ` +
            `just expect decimal results. Compute the magnitude (which will likely ` +
            `be irrational), then divide each component by it. Round each component ` +
            `to two decimal places.`,
          workedExample: {
            problem: `Normalize (${wa}, ${wb}):`,
            steps: [
              `Step 1 — find magnitude: |(${wa}, ${wb})| = √(${wa}² + ${wb}²) = √${wa * wa + wb * wb} ≈ ${wmagRound}`,
              `Step 2 — divide each component by ${wmagRound}:`,
              `x: ${wa} ÷ ${wmagRound} ≈ ${wn1}`,
              `y: ${wb} ÷ ${wmagRound} ≈ ${wn2}`,
              `Result: (${wn1}, ${wn2})`,
            ],
            insight: `Irrational magnitudes are normal — just round your final answer to two decimal places.`,
          },
          tryIt: {
            question: `Normalize (${pa}, ${pb}):`,
            answer: [pn1, pn2],
            answerType: 'vector',
            answerDisplay: `(${pn1}, ${pn2})`,
            steps: [
              `Step 1 — find magnitude: |(${pa}, ${pb})| = √(${pa}² + ${pb}²) = √${pa * pa + pb * pb} ≈ ${pmagRound}`,
              `Step 2 — divide each component by ${pmagRound}:`,
              `x: ${pa} ÷ ${pmagRound} ≈ ${pn1}`,
              `y: ${pb} ÷ ${pmagRound} ≈ ${pn2}`,
              `Result: (${pn1}, ${pn2})`,
            ],
            whyItMatters:
              `Most real quantum states have irrational normalization constants. ` +
              `States like 1/√3 (|0⟩ + |1⟩ + |2⟩) for qutrits or unequal ` +
              `superpositions require this general normalization skill.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

probability_from_components: {
  generate(difficulty, variation) {
    const triples = [[3,4,5],[5,12,13],[4,3,5],[6,8,10]];

    switch (variation) {

      case 'basic': {
        const [wta, wtb, wtm] = triples[randInt(0, triples.length - 1)];
        const walpha = (wta / wtm).toFixed(2);
        const wbeta = (wtb / wtm).toFixed(2);
        const wprob = Math.round((wta / wtm) ** 2 * 100) / 100;

        let pta, ptb, ptm;
        do {
          [pta, ptb, ptm] = triples[randInt(0, triples.length - 1)];
        } while (pta === wta && ptb === wtb);
        const palpha = (pta / ptm).toFixed(2);
        const pbeta = (ptb / ptm).toFixed(2);
        const pprob = Math.round((pta / ptm) ** 2 * 100) / 100;

        return {
          teachingText:
            `In quantum mechanics, the probability of measuring a state is the ` +
            `square of its amplitude (the Born rule). If |ψ⟩ = α|0⟩ + β|1⟩, ` +
            `then P(|0⟩) = α² and P(|1⟩) = β². The probabilities must sum to 1: ` +
            `α² + β² = 1. To find P(|0⟩), simply square the coefficient of |0⟩.`,
          workedExample: {
            problem: `|ψ⟩ = ${walpha}|0⟩ + ${wbeta}|1⟩\nP(measure |0⟩) = ?`,
            steps: [
              `P(|0⟩) = α² where α is the amplitude of |0⟩`,
              `α = ${walpha}`,
              `α² = ${walpha}² = ${wprob}`,
              `Check: β² = ${wbeta}² = ${Math.round((wtb / wtm) ** 2 * 100) / 100},  α²+β² = ${wprob} + ${Math.round((wtb / wtm) ** 2 * 100) / 100} = 1.00 ✓`,
            ],
            insight: `Square the amplitude to get the probability — that's the Born rule.`,
          },
          tryIt: {
            question: `|ψ⟩ = ${palpha}|0⟩ + ${pbeta}|1⟩\nP(measure |0⟩) = ?`,
            answer: pprob,
            answerType: 'numeric',
            answerDisplay: `${pprob}`,
            steps: [
              `P(|0⟩) = α² where α is the amplitude of |0⟩`,
              `α = ${palpha}`,
              `α² = ${palpha}² = ${pprob}`,
              `Check: β² = ${pbeta}² = ${Math.round((ptb / ptm) ** 2 * 100) / 100},  α²+β² = ${pprob} + ${Math.round((ptb / ptm) ** 2 * 100) / 100} = 1.00 ✓`,
            ],
            whyItMatters:
              `The Born rule is the bridge between quantum math and physical ` +
              `measurements. Every time you run a quantum computer, the output ` +
              `probabilities come from squaring the amplitudes of the final state.`,
          },
        };
      }

      case 'simple_fractions': {
        // 1/sqrt(2) for both amplitudes → P = 0.5
        const s = (1 / Math.sqrt(2)).toFixed(2); // "0.71"
        return {
          teachingText:
            `The most common quantum state is the equal superposition: ` +
            `|+⟩ = (1/√2)|0⟩ + (1/√2)|1⟩, where 1/√2 ≈ 0.71. Since both ` +
            `amplitudes are equal, squaring gives equal probabilities: ` +
            `P(|0⟩) = P(|1⟩) = (1/√2)² = 1/2 = 0.5. Like a perfect coin flip.`,
          workedExample: {
            problem: `|ψ⟩ = ${s}|0⟩ + ${s}|1⟩\nP(measure |0⟩) = ?`,
            steps: [
              `P(|0⟩) = α² where α is the amplitude of |0⟩`,
              `α = ${s} = 1/√2`,
              `α² = (1/√2)² = 1/2 = 0.5`,
              `Check: β² = ${s}² = 0.5,  α²+β² = 0.5 + 0.5 = 1.00 ✓`,
            ],
            insight: `Equal amplitudes → equal probabilities. The Hadamard gate creates this state.`,
          },
          tryIt: {
            question: `|ψ⟩ = ${s}|0⟩ + ${s}|1⟩\nP(measure |1⟩) = ?`,
            answer: 0.5,
            answerType: 'numeric',
            answerDisplay: `0.5`,
            steps: [
              `P(|1⟩) = β² where β is the amplitude of |1⟩`,
              `β = ${s} = 1/√2`,
              `β² = (1/√2)² = 1/2 = 0.5`,
              `Check: α² = ${s}² = 0.5,  α²+β² = 0.5 + 0.5 = 1.00 ✓`,
            ],
            whyItMatters:
              `The Hadamard gate creates this equal superposition from |0⟩. ` +
              `It's the starting point of most quantum algorithms — including ` +
              `Grover's search and quantum key distribution.`,
          },
        };
      }

      case 'find_beta': {
        const [wta, wtb, wtm] = triples[randInt(0, triples.length - 1)];
        const walpha = (wta / wtm).toFixed(2);
        const wbeta = (wtb / wtm).toFixed(2);
        const wprob = Math.round((wtb / wtm) ** 2 * 100) / 100;

        let pta, ptb, ptm;
        do {
          [pta, ptb, ptm] = triples[randInt(0, triples.length - 1)];
        } while (pta === wta && ptb === wtb);
        const palpha = (pta / ptm).toFixed(2);
        const pbeta = (ptb / ptm).toFixed(2);
        const pprob = Math.round((ptb / ptm) ** 2 * 100) / 100;

        return {
          teachingText:
            `You can also be asked for P(|1⟩) instead of P(|0⟩). The rule is ` +
            `the same: square the amplitude of the state you're measuring. ` +
            `For P(|1⟩), square β. Alternatively, since probabilities sum to 1, ` +
            `you could compute P(|1⟩) = 1 − P(|0⟩) = 1 − α².`,
          workedExample: {
            problem: `|ψ⟩ = ${walpha}|0⟩ + ${wbeta}|1⟩\nP(measure |1⟩) = ?`,
            steps: [
              `P(|1⟩) = β² where β is the amplitude of |1⟩`,
              `β = ${wbeta}`,
              `β² = ${wbeta}² = ${wprob}`,
              `Check: α² = ${walpha}² = ${Math.round((wta / wtm) ** 2 * 100) / 100},  α²+β² = ${Math.round((wta / wtm) ** 2 * 100) / 100} + ${wprob} = 1.00 ✓`,
            ],
            insight: `P(|1⟩) = β² directly, or 1 − α² — both methods work.`,
          },
          tryIt: {
            question: `|ψ⟩ = ${palpha}|0⟩ + ${pbeta}|1⟩\nP(measure |1⟩) = ?`,
            answer: pprob,
            answerType: 'numeric',
            answerDisplay: `${pprob}`,
            steps: [
              `P(|1⟩) = β² where β is the amplitude of |1⟩`,
              `β = ${pbeta}`,
              `β² = ${pbeta}² = ${pprob}`,
              `Check: α² = ${palpha}² = ${Math.round((pta / ptm) ** 2 * 100) / 100},  α²+β² = ${Math.round((pta / ptm) ** 2 * 100) / 100} + ${pprob} = 1.00 ✓`,
            ],
            whyItMatters:
              `In a real quantum computation, you often care about the probability ` +
              `of a specific outcome. Being able to quickly compute P for any ` +
              `basis state is the core skill for interpreting quantum results.`,
          },
        };
      }

      default:
        return null;
    }
  },
},


  // ── Chapter 4: Complex Numbers ────────────────────────────────────────────

  complex_addition: {
    generate(difficulty, variation) {
      switch (variation) {

        case 'basic': {
          // Worked example: positive integers
          const wa = randInt(1, 5), wb = randInt(1, 5);
          const wc = randInt(1, 5), wd = randInt(1, 5);
          // Practice: different positive integers
          let pa, pb, pc, pd;
          do {
            pa = randInt(1, 6); pb = randInt(1, 6);
            pc = randInt(1, 6); pd = randInt(1, 6);
          } while (pa === wa && pb === wb && pc === wc && pd === wd);
          return {
            teachingText:
              `Adding complex numbers works like combining two separate buckets — ` +
              `the real parts add together and the imaginary parts add together. ` +
              `They never mix. Think of it like adding apples and oranges separately.`,
            workedExample: {
              problem: `(${wa} + ${wb}i) + (${wc} + ${wd}i)`,
              steps: [
                `Identify the real parts: ${wa} and ${wc}`,
                `Add real parts: ${wa} + ${wc} = ${wa + wc}`,
                `Identify the imaginary parts: ${wb}i and ${wd}i`,
                `Add imaginary parts: ${wb} + ${wd} = ${wb + wd}`,
                `Combine: ${fmtComplex(wa + wc, wb + wd)}`,
              ],
              insight: `Real parts stay with real, imaginary with imaginary — they never cross.`,
            },
            tryIt: {
              question: `(${pa} + ${pb}i) + (${pc} + ${pd}i)`,
              answer: [pa + pc, pb + pd],
              answerType: 'complex',
              answerDisplay: fmtComplex(pa + pc, pb + pd),
              steps: [
                `Real parts: ${pa} + ${pc} = ${pa + pc}`,
                `Imaginary parts: ${pb} + ${pd} = ${pb + pd}`,
                `Answer: ${fmtComplex(pa + pc, pb + pd)}`,
              ],
              whyItMatters:
                `Complex addition is how quantum states combine. When two quantum ` +
                `processes contribute to the same outcome, their amplitudes add — ` +
                `and those amplitudes are complex numbers.`,
            },
          };
        }

        case 'with_negatives': {
          const wa = randInt(2, 7), wb = randInt(1, 5);
          const wc = -randInt(1, 5), wd = randInt(2, 6);
          let pa, pb, pc, pd;
          do {
            pa = randInt(2, 8); pb = -randInt(1, 5);
            pc = randInt(1, 6); pd = randInt(2, 7);
          } while (pa === wa && pb === wb && pc === wc && pd === wd);
          return {
            teachingText:
              `Now some components are negative. The process is identical — add ` +
              `real parts together, add imaginary parts together. The only thing ` +
              `that changes is you're adding negative numbers, which you already ` +
              `know from Chapter 1.`,
            workedExample: {
              problem: `(${wa} ${fmtIm(wb)}) + (${wc} + ${wd}i)`,
              steps: [
                `Identify real parts: ${wa} and ${wc}`,
                `Add real parts: ${wa} + (${wc}) = ${wa + wc}`,
                `Identify imaginary parts: ${wb}i and ${wd}i`,
                `Add imaginary parts: ${wb} + ${wd} = ${wb + wd}`,
                `Combine: ${fmtComplex(wa + wc, wb + wd)}`,
              ],
              insight: `Negatives don't change the process — just be careful with signs.`,
            },
            tryIt: {
              question: `(${pa} ${fmtIm(pb)}) + (${pc} + ${pd}i)`,
              answer: [pa + pc, pb + pd],
              answerType: 'complex',
              answerDisplay: fmtComplex(pa + pc, pb + pd),
              steps: [
                `Real parts: ${pa} + ${pc} = ${pa + pc}`,
                `Imaginary parts: (${pb}) + ${pd} = ${pb + pd}`,
                `Answer: ${fmtComplex(pa + pc, pb + pd)}`,
              ],
              whyItMatters:
                `Negative amplitudes are common in quantum computing. After ` +
                `applying certain gates like Z, amplitudes flip sign. You need ` +
                `to be comfortable adding with negatives in the mix.`,
            },
          };
        }

        case 'edge_case': {
          // One operand is purely real (imaginary part = 0)
          const wa = randInt(3, 9);
          const wc = randInt(2, 7), wd = -randInt(1, 5);
          let pa, pc, pd;
          do {
            pa = randInt(2, 8);
            pc = randInt(1, 6); pd = randInt(2, 7);
          } while (pa === wa && pc === wc);
          return {
            teachingText:
              `What if one number has no imaginary part? It's still a complex ` +
              `number — just with 0i. The number 7 is really 7 + 0i. This ` +
              `happens in quantum computing when a qubit is in a pure state ` +
              `with real-valued amplitudes.`,
            workedExample: {
              problem: `(${wa}) + (${wc} ${fmtIm(wd)})`,
              steps: [
                `Rewrite the first number: ${wa} = ${wa} + 0i`,
                `Add real parts: ${wa} + ${wc} = ${wa + wc}`,
                `Add imaginary parts: 0 + (${wd}) = ${wd}`,
                `Combine: ${fmtComplex(wa + wc, wd)}`,
              ],
              insight: `Every real number is a complex number with 0i. Don't let the missing i trick you.`,
            },
            tryIt: {
              question: `(${pa}) + (${pc} + ${pd}i)`,
              answer: [pa + pc, pd],
              answerType: 'complex',
              answerDisplay: fmtComplex(pa + pc, pd),
              steps: [
                `Rewrite: ${pa} = ${pa} + 0i`,
                `Real parts: ${pa} + ${pc} = ${pa + pc}`,
                `Imaginary parts: 0 + ${pd} = ${pd}`,
                `Answer: ${fmtComplex(pa + pc, pd)}`,
              ],
              whyItMatters:
                `Basis states like |0⟩ = (1, 0) have purely real amplitudes. ` +
                `When you add them with states that have complex amplitudes, ` +
                `you need to handle the missing imaginary part correctly.`,
            },
          };
        }

        case 'extended': {
          // Three terms
          const wa = randInt(1, 4), wb = randInt(1, 3);
          const wc = randInt(1, 4), wd = -randInt(1, 3);
          const we = randInt(1, 3), wf = randInt(1, 4);
          let pa, pb, pc, pd, pe, pf;
          do {
            pa = randInt(1, 5); pb = randInt(1, 4);
            pc = randInt(1, 4); pd = -randInt(1, 4);
            pe = randInt(1, 3); pf = randInt(1, 5);
          } while (pa === wa && pb === wb && pc === wc);
          return {
            teachingText:
              `Now three complex numbers at once. Same process — collect all ` +
              `the real parts, add them up. Collect all the imaginary parts, ` +
              `add them up. Doesn't matter if it's two terms or twenty.`,
            workedExample: {
              problem: `(${wa} + ${wb}i) + (${wc} ${fmtIm(wd)}) + (${we} + ${wf}i)`,
              steps: [
                `Real parts: ${wa} + ${wc} + ${we} = ${wa + wc + we}`,
                `Imaginary parts: ${wb} + (${wd}) + ${wf} = ${wb + wd + wf}`,
                `Combine: ${fmtComplex(wa + wc + we, wb + wd + wf)}`,
              ],
              insight: `Three terms, same rule. This scales to any number of terms.`,
            },
            tryIt: {
              question: `(${pa} + ${pb}i) + (${pc} ${fmtIm(pd)}) + (${pe} + ${pf}i)`,
              answer: [pa + pc + pe, pb + pd + pf],
              answerType: 'complex',
              answerDisplay: fmtComplex(pa + pc + pe, pb + pd + pf),
              steps: [
                `Real parts: ${pa} + ${pc} + ${pe} = ${pa + pc + pe}`,
                `Imaginary parts: ${pb} + (${pd}) + ${pf} = ${pb + pd + pf}`,
                `Answer: ${fmtComplex(pa + pc + pe, pb + pd + pf)}`,
              ],
              whyItMatters:
                `Multi-term addition shows up when computing expectation values ` +
                `and when tracing through circuits with multiple paths. The ` +
                `ability to add several complex amplitudes is fundamental.`,
            },
          };
        }

        default:
          return null;
      }
    },
  },

// ── Chapter 4: Complex Numbers (continued) ─────────────────────────────────

complex_multiplication: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'basic': {
        const r = difficulty < 2 ? 4 : 6;
        const wa = randInt(1, r), wb = randIntNZ(-r, r);
        const wc = randInt(1, r), wd = randIntNZ(-r, r);
        const wRe = wa * wc - wb * wd;
        const wIm = wa * wd + wb * wc;

        let pa, pb, pc, pd;
        do {
          pa = randInt(1, r); pb = randIntNZ(-r, r);
          pc = randInt(1, r); pd = randIntNZ(-r, r);
        } while (pa === wa && pb === wb && pc === wc && pd === wd);
        const pRe = pa * pc - pb * pd;
        const pIm = pa * pd + pb * pc;

        return {
          teachingText:
            `Multiplying complex numbers uses FOIL — just like binomials. ` +
            `Multiply each part: (a + bi)(c + di) gives four terms. The key ` +
            `trick: i\u00B2 = \u22121, so the last term flips sign and joins the real part.`,
          workedExample: {
            problem: `(${fmtComplex(wa, wb)}) \u00D7 (${fmtComplex(wc, wd)})`,
            steps: [
              `FOIL: (${wa})(${wc}) + (${wa})(${wd}i) + (${wb}i)(${wc}) + (${wb}i)(${wd}i)`,
              `= ${wa * wc} + ${wa * wd}i + ${wb * wc}i + ${wb * wd}i\u00B2`,
              `Replace i\u00B2 = \u22121: ${wb * wd}i\u00B2 = ${-wb * wd}`,
              `Real part: ${wa * wc} + ${-wb * wd} = ${wRe}`,
              `Imaginary part: ${wa * wd} + ${wb * wc} = ${wIm}`,
              `Result: ${fmtComplex(wRe, wIm)}`,
            ],
            insight: `FOIL then replace i\u00B2 with \u22121 \u2014 that's the entire process.`,
          },
          tryIt: {
            question: `(${fmtComplex(pa, pb)}) \u00D7 (${fmtComplex(pc, pd)})`,
            answer: [pRe, pIm],
            answerType: 'complex',
            answerDisplay: fmtComplex(pRe, pIm),
            steps: [
              `FOIL: (${pa})(${pc}) + (${pa})(${pd}i) + (${pb}i)(${pc}) + (${pb}i)(${pd}i)`,
              `= ${pa * pc} + ${pa * pd}i + ${pb * pc}i + ${pb * pd}i\u00B2`,
              `Replace i\u00B2 = \u22121: ${pb * pd}i\u00B2 = ${-pb * pd}`,
              `Real: ${pa * pc} + ${-pb * pd} = ${pRe}`,
              `Imaginary: ${pa * pd} + ${pb * pc} = ${pIm}`,
              `Answer: ${fmtComplex(pRe, pIm)}`,
            ],
            whyItMatters:
              `Quantum gates transform states via complex multiplication. ` +
              `Every gate operation multiplies amplitudes by complex numbers, ` +
              `so FOIL is a skill you'll use constantly.`,
          },
        };
      }

      case 'by_i': {
        const wa = randInt(1, 4), wb = randIntNZ(-4, 4);
        const wRe = -wb, wIm = wa; // (a+bi)*i = -b + ai

        let pa, pb;
        do {
          pa = randInt(1, 4); pb = randIntNZ(-4, 4);
        } while (pa === wa && pb === wb);
        const pRe = -pb, pIm = pa;

        return {
          teachingText:
            `Multiplying by i rotates a complex number 90\u00B0 counterclockwise ` +
            `on the complex plane. The formula simplifies: (a + bi) \u00D7 i = ` +
            `\u2212b + ai. The real part becomes imaginary, and the imaginary ` +
            `part becomes real (with a sign flip).`,
          workedExample: {
            problem: `(${fmtComplex(wa, wb)}) \u00D7 i`,
            steps: [
              `Distribute: ${wa} \u00D7 i + ${wb}i \u00D7 i`,
              `= ${wa}i + ${wb}i\u00B2`,
              `Replace i\u00B2 = \u22121: ${wb}i\u00B2 = ${-wb}`,
              `Rearrange: ${-wb} + ${wa}i`,
              `Result: ${fmtComplex(wRe, wIm)}`,
            ],
            insight: `Multiplying by i swaps real and imaginary parts with a sign flip \u2014 a 90\u00B0 rotation.`,
          },
          tryIt: {
            question: `(${fmtComplex(pa, pb)}) \u00D7 i`,
            answer: [pRe, pIm],
            answerType: 'complex',
            answerDisplay: fmtComplex(pRe, pIm),
            steps: [
              `Distribute: ${pa} \u00D7 i + ${pb}i \u00D7 i`,
              `= ${pa}i + ${pb}i\u00B2`,
              `Replace i\u00B2 = \u22121: ${pb}i\u00B2 = ${-pb}`,
              `Rearrange: ${-pb} + ${pa}i`,
              `Answer: ${fmtComplex(pRe, pIm)}`,
            ],
            whyItMatters:
              `The Y and S quantum gates involve multiplication by i. ` +
              `Understanding this rotation is essential for predicting ` +
              `how these gates change qubit states.`,
          },
        };
      }

      case 'with_negatives': {
        const r = 6;
        const wa = randIntNZ(-r, r), wb = randIntNZ(-r, r);
        const wc = randIntNZ(-r, r), wd = randIntNZ(-r, r);
        const wRe = wa * wc - wb * wd;
        const wIm = wa * wd + wb * wc;

        let pa, pb, pc, pd;
        do {
          pa = randIntNZ(-r, r); pb = randIntNZ(-r, r);
          pc = randIntNZ(-r, r); pd = randIntNZ(-r, r);
        } while (pa === wa && pb === wb && pc === wc && pd === wd);
        const pRe = pa * pc - pb * pd;
        const pIm = pa * pd + pb * pc;

        return {
          teachingText:
            `With negatives everywhere, the process is exactly the same \u2014 ` +
            `FOIL then i\u00B2 = \u22121. The signs may feel tricky, but just ` +
            `track them carefully: negative times negative gives positive, ` +
            `negative times positive gives negative.`,
          workedExample: {
            problem: `(${fmtComplex(wa, wb)}) \u00D7 (${fmtComplex(wc, wd)})`,
            steps: [
              `FOIL: (${wa})(${wc}) + (${wa})(${wd}i) + (${wb}i)(${wc}) + (${wb}i)(${wd}i)`,
              `= ${wa * wc} + ${wa * wd}i + ${wb * wc}i + ${wb * wd}i\u00B2`,
              `Replace i\u00B2 = \u22121: ${wb * wd}i\u00B2 = ${-wb * wd}`,
              `Real part: ${wa * wc} + ${-wb * wd} = ${wRe}`,
              `Imaginary part: ${wa * wd} + ${wb * wc} = ${wIm}`,
              `Result: ${fmtComplex(wRe, wIm)}`,
            ],
            insight: `Negatives don't change the method \u2014 just be precise with sign tracking.`,
          },
          tryIt: {
            question: `(${fmtComplex(pa, pb)}) \u00D7 (${fmtComplex(pc, pd)})`,
            answer: [pRe, pIm],
            answerType: 'complex',
            answerDisplay: fmtComplex(pRe, pIm),
            steps: [
              `FOIL: (${pa})(${pc}) + (${pa})(${pd}i) + (${pb}i)(${pc}) + (${pb}i)(${pd}i)`,
              `= ${pa * pc} + ${pa * pd}i + ${pb * pc}i + ${pb * pd}i\u00B2`,
              `Replace i\u00B2 = \u22121: ${pb * pd}i\u00B2 = ${-pb * pd}`,
              `Real: ${pa * pc} + ${-pb * pd} = ${pRe}`,
              `Imaginary: ${pa * pd} + ${pb * pc} = ${pIm}`,
              `Answer: ${fmtComplex(pRe, pIm)}`,
            ],
            whyItMatters:
              `After applying sequences of quantum gates, amplitudes ` +
              `routinely pick up negative signs. You need to be ` +
              `comfortable multiplying complex numbers with mixed signs.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

complex_conjugate: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'basic': {
        const wa = randInt(-6, 6), wb = randIntNZ(-6, 6);
        let pa, pb;
        do {
          pa = randInt(-6, 6); pb = randIntNZ(-6, 6);
        } while (pa === wa && pb === wb);

        return {
          teachingText:
            `The conjugate of a complex number flips the sign of the imaginary part. ` +
            `If z = a + bi, then z* = a \u2212 bi. The real part stays the same. ` +
            `Think of it as reflecting across the real axis on the complex plane.`,
          workedExample: {
            problem: `Conjugate of ${fmtComplex(wa, wb)}`,
            steps: [
              `Identify the imaginary part: ${wb}i`,
              `Flip the sign of the imaginary part: ${wb} \u2192 ${-wb}`,
              `Keep the real part unchanged: ${wa}`,
              `Conjugate: ${fmtComplex(wa, -wb)}`,
            ],
            insight: `Only the imaginary part changes sign \u2014 the real part stays put.`,
          },
          tryIt: {
            question: `Conjugate of ${fmtComplex(pa, pb)} = ?`,
            answer: [pa, -pb],
            answerType: 'complex',
            answerDisplay: fmtComplex(pa, -pb),
            steps: [
              `Original: ${fmtComplex(pa, pb)}`,
              `Flip the sign of the imaginary part: ${pb} \u2192 ${-pb}`,
              `Answer: ${fmtComplex(pa, -pb)}`,
            ],
            whyItMatters:
              `Conjugates appear everywhere in quantum mechanics. The inner product ` +
              `\u27E8\u03C8|\u03C6\u27E9 uses conjugated amplitudes, and probabilities are computed ` +
              `as z \u00D7 z* = |z|\u00B2.`,
          },
        };
      }

      case 'pure_imaginary': {
        const wb = randIntNZ(-6, 6);
        let pb;
        do { pb = randIntNZ(-6, 6); } while (pb === wb);

        return {
          teachingText:
            `When a complex number has no real part (it's purely imaginary), ` +
            `the conjugate simply flips the sign. The conjugate of bi is \u2212bi. ` +
            `There's no real part to worry about.`,
          workedExample: {
            problem: `Conjugate of ${fmtComplex(0, wb)}`,
            steps: [
              `This is a purely imaginary number: 0 + ${wb}i`,
              `Flip the imaginary sign: ${wb} \u2192 ${-wb}`,
              `Conjugate: ${fmtComplex(0, -wb)}`,
            ],
            insight: `Pure imaginary numbers just get their sign flipped.`,
          },
          tryIt: {
            question: `Conjugate of ${fmtComplex(0, pb)} = ?`,
            answer: [0, -pb],
            answerType: 'complex',
            answerDisplay: fmtComplex(0, -pb),
            steps: [
              `Original: ${fmtComplex(0, pb)}`,
              `Flip imaginary sign: ${pb} \u2192 ${-pb}`,
              `Answer: ${fmtComplex(0, -pb)}`,
            ],
            whyItMatters:
              `Pure imaginary amplitudes arise after certain gate applications. ` +
              `The Y gate, for example, produces purely imaginary components.`,
          },
        };
      }

      case 'double_conjugate': {
        const wa = randInt(-6, 6), wb = randIntNZ(-6, 6);
        let pa, pb;
        do {
          pa = randInt(-6, 6); pb = randIntNZ(-6, 6);
        } while (pa === wa && pb === wb);

        return {
          teachingText:
            `What happens when you take the conjugate twice? The first conjugate ` +
            `flips the imaginary sign, and the second flips it back. So the ` +
            `conjugate of the conjugate is the original number: (z*)* = z.`,
          workedExample: {
            problem: `Conjugate of the conjugate of ${fmtComplex(wa, wb)}`,
            steps: [
              `Start: z = ${fmtComplex(wa, wb)}`,
              `First conjugate: z* = ${fmtComplex(wa, -wb)}`,
              `Second conjugate: (z*)* = ${fmtComplex(wa, wb)}`,
              `Double conjugate returns the original number.`,
            ],
            insight: `Conjugation is its own inverse \u2014 doing it twice gets you back to where you started.`,
          },
          tryIt: {
            question: `What is the conjugate of the conjugate of ${fmtComplex(pa, pb)}?`,
            answer: [pa, pb],
            answerType: 'complex',
            answerDisplay: fmtComplex(pa, pb),
            steps: [
              `Start: z = ${fmtComplex(pa, pb)}`,
              `First conjugate: z* = ${fmtComplex(pa, -pb)}`,
              `Second conjugate: (z*)* = ${fmtComplex(pa, pb)}`,
              `Answer: ${fmtComplex(pa, pb)}`,
            ],
            whyItMatters:
              `This identity (z*)*= z is used in proofs throughout quantum ` +
              `mechanics. It guarantees that inner products and measurement ` +
              `probabilities behave consistently.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

complex_magnitude: {
  generate(difficulty, variation) {
    const triples = [[3,4,5],[5,12,13],[6,8,10],[4,3,5],[8,6,10]];

    switch (variation) {

      case 'basic': {
        const [wta, wtb, wtm] = triples[randInt(0, triples.length - 1)];
        const wa = difficulty > 1 && Math.random() > 0.5 ? -wta : wta;
        const wb = difficulty > 1 && Math.random() > 0.5 ? -wtb : wtb;

        let pa, pb, ptm;
        do {
          const [pta, ptb, pm] = triples[randInt(0, triples.length - 1)];
          pa = difficulty > 1 && Math.random() > 0.5 ? -pta : pta;
          pb = difficulty > 1 && Math.random() > 0.5 ? -ptb : ptb;
          ptm = pm;
        } while (Math.abs(pa) === Math.abs(wa) && Math.abs(pb) === Math.abs(wb));

        return {
          teachingText:
            `The magnitude (or modulus) of a complex number a + bi is its distance ` +
            `from the origin: |a + bi| = \u221A(a\u00B2 + b\u00B2). It's just the ` +
            `Pythagorean theorem on the complex plane. The magnitude is always ` +
            `a non-negative real number.`,
          workedExample: {
            problem: `|${fmtComplex(wa, wb)}|`,
            steps: [
              `Formula: |a + bi| = \u221A(a\u00B2 + b\u00B2)`,
              `Square each part: ${wa}\u00B2 = ${wa * wa}, ${wb}\u00B2 = ${wb * wb}`,
              `Add: ${wa * wa} + ${wb * wb} = ${wa * wa + wb * wb}`,
              `Square root: \u221A${wa * wa + wb * wb} = ${wtm}`,
            ],
            insight: `It's just the Pythagorean theorem \u2014 a, b are the legs and the magnitude is the hypotenuse.`,
          },
          tryIt: {
            question: `|${fmtComplex(pa, pb)}| = ?`,
            answer: ptm,
            answerType: 'numeric',
            answerDisplay: `${ptm}`,
            steps: [
              `Formula: |a + bi| = \u221A(a\u00B2 + b\u00B2)`,
              `Square each: ${pa}\u00B2 = ${pa * pa}, ${pb}\u00B2 = ${pb * pb}`,
              `Add: ${pa * pa} + ${pb * pb} = ${pa * pa + pb * pb}`,
              `Square root: \u221A${pa * pa + pb * pb} = ${ptm}`,
              `Answer: ${ptm}`,
            ],
            whyItMatters:
              `In quantum mechanics, the magnitude squared |z|\u00B2 gives the ` +
              `probability of measuring a particular state. Magnitudes must ` +
              `be computed correctly to predict measurement outcomes.`,
          },
        };
      }

      case 'with_negatives': {
        const [wta, wtb, wtm] = triples[randInt(0, triples.length - 1)];
        const wa = Math.random() > 0.5 ? -wta : wta;
        const wb = Math.random() > 0.5 ? -wtb : wtb;

        let pa, pb, ptm;
        do {
          const [pta, ptb, pm] = triples[randInt(0, triples.length - 1)];
          pa = Math.random() > 0.5 ? -pta : pta;
          pb = Math.random() > 0.5 ? -ptb : ptb;
          ptm = pm;
        } while (Math.abs(pa) === Math.abs(wa) && Math.abs(pb) === Math.abs(wb));

        return {
          teachingText:
            `Negative signs don't affect the magnitude \u2014 because you're squaring ` +
            `each component, the sign disappears. |\u22123 + 4i| = |3 + 4i| = 5. ` +
            `This makes sense geometrically: distance is always positive.`,
          workedExample: {
            problem: `|${fmtComplex(wa, wb)}|`,
            steps: [
              `Formula: |a + bi| = \u221A(a\u00B2 + b\u00B2)`,
              `Square each part: (${wa})\u00B2 = ${wa * wa}, (${wb})\u00B2 = ${wb * wb}`,
              `Negatives vanish when squared!`,
              `Add: ${wa * wa} + ${wb * wb} = ${wa * wa + wb * wb}`,
              `Square root: \u221A${wa * wa + wb * wb} = ${wtm}`,
            ],
            insight: `Squaring eliminates the sign \u2014 so negatives don't affect the magnitude.`,
          },
          tryIt: {
            question: `|${fmtComplex(pa, pb)}| = ?`,
            answer: ptm,
            answerType: 'numeric',
            answerDisplay: `${ptm}`,
            steps: [
              `Formula: |a + bi| = \u221A(a\u00B2 + b\u00B2)`,
              `Square each: (${pa})\u00B2 = ${pa * pa}, (${pb})\u00B2 = ${pb * pb}`,
              `Add: ${pa * pa} + ${pb * pb} = ${pa * pa + pb * pb}`,
              `Square root: \u221A${pa * pa + pb * pb} = ${ptm}`,
              `Answer: ${ptm}`,
            ],
            whyItMatters:
              `Quantum states often have negative amplitudes (e.g. after a Z gate). ` +
              `The magnitude is what determines probability, and it's always positive ` +
              `regardless of the amplitude's sign.`,
          },
        };
      }

      case 'pure_real_or_imag': {
        const wVal = randInt(1, 12);
        const wUseReal = Math.random() > 0.5;
        const wa = wUseReal ? wVal : 0;
        const wb = wUseReal ? 0 : wVal;

        let pVal, pUseReal;
        do {
          pVal = randInt(1, 12);
          pUseReal = Math.random() > 0.5;
        } while (pVal === wVal && pUseReal === wUseReal);
        const pa = pUseReal ? pVal : 0;
        const pb = pUseReal ? 0 : pVal;

        return {
          teachingText:
            `When one component is zero, the magnitude is simply the absolute ` +
            `value of the other component. |5| = 5, |3i| = 3. ` +
            `The Pythagorean formula still works: \u221A(5\u00B2 + 0\u00B2) = 5.`,
          workedExample: {
            problem: `|${fmtComplex(wa, wb)}|`,
            steps: [
              `Formula: |a + bi| = \u221A(a\u00B2 + b\u00B2)`,
              `Square each: ${wa}\u00B2 = ${wa * wa}, ${wb}\u00B2 = ${wb * wb}`,
              `Add: ${wa * wa} + ${wb * wb} = ${wa * wa + wb * wb}`,
              `Square root: \u221A${wa * wa + wb * wb} = ${wVal}`,
            ],
            insight: `With one component zero, the magnitude is just the absolute value of the non-zero part.`,
          },
          tryIt: {
            question: `|${fmtComplex(pa, pb)}| = ?`,
            answer: pVal,
            answerType: 'numeric',
            answerDisplay: `${pVal}`,
            steps: [
              `Formula: |a + bi| = \u221A(a\u00B2 + b\u00B2)`,
              `Square each: ${pa}\u00B2 = ${pa * pa}, ${pb}\u00B2 = ${pb * pb}`,
              `Add: ${pa * pa} + ${pb * pb} = ${pa * pa + pb * pb}`,
              `Square root: \u221A${pa * pa + pb * pb} = ${pVal}`,
              `Answer: ${pVal}`,
            ],
            whyItMatters:
              `Many quantum states have purely real amplitudes (like the ` +
              `computational basis states). Recognizing that the magnitude ` +
              `of a real number is just its absolute value saves time.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

// ── Chapter 5: Matrices ────────────────────────────────────────────────────

matrix_vector_multiply: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'basic': {
        const r = difficulty < 2 ? 3 : 5;
        const lo = difficulty < 2 ? 0 : -r;
        const wa = randInt(lo, r), wbb = randInt(lo, r), wc = randInt(lo, r), we = randInt(lo, r);
        const wx = randInt(difficulty < 2 ? 1 : -r, r), wy = randInt(difficulty < 2 ? 1 : -r, r);
        const wr1 = wa * wx + wbb * wy, wr2 = wc * wx + we * wy;

        let pa, pb, pc, pe, px, py;
        do {
          pa = randInt(lo, r); pb = randInt(lo, r); pc = randInt(lo, r); pe = randInt(lo, r);
          px = randInt(difficulty < 2 ? 1 : -r, r); py = randInt(difficulty < 2 ? 1 : -r, r);
        } while (pa === wa && pb === wbb && pc === wc && pe === we && px === wx && py === wy);
        const pr1 = pa * px + pb * py, pr2 = pc * px + pe * py;

        return {
          teachingText:
            `To multiply a 2\u00D72 matrix by a vector, take the dot product of each ` +
            `row with the vector. Row 1 gives the first output element, row 2 gives ` +
            `the second. Think of each row as a recipe: it tells you how much of ` +
            `each input to mix together.`,
          workedExample: {
            problem: `[[${wa},${wbb}],[${wc},${we}]] \u00D7 (${wx},${wy})`,
            steps: [
              `Dot row 1 with the vector:`,
              `${wa}\u00D7${wx} + ${wbb}\u00D7${wy} = ${wa * wx} + ${wbb * wy} = ${wr1}`,
              `Dot row 2 with the vector:`,
              `${wc}\u00D7${wx} + ${we}\u00D7${wy} = ${wc * wx} + ${we * wy} = ${wr2}`,
              `Result: (${wr1}, ${wr2})`,
            ],
            insight: `Each row produces one output element \u2014 it's just two dot products.`,
          },
          tryIt: {
            question: `[[${pa},${pb}],[${pc},${pe}]] \u00D7 (${px},${py}) = ?`,
            answer: [pr1, pr2],
            answerType: 'vector',
            answerDisplay: `(${pr1}, ${pr2})`,
            steps: [
              `Row 1: ${pa}\u00D7${px} + ${pb}\u00D7${py} = ${pa * px} + ${pb * py} = ${pr1}`,
              `Row 2: ${pc}\u00D7${px} + ${pe}\u00D7${py} = ${pc * px} + ${pe * py} = ${pr2}`,
              `Answer: (${pr1}, ${pr2})`,
            ],
            whyItMatters:
              `Every quantum gate is a matrix, and every qubit state is a vector. ` +
              `Applying a gate means multiplying the gate matrix by the state vector. ` +
              `This is the single most important operation in quantum computing.`,
          },
        };
      }

      case 'with_negatives': {
        const r = 3;
        const wa = randInt(-3, r), wbb = randInt(-3, r), wc = randInt(-3, r), we = randInt(-3, r);
        const wx = randInt(-3, r), wy = randInt(-3, r);
        const wr1 = wa * wx + wbb * wy, wr2 = wc * wx + we * wy;

        let pa, pb, pc, pe, px, py;
        do {
          pa = randInt(-3, r); pb = randInt(-3, r); pc = randInt(-3, r); pe = randInt(-3, r);
          px = randInt(-3, r); py = randInt(-3, r);
        } while (pa === wa && pb === wbb && pc === wc && pe === we && px === wx && py === wy);
        const pr1 = pa * px + pb * py, pr2 = pc * px + pe * py;

        return {
          teachingText:
            `With negative entries, the process is identical \u2014 dot each row with ` +
            `the vector. Just track signs carefully when multiplying and adding. ` +
            `Negative times negative is positive; negative times positive is negative.`,
          workedExample: {
            problem: `[[${wa},${wbb}],[${wc},${we}]] \u00D7 (${wx},${wy})`,
            steps: [
              `Row 1: ${wa}\u00D7${wx} + ${wbb}\u00D7${wy} = ${wa * wx} + ${wbb * wy} = ${wr1}`,
              `Row 2: ${wc}\u00D7${wx} + ${we}\u00D7${wy} = ${wc * wx} + ${we * wy} = ${wr2}`,
              `Result: (${wr1}, ${wr2})`,
            ],
            insight: `Negatives don't change the algorithm \u2014 just be careful with sign arithmetic.`,
          },
          tryIt: {
            question: `[[${pa},${pb}],[${pc},${pe}]] \u00D7 (${px},${py}) = ?`,
            answer: [pr1, pr2],
            answerType: 'vector',
            answerDisplay: `(${pr1}, ${pr2})`,
            steps: [
              `Row 1: ${pa}\u00D7${px} + ${pb}\u00D7${py} = ${pa * px} + ${pb * py} = ${pr1}`,
              `Row 2: ${pc}\u00D7${px} + ${pe}\u00D7${py} = ${pc * px} + ${pe * py} = ${pr2}`,
              `Answer: (${pr1}, ${pr2})`,
            ],
            whyItMatters:
              `Quantum gates like Z = [[1,0],[0,\u22121]] have negative entries. ` +
              `Applying Z to a state flips the sign of the second amplitude. ` +
              `You need to handle negatives to work with real quantum gates.`,
          },
        };
      }

      case 'identity_check':
      case 'identity_matrix': {
        const r = 5;
        const wx = randInt(1, r), wy = randInt(1, r);

        let px, py;
        do {
          px = randInt(1, r); py = randInt(1, r);
        } while (px === wx && py === wy);

        return {
          teachingText:
            `The identity matrix I = [[1,0],[0,1]] leaves any vector unchanged: ` +
            `I \u00D7 v = v. This is because row 1 is (1, 0), which picks out the ` +
            `first element, and row 2 is (0, 1), which picks out the second. ` +
            `It's the matrix equivalent of multiplying by 1.`,
          workedExample: {
            problem: `[[1,0],[0,1]] \u00D7 (${wx},${wy})`,
            steps: [
              `Row 1: 1\u00D7${wx} + 0\u00D7${wy} = ${wx} + 0 = ${wx}`,
              `Row 2: 0\u00D7${wx} + 1\u00D7${wy} = 0 + ${wy} = ${wy}`,
              `Result: (${wx}, ${wy}) \u2014 the original vector!`,
            ],
            insight: `The identity matrix is like multiplying by 1 \u2014 the vector comes out unchanged.`,
          },
          tryIt: {
            question: `[[1,0],[0,1]] \u00D7 (${px},${py}) = ?`,
            answer: [px, py],
            answerType: 'vector',
            answerDisplay: `(${px}, ${py})`,
            steps: [
              `Row 1: 1\u00D7${px} + 0\u00D7${py} = ${px}`,
              `Row 2: 0\u00D7${px} + 1\u00D7${py} = ${py}`,
              `Answer: (${px}, ${py})`,
            ],
            whyItMatters:
              `The identity gate (doing nothing to a qubit) is represented by I. ` +
              `Understanding that I leaves the state unchanged is fundamental \u2014 ` +
              `it's the baseline that all other gates are compared against.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

matrix_matrix_multiply: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'basic': {
        const r = difficulty < 2 ? 3 : 4;
        const lo = difficulty < 2 ? 0 : -r;
        const wa = randInt(lo,r), wbb = randInt(lo,r), wc = randInt(lo,r), we = randInt(lo,r);
        const wf = randInt(lo,r), wg = randInt(lo,r), wh = randInt(lo,r), wk = randInt(lo,r);
        const w11 = wa*wf+wbb*wh, w12 = wa*wg+wbb*wk, w21 = wc*wf+we*wh, w22 = wc*wg+we*wk;

        let pa, pb, pc, pe, pf, pg, ph, pk;
        do {
          pa = randInt(lo,r); pb = randInt(lo,r); pc = randInt(lo,r); pe = randInt(lo,r);
          pf = randInt(lo,r); pg = randInt(lo,r); ph = randInt(lo,r); pk = randInt(lo,r);
        } while (pa === wa && pb === wbb && pf === wf && pg === wg);
        const p11 = pa*pf+pb*ph, p12 = pa*pg+pb*pk, p21 = pc*pf+pe*ph, p22 = pc*pg+pe*pk;

        return {
          teachingText:
            `To multiply two 2\u00D72 matrices, each element in the result is a dot product: ` +
            `take a row from the first matrix and a column from the second. ` +
            `There are 4 elements in the output, so you compute 4 dot products.`,
          workedExample: {
            problem: `[[${wa},${wbb}],[${wc},${we}]] \u00D7 [[${wf},${wg}],[${wh},${wk}]]`,
            steps: [
              `Top-left:  ${wa}\u00D7${wf} + ${wbb}\u00D7${wh} = ${wa*wf} + ${wbb*wh} = ${w11}`,
              `Top-right: ${wa}\u00D7${wg} + ${wbb}\u00D7${wk} = ${wa*wg} + ${wbb*wk} = ${w12}`,
              `Bot-left:  ${wc}\u00D7${wf} + ${we}\u00D7${wh} = ${wc*wf} + ${we*wh} = ${w21}`,
              `Bot-right: ${wc}\u00D7${wg} + ${we}\u00D7${wk} = ${wc*wg} + ${we*wk} = ${w22}`,
              `Result: [[${w11}, ${w12}], [${w21}, ${w22}]]`,
            ],
            insight: `Row of first \u00D7 column of second \u2014 four dot products give the four entries.`,
          },
          tryIt: {
            question: `[[${pa},${pb}],[${pc},${pe}]] \u00D7 [[${pf},${pg}],[${ph},${pk}]] = ?\n(format: a b; c d)`,
            answer: [[p11, p12], [p21, p22]],
            answerType: 'matrix',
            answerDisplay: `${p11} ${p12}; ${p21} ${p22}`,
            steps: [
              `Top-left:  ${pa}\u00D7${pf} + ${pb}\u00D7${ph} = ${pa*pf} + ${pb*ph} = ${p11}`,
              `Top-right: ${pa}\u00D7${pg} + ${pb}\u00D7${pk} = ${pa*pg} + ${pb*pk} = ${p12}`,
              `Bot-left:  ${pc}\u00D7${pf} + ${pe}\u00D7${ph} = ${pc*pf} + ${pe*ph} = ${p21}`,
              `Bot-right: ${pc}\u00D7${pg} + ${pe}\u00D7${pk} = ${pc*pg} + ${pe*pk} = ${p22}`,
              `Answer: [[${p11}, ${p12}], [${p21}, ${p22}]]`,
            ],
            whyItMatters:
              `Applying two quantum gates in sequence is matrix multiplication. ` +
              `If you apply gate U then gate V, the combined effect is V \u00D7 U. ` +
              `Circuit optimization relies on combining matrices this way.`,
          },
        };
      }

      case 'with_negatives': {
        const r = 3;
        const wa = randInt(-3,r), wbb = randInt(-3,r), wc = randInt(-3,r), we = randInt(-3,r);
        const wf = randInt(-3,r), wg = randInt(-3,r), wh = randInt(-3,r), wk = randInt(-3,r);
        const w11 = wa*wf+wbb*wh, w12 = wa*wg+wbb*wk, w21 = wc*wf+we*wh, w22 = wc*wg+we*wk;

        let pa, pb, pc, pe, pf, pg, ph, pk;
        do {
          pa = randInt(-3,r); pb = randInt(-3,r); pc = randInt(-3,r); pe = randInt(-3,r);
          pf = randInt(-3,r); pg = randInt(-3,r); ph = randInt(-3,r); pk = randInt(-3,r);
        } while (pa === wa && pb === wbb && pf === wf && pg === wg);
        const p11 = pa*pf+pb*ph, p12 = pa*pg+pb*pk, p21 = pc*pf+pe*ph, p22 = pc*pg+pe*pk;

        return {
          teachingText:
            `With negative matrix entries, the dot product arithmetic gets trickier, ` +
            `but the algorithm is the same: row \u00D7 column for each output entry. ` +
            `Watch your signs when multiplying and adding.`,
          workedExample: {
            problem: `[[${wa},${wbb}],[${wc},${we}]] \u00D7 [[${wf},${wg}],[${wh},${wk}]]`,
            steps: [
              `Top-left:  ${wa}\u00D7${wf} + ${wbb}\u00D7${wh} = ${wa*wf} + ${wbb*wh} = ${w11}`,
              `Top-right: ${wa}\u00D7${wg} + ${wbb}\u00D7${wk} = ${wa*wg} + ${wbb*wk} = ${w12}`,
              `Bot-left:  ${wc}\u00D7${wf} + ${we}\u00D7${wh} = ${wc*wf} + ${we*wh} = ${w21}`,
              `Bot-right: ${wc}\u00D7${wg} + ${we}\u00D7${wk} = ${wc*wg} + ${we*wk} = ${w22}`,
              `Result: [[${w11}, ${w12}], [${w21}, ${w22}]]`,
            ],
            insight: `Same four dot products \u2014 just more sign tracking.`,
          },
          tryIt: {
            question: `[[${pa},${pb}],[${pc},${pe}]] \u00D7 [[${pf},${pg}],[${ph},${pk}]] = ?\n(format: a b; c d)`,
            answer: [[p11, p12], [p21, p22]],
            answerType: 'matrix',
            answerDisplay: `${p11} ${p12}; ${p21} ${p22}`,
            steps: [
              `Top-left:  ${pa}\u00D7${pf} + ${pb}\u00D7${ph} = ${pa*pf} + ${pb*ph} = ${p11}`,
              `Top-right: ${pa}\u00D7${pg} + ${pb}\u00D7${pk} = ${pa*pg} + ${pb*pk} = ${p12}`,
              `Bot-left:  ${pc}\u00D7${pf} + ${pe}\u00D7${ph} = ${pc*pf} + ${pe*ph} = ${p21}`,
              `Bot-right: ${pc}\u00D7${pg} + ${pe}\u00D7${pk} = ${pc*pg} + ${pe*pk} = ${p22}`,
              `Answer: [[${p11}, ${p12}], [${p21}, ${p22}]]`,
            ],
            whyItMatters:
              `Most quantum gates have negative entries \u2014 the Hadamard gate ` +
              `has \u22121/\u221A2 in the bottom-right. Composing gates with negatives ` +
              `is routine in quantum circuit design.`,
          },
        };
      }

      case 'identity_check':
      case 'identity_product': {
        const r = 4;
        const wa = randInt(0,r), wbb = randInt(0,r), wc = randInt(0,r), we = randInt(0,r);
        const wLeft = Math.random() > 0.5;

        let pa, pb, pc, pe, pLeft;
        do {
          pa = randInt(0,r); pb = randInt(0,r); pc = randInt(0,r); pe = randInt(0,r);
          pLeft = Math.random() > 0.5;
        } while (pa === wa && pb === wbb && pc === wc && pe === we);

        const wProblem = wLeft
          ? `[[${wa},${wbb}],[${wc},${we}]] \u00D7 [[1,0],[0,1]]`
          : `[[1,0],[0,1]] \u00D7 [[${wa},${wbb}],[${wc},${we}]]`;
        const pProblem = pLeft
          ? `[[${pa},${pb}],[${pc},${pe}]] \u00D7 [[1,0],[0,1]]`
          : `[[1,0],[0,1]] \u00D7 [[${pa},${pb}],[${pc},${pe}]]`;

        return {
          teachingText:
            `Multiplying any matrix by the identity matrix I = [[1,0],[0,1]] ` +
            `returns the original matrix: A \u00D7 I = I \u00D7 A = A. ` +
            `This works from either side. The identity matrix is the "do nothing" ` +
            `operation for matrices.`,
          workedExample: {
            problem: wProblem,
            steps: [
              `The identity matrix I leaves any matrix unchanged.`,
              `A \u00D7 I = A, and I \u00D7 A = A.`,
              `Result: [[${wa}, ${wbb}], [${wc}, ${we}]]`,
            ],
            insight: `I is the matrix version of the number 1 \u2014 it never changes anything.`,
          },
          tryIt: {
            question: `${pProblem} = ?\n(format: a b; c d)`,
            answer: [[pa, pb], [pc, pe]],
            answerType: 'matrix',
            answerDisplay: `${pa} ${pb}; ${pc} ${pe}`,
            steps: [
              `The identity matrix I leaves any matrix unchanged.`,
              `A \u00D7 I = I \u00D7 A = A.`,
              `Answer: [[${pa}, ${pb}], [${pc}, ${pe}]]`,
            ],
            whyItMatters:
              `The identity gate in a quantum circuit means "do nothing." ` +
              `Recognizing when a gate product simplifies to I (like U \u00D7 U\u207B\u00B9) ` +
              `is key to simplifying quantum circuits.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

identity_matrix: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'basic': {
        const askForI = Math.random() > 0.5;

        if (askForI) {
          // Ask: "What is the 2x2 identity matrix?"
          return {
            teachingText:
              `The identity matrix has 1s on the main diagonal (top-left to bottom-right) ` +
              `and 0s everywhere else. For a 2\u00D72 matrix: I = [[1,0],[0,1]]. ` +
              `It's special because multiplying any matrix or vector by I leaves it unchanged.`,
            workedExample: {
              problem: `What is the 2\u00D72 identity matrix?`,
              steps: [
                `The diagonal elements (top-left, bottom-right) are 1.`,
                `The off-diagonal elements (top-right, bottom-left) are 0.`,
                `I = [[1, 0], [0, 1]]`,
              ],
              insight: `1s on the diagonal, 0s off the diagonal \u2014 that's the identity matrix.`,
            },
            tryIt: {
              question: `What is the 2\u00D72 identity matrix?\n(format: a b; c d)`,
              answer: [[1, 0], [0, 1]],
              answerType: 'matrix',
              answerDisplay: `1 0; 0 1`,
              steps: [
                `Diagonal entries are 1.`,
                `Off-diagonal entries are 0.`,
                `Answer: [[1, 0], [0, 1]]`,
              ],
              whyItMatters:
                `The identity matrix represents "do nothing" in quantum computing. ` +
                `When a qubit isn't being operated on, it's implicitly having I applied to it. ` +
                `Every quantum circuit starts from this baseline.`,
            },
          };
        }

        // Ask: A × I = ?
        const wa = randInt(1, 5), wbb = randInt(0, 4), wc = randInt(0, 4), we = randInt(1, 5);
        let pa, pb, pc, pe;
        do {
          pa = randInt(1, 5); pb = randInt(0, 4); pc = randInt(0, 4); pe = randInt(1, 5);
        } while (pa === wa && pb === wbb && pc === wc && pe === we);

        return {
          teachingText:
            `The identity matrix I = [[1,0],[0,1]] has a defining property: ` +
            `multiplying any matrix A by I gives A back. A \u00D7 I = A. ` +
            `It's the matrix equivalent of multiplying a number by 1.`,
          workedExample: {
            problem: `[[${wa},${wbb}],[${wc},${we}]] \u00D7 I = ?`,
            steps: [
              `Multiplying by I leaves the matrix unchanged.`,
              `A \u00D7 I = A`,
              `Result: [[${wa}, ${wbb}], [${wc}, ${we}]]`,
            ],
            insight: `A \u00D7 I = A, always. No computation needed!`,
          },
          tryIt: {
            question: `[[${pa},${pb}],[${pc},${pe}]] \u00D7 I = ?\n(format: a b; c d)`,
            answer: [[pa, pb], [pc, pe]],
            answerType: 'matrix',
            answerDisplay: `${pa} ${pb}; ${pc} ${pe}`,
            steps: [
              `A \u00D7 I = A`,
              `The matrix is unchanged.`,
              `Answer: [[${pa}, ${pb}], [${pc}, ${pe}]]`,
            ],
            whyItMatters:
              `Recognizing A \u00D7 I = A lets you simplify circuits instantly. ` +
              `If a gate sequence reduces to I, you can remove it entirely.`,
          },
        };
      }

      case 'three_by_three': {
        // In our 2x2 context, just ask "What is the 2x2 identity matrix?"
        return {
          teachingText:
            `The identity matrix is defined for any size. For a 2\u00D72 matrix, ` +
            `I = [[1,0],[0,1]]. The pattern generalizes: 1s on the diagonal, ` +
            `0s everywhere else. A 3\u00D73 identity would be [[1,0,0],[0,1,0],[0,0,1]].`,
          workedExample: {
            problem: `What is the 2\u00D72 identity matrix?`,
            steps: [
              `Place 1s on the main diagonal.`,
              `Place 0s on all off-diagonal positions.`,
              `I = [[1, 0], [0, 1]]`,
            ],
            insight: `The pattern is always the same: 1s on the diagonal, 0s off it.`,
          },
          tryIt: {
            question: `What is the 2\u00D72 identity matrix?\n(format: a b; c d)`,
            answer: [[1, 0], [0, 1]],
            answerType: 'matrix',
            answerDisplay: `1 0; 0 1`,
            steps: [
              `Diagonal entries: 1`,
              `Off-diagonal entries: 0`,
              `Answer: [[1, 0], [0, 1]]`,
            ],
            whyItMatters:
              `In quantum computing, single-qubit gates are 2\u00D72 matrices. ` +
              `Multi-qubit systems use larger identity matrices via tensor products. ` +
              `Knowing the identity pattern at any size is essential.`,
          },
        };
      }

      case 'varied_matrix':
      case 'verify_property': {
        const wa = randInt(1, 9), wbb = randInt(0, 9), wc = randInt(0, 9), we = randInt(1, 9);
        let pa, pb, pc, pe;
        do {
          pa = randInt(1, 9); pb = randInt(0, 9); pc = randInt(0, 9); pe = randInt(1, 9);
        } while (pa === wa && pb === wbb && pc === wc && pe === we);

        return {
          teachingText:
            `The identity property says A \u00D7 I = A for any matrix A. ` +
            `You don't need to do any multiplication \u2014 the answer is just A itself. ` +
            `This property is what makes I special among all matrices.`,
          workedExample: {
            problem: `[[${wa},${wbb}],[${wc},${we}]] \u00D7 I = ?`,
            steps: [
              `The identity matrix I leaves any matrix unchanged.`,
              `A \u00D7 I = A`,
              `Result: [[${wa}, ${wbb}], [${wc}, ${we}]]`,
            ],
            insight: `No computation required \u2014 A times I is always just A.`,
          },
          tryIt: {
            question: `[[${pa},${pb}],[${pc},${pe}]] \u00D7 I = ?\n(format: a b; c d)`,
            answer: [[pa, pb], [pc, pe]],
            answerType: 'matrix',
            answerDisplay: `${pa} ${pb}; ${pc} ${pe}`,
            steps: [
              `A \u00D7 I = A (identity property)`,
              `Answer: [[${pa}, ${pb}], [${pc}, ${pe}]]`,
            ],
            whyItMatters:
              `When you see U \u00D7 U\u2020 = I in quantum computing, it means ` +
              `the gate U is reversible. This identity property is how we verify ` +
              `that quantum gates are unitary.`,
          },
        };
      }

      default:
        return null;
    }
  },
},

// ── Chapter 6: Dirac Notation ─────────────────────────────────────────────────

ket_to_vector: {
  generate(difficulty, variation) {
    const triples = [[3,4,5],[4,3,5],[5,12,13],[6,8,10],[8,6,10]];

    function makeNums(v) {
      if (v === 'decimal' || v === 'superposition') {
        const [ta, tb, tm] = triples[randInt(0, triples.length - 1)];
        return [Math.round((ta / tm) * 100) / 100, Math.round((tb / tm) * 100) / 100];
      }
      if (v === 'with_negatives' || v === 'minus_state') {
        return [randIntNZ(-6, 6), randIntNZ(-6, 6)];
      }
      // basic
      return [randInt(1, 6), randInt(1, 6)];
    }

    switch (variation) {

      case 'basic':
      case 'with_negatives':
      case 'decimal':
      case 'superposition':
      case 'minus_state': {
        const [wa, wb] = makeNums(variation);
        let pa, pb;
        do { [pa, pb] = makeNums(variation); } while (pa === wa && pb === wb);

        const teachingMap = {
          basic:
            `In Dirac notation, |0\u27E9 and |1\u27E9 are the two basis states of a qubit. ` +
            `As column vectors, |0\u27E9 = (1, 0) and |1\u27E9 = (0, 1). ` +
            `A state \u03B1|0\u27E9 + \u03B2|1\u27E9 simply means "take \u03B1 of the first slot ` +
            `and \u03B2 of the second slot," giving the vector (\u03B1, \u03B2). ` +
            `This is the bridge between abstract Dirac notation and concrete vectors you can compute with.`,
          with_negatives:
            `Qubit amplitudes can be negative. A minus sign in front of a basis ` +
            `state flips its amplitude. The conversion rule is the same: ` +
            `\u03B1|0\u27E9 + \u03B2|1\u27E9 = (\u03B1, \u03B2), where \u03B1 or \u03B2 may be negative. ` +
            `Negative amplitudes are physically meaningful \u2014 they lead to destructive ` +
            `interference, one of quantum computing's key resources.`,
          decimal:
            `Real quantum states use amplitudes that are often decimals, not whole ` +
            `numbers. A valid qubit state must satisfy |\u03B1|\u00B2 + |\u03B2|\u00B2 = 1, which ` +
            `forces non-integer values. The conversion rule stays the same: ` +
            `\u03B1|0\u27E9 + \u03B2|1\u27E9 = (\u03B1, \u03B2). These decimals often come from ` +
            `Pythagorean triples like 3-4-5, giving amplitudes like 0.6 and 0.8.`,
          superposition:
            `Superposition states have amplitudes that are decimals satisfying ` +
            `|\u03B1|\u00B2 + |\u03B2|\u00B2 = 1. The conversion is still \u03B1|0\u27E9 + \u03B2|1\u27E9 = (\u03B1, \u03B2). ` +
            `These amplitudes encode the probability of measuring each outcome: ` +
            `P(|0\u27E9) = \u03B1\u00B2 and P(|1\u27E9) = \u03B2\u00B2.`,
          minus_state:
            `The "minus state" |−\u27E9 = (1/\u221A2)|0\u27E9 − (1/\u221A2)|1\u27E9 is a key ` +
            `quantum state. The negative sign causes destructive interference ` +
            `under certain gates. Converting still follows \u03B1|0\u27E9 + \u03B2|1\u27E9 = (\u03B1, \u03B2) ` +
            `\u2014 the minus sign simply makes \u03B2 negative.`,
        };

        const fmtCoeff = (n) => Number.isInteger(n) ? `${n}` : `${n}`;
        const fmtTerm = (c, ket) => {
          if (c === 1) return `|${ket}\u27E9`;
          if (c === -1) return `\u2212|${ket}\u27E9`;
          if (c < 0) return `\u2212 ${Math.abs(c)}|${ket}\u27E9`;
          return `${c}|${ket}\u27E9`;
        };
        const fmtState = (a, b) => {
          const t0 = fmtTerm(a, '0');
          if (b < 0) return `${t0} \u2212 ${Math.abs(b)}|1\u27E9`;
          return `${t0} + ${b}|1\u27E9`;
        };

        return {
          teachingText: teachingMap[variation] || teachingMap['basic'],
          workedExample: {
            problem: `Write ${fmtState(wa, wb)} as a vector (x, y)`,
            steps: [
              `Recall: |0\u27E9 = (1, 0) and |1\u27E9 = (0, 1)`,
              `\u03B1|0\u27E9 + \u03B2|1\u27E9 = (\u03B1, \u03B2)`,
              `Here \u03B1 = ${wa}, \u03B2 = ${wb}`,
              `Result: (${wa}, ${wb})`,
            ],
            insight: `The coefficients in front of |0\u27E9 and |1\u27E9 become the vector entries directly.`,
          },
          tryIt: {
            question: `Write ${fmtState(pa, pb)} as a vector (x, y):`,
            answer: [pa, pb],
            answerType: 'vector',
            answerDisplay: `(${pa}, ${pb})`,
            steps: [
              `|0\u27E9 = (1, 0) and |1\u27E9 = (0, 1)`,
              `\u03B1 = ${pa}, \u03B2 = ${pb}`,
              `Answer: (${pa}, ${pb})`,
            ],
            whyItMatters:
              `Converting between Dirac notation and vectors is the most fundamental ` +
              `skill in quantum computing. Every gate, measurement, and algorithm ` +
              `operates on these vectors \u2014 Dirac notation is just a compact way to write them.`,
          },
        };
      }

      default: return null;
    }
  },
},

inner_product: {
  generate(difficulty, variation) {
    function makeNums(v) {
      if (v === 'with_negatives') {
        return [randIntNZ(-5, 5), randIntNZ(-5, 5), randIntNZ(-5, 5), randIntNZ(-5, 5)];
      }
      if (v === 'orthogonal' || v === 'orthogonal_pair') {
        const a1 = randIntNZ(1, 5), a2 = randIntNZ(1, 5);
        let b1, b2;
        if (Math.random() > 0.5) { b1 = -a2; b2 = a1; }
        else { b1 = a2; b2 = -a1; }
        return [a1, a2, b1, b2];
      }
      // basic
      return [randInt(1, 5), randInt(1, 5), randInt(1, 5), randInt(1, 5)];
    }

    switch (variation) {

      case 'basic':
      case 'with_negatives':
      case 'orthogonal':
      case 'orthogonal_pair': {
        const [wa1, wa2, wb1, wb2] = makeNums(variation);
        const wDot = wa1 * wb1 + wa2 * wb2;
        let pa1, pa2, pb1, pb2;
        do {
          [pa1, pa2, pb1, pb2] = makeNums(variation);
        } while (pa1 === wa1 && pa2 === wa2 && pb1 === wb1 && pb2 === wb2);
        const pDot = pa1 * pb1 + pa2 * pb2;

        const teachingMap = {
          basic:
            `The inner product \u27E8\u03C8|\u03C6\u27E9 measures how "aligned" two quantum states are. ` +
            `For two-component vectors, it works like the dot product: multiply ` +
            `matching components and add the results. ` +
            `\u27E8\u03C8|\u03C6\u27E9 = \u03C8\u2081\u03C6\u2081 + \u03C8\u2082\u03C6\u2082. ` +
            `If the result is zero, the states are orthogonal \u2014 measuring one ` +
            `guarantees you won't find the other.`,
          with_negatives:
            `When vector components are negative, the inner product works the same way ` +
            `\u2014 just be careful multiplying negative numbers. Remember: ` +
            `negative \u00D7 negative = positive, negative \u00D7 positive = negative. ` +
            `The sign of the inner product tells you whether the states point ` +
            `in similar or opposite directions.`,
          orthogonal:
            `Orthogonal states have inner product zero. These are states that are ` +
            `completely distinguishable by measurement. In quantum computing, ` +
            `computational basis states |0\u27E9 and |1\u27E9 are orthogonal: ` +
            `\u27E80|1\u27E9 = 1\u00D70 + 0\u00D71 = 0. Orthogonality is the mathematical ` +
            `foundation of quantum measurement.`,
        };

        return {
          teachingText: teachingMap[variation] || teachingMap['orthogonal'],
          workedExample: {
            problem: `\u27E8\u03C8|\u03C6\u27E9 where |\u03C8\u27E9 = (${wa1}, ${wa2}), |\u03C6\u27E9 = (${wb1}, ${wb2})`,
            steps: [
              `\u27E8\u03C8|\u03C6\u27E9 = \u03C8\u2081\u03C6\u2081 + \u03C8\u2082\u03C6\u2082`,
              `= ${wa1}\u00D7${wb1} + ${wa2}\u00D7${wb2}`,
              `= ${wa1 * wb1} + ${wa2 * wb2}`,
              `= ${wDot}`,
            ],
            insight: wDot === 0
              ? `Inner product is 0 \u2014 these vectors are orthogonal (perpendicular).`
              : `Inner product is ${wDot} \u2014 these vectors are not orthogonal.`,
          },
          tryIt: {
            question: `\u27E8\u03C8|\u03C6\u27E9 where |\u03C8\u27E9 = (${pa1}, ${pa2}), |\u03C6\u27E9 = (${pb1}, ${pb2}):`,
            answer: pDot,
            answerType: 'numeric',
            answerDisplay: `${pDot}`,
            steps: [
              `\u27E8\u03C8|\u03C6\u27E9 = \u03C8\u2081\u03C6\u2081 + \u03C8\u2082\u03C6\u2082`,
              `= ${pa1}\u00D7${pb1} + ${pa2}\u00D7${pb2}`,
              `= ${pa1 * pb1} + ${pa2 * pb2} = ${pDot}`,
            ],
            whyItMatters:
              `The inner product is how quantum mechanics determines transition ` +
              `probabilities. The probability of measuring state |\u03C6\u27E9 when the ` +
              `system is in state |\u03C8\u27E9 is |\u27E8\u03C6|\u03C8\u27E9|\u00B2. Every measurement ` +
              `outcome in quantum computing comes down to an inner product.`,
          },
        };
      }

      default: return null;
    }
  },
},

orthogonality_check: {
  generate(difficulty, variation) {
    function makeOrthoPair() {
      const a1 = randIntNZ(1, 5), a2 = randIntNZ(1, 5);
      let b1, b2;
      if (Math.random() > 0.5) { b1 = -a2; b2 = a1; }
      else { b1 = a2; b2 = -a1; }
      return [a1, a2, b1, b2];
    }

    function makeNonOrthoPair() {
      const a1 = randIntNZ(1, 5), a2 = randIntNZ(1, 5);
      let b1 = randIntNZ(1, 5), b2 = randIntNZ(1, 5);
      if (a1 * b1 + a2 * b2 === 0) b2 += 1;
      return [a1, a2, b1, b2];
    }

    function makeCloseButNo() {
      const a1 = randIntNZ(1, 5), a2 = randIntNZ(1, 5);
      let b1, b2;
      if (Math.random() > 0.5) { b1 = -a2; b2 = a1; }
      else { b1 = a2; b2 = -a1; }
      const bump = Math.random() > 0.5 ? 1 : 2;
      b2 += bump;
      if (a1 * b1 + a2 * b2 === 0) b2 += 1;
      return [a1, a2, b1, b2];
    }

    function makeNums(v) {
      if (v === 'forced_yes' || v === 'forced_orthogonal') return makeOrthoPair();
      if (v === 'close_but_no' || v === 'forced_not') return makeCloseButNo();
      // basic: 50/50
      return Math.random() > 0.5 ? makeOrthoPair() : makeNonOrthoPair();
    }

    switch (variation) {

      case 'basic':
      case 'forced_yes':
      case 'forced_orthogonal':
      case 'close_but_no':
      case 'forced_not': {
        const [wa1, wa2, wb1, wb2] = makeNums(variation);
        const wDot = wa1 * wb1 + wa2 * wb2;
        const wOrtho = wDot === 0;

        let pa1, pa2, pb1, pb2;
        do {
          [pa1, pa2, pb1, pb2] = makeNums(variation);
        } while (pa1 === wa1 && pa2 === wa2 && pb1 === wb1 && pb2 === wb2);
        const pDot = pa1 * pb1 + pa2 * pb2;
        const pOrtho = pDot === 0;

        const teachingMap = {
          basic:
            `Two vectors are orthogonal when their inner product equals zero. ` +
            `This means they are "perpendicular" in their vector space. ` +
            `To check: compute \u03C8\u2081\u03C6\u2081 + \u03C8\u2082\u03C6\u2082. If the result is exactly 0, ` +
            `the vectors are orthogonal. In quantum computing, orthogonal states ` +
            `are perfectly distinguishable \u2014 a measurement can always tell them apart.`,
          forced_yes:
            `Orthogonal pairs can be constructed by swapping components and ` +
            `negating one. If (a, b) is your first vector, then (-b, a) or ` +
            `(b, -a) is guaranteed orthogonal. Check: a\u00D7(-b) + b\u00D7a = -ab + ab = 0. ` +
            `This is how we build measurement bases in quantum computing.`,
          close_but_no:
            `Be careful \u2014 vectors can look "almost orthogonal" but still have a ` +
            `nonzero inner product. In quantum computing, "almost orthogonal" is ` +
            `not orthogonal. The inner product must be exactly zero. Even a tiny ` +
            `nonzero value means the states are partially distinguishable, not ` +
            `perfectly distinguishable.`,
        };

        return {
          teachingText: teachingMap[variation] || teachingMap['basic'],
          workedExample: {
            problem: `Are (${wa1}, ${wa2}) and (${wb1}, ${wb2}) orthogonal?`,
            steps: [
              `Compute inner product: ${wa1}\u00D7${wb1} + ${wa2}\u00D7${wb2}`,
              `= ${wa1 * wb1} + ${wa2 * wb2} = ${wDot}`,
              wOrtho
                ? `Inner product = 0 \u2192 orthogonal`
                : `Inner product = ${wDot} \u2260 0 \u2192 not orthogonal`,
            ],
            insight: wOrtho
              ? `Zero inner product confirms orthogonality \u2014 these states are perfectly distinguishable.`
              : `Nonzero inner product means these states overlap and cannot be perfectly distinguished.`,
          },
          tryIt: {
            question: `Are (${pa1}, ${pa2}) and (${pb1}, ${pb2}) orthogonal? (yes or no)`,
            answer: pOrtho,
            answerType: 'yesno',
            answerDisplay: pOrtho ? 'yes' : 'no',
            steps: [
              `Inner product: ${pa1}\u00D7${pb1} + ${pa2}\u00D7${pb2}`,
              `= ${pa1 * pb1} + ${pa2 * pb2} = ${pDot}`,
              pOrtho
                ? `${pDot} = 0 \u2192 orthogonal \u2714`
                : `${pDot} \u2260 0 \u2192 not orthogonal \u2718`,
            ],
            whyItMatters:
              `Orthogonality is the foundation of quantum measurement. When you ` +
              `measure a qubit, you project onto orthogonal basis states |0\u27E9 and |1\u27E9. ` +
              `The entire structure of quantum algorithms relies on being able to ` +
              `distinguish orthogonal states with certainty.`,
          },
        };
      }

      default: return null;
    }
  },
},

dirac_probability: {
  generate(difficulty, variation) {
    const triples = [[3,4,5],[4,3,5],[5,12,13],[6,8,10],[8,6,10]];
    const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(2);

    function makeNums(v) {
      if (v === 'equal_superposition') {
        return { alpha: 0.71, beta: 0.71, measureZero: Math.random() > 0.5 };
      }
      const [ta, tb, tm] = triples[randInt(0, triples.length - 1)];
      const alpha = Math.round((ta / tm) * 100) / 100;
      const beta  = Math.round((tb / tm) * 100) / 100;
      if (v === 'measure_one' || v === 'small_amplitude') {
        return { alpha, beta, measureZero: false };
      }
      // basic
      return { alpha, beta, measureZero: Math.random() > 0.5 };
    }

    switch (variation) {

      case 'basic':
      case 'measure_one':
      case 'small_amplitude':
      case 'equal_superposition': {
        const w = makeNums(variation);
        const wAmp = w.measureZero ? w.alpha : w.beta;
        const wProb = Math.round(wAmp * wAmp * 100) / 100;
        const wLabel = w.measureZero ? '|0\u27E9' : '|1\u27E9';

        let p;
        do { p = makeNums(variation); } while (p.alpha === w.alpha && p.beta === w.beta && p.measureZero === w.measureZero);
        const pAmp = p.measureZero ? p.alpha : p.beta;
        const pProb = Math.round(pAmp * pAmp * 100) / 100;
        const pLabel = p.measureZero ? '|0\u27E9' : '|1\u27E9';

        const teachingMap = {
          basic:
            `The Born rule is quantum mechanics' bridge between math and experiment. ` +
            `Given |\u03C8\u27E9 = \u03B1|0\u27E9 + \u03B2|1\u27E9, the probability of measuring ` +
            `|0\u27E9 is |\u03B1|\u00B2 and the probability of measuring |1\u27E9 is |\u03B2|\u00B2. ` +
            `To find a probability: identify the amplitude of the state you're ` +
            `measuring, then square it. That's it.`,
          measure_one:
            `Finding P(|1\u27E9) is identical to finding P(|0\u27E9) \u2014 just use the ` +
            `amplitude in front of |1\u27E9 instead. P(|1\u27E9) = |\u03B2|\u00B2. ` +
            `Since probabilities must sum to 1, P(|1\u27E9) = 1 \u2212 P(|0\u27E9), which ` +
            `gives you a nice way to double-check your work.`,
          equal_superposition:
            `When \u03B1 = \u03B2 \u2248 0.71 (which is 1/\u221A2), the state is an equal ` +
            `superposition: 50% chance of |0\u27E9, 50% chance of |1\u27E9. ` +
            `This is the state you get by applying a Hadamard gate to |0\u27E9. ` +
            `P = 0.71\u00B2 \u2248 0.50. Equal superposition is the starting point ` +
            `for most quantum algorithms.`,
        };

        return {
          teachingText: teachingMap[variation] || teachingMap['basic'],
          workedExample: {
            problem: `|\u03C8\u27E9 = ${w.alpha}|0\u27E9 + ${w.beta}|1\u27E9. Find P(${wLabel}).`,
            steps: [
              `P(${wLabel}) = |amplitude for ${wLabel}|\u00B2`,
              `The amplitude for ${wLabel} is ${fmt(wAmp)}`,
              `P = ${fmt(wAmp)}\u00B2 = ${fmt(wProb)}`,
            ],
            insight: `Square the amplitude of whichever state you're measuring \u2014 that's the Born rule.`,
          },
          tryIt: {
            question: `|\u03C8\u27E9 = ${p.alpha}|0\u27E9 + ${p.beta}|1\u27E9\nP(${pLabel}) = ?`,
            answer: pProb,
            answerType: 'numeric',
            answerDisplay: `${fmt(pProb)}`,
            steps: [
              `P(${pLabel}) = |amplitude for ${pLabel}|\u00B2`,
              `The amplitude for ${pLabel} is ${fmt(pAmp)}`,
              `P = ${fmt(pAmp)}\u00B2 = ${fmt(pProb)}`,
            ],
            whyItMatters:
              `The Born rule is the only way to extract information from a quantum ` +
              `computer. Every quantum algorithm ends with a measurement, and the ` +
              `Born rule tells you how likely each outcome is. Without it, quantum ` +
              `states would be beautiful math with no physical meaning.`,
          },
        };
      }

      default: return null;
    }
  },
},

// ── Chapter 7: Quantum Gates ────────────────────────────────────────────────

pauli_gate_apply: {
  generate(difficulty, variation) {
    const triples = [[3,4,5],[4,3,5],[6,8,10],[8,6,10]];
    const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(2);

    function makeNums(v) {
      if (v === 'superposition_input') {
        const [ta, tb, tm] = triples[randInt(0, triples.length - 1)];
        const a = Math.round((ta / tm) * 100) / 100;
        const b = Math.round((tb / tm) * 100) / 100;
        const useX = Math.random() > 0.5;
        return { a, b, useX };
      }
      if (v === 'x_only') {
        return { a: randInt(1, 6), b: randInt(1, 6), useX: true };
      }
      if (v === 'z_only') {
        return { a: randInt(1, 6), b: randInt(1, 6), useX: false };
      }
      // basic
      return { a: randInt(1, 6), b: randInt(1, 6), useX: Math.random() > 0.5 };
    }

    function applyGate(a, b, useX) {
      let r1, r2;
      if (useX) { r1 = b; r2 = a; }
      else { r1 = a; r2 = -b; }
      r1 = Math.round(r1 * 100) / 100;
      r2 = Math.round(r2 * 100) / 100;
      return [r1, r2];
    }

    switch (variation) {

      case 'basic':
      case 'x_only':
      case 'z_only':
      case 'superposition_input': {
        const w = makeNums(variation);
        const [wr1, wr2] = applyGate(w.a, w.b, w.useX);
        const wGate = w.useX ? 'X' : 'Z';
        const wMatrix = w.useX ? '[[0,1],[1,0]]' : '[[1,0],[0,\u22121]]';

        let p;
        do { p = makeNums(variation); } while (p.a === w.a && p.b === w.b && p.useX === w.useX);
        const [pr1, pr2] = applyGate(p.a, p.b, p.useX);
        const pGate = p.useX ? 'X' : 'Z';
        const pMatrix = p.useX ? '[[0,1],[1,0]]' : '[[1,0],[0,\u22121]]';

        const teachingMap = {
          basic:
            `The Pauli X and Z gates are single-qubit gates \u2014 they transform ` +
            `one qubit's state vector. The X gate (quantum NOT) swaps the two ` +
            `components: (a, b) \u2192 (b, a). It flips |0\u27E9 to |1\u27E9 and vice versa. ` +
            `The Z gate negates the second component: (a, b) \u2192 (a, \u2212b). ` +
            `It leaves |0\u27E9 alone but flips the sign of |1\u27E9 \u2014 a "phase flip."`,
          x_only:
            `The X gate is the quantum equivalent of a classical NOT gate. ` +
            `As a matrix, X = [[0,1],[1,0]]. When applied to (a, b), the rows ` +
            `give: row 1 = 0\u00D7a + 1\u00D7b = b, row 2 = 1\u00D7a + 0\u00D7b = a. ` +
            `So X simply swaps the two components: (a, b) \u2192 (b, a). ` +
            `This turns |0\u27E9 = (1,0) into (0,1) = |1\u27E9 and vice versa.`,
          z_only:
            `The Z gate performs a "phase flip" \u2014 it leaves the first component ` +
            `alone and negates the second. As a matrix, Z = [[1,0],[0,\u22121]]. ` +
            `Applied to (a, b): row 1 = 1\u00D7a + 0\u00D7b = a, ` +
            `row 2 = 0\u00D7a + (\u22121)\u00D7b = \u2212b. Result: (a, \u2212b). ` +
            `Z doesn't change measurement probabilities (since |\u2212b|\u00B2 = |b|\u00B2), ` +
            `but it affects interference patterns in algorithms.`,
          superposition_input:
            `Quantum gates work on any state vector, not just basis states. ` +
            `A superposition state like (0.6, 0.8) represents a qubit that is ` +
            `partially |0\u27E9 and partially |1\u27E9. Apply X or Z just like before: ` +
            `X swaps components, Z negates the second. The arithmetic works ` +
            `the same with decimals as with integers.`,
        };

        return {
          teachingText: teachingMap[variation] || teachingMap['basic'],
          workedExample: {
            problem: `Apply ${wGate} to (${fmt(w.a)}, ${fmt(w.b)})`,
            steps: w.useX ? [
              `X = ${wMatrix} swaps the two components`,
              `Row 1: 0\u00D7${fmt(w.a)} + 1\u00D7${fmt(w.b)} = ${fmt(wr1)}`,
              `Row 2: 1\u00D7${fmt(w.a)} + 0\u00D7${fmt(w.b)} = ${fmt(wr2)}`,
              `Result: (${fmt(wr1)}, ${fmt(wr2)})`,
            ] : [
              `Z = ${wMatrix} negates the second component`,
              `Row 1: 1\u00D7${fmt(w.a)} + 0\u00D7${fmt(w.b)} = ${fmt(wr1)}`,
              `Row 2: 0\u00D7${fmt(w.a)} + (\u22121)\u00D7${fmt(w.b)} = ${fmt(wr2)}`,
              `Result: (${fmt(wr1)}, ${fmt(wr2)})`,
            ],
            insight: w.useX
              ? `X swaps the amplitudes \u2014 what was the probability of |0\u27E9 becomes the probability of |1\u27E9.`
              : `Z flips the sign of the |1\u27E9 amplitude. The probabilities don't change, but the phase does.`,
          },
          tryIt: {
            question: `Apply ${pGate} to (${fmt(p.a)}, ${fmt(p.b)}):\n${pGate} = ${pMatrix}`,
            answer: [pr1, pr2],
            answerType: 'vector',
            answerDisplay: `(${fmt(pr1)}, ${fmt(pr2)})`,
            steps: p.useX ? [
              `X swaps the two components`,
              `(${fmt(p.a)}, ${fmt(p.b)}) \u2192 (${fmt(pr1)}, ${fmt(pr2)})`,
            ] : [
              `Z negates the second component`,
              `(${fmt(p.a)}, ${fmt(p.b)}) \u2192 (${fmt(pr1)}, ${fmt(pr2)})`,
            ],
            whyItMatters:
              `Pauli gates are the building blocks of quantum circuits. X creates ` +
              `bit flips (errors in quantum error correction), and Z creates phase ` +
              `flips. Together with the Hadamard gate, they can approximate any ` +
              `single-qubit operation.`,
          },
        };
      }

      default: return null;
    }
  },
},

hadamard_apply: {
  generate(difficulty, variation) {
    const h = 0.71;
    const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(2);

    function makeNums(v) {
      if (v === 'basis_only') {
        const use0 = Math.random() > 0.5;
        return { a: use0 ? 1 : 0, b: use0 ? 0 : 1 };
      }
      if (v === 'general_input') {
        return { a: randIntNZ(-3, 3), b: randIntNZ(-3, 3) };
      }
      // basic: mix of basis and general
      if (Math.random() > 0.5) {
        const use0 = Math.random() > 0.5;
        return { a: use0 ? 1 : 0, b: use0 ? 0 : 1 };
      }
      return { a: randIntNZ(-3, 3), b: randIntNZ(-3, 3) };
    }

    function applyH(a, b) {
      const r1 = Math.round((h * a + h * b) * 100) / 100;
      const r2 = Math.round((h * a - h * b) * 100) / 100;
      return [r1, r2];
    }

    switch (variation) {

      case 'basic':
      case 'basis_only':
      case 'general_input': {
        const w = makeNums(variation);
        const [wr1, wr2] = applyH(w.a, w.b);

        let p;
        do { p = makeNums(variation); } while (p.a === w.a && p.b === w.b);
        const [pr1, pr2] = applyH(p.a, p.b);

        const teachingMap = {
          basic:
            `The Hadamard gate (H) is arguably the most important gate in quantum ` +
            `computing. It creates superposition from a definite state. ` +
            `H \u2248 [[0.71, 0.71], [0.71, \u22120.71]]. Applied to (a, b): ` +
            `first component = 0.71\u00D7a + 0.71\u00D7b, second = 0.71\u00D7a \u2212 0.71\u00D7b. ` +
            `H turns |0\u27E9 into an equal superposition of |0\u27E9 and |1\u27E9.`,
          basis_only:
            `Let's see what H does to the basis states. ` +
            `H|0\u27E9 = H(1,0) = (0.71, 0.71) \u2014 an equal superposition. ` +
            `H|1\u27E9 = H(0,1) = (0.71, \u22120.71) \u2014 also equal probabilities, ` +
            `but with a minus sign on |1\u27E9. This minus sign is a "phase" ` +
            `difference that becomes crucial in algorithms like Grover's search.`,
          general_input:
            `H works on any input, not just basis states. For general (a, b): ` +
            `multiply by the H matrix row by row. Row 1: 0.71a + 0.71b. ` +
            `Row 2: 0.71a \u2212 0.71b. The factor 0.71 \u2248 1/\u221A2 ensures that H ` +
            `preserves the total probability (|\u03B1|\u00B2 + |\u03B2|\u00B2 = 1). ` +
            `H is its own inverse: applying H twice returns you to the original state.`,
        };

        return {
          teachingText: teachingMap[variation] || teachingMap['basic'],
          workedExample: {
            problem: `Apply H to (${w.a}, ${w.b})`,
            steps: [
              `H \u2248 [[0.71, 0.71], [0.71, \u22120.71]]`,
              `Row 1: 0.71\u00D7${w.a} + 0.71\u00D7${w.b} = ${fmt(wr1)}`,
              `Row 2: 0.71\u00D7${w.a} + (\u22120.71)\u00D7${w.b} = ${fmt(wr2)}`,
              `Result: (${fmt(wr1)}, ${fmt(wr2)})`,
            ],
            insight: `H creates superposition. Applying it twice returns you to the original state: HH = I.`,
          },
          tryIt: {
            question: `Apply H to (${p.a}, ${p.b}):\nH = (1/\u221A2)[[1,1],[1,\u22121]]`,
            answer: [pr1, pr2],
            answerType: 'vector',
            answerDisplay: `(${fmt(pr1)}, ${fmt(pr2)})`,
            steps: [
              `H \u2248 [[0.71, 0.71], [0.71, \u22120.71]]`,
              `Row 1: 0.71\u00D7${p.a} + 0.71\u00D7${p.b} = ${fmt(pr1)}`,
              `Row 2: 0.71\u00D7${p.a} \u2212 0.71\u00D7${p.b} = ${fmt(pr2)}`,
              `Result: (${fmt(pr1)}, ${fmt(pr2)})`,
            ],
            whyItMatters:
              `Nearly every quantum algorithm begins by applying H to each qubit, ` +
              `creating a superposition of all possible inputs. This lets a quantum ` +
              `computer explore many possibilities simultaneously. Without H, ` +
              `quantum computers would just be slow classical computers.`,
          },
        };
      }

      default: return null;
    }
  },
},

gate_then_measure: {
  generate(difficulty, variation) {
    const triples = [[3,4,5],[4,3,5],[6,8,10],[8,6,10]];
    const h = 0.71;
    const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(2);

    function makeNums(v) {
      const [ta, tb, tm] = triples[randInt(0, triples.length - 1)];
      const alpha = Math.round((ta / tm) * 100) / 100;
      const beta  = Math.round((tb / tm) * 100) / 100;
      return { alpha, beta, tripleIdx: ta * 1000 + tb };
    }

    switch (variation) {

      case 'basic': {
        const w = makeNums(variation);
        const wNewAlpha = Math.round((h * w.alpha + h * w.beta) * 100) / 100;
        const wProb = Math.round(wNewAlpha * wNewAlpha * 100) / 100;

        let p;
        do { p = makeNums(variation); } while (p.tripleIdx === w.tripleIdx);
        const pNewAlpha = Math.round((h * p.alpha + h * p.beta) * 100) / 100;
        const pProb = Math.round(pNewAlpha * pNewAlpha * 100) / 100;

        return {
          teachingText:
            `What happens when you apply a gate and then measure? This is the ` +
            `heart of a quantum circuit: transform the state, then read the result. ` +
            `Step 1: Apply the gate to get a new state vector. ` +
            `Step 2: Use the Born rule on the new state. ` +
            `For H applied to (\u03B1, \u03B2): new first component = 0.71(\u03B1 + \u03B2), ` +
            `then P(|0\u27E9) = (new first component)\u00B2.`,
          workedExample: {
            problem: `Apply H to (${w.alpha}, ${w.beta}), then find P(|0\u27E9)`,
            steps: [
              `Step 1 \u2014 Apply H: new \u03B1' = 0.71\u00D7${w.alpha} + 0.71\u00D7${w.beta}`,
              `= 0.71\u00D7${(w.alpha + w.beta).toFixed(2)} = ${fmt(wNewAlpha)}`,
              `Step 2 \u2014 P(|0\u27E9) = \u03B1'\u00B2 = ${fmt(wNewAlpha)}\u00B2 = ${fmt(wProb)}`,
            ],
            insight: `Apply the gate first, then square the relevant amplitude.`,
          },
          tryIt: {
            question: `Apply H to (${p.alpha}, ${p.beta}), then find P(|0\u27E9):`,
            answer: pProb,
            answerType: 'numeric',
            answerDisplay: `${fmt(pProb)}`,
            steps: [
              `Apply H: \u03B1' = 0.71\u00D7${p.alpha} + 0.71\u00D7${p.beta} = 0.71\u00D7${(p.alpha + p.beta).toFixed(2)} = ${fmt(pNewAlpha)}`,
              `P(|0\u27E9) = ${fmt(pNewAlpha)}\u00B2 = ${fmt(pProb)}`,
            ],
            whyItMatters:
              `This is exactly what a quantum circuit does: prepare a state, apply ` +
              `gates, then measure. The sequence gate-then-measure is the fundamental ` +
              `pattern of quantum computation.`,
          },
        };
      }

      case 'measure_one': {
        const w = makeNums(variation);
        const wNewBeta = Math.round((h * w.alpha - h * w.beta) * 100) / 100;
        const wProb = Math.round(wNewBeta * wNewBeta * 100) / 100;

        let p;
        do { p = makeNums(variation); } while (p.tripleIdx === w.tripleIdx);
        const pNewBeta = Math.round((h * p.alpha - h * p.beta) * 100) / 100;
        const pProb = Math.round(pNewBeta * pNewBeta * 100) / 100;

        return {
          teachingText:
            `When measuring |1\u27E9 after a Hadamard gate, you need the second ` +
            `component of the transformed state. For H applied to (\u03B1, \u03B2): ` +
            `new second component = 0.71(\u03B1 \u2212 \u03B2). Notice the minus sign! ` +
            `Then P(|1\u27E9) = (new second component)\u00B2. The minus sign disappears ` +
            `when you square, so P is always non-negative.`,
          workedExample: {
            problem: `Apply H to (${w.alpha}, ${w.beta}), then find P(|1\u27E9)`,
            steps: [
              `Step 1 \u2014 Apply H: new \u03B2' = 0.71\u00D7${w.alpha} \u2212 0.71\u00D7${w.beta}`,
              `= 0.71\u00D7${(w.alpha - w.beta).toFixed(2)} = ${fmt(wNewBeta)}`,
              `Step 2 \u2014 P(|1\u27E9) = \u03B2'\u00B2 = ${fmt(wNewBeta)}\u00B2 = ${fmt(wProb)}`,
            ],
            insight: `Use the second row of H for the |1\u27E9 amplitude: 0.71a \u2212 0.71b.`,
          },
          tryIt: {
            question: `Apply H to (${p.alpha}, ${p.beta}), then find P(|1\u27E9):`,
            answer: pProb,
            answerType: 'numeric',
            answerDisplay: `${fmt(pProb)}`,
            steps: [
              `Apply H: \u03B2' = 0.71\u00D7${p.alpha} \u2212 0.71\u00D7${p.beta} = 0.71\u00D7${(p.alpha - p.beta).toFixed(2)} = ${fmt(pNewBeta)}`,
              `P(|1\u27E9) = ${fmt(pNewBeta)}\u00B2 = ${fmt(pProb)}`,
            ],
            whyItMatters:
              `Being comfortable measuring either outcome is essential. Quantum ` +
              `algorithms often care about specific measurement outcomes \u2014 you ` +
              `need to track both amplitudes through gates to know the probability ` +
              `of each result.`,
          },
        };
      }

      case 'x_then_measure': {
        const w = makeNums(variation);
        // X swaps: (alpha, beta) -> (beta, alpha), P(|0>) = beta^2
        const wProb = Math.round(w.beta * w.beta * 100) / 100;

        let p;
        do { p = makeNums(variation); } while (p.tripleIdx === w.tripleIdx);
        const pProb = Math.round(p.beta * p.beta * 100) / 100;

        return {
          teachingText:
            `The X gate swaps the two components: (a, b) \u2192 (b, a). ` +
            `After X, the new |0\u27E9 amplitude is the old |1\u27E9 amplitude, ` +
            `and vice versa. So P(|0\u27E9) after X equals P(|1\u27E9) before X. ` +
            `This makes intuitive sense: X is a NOT gate, flipping 0 and 1.`,
          workedExample: {
            problem: `Apply X to (${w.alpha}, ${w.beta}), then find P(|0\u27E9)`,
            steps: [
              `Step 1 \u2014 Apply X: swaps (${w.alpha}, ${w.beta}) \u2192 (${w.beta}, ${w.alpha})`,
              `Step 2 \u2014 P(|0\u27E9) = ${w.beta}\u00B2 = ${fmt(wProb)}`,
            ],
            insight: `After X, P(|0\u27E9) equals the original P(|1\u27E9) \u2014 the NOT gate swaps probabilities.`,
          },
          tryIt: {
            question: `Apply X to (${p.alpha}, ${p.beta}), then find P(|0\u27E9):`,
            answer: pProb,
            answerType: 'numeric',
            answerDisplay: `${fmt(pProb)}`,
            steps: [
              `Apply X: (${p.alpha}, ${p.beta}) \u2192 (${p.beta}, ${p.alpha})`,
              `P(|0\u27E9) = ${p.beta}\u00B2 = ${fmt(pProb)}`,
            ],
            whyItMatters:
              `Understanding how gates transform measurement probabilities is the ` +
              `key insight of quantum computing. Each gate reshuffles the amplitudes, ` +
              `changing what you're likely to measure.`,
          },
        };
      }

      default: return null;
    }
  },
},

two_gate_compose: {
  generate(difficulty, variation) {
    const gates = ['X', 'Z'];

    function applyGate(g, a, b) {
      if (g === 'X') return [b, a];
      return [a, -b]; // Z
    }

    function makeNums(v) {
      let g1, g2, a, b;
      if (v === 'same_gate') {
        const g = gates[randInt(0, 1)];
        g1 = g; g2 = g;
      } else {
        g1 = gates[randInt(0, 1)];
        g2 = gates[randInt(0, 1)];
      }
      if (v === 'with_negatives') {
        a = randIntNZ(-5, 5);
        b = randIntNZ(-5, 5);
      } else {
        a = randInt(1, 6);
        b = randInt(1, 6);
      }
      return { g1, g2, a, b };
    }

    switch (variation) {

      case 'basic':
      case 'same_gate':
      case 'with_negatives': {
        const w = makeNums(variation);
        const [wm1, wm2] = applyGate(w.g1, w.a, w.b);
        const [wr1, wr2] = applyGate(w.g2, wm1, wm2);

        let p;
        do { p = makeNums(variation); } while (p.a === w.a && p.b === w.b && p.g1 === w.g1 && p.g2 === w.g2);
        const [pm1, pm2] = applyGate(p.g1, p.a, p.b);
        const [pr1, pr2] = applyGate(p.g2, pm1, pm2);

        const teachingMap = {
          basic:
            `Quantum circuits apply gates one after another, left to right. ` +
            `To find the result of gate1 then gate2: first apply gate1 to get ` +
            `an intermediate state, then apply gate2 to that intermediate state. ` +
            `Don't try to combine them mentally \u2014 just go step by step. ` +
            `X swaps components: (a,b) \u2192 (b,a). Z negates the second: (a,b) \u2192 (a,\u2212b).`,
          same_gate:
            `What happens when you apply the same gate twice? ` +
            `XX: swap twice \u2192 back to original. ZZ: negate second twice \u2192 back to original. ` +
            `Both X and Z are their own inverse! This is written X\u00B2 = I and Z\u00B2 = I, ` +
            `where I is the identity (do-nothing) gate. Many quantum gates have this ` +
            `"self-inverse" property.`,
          with_negatives:
            `With negative inputs, the gate rules don't change: X still swaps, ` +
            `Z still negates the second component. Be especially careful with ` +
            `Z when the second component is already negative: \u2212(\u2212b) = b. ` +
            `Double negation gives a positive result.`,
        };

        return {
          teachingText: teachingMap[variation] || teachingMap['basic'],
          workedExample: {
            problem: `Apply ${w.g1} then ${w.g2} to (${w.a}, ${w.b})`,
            steps: [
              `Step 1 \u2014 Apply ${w.g1} to (${w.a}, ${w.b}):`,
              w.g1 === 'X'
                ? `X swaps: (${w.a}, ${w.b}) \u2192 (${wm1}, ${wm2})`
                : `Z negates 2nd: (${w.a}, ${w.b}) \u2192 (${wm1}, ${wm2})`,
              `Step 2 \u2014 Apply ${w.g2} to (${wm1}, ${wm2}):`,
              w.g2 === 'X'
                ? `X swaps: (${wm1}, ${wm2}) \u2192 (${wr1}, ${wr2})`
                : `Z negates 2nd: (${wm1}, ${wm2}) \u2192 (${wr1}, ${wr2})`,
              `Result: (${wr1}, ${wr2})`,
            ],
            insight: wr1 === w.a && wr2 === w.b
              ? `Applying the same gate twice returns to the original \u2014 the gate is its own inverse!`
              : `Two different gates compose into a new transformation. Order matters!`,
          },
          tryIt: {
            question: `Apply ${p.g1} then ${p.g2} to (${p.a}, ${p.b}):`,
            answer: [pr1, pr2],
            answerType: 'vector',
            answerDisplay: `(${pr1}, ${pr2})`,
            steps: [
              `Apply ${p.g1}: (${p.a}, ${p.b}) \u2192 (${pm1}, ${pm2})`,
              `Apply ${p.g2}: (${pm1}, ${pm2}) \u2192 (${pr1}, ${pr2})`,
              `Result: (${pr1}, ${pr2})`,
            ],
            whyItMatters:
              `Quantum algorithms are sequences of gates. Understanding how to ` +
              `compose gates step by step is how you trace through a quantum circuit ` +
              `by hand \u2014 essential for debugging and understanding algorithms.`,
          },
        };
      }

      default: return null;
    }
  },
},

// ── Chapter 8: Measurement ──────────────────────────────────────────────────

born_rule_complex: {
  generate(difficulty, variation) {
    const triples = [[3,4,5],[4,3,5],[5,12,13],[6,8,10],[8,6,10]];

    function makeNums(v) {
      if (v === 'pure_real') {
        const a = randInt(1, 5);
        return { a, b: 0 };
      }
      if (v === 'with_negatives') {
        const [ta, tb] = triples[randInt(0, triples.length - 1)];
        return { a: -ta, b: tb };
      }
      // basic
      const [ta, tb] = triples[randInt(0, triples.length - 1)];
      return { a: ta, b: tb };
    }

    switch (variation) {

      case 'basic':
      case 'with_negatives':
      case 'pure_real': {
        const w = makeNums(variation);
        const wMagSq = w.a * w.a + w.b * w.b;

        let p;
        do { p = makeNums(variation); } while (p.a === w.a && p.b === w.b);
        const pMagSq = p.a * p.a + p.b * p.b;

        const teachingMap = {
          basic:
            `In quantum mechanics, amplitudes can be complex numbers: \u03B1 = a + bi. ` +
            `The probability is the squared magnitude: |\u03B1|\u00B2 = a\u00B2 + b\u00B2. ` +
            `This is different from just squaring \u2014 you square both the real ` +
            `and imaginary parts separately, then add. The imaginary part ` +
            `contributes to the probability just as much as the real part.`,
          with_negatives:
            `When the real part is negative, squaring eliminates the sign: ` +
            `(\u2212a)\u00B2 = a\u00B2. The magnitude squared |\u03B1|\u00B2 = a\u00B2 + b\u00B2 is always ` +
            `non-negative, regardless of the signs of a and b. This is why ` +
            `probabilities are always between 0 and 1 \u2014 the squaring process ` +
            `removes all sign information.`,
          pure_real:
            `A purely real amplitude has no imaginary part: \u03B1 = a + 0i = a. ` +
            `Its squared magnitude is simply |\u03B1|\u00B2 = a\u00B2 + 0\u00B2 = a\u00B2. ` +
            `This is the familiar case from basic probability. Many introductory ` +
            `quantum examples use real amplitudes, but the general case always ` +
            `involves complex numbers.`,
        };

        return {
          teachingText: teachingMap[variation] || teachingMap['basic'],
          workedExample: {
            problem: `\u03B1 = ${fmtComplex(w.a, w.b)}. Find |\u03B1|\u00B2`,
            steps: [
              `|\u03B1|\u00B2 = a\u00B2 + b\u00B2 where \u03B1 = a + bi`,
              `a = ${w.a}, b = ${w.b}`,
              `|\u03B1|\u00B2 = ${w.a}\u00B2 + ${w.b}\u00B2 = ${w.a * w.a} + ${w.b * w.b} = ${wMagSq}`,
            ],
            insight: `Square both parts and add. Signs vanish because (\u2212x)\u00B2 = x\u00B2.`,
          },
          tryIt: {
            question: `\u03B1 = ${fmtComplex(p.a, p.b)}. Find |\u03B1|\u00B2 =`,
            answer: pMagSq,
            answerType: 'numeric',
            answerDisplay: `${pMagSq}`,
            steps: [
              `|\u03B1|\u00B2 = a\u00B2 + b\u00B2`,
              `a = ${p.a}, b = ${p.b}`,
              `|\u03B1|\u00B2 = ${p.a}\u00B2 + ${p.b}\u00B2 = ${p.a * p.a} + ${p.b * p.b} = ${pMagSq}`,
            ],
            whyItMatters:
              `The Born rule with complex amplitudes is the general form of ` +
              `quantum probability. Real-world quantum states almost always ` +
              `have complex amplitudes. Computing |\u03B1|\u00B2 correctly is essential ` +
              `for predicting measurement outcomes.`,
          },
        };
      }

      default: return null;
    }
  },
},

valid_state_check: {
  generate(difficulty, variation) {
    const triples = [[3,4,5],[4,3,5],[5,12,13],[6,8,10]];
    const closeStates = [[0.7, 0.7], [0.6, 0.6], [0.8, 0.5], [0.5, 0.8]];
    const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(2);

    function makeNums(v) {
      if (v === 'forced_valid') {
        const [ta, tb, tm] = triples[randInt(0, triples.length - 1)];
        const a = Math.round((ta / tm) * 100) / 100;
        const b = Math.round((tb / tm) * 100) / 100;
        return { a, b };
      }
      if (v === 'close_invalid') {
        const [a, b] = closeStates[randInt(0, closeStates.length - 1)];
        return { a, b };
      }
      // basic: 50/50
      if (Math.random() > 0.5) {
        const [ta, tb, tm] = triples[randInt(0, triples.length - 1)];
        return { a: Math.round((ta / tm) * 100) / 100, b: Math.round((tb / tm) * 100) / 100 };
      }
      let a = Math.round(randInt(2, 8) / 10 * 100) / 100;
      let b = Math.round(randInt(2, 8) / 10 * 100) / 100;
      const sum = Math.round((a * a + b * b) * 100) / 100;
      if (Math.abs(sum - 1) < 0.02) b = Math.round((b + 0.1) * 100) / 100;
      return { a, b };
    }

    switch (variation) {

      case 'basic':
      case 'forced_valid':
      case 'close_invalid': {
        const w = makeNums(variation);
        const wSumSq = Math.round((w.a * w.a + w.b * w.b) * 100) / 100;
        const wValid = Math.abs(wSumSq - 1) < 0.02;

        let p;
        do { p = makeNums(variation); } while (p.a === w.a && p.b === w.b);
        const pSumSq = Math.round((p.a * p.a + p.b * p.b) * 100) / 100;
        const pValid = Math.abs(pSumSq - 1) < 0.02;

        const teachingMap = {
          basic:
            `A valid quantum state must satisfy the normalization condition: ` +
            `|\u03B1|\u00B2 + |\u03B2|\u00B2 = 1. This ensures total probability equals 100%. ` +
            `To check: square each amplitude, add the results, and see if you ` +
            `get 1. If not, the vector doesn't represent a physical quantum state. ` +
            `This is the most fundamental constraint in quantum mechanics.`,
          forced_valid:
            `Valid quantum states come from normalized vectors. Pythagorean ` +
            `triples give clean examples: (3/5)\u00B2 + (4/5)\u00B2 = 9/25 + 16/25 = 1. ` +
            `In practice, quantum computers automatically keep states normalized ` +
            `\u2014 all quantum gates preserve normalization. But when doing ` +
            `pencil-and-paper calculations, you need to check this yourself.`,
          close_invalid:
            `Watch out for states that look plausible but aren't valid. ` +
            `(0.7, 0.7) seems reasonable, but 0.7\u00B2 + 0.7\u00B2 = 0.49 + 0.49 = 0.98 \u2260 1. ` +
            `Close doesn't count \u2014 the normalization must be exact. ` +
            `The correct equal superposition uses 1/\u221A2 \u2248 0.71, not 0.7.`,
        };

        return {
          teachingText: teachingMap[variation] || teachingMap['basic'],
          workedExample: {
            problem: `Is (${w.a}, ${w.b}) a valid quantum state?`,
            steps: [
              `Check: |\u03B1|\u00B2 + |\u03B2|\u00B2 = 1?`,
              `|${w.a}|\u00B2 + |${w.b}|\u00B2 = ${fmt(w.a * w.a)} + ${fmt(w.b * w.b)} = ${fmt(wSumSq)}`,
              wValid
                ? `${fmt(wSumSq)} \u2248 1 \u2192 valid quantum state`
                : `${fmt(wSumSq)} \u2260 1 \u2192 not a valid quantum state`,
            ],
            insight: wValid
              ? `The amplitudes are normalized \u2014 total probability sums to 1.`
              : `The amplitudes don't sum to 1, so this isn't a physical quantum state.`,
          },
          tryIt: {
            question: `Is (${p.a}, ${p.b}) a valid quantum state? (yes or no)`,
            answer: pValid,
            answerType: 'yesno',
            answerDisplay: pValid ? 'yes' : 'no',
            steps: [
              `|\u03B1|\u00B2 + |\u03B2|\u00B2 = ${fmt(p.a * p.a)} + ${fmt(p.b * p.b)} = ${fmt(pSumSq)}`,
              pValid
                ? `${fmt(pSumSq)} \u2248 1 \u2192 valid \u2714`
                : `${fmt(pSumSq)} \u2260 1 \u2192 not valid \u2718`,
            ],
            whyItMatters:
              `Normalization is the first thing to check when working with quantum ` +
              `states. If |\u03B1|\u00B2 + |\u03B2|\u00B2 \u2260 1, the state is unphysical and any ` +
              `calculations with it will give meaningless results. This constraint ` +
              `is what makes quantum states fundamentally different from arbitrary vectors.`,
          },
        };
      }

      default: return null;
    }
  },
},

expected_counts: {
  generate(difficulty, variation) {
    const triples = [[3,4,5],[4,3,5],[5,12,13],[6,8,10],[8,6,10]];
    const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(2);

    function makeNums(v) {
      const [ta, tb, tm] = triples[randInt(0, triples.length - 1)];
      const alpha = Math.round((ta / tm) * 100) / 100;
      const beta  = Math.round((tb / tm) * 100) / 100;
      let N, measureZero;
      if (v === 'large_n') {
        N = 1000;
        measureZero = Math.random() > 0.5;
      } else if (v === 'measure_one') {
        N = [100, 200, 500][randInt(0, 2)];
        measureZero = false;
      } else {
        N = [100, 200, 500][randInt(0, 2)];
        measureZero = Math.random() > 0.5;
      }
      return { alpha, beta, N, measureZero };
    }

    switch (variation) {

      case 'basic':
      case 'large_n':
      case 'measure_one': {
        const w = makeNums(variation);
        const wAmp = w.measureZero ? w.alpha : w.beta;
        const wProb = Math.round(wAmp * wAmp * 100) / 100;
        const wExpected = Math.round(w.N * wProb);
        const wLabel = w.measureZero ? '|0\u27E9' : '|1\u27E9';

        let p;
        do { p = makeNums(variation); } while (p.alpha === w.alpha && p.beta === w.beta && p.N === w.N);
        const pAmp = p.measureZero ? p.alpha : p.beta;
        const pProb = Math.round(pAmp * pAmp * 100) / 100;
        const pExpected = Math.round(p.N * pProb);
        const pLabel = p.measureZero ? '|0\u27E9' : '|1\u27E9';

        const teachingMap = {
          basic:
            `If you prepare and measure the same quantum state many times, the ` +
            `Born rule predicts the expected count for each outcome. ` +
            `Expected count = N \u00D7 P, where N is the number of measurements ` +
            `and P is the probability of that outcome. With N = 100 copies ` +
            `and P(|0\u27E9) = 0.36, you'd expect about 36 measurements of |0\u27E9.`,
          large_n:
            `With large N (many measurements), the actual counts converge ` +
            `toward the expected values. This is the law of large numbers ` +
            `applied to quantum measurement. With N = 1000, the expected count ` +
            `is 1000 \u00D7 P, and statistical fluctuations become a smaller ` +
            `fraction of the total.`,
          measure_one:
            `To find the expected count for |1\u27E9, use the |1\u27E9 amplitude: ` +
            `P(|1\u27E9) = \u03B2\u00B2, then expected count = N \u00D7 \u03B2\u00B2. ` +
            `Remember: expected counts for |0\u27E9 and |1\u27E9 should add up to N ` +
            `(since the qubit must be measured as one or the other).`,
        };

        return {
          teachingText: teachingMap[variation] || teachingMap['basic'],
          workedExample: {
            problem: `|\u03C8\u27E9 = ${w.alpha}|0\u27E9 + ${w.beta}|1\u27E9. Measure ${w.N} copies. Expected ${wLabel} count?`,
            steps: [
              `P(${wLabel}) = ${fmt(wAmp)}\u00B2 = ${fmt(wProb)}`,
              `Expected count = N \u00D7 P = ${w.N} \u00D7 ${fmt(wProb)}`,
              `= ${wExpected}`,
            ],
            insight: `Expected count = N \u00D7 probability. The more copies, the closer actual counts get to expected.`,
          },
          tryIt: {
            question: `|\u03C8\u27E9 = ${p.alpha}|0\u27E9 + ${p.beta}|1\u27E9\nMeasure ${p.N} copies. Expected ${pLabel} count?`,
            answer: pExpected,
            answerType: 'numeric',
            answerDisplay: `${pExpected}`,
            steps: [
              `P(${pLabel}) = ${fmt(pAmp)}\u00B2 = ${fmt(pProb)}`,
              `Expected count = ${p.N} \u00D7 ${fmt(pProb)} = ${pExpected}`,
            ],
            whyItMatters:
              `Real quantum computers are probabilistic \u2014 you run the same circuit ` +
              `many times and count outcomes. Expected counts let you predict what ` +
              `the histogram should look like, and comparing expected vs. actual ` +
              `counts is how you verify a quantum computer is working correctly.`,
          },
        };
      }

      default: return null;
    }
  },
},

missing_amplitude: {
  generate(difficulty, variation) {
    const triples = [[3,4,5],[4,3,5],[5,12,13],[6,8,10],[8,6,10]];
    const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(2);

    function makeNums(v) {
      if (v === 'decimal_given') {
        const options = [
          { given: 0.5, missing: 0.87 },
          { given: 0.3, missing: 0.95 },
          { given: 0.4, missing: 0.92 },
        ];
        const pick = options[randInt(0, options.length - 1)];
        return { given: pick.given, missing: pick.missing, givenLabel: '\u03B1', missingLabel: '\u03B2' };
      }
      const [ta, tb, tm] = triples[randInt(0, triples.length - 1)];
      const alpha = Math.round((ta / tm) * 100) / 100;
      const beta  = Math.round((tb / tm) * 100) / 100;
      if (v === 'given_beta') {
        return { given: beta, missing: alpha, givenLabel: '\u03B2', missingLabel: '\u03B1' };
      }
      // basic: random which is given
      if (Math.random() > 0.5) {
        return { given: alpha, missing: beta, givenLabel: '\u03B1', missingLabel: '\u03B2' };
      }
      return { given: beta, missing: alpha, givenLabel: '\u03B2', missingLabel: '\u03B1' };
    }

    switch (variation) {

      case 'basic':
      case 'given_beta':
      case 'decimal_given': {
        const w = makeNums(variation);
        const wGivenSq = Math.round(w.given * w.given * 100) / 100;
        const wMissingSq = Math.round((1 - wGivenSq) * 100) / 100;

        let p;
        do { p = makeNums(variation); } while (p.given === w.given && p.missing === w.missing);
        const pGivenSq = Math.round(p.given * p.given * 100) / 100;
        const pMissingSq = Math.round((1 - pGivenSq) * 100) / 100;

        const teachingMap = {
          basic:
            `Since |\u03B1|\u00B2 + |\u03B2|\u00B2 = 1, if you know one amplitude you can find ` +
            `the other. The steps: (1) square the known amplitude, ` +
            `(2) subtract from 1 to get the other squared, (3) take the ` +
            `square root. For example, if \u03B1 = 0.6, then |\u03B1|\u00B2 = 0.36, ` +
            `so |\u03B2|\u00B2 = 0.64, and \u03B2 = \u221A0.64 = 0.8.`,
          given_beta:
            `The normalization equation is symmetric: |\u03B1|\u00B2 + |\u03B2|\u00B2 = 1 ` +
            `works the same whether you're solving for \u03B1 or \u03B2. ` +
            `If \u03B2 is given, subtract |\u03B2|\u00B2 from 1, then take the square root ` +
            `to find \u03B1. The process is identical either way.`,
          decimal_given:
            `Sometimes amplitudes don't come from clean Pythagorean triples. ` +
            `If \u03B1 = 0.5, then |\u03B1|\u00B2 = 0.25, so |\u03B2|\u00B2 = 0.75, and ` +
            `\u03B2 = \u221A0.75 \u2248 0.87. These values appear in quantum states prepared ` +
            `by rotation gates at non-standard angles.`,
        };

        return {
          teachingText: teachingMap[variation] || teachingMap['basic'],
          workedExample: {
            problem: `|\u03C8\u27E9 = \u03B1|0\u27E9 + \u03B2|1\u27E9 with ${w.givenLabel} = ${w.given}. Find ${w.missingLabel} (positive).`,
            steps: [
              `|${w.givenLabel}|\u00B2 = ${w.given}\u00B2 = ${fmt(wGivenSq)}`,
              `|${w.missingLabel}|\u00B2 = 1 \u2212 ${fmt(wGivenSq)} = ${fmt(wMissingSq)}`,
              `${w.missingLabel} = \u221A${fmt(wMissingSq)} = ${fmt(w.missing)}`,
            ],
            insight: `Normalization means knowing one amplitude determines the other (up to a sign/phase).`,
          },
          tryIt: {
            question: `|\u03C8\u27E9 = \u03B1|0\u27E9 + \u03B2|1\u27E9 with ${p.givenLabel} = ${p.given}.\nFind ${p.missingLabel} (positive):`,
            answer: p.missing,
            answerType: 'numeric',
            answerDisplay: `${fmt(p.missing)}`,
            steps: [
              `|${p.givenLabel}|\u00B2 = ${p.given}\u00B2 = ${fmt(pGivenSq)}`,
              `|${p.missingLabel}|\u00B2 = 1 \u2212 ${fmt(pGivenSq)} = ${fmt(pMissingSq)}`,
              `${p.missingLabel} = \u221A${fmt(pMissingSq)} = ${fmt(p.missing)}`,
            ],
            whyItMatters:
              `Normalization is the fundamental constraint of quantum mechanics. ` +
              `When you construct quantum states by hand or verify a quantum ` +
              `computation, you often need to solve for a missing amplitude. ` +
              `This skill comes up constantly in quantum error correction and ` +
              `state tomography.`,
          },
        };
      }

      default: return null;
    }
  },
},


// ── Chapter 9: Tensor Products ──────────────────────────────────────────────

two_qubit_basis: {
  generate(difficulty, variation) {
    const labels = ['00', '01', '10', '11'];
    const vectors = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];

    switch (variation) {

      case 'basic': {
        const wi = randInt(0, 3);
        let pi;
        do { pi = randInt(0, 3); } while (pi === wi);
        return {
          teachingText:
            `In a two-qubit system, we have four basis states: |00⟩, |01⟩, |10⟩, and |11⟩. ` +
            `Each maps to a standard 4-vector with a single 1 and three 0s:\n\n` +
            `|00⟩ = (1, 0, 0, 0)\n|01⟩ = (0, 1, 0, 0)\n|10⟩ = (0, 0, 1, 0)\n|11⟩ = (0, 0, 0, 1)\n\n` +
            `The position of the 1 matches the binary number: |00⟩ is position 0, |01⟩ is position 1, ` +
            `|10⟩ is position 2, and |11⟩ is position 3.`,
          workedExample: {
            problem: `Write |${labels[wi]}⟩ as a 4-vector (a, b, c, d)`,
            steps: [
              `|${labels[wi]}⟩ is the ${wi + 1}th basis vector (0-indexed position ${wi})`,
              `Place a 1 in position ${wi} and 0s everywhere else`,
              `Answer: ${fmtVec4(vectors[wi])}`,
            ],
            insight: `The binary label tells you where the 1 goes: ${labels[wi]} in binary = ${wi} in decimal = position ${wi}.`,
          },
          tryIt: {
            question: `Write |${labels[pi]}⟩ as a 4-vector (a, b, c, d):`,
            answer: vectors[pi],
            answerType: 'vector4',
            answerDisplay: fmtVec4(vectors[pi]),
            steps: [
              `|${labels[pi]}⟩ corresponds to position ${pi}`,
              `Place a 1 in position ${pi}, 0s elsewhere`,
              `Answer: ${fmtVec4(vectors[pi])}`,
            ],
            whyItMatters:
              `Two-qubit basis vectors are the foundation of multi-qubit quantum computing. ` +
              `Every two-qubit state is a combination of these four vectors, and quantum algorithms ` +
              `like Shor's and Grover's operate on registers of many qubits.`,
          },
        };
      }

      case 'harder_labels': {
        const wi = randInt(0, 3);
        let pi;
        do { pi = randInt(0, 3); } while (pi === wi);
        const wq1 = labels[wi][0], wq2 = labels[wi][1];
        const pq1 = labels[pi][0], pq2 = labels[pi][1];
        return {
          teachingText:
            `Sometimes you are given two individual qubits and need to find the combined state. ` +
            `If qubit 1 is |a⟩ and qubit 2 is |b⟩, the combined state is |ab⟩. ` +
            `Then use the same mapping:\n\n` +
            `|00⟩ = (1, 0, 0, 0),  |01⟩ = (0, 1, 0, 0)\n` +
            `|10⟩ = (0, 0, 1, 0),  |11⟩ = (0, 0, 0, 1)`,
          workedExample: {
            problem: `If qubit 1 is |${wq1}⟩ and qubit 2 is |${wq2}⟩, write the two-qubit state as a 4-vector`,
            steps: [
              `Qubit 1 = |${wq1}⟩, Qubit 2 = |${wq2}⟩ → combined state |${labels[wi]}⟩`,
              `|${labels[wi]}⟩ is position ${wi}`,
              `Answer: ${fmtVec4(vectors[wi])}`,
            ],
            insight: `Just concatenate the qubit labels to get the basis state name.`,
          },
          tryIt: {
            question: `If qubit 1 is |${pq1}⟩ and qubit 2 is |${pq2}⟩, write the two-qubit state as a 4-vector (a, b, c, d):`,
            answer: vectors[pi],
            answerType: 'vector4',
            answerDisplay: fmtVec4(vectors[pi]),
            steps: [
              `Qubit 1 = |${pq1}⟩, Qubit 2 = |${pq2}⟩ → combined state |${labels[pi]}⟩`,
              `|${labels[pi]}⟩ maps to position ${pi}`,
              `Answer: ${fmtVec4(vectors[pi])}`,
            ],
            whyItMatters:
              `Quantum circuits operate on multiple qubits simultaneously. Knowing how individual ` +
              `qubit states combine into a joint state vector is essential for understanding ` +
              `how gates like CNOT act on multi-qubit registers.`,
          },
        };
      }

      case 'superposition': {
        const pairs = [
          { label: '(|00⟩ + |11⟩)/√2', vec: [0.71, 0, 0, 0.71] },
          { label: '(|00⟩ − |11⟩)/√2', vec: [0.71, 0, 0, -0.71] },
          { label: '(|01⟩ + |10⟩)/√2', vec: [0, 0.71, 0.71, 0] },
          { label: '(|01⟩ − |10⟩)/√2', vec: [0, 0.71, -0.71, 0] },
          { label: '(|00⟩ + |01⟩)/√2', vec: [0.71, 0.71, 0, 0] },
          { label: '(|10⟩ + |11⟩)/√2', vec: [0, 0, 0.71, 0.71] },
        ];
        const wi = randInt(0, pairs.length - 1);
        let pi;
        do { pi = randInt(0, pairs.length - 1); } while (pi === wi);
        const w = pairs[wi], p = pairs[pi];
        return {
          teachingText:
            `A two-qubit superposition is a weighted sum of basis states. To write it as a 4-vector, ` +
            `convert each basis state to its vector, scale by the coefficient, and add.\n\n` +
            `For example, (|00⟩ + |11⟩)/√2 means: take (1,0,0,0) and (0,0,0,1), add them, ` +
            `and divide by √2 ≈ 1.414. Since 1/√2 ≈ 0.71, the result is (0.71, 0, 0, 0.71).`,
          workedExample: {
            problem: `Write ${w.label} as a 4-vector (a, b, c, d)`,
            steps: [
              `Recall: |00⟩=(1,0,0,0), |01⟩=(0,1,0,0), |10⟩=(0,0,1,0), |11⟩=(0,0,0,1)`,
              `${w.label} adds the two basis vectors and divides by √2`,
              `1/√2 ≈ 0.71`,
              `Answer: ${fmtVec4(w.vec)}`,
            ],
            insight: `Each coefficient in the superposition becomes an amplitude in the vector.`,
          },
          tryIt: {
            question: `Write ${p.label} as a 4-vector (a, b, c, d):`,
            answer: p.vec,
            answerType: 'vector4',
            answerDisplay: fmtVec4(p.vec),
            steps: [
              `Recall: |00⟩=(1,0,0,0), |01⟩=(0,1,0,0), |10⟩=(0,0,1,0), |11⟩=(0,0,0,1)`,
              `${p.label} adds the two basis vectors and divides by √2`,
              `1/√2 ≈ 0.71`,
              `Answer: ${fmtVec4(p.vec)}`,
            ],
            whyItMatters:
              `Superpositions of two-qubit states are the heart of quantum entanglement. ` +
              `The Bell states — the most entangled states possible — are exactly these kinds of ` +
              `superpositions. You will use them in quantum teleportation and superdense coding.`,
          },
        };
      }

      default: return null;
    }
  },
},

tensor_product: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'basic': {
        const simple = [[1,0],[0,1],[1,1],[1,-1],[2,1],[1,2]];
        const wv1 = simple[randInt(0, simple.length - 1)];
        const wv2 = simple[randInt(0, simple.length - 1)];
        const wr = [wv1[0]*wv2[0], wv1[0]*wv2[1], wv1[1]*wv2[0], wv1[1]*wv2[1]];
        let pv1, pv2;
        do {
          pv1 = simple[randInt(0, simple.length - 1)];
          pv2 = simple[randInt(0, simple.length - 1)];
        } while (pv1[0] === wv1[0] && pv1[1] === wv1[1] && pv2[0] === wv2[0] && pv2[1] === wv2[1]);
        const pr = [pv1[0]*pv2[0], pv1[0]*pv2[1], pv1[1]*pv2[0], pv1[1]*pv2[1]];
        return {
          teachingText:
            `The tensor product (⊗) combines two vectors into a larger one. For two 2-vectors:\n\n` +
            `(a, b) ⊗ (c, d) = (a·c, a·d, b·c, b·d)\n\n` +
            `Think of it as: take each element of the first vector and multiply it by the entire second vector. ` +
            `Element a produces (a·c, a·d), element b produces (b·c, b·d). Concatenate them.`,
          workedExample: {
            problem: `(${wv1[0]}, ${wv1[1]}) ⊗ (${wv2[0]}, ${wv2[1]})`,
            steps: [
              `Formula: (a, b) ⊗ (c, d) = (a·c, a·d, b·c, b·d)`,
              `a·c = ${wv1[0]} × ${wv2[0]} = ${wr[0]}`,
              `a·d = ${wv1[0]} × ${wv2[1]} = ${wr[1]}`,
              `b·c = ${wv1[1]} × ${wv2[0]} = ${wr[2]}`,
              `b·d = ${wv1[1]} × ${wv2[1]} = ${wr[3]}`,
              `Result: ${fmtVec4(wr)}`,
            ],
            insight: `Each element of the first vector multiplies the entire second vector.`,
          },
          tryIt: {
            question: `(${pv1[0]}, ${pv1[1]}) ⊗ (${pv2[0]}, ${pv2[1]}) = ?`,
            answer: pr,
            answerType: 'vector4',
            answerDisplay: fmtVec4(pr),
            steps: [
              `a·c = ${pv1[0]} × ${pv2[0]} = ${pr[0]}`,
              `a·d = ${pv1[0]} × ${pv2[1]} = ${pr[1]}`,
              `b·c = ${pv1[1]} × ${pv2[0]} = ${pr[2]}`,
              `b·d = ${pv1[1]} × ${pv2[1]} = ${pr[3]}`,
              `Answer: ${fmtVec4(pr)}`,
            ],
            whyItMatters:
              `The tensor product is how quantum computing scales. A single qubit lives in 2D, ` +
              `but two qubits live in 4D, three in 8D, and n qubits in 2^n dimensions. ` +
              `This exponential growth is the source of quantum computing's power.`,
          },
        };
      }

      case 'basis_states': {
        const basis = [[1,0],[0,1]];
        const wv1 = basis[randInt(0, 1)];
        const wv2 = basis[randInt(0, 1)];
        const wr = [wv1[0]*wv2[0], wv1[0]*wv2[1], wv1[1]*wv2[0], wv1[1]*wv2[1]];
        let pv1, pv2;
        do {
          pv1 = basis[randInt(0, 1)];
          pv2 = basis[randInt(0, 1)];
        } while (pv1[0] === wv1[0] && pv1[1] === wv1[1] && pv2[0] === wv2[0] && pv2[1] === wv2[1]);
        const pr = [pv1[0]*pv2[0], pv1[0]*pv2[1], pv1[1]*pv2[0], pv1[1]*pv2[1]];
        const wLabel = `${wv1[0] === 1 ? '0' : '1'}${wv2[0] === 1 ? '0' : '1'}`;
        const pLabel = `${pv1[0] === 1 ? '0' : '1'}${pv2[0] === 1 ? '0' : '1'}`;
        return {
          teachingText:
            `When both inputs are basis vectors (|0⟩ or |1⟩), the tensor product always gives ` +
            `a standard two-qubit basis vector — a vector with a single 1 and three 0s.\n\n` +
            `|0⟩ ⊗ |0⟩ = |00⟩ = (1,0,0,0)\n|0⟩ ⊗ |1⟩ = |01⟩ = (0,1,0,0)\n` +
            `|1⟩ ⊗ |0⟩ = |10⟩ = (0,0,1,0)\n|1⟩ ⊗ |1⟩ = |11⟩ = (0,0,0,1)`,
          workedExample: {
            problem: `(${wv1[0]}, ${wv1[1]}) ⊗ (${wv2[0]}, ${wv2[1]})`,
            steps: [
              `These are basis vectors: |${wv1[0] === 1 ? '0' : '1'}⟩ ⊗ |${wv2[0] === 1 ? '0' : '1'}⟩ = |${wLabel}⟩`,
              `|${wLabel}⟩ = ${fmtVec4(wr)}`,
            ],
            insight: `Basis ⊗ basis always gives a standard basis vector — no arithmetic needed.`,
          },
          tryIt: {
            question: `(${pv1[0]}, ${pv1[1]}) ⊗ (${pv2[0]}, ${pv2[1]}) = ?`,
            answer: pr,
            answerType: 'vector4',
            answerDisplay: fmtVec4(pr),
            steps: [
              `These are basis vectors: |${pv1[0] === 1 ? '0' : '1'}⟩ ⊗ |${pv2[0] === 1 ? '0' : '1'}⟩ = |${pLabel}⟩`,
              `|${pLabel}⟩ = ${fmtVec4(pr)}`,
            ],
            whyItMatters:
              `Most quantum algorithms start by preparing qubits in basis states. The tensor product ` +
              `of these initial states is the starting point of the computation, so recognizing ` +
              `these simple cases makes circuit analysis much faster.`,
          },
        };
      }

      case 'with_negatives': {
        const wa1 = randIntNZ(-2, 2), wa2 = randIntNZ(-2, 2);
        const wb1 = randIntNZ(-2, 2), wb2 = randIntNZ(-2, 2);
        const wr = [wa1*wb1, wa1*wb2, wa2*wb1, wa2*wb2];
        let pa1, pa2, pb1, pb2;
        do {
          pa1 = randIntNZ(-2, 2); pa2 = randIntNZ(-2, 2);
          pb1 = randIntNZ(-2, 2); pb2 = randIntNZ(-2, 2);
        } while (pa1 === wa1 && pa2 === wa2 && pb1 === wb1 && pb2 === wb2);
        const pr = [pa1*pb1, pa1*pb2, pa2*pb1, pa2*pb2];
        return {
          teachingText:
            `The tensor product works the same way with negative numbers. Just be careful ` +
            `with signs when multiplying:\n\n` +
            `(a, b) ⊗ (c, d) = (a·c, a·d, b·c, b·d)\n\n` +
            `Negative × negative = positive, negative × positive = negative. ` +
            `Negative amplitudes appear frequently after applying gates like Z or phase gates.`,
          workedExample: {
            problem: `(${wa1}, ${wa2}) ⊗ (${wb1}, ${wb2})`,
            steps: [
              `a·c = ${wa1} × ${wb1} = ${wr[0]}`,
              `a·d = ${wa1} × ${wb2} = ${wr[1]}`,
              `b·c = ${wa2} × ${wb1} = ${wr[2]}`,
              `b·d = ${wa2} × ${wb2} = ${wr[3]}`,
              `Result: ${fmtVec4(wr)}`,
            ],
            insight: `Watch the signs — a negative times a negative gives a positive.`,
          },
          tryIt: {
            question: `(${pa1}, ${pa2}) ⊗ (${pb1}, ${pb2}) = ?`,
            answer: pr,
            answerType: 'vector4',
            answerDisplay: fmtVec4(pr),
            steps: [
              `a·c = ${pa1} × ${pb1} = ${pr[0]}`,
              `a·d = ${pa1} × ${pb2} = ${pr[1]}`,
              `b·c = ${pa2} × ${pb1} = ${pr[2]}`,
              `b·d = ${pa2} × ${pb2} = ${pr[3]}`,
              `Answer: ${fmtVec4(pr)}`,
            ],
            whyItMatters:
              `After applying quantum gates, amplitudes often become negative. The Z gate flips ` +
              `the sign of |1⟩, and the Hadamard gate produces (1/√2, -1/√2) from |1⟩. ` +
              `You need to handle negative amplitudes confidently in tensor products.`,
          },
        };
      }

      default: return null;
    }
  },
},

two_qubit_state: {
  generate(difficulty, variation) {
    const allTriples = [[3,4,5],[4,3,5],[5,12,13],[12,5,13],[6,8,10],[8,6,10]];

    switch (variation) {

      case 'basic': {
        const wTriple = allTriples[randInt(0, 1)];
        const wa1 = r2(wTriple[0] / wTriple[2]);
        const wa2 = r2(wTriple[1] / wTriple[2]);
        const wBasis = randInt(0, 1);
        const wb1 = wBasis === 0 ? 1 : 0;
        const wb2 = wBasis === 0 ? 0 : 1;
        const wr = [r2(wa1*wb1), r2(wa1*wb2), r2(wa2*wb1), r2(wa2*wb2)];

        let pTriple, pa1, pa2, pb1, pb2;
        do {
          pTriple = allTriples[randInt(0, 1)];
          pa1 = r2(pTriple[0] / pTriple[2]);
          pa2 = r2(pTriple[1] / pTriple[2]);
          const pBasis = randInt(0, 1);
          pb1 = pBasis === 0 ? 1 : 0;
          pb2 = pBasis === 0 ? 0 : 1;
        } while (pa1 === wa1 && pa2 === wa2 && pb1 === wb1);
        const pr = [r2(pa1*pb1), r2(pa1*pb2), r2(pa2*pb1), r2(pa2*pb2)];
        return {
          teachingText:
            `To find the two-qubit state when given individual qubit states, compute the tensor product. ` +
            `When one qubit is a basis state (|0⟩ or |1⟩), the result is simpler because multiplying ` +
            `by 0 or 1 just selects or zeros out components.\n\n` +
            `Example: (0.6, 0.8) ⊗ (1, 0) = (0.6·1, 0.6·0, 0.8·1, 0.8·0) = (0.6, 0, 0.8, 0)`,
          workedExample: {
            problem: `Qubit A = (${wa1}, ${wa2}), Qubit B = (${wb1}, ${wb2}). Find A ⊗ B`,
            steps: [
              `Tensor product: (${wa1}, ${wa2}) ⊗ (${wb1}, ${wb2})`,
              `= (${wa1}×${wb1}, ${wa1}×${wb2}, ${wa2}×${wb1}, ${wa2}×${wb2})`,
              `= ${fmtVec4(wr)}`,
            ],
            insight: `When one qubit is a basis state, half the components become zero — simplifying the math.`,
          },
          tryIt: {
            question: `Qubit A = (${pa1}, ${pa2}), Qubit B = (${pb1}, ${pb2}).\nFind A ⊗ B:`,
            answer: pr,
            answerType: 'vector4',
            answerDisplay: fmtVec4(pr),
            steps: [
              `Tensor product: (${pa1}, ${pa2}) ⊗ (${pb1}, ${pb2})`,
              `= (${pa1}×${pb1}, ${pa1}×${pb2}, ${pa2}×${pb1}, ${pa2}×${pb2})`,
              `= ${fmtVec4(pr)}`,
            ],
            whyItMatters:
              `Building two-qubit states from individual qubits is the first step in any multi-qubit ` +
              `quantum computation. Before applying two-qubit gates like CNOT, you need to express ` +
              `the joint state as a single 4-vector.`,
          },
        };
      }

      case 'both_general': {
        const wi1 = randInt(0, 1), wi2 = randInt(2, allTriples.length - 1);
        const wt1 = allTriples[wi1], wt2 = allTriples[wi2];
        const wa1 = r2(wt1[0]/wt1[2]), wa2 = r2(wt1[1]/wt1[2]);
        const wb1 = r2(wt2[0]/wt2[2]), wb2 = r2(wt2[1]/wt2[2]);
        const wr = [r2(wa1*wb1), r2(wa1*wb2), r2(wa2*wb1), r2(wa2*wb2)];

        let pi1, pi2, pa1, pa2, pb1n, pb2n;
        do {
          pi1 = randInt(0, 1);
          pi2 = randInt(2, allTriples.length - 1);
          const pt1 = allTriples[pi1], pt2 = allTriples[pi2];
          pa1 = r2(pt1[0]/pt1[2]); pa2 = r2(pt1[1]/pt1[2]);
          pb1n = r2(pt2[0]/pt2[2]); pb2n = r2(pt2[1]/pt2[2]);
        } while (pa1 === wa1 && pa2 === wa2 && pb1n === wb1 && pb2n === wb2);
        const pr = [r2(pa1*pb1n), r2(pa1*pb2n), r2(pa2*pb1n), r2(pa2*pb2n)];
        return {
          teachingText:
            `When both qubits are in general (non-basis) states, all four components of the ` +
            `tensor product will typically be nonzero. The formula is the same:\n\n` +
            `(a, b) ⊗ (c, d) = (a·c, a·d, b·c, b·d)\n\n` +
            `Just be careful with the decimal multiplication and round to 2 decimal places.`,
          workedExample: {
            problem: `Qubit A = (${wa1}, ${wa2}), Qubit B = (${wb1}, ${wb2}). Find A ⊗ B`,
            steps: [
              `(${wa1}, ${wa2}) ⊗ (${wb1}, ${wb2})`,
              `= (${wa1}×${wb1}, ${wa1}×${wb2}, ${wa2}×${wb1}, ${wa2}×${wb2})`,
              `= ${fmtVec4(wr)}`,
            ],
            insight: `With general states, all four amplitudes are nonzero — there are four possible measurement outcomes.`,
          },
          tryIt: {
            question: `Qubit A = (${pa1}, ${pa2}), Qubit B = (${pb1n}, ${pb2n}).\nFind A ⊗ B:`,
            answer: pr,
            answerType: 'vector4',
            answerDisplay: fmtVec4(pr),
            steps: [
              `(${pa1}, ${pa2}) ⊗ (${pb1n}, ${pb2n})`,
              `= (${pa1}×${pb1n}, ${pa1}×${pb2n}, ${pa2}×${pb1n}, ${pa2}×${pb2n})`,
              `= ${fmtVec4(pr)}`,
            ],
            whyItMatters:
              `Real quantum computations rarely involve pure basis states. After applying Hadamard ` +
              `or rotation gates, qubits end up in general superposition states. Computing the ` +
              `tensor product of two such qubits is a routine step in quantum circuit analysis.`,
          },
        };
      }

      default: return null;
    }
  },
},

tensor_component_identify: {
  generate(difficulty, variation) {
    const triples = [[3,4,5],[4,3,5],[5,12,13],[12,5,13]];

    switch (variation) {

      case 'basic': {
        const wPick = triples[randInt(0, 1)];
        const wa1 = r2(wPick[0]/wPick[2]), wa2 = r2(wPick[1]/wPick[2]);
        const basisPool = [[1,0],[0,1]];
        const wb = basisPool[randInt(0, 1)];
        const wb1 = wb[0], wb2 = wb[1];
        const wtp = [r2(wa1*wb1), r2(wa1*wb2), r2(wa2*wb1), r2(wa2*wb2)];
        const wRevealFirst = Math.random() > 0.5;

        let pPick, pa1, pa2, pb1, pb2;
        do {
          pPick = triples[randInt(0, 1)];
          pa1 = r2(pPick[0]/pPick[2]); pa2 = r2(pPick[1]/pPick[2]);
          const pb = basisPool[randInt(0, 1)];
          pb1 = pb[0]; pb2 = pb[1];
        } while (pa1 === wa1 && pa2 === wa2 && pb1 === wb1);
        const ptp = [r2(pa1*pb1), r2(pa1*pb2), r2(pa2*pb1), r2(pa2*pb2)];
        const pRevealFirst = Math.random() > 0.5;

        const wRevealed = wRevealFirst ? [wa1, wa2] : [wb1, wb2];
        const wAnswer = wRevealFirst ? [wb1, wb2] : [wa1, wa2];
        const pRevealed = pRevealFirst ? [pa1, pa2] : [pb1, pb2];
        const pAnswer = pRevealFirst ? [pb1, pb2] : [pa1, pa2];

        const wDivisor = wRevealFirst ? wa1 : wb1;
        const wDivParts = wRevealFirst
          ? [`x = ${wtp[0]} / ${wa1} = ${wb1}`, `y = ${wtp[1]} / ${wa1} = ${wb2}`]
          : [`x = ${wtp[0]} / ${wb1} = ${wa1}`, `y = ${wtp[2]} / ${wb1} = ${wa2}`];
        const pDivParts = pRevealFirst
          ? [`x = ${ptp[0]} / ${pa1} = ${pb1}`, `y = ${ptp[1]} / ${pa1} = ${pb2}`]
          : [`x = ${ptp[0]} / ${pb1} = ${pa1}`, `y = ${ptp[2]} / ${pb1} = ${pa2}`];

        return {
          teachingText:
            `If you know the tensor product result and one of the two qubit states, you can find ` +
            `the other by dividing. If (a, b) ⊗ (x, y) = (ax, ay, bx, by), and you know (a, b), ` +
            `then x = first component / a, and y = second component / a.\n\n` +
            `Similarly, if you know (x, y), then a = first component / x, and b = third component / x.`,
          workedExample: {
            problem: `(${wtp.join(', ')}) = (${wRevealed.join(', ')}) ⊗ (x, y). Find (x, y)`,
            steps: [
              `We know one factor: (${wRevealed.join(', ')})`,
              ...wDivParts,
              `Answer: (${wAnswer.join(', ')})`,
            ],
            insight: `Division reverses the tensor product — just like division reverses multiplication.`,
          },
          tryIt: {
            question: `The state (${ptp.join(', ')}) = (${pRevealed.join(', ')}) ⊗ (x, y).\nFind (x, y):`,
            answer: pAnswer,
            answerType: 'vector',
            answerDisplay: fmtVec(pAnswer),
            steps: [
              `We know one factor: (${pRevealed.join(', ')})`,
              ...pDivParts,
              `Answer: ${fmtVec(pAnswer)}`,
            ],
            whyItMatters:
              `Decomposing a two-qubit state back into individual qubits is how we check if a state ` +
              `is separable. If you can find valid (x, y), the state is not entangled. If you cannot, ` +
              `the qubits are entangled — a uniquely quantum phenomenon.`,
          },
        };
      }

      case 'general': {
        const wPick1 = triples[randInt(0, 1)];
        const wPick2 = triples[randInt(0, 1)];
        const wa1 = r2(wPick1[0]/wPick1[2]), wa2 = r2(wPick1[1]/wPick1[2]);
        const wb1 = r2(wPick2[0]/wPick2[2]), wb2 = r2(wPick2[1]/wPick2[2]);
        const wtp = [r2(wa1*wb1), r2(wa1*wb2), r2(wa2*wb1), r2(wa2*wb2)];
        const wRevealFirst = Math.random() > 0.5;

        let pPick1, pPick2, pa1, pa2, pb1, pb2;
        do {
          pPick1 = triples[randInt(0, 1)];
          pPick2 = triples[randInt(0, 1)];
          pa1 = r2(pPick1[0]/pPick1[2]); pa2 = r2(pPick1[1]/pPick1[2]);
          pb1 = r2(pPick2[0]/pPick2[2]); pb2 = r2(pPick2[1]/pPick2[2]);
        } while (pa1 === wa1 && pa2 === wa2 && pb1 === wb1 && pb2 === wb2);
        const ptp = [r2(pa1*pb1), r2(pa1*pb2), r2(pa2*pb1), r2(pa2*pb2)];
        const pRevealFirst = Math.random() > 0.5;

        const wRevealed = wRevealFirst ? [wa1, wa2] : [wb1, wb2];
        const wAnswer = wRevealFirst ? [wb1, wb2] : [wa1, wa2];
        const pRevealed = pRevealFirst ? [pa1, pa2] : [pb1, pb2];
        const pAnswer = pRevealFirst ? [pb1, pb2] : [pa1, pa2];

        const wDivParts = wRevealFirst
          ? [`x = ${wtp[0]} / ${wa1} = ${wb1}`, `y = ${wtp[1]} / ${wa1} = ${wb2}`]
          : [`x = ${wtp[0]} / ${wb1} = ${wa1}`, `y = ${wtp[2]} / ${wb1} = ${wa2}`];
        const pDivParts = pRevealFirst
          ? [`x = ${ptp[0]} / ${pa1} = ${pb1}`, `y = ${ptp[1]} / ${pa1} = ${pb2}`]
          : [`x = ${ptp[0]} / ${pb1} = ${pa1}`, `y = ${ptp[2]} / ${pb1} = ${pa2}`];

        return {
          teachingText:
            `Reversing a tensor product works even when both factors are general states (not basis states). ` +
            `The method is the same: divide components of the result by the known factor.\n\n` +
            `The key insight: if (a, b) ⊗ (x, y) = (r1, r2, r3, r4), then x = r1/a and y = r2/a. ` +
            `You can verify with the other pair: r3/b should also equal x, and r4/b should equal y.`,
          workedExample: {
            problem: `(${wtp.join(', ')}) = (${wRevealed.join(', ')}) ⊗ (x, y). Find (x, y)`,
            steps: [
              `Known factor: (${wRevealed.join(', ')})`,
              ...wDivParts,
              `Answer: (${wAnswer.join(', ')})`,
            ],
            insight: `With general states, you can cross-check your answer using the other pair of components.`,
          },
          tryIt: {
            question: `The state (${ptp.join(', ')}) = (${pRevealed.join(', ')}) ⊗ (x, y).\nFind (x, y):`,
            answer: pAnswer,
            answerType: 'vector',
            answerDisplay: fmtVec(pAnswer),
            steps: [
              `Known factor: (${pRevealed.join(', ')})`,
              ...pDivParts,
              `Answer: ${fmtVec(pAnswer)}`,
            ],
            whyItMatters:
              `Being able to decompose tensor products is critical for understanding entanglement. ` +
              `If the division gives inconsistent answers (r1/a differs from r3/b), the state ` +
              `cannot be factored — proving the qubits are entangled.`,
          },
        };
      }

      default: return null;
    }
  },
},

tensor_probability: {
  generate(difficulty, variation) {
    const triples = [[3,4,5],[4,3,5],[5,12,13],[12,5,13]];
    const basisLabels = ['00', '01', '10', '11'];

    switch (variation) {

      case 'basic': {
        const wPick = triples[randInt(0, 1)];
        const wa1 = r2(wPick[0]/wPick[2]), wa2 = r2(wPick[1]/wPick[2]);
        const wBasis = [[1,0],[0,1]];
        const wB = wBasis[randInt(0, 1)];
        const wb1 = wB[0], wb2 = wB[1];
        const wtp = [r2(wa1*wb1), r2(wa1*wb2), r2(wa2*wb1), r2(wa2*wb2)];
        const widx = randInt(0, 3);
        const wamp = wtp[widx];
        const wprob = r2(wamp * wamp);

        let pa1, pa2, pb1, pb2, pidx;
        do {
          const pPick = triples[randInt(0, 1)];
          pa1 = r2(pPick[0]/pPick[2]); pa2 = r2(pPick[1]/pPick[2]);
          const pB = wBasis[randInt(0, 1)];
          pb1 = pB[0]; pb2 = pB[1];
          pidx = randInt(0, 3);
        } while (pa1 === wa1 && pa2 === wa2 && pb1 === wb1 && pidx === widx);
        const ptp = [r2(pa1*pb1), r2(pa1*pb2), r2(pa2*pb1), r2(pa2*pb2)];
        const pamp = ptp[pidx];
        const pprob = r2(pamp * pamp);

        return {
          teachingText:
            `To find the probability of measuring a specific two-qubit outcome like |01⟩:\n\n` +
            `1. Compute the tensor product A ⊗ B to get the 4-vector\n` +
            `2. Find the amplitude of the desired basis state\n` +
            `3. Square the amplitude: P = |amplitude|²\n\n` +
            `The positions map as: |00⟩ → position 0, |01⟩ → position 1, |10⟩ → position 2, |11⟩ → position 3.`,
          workedExample: {
            problem: `Qubit A = (${wa1}, ${wa2}), Qubit B = (${wb1}, ${wb2}). What is P(|${basisLabels[widx]}⟩)?`,
            steps: [
              `A ⊗ B = (${wa1}, ${wa2}) ⊗ (${wb1}, ${wb2}) = ${fmtVec4(wtp)}`,
              `Amplitude of |${basisLabels[widx]}⟩ is position ${widx}: ${wamp}`,
              `P(|${basisLabels[widx]}⟩) = ${wamp}² = ${wprob}`,
            ],
            insight: `Probability is always the amplitude squared — this is the Born rule applied to multi-qubit systems.`,
          },
          tryIt: {
            question: `Qubit A = (${pa1}, ${pa2}), Qubit B = (${pb1}, ${pb2}).\nWhat is P(|${basisLabels[pidx]}⟩)?`,
            answer: pprob,
            answerType: 'numeric',
            answerDisplay: `${pprob}`,
            steps: [
              `A ⊗ B = (${pa1}, ${pa2}) ⊗ (${pb1}, ${pb2}) = ${fmtVec4(ptp)}`,
              `Amplitude of |${basisLabels[pidx]}⟩ = ${pamp}`,
              `P(|${basisLabels[pidx]}⟩) = ${pamp}² = ${pprob}`,
            ],
            whyItMatters:
              `Predicting measurement probabilities is the entire point of quantum computing. ` +
              `Quantum algorithms are designed so that the correct answer has high probability ` +
              `and wrong answers have low probability. This calculation is how you verify that.`,
          },
        };
      }

      case 'general': {
        const wPick1 = triples[randInt(0, 1)];
        const wPick2 = triples[randInt(0, 1)];
        const wa1 = r2(wPick1[0]/wPick1[2]), wa2 = r2(wPick1[1]/wPick1[2]);
        const wb1 = r2(wPick2[0]/wPick2[2]), wb2 = r2(wPick2[1]/wPick2[2]);
        const wtp = [r2(wa1*wb1), r2(wa1*wb2), r2(wa2*wb1), r2(wa2*wb2)];
        const widx = randInt(0, 3);
        const wamp = wtp[widx];
        const wprob = r2(wamp * wamp);

        let pa1, pa2, pb1n, pb2n, pidx;
        do {
          const pPick1 = triples[randInt(0, 1)];
          const pPick2 = triples[randInt(0, 1)];
          pa1 = r2(pPick1[0]/pPick1[2]); pa2 = r2(pPick1[1]/pPick1[2]);
          pb1n = r2(pPick2[0]/pPick2[2]); pb2n = r2(pPick2[1]/pPick2[2]);
          pidx = randInt(0, 3);
        } while (pa1 === wa1 && pa2 === wa2 && pb1n === wb1 && pb2n === wb2 && pidx === widx);
        const ptp = [r2(pa1*pb1n), r2(pa1*pb2n), r2(pa2*pb1n), r2(pa2*pb2n)];
        const pamp = ptp[pidx];
        const pprob = r2(pamp * pamp);

        return {
          teachingText:
            `When both qubits are in general superposition states, all four measurement outcomes ` +
            `have nonzero probability. The process is the same:\n\n` +
            `1. Compute A ⊗ B\n` +
            `2. Find the amplitude at the desired position\n` +
            `3. Square it to get the probability\n\n` +
            `The four probabilities must sum to 1 (within rounding).`,
          workedExample: {
            problem: `Qubit A = (${wa1}, ${wa2}), Qubit B = (${wb1}, ${wb2}). What is P(|${basisLabels[widx]}⟩)?`,
            steps: [
              `A ⊗ B = (${wa1}, ${wa2}) ⊗ (${wb1}, ${wb2}) = ${fmtVec4(wtp)}`,
              `Amplitude of |${basisLabels[widx]}⟩ = ${wamp}`,
              `P = ${wamp}² = ${wprob}`,
            ],
            insight: `All four probabilities sum to 1 — you can use this as a sanity check.`,
          },
          tryIt: {
            question: `Qubit A = (${pa1}, ${pa2}), Qubit B = (${pb1n}, ${pb2n}).\nWhat is P(|${basisLabels[pidx]}⟩)?`,
            answer: pprob,
            answerType: 'numeric',
            answerDisplay: `${pprob}`,
            steps: [
              `A ⊗ B = (${pa1}, ${pa2}) ⊗ (${pb1n}, ${pb2n}) = ${fmtVec4(ptp)}`,
              `Amplitude of |${basisLabels[pidx]}⟩ = ${pamp}`,
              `P = ${pamp}² = ${pprob}`,
            ],
            whyItMatters:
              `In real quantum algorithms, you often need to compute the probability of specific ` +
              `multi-qubit outcomes to understand whether a computation succeeded. Grover's algorithm, ` +
              `for example, amplifies the probability of the correct answer over multiple iterations.`,
          },
        };
      }

      default: return null;
    }
  },
},

separable_check: {
  generate(difficulty, variation) {
    const separablePool = [[1,0],[0,1],[0.71,0.71],[0.71,-0.71],[0.6,0.8],[0.8,0.6]];
    const entangledStates = [
      [0.71, 0, 0, 0.71],
      [0.71, 0, 0, -0.71],
      [0, 0.71, 0.71, 0],
      [0, 0.71, -0.71, 0],
      [0.5, 0.5, 0.5, -0.5],
      [0.5, -0.5, 0.5, 0.5],
    ];

    function makeSeparable() {
      const v1 = separablePool[randInt(0, separablePool.length - 1)];
      const v2 = separablePool[randInt(0, separablePool.length - 1)];
      return [r2(v1[0]*v2[0]), r2(v1[0]*v2[1]), r2(v1[1]*v2[0]), r2(v1[1]*v2[1])];
    }

    function makeEntangled() {
      return entangledStates[randInt(0, entangledStates.length - 1)];
    }

    switch (variation) {

      case 'basic': {
        const wIsSep = Math.random() > 0.4;
        const ws = wIsSep ? makeSeparable() : makeEntangled();
        let pIsSep, ps;
        do {
          pIsSep = Math.random() > 0.4;
          ps = pIsSep ? makeSeparable() : makeEntangled();
        } while (ws[0] === ps[0] && ws[1] === ps[1] && ws[2] === ps[2] && ws[3] === ps[3]);
        const wAD = r2(ws[0]*ws[3]), wBC = r2(ws[1]*ws[2]);
        const pAD = r2(ps[0]*ps[3]), pBC = r2(ps[1]*ps[2]);
        return {
          teachingText:
            `A two-qubit state (a, b, c, d) is separable if it can be written as a tensor product ` +
            `of two single-qubit states. The quick test:\n\n` +
            `Check if a × d = b × c\n\n` +
            `If yes, the state is separable (factorable). If no, it is entangled.\n\n` +
            `Think of it like factoring: x² + 5x + 6 = (x+2)(x+3) factors, but x² + x + 1 does not.`,
          workedExample: {
            problem: `Is the state ${fmtVec4(ws)} separable?`,
            steps: [
              `Check: a × d = ${ws[0]} × ${ws[3]} = ${wAD}`,
              `Check: b × c = ${ws[1]} × ${ws[2]} = ${wBC}`,
              wIsSep
                ? `${wAD} = ${wBC}, so yes — this state is separable.`
                : `${wAD} ≠ ${wBC}, so no — this state is entangled (not separable).`,
            ],
            insight: `The a×d = b×c test is the tensor product factorization condition.`,
          },
          tryIt: {
            question: `Is the state ${fmtVec4(ps)} separable? (yes or no)`,
            answer: pIsSep,
            answerType: 'yesno',
            answerDisplay: pIsSep ? 'yes' : 'no',
            steps: [
              `a × d = ${ps[0]} × ${ps[3]} = ${pAD}`,
              `b × c = ${ps[1]} × ${ps[2]} = ${pBC}`,
              pIsSep
                ? `${pAD} = ${pBC}, so yes — separable.`
                : `${pAD} ≠ ${pBC}, so no — entangled.`,
            ],
            whyItMatters:
              `Determining whether a state is separable or entangled is one of the most fundamental ` +
              `questions in quantum information science. Entangled states enable quantum teleportation, ` +
              `superdense coding, and are a key resource in quantum error correction.`,
          },
        };
      }

      case 'forced_separable': {
        const ws = makeSeparable();
        let ps;
        do { ps = makeSeparable(); } while (ws[0] === ps[0] && ws[1] === ps[1] && ws[2] === ps[2] && ws[3] === ps[3]);
        const wAD = r2(ws[0]*ws[3]), wBC = r2(ws[1]*ws[2]);
        const pAD = r2(ps[0]*ps[3]), pBC = r2(ps[1]*ps[2]);
        return {
          teachingText:
            `A separable state can always be written as (x, y) ⊗ (z, w) for some values x, y, z, w. ` +
            `The factorization test: a × d should equal b × c.\n\n` +
            `Separable states arise naturally when two qubits are prepared independently ` +
            `and no entangling gate (like CNOT) has been applied.`,
          workedExample: {
            problem: `Is the state ${fmtVec4(ws)} separable?`,
            steps: [
              `a × d = ${ws[0]} × ${ws[3]} = ${wAD}`,
              `b × c = ${ws[1]} × ${ws[2]} = ${wBC}`,
              `${wAD} = ${wBC} — yes, this state is separable.`,
            ],
            insight: `When the test passes, you could actually find the two factors by reversing the tensor product.`,
          },
          tryIt: {
            question: `Is the state ${fmtVec4(ps)} separable? (yes or no)`,
            answer: true,
            answerType: 'yesno',
            answerDisplay: 'yes',
            steps: [
              `a × d = ${ps[0]} × ${ps[3]} = ${pAD}`,
              `b × c = ${ps[1]} × ${ps[2]} = ${pBC}`,
              `${pAD} = ${pBC} — yes, separable.`,
            ],
            whyItMatters:
              `Recognizing separable states tells you the qubits are independent. Each qubit ` +
              `can be described and manipulated on its own, which simplifies analysis and means ` +
              `measuring one qubit gives no information about the other.`,
          },
        };
      }

      case 'forced_entangled': {
        const ws = makeEntangled();
        let ps;
        do { ps = makeEntangled(); } while (ws[0] === ps[0] && ws[1] === ps[1] && ws[2] === ps[2] && ws[3] === ps[3]);
        const wAD = r2(ws[0]*ws[3]), wBC = r2(ws[1]*ws[2]);
        const pAD = r2(ps[0]*ps[3]), pBC = r2(ps[1]*ps[2]);
        return {
          teachingText:
            `An entangled state fails the factorization test: a × d does NOT equal b × c. ` +
            `This means the state cannot be written as a tensor product of two individual qubits.\n\n` +
            `The Bell states are the most famous entangled states:\n` +
            `|Φ+⟩ = (0.71, 0, 0, 0.71)  — clearly 0.71 × 0.71 ≠ 0 × 0 is false... ` +
            `wait: 0.71 × 0.71 = 0.50, and 0 × 0 = 0. Since 0.50 ≠ 0, it is entangled.`,
          workedExample: {
            problem: `Is the state ${fmtVec4(ws)} separable?`,
            steps: [
              `a × d = ${ws[0]} × ${ws[3]} = ${wAD}`,
              `b × c = ${ws[1]} × ${ws[2]} = ${wBC}`,
              `${wAD} ≠ ${wBC} — no, this state is entangled (not separable).`,
            ],
            insight: `Entangled states are the quantum resource that has no classical equivalent.`,
          },
          tryIt: {
            question: `Is the state ${fmtVec4(ps)} separable? (yes or no)`,
            answer: false,
            answerType: 'yesno',
            answerDisplay: 'no',
            steps: [
              `a × d = ${ps[0]} × ${ps[3]} = ${pAD}`,
              `b × c = ${ps[1]} × ${ps[2]} = ${pBC}`,
              `${pAD} ≠ ${pBC} — no, entangled.`,
            ],
            whyItMatters:
              `Entangled states are the key resource that makes quantum computing more powerful than ` +
              `classical computing. Without entanglement, a quantum computer can be efficiently ` +
              `simulated by a classical one. Detecting entanglement is therefore crucial.`,
          },
        };
      }

      default: return null;
    }
  },
},

// ── Chapter 10: Entanglement ────────────────────────────────────────────────

entanglement_check: {
  generate(difficulty, variation) {
    const bellStates = [
      [0.71, 0, 0, 0.71],
      [0.71, 0, 0, -0.71],
      [0, 0.71, 0.71, 0],
      [0, 0.71, -0.71, 0],
    ];
    const basisVecs = [[1,0],[0,1]];

    function makeSeparable() {
      const v1 = basisVecs[randInt(0, 1)];
      const v2 = basisVecs[randInt(0, 1)];
      return [v1[0]*v2[0], v1[0]*v2[1], v1[1]*v2[0], v1[1]*v2[1]];
    }

    function makeEntangled() {
      return bellStates[randInt(0, bellStates.length - 1)];
    }

    switch (variation) {

      case 'basic': {
        const wIsEnt = Math.random() > 0.5;
        const ws = wIsEnt ? makeEntangled() : makeSeparable();
        let pIsEnt, ps;
        do {
          pIsEnt = Math.random() > 0.5;
          ps = pIsEnt ? makeEntangled() : makeSeparable();
        } while (ws[0] === ps[0] && ws[1] === ps[1] && ws[2] === ps[2] && ws[3] === ps[3]);
        const wAD = r2(ws[0]*ws[3]), wBC = r2(ws[1]*ws[2]);
        const pAD = r2(ps[0]*ps[3]), pBC = r2(ps[1]*ps[2]);
        return {
          teachingText:
            `A state is entangled if it CANNOT be written as a tensor product of two ` +
            `single-qubit states. This is the opposite of separable.\n\n` +
            `Test: check if a × d = b × c.\n` +
            `If a × d ≠ b × c → the state is entangled.\n` +
            `If a × d = b × c → the state is separable (NOT entangled).\n\n` +
            `Entanglement means measuring one qubit instantly determines the other.`,
          workedExample: {
            problem: `Is the state ${fmtVec4(ws)} entangled?`,
            steps: [
              `a × d = ${ws[0]} × ${ws[3]} = ${wAD}`,
              `b × c = ${ws[1]} × ${ws[2]} = ${wBC}`,
              wIsEnt
                ? `${wAD} ≠ ${wBC} — yes, this state is entangled.`
                : `${wAD} = ${wBC} — no, this state is separable (not entangled).`,
            ],
            insight: `Entangled = not factorable. The same test, opposite conclusion from "is it separable?"`,
          },
          tryIt: {
            question: `Is the state ${fmtVec4(ps)} entangled? (yes or no)`,
            answer: pIsEnt,
            answerType: 'yesno',
            answerDisplay: pIsEnt ? 'yes' : 'no',
            steps: [
              `a × d = ${ps[0]} × ${ps[3]} = ${pAD}`,
              `b × c = ${ps[1]} × ${ps[2]} = ${pBC}`,
              pIsEnt
                ? `${pAD} ≠ ${pBC} — yes, entangled.`
                : `${pAD} = ${pBC} — no, separable.`,
            ],
            whyItMatters:
              `Entanglement is what Einstein called "spooky action at a distance." It is the ` +
              `property that makes quantum key distribution secure and quantum teleportation possible. ` +
              `Being able to identify entangled states is a core quantum computing skill.`,
          },
        };
      }

      case 'forced_entangled': {
        const ws = makeEntangled();
        let ps;
        do { ps = makeEntangled(); } while (ws[0] === ps[0] && ws[1] === ps[1] && ws[2] === ps[2] && ws[3] === ps[3]);
        const wAD = r2(ws[0]*ws[3]), wBC = r2(ws[1]*ws[2]);
        const pAD = r2(ps[0]*ps[3]), pBC = r2(ps[1]*ps[2]);
        return {
          teachingText:
            `The Bell states are the maximally entangled two-qubit states:\n\n` +
            `|Φ+⟩ = (0.71, 0, 0, 0.71)\n|Φ-⟩ = (0.71, 0, 0, -0.71)\n` +
            `|Ψ+⟩ = (0, 0.71, 0.71, 0)\n|Ψ-⟩ = (0, 0.71, -0.71, 0)\n\n` +
            `For each, a × d ≠ b × c, confirming entanglement.`,
          workedExample: {
            problem: `Is the state ${fmtVec4(ws)} entangled?`,
            steps: [
              `a × d = ${ws[0]} × ${ws[3]} = ${wAD}`,
              `b × c = ${ws[1]} × ${ws[2]} = ${wBC}`,
              `${wAD} ≠ ${wBC} — yes, entangled.`,
            ],
            insight: `Bell states are the most entangled states possible for two qubits.`,
          },
          tryIt: {
            question: `Is the state ${fmtVec4(ps)} entangled? (yes or no)`,
            answer: true,
            answerType: 'yesno',
            answerDisplay: 'yes',
            steps: [
              `a × d = ${ps[0]} × ${ps[3]} = ${pAD}`,
              `b × c = ${ps[1]} × ${ps[2]} = ${pBC}`,
              `${pAD} ≠ ${pBC} — yes, entangled.`,
            ],
            whyItMatters:
              `Bell states are used in quantum teleportation, superdense coding, and quantum ` +
              `key distribution (BB84 and E91 protocols). Recognizing them on sight is essential ` +
              `for understanding these foundational quantum protocols.`,
          },
        };
      }

      case 'forced_separable': {
        const ws = makeSeparable();
        let ps;
        do { ps = makeSeparable(); } while (ws[0] === ps[0] && ws[1] === ps[1] && ws[2] === ps[2] && ws[3] === ps[3]);
        const wAD = r2(ws[0]*ws[3]), wBC = r2(ws[1]*ws[2]);
        const pAD = r2(ps[0]*ps[3]), pBC = r2(ps[1]*ps[2]);
        return {
          teachingText:
            `A separable (non-entangled) state is one that CAN be factored as a tensor product. ` +
            `Basis state products like |0⟩⊗|0⟩ = |00⟩ = (1,0,0,0) are always separable.\n\n` +
            `Test: a × d = b × c means NOT entangled.`,
          workedExample: {
            problem: `Is the state ${fmtVec4(ws)} entangled?`,
            steps: [
              `a × d = ${ws[0]} × ${ws[3]} = ${wAD}`,
              `b × c = ${ws[1]} × ${ws[2]} = ${wBC}`,
              `${wAD} = ${wBC} — no, this state is separable (not entangled).`,
            ],
            insight: `Basis state products are always separable — the qubits are independent.`,
          },
          tryIt: {
            question: `Is the state ${fmtVec4(ps)} entangled? (yes or no)`,
            answer: false,
            answerType: 'yesno',
            answerDisplay: 'no',
            steps: [
              `a × d = ${ps[0]} × ${ps[3]} = ${pAD}`,
              `b × c = ${ps[1]} × ${ps[2]} = ${pBC}`,
              `${pAD} = ${pBC} — no, separable.`,
            ],
            whyItMatters:
              `Not all two-qubit states are entangled. When qubits are prepared independently ` +
              `without an entangling gate, the result is separable. Knowing the difference helps ` +
              `you understand which quantum operations create useful quantum correlations.`,
          },
        };
      }

      default: return null;
    }
  },
},

cnot_apply: {
  generate(difficulty, variation) {
    const inputs  = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
    const outputs = [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]];
    const labels  = ['|00⟩','|01⟩','|10⟩','|11⟩'];
    const outLabels = ['|00⟩','|01⟩','|11⟩','|10⟩'];

    switch (variation) {

      case 'basic': {
        const wi = randInt(0, 3);
        let pi;
        do { pi = randInt(0, 3); } while (pi === wi);
        return {
          teachingText:
            `The CNOT (Controlled-NOT) gate acts on two qubits: a control and a target. ` +
            `It flips the target qubit if and only if the control qubit is |1⟩.\n\n` +
            `|00⟩ → |00⟩  (control=0, no flip)\n` +
            `|01⟩ → |01⟩  (control=0, no flip)\n` +
            `|10⟩ → |11⟩  (control=1, target flips: 0→1)\n` +
            `|11⟩ → |10⟩  (control=1, target flips: 1→0)\n\n` +
            `The first qubit (control) is never changed.`,
          workedExample: {
            problem: `Apply CNOT to ${labels[wi]}. Result as a 4-vector`,
            steps: [
              `Control qubit (first) = ${labels[wi][1]}`,
              labels[wi][1] === '1'
                ? `Control is |1⟩, so target flips: ${labels[wi]} → ${outLabels[wi]}`
                : `Control is |0⟩, so target stays: ${labels[wi]} → ${outLabels[wi]}`,
              `As a 4-vector: ${fmtVec4(outputs[wi])}`,
            ],
            insight: `CNOT only changes things when the control qubit is |1⟩.`,
          },
          tryIt: {
            question: `Apply CNOT to ${labels[pi]}. Result as a 4-vector:`,
            answer: outputs[pi],
            answerType: 'vector4',
            answerDisplay: fmtVec4(outputs[pi]),
            steps: [
              `Control qubit = ${labels[pi][1]}`,
              labels[pi][1] === '1'
                ? `Control is |1⟩, target flips: ${labels[pi]} → ${outLabels[pi]}`
                : `Control is |0⟩, target unchanged: ${labels[pi]} → ${outLabels[pi]}`,
              `Answer: ${fmtVec4(outputs[pi])}`,
            ],
            whyItMatters:
              `CNOT is the most important two-qubit gate. Combined with single-qubit gates, ` +
              `it forms a universal gate set — meaning any quantum computation can be built from ` +
              `CNOT plus single-qubit rotations. It is also the key ingredient for creating entanglement.`,
          },
        };
      }

      case 'control_one': {
        const wi = randInt(2, 3);
        let pi;
        do { pi = randInt(2, 3); } while (pi === wi);
        return {
          teachingText:
            `When the control qubit is |1⟩, CNOT always flips the target qubit. ` +
            `These are the "interesting" cases where CNOT actually does something:\n\n` +
            `|10⟩ → |11⟩  (target 0 flips to 1)\n` +
            `|11⟩ → |10⟩  (target 1 flips to 0)\n\n` +
            `CNOT with control=|1⟩ acts like an X gate on the target qubit.`,
          workedExample: {
            problem: `Apply CNOT to ${labels[wi]}. Result as a 4-vector`,
            steps: [
              `Control is |1⟩, so target flips`,
              `${labels[wi]} → ${outLabels[wi]}`,
              `As a 4-vector: ${fmtVec4(outputs[wi])}`,
            ],
            insight: `CNOT with control=|1⟩ is equivalent to applying X to the target qubit.`,
          },
          tryIt: {
            question: `Apply CNOT to ${labels[pi]}. Result as a 4-vector:`,
            answer: outputs[pi],
            answerType: 'vector4',
            answerDisplay: fmtVec4(outputs[pi]),
            steps: [
              `Control is |1⟩, target flips`,
              `${labels[pi]} → ${outLabels[pi]}`,
              `Answer: ${fmtVec4(outputs[pi])}`,
            ],
            whyItMatters:
              `Understanding CNOT when the control is |1⟩ is critical for tracing quantum circuits. ` +
              `In algorithms like Grover's, the oracle often uses CNOT-like operations to flip ` +
              `target qubits conditional on the search state being correct.`,
          },
        };
      }

      case 'superposition': {
        // Two different superposition CNOT scenarios
        const supCases = [
          { inVec: [0.71, 0, 0.71, 0], outVec: [0.71, 0, 0, 0.71],
            inLabel: '(0.71, 0, 0.71, 0) = (|00⟩+|10⟩)/√2',
            outLabel: '(0.71, 0, 0, 0.71) = (|00⟩+|11⟩)/√2' },
          { inVec: [0, 0.71, 0, 0.71], outVec: [0, 0.71, 0.71, 0],
            inLabel: '(0, 0.71, 0, 0.71) = (|01⟩+|11⟩)/√2',
            outLabel: '(0, 0.71, 0.71, 0) = (|01⟩+|10⟩)/√2' },
        ];
        const wi = randInt(0, supCases.length - 1);
        const pi = 1 - wi;
        const w = supCases[wi], p = supCases[pi];
        return {
          teachingText:
            `CNOT works on superpositions too — apply the rule to each basis component separately:\n\n` +
            `CNOT maps: |00⟩→|00⟩, |01⟩→|01⟩, |10⟩→|11⟩, |11⟩→|10⟩\n\n` +
            `For a superposition, transform each term independently and recombine. ` +
            `This is the linearity of quantum mechanics: gates act on each component.`,
          workedExample: {
            problem: `Apply CNOT to ${fmtVec4(w.inVec)}`,
            steps: [
              `Input: ${w.inLabel}`,
              `Apply CNOT to each basis component:`,
              `|00⟩ → |00⟩, |10⟩ → |11⟩ (or |01⟩ → |01⟩, |11⟩ → |10⟩)`,
              `Result: ${fmtVec4(w.outVec)}`,
            ],
            insight: `CNOT on a superposition can create entanglement — this is how Bell states are made.`,
          },
          tryIt: {
            question: `Apply CNOT to ${fmtVec4(p.inVec)}. Result:`,
            answer: p.outVec,
            answerType: 'vector4',
            answerDisplay: fmtVec4(p.outVec),
            steps: [
              `Input: ${p.inLabel}`,
              `Apply CNOT to each basis component`,
              `Result: ${fmtVec4(p.outVec)}`,
            ],
            whyItMatters:
              `Applying CNOT to superpositions is exactly how entanglement is created in practice. ` +
              `The famous Bell state circuit applies H then CNOT: the H creates a superposition, ` +
              `and the CNOT entangles the two qubits. This is the basis of quantum communication.`,
          },
        };
      }

      default: return null;
    }
  },
},

build_bell_state: {
  generate(difficulty, variation) {
    const cases = [
      { input: '|00⟩', afterH: [0.71, 0, 0.71, 0], output: [0.71, 0, 0, 0.71], bellName: '|Φ+⟩' },
      { input: '|01⟩', afterH: [0, 0.71, 0, 0.71], output: [0, 0.71, 0.71, 0], bellName: '|Ψ+⟩' },
      { input: '|10⟩', afterH: [0.71, 0, -0.71, 0], output: [0.71, 0, 0, -0.71], bellName: '|Φ-⟩' },
      { input: '|11⟩', afterH: [0, 0.71, 0, -0.71], output: [0, 0.71, -0.71, 0], bellName: '|Ψ-⟩' },
    ];

    switch (variation) {

      case 'basic': {
        const wi = randInt(0, 3);
        let pi;
        do { pi = randInt(0, 3); } while (pi === wi);
        const w = cases[wi], p = cases[pi];
        return {
          teachingText:
            `The Bell state circuit applies two operations in sequence:\n\n` +
            `1. H ⊗ I — apply Hadamard to the first qubit, leave the second alone\n` +
            `2. CNOT — flip the second qubit if the first is |1⟩\n\n` +
            `Starting from the four basis states, this produces the four Bell states:\n` +
            `|00⟩ → |Φ+⟩ = (0.71, 0, 0, 0.71)\n` +
            `|01⟩ → |Ψ+⟩ = (0, 0.71, 0.71, 0)\n` +
            `|10⟩ → |Φ-⟩ = (0.71, 0, 0, -0.71)\n` +
            `|11⟩ → |Ψ-⟩ = (0, 0.71, -0.71, 0)`,
          workedExample: {
            problem: `Apply (H⊗I) then CNOT to ${w.input}. Result as a 4-vector`,
            steps: [
              `Step 1 — H⊗I on ${w.input}: apply H to first qubit only`,
              `Result after H⊗I: ${fmtVec4(w.afterH)}`,
              `Step 2 — CNOT: flip target when control is |1⟩`,
              `Result: ${fmtVec4(w.output)} = ${w.bellName}`,
            ],
            insight: `H creates the superposition, CNOT creates the entanglement. Together they make a Bell state.`,
          },
          tryIt: {
            question: `Apply (H⊗I) then CNOT to ${p.input}. Result:`,
            answer: p.output,
            answerType: 'vector4',
            answerDisplay: fmtVec4(p.output),
            steps: [
              `H⊗I on ${p.input} → ${fmtVec4(p.afterH)}`,
              `CNOT → ${fmtVec4(p.output)} = ${p.bellName}`,
            ],
            whyItMatters:
              `The Bell state circuit is the most important two-qubit circuit in quantum computing. ` +
              `It is the starting point for quantum teleportation, superdense coding, and many ` +
              `quantum error correction codes. Mastering it is essential.`,
          },
        };
      }

      case 'phi_states': {
        // Only |00⟩ → Φ+ or |10⟩ → Φ-
        const wi = randInt(0, 1) === 0 ? 0 : 2;
        const pi = wi === 0 ? 2 : 0;
        const w = cases[wi], p = cases[pi];
        return {
          teachingText:
            `The Φ (Phi) Bell states come from inputs where the second qubit is |0⟩:\n\n` +
            `|00⟩ → (H⊗I) → (0.71, 0, 0.71, 0) → CNOT → (0.71, 0, 0, 0.71) = |Φ+⟩\n` +
            `|10⟩ → (H⊗I) → (0.71, 0, -0.71, 0) → CNOT → (0.71, 0, 0, -0.71) = |Φ-⟩\n\n` +
            `The difference: |Φ+⟩ has matching signs, |Φ-⟩ has a minus on the |11⟩ component.`,
          workedExample: {
            problem: `Apply (H⊗I) then CNOT to ${w.input}`,
            steps: [
              `H⊗I on ${w.input} → ${fmtVec4(w.afterH)}`,
              `CNOT → ${fmtVec4(w.output)} = ${w.bellName}`,
            ],
            insight: `Φ+ and Φ- differ only by a sign — the first qubit being |1⟩ vs |0⟩ flips that sign.`,
          },
          tryIt: {
            question: `Apply (H⊗I) then CNOT to ${p.input}. Result:`,
            answer: p.output,
            answerType: 'vector4',
            answerDisplay: fmtVec4(p.output),
            steps: [
              `H⊗I on ${p.input} → ${fmtVec4(p.afterH)}`,
              `CNOT → ${fmtVec4(p.output)} = ${p.bellName}`,
            ],
            whyItMatters:
              `|Φ+⟩ and |Φ-⟩ are used in the E91 quantum key distribution protocol. ` +
              `The relative phase (+ vs -) can be detected by measurement in different bases, ` +
              `which is how quantum cryptography detects eavesdroppers.`,
          },
        };
      }

      case 'psi_states': {
        // Only |01⟩ → Ψ+ or |11⟩ → Ψ-
        const wi = randInt(0, 1) === 0 ? 1 : 3;
        const pi = wi === 1 ? 3 : 1;
        const w = cases[wi], p = cases[pi];
        return {
          teachingText:
            `The Ψ (Psi) Bell states come from inputs where the second qubit is |1⟩:\n\n` +
            `|01⟩ → (H⊗I) → (0, 0.71, 0, 0.71) → CNOT → (0, 0.71, 0.71, 0) = |Ψ+⟩\n` +
            `|11⟩ → (H⊗I) → (0, 0.71, 0, -0.71) → CNOT → (0, 0.71, -0.71, 0) = |Ψ-⟩\n\n` +
            `In Ψ states, the two qubits always have opposite values when measured.`,
          workedExample: {
            problem: `Apply (H⊗I) then CNOT to ${w.input}`,
            steps: [
              `H⊗I on ${w.input} → ${fmtVec4(w.afterH)}`,
              `CNOT → ${fmtVec4(w.output)} = ${w.bellName}`,
            ],
            insight: `In Ψ states, measuring one qubit always gives the OPPOSITE of the other.`,
          },
          tryIt: {
            question: `Apply (H⊗I) then CNOT to ${p.input}. Result:`,
            answer: p.output,
            answerType: 'vector4',
            answerDisplay: fmtVec4(p.output),
            steps: [
              `H⊗I on ${p.input} → ${fmtVec4(p.afterH)}`,
              `CNOT → ${fmtVec4(p.output)} = ${p.bellName}`,
            ],
            whyItMatters:
              `|Ψ-⟩ is the singlet state, famous in physics for violating Bell's inequality. ` +
              `It proves that quantum mechanics cannot be explained by local hidden variables — ` +
              `one of the most profound results in all of science.`,
          },
        };
      }

      default: return null;
    }
  },
},

entangled_measurement: {
  generate(difficulty, variation) {
    const scenarios = [
      { bell: '(0.71, 0, 0, 0.71)', name: '|Φ+⟩', m1: '|0⟩', q2: [1, 0], explain: 'Measuring |0⟩ on qubit 1 collapses qubit 2 to |0⟩' },
      { bell: '(0.71, 0, 0, 0.71)', name: '|Φ+⟩', m1: '|1⟩', q2: [0, 1], explain: 'Measuring |1⟩ on qubit 1 collapses qubit 2 to |1⟩' },
      { bell: '(0, 0.71, 0.71, 0)', name: '|Ψ+⟩', m1: '|0⟩', q2: [0, 1], explain: 'Measuring |0⟩ on qubit 1 collapses qubit 2 to |1⟩' },
      { bell: '(0, 0.71, 0.71, 0)', name: '|Ψ+⟩', m1: '|1⟩', q2: [1, 0], explain: 'Measuring |1⟩ on qubit 1 collapses qubit 2 to |0⟩' },
      { bell: '(0.71, 0, 0, -0.71)', name: '|Φ-⟩', m1: '|0⟩', q2: [1, 0], explain: 'Measuring |0⟩ on qubit 1 collapses qubit 2 to |0⟩' },
      { bell: '(0.71, 0, 0, -0.71)', name: '|Φ-⟩', m1: '|1⟩', q2: [0, -1], explain: 'Measuring |1⟩ on qubit 1 collapses qubit 2 to -|1⟩ = (0, -1)' },
    ];

    switch (variation) {

      case 'basic': {
        const wi = randInt(0, scenarios.length - 1);
        let pi;
        do { pi = randInt(0, scenarios.length - 1); } while (pi === wi);
        const w = scenarios[wi], p = scenarios[pi];
        return {
          teachingText:
            `When you measure one qubit of an entangled pair, the other qubit's state is ` +
            `instantly determined. This is the "spooky action" of quantum mechanics.\n\n` +
            `For |Φ+⟩ = (0.71, 0, 0, 0.71) = 0.71|00⟩ + 0.71|11⟩:\n` +
            `- Measure qubit 1 as |0⟩ → qubit 2 must be |0⟩\n` +
            `- Measure qubit 1 as |1⟩ → qubit 2 must be |1⟩\n\n` +
            `The key: look at which basis states are present and which are consistent with the measurement.`,
          workedExample: {
            problem: `Bell state ${w.bell}. Qubit 1 measured as ${w.m1}. What is qubit 2?`,
            steps: [
              `The Bell state is ${w.name} = ${w.bell}`,
              `Qubit 1 measured as ${w.m1}`,
              w.explain,
              `Qubit 2 = ${fmtVec(w.q2)}`,
            ],
            insight: `The measurement result on qubit 1 selects which terms survive in the superposition.`,
          },
          tryIt: {
            question: `Bell state ${p.bell}. Qubit 1 measured as ${p.m1}. What is qubit 2?`,
            answer: p.q2,
            answerType: 'vector',
            answerDisplay: fmtVec(p.q2),
            steps: [
              `Bell state: ${p.name} = ${p.bell}`,
              `Qubit 1 = ${p.m1}`,
              p.explain,
              `Qubit 2 = ${fmtVec(p.q2)}`,
            ],
            whyItMatters:
              `This instantaneous correlation is the basis of quantum teleportation. By sharing ` +
              `a Bell pair and performing measurements, Alice can transmit quantum information to ` +
              `Bob — a feat impossible with classical communication alone.`,
          },
        };
      }

      case 'phi_plus': {
        // Only Φ+ scenarios (indices 0, 1)
        const wi = randInt(0, 1);
        const pi = 1 - wi;
        const w = scenarios[wi], p = scenarios[pi];
        return {
          teachingText:
            `|Φ+⟩ = (0.71, 0, 0, 0.71) = 0.71|00⟩ + 0.71|11⟩\n\n` +
            `In |Φ+⟩, the two qubits are always the SAME:\n` +
            `- If qubit 1 is |0⟩, qubit 2 is |0⟩\n` +
            `- If qubit 1 is |1⟩, qubit 2 is |1⟩\n\n` +
            `Only |00⟩ and |11⟩ appear — the qubits are perfectly correlated.`,
          workedExample: {
            problem: `Bell state ${w.bell}. Qubit 1 measured as ${w.m1}. What is qubit 2?`,
            steps: [
              `|Φ+⟩ = 0.71|00⟩ + 0.71|11⟩ — qubits always match`,
              `Qubit 1 = ${w.m1}`,
              w.explain,
              `Qubit 2 = ${fmtVec(w.q2)}`,
            ],
            insight: `In |Φ+⟩, the qubits are perfectly correlated — always the same value.`,
          },
          tryIt: {
            question: `Bell state ${p.bell}. Qubit 1 measured as ${p.m1}. What is qubit 2?`,
            answer: p.q2,
            answerType: 'vector',
            answerDisplay: fmtVec(p.q2),
            steps: [
              `|Φ+⟩ has only |00⟩ and |11⟩ — qubits match`,
              `Qubit 1 = ${p.m1}`,
              p.explain,
              `Qubit 2 = ${fmtVec(p.q2)}`,
            ],
            whyItMatters:
              `|Φ+⟩ is the standard Bell state used in most quantum teleportation protocols. ` +
              `Understanding how measurement of one qubit determines the other is the first step ` +
              `to understanding quantum communication.`,
          },
        };
      }

      case 'psi_plus': {
        // Only Ψ+ scenarios (indices 2, 3)
        const wi = randInt(0, 1);
        const pi = 1 - wi;
        const w = scenarios[wi + 2], p = scenarios[pi + 2];
        return {
          teachingText:
            `|Ψ+⟩ = (0, 0.71, 0.71, 0) = 0.71|01⟩ + 0.71|10⟩\n\n` +
            `In |Ψ+⟩, the two qubits are always OPPOSITE:\n` +
            `- If qubit 1 is |0⟩, qubit 2 is |1⟩\n` +
            `- If qubit 1 is |1⟩, qubit 2 is |0⟩\n\n` +
            `Only |01⟩ and |10⟩ appear — the qubits are perfectly anti-correlated.`,
          workedExample: {
            problem: `Bell state ${w.bell}. Qubit 1 measured as ${w.m1}. What is qubit 2?`,
            steps: [
              `|Ψ+⟩ = 0.71|01⟩ + 0.71|10⟩ — qubits always opposite`,
              `Qubit 1 = ${w.m1}`,
              w.explain,
              `Qubit 2 = ${fmtVec(w.q2)}`,
            ],
            insight: `In |Ψ+⟩, the qubits are perfectly anti-correlated — always opposite values.`,
          },
          tryIt: {
            question: `Bell state ${p.bell}. Qubit 1 measured as ${p.m1}. What is qubit 2?`,
            answer: p.q2,
            answerType: 'vector',
            answerDisplay: fmtVec(p.q2),
            steps: [
              `|Ψ+⟩ has only |01⟩ and |10⟩ — qubits are opposite`,
              `Qubit 1 = ${p.m1}`,
              p.explain,
              `Qubit 2 = ${fmtVec(p.q2)}`,
            ],
            whyItMatters:
              `Anti-correlated Bell states like |Ψ+⟩ are used in superdense coding, where ` +
              `a single qubit can transmit two classical bits of information. The correlation ` +
              `pattern tells you which Bell state you have.`,
          },
        };
      }

      default: return null;
    }
  },
},

// ── Chapter 11: Quantum Circuits ────────────────────────────────────────────

trace_single_qubit: {
  generate(difficulty, variation) {
    function applyGate(s, gate) {
      if (gate === 'X') return [s[1], s[0]];
      if (gate === 'Z') return [s[0], -s[1]];
      // H
      const a = r2((s[0] + s[1]) * 0.71);
      const b = r2((s[0] - s[1]) * 0.71);
      return [a, b];
    }

    function fmtState(s) {
      return `(${s.map(v => Number.isInteger(v) ? String(v) : v.toFixed(2)).join(', ')})`;
    }

    switch (variation) {

      case 'basic': {
        const gatesPool = ['X', 'Z', 'H'];
        const wg1 = gatesPool[randInt(0, 2)], wg2 = gatesPool[randInt(0, 2)];
        const wInput = randInt(0, 1);
        const wState = wInput === 0 ? [1, 0] : [0, 1];
        const wLabel = wInput === 0 ? '|0⟩' : '|1⟩';
        const wA1 = applyGate(wState, wg1);
        const wA2 = applyGate(wA1, wg2);
        const wAns = [r2(wA2[0]), r2(wA2[1])];

        let pg1, pg2, pInput;
        do {
          pg1 = gatesPool[randInt(0, 2)]; pg2 = gatesPool[randInt(0, 2)];
          pInput = randInt(0, 1);
        } while (pg1 === wg1 && pg2 === wg2 && pInput === wInput);
        const pState = pInput === 0 ? [1, 0] : [0, 1];
        const pLabel = pInput === 0 ? '|0⟩' : '|1⟩';
        const pA1 = applyGate(pState, pg1);
        const pA2 = applyGate(pA1, pg2);
        const pAns = [r2(pA2[0]), r2(pA2[1])];

        return {
          teachingText:
            `To trace a quantum circuit, apply each gate one at a time from left to right.\n\n` +
            `Gate effects on state (a, b):\n` +
            `- X (NOT): swaps → (b, a)\n` +
            `- Z (phase): negates second → (a, -b)\n` +
            `- H (Hadamard): → (0.71(a+b), 0.71(a-b))\n\n` +
            `Start with the input state, apply the first gate, then apply the second gate to the result.`,
          workedExample: {
            problem: `Start with ${wLabel}. Apply ${wg1} then ${wg2}. Output state?`,
            steps: [
              `Start: ${wLabel} = ${fmtState(wState)}`,
              `After ${wg1}: ${fmtState(wA1)}`,
              `After ${wg2}: ${fmtState(wAns)}`,
            ],
            insight: `Always apply gates in order, using the output of one as the input to the next.`,
          },
          tryIt: {
            question: `Start with ${pLabel}. Apply ${pg1} then ${pg2}. Output state:`,
            answer: pAns,
            answerType: 'vector',
            answerDisplay: fmtVec(pAns),
            steps: [
              `Start: ${pLabel} = ${fmtState(pState)}`,
              `After ${pg1}: ${fmtState(pA1)}`,
              `After ${pg2}: ${fmtState(pAns)}`,
            ],
            whyItMatters:
              `Tracing circuits gate by gate is how you verify quantum algorithms work correctly. ` +
              `Every quantum computation is a sequence of gates, and understanding the state after ` +
              `each step is essential for debugging quantum programs.`,
          },
        };
      }

      case 'xz_only': {
        const gatesPool = ['X', 'Z'];
        const wg1 = gatesPool[randInt(0, 1)], wg2 = gatesPool[randInt(0, 1)];
        const wInput = randInt(0, 1);
        const wState = wInput === 0 ? [1, 0] : [0, 1];
        const wLabel = wInput === 0 ? '|0⟩' : '|1⟩';
        const wA1 = applyGate(wState, wg1);
        const wA2 = applyGate(wA1, wg2);
        const wAns = [r2(wA2[0]), r2(wA2[1])];

        let pg1, pg2, pInput;
        do {
          pg1 = gatesPool[randInt(0, 1)]; pg2 = gatesPool[randInt(0, 1)];
          pInput = randInt(0, 1);
        } while (pg1 === wg1 && pg2 === wg2 && pInput === wInput);
        const pState = pInput === 0 ? [1, 0] : [0, 1];
        const pLabel = pInput === 0 ? '|0⟩' : '|1⟩';
        const pA1 = applyGate(pState, pg1);
        const pA2 = applyGate(pA1, pg2);
        const pAns = [r2(pA2[0]), r2(pA2[1])];

        return {
          teachingText:
            `Let us start with just X and Z gates — no Hadamard yet.\n\n` +
            `- X (NOT gate): swaps the amplitudes → (a, b) becomes (b, a)\n` +
            `- Z (phase gate): negates the second amplitude → (a, b) becomes (a, -b)\n\n` +
            `X flips the qubit: |0⟩ → |1⟩ and |1⟩ → |0⟩.\n` +
            `Z adds a phase: |0⟩ → |0⟩ (unchanged) and |1⟩ → -|1⟩.`,
          workedExample: {
            problem: `Start with ${wLabel}. Apply ${wg1} then ${wg2}. Output state?`,
            steps: [
              `Start: ${wLabel} = ${fmtState(wState)}`,
              `After ${wg1}: ${fmtState(wA1)}`,
              `After ${wg2}: ${fmtState(wAns)}`,
            ],
            insight: `X and Z never create superposition — the output is always a basis state (possibly with a minus sign).`,
          },
          tryIt: {
            question: `Start with ${pLabel}. Apply ${pg1} then ${pg2}. Output state:`,
            answer: pAns,
            answerType: 'vector',
            answerDisplay: fmtVec(pAns),
            steps: [
              `Start: ${pLabel} = ${fmtState(pState)}`,
              `After ${pg1}: ${fmtState(pA1)}`,
              `After ${pg2}: ${fmtState(pAns)}`,
            ],
            whyItMatters:
              `X and Z are Pauli gates — the building blocks of quantum error correction. ` +
              `Understanding how they transform states is necessary before moving on to ` +
              `more complex gates and circuits.`,
          },
        };
      }

      case 'with_h': {
        const gatesPool = ['X', 'Z', 'H'];
        // Ensure at least one H
        let wg1, wg2;
        do {
          wg1 = gatesPool[randInt(0, 2)]; wg2 = gatesPool[randInt(0, 2)];
        } while (wg1 !== 'H' && wg2 !== 'H');
        const wInput = randInt(0, 1);
        const wState = wInput === 0 ? [1, 0] : [0, 1];
        const wLabel = wInput === 0 ? '|0⟩' : '|1⟩';
        const wA1 = applyGate(wState, wg1);
        const wA2 = applyGate(wA1, wg2);
        const wAns = [r2(wA2[0]), r2(wA2[1])];

        let pg1, pg2, pInput;
        do {
          pg1 = gatesPool[randInt(0, 2)]; pg2 = gatesPool[randInt(0, 2)];
          pInput = randInt(0, 1);
        } while ((pg1 !== 'H' && pg2 !== 'H') || (pg1 === wg1 && pg2 === wg2 && pInput === wInput));
        const pState = pInput === 0 ? [1, 0] : [0, 1];
        const pLabel = pInput === 0 ? '|0⟩' : '|1⟩';
        const pA1 = applyGate(pState, pg1);
        const pA2 = applyGate(pA1, pg2);
        const pAns = [r2(pA2[0]), r2(pA2[1])];

        return {
          teachingText:
            `The Hadamard gate (H) creates superpositions, unlike X and Z which keep states as ` +
            `basis states. H maps:\n\n` +
            `(a, b) → (0.71(a+b), 0.71(a-b))\n\n` +
            `So H|0⟩ = (0.71, 0.71) and H|1⟩ = (0.71, -0.71).\n\n` +
            `When H appears in a circuit, the output typically has non-integer amplitudes. ` +
            `Round to 2 decimal places.`,
          workedExample: {
            problem: `Start with ${wLabel}. Apply ${wg1} then ${wg2}. Output state?`,
            steps: [
              `Start: ${wLabel} = ${fmtState(wState)}`,
              `After ${wg1}: ${fmtState(wA1)}`,
              `After ${wg2}: ${fmtState(wAns)}`,
            ],
            insight: `H is the gate that puts qubits into superposition — the starting point of most quantum algorithms.`,
          },
          tryIt: {
            question: `Start with ${pLabel}. Apply ${pg1} then ${pg2}. Output state:`,
            answer: pAns,
            answerType: 'vector',
            answerDisplay: fmtVec(pAns),
            steps: [
              `Start: ${pLabel} = ${fmtState(pState)}`,
              `After ${pg1}: ${fmtState(pA1)}`,
              `After ${pg2}: ${fmtState(pAns)}`,
            ],
            whyItMatters:
              `Almost every quantum algorithm begins with H gates to create superposition. ` +
              `Grover's algorithm, Shor's algorithm, and quantum simulation all rely on the ` +
              `Hadamard gate as a fundamental building block.`,
          },
        };
      }

      default: return null;
    }
  },
},

trace_two_qubit: {
  generate(difficulty, variation) {
    const basisLabels = ['|00⟩','|01⟩','|10⟩','|11⟩'];
    const basisVecs   = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];

    // X⊗I outputs: flips first qubit
    const xIOutputs = [[0,0,1,0],[0,0,0,1],[1,0,0,0],[0,1,0,0]];
    const xIOutLabels = ['|10⟩','|11⟩','|00⟩','|01⟩'];

    // CNOT outputs
    const cnotOutputs = [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]];
    const cnotOutLabels = ['|00⟩','|01⟩','|11⟩','|10⟩'];

    switch (variation) {

      case 'basic': {
        // Mix of X⊗I and CNOT
        const wUseXI = Math.random() > 0.5;
        const wi = randInt(0, 3);
        const wGate = wUseXI ? 'X⊗I' : 'CNOT';
        const wOut = wUseXI ? xIOutputs[wi] : cnotOutputs[wi];
        const wOutLabel = wUseXI ? xIOutLabels[wi] : cnotOutLabels[wi];

        let pUseXI, pi;
        do {
          pUseXI = Math.random() > 0.5;
          pi = randInt(0, 3);
        } while (pUseXI === wUseXI && pi === wi);
        const pGate = pUseXI ? 'X⊗I' : 'CNOT';
        const pOut = pUseXI ? xIOutputs[pi] : cnotOutputs[pi];
        const pOutLabel = pUseXI ? xIOutLabels[pi] : cnotOutLabels[pi];

        return {
          teachingText:
            `Two-qubit gates transform 4-vectors. The two most common:\n\n` +
            `X⊗I (X on first qubit, I on second): flips the first qubit\n` +
            `  |00⟩→|10⟩, |01⟩→|11⟩, |10⟩→|00⟩, |11⟩→|01⟩\n\n` +
            `CNOT: flips the second qubit if the first is |1⟩\n` +
            `  |00⟩→|00⟩, |01⟩→|01⟩, |10⟩→|11⟩, |11⟩→|10⟩`,
          workedExample: {
            problem: `Apply ${wGate} to ${basisLabels[wi]}. Output as 4-vector`,
            steps: [
              `Input: ${basisLabels[wi]} = ${fmtVec4(basisVecs[wi])}`,
              `Apply ${wGate}: ${basisLabels[wi]} → ${wOutLabel}`,
              `Result: ${fmtVec4(wOut)}`,
            ],
            insight: `X⊗I acts on the first qubit only. CNOT acts on both qubits conditionally.`,
          },
          tryIt: {
            question: `Apply ${pGate} to ${basisLabels[pi]}. Output as 4-vector:`,
            answer: pOut,
            answerType: 'vector4',
            answerDisplay: fmtVec4(pOut),
            steps: [
              `Input: ${basisLabels[pi]} = ${fmtVec4(basisVecs[pi])}`,
              `Apply ${pGate}: ${basisLabels[pi]} → ${pOutLabel}`,
              `Answer: ${fmtVec4(pOut)}`,
            ],
            whyItMatters:
              `Understanding how two-qubit gates transform basis states is essential for reading ` +
              `quantum circuit diagrams. Each wire in a circuit carries one qubit, and gates ` +
              `act on one or two wires at a time.`,
          },
        };
      }

      case 'x_tensor_i': {
        const wi = randInt(0, 3);
        let pi;
        do { pi = randInt(0, 3); } while (pi === wi);
        return {
          teachingText:
            `X⊗I means "apply X to the first qubit, do nothing to the second." The X gate ` +
            `flips |0⟩ ↔ |1⟩, so X⊗I flips just the first qubit's label:\n\n` +
            `|00⟩ → |10⟩,  |01⟩ → |11⟩\n` +
            `|10⟩ → |00⟩,  |11⟩ → |01⟩\n\n` +
            `The second qubit is completely unaffected.`,
          workedExample: {
            problem: `Apply X⊗I to ${basisLabels[wi]}. Output as 4-vector`,
            steps: [
              `X⊗I flips the first qubit only`,
              `${basisLabels[wi]} → ${xIOutLabels[wi]}`,
              `As a 4-vector: ${fmtVec4(xIOutputs[wi])}`,
            ],
            insight: `The ⊗ in X⊗I means each gate acts on its own qubit independently.`,
          },
          tryIt: {
            question: `Apply X⊗I to ${basisLabels[pi]}. Output as 4-vector:`,
            answer: xIOutputs[pi],
            answerType: 'vector4',
            answerDisplay: fmtVec4(xIOutputs[pi]),
            steps: [
              `X flips the first qubit: ${basisLabels[pi]} → ${xIOutLabels[pi]}`,
              `Answer: ${fmtVec4(xIOutputs[pi])}`,
            ],
            whyItMatters:
              `Single-qubit gates applied to multi-qubit systems (via tensor product with I) ` +
              `are the most common operations in quantum circuits. Understanding that each gate ` +
              `acts on its own wire is key to reading circuit diagrams.`,
          },
        };
      }

      case 'cnot': {
        const wi = randInt(0, 3);
        let pi;
        do { pi = randInt(0, 3); } while (pi === wi);
        return {
          teachingText:
            `CNOT is a two-qubit gate where the first qubit controls whether the second flips:\n\n` +
            `|00⟩ → |00⟩  (control=0, no flip)\n` +
            `|01⟩ → |01⟩  (control=0, no flip)\n` +
            `|10⟩ → |11⟩  (control=1, target flips)\n` +
            `|11⟩ → |10⟩  (control=1, target flips)\n\n` +
            `Unlike X⊗I, CNOT creates a dependency between the qubits.`,
          workedExample: {
            problem: `Apply CNOT to ${basisLabels[wi]}. Output as 4-vector`,
            steps: [
              `Input: ${basisLabels[wi]}`,
              `Control qubit = ${basisLabels[wi][1]}`,
              basisLabels[wi][1] === '1'
                ? `Control is 1 → target flips: ${basisLabels[wi]} → ${cnotOutLabels[wi]}`
                : `Control is 0 → no change: ${basisLabels[wi]} → ${cnotOutLabels[wi]}`,
              `Result: ${fmtVec4(cnotOutputs[wi])}`,
            ],
            insight: `CNOT's conditional action is what allows it to create entanglement.`,
          },
          tryIt: {
            question: `Apply CNOT to ${basisLabels[pi]}. Output as 4-vector:`,
            answer: cnotOutputs[pi],
            answerType: 'vector4',
            answerDisplay: fmtVec4(cnotOutputs[pi]),
            steps: [
              `Control qubit = ${basisLabels[pi][1]}`,
              basisLabels[pi][1] === '1'
                ? `Control is 1, target flips: ${basisLabels[pi]} → ${cnotOutLabels[pi]}`
                : `Control is 0, no change: ${basisLabels[pi]} → ${cnotOutLabels[pi]}`,
              `Answer: ${fmtVec4(cnotOutputs[pi])}`,
            ],
            whyItMatters:
              `CNOT in a circuit context is the workhorse of quantum computing. Combined with ` +
              `Hadamard gates, it creates entanglement. Combined with Toffoli gates, it enables ` +
              `reversible classical computation within quantum circuits.`,
          },
        };
      }

      default: return null;
    }
  },
},

circuit_probabilities: {
  generate(difficulty, variation) {
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

    switch (variation) {

      case 'basic': {
        const wi = randInt(0, scenarios.length - 1);
        let pi;
        do { pi = randInt(0, scenarios.length - 1); } while (pi === wi);
        const w = scenarios[wi], p = scenarios[pi];
        return {
          teachingText:
            `To find the probability of measuring |0⟩ after a circuit:\n\n` +
            `1. Trace the circuit: apply each gate in order to get the final state (a, b)\n` +
            `2. Square the first amplitude: P(|0⟩) = a²\n\n` +
            `Key gate results:\n` +
            `- H|0⟩ = (0.71, 0.71) → P(|0⟩) = 0.50\n` +
            `- X|0⟩ = (0, 1) → P(|0⟩) = 0\n` +
            `- Z|0⟩ = (1, 0) → P(|0⟩) = 1`,
          workedExample: {
            problem: `Circuit: ${w.circuit}. What is P(measure |0⟩)?`,
            steps: [
              `Trace the circuit:`,
              ...w.steps,
            ],
            insight: `P(|0⟩) = (first amplitude)². This is the Born rule applied to measurement.`,
          },
          tryIt: {
            question: `Circuit: ${p.circuit}. What is P(measure |0⟩)?`,
            answer: p.prob,
            answerType: 'numeric',
            answerDisplay: `${p.prob}`,
            steps: [
              `Trace the circuit:`,
              ...p.steps,
            ],
            whyItMatters:
              `Computing measurement probabilities is the final step of every quantum computation. ` +
              `The whole point of a quantum algorithm is to arrange gates so that the correct answer ` +
              `has high measurement probability.`,
          },
        };
      }

      case 'single_gate': {
        const wi = randInt(0, 4);
        let pi;
        do { pi = randInt(0, 4); } while (pi === wi);
        const w = scenarios[wi], p = scenarios[pi];
        return {
          teachingText:
            `With a single gate, the circuit is straightforward:\n\n` +
            `- H creates equal superposition: P(|0⟩) = 0.50\n` +
            `- X flips the qubit: |0⟩→|1⟩ means P(|0⟩) = 0, |1⟩→|0⟩ means P(|0⟩) = 1\n` +
            `- Z adds a phase: |0⟩ is unchanged (P=1), |1⟩ gets a minus (P stays 0)\n\n` +
            `After applying the gate, square the amplitude of |0⟩ to get the probability.`,
          workedExample: {
            problem: `Circuit: ${w.circuit}. What is P(measure |0⟩)?`,
            steps: [`Trace the circuit:`, ...w.steps],
            insight: `Single-gate circuits are the building blocks — master these first.`,
          },
          tryIt: {
            question: `Circuit: ${p.circuit}. What is P(measure |0⟩)?`,
            answer: p.prob,
            answerType: 'numeric',
            answerDisplay: `${p.prob}`,
            steps: [`Trace the circuit:`, ...p.steps],
            whyItMatters:
              `Single-gate circuits establish the baseline. Once you know what each gate does ` +
              `individually, you can trace any multi-gate circuit by composing these results.`,
          },
        };
      }

      case 'two_gate': {
        const wi = randInt(5, 7);
        let pi;
        do { pi = randInt(5, 7); } while (pi === wi);
        const w = scenarios[wi], p = scenarios[pi];
        return {
          teachingText:
            `With two gates, apply them left to right and track the state after each step:\n\n` +
            `Example: X then H on |0⟩\n` +
            `  Step 1: X|0⟩ = |1⟩ = (0, 1)\n` +
            `  Step 2: H(0, 1) = (0.71, -0.71)\n` +
            `  P(|0⟩) = 0.71² = 0.50\n\n` +
            `The order matters! H then X is different from X then H.`,
          workedExample: {
            problem: `Circuit: ${w.circuit}. What is P(measure |0⟩)?`,
            steps: [`Trace the circuit step by step:`, ...w.steps],
            insight: `Gate order matters — always apply left to right as written in the circuit.`,
          },
          tryIt: {
            question: `Circuit: ${p.circuit}. What is P(measure |0⟩)?`,
            answer: p.prob,
            answerType: 'numeric',
            answerDisplay: `${p.prob}`,
            steps: [`Trace the circuit:`, ...p.steps],
            whyItMatters:
              `Real quantum circuits have many gates in sequence. Being able to trace through ` +
              `two gates is the skill that scales to tracing through entire algorithms. ` +
              `Practice makes this second nature.`,
          },
        };
      }

      default: return null;
    }
  },
},

circuit_equivalence: {
  generate(difficulty, variation) {
    const cases = [
      { seq1: 'HZH', seq2: 'X', equiv: true, explain: 'HZH = X is a known identity. Apply to |0⟩: HZH|0⟩ = HZ(0.71,0.71) = H(0.71,-0.71) = (0,1) = X|0⟩.' },
      { seq1: 'HXH', seq2: 'Z', equiv: true, explain: 'HXH = Z is a known identity. Apply to |0⟩: HXH|0⟩ = HX(0.71,0.71) = H(0.71,0.71) = (1,0) = Z|0⟩.' },
      { seq1: 'XX', seq2: 'I', equiv: true, explain: 'X applied twice returns to the original state. XX|0⟩ = X|1⟩ = |0⟩ = I|0⟩.' },
      { seq1: 'HH', seq2: 'I', equiv: true, explain: 'H applied twice returns to the original state. HH|0⟩ = H(0.71,0.71) = (1,0) = I|0⟩.' },
      { seq1: 'ZZ', seq2: 'I', equiv: true, explain: 'Z applied twice returns to the original state. ZZ|0⟩ = Z|0⟩ = |0⟩ = I|0⟩.' },
      { seq1: 'HZ', seq2: 'X', equiv: false, explain: 'HZ|0⟩ = H(1,0) = (0.71,0.71), but X|0⟩ = (0,1). Different outputs, so not equivalent.' },
      { seq1: 'XZ', seq2: 'ZX', equiv: false, explain: 'XZ|0⟩ = X(1,0) = (0,1). ZX|0⟩ = Z(0,1) = (0,-1). Since (0,1) ≠ (0,-1), not equivalent.' },
      { seq1: 'XH', seq2: 'HZ', equiv: true, explain: 'XH|0⟩ = X(0.71,0.71) = (0.71,0.71). HZ|0⟩ = H(1,0) = (0.71,0.71). Same for |1⟩ too, so equivalent.' },
    ];

    switch (variation) {

      case 'basic': {
        const wi = randInt(0, cases.length - 1);
        let pi;
        do { pi = randInt(0, cases.length - 1); } while (pi === wi);
        const w = cases[wi], p = cases[pi];
        return {
          teachingText:
            `Two gate sequences are equivalent if they produce the same output for ALL possible inputs. ` +
            `For single-qubit circuits, you only need to check |0⟩ and |1⟩.\n\n` +
            `Important identities:\n` +
            `- XX = I, HH = I, ZZ = I (self-inverse gates)\n` +
            `- HZH = X, HXH = Z (conjugation identities)\n` +
            `- XH = HZ\n\n` +
            `If the outputs differ for even one input, the circuits are NOT equivalent.`,
          workedExample: {
            problem: `Are "${w.seq1}" and "${w.seq2}" equivalent?`,
            steps: [
              `Test on |0⟩ and |1⟩:`,
              w.explain,
              `Answer: ${w.equiv ? 'yes' : 'no'}`,
            ],
            insight: `If outputs match on both |0⟩ and |1⟩, the circuits are equivalent for all inputs.`,
          },
          tryIt: {
            question: `Are the gate sequences "${p.seq1}" and "${p.seq2}" equivalent? (yes or no)`,
            answer: p.equiv,
            answerType: 'yesno',
            answerDisplay: p.equiv ? 'yes' : 'no',
            steps: [
              `Test on |0⟩ and |1⟩:`,
              p.explain,
              `Answer: ${p.equiv ? 'yes' : 'no'}`,
            ],
            whyItMatters:
              `Circuit equivalence is the basis of quantum circuit optimization. Quantum compilers ` +
              `replace gate sequences with shorter equivalent ones to reduce errors. Fewer gates ` +
              `means less noise, which is critical on today's imperfect quantum hardware.`,
          },
        };
      }

      case 'self_inverse': {
        // XX=I, ZZ=I, HH=I (indices 2-4)
        const wi = randInt(2, 4);
        let pi;
        do { pi = randInt(2, 4); } while (pi === wi);
        const w = cases[wi], p = cases[pi];
        return {
          teachingText:
            `Some gates are their own inverse — applying them twice is the same as doing nothing (identity I):\n\n` +
            `- XX = I  (flip twice = no flip)\n` +
            `- ZZ = I  (negate phase twice = no change)\n` +
            `- HH = I  (Hadamard is its own inverse)\n\n` +
            `This is called being "involutory." These identities are used constantly in circuit simplification.`,
          workedExample: {
            problem: `Are "${w.seq1}" and "${w.seq2}" equivalent?`,
            steps: [
              `${w.seq1[0]} is self-inverse: applying it twice returns to the original state`,
              w.explain,
              `Answer: yes`,
            ],
            insight: `Self-inverse gates satisfy G² = I. This means G = G⁻¹.`,
          },
          tryIt: {
            question: `Are the gate sequences "${p.seq1}" and "${p.seq2}" equivalent? (yes or no)`,
            answer: p.equiv,
            answerType: 'yesno',
            answerDisplay: p.equiv ? 'yes' : 'no',
            steps: [
              `${p.seq1[0]} is self-inverse`,
              p.explain,
              `Answer: yes`,
            ],
            whyItMatters:
              `Self-inverse gates allow you to "undo" operations simply by repeating them. ` +
              `This is useful in quantum error correction: if an unwanted X error occurs, ` +
              `applying X again fixes it. The same principle applies to Z and H errors.`,
          },
        };
      }

      case 'conjugation': {
        // HZH=X, HXH=Z, XH=HZ (indices 0, 1, 7)
        const pool = [0, 1, 7];
        const wi = pool[randInt(0, pool.length - 1)];
        let pi;
        do { pi = pool[randInt(0, pool.length - 1)]; } while (pi === wi);
        const w = cases[wi], p = cases[pi];
        return {
          teachingText:
            `Conjugation identities show how H transforms between X and Z:\n\n` +
            `- HZH = X  (wrapping Z in H gates turns it into X)\n` +
            `- HXH = Z  (wrapping X in H gates turns it into Z)\n` +
            `- XH = HZ  (related identity)\n\n` +
            `These work because H rotates the Bloch sphere by 180° around an axis halfway ` +
            `between X and Z, swapping their roles.`,
          workedExample: {
            problem: `Are "${w.seq1}" and "${w.seq2}" equivalent?`,
            steps: [
              `This is a conjugation identity:`,
              w.explain,
              `Answer: yes`,
            ],
            insight: `H converts between X and Z — it is the "translator" between bit-flip and phase-flip.`,
          },
          tryIt: {
            question: `Are the gate sequences "${p.seq1}" and "${p.seq2}" equivalent? (yes or no)`,
            answer: p.equiv,
            answerType: 'yesno',
            answerDisplay: p.equiv ? 'yes' : 'no',
            steps: [
              `Conjugation identity:`,
              p.explain,
              `Answer: yes`,
            ],
            whyItMatters:
              `Conjugation identities are the backbone of quantum error correction. The ` +
              `relationship HZH = X means you can convert a phase-flip error (Z) into a ` +
              `bit-flip error (X) by surrounding it with H gates — making it detectable ` +
              `with standard error correction codes.`,
          },
        };
      }

      default: return null;
    }
  },
},

};
