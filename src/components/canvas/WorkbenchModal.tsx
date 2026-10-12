/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Physical Workbench Backgrounds Selector Modal
 */

import React from 'react';
import {
  WORKBENCH_BACKGROUNDS,
  WorkbenchBackgroundId,
} from '../../data/workbenchBackgrounds';
import { X, Check, Sliders, Grid, Sparkles, Layers } from 'lucide-react';

interface WorkbenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBackground: WorkbenchBackgroundId;
  onSelectBackground: (id: WorkbenchBackgroundId) => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

export const WorkbenchModal: React.FC<WorkbenchModalProps> = ({
  isOpen,
  onClose,
  selectedBackground,
  onSelectBackground,
  opacity,
  onChangeOpacity,
  showGrid,
  onToggleGrid,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>بيئة طاولة العمل الفيزيائية</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  Physical Workbench
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                اختر مفرش طاولة المختبر الفيزيائي لمحاكاة واقعية وتجربة بصرية غامرة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Workbench Grid Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>طاولات العمل المتاحة</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {WORKBENCH_BACKGROUNDS.map(bg => {
                const isSelected = selectedBackground === bg.id;
                return (
                  <div
                    key={bg.id}
                    onClick={() => onSelectBackground(bg.id)}
                    className={`group relative rounded-xl border p-3 cursor-pointer transition-all duration-200 overflow-hidden ${
                      isSelected
                        ? 'border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Image Preview Thumbnail */}
                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-950 mb-3 border border-slate-800/80">
                      {bg.imageSrc ? (
                        <img
                          src={bg.imageSrc}
                          alt={bg.nameAr}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-500">
                          <Grid className="w-8 h-8 mb-1 text-slate-600" />
                          <span className="text-[11px] font-mono">شبكة رقمية 20px</span>
                        </div>
                      )}

                      {/* Active Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Card Meta */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          className={`text-xs font-bold ${
                            isSelected ? 'text-amber-300' : 'text-slate-200'
                          }`}
                        >
                          {bg.nameAr}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {bg.nameEn}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {bg.descriptionAr}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Immersion & Display Controls */}
          <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-4">
            {/* Opacity Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" />
                  <span>شفافية طاولة العمل (درجة الاندماج البصري)</span>
                </span>
                <span className="font-mono text-sky-400 font-bold">
                  {Math.round(opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={e => onChangeOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>هادئ وخافت (20%)</span>
                <span>متوازن ومريح (60% - 75%)</span>
                <span>واقعي كامل (100%)</span>
              </div>
            </div>

            {/* Toggle Overlay Grid */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    عرض شبكة المحاذاة الهندسية (20px Grid)
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    إظهار نقاط الشبكة الهندسية فوق طاولة العمل لمساعدة الطالب على محاذاة الأسلاك والمكونات
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleGrid}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                  showGrid ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    showGrid ? 'translate-x-0' : '-translate-x-6'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            يتم حفظ إعدادات طاولة العمل تلقائياً في المتصفح.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            تم واغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
