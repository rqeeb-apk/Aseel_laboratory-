/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Electrical Simulation Verification Suite
 * Tests Ohm's Law, Kirchhoff's Laws, Voltage Divider, and Non-linearities
 */

import { runCircuitSimulation } from './simulationEngine';
import { CircuitElement, WireConnection } from '../types/circuit';

export interface TestCaseResult {
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
  notes: string;
}

export function runElectricalTests(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  // TEST 1 (MANDATORY CASE 1): بطارية 9V ومقاومة 1kΩ: التيار 9mA
  {
    const elements: CircuitElement[] = [
      {
        id: 'bat1',
        type: 'dc_source',
        x: 100,
        y: 100,
        rotation: 0,
        label: 'V1 (9V)',
        value: 9,
        unit: 'V',
        properties: { voltage: 9 },
      },
      {
        id: 'r1',
        type: 'resistor',
        x: 300,
        y: 100,
        rotation: 0,
        label: 'R1 (1kΩ)',
        value: 1000,
        unit: 'Ω',
        properties: { resistance: 1000 },
      },
      {
        id: 'gnd1',
        type: 'ground',
        x: 100,
        y: 200,
        rotation: 0,
        label: 'GND',
        value: 0,
        unit: 'V',
        properties: {},
      },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'bat1', fromPinId: 'pos', toComponentId: 'r1', toPinId: 'p1' },
      { id: 'w2', fromComponentId: 'r1', fromPinId: 'p2', toComponentId: 'bat1', toPinId: 'neg' },
      { id: 'w3', fromComponentId: 'bat1', fromPinId: 'neg', toComponentId: 'gnd1', toPinId: 'gnd' },
    ];

    const sim = runCircuitSimulation(elements, wires);
    const i = sim.elementCurrents.get('r1') ?? 0;
    const v = (sim.pinVoltages.get('r1:p1') ?? 0) - (sim.pinVoltages.get('r1:p2') ?? 0);
    const passed = Math.abs(i - 0.009) < 0.0005 && Math.abs(v - 9) < 0.05;

    results.push({
      name: 'اختبار 1: بطارية 9V ومقاومة 1kΩ (قانون أوم)',
      expected: 'التيار = 9.00 mA, الجهد = 9.00 V',
      actual: `التيار = ${(i * 1000).toFixed(2)} mA, الجهد = ${v.toFixed(2)} V`,
      passed,
      notes: 'التحقق من حساب التيار والجهد لمقاومة 1000Ω مع بطارية 9V.',
    });
  }

  // TEST 2 (MANDATORY CASE 2): مصدر 12V ومقاومتان 1kΩ على التوالي: التيار 6mA، والجهد على كل مقاومة 6V
  {
    const elements: CircuitElement[] = [
      {
        id: 'bat1',
        type: 'dc_source',
        x: 100,
        y: 100,
        rotation: 0,
        label: 'V1 (12V)',
        value: 12,
        unit: 'V',
        properties: { voltage: 12 },
      },
      {
        id: 'r1',
        type: 'resistor',
        x: 250,
        y: 100,
        rotation: 0,
        label: 'R1 (1kΩ)',
        value: 1000,
        unit: 'Ω',
        properties: { resistance: 1000 },
      },
      {
        id: 'r2',
        type: 'resistor',
        x: 400,
        y: 100,
        rotation: 0,
        label: 'R2 (1kΩ)',
        value: 1000,
        unit: 'Ω',
        properties: { resistance: 1000 },
      },
      {
        id: 'gnd1',
        type: 'ground',
        x: 100,
        y: 200,
        rotation: 0,
        label: 'GND',
        value: 0,
        unit: 'V',
        properties: {},
      },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'bat1', fromPinId: 'pos', toComponentId: 'r1', toPinId: 'p1' },
      { id: 'w2', fromComponentId: 'r1', fromPinId: 'p2', toComponentId: 'r2', toPinId: 'p1' },
      { id: 'w3', fromComponentId: 'r2', fromPinId: 'p2', toComponentId: 'bat1', toPinId: 'neg' },
      { id: 'w4', fromComponentId: 'bat1', fromPinId: 'neg', toComponentId: 'gnd1', toPinId: 'gnd' },
    ];

    const sim = runCircuitSimulation(elements, wires);
    const i1 = sim.elementCurrents.get('r1') ?? 0;
    const vR1 = Math.abs((sim.pinVoltages.get('r1:p1') ?? 0) - (sim.pinVoltages.get('r1:p2') ?? 0));
    const vR2 = Math.abs((sim.pinVoltages.get('r2:p1') ?? 0) - (sim.pinVoltages.get('r2:p2') ?? 0));
    const passed = Math.abs(i1 - 0.006) < 0.0005 && Math.abs(vR1 - 6.0) < 0.1 && Math.abs(vR2 - 6.0) < 0.1;

    results.push({
      name: 'اختبار 2: مصدر 12V ومقاومتان 1kΩ على التوالي',
      expected: 'التيار = 6.00 mA، والجهد على كل مقاومة = 6.00 V',
      actual: `التيار = ${(i1 * 1000).toFixed(2)} mA، VR1 = ${vR1.toFixed(2)} V، VR2 = ${vR2.toFixed(2)} V`,
      passed,
      notes: 'التحقق من تجزئة الجهد وتطابق التيار في التوصيل على التوالي.',
    });
  }

  // TEST 3 (MANDATORY CASE 3): مصدر 12V ومقاومتان 1kΩ على التوازي: التيار الكلي 24mA، وتيار كل فرع 12mA
  {
    const elements: CircuitElement[] = [
      {
        id: 'bat1',
        type: 'dc_source',
        x: 100,
        y: 100,
        rotation: 0,
        label: 'V1 (12V)',
        value: 12,
        unit: 'V',
        properties: { voltage: 12 },
      },
      {
        id: 'r1',
        type: 'resistor',
        x: 250,
        y: 80,
        rotation: 0,
        label: 'R1 (1kΩ)',
        value: 1000,
        unit: 'Ω',
        properties: { resistance: 1000 },
      },
      {
        id: 'r2',
        type: 'resistor',
        x: 250,
        y: 160,
        rotation: 0,
        label: 'R2 (1kΩ)',
        value: 1000,
        unit: 'Ω',
        properties: { resistance: 1000 },
      },
      {
        id: 'gnd1',
        type: 'ground',
        x: 100,
        y: 200,
        rotation: 0,
        label: 'GND',
        value: 0,
        unit: 'V',
        properties: {},
      },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'bat1', fromPinId: 'pos', toComponentId: 'r1', toPinId: 'p1' },
      { id: 'w2', fromComponentId: 'bat1', fromPinId: 'pos', toComponentId: 'r2', toPinId: 'p1' },
      { id: 'w3', fromComponentId: 'r1', fromPinId: 'p2', toComponentId: 'bat1', toPinId: 'neg' },
      { id: 'w4', fromComponentId: 'r2', fromPinId: 'p2', toComponentId: 'bat1', toPinId: 'neg' },
      { id: 'w5', fromComponentId: 'bat1', fromPinId: 'neg', toComponentId: 'gnd1', toPinId: 'gnd' },
    ];

    const sim = runCircuitSimulation(elements, wires);
    const i1 = sim.elementCurrents.get('r1') ?? 0;
    const i2 = sim.elementCurrents.get('r2') ?? 0;
    const iTotal = i1 + i2;
    const passed =
      Math.abs(i1 - 0.012) < 0.0005 &&
      Math.abs(i2 - 0.012) < 0.0005 &&
      Math.abs(iTotal - 0.024) < 0.001;

    results.push({
      name: 'اختبار 3: مصدر 12V ومقاومتان 1kΩ على التوازي',
      expected: 'التيار الكلي = 24.00 mA، وتيار كل فرع = 12.00 mA',
      actual: `التيار الكلي = ${(iTotal * 1000).toFixed(2)} mA، فرع 1 = ${(i1 * 1000).toFixed(2)} mA، فرع 2 = ${(i2 * 1000).toFixed(2)} mA`,
      passed,
      notes: 'التحقق من قانون كيرشوف للتيار والمقاومة المكافئة (500Ω) في التوصيل على التوازي.',
    });
  }

  // TEST 4: المفتاح الكهربائي والعزل
  {
    const elements: CircuitElement[] = [
      {
        id: 'bat1',
        type: 'dc_source',
        x: 100,
        y: 100,
        rotation: 0,
        label: 'V1',
        value: 5,
        unit: 'V',
        properties: { voltage: 5 },
      },
      {
        id: 'sw1',
        type: 'spst_switch',
        x: 220,
        y: 100,
        rotation: 0,
        label: 'SW1',
        value: 0,
        unit: '',
        properties: { closed: false },
      },
      {
        id: 'r1',
        type: 'resistor',
        x: 350,
        y: 100,
        rotation: 0,
        label: 'R1',
        value: 500,
        unit: 'Ω',
        properties: { resistance: 500 },
      },
      {
        id: 'gnd1',
        type: 'ground',
        x: 100,
        y: 200,
        rotation: 0,
        label: 'GND',
        value: 0,
        unit: 'V',
        properties: {},
      },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'bat1', fromPinId: 'pos', toComponentId: 'sw1', toPinId: 'p1' },
      { id: 'w2', fromComponentId: 'sw1', fromPinId: 'p2', toComponentId: 'r1', toPinId: 'p1' },
      { id: 'w3', fromComponentId: 'r1', fromPinId: 'p2', toComponentId: 'bat1', toPinId: 'neg' },
      { id: 'w4', fromComponentId: 'bat1', fromPinId: 'neg', toComponentId: 'gnd1', toPinId: 'gnd' },
    ];

    const simOpen = runCircuitSimulation(elements, wires);
    const iOpen = simOpen.elementCurrents.get('r1') ?? 0;

    elements[1].properties.closed = true;
    const simClosed = runCircuitSimulation(elements, wires);
    const iClosed = simClosed.elementCurrents.get('r1') ?? 0;

    const passed = iOpen < 0.0001 && Math.abs(iClosed - 0.01) < 0.001;

    results.push({
      name: 'اختبار 4: المفتاح الكهربائي (عزل تام وتوصيل)',
      expected: 'I_مفتوح ≈ 0 mA, I_مغلق = 10.00 mA',
      actual: `I_مفتوح = ${(iOpen * 1000).toFixed(4)} mA, I_مغلق = ${(iClosed * 1000).toFixed(2)} mA`,
      passed,
      notes: 'عزل تام للمسار المفتوح وتوصيل كامل عند إغلاق المفتاح.',
    });
  }

  return results;
}

if (typeof process !== 'undefined' && Array.isArray(process?.argv) && process.argv[1]?.includes('circuitCalculations.test')) {
  console.log('⚡ تشغيل حزمة اختبارات المحاكاة الكهربائية لمختبر الميكاترونكس اليمني:');
  const res = runElectricalTests();
  let allPassed = true;
  res.forEach(r => {
    console.log(`${r.passed ? '✅ [نجاح]' : '❌ [فشل]'} ${r.name}`);
    console.log(`   المتوقع: ${r.expected} | الفعلي: ${r.actual}`);
    if (!r.passed) allPassed = false;
  });
  console.log(`\nالنتيجة النهائية: ${allPassed ? '🎉 كافة الاختبارات الكهربائية متطابقة 100%' : '⚠️ بعض الاختبارات بحاجة إلى تدقيق'}`);
}
