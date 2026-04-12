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

// ── Chapter 12: Rotation Gates ───────────────────────────────────────────────

bloch_identification: {
  generate(difficulty, variation) {
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
        steps: ['|+⟩ is an equal superposition with no relative phase — the +x direction on the equator.'],
      },
      minus: {
        q: 'Where is |−⟩ = (|0⟩ − |1⟩)/√2 on the Bloch sphere?',
        choices: ['North pole', 'South pole', 'On the equator (positive x)', 'On the equator (negative x)'],
        answer: 'D', display: 'D) On the equator (negative x)',
        steps: ['|−⟩ has a π phase difference — the −x direction on the equator.'],
      },
      plusI: {
        q: 'Where is (|0⟩ + i|1⟩)/√2 on the Bloch sphere?',
        choices: ['North pole', 'On the equator (positive x)', 'On the equator (positive y)', 'On the equator (negative y)'],
        answer: 'C', display: 'C) On the equator (positive y)',
        steps: ['This state has a relative phase of π/2 (the factor i).', 'That corresponds to the +y direction on the equator.'],
      },
      minusI: {
        q: 'Where is (|0⟩ − i|1⟩)/√2 on the Bloch sphere?',
        choices: ['North pole', 'On the equator (positive x)', 'On the equator (positive y)', 'On the equator (negative y)'],
        answer: 'D', display: 'D) On the equator (negative y)',
        steps: ['This state has a relative phase of −π/2 (the factor −i).', 'That corresponds to the −y direction on the equator.'],
      },
    };

    function pickFrom(pool) {
      return pool[randInt(0, pool.length - 1)];
    }

    let wPool, pPool;
    if (variation === 'basis_states') { wPool = pPool = ['ket0', 'ket1']; }
    else if (variation === 'superposition') { wPool = pPool = ['plus', 'minus']; }
    else if (variation === 'phase_state') { wPool = pPool = ['plusI', 'minusI']; }
    else { wPool = pPool = ['ket0', 'ket1', 'plus', 'minus']; }

    const wKey = pickFrom(wPool);
    let pKey;
    do { pKey = pickFrom(pPool); } while (pKey === wKey && pPool.length > 1);
    const w = items[wKey];
    const p = items[pKey];

    const teachingMap = {
      basic:
        `The Bloch sphere is a geometric representation of a single qubit. Every ` +
        `single-qubit state can be mapped to a point on or inside this sphere. ` +
        `|0⟩ sits at the north pole, |1⟩ at the south pole. Equal superpositions ` +
        `like |+⟩ and |−⟩ live on the equator. Rotation gates correspond to ` +
        `rotations around different axes of the Bloch sphere.`,
      basis_states:
        `On the Bloch sphere, the computational basis states map to the poles: ` +
        `|0⟩ is the north pole (θ=0) and |1⟩ is the south pole (θ=π). ` +
        `The polar angle θ controls the probability split between |0⟩ and |1⟩, ` +
        `while the azimuthal angle φ controls the relative phase.`,
      superposition:
        `Equal superposition states live on the equator of the Bloch sphere. ` +
        `|+⟩ = (|0⟩ + |1⟩)/√2 is at the +x direction, and ` +
        `|−⟩ = (|0⟩ − |1⟩)/√2 is at the −x direction. The sign between ` +
        `the components determines which side of the equator the state sits on. ` +
        `The Hadamard gate rotates between the poles and the equator.`,
      phase_state:
        `States with imaginary relative phases sit on the y-axis of the equator. ` +
        `(|0⟩ + i|1⟩)/√2 is at +y, and (|0⟩ − i|1⟩)/√2 is at −y. ` +
        `The S gate rotates states from the x-axis to the y-axis of the equator — ` +
        `it adds a phase of π/2 to the |1⟩ component.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['basic'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps, `Answer: ${w.display}`],
        insight: `The Bloch sphere maps every possible qubit state to a point on a sphere — poles for basis states, equator for superpositions.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `The Bloch sphere lets you visualize rotation gates as physical rotations. ` +
          `Rx rotates around x, Ry around y, Rz around z. This geometric picture ` +
          `makes it much easier to understand what quantum gates actually do to a qubit.`,
      },
    };
  },
},

rz_apply: {
  generate(difficulty, variation) {
    const ANGLE_DATA = [
      { label: 'π/6', halfLabel: 'π/12', cosH: 0.97, sinH: 0.26 },
      { label: 'π/4', halfLabel: 'π/8',  cosH: 0.92, sinH: 0.38 },
      { label: 'π/3', halfLabel: 'π/6',  cosH: 0.87, sinH: 0.5  },
      { label: 'π/2', halfLabel: 'π/4',  cosH: 0.71, sinH: 0.71 },
      { label: 'π',   halfLabel: 'π/2',  cosH: 0,    sinH: 1    },
    ];
    const r2v = (n) => Math.round(n * 100) / 100;

    function makeNums(v) {
      const a = (v === 'simple_angle')
        ? ANGLE_DATA[randInt(3, 4)]
        : ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
      const useKet1 = Math.random() > 0.5;
      return { a, useKet1 };
    }

    function compute(a, useKet1) {
      const re = r2v(a.cosH);
      const im = useKet1 ? r2v(a.sinH) : r2v(-a.sinH);
      return [re, im];
    }

    switch (variation) {

      case 'basic':
      case 'simple_angle': {
        const w = makeNums(variation);
        const [wre, wim] = compute(w.a, w.useKet1);
        const wState = w.useKet1 ? '|1⟩' : '|0⟩';
        const wSign = w.useKet1 ? '+' : '−';
        const wComp = w.useKet1 ? 'second' : 'first';

        let p;
        do { p = makeNums(variation); } while (p.a.label === w.a.label && p.useKet1 === w.useKet1);
        const [pre, pim] = compute(p.a, p.useKet1);
        const pState = p.useKet1 ? '|1⟩' : '|0⟩';
        const pSign = p.useKet1 ? '+' : '−';
        const pComp = p.useKet1 ? 'second' : 'first';

        const teachingMap = {
          basic:
            `The Rz gate rotates a qubit around the z-axis of the Bloch sphere. ` +
            `Its matrix is Rz(θ) = [[e^(−iθ/2), 0], [0, e^(iθ/2)]]. ` +
            `Applied to |0⟩, the result is (e^(−iθ/2), 0) — only the first ` +
            `component changes, picking up a phase. Applied to |1⟩, the result ` +
            `is (0, e^(iθ/2)). Use Euler's formula: e^(iφ) = cos(φ) + i·sin(φ).`,
          simple_angle:
            `Let's use Rz with simple angles. For Rz(π), we need e^(−iπ/2) and ` +
            `e^(iπ/2). Since e^(iπ/2) = cos(π/2) + i·sin(π/2) = 0 + i = i, ` +
            `we get Rz(π)|0⟩ = (−i, 0) and Rz(π)|1⟩ = (0, i). ` +
            `For Rz(π/2): e^(iπ/4) = cos(π/4) + i·sin(π/4) = 0.71 + 0.71i.`,
        };

        return {
          teachingText: teachingMap[variation] || teachingMap['basic'],
          workedExample: {
            problem: `Apply Rz(${w.a.label}) to ${wState}. What is the ${wComp} component?`,
            steps: [
              `Rz(${w.a.label})${wState}: ${wComp} component = e^(${wSign}i${w.a.halfLabel})`,
              `= cos(${w.a.halfLabel}) ${wSign} i·sin(${w.a.halfLabel})`,
              `= ${fmt(w.a.cosH)} ${wSign} ${fmt(w.a.sinH)}i`,
              `= ${fmtComplex(wre, wim)}`,
            ],
            insight: `Rz adds a phase to each component but never changes measurement probabilities — it's a pure phase gate.`,
          },
          tryIt: {
            question: `Apply Rz(${p.a.label}) to ${pState}. What is the ${pComp} component?\nRz(θ) = [[e^(−iθ/2), 0], [0, e^(iθ/2)]]`,
            answer: [pre, pim],
            answerType: 'complex',
            answerDisplay: fmtComplex(pre, pim),
            steps: [
              `${pComp} component = e^(${pSign}i${p.a.halfLabel})`,
              `= cos(${p.a.halfLabel}) ${pSign} i·sin(${p.a.halfLabel})`,
              `= ${fmtComplex(pre, pim)}`,
            ],
            whyItMatters:
              `Rz is the most common rotation gate in real quantum computers. ` +
              `Many hardware platforms implement it as a "virtual" gate — just ` +
              `by adjusting the phase of subsequent microwave pulses, making it ` +
              `essentially free in terms of circuit depth.`,
          },
        };
      }

      case 'superposition': {
        const wa = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
        const wre = r2v(0.71 * wa.cosH);
        const wim = r2v(-0.71 * wa.sinH);

        let pa;
        do { pa = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)]; } while (pa.label === wa.label);
        const pre = r2v(0.71 * pa.cosH);
        const pim = r2v(-0.71 * pa.sinH);

        return {
          teachingText:
            `Rz works on any state, not just basis states. For a superposition ` +
            `(α, β), Rz(θ) gives (α·e^(−iθ/2), β·e^(iθ/2)). Each component ` +
            `gets its own phase factor. The first component's phase rotates one ` +
            `way (−θ/2) and the second rotates the other way (+θ/2). ` +
            `The probabilities |α|² and |β|² stay exactly the same.`,
          workedExample: {
            problem: `Apply Rz(${wa.label}) to (0.71, 0.71). What is the first component?`,
            steps: [
              `First component = 0.71 · e^(−i${wa.halfLabel})`,
              `e^(−i${wa.halfLabel}) = cos(${wa.halfLabel}) − i·sin(${wa.halfLabel}) = ${fmt(wa.cosH)} − ${fmt(wa.sinH)}i`,
              `0.71 × (${fmt(wa.cosH)} − ${fmt(wa.sinH)}i) = ${fmtComplex(wre, wim)}`,
            ],
            insight: `The relative phase between components changes, but each component's magnitude stays the same.`,
          },
          tryIt: {
            question: `Apply Rz(${pa.label}) to (0.71, 0.71). What is the first component?\nRz(θ) = [[e^(−iθ/2), 0], [0, e^(iθ/2)]]`,
            answer: [pre, pim],
            answerType: 'complex',
            answerDisplay: fmtComplex(pre, pim),
            steps: [
              `First component = 0.71 · e^(−i${pa.halfLabel})`,
              `= 0.71 × (${fmt(pa.cosH)} − ${fmt(pa.sinH)}i)`,
              `= ${fmtComplex(pre, pim)}`,
            ],
            whyItMatters:
              `Rz on a superposition changes the relative phase between |0⟩ and |1⟩. ` +
              `This is how quantum algorithms encode information — not in probabilities, ` +
              `but in the phase relationships between amplitudes.`,
          },
        };
      }

      case 'verify_probability': {
        const triples = [[3,4,5],[4,3,5],[6,8,10],[8,6,10]];
        const [wta, wtb, wtm] = triples[randInt(0, triples.length - 1)];
        const wa = r2v(wta / wtm);
        const wb = r2v(wtb / wtm);
        const wProb = r2v(wa * wa);
        const wAngle = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];

        let pta, ptb, ptm;
        do {
          [pta, ptb, ptm] = triples[randInt(0, triples.length - 1)];
        } while (pta === wta && ptb === wtb);
        const pa = r2v(pta / ptm);
        const pb = r2v(ptb / ptm);
        const pProb = r2v(pa * pa);
        const pAngle = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];

        return {
          teachingText:
            `A key property of Rz: it never changes measurement probabilities. ` +
            `Since Rz only multiplies each amplitude by a phase e^(iφ), and ` +
            `|e^(iφ)|² = 1, the squared magnitudes stay the same. ` +
            `P(|0⟩) = |α|² before and after Rz. This is why Rz is called a ` +
            `"phase gate" — it only affects phases, not probabilities.`,
          workedExample: {
            problem: `Apply Rz(${wAngle.label}) to (${wa}, ${wb}). What is P(|0⟩)?`,
            steps: [
              `Rz only multiplies each component by a phase factor.`,
              `|e^(iφ)|² = 1, so probabilities don't change.`,
              `P(|0⟩) = |${wa}|² = ${wProb}`,
            ],
            insight: `Rz is "invisible" to measurement — it cannot change what you observe, only how the state interferes later.`,
          },
          tryIt: {
            question: `Apply Rz(${pAngle.label}) to (${pa}, ${pb}). What is P(|0⟩) after applying Rz?`,
            answer: pProb,
            answerType: 'numeric',
            answerDisplay: `${pProb}`,
            steps: [
              `Rz only changes phases, not magnitudes.`,
              `P(|0⟩) = |α|² = ${pa}² = ${pProb}`,
            ],
            whyItMatters:
              `Understanding which gates change probabilities and which only change ` +
              `phases is essential. Rz changes phases (invisible to measurement alone), ` +
              `while Rx and Ry change actual probability distributions.`,
          },
        };
      }

      default: return null;
    }
  },
},

rx_apply: {
  generate(difficulty, variation) {
    const ANGLE_DATA = [
      { label: 'π/6', halfLabel: 'π/12', cosH: 0.97, sinH: 0.26 },
      { label: 'π/4', halfLabel: 'π/8',  cosH: 0.92, sinH: 0.38 },
      { label: 'π/3', halfLabel: 'π/6',  cosH: 0.87, sinH: 0.5  },
      { label: 'π/2', halfLabel: 'π/4',  cosH: 0.71, sinH: 0.71 },
      { label: 'π',   halfLabel: 'π/2',  cosH: 0,    sinH: 1    },
    ];
    const r2v = (n) => Math.round(n * 100) / 100;

    function makeNums(v) {
      if (v === 'half_pi') return ANGLE_DATA[3];
      return ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
    }

    switch (variation) {

      case 'basic':
      case 'probability_after': {
        const wa = makeNums(variation);
        const wp0 = r2v(wa.cosH * wa.cosH);
        const wp1 = r2v(wa.sinH * wa.sinH);

        let pa;
        do { pa = makeNums(variation); } while (pa.label === wa.label);
        const pp0 = r2v(pa.cosH * pa.cosH);
        const pp1 = r2v(pa.sinH * pa.sinH);

        const teachingMap = {
          basic:
            `The Rx gate rotates around the x-axis of the Bloch sphere. ` +
            `Rx(θ) = [[cos(θ/2), −i·sin(θ/2)], [−i·sin(θ/2), cos(θ/2)]]. ` +
            `Applied to |0⟩: first component = cos(θ/2), second = −i·sin(θ/2). ` +
            `The output is complex (note the −i), but the probabilities are real: ` +
            `P(|0⟩) = cos²(θ/2) and P(|1⟩) = sin²(θ/2).`,
          probability_after:
            `When Rx(θ) is applied to |0⟩, the resulting state has amplitudes ` +
            `(cos(θ/2), −i·sin(θ/2)). To find measurement probabilities, take ` +
            `the squared magnitude of each component. Since |−i| = 1, we get ` +
            `P(|0⟩) = cos²(θ/2) and P(|1⟩) = |−i·sin(θ/2)|² = sin²(θ/2). ` +
            `The factor of −i doesn't affect the probability.`,
        };

        return {
          teachingText: teachingMap[variation] || teachingMap['basic'],
          workedExample: {
            problem: `Apply Rx(${wa.label}) to |0⟩. What are [P(|0⟩), P(|1⟩)]?`,
            steps: [
              `Rx(${wa.label})|0⟩ = (cos(${wa.halfLabel}), −i·sin(${wa.halfLabel}))`,
              `P(|0⟩) = cos²(${wa.halfLabel}) = ${fmt(wa.cosH)}² = ${fmt(wp0)}`,
              `P(|1⟩) = sin²(${wa.halfLabel}) = ${fmt(wa.sinH)}² = ${fmt(wp1)}`,
            ],
            insight: `Rx changes probabilities — unlike Rz which only changes phases. A rotation of π (180°) completely flips the qubit.`,
          },
          tryIt: {
            question: `Apply Rx(${pa.label}) to |0⟩. What are [P(|0⟩), P(|1⟩)]?\nRx(θ) = [[cos(θ/2), −i·sin(θ/2)], [−i·sin(θ/2), cos(θ/2)]]`,
            answer: [pp0, pp1],
            answerType: 'vector',
            answerDisplay: `(${fmt(pp0)}, ${fmt(pp1)})`,
            steps: [
              `Rx(${pa.label})|0⟩ = (cos(${pa.halfLabel}), −i·sin(${pa.halfLabel}))`,
              `P(|0⟩) = cos²(${pa.halfLabel}) = ${fmt(pa.cosH)}² = ${fmt(pp0)}`,
              `P(|1⟩) = sin²(${pa.halfLabel}) = ${fmt(pa.sinH)}² = ${fmt(pp1)}`,
            ],
            whyItMatters:
              `Rx allows you to rotate a qubit to any desired probability split ` +
              `between |0⟩ and |1⟩. On real hardware, Rx is often implemented ` +
              `as a microwave pulse of calibrated duration — more rotation means ` +
              `a longer pulse.`,
          },
        };
      }

      case 'half_pi': {
        const wa = ANGLE_DATA[3]; // π/2
        const wp0 = r2v(0.71 * 0.71);
        const wp1 = r2v(0.71 * 0.71);

        let pa;
        do { pa = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)]; } while (pa.label === 'π/2');
        const pp0 = r2v(pa.cosH * pa.cosH);
        const pp1 = r2v(pa.sinH * pa.sinH);

        return {
          teachingText:
            `Rx(π/2) is special — it creates an equal superposition, similar to ` +
            `the Hadamard gate. Rx(π/2)|0⟩ = (cos(π/4), −i·sin(π/4)) = (0.71, −0.71i). ` +
            `The probabilities are P(|0⟩) = P(|1⟩) = 0.50 — a perfect 50/50 split. ` +
            `The difference from Hadamard is the −i factor on the |1⟩ component.`,
          workedExample: {
            problem: `Apply Rx(π/2) to |0⟩. What are [P(|0⟩), P(|1⟩)]?`,
            steps: [
              `Rx(π/2)|0⟩ = (cos(π/4), −i·sin(π/4)) = (0.71, −0.71i)`,
              `P(|0⟩) = 0.71² = ${wp0}`,
              `P(|1⟩) = |−0.71i|² = 0.71² = ${wp1}`,
            ],
            insight: `Rx(π/2) creates an equal superposition, just like H — but with a different phase on the |1⟩ component.`,
          },
          tryIt: {
            question: `Apply Rx(${pa.label}) to |0⟩. What are [P(|0⟩), P(|1⟩)]?\nRx(θ) = [[cos(θ/2), −i·sin(θ/2)], [−i·sin(θ/2), cos(θ/2)]]`,
            answer: [pp0, pp1],
            answerType: 'vector',
            answerDisplay: `(${fmt(pp0)}, ${fmt(pp1)})`,
            steps: [
              `Rx(${pa.label})|0⟩ = (cos(${pa.halfLabel}), −i·sin(${pa.halfLabel}))`,
              `P(|0⟩) = ${fmt(pa.cosH)}² = ${fmt(pp0)}`,
              `P(|1⟩) = ${fmt(pa.sinH)}² = ${fmt(pp1)}`,
            ],
            whyItMatters:
              `Different rotation angles give different probability splits. ` +
              `Rx(π/2) gives 50/50, Rx(π) gives 0/100 (a full bit flip), ` +
              `and smaller angles give gentle tilts away from the starting state.`,
          },
        };
      }

      case 'superposition_input': {
        const wa = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
        let pa;
        do { pa = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)]; } while (pa.label === wa.label);

        return {
          teachingText:
            `When Rx acts on an equal superposition (0.71, 0.71), something ` +
            `interesting happens. Each output component has the form ` +
            `0.71·(cos(θ/2) − i·sin(θ/2)) = 0.71·e^(−iθ/2). The magnitude ` +
            `is |0.71·e^(−iθ/2)| = 0.71, so P(|0⟩) = P(|1⟩) = 0.50 regardless ` +
            `of the angle! Equal superpositions are preserved by Rx.`,
          workedExample: {
            problem: `Apply Rx(${wa.label}) to (0.71, 0.71). What are [P(|0⟩), P(|1⟩)]?`,
            steps: [
              `Each component = 0.71·e^(−i${wa.halfLabel})`,
              `|0.71·e^(−i${wa.halfLabel})|² = 0.71² = 0.50`,
              `Result: P(|0⟩) = 0.50, P(|1⟩) = 0.50`,
            ],
            insight: `An equal superposition input stays 50/50 — Rx only changes the phases, not the balance.`,
          },
          tryIt: {
            question: `Apply Rx(${pa.label}) to (0.71, 0.71). What are [P(|0⟩), P(|1⟩)]?\nRx(θ) = [[cos(θ/2), −i·sin(θ/2)], [−i·sin(θ/2), cos(θ/2)]]`,
            answer: [0.5, 0.5],
            answerType: 'vector',
            answerDisplay: '(0.5, 0.5)',
            steps: [
              `Both components = 0.71·e^(−i${pa.halfLabel})`,
              `|0.71·e^(−i${pa.halfLabel})|² = 0.50 for both`,
              `Result: (0.5, 0.5)`,
            ],
            whyItMatters:
              `This symmetry — equal superpositions staying equal — is related to the ` +
              `fact that |+⟩ sits on the x-axis of the Bloch sphere, and Rx rotates ` +
              `around the x-axis. Rotating around the axis you're on doesn't move you!`,
          },
        };
      }

      default: return null;
    }
  },
},

ry_apply: {
  generate(difficulty, variation) {
    const ANGLE_DATA = [
      { label: 'π/6', halfLabel: 'π/12', cosH: 0.97, sinH: 0.26 },
      { label: 'π/4', halfLabel: 'π/8',  cosH: 0.92, sinH: 0.38 },
      { label: 'π/3', halfLabel: 'π/6',  cosH: 0.87, sinH: 0.5  },
      { label: 'π/2', halfLabel: 'π/4',  cosH: 0.71, sinH: 0.71 },
      { label: 'π',   halfLabel: 'π/2',  cosH: 0,    sinH: 1    },
    ];
    const r2v = (n) => Math.round(n * 100) / 100;

    switch (variation) {

      case 'basic':
      case 'compare_rx_ry': {
        const wa = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
        const wr1 = r2v(wa.cosH);
        const wr2 = r2v(wa.sinH);

        let pa;
        do { pa = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)]; } while (pa.label === wa.label);
        const pr1 = r2v(pa.cosH);
        const pr2 = r2v(pa.sinH);

        const teachingMap = {
          basic:
            `The Ry gate rotates around the y-axis of the Bloch sphere. ` +
            `Ry(θ) = [[cos(θ/2), −sin(θ/2)], [sin(θ/2), cos(θ/2)]]. ` +
            `Unlike Rx and Rz, Ry uses only real numbers — no imaginary parts! ` +
            `Applied to |0⟩: (cos(θ/2), sin(θ/2)). This makes Ry the simplest ` +
            `rotation gate to work with.`,
          compare_rx_ry:
            `Rx and Ry both change measurement probabilities the same way: ` +
            `P(|0⟩) = cos²(θ/2), P(|1⟩) = sin²(θ/2). The difference? Ry produces ` +
            `real amplitudes while Rx produces complex ones. Ry(θ)|0⟩ = (cos(θ/2), sin(θ/2)) ` +
            `vs Rx(θ)|0⟩ = (cos(θ/2), −i·sin(θ/2)). On the Bloch sphere, they ` +
            `rotate around different axes but both tilt the state away from the north pole.`,
        };

        return {
          teachingText: teachingMap[variation] || teachingMap['basic'],
          workedExample: {
            problem: `Apply Ry(${wa.label}) to |0⟩. What is the output state vector?`,
            steps: [
              `Ry(${wa.label})|0⟩ = (cos(${wa.halfLabel}), sin(${wa.halfLabel}))`,
              `= (${fmt(wr1)}, ${fmt(wr2)})`,
            ],
            insight: variation === 'compare_rx_ry'
              ? `Ry gives the same probabilities as Rx but with real amplitudes — no imaginary parts to track.`
              : `Ry always produces real outputs from real inputs — it's the "real-valued" rotation gate.`,
          },
          tryIt: {
            question: `Apply Ry(${pa.label}) to |0⟩. What is the output state vector?\nRy(θ) = [[cos(θ/2), −sin(θ/2)], [sin(θ/2), cos(θ/2)]]`,
            answer: [pr1, pr2],
            answerType: 'vector',
            answerDisplay: `(${fmt(pr1)}, ${fmt(pr2)})`,
            steps: [
              `Ry(${pa.label})|0⟩ = (cos(${pa.halfLabel}), sin(${pa.halfLabel}))`,
              `= (${fmt(pr1)}, ${fmt(pr2)})`,
            ],
            whyItMatters:
              `Ry is used in quantum machine learning and variational algorithms ` +
              `because it can prepare any real-valued state from |0⟩. Combined with ` +
              `Rz for phases, it can reach any point on the Bloch sphere.`,
          },
        };
      }

      case 'half_pi': {
        let pa;
        do { pa = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)]; } while (pa.label === 'π/2');
        const pr1 = r2v(pa.cosH);
        const pr2 = r2v(pa.sinH);

        return {
          teachingText:
            `Ry(π/2) creates an equal superposition with real amplitudes: ` +
            `Ry(π/2)|0⟩ = (cos(π/4), sin(π/4)) = (0.71, 0.71). ` +
            `This is the same state as H|0⟩ = |+⟩! The Hadamard gate can be ` +
            `decomposed as a combination of Ry and Rz rotations. ` +
            `Ry(π/2) alone gets you halfway — it creates the right probabilities ` +
            `but with a slightly different phase than Hadamard.`,
          workedExample: {
            problem: `Apply Ry(π/2) to |0⟩. What is the output state vector?`,
            steps: [
              `Ry(π/2)|0⟩ = (cos(π/4), sin(π/4))`,
              `= (0.71, 0.71)`,
            ],
            insight: `Ry(π/2)|0⟩ = (0.71, 0.71), which equals |+⟩ — the same as H|0⟩!`,
          },
          tryIt: {
            question: `Apply Ry(${pa.label}) to |0⟩. What is the output state vector?\nRy(θ) = [[cos(θ/2), −sin(θ/2)], [sin(θ/2), cos(θ/2)]]`,
            answer: [pr1, pr2],
            answerType: 'vector',
            answerDisplay: `(${fmt(pr1)}, ${fmt(pr2)})`,
            steps: [
              `Ry(${pa.label})|0⟩ = (cos(${pa.halfLabel}), sin(${pa.halfLabel}))`,
              `= (${fmt(pr1)}, ${fmt(pr2)})`,
            ],
            whyItMatters:
              `Different Ry angles let you prepare states with any desired probability ` +
              `split. Ry(π/3)|0⟩ gives 75%/25%, Ry(π/2) gives 50/50, and Ry(π) ` +
              `gives a full flip to |1⟩.`,
          },
        };
      }

      case 'create_target_state': {
        const wa = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
        const wUse1 = Math.random() > 0.5;
        const wr1 = wUse1 ? r2v(-wa.sinH) : r2v(wa.cosH);
        const wr2 = wUse1 ? r2v(wa.cosH) : r2v(wa.sinH);
        const wState = wUse1 ? '|1⟩' : '|0⟩';

        let pa, pUse1;
        do {
          pa = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
          pUse1 = Math.random() > 0.5;
        } while (pa.label === wa.label && pUse1 === wUse1);
        const pr1 = pUse1 ? r2v(-pa.sinH) : r2v(pa.cosH);
        const pr2 = pUse1 ? r2v(pa.cosH) : r2v(pa.sinH);
        const pState = pUse1 ? '|1⟩' : '|0⟩';

        return {
          teachingText:
            `Ry works on both basis states. On |0⟩: Ry(θ)|0⟩ = (cos(θ/2), sin(θ/2)). ` +
            `On |1⟩: Ry(θ)|1⟩ = (−sin(θ/2), cos(θ/2)). Notice the minus sign on ` +
            `the first component for |1⟩ — this is the second column of the Ry matrix. ` +
            `By choosing the right angle and starting state, you can create any ` +
            `real-valued state on the Bloch sphere.`,
          workedExample: {
            problem: `Apply Ry(${wa.label}) to ${wState}. What is the output state vector?`,
            steps: wUse1 ? [
              `Ry(${wa.label})|1⟩: first = −sin(${wa.halfLabel}) = ${fmt(wr1)}`,
              `Second = cos(${wa.halfLabel}) = ${fmt(wr2)}`,
              `Result: (${fmt(wr1)}, ${fmt(wr2)})`,
            ] : [
              `Ry(${wa.label})|0⟩: first = cos(${wa.halfLabel}) = ${fmt(wr1)}`,
              `Second = sin(${wa.halfLabel}) = ${fmt(wr2)}`,
              `Result: (${fmt(wr1)}, ${fmt(wr2)})`,
            ],
            insight: `Ry on |1⟩ produces a state with a negative first component — the state points partially toward −|0⟩.`,
          },
          tryIt: {
            question: `Apply Ry(${pa.label}) to ${pState}. What is the output state vector?\nRy(θ) = [[cos(θ/2), −sin(θ/2)], [sin(θ/2), cos(θ/2)]]`,
            answer: [pr1, pr2],
            answerType: 'vector',
            answerDisplay: `(${fmt(pr1)}, ${fmt(pr2)})`,
            steps: pUse1 ? [
              `Ry(${pa.label})|1⟩: first = −sin(${pa.halfLabel}) = ${fmt(pr1)}`,
              `Second = cos(${pa.halfLabel}) = ${fmt(pr2)}`,
            ] : [
              `Ry(${pa.label})|0⟩: first = cos(${pa.halfLabel}) = ${fmt(pr1)}`,
              `Second = sin(${pa.halfLabel}) = ${fmt(pr2)}`,
            ],
            whyItMatters:
              `Being able to apply Ry to both |0⟩ and |1⟩ means you can undo ` +
              `previous rotations or chain multiple rotations together. ` +
              `This is the foundation of parameterized quantum circuits.`,
          },
        };
      }

      default: return null;
    }
  },
},

euler_decompose: {
  generate(difficulty, variation) {
    const ANGLE_DATA = [
      { label: 'π/6', halfLabel: 'π/12', cosH: 0.97, sinH: 0.26 },
      { label: 'π/4', halfLabel: 'π/8',  cosH: 0.92, sinH: 0.38 },
      { label: 'π/3', halfLabel: 'π/6',  cosH: 0.87, sinH: 0.5  },
      { label: 'π/2', halfLabel: 'π/4',  cosH: 0.71, sinH: 0.71 },
      { label: 'π',   halfLabel: 'π/2',  cosH: 0,    sinH: 1    },
    ];
    const r2v = (n) => Math.round(n * 100) / 100;

    switch (variation) {

      case 'basic': {
        const wBeta = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
        const wAlpha = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
        const wGamma = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
        const wp0 = r2v(wBeta.cosH * wBeta.cosH);
        const wp1 = r2v(wBeta.sinH * wBeta.sinH);

        let pBeta, pAlpha, pGamma;
        do {
          pBeta = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
          pAlpha = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
          pGamma = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
        } while (pBeta.label === wBeta.label && pAlpha.label === wAlpha.label && pGamma.label === wGamma.label);
        const pp0 = r2v(pBeta.cosH * pBeta.cosH);
        const pp1 = r2v(pBeta.sinH * pBeta.sinH);

        return {
          teachingText:
            `Any single-qubit gate can be decomposed as Rz(α)·Ry(β)·Rz(γ) ` +
            `(the Euler decomposition). When applied to |0⟩, something elegant ` +
            `happens: Rz(γ)|0⟩ only adds a global phase (which doesn't affect ` +
            `probabilities). Then Ry(β) creates the probability split. Finally, ` +
            `Rz(α) adds relative phase. So the probabilities depend only on β: ` +
            `P(|0⟩) = cos²(β/2), P(|1⟩) = sin²(β/2).`,
          workedExample: {
            problem: `Apply Rz(${wAlpha.label})·Ry(${wBeta.label})·Rz(${wGamma.label}) to |0⟩. What are [P(|0⟩), P(|1⟩)]?`,
            steps: [
              `Rz(${wGamma.label})|0⟩ = (e^(−i${wGamma.halfLabel}), 0) — just a phase`,
              `Ry(${wBeta.label}) splits: (cos(${wBeta.halfLabel}), sin(${wBeta.halfLabel})) = (${fmt(wBeta.cosH)}, ${fmt(wBeta.sinH)})`,
              `Rz(${wAlpha.label}) adds phase but doesn't change magnitudes`,
              `P(|0⟩) = cos²(${wBeta.halfLabel}) = ${fmt(wp0)}, P(|1⟩) = sin²(${wBeta.halfLabel}) = ${fmt(wp1)}`,
            ],
            insight: `Only the middle Ry angle determines probabilities — the two Rz gates only control phases.`,
          },
          tryIt: {
            question: `Apply Rz(${pAlpha.label})·Ry(${pBeta.label})·Rz(${pGamma.label}) to |0⟩. What are [P(|0⟩), P(|1⟩)]?`,
            answer: [pp0, pp1],
            answerType: 'vector',
            answerDisplay: `(${fmt(pp0)}, ${fmt(pp1)})`,
            steps: [
              `Rz(${pGamma.label})|0⟩ adds a global phase — doesn't affect probabilities`,
              `Ry(${pBeta.label}) determines the split: cos(${pBeta.halfLabel}) = ${fmt(pBeta.cosH)}, sin(${pBeta.halfLabel}) = ${fmt(pBeta.sinH)}`,
              `P(|0⟩) = ${fmt(pBeta.cosH)}² = ${fmt(pp0)}, P(|1⟩) = ${fmt(pBeta.sinH)}² = ${fmt(pp1)}`,
            ],
            whyItMatters:
              `The Euler decomposition means any single-qubit gate needs at most ` +
              `three rotation parameters. Quantum compilers use this to break down ` +
              `arbitrary gates into hardware-native rotations.`,
          },
        };
      }

      case 'hadamard': {
        const pa = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
        const pBeta = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
        const pp0 = r2v(pBeta.cosH * pBeta.cosH);
        const pp1 = r2v(pBeta.sinH * pBeta.sinH);

        return {
          teachingText:
            `The Hadamard gate can be written as H ≈ Rz(π)·Ry(π/2) (up to a ` +
            `global phase). This means: first rotate π/2 around y (creating a ` +
            `50/50 superposition), then rotate π around z (adjusting the phase). ` +
            `Since only Ry affects probabilities, and Ry(π/2) gives cos²(π/4) = 0.50, ` +
            `Hadamard produces equal probabilities — exactly what we expect.`,
          workedExample: {
            problem: `H ≈ Rz(π)·Ry(π/2). Apply to |0⟩. What are [P(|0⟩), P(|1⟩)]?`,
            steps: [
              `Ry(π/2)|0⟩ = (cos(π/4), sin(π/4)) = (0.71, 0.71)`,
              `Rz(π) only changes phases, not magnitudes`,
              `P(|0⟩) = 0.71² = 0.50, P(|1⟩) = 0.71² = 0.50`,
            ],
            insight: `H = Rz(π)·Ry(π/2) shows that the Hadamard is just two rotations in sequence!`,
          },
          tryIt: {
            question: `Apply Rz(${pa.label})·Ry(${pBeta.label}) to |0⟩. What are [P(|0⟩), P(|1⟩)]?`,
            answer: [pp0, pp1],
            answerType: 'vector',
            answerDisplay: `(${fmt(pp0)}, ${fmt(pp1)})`,
            steps: [
              `Ry(${pBeta.label})|0⟩ = (cos(${pBeta.halfLabel}), sin(${pBeta.halfLabel})) = (${fmt(pBeta.cosH)}, ${fmt(pBeta.sinH)})`,
              `Rz(${pa.label}) adds phases — probabilities unchanged`,
              `P(|0⟩) = ${fmt(pBeta.cosH)}² = ${fmt(pp0)}, P(|1⟩) = ${fmt(pBeta.sinH)}² = ${fmt(pp1)}`,
            ],
            whyItMatters:
              `Decomposing familiar gates into rotations builds intuition. Once you ` +
              `see H as Rz·Ry, you understand why it creates superposition (Ry) ` +
              `with the right phase (Rz). This extends to decomposing any gate.`,
          },
        };
      }

      case 'compose_two': {
        const wAlpha = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
        const wBeta = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
        const wp0 = r2v(wBeta.cosH * wBeta.cosH);
        const wp1 = r2v(wBeta.sinH * wBeta.sinH);

        let pAlpha, pBeta;
        do {
          pAlpha = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
          pBeta = ANGLE_DATA[randInt(0, ANGLE_DATA.length - 1)];
        } while (pBeta.label === wBeta.label && pAlpha.label === wAlpha.label);
        const pp0 = r2v(pBeta.cosH * pBeta.cosH);
        const pp1 = r2v(pBeta.sinH * pBeta.sinH);

        return {
          teachingText:
            `When composing Rz·Ry and applying to |0⟩, the key insight is that ` +
            `Ry determines the probability split and Rz only adds phase. ` +
            `Step 1: Ry(β)|0⟩ = (cos(β/2), sin(β/2)). Step 2: Rz(α) multiplies ` +
            `the first component by e^(−iα/2) and the second by e^(iα/2). ` +
            `Since |e^(iφ)| = 1, the probabilities remain cos²(β/2) and sin²(β/2).`,
          workedExample: {
            problem: `Apply Rz(${wAlpha.label})·Ry(${wBeta.label}) to |0⟩. What are [P(|0⟩), P(|1⟩)]?`,
            steps: [
              `Ry(${wBeta.label})|0⟩ = (cos(${wBeta.halfLabel}), sin(${wBeta.halfLabel})) = (${fmt(wBeta.cosH)}, ${fmt(wBeta.sinH)})`,
              `Rz(${wAlpha.label}) adds phase — doesn't change magnitudes`,
              `P(|0⟩) = cos²(${wBeta.halfLabel}) = ${fmt(wp0)}, P(|1⟩) = sin²(${wBeta.halfLabel}) = ${fmt(wp1)}`,
            ],
            insight: `The Rz gate is "invisible" to probability measurements — only Ry changes the outcome distribution.`,
          },
          tryIt: {
            question: `Apply Rz(${pAlpha.label})·Ry(${pBeta.label}) to |0⟩. What are [P(|0⟩), P(|1⟩)]?`,
            answer: [pp0, pp1],
            answerType: 'vector',
            answerDisplay: `(${fmt(pp0)}, ${fmt(pp1)})`,
            steps: [
              `Ry(${pBeta.label})|0⟩ = (${fmt(pBeta.cosH)}, ${fmt(pBeta.sinH)})`,
              `Rz(${pAlpha.label}) only adds phase`,
              `P(|0⟩) = ${fmt(pBeta.cosH)}² = ${fmt(pp0)}, P(|1⟩) = ${fmt(pBeta.sinH)}² = ${fmt(pp1)}`,
            ],
            whyItMatters:
              `This "Rz is invisible to probabilities" principle is why quantum ` +
              `compilers can freely insert Rz gates for error correction or ` +
              `optimization without changing measurement outcomes.`,
          },
        };
      }

      default: return null;
    }
  },
},

// ── Chapter 13: Phase Gates ──────────────────────────────────────────────────

s_gate_apply: {
  generate(difficulty, variation) {
    const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(2);
    const fmtC = (re, im) => {
      if (im === 0) return `${fmt(re)}`;
      if (re === 0) {
        if (im === 1) return 'i';
        if (im === -1) return '−i';
        return im > 0 ? `${fmt(im)}i` : `−${fmt(Math.abs(im))}i`;
      }
      const sign = im > 0 ? '+' : '−';
      const mag = Math.abs(im);
      const imStr = mag === 1 ? 'i' : `${fmt(mag)}i`;
      return `${fmt(re)} ${sign} ${imStr}`;
    };

    switch (variation) {

      case 'basic': {
        const wA = randInt(2, 5);
        let pA; do { pA = randInt(2, 5); } while (pA === wA);

        return {
          teachingText:
            `The S gate (also called the phase gate or √Z gate) adds a 90° phase ` +
            `rotation to the |1⟩ component. Its matrix is S = [[1,0],[0,i]]. ` +
            `The |0⟩ amplitude is unchanged, and the |1⟩ amplitude gets multiplied ` +
            `by i. For example, if |1⟩ has coefficient 3, after S it becomes 3i. ` +
            `Remember: i is the imaginary unit where i² = −1.`,
          workedExample: {
            problem: `Apply S to the |1⟩ coefficient ${wA}`,
            steps: [
              `S multiplies the |1⟩ amplitude by i`,
              `i × ${wA} = ${wA}i`,
              `As a complex number: (0, ${wA})`,
            ],
            insight: `S only affects the |1⟩ component — the |0⟩ part stays the same. This is why it's called a "phase" gate.`,
          },
          tryIt: {
            question: `Apply the S gate to the |1⟩ coefficient ${pA}.\nS multiplies the |1⟩ amplitude by i.\nAnswer as a complex number (re, im):`,
            answer: [0, pA],
            answerType: 'complex',
            answerDisplay: fmtC(0, pA),
            steps: [
              `S multiplies |1⟩ by i`,
              `i × ${pA} = ${pA}i = (0, ${pA})`,
            ],
            whyItMatters:
              `The S gate is a π/2 phase rotation — halfway between no phase change (I) and ` +
              `a full phase flip (Z). It's essential in quantum error correction and appears ` +
              `in the Clifford group, which is key to fault-tolerant quantum computing.`,
          },
        };
      }

      case 'superposition': {
        const h = 0.71;
        return {
          teachingText:
            `When S acts on a superposition state like (1/√2)(|0⟩ + |1⟩), it only ` +
            `modifies the |1⟩ coefficient. The state (1/√2)|0⟩ + (1/√2)|1⟩ has ` +
            `|1⟩ coefficient ≈ 0.71. After S: 0.71 → i × 0.71 = 0.71i. ` +
            `The result is (1/√2)|0⟩ + (i/√2)|1⟩. Measurement probabilities don't ` +
            `change (|0.71i|² = 0.71² ≈ 0.50), but the phase information differs.`,
          workedExample: {
            problem: `Apply S to the |1⟩ coefficient of (1/√2)(|0⟩ + |1⟩). The |1⟩ coefficient is ${h}.`,
            steps: [
              `S multiplies |1⟩ by i`,
              `i × ${h} = ${h}i`,
              `As a complex number: (0, ${h})`,
            ],
            insight: `The measurement probabilities are unchanged: |0.71i|² = 0.50 = |0.71|². Phase gates change "how" a qubit is in superposition, not "how much."`,
          },
          tryIt: {
            question: `Apply S to the |1⟩ component of (1/√2)(|0⟩ + |1⟩).\nThe |1⟩ coefficient is ${h}. What is S × ${h}?\nS multiplies the |1⟩ amplitude by i.\nAnswer as a complex number (re, im):`,
            answer: [0, 0.71],
            answerType: 'complex',
            answerDisplay: fmtC(0, 0.71),
            steps: [
              `S multiplies |1⟩ by i`,
              `i × ${h} = ${h}i = (0, ${h})`,
            ],
            whyItMatters:
              `Phase differences between |0⟩ and |1⟩ are invisible to a single measurement ` +
              `but become crucial when gates like H convert phase into amplitude differences. ` +
              `This is the heart of quantum interference.`,
          },
        };
      }

      case 'double_s': {
        const wA = randInt(2, 5);
        let pA; do { pA = randInt(2, 5); } while (pA === wA);

        return {
          teachingText:
            `What happens when we apply S twice? S multiplies |1⟩ by i, so S² multiplies ` +
            `by i × i = i² = −1. But multiplying by −1 is exactly what the Z gate does! ` +
            `So S² = Z. This is why S is sometimes called √Z — it's the "square root" of Z. ` +
            `The phase hierarchy: T → S → Z → I, where each is the square of the next.`,
          workedExample: {
            problem: `Apply S twice to the |1⟩ coefficient ${wA}`,
            steps: [
              `First S: i × ${wA} = ${wA}i`,
              `Second S: i × ${wA}i = ${wA}i² = ${wA}(−1) = ${-wA}`,
              `Result: (${-wA}, 0)`,
              `This is the same as applying Z!`,
            ],
            insight: `S² = Z. The phase gates form a hierarchy: T² = S, S² = Z, Z² = I.`,
          },
          tryIt: {
            question: `Apply S twice to the |1⟩ coefficient ${pA}.\nWhat is S·S × ${pA}? (complex answer)`,
            answer: [-pA, 0],
            answerType: 'complex',
            answerDisplay: fmtC(-pA, 0),
            steps: [
              `First S: i × ${pA} = ${pA}i`,
              `Second S: i × ${pA}i = ${pA}i² = ${-pA}`,
              `S² = Z, which negates the |1⟩ component`,
            ],
            whyItMatters:
              `The relationship S² = Z connects the phase gate hierarchy. In circuit ` +
              `optimization, knowing these identities lets you simplify sequences of ` +
              `gates into fewer operations.`,
          },
        };
      }

      case 'probability_unchanged': {
        const wA = randInt(2, 5);
        let pA; do { pA = randInt(2, 5); } while (pA === wA);
        const wProb = wA * wA;
        const pProb = pA * pA;

        return {
          teachingText:
            `A key property of all phase gates: they never change measurement probabilities. ` +
            `The probability of measuring |1⟩ is |β|². If β is real (say β = ${wA}), ` +
            `then after S: β → iβ = ${wA}i, and |${wA}i|² = ${wA}² = ${wProb}. ` +
            `The magnitude is unchanged because |i| = 1. This is why phase ` +
            `gates are "invisible" to a single Z-basis measurement.`,
          workedExample: {
            problem: `If the |1⟩ coefficient is ${wA}, what is |S × ${wA}|²?`,
            steps: [
              `S × ${wA} = i × ${wA} = ${wA}i`,
              `|${wA}i|² = ${wA}² = ${wProb}`,
              `Same as the original |${wA}|² = ${wProb}`,
            ],
            insight: `Phase gates have |eigenvalue| = 1, so they preserve probabilities. You need interference (via H) to reveal phase differences.`,
          },
          tryIt: {
            question: `If the |1⟩ coefficient is ${pA}, what is |S × ${pA}|²?\n(The measurement probability after applying S)`,
            answer: [pProb, 0],
            answerType: 'complex',
            answerDisplay: fmtC(pProb, 0),
            steps: [
              `S × ${pA} = ${pA}i`,
              `|${pA}i|² = ${pA}² = ${pProb}`,
            ],
            whyItMatters:
              `This is why quantum algorithms use H gates after phase gates — H converts ` +
              `phase differences into amplitude differences that can be measured. Without ` +
              `interference, phase information is hidden.`,
          },
        };
      }

      default: return null;
    }
  },
},

s_dagger_apply: {
  generate(difficulty, variation) {
    const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(2);
    const fmtC = (re, im) => {
      if (im === 0) return `${fmt(re)}`;
      if (re === 0) {
        if (im === 1) return 'i';
        if (im === -1) return '−i';
        return im > 0 ? `${fmt(im)}i` : `−${fmt(Math.abs(im))}i`;
      }
      const sign = im > 0 ? '+' : '−';
      const mag = Math.abs(im);
      const imStr = mag === 1 ? 'i' : `${fmt(mag)}i`;
      return `${fmt(re)} ${sign} ${imStr}`;
    };

    switch (variation) {

      case 'basic': {
        const wA = randInt(2, 5);
        let pA; do { pA = randInt(2, 5); } while (pA === wA);

        return {
          teachingText:
            `S† (S-dagger) is the inverse of the S gate. Where S multiplies |1⟩ by i, ` +
            `S† multiplies by −i. Its matrix is S† = [[1,0],[0,−i]]. ` +
            `Applying S then S† (or vice versa) gives the identity: S†S = SS† = I. ` +
            `The † symbol means "conjugate transpose" — for diagonal phase gates, ` +
            `it simply negates the phase angle.`,
          workedExample: {
            problem: `Apply S† to the |1⟩ coefficient ${wA}`,
            steps: [
              `S† multiplies the |1⟩ amplitude by −i`,
              `(−i) × ${wA} = −${wA}i`,
              `As a complex number: (0, −${wA})`,
            ],
            insight: `S† rotates phase by −90° (clockwise), while S rotates by +90° (counterclockwise). They undo each other.`,
          },
          tryIt: {
            question: `Apply the S† gate to the |1⟩ coefficient ${pA}.\nS† multiplies the |1⟩ amplitude by −i.\nAnswer as a complex number (re, im):`,
            answer: [0, -pA],
            answerType: 'complex',
            answerDisplay: fmtC(0, -pA),
            steps: [
              `S† multiplies |1⟩ by −i`,
              `(−i) × ${pA} = −${pA}i = (0, −${pA})`,
            ],
            whyItMatters:
              `Inverse gates are essential for "uncomputing" — cleaning up temporary ` +
              `quantum operations. Many quantum algorithms apply a transformation, ` +
              `extract useful information, then reverse the transformation with the inverse.`,
          },
        };
      }

      case 'undo_s': {
        const wA = randInt(2, 5);
        let pA; do { pA = randInt(2, 5); } while (pA === wA);

        return {
          teachingText:
            `The defining property of S† is that it undoes S. If you apply S to get ` +
            `i × β, then S† gives (−i)(iβ) = −i²β = −(−1)β = β. ` +
            `We're back to the original! This is written as S†S = I. ` +
            `Every quantum gate has an inverse (quantum operations are reversible), ` +
            `and for S, that inverse is S†.`,
          workedExample: {
            problem: `Apply S then S† to the |1⟩ coefficient ${wA}`,
            steps: [
              `First S: i × ${wA} = ${wA}i`,
              `Then S†: (−i) × ${wA}i = −${wA}i² = −${wA}(−1) = ${wA}`,
              `We get back ${wA} — the identity!`,
            ],
            insight: `S†S = I. Every quantum gate is reversible, and † gives us the inverse.`,
          },
          tryIt: {
            question: `Apply S then S† to the |1⟩ coefficient ${pA}.\nWhat is the result? (complex answer)`,
            answer: [pA, 0],
            answerType: 'complex',
            answerDisplay: fmtC(pA, 0),
            steps: [
              `S: i × ${pA} = ${pA}i`,
              `S†: (−i) × ${pA}i = −${pA}i² = ${pA}`,
              `S†S = I, result is ${pA}`,
            ],
            whyItMatters:
              `Reversibility is a fundamental requirement of quantum mechanics. Unlike ` +
              `classical operations (like AND, OR), quantum gates must always have an ` +
              `inverse. This constraint actually makes quantum computing more powerful ` +
              `because it preserves information.`,
          },
        };
      }

      case 'superposition': {
        const h = 0.71;
        return {
          teachingText:
            `Applying S† to a superposition works the same way — only the |1⟩ ` +
            `coefficient changes. For (1/√2)(|0⟩ + |1⟩), the |1⟩ coefficient ` +
            `is ≈ 0.71. After S†: 0.71 → (−i)(0.71) = −0.71i. The state ` +
            `becomes (1/√2)|0⟩ − (i/√2)|1⟩. Again, probabilities don't change: ` +
            `|−0.71i|² = 0.50.`,
          workedExample: {
            problem: `Apply S† to the |1⟩ coefficient of (1/√2)(|0⟩ + |1⟩). The |1⟩ coefficient is ${h}.`,
            steps: [
              `S† multiplies |1⟩ by −i`,
              `(−i) × ${h} = −${h}i`,
              `As a complex number: (0, −${h})`,
            ],
            insight: `S† gives the opposite phase rotation from S. On the Bloch sphere, S rotates +90° around Z and S† rotates −90°.`,
          },
          tryIt: {
            question: `Apply S† to the |1⟩ component of (1/√2)(|0⟩ + |1⟩).\nThe |1⟩ coefficient is ${h}. What is S† × ${h}?\nS† multiplies the |1⟩ amplitude by −i.\nAnswer as a complex number (re, im):`,
            answer: [0, -0.71],
            answerType: 'complex',
            answerDisplay: fmtC(0, -0.71),
            steps: [
              `S† multiplies |1⟩ by −i`,
              `(−i) × ${h} = −${h}i = (0, −${h})`,
            ],
            whyItMatters:
              `The difference between S|+⟩ and S†|+⟩ is invisible to Z-measurement ` +
              `but visible after applying H. This phase distinction is exploited in ` +
              `algorithms like quantum phase estimation.`,
          },
        };
      }

      default: return null;
    }
  },
},

t_gate_apply: {
  generate(difficulty, variation) {
    const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(2);
    const fmtC = (re, im) => {
      if (im === 0) return `${fmt(re)}`;
      if (re === 0) {
        if (im === 1) return 'i';
        if (im === -1) return '−i';
        return im > 0 ? `${fmt(im)}i` : `−${fmt(Math.abs(im))}i`;
      }
      const sign = im > 0 ? '+' : '−';
      const mag = Math.abs(im);
      const imStr = mag === 1 ? 'i' : `${fmt(mag)}i`;
      return `${fmt(re)} ${sign} ${imStr}`;
    };
    const tRe = 0.71;
    const tIm = 0.71;

    switch (variation) {

      case 'basic': {
        const wA = randInt(2, 4);
        let pA; do { pA = randInt(2, 4); } while (pA === wA);
        const wResRe = r2(tRe * wA);
        const wResIm = r2(tIm * wA);
        const pResRe = r2(tRe * pA);
        const pResIm = r2(tIm * pA);

        return {
          teachingText:
            `The T gate applies a π/4 (45°) phase rotation to |1⟩. Its matrix is ` +
            `T = [[1,0],[0,e^(iπ/4)]]. Using Euler's formula, e^(iπ/4) = cos(π/4) + ` +
            `i·sin(π/4) = 1/√2 + i/√2 ≈ 0.71 + 0.71i. So T multiplies the |1⟩ ` +
            `coefficient by (0.71 + 0.71i). Unlike S (which gives a pure imaginary ` +
            `result), T produces a complex number with both real and imaginary parts.`,
          workedExample: {
            problem: `Apply T to the |1⟩ coefficient ${wA}`,
            steps: [
              `T multiplies |1⟩ by e^(iπ/4) ≈ 0.71 + 0.71i`,
              `(0.71 + 0.71i) × ${wA}`,
              `Real part: 0.71 × ${wA} = ${fmt(wResRe)}`,
              `Imaginary part: 0.71 × ${wA} = ${fmt(wResIm)}`,
              `Result: (${fmt(wResRe)}, ${fmt(wResIm)})`,
            ],
            insight: `T is a "finer" rotation than S — it's a π/4 step where S is π/2. The T gate is special because it's outside the Clifford group, making it essential for universal quantum computation.`,
          },
          tryIt: {
            question: `Apply the T gate to the |1⟩ coefficient ${pA}.\nT multiplies the |1⟩ amplitude by e^(iπ/4) ≈ (0.71 + 0.71i).\nAnswer as a complex number (re, im):`,
            answer: [pResRe, pResIm],
            answerType: 'complex',
            answerDisplay: fmtC(pResRe, pResIm),
            steps: [
              `T multiplies |1⟩ by 0.71 + 0.71i`,
              `Real: 0.71 × ${pA} = ${fmt(pResRe)}`,
              `Imag: 0.71 × ${pA} = ${fmt(pResIm)}`,
            ],
            whyItMatters:
              `The T gate is the key to universality. The Clifford gates (H, S, CNOT) alone ` +
              `can be efficiently simulated classically. Adding the T gate makes the gate set ` +
              `universal — capable of approximating any quantum operation.`,
          },
        };
      }

      case 'compute_phase': {
        return {
          teachingText:
            `To understand T, we need Euler's formula: e^(iθ) = cos θ + i·sin θ. ` +
            `For the T gate, θ = π/4 (45°). So e^(iπ/4) = cos(π/4) + i·sin(π/4). ` +
            `Both cos(π/4) and sin(π/4) equal 1/√2 ≈ 0.71. ` +
            `Therefore e^(iπ/4) ≈ 0.71 + 0.71i. This complex number has magnitude 1 ` +
            `(it lies on the unit circle), confirming T preserves probabilities.`,
          workedExample: {
            problem: `Compute e^(iπ/2) using Euler's formula`,
            steps: [
              `e^(iπ/2) = cos(π/2) + i·sin(π/2)`,
              `cos(π/2) = 0`,
              `sin(π/2) = 1`,
              `e^(iπ/2) = 0 + i = i`,
              `This is the S gate's phase factor!`,
            ],
            insight: `Euler's formula maps angles to complex numbers on the unit circle. Each phase gate corresponds to a specific angle: T = π/4, S = π/2, Z = π.`,
          },
          tryIt: {
            question: `The T gate multiplies |1⟩ by e^(iπ/4).\nUsing Euler's formula: e^(iθ) = cos θ + i sin θ.\nWhat is e^(iπ/4)? (complex answer, use 0.71 ≈ 1/√2)`,
            answer: [0.71, 0.71],
            answerType: 'complex',
            answerDisplay: fmtC(0.71, 0.71),
            steps: [
              `e^(iπ/4) = cos(π/4) + i·sin(π/4)`,
              `= 0.71 + 0.71i`,
            ],
            whyItMatters:
              `Euler's formula is the bridge between angles and complex numbers. Every phase ` +
              `gate is just a rotation on the unit circle in the complex plane. Understanding ` +
              `this makes the entire phase gate family intuitive.`,
          },
        };
      }

      case 'double_t': {
        const wA = randInt(2, 5);
        let pA; do { pA = randInt(2, 5); } while (pA === wA);

        return {
          teachingText:
            `What happens when T is applied twice? T multiplies by e^(iπ/4), so T² ` +
            `multiplies by e^(iπ/4) × e^(iπ/4) = e^(iπ/2) = i. But multiplying by i ` +
            `is exactly what S does! So T² = S. This is why T is called the √S gate ` +
            `or π/8 gate (since π/4 is half of π/2). The phase hierarchy: T → S → Z.`,
          workedExample: {
            problem: `Apply T twice to the |1⟩ coefficient ${wA}`,
            steps: [
              `T² = S (since e^(iπ/4)² = e^(iπ/2) = i)`,
              `So T² multiplies |1⟩ by i`,
              `i × ${wA} = ${wA}i = (0, ${wA})`,
            ],
            insight: `T² = S, S² = Z, Z² = I. Each gate in the hierarchy is the square root of the next.`,
          },
          tryIt: {
            question: `Apply T twice to the |1⟩ coefficient ${pA}.\nT² = S, which multiplies by i.\nWhat is the result? (complex answer)`,
            answer: [0, pA],
            answerType: 'complex',
            answerDisplay: fmtC(0, pA),
            steps: [
              `T² = S`,
              `S multiplies |1⟩ by i`,
              `i × ${pA} = ${pA}i = (0, ${pA})`,
            ],
            whyItMatters:
              `This hierarchy means we can build S from two T gates, and Z from four T gates. ` +
              `In fault-tolerant quantum computing, T gates are the most expensive resource, ` +
              `so minimizing T-count is a major optimization goal.`,
          },
        };
      }

      case 'quad_t': {
        const wA = randInt(2, 5);
        let pA; do { pA = randInt(2, 5); } while (pA === wA);

        return {
          teachingText:
            `Continuing the chain: T⁴ = (T²)² = S² = Z. So four T gates equal one Z gate. ` +
            `T⁴ multiplies |1⟩ by e^(iπ/4)⁴ = e^(iπ) = −1, which is exactly Z's effect. ` +
            `Going further: T⁸ = Z² = I (identity). So the T gate generates a cyclic ` +
            `group of order 8: {I, T, T², T³, T⁴, T⁵, T⁶, T⁷} = {I, T, S, T³, Z, T⁵, S†, T†}.`,
          workedExample: {
            problem: `Apply T four times to the |1⟩ coefficient ${wA}`,
            steps: [
              `T⁴ = Z (since e^(iπ/4)⁴ = e^(iπ) = −1)`,
              `Z multiplies |1⟩ by −1`,
              `(−1) × ${wA} = ${-wA}`,
              `Result: (${-wA}, 0)`,
            ],
            insight: `T⁴ = Z. The T gate steps around the unit circle in 45° increments; four steps = 180° = Z.`,
          },
          tryIt: {
            question: `Apply T four times to the |1⟩ coefficient ${pA}.\nT⁴ = Z, which multiplies by −1.\nWhat is the result? (complex answer)`,
            answer: [-pA, 0],
            answerType: 'complex',
            answerDisplay: fmtC(-pA, 0),
            steps: [
              `T⁴ = Z`,
              `Z multiplies |1⟩ by −1`,
              `(−1) × ${pA} = ${-pA}`,
            ],
            whyItMatters:
              `Understanding T⁴ = Z helps you simplify circuits. If you see four T gates ` +
              `in a row, you can replace them with a single Z — saving three gate operations. ` +
              `This kind of algebraic simplification is critical for practical quantum computing.`,
          },
        };
      }

      case 'superposition': {
        const h = 0.71;
        const resRe = r2(tRe * h);  // 0.50
        const resIm = r2(tIm * h);  // 0.50

        return {
          teachingText:
            `When T acts on a superposition, only the |1⟩ coefficient picks up the ` +
            `phase factor. For (1/√2)(|0⟩ + |1⟩), the |1⟩ coefficient is ≈ 0.71. ` +
            `After T: 0.71 × (0.71 + 0.71i) = (0.50 + 0.50i). The result is a ` +
            `complex amplitude. Its magnitude |0.50 + 0.50i|² = 0.25 + 0.25 = 0.50, ` +
            `so the probability of measuring |1⟩ is still 50%.`,
          workedExample: {
            problem: `Apply T to the |1⟩ coefficient of (1/√2)(|0⟩ + |1⟩). The |1⟩ coefficient is ${h}.`,
            steps: [
              `T multiplies |1⟩ by 0.71 + 0.71i`,
              `(0.71 + 0.71i) × ${h}`,
              `Real: 0.71 × ${h} = ${fmt(resRe)}`,
              `Imag: 0.71 × ${h} = ${fmt(resIm)}`,
              `Result: (${fmt(resRe)}, ${fmt(resIm)})`,
            ],
            insight: `|0.50 + 0.50i|² = 0.25 + 0.25 = 0.50. Probability unchanged — phase gates never affect measurement outcomes alone.`,
          },
          tryIt: {
            question: `Apply T to the |1⟩ component of (1/√2)(|0⟩ + |1⟩).\nThe |1⟩ coefficient is ${h}. What is T × ${h}?\nT multiplies by e^(iπ/4) ≈ (0.71 + 0.71i).\nAnswer as a complex number (re, im):`,
            answer: [resRe, resIm],
            answerType: 'complex',
            answerDisplay: fmtC(resRe, resIm),
            steps: [
              `(0.71 + 0.71i) × ${h}`,
              `Real: 0.71 × ${h} = ${fmt(resRe)}`,
              `Imag: 0.71 × ${h} = ${fmt(resIm)}`,
            ],
            whyItMatters:
              `The T gate on a superposition creates a subtle phase that's invisible to ` +
              `direct measurement. Quantum algorithms exploit these phases through interference ` +
              `— applying H after T converts the phase difference into a measurable amplitude difference.`,
          },
        };
      }

      default: return null;
    }
  },
},

t_dagger_apply: {
  generate(difficulty, variation) {
    const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(2);
    const fmtC = (re, im) => {
      if (im === 0) return `${fmt(re)}`;
      if (re === 0) {
        if (im === 1) return 'i';
        if (im === -1) return '−i';
        return im > 0 ? `${fmt(im)}i` : `−${fmt(Math.abs(im))}i`;
      }
      const sign = im > 0 ? '+' : '−';
      const mag = Math.abs(im);
      const imStr = mag === 1 ? 'i' : `${fmt(mag)}i`;
      return `${fmt(re)} ${sign} ${imStr}`;
    };
    const tdRe = 0.71;
    const tdIm = -0.71;

    switch (variation) {

      case 'basic': {
        const wA = randInt(2, 4);
        let pA; do { pA = randInt(2, 4); } while (pA === wA);
        const wResRe = r2(tdRe * wA);
        const wResIm = r2(tdIm * wA);
        const pResRe = r2(tdRe * pA);
        const pResIm = r2(tdIm * pA);

        return {
          teachingText:
            `T† (T-dagger) is the inverse of T. It applies a −π/4 (−45°) phase rotation. ` +
            `Its matrix is T† = [[1,0],[0,e^(−iπ/4)]]. Using Euler's formula, ` +
            `e^(−iπ/4) = cos(−π/4) + i·sin(−π/4) = 0.71 − 0.71i. ` +
            `So T† multiplies the |1⟩ coefficient by (0.71 − 0.71i). ` +
            `Applying T then T† returns to the original state: T†T = I.`,
          workedExample: {
            problem: `Apply T† to the |1⟩ coefficient ${wA}`,
            steps: [
              `T† multiplies |1⟩ by e^(−iπ/4) ≈ 0.71 − 0.71i`,
              `(0.71 − 0.71i) × ${wA}`,
              `Real part: 0.71 × ${wA} = ${fmt(wResRe)}`,
              `Imaginary part: (−0.71) × ${wA} = ${fmt(wResIm)}`,
              `Result: (${fmt(wResRe)}, ${fmt(wResIm)})`,
            ],
            insight: `T† rotates −45° while T rotates +45°. They're mirror images on the unit circle.`,
          },
          tryIt: {
            question: `Apply the T† gate to the |1⟩ coefficient ${pA}.\nT† multiplies the |1⟩ amplitude by e^(−iπ/4) ≈ (0.71 − 0.71i).\nAnswer as a complex number (re, im):`,
            answer: [pResRe, pResIm],
            answerType: 'complex',
            answerDisplay: fmtC(pResRe, pResIm),
            steps: [
              `T† multiplies |1⟩ by 0.71 − 0.71i`,
              `Real: 0.71 × ${pA} = ${fmt(pResRe)}`,
              `Imag: (−0.71) × ${pA} = ${fmt(pResIm)}`,
            ],
            whyItMatters:
              `T† is used frequently in circuit decompositions. When compiling a quantum ` +
              `algorithm into basic gates, T and T† often appear in pairs to create precise ` +
              `phase rotations needed for algorithms like Shor's factoring.`,
          },
        };
      }

      case 'undo_t': {
        const wA = randInt(2, 5);
        let pA; do { pA = randInt(2, 5); } while (pA === wA);

        return {
          teachingText:
            `T†T = I: applying T then T† returns to the original state. ` +
            `T multiplies by e^(iπ/4), T† multiplies by e^(−iπ/4). ` +
            `Combined: e^(iπ/4) × e^(−iπ/4) = e^0 = 1. This is the fundamental ` +
            `property of inverse gates. In quantum circuits, T† "undoes" whatever ` +
            `T did, and vice versa.`,
          workedExample: {
            problem: `Apply T then T† to the |1⟩ coefficient ${wA}`,
            steps: [
              `T: e^(iπ/4) × ${wA} ≈ (0.71 + 0.71i) × ${wA} = (${fmt(r2(0.71 * wA))}, ${fmt(r2(0.71 * wA))})`,
              `T†: e^(−iπ/4) × (${fmt(r2(0.71 * wA))} + ${fmt(r2(0.71 * wA))}i)`,
              `e^(iπ/4) × e^(−iπ/4) = 1, so the result is ${wA}`,
            ],
            insight: `T†T = I. For any quantum gate U, U†U = I. This is the mathematical expression of quantum reversibility.`,
          },
          tryIt: {
            question: `Apply T then T† to the |1⟩ coefficient ${pA}.\nWhat is the result? (complex answer)`,
            answer: [pA, 0],
            answerType: 'complex',
            answerDisplay: fmtC(pA, 0),
            steps: [
              `T multiplies by e^(iπ/4), T† multiplies by e^(−iπ/4)`,
              `e^(iπ/4) × e^(−iπ/4) = 1`,
              `Result: ${pA}`,
            ],
            whyItMatters:
              `Quantum error correction relies on being able to undo operations. If a T ` +
              `gate is applied in error, T† can correct it. This inverse relationship ` +
              `is foundational to all quantum error-correcting codes.`,
          },
        };
      }

      case 'superposition': {
        const h = 0.71;
        const resRe = r2(tdRe * h);  // 0.50
        const resIm = r2(tdIm * h);  // -0.50

        return {
          teachingText:
            `T† on a superposition state works like T but with the opposite phase ` +
            `rotation. For |1⟩ coefficient 0.71: T† × 0.71 = (0.71 − 0.71i)(0.71) ` +
            `= (0.50 − 0.50i). The magnitude is |0.50 − 0.50i|² = 0.25 + 0.25 = 0.50. ` +
            `Again, probabilities are preserved. The only difference from T is the ` +
            `sign of the imaginary part.`,
          workedExample: {
            problem: `Apply T† to the |1⟩ coefficient of (1/√2)(|0⟩ + |1⟩). The |1⟩ coefficient is ${h}.`,
            steps: [
              `T† multiplies |1⟩ by 0.71 − 0.71i`,
              `(0.71 − 0.71i) × ${h}`,
              `Real: 0.71 × ${h} = ${fmt(resRe)}`,
              `Imag: (−0.71) × ${h} = ${fmt(resIm)}`,
              `Result: (${fmt(resRe)}, ${fmt(resIm)})`,
            ],
            insight: `Compare T|+⟩ = 0.50 + 0.50i with T†|+⟩ = 0.50 − 0.50i. They're complex conjugates — same magnitude, opposite phase.`,
          },
          tryIt: {
            question: `Apply T† to the |1⟩ component of (1/√2)(|0⟩ + |1⟩).\nThe |1⟩ coefficient is ${h}. What is T† × ${h}?\nT† multiplies by e^(−iπ/4) ≈ (0.71 − 0.71i).\nAnswer as a complex number (re, im):`,
            answer: [resRe, resIm],
            answerType: 'complex',
            answerDisplay: fmtC(resRe, resIm),
            steps: [
              `(0.71 − 0.71i) × ${h}`,
              `Real: 0.71 × ${h} = ${fmt(resRe)}`,
              `Imag: (−0.71) × ${h} = ${fmt(resIm)}`,
            ],
            whyItMatters:
              `T and T† appear as conjugate pairs in many quantum algorithms. In quantum ` +
              `phase estimation, the pattern T...T† creates controlled phase rotations ` +
              `that extract eigenvalue information — the basis of Shor's algorithm.`,
          },
        };
      }

      default: return null;
    }
  },
},

phase_family: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'basic': {
        // identify_gate: P(angle) → name
        const wGates = [
          { angle: 'π', result: 'Z', phase: 'e^(iπ) = −1' },
          { angle: 'π/2', result: 'S', phase: 'e^(iπ/2) = i' },
          { angle: 'π/4', result: 'T', phase: 'e^(iπ/4) ≈ 0.71 + 0.71i' },
        ];
        const wPick = wGates[randInt(0, wGates.length - 1)];
        let pPick;
        do { pPick = wGates[randInt(0, wGates.length - 1)]; } while (pPick.result === wPick.result);

        return {
          teachingText:
            `All single-qubit phase gates belong to one family: P(θ) = [[1,0],[0,e^(iθ)]]. ` +
            `The angle θ determines the gate. The named gates are special cases: ` +
            `T = P(π/4), S = P(π/2), Z = P(π). At θ = 0 we get the identity I. ` +
            `Each gate multiplies the |1⟩ coefficient by e^(iθ): T by e^(iπ/4), ` +
            `S by e^(iπ/2) = i, and Z by e^(iπ) = −1.`,
          workedExample: {
            problem: `What named gate is P(${wPick.angle})?`,
            steps: [
              `P(${wPick.angle}) = [[1,0],[0,${wPick.phase}]]`,
              `The phase factor ${wPick.phase} corresponds to the ${wPick.result} gate`,
              `Answer: ${wPick.result}`,
            ],
            insight: `The phase family P(θ) unifies T, S, and Z. They differ only in the angle of rotation around the Z-axis of the Bloch sphere.`,
          },
          tryIt: {
            question: `The phase gate P(θ) = [[1,0],[0,e^(iθ)]].\nWhat named gate is P(${pPick.angle})?`,
            answer: pPick.result,
            answerType: 'gate_name',
            answerDisplay: pPick.result,
            steps: [
              `P(${pPick.angle}) applies phase ${pPick.phase}`,
              `This is the ${pPick.result} gate`,
            ],
            whyItMatters:
              `Understanding the phase family reveals that T, S, and Z aren't separate ` +
              `gates — they're points on a continuous dial. Quantum algorithms can use ` +
              `arbitrary P(θ) rotations, decomposed into T and T† for hardware implementation.`,
          },
        };
      }

      case 'sequence_to_gate': {
        const wSeqs = [
          { seq: 'T·T', result: 'S', explain: 'T² = S: e^(iπ/4) × e^(iπ/4) = e^(iπ/2) = i' },
          { seq: 'S·S', result: 'Z', explain: 'S² = Z: i × i = −1' },
          { seq: 'T·T·T·T', result: 'Z', explain: 'T⁴ = Z: e^(iπ/4)⁴ = e^(iπ) = −1' },
        ];
        const pSeqs = [
          { seq: 'T·T·S', result: 'Z', explain: 'T²·S = S·S = Z' },
          { seq: 'S·T·T', result: 'Z', explain: 'S·T² = S·S = Z' },
          { seq: 'S·S', result: 'Z', explain: 'S² = Z: i × i = −1' },
          { seq: 'T·T', result: 'S', explain: 'T² = S: e^(iπ/4)² = e^(iπ/2) = i' },
          { seq: 'T·T·T·T', result: 'Z', explain: 'T⁴ = Z: e^(iπ/4)⁴ = e^(iπ) = −1' },
        ];
        const wPick = wSeqs[randInt(0, wSeqs.length - 1)];
        let pPick;
        do { pPick = pSeqs[randInt(0, pSeqs.length - 1)]; } while (pPick.seq === wPick.seq);

        return {
          teachingText:
            `Phase gates compose by adding angles: P(θ₁)·P(θ₂) = P(θ₁ + θ₂). ` +
            `This gives us the key identities: T·T = P(π/4 + π/4) = P(π/2) = S. ` +
            `S·S = P(π/2 + π/2) = P(π) = Z. T⁴ = P(4·π/4) = P(π) = Z. ` +
            `And T·T·S = S·S = Z. These relationships let us simplify gate sequences.`,
          workedExample: {
            problem: `What single gate is equivalent to ${wPick.seq}?`,
            steps: [
              wPick.explain,
              `Answer: ${wPick.result}`,
            ],
            insight: `Phase gates compose by adding angles. This makes simplification straightforward: just add up the π/4 steps.`,
          },
          tryIt: {
            question: `What single gate is equivalent to ${pPick.seq}?`,
            answer: pPick.result,
            answerType: 'gate_name',
            answerDisplay: pPick.result,
            steps: [
              pPick.explain,
            ],
            whyItMatters:
              `Gate sequence simplification is a core step in quantum circuit optimization. ` +
              `Reducing T·T to S saves a gate, and reducing T·T·T·T to Z saves three. ` +
              `In fault-tolerant quantum computing, each T gate requires expensive "magic ` +
              `state distillation," so every saved T gate matters.`,
          },
        };
      }

      case 'find_angle': {
        const wGates = [
          { name: 'T', angle: 'π/4', factor: 'e^(iπ/4) ≈ 0.71 + 0.71i' },
          { name: 'S', angle: 'π/2', factor: 'e^(iπ/2) = i' },
          { name: 'Z', angle: 'π', factor: 'e^(iπ) = −1' },
        ];
        const wPick = wGates[randInt(0, wGates.length - 1)];
        let pPick;
        do { pPick = wGates[randInt(0, wGates.length - 1)]; } while (pPick.name === wPick.name);

        return {
          teachingText:
            `Each named phase gate corresponds to a specific angle in P(θ): ` +
            `T = P(π/4), meaning T applies a 45° phase. S = P(π/2), a 90° phase. ` +
            `Z = P(π), a 180° phase (sign flip). The angle determines the phase ` +
            `factor e^(iθ): at π/4 it's (0.71 + 0.71i), at π/2 it's i, at π it's −1.`,
          workedExample: {
            problem: `Which named gate is P(${wPick.angle})?`,
            steps: [
              `P(${wPick.angle}) applies phase factor ${wPick.factor}`,
              `This is the ${wPick.name} gate`,
            ],
            insight: `The phase angles form a geometric progression: π/4, π/2, π. Each doubling of the angle squares the phase factor.`,
          },
          tryIt: {
            question: `Which named gate equals P(${pPick.angle})?\nP(θ) = [[1,0],[0,e^(iθ)]]`,
            answer: pPick.name,
            answerType: 'gate_name',
            answerDisplay: pPick.name,
            steps: [
              `P(${pPick.angle}) applies phase ${pPick.factor}`,
              `This is the ${pPick.name} gate`,
            ],
            whyItMatters:
              `Knowing the angle of each gate helps you reason about compositions. ` +
              `If you need a total phase of π, you can achieve it with one Z, two S gates, ` +
              `or four T gates — whichever is most convenient for your circuit architecture.`,
          },
        };
      }

      default: return null;
    }
  },
},

// ── Chapter 14: Multi-Qubit Gates ────────────────────────────────────────────

cz_apply: {
  generate(difficulty, variation) {
    const labels = ['|00⟩','|01⟩','|10⟩','|11⟩'];
    const diag = [1, 1, 1, -1];

    switch (variation) {

      case 'basic_00': {
        // CZ on |00⟩ or |01⟩ — no change
        const wi = randInt(0, 1);
        const pi = 1 - wi;
        const wOut = [0,0,0,0]; wOut[wi] = 1;
        const pOut = [0,0,0,0]; pOut[pi] = 1;
        return {
          teachingText:
            `The Controlled-Z (CZ) gate applies a phase flip of −1 to ONLY the |11⟩ component ` +
            `of a two-qubit state. Its matrix is diag(1, 1, 1, −1).\n\n` +
            `CZ|00⟩ = |00⟩\nCZ|01⟩ = |01⟩\nCZ|10⟩ = |10⟩\nCZ|11⟩ = −|11⟩\n\n` +
            `Unlike CNOT, CZ doesn't flip any qubit — it only adds a minus sign when both qubits are |1⟩.`,
          workedExample: {
            problem: `Apply CZ to ${labels[wi]}. Result as a 4-vector`,
            steps: [
              `CZ = diag(1,1,1,−1). Only the |11⟩ coefficient is negated.`,
              `${labels[wi]} has no |11⟩ component.`,
              `Result: ${fmtVec4(wOut)}`,
            ],
            insight: `CZ only affects |11⟩. Any state without a |11⟩ component passes through unchanged.`,
          },
          tryIt: {
            question: `Apply CZ to ${labels[pi]}. Result as a 4-vector:`,
            answer: pOut,
            answerType: 'vector4',
            answerDisplay: fmtVec4(pOut),
            steps: [
              `CZ = diag(1,1,1,−1).`,
              `${labels[pi]} has no |11⟩ component, so nothing changes.`,
              `Answer: ${fmtVec4(pOut)}`,
            ],
            whyItMatters:
              `CZ is one of the most important entangling gates in practice. Many superconducting ` +
              `quantum processors use CZ as their native two-qubit gate because it is symmetric ` +
              `— it doesn't matter which qubit is "control" and which is "target."`,
          },
        };
      }

      case 'basic_11': {
        // CZ|11⟩ = −|11⟩ vs CZ|10⟩ = |10⟩
        const wPick11 = randInt(0, 1) === 0;
        const wIdx = wPick11 ? 3 : 2;
        const pIdx = wPick11 ? 2 : 3;
        const wOut = [0,0,0,0]; wOut[wIdx] = diag[wIdx];
        const pOut = [0,0,0,0]; pOut[pIdx] = diag[pIdx];
        return {
          teachingText:
            `CZ negates the amplitude of |11⟩ and leaves all other basis states unchanged.\n\n` +
            `CZ|10⟩ = |10⟩  (only one qubit is |1⟩ — no sign change)\n` +
            `CZ|11⟩ = −|11⟩  (both qubits are |1⟩ — sign flips!)\n\n` +
            `Think of CZ as: "if both qubits are |1⟩, multiply the amplitude by −1."`,
          workedExample: {
            problem: `Apply CZ to ${labels[wIdx]}. Result as a 4-vector`,
            steps: [
              `CZ = diag(1,1,1,−1).`,
              wIdx === 3
                ? `|11⟩: both qubits |1⟩, so multiply by −1 → −|11⟩`
                : `|10⟩: only first qubit is |1⟩, no sign change`,
              `Result: ${fmtVec4(wOut)}`,
            ],
            insight: `CZ is a phase gate — it never changes which basis states are present, only their signs.`,
          },
          tryIt: {
            question: `Apply CZ to ${labels[pIdx]}. Result as a 4-vector:`,
            answer: pOut,
            answerType: 'vector4',
            answerDisplay: fmtVec4(pOut),
            steps: [
              `CZ = diag(1,1,1,−1).`,
              pIdx === 3
                ? `|11⟩: both qubits |1⟩ → multiply by −1`
                : `|10⟩: not both |1⟩ → no change`,
              `Answer: ${fmtVec4(pOut)}`,
            ],
            whyItMatters:
              `Unlike CNOT which flips bits, CZ only changes phases. This makes it a "diagonal" ` +
              `gate in the computational basis — it never creates superpositions, only adjusts signs. ` +
              `This property makes CZ especially useful in phase-kickback techniques used in ` +
              `quantum algorithms like Grover's search.`,
          },
        };
      }

      case 'superposition': {
        const supCases = [
          { inVec: [0.71, 0, 0, 0.71], outVec: [0.71, 0, 0, -0.71],
            inLabel: '0.71|00⟩ + 0.71|11⟩', outLabel: '0.71|00⟩ − 0.71|11⟩' },
          { inVec: [0.5, 0.5, 0.5, 0.5], outVec: [0.5, 0.5, 0.5, -0.5],
            inLabel: '0.5(|00⟩+|01⟩+|10⟩+|11⟩)', outLabel: '0.5|00⟩+0.5|01⟩+0.5|10⟩−0.5|11⟩' },
        ];
        const wi = randInt(0, supCases.length - 1);
        const pi = 1 - wi;
        const w = supCases[wi], p = supCases[pi];
        return {
          teachingText:
            `CZ on superpositions: apply the diagonal to each component. Only the |11⟩ ` +
            `amplitude gets negated — all others stay the same.\n\n` +
            `If the state is a|00⟩ + b|01⟩ + c|10⟩ + d|11⟩, then:\n` +
            `CZ gives a|00⟩ + b|01⟩ + c|10⟩ − d|11⟩\n\n` +
            `Just flip the sign of the last component!`,
          workedExample: {
            problem: `Apply CZ to ${fmtVec4(w.inVec)}`,
            steps: [
              `Input: ${w.inLabel}`,
              `CZ negates only the |11⟩ coefficient`,
              `Result: ${fmtVec4(w.outVec)}`,
            ],
            insight: `CZ on a superposition is simple: negate the 4th component (the |11⟩ amplitude) and leave the rest alone.`,
          },
          tryIt: {
            question: `Apply CZ to ${fmtVec4(p.inVec)}. Result:`,
            answer: p.outVec,
            answerType: 'vector4',
            answerDisplay: fmtVec4(p.outVec),
            steps: [
              `Input: ${p.inLabel}`,
              `Negate only the |11⟩ coefficient`,
              `Answer: ${fmtVec4(p.outVec)}`,
            ],
            whyItMatters:
              `CZ acting on Bell states converts between them — for example, CZ turns |Φ+⟩ ` +
              `into a state with opposite phase on |11⟩. This phase manipulation is central to ` +
              `error correction codes and the Deutsch-Jozsa algorithm.`,
          },
        };
      }

      case 'symmetry': {
        // Show CZ is symmetric: it doesn't matter which qubit is "control"
        const wIdx = randInt(0, 3);
        let pIdx;
        do { pIdx = randInt(0, 3); } while (pIdx === wIdx);
        const wOut = [0,0,0,0]; wOut[wIdx] = diag[wIdx];
        const pOut = [0,0,0,0]; pOut[pIdx] = diag[pIdx];
        return {
          teachingText:
            `A remarkable property of CZ: it is completely symmetric between the two qubits. ` +
            `Unlike CNOT (which has a distinct control and target), CZ treats both qubits equally.\n\n` +
            `This means CZ_{AB} = CZ_{BA} — swapping which qubit is "first" or "second" ` +
            `doesn't change the gate. The matrix diag(1,1,1,−1) is the same regardless ` +
            `of qubit ordering.`,
          workedExample: {
            problem: `Apply CZ to ${labels[wIdx]}. Result as a 4-vector`,
            steps: [
              `CZ = diag(1,1,1,−1), symmetric in both qubits.`,
              `${labels[wIdx]} coefficient multiplied by ${diag[wIdx]}`,
              `Result: ${fmtVec4(wOut)}`,
            ],
            insight: `CZ is symmetric — neither qubit is special. This simplifies circuit design because you don't need to track which qubit is "control."`,
          },
          tryIt: {
            question: `Apply CZ to ${labels[pIdx]}. Result as a 4-vector:`,
            answer: pOut,
            answerType: 'vector4',
            answerDisplay: fmtVec4(pOut),
            steps: [
              `CZ = diag(1,1,1,−1)`,
              `${labels[pIdx]} coefficient × ${diag[pIdx]}`,
              `Answer: ${fmtVec4(pOut)}`,
            ],
            whyItMatters:
              `CZ's symmetry is why many quantum hardware platforms prefer it as their native ` +
              `two-qubit gate. When you don't need to distinguish control from target, circuit ` +
              `compilation becomes simpler and more flexible.`,
          },
        };
      }

      default: return null;
    }
  },
},

swap_apply: {
  generate(difficulty, variation) {
    const labels = ['|00⟩','|01⟩','|10⟩','|11⟩'];
    const swappedLabels = ['|00⟩','|10⟩','|01⟩','|11⟩'];

    switch (variation) {

      case 'basic_basis': {
        // SWAP|01⟩=|10⟩ and SWAP|10⟩=|01⟩
        const wPick01 = randInt(0, 1) === 0;
        const wIdx = wPick01 ? 1 : 2;
        const pIdx = wPick01 ? 2 : 1;
        const wOut = [0,0,0,0]; wOut[wIdx === 1 ? 2 : 1] = 1;
        const pOut = [0,0,0,0]; pOut[pIdx === 1 ? 2 : 1] = 1;
        return {
          teachingText:
            `The SWAP gate exchanges two qubits: the first becomes the second, and vice versa.\n\n` +
            `SWAP|00⟩ = |00⟩  (both same, no visible change)\n` +
            `SWAP|01⟩ = |10⟩  (qubits swapped!)\n` +
            `SWAP|10⟩ = |01⟩  (qubits swapped!)\n` +
            `SWAP|11⟩ = |11⟩  (both same, no visible change)\n\n` +
            `In vector form: SWAP maps (a, b, c, d) → (a, c, b, d) — it swaps the middle two components.`,
          workedExample: {
            problem: `Apply SWAP to ${labels[wIdx]}. Result as a 4-vector`,
            steps: [
              `SWAP exchanges the two qubits.`,
              `${labels[wIdx]} → ${swappedLabels[wIdx]}`,
              `Result: ${fmtVec4(wOut)}`,
            ],
            insight: `SWAP literally swaps the qubit labels. The vector rule is simple: swap positions 1 and 2 (0-indexed).`,
          },
          tryIt: {
            question: `Apply SWAP to ${labels[pIdx]}. Result as a 4-vector:`,
            answer: pOut,
            answerType: 'vector4',
            answerDisplay: fmtVec4(pOut),
            steps: [
              `SWAP exchanges qubits: ${labels[pIdx]} → ${swappedLabels[pIdx]}`,
              `Answer: ${fmtVec4(pOut)}`,
            ],
            whyItMatters:
              `SWAP gates are essential when qubits need to interact but aren't physically adjacent. ` +
              `On real quantum hardware, qubits can only interact with their neighbors, so SWAP ` +
              `routes information across the chip — like passing a note across a classroom.`,
          },
        };
      }

      case 'both_same': {
        // SWAP|00⟩=|00⟩ or SWAP|11⟩=|11⟩
        const wPick00 = randInt(0, 1) === 0;
        const wIdx = wPick00 ? 0 : 3;
        const pIdx = wPick00 ? 3 : 0;
        const wOut = [0,0,0,0]; wOut[wIdx] = 1;
        const pOut = [0,0,0,0]; pOut[pIdx] = 1;
        return {
          teachingText:
            `When both qubits are in the same state, SWAP has no visible effect:\n\n` +
            `SWAP|00⟩ = |00⟩ — swapping two |0⟩ qubits gives two |0⟩ qubits\n` +
            `SWAP|11⟩ = |11⟩ — swapping two |1⟩ qubits gives two |1⟩ qubits\n\n` +
            `The qubits ARE swapped, but since they're identical, the state looks the same.`,
          workedExample: {
            problem: `Apply SWAP to ${labels[wIdx]}. Result as a 4-vector`,
            steps: [
              `Both qubits are the same in ${labels[wIdx]}.`,
              `Swapping identical qubits: ${labels[wIdx]} → ${labels[wIdx]}`,
              `Result: ${fmtVec4(wOut)}`,
            ],
            insight: `SWAP on identical qubits is like swapping two identical objects — nothing changes.`,
          },
          tryIt: {
            question: `Apply SWAP to ${labels[pIdx]}. Result as a 4-vector:`,
            answer: pOut,
            answerType: 'vector4',
            answerDisplay: fmtVec4(pOut),
            steps: [
              `Both qubits identical in ${labels[pIdx]}`,
              `Swap changes nothing: ${labels[pIdx]} → ${labels[pIdx]}`,
              `Answer: ${fmtVec4(pOut)}`,
            ],
            whyItMatters:
              `Even though SWAP|00⟩ = |00⟩ and SWAP|11⟩ = |11⟩ look trivial, understanding ` +
              `which states are unchanged by a gate is critical for circuit analysis. ` +
              `These "fixed points" help you predict circuit behavior quickly.`,
          },
        };
      }

      case 'superposition': {
        const supCases = [
          { inVec: [0, 1, 0, 0], outVec: [0, 0, 1, 0],
            inLabel: '|01⟩', outLabel: '|10⟩' },
          { inVec: [0.5, 0.87, 0, 0], outVec: [0.5, 0, 0.87, 0],
            inLabel: '0.5|00⟩ + 0.87|01⟩', outLabel: '0.5|00⟩ + 0.87|10⟩' },
        ];
        const wi = randInt(0, supCases.length - 1);
        const pi = 1 - wi;
        const w = supCases[wi], p = supCases[pi];
        return {
          teachingText:
            `SWAP on a general state (a, b, c, d) gives (a, c, b, d) — the middle ` +
            `two components swap places.\n\n` +
            `Why? Because |01⟩ ↔ |10⟩ under SWAP, so the coefficients for those ` +
            `basis states trade positions. The |00⟩ and |11⟩ coefficients stay put.`,
          workedExample: {
            problem: `Apply SWAP to ${fmtVec4(w.inVec)}`,
            steps: [
              `SWAP rule: (a, b, c, d) → (a, c, b, d)`,
              `Input: ${w.inLabel}`,
              `Swap middle two: ${fmtVec4(w.outVec)}`,
            ],
            insight: `The SWAP rule in vector form is dead simple: swap positions 1 and 2 (the |01⟩ and |10⟩ amplitudes).`,
          },
          tryIt: {
            question: `Apply SWAP to ${fmtVec4(p.inVec)}. Result:`,
            answer: p.outVec,
            answerType: 'vector4',
            answerDisplay: fmtVec4(p.outVec),
            steps: [
              `SWAP: (a, b, c, d) → (a, c, b, d)`,
              `Answer: ${fmtVec4(p.outVec)}`,
            ],
            whyItMatters:
              `SWAP on superpositions shows that quantum gates are linear: they transform each ` +
              `basis component independently. This linearity is what makes quantum parallelism ` +
              `possible — a gate applied to a superposition processes all branches simultaneously.`,
          },
        };
      }

      case 'three_cnots': {
        // SWAP = CNOT₁₂·CNOT₂₁·CNOT₁₂
        const wPick = randInt(0, 1) === 0;
        const wInput = wPick ? '|01⟩' : '|10⟩';
        const pInput = wPick ? '|10⟩' : '|01⟩';
        const wOut = wPick ? [0, 0, 1, 0] : [0, 1, 0, 0];
        const pOut = wPick ? [0, 1, 0, 0] : [0, 0, 1, 0];
        const wSteps = wPick
          ? [`CNOT₁₂|01⟩ = |01⟩ (ctrl=0)`, `CNOT₂₁|01⟩ = |11⟩ (ctrl=1, flip 1st)`, `CNOT₁₂|11⟩ = |10⟩ (ctrl=1, flip 2nd)`]
          : [`CNOT₁₂|10⟩ = |11⟩ (ctrl=1)`, `CNOT₂₁|11⟩ = |01⟩ (ctrl=1, flip 1st)`, `CNOT₁₂|01⟩ = |01⟩ (ctrl=0)`];
        const pSteps = wPick
          ? [`CNOT₁₂|10⟩ = |11⟩ (ctrl=1)`, `CNOT₂₁|11⟩ = |01⟩ (ctrl=1, flip 1st)`, `CNOT₁₂|01⟩ = |01⟩ (ctrl=0)`]
          : [`CNOT₁₂|01⟩ = |01⟩ (ctrl=0)`, `CNOT₂₁|01⟩ = |11⟩ (ctrl=1, flip 1st)`, `CNOT₁₂|11⟩ = |10⟩ (ctrl=1, flip 2nd)`];
        return {
          teachingText:
            `SWAP can be built from three CNOT gates:\n\n` +
            `SWAP = CNOT₁₂ · CNOT₂₁ · CNOT₁₂\n\n` +
            `where CNOT₁₂ has qubit 1 as control and CNOT₂₁ has qubit 2 as control. ` +
            `This decomposition matters because many quantum hardware platforms can't ` +
            `perform SWAP directly — they must build it from CNOTs.`,
          workedExample: {
            problem: `SWAP = CNOT₁₂·CNOT₂₁·CNOT₁₂. Apply SWAP to ${wInput}`,
            steps: [
              `Step 1: ${wSteps[0]}`,
              `Step 2: ${wSteps[1]}`,
              `Step 3: ${wSteps[2]}`,
              `Final: ${wInput} → SWAP gives ${fmtVec4(wOut)}`,
            ],
            insight: `Three CNOTs make a SWAP. This is a fundamental circuit identity used constantly in quantum compiling.`,
          },
          tryIt: {
            question: `SWAP = CNOT₁₂·CNOT₂₁·CNOT₁₂. Apply SWAP to ${pInput}. Result:`,
            answer: pOut,
            answerType: 'vector4',
            answerDisplay: fmtVec4(pOut),
            steps: [
              `Step 1: ${pSteps[0]}`,
              `Step 2: ${pSteps[1]}`,
              `Step 3: ${pSteps[2]}`,
              `Answer: ${fmtVec4(pOut)}`,
            ],
            whyItMatters:
              `The SWAP = 3 CNOTs identity is one of the most important in quantum circuit compilation. ` +
              `Since CNOT is the native two-qubit gate on most hardware, every SWAP costs 3 expensive ` +
              `two-qubit operations. Minimizing SWAPs is a key optimization in quantum compilers.`,
          },
        };
      }

      default: return null;
    }
  },
},

toffoli_apply: {
  generate(difficulty, variation) {
    const labels8 = ['|000⟩','|001⟩','|010⟩','|011⟩','|100⟩','|101⟩','|110⟩','|111⟩'];
    function fmtVec8(arr) { return `(${arr.join(', ')})`; }

    switch (variation) {

      case 'both_controls_1': {
        // |110⟩→|111⟩ or |111⟩→|110⟩
        const wPick = randInt(0, 1) === 0;
        const wIdx = wPick ? 6 : 7;
        const pIdx = wPick ? 7 : 6;
        const wOutIdx = wIdx === 6 ? 7 : 6;
        const pOutIdx = pIdx === 6 ? 7 : 6;
        const wOut = [0,0,0,0,0,0,0,0]; wOut[wOutIdx] = 1;
        const pOut = [0,0,0,0,0,0,0,0]; pOut[pOutIdx] = 1;
        return {
          teachingText:
            `The Toffoli gate (also called CCX or CCNOT) is a 3-qubit gate. ` +
            `It flips the target qubit (3rd) ONLY when BOTH control qubits (1st and 2nd) are |1⟩.\n\n` +
            `|110⟩ → |111⟩  (both controls |1⟩, target flips 0→1)\n` +
            `|111⟩ → |110⟩  (both controls |1⟩, target flips 1→0)\n\n` +
            `All other basis states are unchanged. In an 8-element vector, Toffoli only swaps positions 6 and 7.`,
          workedExample: {
            problem: `Apply Toffoli to ${labels8[wIdx]}. Result as an 8-vector`,
            steps: [
              `Both controls are |1⟩ in ${labels8[wIdx]}`,
              `Target flips: ${labels8[wIdx]} → ${labels8[wOutIdx]}`,
              `Result: ${fmtVec8(wOut)}`,
            ],
            insight: `Toffoli is like a classical AND gate: the target flips only when control₁ AND control₂ are both |1⟩.`,
          },
          tryIt: {
            question: `Apply Toffoli to ${labels8[pIdx]}. Result as an 8-vector:`,
            answer: pOut,
            answerType: 'vector8',
            answerDisplay: fmtVec8(pOut),
            steps: [
              `Both controls |1⟩ in ${labels8[pIdx]}, so target flips`,
              `${labels8[pIdx]} → ${labels8[pOutIdx]}`,
              `Answer: ${fmtVec8(pOut)}`,
            ],
            whyItMatters:
              `The Toffoli gate is universal for classical computation — any Boolean function can ` +
              `be built from Toffoli gates alone. Combined with Hadamard, it also becomes universal ` +
              `for quantum computation. It's the bridge between classical and quantum logic.`,
          },
        };
      }

      case 'one_control_0': {
        // Only one control is |1⟩ — no flip
        const wChoices = [2, 3, 4, 5]; // |010⟩,|011⟩,|100⟩,|101⟩
        const wi = randInt(0, wChoices.length - 1);
        let pi;
        do { pi = randInt(0, wChoices.length - 1); } while (pi === wi);
        const wIdx = wChoices[wi];
        const pIdx = wChoices[pi];
        const wOut = [0,0,0,0,0,0,0,0]; wOut[wIdx] = 1;
        const pOut = [0,0,0,0,0,0,0,0]; pOut[pIdx] = 1;
        return {
          teachingText:
            `Toffoli requires BOTH controls to be |1⟩. If even one control is |0⟩, ` +
            `the target qubit is NOT flipped — the state passes through unchanged.\n\n` +
            `|010⟩ → |010⟩  (only 2nd control is |1⟩ — not enough)\n` +
            `|100⟩ → |100⟩  (only 1st control is |1⟩ — not enough)\n` +
            `|101⟩ → |101⟩  (only 1st control is |1⟩)\n` +
            `|011⟩ → |011⟩  (only 2nd control is |1⟩)`,
          workedExample: {
            problem: `Apply Toffoli to ${labels8[wIdx]}. Result as an 8-vector`,
            steps: [
              `Check controls in ${labels8[wIdx]}:`,
              `Not both controls are |1⟩, so no flip occurs.`,
              `Result: ${fmtVec8(wOut)}`,
            ],
            insight: `Toffoli is an AND gate — one |1⟩ is not enough. Both controls must be |1⟩ to flip the target.`,
          },
          tryIt: {
            question: `Apply Toffoli to ${labels8[pIdx]}. Result as an 8-vector:`,
            answer: pOut,
            answerType: 'vector8',
            answerDisplay: fmtVec8(pOut),
            steps: [
              `${labels8[pIdx]}: not both controls are |1⟩`,
              `No flip — state unchanged`,
              `Answer: ${fmtVec8(pOut)}`,
            ],
            whyItMatters:
              `Knowing when a gate does nothing is just as important as knowing when it acts. ` +
              `In quantum error correction, carefully tracking which states are affected by ` +
              `each gate determines whether errors propagate or stay contained.`,
          },
        };
      }

      case 'both_controls_0': {
        // |000⟩ or |001⟩ — neither control is |1⟩
        const wIdx = randInt(0, 1);
        const pIdx = 1 - wIdx;
        const wOut = [0,0,0,0,0,0,0,0]; wOut[wIdx] = 1;
        const pOut = [0,0,0,0,0,0,0,0]; pOut[pIdx] = 1;
        return {
          teachingText:
            `When both controls are |0⟩, Toffoli does absolutely nothing:\n\n` +
            `|000⟩ → |000⟩\n|001⟩ → |001⟩\n\n` +
            `The target qubit is completely unaffected. This is the "trivial" case — ` +
            `Toffoli only activates when both controls are |1⟩.`,
          workedExample: {
            problem: `Apply Toffoli to ${labels8[wIdx]}. Result as an 8-vector`,
            steps: [
              `Both controls are |0⟩ in ${labels8[wIdx]}.`,
              `No flip — state passes through unchanged.`,
              `Result: ${fmtVec8(wOut)}`,
            ],
            insight: `Both controls |0⟩ = nothing happens. Toffoli is dormant unless both controls are engaged.`,
          },
          tryIt: {
            question: `Apply Toffoli to ${labels8[pIdx]}. Result as an 8-vector:`,
            answer: pOut,
            answerType: 'vector8',
            answerDisplay: fmtVec8(pOut),
            steps: [
              `Both controls |0⟩ in ${labels8[pIdx]}`,
              `State unchanged`,
              `Answer: ${fmtVec8(pOut)}`,
            ],
            whyItMatters:
              `Toffoli acts as a conditional-conditional NOT. In quantum algorithms, this ` +
              `"double condition" lets you implement arithmetic operations like addition ` +
              `and multiplication, where carry bits depend on multiple inputs.`,
          },
        };
      }

      case 'superposition_controls': {
        const supCases = [
          { inVec: [0.71, 0, 0, 0, 0, 0, 0.71, 0], outVec: [0.71, 0, 0, 0, 0, 0, 0, 0.71],
            inLabel: '0.71|000⟩ + 0.71|110⟩', outLabel: '0.71|000⟩ + 0.71|111⟩',
            explain: '|000⟩ unchanged (controls not |1⟩|1⟩), |110⟩ → |111⟩ (both controls |1⟩)' },
          { inVec: [0, 0, 0, 0, 0.71, 0, 0, 0.71], outVec: [0, 0, 0, 0, 0.71, 0, 0.71, 0],
            inLabel: '0.71|100⟩ + 0.71|111⟩', outLabel: '0.71|100⟩ + 0.71|110⟩',
            explain: '|100⟩ unchanged (only 1st control is |1⟩), |111⟩ → |110⟩ (both controls |1⟩)' },
        ];
        const wi = randInt(0, supCases.length - 1);
        const pi = 1 - wi;
        const w = supCases[wi], p = supCases[pi];
        return {
          teachingText:
            `Toffoli on superpositions: apply the gate rule to each basis component separately. ` +
            `Only terms where both controls are |1⟩ (indices 6 and 7) get swapped.\n\n` +
            `In an 8-vector (a,b,c,d,e,f,g,h), Toffoli only swaps positions 6 and 7 ` +
            `(the |110⟩ and |111⟩ amplitudes). Everything else stays put.`,
          workedExample: {
            problem: `Apply Toffoli to ${fmtVec8(w.inVec)}`,
            steps: [
              `Input: ${w.inLabel}`,
              w.explain,
              `Result: ${fmtVec8(w.outVec)}`,
            ],
            insight: `Toffoli on a superposition: just swap positions 6 and 7 in the 8-vector. All other positions are untouched.`,
          },
          tryIt: {
            question: `Apply Toffoli to ${fmtVec8(p.inVec)}. Result:`,
            answer: p.outVec,
            answerType: 'vector8',
            answerDisplay: fmtVec8(p.outVec),
            steps: [
              `Input: ${p.inLabel}`,
              p.explain,
              `Answer: ${fmtVec8(p.outVec)}`,
            ],
            whyItMatters:
              `Toffoli on superpositions is how quantum arithmetic works. Shor's factoring algorithm ` +
              `uses Toffoli-like operations on superpositions to compute modular exponentiation ` +
              `on all possible inputs simultaneously — the heart of its exponential speedup.`,
          },
        };
      }

      default: return null;
    }
  },
},

controlled_gate: {
  generate(difficulty, variation) {

    switch (variation) {

      case 'controlled_h': {
        // CH: if control=|1⟩, apply H to target
        const cases = [
          { input: '|10⟩', outVec: [0, 0, 0.71, 0.71], explain:
            'Control=|1⟩, apply H to target |0⟩: H|0⟩ = (0.71, 0.71). Result: (0, 0, 0.71, 0.71)' },
          { input: '|11⟩', outVec: [0, 0, 0.71, -0.71], explain:
            'Control=|1⟩, apply H to target |1⟩: H|1⟩ = (0.71, −0.71). Result: (0, 0, 0.71, −0.71)' },
          { input: '|00⟩', outVec: [1, 0, 0, 0], explain:
            'Control=|0⟩, no gate applied. |00⟩ unchanged.' },
          { input: '|01⟩', outVec: [0, 1, 0, 0], explain:
            'Control=|0⟩, no gate applied. |01⟩ unchanged.' },
        ];
        const wi = randInt(0, cases.length - 1);
        let pi;
        do { pi = randInt(0, cases.length - 1); } while (pi === wi);
        const w = cases[wi], p = cases[pi];
        return {
          teachingText:
            `A Controlled-H (CH) gate applies Hadamard to the target qubit ONLY when ` +
            `the control qubit is |1⟩. If the control is |0⟩, nothing happens.\n\n` +
            `CH|00⟩ = |00⟩\nCH|01⟩ = |01⟩\n` +
            `CH|10⟩ = |1⟩⊗H|0⟩ = |1⟩⊗(0.71, 0.71) = (0, 0, 0.71, 0.71)\n` +
            `CH|11⟩ = |1⟩⊗H|1⟩ = |1⟩⊗(0.71, −0.71) = (0, 0, 0.71, −0.71)\n\n` +
            `The general pattern: Controlled-U applies U to the target when the control is |1⟩.`,
          workedExample: {
            problem: `Apply CH to ${w.input}. Result as a 4-vector`,
            steps: [
              `CH: if control=|1⟩, apply H to target.`,
              w.explain,
              `Result: ${fmtVec4(w.outVec)}`,
            ],
            insight: `Controlled-U gates are the building blocks of quantum algorithms. The control qubit acts as a switch.`,
          },
          tryIt: {
            question: `Apply Controlled-H (CH) to ${p.input}. Result:`,
            answer: p.outVec,
            answerType: 'vector4',
            answerDisplay: fmtVec4(p.outVec),
            steps: [
              `CH: control determines whether H is applied.`,
              p.explain,
              `Answer: ${fmtVec4(p.outVec)}`,
            ],
            whyItMatters:
              `Controlled-H creates conditional superpositions — the target enters a superposition ` +
              `only when the control permits it. This conditional behavior is essential for ` +
              `algorithms like quantum phase estimation, where you need selective interference.`,
          },
        };
      }

      case 'controlled_s': {
        // CS: if control=|1⟩, apply S to target. S|0⟩=|0⟩, S|1⟩=i|1⟩
        // Keep real-valued: test on states where S has no effect or control=|0⟩
        const cases = [
          { input: '|10⟩', outVec: [0, 0, 1, 0], explain:
            'Control=|1⟩, S applied to target |0⟩: S|0⟩ = |0⟩ (unchanged). Result: |10⟩ = (0, 0, 1, 0)' },
          { input: '|00⟩', outVec: [1, 0, 0, 0], explain:
            'Control=|0⟩, nothing happens. Result: |00⟩ = (1, 0, 0, 0)' },
          { input: '|01⟩', outVec: [0, 1, 0, 0], explain:
            'Control=|0⟩, nothing happens. Result: |01⟩ = (0, 1, 0, 0)' },
        ];
        const wi = randInt(0, cases.length - 1);
        let pi;
        do { pi = randInt(0, cases.length - 1); } while (pi === wi);
        const w = cases[wi], p = cases[pi];
        return {
          teachingText:
            `A Controlled-S (CS) gate applies the S (phase) gate to the target ONLY when ` +
            `the control is |1⟩. Recall S = [[1,0],[0,i]]:\n\n` +
            `S|0⟩ = |0⟩ (no change — S only affects the |1⟩ component)\n` +
            `S|1⟩ = i|1⟩ (multiplies by i)\n\n` +
            `CS|00⟩ = |00⟩, CS|01⟩ = |01⟩ (control=|0⟩, nothing happens)\n` +
            `CS|10⟩ = |10⟩ (control=|1⟩, but S|0⟩=|0⟩)\n` +
            `CS|11⟩ = i|11⟩ (control=|1⟩, S|1⟩=i|1⟩ — picks up phase i)`,
          workedExample: {
            problem: `Apply CS to ${w.input}. Result as a 4-vector`,
            steps: [
              `CS: if control=|1⟩, apply S to target.`,
              w.explain,
              `Result: ${fmtVec4(w.outVec)}`,
            ],
            insight: `CS on |10⟩ does nothing visible because S|0⟩ = |0⟩. The interesting case is |11⟩, where S adds a phase of i.`,
          },
          tryIt: {
            question: `Apply Controlled-S (CS) to ${p.input}. Result:`,
            answer: p.outVec,
            answerType: 'vector4',
            answerDisplay: fmtVec4(p.outVec),
            steps: [
              `CS: control determines whether S is applied.`,
              p.explain,
              `Answer: ${fmtVec4(p.outVec)}`,
            ],
            whyItMatters:
              `CS is used in quantum Fourier transform circuits, which are at the heart of ` +
              `Shor's factoring algorithm. The controlled phase rotations in QFT get ` +
              `progressively smaller: CZ, CS, CT, etc.`,
          },
        };
      }

      case 'controlled_vs_uncontrolled': {
        // Compare controlled vs uncontrolled behavior
        const cases = [
          { input: '|00⟩', gate: 'CH', outVec: [1, 0, 0, 0], explain:
            'CH|00⟩: control=|0⟩, so H is NOT applied. State unchanged: (1, 0, 0, 0)' },
          { input: '|10⟩', gate: 'CH', outVec: [0, 0, 0.71, 0.71], explain:
            'CH|10⟩: control=|1⟩, so H IS applied to target |0⟩. Result: (0, 0, 0.71, 0.71)' },
          { input: '|11⟩', gate: 'CZ', outVec: [0, 0, 0, -1], explain:
            'CZ|11⟩ = −|11⟩. Both qubits |1⟩, so phase −1 applied. Result: (0, 0, 0, −1)' },
          { input: '|01⟩', gate: 'CZ', outVec: [0, 1, 0, 0], explain:
            'CZ|01⟩ = |01⟩. No |11⟩ component, so CZ does nothing. Result: (0, 1, 0, 0)' },
        ];
        const wi = randInt(0, cases.length - 1);
        let pi;
        do { pi = randInt(0, cases.length - 1); } while (pi === wi);
        const w = cases[wi], p = cases[pi];
        return {
          teachingText:
            `The key idea behind ALL controlled gates: the gate U is applied to the ` +
            `target qubit ONLY when the control qubit is |1⟩. If the control is |0⟩, ` +
            `the state passes through unchanged.\n\n` +
            `CNOT = Controlled-X: flips target when control=|1⟩\n` +
            `CZ = Controlled-Z: phase-flips when control=|1⟩\n` +
            `CH = Controlled-H: puts target in superposition when control=|1⟩\n\n` +
            `In all cases: control=|0⟩ means "do nothing."`,
          workedExample: {
            problem: `Apply ${w.gate} to ${w.input}. Result as a 4-vector`,
            steps: [
              `${w.gate}: controlled gate, check control qubit.`,
              w.explain,
              `Result: ${fmtVec4(w.outVec)}`,
            ],
            insight: `All controlled gates share the same pattern: check control → if |1⟩ apply U, if |0⟩ do nothing.`,
          },
          tryIt: {
            question: `Apply ${p.gate} to ${p.input}. Result:`,
            answer: p.outVec,
            answerType: 'vector4',
            answerDisplay: fmtVec4(p.outVec),
            steps: [
              `${p.gate}: check control qubit`,
              p.explain,
              `Answer: ${fmtVec4(p.outVec)}`,
            ],
            whyItMatters:
              `Controlled gates are what make quantum computing powerful. They create correlations ` +
              `between qubits — the control qubit determines what happens to the target. This ` +
              `conditional logic, combined with superposition, enables quantum parallelism.`,
          },
        };
      }

      default: return null;
    }
  },
},

// ── Chapter 15: Quantum Teleportation ────────────────────────────────────────

teleportation_concept: {
  generate(difficulty, variation) {
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
          'The no-cloning theorem forbids duplicating an arbitrary unknown quantum state.',
          'Teleportation gets around this by destroying the original.',
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
          'Measuring collapses |ψ⟩ = α|0⟩ + β|1⟩ to |0⟩ or |1⟩.',
          'The amplitudes α and β are lost permanently.',
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
          'Teleportation requires a pre-shared entangled pair, typically |Φ+⟩.',
          'Alice holds one qubit, Bob holds the other. They also need 2 classical bits.',
        ],
      },
    };

    const poolMap = {
      why_not_copy: ['why_not_copy'],
      why_not_measure: ['why_not_measure'],
      what_is_shared: ['what_is_shared'],
    };
    const pool = poolMap[variation] || ['why_not_copy', 'why_not_measure', 'what_is_shared'];

    const wKey = pool[randInt(0, pool.length - 1)];
    let pKey;
    do { pKey = pool[randInt(0, pool.length - 1)]; } while (pKey === wKey && pool.length > 1);
    const w = items[wKey], p = items[pKey];

    const teachingMap = {
      why_not_copy:
        `Quantum teleportation transfers the exact quantum state |ψ⟩ from Alice to ` +
        `Bob — without physically moving the qubit. But why not just copy it?\n\n` +
        `The no-cloning theorem (1982) proves that no quantum operation can duplicate ` +
        `an unknown quantum state. There is no "quantum photocopier." This is fundamentally ` +
        `different from classical information, which can be copied freely.\n\n` +
        `Teleportation solves this by destroying the original state at Alice's end while ` +
        `recreating it at Bob's end — the state is transferred, not copied.`,
      why_not_measure:
        `A natural idea: Alice could measure |ψ⟩ = α|0⟩ + β|1⟩ and send the result ` +
        `to Bob as classical bits. But this fails.\n\n` +
        `Measurement collapses the superposition — Alice gets 0 or 1, losing all ` +
        `information about α and β. A single measurement cannot reveal a quantum state. ` +
        `Even with many copies, Alice cannot determine α and β exactly (quantum state ` +
        `tomography requires many measurements).\n\n` +
        `Teleportation preserves the full quantum state without ever measuring it directly.`,
      what_is_shared:
        `Quantum teleportation requires two resources:\n\n` +
        `1. A shared Bell pair — Alice and Bob each hold one qubit of |Φ+⟩ = (1/√2)(|00⟩ + |11⟩). ` +
        `This entangled pair is the "quantum channel."\n\n` +
        `2. A classical communication channel — Alice sends 2 bits to Bob after her measurement.\n\n` +
        `The Bell pair provides the quantum correlations, and the classical bits tell Bob ` +
        `which correction to apply. Neither resource alone is sufficient.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['why_not_copy'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps, `Answer: ${w.display}`],
        insight: `Teleportation uses entanglement and classical communication to transfer quantum states without violating the no-cloning theorem.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `Quantum teleportation is not science fiction — it was first demonstrated in 1997 ` +
          `and has since been performed over 1,400 km via satellite. It is a key primitive in ` +
          `quantum networking, error correction, and distributed quantum computing.`,
      },
    };
  },
},

teleport_setup: {
  generate(difficulty, variation) {
    const s = 0.71; // 1/√2

    const allPairs = [
      { a: 1, b: 0, label: '|0⟩' },
      { a: 0, b: 1, label: '|1⟩' },
      { a: s, b: s, label: '|+⟩' },
      { a: s, b: -s, label: '|−⟩' },
    ];

    function makeVec8(alpha, beta) {
      return [r2(alpha*s), 0, 0, r2(alpha*s), r2(beta*s), 0, 0, r2(beta*s)];
    }

    switch (variation) {

      case 'basic': {
        const wAns = [s, 0, 0, s, 0, 0, 0, 0];
        const pAns = [0, 0, 0, 0, s, 0, 0, s];
        return {
          teachingText:
            `The teleportation protocol begins with three qubits:\n\n` +
            `• Qubit A: Alice's state |ψ⟩ that she wants to send\n` +
            `• Qubits B,C: A shared Bell pair |Φ+⟩ = (1/√2)(|00⟩ + |11⟩)\n\n` +
            `The initial 3-qubit state is |ψ⟩_A ⊗ |Φ+⟩_BC. To write this as an 8-vector, ` +
            `use the basis order |000⟩, |001⟩, |010⟩, |011⟩, |100⟩, |101⟩, |110⟩, |111⟩.\n\n` +
            `For |ψ⟩ = |0⟩:\n` +
            `|0⟩ ⊗ |Φ+⟩ = |0⟩ ⊗ (1/√2)(|00⟩ + |11⟩) = (1/√2)(|000⟩ + |011⟩)\n` +
            `= (0.71, 0, 0, 0.71, 0, 0, 0, 0)`,
          workedExample: {
            problem: `Write |0⟩ ⊗ |Φ+⟩ as an 8-vector`,
            steps: [
              `|0⟩ ⊗ |Φ+⟩ = |0⟩ ⊗ (1/√2)(|00⟩ + |11⟩)`,
              `= (1/√2)|000⟩ + (1/√2)|011⟩`,
              `8-vector: (${wAns.join(', ')})`,
            ],
            insight: `The first qubit (|ψ⟩) only occupies the |0xx⟩ slots because it is |0⟩. The Bell pair spreads across the 2nd and 3rd positions.`,
          },
          tryIt: {
            question: `Write |1⟩ ⊗ |Φ+⟩ as an 8-vector.\n|Φ+⟩ = (1/√2)(|00⟩ + |11⟩). Basis order: |000⟩,|001⟩,...,|111⟩.`,
            answer: pAns,
            answerType: 'vector8',
            answerDisplay: `(${pAns.join(', ')})`,
            steps: [
              `|1⟩ ⊗ |Φ+⟩ = |1⟩ ⊗ (1/√2)(|00⟩ + |11⟩)`,
              `= (1/√2)|100⟩ + (1/√2)|111⟩`,
              `8-vector: (${pAns.join(', ')})`,
            ],
            whyItMatters:
              `Setting up the initial 3-qubit state is the first step of teleportation. ` +
              `Understanding how tensor products distribute across basis states is essential ` +
              `for following the rest of the protocol.`,
          },
        };
      }

      case 'general': {
        const wPick = allPairs[2]; // |+⟩
        const pPick = allPairs[3]; // |−⟩
        const wAns = makeVec8(wPick.a, wPick.b);
        const pAns = makeVec8(pPick.a, pPick.b);
        return {
          teachingText:
            `For a general state |ψ⟩ = α|0⟩ + β|1⟩, the initial 3-qubit state is:\n\n` +
            `(α|0⟩ + β|1⟩) ⊗ (1/√2)(|00⟩ + |11⟩)\n` +
            `= (α/√2)|000⟩ + (α/√2)|011⟩ + (β/√2)|100⟩ + (β/√2)|111⟩\n\n` +
            `The α terms fill the |0xx⟩ slots, the β terms fill the |1xx⟩ slots. ` +
            `Only the |x00⟩ and |x11⟩ positions are nonzero (from the Bell pair structure).`,
          workedExample: {
            problem: `Write ${wPick.label} ⊗ |Φ+⟩ as an 8-vector (α = ${fmt(wPick.a)}, β = ${fmt(wPick.b)})`,
            steps: [
              `α/√2 = ${fmt(wPick.a)} × 0.71 = ${fmt(r2(wPick.a * s))}`,
              `β/√2 = ${fmt(wPick.b)} × 0.71 = ${fmt(r2(wPick.b * s))}`,
              `Nonzero at positions 0,3 (from α) and 4,7 (from β)`,
              `8-vector: (${wAns.join(', ')})`,
            ],
            insight: `The Bell pair's structure (only |00⟩ and |11⟩ terms) means only 4 of the 8 components are nonzero.`,
          },
          tryIt: {
            question: `Write ${pPick.label} ⊗ |Φ+⟩ as an 8-vector.\nα = ${fmt(pPick.a)}, β = ${fmt(pPick.b)}. Round to 0.01.`,
            answer: pAns,
            answerType: 'vector8',
            answerDisplay: `(${pAns.join(', ')})`,
            steps: [
              `α/√2 = ${fmt(pPick.a)} × 0.71 = ${fmt(r2(pPick.a * s))}`,
              `β/√2 = ${fmt(pPick.b)} × 0.71 = ${fmt(r2(pPick.b * s))}`,
              `8-vector: (${pAns.join(', ')})`,
            ],
            whyItMatters:
              `With a general |ψ⟩, the initial state encodes both amplitudes α and β ` +
              `spread across the 8 basis states. The protocol must transfer both of these ` +
              `complex numbers to Bob — which seems impossible since Alice can only send 2 classical bits.`,
          },
        };
      }

      default: return null;
    }
  },
},

teleport_alice_ops: {
  generate(difficulty, variation) {
    const s = 0.71;

    switch (variation) {

      case 'cnot_step': {
        const cases = [
          { in: '(0.71, 0, 0.71, 0)', out: [s, 0, 0, s], outLabel: '(0.71, 0, 0, 0.71)',
            explain: '|00⟩→|00⟩ (control=0, no flip), |10⟩→|11⟩ (control=1, flip)' },
          { in: '(0, 0.71, 0, 0.71)', out: [0, s, s, 0], outLabel: '(0, 0.71, 0.71, 0)',
            explain: '|01⟩→|01⟩ (control=0, no flip), |11⟩→|10⟩ (control=1, flip)' },
        ];
        const wi = randInt(0, 1);
        const pi = 1 - wi;
        const w = cases[wi], p = cases[pi];
        return {
          teachingText:
            `In the teleportation protocol, Alice applies two operations to her qubits ` +
            `(qubits A and B of the 3-qubit system). The first step is CNOT.\n\n` +
            `Alice uses her ψ-qubit (A) as the control and her Bell qubit (B) as the target. ` +
            `CNOT flips the target when the control is |1⟩:\n` +
            `|00⟩→|00⟩, |01⟩→|01⟩, |10⟩→|11⟩, |11⟩→|10⟩\n\n` +
            `This entangles Alice's original state with the Bell pair, spreading the ` +
            `information about |ψ⟩ across all three qubits.`,
          workedExample: {
            problem: `Apply CNOT to ${w.in}`,
            steps: [
              `Decompose: the state has components at specific basis states`,
              w.explain,
              `Result: ${w.outLabel}`,
            ],
            insight: `The CNOT creates correlations between Alice's ψ-qubit and her Bell qubit, beginning to "spread" the quantum information.`,
          },
          tryIt: {
            question: `Alice applies CNOT (ψ-qubit controls Bell qubit) to ${p.in}.\nResult as a 4-vector:`,
            answer: p.out,
            answerType: 'vector4',
            answerDisplay: p.outLabel,
            steps: [
              p.explain,
              `Result: ${p.outLabel}`,
            ],
            whyItMatters:
              `The CNOT is the first of Alice's two operations. It entangles her original state ` +
              `with the shared Bell pair — a crucial step that allows the measurement outcome ` +
              `to encode information about |ψ⟩.`,
          },
        };
      }

      case 'hadamard_step': {
        const cases = [
          { in: '(0.71, 0, 0, 0.71)', out: [0.5, 0.5, 0.5, -0.5],
            steps: [
              'H on first qubit: |0⟩→(|0⟩+|1⟩)/√2, |1⟩→(|0⟩−|1⟩)/√2',
              '0.71|00⟩ → 0.5|00⟩ + 0.5|10⟩',
              '0.71|11⟩ → 0.5|01⟩ − 0.5|11⟩',
              'Result: (0.5, 0.5, 0.5, -0.5)',
            ]},
          { in: '(0, 0.71, 0.71, 0)', out: [0.5, -0.5, 0.5, 0.5],
            steps: [
              'H on first qubit: |0⟩→(|0⟩+|1⟩)/√2, |1⟩→(|0⟩−|1⟩)/√2',
              '0.71|01⟩ → 0.5|01⟩ + 0.5|11⟩',
              '0.71|10⟩ → 0.5|00⟩ − 0.5|10⟩',
              'Result: (0.5, -0.5, 0.5, 0.5)',
            ]},
        ];
        const wi = randInt(0, 1);
        const pi = 1 - wi;
        const w = cases[wi], p = cases[pi];
        return {
          teachingText:
            `After the CNOT, Alice applies H⊗I — Hadamard on her ψ-qubit, identity on the Bell qubit.\n\n` +
            `H transforms the computational basis into superposition:\n` +
            `H|0⟩ = (|0⟩ + |1⟩)/√2,  H|1⟩ = (|0⟩ − |1⟩)/√2\n\n` +
            `H⊗I acts only on the first qubit of each basis state:\n` +
            `|0x⟩ → (1/√2)(|0x⟩ + |1x⟩),  |1x⟩ → (1/√2)(|0x⟩ − |1x⟩)\n\n` +
            `After this step, all four measurement outcomes (00, 01, 10, 11) become equally likely.`,
          workedExample: {
            problem: `Apply H⊗I to ${w.in}`,
            steps: w.steps,
            insight: `The Hadamard creates an equal superposition of all four measurement outcomes, each correlated with a specific transformation of Bob's qubit.`,
          },
          tryIt: {
            question: `Apply H⊗I to ${p.in}.\nResult as a 4-vector:`,
            answer: p.out,
            answerType: 'vector4',
            answerDisplay: `(${p.out.join(', ')})`,
            steps: p.steps,
            whyItMatters:
              `The Hadamard is the second and final operation Alice performs. After this, ` +
              `the 3-qubit state is in a form where measuring Alice's qubits projects ` +
              `Bob's qubit into one of four states, each correctable with Pauli gates.`,
          },
        };
      }

      case 'full_alice': {
        const cases = [
          { in: '(0.71, 0, 0.71, 0)', out: [0.5, 0.5, 0.5, -0.5],
            steps: [
              'CNOT: |00⟩→|00⟩, |10⟩→|11⟩ → (0.71, 0, 0, 0.71)',
              'H⊗I: 0.71|00⟩ → 0.5|00⟩+0.5|10⟩, 0.71|11⟩ → 0.5|01⟩−0.5|11⟩',
              'Result: (0.5, 0.5, 0.5, -0.5)',
            ]},
          { in: '(0, 0.71, 0, 0.71)', out: [0.5, -0.5, 0.5, 0.5],
            steps: [
              'CNOT: |01⟩→|01⟩, |11⟩→|10⟩ → (0, 0.71, 0.71, 0)',
              'H⊗I: 0.71|01⟩ → 0.5|01⟩+0.5|11⟩, 0.71|10⟩ → 0.5|00⟩−0.5|10⟩',
              'Result: (0.5, -0.5, 0.5, 0.5)',
            ]},
        ];
        const wi = randInt(0, 1);
        const pi = 1 - wi;
        const w = cases[wi], p = cases[pi];
        return {
          teachingText:
            `Alice performs both operations in sequence: CNOT then H⊗I.\n\n` +
            `Starting from the 2-qubit portion (Alice's qubits after tensoring with |ψ⟩):\n` +
            `1. CNOT: entangles ψ-qubit with Bell qubit\n` +
            `2. H⊗I: puts ψ-qubit into superposition\n\n` +
            `The combined effect prepares the state for measurement. Each of the four ` +
            `measurement outcomes (00, 01, 10, 11) occurs with probability 1/4 and ` +
            `leaves Bob's qubit in a known transformation of |ψ⟩.`,
          workedExample: {
            problem: `Apply CNOT then H⊗I to ${w.in}`,
            steps: w.steps,
            insight: `CNOT + H is the reverse of the Bell state circuit (H + CNOT). Alice is essentially "un-doing" entanglement to extract classical information.`,
          },
          tryIt: {
            question: `Apply CNOT then H⊗I to ${p.in}.\nFinal 4-vector:`,
            answer: p.out,
            answerType: 'vector4',
            answerDisplay: `(${p.out.join(', ')})`,
            steps: p.steps,
            whyItMatters:
              `The CNOT-then-H sequence is sometimes called the "Bell measurement" circuit. ` +
              `It reverses the Bell state creation (H-then-CNOT), projecting onto the Bell basis. ` +
              `This is a fundamental primitive in quantum information processing.`,
          },
        };
      }

      default: return null;
    }
  },
},

teleport_measurement: {
  generate(difficulty, variation) {
    const items = {
      outcome_00: {
        q: 'Alice measures 00. What correction does Bob apply?',
        choices: ['No gate needed (identity)', 'X gate', 'Z gate', 'X then Z'],
        answer: 'A', display: 'A) No gate needed (identity)',
        steps: ['Outcome 00 → Bob has |ψ⟩ already.', 'No correction needed.'],
      },
      outcome_01: {
        q: 'Alice measures 01. What correction does Bob apply?',
        choices: ['No gate needed (identity)', 'X gate', 'Z gate', 'X then Z'],
        answer: 'B', display: 'B) X gate',
        steps: ['Outcome 01 → Bob has X|ψ⟩ (bit-flipped).', 'Apply X to undo: X·X|ψ⟩ = |ψ⟩.'],
      },
      outcome_10: {
        q: 'Alice measures 10. What correction does Bob apply?',
        choices: ['No gate needed (identity)', 'X gate', 'Z gate', 'X then Z'],
        answer: 'C', display: 'C) Z gate',
        steps: ['Outcome 10 → Bob has Z|ψ⟩ (phase-flipped).', 'Apply Z to undo: Z·Z|ψ⟩ = |ψ⟩.'],
      },
      outcome_11: {
        q: 'Alice measures 11. What correction does Bob apply?',
        choices: ['No gate needed (identity)', 'X gate', 'Z gate', 'X then Z'],
        answer: 'D', display: 'D) X then Z',
        steps: ['Outcome 11 → Bob has ZX|ψ⟩.', 'Apply X then Z to undo: Z·X·ZX|ψ⟩ = |ψ⟩.'],
      },
    };

    const poolMap = {
      outcome_00: ['outcome_00'],
      outcome_01: ['outcome_01'],
      outcome_10: ['outcome_10'],
      outcome_11: ['outcome_11'],
    };
    const pool = poolMap[variation] || ['outcome_00', 'outcome_01', 'outcome_10', 'outcome_11'];

    const wKey = pool[randInt(0, pool.length - 1)];
    let pKey;
    do { pKey = pool[randInt(0, pool.length - 1)]; } while (pKey === wKey && pool.length > 1);
    const w = items[wKey], p = items[pKey];

    const teachingMap = {
      outcome_00:
        `After Alice measures her two qubits, she gets one of four outcomes: 00, 01, 10, or 11. ` +
        `She sends these 2 classical bits to Bob.\n\n` +
        `The correction table:\n` +
        `• 00 → No gate needed (Bob already has |ψ⟩)\n` +
        `• 01 → Apply X (undo bit-flip)\n` +
        `• 10 → Apply Z (undo phase-flip)\n` +
        `• 11 → Apply X then Z (undo both)\n\n` +
        `Outcome 00 is the lucky case — the state teleported perfectly with no correction.`,
      outcome_01:
        `When Alice measures 01, Bob's qubit is in the state X|ψ⟩ — the bit-flipped version.\n\n` +
        `For |ψ⟩ = α|0⟩ + β|1⟩, X|ψ⟩ = β|0⟩ + α|1⟩. The amplitudes are swapped.\n\n` +
        `Bob fixes this by applying X again: X·X|ψ⟩ = I|ψ⟩ = |ψ⟩, because X² = I.`,
      outcome_10:
        `When Alice measures 10, Bob's qubit is in the state Z|ψ⟩ — the phase-flipped version.\n\n` +
        `For |ψ⟩ = α|0⟩ + β|1⟩, Z|ψ⟩ = α|0⟩ − β|1⟩. The sign of the |1⟩ component is flipped.\n\n` +
        `Bob fixes this by applying Z again: Z·Z|ψ⟩ = I|ψ⟩ = |ψ⟩, because Z² = I.`,
      outcome_11:
        `When Alice measures 11, Bob's qubit is in the state ZX|ψ⟩ — both bit-flipped and phase-flipped.\n\n` +
        `Bob must undo both: first apply X (to fix the bit-flip), then Z (to fix the phase-flip).\n` +
        `Z·X·ZX|ψ⟩ = |ψ⟩.\n\n` +
        `Each Pauli gate is its own inverse (X² = Z² = I), making the correction simple.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['outcome_00'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps, `Answer: ${w.display}`],
        insight: `The 2 classical bits Alice sends encode which of four Pauli corrections Bob needs. This is why teleportation cannot be faster than light — Bob must wait for the classical message.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `The correction step is what makes teleportation work. Without it, Bob would have ` +
          `a random transformation of |ψ⟩. The 2 classical bits are essential — this is why ` +
          `teleportation does not violate the no-faster-than-light rule.`,
      },
    };
  },
},

teleport_correction: {
  generate(difficulty, variation) {
    const states = [
      { a: 0.87, b: 0.5 },
      { a: 0.5, b: 0.87 },
      { a: 0.71, b: 0.71 },
      { a: 0.71, b: -0.71 },
      { a: 1, b: 0 },
      { a: 0, b: 1 },
    ];

    function pick2() {
      const wi = randInt(0, states.length - 1);
      let pi;
      do { pi = randInt(0, states.length - 1); } while (pi === wi);
      return [states[wi], states[pi]];
    }

    switch (variation) {

      case 'apply_x': {
        const [ws, ps] = pick2();
        const wBob = [r2(ws.b), r2(ws.a)];
        const wAns = [r2(ws.a), r2(ws.b)];
        const pBob = [r2(ps.b), r2(ps.a)];
        const pAns = [r2(ps.a), r2(ps.b)];
        return {
          teachingText:
            `When Alice measures 01, Bob's qubit is X|ψ⟩ — the amplitudes are swapped.\n\n` +
            `X gate: (a, b) → (b, a)\n\n` +
            `If |ψ⟩ = (α, β), then Bob has (β, α). Applying X swaps them back:\n` +
            `X · (β, α) = (α, β) = |ψ⟩\n\n` +
            `This works because X is its own inverse: X² = I.`,
          workedExample: {
            problem: `Bob has ${fmtVec(wBob)} = X|ψ⟩. Apply X to recover |ψ⟩`,
            steps: [
              `X swaps: (${wBob.join(', ')}) → (${wAns.join(', ')})`,
              `Bob recovers |ψ⟩ = ${fmtVec(wAns)}`,
            ],
            insight: `X is its own inverse, so applying it twice returns to the original state.`,
          },
          tryIt: {
            question: `Bob has (${pBob.join(', ')}) which is X|ψ⟩.\nApply X to recover |ψ⟩:`,
            answer: pAns,
            answerType: 'vector',
            answerDisplay: fmtVec(pAns),
            steps: [
              `X swaps: (${pBob.join(', ')}) → (${pAns.join(', ')})`,
            ],
            whyItMatters:
              `The X correction is the simplest case — just swap the two amplitudes. ` +
              `In a real quantum computer, this is a single gate operation that takes nanoseconds.`,
          },
        };
      }

      case 'apply_z': {
        const [ws, ps] = pick2();
        const wBob = [r2(ws.a), r2(-ws.b)];
        const wAns = [r2(ws.a), r2(ws.b)];
        const pBob = [r2(ps.a), r2(-ps.b)];
        const pAns = [r2(ps.a), r2(ps.b)];
        return {
          teachingText:
            `When Alice measures 10, Bob's qubit is Z|ψ⟩ — the phase is flipped.\n\n` +
            `Z gate: (a, b) → (a, -b)\n\n` +
            `If |ψ⟩ = (α, β), then Bob has (α, -β). Applying Z negates the second component again:\n` +
            `Z · (α, -β) = (α, β) = |ψ⟩\n\n` +
            `Like X, Z is its own inverse: Z² = I.`,
          workedExample: {
            problem: `Bob has ${fmtVec(wBob)} = Z|ψ⟩. Apply Z to recover |ψ⟩`,
            steps: [
              `Z negates second: (${wBob.join(', ')}) → (${wAns.join(', ')})`,
              `Bob recovers |ψ⟩ = ${fmtVec(wAns)}`,
            ],
            insight: `Z only affects the |1⟩ component — it is a phase gate, leaving the |0⟩ amplitude untouched.`,
          },
          tryIt: {
            question: `Bob has (${pBob.join(', ')}) which is Z|ψ⟩.\nApply Z to recover |ψ⟩:`,
            answer: pAns,
            answerType: 'vector',
            answerDisplay: fmtVec(pAns),
            steps: [
              `Z negates second: (${pBob.join(', ')}) → (${pAns.join(', ')})`,
            ],
            whyItMatters:
              `The Z correction fixes a phase error. Phase errors are invisible if you only ` +
              `measure in the computational basis — but they matter for quantum computation. ` +
              `This is why classical measurement alone cannot replace teleportation.`,
          },
        };
      }

      case 'apply_zx': {
        // ZX|ψ⟩ = Z·X·(a,b) = Z·(b,a) = (b,-a). To recover: apply Z then X.
        // Z·(b,-a) = (b,a). X·(b,a) = (a,b). Done.
        const scenarios = [
          { psi: [0.87, 0.5], bob: [0.5, -0.87], afterZ: [0.5, 0.87], result: [0.87, 0.5] },
          { psi: [0.5, 0.87], bob: [0.87, -0.5], afterZ: [0.87, 0.5], result: [0.5, 0.87] },
        ];
        const wi = randInt(0, 1);
        const pi = 1 - wi;
        const w = scenarios[wi], p = scenarios[pi];
        return {
          teachingText:
            `When Alice measures 11, Bob has ZX|ψ⟩ — both bit-flipped and phase-flipped.\n\n` +
            `ZX|ψ⟩ = Z·X·(α, β) = Z·(β, α) = (β, -α)\n\n` +
            `To recover |ψ⟩, Bob applies Z then X:\n` +
            `• Z: (β, -α) → (β, α)\n` +
            `• X: (β, α) → (α, β) = |ψ⟩\n\n` +
            `This undoes both errors in sequence.`,
          workedExample: {
            problem: `Bob has (${w.bob.join(', ')}) = ZX|ψ⟩. Apply Z then X`,
            steps: [
              `Z: (${w.bob.join(', ')}) → (${w.afterZ.join(', ')})`,
              `X: (${w.afterZ.join(', ')}) → (${w.result.join(', ')})`,
              `Bob recovers |ψ⟩ = (${w.result.join(', ')})`,
            ],
            insight: `The order matters: Z fixes the phase first, then X fixes the bit-flip.`,
          },
          tryIt: {
            question: `Bob has (${p.bob.join(', ')}) which is ZX|ψ⟩.\nApply Z then X. Final state:`,
            answer: p.result,
            answerType: 'vector',
            answerDisplay: fmtVec(p.result),
            steps: [
              `Z: (${p.bob.join(', ')}) → (${p.afterZ.join(', ')})`,
              `X: (${p.afterZ.join(', ')}) → (${p.result.join(', ')})`,
            ],
            whyItMatters:
              `The double correction (outcome 11) uses both Pauli gates. Despite needing two ` +
              `operations, it is still a simple correction — the beauty of teleportation ` +
              `is that only Pauli gates are ever needed.`,
          },
        };
      }

      case 'full_protocol': {
        const scenarios = [
          { outcome: '01', bobHas: [0.5, 0.87], gate: 'X', result: [0.87, 0.5],
            steps: ['Outcome 01 → apply X', 'X: (0.5, 0.87) → (0.87, 0.5)'] },
          { outcome: '10', bobHas: [0.87, -0.5], gate: 'Z', result: [0.87, 0.5],
            steps: ['Outcome 10 → apply Z', 'Z: (0.87, -0.5) → (0.87, 0.5)'] },
          { outcome: '01', bobHas: [0.71, -0.71], gate: 'X', result: [-0.71, 0.71],
            steps: ['Outcome 01 → apply X', 'X: (0.71, -0.71) → (-0.71, 0.71)'] },
          { outcome: '10', bobHas: [0.5, -0.87], gate: 'Z', result: [0.5, 0.87],
            steps: ['Outcome 10 → apply Z', 'Z: (0.5, -0.87) → (0.5, 0.87)'] },
        ];
        const wi = randInt(0, scenarios.length - 1);
        let pi;
        do { pi = randInt(0, scenarios.length - 1); } while (pi === wi);
        const w = scenarios[wi], p = scenarios[pi];
        return {
          teachingText:
            `In the full protocol, Alice tells Bob her 2-bit measurement result, ` +
            `and Bob looks up the correction:\n\n` +
            `• 00 → I (do nothing)\n` +
            `• 01 → X (swap amplitudes)\n` +
            `• 10 → Z (negate second component)\n` +
            `• 11 → Z then X (both corrections)\n\n` +
            `Given the measurement outcome and Bob's current state, apply the ` +
            `correct gate to recover |ψ⟩.`,
          workedExample: {
            problem: `Alice measured ${w.outcome}. Bob has (${w.bobHas.join(', ')}). Apply ${w.gate}`,
            steps: [...w.steps, `|ψ⟩ = (${w.result.join(', ')})`],
            insight: `Regardless of Alice's measurement outcome, Bob can always recover |ψ⟩ with at most two single-qubit gates.`,
          },
          tryIt: {
            question: `Alice measured ${p.outcome}. Bob has (${p.bobHas.join(', ')}).\nApply ${p.gate} to recover |ψ⟩:`,
            answer: p.result,
            answerType: 'vector',
            answerDisplay: fmtVec(p.result),
            steps: p.steps,
            whyItMatters:
              `This is the final step of quantum teleportation. Bob receives 2 classical bits, ` +
              `applies the corresponding correction, and recovers the exact quantum state Alice ` +
              `wanted to send. The protocol is complete.`,
          },
        };
      }

      default: return null;
    }
  },
},

// ── Chapter 16: Deutsch-Jozsa Algorithm ─────────────────────────────────────

dj_problem_type: {
  generate(difficulty, variation) {
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
          'Classically, you must check f(0) and f(1) to compare.',
          'You need 2 queries — checking only one tells you nothing.',
        ],
      },
      quantum_queries: {
        q: 'How many queries does the Deutsch-Jozsa algorithm need to determine if a 1-bit function is constant or balanced?',
        choices: ['1', '2', '3', '0'],
        answer: 'A', display: 'A) 1',
        steps: [
          'Deutsch-Jozsa queries the oracle exactly once.',
          'Superposition + interference extract global info about f in one shot.',
        ],
      },
    };

    const varMap = {
      identify_constant: ['identify_constant', 'identify_balanced'],
      identify_balanced: ['identify_balanced', 'identify_constant'],
      classical_queries: ['classical_queries', 'quantum_queries'],
      quantum_queries: ['quantum_queries', 'classical_queries'],
      basic: ['identify_constant', 'identify_balanced'],
    };
    const [wKey, pKey] = varMap[variation] || varMap['basic'];
    const w = items[wKey], p = items[pKey];

    const teachingMap = {
      identify_constant:
        `The Deutsch-Jozsa problem asks: given a function f: {0,1}→{0,1}, is f ` +
        `constant (same output for all inputs) or balanced (different outputs for different inputs)?\n\n` +
        `For 1-bit functions, there are exactly 4 possibilities:\n` +
        `• Constant: f(0)=0,f(1)=0 or f(0)=1,f(1)=1\n` +
        `• Balanced: f(0)=0,f(1)=1 or f(0)=1,f(1)=0\n\n` +
        `If both outputs match → constant. If they differ → balanced.`,
      identify_balanced:
        `A balanced function returns 0 for exactly half of its inputs and 1 for the other half. ` +
        `For a 1-bit function f: {0,1}→{0,1}, balanced means f(0) ≠ f(1).\n\n` +
        `The key insight: for n-bit functions, there are 2^n inputs. A balanced function ` +
        `returns 0 on exactly 2^(n−1) of them and 1 on the rest.`,
      classical_queries:
        `Classically, to determine if f is constant or balanced, you must query f on enough ` +
        `inputs to be certain. For a 1-bit function, you need both f(0) and f(1) — that is 2 queries.\n\n` +
        `For an n-bit function, the worst case is even worse: you might need to check ` +
        `2^(n−1) + 1 inputs before you can be sure. That is exponentially many queries!`,
      quantum_queries:
        `The Deutsch-Jozsa algorithm solves this with a single query to the oracle. ` +
        `It prepares a superposition, queries once, and uses interference to determine ` +
        `constant vs balanced with certainty.\n\n` +
        `This is one of the first demonstrations that quantum computers can be ` +
        `exponentially faster than classical ones for specific problems.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['identify_constant'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps, `Answer: ${w.display}`],
        insight: `Constant means all outputs equal; balanced means outputs split evenly between 0 and 1.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `The Deutsch-Jozsa problem is the simplest example where a quantum algorithm ` +
          `provably outperforms any classical algorithm. Understanding constant vs balanced ` +
          `functions is the foundation for this quantum speedup.`,
      },
    };
  },
},

dj_oracle: {
  generate(difficulty, variation) {
    const items = {
      constant_0: {
        q: 'For f(x) = 0 (constant), what gate(s) does the oracle U_f apply?',
        choices: ['Identity (do nothing)', 'X gate on ancilla', 'CNOT (control=input, target=ancilla)', 'X on ancilla, then CNOT'],
        answer: 'A', display: 'A) Identity (do nothing)',
        steps: [
          'U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩. With f(x)=0: y ⊕ 0 = y.',
          'The ancilla is unchanged — oracle is identity.',
        ],
      },
      constant_1: {
        q: 'For f(x) = 1 (constant), what gate(s) does the oracle U_f apply?',
        choices: ['Identity (do nothing)', 'X gate on ancilla', 'CNOT (control=input, target=ancilla)', 'X on ancilla, then CNOT'],
        answer: 'B', display: 'B) X gate on ancilla',
        steps: [
          'U_f|x⟩|y⟩ = |x⟩|y ⊕ 1⟩ = |x⟩|NOT(y)⟩.',
          'Ancilla always flipped regardless of x — this is X on ancilla.',
        ],
      },
      balanced_identity: {
        q: 'For f(x) = x (balanced), what gate implements the oracle U_f?',
        choices: ['Identity (do nothing)', 'X gate on ancilla', 'CNOT (control=input, target=ancilla)', 'X on ancilla, then CNOT'],
        answer: 'C', display: 'C) CNOT (control=input, target=ancilla)',
        steps: [
          'U_f|x⟩|y⟩ = |x⟩|y ⊕ x⟩.',
          'Ancilla flips when x=1 — this is CNOT with input as control.',
        ],
      },
      balanced_not: {
        q: 'For f(x) = NOT(x) (balanced), what gate(s) implement the oracle U_f?',
        choices: ['Identity (do nothing)', 'X gate on ancilla', 'CNOT (control=input, target=ancilla)', 'X on ancilla, then CNOT'],
        answer: 'D', display: 'D) X on ancilla, then CNOT',
        steps: [
          'U_f|x⟩|y⟩ = |x⟩|y ⊕ NOT(x)⟩ = |x⟩|y ⊕ 1 ⊕ x⟩.',
          'First X (flip ancilla), then CNOT: (y⊕1)⊕x = y ⊕ NOT(x). ✓',
        ],
      },
    };

    const varMap = {
      constant_0: ['constant_0', 'constant_1'],
      constant_1: ['constant_1', 'constant_0'],
      balanced_identity: ['balanced_identity', 'balanced_not'],
      balanced_not: ['balanced_not', 'balanced_identity'],
      basic: ['constant_0', 'balanced_identity'],
    };
    const [wKey, pKey] = varMap[variation] || varMap['basic'];
    const w = items[wKey], p = items[pKey];

    const teachingMap = {
      constant_0:
        `An oracle U_f encodes a function f into a quantum circuit. The rule is:\n` +
        `U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩\n\n` +
        `For f(x) = 0 (constant zero), y ⊕ 0 = y, so the oracle does nothing — it is the identity.\n` +
        `For f(x) = 1 (constant one), y ⊕ 1 = NOT(y), so the oracle applies X to the ancilla.`,
      constant_1:
        `When f(x) = 1 for all x, the oracle flips the ancilla regardless of the input. ` +
        `This is simply an X gate on the ancilla qubit. The input register is untouched.\n\n` +
        `Key insight: constant oracles do not create any correlation between input and ancilla.`,
      balanced_identity:
        `For f(x) = x, the oracle flips the ancilla only when x = 1. This is a CNOT gate ` +
        `with the input qubit as control and the ancilla as target.\n\n` +
        `U_f|0⟩|y⟩ = |0⟩|y⟩ (no flip)\n` +
        `U_f|1⟩|y⟩ = |1⟩|y ⊕ 1⟩ (flip)`,
      balanced_not:
        `For f(x) = NOT(x), we need y ⊕ NOT(x) = y ⊕ (1 ⊕ x) = (y ⊕ 1) ⊕ x.\n\n` +
        `Implementation: first apply X to ancilla (y → y⊕1), then CNOT (y⊕1 → y⊕1⊕x).\n` +
        `This correctly computes y ⊕ NOT(x) for both x = 0 and x = 1.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['constant_0'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps, `Answer: ${w.display}`],
        insight: `Each 1-bit Boolean function maps to a specific oracle circuit. Constant functions use only the ancilla; balanced functions use CNOT.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `Understanding how functions become quantum circuits is essential. ` +
          `The oracle is the "black box" that Deutsch-Jozsa queries — different functions ` +
          `produce different phase patterns that interference can detect.`,
      },
    };
  },
},

dj_trace: {
  generate(difficulty, variation) {
    const s = 0.71; // 1/√2
    const h = 0.5;  // 1/2

    switch (variation) {

      case 'after_hadamards': {
        return {
          teachingText:
            `The Deutsch-Jozsa circuit starts with |0⟩|1⟩ = |01⟩. The first step applies H ` +
            `to both qubits:\n\n` +
            `H|0⟩ = (|0⟩ + |1⟩)/√2 = |+⟩\n` +
            `H|1⟩ = (|0⟩ − |1⟩)/√2 = |−⟩\n\n` +
            `The tensor product gives:\n` +
            `|+⟩|−⟩ = (1/2)(|00⟩ − |01⟩ + |10⟩ − |11⟩) = (0.5, −0.5, 0.5, −0.5)`,
          workedExample: {
            problem: 'Compute H|0⟩ ⊗ H|1⟩ as a 4-vector.',
            steps: [
              'H|0⟩ = (0.71, 0.71), H|1⟩ = (0.71, −0.71)',
              'Tensor product: (0.71×0.71, 0.71×(−0.71), 0.71×0.71, 0.71×(−0.71))',
              '= (0.5, −0.5, 0.5, −0.5)',
            ],
            insight: `H⊗H creates the uniform superposition that lets the oracle act on all inputs simultaneously.`,
          },
          tryIt: {
            question: `The DJ circuit starts with |01⟩. After H⊗H, what is the 4-vector state?\nBasis: |00⟩,|01⟩,|10⟩,|11⟩. Round to 0.01.`,
            answer: [h, -h, h, -h],
            answerType: 'vector4',
            answerDisplay: '(0.5, -0.5, 0.5, -0.5)',
            steps: [
              'H|0⟩ = (0.71, 0.71), H|1⟩ = (0.71, −0.71)',
              'H|0⟩ ⊗ H|1⟩ = (0.5, −0.5, 0.5, −0.5)',
            ],
            whyItMatters:
              `This superposition state is the key to quantum parallelism — the oracle ` +
              `will evaluate f on both inputs simultaneously.`,
          },
        };
      }

      case 'after_oracle': {
        const doConstFirst = Math.random() > 0.5;
        const wName = doConstFirst ? 'f(x)=0 (identity)' : 'f(x)=x (CNOT)';
        const wVec = doConstFirst ? [h, -h, h, -h] : [h, -h, -h, h];
        const wExplain = doConstFirst
          ? 'f(x)=0 oracle is identity — state unchanged: (0.5, -0.5, 0.5, -0.5)'
          : 'CNOT swaps |10⟩↔|11⟩ coefficients: (0.5, -0.5, -0.5, 0.5)';
        const pName = doConstFirst ? 'f(x)=x (CNOT)' : 'f(x)=0 (identity)';
        const pVec = doConstFirst ? [h, -h, -h, h] : [h, -h, h, -h];
        const pExplain = doConstFirst
          ? 'CNOT: |10⟩→|11⟩ and |11⟩→|10⟩, so swap those coefficients.'
          : 'Identity oracle: state unchanged.';

        return {
          teachingText:
            `After H⊗H the state is (0.5, −0.5, 0.5, −0.5). Now the oracle U_f acts:\n\n` +
            `• Constant f(x)=0 (identity): no change → (0.5, −0.5, 0.5, −0.5)\n` +
            `• Balanced f(x)=x (CNOT): swaps |10⟩ and |11⟩ amplitudes → (0.5, −0.5, −0.5, 0.5)\n\n` +
            `The CNOT maps |10⟩→|11⟩ and |11⟩→|10⟩, which swaps the last two components' coefficients.`,
          workedExample: {
            problem: `After H⊗H, apply the oracle for ${wName}. What is the state?`,
            steps: [
              'After H⊗H: (0.5, -0.5, 0.5, -0.5)',
              wExplain,
              `Result: (${wVec.join(', ')})`,
            ],
            insight: `The oracle imprints information about f into the phase pattern of the state.`,
          },
          tryIt: {
            question: `After H⊗H on |01⟩, apply the oracle for ${pName}. What is the 4-vector?\nBasis: |00⟩,|01⟩,|10⟩,|11⟩.`,
            answer: pVec,
            answerType: 'vector4',
            answerDisplay: `(${pVec.join(', ')})`,
            steps: [
              'After H⊗H: (0.5, -0.5, 0.5, -0.5)',
              pExplain,
              `Result: (${pVec.join(', ')})`,
            ],
            whyItMatters:
              `The oracle creates different amplitude patterns for constant and balanced functions. ` +
              `The final Hadamard will convert these patterns into distinguishable measurement outcomes.`,
          },
        };
      }

      case 'constant_trace': {
        return {
          teachingText:
            `Let us trace the full DJ circuit with a constant oracle f(x) = 0:\n\n` +
            `1. Start: |01⟩ = (0, 1, 0, 0)\n` +
            `2. H⊗H: (0.5, −0.5, 0.5, −0.5)\n` +
            `3. Oracle (identity): (0.5, −0.5, 0.5, −0.5)\n` +
            `4. H⊗I: Apply H to first qubit only.\n\n` +
            `For H⊗I, group by first qubit:\n` +
            `|0x⟩ terms: coeffs (0.5, −0.5). H|0⟩ = (|0⟩+|1⟩)/√2\n` +
            `|1x⟩ terms: coeffs (0.5, −0.5). H|1⟩ = (|0⟩−|1⟩)/√2\n` +
            `|00⟩: 0.5×0.71 + 0.5×0.71 = 0.71\n` +
            `|01⟩: −0.5×0.71 + (−0.5)×0.71 = −0.71\n` +
            `|10⟩: 0.5×0.71 − 0.5×0.71 = 0\n` +
            `|11⟩: −0.5×0.71 − (−0.5)×0.71 = 0\n` +
            `Final: (0.71, −0.71, 0, 0) = |0⟩|−⟩\n` +
            `Measure first qubit → 0 → f is constant!`,
          workedExample: {
            problem: 'Trace DJ with constant oracle f(x)=0. What is the final 4-vector?',
            steps: [
              '|01⟩ → H⊗H → (0.5, -0.5, 0.5, -0.5)',
              'Identity oracle: unchanged.',
              'H⊗I: |00⟩=0.71, |01⟩=−0.71, |10⟩=0, |11⟩=0',
              'Final: (0.71, -0.71, 0, 0)',
            ],
            insight: `When f is constant, the |0⟩ and |1⟩ components of the first qubit interfere constructively at |0⟩.`,
          },
          tryIt: {
            question: `Trace the full DJ circuit: |01⟩ → H⊗H → identity oracle (f=0) → H⊗I.\nGive the final 4-vector. Round to 0.01.`,
            answer: [s, -s, 0, 0],
            answerType: 'vector4',
            answerDisplay: '(0.71, -0.71, 0, 0)',
            steps: [
              '|01⟩ → H⊗H → (0.5, -0.5, 0.5, -0.5)',
              'Identity: unchanged.',
              'H⊗I: (0.71, -0.71, 0, 0) → first qubit is |0⟩ → constant.',
            ],
            whyItMatters:
              `The measurement outcome |0⟩ on the first qubit deterministically tells us f is constant. ` +
              `No classical algorithm can do this in one query.`,
          },
        };
      }

      case 'balanced_trace': {
        return {
          teachingText:
            `Now trace the DJ circuit with a balanced oracle f(x) = x (CNOT):\n\n` +
            `1. Start: |01⟩ = (0, 1, 0, 0)\n` +
            `2. H⊗H: (0.5, −0.5, 0.5, −0.5)\n` +
            `3. CNOT oracle: |10⟩↔|11⟩ swap → (0.5, −0.5, −0.5, 0.5)\n` +
            `4. H⊗I:\n` +
            `|00⟩: 0.5×0.71 + (−0.5)×0.71 = 0\n` +
            `|01⟩: (−0.5)×0.71 + 0.5×0.71 = 0\n` +
            `|10⟩: 0.5×0.71 − (−0.5)×0.71 = 0.71\n` +
            `|11⟩: (−0.5)×0.71 − 0.5×0.71 = −0.71\n` +
            `Final: (0, 0, 0.71, −0.71) = |1⟩|−⟩\n` +
            `Measure first qubit → 1 → f is balanced!`,
          workedExample: {
            problem: 'Trace DJ with balanced oracle f(x)=x (CNOT). What is the final 4-vector?',
            steps: [
              '|01⟩ → H⊗H → (0.5, -0.5, 0.5, -0.5)',
              'CNOT: swap |10⟩↔|11⟩ → (0.5, -0.5, -0.5, 0.5)',
              'H⊗I: |00⟩=0, |01⟩=0, |10⟩=0.71, |11⟩=−0.71',
              'Final: (0, 0, 0.71, -0.71)',
            ],
            insight: `When f is balanced, the phases cause destructive interference at |0⟩ and constructive at |1⟩.`,
          },
          tryIt: {
            question: `Trace the full DJ circuit: |01⟩ → H⊗H → CNOT (f(x)=x) → H⊗I.\nGive the final 4-vector. Round to 0.01.`,
            answer: [0, 0, s, -s],
            answerType: 'vector4',
            answerDisplay: '(0, 0, 0.71, -0.71)',
            steps: [
              '|01⟩ → H⊗H → (0.5, -0.5, 0.5, -0.5)',
              'CNOT: (0.5, -0.5, -0.5, 0.5)',
              'H⊗I: (0, 0, 0.71, -0.71) → first qubit is |1⟩ → balanced.',
            ],
            whyItMatters:
              `Measuring |1⟩ on the first qubit deterministically identifies f as balanced. ` +
              `This is the heart of the Deutsch-Jozsa algorithm.`,
          },
        };
      }

      default: return null;
    }
  },
},

phase_kickback: {
  generate(difficulty, variation) {
    const items = {
      basic: {
        q: 'When U_f acts on |x⟩|−⟩, the result is (−1)^f(x)|x⟩|−⟩. What is this phenomenon called?',
        choices: ['Quantum tunneling', 'Phase kickback', 'Entanglement swapping', 'Decoherence'],
        answer: 'B', display: 'B) Phase kickback',
        steps: [
          'U_f|x⟩|−⟩ = (−1)^f(x)|x⟩|−⟩.',
          'The phase "kicks back" from the ancilla onto the input.',
          'This is called phase kickback.',
        ],
      },
      constant_phase: {
        q: 'If f is constant with f(x)=0 for all x, what is U_f|+⟩|−⟩?',
        choices: ['|+⟩|−⟩', '−|+⟩|−⟩', '|−⟩|−⟩', '|+⟩|+⟩'],
        answer: 'A', display: 'A) |+⟩|−⟩',
        steps: [
          'f(x)=0 for all x, so (−1)^f(x) = +1.',
          'U_f|+⟩|−⟩ = |+⟩|−⟩ — no phase change.',
        ],
      },
      balanced_phase: {
        q: 'If f(x)=x (balanced), what is U_f|+⟩|−⟩?',
        choices: ['|+⟩|−⟩', '|−⟩|−⟩', '−|+⟩|−⟩', '|1⟩|−⟩'],
        answer: 'B', display: 'B) |−⟩|−⟩',
        steps: [
          '|+⟩ = (|0⟩+|1⟩)/√2.',
          'U_f|0⟩|−⟩ = (−1)^0|0⟩|−⟩ = |0⟩|−⟩',
          'U_f|1⟩|−⟩ = (−1)^1|1⟩|−⟩ = −|1⟩|−⟩',
          'Result: (|0⟩−|1⟩)/√2 ⊗ |−⟩ = |−⟩|−⟩',
        ],
      },
      interference: {
        q: 'After phase kickback, applying H to the input causes interference. For a balanced function, this is:',
        choices: ['Constructive — amplifies |0⟩', 'Destructive — cancels |0⟩, amplifies |1⟩', 'No interference occurs', 'Random — depends on measurement'],
        answer: 'B', display: 'B) Destructive — cancels |0⟩, amplifies |1⟩',
        steps: [
          'For f(x)=x, after kickback: input is |−⟩.',
          'H|−⟩ = |1⟩. Destructive interference cancels |0⟩.',
        ],
      },
    };

    const varMap = {
      basic: ['basic', 'constant_phase'],
      constant_phase: ['constant_phase', 'balanced_phase'],
      balanced_phase: ['balanced_phase', 'constant_phase'],
      interference: ['interference', 'balanced_phase'],
    };
    const [wKey, pKey] = varMap[variation] || varMap['basic'];
    const w = items[wKey], p = items[pKey];

    const teachingMap = {
      basic:
        `Phase kickback is the key trick behind Deutsch-Jozsa (and many other quantum algorithms).\n\n` +
        `When the ancilla is in state |−⟩ = (|0⟩−|1⟩)/√2, applying U_f gives:\n` +
        `U_f|x⟩|−⟩ = |x⟩(|f(x)⊕0⟩ − |f(x)⊕1⟩)/√2\n\n` +
        `If f(x)=0: result is |x⟩(|0⟩−|1⟩)/√2 = (+1)|x⟩|−⟩\n` +
        `If f(x)=1: result is |x⟩(|1⟩−|0⟩)/√2 = (−1)|x⟩|−⟩\n\n` +
        `The ancilla stays as |−⟩, but a phase of (−1)^f(x) appears on the input register. ` +
        `The function's output has been encoded as a phase!`,
      constant_phase:
        `For a constant function (say f(x)=0), every input gets phase (+1). ` +
        `So U_f|+⟩|−⟩ = |+⟩|−⟩ — the input state is unchanged.\n\n` +
        `For f(x)=1 (also constant), every input gets phase (−1): ` +
        `U_f|+⟩|−⟩ = −|+⟩|−⟩. This global phase is undetectable, ` +
        `so the input state is effectively unchanged.`,
      balanced_phase:
        `For a balanced function like f(x)=x:\n` +
        `U_f|0⟩|−⟩ = (+1)|0⟩|−⟩ (since f(0)=0)\n` +
        `U_f|1⟩|−⟩ = (−1)|1⟩|−⟩ (since f(1)=1)\n\n` +
        `Applied to |+⟩ = (|0⟩+|1⟩)/√2:\n` +
        `U_f|+⟩|−⟩ = (|0⟩−|1⟩)/√2 ⊗ |−⟩ = |−⟩|−⟩\n\n` +
        `The balanced function flips |+⟩ to |−⟩!`,
      interference:
        `The final step of Deutsch-Jozsa is applying H to the input qubit:\n\n` +
        `• Constant: input is |+⟩ → H|+⟩ = |0⟩ (constructive at |0⟩)\n` +
        `• Balanced: input is |−⟩ → H|−⟩ = |1⟩ (destructive at |0⟩, constructive at |1⟩)\n\n` +
        `Interference converts the phase difference into a measurement difference. ` +
        `Measure |0⟩ = constant, measure |1⟩ = balanced. One query, certain answer.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['basic'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps, `Answer: ${w.display}`],
        insight: `Phase kickback converts function evaluation into a relative phase — the ancilla is unchanged but the input register picks up (−1)^f(x).`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `Phase kickback is not unique to Deutsch-Jozsa — it is the central trick in ` +
          `Grover's search, Shor's factoring, quantum phase estimation, and most quantum algorithms. ` +
          `Mastering it here prepares you for everything that follows.`,
      },
    };
  },
},

dj_generalize: {
  generate(difficulty, variation) {
    switch (variation) {

      case 'classical_cost': {
        const nVals = [2, 3, 4, 5];
        const wN = nVals[randInt(0, nVals.length - 1)];
        const wCost = Math.pow(2, wN - 1) + 1;
        let pN;
        do { pN = nVals[randInt(0, nVals.length - 1)]; } while (pN === wN);
        const pCost = Math.pow(2, pN - 1) + 1;
        return {
          teachingText:
            `For an n-bit function f: {0,1}^n → {0,1}, a classical computer must query f enough ` +
            `times to distinguish constant from balanced.\n\n` +
            `Worst case: the first 2^(n−1) queries could all return the same value (this is ` +
            `consistent with both constant and balanced). One more query settles it.\n\n` +
            `Classical worst case = 2^(n−1) + 1 queries.\n` +
            `For n=3: 2^2 + 1 = 5. For n=10: 2^9 + 1 = 513.`,
          workedExample: {
            problem: `For n=${wN}, how many classical queries in the worst case?`,
            steps: [
              `Worst case: 2^(n−1) + 1 = 2^(${wN}−1) + 1`,
              `= 2^${wN-1} + 1 = ${wCost}`,
            ],
            insight: `The worst case grows exponentially with n — this is exactly the gap that Deutsch-Jozsa exploits.`,
          },
          tryIt: {
            question: `For an n=${pN} bit function, what is the worst-case number of classical queries to determine constant vs balanced?`,
            answer: pCost,
            answerType: 'numeric',
            answerDisplay: String(pCost),
            steps: [
              `2^(${pN}−1) + 1 = 2^${pN-1} + 1 = ${pCost}`,
            ],
            whyItMatters:
              `The exponential classical cost is what makes Deutsch-Jozsa remarkable — ` +
              `quantum mechanics reduces this to a single query for any n.`,
          },
        };
      }

      case 'quantum_cost': {
        const nVals = [2, 5, 10, 100];
        const wN = nVals[randInt(0, nVals.length - 1)];
        let pN;
        do { pN = nVals[randInt(0, nVals.length - 1)]; } while (pN === wN);
        return {
          teachingText:
            `The Deutsch-Jozsa algorithm uses exactly 1 oracle query, regardless of n.\n\n` +
            `The algorithm:\n` +
            `1. Prepare n input qubits as |0⟩^⊗n and 1 ancilla as |1⟩\n` +
            `2. Apply H to all qubits → uniform superposition\n` +
            `3. Apply oracle U_f once\n` +
            `4. Apply H^⊗n to input qubits\n` +
            `5. Measure input qubits\n\n` +
            `If all zeros → constant. If any non-zero → balanced.\n` +
            `One query. Deterministic. Works for any n.`,
          workedExample: {
            problem: `For n=${wN}, how many quantum queries?`,
            steps: [
              `Deutsch-Jozsa always uses exactly 1 query.`,
              `Classical would need up to ${Math.pow(2, wN - 1) + 1} queries.`,
            ],
            insight: `The quantum speedup is exponential: from O(2^n) classical queries to O(1) quantum.`,
          },
          tryIt: {
            question: `For n=${pN}, how many queries does Deutsch-Jozsa need?`,
            answer: 1,
            answerType: 'numeric',
            answerDisplay: '1',
            steps: [
              `Always 1, regardless of n.`,
              `Classical for n=${pN}: up to ${Math.pow(2, pN - 1) + 1} queries.`,
            ],
            whyItMatters:
              `This constant-vs-exponential gap was the first proof that quantum computers ` +
              `can be exponentially faster than classical ones for certain problems.`,
          },
        };
      }

      case 'speedup_factor': {
        const wItems = {
          q: 'What type of speedup does Deutsch-Jozsa achieve?',
          choices: ['Constant', 'Polynomial', 'Exponential', 'Logarithmic'],
          answer: 'C', display: 'C) Exponential',
          steps: [
            'Classical: O(2^n) queries. Quantum: O(1).',
            'Speedup from 2^n to 1 is exponential.',
          ],
        };
        const pItems = {
          q: 'The Deutsch-Jozsa algorithm achieves what type of speedup over classical computation?',
          choices: ['Constant', 'Polynomial', 'Exponential', 'Logarithmic'],
          answer: 'C', display: 'C) Exponential',
          steps: [
            'Classical: O(2^(n−1)+1) queries.',
            'Quantum: 1 query.',
            'The speedup is exponential.',
          ],
        };
        return {
          teachingText:
            `Deutsch-Jozsa demonstrates an exponential quantum speedup:\n\n` +
            `• Classical: O(2^(n−1) + 1) = O(2^n) queries\n` +
            `• Quantum: O(1) — exactly 1 query\n\n` +
            `This was historically the first quantum algorithm to show an exponential advantage ` +
            `(Deutsch 1985 for n=1, Deutsch & Jozsa 1992 for general n).\n\n` +
            `Note: Deutsch-Jozsa solves a promise problem (f is guaranteed to be constant OR balanced). ` +
            `The practical significance is mainly pedagogical, but the techniques (phase kickback, ` +
            `interference) are used in all major quantum algorithms.`,
          workedExample: {
            problem: wItems.q,
            steps: [...wItems.steps, `Answer: ${wItems.display}`],
            insight: `Deutsch-Jozsa was the spark that ignited the field of quantum computing.`,
          },
          tryIt: {
            question: pItems.q,
            choices: pItems.choices,
            answer: pItems.answer,
            answerType: 'choice',
            answerDisplay: pItems.display,
            steps: pItems.steps,
            whyItMatters:
              `While Deutsch-Jozsa itself has limited practical use, the exponential speedup ` +
              `it demonstrates inspired the search for more practical quantum algorithms like ` +
              `Shor's (factoring) and Grover's (search).`,
          },
        };
      }

      default: return null;
    }
  },
},

// ── Chapter 17: Grover's Search Algorithm ────────────────────────────────────

grover_problem: {
  generate(difficulty, variation) {
    const teachingMap = {
      classical_cost:
        `Imagine searching an unsorted phone book for a specific name. Classically, ` +
        `you have no choice but to check entries one by one. On average, you will check ` +
        `half the entries before finding the one you want.\n\n` +
        `For a database of N items, classical search takes O(N) time — on average N/2 lookups. ` +
        `This is the best any classical algorithm can do on unsorted data.`,
      quantum_cost:
        `Grover's algorithm (1996) searches an unsorted database of N items in only O(√N) steps ` +
        `— a quadratic speedup over classical search.\n\n` +
        `The key idea: start in an equal superposition of all items, then repeatedly apply two ` +
        `operations — the oracle (marks the target) and the diffusion operator (amplifies the ` +
        `marked item). After about (π/4)√N iterations, measuring gives the target with high probability.`,
      speedup:
        `The speedup from Grover's algorithm is quadratic: O(√N) vs O(N).\n\n` +
        `For a million items: classical needs ~500,000 lookups, Grover needs ~785 iterations. ` +
        `The speedup factor is roughly √N/2 — impressive, but not exponential. Still, for ` +
        `large databases this is enormously valuable.`,
    };

    switch (variation) {

      case 'classical_cost': {
        const wN = [8, 16, 32][randInt(0, 2)];
        const wAns = wN / 2;
        let pN;
        do { pN = [8, 16, 32, 64][randInt(0, 3)]; } while (pN === wN);
        const pAns = pN / 2;
        return {
          teachingText: teachingMap.classical_cost,
          workedExample: {
            problem: `Database of ${wN} items. Average classical lookups?`,
            steps: [
              `Classical search checks one item at a time.`,
              `Average: ${wN}/2 = ${wAns} lookups.`,
            ],
            insight: `Classical search is O(N) — there is no shortcut without structure in the data.`,
          },
          tryIt: {
            question: `A database has ${pN} items. On average, how many lookups does a classical search need to find one marked item?`,
            answer: pAns,
            answerType: 'numeric',
            answerDisplay: `${pAns}`,
            steps: [
              `Classical search checks items one by one.`,
              `Average: ${pN}/2 = ${pAns} lookups.`,
            ],
            whyItMatters:
              `Understanding the classical baseline is essential — Grover's speedup is only ` +
              `meaningful relative to this O(N) cost. Quadratic speedup matters most when N is large.`,
          },
        };
      }

      case 'quantum_cost': {
        const wN = 16, wSqrt = 4, wIters = 3;
        const pCases = [{ N: 64, sqrt: 8, iters: 6 }, { N: 256, sqrt: 16, iters: 13 }];
        const p = pCases[randInt(0, pCases.length - 1)];
        return {
          teachingText: teachingMap.quantum_cost,
          workedExample: {
            problem: `Database of ${wN} items. How many Grover iterations?`,
            steps: [
              `√${wN} = ${wSqrt}`,
              `Iterations ≈ (π/4) × ${wSqrt} = ${(Math.PI/4*wSqrt).toFixed(2)} ≈ ${wIters}`,
            ],
            insight: `The formula (π/4)√N gives the optimal number of iterations — too few or too many reduces success probability.`,
          },
          tryIt: {
            question: `A database has ${p.N} items. Approximately how many Grover iterations are needed? (Round to nearest integer.)`,
            answer: p.iters,
            answerType: 'numeric',
            answerDisplay: `${p.iters}`,
            steps: [
              `√${p.N} = ${p.sqrt}`,
              `Iterations ≈ (π/4) × ${p.sqrt} = ${(Math.PI/4*p.sqrt).toFixed(2)} ≈ ${p.iters}`,
            ],
            whyItMatters:
              `Grover's O(√N) scaling means that doubling the database size only increases ` +
              `the search time by a factor of √2 ≈ 1.41. This is the power of quantum parallelism.`,
          },
        };
      }

      case 'speedup': {
        const wN = 1000000, wClass = 500000, wQuant = Math.round(Math.PI/4*1000), wSpeed = Math.round(wClass/wQuant);
        const pCases = [
          { exp: 4, N: 10000, classical: 5000, quantum: Math.round(Math.PI/4*100) },
          { exp: 8, N: 100000000, classical: 50000000, quantum: Math.round(Math.PI/4*10000) },
        ];
        const p = pCases[randInt(0, pCases.length - 1)];
        const pSpeed = Math.round(p.classical / p.quantum);
        return {
          teachingText: teachingMap.speedup,
          workedExample: {
            problem: `N = 10^6. Classical: ${wClass.toLocaleString()}. Grover: ~${wQuant.toLocaleString()}. Speedup?`,
            steps: [
              `Speedup = ${wClass.toLocaleString()} / ${wQuant.toLocaleString()} ≈ ${wSpeed}`,
            ],
            insight: `The speedup grows as √N — large but not exponential.`,
          },
          tryIt: {
            question: `A database has 10^${p.exp} = ${p.N.toLocaleString()} items. Classical: ~${p.classical.toLocaleString()} lookups. Grover: ~${p.quantum.toLocaleString()} iterations. What is the approximate speedup factor? (Round to nearest integer.)`,
            answer: pSpeed,
            answerType: 'numeric',
            answerDisplay: `${pSpeed}`,
            steps: [
              `Speedup = ${p.classical.toLocaleString()} / ${p.quantum.toLocaleString()} ≈ ${pSpeed}`,
            ],
            whyItMatters:
              `Even a quadratic speedup is transformative at scale. For cryptography, Grover's ` +
              `algorithm effectively halves the key length — a 256-bit key provides only 128-bit ` +
              `security against a quantum adversary.`,
          },
        };
      }

      default: return null;
    }
  },
},

grover_oracle: {
  generate(difficulty, variation) {
    const labels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];

    const teachingMap = {
      basic_2qubit:
        `The oracle is a black box that "knows" the answer. Given an equal superposition ` +
        `of all items, the oracle flips the sign (phase) of the marked item's amplitude.\n\n` +
        `For 2 qubits (N = 4 items), the equal superposition is:\n` +
        `|s⟩ = ½|00⟩ + ½|01⟩ + ½|10⟩ + ½|11⟩ = (0.5, 0.5, 0.5, 0.5)\n\n` +
        `If the marked item is |11⟩, the oracle produces:\n` +
        `(0.5, 0.5, 0.5, −0.5)\n\n` +
        `Only the sign changes — the magnitude stays the same. This is a phase flip.`,
      mark_specific:
        `The oracle can mark any item, not just |11⟩. The operation is the same: ` +
        `flip the sign of the marked item's amplitude, leave everything else unchanged.\n\n` +
        `Mathematically, the oracle applies: O|x⟩ = (−1)^f(x)|x⟩ where f(x) = 1 for ` +
        `the marked item and 0 for all others.`,
      phase_flip_only:
        `A crucial property of the oracle: it only changes the phase (sign), not the ` +
        `probability. Before the oracle, each item has probability |0.5|² = 0.25. After ` +
        `the oracle, the marked item has amplitude −0.5, but probability |−0.5|² = 0.25 — ` +
        `unchanged!\n\n` +
        `The phase flip is invisible to measurement. It only becomes useful when combined ` +
        `with the diffusion operator, which converts the phase difference into an amplitude difference.`,
    };

    function makeOracleProblem(markedIdx) {
      const ans = [0.5, 0.5, 0.5, 0.5];
      ans[markedIdx] = -0.5;
      return {
        question: `Equal superposition: (0.5, 0.5, 0.5, 0.5) for ${labels.join(', ')}.\nThe oracle marks ${labels[markedIdx]}. What is the state after the oracle? (4-vector)`,
        answer: ans,
        answerDisplay: `(${ans.join(', ')})`,
        steps: [
          `Oracle flips the sign of the marked item's amplitude.`,
          `${labels[markedIdx]} at index ${markedIdx}: 0.5 → −0.5`,
          `Result: (${ans.join(', ')})`,
        ],
      };
    }

    switch (variation) {

      case 'basic_2qubit':
      case 'basic': {
        const w = makeOracleProblem(3);
        let pIdx;
        do { pIdx = randInt(0, 3); } while (pIdx === 3);
        const p = makeOracleProblem(pIdx);
        return {
          teachingText: teachingMap.basic_2qubit,
          workedExample: {
            problem: w.question,
            steps: w.steps,
            insight: `The oracle is the only part of Grover's algorithm that "knows" the answer. Everything else is generic.`,
          },
          tryIt: {
            question: p.question,
            answer: p.answer,
            answerType: 'vector4',
            answerDisplay: p.answerDisplay,
            steps: p.steps,
            whyItMatters:
              `The oracle encodes the search problem. In a real quantum computer, designing efficient ` +
              `oracles is one of the main challenges of applying Grover's algorithm.`,
          },
        };
      }

      case 'mark_specific': {
        const wIdx = randInt(0, 2);
        const w = makeOracleProblem(wIdx);
        let pIdx;
        do { pIdx = randInt(0, 3); } while (pIdx === wIdx);
        const p = makeOracleProblem(pIdx);
        return {
          teachingText: teachingMap.mark_specific,
          workedExample: {
            problem: w.question,
            steps: w.steps,
            insight: `The oracle can mark any item — the rest of Grover's algorithm does not need to know which one.`,
          },
          tryIt: {
            question: p.question,
            answer: p.answer,
            answerType: 'vector4',
            answerDisplay: p.answerDisplay,
            steps: p.steps,
            whyItMatters:
              `This generality is what makes Grover's algorithm universal — it works for any ` +
              `search problem that can be expressed as an oracle.`,
          },
        };
      }

      case 'phase_flip_only': {
        const wIdx = randInt(0, 3);
        const w = makeOracleProblem(wIdx);
        let pIdx;
        do { pIdx = randInt(0, 3); } while (pIdx === wIdx);
        const p = makeOracleProblem(pIdx);
        return {
          teachingText: teachingMap.phase_flip_only,
          workedExample: {
            problem: w.question,
            steps: w.steps,
            insight: `Phase is hidden from measurement — only interference can reveal it.`,
          },
          tryIt: {
            question: p.question,
            answer: p.answer,
            answerType: 'vector4',
            answerDisplay: p.answerDisplay,
            steps: p.steps,
            whyItMatters:
              `This is a deep quantum principle: phase information is invisible to direct measurement ` +
              `but can be extracted through interference. Grover's diffusion operator does exactly this.`,
          },
        };
      }

      default: return null;
    }
  },
},

grover_diffusion: {
  generate(difficulty, variation) {
    const labels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];

    const teachingMap = {
      compute_mean:
        `After the oracle flips the phase of the marked item, the diffusion operator ` +
        `amplifies the marked item by reflecting all amplitudes about their mean.\n\n` +
        `Step 1: Compute the mean of all amplitudes.\n` +
        `Step 2: Reflect each amplitude about the mean: new[i] = 2 × mean − old[i].\n\n` +
        `This "inversion about the mean" is the heart of Grover's algorithm. Items below ` +
        `the mean get boosted; items above get reduced.`,
      reflect_about_mean:
        `The reflection formula is: new amplitude = 2 × mean − old amplitude.\n\n` +
        `After the oracle, the marked item has a negative amplitude (below the mean), ` +
        `so reflection pushes it above the mean. The unmarked items have positive amplitudes ` +
        `(above the mean), so reflection pushes them below.\n\n` +
        `Each iteration, the marked item's amplitude grows while the others shrink.`,
      after_one_iteration:
        `One complete Grover iteration = oracle + diffusion.\n\n` +
        `For N = 4 (2 qubits), start with (0.5, 0.5, 0.5, 0.5):\n` +
        `1. Oracle marks one item: e.g. (0.5, 0.5, 0.5, −0.5)\n` +
        `2. Mean = (0.5 + 0.5 + 0.5 − 0.5)/4 = 0.25\n` +
        `3. Diffusion: unmarked → 2(0.25) − 0.5 = 0, marked → 2(0.25) + 0.5 = 1\n` +
        `4. Result: (0, 0, 0, 1) — found with certainty!\n\n` +
        `N = 4 is special: one iteration suffices.`,
      amplitude_growth:
        `The marked item's amplitude grows with each iteration. Starting at 1/√N, ` +
        `it increases by roughly 2/√N per iteration (for large N).\n\n` +
        `For N = 4: amplitude starts at 0.5, and after 1 iteration reaches 1.0. ` +
        `This is the maximum — further iterations would reduce it (the algorithm "overshoots").`,
    };

    switch (variation) {

      case 'compute_mean': {
        const wIdx = 3;
        const wAmps = [0.5, 0.5, 0.5, -0.5];
        const wMean = r2((wAmps[0]+wAmps[1]+wAmps[2]+wAmps[3])/4);
        let pIdx;
        do { pIdx = randInt(0, 3); } while (pIdx === wIdx);
        const pAmps = [0.5, 0.5, 0.5, 0.5];
        pAmps[pIdx] = -0.5;
        const pMean = r2((pAmps[0]+pAmps[1]+pAmps[2]+pAmps[3])/4);
        return {
          teachingText: teachingMap.compute_mean,
          workedExample: {
            problem: `Amplitudes after oracle: (${wAmps.join(', ')}). Mean?`,
            steps: [
              `Mean = (${wAmps.join(' + ')})/4`,
              `= ${r2(wAmps[0]+wAmps[1]+wAmps[2]+wAmps[3])}/4 = ${wMean}`,
            ],
            insight: `The mean tells us the "center" that the diffusion operator reflects about.`,
          },
          tryIt: {
            question: `After the oracle, the amplitudes are (${pAmps.join(', ')}). What is the mean of these amplitudes?`,
            answer: pMean,
            answerType: 'numeric',
            answerDisplay: `${pMean}`,
            steps: [
              `Mean = (${pAmps.join(' + ')})/4`,
              `= ${r2(pAmps[0]+pAmps[1]+pAmps[2]+pAmps[3])}/4 = ${pMean}`,
            ],
            whyItMatters:
              `Computing the mean is the first step of the diffusion operator. The marked item's ` +
              `negative amplitude pulls the mean down, setting up the reflection that will amplify it.`,
          },
        };
      }

      case 'reflect_about_mean': {
        const wAmps = [0.5, 0.5, 0.5, -0.5];
        const wMean = 0.25;
        const wNew = r2(2*wMean - (-0.5));
        let pIdx = randInt(0, 2);
        const pAmps = [0.5, 0.5, 0.5, 0.5];
        pAmps[pIdx] = -0.5;
        const pMean = r2((pAmps[0]+pAmps[1]+pAmps[2]+pAmps[3])/4);
        const pOld = -0.5;
        const pNew = r2(2*pMean - pOld);
        return {
          teachingText: teachingMap.reflect_about_mean,
          workedExample: {
            problem: `Mean = ${wMean}. Marked amplitude = −0.5. Reflect: 2 × ${wMean} − (−0.5) = ?`,
            steps: [
              `new = 2 × ${wMean} − (−0.5)`,
              `= ${r2(2*wMean)} + 0.5 = ${wNew}`,
            ],
            insight: `The marked item jumps from −0.5 to +1.0 in one reflection (for N=4).`,
          },
          tryIt: {
            question: `The mean amplitude is ${pMean}. The marked item's amplitude is ${pOld}. After reflection (2 × mean − amplitude), what is the new amplitude?`,
            answer: pNew,
            answerType: 'numeric',
            answerDisplay: `${pNew}`,
            steps: [
              `new = 2 × ${pMean} − (${pOld})`,
              `= ${r2(2*pMean)} − (${pOld})`,
              `= ${pNew}`,
            ],
            whyItMatters:
              `Reflection about the mean is the mathematical mechanism behind amplitude amplification. ` +
              `It is used not just in Grover's algorithm but in many other quantum algorithms.`,
          },
        };
      }

      case 'after_one_iteration': {
        const wIdx = 3;
        const wAfterOracle = [0.5, 0.5, 0.5, -0.5];
        const wMean = 0.25;
        const wResult = [0, 0, 0, 1];
        let pIdx;
        do { pIdx = randInt(0, 3); } while (pIdx === wIdx);
        const pAfterOracle = [0.5, 0.5, 0.5, 0.5];
        pAfterOracle[pIdx] = -0.5;
        const pMean = r2((pAfterOracle[0]+pAfterOracle[1]+pAfterOracle[2]+pAfterOracle[3])/4);
        const pResult = pAfterOracle.map(a => r2(2*pMean - a));
        return {
          teachingText: teachingMap.after_one_iteration,
          workedExample: {
            problem: `Oracle marks ${labels[wIdx]}. Start: (0.5, 0.5, 0.5, 0.5). Full iteration?`,
            steps: [
              `After oracle: (${wAfterOracle.join(', ')})`,
              `Mean = ${wMean}`,
              `Diffusion: each new[i] = 2 × ${wMean} − old[i]`,
              `Unmarked: 2(${wMean}) − 0.5 = 0`,
              `Marked: 2(${wMean}) − (−0.5) = 1`,
              `Result: (${wResult.join(', ')})`,
            ],
            insight: `For N = 4, one iteration gives 100% probability — a perfect search.`,
          },
          tryIt: {
            question: `2-qubit Grover: start (0.5, 0.5, 0.5, 0.5), oracle marks ${labels[pIdx]}. After one full iteration (oracle + diffusion), what is the state? (4-vector)`,
            answer: pResult,
            answerType: 'vector4',
            answerDisplay: `(${pResult.join(', ')})`,
            steps: [
              `After oracle: (${pAfterOracle.join(', ')})`,
              `Mean = ${pMean}`,
              `Unmarked: 2(${pMean}) − 0.5 = ${r2(2*pMean - 0.5)}`,
              `Marked: 2(${pMean}) − (−0.5) = ${r2(2*pMean + 0.5)}`,
              `Result: (${pResult.join(', ')})`,
            ],
            whyItMatters:
              `One iteration on N = 4 demonstrates the full power of Grover's algorithm in miniature. ` +
              `For larger N, you need more iterations but the principle is the same.`,
          },
        };
      }

      case 'amplitude_growth': {
        return {
          teachingText: teachingMap.amplitude_growth,
          workedExample: {
            problem: `N = 4. Marked amplitude starts at 0.5. After oracle: −0.5. Mean = 0.25. After diffusion?`,
            steps: [
              `new = 2 × 0.25 − (−0.5) = 0.5 + 0.5 = 1`,
              `Amplitude grew from 0.5 to 1.0 in one iteration.`,
            ],
            insight: `For N = 4, one iteration is optimal. More iterations would reduce the amplitude.`,
          },
          tryIt: {
            question: `In a 2-qubit system (N=4), the marked item starts with amplitude 0.5. After one full Grover iteration, what is the marked item's amplitude?`,
            answer: 1,
            answerType: 'numeric',
            answerDisplay: '1',
            steps: [
              `After oracle: marked amplitude = −0.5`,
              `Mean = (0.5 + 0.5 + 0.5 + (−0.5))/4 = 0.25`,
              `Diffusion: 2 × 0.25 − (−0.5) = 1`,
            ],
            whyItMatters:
              `Amplitude amplification is a general quantum technique. Grover's algorithm is just ` +
              `one application — the same principle speeds up many quantum algorithms.`,
          },
        };
      }

      default: return null;
    }
  },
},

grover_full: {
  generate(difficulty, variation) {
    const teachingMap = {
      two_qubit:
        `Let us trace the full Grover algorithm on the smallest interesting case: N = 4 (2 qubits).\n\n` +
        `1. Start in equal superposition: (0.5, 0.5, 0.5, 0.5)\n` +
        `2. Oracle marks one item (flips its sign)\n` +
        `3. Diffusion reflects about the mean\n` +
        `4. After 1 iteration: marked item has amplitude 1, probability 100%\n\n` +
        `Optimal iterations = ⌊(π/4)√4⌋ = ⌊1.57⌋ = 1. Perfect.`,
      optimal_iterations:
        `The optimal number of Grover iterations is ⌊(π/4)√N⌋.\n\n` +
        `• N = 4: ⌊1.57⌋ = 1 iteration\n` +
        `• N = 16: ⌊3.14⌋ = 3 iterations\n` +
        `• N = 64: ⌊6.28⌋ = 6 iterations\n` +
        `• N = 256: ⌊12.57⌋ = 12 iterations\n\n` +
        `Using exactly this many gives success probability close to 100%. Using more ` +
        `causes the probability to decrease — the algorithm "overshoots."`,
      probability_after_k:
        `The probability of finding the marked item after k iterations follows a sine wave:\n\n` +
        `P(k) = sin²((2k+1)θ) where sin(θ) = 1/√N\n\n` +
        `For N = 4: θ = π/6 (since sin(π/6) = 0.5 = 1/√4)\n` +
        `• k = 0: sin²(π/6) = 0.25 (25%)\n` +
        `• k = 1: sin²(3π/6) = sin²(π/2) = 1 (100%)\n` +
        `• k = 2: sin²(5π/6) = 0.25 (25%) — it oscillates back!`,
      too_many_iterations:
        `Grover's algorithm is not "the more iterations, the better." The success probability ` +
        `oscillates like a sine wave. If you apply too many iterations, the probability of ` +
        `finding the marked item decreases.\n\n` +
        `For N = 4: 1 iteration gives 100%, but 2 iterations drops to 25%. ` +
        `The algorithm overshoots and the amplitude of the marked item shrinks.\n\n` +
        `This is why knowing the optimal iteration count is critical.`,
    };

    switch (variation) {

      case 'two_qubit':
      case 'basic': {
        return {
          teachingText: teachingMap.two_qubit,
          workedExample: {
            problem: `N = 4, oracle marks |11⟩. Trace the full iteration.`,
            steps: [
              `Start: (0.5, 0.5, 0.5, 0.5)`,
              `Oracle: (0.5, 0.5, 0.5, −0.5)`,
              `Mean = 0.25`,
              `Diffusion: (0, 0, 0, 1)`,
              `P(|11⟩) = |1|² = 1 = 100%`,
            ],
            insight: `N = 4 is the perfect demonstration — one iteration gives certainty.`,
          },
          tryIt: {
            question: `Grover's algorithm on N = 4 items (2 qubits). After 1 iteration, what is the probability of measuring the marked item? (Give as a percentage, e.g. 100)`,
            answer: 100,
            answerType: 'numeric',
            answerDisplay: '100',
            steps: [
              `Start: (0.5, 0.5, 0.5, 0.5)`,
              `Oracle: (0.5, 0.5, 0.5, −0.5) [marking any item]`,
              `Mean = 0.25`,
              `Diffusion: unmarked → 0, marked → 1`,
              `Probability = |1|² = 100%`,
            ],
            whyItMatters:
              `N = 4 is the smallest case where Grover's algorithm shows its power. ` +
              `Classically you would need 2 lookups on average; quantum gives certainty in 1 step.`,
          },
        };
      }

      case 'optimal_iterations': {
        const wCase = { N: 16, sqrt: 4, iters: 3 };
        const pCases = [
          { N: 64, sqrt: 8, iters: 6 },
          { N: 256, sqrt: 16, iters: 12 },
        ];
        const p = pCases[randInt(0, pCases.length - 1)];
        return {
          teachingText: teachingMap.optimal_iterations,
          workedExample: {
            problem: `N = ${wCase.N}. Optimal iterations = ⌊(π/4)√${wCase.N}⌋ = ?`,
            steps: [
              `√${wCase.N} = ${wCase.sqrt}`,
              `(π/4) × ${wCase.sqrt} = ${(Math.PI/4*wCase.sqrt).toFixed(2)}`,
              `⌊${(Math.PI/4*wCase.sqrt).toFixed(2)}⌋ = ${wCase.iters}`,
            ],
            insight: `The formula ⌊(π/4)√N⌋ is optimal — proven by Zalka (1999) to be tight.`,
          },
          tryIt: {
            question: `For N = ${p.N} items, how many Grover iterations are optimal? Use ⌊(π/4)√N⌋. (Round down to nearest integer.)`,
            answer: p.iters,
            answerType: 'numeric',
            answerDisplay: `${p.iters}`,
            steps: [
              `√${p.N} = ${p.sqrt}`,
              `(π/4) × ${p.sqrt} = ${(Math.PI/4*p.sqrt).toFixed(2)}`,
              `⌊${(Math.PI/4*p.sqrt).toFixed(2)}⌋ = ${p.iters}`,
            ],
            whyItMatters:
              `Knowing the optimal iteration count is essential — unlike classical algorithms, ` +
              `running Grover's algorithm longer does not always help. Precision matters.`,
          },
        };
      }

      case 'probability_after_k': {
        return {
          teachingText: teachingMap.probability_after_k,
          workedExample: {
            problem: `N = 4, θ = π/6. After k = 1 iteration: sin²((2×1+1)π/6) = sin²(π/2) = ?`,
            steps: [
              `(2k+1)θ = 3 × π/6 = π/2`,
              `sin(π/2) = 1`,
              `sin²(π/2) = 1 = 100%`,
            ],
            insight: `At k = 1, the angle hits π/2 exactly — maximum probability.`,
          },
          tryIt: {
            question: `For N = 4 (θ = π/6), after k = 1 iteration, what is sin²((2k+1)θ) = sin²(π/2) as a percentage?`,
            answer: 100,
            answerType: 'numeric',
            answerDisplay: '100',
            steps: [
              `θ = arcsin(1/√4) = arcsin(0.5) = π/6`,
              `(2×1+1) × π/6 = 3π/6 = π/2`,
              `sin²(π/2) = 1 = 100%`,
            ],
            whyItMatters:
              `The sine formula P(k) = sin²((2k+1)θ) completely describes Grover's dynamics. ` +
              `Understanding this oscillation is key to quantum algorithm design.`,
          },
        };
      }

      case 'too_many_iterations': {
        return {
          teachingText: teachingMap.too_many_iterations,
          workedExample: {
            problem: `N = 4, θ = π/6. After k = 2 iterations: sin²(5π/6) = ?`,
            steps: [
              `(2×2+1)θ = 5 × π/6 = 5π/6 = 150°`,
              `sin(150°) = sin(30°) = 0.5`,
              `sin²(150°) = 0.25 = 25%`,
              `Probability dropped from 100% to 25%!`,
            ],
            insight: `Too many iterations cause the algorithm to overshoot — the probability oscillates.`,
          },
          tryIt: {
            question: `For N = 4 (θ = π/6), after k = 2 iterations the probability is sin²(5π/6). What is this probability as a percentage?`,
            answer: 25,
            answerType: 'numeric',
            answerDisplay: '25',
            steps: [
              `5π/6 = 150°`,
              `sin(150°) = sin(30°) = 0.5`,
              `sin²(150°) = 0.25 = 25%`,
              `The probability decreased from 100% (at k=1) to 25%.`,
            ],
            whyItMatters:
              `This oscillation is why Grover's algorithm requires knowing N (at least approximately). ` +
              `Without knowing when to stop, you might overshoot and get the wrong answer.`,
          },
        };
      }

      default: return null;
    }
  },
},

grover_optimality: {
  generate(difficulty, variation) {
    const allItems = {
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
          'Deutsch-Jozsa: 1 query vs 2^(n-1)+1 classically → exponential.',
          'Grover: O(√N) vs O(N) → quadratic.',
          'Grover is more modest but far more broadly applicable.',
        ],
      },
      practical_impact: {
        q: 'A classical search of 10^12 items takes ~5 × 10^11 lookups. Grover needs ~785,398 iterations. By what factor is Grover faster?',
        choices: [
          'About 10× faster',
          'About 1,000× faster',
          'About 636,000× faster',
          'About 10^12× faster',
        ],
        answer: 'C', display: 'C) About 636,000× faster',
        steps: [
          'Classical: 5 × 10^11 lookups.',
          'Grover: ~785,398 iterations.',
          'Speedup: 5×10^11 / 785,398 ≈ 636,000×.',
        ],
      },
    };

    const poolMap = {
      not_exponential: ['not_exponential'],
      compare_dj: ['compare_dj'],
      practical_impact: ['practical_impact'],
    };
    const pool = poolMap[variation] || ['not_exponential', 'compare_dj', 'practical_impact'];

    const wKey = pool[randInt(0, pool.length - 1)];
    let pKey;
    do { pKey = pool[randInt(0, pool.length - 1)]; } while (pKey === wKey && pool.length > 1);
    const w = allItems[wKey], p = allItems[pKey];

    const teachingMap = {
      not_exponential:
        `Grover's algorithm provides a quadratic speedup: O(√N) instead of O(N). ` +
        `This is NOT exponential.\n\n` +
        `An exponential speedup would be O(log N) or O(poly(log N)) — like Shor's algorithm ` +
        `for factoring. Grover's speedup is more modest but applies to a much broader class ` +
        `of problems: any unstructured search.\n\n` +
        `Moreover, Grover's speedup is provably optimal — no quantum algorithm can search ` +
        `faster than O(√N) (Bennett, Bernstein, Brassard, Vazirani, 1997).`,
      compare_dj:
        `Different quantum algorithms give different types of speedup:\n\n` +
        `• Deutsch-Jozsa: determines constant vs balanced in 1 query (exponential speedup) ` +
        `but solves a very specific problem.\n\n` +
        `• Grover: searches any unsorted database in O(√N) (quadratic speedup) ` +
        `and applies to any problem with a verifiable solution.\n\n` +
        `Grover's speedup is smaller but far more general and practically important.`,
      practical_impact:
        `For a database of 10^12 items:\n` +
        `• Classical: ~5 × 10^11 lookups on average\n` +
        `• Grover: (π/4) × √(10^12) ≈ 785,398 iterations\n` +
        `• Speedup factor: ~636,000×\n\n` +
        `In cryptography, this means a 256-bit symmetric key provides only 128-bit security ` +
        `against Grover's algorithm. This is why post-quantum cryptography recommends doubling key sizes.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['not_exponential'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps, `Answer: ${w.display}`],
        insight: `Grover's quadratic speedup is provably optimal — no quantum algorithm can do better for unstructured search.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `Understanding the type of speedup is crucial for knowing where quantum computers ` +
          `will and will not outperform classical ones. Grover's quadratic speedup is powerful ` +
          `but not a silver bullet.`,
      },
    };
  },
},

// ── Chapter 18: Quantum Error Correction ─────────────────────────────────────

error_concept: {
  generate(difficulty, variation) {
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
          'Z|0⟩ = |0⟩, Z|1⟩ = −|1⟩.',
          'Z(α|0⟩ + β|1⟩) = α|0⟩ − β|1⟩ — only the relative phase changes.',
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
          'Classical error correction freely copies bits: 0 → 000.',
          'The no-cloning theorem proves no quantum operation can duplicate an arbitrary unknown state.',
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
          'Qubits have three error types: X (bit-flip), Z (phase-flip), Y = iXZ (both).',
          'Any single-qubit error decomposes as aI + bX + cY + dZ.',
        ],
      },
    };

    const poolMap = {
      bit_flip: ['bit_flip', 'phase_flip'],
      phase_flip: ['phase_flip', 'bit_flip'],
      why_no_copy: ['why_no_copy', 'classical_vs_quantum'],
      classical_vs_quantum: ['classical_vs_quantum', 'why_no_copy'],
    };
    const pool = poolMap[variation] || Object.keys(items);

    const wKey = pool[randInt(0, pool.length - 1)];
    let pKey;
    do { pKey = pool[randInt(0, pool.length - 1)]; } while (pKey === wKey && pool.length > 1);
    const w = items[wKey], p = items[pKey];

    const teachingMap = {
      bit_flip:
        `Quantum computers are incredibly sensitive to noise. Even tiny interactions with ` +
        `the environment can corrupt a qubit's state. The simplest error is a bit-flip ` +
        `(X error): it swaps |0⟩ and |1⟩.\n\n` +
        `For a state α|0⟩ + β|1⟩, a bit-flip gives α|1⟩ + β|0⟩. The amplitudes are ` +
        `unchanged, but they're attached to the wrong basis states. This is the quantum ` +
        `analog of a classical bit-flip (0→1, 1→0).`,
      phase_flip:
        `Unlike classical bits, qubits can also suffer phase-flip (Z) errors. A phase-flip ` +
        `leaves |0⟩ unchanged but maps |1⟩ → −|1⟩.\n\n` +
        `For α|0⟩ + β|1⟩, a Z error gives α|0⟩ − β|1⟩. The measurement probabilities ` +
        `(|α|² and |β|²) don't change, but the relative phase is corrupted. This error ` +
        `has no classical analog — it's purely quantum.`,
      why_no_copy:
        `Classical error correction is simple: copy the bit (0→000, 1→111), and use ` +
        `majority voting to fix errors. But quantum mechanics forbids this approach.\n\n` +
        `The no-cloning theorem (Wootters & Zurek, 1982) proves that no quantum operation ` +
        `can duplicate an arbitrary unknown quantum state. You cannot make a copy of ` +
        `α|0⟩ + β|1⟩ without knowing α and β. Quantum error correction must use ` +
        `entanglement rather than copying to protect information.`,
      classical_vs_quantum:
        `Classical bits have exactly one type of error: the bit-flip (0↔1). Qubits are ` +
        `richer — they have three independent error types:\n\n` +
        `• X (bit-flip): swaps |0⟩ and |1⟩\n` +
        `• Z (phase-flip): flips the sign of |1⟩\n` +
        `• Y = iXZ: both bit-flip and phase-flip simultaneously\n\n` +
        `Any single-qubit error can be decomposed as a combination of I, X, Y, Z. ` +
        `If a code can correct X and Z individually, it automatically corrects Y and ` +
        `any arbitrary error.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['bit_flip'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps, `Answer: ${w.display}`],
        insight: `Quantum errors include both bit-flips (X) and phase-flips (Z) — a fundamentally richer error model than classical computing.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `Understanding error types is the foundation of quantum error correction. ` +
          `Every quantum algorithm of practical interest requires error correction to ` +
          `run on real hardware, because physical qubits are inherently noisy.`,
      },
    };
  },
},

bit_flip_code: {
  generate(difficulty, variation) {
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
          'The 3-qubit bit-flip code: |0⟩_L = |000⟩, |1⟩_L = |111⟩.',
          'A general state α|0⟩ + β|1⟩ → α|000⟩ + β|111⟩.',
        ],
      },
      detect_error: {
        q: 'Starting from |000⟩, a bit-flip error occurs on qubit 2. What is the resulting state?',
        choices: [
          '|100⟩',
          '|010⟩',
          '|001⟩',
          '|110⟩',
        ],
        answer: 'B', display: 'B) |010⟩',
        steps: [
          'Qubit 2 is the middle qubit. Flipping it: |000⟩ → |010⟩.',
          'The syndrome measurement will reveal qubit 2 disagrees with its neighbors.',
        ],
      },
      correct_error: {
        q: 'The syndrome shows qubit 3 disagrees with qubits 1 and 2. Which gate corrects the error?',
        choices: [
          'Apply X to qubit 1',
          'Apply X to qubit 2',
          'Apply X to qubit 3',
          'Apply Z to qubit 3',
        ],
        answer: 'C', display: 'C) Apply X to qubit 3',
        steps: [
          'Qubit 3 disagrees → qubit 3 was flipped.',
          'Apply X to qubit 3 to undo the flip.',
        ],
      },
      no_error: {
        q: 'What syndrome do you get in the 3-qubit bit-flip code when no error occurred?',
        choices: [
          'Both syndrome bits are 1',
          'First bit is 1, second is 0',
          'First bit is 0, second is 1',
          'Both syndrome bits are 0 (all qubits agree)',
        ],
        answer: 'D', display: 'D) Both syndrome bits are 0 (all qubits agree)',
        steps: [
          'Syndrome compares pairs: bit1 ⊕ bit2, bit2 ⊕ bit3.',
          'No error means all qubits agree: both comparisons give 0.',
        ],
      },
    };

    const poolMap = {
      encode: ['encode', 'detect_error'],
      detect_error: ['detect_error', 'correct_error'],
      correct_error: ['correct_error', 'no_error'],
      no_error: ['no_error', 'encode'],
    };
    const pool = poolMap[variation] || Object.keys(items);

    const wKey = pool[randInt(0, pool.length - 1)];
    let pKey;
    do { pKey = pool[randInt(0, pool.length - 1)]; } while (pKey === wKey && pool.length > 1);
    const w = items[wKey], p = items[pKey];

    const teachingMap = {
      encode:
        `The 3-qubit bit-flip code is the simplest quantum error-correcting code. ` +
        `It protects against a single X error on any one qubit.\n\n` +
        `Encoding: |0⟩ → |000⟩, |1⟩ → |111⟩. A general state α|0⟩ + β|1⟩ becomes ` +
        `α|000⟩ + β|111⟩. This is NOT copying — it creates an entangled state where ` +
        `the three qubits are correlated but the encoded information is spread across all three.`,
      detect_error:
        `To detect which qubit was flipped, we perform syndrome measurements. These ` +
        `compare pairs of qubits WITHOUT measuring the encoded information.\n\n` +
        `Syndrome bit 1: Compare qubit 1 and qubit 2 (do they agree?)\n` +
        `Syndrome bit 2: Compare qubit 2 and qubit 3 (do they agree?)\n\n` +
        `If qubit 2 is flipped in |000⟩, we get |010⟩. The syndrome reveals qubit 2 ` +
        `disagrees with both neighbors: syndrome = (1, 1).`,
      correct_error:
        `Once the syndrome identifies the flipped qubit, correction is simple: apply X ` +
        `to that qubit to flip it back.\n\n` +
        `Syndrome → Correction:\n` +
        `(0, 0) → No error\n` +
        `(1, 0) → Flip qubit 1\n` +
        `(1, 1) → Flip qubit 2\n` +
        `(0, 1) → Flip qubit 3\n\n` +
        `The key insight: syndrome measurement extracts error information without ` +
        `collapsing the encoded quantum state.`,
      no_error:
        `The syndrome measurement is designed to detect errors without disturbing the ` +
        `encoded quantum information. It compares qubits pairwise.\n\n` +
        `When no error occurred, all qubits agree with each other: qubit 1 ⊕ qubit 2 = 0, ` +
        `qubit 2 ⊕ qubit 3 = 0. The syndrome (0, 0) means "no correction needed."\n\n` +
        `This code can detect and correct any single bit-flip, but fails if two or more ` +
        `qubits are flipped simultaneously.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['encode'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps, `Answer: ${w.display}`],
        insight: `The 3-qubit code spreads information across three qubits using entanglement, then uses syndrome measurements to find and fix errors without disturbing the data.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `The bit-flip code illustrates the core principle of all quantum error correction: ` +
          `encode information redundantly using entanglement, detect errors via syndrome ` +
          `measurements, and correct without ever learning the encoded state.`,
      },
    };
  },
},

phase_flip_code: {
  generate(difficulty, variation) {
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
          'Phase-flip code: |0⟩_L = |+++⟩, |1⟩_L = |−−−⟩.',
          'This encodes in the Hadamard basis so that Z errors look like bit-flips.',
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
          'Z|+⟩ = Z(|0⟩+|1⟩)/√2 = (|0⟩−|1⟩)/√2 = |−⟩.',
          'In the {|+⟩,|−⟩} basis, Z acts like a bit-flip: |+⟩ ↔ |−⟩.',
        ],
      },
      relationship_to_bit_flip: {
        q: 'What is the relationship between the phase-flip code and the bit-flip code?',
        choices: [
          'They are completely unrelated',
          'The phase-flip code is the bit-flip code conjugated by H⊗H⊗H',
          'The phase-flip code uses twice as many qubits',
          'The phase-flip code also corrects bit-flip errors',
        ],
        answer: 'B', display: 'B) The phase-flip code is the bit-flip code conjugated by H⊗H⊗H',
        steps: [
          'Apply H to bit-flip codewords: H|000⟩ = |+++⟩, H|111⟩ = |−−−⟩.',
          'The Hadamard transform exchanges X↔Z, turning bit-flip correction into phase-flip correction.',
        ],
      },
    };

    const poolMap = {
      encode: ['encode', 'detect_phase_error'],
      detect_phase_error: ['detect_phase_error', 'relationship_to_bit_flip'],
      relationship_to_bit_flip: ['relationship_to_bit_flip', 'encode'],
    };
    const pool = poolMap[variation] || Object.keys(items);

    const wKey = pool[randInt(0, pool.length - 1)];
    let pKey;
    do { pKey = pool[randInt(0, pool.length - 1)]; } while (pKey === wKey && pool.length > 1);
    const w = items[wKey], p = items[pKey];

    const teachingMap = {
      encode:
        `The phase-flip code protects against Z errors (phase-flips). The trick: work in ` +
        `the Hadamard basis where Z errors look like bit-flips!\n\n` +
        `Encoding: |0⟩ → |+++⟩, |1⟩ → |−−−⟩, where |+⟩ = (|0⟩+|1⟩)/√2 and ` +
        `|−⟩ = (|0⟩−|1⟩)/√2. In this basis, a Z error flips |+⟩ ↔ |−⟩, which is ` +
        `just a "bit-flip" in the {|+⟩, |−⟩} basis.`,
      detect_phase_error:
        `Phase-flip errors are invisible in the computational basis — they don't change ` +
        `measurement probabilities for |0⟩ vs |1⟩. But in the Hadamard basis, they become ` +
        `visible.\n\n` +
        `Z|+⟩ = Z(|0⟩+|1⟩)/√2 = (|0⟩−|1⟩)/√2 = |−⟩. So a Z error on |+⟩ flips it ` +
        `to |−⟩ — a "bit-flip" in the {|+⟩, |−⟩} basis. By measuring in this basis, ` +
        `we can detect which qubit suffered the phase error.`,
      relationship_to_bit_flip:
        `The phase-flip code is beautifully connected to the bit-flip code: it is exactly ` +
        `the bit-flip code with every qubit passed through a Hadamard gate.\n\n` +
        `Bit-flip code: |0⟩→|000⟩, |1⟩→|111⟩ (corrects X errors)\n` +
        `Apply H⊗H⊗H: |000⟩→|+++⟩, |111⟩→|−−−⟩ (corrects Z errors!)\n\n` +
        `The Hadamard gate swaps X↔Z, so any X-correcting code becomes a Z-correcting ` +
        `code after conjugation by H. This duality is a deep principle in quantum error correction.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['encode'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps, `Answer: ${w.display}`],
        insight: `The phase-flip code exploits the X↔Z duality under Hadamard: correcting phase errors is just correcting bit-flips in a rotated basis.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `Phase errors are uniquely quantum — they have no classical analog. The fact that ` +
          `they can be converted to bit-flip errors via a basis change is one of the most ` +
          `elegant ideas in quantum information science.`,
      },
    };
  },
},

shor_code: {
  generate(difficulty, variation) {
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
          'Shor code = phase-flip code (3 blocks) × bit-flip code (3 per block).',
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
          'Within each block: |0⟩→|000⟩, |1⟩→|111⟩ — the 3-qubit bit-flip code.',
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
          'The outer code uses the phase-flip code structure across 3 blocks.',
          'A Z error on any qubit causes its entire block to flip sign, which the outer code detects.',
        ],
      },
      combined_protection: {
        q: 'Why does correcting X and Z errors mean the Shor code corrects ANY single-qubit error?',
        choices: [
          'Because X and Z are the only possible errors',
          'Because any single-qubit error is a linear combination of I, X, Z, and Y = iXZ',
          'Because the Shor code also includes a Y-correction layer',
          'It actually cannot correct Y errors',
        ],
        answer: 'B', display: 'B) Because any single-qubit error is a linear combination of I, X, Z, and Y = iXZ',
        steps: [
          'Any 2×2 error = aI + bX + cY + dZ. Since Y = iXZ, correcting X and Z covers Y.',
          'Quantum error correction is linear: correcting basis errors corrects all superpositions.',
        ],
      },
    };

    const poolMap = {
      structure: ['structure', 'bit_flip_layer'],
      bit_flip_layer: ['bit_flip_layer', 'phase_flip_layer'],
      phase_flip_layer: ['phase_flip_layer', 'combined_protection'],
      combined_protection: ['combined_protection', 'structure'],
    };
    const pool = poolMap[variation] || Object.keys(items);

    const wKey = pool[randInt(0, pool.length - 1)];
    let pKey;
    do { pKey = pool[randInt(0, pool.length - 1)]; } while (pKey === wKey && pool.length > 1);
    const w = items[wKey], p = items[pKey];

    const teachingMap = {
      structure:
        `Peter Shor's 9-qubit code (1995) was the first quantum code that could correct ` +
        `any single-qubit error. It uses a nested structure:\n\n` +
        `• Inner code: 3-qubit bit-flip code (3 physical qubits per block)\n` +
        `• Outer code: 3-qubit phase-flip code (3 blocks)\n` +
        `• Total: 3 × 3 = 9 physical qubits per logical qubit\n\n` +
        `The inner code handles X errors within each block, the outer code handles Z ` +
        `errors across blocks.`,
      bit_flip_layer:
        `The inner layer of the Shor code is a repetition code within each of the 3 blocks. ` +
        `Each block encodes one qubit into three:\n\n` +
        `|0⟩ → |000⟩, |1⟩ → |111⟩ (within each block)\n\n` +
        `If an X error hits any single qubit within a block, the majority-vote syndrome ` +
        `detects and corrects it. This layer provides bit-flip protection.`,
      phase_flip_layer:
        `The outer layer of the Shor code protects against phase-flip errors. It encodes ` +
        `across 3 blocks using the phase-flip code:\n\n` +
        `Logical |0⟩: (|000⟩+|111⟩)(|000⟩+|111⟩)(|000⟩+|111⟩) / (2√2)\n` +
        `Logical |1⟩: (|000⟩−|111⟩)(|000⟩−|111⟩)(|000⟩−|111⟩) / (2√2)\n\n` +
        `A Z error on any qubit flips the sign of that block's |111⟩ component, ` +
        `which the outer code detects by comparing blocks.`,
      combined_protection:
        `The Shor code can correct ANY single-qubit error, not just X or Z. Why?\n\n` +
        `Any 2×2 matrix (any single-qubit error operator) can be written as:\n` +
        `E = aI + bX + cZ + dY, where Y = iXZ.\n\n` +
        `If the code corrects X and Z individually, quantum linearity guarantees it ` +
        `corrects any linear combination — including Y and arbitrary errors. This is ` +
        `the "digitization of errors": we only need to correct a discrete set of errors ` +
        `to handle all continuous errors.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['structure'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps, `Answer: ${w.display}`],
        insight: `The Shor code's nested structure — bit-flip protection inside, phase-flip protection outside — corrects any single-qubit error using 9 physical qubits.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `The Shor code proved that quantum error correction is possible at all. Before 1995, ` +
          `many physicists believed quantum computing was fundamentally impossible because ` +
          `errors could never be corrected without measuring (and destroying) quantum states.`,
      },
    };
  },
},

threshold_concept: {
  generate(difficulty, variation) {
    const items = {
      overhead: {
        q: 'Roughly how many physical qubits do surface codes need per logical qubit for useful computation?',
        choices: [
          'About 3 physical per logical',
          'About 10 physical per logical',
          'About 1,000 or more physical per logical',
          'About 1 million physical per logical',
        ],
        answer: 'C', display: 'C) About 1,000 or more physical per logical',
        steps: [
          'Estimates: ~1,000 to ~10,000 physical qubits per logical qubit.',
          'A million-qubit machine might yield only ~1,000 logical qubits.',
        ],
      },
      threshold: {
        q: 'What happens if the physical error rate is ABOVE the code\'s threshold?',
        choices: [
          'Error correction still works but more slowly',
          'Adding more qubits makes things worse, not better',
          'The code automatically switches to a different strategy',
          'The logical error rate stays the same as the physical rate',
        ],
        answer: 'B', display: 'B) Adding more qubits makes things worse, not better',
        steps: [
          'Below threshold: more redundancy → lower logical error rate.',
          'Above threshold: each added qubit introduces more errors than it corrects.',
        ],
      },
      current_state: {
        q: 'What is the approximate threshold for surface codes, and have physical qubits achieved it?',
        choices: [
          'Threshold ~10%; yes, easily achieved',
          'Threshold ~1%; some systems are near or below it',
          'Threshold ~0.001%; no system has achieved it',
          'Threshold ~50%; all systems are below it',
        ],
        answer: 'B', display: 'B) Threshold ~1%; some systems are near or below it',
        steps: [
          'Surface codes have a threshold around 1% per gate.',
          'Several platforms (superconducting, trapped ions) are near or below this threshold.',
        ],
      },
    };

    const poolMap = {
      overhead: ['overhead', 'threshold'],
      threshold: ['threshold', 'current_state'],
      current_state: ['current_state', 'overhead'],
    };
    const pool = poolMap[variation] || Object.keys(items);

    const wKey = pool[randInt(0, pool.length - 1)];
    let pKey;
    do { pKey = pool[randInt(0, pool.length - 1)]; } while (pKey === wKey && pool.length > 1);
    const w = items[wKey], p = items[pKey];

    const teachingMap = {
      overhead:
        `Quantum error correction requires significant overhead: many physical qubits ` +
        `encode each logical qubit. Current estimates for surface codes (the leading ` +
        `approach) suggest ~1,000 to ~10,000 physical qubits per logical qubit.\n\n` +
        `This means a quantum computer with 1 million physical qubits might only have ` +
        `~1,000 usable logical qubits. Reducing this overhead is one of the biggest ` +
        `challenges in quantum computing.`,
      threshold:
        `The threshold theorem (1996) is one of the most important results in quantum ` +
        `computing. It states: if the physical error rate p is below a critical value ` +
        `p_threshold, then adding more redundancy (more physical qubits) always reduces ` +
        `the logical error rate.\n\n` +
        `But if p > p_threshold, adding qubits makes things WORSE — each new qubit ` +
        `introduces more errors than it helps correct. The threshold for surface codes ` +
        `is approximately 1% per gate.`,
      current_state:
        `The state of quantum error correction as of the mid-2020s:\n\n` +
        `• Surface code threshold: ~1% per gate\n` +
        `• Best superconducting qubits: gate errors ~0.1–0.5%\n` +
        `• Best trapped ions: gate errors ~0.03–0.5%\n` +
        `• Challenge: maintaining these rates across entire computations\n\n` +
        `Several groups have demonstrated logical qubits that outperform physical qubits, ` +
        `a key milestone. But fully fault-tolerant, useful computation is still in development.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['overhead'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps, `Answer: ${w.display}`],
        insight: `The threshold theorem guarantees that quantum computing can work at scale — as long as physical error rates are low enough.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `The threshold theorem is what makes quantum computing a realistic technology. ` +
          `Without it, errors would accumulate faster than we could fix them, and no ` +
          `quantum algorithm could run long enough to be useful.`,
      },
    };
  },
},

// ── Chapter 19: Shor's Algorithm ─────────────────────────────────────────────

factoring_problem: {
  generate(difficulty, variation) {
    /** Helper: compute a^exp mod m */
    function modPow(base, exp, mod) {
      let result = 1; base = base % mod;
      for (let i = 0; i < exp; i++) result = (result * base) % mod;
      return result;
    }
    function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }

    const teachingMap = {
      small_factor:
        `Shor's algorithm solves the factoring problem: given a composite number N, find its ` +
        `non-trivial factors (not 1 or N itself).\n\n` +
        `Why does this matter? RSA encryption relies on the assumption that factoring large ` +
        `numbers is practically impossible for classical computers. A 2048-bit RSA key is the ` +
        `product of two large primes, and no classical algorithm can factor it in reasonable time.\n\n` +
        `Let's start small: factoring numbers like 15, 21, or 35 by hand.`,
      why_hard:
        `Factoring seems simple for small numbers, but the difficulty grows dramatically.\n\n` +
        `For an n-digit number, there are roughly 10^(n/2) possible prime factors to check. ` +
        `A 300-digit number has about 10^150 candidate factors — more than atoms in the universe.\n\n` +
        `The best classical algorithm (General Number Field Sieve) runs in ` +
        `sub-exponential time: e^(O(n^(1/3) × (log n)^(2/3))). Fast, but still super-polynomial.`,
      rsa_connection:
        `RSA encryption works like this:\n` +
        `1. Choose two large primes p and q\n` +
        `2. Publish N = p × q (the public key)\n` +
        `3. Keep p and q secret (needed for decryption)\n\n` +
        `Anyone who can factor N can recover p and q and break the encryption. ` +
        `Shor's algorithm factors N in polynomial time — O((log N)³) — which would ` +
        `completely break RSA on a sufficiently large quantum computer.`,
      classical_time:
        `The gap between classical and quantum factoring is staggering:\n\n` +
        `• 2048-bit RSA: classical computers need ~10^20 years\n` +
        `• Shor's algorithm: polynomial time — hours to days on a large quantum computer\n\n` +
        `The catch: we need thousands of error-corrected qubits. Current quantum computers ` +
        `have only demonstrated factoring small numbers (e.g., 15 = 3 × 5 in 2001, 21 = 3 × 7 in 2012).`,
    };

    switch (variation) {

      case 'small_factor': {
        const composites = [
          { N: 15, factors: [3, 5] },
          { N: 21, factors: [3, 7] },
          { N: 35, factors: [5, 7] },
          { N: 33, factors: [3, 11] },
          { N: 55, factors: [5, 11] },
        ];
        const wc = composites[randInt(0, composites.length - 1)];
        let pc;
        do { pc = composites[randInt(0, composites.length - 1)]; } while (pc.N === wc.N);
        return {
          teachingText: teachingMap.small_factor,
          workedExample: {
            problem: `Find a non-trivial factor of N = ${wc.N}.`,
            steps: [
              `Try small primes: is ${wc.N} divisible by 2? No (it's odd).`,
              `Is ${wc.N} divisible by ${wc.factors[0]}? ${wc.N} ÷ ${wc.factors[0]} = ${wc.factors[1]}. Yes!`,
              `${wc.N} = ${wc.factors[0]} × ${wc.factors[1]}`,
            ],
            insight: `For small numbers, trial division is easy. For 600-digit numbers, even the fastest supercomputers cannot do it.`,
          },
          tryIt: {
            question: `Find a non-trivial factor of N = ${pc.N}.`,
            answer: pc.factors[0],
            answerType: 'numeric',
            answerDisplay: `${pc.factors[0]} (since ${pc.N} = ${pc.factors[0]} × ${pc.factors[1]})`,
            acceptAlternate: pc.factors[1],
            steps: [
              `Try dividing by small primes.`,
              `${pc.N} ÷ ${pc.factors[0]} = ${pc.factors[1]}`,
              `So ${pc.factors[0]} is a factor.`,
            ],
            whyItMatters:
              `Shor's algorithm turns the factoring problem into a period-finding problem, ` +
              `which quantum computers can solve exponentially faster than classical ones.`,
          },
        };
      }

      case 'why_hard': {
        const wItem = {
          q: 'Why is multiplying two primes easy but factoring their product hard?',
          choices: [
            'Multiplication is commutative',
            'Multiplication takes O(n²) time; no known polynomial-time factoring algorithm exists classically',
            'Both are equally hard',
            'Factoring only works for even numbers',
          ],
          answer: 'B', display: 'B) Multiplication is O(n²); no known polynomial-time classical factoring algorithm',
          steps: ['Multiplication: O(n²) digit operations.', 'Best classical factoring: sub-exponential.', 'This asymmetry is the basis of RSA.'],
        };
        const pItem = {
          q: 'Why is factoring large numbers believed to be hard for classical computers?',
          choices: [
            'No one has ever factored a number',
            'The number of possible factors grows exponentially with the number of digits',
            'Multiplication is also hard',
            'Computers cannot do division',
          ],
          answer: 'B', display: 'B) The number of possible factors grows exponentially with the number of digits',
          steps: ['An n-digit number has ~10^(n/2) candidate factors.', 'No known classical algorithm runs in polynomial time.', 'This is a one-way function: easy to multiply, hard to factor.'],
        };
        return {
          teachingText: teachingMap.why_hard,
          workedExample: {
            problem: wItem.q,
            steps: [...wItem.steps, `Answer: ${wItem.display}`],
            insight: `This computational asymmetry (easy to multiply, hard to factor) is the foundation of public-key cryptography.`,
          },
          tryIt: {
            question: pItem.q,
            choices: pItem.choices,
            answer: pItem.answer,
            answerType: 'choice',
            answerDisplay: pItem.display,
            steps: pItem.steps,
            whyItMatters:
              `If factoring were easy, RSA and much of internet security would collapse. ` +
              `Shor's algorithm makes factoring easy — but only on a quantum computer.`,
          },
        };
      }

      case 'rsa_connection': {
        const wItem = {
          q: 'In RSA, the public key N = p × q is published. What must an attacker find to break it?',
          choices: [
            'The encryption algorithm',
            'The prime factors p and q',
            'The message hash',
            'The sender\'s IP address',
          ],
          answer: 'B', display: 'B) The prime factors p and q',
          steps: ['RSA decryption requires knowing p and q.', 'If you can factor N, you can compute the private key.'],
        };
        const pItem = {
          q: 'Why does Shor\'s algorithm threaten RSA encryption?',
          choices: [
            'RSA keys are too short',
            'RSA security relies on the difficulty of factoring large semiprimes',
            'RSA uses quantum mechanics internally',
            'Shor\'s algorithm can guess passwords',
          ],
          answer: 'B', display: 'B) RSA security relies on the difficulty of factoring large semiprimes',
          steps: ['RSA publishes N = p × q.', 'Breaking RSA = factoring N.', 'Shor factors N in polynomial time.'],
        };
        return {
          teachingText: teachingMap.rsa_connection,
          workedExample: {
            problem: wItem.q,
            steps: [...wItem.steps, `Answer: ${wItem.display}`],
            insight: `Every time you visit an HTTPS website, factoring hardness protects your data. Shor's algorithm threatens this.`,
          },
          tryIt: {
            question: pItem.q,
            choices: pItem.choices,
            answer: pItem.answer,
            answerType: 'choice',
            answerDisplay: pItem.display,
            steps: pItem.steps,
            whyItMatters:
              `This is why post-quantum cryptography is being developed — new algorithms ` +
              `whose security doesn't rely on factoring.`,
          },
        };
      }

      case 'classical_time': {
        const wItem = {
          q: 'What is the best known classical time complexity for factoring?',
          choices: [
            'Polynomial — O(n²)',
            'Sub-exponential — between polynomial and exponential',
            'Exponential — O(2^n)',
            'Constant — O(1)',
          ],
          answer: 'B', display: 'B) Sub-exponential — between polynomial and exponential',
          steps: ['General Number Field Sieve: e^(O(n^(1/3) (log n)^(2/3))).', 'Faster than brute force but not polynomial.'],
        };
        const pItem = {
          q: 'A 2048-bit RSA key would take classical computers millions of years to factor. Shor\'s algorithm (with a large enough quantum computer) could do it in:',
          choices: [
            'Millions of years (same as classical)',
            'Thousands of years',
            'Hours to days',
            'It cannot factor RSA keys',
          ],
          answer: 'C', display: 'C) Hours to days',
          steps: ['Shor runs in O((log N)³).', 'For 2048 bits: ~(2048)³ ≈ 8.6 billion operations.', 'On a large quantum computer: hours, not years.'],
        };
        return {
          teachingText: teachingMap.classical_time,
          workedExample: {
            problem: wItem.q,
            steps: [...wItem.steps, `Answer: ${wItem.display}`],
            insight: `Shor's algorithm collapses this sub-exponential time to polynomial: O((log N)³).`,
          },
          tryIt: {
            question: pItem.q,
            choices: pItem.choices,
            answer: pItem.answer,
            answerType: 'choice',
            answerDisplay: pItem.display,
            steps: pItem.steps,
            whyItMatters:
              `The exponential-to-polynomial speedup for factoring is the most dramatic known ` +
              `quantum advantage — far more powerful than Grover's quadratic speedup.`,
          },
        };
      }

      default:
        return this.generate(difficulty, 'small_factor');
    }
  },
},

period_finding: {
  generate(difficulty, variation) {
    function modPow(base, exp, mod) {
      let result = 1; base = base % mod;
      for (let i = 0; i < exp; i++) result = (result * base) % mod;
      return result;
    }

    const examples = [
      { a: 7,  N: 15, powers: [7, 4, 13, 1], period: 4 },
      { a: 11, N: 15, powers: [11, 1],        period: 2 },
      { a: 2,  N: 15, powers: [2, 4, 8, 1],   period: 4 },
      { a: 4,  N: 15, powers: [4, 1],          period: 2 },
      { a: 13, N: 15, powers: [13, 4, 7, 1],   period: 4 },
      { a: 2,  N: 21, powers: [2, 4, 8, 16, 11, 1], period: 6 },
      { a: 4,  N: 21, powers: [4, 16, 1],      period: 3 },
    ];

    const teachingMap = {
      compute_powers:
        `Shor's algorithm converts factoring into period finding. The key function is:\n\n` +
        `  f(x) = a^x mod N\n\n` +
        `This function is periodic: it repeats after some number of steps r (the period). ` +
        `For example, 7^x mod 15:\n` +
        `  7^1 mod 15 = 7\n` +
        `  7^2 mod 15 = 4  (49 mod 15)\n` +
        `  7^3 mod 15 = 13 (343 mod 15)\n` +
        `  7^4 mod 15 = 1  (2401 mod 15)\n` +
        `  7^5 mod 15 = 7  ← repeats!\n\n` +
        `The period is r = 4. Let's practice computing modular powers.`,
      find_period:
        `Once we have the sequence of a^x mod N, finding the period is straightforward: ` +
        `it's the smallest positive r such that a^r mod N = 1.\n\n` +
        `The quantum part of Shor's algorithm uses the QFT to find this period efficiently, ` +
        `without computing every power individually. Classically, finding the period requires ` +
        `computing up to O(N) powers — exponential in the number of digits.`,
      small_example:
        `Let's work through a complete period-finding example.\n\n` +
        `For N = 15, we pick a random a coprime to 15 (meaning gcd(a, 15) = 1). ` +
        `Valid choices: 2, 4, 7, 8, 11, 13, 14.\n\n` +
        `Compute the sequence a^1, a^2, a^3, ... mod 15 until we hit 1. ` +
        `The number of steps to reach 1 is the period r.`,
    };

    switch (variation) {

      case 'compute_powers': {
        const wEx = examples[0]; // 7^x mod 15
        const wExp = 2;
        const wAns = modPow(wEx.a, wExp, wEx.N); // 49 mod 15 = 4
        // Pick a different problem for tryIt
        const pPool = examples.filter(e => e.period >= 3);
        const pEx = pPool[randInt(0, pPool.length - 1)];
        const pExp = randInt(1, Math.min(3, pEx.period));
        const pAns = modPow(pEx.a, pExp, pEx.N);
        return {
          teachingText: teachingMap.compute_powers,
          workedExample: {
            problem: `Compute 7^2 mod 15.`,
            steps: [
              `7^2 = 49`,
              `49 ÷ 15 = 3 remainder 4`,
              `So 7^2 mod 15 = 4`,
            ],
            insight: `Modular arithmetic "wraps around" — the results stay between 0 and N−1, creating a repeating pattern.`,
          },
          tryIt: {
            question: `Compute ${pEx.a}^${pExp} mod ${pEx.N}.`,
            answer: pAns,
            answerType: 'numeric',
            answerDisplay: `${pAns}`,
            steps: (() => {
              const stps = [];
              let val = 1;
              for (let i = 1; i <= pExp; i++) {
                val = (val * pEx.a) % pEx.N;
                const raw = Math.pow(pEx.a, i);
                stps.push(`${pEx.a}^${i} = ${raw} mod ${pEx.N} = ${val}`);
              }
              return stps;
            })(),
            whyItMatters:
              `Computing a^x mod N is the core operation in Shor's algorithm. On a quantum computer, ` +
              `this is computed for all x simultaneously using superposition.`,
          },
        };
      }

      case 'find_period': {
        const wEx = examples[0]; // 7^x mod 15, period 4
        // Pick a different example for practice
        const pPool = examples.filter(e => !(e.a === 7 && e.N === 15));
        const pEx = pPool[randInt(0, pPool.length - 1)];
        const pSeq = pEx.powers.map((v, i) => `${pEx.a}^${i + 1} mod ${pEx.N} = ${v}`).join(', ');
        return {
          teachingText: teachingMap.find_period,
          workedExample: {
            problem: `Find the period of 7^x mod 15. Sequence: 7, 4, 13, 1, 7, 4, ...`,
            steps: [
              `Look for the first time the sequence hits 1:`,
              `7^1 mod 15 = 7, 7^2 mod 15 = 4, 7^3 mod 15 = 13, 7^4 mod 15 = 1`,
              `The period r = 4 (it took 4 steps to return to 1).`,
            ],
            insight: `After finding 1, the sequence repeats exactly: 7^5 = 7, 7^6 = 4, etc. This periodicity is what the QFT detects.`,
          },
          tryIt: {
            question: `Given the sequence: ${pSeq}. What is the period r of ${pEx.a}^x mod ${pEx.N}?`,
            answer: pEx.period,
            answerType: 'numeric',
            answerDisplay: `${pEx.period}`,
            steps: [
              `The period r is the smallest positive integer where ${pEx.a}^r mod ${pEx.N} = 1.`,
              `From the sequence, ${pEx.a}^${pEx.period} mod ${pEx.N} = 1.`,
              `So r = ${pEx.period}.`,
            ],
            whyItMatters:
              `Finding this period classically takes O(N) steps — exponential in the input size. ` +
              `The quantum computer finds it in O((log N)²) steps using the QFT.`,
          },
        };
      }

      case 'small_example': {
        const wEx = { a: 7, N: 15, powers: [7, 4, 13, 1], period: 4 };
        const pPool = examples.filter(e => e.N === 15 && e.a !== 7);
        const pEx = pPool[randInt(0, pPool.length - 1)];
        const pSeq = pEx.powers.map((v, i) => `${pEx.a}^${i + 1}≡${v}`).join(', ');
        return {
          teachingText: teachingMap.small_example,
          workedExample: {
            problem: `Find the full period of 7^x mod 15.`,
            steps: [
              `7^1 mod 15 = 7`,
              `7^2 mod 15 = 4  (49 mod 15)`,
              `7^3 mod 15 = 13 (343 mod 15)`,
              `7^4 mod 15 = 1  (2401 mod 15)`,
              `Period r = 4`,
            ],
            insight: `Every valid a has a period that divides φ(N). For N = 15: φ(15) = 8, so possible periods are 1, 2, 4, 8.`,
          },
          tryIt: {
            question: `Find the period of ${pEx.a}^x mod ${pEx.N}. (Hint: ${pSeq})`,
            answer: pEx.period,
            answerType: 'numeric',
            answerDisplay: `${pEx.period}`,
            steps: [
              ...pEx.powers.map((v, i) => `${pEx.a}^${i + 1} mod ${pEx.N} = ${v}`),
              `Period r = ${pEx.period}`,
            ],
            whyItMatters:
              `This period r is exactly what Shor's algorithm extracts using quantum computation. ` +
              `Once we have r, extracting factors is classical arithmetic.`,
          },
        };
      }

      default:
        return this.generate(difficulty, 'compute_powers');
    }
  },
},

period_to_factors: {
  generate(difficulty, variation) {
    function modPow(base, exp, mod) {
      let result = 1; base = base % mod;
      for (let i = 0; i < exp; i++) result = (result * base) % mod;
      return result;
    }
    function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }

    // Curated examples with even period and non-trivial factors
    const good = [
      { N: 15, a: 7,  r: 4 },
      { N: 15, a: 2,  r: 4 },
      { N: 15, a: 13, r: 4 },
    ];

    const teachingMap = {
      basic:
        `Once we have the period r, extracting factors is pure classical math:\n\n` +
        `1. If r is even, compute a^(r/2) mod N.\n` +
        `2. Compute gcd(a^(r/2) + 1, N) and gcd(a^(r/2) − 1, N).\n` +
        `3. These give non-trivial factors of N (unless we're unlucky).\n\n` +
        `Why does this work? Because a^r ≡ 1 (mod N) means:\n` +
        `  a^r − 1 ≡ 0 (mod N)\n` +
        `  (a^(r/2) − 1)(a^(r/2) + 1) ≡ 0 (mod N)\n` +
        `N divides this product, so its factors are shared between the two terms.`,
      gcd_step:
        `The GCD (Greatest Common Divisor) is the final classical step.\n\n` +
        `The Euclidean algorithm computes gcd efficiently:\n` +
        `  gcd(50, 15): 50 = 3 × 15 + 5, then gcd(15, 5) = 5.\n\n` +
        `In Shor's algorithm, we compute:\n` +
        `  gcd(a^(r/2) + 1, N) → one factor\n` +
        `  gcd(a^(r/2) − 1, N) → the other factor`,
      different_a:
        `Different choices of a give different periods, but they all lead to the same factors:\n\n` +
        `For N = 15:\n` +
        `• a = 7: r = 4, a^(r/2) = 49, gcd(50,15) = 5, gcd(48,15) = 3 ✓\n` +
        `• a = 2: r = 4, a^(r/2) = 4,  gcd(5,15) = 5,  gcd(3,15) = 3 ✓\n` +
        `• a = 11: r = 2, a^(r/2) = 11, gcd(12,15) = 3, gcd(10,15) = 5 ✓\n\n` +
        `Some choices of a may fail (giving trivial factors), but trying again with a new a works.`,
      why_even:
        `For Shor's algorithm to extract factors, the period r must be even.\n\n` +
        `If r is even: a^r − 1 = (a^(r/2) − 1)(a^(r/2) + 1), and we can compute GCDs.\n` +
        `If r is odd: a^(r/2) is not an integer — we cannot proceed.\n\n` +
        `Solution: simply pick a new random a and try again. For most composite N, ` +
        `a random a gives a useful (even) period with probability at least 1/2.`,
    };

    switch (variation) {

      case 'basic':
      case 'different_a': {
        const wEx = good[0]; // N=15, a=7, r=4
        const wHalfR = wEx.r / 2;
        const wAHalf = modPow(wEx.a, wHalfR, wEx.N);
        const wF1 = gcd(wAHalf + 1, wEx.N);
        const wF2 = gcd(wAHalf - 1, wEx.N);

        const pIdx = variation === 'different_a' ? randInt(1, good.length - 1) : randInt(0, good.length - 1);
        const pEx = good[pIdx === 0 && variation === 'basic' ? randInt(1, good.length - 1) : pIdx];
        const pHalfR = pEx.r / 2;
        const pAHalf = modPow(pEx.a, pHalfR, pEx.N);
        const pF1 = gcd(pAHalf + 1, pEx.N);
        const pF2 = gcd(pAHalf - 1, pEx.N);
        const pFactors = [pF1, pF2].filter(f => f > 1 && f < pEx.N).sort((a, b) => a - b);
        const pAns = pFactors[0];

        return {
          teachingText: teachingMap[variation] || teachingMap.basic,
          workedExample: {
            problem: `N = ${wEx.N}, a = ${wEx.a}, r = ${wEx.r}. Find a factor of ${wEx.N}.`,
            steps: [
              `r = ${wEx.r} is even. Compute a^(r/2) = ${wEx.a}^${wHalfR} = ${Math.pow(wEx.a, wHalfR)}.`,
              `gcd(${Math.pow(wEx.a, wHalfR)} + 1, ${wEx.N}) = gcd(${Math.pow(wEx.a, wHalfR) + 1}, ${wEx.N}) = ${wF1}`,
              `gcd(${Math.pow(wEx.a, wHalfR)} - 1, ${wEx.N}) = gcd(${Math.pow(wEx.a, wHalfR) - 1}, ${wEx.N}) = ${wF2}`,
              `Factors: ${wF1} and ${wF2}. ✓ ${wEx.N} = ${Math.min(wF1,wF2)} × ${Math.max(wF1,wF2)}`,
            ],
            insight: `This works because a^r ≡ 1 (mod N) means N divides (a^(r/2)−1)(a^(r/2)+1).`,
          },
          tryIt: {
            question: `N = ${pEx.N}, a = ${pEx.a}, period r = ${pEx.r}. Use these to find a non-trivial factor of ${pEx.N}.`,
            answer: pAns,
            answerType: 'numeric',
            answerDisplay: `${pFactors.join(' and ')} (${pEx.N} = ${pFactors[0]} × ${pFactors[1]})`,
            acceptAlternate: pFactors.length > 1 ? pFactors[1] : null,
            steps: [
              `a^(r/2) = ${pEx.a}^${pHalfR} = ${Math.pow(pEx.a, pHalfR)}`,
              `gcd(${Math.pow(pEx.a, pHalfR) + 1}, ${pEx.N}) = ${pF1}`,
              `gcd(${Math.pow(pEx.a, pHalfR) - 1}, ${pEx.N}) = ${pF2}`,
              `Non-trivial factors: ${pFactors.join(' and ')}`,
            ],
            whyItMatters:
              `This is the payoff: quantum period-finding feeds into classical GCD computation ` +
              `to crack the factoring problem in polynomial time.`,
          },
        };
      }

      case 'gcd_step': {
        const cases = [
          { a: 7, N: 15, halfR: 2, raw: 49,  plus: 50, gcdVal: 5 },
          { a: 2, N: 15, halfR: 2, raw: 4,   plus: 5,  gcdVal: 5 },
          { a: 13, N: 15, halfR: 2, raw: 169, plus: 170, gcdVal: 5 },
        ];
        const wc = cases[0];
        let pc;
        do { pc = cases[randInt(0, cases.length - 1)]; } while (pc.a === wc.a);
        return {
          teachingText: teachingMap.gcd_step,
          workedExample: {
            problem: `Compute gcd(${wc.a}^${wc.halfR} + 1, ${wc.N}). (${wc.a}^${wc.halfR} = ${wc.raw})`,
            steps: [
              `${wc.raw} + 1 = ${wc.plus}`,
              `gcd(${wc.plus}, ${wc.N}): ${wc.plus} = ${Math.floor(wc.plus / wc.N)} × ${wc.N} + ${wc.plus % wc.N}`,
              `gcd(${wc.N}, ${wc.plus % wc.N}) = ${wc.gcdVal}`,
            ],
            insight: `The Euclidean algorithm for GCD is fast — O((log N)²) — so this step is trivially classical.`,
          },
          tryIt: {
            question: `Compute gcd(${pc.a}^${pc.halfR} + 1, ${pc.N}). (Hint: ${pc.a}^${pc.halfR} = ${pc.raw})`,
            answer: pc.gcdVal,
            answerType: 'numeric',
            answerDisplay: `${pc.gcdVal}`,
            steps: [
              `${pc.raw} + 1 = ${pc.plus}`,
              `gcd(${pc.plus}, ${pc.N}) = ${pc.gcdVal}`,
            ],
            whyItMatters:
              `The GCD step is the bridge between the quantum period and the classical factors. ` +
              `It runs efficiently on any computer.`,
          },
        };
      }

      case 'why_even': {
        const wItem = {
          q: 'For N = 21 and a = 4, the period is r = 3 (odd). Why can\'t we extract factors?',
          choices: [
            'Because 21 is too large',
            'Because a^(r/2) = 4^(3/2) is not an integer — we need an even period',
            'Because gcd always returns 1 for odd periods',
            'Because the QFT fails on odd numbers',
          ],
          answer: 'B', display: 'B) a^(r/2) is not an integer — we need an even period',
          steps: ['r = 3 is odd.', 'a^(r/2) = 4^(1.5) = 8 — not an integer mod operation we can use.', 'Solution: pick a new a.'],
        };
        const pItem = {
          q: 'What happens if the period r found by Shor\'s algorithm is odd?',
          choices: [
            'The algorithm still works — just use r directly',
            'The algorithm fails for this a; try a different random a',
            'An odd period means N is prime',
            'You double r to make it even',
          ],
          answer: 'B', display: 'B) The algorithm fails for this a; try a different random a',
          steps: ['An odd r means a^(r/2) is not an integer.', 'We cannot compute the GCD step.', 'Pick a new random a — even r has probability ≥ 1/2.'],
        };
        return {
          teachingText: teachingMap.why_even,
          workedExample: {
            problem: wItem.q,
            steps: [...wItem.steps, `Answer: ${wItem.display}`],
            insight: `Shor's algorithm is probabilistic — it may need a few random choices of a, but succeeds quickly in expectation.`,
          },
          tryIt: {
            question: pItem.q,
            choices: pItem.choices,
            answer: pItem.answer,
            answerType: 'choice',
            answerDisplay: pItem.display,
            steps: pItem.steps,
            whyItMatters:
              `Understanding failure modes is important: Shor's algorithm is probabilistic, ` +
              `but each attempt takes polynomial time, so retrying is cheap.`,
          },
        };
      }

      default:
        return this.generate(difficulty, 'basic');
    }
  },
},

qft_concept: {
  generate(difficulty, variation) {
    const allItems = {
      classical_vs_quantum: {
        q: 'The classical FFT on N points takes O(N log N) time. How does the Quantum Fourier Transform compare?',
        choices: [
          'O(N log N) — same as classical',
          'O(N²) — slower than classical',
          'O((log N)²) — exponentially faster',
          'O(1) — instant',
        ],
        answer: 'C', display: 'C) O((log N)²) — exponentially faster',
        steps: ['Classical FFT: O(N log N).', 'QFT: O(n²) = O((log N)²) gates on n qubits.', 'Exponential speedup over classical FFT.'],
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
        steps: ['Fourier transform: decompose a signal into frequencies.', 'QFT: transform quantum state to frequency basis.', 'Like a prism splitting white light into a spectrum.'],
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
        steps: ['Choosing a: classical O(1).', 'Modular exponentiation: prepared in superposition.', 'QFT: reveals the period — this is the quantum speedup.', 'GCD: classical O((log N)²).'],
      },
    };

    const poolMap = {
      classical_vs_quantum: ['classical_vs_quantum'],
      qft_analogy: ['qft_analogy'],
      where_speedup: ['where_speedup'],
    };
    const pool = poolMap[variation] || ['classical_vs_quantum', 'qft_analogy', 'where_speedup'];

    const wKey = pool[randInt(0, pool.length - 1)];
    let pKey;
    do { pKey = pool[randInt(0, pool.length - 1)]; } while (pKey === wKey && pool.length > 1);
    const w = allItems[wKey], p = allItems[pKey];

    const teachingMap = {
      classical_vs_quantum:
        `The Quantum Fourier Transform (QFT) is the quantum version of the classical Discrete ` +
        `Fourier Transform (DFT).\n\n` +
        `Classical FFT: O(N log N) operations on N data points.\n` +
        `QFT: O(n²) = O((log N)²) quantum gates on n = log₂(N) qubits.\n\n` +
        `This exponential speedup comes from quantum parallelism: the QFT processes all 2^n ` +
        `amplitudes simultaneously. However, we can't read all the amplitudes — measurement ` +
        `gives only one outcome, but it's enough to extract the period.`,
      qft_analogy:
        `Think of the QFT like a prism:\n\n` +
        `• White light → prism → spectrum of colors (frequencies)\n` +
        `• Quantum state → QFT → frequency components of the state\n\n` +
        `In Shor's algorithm, the modular exponentiation creates a state with a hidden ` +
        `periodic structure. The QFT "splits" this state to reveal the period, just as ` +
        `a prism reveals the hidden colors in white light.\n\n` +
        `The mathematical basis: QFT maps |j⟩ to (1/√N) Σ_k e^(2πijk/N) |k⟩.`,
      where_speedup:
        `Shor's algorithm has four main steps:\n\n` +
        `1. Pick random a < N (classical, trivial)\n` +
        `2. Compute a^x mod N in superposition (quantum)\n` +
        `3. Apply QFT to extract the period (quantum — this is the key!)\n` +
        `4. Use GCD to find factors (classical, fast)\n\n` +
        `The QFT in step 3 is where the exponential speedup happens. It finds the period ` +
        `in O((log N)²) time, whereas the best classical period-finding takes O(N^(1/2)) or worse.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['classical_vs_quantum'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps, `Answer: ${w.display}`],
        insight: `The QFT is the computational engine of Shor's algorithm — without it, period finding would be exponentially slower.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `The QFT is one of the most important quantum subroutines. It powers not just Shor's ` +
          `algorithm but also quantum phase estimation, which underpins many quantum algorithms.`,
      },
    };
  },
},

shor_full: {
  generate(difficulty, variation) {
    const allItems = {
      steps_in_order: {
        q: 'What is the correct order of steps in Shor\'s algorithm?',
        choices: [
          '1) QFT → 2) Pick random a → 3) Factor → 4) Compute GCD',
          '1) Pick random a → 2) Compute a^x mod N in superposition → 3) QFT to find period → 4) Compute GCD to get factors',
          '1) Compute GCD → 2) QFT → 3) Pick random a → 4) Factor',
          '1) Factor N → 2) Verify with QFT → 3) Compute GCD → 4) Pick a',
        ],
        answer: 'B', display: 'B) Pick a → Compute a^x mod N → QFT → GCD',
        steps: ['1. Pick random a, check gcd(a,N)=1.', '2. Quantum: compute a^x mod N in superposition.', '3. Quantum: QFT to find period r.', '4. Classical: gcd(a^(r/2)±1, N) → factors.'],
      },
      quantum_vs_classical_steps: {
        q: 'Which part of Shor\'s algorithm is performed on a quantum computer?',
        choices: [
          'All steps are quantum',
          'Only the GCD computation',
          'Period finding via modular exponentiation + QFT',
          'Only choosing random a',
        ],
        answer: 'C', display: 'C) Period finding via modular exponentiation + QFT',
        steps: ['Picking a: classical.', 'Modular exponentiation + QFT: quantum.', 'GCD: classical.', 'Shor\'s is a hybrid classical-quantum algorithm.'],
      },
      complexity: {
        q: 'What is the time complexity of Shor\'s algorithm for factoring an n-digit number?',
        choices: [
          'O(2^n) — exponential',
          'O(n³) — polynomial',
          'O(n!) — factorial',
          'O(√(2^n)) — same as Grover on factoring',
        ],
        answer: 'B', display: 'B) O(n³) — polynomial',
        steps: ['Shor\'s runs in O((log N)³).', 'n = log N digits, so O(n³).', 'Classical best: sub-exponential.', 'Exponential-to-polynomial speedup.'],
      },
      implications: {
        q: 'Which cryptographic system would be broken by Shor\'s algorithm?',
        choices: [
          'AES-256 symmetric encryption',
          'SHA-256 hashing',
          'RSA and elliptic curve cryptography',
          'One-time pads',
        ],
        answer: 'C', display: 'C) RSA and elliptic curve cryptography',
        steps: ['RSA: broken (factoring).', 'ECC: broken (discrete log).', 'AES: only quadratically weakened (Grover).', 'One-time pads: information-theoretically secure.'],
      },
    };

    const poolMap = {
      steps_in_order: ['steps_in_order'],
      quantum_vs_classical_steps: ['quantum_vs_classical_steps'],
      complexity: ['complexity'],
      implications: ['implications'],
    };
    const pool = poolMap[variation] || Object.keys(allItems);

    const wKey = pool[randInt(0, pool.length - 1)];
    let pKey;
    do { pKey = pool[randInt(0, pool.length - 1)]; } while (pKey === wKey && pool.length > 1);
    const w = allItems[wKey], p = allItems[pKey];

    const teachingMap = {
      steps_in_order:
        `Let's put it all together. Shor's algorithm has four steps:\n\n` +
        `1. **Choose random a** < N with gcd(a, N) = 1 (classical)\n` +
        `2. **Modular exponentiation** — compute a^x mod N for all x in superposition (quantum)\n` +
        `3. **QFT** — apply quantum Fourier transform to find period r (quantum)\n` +
        `4. **Extract factors** — compute gcd(a^(r/2) ± 1, N) (classical)\n\n` +
        `If r is odd or gives trivial factors, go back to step 1 with a new a. ` +
        `Expected number of attempts: ~2.`,
      quantum_vs_classical_steps:
        `Shor's algorithm is a hybrid: some steps are classical, some are quantum.\n\n` +
        `Classical steps:\n` +
        `• Choosing random a (fast, trivial)\n` +
        `• Computing GCD via Euclidean algorithm (fast, O((log N)²))\n\n` +
        `Quantum steps:\n` +
        `• Setting up superposition of a^x mod N for all x\n` +
        `• Applying QFT to reveal the period\n\n` +
        `The quantum computer is only needed for the hard part: period finding.`,
      complexity:
        `Shor's algorithm runs in O((log N)³) time — polynomial in the number of digits n = log N.\n\n` +
        `Compare with classical algorithms:\n` +
        `• Trial division: O(√N) = O(10^(n/2)) — exponential\n` +
        `• General Number Field Sieve: e^(O(n^(1/3)(log n)^(2/3))) — sub-exponential\n` +
        `• Shor: O(n³) — polynomial!\n\n` +
        `This exponential speedup is the most dramatic advantage quantum computers are known to provide.`,
      implications:
        `Shor's algorithm has profound implications for cryptography:\n\n` +
        `Broken by Shor's:\n` +
        `• RSA — based on factoring\n` +
        `• Elliptic Curve Cryptography — based on discrete logarithm\n` +
        `• Diffie-Hellman key exchange — based on discrete logarithm\n\n` +
        `NOT broken by Shor's:\n` +
        `• AES — symmetric encryption (Grover gives only √ speedup; double the key)\n` +
        `• Lattice-based cryptography — the leading post-quantum candidate\n` +
        `• One-time pads — provably unbreakable`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['steps_in_order'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps, `Answer: ${w.display}`],
        insight: `Shor's algorithm is the reason quantum computing went from a curiosity to a national security priority.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `Shor's algorithm demonstrates the most important known quantum advantage: ` +
          `an exponential speedup for a problem of enormous practical significance.`,
      },
    };
  },
},

// ── Chapter 20: The Landscape — Where Quantum Computing Is Now ───────────────

qubit_tech: {
  generate(difficulty, variation) {
    const items = {
      match_ibm: {
        q: 'What qubit technology does IBM primarily use in its quantum processors (e.g., Eagle, Heron)?',
        choices: ['Trapped ions', 'Superconducting transmon qubits', 'Photonic qubits', 'Neutral atoms'],
        answer: 'B', display: 'B) Superconducting transmon qubits',
        steps: ['IBM uses superconducting transmon qubits cooled to ~15 mK.', 'Answer: B) Superconducting transmon qubits'],
      },
      match_ionq: {
        q: 'What qubit technology does IonQ use?',
        choices: ['Superconducting circuits', 'Topological qubits', 'Trapped ions (ytterbium)', 'Photonic qubits'],
        answer: 'C', display: 'C) Trapped ions (ytterbium)',
        steps: ['IonQ traps ytterbium ions using electromagnetic fields.', 'Answer: C) Trapped ions (ytterbium)'],
      },
      match_google: {
        q: 'What qubit technology did Google use in Sycamore and Willow?',
        choices: ['Neutral atoms in optical tweezers', 'Superconducting transmon qubits', 'NV centers in diamond', 'Trapped ions'],
        answer: 'B', display: 'B) Superconducting transmon qubits',
        steps: ['Google Quantum AI uses superconducting transmon qubits.', 'Answer: B) Superconducting transmon qubits'],
      },
      match_quantinuum: {
        q: 'What qubit technology does Quantinuum use?',
        choices: ['Superconducting qubits', 'Photonic qubits', 'Trapped ions', 'Spin qubits in silicon'],
        answer: 'C', display: 'C) Trapped ions',
        steps: ['Quantinuum inherited trapped-ion tech from Honeywell.', 'Answer: C) Trapped ions'],
      },
      tradeoff_ions: {
        q: 'What is a key advantage of trapped-ion qubits over superconducting qubits?',
        choices: ['Faster gate speeds', 'Higher gate fidelities and longer coherence times', 'Easier to manufacture', 'No vacuum needed'],
        answer: 'B', display: 'B) Higher gate fidelities and longer coherence times',
        steps: ['Trapped ions: coherence times of seconds, gate fidelities >99.8%.', 'Tradeoff: slower gates (~ms vs ~ns).', 'Answer: B)'],
      },
      tradeoff_sc: {
        q: 'What is a key advantage of superconducting qubits over trapped ions?',
        choices: ['Longer coherence times', 'Higher gate fidelity', 'Much faster gate speeds (~10-100 ns)', 'All-to-all connectivity'],
        answer: 'C', display: 'C) Much faster gate speeds (~10-100 ns)',
        steps: ['Superconducting gates: ~10-100 ns, ~1000x faster than trapped ions.', 'Answer: C)'],
      },
      current_scale: {
        q: 'As of 2025, roughly how many physical qubits do the largest processors have?',
        choices: ['About 10-50', 'About 100-200', 'About 1,000-1,200', 'About 100,000+'],
        answer: 'C', display: 'C) About 1,000-1,200',
        steps: ['IBM Condor: 1,121 qubits. Atom Computing: 1,225 qubits.', 'Answer: C) About 1,000-1,200'],
      },
      neutral_atoms: {
        q: 'Which company is a leading developer of neutral-atom quantum computers?',
        choices: ['IBM', 'IonQ', 'QuEra Computing', 'Quantinuum'],
        answer: 'C', display: 'C) QuEra Computing',
        steps: ['QuEra uses neutral atoms in optical tweezers.', 'Answer: C) QuEra Computing'],
      },
    };

    const poolMap = {
      match_company: ['match_ibm', 'match_ionq', 'match_google', 'match_quantinuum'],
      tradeoffs: ['tradeoff_ions', 'tradeoff_sc'],
      current_scale: ['current_scale', 'neutral_atoms'],
    };
    const pool = poolMap[variation] || ['match_ibm', 'match_ionq', 'match_google', 'tradeoff_ions', 'current_scale'];

    const wKey = pool[randInt(0, pool.length - 1)];
    let pKey;
    do { pKey = pool[randInt(0, pool.length - 1)]; } while (pKey === wKey && pool.length > 1);
    const w = items[wKey], p = items[pKey];

    const teachingMap = {
      match_company:
        `Multiple companies are racing to build quantum computers, each using different ` +
        `physical technologies:\n\n` +
        `- IBM and Google use superconducting transmon qubits — tiny circuits cooled to ` +
        `near absolute zero (~15 millikelvin) in dilution refrigerators.\n\n` +
        `- IonQ and Quantinuum use trapped ions — individual atoms held by electromagnetic ` +
        `fields, manipulated with laser pulses.\n\n` +
        `Each approach has different strengths in gate speed, fidelity, and scalability.`,
      tradeoffs:
        `The two leading qubit technologies have complementary strengths:\n\n` +
        `Superconducting qubits: very fast gates (~10-100 ns), but short coherence times ` +
        `(~100 microseconds) and limited connectivity between qubits.\n\n` +
        `Trapped ions: extremely high fidelity (>99.8%), long coherence (seconds), and ` +
        `all-to-all connectivity, but much slower gates (~1 ms).\n\n` +
        `The "best" technology depends on the algorithm and application.`,
      current_scale:
        `As of 2025, the largest quantum processors have reached ~1,000-1,200 physical qubits:\n\n` +
        `- IBM Condor (2023): 1,121 superconducting qubits\n` +
        `- Atom Computing (2023): 1,225 neutral-atom qubits\n\n` +
        `However, raw qubit count is misleading — what matters is qubit quality (fidelity, ` +
        `coherence) and connectivity. Most useful quantum computing today happens on ` +
        `processors with 50-200 high-quality qubits.\n\n` +
        `Neutral atoms (QuEra, Atom Computing) are an emerging third approach alongside ` +
        `superconducting and trapped-ion systems.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['match_company'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps],
        insight: `The quantum computing hardware landscape is diverse — different physical approaches offer different tradeoffs in speed, fidelity, and scalability.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `Understanding the hardware landscape helps you evaluate quantum computing ` +
          `claims and choose the right platform for different applications.`,
      },
    };
  },
},

nisq_concept: {
  generate(difficulty, variation) {
    const items = {
      define_nisq: {
        q: 'What does NISQ stand for?',
        choices: ['New Intermediate-Scale Quantum', 'Noisy Intermediate-Scale Quantum', 'Non-Ideal Scalable Quantum', 'Narrow Input Superposition Quantum'],
        answer: 'B', display: 'B) Noisy Intermediate-Scale Quantum',
        steps: ['NISQ = Noisy Intermediate-Scale Quantum, coined by Preskill in 2018.', 'Answer: B)'],
      },
      nisq_era_meaning: {
        q: 'What defines the NISQ era?',
        choices: ['Perfect quantum computers', '50-1000+ qubits with limited error correction', 'Noise simulation computers', 'Room-temperature quantum computers'],
        answer: 'B', display: 'B) 50-1000+ qubits with limited error correction',
        steps: ['NISQ: enough qubits for non-trivial tasks, but errors limit circuit depth.', 'Answer: B)'],
      },
      why_not_shor: {
        q: 'Why can\'t current quantum computers break RSA encryption?',
        choices: ['Shor\'s hasn\'t been invented', 'RSA doesn\'t use numbers', '~4,000 logical (millions of physical) qubits needed', 'Shor\'s is classical only'],
        answer: 'C', display: 'C) ~4,000 logical (millions of physical) qubits needed',
        steps: ['Shor\'s algorithm exists but requires fault-tolerant qubits.', '~4,000 logical qubits needed, meaning millions of physical qubits.', 'Answer: C)'],
      },
      what_works_vqe: {
        q: 'Which algorithm type is best suited for NISQ devices?',
        choices: ['Shor\'s factoring', 'Variational algorithms (VQE, QAOA)', 'Grover on 10^18 items', 'Full error correction codes'],
        answer: 'B', display: 'B) Variational algorithms (VQE, QAOA)',
        steps: ['Variational algorithms use short circuits tolerant of noise.', 'VQE estimates molecular energies; QAOA tackles optimization.', 'Answer: B)'],
      },
      what_works_chemistry: {
        q: 'What is a leading near-term application of NISQ quantum computers?',
        choices: ['Replacing classical computers', 'Simulating small molecules', 'Cracking all encryption', 'Running AGI'],
        answer: 'B', display: 'B) Simulating small molecules and chemical reactions',
        steps: ['Quantum computers naturally simulate quantum systems.', 'Small molecules have been simulated on NISQ devices.', 'Answer: B)'],
      },
      noise_source: {
        q: 'What is the primary source of errors in NISQ quantum computers?',
        choices: ['Software bugs', 'Decoherence and imperfect gate operations', 'Classical measurement errors', 'Nearby quantum computers'],
        answer: 'B', display: 'B) Decoherence and imperfect gate operations',
        steps: ['Decoherence: environment interaction destroys quantum info.', 'Gate errors compound: 1000 gates at 99.9% = ~37% total success.', 'Answer: B)'],
      },
    };

    const poolMap = {
      define_nisq: ['define_nisq', 'nisq_era_meaning'],
      why_not_shor: ['why_not_shor'],
      what_works: ['what_works_vqe', 'what_works_chemistry', 'noise_source'],
    };
    const pool = poolMap[variation] || ['define_nisq', 'why_not_shor', 'what_works_vqe'];

    const wKey = pool[randInt(0, pool.length - 1)];
    let pKey;
    do { pKey = pool[randInt(0, pool.length - 1)]; } while (pKey === wKey && pool.length > 1);
    const w = items[wKey], p = items[pKey];

    const teachingMap = {
      define_nisq:
        `We are in the NISQ era — "Noisy Intermediate-Scale Quantum." This term, ` +
        `coined by physicist John Preskill in 2018, perfectly captures where we are:\n\n` +
        `"Noisy" — every gate operation introduces small errors, and qubits lose their ` +
        `quantum state (decohere) within microseconds to seconds.\n\n` +
        `"Intermediate-Scale" — we have 50 to ~1,200 physical qubits. Enough for ` +
        `interesting experiments, but far too few for full error correction.\n\n` +
        `The NISQ era is a transitional period between "toy" quantum computers and ` +
        `the fault-tolerant machines needed for Shor's algorithm.`,
      why_not_shor:
        `You learned Shor's algorithm can factor large numbers efficiently. So why ` +
        `isn't RSA broken yet?\n\n` +
        `The answer is scale. Breaking RSA-2048 requires ~4,000 error-corrected logical ` +
        `qubits. Each logical qubit needs 1,000-10,000 physical qubits for error correction. ` +
        `That means millions of physical qubits total.\n\n` +
        `Current devices have ~1,000 noisy physical qubits — roughly 1,000-10,000x short ` +
        `of what's needed. This is why post-quantum cryptography is being developed ` +
        `proactively, before quantum computers catch up.`,
      what_works:
        `What CAN today's quantum computers do? The answer: variational algorithms ` +
        `and small-scale quantum simulations.\n\n` +
        `Variational Quantum Eigensolver (VQE) estimates molecular ground-state energies ` +
        `using short circuits. QAOA tackles combinatorial optimization problems.\n\n` +
        `These hybrid classical-quantum algorithms are designed for NISQ hardware — they ` +
        `use shallow circuits that complete before decoherence destroys the computation.\n\n` +
        `The most promising near-term application is quantum chemistry: simulating ` +
        `molecules and materials for drug discovery and new materials.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['define_nisq'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps],
        insight: `The NISQ era is defined by having enough qubits to be interesting, but too much noise to be universally useful.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `Understanding what NISQ devices can and cannot do helps you separate ` +
          `quantum computing hype from reality.`,
      },
    };
  },
},

quantum_advantage: {
  generate(difficulty, variation) {
    const items = {
      google_claim: {
        q: 'In 2019, Google claimed quantum supremacy with Sycamore. What did it do?',
        choices: ['Broke RSA encryption', 'Simulated a protein', 'Sampling task: 200 sec vs ~10,000 years classically', 'Factored a 2048-bit number'],
        answer: 'C', display: 'C) Sampling task in 200 sec vs ~10,000 years classically',
        steps: ['Sycamore (53 qubits) did random circuit sampling.', 'Google estimated 10,000 years on classical Summit supercomputer.', 'Answer: C)'],
      },
      ibm_dispute: {
        q: 'Why did IBM dispute Google\'s 2019 quantum supremacy claim?',
        choices: ['Too many errors', 'Classical simulation possible in ~2.5 days with better algorithms', 'IBM\'s computer was faster', 'Violated physics'],
        answer: 'B', display: 'B) Classical simulation possible in ~2.5 days with better algorithms',
        steps: ['IBM proposed using 250 PB of storage to speed up classical simulation.', 'The "supremacy" boundary depends on classical optimization.', 'Answer: B)'],
      },
      practical_vs_theoretical: {
        q: 'What is the difference between "quantum advantage" and "quantum utility"?',
        choices: ['Same thing', 'Advantage = any task faster; utility = useful problem faster', 'Utility is marketing', 'Advantage = cryptography only'],
        answer: 'B', display: 'B) Advantage = any task faster; utility = useful real-world problem faster',
        steps: ['Advantage: outperform classical on ANY task.', 'Utility: outperform on a PRACTICAL, useful task.', 'Answer: B)'],
      },
      willow_2024: {
        q: 'What breakthrough did Google\'s Willow chip (2024) demonstrate?',
        choices: ['1 million qubits', 'Below-threshold error correction — more qubits reduced errors', 'Room-temp qubits', 'Factored RSA-2048'],
        answer: 'B', display: 'B) Below-threshold error correction',
        steps: ['Willow showed increasing code distance reduced logical error rates.', 'This proves error correction works as theory predicts.', 'Answer: B)'],
      },
      no_useful_yet: {
        q: 'Have quantum computers solved any commercially important problem faster than classical?',
        choices: ['Yes, drug discovery', 'Yes, broke RSA', 'Not yet — only specialized non-practical problems', 'Yes, Google search'],
        answer: 'C', display: 'C) Not yet — advantage only on specialized problems',
        steps: ['Advantage shown on sampling tasks, not practical applications.', 'Near-term candidates: molecular simulation, optimization.', 'Answer: C)'],
      },
    };

    const poolMap = {
      google_claim: ['google_claim'],
      debate: ['ibm_dispute'],
      practical_vs_theoretical: ['practical_vs_theoretical', 'willow_2024', 'no_useful_yet'],
    };
    const pool = poolMap[variation] || ['google_claim', 'ibm_dispute', 'practical_vs_theoretical'];

    const wKey = pool[randInt(0, pool.length - 1)];
    let pKey;
    do { pKey = pool[randInt(0, pool.length - 1)]; } while (pKey === wKey && pool.length > 1);
    const w = items[wKey], p = items[pKey];

    const teachingMap = {
      google_claim:
        `In October 2019, Google published a landmark paper in Nature claiming ` +
        `"quantum supremacy" — the first demonstration that a quantum computer ` +
        `could perform a specific task faster than any classical computer.\n\n` +
        `Their 53-qubit Sycamore processor completed a random circuit sampling ` +
        `task in 200 seconds. Google estimated this would take the Summit ` +
        `supercomputer approximately 10,000 years.\n\n` +
        `This was a milestone, but it's important to note: the task was specifically ` +
        `designed to be hard for classical computers, not to solve a practical problem.`,
      debate:
        `IBM immediately challenged Google's claim, arguing that with 250 petabytes ` +
        `of disk storage, a classical computer could complete the task in about 2.5 days ` +
        `— not 10,000 years.\n\n` +
        `This debate reveals a crucial subtlety: "quantum supremacy" depends on the ` +
        `BEST KNOWN classical algorithm. As classical algorithms improve, the bar for ` +
        `quantum advantage keeps moving.\n\n` +
        `Since 2019, classical tensor network methods have further narrowed the gap ` +
        `for random circuit sampling, though quantum still appears faster.`,
      practical_vs_theoretical:
        `There's an important distinction between types of quantum advantage:\n\n` +
        `Quantum advantage: a quantum computer outperforms the best classical ` +
        `computer at ANY well-defined task (even an artificial one).\n\n` +
        `Quantum utility: a quantum computer outperforms classical on a PRACTICAL, ` +
        `commercially relevant problem.\n\n` +
        `Google's 2019 result and their 2024 Willow chip showed advantage, but on ` +
        `specially designed benchmarks. The holy grail is utility — solving real ` +
        `problems in chemistry, optimization, or machine learning faster than classical.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['google_claim'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps],
        insight: `Quantum advantage has been demonstrated, but practical quantum utility for real-world problems remains the next milestone.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `Understanding the nuance between "quantum advantage" and "quantum utility" ` +
          `helps you evaluate claims critically and understand the true state of the field.`,
      },
    };
  },
},

fault_tolerance_path: {
  generate(difficulty, variation) {
    const items = {
      physical_per_logical: {
        q: 'How many physical qubits per fault-tolerant logical qubit (surface codes)?',
        choices: ['1-5', '10-50', '1,000-10,000', 'Exactly 2'],
        answer: 'C', display: 'C) 1,000-10,000',
        steps: ['Surface codes need large physical qubit arrays per logical qubit.', 'Estimate: 1,000-10,000 physical per logical.', 'Answer: C)'],
      },
      error_correction_idea: {
        q: 'What is the basic idea behind quantum error correction?',
        choices: ['Repeat and majority vote', 'Encode one logical qubit across many physical qubits', 'Classical double-checking', 'Cool to absolute zero'],
        answer: 'B', display: 'B) Encode across many physical qubits',
        steps: ['Spread quantum info across multiple physical qubits.', 'Syndrome measurements detect errors without collapsing state.', 'Answer: B)'],
      },
      shor_logical: {
        q: 'How many logical qubits to run Shor\'s on RSA-2048?',
        choices: ['About 50', 'About 4,000', 'About 10', 'About 1 million'],
        answer: 'B', display: 'B) About 4,000',
        steps: ['Shor\'s for RSA-2048 needs ~4,000 logical qubits (Gidney & Ekera, 2021).', 'Answer: B)'],
      },
      total_physical: {
        q: 'Total physical qubits needed to factor RSA-2048?',
        choices: ['About 10,000', 'About 100,000', 'Several million to tens of millions', 'About 1,000'],
        answer: 'C', display: 'C) Several million to tens of millions',
        steps: ['~4,000 logical x ~1,000-10,000 physical each = millions total.', 'Answer: C)'],
      },
      timeline: {
        q: 'When might fault-tolerant quantum computers be available?',
        choices: ['They exist today', 'By 2027', 'Likely 2030s or later', 'Mathematically impossible'],
        answer: 'C', display: 'C) Likely 2030s or later',
        steps: ['Google Willow (2024) showed below-threshold error correction.', 'Commercial fault tolerance expected in the 2030s.', 'Answer: C)'],
      },
      surface_code: {
        q: 'What is the surface code?',
        choices: ['A programming language', 'A QEC code with qubits on a 2D grid', 'A quantum encryption method', 'A classical error correction code'],
        answer: 'B', display: 'B) A QEC code with qubits on a 2D grid',
        steps: ['Surface code: 2D lattice of physical qubits, error threshold ~1%.', 'Answer: B)'],
      },
    };

    const poolMap = {
      physical_to_logical: ['physical_per_logical', 'error_correction_idea'],
      shor_requirements: ['shor_logical'],
      total_physical: ['total_physical', 'timeline', 'surface_code'],
    };
    const pool = poolMap[variation] || ['physical_per_logical', 'shor_logical', 'total_physical'];

    const wKey = pool[randInt(0, pool.length - 1)];
    let pKey;
    do { pKey = pool[randInt(0, pool.length - 1)]; } while (pKey === wKey && pool.length > 1);
    const w = items[wKey], p = items[pKey];

    const teachingMap = {
      physical_to_logical:
        `The path from today's noisy qubits to useful fault-tolerant quantum computers ` +
        `requires quantum error correction (QEC).\n\n` +
        `The basic idea: encode one "logical" qubit across many "physical" qubits. ` +
        `Errors on individual physical qubits can be detected and corrected without ` +
        `destroying the quantum information (using syndrome measurements).\n\n` +
        `The surface code — the leading QEC scheme — requires roughly 1,000-10,000 ` +
        `physical qubits per logical qubit, depending on the physical error rate.`,
      shor_requirements:
        `To run Shor's algorithm on RSA-2048 (the gold standard benchmark), you need ` +
        `approximately 4,000 error-corrected logical qubits.\n\n` +
        `This estimate comes from Gidney and Ekera (2021), who optimized the circuit ` +
        `implementation. The qubits are used for modular exponentiation, the quantum ` +
        `Fourier transform, and ancilla operations.\n\n` +
        `4,000 logical qubits may sound small, but remember: each one requires ` +
        `thousands of physical qubits for error correction.`,
      total_physical:
        `Putting it all together:\n\n` +
        `- Shor's on RSA-2048: ~4,000 logical qubits\n` +
        `- Error correction: ~1,000-10,000 physical per logical\n` +
        `- Total: ~4 million to 20+ million physical qubits\n\n` +
        `Current state: ~1,000 physical qubits (2025)\n` +
        `Gap: ~1,000-10,000x more qubits needed\n\n` +
        `Google's Willow chip (2024) showed below-threshold error correction — proving ` +
        `the concept works. But scaling to millions of qubits is a massive engineering ` +
        `challenge. Most experts expect commercially useful fault tolerance in the 2030s.`,
    };

    return {
      teachingText: teachingMap[variation] || teachingMap['physical_to_logical'],
      workedExample: {
        problem: w.q,
        steps: [...w.steps],
        insight: `The gap between current NISQ devices (~1,000 qubits) and fault-tolerant machines (~millions) defines the central engineering challenge of quantum computing.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `Understanding the scale of the fault-tolerance challenge gives you a realistic ` +
          `picture of the quantum computing timeline — not hype, not pessimism, just engineering reality.`,
      },
    };
  },
},

graduation: {
  generate(difficulty, variation) {
    const items = {
      next_step: {
        q: 'You\'ve completed Quantum Primer! Which resource would you explore first?',
        choices: [
          'IBM Qiskit — Python SDK with real hardware access',
          'Google Cirq — Python framework for NISQ algorithms',
          'Xanadu PennyLane — quantum machine learning',
          'Research papers on arXiv quant-ph',
        ],
        answer: 'A', display: 'A) IBM Qiskit (all are great choices!)',
        steps: ['All four are excellent.', 'Qiskit has the largest community and free hardware.', 'Answer: A)'],
      },
    };

    const w = items['next_step'], p = items['next_step'];

    return {
      teachingText:
        `Congratulations — you've completed Quantum Primer!\n\n` +
        `You now understand the mathematical foundations (vectors, complex numbers, ` +
        `matrices), the core quantum concepts (superposition, entanglement, measurement), ` +
        `quantum gates and circuits, and even real algorithms (Deutsch-Jozsa, Grover's, ` +
        `Shor's).\n\n` +
        `You also understand the current landscape: NISQ devices, the race for quantum ` +
        `advantage, and the long road to fault tolerance.\n\n` +
        `The next step is to write and run real quantum code. Here are your best options:\n\n` +
        `- IBM Qiskit (qiskit.org) — the most popular open-source quantum SDK, with free ` +
        `access to real quantum hardware via IBM Quantum\n` +
        `- Google Cirq (quantumai.google/cirq) — great for NISQ algorithms research\n` +
        `- Xanadu PennyLane (pennylane.ai) — the go-to for quantum machine learning\n` +
        `- arXiv quant-ph — stay current with the latest research papers`,
      workedExample: {
        problem: 'Which resource has the largest beginner community and free hardware access?',
        steps: ['IBM Qiskit has the largest community, most tutorials, and free quantum hardware.', 'Answer: IBM Qiskit'],
        insight: `You don't need a quantum computer to start — all these frameworks include simulators you can run on your laptop today.`,
      },
      tryIt: {
        question: p.q,
        choices: p.choices,
        answer: p.answer,
        answerType: 'choice',
        answerDisplay: p.display,
        steps: p.steps,
        whyItMatters:
          `You've built a solid foundation. The quantum revolution is still in its early ` +
          `days — the skills you've learned here put you ahead of the curve. Go build something!`,
      },
    };
  },
},

};