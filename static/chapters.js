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
        problemType: 'linear_equation',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'with_negatives' },
          { difficulty: 2, variation: 'larger_values' },
          { difficulty: 2, variation: 'negative_solution' },
        ],
      },
      {
        title: 'Substitution',
        problemType: 'substitution',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'with_negatives' },
          { difficulty: 2, variation: 'quadratic' },
        ],
      },
      {
        title: 'Square Roots',
        problemType: 'square_root',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'larger' },
          { difficulty: 2, variation: 'perfect_square_check' },
        ],
      },
      {
        title: 'Exponents',
        problemType: 'exponent',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'larger_base' },
          { difficulty: 2, variation: 'higher_power' },
        ],
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
        problemType: 'vector_addition',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'with_negatives' },
          { difficulty: 2, variation: 'subtraction' },
        ],
      },
      {
        title: 'Vector Addition',
        problemType: 'vector_addition',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'with_negatives' },
          { difficulty: 2, variation: 'subtraction' },
        ],
      },
      {
        title: 'Scalar Multiplication',
        problemType: 'scalar_multiplication',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'negative_scalar' },
          { difficulty: 2, variation: 'larger' },
        ],
      },
      {
        title: 'Vector Magnitude',
        problemType: 'vector_magnitude',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'with_negatives' },
          { difficulty: 2, variation: 'non_integer' },
        ],
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
        problemType: 'unit_vector_check',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'diagonal' },
          { difficulty: 2, variation: 'tricky_no' },
        ],
      },
      {
        title: 'Normalizing a Vector',
        problemType: 'normalize_vector',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'with_negatives' },
          { difficulty: 2, variation: 'non_triple' },
        ],
      },
      {
        title: 'Quantum Probability',
        problemType: 'probability_from_components',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'simple_fractions' },
          { difficulty: 2, variation: 'find_beta' },
        ],
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
        title: 'Complex Addition',
        problemType: 'complex_addition',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'with_negatives' },
          { difficulty: 2, variation: 'edge_case' },
          { difficulty: 2, variation: 'extended' },
        ],
      },
      {
        title: 'Multiplication',
        problemType: 'complex_multiplication',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'by_i' },
          { difficulty: 2, variation: 'with_negatives' },
        ],
      },
      {
        title: 'Complex Conjugate',
        problemType: 'complex_conjugate',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'pure_imaginary' },
          { difficulty: 2, variation: 'double_conjugate' },
        ],
      },
      {
        title: 'Complex Magnitude',
        problemType: 'complex_magnitude',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'with_negatives' },
          { difficulty: 2, variation: 'pure_real_or_imag' },
        ],
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
        problemType: 'matrix_vector_multiply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'with_negatives' },
          { difficulty: 2, variation: 'identity_matrix' },
          { difficulty: 2, variation: 'with_negatives' },
        ],
      },
      {
        title: 'Matrix × Vector',
        problemType: 'matrix_vector_multiply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'with_negatives' },
          { difficulty: 2, variation: 'identity_matrix' },
          { difficulty: 2, variation: 'with_negatives' },
        ],
      },
      {
        title: 'Matrix × Matrix',
        problemType: 'matrix_matrix_multiply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'with_negatives' },
          { difficulty: 2, variation: 'identity_check' },
          { difficulty: 2, variation: 'with_negatives' },
        ],
      },
      {
        title: 'The Identity Matrix',
        problemType: 'identity_matrix',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'three_by_three' },
          { difficulty: 2, variation: 'verify_property' },
        ],
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
        problemType: 'ket_to_vector',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'superposition' },
          { difficulty: 2, variation: 'minus_state' },
        ],
      },
      {
        title: 'Bras and Inner Products',
        problemType: 'inner_product',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'orthogonal_pair' },
          { difficulty: 2, variation: 'with_negatives' },
          { difficulty: 2, variation: 'with_negatives' },
        ],
      },
      {
        title: 'Orthogonality',
        problemType: 'orthogonality_check',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'forced_orthogonal' },
          { difficulty: 2, variation: 'forced_not' },
        ],
      },
      {
        title: 'Probability via Inner Product',
        problemType: 'dirac_probability',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'equal_superposition' },
          { difficulty: 2, variation: 'small_amplitude' },
        ],
      },
      {
        title: 'Putting It All Together',
        problemType: 'dirac_probability',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'equal_superposition' },
          { difficulty: 2, variation: 'small_amplitude' },
          { difficulty: 2, variation: 'small_amplitude' },
        ],
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
        problemType: 'pauli_gate_apply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'x_only' },
          { difficulty: 2, variation: 'z_only' },
          { difficulty: 2, variation: 'superposition_input' },
        ],
      },
      {
        title: 'Pauli Z — Phase Flip',
        problemType: 'pauli_gate_apply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'z_only' },
          { difficulty: 2, variation: 'x_only' },
          { difficulty: 2, variation: 'superposition_input' },
        ],
      },
      {
        title: 'Pauli Z — Phase Flip',
        problemType: 'pauli_gate_apply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'x_only' },
          { difficulty: 2, variation: 'z_only' },
          { difficulty: 2, variation: 'superposition_input' },
        ],
      },
      {
        title: 'The Hadamard Gate',
        problemType: 'hadamard_apply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'basis_only' },
          { difficulty: 2, variation: 'general_input' },
          { difficulty: 2, variation: 'general_input' },
        ],
      },
      {
        title: 'Gate Then Measure',
        problemType: 'gate_then_measure',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'measure_one' },
          { difficulty: 2, variation: 'x_then_measure' },
          { difficulty: 2, variation: 'x_then_measure' },
        ],
      },
      {
        title: 'Composing Two Gates',
        problemType: 'two_gate_compose',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'same_gate' },
          { difficulty: 2, variation: 'with_negatives' },
          { difficulty: 2, variation: 'with_negatives' },
        ],
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
        problemType: 'born_rule_complex',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'with_negatives' },
          { difficulty: 2, variation: 'pure_real' },
        ],
      },
      {
        title: 'Valid Quantum States',
        problemType: 'valid_state_check',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'forced_valid' },
          { difficulty: 2, variation: 'close_invalid' },
        ],
      },
      {
        title: 'From Probability to Expected Counts',
        problemType: 'expected_counts',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'large_n' },
          { difficulty: 2, variation: 'measure_one' },
        ],
      },
      {
        title: 'Expected Counts',
        problemType: 'expected_counts',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'large_n' },
          { difficulty: 2, variation: 'measure_one' },
        ],
      },
      {
        title: 'Finding a Missing Amplitude',
        problemType: 'missing_amplitude',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'given_beta' },
          { difficulty: 2, variation: 'decimal_given' },
        ],
      },
    ],
  },

  // ── Chapter 9: Two-Qubit Systems (Tensor Products) ─────────────────────────

  {
    id: 9,
    title: 'Tensor Products',
    color: 'var(--ch9)',
    darkColor: 'var(--ch9-dk)',
    problemTypes: ['two_qubit_basis', 'tensor_product', 'two_qubit_state', 'tensor_component_identify', 'tensor_probability', 'separable_check'],
    quizCount: 10,
    quizPass: 8,
    description: 'Two-qubit systems use tensor products to combine individual qubit states into joint states.',
    lessonSteps: [
      {
        title: 'Two-Qubit Basis States',
        problemType: 'two_qubit_basis',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'harder_labels' },
          { difficulty: 2, variation: 'harder_labels' },
          { difficulty: 2, variation: 'superposition' },
        ],
      },
      {
        title: 'The Tensor Product',
        problemType: 'tensor_product',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'basis_states' },
          { difficulty: 2, variation: 'with_negatives' },
          { difficulty: 2, variation: 'with_negatives' },
        ],
      },
      {
        title: 'Building a Joint State',
        problemType: 'two_qubit_state',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'both_general' },
          { difficulty: 2, variation: 'both_general' },
          { difficulty: 2, variation: 'both_general' },
        ],
      },
      {
        title: 'Decomposing a Joint State',
        problemType: 'tensor_component_identify',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'basic' },
          { difficulty: 2, variation: 'general' },
          { difficulty: 2, variation: 'general' },
        ],
      },
      {
        title: 'Measurement Probabilities',
        problemType: 'tensor_probability',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'basic' },
          { difficulty: 2, variation: 'general' },
          { difficulty: 2, variation: 'general' },
        ],
      },
      {
        title: 'Separable vs Entangled (Preview)',
        problemType: 'separable_check',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'forced_separable' },
          { difficulty: 2, variation: 'forced_entangled' },
          { difficulty: 2, variation: 'forced_entangled' },
        ],
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
        problemType: 'entanglement_check',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'forced_entangled' },
          { difficulty: 2, variation: 'forced_separable' },
          { difficulty: 2, variation: 'forced_entangled' },
          { difficulty: 3, variation: 'forced_separable' },
        ],
      },
      {
        title: 'The CNOT Gate',
        problemType: 'cnot_apply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'control_one' },
          { difficulty: 2, variation: 'superposition' },
          { difficulty: 2, variation: 'superposition' },
          { difficulty: 3, variation: 'superposition' },
        ],
      },
      {
        title: 'Building Bell States',
        problemType: 'build_bell_state',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'phi_states' },
          { difficulty: 2, variation: 'psi_states' },
          { difficulty: 2, variation: 'psi_states' },
          { difficulty: 3, variation: 'phi_states' },
        ],
      },
      {
        title: 'The Four Bell States',
        problemType: 'build_bell_state',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'phi_states' },
          { difficulty: 2, variation: 'psi_states' },
          { difficulty: 2, variation: 'phi_states' },
          { difficulty: 3, variation: 'psi_states' },
        ],
      },
      {
        title: 'Measuring Entangled States',
        problemType: 'entangled_measurement',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'phi_plus' },
          { difficulty: 2, variation: 'psi_plus' },
          { difficulty: 2, variation: 'psi_plus' },
          { difficulty: 3, variation: 'phi_plus' },
        ],
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
        problemType: 'trace_single_qubit',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'xz_only' },
          { difficulty: 2, variation: 'with_h' },
          { difficulty: 2, variation: 'with_h' },
          { difficulty: 3, variation: 'with_h' },
        ],
      },
      {
        title: 'Tracing Single-Qubit Circuits',
        problemType: 'trace_single_qubit',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'xz_only' },
          { difficulty: 2, variation: 'with_h' },
          { difficulty: 2, variation: 'with_h' },
          { difficulty: 3, variation: 'with_h' },
        ],
      },
      {
        title: 'Tracing Two-Qubit Circuits',
        problemType: 'trace_two_qubit',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'x_tensor_i' },
          { difficulty: 2, variation: 'cnot' },
          { difficulty: 2, variation: 'cnot' },
          { difficulty: 3, variation: 'cnot' },
        ],
      },
      {
        title: 'Circuit Output Probabilities',
        problemType: 'circuit_probabilities',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'single_gate' },
          { difficulty: 2, variation: 'two_gate' },
          { difficulty: 2, variation: 'two_gate' },
          { difficulty: 3, variation: 'two_gate' },
        ],
      },
      {
        title: 'Circuit Equivalence',
        problemType: 'circuit_equivalence',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'self_inverse' },
          { difficulty: 2, variation: 'conjugation' },
          { difficulty: 2, variation: 'conjugation' },
          { difficulty: 3, variation: 'self_inverse' },
        ],
      },
    ],
  },
];
