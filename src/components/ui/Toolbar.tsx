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
  Menu,
  X,
  Sliders,
  FileText,
  MonitorSmartphone,
  Smartphone,
  Monitor,
} from 'lucide-react';

import { StudentUser, OwnerUser } from '../../types/auth';
import { Shield, LogOut } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { ProjectLogo } from './ProjectLogo';
import { DisplayMode } from '../../types/displayMode';
import { DisplayModeSwitcher } from './DisplayModeSwitcher';

interface ToolbarProps {
  isSimRunning: boolean;
  onToggleSim: () => void;
  onResetSim: () => void;
  onClearCanvas: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  renderStyle: RenderStyle;
  onChangeRenderStyle: (style: RenderStyle) => void;
  displayMode: DisplayMode;
  onChangeDisplayMode: (mode: DisplayMode) => void;
  onOpenLibrary: () => void;
  onOpenExperiments: () => void;
  onOpenMultimeter: () => void;
  onOpenCalculators: () => void;
  onOpenStudent: () => void;
  onOpenLabReport?: () => void;
  onOpenWorkbenchModal?: () => void;
  currentUser?: StudentUser | null;
  currentOwner?: OwnerUser | null;
  onOpenOwnerDashboard?: () => void;
  onLogout?: () => void;
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
  displayMode,
  onChangeDisplayMode,
  onOpenLibrary,
  onOpenExperiments,
  onOpenMultimeter,
  onOpenCalculators,
  onOpenStudent,
  onOpenLabReport,
  onOpenWorkbenchModal,
  currentUser,
  currentOwner,
  onOpenOwnerDashboard,
  onLogout,
  simResult,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="h-14 sm:h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-2 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-4 shrink-0 select-none z-20" dir="rtl">
      {/* Brand & Emblem Logo - Responsive on Mobile, iPad, and Laptop */}
      <div className="shrink-0 flex items-center">
        <div className="hidden sm:block">
          <ProjectLogo variant="compact" size="sm" />
        </div>
        <div className="flex sm:hidden items-center gap-1.5">
          <ProjectLogo variant="emblem" size="xs" />
          <span className="text-xs font-black text-white truncate max-w-[125px]">
            الميكاترونكس
          </span>
        </div>
      </div>

      {/* Center Zone: Simulation Controls & View Modes */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Run / Pause Button */}
        <button
          onClick={onToggleSim}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-md min-h-[36px] sm:min-h-[40px] active:scale-95 ${
            isSimRunning
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
          }`}
          title={isSimRunning ? 'إيقاف المحاكاة مؤقتاً' : 'تشغيل المحاكاة الكهربائية'}
        >
          {isSimRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span className="hidden md:inline">محاكاة نشطة</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden md:inline">تشغيل المحاكاة</span>
            </>
          )}
        </button>

        {/* Reset */}
        <button
          onClick={onResetSim}
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-xl transition-colors shrink-0"
          title="إعادة ضبط المحاكاة"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Schematic vs Realistic View Toggle (Mandatory Requirement) */}
        <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
          <button
            onClick={() => onChangeRenderStyle('schematic')}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs rounded-lg transition-all ${
              renderStyle === 'schematic'
                ? 'bg-sky-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="مخطط رمزي قياسي (Schematic Symbols)"
          >
            <span className="sm:hidden">مخطط</span>
            <span className="hidden sm:inline">مخطط رمزي</span>
          </button>
          <button
            onClick={() => onChangeRenderStyle('realistic')}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs rounded-lg transition-all ${
              renderStyle === 'realistic'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="شكل واقعي حقيقي للمكونات (Realistic Physical View)"
          >
            <span className="sm:hidden">واقعي</span>
            <span className="hidden sm:inline">شكل واقعي</span>
          </button>
        </div>

        {/* View Mode Segmented Selector */}
        <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
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
          className="hidden md:flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-bold transition-all min-h-[40px]"
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          <span>الحاسبات</span>
        </button>

        {/* Display Mode Switcher (Required Feature) */}
        <DisplayModeSwitcher
          currentMode={displayMode}
          onSelectMode={onChangeDisplayMode}
        />

        {/* PDF Lab Report Export Button */}
        {onOpenLabReport && (
          <button
            onClick={onOpenLabReport}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 rounded-xl text-xs font-bold transition-all min-h-[40px] shadow-sm hover:border-emerald-400/50"
            title="تصدير تقرير المختبر كملف PDF منظم يحتوي على المخطط والقياسات"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>تقرير PDF</span>
          </button>
        )}

        {/* In-App PWA Install Button */}
        <div className="hidden sm:block">
          <PWAInstallButton compact />
        </div>

        {/* Mobile More Options Button */}
        <button
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          className="md:hidden w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-200 hover:text-white rounded-xl transition-all"
          title="المزيد من الأدوات والخيارات"
        >
          <Menu className="w-4 h-4 text-sky-400" />
        </button>

        {/* Owner Dashboard Trigger */}
        {currentOwner && onOpenOwnerDashboard && (
          <button
            onClick={onOpenOwnerDashboard}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-bold transition-all min-h-[40px]"
            title="فتح لوحة تحكم المالك وإدارة الاشتراكات"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>لوحة المالك</span>
          </button>
        )}

        {/* Student Name & Active Subscription Badge */}
        {currentUser && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
            <span className="text-white font-semibold max-w-[120px] truncate">{currentUser.fullName}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              اشتراك فعال
            </span>
          </div>
        )}

        <button
          onClick={onOpenStudent}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-200 hover:text-white rounded-xl transition-all"
          title="سجل الطالب وحفظ الدوائر"
        >
          <User className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="hidden sm:flex w-10 h-10 items-center justify-center bg-slate-900 hover:bg-red-950/50 border border-slate-800 hover:border-red-800/60 text-slate-400 hover:text-red-400 rounded-xl transition-all"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile More Tools Dropdown / Sheet */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle & Header */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-2" />
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <ProjectLogo variant="compact" size="xs" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PWA Install Button on Mobile */}
            <div className="pt-1">
              <PWAInstallButton />
            </div>

            {/* Display Mode Selection in Mobile Drawer */}
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <MonitorSmartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>وضع العرض:</span>
                </span>
                <span className="text-[10px] text-slate-500">حفظ تلقائي</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onChangeDisplayMode('auto');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-2 px-1.5 rounded-lg text-[11px] font-bold text-center flex flex-col items-center gap-1 transition-all ${
                    displayMode === 'auto'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تلقائي ⚡</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChangeDisplayMode('mobile');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-2 px-1.5 rounded-lg text-[11px] font-bold text-center flex flex-col items-center gap-1 transition-all ${
                    displayMode === 'mobile'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>جوال 📱</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChangeDisplayMode('desktop');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-2 px-1.5 rounded-lg text-[11px] font-bold text-center flex flex-col items-center gap-1 transition-all ${
                    displayMode === 'desktop'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>كمبيوتر 🖥️</span>
                </button>
              </div>
            </div>

            {/* View Mode Selectors on Mobile */}
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">نمط عرض المحاكاة:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => { onChangeViewMode('normal'); setIsMobileMenuOpen(false); }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium text-center ${viewMode === 'normal' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-900 text-slate-300'}`}
                >
                  عادي
                </button>
                <button
                  onClick={() => { onChangeViewMode('voltage_levels'); setIsMobileMenuOpen(false); }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium text-center ${viewMode === 'voltage_levels' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-900 text-slate-300'}`}
                >
                  مستويات الجهد
                </button>
                <button
                  onClick={() => { onChangeViewMode('current_flow'); setIsMobileMenuOpen(false); }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium text-center ${viewMode === 'current_flow' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-900 text-slate-300'}`}
                >
                  تدفق التيار ⚡
                </button>
                <button
                  onClick={() => { onChangeViewMode('logic_levels'); setIsMobileMenuOpen(false); }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium text-center ${viewMode === 'logic_levels' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-900 text-slate-300'}`}
                >
                  المنطق الرقمي
                </button>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => { onOpenExperiments(); setIsMobileMenuOpen(false); }}
                className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2 text-slate-200 hover:text-white"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>دليل التجارب</span>
              </button>

              <button
                onClick={() => { onOpenMultimeter(); setIsMobileMenuOpen(false); }}
                className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2 text-slate-200 hover:text-white"
              >
                <Gauge className="w-4 h-4 text-amber-400" />
                <span>الملتيميتر الرقمي</span>
              </button>

              <button
                onClick={() => { onOpenCalculators(); setIsMobileMenuOpen(false); }}
                className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2 text-slate-200 hover:text-white"
              >
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>الحاسبات الهندسية</span>
              </button>

              {onOpenLabReport && (
                <button
                  onClick={() => { onOpenLabReport(); setIsMobileMenuOpen(false); }}
                  className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2 text-emerald-300 font-bold"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>تقرير المختبر (PDF)</span>
                </button>
              )}

              {onOpenWorkbenchModal && (
                <button
                  onClick={() => { onOpenWorkbenchModal(); setIsMobileMenuOpen(false); }}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2 text-slate-200 hover:text-white"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>طاولة العمل</span>
                </button>
              )}

              <button
                onClick={() => { onClearCanvas(); setIsMobileMenuOpen(false); }}
                className="p-2.5 bg-rose-950/40 border border-rose-900/60 rounded-xl flex items-center gap-2 text-rose-300"
              >
                <Trash className="w-4 h-4 text-rose-400" />
                <span>مسح اللوحة</span>
              </button>

              {currentOwner && onOpenOwnerDashboard && (
                <button
                  onClick={() => { onOpenOwnerDashboard(); setIsMobileMenuOpen(false); }}
                  className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center gap-2 text-amber-300 font-bold"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>لوحة تحكم المالك</span>
                </button>
              )}
            </div>

            {/* Logout on Mobile */}
            {onLogout && (
              <button
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج من الحساب</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
