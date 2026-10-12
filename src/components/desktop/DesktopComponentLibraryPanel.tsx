/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Desktop Docked Component Library Side Panel
 * لوحة مكتبة العناصر الجانبية الثابتة لوضع سطح المكتب (محاكاة برامج الحاسوب)
 */

import React, { useState, useMemo } from 'react';
import { ComponentType, ComponentCategory } from '../../types/circuit';
import { COMPONENT_CATALOG, CATEGORIES_CONFIG } from '../../data/componentsCatalog';
import {
  Search,
  Zap,
  Activity,
  ToggleLeft,
  Cpu,
  GitBranch,
  Layers,
  Disc,
  Gauge,
  Share2,
  Plus,
  ChevronRight,
  ChevronLeft,
  Box,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';

interface DesktopComponentLibraryPanelProps {
  onAddComponent: (type: ComponentType) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const DesktopComponentLibraryPanel: React.FC<DesktopComponentLibraryPanelProps> = ({
  onAddComponent,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');

  // Category Icon Map
  const getCategoryIcon = (id: ComponentCategory) => {
    switch (id) {
      case 'power':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'passives':
        return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
      case 'switches_sensors':
        return <ToggleLeft className="w-3.5 h-3.5 text-sky-400" />;
      case 'semiconductors':
        return <Cpu className="w-3.5 h-3.5 text-indigo-400" />;
      case 'logic':
        return <GitBranch className="w-3.5 h-3.5 text-purple-400" />;
      case 'ics':
        return <Layers className="w-3.5 h-3.5 text-fuchsia-400" />;
      case 'outputs':
        return <Disc className="w-3.5 h-3.5 text-rose-400" />;
      case 'instruments':
        return <Gauge className="w-3.5 h-3.5 text-teal-400" />;
      case 'connectors':
        return <Share2 className="w-3.5 h-3.5 text-slate-400" />;
      default:
        return <Box className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const allComponents = useMemo(() => Object.values(COMPONENT_CATALOG), []);

  const filteredComponents = useMemo(() => {
    return allComponents.filter(comp => {
      const matchesSearch =
        comp.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || comp.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [allComponents, searchQuery, selectedCategory]);

  if (isCollapsed) {
    return (
      <aside
        className="w-12 h-full bg-slate-900 border-l border-slate-800 flex flex-col items-center py-3 select-none shrink-0 transition-all z-20"
        dir="rtl"
      >
        <button
          onClick={onToggleCollapse}
          title="توسيع مكتبة العناصر"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 mb-4 transition-all"
        >
          <PanelRightOpen className="w-5 h-5" />
        </button>
        <span
          className="text-xs font-bold text-slate-400 tracking-wider [writing-mode:vertical-rl] rotate-180"
          style={{ letterSpacing: '2px' }}
        >
          مكتبة العناصر
        </span>
      </aside>
    );
  }

  return (
    <aside
      className="w-72 lg:w-80 h-full bg-slate-900/95 border-l border-slate-800 flex flex-col select-none shrink-0 transition-all z-20 backdrop-blur-sm shadow-xl"
      dir="rtl"
    >
      {/* Panel Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>مكتبة العناصر</span>
              <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded-full">
                {filteredComponents.length}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">انقر لإضافة العنصر لمساحة العمل</p>
          </div>
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title="طي لوحة المكتبة"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="p-2.5 border-b border-slate-800/80">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث عن عنصر (مقاومة، دايود...)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="p-2 border-b border-slate-800/60 overflow-x-auto flex gap-1.5 scrollbar-thin">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2 py-1 text-[11px] rounded-lg font-bold shrink-0 transition-all ${
            selectedCategory === 'all'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200'
          }`}
        >
          الكل ({allComponents.length})
        </button>
        {CATEGORIES_CONFIG.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg font-bold shrink-0 transition-all ${
              selectedCategory === cat.id
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
            title={cat.titleEn}
          >
            {getCategoryIcon(cat.id)}
            <span>{cat.titleAr.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin">
        {filteredComponents.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            لا توجد عناصر مطابقة للبحث
          </div>
        ) : (
          filteredComponents.map(comp => (
            <div
              key={comp.type}
              onClick={() => onAddComponent(comp.type)}
              className="group p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800/80 hover:border-sky-500/50 cursor-pointer transition-all shadow-sm flex items-center justify-between active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-sky-500/40 group-hover:bg-sky-950/30 transition-all">
                  {getCategoryIcon(comp.category)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                    {comp.nameAr}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 font-mono">
                    <span>{comp.nameEn}</span>
                    {comp.defaultValue > 0 && (
                      <span className="text-sky-400/90 font-bold">
                        • {comp.defaultValue} {comp.defaultUnit}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center shrink-0 transition-all shadow-sm"
                title="إضافة"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-950/40 text-[10px] text-slate-400 text-center">
        💡 انقر على أي مكون لتثبيته في منتصف طاولة الدائرة
      </div>
    </aside>
  );
};
