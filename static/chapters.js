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

  // ── Chapter 12: Rotation Gates ────────────────────────────────────────────

  {
    id: 12,
    title: 'Rotation Gates',
    color: 'var(--ch12)',
    darkColor: 'var(--ch12-dk)',
    problemTypes: ['bloch_identification', 'rz_apply', 'rx_apply', 'ry_apply', 'euler_decompose'],
    quizCount: 8,
    quizPass: 6,
    description: 'Rotations around the Bloch sphere — Rx, Ry, Rz — give precise control over qubit states.',
    lessonSteps: [
      {
        title: 'The Bloch Sphere',
        problemType: 'bloch_identification',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'basic' },
          { difficulty: 2, variation: 'basic' },
        ],
      },
      {
        title: 'Rz — Rotation Around Z',
        problemType: 'rz_apply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'basic' },
          { difficulty: 2, variation: 'basic' },
        ],
      },
      {
        title: 'Rx — Rotation Around X',
        problemType: 'rx_apply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'basic' },
          { difficulty: 2, variation: 'basic' },
        ],
      },
      {
        title: 'Ry — Rotation Around Y',
        problemType: 'ry_apply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'basic' },
          { difficulty: 2, variation: 'basic' },
        ],
      },
      {
        title: 'Euler Decomposition',
        problemType: 'euler_decompose',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'basic' },
          { difficulty: 2, variation: 'basic' },
        ],
      },
    ],
  },

  // ── Chapter 13: Phase Gates ───────────────────────────────────────────────

  {
    id: 13,
    title: 'Phase Gates',
    color: 'var(--ch13)',
    darkColor: 'var(--ch13-dk)',
    problemTypes: ['s_gate_apply', 's_dagger_apply', 't_gate_apply', 't_dagger_apply', 'phase_family'],
    quizCount: 8,
    quizPass: 6,
    description: 'S, T, and their daggers — the phase gates that enable fault-tolerant quantum computing.',
    lessonSteps: [
      {
        title: 'The S Gate',
        problemType: 's_gate_apply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'basic' },
          { difficulty: 2, variation: 'basic' },
        ],
      },
      {
        title: 'S† (S-Dagger)',
        problemType: 's_dagger_apply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'basic' },
          { difficulty: 2, variation: 'basic' },
        ],
      },
      {
        title: 'The T Gate',
        problemType: 't_gate_apply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'basic' },
          { difficulty: 2, variation: 'basic' },
        ],
      },
      {
        title: 'T† (T-Dagger)',
        problemType: 't_dagger_apply',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'basic' },
          { difficulty: 2, variation: 'basic' },
        ],
      },
      {
        title: 'The Phase Family',
        problemType: 'phase_family',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'sequence_to_gate' },
          { difficulty: 2, variation: 'find_angle' },
        ],
      },
    ],
  },

  // ── Chapter 14: Multi-Qubit Gates ─────────────────────────────────────────

  {
    id: 14,
    title: 'Multi-Qubit Gates',
    color: 'var(--ch14)',
    darkColor: 'var(--ch14-dk)',
    problemTypes: ['cz_apply', 'swap_apply', 'toffoli_apply', 'controlled_gate'],
    quizCount: 10,
    quizPass: 8,
    description: 'CZ, SWAP, Toffoli, and controlled-U gates — the multi-qubit operations that enable real quantum algorithms.',
    lessonSteps: [
      {
        title: 'The CZ Gate',
        problemType: 'cz_apply',
        progression: [
          { difficulty: 1, variation: 'basic_00' },
          { difficulty: 1, variation: 'basic_11' },
          { difficulty: 2, variation: 'superposition' },
          { difficulty: 2, variation: 'symmetry' },
        ],
      },
      {
        title: 'The SWAP Gate',
        problemType: 'swap_apply',
        progression: [
          { difficulty: 1, variation: 'basic_basis' },
          { difficulty: 1, variation: 'both_same' },
          { difficulty: 2, variation: 'superposition' },
          { difficulty: 2, variation: 'three_cnots' },
        ],
      },
      {
        title: 'The Toffoli Gate',
        problemType: 'toffoli_apply',
        progression: [
          { difficulty: 1, variation: 'both_controls_1' },
          { difficulty: 1, variation: 'one_control_0' },
          { difficulty: 2, variation: 'both_controls_0' },
          { difficulty: 2, variation: 'superposition_controls' },
        ],
      },
      {
        title: 'Controlled-U Gates',
        problemType: 'controlled_gate',
        progression: [
          { difficulty: 1, variation: 'controlled_h' },
          { difficulty: 1, variation: 'controlled_s' },
          { difficulty: 2, variation: 'controlled_vs_uncontrolled' },
          { difficulty: 2, variation: 'controlled_vs_uncontrolled' },
        ],
      },
    ],
  },

  // ── Chapter 15: Quantum Teleportation ─────────────────────────────────────

  {
    id: 15,
    title: 'Quantum Teleportation',
    color: 'var(--ch15)',
    darkColor: 'var(--ch15-dk)',
    problemTypes: ['teleportation_concept', 'teleport_setup', 'teleport_alice_ops', 'teleport_measurement', 'teleport_correction'],
    quizCount: 10,
    quizPass: 8,
    description: 'Teleport a quantum state using entanglement and classical communication — the crown jewel of quantum protocols.',
    lessonSteps: [
      {
        title: 'Why Teleportation?',
        problemType: 'teleportation_concept',
        progression: [
          { difficulty: 1, variation: 'why_not_copy' },
          { difficulty: 1, variation: 'why_not_measure' },
          { difficulty: 2, variation: 'what_is_shared' },
        ],
      },
      {
        title: 'Setting Up the Initial State',
        problemType: 'teleport_setup',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'basic' },
          { difficulty: 2, variation: 'general' },
          { difficulty: 2, variation: 'general' },
        ],
      },
      {
        title: 'Alice\'s CNOT',
        problemType: 'teleport_alice_ops',
        progression: [
          { difficulty: 1, variation: 'cnot_step' },
          { difficulty: 1, variation: 'cnot_step' },
          { difficulty: 2, variation: 'hadamard_step' },
          { difficulty: 2, variation: 'hadamard_step' },
        ],
      },
      {
        title: 'Alice\'s Full Circuit',
        problemType: 'teleport_alice_ops',
        progression: [
          { difficulty: 1, variation: 'hadamard_step' },
          { difficulty: 2, variation: 'full_alice' },
          { difficulty: 2, variation: 'full_alice' },
        ],
      },
      {
        title: 'Bob\'s Correction Table',
        problemType: 'teleport_measurement',
        progression: [
          { difficulty: 1, variation: 'outcome_00' },
          { difficulty: 1, variation: 'outcome_01' },
          { difficulty: 2, variation: 'outcome_10' },
          { difficulty: 2, variation: 'outcome_11' },
        ],
      },
      {
        title: 'Applying X Correction',
        problemType: 'teleport_correction',
        progression: [
          { difficulty: 1, variation: 'apply_x' },
          { difficulty: 1, variation: 'apply_x' },
          { difficulty: 2, variation: 'apply_z' },
          { difficulty: 2, variation: 'apply_z' },
        ],
      },
      {
        title: 'Full Protocol',
        problemType: 'teleport_correction',
        progression: [
          { difficulty: 1, variation: 'apply_z' },
          { difficulty: 2, variation: 'apply_zx' },
          { difficulty: 2, variation: 'full_protocol' },
          { difficulty: 3, variation: 'full_protocol' },
        ],
      },
    ],
  },

  // ── Chapter 16: Deutsch-Jozsa Algorithm ──────────────────────────────────

  {
    id: 16,
    title: 'Deutsch-Jozsa Algorithm',
    color: 'var(--ch16)',
    darkColor: 'var(--ch16-dk)',
    problemTypes: ['dj_problem_type', 'dj_oracle', 'dj_trace', 'phase_kickback', 'dj_generalize'],
    quizCount: 8,
    quizPass: 6,
    description: 'The first quantum algorithm to show exponential speedup — determine constant vs balanced with one query.',
    lessonSteps: [
      {
        title: 'Constant vs Balanced Functions',
        problemType: 'dj_problem_type',
        progression: [
          { difficulty: 1, variation: 'identify_constant' },
          { difficulty: 1, variation: 'identify_balanced' },
          { difficulty: 2, variation: 'classical_queries' },
          { difficulty: 2, variation: 'quantum_queries' },
        ],
      },
      {
        title: 'Oracle Circuits',
        problemType: 'dj_oracle',
        progression: [
          { difficulty: 1, variation: 'constant_0' },
          { difficulty: 1, variation: 'constant_1' },
          { difficulty: 2, variation: 'balanced_identity' },
          { difficulty: 2, variation: 'balanced_not' },
        ],
      },
      {
        title: 'Phase Kickback',
        problemType: 'phase_kickback',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'constant_phase' },
          { difficulty: 2, variation: 'balanced_phase' },
          { difficulty: 2, variation: 'interference' },
        ],
      },
      {
        title: 'Tracing the DJ Circuit: Setup',
        problemType: 'dj_trace',
        progression: [
          { difficulty: 1, variation: 'after_hadamards' },
          { difficulty: 1, variation: 'after_hadamards' },
          { difficulty: 2, variation: 'after_oracle' },
        ],
      },
      {
        title: 'Tracing the DJ Circuit: Constant Oracle',
        problemType: 'dj_trace',
        progression: [
          { difficulty: 1, variation: 'after_oracle' },
          { difficulty: 2, variation: 'constant_trace' },
          { difficulty: 2, variation: 'constant_trace' },
        ],
      },
      {
        title: 'Tracing the DJ Circuit: Balanced Oracle',
        problemType: 'dj_trace',
        progression: [
          { difficulty: 1, variation: 'after_oracle' },
          { difficulty: 2, variation: 'balanced_trace' },
          { difficulty: 2, variation: 'balanced_trace' },
        ],
      },
      {
        title: 'Generalizing to n Bits',
        problemType: 'dj_generalize',
        progression: [
          { difficulty: 1, variation: 'classical_cost' },
          { difficulty: 1, variation: 'quantum_cost' },
          { difficulty: 2, variation: 'speedup_factor' },
        ],
      },
    ],
  },

  // ── Chapter 17: Grover's Search Algorithm ─────────────────────────────────

  {
    id: 17,
    title: "Grover's Search",
    color: 'var(--ch17)',
    darkColor: 'var(--ch17-dk)',
    problemTypes: ['grover_problem', 'grover_oracle', 'grover_diffusion', 'grover_full', 'grover_optimality'],
    quizCount: 8,
    quizPass: 6,
    description: "Grover's algorithm searches an unsorted database in O(√N) — a quadratic speedup using amplitude amplification.",
    lessonSteps: [
      {
        title: 'Classical vs Quantum Search',
        problemType: 'grover_problem',
        progression: [
          { difficulty: 1, variation: 'classical_cost' },
          { difficulty: 1, variation: 'quantum_cost' },
          { difficulty: 2, variation: 'speedup' },
        ],
      },
      {
        title: 'The Oracle',
        problemType: 'grover_oracle',
        progression: [
          { difficulty: 1, variation: 'basic_2qubit' },
          { difficulty: 1, variation: 'mark_specific' },
          { difficulty: 2, variation: 'phase_flip_only' },
        ],
      },
      {
        title: 'Computing the Mean',
        problemType: 'grover_diffusion',
        progression: [
          { difficulty: 1, variation: 'compute_mean' },
          { difficulty: 1, variation: 'reflect_about_mean' },
          { difficulty: 2, variation: 'amplitude_growth' },
        ],
      },
      {
        title: 'The Diffusion Operator',
        problemType: 'grover_diffusion',
        progression: [
          { difficulty: 1, variation: 'compute_mean' },
          { difficulty: 2, variation: 'after_one_iteration' },
          { difficulty: 2, variation: 'after_one_iteration' },
        ],
      },
      {
        title: 'Full Algorithm on 2 Qubits',
        problemType: 'grover_full',
        progression: [
          { difficulty: 1, variation: 'two_qubit' },
          { difficulty: 2, variation: 'optimal_iterations' },
          { difficulty: 2, variation: 'probability_after_k' },
          { difficulty: 3, variation: 'too_many_iterations' },
        ],
      },
      {
        title: 'Understanding the Speedup',
        problemType: 'grover_optimality',
        progression: [
          { difficulty: 1, variation: 'not_exponential' },
          { difficulty: 1, variation: 'compare_dj' },
          { difficulty: 2, variation: 'practical_impact' },
        ],
      },
    ],
  },

  // ── Chapter 18: Quantum Error Correction ──────────────────────────────────

  {
    id: 18,
    title: 'Quantum Error Correction',
    color: 'var(--ch18)',
    darkColor: 'var(--ch18-dk)',
    problemTypes: ['error_concept', 'bit_flip_code', 'phase_flip_code', 'shor_code', 'threshold_concept'],
    quizCount: 8,
    quizPass: 6,
    description: 'Protecting quantum information from noise — the key to building practical quantum computers.',
    lessonSteps: [
      {
        title: 'Types of Quantum Errors',
        problemType: 'error_concept',
        progression: [
          { difficulty: 1, variation: 'bit_flip' },
          { difficulty: 1, variation: 'phase_flip' },
          { difficulty: 2, variation: 'why_no_copy' },
          { difficulty: 2, variation: 'classical_vs_quantum' },
        ],
      },
      {
        title: 'The 3-Qubit Bit-Flip Code',
        problemType: 'bit_flip_code',
        progression: [
          { difficulty: 1, variation: 'encode' },
          { difficulty: 1, variation: 'detect_error' },
          { difficulty: 2, variation: 'correct_error' },
          { difficulty: 2, variation: 'no_error' },
        ],
      },
      {
        title: 'The Phase-Flip Code',
        problemType: 'phase_flip_code',
        progression: [
          { difficulty: 1, variation: 'encode' },
          { difficulty: 1, variation: 'detect_phase_error' },
          { difficulty: 2, variation: 'relationship_to_bit_flip' },
        ],
      },
      {
        title: 'The 9-Qubit Shor Code',
        problemType: 'shor_code',
        progression: [
          { difficulty: 1, variation: 'structure' },
          { difficulty: 1, variation: 'bit_flip_layer' },
          { difficulty: 2, variation: 'phase_flip_layer' },
          { difficulty: 2, variation: 'combined_protection' },
        ],
      },
      {
        title: 'The Threshold Theorem',
        problemType: 'threshold_concept',
        progression: [
          { difficulty: 1, variation: 'overhead' },
          { difficulty: 1, variation: 'threshold' },
          { difficulty: 2, variation: 'current_state' },
        ],
      },
    ],
  },

  // ── Chapter 19: Shor's Algorithm ────────────────────────────────────────────

  {
    id: 19,
    title: "Shor's Algorithm",
    color: 'var(--ch19)',
    darkColor: 'var(--ch19-dk)',
    problemTypes: ['factoring_problem', 'period_finding', 'period_to_factors', 'qft_concept', 'shor_full'],
    quizCount: 8,
    quizPass: 6,
    description: "Shor's algorithm factors integers in polynomial time — an exponential speedup that breaks RSA encryption.",
    lessonSteps: [
      {
        title: 'The Factoring Problem',
        problemType: 'factoring_problem',
        progression: [
          { difficulty: 1, variation: 'small_factor' },
          { difficulty: 1, variation: 'why_hard' },
          { difficulty: 2, variation: 'rsa_connection' },
        ],
      },
      {
        title: 'Classical vs Quantum Factoring',
        problemType: 'factoring_problem',
        progression: [
          { difficulty: 1, variation: 'classical_time' },
          { difficulty: 2, variation: 'rsa_connection' },
          { difficulty: 2, variation: 'classical_time' },
        ],
      },
      {
        title: 'Modular Exponentiation',
        problemType: 'period_finding',
        progression: [
          { difficulty: 1, variation: 'compute_powers' },
          { difficulty: 1, variation: 'compute_powers' },
          { difficulty: 2, variation: 'compute_powers' },
        ],
      },
      {
        title: 'Finding the Period',
        problemType: 'period_finding',
        progression: [
          { difficulty: 1, variation: 'find_period' },
          { difficulty: 2, variation: 'small_example' },
          { difficulty: 2, variation: 'small_example' },
        ],
      },
      {
        title: 'From Period to Factors',
        problemType: 'period_to_factors',
        progression: [
          { difficulty: 1, variation: 'basic' },
          { difficulty: 1, variation: 'gcd_step' },
          { difficulty: 2, variation: 'different_a' },
          { difficulty: 2, variation: 'why_even' },
        ],
      },
      {
        title: 'The Quantum Fourier Transform',
        problemType: 'qft_concept',
        progression: [
          { difficulty: 1, variation: 'qft_analogy' },
          { difficulty: 1, variation: 'classical_vs_quantum' },
          { difficulty: 2, variation: 'where_speedup' },
        ],
      },
      {
        title: 'The Full Algorithm',
        problemType: 'shor_full',
        progression: [
          { difficulty: 1, variation: 'steps_in_order' },
          { difficulty: 1, variation: 'quantum_vs_classical_steps' },
          { difficulty: 2, variation: 'complexity' },
          { difficulty: 2, variation: 'implications' },
        ],
      },
    ],
  },

  // ── Chapter 20: The Landscape — Where Quantum Computing Is Now ──────────────

  {
    id: 20,
    title: 'The Landscape',
    color: 'var(--ch20)',
    darkColor: 'var(--ch20-dk)',
    problemTypes: ['qubit_tech', 'nisq_concept', 'quantum_advantage', 'fault_tolerance_path'],
    quizCount: 8,
    quizPass: 6,
    description: 'Where quantum computing stands today — hardware, NISQ limits, advantage claims, and the road to fault tolerance.',
    lessonSteps: [
      {
        title: 'Qubit Technologies',
        problemType: 'qubit_tech',
        progression: [
          { difficulty: 1, variation: 'match_company' },
          { difficulty: 1, variation: 'tradeoffs' },
          { difficulty: 2, variation: 'current_scale' },
        ],
      },
      {
        title: 'The NISQ Era',
        problemType: 'nisq_concept',
        progression: [
          { difficulty: 1, variation: 'define_nisq' },
          { difficulty: 1, variation: 'why_not_shor' },
          { difficulty: 2, variation: 'what_works' },
        ],
      },
      {
        title: 'Quantum Advantage',
        problemType: 'quantum_advantage',
        progression: [
          { difficulty: 1, variation: 'google_claim' },
          { difficulty: 1, variation: 'debate' },
          { difficulty: 2, variation: 'practical_vs_theoretical' },
        ],
      },
      {
        title: 'The Road to Fault Tolerance',
        problemType: 'fault_tolerance_path',
        progression: [
          { difficulty: 1, variation: 'physical_to_logical' },
          { difficulty: 1, variation: 'shor_requirements' },
          { difficulty: 2, variation: 'total_physical' },
        ],
      },
      {
        title: 'Graduation',
        problemType: 'graduation',
        progression: [
          { difficulty: 1, variation: 'basic' },
        ],
      },
    ],
  },
];
