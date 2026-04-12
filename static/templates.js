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

// ── Templates ────────────────────────────────────────────────────────────────

export const TEMPLATES = {

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

};
