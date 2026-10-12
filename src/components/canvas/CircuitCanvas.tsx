/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Touch-Optimized Interactive Circuit Canvas
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  CircuitElement,
  WireConnection,
  ViewMode,
  SimulationResult,
  ComponentType,
  RenderStyle,
} from '../../types/circuit';
import { ComponentSymbol } from './ComponentSymbol';
import { WireLayer } from './WireLayer';
import { COMPONENT_CATALOG, getPinWorldPosition } from '../../data/componentsCatalog';
import {
  WORKBENCH_BACKGROUNDS,
  WorkbenchBackgroundId,
} from '../../data/workbenchBackgrounds';
import {
  RotateCw,
  Trash2,
  Settings,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
} from 'lucide-react';

interface CircuitCanvasProps {
  elements: CircuitElement[];
  wires: WireConnection[];
  selectedElementId: string | null;
  selectedWireId: string | null;
  viewMode: ViewMode;
  renderStyle: RenderStyle;
  simResult: SimulationResult;
  workbenchBg?: WorkbenchBackgroundId;
  workbenchOpacity?: number;
  showGrid?: boolean;
  onOpenWorkbenchSettings?: () => void;
  onSelectElement: (id: string | null) => void;
  onSelectWire: (id: string | null) => void;
  onUpdateElementPosition: (id: string, x: number, y: number) => void;
  onRotateElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onDeleteWire: (id: string) => void;
  onAddWire: (fromComp: string, fromPin: string, toComp: string, toPin: string) => void;
  onToggleComponent: (id: string) => void;
  onEditElement: (element: CircuitElement) => void;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  elements,
  wires,
  selectedElementId,
  selectedWireId,
  viewMode,
  renderStyle,
  simResult,
  workbenchBg = 'esd_green',
  workbenchOpacity = 0.7,
  showGrid = true,
  onOpenWorkbenchSettings,
  onSelectElement,
  onSelectWire,
  onUpdateElementPosition,
  onRotateElement,
  onDeleteElement,
  onDuplicateElement,
  onDeleteWire,
  onAddWire,
  onToggleComponent,
  onEditElement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Canvas pan & zoom state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 60, y: 60 });
  const [zoom, setZoom] = useState<number>(1.0);

  // Interaction modes
  const [activePin, setActivePin] = useState<{ compId: string; pinId: string } | null>(null);
  const [drawingWirePos, setDrawingWirePos] = useState<{ x: number; y: number } | null>(null);

  // Dragging state for elements or canvas pan
  const dragRef = useRef<{
    isDragging: boolean;
    dragType: 'canvas' | 'element' | 'pinch';
    elementId?: string;
    startX: number;
    startY: number;
    elementStartX: number;
    elementStartY: number;
    initialDistance?: number;
  }>({
    isDragging: false,
    dragType: 'canvas',
    startX: 0,
    startY: 0,
    elementStartX: 0,
    elementStartY: 0,
  });

  // Transform screen to SVG world coordinate
  const screenToWorld = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = (clientX - rect.left - pan.x) / zoom;
      const rawY = (clientY - rect.top - pan.y) / zoom;
      return { x: rawX, y: rawY };
    },
    [pan, zoom]
  );

  // Snap to 20px grid
  const snapToGrid = (val: number): number => Math.round(val / 20) * 20;

  // Handle Pin click or tap (Tap Pin A -> Tap Pin B to connect wire)
  const handlePinClick = (compId: string, pinId: string) => {
    if (!activePin) {
      // Start drawing wire
      setActivePin({ compId, pinId });
      const el = elements.find(e => e.id === compId);
      if (el) {
        const meta = COMPONENT_CATALOG[el.type];
        const pin = meta?.pins.find(p => p.id === pinId);
        if (pin) {
          const worldPos = getPinWorldPosition(el.x, el.y, pin, el.rotation);
          setDrawingWirePos(worldPos);
        }
      }
    } else {
      // Complete connection
      if (activePin.compId !== compId || activePin.pinId !== pinId) {
        onAddWire(activePin.compId, activePin.pinId, compId, pinId);
      }
      setActivePin(null);
      setDrawingWirePos(null);
    }
  };

  // Canvas pointer down (Start pan or start element drag)
  const handlePointerDown = (e: React.PointerEvent) => {
    // If clicked on empty space, deselect
    if (e.target === svgRef.current || (e.target as Element).tagName === 'rect') {
      onSelectElement(null);
      onSelectWire(null);
      if (activePin) {
        setActivePin(null);
        setDrawingWirePos(null);
      }
    }

    dragRef.current = {
      isDragging: true,
      dragType: 'canvas',
      startX: e.clientX,
      startY: e.clientY,
      elementStartX: pan.x,
      elementStartY: pan.y,
    };
  };

  // Element pointer down
  const handleElementPointerDown = (elementId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    onSelectElement(elementId);
    onSelectWire(null);

    const el = elements.find(item => item.id === elementId);
    if (!el) return;

    dragRef.current = {
      isDragging: true,
      dragType: 'element',
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      elementStartX: el.x,
      elementStartY: el.y,
    };
  };

  // Global pointer move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (activePin) {
      const world = screenToWorld(e.clientX, e.clientY);
      setDrawingWirePos({ x: snapToGrid(world.x), y: snapToGrid(world.y) });
    }

    if (!dragRef.current.isDragging) return;

    const dx = (e.clientX - dragRef.current.startX) / zoom;
    const dy = (e.clientY - dragRef.current.startY) / zoom;

    if (dragRef.current.dragType === 'element' && dragRef.current.elementId) {
      const newX = snapToGrid(dragRef.current.elementStartX + dx);
      const newY = snapToGrid(dragRef.current.elementStartY + dy);
      onUpdateElementPosition(dragRef.current.elementId, newX, newY);
    } else if (dragRef.current.dragType === 'canvas') {
      setPan({
        x: dragRef.current.elementStartX + (e.clientX - dragRef.current.startX),
        y: dragRef.current.elementStartY + (e.clientY - dragRef.current.startY),
      });
    }
  };

  // Global pointer up
  const handlePointerUp = () => {
    dragRef.current.isDragging = false;
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(2.5, prev + 0.15));
  const handleZoomOut = () => setZoom(prev => Math.max(0.4, prev - 0.15));
  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 60, y: 60 });
  };

  const selectedElement = elements.find(e => e.id === selectedElementId);

  const activeBgOption = WORKBENCH_BACKGROUNDS.find(b => b.id === workbenchBg);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950 overflow-hidden select-none touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* SVG Canvas Area */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-crosshair"
        onPointerDown={handlePointerDown}
      >
        <defs>
          {/* Engineering Dot Grid Pattern */}
          <pattern id="grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.2" fill="#334155" opacity="0.6" />
          </pattern>
          {/* Larger 100px major grid line pattern */}
          <pattern id="grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#grid-dots)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.5" />
          </pattern>
        </defs>

        {/* Scaled & Panned Group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Base Background Solid Fill covering world space */}
          <rect
            x={-4000}
            y={-4000}
            width={8000}
            height={8000}
            fill="#090d16"
            className="pointer-events-auto"
          />

          {/* Physical Workbench Mat Image when active */}
          {activeBgOption?.imageSrc && (
            <g className="pointer-events-none select-none">
              <image
                href={activeBgOption.imageSrc}
                x={-2400}
                y={-1400}
                width={4800}
                height={2800}
                preserveAspectRatio="xMidYMid slice"
                opacity={workbenchOpacity}
              />
              {/* Subtle edge vignette boundary */}
              <rect
                x={-2400}
                y={-1400}
                width={4800}
                height={2800}
                fill="none"
                stroke="#020617"
                strokeWidth="20"
                opacity="0.75"
              />
            </g>
          )}

          {/* Background Grid Rect covering infinite space */}
          {showGrid && (
            <rect
              x={-4000}
              y={-4000}
              width={8000}
              height={8000}
              fill="url(#grid-major)"
              className="pointer-events-auto"
              opacity={activeBgOption?.imageSrc ? 0.35 : 1}
            />
          )}

          {/* Coordinate Origin Cross */}
          <g opacity="0.3">
            <line x1="-30" y1="0" x2="30" y2="0" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="0" y1="-30" x2="0" y2="30" stroke="#0284c7" strokeWidth="1.5" />
          </g>

          {/* Wire Connections Layer */}
          <WireLayer
            wires={wires}
            elements={elements}
            selectedWireId={selectedWireId}
            viewMode={viewMode}
            simResult={simResult}
            drawingWire={
              activePin && drawingWirePos
                ? {
                    fromComponentId: activePin.compId,
                    fromPinId: activePin.pinId,
                    currentX: drawingWirePos.x,
                    currentY: drawingWirePos.y,
                  }
                : null
            }
            onSelectWire={id => {
              onSelectWire(id);
              onSelectElement(null);
            }}
            onDeleteWire={onDeleteWire}
          />

          {/* Components Layer */}
          {elements.map(el => (
            <g
              key={el.id}
              onPointerDown={e => handleElementPointerDown(el.id, e)}
            >
              <ComponentSymbol
                element={el}
                isSelected={el.id === selectedElementId}
                activePinId={
                  activePin && activePin.compId === el.id ? `${activePin.compId}:${activePin.pinId}` : null
                }
                simResult={simResult}
                renderStyle={renderStyle}
                onPinClick={handlePinClick}
                onToggleComponent={onToggleComponent}
              />
            </g>
          ))}
        </g>
      </svg>

      {/* Floating Quick Action Bar when a Component is Selected */}
      {selectedElement && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl shadow-black/40">
          <button
            onClick={() => onRotateElement(selectedElement.id)}
            title="تدوير 90 درجة"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors min-h-[38px] active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5 text-sky-400" />
            <span>تدوير</span>
          </button>

          <button
            onClick={() => onEditElement(selectedElement)}
            title="تعديل القيمة والخصائص"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors min-h-[38px] active:scale-95"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>تعديل</span>
          </button>

          <button
            onClick={() => onDuplicateElement(selectedElement.id)}
            title="تكرار العنصر"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors min-h-[38px] active:scale-95"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span>تكرار</span>
          </button>

          <button
            onClick={() => onDeleteElement(selectedElement.id)}
            title="حذف العنصر"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/40 rounded-lg transition-colors min-h-[38px] active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>حذف</span>
          </button>
        </div>
      )}

      {/* Floating Wire Action Bar when a Wire is Selected */}
      {selectedWireId && !selectedElement && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl">
          <span className="text-xs text-slate-300">سلك محدد</span>
          <button
            onClick={() => onDeleteWire(selectedWireId)}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 rounded-lg transition-colors min-h-[36px]"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>حذف السلك</span>
          </button>
        </div>
      )}

      {/* Wiring In Progress Notification */}
      {activePin && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 bg-sky-950/90 border border-sky-500/50 rounded-xl shadow-lg backdrop-blur-sm animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <span className="text-xs font-medium text-sky-200">
            انقر على طرف المكون الثاني لإتمام التوصيل بالسلك
          </span>
          <button
            onClick={() => {
              setActivePin(null);
              setDrawingWirePos(null);
            }}
            className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
          >
            إلغاء
          </button>
        </div>
      )}

      {/* Floating Zoom & Canvas Controls (Ergonomic Corner) */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col items-center gap-1.5 p-1 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg">
        <button
          onClick={handleZoomIn}
          title="تكبير"
          className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          title="إعادة ضبط الرؤية (100%)"
          className="px-1.5 py-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={handleZoomOut}
          title="تصغير"
          className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          title="توسيط الدائرة"
          className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {onOpenWorkbenchSettings && (
          <button
            onClick={onOpenWorkbenchSettings}
            title="تخصيص طاولة العمل الفيزيائية"
            className="w-9 h-9 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors border-t border-slate-800/80"
          >
            <Layers className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Current Active Workbench Surface Badge */}
      {activeBgOption && (
        <div className="absolute bottom-6 right-6 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-slate-300 font-medium">
            {activeBgOption.nameAr}
          </span>
          {onOpenWorkbenchSettings && (
            <button
              onClick={onOpenWorkbenchSettings}
              className="text-[11px] text-sky-400 hover:text-sky-300 mr-1 font-semibold"
            >
              تغيير
            </button>
          )}
        </div>
      )}
    </div>
  );
};
