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
  onChangeRenderStyle?: (style: RenderStyle) => void;
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
  onChangeRenderStyle,
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

  // Multi-touch active pointers tracking for pinch-to-zoom & two-finger pan
  const pointersMapRef = useRef<Map<number, { clientX: number; clientY: number }>>(new Map());
  const pinchDataRef = useRef<{
    initialDist: number;
    initialZoom: number;
    initialPan: { x: number; y: number };
    midpoint: { x: number; y: number };
  } | null>(null);

  // Canvas pointer down (Start pan or start element drag)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Record pointer
    pointersMapRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

    // Multi-touch pinch detection (2 fingers)
    if (pointersMapRef.current.size === 2) {
      const pts = Array.from(pointersMapRef.current.values());
      const dist = Math.hypot(pts[0].clientX - pts[1].clientX, pts[0].clientY - pts[1].clientY);
      const mid = {
        x: (pts[0].clientX + pts[1].clientX) / 2,
        y: (pts[0].clientY + pts[1].clientY) / 2,
      };
      pinchDataRef.current = {
        initialDist: Math.max(dist, 10),
        initialZoom: zoom,
        initialPan: { ...pan },
        midpoint: mid,
      };
      dragRef.current.isDragging = false;
      return;
    }

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
    pointersMapRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

    if (pointersMapRef.current.size >= 2) return;

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
    if (pointersMapRef.current.has(e.pointerId)) {
      pointersMapRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
    }

    // Handle 2-Finger Pinch Zoom and Pan
    if (pointersMapRef.current.size === 2 && pinchDataRef.current) {
      const pts = Array.from(pointersMapRef.current.values());
      const currentDist = Math.hypot(pts[0].clientX - pts[1].clientX, pts[0].clientY - pts[1].clientY);
      const currentMid = {
        x: (pts[0].clientX + pts[1].clientX) / 2,
        y: (pts[0].clientY + pts[1].clientY) / 2,
      };

      const scaleFactor = currentDist / pinchDataRef.current.initialDist;
      const targetZoom = Math.min(2.8, Math.max(0.4, pinchDataRef.current.initialZoom * scaleFactor));

      const dx = currentMid.x - pinchDataRef.current.midpoint.x;
      const dy = currentMid.y - pinchDataRef.current.midpoint.y;

      setZoom(targetZoom);
      setPan({
        x: pinchDataRef.current.initialPan.x + dx,
        y: pinchDataRef.current.initialPan.y + dy,
      });
      return;
    }

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

  // Global pointer up & cancel
  const handlePointerUp = (e?: React.PointerEvent) => {
    if (e) {
      pointersMapRef.current.delete(e.pointerId);
    } else {
      pointersMapRef.current.clear();
    }
    if (pointersMapRef.current.size < 2) {
      pinchDataRef.current = null;
    }
    dragRef.current.isDragging = false;
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(2.8, prev + 0.15));
  const handleZoomOut = () => setZoom(prev => Math.max(0.4, prev - 0.15));
  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 60, y: 60 });
  };

  // Fit & center all elements in viewport
  const handleFitCircuit = () => {
    if (elements.length === 0) {
      handleResetView();
      return;
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    elements.forEach(el => {
      minX = Math.min(minX, el.x - 60);
      maxX = Math.max(maxX, el.x + 60);
      minY = Math.min(minY, el.y - 60);
      maxY = Math.max(maxY, el.y + 60);
    });
    const cWidth = containerRef.current?.clientWidth || window.innerWidth;
    const cHeight = containerRef.current?.clientHeight || window.innerHeight;
    const boxW = Math.max(maxX - minX, 150);
    const boxH = Math.max(maxY - minY, 150);
    const scaleX = (cWidth * 0.8) / boxW;
    const scaleY = (cHeight * 0.75) / boxH;
    const newZoom = Math.max(0.5, Math.min(1.5, Math.min(scaleX, scaleY)));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    setZoom(newZoom);
    setPan({
      x: cWidth / 2 - centerX * newZoom,
      y: cHeight / 2 - centerY * newZoom,
    });
  };

  // Desktop Mouse Wheel & Trackpad Pinch Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.3), 3.0);

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      setPan(prev => ({
        x: mouseX - (mouseX - prev.x) * (newZoom / zoom),
        y: mouseY - (mouseY - prev.y) * (newZoom / zoom),
      }));
    }
    setZoom(newZoom);
  };

  // Desktop & Laptop Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedElementId || selectedWireId)) {
        if (selectedElementId) onDeleteElement(selectedElementId);
        else if (selectedWireId) onDeleteWire(selectedWireId);
      } else if (e.key === 'r' || e.key === 'R') {
        if (selectedElementId) onRotateElement(selectedElementId);
      } else if (e.key === 'Escape') {
        onSelectElement(null);
        onSelectWire(null);
        setActivePin(null);
        setDrawingWirePos(null);
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleFitCircuit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, selectedWireId, onDeleteElement, onDeleteWire, onRotateElement]);

  const selectedElement = elements.find(e => e.id === selectedElementId);

  const activeBgOption = WORKBENCH_BACKGROUNDS.find(b => b.id === workbenchBg);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950 overflow-hidden select-none touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* SVG Canvas Area */}
      <svg
        id="circuit-svg-canvas"
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

      {/* Floating Diagram Style Switcher: مخطط رمزي (Schematic) vs مخطط فعلي (Physical/Realistic) */}
      {onChangeRenderStyle && (
        <div className="absolute top-3 left-3 sm:left-6 z-20 flex items-center p-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl shadow-2xl shadow-black/80 select-none ring-1 ring-white/5">
          <button
            type="button"
            onClick={() => onChangeRenderStyle('schematic')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-all active:scale-95 ${
              renderStyle === 'schematic'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/35 ring-1 ring-sky-300/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="تفعيل المخطط الرمزي القياسي (IEC/IEEE Schematic Symbols)"
          >
            <span className="text-xs sm:text-sm">📐</span>
            <span className="text-[11px] sm:text-xs font-bold">مخطط رمزي</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeRenderStyle('realistic')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-all active:scale-95 ${
              renderStyle === 'realistic'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/35 ring-1 ring-amber-300/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="تفعيل المخطط الفعلي الحقيقي للمكونات (Realistic Physical View)"
          >
            <span className="text-xs sm:text-sm">🔌</span>
            <span className="text-[11px] sm:text-xs font-bold">مخطط فعلي</span>
          </button>
        </div>
      )}

      {/* Floating Quick Action Bar when a Component is Selected */}
      {selectedElement && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1 sm:p-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl shadow-black/60 max-w-[96vw] overflow-x-auto">
          <button
            onClick={() => onRotateElement(selectedElement.id)}
            title="تدوير 90 درجة"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors min-h-[38px] active:scale-95 shrink-0"
          >
            <RotateCw className="w-3.5 h-3.5 text-sky-400" />
            <span>تدوير</span>
          </button>

          <button
            onClick={() => onEditElement(selectedElement)}
            title="تعديل القيمة والخصائص"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors min-h-[38px] active:scale-95 shrink-0"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>تعديل</span>
          </button>

          <button
            onClick={() => onDuplicateElement(selectedElement.id)}
            title="تكرار العنصر"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors min-h-[38px] active:scale-95 shrink-0"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span>تكرار</span>
          </button>

          <button
            onClick={() => onDeleteElement(selectedElement.id)}
            title="حذف العنصر"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/40 rounded-xl transition-colors min-h-[38px] active:scale-95 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>حذف</span>
          </button>
        </div>
      )}

      {/* Floating Wire Action Bar when a Wire is Selected */}
      {selectedWireId && !selectedElement && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl max-w-[96vw]">
          <span className="text-xs text-slate-300 font-medium">سلك محدد</span>
          <button
            onClick={() => onDeleteWire(selectedWireId)}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-rose-300 bg-rose-950/70 hover:bg-rose-900 border border-rose-800/40 rounded-xl transition-colors min-h-[36px]"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>حذف السلك</span>
          </button>
        </div>
      )}

      {/* Wiring In Progress Notification */}
      {activePin && (
        <div className="absolute top-3 right-3 sm:right-6 z-20 flex items-center gap-2 px-3 py-2 bg-sky-950/95 border border-sky-500/60 rounded-2xl shadow-xl backdrop-blur-md animate-pulse max-w-[90vw]">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
          <span className="text-xs font-semibold text-sky-200 truncate">
            انقر على طرف المكون الثاني لإتمام التوصيل بالسلك
          </span>
          <button
            onClick={() => {
              setActivePin(null);
              setDrawingWirePos(null);
            }}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg shrink-0 font-bold"
          >
            إلغاء
          </button>
        </div>
      )}

      {/* Floating Zoom & Canvas Controls (Safely positioned above mobile bottom bar) */}
      <div className="absolute bottom-20 md:bottom-6 left-3 sm:left-6 z-20 flex flex-col items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl shadow-black/50">
        <button
          onClick={handleZoomIn}
          title="تكبير"
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          title="إعادة ضبط الرؤية (100%)"
          className="px-1.5 py-1 text-[10px] sm:text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={handleZoomOut}
          title="تصغير"
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitCircuit}
          title="ملاءمة وتوسيط الدائرة كاملة في الشاشة"
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-xl transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {onOpenWorkbenchSettings && (
          <button
            onClick={onOpenWorkbenchSettings}
            title="تخصيص طاولة العمل الفيزيائية"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-xl transition-colors border-t border-slate-800/80"
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
