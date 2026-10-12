/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Categorized Component Library Drawer
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
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

interface ComponentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComponent: (type: ComponentType) => void;
}

export const ComponentDrawer: React.FC<ComponentDrawerProps> = ({
  isOpen,
  onClose,
  onAddComponent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('power');

  // Category Icon Map
  const getCategoryIcon = (id: ComponentCategory) => {
    switch (id) {
      case 'power':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'passives':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'switches_sensors':
        return <ToggleLeft className="w-4 h-4 text-sky-400" />;
      case 'semiconductors':
        return <Cpu className="w-4 h-4 text-indigo-400" />;
      case 'logic':
        return <GitBranch className="w-4 h-4 text-purple-400" />;
      case 'ics':
        return <Layers className="w-4 h-4 text-fuchsia-400" />;
      case 'outputs':
        return <Disc className="w-4 h-4 text-rose-400" />;
      case 'instruments':
        return <Gauge className="w-4 h-4 text-teal-400" />;
      case 'connectors':
        return <Share2 className="w-4 h-4 text-slate-400" />;
      default:
        return <Zap className="w-4 h-4 text-amber-400" />;
    }
  };

  // Filtered components
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

  if (!isOpen) return null;

  return (
    <aside
      className={`fixed lg:absolute top-0 right-0 bottom-0 z-30 w-full sm:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out`}
      dir="rtl"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">مكتبة المكونات الإلكترونية</h2>
            <p className="text-[11px] text-slate-400">Circuit Wizard Components Library</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="إغلاق المكتبة"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800/80 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مكون (مقاومة، LED، محرك، 555...)"
            className="w-full pr-9 pl-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800/60 overflow-x-auto scrollbar-none shrink-0">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-sky-500 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          الكل ({allComponents.length})
        </button>
        {CATEGORIES_CONFIG.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-sky-500 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {getCategoryIcon(cat.id)}
            <span>{cat.titleAr}</span>
          </button>
        ))}
      </div>

      {/* Component Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredComponents.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            لم يتم العثور على أي مكون يطابق بحثك.
          </div>
        ) : (
          filteredComponents.map(comp => (
            <div
              key={comp.type}
              className="p-3 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-sky-500/40 rounded-xl transition-all duration-150 flex items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-sky-500/30 transition-colors">
                  {getCategoryIcon(comp.category)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-200 truncate">{comp.nameAr}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-sky-400 font-mono">
                      {comp.pins.length} أطراف
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[11px] text-slate-400 truncate font-mono">{comp.nameEn}</p>
                    {comp.defaultUnit && (
                      <span className="text-[10px] text-amber-400/90 font-mono">
                        ({comp.defaultValue} {comp.defaultUnit})
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">{comp.descriptionAr}</p>
                </div>
              </div>

              {/* Add to Canvas Button */}
              <button
                onClick={() => onAddComponent(comp.type)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-sky-600/20 hover:bg-sky-600 border border-sky-500/30 hover:border-sky-500 text-sky-300 hover:text-white rounded-lg text-xs font-semibold transition-all active:scale-95 min-h-[40px]"
                title="إضافة إلى مساحة الرسم"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">إضافة</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Drawer Footer Helper */}
      <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-center shrink-0">
        <p className="text-[11px] text-slate-400">
          انقر على <span className="text-sky-400 font-medium">إضافة</span> لوضع المكون في وسط المختبر، ثم اسحبه بإصبعك.
        </p>
      </div>
    </aside>
  );
};
