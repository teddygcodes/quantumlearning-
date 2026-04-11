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

  {
    id: 6,
    title: 'Dirac Notation',
    color: 'var(--ch6)',
    darkColor: 'var(--ch6-dk)',
    problemTypes: ['ket_to_vector', 'inner_product', 'orthogonality_check', 'dirac_probability'],
    quizCount: 10,
    quizPass: 8,
    description: 'Kets, bras, and inner products — the language physicists use for quantum states.',
    lessonSteps: [
      {
        title: 'Kets Are Vectors',
        html: `
          <p>In Dirac notation a quantum state is written as a <strong>ket</strong> |ψ⟩. The two basis kets map directly to column vectors:</p>
          <div class="concept-card">
            |0⟩ = (1, 0) &nbsp;&nbsp; |1⟩ = (0, 1)<br><br>
            Any qubit state: α|0⟩ + β|1⟩ = (α, β)
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Write 3|0⟩ + 4|1⟩ as a vector.<br>
            Step 1 — α = 3, β = 4<br>
            Step 2 — the vector is (α, β) = (3, 4)<br>
            Answer: (3, 4)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Format: x, y</p>
        `,
        problemType: 'ket_to_vector',
      },
      {
        title: 'Bras and Inner Products',
        html: `
          <p>The <strong>bra</strong> ⟨ψ| is the conjugate transpose of the ket. The inner product ⟨ψ|φ⟩ is a dot product — multiply matching components and add.</p>
          <div class="concept-card">
            ⟨ψ|φ⟩ = ψ₁*φ₁ + ψ₂*φ₂ &nbsp; (dot product)<br><br>
            For real vectors: ⟨ψ|φ⟩ = ψ₁φ₁ + ψ₂φ₂
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Find ⟨ψ|φ⟩ where |ψ⟩ = (3, 4) and |φ⟩ = (2, 5).<br>
            Step 1 — multiply component-wise: 3×2 = 6, &nbsp; 4×5 = 20<br>
            Step 2 — add: 6 + 20 = 26<br>
            Answer: 26
          </div>
          <p style="color:var(--text-muted);font-size:13px;">The inner product gives a single number, not a vector.</p>
        `,
        problemType: 'inner_product',
      },
      {
        title: 'Orthogonality',
        html: `
          <p>Two states are <strong>orthogonal</strong> when their inner product is zero — they are completely distinguishable.</p>
          <div class="concept-card">
            ⟨ψ|φ⟩ = 0 &nbsp;→&nbsp; orthogonal (perpendicular)<br><br>
            Key fact: ⟨0|1⟩ = (1)(0) + (0)(1) = 0<br>
            The computational basis states are always orthogonal.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Are |ψ⟩ = (3, 4) and |φ⟩ = (4, −3) orthogonal?<br>
            Step 1 — compute ⟨ψ|φ⟩: 3×4 + 4×(−3) = 12 − 12 = 0<br>
            Step 2 — inner product = 0 → orthogonal ✓<br>
            Answer: yes
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Answer yes or no.</p>
        `,
        problemType: 'orthogonality_check',
      },
      {
        title: 'Probability via Inner Product',
        html: `
          <p>The probability of measuring a basis state is the squared magnitude of the inner product with that state.</p>
          <div class="concept-card">
            P(|0⟩) = |⟨0|ψ⟩|²<br><br>
            Since ⟨0| = (1, 0), we get ⟨0|ψ⟩ = α, so P = α².<br>
            This is the Born rule in Dirac notation.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            |ψ⟩ = 0.6|0⟩ + 0.8|1⟩. Find P(|0⟩).<br>
            Step 1 — ⟨0|ψ⟩ = 0.6<br>
            Step 2 — P = |0.6|² = 0.36<br>
            Answer: 0.36
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Enter a decimal (e.g. 0.36).</p>
        `,
        problemType: 'dirac_probability',
      },
      {
        title: 'Putting It All Together',
        html: `
          <p>You now have all the tools: kets as vectors, inner products, and the Born rule. Let's practice the full workflow of finding a measurement probability from a quantum state.</p>
          <div class="concept-card">
            Given |ψ⟩ = α|0⟩ + β|1⟩:<br>
            P(|0⟩) = |⟨0|ψ⟩|² = |α|² = α²<br>
            P(|1⟩) = |⟨1|ψ⟩|² = |β|² = β²<br><br>
            The two probabilities always sum to 1.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            |ψ⟩ = 0.8|0⟩ + 0.6|1⟩. Find P(|1⟩).<br>
            Step 1 — identify β: β = 0.6<br>
            Step 2 — square it: P(|1⟩) = 0.6² = 0.36<br>
            Answer: 0.36
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Enter a decimal (e.g. 0.36).</p>
        `,
        problemType: 'dirac_probability',
      },
    ],
  },

  {
    id: 7,
    title: 'Quantum Gates',
    color: 'var(--ch7)',
    darkColor: 'var(--ch7-dk)',
    problemTypes: ['pauli_gate_apply', 'hadamard_apply', 'gate_then_measure', 'two_gate_compose'],
    quizCount: 10,
    quizPass: 8,
    description: 'Pauli gates, Hadamard, and gate composition — the building blocks of quantum circuits.',
    lessonSteps: [
      {
        title: 'Pauli X — The NOT Gate',
        html: `
          <p>The Pauli X gate swaps |0⟩ and |1⟩ — it is the quantum NOT gate.</p>
          <div class="concept-card">
            X = [[0, 1], [1, 0]]<br><br>
            X|0⟩ = |1⟩ &nbsp;&nbsp; X|1⟩ = |0⟩<br>
            X flips the two amplitudes: X(α, β) = (β, α)
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Apply X to |ψ⟩ = (3, 5).<br>
            X = [[0,1],[1,0]]<br>
            Row 1: 0×3 + 1×5 = 5<br>
            Row 2: 1×3 + 0×5 = 3<br>
            Answer: (5, 3)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Format: x, y</p>
        `,
        problemType: 'pauli_gate_apply',
      },
      {
        title: 'Pauli Z — Phase Flip',
        html: `
          <p>The Pauli Z gate leaves |0⟩ alone but flips the sign of |1⟩. It changes the <em>phase</em> without changing probabilities.</p>
          <div class="concept-card">
            Z = [[1, 0], [0, −1]]<br><br>
            Z|0⟩ = |0⟩ &nbsp;&nbsp; Z|1⟩ = −|1⟩<br>
            Z(α, β) = (α, −β)
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Apply Z to |ψ⟩ = (3, 5).<br>
            Z = [[1,0],[0,−1]]<br>
            Row 1: 1×3 + 0×5 = 3<br>
            Row 2: 0×3 + (−1)×5 = −5<br>
            Answer: (3, −5)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Z only affects the second component's sign.</p>
        `,
        problemType: 'pauli_gate_apply',
      },
      {
        title: 'Pauli Z — Phase Flip',
        html: `
          <p>The Pauli Z gate leaves |0⟩ alone but <strong>negates</strong> the |1⟩ component. It flips the phase, not the bit.</p>
          <div class="concept-card">
            Z = [[1, 0], [0, −1]]<br><br>
            Z|0⟩ = |0⟩ &nbsp;&nbsp; Z|1⟩ = −|1⟩<br>
            Row 1: 1×a + 0×b = a<br>
            Row 2: 0×a + (−1)×b = −b
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Apply Z to (0.6, 0.8).<br>
            Step 1 — Z = [[1,0],[0,−1]]<br>
            Step 2 — Row 1: 1×0.6 + 0×0.8 = 0.6<br>
            Step 3 — Row 2: 0×0.6 + (−1)×0.8 = −0.8<br>
            Answer: (0.6, −0.8)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Z is a phase gate — it changes the sign of the |1⟩ amplitude but keeps probabilities the same.</p>
        `,
        problemType: 'pauli_gate_apply',
      },
      {
        title: 'The Hadamard Gate',
        html: `
          <p>The Hadamard gate creates superposition — it maps basis states to equal mixtures of |0⟩ and |1⟩.</p>
          <div class="concept-card">
            H = (1/√2) [[1, 1], [1, −1]]<br><br>
            H|0⟩ = (1/√2)(|0⟩+|1⟩) = (0.71, 0.71)<br>
            H|1⟩ = (1/√2)(|0⟩−|1⟩) = (0.71, −0.71)
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Apply H to |0⟩ = (1, 0).<br>
            H = (1/√2)[[1,1],[1,−1]] ≈ [[0.71, 0.71],[0.71, −0.71]]<br>
            Row 1: 0.71×1 + 0.71×0 = 0.71<br>
            Row 2: 0.71×1 + (−0.71)×0 = 0.71<br>
            Answer: (0.71, 0.71)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Format: x, y (rounded to 2 decimal places)</p>
        `,
        problemType: 'hadamard_apply',
      },
      {
        title: 'Gate Then Measure',
        html: `
          <p>Apply a gate to a state, then compute the probability of measuring |0⟩ from the output state.</p>
          <div class="concept-card">
            Recipe:<br>
            1. Apply gate: |ψ'⟩ = G|ψ⟩<br>
            2. Read off the first component α'<br>
            3. P(|0⟩) = |α'|²
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Apply H to |0⟩, then find P(|0⟩).<br>
            Step 1 — H|0⟩ = (0.71, 0.71)<br>
            Step 2 — α' = 0.71<br>
            Step 3 — P(|0⟩) = 0.71² ≈ 0.50<br>
            Answer: 0.50
          </div>
          <p style="color:var(--text-muted);font-size:13px;">This is the Hadamard gate's signature: equal 50/50 superposition.</p>
        `,
        problemType: 'gate_then_measure',
      },
      {
        title: 'Composing Two Gates',
        html: `
          <p>Applying gate B then gate A is the same as multiplying the matrices: result = A × B × |ψ⟩. Apply B first, then A to the result.</p>
          <div class="concept-card">
            Two-gate circuit: |ψ⟩ → B → A → |ψ'⟩<br>
            |ψ'⟩ = A(B|ψ⟩)<br><br>
            Apply the gates left to right through the circuit,<br>
            but right to left in the math.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Apply X then Z to |ψ⟩ = (3, 4).<br>
            Step 1 — apply X first: X(3, 4) = (4, 3)<br>
            Step 2 — apply Z to result: Z(4, 3) = (4, −3)<br>
            Answer: (4, −3)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Format: x, y</p>
        `,
        problemType: 'two_gate_compose',
      },
    ],
  },

  {
    id: 8,
    title: 'Measurement',
    color: 'var(--ch8)',
    darkColor: 'var(--ch8-dk)',
    problemTypes: ['born_rule_complex', 'valid_state_check', 'expected_counts', 'missing_amplitude'],
    quizCount: 8,
    quizPass: 6,
    description: 'The Born rule, state collapse, and what happens when you look at a qubit.',
    lessonSteps: [
      {
        title: 'Born Rule with Complex Amplitudes',
        html: `
          <p>When amplitudes are complex, probability uses the conjugate: P = |α|² = α*α = a² + b² where α = a + bi.</p>
          <div class="concept-card">
            If α = a + bi, then |α|² = a² + b²<br><br>
            This is the complex magnitude squared — same as Chapter 4.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            |ψ⟩ = (3 + 4i)|0⟩ (unnormalized). Find |α|².<br>
            Step 1 — α = 3 + 4i<br>
            Step 2 — |α|² = 3² + 4² = 9 + 16 = 25<br>
            Answer: 25
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Enter a number.</p>
        `,
        problemType: 'born_rule_complex',
      },
      {
        title: 'Valid Quantum States',
        html: `
          <p>A valid quantum state must satisfy the normalization condition: |α|² + |β|² = 1.</p>
          <div class="concept-card">
            Check: |α|² + |β|² = 1?<br><br>
            If yes → valid quantum state<br>
            If no → not a valid quantum state
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Is (0.6, 0.8) a valid quantum state?<br>
            Step 1 — |0.6|² = 0.36<br>
            Step 2 — |0.8|² = 0.64<br>
            Step 3 — 0.36 + 0.64 = 1.00 ✓<br>
            Answer: yes
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Answer yes or no.</p>
        `,
        problemType: 'valid_state_check',
      },
      {
        title: 'From Probability to Expected Counts',
        html: `
          <p>If you prepare the same quantum state many times and measure each copy, you can predict how many times you'll see each outcome.</p>
          <div class="concept-card">
            Expected count of |0⟩ = N × P(|0⟩) = N × |α|²<br>
            Expected count of |1⟩ = N × P(|1⟩) = N × |β|²<br><br>
            N = total number of copies measured.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            |ψ⟩ = 0.8|0⟩ + 0.6|1⟩. Measure 200 copies. Expected |0⟩ count?<br>
            Step 1 — P(|0⟩) = 0.8² = 0.64<br>
            Step 2 — Expected count = 200 × 0.64 = 128<br>
            Answer: 128
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Enter a number (e.g. 128).</p>
        `,
        problemType: 'expected_counts',
      },
      {
        title: 'Expected Counts',
        html: `
          <p>If you prepare the same state N times and measure each copy, the expected count for |0⟩ is N × P(|0⟩).</p>
          <div class="concept-card">
            Expected count = N × |α|²<br><br>
            This is a prediction — actual results fluctuate,<br>
            but the average converges as N grows.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            |ψ⟩ = 0.6|0⟩ + 0.8|1⟩. Measure 100 copies. Expected |0⟩ count?<br>
            Step 1 — P(|0⟩) = 0.6² = 0.36<br>
            Step 2 — Expected count = 100 × 0.36 = 36<br>
            Answer: 36
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Enter a number.</p>
        `,
        problemType: 'expected_counts',
      },
      {
        title: 'Finding a Missing Amplitude',
        html: `
          <p>If you know one amplitude and the state is valid, you can find the other using |α|² + |β|² = 1.</p>
          <div class="concept-card">
            Given α, find β:<br>
            |β|² = 1 − |α|²<br>
            β = √(1 − |α|²)
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            |ψ⟩ = 0.6|0⟩ + β|1⟩. Find β (positive).<br>
            Step 1 — |α|² = 0.6² = 0.36<br>
            Step 2 — |β|² = 1 − 0.36 = 0.64<br>
            Step 3 — β = √0.64 = 0.8<br>
            Answer: 0.8
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Enter a positive decimal.</p>
        `,
        problemType: 'missing_amplitude',
      },
    ],
  },

  // ── Chapter 9: Two-Qubit Systems (Tensor Products) ─────────────────────────

  {
    id: 9,
    title: 'Tensor Products',
    color: 'var(--ch9)',
    darkColor: 'var(--ch9-dk)',
    problemTypes: ['two_qubit_basis', 'tensor_product', 'two_qubit_state', 'separable_check'],
    quizCount: 10,
    quizPass: 8,
    description: 'Two-qubit systems use tensor products to combine individual qubit states into joint states.',
    lessonSteps: [
      {
        title: 'Two-Qubit Basis States',
        html: `
          <p>A single qubit lives in a 2D space with basis |0⟩ and |1⟩. Two qubits together live in a 4D space with basis states |00⟩, |01⟩, |10⟩, and |11⟩.</p>
          <div class="concept-card">
            |00⟩ = (1, 0, 0, 0)<br>
            |01⟩ = (0, 1, 0, 0)<br>
            |10⟩ = (0, 0, 1, 0)<br>
            |11⟩ = (0, 0, 0, 1)<br><br>
            The first digit is qubit A, the second is qubit B.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Write |10⟩ as a 4-vector.<br>
            |10⟩ means qubit A = |1⟩, qubit B = |0⟩.<br>
            It is the 3rd basis state (counting from |00⟩).<br>
            Answer: (0, 0, 1, 0)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Format: a, b, c, d — four numbers separated by commas.</p>
        `,
        problemType: 'two_qubit_basis',
      },
      {
        title: 'The Tensor Product',
        html: `
          <p>The tensor product ⊗ combines two 2-vectors into one 4-vector. It describes the joint state of two independent qubits.</p>
          <div class="concept-card">
            (a, b) ⊗ (c, d) = (ac, ad, bc, bd)<br><br>
            Multiply each element of the first vector by the entire second vector, then lay the results end to end.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example 1</div>
            |1⟩ ⊗ |0⟩ = (0, 1) ⊗ (1, 0)<br>
            = (0×1, 0×0, 1×1, 1×0)<br>
            = (0, 0, 1, 0) = |10⟩ ✓
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example 2</div>
            (0.71, 0.71) ⊗ (1, 0)<br>
            = (0.71×1, 0.71×0, 0.71×1, 0.71×0)<br>
            = (0.71, 0, 0.71, 0)<br>
            This is (|0⟩+|1⟩)/√2 tensored with |0⟩.
          </div>
          <p style="color:var(--text-muted);font-size:13px;">The tensor product is NOT the same as a dot product or cross product.</p>
        `,
        problemType: 'tensor_product',
      },
      {
        title: 'Building a Joint State',
        html: `
          <p>When two independent qubits each have their own state, you combine them into a joint two-qubit state using the tensor product: A ⊗ B.</p>
          <div class="concept-card">
            Qubit A = (α, β), Qubit B = (γ, δ)<br>
            A ⊗ B = (αγ, αδ, βγ, βδ)<br><br>
            Multiply each component of A by each component of B, in order.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Qubit A = (0.8, 0.6), Qubit B = (0, 1). Find A ⊗ B.<br>
            Step 1 — αγ = 0.8 × 0 = 0<br>
            Step 2 — αδ = 0.8 × 1 = 0.8<br>
            Step 3 — βγ = 0.6 × 0 = 0<br>
            Step 4 — βδ = 0.6 × 1 = 0.6<br>
            Answer: (0, 0.8, 0, 0.6)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Enter four values separated by commas (e.g. 0, 0.8, 0, 0.6).</p>
        `,
        problemType: 'two_qubit_state',
      },
      {
        title: 'Building Joint States',
        html: `
          <p>When two qubits are independent, their joint state is the tensor product of the individual states. This is how you go from knowing each qubit separately to describing them together.</p>
          <div class="concept-card">
            If qubit A = (α, β) and qubit B = (γ, δ), then:<br>
            Joint state = A ⊗ B = (αγ, αδ, βγ, βδ)
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Qubit A = (0.6, 0.8), Qubit B = (1, 0)<br>
            A ⊗ B = (0.6×1, 0.6×0, 0.8×1, 0.8×0)<br>
            = (0.6, 0, 0.8, 0)<br>
            This means: 60% amplitude on |00⟩, 80% on |10⟩.
          </div>
          <p style="color:var(--text-muted);font-size:13px;">If you can write a two-qubit state as a tensor product, the qubits are "independent" (separable).</p>
        `,
        problemType: 'two_qubit_state',
      },
      {
        title: 'More Tensor Products',
        html: `
          <p>Let's practice the tensor product with non-basis states. The formula is the same — multiply every component of the first vector by every component of the second.</p>
          <div class="concept-card">
            (a, b) ⊗ (c, d) = (ac, ad, bc, bd)<br><br>
            Works for any two 2-vectors, not just quantum states.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            (1, 1) ⊗ (0, 1) = ?<br>
            Step 1 — 1×0 = 0<br>
            Step 2 — 1×1 = 1<br>
            Step 3 — 1×0 = 0<br>
            Step 4 — 1×1 = 1<br>
            Answer: (0, 1, 0, 1)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Enter four values separated by commas.</p>
        `,
        problemType: 'tensor_product',
      },
      {
        title: 'Separable vs Entangled (Preview)',
        html: `
          <p>Some two-qubit states CAN be written as a tensor product — these are <strong>separable</strong>. Others CANNOT — those are <strong>entangled</strong>. Entanglement is what makes quantum computing powerful.</p>
          <div class="concept-card">
            Test: state (a, b, c, d) is separable if a×d = b×c.<br><br>
            Separable: (1, 0, 0, 0) → 1×0 = 0×0 ✓<br>
            Entangled: (0.71, 0, 0, 0.71) → 0.71×0.71 ≠ 0×0 ✗
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Is (0.5, 0.5, 0.5, 0.5) separable?<br>
            Check: a×d = 0.5 × 0.5 = 0.25<br>
            Check: b×c = 0.5 × 0.5 = 0.25<br>
            0.25 = 0.25 ✓ → Yes, separable!<br>
            It equals (0.71, 0.71) ⊗ (0.71, 0.71).
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Entangled states are the subject of the next chapter.</p>
        `,
        problemType: 'separable_check',
      },
    ],
  },

  // ── Chapter 10: Entanglement & Bell States ─────────────────────────────────

  {
    id: 10,
    title: 'Entanglement',
    color: 'var(--ch10)',
    darkColor: 'var(--ch10-dk)',
    problemTypes: ['entanglement_check', 'cnot_apply', 'build_bell_state', 'entangled_measurement'],
    quizCount: 8,
    quizPass: 6,
    description: 'Entangled qubits share correlations that no classical system can replicate.',
    lessonSteps: [
      {
        title: 'What Is Entanglement?',
        html: `
          <p>An entangled state is a two-qubit state that CANNOT be written as a tensor product of two individual qubit states. The qubits are correlated in a way that has no classical explanation.</p>
          <div class="concept-card">
            Separable: can be factored as A ⊗ B.<br>
            Entangled: CANNOT be factored — the qubits are linked.<br><br>
            Test: (a, b, c, d) is entangled if a×d ≠ b×c.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Is (0.71, 0, 0, 0.71) entangled?<br>
            a×d = 0.71 × 0.71 = 0.50<br>
            b×c = 0 × 0 = 0<br>
            0.50 ≠ 0 → Yes, this state is entangled!<br>
            There is no way to write it as (x, y) ⊗ (z, w).
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Einstein called entanglement "spooky action at a distance."</p>
        `,
        problemType: 'entanglement_check',
      },
      {
        title: 'The CNOT Gate',
        html: `
          <p>CNOT (Controlled-NOT) is the key two-qubit gate. It flips the second qubit (target) only when the first qubit (control) is |1⟩.</p>
          <div class="concept-card">
            CNOT truth table:<br>
            |00⟩ → |00⟩ &nbsp;(control=0, no flip)<br>
            |01⟩ → |01⟩ &nbsp;(control=0, no flip)<br>
            |10⟩ → |11⟩ &nbsp;(control=1, flip!)<br>
            |11⟩ → |10⟩ &nbsp;(control=1, flip!)<br><br>
            Matrix: [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]]
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Apply CNOT to |10⟩:<br>
            Control qubit = |1⟩ → target gets flipped.<br>
            Target qubit |0⟩ → |1⟩.<br>
            Result: |11⟩ = (0, 0, 0, 1)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">CNOT + H together can create entanglement from scratch.</p>
        `,
        problemType: 'cnot_apply',
      },
      {
        title: 'Building Bell States',
        html: `
          <p>Bell states are the simplest entangled states. Build one by applying H to the first qubit (H⊗I), then CNOT.</p>
          <div class="concept-card">
            Recipe: |00⟩ → H⊗I → (0.71, 0, 0.71, 0) → CNOT → (0.71, 0, 0, 0.71)<br><br>
            The H creates a superposition, the CNOT entangles the qubits.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Build a Bell state from |00⟩:<br>
            Step 1 — H on qubit 1: (1,0) → (0.71, 0.71)<br>
            Tensor with qubit 2: (0.71, 0.71) ⊗ (1, 0) = (0.71, 0, 0.71, 0)<br>
            Step 2 — CNOT: |00⟩ stays, |10⟩ → |11⟩<br>
            0.71|00⟩ + 0.71|10⟩ → 0.71|00⟩ + 0.71|11⟩<br>
            Result: (0.71, 0, 0, 0.71) = |Φ+⟩
          </div>
          <p style="color:var(--text-muted);font-size:13px;">This is the circuit used in quantum teleportation and superdense coding.</p>
        `,
        problemType: 'build_bell_state',
      },
      {
        title: 'The Four Bell States',
        html: `
          <p>There are exactly four maximally entangled two-qubit states, called the Bell states. Each is built from a different basis state input.</p>
          <div class="concept-card">
            |Φ+⟩ = (0.71, 0, 0, 0.71) &nbsp; from |00⟩<br>
            |Ψ+⟩ = (0, 0.71, 0.71, 0) &nbsp; from |01⟩<br>
            |Φ-⟩ = (0.71, 0, 0, -0.71) &nbsp; from |10⟩<br>
            |Ψ-⟩ = (0, 0.71, -0.71, 0) &nbsp; from |11⟩
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Build |Ψ+⟩ from |01⟩:<br>
            Step 1 — H⊗I on |01⟩:<br>
            H on qubit 1: |0⟩ → (0.71, 0.71)<br>
            Tensor with |1⟩: (0.71, 0.71) ⊗ (0, 1) = (0, 0.71, 0, 0.71)<br>
            Step 2 — CNOT:<br>
            0.71|01⟩ → 0.71|01⟩, 0.71|11⟩ → 0.71|10⟩<br>
            Result: (0, 0.71, 0.71, 0) = |Ψ+⟩
          </div>
          <p style="color:var(--text-muted);font-size:13px;">The four Bell states form a basis for the two-qubit space.</p>
        `,
        problemType: 'build_bell_state',
      },
      {
        title: 'Measuring Entangled States',
        html: `
          <p>When you measure one qubit of an entangled pair, the other qubit's state is instantly determined. This is the "spooky" part of entanglement.</p>
          <div class="concept-card">
            For |Φ+⟩ = (0.71, 0, 0, 0.71):<br>
            If qubit 1 = |0⟩ → qubit 2 = |0⟩ (50% chance)<br>
            If qubit 1 = |1⟩ → qubit 2 = |1⟩ (50% chance)<br><br>
            The outcomes are perfectly correlated.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            State: |Ψ+⟩ = (0, 0.71, 0.71, 0)<br>
            This is 0.71|01⟩ + 0.71|10⟩.<br>
            Measure qubit 1 and get |0⟩:<br>
            Only |01⟩ has qubit 1 = |0⟩, so qubit 2 must be |1⟩.<br>
            Answer: qubit 2 = (0, 1)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">This correlation holds no matter how far apart the qubits are.</p>
        `,
        problemType: 'entangled_measurement',
      },
    ],
  },

  // ── Chapter 11: Quantum Circuits ───────────────────────────────────────────

  {
    id: 11,
    title: 'Quantum Circuits',
    color: 'var(--ch11)',
    darkColor: 'var(--ch11-dk)',
    problemTypes: ['trace_single_qubit', 'trace_two_qubit', 'circuit_probabilities', 'circuit_equivalence'],
    quizCount: 8,
    quizPass: 6,
    description: 'Quantum circuits are the programs of a quantum computer — wires carry qubits, boxes apply gates.',
    lessonSteps: [
      {
        title: 'Reading a Quantum Circuit',
        html: `
          <p>A quantum circuit is read left to right. Each horizontal wire represents a qubit. Boxes on the wires are gates applied in sequence.</p>
          <div class="concept-card">
            Wire = qubit<br>
            Box = gate (X, Z, H, etc.)<br>
            Left → Right = time order<br><br>
            The input is on the left, the output (or measurement) is on the right.
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Circuit: |0⟩ —[H]—[X]— output<br>
            Read left to right:<br>
            1. Start with |0⟩ = (1, 0)<br>
            2. Apply H: (0.71, 0.71)<br>
            3. Apply X: (0.71, 0.71) → swap → (0.71, 0.71)<br>
            Output: (0.71, 0.71)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Gates are applied in reading order — left gate first, right gate second.</p>
        `,
        problemType: 'trace_single_qubit',
      },
      {
        title: 'Tracing Single-Qubit Circuits',
        html: `
          <p>To trace a single-qubit circuit, apply each gate to the state vector one at a time, left to right.</p>
          <div class="concept-card">
            Key gates:<br>
            X (NOT): swaps |0⟩ and |1⟩ → (a, b) → (b, a)<br>
            Z (Phase): flips sign of |1⟩ → (a, b) → (a, -b)<br>
            H (Hadamard): → (a, b) → ((a+b)/√2, (a-b)/√2)
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Circuit: |0⟩ —[X]—[Z]—<br>
            Start: (1, 0)<br>
            After X: swap → (0, 1)<br>
            After Z: flip sign of |1⟩ → (0, -1)<br>
            Output: (0, -1)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">When using H, multiply by 1/√2 ≈ 0.71.</p>
        `,
        problemType: 'trace_single_qubit',
      },
      {
        title: 'Tracing Two-Qubit Circuits',
        html: `
          <p>Two-qubit circuits have two wires. Single-qubit gates act on one wire (using tensor product with I on the other). Two-qubit gates like CNOT act on both wires.</p>
          <div class="concept-card">
            X on qubit 1 only → apply X⊗I:<br>
            |00⟩→|10⟩, |01⟩→|11⟩, |10⟩→|00⟩, |11⟩→|01⟩<br><br>
            CNOT (control=qubit 1, target=qubit 2):<br>
            |00⟩→|00⟩, |01⟩→|01⟩, |10⟩→|11⟩, |11⟩→|10⟩
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Apply X⊗I to |01⟩:<br>
            X flips qubit 1: |0⟩ → |1⟩<br>
            I leaves qubit 2: |1⟩ → |1⟩<br>
            Result: |11⟩ = (0, 0, 0, 1)
          </div>
          <p style="color:var(--text-muted);font-size:13px;">Think of each gate as acting on the relevant qubit(s) independently.</p>
        `,
        problemType: 'trace_two_qubit',
      },
      {
        title: 'Circuit Output Probabilities',
        html: `
          <p>After tracing a circuit, the output state vector tells you the probability of each measurement outcome. Square each amplitude to get the probability.</p>
          <div class="concept-card">
            Output state (a, b) → P(|0⟩) = a², P(|1⟩) = b²<br><br>
            Common outputs:<br>
            (1, 0) → P(|0⟩) = 1 (certain)<br>
            (0.71, 0.71) → P(|0⟩) = 0.5 (coin flip)
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Circuit: |0⟩ —[H]— measure<br>
            H|0⟩ = (0.71, 0.71)<br>
            P(|0⟩) = 0.71² = 0.50<br>
            P(|1⟩) = 0.71² = 0.50<br>
            Total: 0.50 + 0.50 = 1.00 ✓
          </div>
          <p style="color:var(--text-muted);font-size:13px;">This is the Born rule — the fundamental law connecting quantum states to experimental outcomes.</p>
        `,
        problemType: 'circuit_probabilities',
      },
      {
        title: 'Circuit Equivalence',
        html: `
          <p>Two circuits are equivalent if they produce the same output state for every possible input. Some useful identities to know:</p>
          <div class="concept-card">
            HZH = X &nbsp;&nbsp; (conjugating Z by H gives X)<br>
            HXH = Z &nbsp;&nbsp; (conjugating X by H gives Z)<br>
            XX = I &nbsp;&nbsp;&nbsp; (two NOTs cancel out)<br>
            ZZ = I &nbsp;&nbsp;&nbsp; (two phase flips cancel)<br>
            HH = I &nbsp;&nbsp;&nbsp; (two Hadamards cancel)
          </div>
          <div class="worked-example">
            <div class="worked-example-label">Worked Example</div>
            Are HZH and X equivalent?<br>
            Test on |0⟩: HZH|0⟩ = HZ(0.71, 0.71) = H(0.71, -0.71) = (0, 1) = X|0⟩ ✓<br>
            Test on |1⟩: HZH|1⟩ = HZ(0.71, -0.71) = H(0.71, 0.71) = (1, 0) = X|1⟩ ✓<br>
            Same output on both inputs → equivalent!
          </div>
          <p style="color:var(--text-muted);font-size:13px;">These identities let you simplify circuits before running them on a quantum computer.</p>
        `,
        problemType: 'circuit_equivalence',
      },
    ],
  },
];
