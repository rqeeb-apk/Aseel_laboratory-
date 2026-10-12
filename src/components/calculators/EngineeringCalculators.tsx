/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Engineering Calculators Suite
 */

import React, { useState } from 'react';
import { Calculator, Zap, Cpu, Activity, X } from 'lucide-react';

interface EngineeringCalculatorsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EngineeringCalculators: React.FC<EngineeringCalculatorsProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeCalc, setActiveCalc] = useState<'ohm' | 'color_code' | 'divider' | 'led' | 'timer555'>('ohm');

  // 1. Ohm's law state
  const [ohmV, setOhmV] = useState<number>(9);
  const [ohmR, setOhmR] = useState<number>(1000);

  // 2. Resistor color code state
  const [band1, setBand1] = useState<number>(1); // Brown
  const [band2, setBand2] = useState<number>(0); // Black
  const [multiplier, setMultiplier] = useState<number>(2); // Red (10^2)
  const [tolerance, setTolerance] = useState<string>('5%'); // Gold

  // 3. Voltage Divider state
  const [divVin, setDivVin] = useState<number>(12);
  const [divR1, setDivR1] = useState<number>(10000);
  const [divR2, setDivR2] = useState<number>(10000);

  // 4. LED Resistor state
  const [ledVs, setLedVs] = useState<number>(9);
  const [ledVf, setLedVf] = useState<number>(2.0);
  const [ledIf, setLedIf] = useState<number>(20); // mA

  // 5. 555 Timer state
  const [t555R1, setT555R1] = useState<number>(10000);
  const [t555R2, setT555R2] = useState<number>(47000);
  const [t555C, setT555C] = useState<number>(10); // µF

  if (!isOpen) return null;

  // Resistor color map
  const colorBands = [
    { name: 'أسود Black', val: 0, mult: 1, hex: '#020617' },
    { name: 'بني Brown', val: 1, mult: 10, hex: '#78350f' },
    { name: 'أحمر Red', val: 2, mult: 100, hex: '#dc2626' },
    { name: 'برتقالي Orange', val: 3, mult: 1000, hex: '#ea580c' },
    { name: 'أصفر Yellow', val: 4, mult: 10000, hex: '#eab308' },
    { name: 'أخضر Green', val: 5, mult: 100000, hex: '#16a34a' },
    { name: 'أزرق Blue', val: 6, mult: 1000000, hex: '#2563eb' },
    { name: 'بنفسجي Violet', val: 7, mult: 10000000, hex: '#9333ea' },
    { name: 'رمادي Gray', val: 8, mult: 100000000, hex: '#64748b' },
    { name: 'أبيض White', val: 9, mult: 1000000000, hex: '#f8fafc' },
  ];

  // Calculations
  const ohmI = ohmR > 0 ? (ohmV / ohmR) : 0;
  const ohmP = ohmV * ohmI;

  const resVal = (band1 * 10 + band2) * Math.pow(10, multiplier);

  const divVout = (divR1 + divR2) > 0 ? divVin * (divR2 / (divR1 + divR2)) : 0;

  const ledR = ledIf > 0 ? Math.max(0, (ledVs - ledVf) / (ledIf / 1000)) : 0;
  const ledPr = Math.pow(ledIf / 1000, 2) * ledR;

  const cFarad = t555C * 1e-6;
  const t555Freq = (t555R1 + 2 * t555R2) > 0 && cFarad > 0
    ? 1.44 / ((t555R1 + 2 * t555R2) * cFarad)
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">حاسبات مهندس الميكاترونكس</h2>
              <p className="text-xs text-slate-400">حسابات سريعة ودقيقة للدوائر والمكونات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calculator Chooser Tabs */}
        <div className="flex items-center gap-1.5 px-6 pt-3 border-b border-slate-800 shrink-0 bg-slate-950/40 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCalc('ohm')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
              activeCalc === 'ohm' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            قانون أوم (V, I, R, P)
          </button>
          <button
            onClick={() => setActiveCalc('color_code')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
              activeCalc === 'color_code' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            كود ألوان المقاومات
          </button>
          <button
            onClick={() => setActiveCalc('divider')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
              activeCalc === 'divider' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            مجزئ الجهد (Divider)
          </button>
          <button
            onClick={() => setActiveCalc('led')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
              activeCalc === 'led' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            مقاومة الـ LED
          </button>
          <button
            onClick={() => setActiveCalc('timer555')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
              activeCalc === 'timer555' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            تردد مؤقت 555
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/40">
          {/* OHM'S LAW */}
          {activeCalc === 'ohm' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الجهد المطبق (V بالفولت):</label>
                  <input
                    type="number"
                    value={ohmV}
                    onChange={e => setOhmV(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المقاومة (R بالأوم Ω):</label>
                  <input
                    type="number"
                    value={ohmR}
                    onChange={e => setOhmR(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <span className="text-xs text-slate-400">التيار الكهربائي المحسوب (I):</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {(ohmI * 1000).toFixed(2)} mA
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{ohmI.toFixed(5)} A</div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <span className="text-xs text-slate-400">القدرة الكهربائية المبددة (P):</span>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                    {(ohmP * 1000).toFixed(2)} mW
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{ohmP.toFixed(4)} W</div>
                </div>
              </div>
            </div>
          )}

          {/* COLOR CODE */}
          {activeCalc === 'color_code' && (
            <div className="space-y-4">
              {/* Graphical Resistor Representation */}
              <div className="h-20 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center px-8 relative">
                <div className="w-12 h-2 bg-slate-600" />
                <div className="w-48 h-12 bg-amber-200/90 rounded-md flex items-center justify-around px-4 shadow-md">
                  <div className="w-3 h-full" style={{ backgroundColor: colorBands[band1].hex }} />
                  <div className="w-3 h-full" style={{ backgroundColor: colorBands[band2].hex }} />
                  <div className="w-3 h-full" style={{ backgroundColor: colorBands[multiplier].hex }} />
                  <div className="w-3 h-full bg-amber-500" />
                </div>
                <div className="w-12 h-2 bg-slate-600" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">النطاق الأول:</label>
                  <select
                    value={band1}
                    onChange={e => setBand1(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  >
                    {colorBands.slice(1).map(b => (
                      <option key={b.val} value={b.val}>{b.name} ({b.val})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">النطاق الثاني:</label>
                  <select
                    value={band2}
                    onChange={e => setBand2(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  >
                    {colorBands.map(b => (
                      <option key={b.val} value={b.val}>{b.name} ({b.val})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المضاعف (Multiplier):</label>
                  <select
                    value={multiplier}
                    onChange={e => setMultiplier(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  >
                    {colorBands.map(b => (
                      <option key={b.val} value={b.val}>10^{b.val} ({b.name})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                <span className="text-xs text-slate-400">قيمة المقاومة الإجمالية:</span>
                <div className="text-3xl font-bold font-mono text-sky-400 mt-1">
                  {resVal >= 1e6
                    ? `${(resVal / 1e6).toFixed(2)} MΩ`
                    : resVal >= 1e3
                    ? `${(resVal / 1e3).toFixed(2)} kΩ`
                    : `${resVal} Ω`}{' '}
                  ±5%
                </div>
              </div>
            </div>
          )}

          {/* VOLTAGE DIVIDER */}
          {activeCalc === 'divider' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">جهد الدخل Vin (V):</label>
                  <input
                    type="number"
                    value={divVin}
                    onChange={e => setDivVin(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المقاومة R1 (Ω):</label>
                  <input
                    type="number"
                    value={divR1}
                    onChange={e => setDivR1(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المقاومة R2 (Ω):</label>
                  <input
                    type="number"
                    value={divR2}
                    onChange={e => setDivR2(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                <span className="text-xs text-slate-400">جهد الخرج المأخوذ عبر R2 (Vout):</span>
                <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                  {divVout.toFixed(3)} V
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  نسبة التجزئة: {((divVout / (divVin || 1)) * 100).toFixed(1)}% من جهد الدخل
                </div>
              </div>
            </div>
          )}

          {/* LED RESISTOR */}
          {activeCalc === 'led' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">جهد المصدر Vs (V):</label>
                  <input
                    type="number"
                    value={ledVs}
                    onChange={e => setLedVs(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">جهد عتبة الـ LED (Vf):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ledVf}
                    onChange={e => setLedVf(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">تيار التشغيل المطلوب (mA):</label>
                  <input
                    type="number"
                    value={ledIf}
                    onChange={e => setLedIf(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                  <span className="text-xs text-slate-400">قيمة مقاومة الحماية المقترحة:</span>
                  <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
                    {Math.round(ledR)} Ω
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">القيمة القياسية الأقرب: {Math.ceil(ledR / 10) * 10} Ω</div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                  <span className="text-xs text-slate-400">قدرة المقاومة المطلوبة:</span>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                    {(ledPr * 1000).toFixed(1)} mW
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">استخدم مقاومة ربع واط (0.25W) على الأقل</div>
                </div>
              </div>
            </div>
          )}

          {/* 555 TIMER */}
          {activeCalc === 'timer555' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المقاومة R1 (Ω):</label>
                  <input
                    type="number"
                    value={t555R1}
                    onChange={e => setT555R1(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المقاومة R2 (Ω):</label>
                  <input
                    type="number"
                    value={t555R2}
                    onChange={e => setT555R2(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">السعة C (µF):</label>
                  <input
                    type="number"
                    value={t555C}
                    onChange={e => setT555C(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                <span className="text-xs text-slate-400">تردد النبضات المتولد (Frequency):</span>
                <div className="text-3xl font-bold font-mono text-fuchsia-400 mt-1">
                  {t555Freq.toFixed(2)} Hz
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  الزمن الدوري T = {(t555Freq > 0 ? (1 / t555Freq) : 0).toFixed(3)} ثانية
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
