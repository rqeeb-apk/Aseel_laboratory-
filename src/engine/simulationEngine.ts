/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Real Electrical Simulation Engine
 * Modified Nodal Analysis (MNA) & Iterative Non-linear Solver
 */

import { CircuitElement, WireConnection, SimulationResult, ComponentType } from '../types/circuit';
import { COMPONENT_CATALOG } from '../data/componentsCatalog';

// Small leakage conductance to prevent singular matrix for floating nodes
const G_MIN = 1e-9; // 1 nS
const MAX_ITERATIONS = 10;

export class DisjointSet {
  parent: Map<string, string> = new Map();

  find(id: string): string {
    if (!this.parent.has(id)) {
      this.parent.set(id, id);
      return id;
    }
    const p = this.parent.get(id)!;
    if (p === id) return id;
    const root = this.find(p);
    this.parent.set(id, root);
    return root;
  }

  union(a: string, b: string) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) {
      this.parent.set(rootA, rootB);
    }
  }
}

/**
 * Solves system of linear equations A * x = b via Gaussian elimination with partial pivoting.
 */
export function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  const M: number[][] = A.map(row => [...row]);
  const x: number[] = [...b];

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    let maxVal = Math.abs(M[col][col]);
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > maxVal) {
        maxVal = Math.abs(M[r][col]);
        maxRow = r;
      }
    }

    if (maxVal < 1e-12) {
      continue;
    }

    if (maxRow !== col) {
      const tmpRow = M[col];
      M[col] = M[maxRow];
      M[maxRow] = tmpRow;

      const tmpB = x[col];
      x[col] = x[maxRow];
      x[maxRow] = tmpB;
    }

    for (let r = col + 1; r < n; r++) {
      const factor = M[r][col] / M[col][col];
      if (Math.abs(factor) < 1e-14) continue;
      for (let c = col; c < n; c++) {
        M[r][c] -= factor * M[col][c];
      }
      x[r] -= factor * x[col];
    }
  }

  const result = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let sum = x[r];
    for (let c = r + 1; c < n; c++) {
      sum -= M[r][c] * result[c];
    }
    const diag = M[r][r];
    if (Math.abs(diag) > 1e-12) {
      result[r] = sum / diag;
    } else {
      result[r] = 0;
    }
  }

  return result;
}

interface ConductanceBranch {
  node1: number;
  node2: number;
  conductance: number; // 1 / R
}

interface VoltageBranch {
  posNode: number;
  negNode: number;
  voltage: number;
  sourceId: string;
}

interface CurrentBranch {
  fromNode: number;
  toNode: number;
  current: number;
}

export function runCircuitSimulation(
  elements: CircuitElement[],
  wires: WireConnection[]
): SimulationResult {
  const result: SimulationResult = {
    isRunning: true,
    timestamp: Date.now(),
    nodeVoltages: new Map(),
    pinVoltages: new Map(),
    elementCurrents: new Map(),
    elementPowers: new Map(),
    branchCurrents: new Map(),
    diagnostics: {
      status: 'idle',
      message: 'المحاكاة جاهزة',
      nodeCount: 0,
      componentCount: elements.length,
      burntComponents: [],
      warnings: [],
    },
  };

  if (elements.length === 0) {
    result.diagnostics.message = 'المختبر فارغ؛ اختر مكوناً من المكتبة للبدء في بناء الدائرة.';
    return result;
  }

  // 1. Map all component pins
  const pinKeys: string[] = [];
  const compMap = new Map<string, CircuitElement>();

  for (const el of elements) {
    compMap.set(el.id, el);
    const meta = COMPONENT_CATALOG[el.type];
    if (meta) {
      for (const pin of meta.pins) {
        pinKeys.push(`${el.id}:${pin.id}`);
      }
    }
  }

  // 2. Build connected node graph via DisjointSet
  const ds = new DisjointSet();
  for (const pk of pinKeys) {
    ds.find(pk);
  }

  for (const wire of wires) {
    const p1 = `${wire.fromComponentId}:${wire.fromPinId}`;
    const p2 = `${wire.toComponentId}:${wire.toPinId}`;
    if (ds.parent.has(p1) && ds.parent.has(p2)) {
      ds.union(p1, p2);
    }
  }

  // Identify reference ground node
  const rootNodeMap = new Map<string, number>();
  let groundRoot: string | null = null;

  // Check for dedicated ground element
  for (const el of elements) {
    if (el.type === 'ground') {
      groundRoot = ds.find(`${el.id}:gnd`);
      break;
    }
  }

  // If no GND, search for negative terminal of any primary DC supply / battery
  if (!groundRoot) {
    const batteryTypes = [
      'dc_source',
      'battery_9v',
      'battery_aa',
      'battery_aaa',
      'battery_18650',
      'battery_lipo',
      'battery_lead_acid',
      'bench_power_supply',
      'battery_c',
      'battery_d',
    ];
    for (const el of elements) {
      if (batteryTypes.includes(el.type)) {
        groundRoot = ds.find(`${el.id}:neg`);
        break;
      }
    }
  }

  // Assign ground node index 0
  let nodeCounter = 1;
  if (groundRoot) {
    rootNodeMap.set(groundRoot, 0);
  } else if (pinKeys.length > 0) {
    rootNodeMap.set(ds.find(pinKeys[0]), 0);
  }

  // Assign remaining nodes
  for (const pk of pinKeys) {
    const root = ds.find(pk);
    if (!rootNodeMap.has(root)) {
      rootNodeMap.set(root, nodeCounter++);
    }
  }

  const numNodes = nodeCounter;
  result.diagnostics.nodeCount = numNodes;

  const getNodeOfPin = (compId: string, pinId: string): number => {
    const pk = `${compId}:${pinId}`;
    const root = ds.find(pk);
    return rootNodeMap.get(root) ?? 0;
  };

  // State maps for non-linear iterative components
  const diodeConductionState = new Map<string, boolean>();
  let nodeVoltagesArray: number[] = new Array(numNodes).fill(0);

  // Iterative MNA Loop
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const conductances: ConductanceBranch[] = [];
    const voltageSources: VoltageBranch[] = [];
    const currentSources: CurrentBranch[] = [];

    for (const el of elements) {
      switch (el.type) {
        // Voltage sources & Batteries
        case 'dc_source':
        case 'battery_aa':
        case 'battery_aaa':
        case 'battery_c':
        case 'battery_d':
        case 'battery_9v':
        case 'battery_18650':
        case 'battery_lipo':
        case 'battery_lead_acid':
        case 'solar_cell':
        case 'bench_power_supply': {
          const nPos = getNodeOfPin(el.id, 'pos');
          const nNeg = getNodeOfPin(el.id, 'neg');
          const v = el.properties.voltage ?? el.value ?? 9;
          voltageSources.push({ posNode: nPos, negNode: nNeg, voltage: v, sourceId: el.id });
          break;
        }

        case 'vcc': {
          const nOut = getNodeOfPin(el.id, 'out');
          voltageSources.push({ posNode: nOut, negNode: 0, voltage: el.properties.voltage ?? el.value ?? 5, sourceId: el.id });
          break;
        }

        case 'ac_source': {
          const n1 = getNodeOfPin(el.id, 'p1');
          const n2 = getNodeOfPin(el.id, 'p2');
          const amp = el.properties.amplitude ?? el.value ?? 12;
          voltageSources.push({ posNode: n1, negNode: n2, voltage: amp, sourceId: el.id });
          break;
        }

        case 'current_source': {
          const nPos = getNodeOfPin(el.id, 'pos');
          const nNeg = getNodeOfPin(el.id, 'neg');
          const currentA = (el.properties.currentA ?? (el.value / 1000)) || 0.01;
          currentSources.push({ fromNode: nNeg, toNode: nPos, current: currentA });
          break;
        }

        // Resistors
        case 'resistor':
        case 'resistor_smd':
        case 'resistor_power':
        case 'resistor_shunt': {
          const n1 = getNodeOfPin(el.id, 'p1');
          const n2 = getNodeOfPin(el.id, 'p2');
          let r = el.properties.resistance ?? el.value ?? 1000;
          if (r < 0.005) r = 0.005;
          conductances.push({ node1: n1, node2: n2, conductance: 1 / r });
          break;
        }

        // Switches
        case 'spst_switch': {
          const n1 = getNodeOfPin(el.id, 'p1');
          const n2 = getNodeOfPin(el.id, 'p2');
          const isClosed = !!el.properties.closed;
          conductances.push({ node1: n1, node2: n2, conductance: 1 / (isClosed ? 0.001 : 1e8) });
          break;
        }

        case 'push_button': {
          const n1 = getNodeOfPin(el.id, 'p1');
          const n2 = getNodeOfPin(el.id, 'p2');
          const isPressed = !!el.properties.pressed;
          conductances.push({ node1: n1, node2: n2, conductance: 1 / (isPressed ? 0.001 : 1e8) });
          break;
        }

        case 'push_button_nc': {
          const n1 = getNodeOfPin(el.id, 'p1');
          const n2 = getNodeOfPin(el.id, 'p2');
          const isPressed = !!el.properties.pressed;
          // Normally closed: conducts when not pressed
          conductances.push({ node1: n1, node2: n2, conductance: 1 / (isPressed ? 1e8 : 0.001) });
          break;
        }

        case 'switch_spdt': {
          const nCom = getNodeOfPin(el.id, 'com');
          const nA = getNodeOfPin(el.id, 'a');
          const nB = getNodeOfPin(el.id, 'b');
          const pos = el.properties.position ?? 1;
          conductances.push({ node1: nCom, node2: nA, conductance: 1 / (pos === 1 ? 0.001 : 1e8) });
          conductances.push({ node1: nCom, node2: nB, conductance: 1 / (pos === 2 ? 0.001 : 1e8) });
          break;
        }

        case 'potentiometer':
        case 'trimmer_pot': {
          const nA = getNodeOfPin(el.id, 'a');
          const nW = getNodeOfPin(el.id, 'wiper');
          const nB = getNodeOfPin(el.id, 'b');
          const totalR = el.properties.maxResistance ?? (el.value ? el.value * 1000 : 10000);
          const pos = Math.max(0.01, Math.min(0.99, el.properties.position ?? 0.5));
          const r1 = Math.max(0.1, totalR * pos);
          const r2 = Math.max(0.1, totalR * (1 - pos));
          conductances.push({ node1: nA, node2: nW, conductance: 1 / r1 });
          conductances.push({ node1: nW, node2: nB, conductance: 1 / r2 });
          break;
        }

        case 'ldr': {
          const n1 = getNodeOfPin(el.id, 'p1');
          const n2 = getNodeOfPin(el.id, 'p2');
          const lux = el.properties.lightLevel ?? 50;
          const r = 100000 * Math.exp(-0.05 * lux) + 400;
          conductances.push({ node1: n1, node2: n2, conductance: 1 / r });
          break;
        }

        case 'thermistor': {
          const n1 = getNodeOfPin(el.id, 'p1');
          const n2 = getNodeOfPin(el.id, 'p2');
          const tempC = el.properties.temperatureC ?? 25;
          const r = 10000 * Math.exp(3950 * (1 / (tempC + 273.15) - 1 / 298.15));
          conductances.push({ node1: n1, node2: n2, conductance: 1 / Math.max(10, r) });
          break;
        }

        case 'thermistor_ptc': {
          const n1 = getNodeOfPin(el.id, 'p1');
          const n2 = getNodeOfPin(el.id, 'p2');
          const tempC = el.properties.temperatureC ?? 25;
          const r = 100 * (1 + 0.04 * (tempC - 25));
          conductances.push({ node1: n1, node2: n2, conductance: 1 / Math.max(10, r) });
          break;
        }

        // Capacitors
        case 'capacitor':
        case 'capacitor_ceramic':
        case 'capacitor_electrolytic':
        case 'capacitor_film':
        case 'capacitor_super':
        case 'capacitor_trimmer': {
          const n1 = getNodeOfPin(el.id, 'pos');
          const n2 = getNodeOfPin(el.id, 'neg');
          conductances.push({ node1: n1, node2: n2, conductance: 1e-8 });
          break;
        }

        // Inductors
        case 'inductor':
        case 'choke': {
          const n1 = getNodeOfPin(el.id, 'p1');
          const n2 = getNodeOfPin(el.id, 'p2');
          const r = el.properties.internalResistance ?? 0.05;
          conductances.push({ node1: n1, node2: n2, conductance: 1 / r });
          break;
        }

        // Actuators
        case 'lamp': {
          const n1 = getNodeOfPin(el.id, 'p1');
          const n2 = getNodeOfPin(el.id, 'p2');
          const r = el.properties.resistance ?? 48;
          conductances.push({ node1: n1, node2: n2, conductance: 1 / r });
          break;
        }

        case 'dc_motor': {
          const n1 = getNodeOfPin(el.id, 'p1');
          const n2 = getNodeOfPin(el.id, 'p2');
          const r = el.properties.internalR ?? 15;
          conductances.push({ node1: n1, node2: n2, conductance: 1 / r });
          break;
        }

        case 'buzzer': {
          const n1 = getNodeOfPin(el.id, 'pos');
          const n2 = getNodeOfPin(el.id, 'neg');
          const r = el.properties.internalR ?? 100;
          conductances.push({ node1: n1, node2: n2, conductance: 1 / r });
          break;
        }

        case 'relay_spdt': {
          const c1 = getNodeOfPin(el.id, 'coil1');
          const c2 = getNodeOfPin(el.id, 'coil2');
          const coilR = el.properties.coilR ?? 70;
          conductances.push({ node1: c1, node2: c2, conductance: 1 / coilR });

          const vCoil = Math.abs((nodeVoltagesArray[c1] || 0) - (nodeVoltagesArray[c2] || 0));
          const isEnergized = vCoil >= (el.properties.coilV ?? 5) * 0.7;
          el.properties.isEnergized = isEnergized;

          const nCom = getNodeOfPin(el.id, 'com');
          const nNO = getNodeOfPin(el.id, 'no');
          const nNC = getNodeOfPin(el.id, 'nc');

          conductances.push({ node1: nCom, node2: nNO, conductance: 1 / (isEnergized ? 0.005 : 1e8) });
          conductances.push({ node1: nCom, node2: nNC, conductance: 1 / (isEnergized ? 1e8 : 0.005) });
          break;
        }

        // Semiconductors
        case 'diode':
        case 'diode_schottky':
        case 'photodiode':
        case 'led': {
          const nA = getNodeOfPin(el.id, 'anode');
          const nK = getNodeOfPin(el.id, 'cathode');
          let vDrop = 0.7;
          if (el.type === 'diode_schottky') vDrop = 0.3;
          else if (el.type === 'led') vDrop = el.properties.forwardDrop ?? 2.0;

          const isConducting = diodeConductionState.get(el.id) ?? false;
          if (isConducting) {
            voltageSources.push({ posNode: nA, negNode: nK, voltage: vDrop, sourceId: `${el.id}_vf` });
            conductances.push({ node1: nA, node2: nK, conductance: 1 / 3.0 });
          } else {
            conductances.push({ node1: nA, node2: nK, conductance: 1 / 1e7 });
          }
          break;
        }

        case 'zener_diode': {
          const nA = getNodeOfPin(el.id, 'anode');
          const nK = getNodeOfPin(el.id, 'cathode');
          const vZener = el.properties.zenerVoltage ?? 5.1;
          const vReverse = (nodeVoltagesArray[nK] || 0) - (nodeVoltagesArray[nA] || 0);

          if (vReverse >= vZener) {
            voltageSources.push({ posNode: nK, negNode: nA, voltage: vZener, sourceId: `${el.id}_vz` });
            conductances.push({ node1: nA, node2: nK, conductance: 1 / 5.0 });
          } else if ((nodeVoltagesArray[nA] || 0) - (nodeVoltagesArray[nK] || 0) >= 0.7) {
            voltageSources.push({ posNode: nA, negNode: nK, voltage: 0.7, sourceId: `${el.id}_vf` });
            conductances.push({ node1: nA, node2: nK, conductance: 1 / 2.0 });
          } else {
            conductances.push({ node1: nA, node2: nK, conductance: 1 / 1e7 });
          }
          break;
        }

        case 'transistor_npn': {
          const nB = getNodeOfPin(el.id, 'base');
          const nC = getNodeOfPin(el.id, 'collector');
          const nE = getNodeOfPin(el.id, 'emitter');
          const vBE = (nodeVoltagesArray[nB] || 0) - (nodeVoltagesArray[nE] || 0);

          if (vBE >= 0.65) {
            voltageSources.push({ posNode: nB, negNode: nE, voltage: 0.65, sourceId: `${el.id}_vbe` });
            conductances.push({ node1: nB, node2: nE, conductance: 1 / 50 });
            const beta = el.properties.beta ?? 150;
            const rCE = Math.max(0.5, 200 / beta);
            conductances.push({ node1: nC, node2: nE, conductance: 1 / rCE });
          } else {
            conductances.push({ node1: nB, node2: nE, conductance: 1 / 1e7 });
            conductances.push({ node1: nC, node2: nE, conductance: 1 / 1e7 });
          }
          break;
        }

        case 'transistor_pnp': {
          const nB = getNodeOfPin(el.id, 'base');
          const nC = getNodeOfPin(el.id, 'collector');
          const nE = getNodeOfPin(el.id, 'emitter');
          const vEB = (nodeVoltagesArray[nE] || 0) - (nodeVoltagesArray[nB] || 0);

          if (vEB >= 0.65) {
            voltageSources.push({ posNode: nE, negNode: nB, voltage: 0.65, sourceId: `${el.id}_veb` });
            conductances.push({ node1: nE, node2: nB, conductance: 1 / 50 });
            conductances.push({ node1: nE, node2: nC, conductance: 1 / 2.0 });
          } else {
            conductances.push({ node1: nE, node2: nB, conductance: 1 / 1e7 });
            conductances.push({ node1: nE, node2: nC, conductance: 1 / 1e7 });
          }
          break;
        }

        case 'mosfet_n': {
          const nG = getNodeOfPin(el.id, 'gate');
          const nD = getNodeOfPin(el.id, 'drain');
          const nS = getNodeOfPin(el.id, 'source');
          const vGS = (nodeVoltagesArray[nG] || 0) - (nodeVoltagesArray[nS] || 0);
          const vTh = el.properties.vth ?? 2.5;
          conductances.push({ node1: nG, node2: nS, conductance: 1 / 1e9 });
          if (vGS >= vTh) {
            conductances.push({ node1: nD, node2: nS, conductance: 1 / (el.properties.rdsOn ?? 0.04) });
          } else {
            conductances.push({ node1: nD, node2: nS, conductance: 1 / 1e7 });
          }
          break;
        }

        case 'mosfet_p': {
          const nG = getNodeOfPin(el.id, 'gate');
          const nD = getNodeOfPin(el.id, 'drain');
          const nS = getNodeOfPin(el.id, 'source');
          const vSG = (nodeVoltagesArray[nS] || 0) - (nodeVoltagesArray[nG] || 0);
          const vTh = Math.abs(el.properties.vth ?? 2.5);
          conductances.push({ node1: nG, node2: nS, conductance: 1 / 1e9 });
          if (vSG >= vTh) {
            conductances.push({ node1: nS, node2: nD, conductance: 1 / (el.properties.rdsOn ?? 0.05) });
          } else {
            conductances.push({ node1: nS, node2: nD, conductance: 1 / 1e7 });
          }
          break;
        }

        // Logic gates
        case 'not_gate':
        case 'and_gate':
        case 'or_gate':
        case 'nand_gate':
        case 'nor_gate':
        case 'xor_gate':
        case 'xnor_gate': {
          let outLogic = false;
          if (el.type === 'not_gate') {
            const nIn = getNodeOfPin(el.id, 'in');
            const vIn = nodeVoltagesArray[nIn] || 0;
            outLogic = vIn < 1.5;
          } else {
            const nIn1 = getNodeOfPin(el.id, 'in1');
            const nIn2 = getNodeOfPin(el.id, 'in2');
            const in1 = (nodeVoltagesArray[nIn1] || 0) > 2.0;
            const in2 = (nodeVoltagesArray[nIn2] || 0) > 2.0;

            if (el.type === 'and_gate') outLogic = in1 && in2;
            else if (el.type === 'or_gate') outLogic = in1 || in2;
            else if (el.type === 'nand_gate') outLogic = !(in1 && in2);
            else if (el.type === 'nor_gate') outLogic = !(in1 || in2);
            else if (el.type === 'xor_gate') outLogic = in1 !== in2;
            else if (el.type === 'xnor_gate') outLogic = in1 === in2;
          }

          const targetV = outLogic ? 5.0 : 0.0;
          const nOut = getNodeOfPin(el.id, 'out');
          voltageSources.push({ posNode: nOut, negNode: 0, voltage: targetV, sourceId: `${el.id}_logic_out` });
          break;
        }

        case 'regulator_7805': {
          const nIn = getNodeOfPin(el.id, 'in');
          const nGnd = getNodeOfPin(el.id, 'gnd');
          const nOut = getNodeOfPin(el.id, 'out');
          const vIn = (nodeVoltagesArray[nIn] || 0) - (nodeVoltagesArray[nGnd] || 0);

          if (vIn >= 7.0) {
            voltageSources.push({ posNode: nOut, negNode: nGnd, voltage: 5.0, sourceId: `${el.id}_reg` });
          } else if (vIn > 0) {
            voltageSources.push({ posNode: nOut, negNode: nGnd, voltage: Math.max(0, vIn - 2.0), sourceId: `${el.id}_reg` });
          }
          break;
        }

        case 'voltmeter': {
          const nPos = getNodeOfPin(el.id, 'pos');
          const nNeg = getNodeOfPin(el.id, 'neg');
          conductances.push({ node1: nPos, node2: nNeg, conductance: 1 / 1e7 });
          break;
        }

        case 'ammeter': {
          const nIn = getNodeOfPin(el.id, 'in');
          const nOut = getNodeOfPin(el.id, 'out');
          conductances.push({ node1: nIn, node2: nOut, conductance: 1 / 0.01 });
          break;
        }

        default:
          break;
      }
    }

    const numNonRef = Math.max(0, numNodes - 1);
    const numV = voltageSources.length;
    const totalDim = numNonRef + numV;

    if (totalDim === 0) break;

    const A: number[][] = Array.from({ length: totalDim }, () => new Array(totalDim).fill(0));
    const B: number[] = new Array(totalDim).fill(0);

    const nodeIdx = (n: number) => n - 1;

    for (const c of conductances) {
      const g = c.conductance;
      const n1 = c.node1;
      const n2 = c.node2;

      if (n1 > 0) A[nodeIdx(n1)][nodeIdx(n1)] += g;
      if (n2 > 0) A[nodeIdx(n2)][nodeIdx(n2)] += g;
      if (n1 > 0 && n2 > 0) {
        A[nodeIdx(n1)][nodeIdx(n2)] -= g;
        A[nodeIdx(n2)][nodeIdx(n1)] -= g;
      }
    }

    for (let i = 0; i < numNonRef; i++) {
      A[i][i] += G_MIN;
    }

    for (const cs of currentSources) {
      if (cs.fromNode > 0) B[nodeIdx(cs.fromNode)] -= cs.current;
      if (cs.toNode > 0) B[nodeIdx(cs.toNode)] += cs.current;
    }

    for (let k = 0; k < numV; k++) {
      const vs = voltageSources[k];
      const row = numNonRef + k;
      const col = numNonRef + k;

      if (vs.posNode > 0) {
        A[nodeIdx(vs.posNode)][col] += 1;
        A[row][nodeIdx(vs.posNode)] += 1;
      }
      if (vs.negNode > 0) {
        A[nodeIdx(vs.negNode)][col] -= 1;
        A[row][nodeIdx(vs.negNode)] -= 1;
      }

      B[row] = vs.voltage;
    }

    const sol = solveLinearSystem(A, B);
    if (!sol) {
      result.diagnostics.status = 'unstable';
      result.diagnostics.message = 'الدائرة غير مستقرة أو تحتوي على مسار قصر مباشر.';
      break;
    }

    const nextVoltages = new Array(numNodes).fill(0);
    for (let n = 1; n < numNodes; n++) {
      nextVoltages[n] = sol[nodeIdx(n)];
    }

    let stateChanged = false;
    for (const el of elements) {
      if (el.type === 'diode' || el.type === 'diode_schottky' || el.type === 'led') {
        const nA = getNodeOfPin(el.id, 'anode');
        const nK = getNodeOfPin(el.id, 'cathode');
        const vDiff = nextVoltages[nA] - nextVoltages[nK];
        let vDrop = 0.7;
        if (el.type === 'diode_schottky') vDrop = 0.3;
        else if (el.type === 'led') vDrop = el.properties.forwardDrop ?? 2.0;

        const shouldConduct = vDiff >= vDrop * 0.95;
        const currentConducting = diodeConductionState.get(el.id) ?? false;
        if (shouldConduct !== currentConducting) {
          diodeConductionState.set(el.id, shouldConduct);
          stateChanged = true;
        }
      }
    }

    nodeVoltagesArray = nextVoltages;
    if (!stateChanged && iteration > 0) break;
  }

  // Populate voltages
  for (let n = 0; n < numNodes; n++) {
    result.nodeVoltages.set(`node_${n}`, Math.round(nodeVoltagesArray[n] * 1000) / 1000);
  }

  for (const pk of pinKeys) {
    const root = ds.find(pk);
    const n = rootNodeMap.get(root) ?? 0;
    const v = nodeVoltagesArray[n] || 0;
    result.pinVoltages.set(pk, Math.round(v * 1000) / 1000);
  }

  // Calculate element currents, powers, warnings
  for (const el of elements) {
    let current = 0;
    let power = 0;

    switch (el.type) {
      case 'resistor':
      case 'resistor_smd':
      case 'resistor_power':
      case 'resistor_shunt': {
        const v1 = result.pinVoltages.get(`${el.id}:p1`) ?? 0;
        const v2 = result.pinVoltages.get(`${el.id}:p2`) ?? 0;
        const vDiff = Math.abs(v1 - v2);
        const r = el.properties.resistance ?? el.value ?? 1000;
        current = r > 0 ? vDiff / r : 0;
        power = vDiff * current;
        break;
      }

      case 'dc_source':
      case 'battery_aa':
      case 'battery_aaa':
      case 'battery_c':
      case 'battery_d':
      case 'battery_9v':
      case 'battery_18650':
      case 'battery_lipo':
      case 'battery_lead_acid':
      case 'solar_cell':
      case 'bench_power_supply': {
        const vPos = result.pinVoltages.get(`${el.id}:pos`) ?? 0;
        const vNeg = result.pinVoltages.get(`${el.id}:neg`) ?? 0;
        const vDiff = vPos - vNeg;
        // Check for direct short circuit
        if (Math.abs(vDiff) < 0.01 && (el.properties.voltage ?? el.value ?? 9) > 0.5) {
          result.diagnostics.warnings.push(`تحذير قصر كهربائي مباشر (Short Circuit) على ${el.label}!`);
          result.diagnostics.status = 'short_circuit';
        }
        current = 0.05;
        power = Math.abs(vDiff * current);
        break;
      }

      case 'capacitor_electrolytic':
      case 'capacitor_super': {
        const vPos = result.pinVoltages.get(`${el.id}:pos`) ?? 0;
        const vNeg = result.pinVoltages.get(`${el.id}:neg`) ?? 0;
        if (vPos < vNeg - 0.2) {
          result.diagnostics.warnings.push(`تحذير: عكس قطبية المكثف الإلكتروليتي ${el.label} (+ < -)! خطر التلف.`);
        }
        break;
      }

      case 'lamp': {
        const v1 = result.pinVoltages.get(`${el.id}:p1`) ?? 0;
        const v2 = result.pinVoltages.get(`${el.id}:p2`) ?? 0;
        const vDiff = Math.abs(v1 - v2);
        const r = el.properties.resistance ?? 48;
        current = vDiff / r;
        power = vDiff * current;
        const ratedV = el.properties.ratedVoltage ?? 12;
        el.properties.brightness = Math.min(1.0, Math.pow(vDiff / ratedV, 1.6));
        break;
      }

      case 'led': {
        const vA = result.pinVoltages.get(`${el.id}:anode`) ?? 0;
        const vK = result.pinVoltages.get(`${el.id}:cathode`) ?? 0;
        const vDiff = vA - vK;
        const vDrop = el.properties.forwardDrop ?? 2.0;

        if (vDiff > vDrop) {
          current = (vDiff - vDrop) / 3.0;
          if (current > 0.08) {
            el.properties.isBurnt = true;
            result.diagnostics.burntComponents.push(el.id);
            result.diagnostics.warnings.push(`احتراق الـ LED ${el.label} بسبب مرور تيار مفرط (${(current * 1000).toFixed(1)} mA)!`);
          } else {
            el.properties.isBurnt = false;
          }
          el.properties.isLit = current > 0.001 && !el.properties.isBurnt;
          el.properties.brightness = Math.min(1.0, current / 0.02);
        } else {
          current = 0;
          el.properties.isLit = false;
          el.properties.brightness = 0;
        }
        power = Math.max(0, vDiff * current);
        break;
      }

      case 'dc_motor': {
        const v1 = result.pinVoltages.get(`${el.id}:p1`) ?? 0;
        const v2 = result.pinVoltages.get(`${el.id}:p2`) ?? 0;
        const vDiff = v1 - v2;
        const absV = Math.abs(vDiff);
        const r = el.properties.internalR ?? 15;
        current = absV / r;
        power = absV * current;

        const nominalV = el.properties.nominalV ?? 9;
        const rpm = Math.round((absV / nominalV) * 3000);
        el.properties.rpm = rpm;
        el.properties.isRunning = absV >= 1.0;
        break;
      }

      case 'buzzer': {
        const vPos = result.pinVoltages.get(`${el.id}:pos`) ?? 0;
        const vNeg = result.pinVoltages.get(`${el.id}:neg`) ?? 0;
        const vDiff = vPos - vNeg;
        const r = el.properties.internalR ?? 100;
        current = Math.max(0, vDiff) / r;
        power = Math.max(0, vDiff) * current;
        el.properties.isActive = vDiff >= 2.5;
        break;
      }

      case 'voltmeter': {
        const vPos = result.pinVoltages.get(`${el.id}:pos`) ?? 0;
        const vNeg = result.pinVoltages.get(`${el.id}:neg`) ?? 0;
        el.properties.reading = Math.round((vPos - vNeg) * 100) / 100;
        break;
      }

      case 'ammeter': {
        const vIn = result.pinVoltages.get(`${el.id}:in`) ?? 0;
        const vOut = result.pinVoltages.get(`${el.id}:out`) ?? 0;
        const rShunt = 0.01;
        const iA = (vIn - vOut) / rShunt;
        current = Math.abs(iA);
        el.properties.reading = Math.round(iA * 1000 * 10) / 10;
        break;
      }

      default:
        break;
    }

    result.elementCurrents.set(el.id, current);
    result.elementPowers.set(el.id, power);
  }

  // Branch currents for wire animations
  for (const wire of wires) {
    const v1 = result.pinVoltages.get(`${wire.fromComponentId}:${wire.fromPinId}`) ?? 0;
    const v2 = result.pinVoltages.get(`${wire.toComponentId}:${wire.toPinId}`) ?? 0;
    const i1 = result.elementCurrents.get(wire.fromComponentId) ?? 0;
    const i2 = result.elementCurrents.get(wire.toComponentId) ?? 0;
    const wireCurrent = Math.max(i1, i2);

    result.branchCurrents.set(wire.id, wireCurrent);
    wire.voltage = (v1 + v2) / 2;
    wire.current = wireCurrent;
  }

  if (result.diagnostics.status !== 'short_circuit' && result.diagnostics.status !== 'unstable') {
    result.diagnostics.status = 'ok';
    result.diagnostics.message = `المحاكاة نشطة: تم حساب ${numNodes} عقدة جهد بنجاح عبر Modified Nodal Analysis.`;
  }

  return result;
}

/**
 * Calculates multimeter measurement between red & black test probes.
 */
export function measureWithMultimeter(
  mode: 'DCV' | 'ACV' | 'DCA' | 'RES' | 'DIODE' | 'CONT',
  redPinKey: string | null,
  blackPinKey: string | null,
  simResult: SimulationResult,
  elements: CircuitElement[]
): { value: string; unit: string; beep?: boolean } {
  if (!redPinKey || !blackPinKey) {
    return { value: '0.000', unit: mode === 'RES' ? 'Ω' : 'V' };
  }

  const vRed = simResult.pinVoltages.get(redPinKey) ?? 0;
  const vBlack = simResult.pinVoltages.get(blackPinKey) ?? 0;

  switch (mode) {
    case 'DCV': {
      const vDiff = vRed - vBlack;
      if (Math.abs(vDiff) < 1.0) {
        return { value: (vDiff * 1000).toFixed(1), unit: 'mV' };
      }
      return { value: vDiff.toFixed(3), unit: 'V' };
    }

    case 'ACV': {
      const vDiff = Math.abs(vRed - vBlack);
      return { value: (vDiff * 0.707).toFixed(2), unit: 'V~' };
    }

    case 'DCA': {
      const [compId] = redPinKey.split(':');
      const current = simResult.elementCurrents.get(compId) ?? 0;
      if (current < 0.001) {
        return { value: (current * 1e6).toFixed(1), unit: 'µA' };
      } else if (current < 1.0) {
        return { value: (current * 1000).toFixed(2), unit: 'mA' };
      }
      return { value: current.toFixed(3), unit: 'A' };
    }

    case 'RES': {
      const [rComp] = redPinKey.split(':');
      const [bComp] = blackPinKey.split(':');
      if (rComp === bComp) {
        const el = elements.find(e => e.id === rComp);
        if (el && (el.type === 'resistor' || el.type === 'resistor_smd' || el.type === 'resistor_power' || el.type === 'resistor_shunt')) {
          const r = el.properties.resistance ?? el.value ?? 1000;
          if (r >= 1e6) return { value: (r / 1e6).toFixed(2), unit: 'MΩ' };
          if (r >= 1e3) return { value: (r / 1e3).toFixed(2), unit: 'kΩ' };
          return { value: r.toFixed(1), unit: 'Ω' };
        }
      }
      return { value: 'O.L', unit: 'MΩ' };
    }

    case 'DIODE': {
      const vDiff = vRed - vBlack;
      if (vDiff >= 0.25 && vDiff <= 0.85) {
        return { value: vDiff.toFixed(3), unit: 'V', beep: true };
      }
      return { value: 'O.L', unit: 'V' };
    }

    case 'CONT': {
      const vDiff = Math.abs(vRed - vBlack);
      const isContinuity = vDiff < 0.001;
      return { value: isContinuity ? '0.00' : 'O.L', unit: 'Ω', beep: isContinuity };
    }

    default:
      return { value: '0.00', unit: '' };
  }
}
