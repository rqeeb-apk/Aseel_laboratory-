/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Workspace Header Toolbar
 */

import React from 'react';
import { ViewMode, SimulationResult, RenderStyle } from '../../types/circuit';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  BookOpen,
  Gauge,
  Calculator,
  User,
  Trash,
  Layers,
  Sparkles,
  Zap,
  Activity,
  GitBranch,
  Eye,
} from 'lucide-react';

interface ToolbarProps {
  isSimRunning: boolean;
  onToggleSim: () => void;
  onResetSim: () => void;
  onClearCanvas: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  renderStyle: RenderStyle;
  onChangeRenderStyle: (style: RenderStyle) => void;
  onOpenLibrary: () => void;
  onOpenExperiments: () => void;
  onOpenMultimeter: () => void;
  onOpenCalculators: () => void;
  onOpenStudent: () => void;
  onOpenWorkbenchModal?: () => void;
  simResult: SimulationResult;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  isSimRunning,
  onToggleSim,
  onResetSim,
  onClearCanvas,
  viewMode,
  onChangeViewMode,
  renderStyle,
  onChangeRenderStyle,
  onOpenLibrary,
  onOpenExperiments,
  onOpenMultimeter,
  onOpenCalculators,
  onOpenStudent,
  onOpenWorkbenchModal,
  simResult,
}) => {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-4 shrink-0 select-none z-20" dir="rtl">
      {/* Brand & Slogan */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-black text-sm">
          YM
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-extrabold text-white tracking-tight">
              مختبر الميكاترونكس اليمني
            </h1>
            <span className="hidden lg:inline text-[10px] text-sky-400/90 font-mono">
              Yemen Mechatronics Lab
            </span>
          </div>
          <p className="text-[10px] text-slate-400 hidden sm:block">
            تعلّم • حاكِ • جرّب • ابتكر
          </p>
        </div>
      </div>

      {/* Center Zone: Simulation Controls & View Modes */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Run / Pause Button */}
        <button
          onClick={onToggleSim}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md min-h-[40px] active:scale-95 ${
            isSimRunning
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
          }`}
          title={isSimRunning ? 'إيقاف المحاكاة مؤقتاً' : 'تشغيل المحاكاة الكهربائية'}
        >
          {isSimRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">محاكاة نشطة</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">تشغيل المحاكاة</span>
            </>
          )}
        </button>

        {/* Reset */}
        <button
          onClick={onResetSim}
          className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-xl transition-colors"
          title="إعادة ضبط المحاكاة"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Schematic vs Realistic View Toggle (Mandatory Requirement) */}
        <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            onClick={() => onChangeRenderStyle('schematic')}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition-all ${
              renderStyle === 'schematic'
                ? 'bg-sky-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="مخطط رمزي قياسي (Schematic Symbols)"
          >
            <span>مخطط رمزي</span>
          </button>
          <button
            onClick={() => onChangeRenderStyle('realistic')}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition-all ${
              renderStyle === 'realistic'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="شكل واقعي حقيقي للمكونات (Realistic Physical View)"
          >
            <span>شكل واقعي</span>
          </button>
        </div>

        {/* View Mode Segmented Selector */}
        <div className="hidden xl:flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            onClick={() => onChangeViewMode('normal')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
              viewMode === 'normal'
                ? 'bg-sky-500 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            عادي
          </button>
          <button
            onClick={() => onChangeViewMode('voltage_levels')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1 ${
              viewMode === 'voltage_levels'
                ? 'bg-sky-500 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="تلوين الأسلاك بمستويات الجهد الكهربائي"
          >
            <Zap className="w-3 h-3 text-amber-300" />
            <span>الجهد</span>
          </button>
          <button
            onClick={() => onChangeViewMode('current_flow')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1 ${
              viewMode === 'current_flow'
                ? 'bg-sky-500 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="حركة جسيمات تدفق التيار في المسارات المغلقة"
          >
            <Activity className="w-3 h-3 text-emerald-300" />
            <span>تدفق التيار</span>
          </button>
          <button
            onClick={() => onChangeViewMode('logic_levels')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1 ${
              viewMode === 'logic_levels'
                ? 'bg-sky-500 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3 h-3 text-purple-300" />
            <span>المنطق</span>
          </button>
        </div>

        {/* Clear Canvas */}
        <button
          onClick={onClearCanvas}
          className="w-9 h-9 hidden sm:flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 rounded-xl transition-colors"
          title="مسح اللوحة"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>

      {/* Right Zone: Primary Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onOpenLibrary}
          className="flex items-center gap-1 px-3 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold transition-all min-h-[40px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>المكونات</span>
        </button>

        <button
          onClick={onOpenExperiments}
          className="hidden sm:flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-bold transition-all min-h-[40px]"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
          <span>التجارب</span>
        </button>

        <button
          onClick={onOpenMultimeter}
          className="hidden md:flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-bold transition-all min-h-[40px]"
        >
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          <span>الملتيميتر</span>
        </button>

        <button
          onClick={onOpenCalculators}
          className="hidden lg:flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-bold transition-all min-h-[40px]"
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          <span>الحاسبات</span>
        </button>

        {onOpenWorkbenchModal && (
          <button
            onClick={onOpenWorkbenchModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-bold transition-all min-h-[40px]"
            title="تغيير مفرش طاولة العمل الفيزيائية"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>طاولة العمل</span>
          </button>
        )}

        <button
          onClick={onOpenStudent}
          className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-200 hover:text-white rounded-xl transition-all"
          title="سجل الطالب وحفظ الدوائر"
        >
          <User className="w-4 h-4 text-emerald-400" />
        </button>
      </div>
    </header>
  );
};
