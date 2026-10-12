/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Element Property Inspector & Editor
 */

import React, { useState } from 'react';
import { CircuitElement } from '../../types/circuit';
import { COMPONENT_CATALOG } from '../../data/componentsCatalog';
import { Settings, X, Check } from 'lucide-react';

interface EditElementModalProps {
  element: CircuitElement | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedElement: CircuitElement) => void;
}

export const EditElementModal: React.FC<EditElementModalProps> = ({
  element,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !element) return null;

  const meta = COMPONENT_CATALOG[element.type];
  const [label, setLabel] = useState(element.label);
  const [value, setValue] = useState(element.value);
  const [unit, setUnit] = useState(element.unit);
  const [properties, setProperties] = useState<Record<string, any>>({ ...element.properties });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...element,
      label,
      value,
      unit,
      properties,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl shadow-black/80 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">تعديل خصائص المكون</h3>
              <p className="text-xs text-slate-400">{meta?.nameAr || element.type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">اسم المكون (المعرف):</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Value and Unit */}
          {element.unit && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">القيمة العددية:</label>
                <input
                  type="number"
                  step="any"
                  value={value}
                  onChange={e => setValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الوحدة القياسية:</label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Component-specific custom properties */}
          {element.type === 'led' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">لون الدايود الضوئي:</label>
              <div className="grid grid-cols-5 gap-2">
                {(['red', 'green', 'blue', 'yellow', 'white'] as const).map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setProperties(prev => ({ ...prev, color }))}
                    className={`py-2 text-xs font-bold rounded-xl border capitalize ${
                      properties.color === color
                        ? 'bg-slate-800 border-amber-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {element.type === 'potentiometer' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                موضع المنزلق Wiper ({Math.round((properties.position ?? 0.5) * 100)}%):
              </label>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.05"
                value={properties.position ?? 0.5}
                onChange={e => setProperties(prev => ({ ...prev, position: parseFloat(e.target.value) }))}
                className="w-full accent-sky-500"
              />
            </div>
          )}

          {element.type === 'ldr' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                شدة الإضاءة الساقطة ({properties.lightLevel ?? 50} Lux):
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={properties.lightLevel ?? 50}
                onChange={e => setProperties(prev => ({ ...prev, lightLevel: parseInt(e.target.value) }))}
                className="w-full accent-amber-500"
              />
            </div>
          )}

          {element.type === 'thermistor' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                درجة الحرارة ({properties.temperatureC ?? 25} °C):
              </label>
              <input
                type="range"
                min="-20"
                max="120"
                step="5"
                value={properties.temperatureC ?? 25}
                onChange={e => setProperties(prev => ({ ...prev, temperatureC: parseInt(e.target.value) }))}
                className="w-full accent-rose-500"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>تطبيق التغييرات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
