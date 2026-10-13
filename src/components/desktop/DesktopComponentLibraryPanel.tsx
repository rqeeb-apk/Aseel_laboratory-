/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Desktop Docked Component Library Side Panel
 * لوحة مكتبة العناصر الجانبية المرتبة بقوائم منسدلة وفئات ميكاترونكس منظمة
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
  Box,
  PanelRightClose,
  PanelRightOpen,
  Filter,
} from 'lucide-react';

interface DesktopComponentLibraryPanelProps {
  onAddComponent: (type: ComponentType) => void;
  renderStyle?: RenderStyle;
  onChangeRenderStyle?: (style: RenderStyle) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const DesktopComponentLibraryPanel: React.FC<DesktopComponentLibraryPanelProps> = ({
  onAddComponent,
  renderStyle = 'schematic',
  onChangeRenderStyle,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');
  
  // Track open/collapsed categories in accordion dropdowns
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    power: true,
    passives: true,
    switches_sensors: false,
    semiconductors: false,
    logic: false,
    ics: false,
    outputs: false,
    instruments: false,
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
      case 'switches_sensors':
        return <ToggleLeft className={`${className} text-sky-400`} />;
      case 'semiconductors':
        return <Cpu className={`${className} text-indigo-400`} />;
      case 'logic':
        return <GitBranch className={`${className} text-purple-400`} />;
      case 'ics':
        return <Layers className={`${className} text-fuchsia-400`} />;
      case 'outputs':
        return <Disc className={`${className} text-rose-400`} />;
      case 'instruments':
        return <Gauge className={`${className} text-teal-400`} />;
      case 'connectors':
        return <Share2 className={`${className} text-slate-400`} />;
      default:
        return <Box className={`${className} text-cyan-400`} />;
    }
  };

  const allComponents = useMemo(() => Object.values(COMPONENT_CATALOG), []);

  // Filtered components list
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

  // Group filtered components by category
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
      className="w-80 lg:w-88 h-full bg-slate-900/95 border-l border-slate-800 flex flex-col select-none shrink-0 transition-all z-20 backdrop-blur-sm shadow-xl"
      dir="rtl"
    >
      {/* Panel Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-inner">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>مكتبة العناصر المنظمة</span>
              <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded-full font-bold">
                {filteredComponents.length}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">Circuit Wizard Components</p>
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

      {/* Diagram Render Style Switcher: مخطط رمزي (Schematic) vs مخطط فعلي (Physical) */}
      {onChangeRenderStyle && (
        <div className="px-3 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-bold text-[11px] flex items-center gap-1.5">
            <span>مخطط المكونات:</span>
          </span>
          <div className="flex p-0.5 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => onChangeRenderStyle('schematic')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all active:scale-95 ${
                renderStyle === 'schematic'
                  ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-300/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="تفعيل المخطط الرمزي القياسي (IEC/IEEE)"
            >
              <span>📐</span>
              <span>مخطط رمزي</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeRenderStyle('realistic')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black transition-all active:scale-95 ${
                renderStyle === 'realistic'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm ring-1 ring-amber-300/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="تفعيل المخطط الفعلي الواقعي للمكونات"
            >
              <span>🔌</span>
              <span>مخطط فعلي</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="p-2.5 border-b border-slate-800/80 bg-slate-900/60">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث سريع عن عنصر (مقاومة، ترانزستور، محرك...)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Dropdown Category Selector & Accordion Actions */}
      <div className="p-2.5 border-b border-slate-800/80 bg-slate-950/40 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-300 font-bold">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>قائمة الفئات المنسدلة:</span>
          </span>
          <div className="flex items-center gap-2 text-[10px]">
            <button
              type="button"
              onClick={expandAll}
              className="text-sky-400 hover:text-sky-300 font-bold px-1 py-0.5 rounded hover:bg-sky-500/10 transition-colors"
            >
              توسيع الكل
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-slate-400 hover:text-slate-200 font-medium px-1 py-0.5 rounded hover:bg-slate-800 transition-colors"
            >
              طي الكل
            </button>
          </div>
        </div>

        {/* Dropdown Select for Instant Category Filtering */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 cursor-pointer appearance-none transition-all pl-8"
          >
            <option value="all">📁 جميع الفئات والقوائم ({allComponents.length} عنصر)</option>
            {CATEGORIES_CONFIG.map(cat => {
              const count = allComponents.filter(c => c.category === cat.id).length;
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.titleAr} ({count} عنصر)
                </option>
              );
            })}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Accordion Dropdown Sections with Components */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin">
        {groupedCategories.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            لا توجد عناصر مطابقة لنتيجة البحث.
          </div>
        ) : (
          groupedCategories.map(({ category, components }) => {
            const isOpen = searchQuery.trim() !== '' || openCategories[category.id] !== false;

            return (
              <div
                key={category.id}
                className="rounded-2xl border border-slate-800/90 bg-slate-950/70 overflow-hidden shadow-sm transition-all"
              >
                {/* Collapsible Dropdown Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-3 py-2.5 bg-slate-950/90 hover:bg-slate-800/60 flex items-center justify-between text-right transition-colors border-b border-transparent data-[open=true]:border-slate-800/70"
                  data-open={isOpen}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {getCategoryIcon(category.id, 'w-3.5 h-3.5')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-100 truncate">
                          {category.titleAr}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/90 text-sky-400 font-mono font-semibold">
                          {components.length}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono truncate block">
                        {category.titleEn}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-sky-400' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown Body: Neatly Ordered Component List */}
                {isOpen && (
                  <div className="p-2 space-y-1.5 bg-slate-900/30">
                    {components.map(comp => (
                      <div
                        key={comp.type}
                        onClick={() => onAddComponent(comp.type)}
                        className="group p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-sky-500/50 cursor-pointer transition-all shadow-sm flex items-center justify-between gap-2 active:scale-[0.98]"
                        title={comp.descriptionAr}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-sky-500/40 group-hover:bg-sky-950/30 transition-all text-xs">
                            {renderStyle === 'realistic' ? '🔌' : '📐'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                                {comp.nameAr}
                              </span>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800/80 text-slate-400 font-mono shrink-0">
                                {comp.pins.length}P
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 font-mono">
                              <span className="truncate">{comp.nameEn}</span>
                              {comp.defaultValue > 0 && comp.defaultUnit && (
                                <span className="text-amber-400/90 font-bold shrink-0">
                                  • {comp.defaultValue} {comp.defaultUnit}
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
                          className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center shrink-0 transition-all shadow-sm"
                          title="إضافة إلى مساحة العمل"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
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

      {/* Clean Footer Instruction */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-950/60 text-[10px] text-slate-400 text-center font-medium">
        انقر على أي عنصر لإضافته مباشرة إلى مساحة المحاكاة
      </div>
    </aside>
  );
};
