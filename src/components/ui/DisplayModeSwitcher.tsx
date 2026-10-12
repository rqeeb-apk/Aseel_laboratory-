/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Display Mode Switcher Component
 * زر ومحدد أوضاع العرض (الجوال 📱 / سطح المكتب 🖥️ / التلقائي ⚡)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, Monitor, Sparkles, Check, ChevronDown, MonitorSmartphone } from 'lucide-react';
import { DisplayMode } from '../../types/displayMode';

interface DisplayModeSwitcherProps {
  currentMode: DisplayMode;
  onSelectMode: (mode: DisplayMode) => void;
  compact?: boolean;
}

export const DisplayModeSwitcher: React.FC<DisplayModeSwitcherProps> = ({
  currentMode,
  onSelectMode,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const modesList: {
    id: DisplayMode;
    title: string;
    badge: string;
    subtitle: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'auto',
      title: 'الوضع التلقائي',
      badge: 'ذكي',
      subtitle: 'يتكيّف تلقائياً حسب حجم الشاشة',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'mobile',
      title: 'وضع الجوال 📱',
      badge: 'لمس',
      subtitle: 'أزرار لمس كبيرة وقائمة سفلية للهواتف',
      icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'desktop',
      title: 'وضع سطح المكتب 🖥️',
      badge: 'عريض',
      subtitle: 'مكتبة جانبية + مساحة وسطية + لوحة خصائص وقياسات',
      icon: <Monitor className="w-4 h-4 text-amber-400" />,
    },
  ];

  const currentConfig = modesList.find(m => m.id === currentMode) || modesList[0];

  return (
    <div className="relative inline-block" ref={containerRef} dir="rtl">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all active:scale-95 shadow-sm ${
          currentMode === 'desktop'
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
            : currentMode === 'mobile'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
            : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25'
        }`}
        title="تغيير وضع عرض المختبر (جوال / سطح مكتب / تلقائي)"
      >
        <MonitorSmartphone className="w-4 h-4 shrink-0" />
        <span className="text-xs font-bold whitespace-nowrap hidden sm:inline">وضع العرض:</span>
        <span className="text-xs font-bold text-white whitespace-nowrap">
          {currentMode === 'mobile' && 'جوال 📱'}
          {currentMode === 'desktop' && 'كمبيوتر 🖥️'}
          {currentMode === 'auto' && 'تلقائي ⚡'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-800 mb-1 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <MonitorSmartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>اختيار وضع عرض المختبر</span>
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              حفظ فوري
            </span>
          </div>

          <div className="space-y-1">
            {modesList.map(item => {
              const isSelected = item.id === currentMode;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectMode(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-right transition-all ${
                    isSelected
                      ? 'bg-slate-800 border border-cyan-500/40 shadow-sm text-white'
                      : 'hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        {item.title}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 p-2 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 text-center">
            💡 يتم حفظ اختيارك تلقائياً ويبقى ثابتاً في زياراتك القادمة
          </div>
        </div>
      )}
    </div>
  );
};
