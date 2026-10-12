/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Circuit Types and Definitions
 */

export type ComponentCategory =
  | 'power'
  | 'connectors'
  | 'switches_sensors'
  | 'passives'
  | 'semiconductors'
  | 'logic'
  | 'ics'
  | 'outputs'
  | 'instruments';

export type ComponentType =
  // 1. Power Supplies & Batteries
  | 'dc_source'
  | 'battery_aa'
  | 'battery_aaa'
  | 'battery_c'
  | 'battery_d'
  | 'battery_9v'
  | 'battery_18650'
  | 'battery_lipo'
  | 'battery_lead_acid'
  | 'solar_cell'
  | 'bench_power_supply'
  | 'ac_source'
  | 'ground'
  | 'vcc'
  | 'current_source'
  // 2. Connectors
  | 'junction'
  | 'terminal'
  // 3. Switches & Sensors
  | 'spst_switch'
  | 'switch_spdt'
  | 'switch_dpdt'
  | 'push_button'
  | 'push_button_nc'
  | 'potentiometer'
  | 'trimmer_pot'
  | 'ldr'
  | 'thermistor'
  | 'thermistor_ptc'
  // 4. Passives: Resistors, Capacitors, Inductors
  | 'resistor'
  | 'resistor_smd'
  | 'resistor_power'
  | 'resistor_shunt'
  | 'capacitor'
  | 'capacitor_ceramic'
  | 'capacitor_electrolytic'
  | 'capacitor_film'
  | 'capacitor_super'
  | 'capacitor_trimmer'
  | 'inductor'
  | 'choke'
  | 'transformer'
  // 5. Semiconductors
  | 'diode'
  | 'diode_schottky'
  | 'photodiode'
  | 'zener_diode'
  | 'led'
  | 'transistor_npn'
  | 'transistor_pnp'
  | 'mosfet_n'
  | 'mosfet_p'
  | 'jfet_n'
  | 'bridge_rectifier'
  // 6. Logic Gates & ICs
  | 'not_gate'
  | 'and_gate'
  | 'or_gate'
  | 'nand_gate'
  | 'nor_gate'
  | 'xor_gate'
  | 'xnor_gate'
  | 'timer_555'
  | 'opamp'
  | 'regulator_7805'
  // 7. Outputs & Mechatronics Actuators
  | 'lamp'
  | 'dc_motor'
  | 'servo_motor'
  | 'stepper_motor'
  | 'buzzer'
  | 'relay_spdt'
  | 'seven_segment'
  | 'ultrasonic_sensor'
  // 8. Instruments
  | 'voltmeter'
  | 'ammeter'
  | 'oscilloscope'
  | 'function_generator';

export type RenderStyle = 'schematic' | 'realistic';

export interface PinDefinition {
  id: string; // unique pin id within component, e.g. "p1", "p2", "base", "collector", "anode", "pos", "neg"
  label: string; // Arabic / international label, e.g. "+" / "-" / "B" / "C" / "E" / "Anode" / "Cathode"
  x: number; // offset relative to component origin
  y: number; // offset relative to component origin
  direction: 'left' | 'right' | 'top' | 'bottom';
  type?: 'input' | 'output' | 'bidirectional' | 'power' | 'ground';
}

export interface CircuitElement {
  id: string;
  type: ComponentType;
  x: number; // grid position x
  y: number; // grid position y
  rotation: 0 | 90 | 180 | 270;
  label: string; // custom name, e.g. "R1", "V1", "D1", "LED1"
  value: number; // numerical value (e.g. 1000 for 1kΩ, 9 for 9V, 0.0001 for 100µF)
  unit: string; // e.g. "Ω", "kΩ", "MΩ", "V", "mA", "µF", "mH"
  properties: Record<string, any>; // custom props: switch state, LED color, pot position (0-1), etc.
}

export interface WireConnection {
  id: string;
  fromComponentId: string;
  fromPinId: string;
  toComponentId: string;
  toPinId: string;
  color?: string;
  // Computed during simulation
  current?: number;
  voltage?: number;
}

export interface SimulationResult {
  isRunning: boolean;
  timestamp: number;
  nodeVoltages: Map<string, number>; // nodeId -> voltage (V)
  pinVoltages: Map<string, number>; // "componentId:pinId" -> voltage (V)
  elementCurrents: Map<string, number>; // componentId -> current (A)
  elementPowers: Map<string, number>; // componentId -> power (W)
  branchCurrents: Map<string, number>; // wireId -> current (A)
  diagnostics: {
    status: 'ok' | 'short_circuit' | 'open_circuit' | 'unstable' | 'idle';
    message: string;
    nodeCount: number;
    componentCount: number;
    burntComponents: string[]; // components damaged by over-current
    warnings: string[]; // e.g. reverse polarity on electrolytic capacitor, short circuit
  };
}

export type ViewMode = 'normal' | 'voltage_levels' | 'current_flow' | 'logic_levels';

export interface MultimeterState {
  isOpen: boolean;
  mode: 'DCV' | 'ACV' | 'DCA' | 'RES' | 'DIODE' | 'CONT';
  range: string;
  redProbe: { x: number; y: number; connectedPin?: { componentId: string; pinId: string } } | null;
  blackProbe: { x: number; y: number; connectedPin?: { componentId: string; pinId: string } } | null;
  displayValue: string;
  displayUnit: string;
  beep?: boolean;
}

export interface SavedCircuit {
  id: string;
  name: string;
  date: string;
  description: string;
  elements: CircuitElement[];
  wires: WireConnection[];
  category?: string;
}

export interface ExperimentStep {
  stepNumber: number;
  instruction: string;
  verificationTip: string;
  isCompleted?: boolean;
}

export interface ExperimentQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LabExperiment {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  category: string;
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم';
  theory: string;
  equations: string[];
  schematicImage?: string;
  requiredComponents: { type: ComponentType; count: number; name: string }[];
  steps: ExperimentStep[];
  expectedResults: { parameter: string; formula: string; expectedValue: string }[];
  quiz: ExperimentQuiz[];
  circuitTemplate: {
    elements: CircuitElement[];
    wires: WireConnection[];
  };
}

export interface StudentProfile {
  name: string;
  university: string;
  department: string;
  academicId: string;
  completedExperiments: string[]; // experiment IDs
  quizScores: Record<string, number>; // experiment ID -> score percentage
  savedCircuitsCount: number;
  favorites?: ComponentType[];
  recents?: ComponentType[];
}
