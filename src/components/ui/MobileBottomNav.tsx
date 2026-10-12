/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Ergonomic Mobile Thumb Navigation Bar
 */

import React from 'react';
import {
  Compass,
  Layers,
  BookOpen,
  Gauge,
  Calculator,
  GraduationCap,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeScreen: 'canvas' | 'library' | 'experiments' | 'multimeter' | 'calculators' | 'student';
  onNavigate: (screen: 'canvas' | 'library' | 'experiments' | 'multimeter' | 'calculators' | 'student') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeScreen,
  onNavigate,
}) => {
  const navItems: {
    id: 'canvas' | 'library' | 'experiments' | 'multimeter' | 'calculators' | 'student';
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'canvas', label: 'المختبر', icon: <Compass className="w-5 h-5" /> },
    { id: 'library', label: 'المكونات', icon: <Layers className="w-5 h-5" /> },
    { id: 'experiments', label: 'التجارب', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'multimeter', label: 'الملتيميتر', icon: <Gauge className="w-5 h-5" /> },
    { id: 'calculators', label: 'الحاسبات', icon: <Calculator className="w-5 h-5" /> },
    { id: 'student', label: 'حسابي', icon: <GraduationCap className="w-5 h-5" /> },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 py-1 flex items-center justify-around select-none"
      dir="rtl"
    >
      {navItems.map(item => {
        const isActive = activeScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-h-[48px] min-w-[48px] ${
              isActive
                ? 'text-sky-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-sky-500/15' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[10px] mt-0.5 leading-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
