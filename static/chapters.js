/**
 * CHAPTERS — curriculum data for Quantum Primer.
 *
 * Each chapter has:
 *  id           — 1-5
 *  title        — display name
 *  color        — CSS variable string
 *  darkColor    — darker shade for button borders
 *  problemTypes — array of problem type IDs for practice/quiz
 *  quizCount    — number of problems in the quiz
 *  quizPass     — minimum correct answers to pass
 *  description  — one-line summary for the chapter detail modal
 *  lessonSteps  — array of { title, html, problemType } — one page per concept
 */
export const CHAPTERS = [
  {
    id: 1,
    title: 'Algebra Refresher',
    color: 'var(--ch1)',
    darkColor: 'var(--ch1-dk)',
    problemTypes: ['linear_equation', 'substitution', 'square_root', 'exponent'],
    quizCount: 10,
    quizPass: 8,
    description: 'Equations, substitution, roots, and powers — the toolkit for everything that follows.',
    lessonSteps: [
      {
        title: 'Solving Linear Equations',
        html: `
          <p>A linear equation has one unknown. Solve it by doing the same operation to both sides until the unknown is alone.</p>
          <div class="concept-card">
            Rule: whatever you do to one side, do to the other.<br><br>
            ax + b = c &nbsp;→&nbsp; subtract b, then divide by a.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Solve: 3x − 5 = 10<br>
            Step 1 — add 5 to both sides: &nbsp; 3x = 15<br>
            Step 2 — divide both sides by 3: &nbsp; x = 5<br>
            Check: 3(5) − 5 = 15 − 5 = 10 ✓
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Whatever you do to one side, you must do to the other.</p>
        `,
        problemType: 'linear_equation',
      },
      {
        title: 'Substitution',
        html: `
          <p>When you know the value of a variable, replace it and compute. Exponents come before multiplication.</p>
          <div class="concept-card">
            Order of operations: Exponents → Multiply → Add/Subtract<br><br>
            If x = 3, find: 2x² + 1<br>
            Square first: x² = 9 → multiply: 18 → add: 19
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            If x = 4, find: 3x² − 2<br>
            Step 1 — square first: &nbsp; x² = 4² = 16<br>
            Step 2 — multiply: &nbsp;&nbsp;&nbsp;&nbsp; 3 × 16 = 48<br>
            Step 3 — subtract: &nbsp;&nbsp;&nbsp;&nbsp; 48 − 2 = 46
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Common mistake: computing 2x = 6 then squaring. Don't — exponents bind tighter.</p>
        `,
        problemType: 'substitution',
      },
      {
        title: 'Square Roots',
        html: `
          <p>√n asks: what number times itself equals n? For perfect squares the answer is always a whole number.</p>
          <div class="concept-card">
            √4=2 &nbsp; √9=3 &nbsp; √16=4 &nbsp; √25=5 &nbsp; √36=6<br>
            √49=7 &nbsp; √64=8 &nbsp; √81=9 &nbsp; √100=10<br>
            √121=11 &nbsp; √144=12 &nbsp; √169=13
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Find √144<br>
            Ask: what number × itself = 144?<br>
            Try 12: &nbsp; 12 × 12 = 144 ✓<br>
            Answer: √144 = 12
          </div>
          <p style="color:var(--text-muted);font-size:13px;">You'll use square roots constantly for vector and complex number magnitudes.</p>
        `,
        problemType: 'square_root',
      },
      {
        title: 'Exponents',
        html: `
          <p>aⁿ means multiply a by itself n times. Small bases raised to small powers are worth memorising.</p>
          <div class="concept-card">
            2¹=2 &nbsp; 2²=4 &nbsp; 2³=8 &nbsp; 2⁴=16 &nbsp; 2⁵=32<br>
            3²=9 &nbsp; 3³=27 &nbsp; 4²=16 &nbsp; 5²=25 &nbsp; 5³=125<br>
            10²=100 &nbsp; 10³=1000
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Compute 2⁴<br>
            Write it out: &nbsp; 2 × 2 × 2 × 2<br>
            Multiply pairs: &nbsp; (2×2) × (2×2) = 4 × 4 = 16<br>
            Answer: 2⁴ = 16
          </div>
          <p style="color:var(--text-muted);font-size:13px;">In quantum mechanics |α|² appears constantly — that's the probability of a measurement outcome.</p>
        `,
        problemType: 'exponent',
      },
    ],
  },

  {
    id: 2,
    title: 'Vectors in 2D',
    color: 'var(--ch2)',
    darkColor: 'var(--ch2-dk)',
    problemTypes: ['vector_addition', 'scalar_multiplication', 'vector_magnitude'],
    quizCount: 10,
    quizPass: 8,
    description: 'Quantum states ARE vectors. Master the fundamentals here.',
    lessonSteps: [
      {
        title: 'What a Vector Is',
        html: `
          <p>A vector is an ordered pair of numbers (x, y) representing both a direction and a magnitude. In quantum mechanics, a qubit's state is a vector.</p>
          <div class="concept-card">
            (3, 4) → 3 units right, 4 units up<br>
            (1, 0) → points purely in the x-direction<br>
            (0, 1) → points purely in the y-direction<br>
            (-2, 5) → 2 units left, 5 units up
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Add (2, 3) + (4, −1)<br>
            Step 1 — add x-components: &nbsp; 2 + 4 = 6<br>
            Step 2 — add y-components: &nbsp; 3 + (−1) = 2<br>
            Answer: (6, 2)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Write your answer as two numbers separated by a comma: x, y</p>
        `,
        problemType: 'vector_addition',
      },
      {
        title: 'Vector Addition',
        html: `
          <p>Add vectors component-by-component. Think of it as walking: take path A, then path B — where do you end up?</p>
          <div class="concept-card">
            Rule: (a, b) + (c, d) = (a+c, b+d)<br><br>
            Add each component separately — x with x, y with y.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            (5, −2) + (−3, 6)<br>
            Step 1 — x-components: &nbsp; 5 + (−3) = 2<br>
            Step 2 — y-components: &nbsp; −2 + 6 = 4<br>
            Answer: (2, 4)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Order doesn't matter: (a,b) + (c,d) = (c,d) + (a,b).</p>
        `,
        problemType: 'vector_addition',
      },
      {
        title: 'Scalar Multiplication',
        html: `
          <p>Multiply every component by a scalar (a plain number). This stretches, shrinks, or flips the vector.</p>
          <div class="concept-card">
            Rule: k × (a, b) = (k·a, k·b)<br><br>
            Multiply the scalar into EVERY component separately.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            4 × (3, −2)<br>
            Step 1 — multiply x: &nbsp; 4 × 3 = 12<br>
            Step 2 — multiply y: &nbsp; 4 × (−2) = −8<br>
            Answer: (12, −8)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Multiplying a qubit state by a scalar changes its scale, not its direction.</p>
        `,
        problemType: 'scalar_multiplication',
      },
      {
        title: 'Vector Magnitude',
        html: `
          <p>The magnitude (length) of a vector is the distance from the origin to its tip — Pythagorean theorem with the components as legs.</p>
          <div class="concept-card">
            |(a, b)| = √(a² + b²)<br><br>
            Square each component, add them, then take the square root.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Find |(5, 12)|<br>
            Step 1 — square: &nbsp; 5² = 25, &nbsp; 12² = 144<br>
            Step 2 — add: &nbsp;&nbsp;&nbsp; 25 + 144 = 169<br>
            Step 3 — root: &nbsp;&nbsp; √169 = 13<br>
            Answer: 13
          </div>
          <p style="color:var(--text-muted);font-size:13px;">A magnitude of 1 is special — that's a "unit vector." Coming up next chapter.</p>
        `,
        problemType: 'vector_magnitude',
      },
    ],
  },

  {
    id: 3,
    title: 'Unit Vectors',
    color: 'var(--ch3)',
    darkColor: 'var(--ch3-dk)',
    problemTypes: ['normalize_vector', 'unit_vector_check', 'probability_from_components'],
    quizCount: 8,
    quizPass: 6,
    description: 'Unit vectors are the key link between linear algebra and quantum probability.',
    lessonSteps: [
      {
        title: 'What Makes a Unit Vector',
        html: `
          <p>A unit vector has magnitude exactly equal to 1. Compute the magnitude — if it equals 1, it's a unit vector.</p>
          <div class="concept-card">
            Check: compute |(a, b)| = √(a² + b²)<br>
            If the result = 1 → unit vector ✓<br>
            If the result ≠ 1 → not a unit vector ✗
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Is (0.8, 0.6) a unit vector?<br>
            Step 1 — square: &nbsp; 0.8² = 0.64, &nbsp; 0.6² = 0.36<br>
            Step 2 — add: &nbsp;&nbsp;&nbsp; 0.64 + 0.36 = 1.00<br>
            Step 3 — root: &nbsp;&nbsp; √1.00 = 1 ✓<br>
            Answer: yes
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Answer yes or no below.</p>
        `,
        problemType: 'unit_vector_check',
      },
      {
        title: 'Normalizing a Vector',
        html: `
          <p>To turn any vector into a unit vector, divide each component by the magnitude. This is normalization.</p>
          <div class="concept-card">
            Steps: (1) find the magnitude, (2) divide each component by it.<br><br>
            Normalize (a, b): &nbsp; (a / |v|, &nbsp; b / |v|)
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Normalize (5, 12)<br>
            Step 1 — magnitude: &nbsp; √(25 + 144) = √169 = 13<br>
            Step 2 — divide x: &nbsp;&nbsp; 5 ÷ 13 ≈ 0.38<br>
            Step 3 — divide y: &nbsp;&nbsp; 12 ÷ 13 ≈ 0.92<br>
            Answer: (0.38, 0.92)<br>
            Check: 0.38² + 0.92² ≈ 1.00 ✓
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Pythagorean triples (3,4,5) and (5,12,13) give clean decimal results.</p>
        `,
        problemType: 'normalize_vector',
      },
      {
        title: 'Quantum Probability',
        html: `
          <p>A qubit state |ψ⟩ = α|0⟩ + β|1⟩ must be a unit vector because probabilities must sum to 1.</p>
          <div class="concept-card">
            P(measure |0⟩) = α² &nbsp;&nbsp; P(measure |1⟩) = β²<br><br>
            α² + β² = 1 &nbsp; (the unit vector condition)
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            |ψ⟩ = 0.8|0⟩ + 0.6|1⟩ — find P(|0⟩)<br>
            Step 1 — identify α: &nbsp; α = 0.8<br>
            Step 2 — square it: &nbsp;&nbsp; 0.8² = 0.64<br>
            Answer: P(|0⟩) = 0.64 &nbsp;(64%)<br>
            Sanity check: P(|1⟩) = 0.6² = 0.36 → 0.64 + 0.36 = 1 ✓
          </div>
          <p style="color:var(--text-muted);font-size:13px;">|α|² + |β|² = 1 is exactly the unit vector condition.</p>
        `,
        problemType: 'probability_from_components',
      },
    ],
  },

  {
    id: 4,
    title: 'Complex Numbers',
    color: 'var(--ch4)',
    darkColor: 'var(--ch4-dk)',
    problemTypes: ['complex_addition', 'complex_multiplication', 'complex_conjugate', 'complex_magnitude'],
    quizCount: 10,
    quizPass: 8,
    description: 'Quantum amplitudes are complex numbers. This chapter unlocks the full picture.',
    lessonSteps: [
      {
        title: 'The Imaginary Unit i',
        html: `
          <p>i is defined as √(−1), so i² = −1. A complex number is written a + bi — a real part and an imaginary part that always stay separate.</p>
          <div class="concept-card">
            i¹ = i &nbsp; i² = −1 &nbsp; i³ = −i &nbsp; i⁴ = 1<br><br>
            3 + 4i → real part: 3, imaginary part: 4<br>
            To add: combine real with real, imaginary with imaginary.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            (3 + 5i) + (2 + 1i)<br>
            Step 1 — real parts: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 3 + 2 = 5<br>
            Step 2 — imaginary parts: &nbsp; 5 + 1 = 6<br>
            Answer: 5 + 6i
          </div>
          <p style="color:var(--text-muted);font-size:13px;">A complex number a + bi has a real part (a) and imaginary part (b). They always stay separate.</p>
        `,
        problemType: 'complex_addition',
      },
      {
        title: 'Addition & Subtraction',
        html: `
          <p>Add real parts together and imaginary parts together. Keep them separate.</p>
          <div class="concept-card">
            Rule: (a + bi) + (c + di) = (a+c) + (b+d)i<br><br>
            Real parts combine with real parts.<br>
            Imaginary parts combine with imaginary parts.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            (4 + 2i) + (1 + 5i)<br>
            Step 1 — real parts: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 4 + 1 = 5<br>
            Step 2 — imaginary parts: &nbsp; 2 + 5 = 7<br>
            Answer: 5 + 7i
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Format your answer as: a + bi &nbsp; (e.g. 3 + 2i, or 5 - i)</p>
        `,
        problemType: 'complex_addition',
      },
      {
        title: 'Multiplication',
        html: `
          <p>Use FOIL, then substitute i² = −1 to fold the imaginary part back into the real part.</p>
          <div class="concept-card">
            FOIL: (a+bi)(c+di) = ac + adi + bci + bdi²<br>
            Then replace i² with −1 and combine like terms.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            (3 + 2i)(1 + 4i)<br>
            FOIL: &nbsp; 3·1 + 3·4i + 2i·1 + 2i·4i<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = 3 + 12i + 2i + 8i²<br>
            Replace i²: &nbsp; 8i² = 8(−1) = −8<br>
            Combine: &nbsp; (3 − 8) + (12 + 2)i = −5 + 14i
          </div>
          <p style="color:var(--text-muted);font-size:13px;">The key step: replace i² with −1 every time you see it.</p>
        `,
        problemType: 'complex_multiplication',
      },
      {
        title: 'Complex Conjugate',
        html: `
          <p>The conjugate of (a + bi) is (a − bi) — flip the sign of the imaginary part only. Written as (a+bi)*.</p>
          <div class="concept-card">
            Rule: flip the sign of the imaginary part only.<br><br>
            Key property: (a+bi)(a−bi) = a² + b² &nbsp;(always real!)
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Find the conjugate of (5 − 3i)<br>
            Step 1 — keep real part: &nbsp; 5 (unchanged)<br>
            Step 2 — flip imaginary sign: &nbsp; −3i becomes +3i<br>
            Answer: 5 + 3i<br>
            Verify: (5−3i)(5+3i) = 25 + 9 = 34 &nbsp;(real ✓)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Conjugates appear everywhere in quantum — used to compute probabilities.</p>
        `,
        problemType: 'complex_conjugate',
      },
      {
        title: 'Complex Magnitude',
        html: `
          <p>The magnitude of a complex number is its distance from zero — same formula as vector magnitude.</p>
          <div class="concept-card">
            |a + bi| = √(a² + b²)<br><br>
            Square the real part, square the imaginary part, add, then root.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Find |5 + 12i|<br>
            Step 1 — square: &nbsp; 5² = 25, &nbsp; 12² = 144<br>
            Step 2 — add: &nbsp;&nbsp;&nbsp; 25 + 144 = 169<br>
            Step 3 — root: &nbsp;&nbsp; √169 = 13<br>
            Answer: 13
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Note: |a+bi|² = a² + b² — this is probability in quantum mechanics.</p>
        `,
        problemType: 'complex_magnitude',
      },
    ],
  },

  {
    id: 5,
    title: 'Matrices',
    color: 'var(--ch5)',
    darkColor: 'var(--ch5-dk)',
    problemTypes: ['matrix_vector_multiply', 'matrix_matrix_multiply', 'identity_matrix'],
    quizCount: 8,
    quizPass: 6,
    description: 'Quantum gates are matrices. This is the last piece before quantum mechanics.',
    lessonSteps: [
      {
        title: 'What a 2×2 Matrix Is',
        html: `
          <p>A matrix is a grid of numbers. In quantum computing every gate — every operation on a qubit — is a 2×2 matrix. Applying it to a vector means multiplying row-by-component.</p>
          <div class="concept-card">
            [[a,b],[c,d]] × (x,y) = (ax+by, cx+dy)<br><br>
            Row 1 dotted with the vector → output x<br>
            Row 2 dotted with the vector → output y
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            [[3, 1], [2, 4]] × (2, 5)<br>
            Row 1: &nbsp; 3×2 + 1×5 = 6 + 5 = 11<br>
            Row 2: &nbsp; 2×2 + 4×5 = 4 + 20 = 24<br>
            Answer: (11, 24)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Format: x, y &nbsp; (e.g. 11, 24)</p>
        `,
        problemType: 'matrix_vector_multiply',
      },
      {
        title: 'Matrix × Vector',
        html: `
          <p>Multiply each row of the matrix by the vector (dot product). Each row produces one output component.</p>
          <div class="concept-card">
            [[a,b],[c,d]] × (x,y) = (ax+by, cx+dy)<br><br>
            Row 1 · vector → output x<br>
            Row 2 · vector → output y
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            [[2, 1], [0, 3]] × (4, 2)<br>
            Row 1: &nbsp; 2×4 + 1×2 = 8 + 2 = 10<br>
            Row 2: &nbsp; 0×4 + 3×2 = 0 + 6 = 6<br>
            Answer: (10, 6)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Format: x, y &nbsp; (e.g. 1, 3)</p>
        `,
        problemType: 'matrix_vector_multiply',
      },
      {
        title: 'Matrix × Matrix',
        html: `
          <p>Multiply two matrices: each output element is a dot product of a row from the first with a column from the second.</p>
          <div class="concept-card">
            Result[row][col] = (row of A) · (col of B)<br><br>
            Do this for all 4 positions: top-left, top-right, bot-left, bot-right.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            [[2, 0], [1, 3]] × [[1, 4], [2, 1]]<br>
            Top-left: &nbsp; 2×1 + 0×2 = 2<br>
            Top-right: &nbsp;2×4 + 0×1 = 8<br>
            Bot-left: &nbsp; 1×1 + 3×2 = 7<br>
            Bot-right: &nbsp;1×4 + 3×1 = 7<br>
            Answer: [[2, 8], [7, 7]] &nbsp;→&nbsp; write as: 2 8; 7 7
          </div>
          <p style="color:var(--text-muted);font-size:13px;">⚠️ A×B ≠ B×A. Gate order in quantum circuits matters for this reason.</p>
        `,
        problemType: 'matrix_matrix_multiply',
      },
      {
        title: 'The Identity Matrix',
        html: `
          <p>The identity matrix I leaves any vector or matrix unchanged when multiplied. It's the "do nothing" gate.</p>
          <div class="concept-card">
            I = [[1, 0], [0, 1]]<br><br>
            Diagonal is all 1s. Everything else is 0.<br>
            I × A = A &nbsp; for any matrix A ✓
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            [[3, 5], [2, 7]] × I = ?<br>
            [[3, 5], [2, 7]] × [[1, 0], [0, 1]]<br>
            Top-left:  &nbsp;3×1 + 5×0 = 3<br>
            Top-right: &nbsp;3×0 + 5×1 = 5<br>
            Bot-left:  &nbsp;2×1 + 7×0 = 2<br>
            Bot-right: &nbsp;2×0 + 7×1 = 7<br>
            Answer: 3 5; 2 7 — unchanged ✓
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Every valid quantum gate is a special matrix. More in Phase 2.</p>
        `,
        problemType: 'identity_matrix',
      },
    ],
  },
];
