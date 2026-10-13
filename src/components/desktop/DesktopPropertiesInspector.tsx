/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Desktop Properties & Live Measurements Inspector
 * لوحة الخصائص وأجهزة القياس الجانبية الثابتة لوضع سطح المكتب (محاكاة برامج الحاسوب)
 */

import React, { useState } from 'react';
import {
  CircuitElement,
  WireConnection,
  SimulationResult,
  MultimeterState,
  RenderStyle,
  ViewMode,
} from '../../types/circuit';
import { COMPONENT_CATALOG } from '../../data/componentsCatalog';
import { measureWithMultimeter } from '../../engine/simulationEngine';
import {
  Settings,
  Gauge,
  RotateCw,
  Copy,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Volume2,
  Info,
} from 'lucide-react';

interface DesktopPropertiesInspectorProps {
  selectedElement: CircuitElement | null;
  selectedWireId: string | null;
  elements: CircuitElement[];
  wires: WireConnection[];
  simResult: SimulationResult;
  multimeterState: MultimeterState;
  isSimRunning: boolean;
  renderStyle: RenderStyle;
  viewMode: ViewMode;
  onToggleSim: () => void;
  onResetSim: () => void;
  onClearCanvas: () => void;
  onChangeRenderStyle: (style: RenderStyle) => void;
  onChangeViewMode: (mode: ViewMode) => void;
  onRotateElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onDeleteWire: (id: string) => void;
  onEditElement: (element: CircuitElement) => void;
  onToggleComponent?: (id: string) => void;
  onUpdateElementProperty?: (id: string, property: string, value: any) => void;
  onOpenFullMultimeter: () => void;
  onUpdateMultimeterMode: (mode: MultimeterState['mode']) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const DesktopPropertiesInspector: React.FC<DesktopPropertiesInspectorProps> = ({
  selectedElement,
  selectedWireId,
  elements,
  wires,
  simResult,
  multimeterState,
  isSimRunning,
  renderStyle,
  viewMode,
  onToggleSim,
  onResetSim,
  onClearCanvas,
  onChangeRenderStyle,
  onChangeViewMode,
  onRotateElement,
  onDuplicateElement,
  onDeleteElement,
  onDeleteWire,
  onEditElement,
  onToggleComponent,
  onUpdateElementProperty,
  onOpenFullMultimeter,
  onUpdateMultimeterMode,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'instruments'>('properties');

  // Compute live multimeter reading
  const redPinKey = multimeterState.redProbe?.connectedPin
    ? `${multimeterState.redProbe.connectedPin.componentId}:${multimeterState.redProbe.connectedPin.pinId}`
    : null;

  const blackPinKey = multimeterState.blackProbe?.connectedPin
    ? `${multimeterState.blackProbe.connectedPin.componentId}:${multimeterState.blackProbe.connectedPin.pinId}`
    : null;

  const dmmMeasurement = measureWithMultimeter(
    multimeterState.mode,
    redPinKey,
    blackPinKey,
    simResult,
    elements
  );

  const selectedMeta = selectedElement ? COMPONENT_CATALOG[selectedElement.type] : null;

  // Selected element electrical data from Simulation Result Maps
  const elementCurrent = selectedElement ? simResult.elementCurrents?.get(selectedElement.id) ?? 0 : 0;
  const elementPower = selectedElement ? simResult.elementPowers?.get(selectedElement.id) ?? 0 : 0;

  if (isCollapsed) {
    return (
      <aside
        className="w-12 h-full bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 select-none shrink-0 transition-all z-20"
        dir="rtl"
      >
        <button
          onClick={onToggleCollapse}
          title="توسيع لوحة الخصائص والقياسات"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 mb-4 transition-all"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
        <span
          className="text-xs font-bold text-slate-400 tracking-wider [writing-mode:vertical-rl] rotate-180"
          style={{ letterSpacing: '2px' }}
        >
          الخصائص والقياسات
        </span>
      </aside>
    );
  }

  return (
    <aside
      className="w-72 lg:w-80 h-full bg-slate-900/95 border-r border-slate-800 flex flex-col select-none shrink-0 transition-all z-20 backdrop-blur-sm shadow-xl"
      dir="rtl"
    >
      {/* Panel Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white">الخصائص وأجهزة القياس</h2>
            <p className="text-[10px] text-slate-400">مراقبة القيم والجهود الحية</p>
          </div>
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title="طي لوحة الخصائص"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs Switcher: Properties vs Instruments */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('properties')}
          className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'properties'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>خصائص العنصر</span>
        </button>
        <button
          onClick={() => setActiveTab('instruments')}
          className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'instruments'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>أجهزة القياس</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-thin">
        {activeTab === 'properties' && (
          <>
            {selectedElement && selectedMeta ? (
              <div className="space-y-3">
                {/* Selected Element Header Card */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{selectedMeta.nameAr}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{selectedMeta.nameEn}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/15 text-sky-400 border border-sky-500/30">
                      ID: {selectedElement.id.slice(0, 6)}
                    </span>
                  </div>

                  {/* Primary Value */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">القيمة الاسمية:</span>
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      {selectedElement.value} {selectedElement.unit}
                    </span>
                  </div>

                  {/* Component Rotation */}
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>زاوية الدوران:</span>
                    <span className="font-mono text-slate-200">{selectedElement.rotation}°</span>
                  </div>
                </div>

                {/* Interactive Controls (Switch, Potentiometer, etc.) */}
                {('isOpen' in selectedElement.properties || selectedElement.type.includes('switch') || selectedElement.type.includes('button')) && (
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-[11px] font-bold text-slate-300 mb-2">حالة المفتاح:</div>
                    <button
                      type="button"
                      onClick={() => onToggleComponent && onToggleComponent(selectedElement.id)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        selectedElement.properties.isOpen
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${selectedElement.properties.isOpen ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                      <span>{selectedElement.properties.isOpen ? 'مفتاح مفتوح (دائرة مقطوعة)' : 'مفتاح مغلق (توصيل نشط)'}</span>
                    </button>
                  </div>
                )}

                {/* Potentiometer wiper position slider */}
                {selectedElement.type === 'potentiometer' && onUpdateElementProperty && (
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1.5">
                      <span>موضع المقسم (Wiper):</span>
                      <span className="font-mono text-sky-400">
                        {Math.round((selectedElement.properties.position ?? 0.5) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selectedElement.properties.position ?? 0.5}
                      onChange={e => onUpdateElementProperty(selectedElement.id, 'position', parseFloat(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>
                )}

                {/* Live Electrical Measurements on Selected Element */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>القياسات الحية للعنصر:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="text-slate-400 text-[10px]">التيار المار:</div>
                      <div className="font-mono font-bold text-emerald-300 mt-0.5">
                        {elementCurrent > 0.001
                          ? `${(elementCurrent * 1000).toFixed(2)} mA`
                          : `${(elementCurrent * 1000000).toFixed(1)} µA`}
                      </div>
                    </div>

                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="text-slate-400 text-[10px]">القدرة المستهلكة:</div>
                      <div className="font-mono font-bold text-amber-300 mt-0.5">
                        {elementPower > 0.001
                          ? `${(elementPower * 1000).toFixed(2)} mW`
                          : `${(elementPower * 1000000).toFixed(1)} µW`}
                      </div>
                    </div>
                  </div>

                  {/* Pin Voltages Table */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] text-slate-400 mb-1.5">جهود أطراف العنصر (Pin Voltages):</div>
                    <div className="space-y-1">
                      {selectedMeta.pins.map(pin => {
                        const pinKey = `${selectedElement.id}:${pin.id}`;
                        const voltage = simResult.pinVoltages?.get(pinKey) ?? 0;
                        return (
                          <div
                            key={pin.id}
                            className="flex items-center justify-between p-1.5 bg-slate-900 rounded-md font-mono text-[10px]"
                          >
                            <span className="text-slate-300">
                              {pin.label || pin.id} ({pin.type})
                            </span>
                            <span
                              className={`font-bold ${
                                voltage > 0 ? 'text-amber-400' : voltage < 0 ? 'text-sky-400' : 'text-slate-500'
                              }`}
                            >
                              {voltage.toFixed(2)} V
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Quick Actions for Selected Element */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onRotateElement(selectedElement.id)}
                    className="flex items-center justify-center gap-1.5 p-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-700/60"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                    <span>تدوير 90°</span>
                  </button>

                  <button
                    onClick={() => onDuplicateElement(selectedElement.id)}
                    className="flex items-center justify-center gap-1.5 p-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-700/60"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تكرار</span>
                  </button>

                  <button
                    onClick={() => onEditElement(selectedElement)}
                    className="flex items-center justify-center gap-1.5 p-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded-xl text-xs font-semibold transition-all border border-amber-500/30"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>تعديل دقيق</span>
                  </button>

                  <button
                    onClick={() => onDeleteElement(selectedElement.id)}
                    className="flex items-center justify-center gap-1.5 p-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 rounded-xl text-xs font-semibold transition-all border border-rose-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            ) : selectedWireId ? (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>السلك الكهربائي المحدد</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  سلك موصل يربط بين نقطتين في الدائرة. يمكنك حذف السلك أو إعادة توصيله.
                </p>
                <button
                  onClick={() => onDeleteWire(selectedWireId)}
                  className="w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف هذا السلك</span>
                </button>
              </div>
            ) : (
              /* No selection: Circuit Overview & Summary */
              <div className="space-y-3">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-sky-400" />
                    <span>نظرة عامة على الدائرة</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px]">العناصر:</span>
                      <div className="font-mono font-bold text-white text-sm mt-0.5">{elements.length}</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px]">الأسلاك:</span>
                      <div className="font-mono font-bold text-white text-sm mt-0.5">{wires.length}</div>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">حالة المحاكاة:</span>
                    <span className={`font-bold ${isSimRunning ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isSimRunning ? '⚡ نشطة وتعمل' : '⏸ متوقفة مؤقتاً'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 text-center leading-relaxed">
                  💡 انقر على أي عنصر أو سلك في مساحة العمل لعرض خصائصه وتعديل قيمه مباشرة.
                </div>
              </div>
            )}

            {/* Quick Simulation Bar inside side panel */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-300">التحكم بالمحاكاة والعرض:</div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={onToggleSim}
                  className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    isSimRunning
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  }`}
                >
                  {isSimRunning ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isSimRunning ? 'إيقاف' : 'تشغيل'}</span>
                </button>

                <button
                  onClick={onResetSim}
                  className="py-1.5 rounded-lg text-xs font-semibold bg-slate-850 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ضبط</span>
                </button>

                <button
                  onClick={onClearCanvas}
                  className="py-1.5 rounded-lg text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>مسح</span>
                </button>
              </div>

              {/* Render Style Switcher */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400 font-medium">مخطط المكونات:</span>
                <div className="flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => onChangeRenderStyle('schematic')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      renderStyle === 'schematic' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="مخطط رمزي قياسي (IEC/IEEE)"
                  >
                    📐 رمزي
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeRenderStyle('realistic')}
                    className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                      renderStyle === 'realistic' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="مخطط فعلي واقعي للمكونات"
                  >
                    🔌 فعلي
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: INSTRUMENTS STATION */}
        {activeTab === 'instruments' && (
          <div className="space-y-3">
            {/* Live Multimeter Station */}
            <div className="p-3 bg-slate-950 rounded-xl border border-teal-500/40 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Gauge className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white">الملتيميتر الرقمي الحي</span>
                </div>
                <button
                  onClick={onOpenFullMultimeter}
                  className="text-[10px] text-teal-400 hover:text-teal-300 font-bold bg-teal-950/60 border border-teal-500/40 px-2 py-0.5 rounded-md"
                >
                  فتح الجهاز العائم
                </button>
              </div>

              {/* LCD Display 7-Segment style readout */}
              <div className="p-3 rounded-lg bg-[#142323] border border-teal-500/30 font-mono text-center shadow-inner">
                <div className="text-[10px] text-teal-400/80 flex justify-between mb-1">
                  <span>{multimeterState.mode}</span>
                  <span>{dmmMeasurement.unit}</span>
                </div>
                <div className="text-2xl font-black text-teal-300 tracking-wider">
                  {dmmMeasurement.value}
                </div>
                <div className="text-[10px] text-teal-400/80 mt-1 truncate">
                  {dmmMeasurement.beep ? '🔊 استمرارية (توصيل مغلق)' : 'قياس مباشر'}
                </div>
              </div>

              {/* Multimeter Mode Selector */}
              <div>
                <div className="text-[10px] text-slate-400 mb-1.5 font-bold">تحديد وضع القياس:</div>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'DCV', label: 'V⎓' },
                    { id: 'ACV', label: 'V~' },
                    { id: 'DCA', label: 'mA⎓' },
                    { id: 'RES', label: 'Ω' },
                    { id: 'DIODE', label: '⯈|' },
                    { id: 'CONT', label: '🔊' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => onUpdateMultimeterMode(m.id as MultimeterState['mode'])}
                      className={`py-1 text-xs font-bold rounded-md font-mono transition-all ${
                        multimeterState.mode === m.id
                          ? 'bg-teal-500 text-slate-950 shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Probes Connection Status */}
              <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 text-[10px] space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-rose-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    المجس الأحمر (+):
                  </span>
                  <span className="text-slate-300 truncate max-w-[120px]">
                    {redPinKey || 'غير متصل'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    المجس الأسود (-):
                  </span>
                  <span className="text-slate-300 truncate max-w-[120px]">
                    {blackPinKey || 'غير متصل'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Floating DMM Launch Banner */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-2">
              <p className="text-[11px] text-slate-300">
                يمكنك تحريك المجسات وسحبها يدوياً على أطراف الدائرة باستخدام نافذة الملتيميتر العائمة.
              </p>
              <button
                onClick={onOpenFullMultimeter}
                className="w-full py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-teal-500/20"
              >
                إظهار جهاز الملتيميتر على الشاشة
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
