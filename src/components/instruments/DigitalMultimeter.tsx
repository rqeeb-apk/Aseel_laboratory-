/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Realistic Interactive Digital Multimeter (DMM)
 */

import React, { useState } from 'react';
import { MultimeterState, SimulationResult, CircuitElement } from '../../types/circuit';
import { measureWithMultimeter } from '../../engine/simulationEngine';
import { COMPONENT_CATALOG } from '../../data/componentsCatalog';
import { X, Volume2, ShieldCheck, HelpCircle } from 'lucide-react';

interface DigitalMultimeterProps {
  multimeterState: MultimeterState;
  simResult: SimulationResult;
  elements: CircuitElement[];
  onClose: () => void;
  onUpdateMode: (mode: MultimeterState['mode']) => void;
  onConnectProbe: (probe: 'red' | 'black', componentId: string, pinId: string) => void;
  onDisconnectProbe: (probe: 'red' | 'black') => void;
}

export const DigitalMultimeter: React.FC<DigitalMultimeterProps> = ({
  multimeterState,
  simResult,
  elements,
  onClose,
  onUpdateMode,
  onConnectProbe,
  onDisconnectProbe,
}) => {
  const [isBacklightOn, setIsBacklightOn] = useState(true);

  const redPinKey = multimeterState.redProbe?.connectedPin
    ? `${multimeterState.redProbe.connectedPin.componentId}:${multimeterState.redProbe.connectedPin.pinId}`
    : null;

  const blackPinKey = multimeterState.blackProbe?.connectedPin
    ? `${multimeterState.blackProbe.connectedPin.componentId}:${multimeterState.blackProbe.connectedPin.pinId}`
    : null;

  const measurement = measureWithMultimeter(
    multimeterState.mode,
    redPinKey,
    blackPinKey,
    simResult,
    elements
  );

  const modeOptions: { id: MultimeterState['mode']; label: string; desc: string }[] = [
    { id: 'DCV', label: 'V⎓', desc: 'جهد مستمر DC' },
    { id: 'ACV', label: 'V~', desc: 'جهد متردد AC' },
    { id: 'DCA', label: 'mA⎓', desc: 'تيار مستمر DC' },
    { id: 'RES', label: 'Ω', desc: 'مقاومة كهربائية' },
    { id: 'DIODE', label: '⯈|', desc: 'فحص دايود' },
    { id: 'CONT', label: '🔊', desc: 'استمرارية وتوصيل' },
  ];

  // Helper to get element label
  const getPinLabel = (compId: string, pinId: string) => {
    const el = elements.find(e => e.id === compId);
    if (!el) return `${compId}:${pinId}`;
    const meta = COMPONENT_CATALOG[el.type];
    const pin = meta?.pins.find(p => p.id === pinId);
    return `${el.label} [${pin?.label || pinId}]`;
  };

  return (
    <div
      className="fixed bottom-20 left-4 sm:left-8 z-40 w-80 sm:w-88 bg-amber-500 rounded-3xl p-3 shadow-2xl shadow-black/80 border-4 border-amber-600 select-none"
      dir="rtl"
    >
      {/* Multimeter Body Inner Frame */}
      <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 flex flex-col gap-3">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-amber-400 tracking-wider">YEMEN-LAB DMM-830D</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Digital LCD Screen */}
        <div
          className={`rounded-xl p-3 border-2 transition-colors ${
            isBacklightOn
              ? 'bg-emerald-950/70 border-emerald-600/60 shadow-inner'
              : 'bg-slate-950 border-slate-800'
          }`}
        >
          {/* LCD Indicators top row */}
          <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-emerald-400/80">
            <span className="font-bold">{multimeterState.mode}</span>
            <div className="flex items-center gap-2">
              {measurement.beep && (
                <span className="flex items-center gap-0.5 text-emerald-300 animate-pulse">
                  <Volume2 className="w-3 h-3" /> BEEP
                </span>
              )}
              <span className="text-[9px]">AUTO RANGE</span>
            </div>
          </div>

          {/* Large 7-Segment Value */}
          <div className="flex items-baseline justify-end gap-1.5 py-1">
            <span
              className={`font-mono text-3xl font-bold tracking-wider ${
                isBacklightOn ? 'text-emerald-300' : 'text-slate-200'
              }`}
            >
              {measurement.value}
            </span>
            <span className="font-mono text-sm font-bold text-emerald-400">
              {measurement.unit}
            </span>
          </div>

          <div className="text-[10px] text-emerald-500/70 text-left font-mono">
            CALIBRATED • 10MΩ IMPEDANCE
          </div>
        </div>

        {/* Rotary Function Selector Dial */}
        <div>
          <div className="text-[10px] font-semibold text-slate-400 mb-1.5 text-center">
            محدد وظيفة القياس (Function Dial)
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {modeOptions.map(m => (
              <button
                key={m.id}
                onClick={() => onUpdateMode(m.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                  multimeterState.mode === m.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-102 ring-2 ring-amber-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
                }`}
              >
                <span className="text-sm font-mono">{m.label}</span>
                <span className="text-[9px] font-normal opacity-80 mt-0.5">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Probes Connection Sockets & Pickers */}
        <div className="border-t border-slate-800 pt-2.5 flex flex-col gap-2">
          {/* Red Probe (+) */}
          <div className="flex items-center justify-between text-xs p-1.5 bg-rose-950/40 border border-rose-900/50 rounded-xl">
            <div className="flex items-center gap-1.5 text-rose-300 font-medium">
              <div className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-400/50" />
              <span>المجس الأحمر (+):</span>
            </div>
            {multimeterState.redProbe?.connectedPin ? (
              <div className="flex items-center gap-1">
                <span className="text-rose-200 font-mono text-[11px] truncate max-w-[110px]">
                  {getPinLabel(
                    multimeterState.redProbe.connectedPin.componentId,
                    multimeterState.redProbe.connectedPin.pinId
                  )}
                </span>
                <button
                  onClick={() => onDisconnectProbe('red')}
                  className="px-1.5 py-0.5 text-[10px] bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded"
                >
                  فصل
                </button>
              </div>
            ) : (
              <select
                onChange={e => {
                  if (!e.target.value) return;
                  const [c, p] = e.target.value.split(':');
                  onConnectProbe('red', c, p);
                }}
                defaultValue=""
                className="text-[11px] bg-slate-900 border border-rose-800 text-rose-200 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="">اختر طرفاً للتوصيل</option>
                {elements.flatMap(el => {
                  const meta = COMPONENT_CATALOG[el.type];
                  return (
                    meta?.pins.map(pin => (
                      <option key={`${el.id}:${pin.id}`} value={`${el.id}:${pin.id}`}>
                        {el.label} ({pin.label})
                      </option>
                    )) || []
                  );
                })}
              </select>
            )}
          </div>

          {/* Black Probe (COM / -) */}
          <div className="flex items-center justify-between text-xs p-1.5 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <div className="w-3 h-3 rounded-full bg-slate-400 ring-2 ring-slate-500/50" />
              <span>المجس الأسود (COM):</span>
            </div>
            {multimeterState.blackProbe?.connectedPin ? (
              <div className="flex items-center gap-1">
                <span className="text-slate-200 font-mono text-[11px] truncate max-w-[110px]">
                  {getPinLabel(
                    multimeterState.blackProbe.connectedPin.componentId,
                    multimeterState.blackProbe.connectedPin.pinId
                  )}
                </span>
                <button
                  onClick={() => onDisconnectProbe('black')}
                  className="px-1.5 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  فصل
                </button>
              </div>
            ) : (
              <select
                onChange={e => {
                  if (!e.target.value) return;
                  const [c, p] = e.target.value.split(':');
                  onConnectProbe('black', c, p);
                }}
                defaultValue=""
                className="text-[11px] bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="">اختر طرفاً للتوصيل</option>
                {elements.flatMap(el => {
                  const meta = COMPONENT_CATALOG[el.type];
                  return (
                    meta?.pins.map(pin => (
                      <option key={`${el.id}:${pin.id}`} value={`${el.id}:${pin.id}`}>
                        {el.label} ({pin.label})
                      </option>
                    )) || []
                  );
                })}
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
