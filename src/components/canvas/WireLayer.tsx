/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Interactive Circuit Wire Layer
 */

import React from 'react';
import { CircuitElement, WireConnection, ViewMode, SimulationResult } from '../../types/circuit';
import { COMPONENT_CATALOG, getPinWorldPosition } from '../../data/componentsCatalog';

interface WireLayerProps {
  wires: WireConnection[];
  elements: CircuitElement[];
  selectedWireId: string | null;
  viewMode: ViewMode;
  simResult: SimulationResult;
  drawingWire: {
    fromComponentId: string;
    fromPinId: string;
    currentX: number;
    currentY: number;
  } | null;
  onSelectWire: (wireId: string) => void;
  onDeleteWire?: (wireId: string) => void;
}

export const WireLayer: React.FC<WireLayerProps> = ({
  wires,
  elements,
  selectedWireId,
  viewMode,
  simResult,
  drawingWire,
  onSelectWire,
  onDeleteWire,
}) => {
  const compMap = new Map<string, CircuitElement>();
  for (const el of elements) {
    compMap.set(el.id, el);
  }

  // Helper to get pin coordinate
  const getPinPos = (compId: string, pinId: string): { x: number; y: number } | null => {
    const el = compMap.get(compId);
    if (!el) return null;
    const meta = COMPONENT_CATALOG[el.type];
    if (!meta) return null;
    const pin = meta.pins.find(p => p.id === pinId);
    if (!pin) return null;
    return getPinWorldPosition(el.x, el.y, pin, el.rotation);
  };

  // Helper for wire routing path (orthogonal L-shape or straight)
  const getWirePath = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    if (Math.abs(dx) < 10 || Math.abs(dy) < 10) {
      return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
    }

    // Midpoint dog-leg
    const midX = p1.x + dx / 2;
    return `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
  };

  // Color generator for voltage levels mode
  const getVoltageColor = (v: number): string => {
    if (v >= 9.0) return '#ef4444'; // Red (High 9V+)
    if (v >= 5.0) return '#f97316'; // Orange (5V)
    if (v >= 3.0) return '#eab308'; // Amber/Yellow
    if (v >= 1.0) return '#10b981'; // Emerald
    if (v > 0.05) return '#06b6d4'; // Cyan
    return '#3b82f6'; // Deep Blue (GND / 0V)
  };

  return (
    <g id="wire-layer" className="select-none">
      {/* Existing Wires */}
      {wires.map(wire => {
        const p1 = getPinPos(wire.fromComponentId, wire.fromPinId);
        const p2 = getPinPos(wire.toComponentId, wire.toPinId);
        if (!p1 || !p2) return null;

        const isSelected = selectedWireId === wire.id;
        const current = simResult.branchCurrents.get(wire.id) ?? wire.current ?? 0;
        const voltage = wire.voltage ?? 0;
        const hasCurrent = current > 0.0001;

        let strokeColor = '#38bdf8'; // Default sky blue
        let strokeWidth = isSelected ? 3.5 : 2.5;

        if (viewMode === 'voltage_levels') {
          strokeColor = getVoltageColor(voltage);
        } else if (viewMode === 'logic_levels') {
          strokeColor = voltage > 2.0 ? '#10b981' : '#64748b';
        }

        const pathD = getWirePath(p1, p2);

        return (
          <g key={wire.id} className="cursor-pointer" onClick={() => onSelectWire(wire.id)}>
            {/* Generous touch hitbox for selecting wire */}
            <path
              d={pathD}
              fill="none"
              stroke="transparent"
              strokeWidth="28"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Base Wire Path */}
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-colors duration-200"
            />

            {/* Active Current Flow Animation (Moving dashes / particles) */}
            {(viewMode === 'current_flow' || (hasCurrent && isSelected)) && hasCurrent && (
              <path
                d={pathD}
                fill="none"
                stroke="#facc15"
                strokeWidth={strokeWidth * 0.9}
                strokeDasharray="6 8"
                strokeLinecap="round"
                className="animate-[dash_1s_linear_infinite]"
                style={{
                  animationDuration: `${Math.max(0.3, 1.5 - Math.min(1.2, current * 10))}s`,
                }}
              />
            )}

            {/* Selected Wire Highlight Glow */}
            {isSelected && (
              <path
                d={pathD}
                fill="none"
                stroke="#38bdf8"
                strokeWidth={strokeWidth + 4}
                opacity="0.3"
                strokeLinecap="round"
              />
            )}

            {/* Wire Junction / Terminal Dots */}
            <circle cx={p1.x} cy={p1.y} r="3" fill={strokeColor} />
            <circle cx={p2.x} cy={p2.y} r="3" fill={strokeColor} />
          </g>
        );
      })}

      {/* Drawing Wire in Progress */}
      {drawingWire && (() => {
        const p1 = getPinPos(drawingWire.fromComponentId, drawingWire.fromPinId);
        if (!p1) return null;
        const p2 = { x: drawingWire.currentX, y: drawingWire.currentY };
        const pathD = getWirePath(p1, p2);

        return (
          <g className="pointer-events-none">
            <path
              d={pathD}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
            <circle cx={p1.x} cy={p1.y} r="4" fill="#ef4444" />
            <circle cx={p2.x} cy={p2.y} r="5" fill="#ef4444" opacity="0.8" />
          </g>
        );
      })()}
    </g>
  );
};
