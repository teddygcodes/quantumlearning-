/**
 * CHAPTERS — curriculum data for Quantum Primer.
 *
 * Each chapter has:
 *  id           — 1-5
 *  title        — display name
 *  color        — CSS variable string (used as inline style value)
 *  darkColor    — darker shade for button borders
 *  problemTypes — array of problem type IDs (must match problems.js GENS keys)
 *  quizCount    — number of problems in the quiz
 *  quizPass     — minimum correct answers to pass
 *  description  — one-line summary for the chapter detail modal
 *  lessonHTML   — full lesson content (safe: authored HTML, not user input)
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
    lessonHTML: `
      <h2>Chapter 1: Algebra Refresher</h2>
      <p>Everything in quantum mechanics rests on algebra. Before we touch vectors or complex numbers, we need fluency with the basics — isolating variables, substituting values, and working with roots and powers.</p>

      <h3>Solving Linear Equations</h3>
      <p>A linear equation has one unknown, and solving it means getting that unknown alone on one side. The rule: whatever you do to one side, you must do to the other.</p>
      <div class="concept-card">
        2x + 3 = 11<br>
        Subtract 3 from both sides: &nbsp; 2x = 8<br>
        Divide both sides by 2: &nbsp;&nbsp;&nbsp;&nbsp; x = 4
      </div>
      <p>Check your answer by substituting back: 2(4) + 3 = 11 ✓</p>

      <h3>Substitution</h3>
      <p>When you know the value of a variable, replace it and compute. Watch the order of operations: exponents first, then multiplication, then addition.</p>
      <div class="concept-card">
        If x = 3, find: 2x² + 1<br>
        Step 1 — square first: &nbsp; x² = 9<br>
        Step 2 — multiply: &nbsp;&nbsp;&nbsp;&nbsp; 2 × 9 = 18<br>
        Step 3 — add: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 18 + 1 = 19
      </div>
      <p>A common mistake: computing 2x first and then squaring. Don't — exponents bind tighter than multiplication.</p>

      <h3>Square Roots</h3>
      <p>√n asks: what number, multiplied by itself, gives n? For perfect squares, the answer is always a whole number.</p>
      <div class="concept-card">
        √4 = 2 &nbsp;&nbsp;&nbsp; √9 = 3 &nbsp;&nbsp;&nbsp; √25 = 5 &nbsp;&nbsp;&nbsp; √100 = 10<br>
        √144 = 12 &nbsp;&nbsp; √169 = 13 &nbsp;&nbsp; √225 = 15
      </div>
      <p>You'll use square roots constantly when computing vector magnitudes and complex number magnitudes. Memorizing the first 15 perfect squares will save you time.</p>

      <h3>Exponents</h3>
      <p>aⁿ means "multiply a by itself n times." Small bases raised to small powers produce surprisingly large numbers — worth knowing by heart.</p>
      <div class="concept-card">
        2³ = 2×2×2 = 8 &nbsp;&nbsp; 3² = 9 &nbsp;&nbsp; 4² = 16<br>
        2⁴ = 16 &nbsp;&nbsp; 2⁵ = 32 &nbsp;&nbsp; 10² = 100 &nbsp;&nbsp; 5³ = 125
      </div>
      <p>In quantum mechanics, you'll see |α|² constantly — that's the probability of a measurement outcome. Getting comfortable squaring quickly matters.</p>
    `,
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
    lessonHTML: `
      <h2>Chapter 2: Vectors in 2D</h2>
      <p>A vector is an ordered list of numbers that represents both a direction and a magnitude. In 2D, a vector looks like (3, 4) — meaning "3 units right, 4 units up." In quantum mechanics, the state of a qubit is a vector. Learning to manipulate vectors here is learning to manipulate quantum states.</p>

      <h3>What a Vector Is</h3>
      <p>Write it as (x, y). The x and y are called components. Each component tells you how much the vector points in that direction.</p>
      <div class="concept-card">
        (3, 4) → 3 units in the x-direction, 4 units in the y-direction<br>
        (1, 0) → points purely in the x-direction<br>
        (0, 1) → points purely in the y-direction<br>
        (-2, 5) → 2 units left, 5 units up
      </div>

      <h3>Vector Addition</h3>
      <p>Add two vectors by adding their components separately. Think of it as walking: go vector A, then go vector B — where do you end up?</p>
      <div class="concept-card">
        (3, 4) + (2, -1) = (3+2, 4+(-1)) = (5, 3)<br>
        (1, 0) + (0, 1) = (1, 1)<br>
        (-3, 2) + (3, 5) = (0, 7)
      </div>
      <p>Addition is commutative: (a,b) + (c,d) = (c,d) + (a,b). Order doesn't matter.</p>

      <h3>Scalar Multiplication</h3>
      <p>Multiply every component by the scalar (a plain number). This stretches or shrinks the vector — or flips it if the scalar is negative.</p>
      <div class="concept-card">
        3 × (2, 5) = (6, 15) &nbsp;&nbsp;&nbsp; — stretched by factor 3<br>
        -1 × (4, -2) = (-4, 2) &nbsp; — flipped direction<br>
        0.5 × (8, 4) = (4, 2) &nbsp;&nbsp;&nbsp; — shrunk by half
      </div>

      <h3>Vector Magnitude</h3>
      <p>The magnitude (or length) of a vector is the distance from the origin to its tip. It's the Pythagorean theorem — the vector components are the legs, the magnitude is the hypotenuse.</p>
      <div class="concept-card">
        |(a, b)| = √(a² + b²)<br><br>
        |(3, 4)| = √(9 + 16) = √25 = 5<br>
        |(5, 12)| = √(25 + 144) = √169 = 13<br>
        |(1, 0)| = √(1 + 0) = 1
      </div>
      <p>A magnitude of 1 is special — it means the vector is a "unit vector." We'll use that heavily in Chapter 3.</p>
    `,
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
    lessonHTML: `
      <h2>Chapter 3: Unit Vectors & Normalization</h2>
      <p>A unit vector has magnitude exactly equal to 1. In quantum mechanics, every valid quantum state must be a unit vector — because all the probabilities of all possible measurement outcomes must add up to 1. This chapter bridges linear algebra and probability.</p>

      <h3>What Makes a Vector a Unit Vector</h3>
      <p>Check: compute its magnitude. If |(a, b)| = 1, it's a unit vector. Only vectors pointing in a specific direction with exactly the right length qualify.</p>
      <div class="concept-card">
        (1, 0) → |(1,0)| = √(1+0) = 1 ✓ unit vector<br>
        (0, 1) → |(0,1)| = √(0+1) = 1 ✓ unit vector<br>
        (0.6, 0.8) → |(0.6,0.8)| = √(0.36+0.64) = √1 = 1 ✓<br>
        (3, 4) → |(3,4)| = 5 ✗ not a unit vector
      </div>

      <h3>Normalizing a Vector</h3>
      <p>To turn any non-zero vector into a unit vector pointing the same direction, divide each component by the magnitude. This is called normalization.</p>
      <div class="concept-card">
        Normalize (3, 4):<br>
        Step 1 — find magnitude: |(3,4)| = 5<br>
        Step 2 — divide each component: (3/5, 4/5) = (0.6, 0.8)<br><br>
        Check: |(0.6, 0.8)| = √(0.36 + 0.64) = √1 = 1 ✓
      </div>
      <p>The Pythagorean triples (3,4,5), (5,12,13), (6,8,10) are your friends here — they normalize to clean decimals.</p>

      <h3>Connection to Quantum Probability</h3>
      <p>A qubit state is written as |ψ⟩ = α|0⟩ + β|1⟩, where α and β are the "amplitudes." The probability of measuring the qubit in state |0⟩ is |α|², and the probability of |1⟩ is |β|².</p>
      <p>Because probabilities must sum to 1, we need |α|² + |β|² = 1 — which is exactly the condition for (α, β) to be a unit vector.</p>
      <div class="concept-card">
        |ψ⟩ = 0.6|0⟩ + 0.8|1⟩<br>
        P(measure |0⟩) = 0.6² = 0.36 &nbsp; (36% chance)<br>
        P(measure |1⟩) = 0.8² = 0.64 &nbsp; (64% chance)<br>
        Total: 0.36 + 0.64 = 1.00 ✓
      </div>
      <p>This is why normalization matters. An unnormalized state vector isn't a valid quantum state — it would imply probabilities that don't sum to 1.</p>
    `,
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
    lessonHTML: `
      <h2>Chapter 4: Complex Numbers</h2>
      <p>Quantum mechanics requires complex numbers. A qubit's amplitudes aren't just real numbers — they're complex. Once you're comfortable here, the full picture of quantum interference and entanglement opens up.</p>

      <h3>The Imaginary Unit i</h3>
      <p>We define i as the square root of -1: i² = -1. That's it. From this one definition, an entirely new number system grows.</p>
      <div class="concept-card">
        i = √(-1)<br>
        i² = -1<br>
        i³ = i² × i = -1 × i = -i<br>
        i⁴ = i² × i² = -1 × -1 = 1 &nbsp; (cycles back!)
      </div>

      <h3>Complex Numbers: a + bi</h3>
      <p>A complex number has a real part (a) and an imaginary part (b). The two parts stay separate — you can't simplify "3 + 4i" any further.</p>
      <div class="concept-card">
        3 + 4i &nbsp; → real part: 3, imaginary part: 4<br>
        -2 + i &nbsp; → real part: -2, imaginary part: 1<br>
        5 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → real part: 5, imaginary part: 0 (purely real)<br>
        3i &nbsp;&nbsp;&nbsp;&nbsp; → real part: 0, imaginary part: 3 (purely imaginary)
      </div>

      <h3>Addition and Subtraction</h3>
      <p>Add real parts together, imaginary parts together. Keep them separate.</p>
      <div class="concept-card">
        (2 + 3i) + (1 - 5i) = (2+1) + (3-5)i = 3 - 2i<br>
        (4 - i) - (2 + 3i) = (4-2) + (-1-3)i = 2 - 4i
      </div>

      <h3>Multiplication</h3>
      <p>Use FOIL (First, Outer, Inner, Last), then substitute i² = -1 to simplify.</p>
      <div class="concept-card">
        (2 + i)(3 + 2i)<br>
        = 6 + 4i + 3i + 2i²<br>
        = 6 + 7i + 2(-1)<br>
        = 6 + 7i - 2<br>
        = 4 + 7i
      </div>
      <p>The key step is replacing i² with -1. That's what makes the imaginary part "fold back" into the real part.</p>

      <h3>Complex Conjugate</h3>
      <p>The conjugate of (a + bi) is (a - bi) — flip the sign of the imaginary part only.</p>
      <div class="concept-card">
        (3 + 4i)* = 3 - 4i<br>
        (-2 - 5i)* = -2 + 5i<br>
        (7)* = 7 &nbsp; (real numbers are their own conjugates)
      </div>
      <p>Conjugates appear everywhere in quantum mechanics. Multiplying a number by its conjugate always gives a real result: (a+bi)(a-bi) = a² + b².</p>

      <h3>Magnitude</h3>
      <p>The magnitude of a complex number is its distance from zero in the complex plane — same formula as vector magnitude.</p>
      <div class="concept-card">
        |a + bi| = √(a² + b²)<br><br>
        |3 + 4i| = √(9 + 16) = √25 = 5<br>
        |1 + i|  = √(1 + 1) = √2 ≈ 1.41<br>
        |5|      = 5 &nbsp; (real numbers have real magnitudes)
      </div>
      <p>Key identity: (a+bi)(a-bi) = a² + b² = |a+bi|². This shows up constantly in quantum probability calculations.</p>
    `,
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
    lessonHTML: `
      <h2>Chapter 5: Matrices (2×2)</h2>
      <p>A matrix is a rectangular grid of numbers. In quantum computing, every quantum gate — every operation on a qubit — is a 2×2 matrix. Applying a gate means multiplying a vector by a matrix. This is the last mathematical piece before we get to actual quantum mechanics.</p>

      <h3>What a 2×2 Matrix Looks Like</h3>
      <p>Four numbers arranged in two rows and two columns, written with square brackets.</p>
      <div class="concept-card">
        A = [[1, 2], [3, 4]]<br><br>
        Row 1: 1, 2<br>
        Row 2: 3, 4<br><br>
        Element at row 1, col 2 = 2
      </div>

      <h3>Matrix × Vector</h3>
      <p>To multiply a 2×2 matrix by a 2D vector, compute a dot product for each row of the matrix with the vector. Each row produces one component of the output.</p>
      <div class="concept-card">
        [[a, b], [c, d]] × (x, y) = (ax + by, cx + dy)<br><br>
        [[1, 2], [3, 4]] × (1, 0)<br>
        Row 1: 1×1 + 2×0 = 1<br>
        Row 2: 3×1 + 4×0 = 3<br>
        Result: (1, 3)
      </div>
      <p>Think of the matrix as a transformation: it takes a vector and produces a new vector. Quantum gates rotate and transform qubit state vectors exactly this way.</p>

      <h3>Matrix × Matrix</h3>
      <p>To multiply two matrices, treat each column of the second matrix as a vector and multiply by the first. The result is a new matrix.</p>
      <div class="concept-card">
        [[a,b],[c,d]] × [[e,f],[g,h]] = [[ae+bg, af+bh], [ce+dg, cf+dh]]<br><br>
        [[1,2],[3,4]] × [[5,6],[7,8]]<br>
        Top-left:  1×5 + 2×7 = 19<br>
        Top-right: 1×6 + 2×8 = 22<br>
        Bot-left:  3×5 + 4×7 = 43<br>
        Bot-right: 3×6 + 4×8 = 50<br>
        Result: [[19, 22], [43, 50]]
      </div>
      <p>Important: matrix multiplication is NOT commutative. A×B ≠ B×A in general. Gate order in quantum circuits matters for exactly this reason.</p>

      <h3>The Identity Matrix</h3>
      <p>The identity matrix I leaves any vector or matrix unchanged when you multiply by it: I×v = v, I×A = A. It's the matrix equivalent of the number 1.</p>
      <div class="concept-card">
        I = [[1, 0], [0, 1]]<br><br>
        [[1,0],[0,1]] × (x, y) = (1x+0y, 0x+1y) = (x, y) ✓
      </div>
      <p>In quantum computing, the identity gate I is the "do nothing" operation. Every valid quantum gate is a special kind of matrix — but that's Phase 2 material.</p>
    `,
  },
];
