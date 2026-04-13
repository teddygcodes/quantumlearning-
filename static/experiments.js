/**
 * experiments.js — Barrel file that re-exports all 20 chapter experiments.
 *
 * Each experiment module is in static/experiments/chNN-name.js.
 * Shared helpers live in static/experiments/helpers.js.
 */

import experiment1  from './experiments/ch01-equation-balancer.js';
import experiment2  from './experiments/ch02-vector-playground.js';
import experiment3  from './experiments/ch03-normalization-machine.js';
import experiment4  from './experiments/ch04-complex-multiplier.js';
import experiment5  from './experiments/ch05-transformation-sandbox.js';
import experiment6  from './experiments/ch06-state-explorer.js';
import experiment7  from './experiments/ch07-gate-laboratory.js';
import experiment8  from './experiments/ch08-quantum-coin-toss.js';
import experiment9  from './experiments/ch09-qubit-combiner.js';
import experiment10 from './experiments/ch10-entanglement-lab.js';
import experiment11 from './experiments/ch11-circuit-puzzler.js';
import experiment12 from './experiments/ch12-bloch-sphere-painter.js';
import experiment13 from './experiments/ch13-phase-clock.js';
import experiment14 from './experiments/ch14-gate-wiring-lab.js';
import experiment15 from './experiments/ch15-teleportation-simulator.js';
import experiment16 from './experiments/ch16-oracle-detective.js';
import experiment17 from './experiments/ch17-quantum-search-race.js';
import experiment18 from './experiments/ch18-noisy-quantum-lab.js';
import experiment19 from './experiments/ch19-period-finder.js';
import experiment20 from './experiments/ch20-hardware-explorer.js';

export const EXPERIMENTS = {
  1: experiment1,
  2: experiment2,
  3: experiment3,
  4: experiment4,
  5: experiment5,
  6: experiment6,
  7: experiment7,
  8: experiment8,
  9: experiment9,
  10: experiment10,
  11: experiment11,
  12: experiment12,
  13: experiment13,
  14: experiment14,
  15: experiment15,
  16: experiment16,
  17: experiment17,
  18: experiment18,
  19: experiment19,
  20: experiment20,
};
