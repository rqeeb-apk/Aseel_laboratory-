/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Categorized Mobile Component Side Drawer
 * مكتبة المكونات الإلكترونية المنظمة بقوائم منسدلة قابلة للطي ومثبتة على يمين الشاشة
 */

import React, { useState, useMemo } from 'react';
import { ComponentType, ComponentCategory, RenderStyle } from '../../types/circuit';
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
  Filter,
  Box,
  PanelRightClose,
} from 'lucide-react';

interface ComponentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComponent: (type: ComponentType) => void;
  renderStyle?: RenderStyle;
  onChangeRenderStyle?: (style: RenderStyle) => void;
}

export const ComponentDrawer: React.FC<ComponentDrawerProps> = ({
  isOpen,
  onClose,
  onAddComponent,
  renderStyle = 'schematic',
  onChangeRenderStyle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');

  // Track accordion state for each category (primary requested categories open by default)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    power: true,
    passives: true,
    semiconductors: true,
    instruments: false,
    switches_sensors: false,
    logic: false,
    ics: false,
    outputs: false,
    connectors: false,
  });

  const toggleCategory = (catId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    CATEGORIES_CONFIG.forEach(c => {
      allOpen[c.id] = true;
    });
    setOpenCategories(allOpen);
  };

  const collapseAll = () => {
    const allClosed: Record<string, boolean> = {};
    CATEGORIES_CONFIG.forEach(c => {
      allClosed[c.id] = false;
    });
    setOpenCategories(allClosed);
  };

  // Category Icon Map
  const getCategoryIcon = (id: ComponentCategory, className = 'w-3.5 h-3.5') => {
    switch (id) {
      case 'power':
        return <Zap className={`${className} text-amber-400`} />;
      case 'passives':
        return <Activity className={`${className} text-emerald-400`} />;
      case 'semiconductors':
        return <Cpu className={`${className} text-indigo-400`} />;
      case 'instruments':
        return <Gauge className={`${className} text-teal-400`} />;
      case 'switches_sensors':
        return <ToggleLeft className={`${className} text-sky-400`} />;
      case 'logic':
        return <GitBranch className={`${className} text-purple-400`} />;
      case 'ics':
        return <Layers className={`${className} text-fuchsia-400`} />;
      case 'outputs':
        return <Disc className={`${className} text-rose-400`} />;
      case 'connectors':
        return <Share2 className={`${className} text-slate-400`} />;
      default:
        return <Box className={`${className} text-amber-400`} />;
    }
  };

  const allComponents = useMemo(() => Object.values(COMPONENT_CATALOG), []);

  const filteredComponents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allComponents.filter(comp => {
      const matchesSearch =
        !q ||
        comp.nameAr.toLowerCase().includes(q) ||
        comp.nameEn.toLowerCase().includes(q) ||
        comp.descriptionAr.toLowerCase().includes(q) ||
        (comp.defaultUnit && `${comp.defaultValue} ${comp.defaultUnit}`.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'all' || comp.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [allComponents, searchQuery, selectedCategory]);

  const groupedCategories = useMemo(() => {
    const groups: {
      category: typeof CATEGORIES_CONFIG[0];
      components: typeof allComponents;
    }[] = [];

    const categoriesToShow =
      selectedCategory === 'all'
        ? CATEGORIES_CONFIG
        : CATEGORIES_CONFIG.filter(c => c.id === selectedCategory);

    categoriesToShow.forEach(cat => {
      const items = filteredComponents.filter(c => c.category === cat.id);
      if (items.length > 0 || (searchQuery === '' && selectedCategory === cat.id)) {
        groups.push({
          category: cat,
          components: items,
        });
      }
    });

    return groups;
  }, [filteredComponents, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <aside
      className="w-[180px] xs:w-[210px] sm:w-[260px] h-full bg-slate-900/98 backdrop-blur-md border-l border-slate-800 flex flex-col select-none shrink-0 z-20 shadow-xl"
      dir="rtl"
    >
      {/* Header: Title + Collapse Button */}
      <div className="p-2 sm:p-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[11px] sm:text-xs font-bold text-white truncate flex items-center gap-1">
              <span>المكونات</span>
              <span className="text-[9px] px-1 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold">
                {filteredComponents.length}
              </span>
            </h2>
          </div>
        </div>

        {/* Quick Collapse Button to maximize canvas when desired */}
        <button
          onClick={onClose}
          className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-[10px] font-semibold transition-colors"
          title="طي لوحة المكونات لتوسيع اللوحة"
        >
          <PanelRightClose className="w-3.5 h-3.5" />
          <span className="hidden xs:inline text-[10px]">طي</span>
        </button>
      </div>

      {/* Diagram Render Style Switcher: مخطط رمزي vs مخطط فعلي */}
      {onChangeRenderStyle && (
        <div className="p-1.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <span className="text-slate-400 font-bold text-[10px] hidden xs:inline">المخطط:</span>
          <div className="flex p-0.5 bg-slate-900 rounded-lg border border-slate-800 shadow-inner w-full xs:w-auto justify-center">
            <button
              type="button"
              onClick={() => onChangeRenderStyle('schematic')}
              className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold transition-all active:scale-95 ${
                renderStyle === 'schematic'
                  ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-300/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="مخطط رمزي قياسي"
            >
              <span>📐</span>
              <span>رمزي</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeRenderStyle('realistic')}
              className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-black transition-all active:scale-95 ${
                renderStyle === 'realistic'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm ring-1 ring-amber-300/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="مخطط فعلي واقعي"
            >
              <span>🔌</span>
              <span>فعلي</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="p-1.5 sm:p-2 border-b border-slate-800/80 shrink-0 bg-slate-900/60">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث عن عنصر..."
            className="w-full pr-7 pl-2 py-1 text-[11px] bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all"
          />
          <Search className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Category Dropdown Selector & Quick Expand/Collapse */}
      <div className="p-1.5 border-b border-slate-800/80 bg-slate-950/40 space-y-1 shrink-0">
        <div className="flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1 text-slate-300 font-bold">
            <Filter className="w-3 h-3 text-sky-400" />
            <span>الفئات:</span>
          </span>
          <div className="flex items-center gap-1.5 text-[9px]">
            <button
              type="button"
              onClick={expandAll}
              className="text-sky-400 hover:text-sky-300 font-bold px-1 py-0.2 rounded hover:bg-sky-500/10"
            >
              توسيع
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-slate-400 hover:text-slate-200 font-medium px-1 py-0.2 rounded hover:bg-slate-800"
            >
              طي
            </button>
          </div>
        </div>

        {/* Dropdown Select to quickly switch category */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-200 font-semibold focus:outline-none focus:border-sky-500 cursor-pointer appearance-none pl-6"
          >
            <option value="all">📁 جميع الفئات ({allComponents.length})</option>
            {CATEGORIES_CONFIG.map(cat => {
              const count = allComponents.filter(c => c.category === cat.id).length;
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.titleAr} ({count})
                </option>
              );
            })}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Collapsible Dropdown Sections & Component Cards */}
      <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1.5 scrollbar-thin">
        {groupedCategories.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-[11px]">
            لا توجد عناصر مطابقة للبحث.
          </div>
        ) : (
          groupedCategories.map(({ category, components }) => {
            const isOpen = searchQuery.trim() !== '' || openCategories[category.id] !== false;

            return (
              <div
                key={category.id}
                className="rounded-xl border border-slate-800/90 bg-slate-950/80 overflow-hidden shadow-xs transition-all"
              >
                {/* Category Dropdown Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-2 py-1.5 bg-slate-950/90 hover:bg-slate-800/70 flex items-center justify-between text-right transition-colors border-b border-transparent data-[open=true]:border-slate-800/70"
                  data-open={isOpen}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {getCategoryIcon(category.id, 'w-3 h-3')}
                    </div>
                    <span className="text-[11px] font-bold text-slate-100 truncate">
                      {category.titleAr}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded-full bg-slate-800 text-sky-400 font-mono font-semibold shrink-0">
                      {components.length}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-sky-400' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Items: Compact touch cards */}
                {isOpen && (
                  <div className="p-1 space-y-1 bg-slate-900/40">
                    {components.map(comp => (
                      <div
                        key={comp.type}
                        onClick={() => onAddComponent(comp.type)}
                        className="p-1.5 bg-slate-950/85 hover:bg-slate-800/90 border border-slate-800/80 hover:border-sky-500/50 rounded-lg transition-all flex items-center justify-between gap-1.5 group cursor-pointer active:scale-[0.98]"
                        title={comp.descriptionAr}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-sky-500/40 text-[11px]">
                            {renderStyle === 'realistic' ? '🔌' : '📐'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-slate-200 group-hover:text-white truncate leading-tight">
                              {comp.nameAr}
                            </div>
                            <div className="text-[9px] text-slate-400 truncate flex items-center gap-1 font-mono">
                              <span className="truncate">{comp.nameEn}</span>
                              {comp.defaultUnit && comp.defaultValue > 0 && (
                                <span className="text-amber-400/90 font-bold shrink-0">
                                  {comp.defaultValue}{comp.defaultUnit}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Add Button */}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onAddComponent(comp.type);
                          }}
                          className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center shrink-0 transition-all shadow-xs"
                          title="إضافة للوحة"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Mini Instructional Footer */}
      <div className="p-1.5 border-t border-slate-800/80 bg-slate-950/70 text-[9px] text-slate-400 text-center shrink-0">
        انقر لإضافة المكون مباشرة للوحة
      </div>
    </aside>
  );
};
