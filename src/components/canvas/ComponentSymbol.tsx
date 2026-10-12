/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Dual-View Schematic & Realistic Component Symbols
 */

import React from 'react';
import { CircuitElement, PinDefinition, SimulationResult, RenderStyle } from '../../types/circuit';
import { COMPONENT_CATALOG } from '../../data/componentsCatalog';
import { RealisticComponentGraphic } from './RealisticComponentSymbol';

interface ComponentSymbolProps {
  element: CircuitElement;
  isSelected: boolean;
  activePinId: string | null;
  simResult: SimulationResult;
  renderStyle?: RenderStyle;
  onPinClick: (elementId: string, pinId: string) => void;
  onPinPointerDown?: (elementId: string, pinId: string, e: React.PointerEvent) => void;
  onToggleComponent?: (elementId: string) => void;
}

export const ComponentSymbol: React.FC<ComponentSymbolProps> = ({
  element,
  isSelected,
  activePinId,
  simResult,
  renderStyle = 'schematic',
  onPinClick,
  onPinPointerDown,
  onToggleComponent,
}) => {
  const meta = COMPONENT_CATALOG[element.type];
  if (!meta) return null;

  const isBurnt = !!element.properties.isBurnt;

  // Render Standard Schematic Symbol (IEC / IEEE)
  const renderSchematicGraphic = () => {
    switch (element.type) {
      // 1. Batteries & DC Sources
      case 'dc_source':
      case 'battery_aa':
      case 'battery_aaa':
      case 'battery_c':
      case 'battery_d':
      case 'battery_9v':
      case 'battery_18650':
      case 'battery_lipo':
      case 'battery_lead_acid':
      case 'solar_cell':
      case 'bench_power_supply': {
        const v = element.properties.voltage ?? element.value ?? 9;
        return (
          <g>
            <circle cx="0" cy="0" r="24" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="8" y1="-14" x2="8" y2="14" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <text x="14" y="-6" fill="#ef4444" fontSize="11" fontWeight="bold">+</text>
            <line x1="-8" y1="-9" x2="-8" y2="9" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <text x="-16" y="-6" fill="#94a3b8" fontSize="11" fontWeight="bold">-</text>
            <line x1="8" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="-8" y1="0" x2="-40" y2="0" stroke="#38bdf8" strokeWidth="2" />
          </g>
        );
      }

      case 'ground':
        return (
          <g>
            <line x1="0" y1="-20" x2="0" y2="0" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="-16" y1="0" x2="16" y2="0" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <line x1="-10" y1="6" x2="10" y2="6" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="-4" y1="12" x2="4" y2="12" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <text x="8" y="16" fill="#64748b" fontSize="9" fontWeight="600">0V</text>
          </g>
        );

      case 'vcc': {
        const v = element.properties.voltage ?? element.value ?? 5;
        return (
          <g>
            <line x1="0" y1="0" x2="0" y2="20" stroke="#f43f5e" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="8" fill="#f43f5e" />
            <polygon points="0,-10 -6,0 6,0" fill="#f43f5e" />
            <text x="10" y="-2" fill="#fda4af" fontSize="10" fontWeight="bold">+{v}V</text>
          </g>
        );
      }

      case 'resistor':
      case 'resistor_smd':
      case 'resistor_power':
      case 'resistor_shunt': {
        return (
          <g>
            <line x1="-40" y1="0" x2="-26" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="26" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <path
              d="M -26 0 L -20 -10 L -10 10 L 0 -10 L 10 10 L 20 -10 L 26 0"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>
        );
      }

      case 'spst_switch': {
        const isClosed = !!element.properties.closed;
        return (
          <g
            className="cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              onToggleComponent?.(element.id);
            }}
          >
            <line x1="-40" y1="0" x2="-18" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="18" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="-18" cy="0" r="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="18" cy="0" r="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            {isClosed ? (
              <line x1="-18" y1="0" x2="18" y2="0" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
            ) : (
              <line x1="-18" y1="0" x2="14" y2="-16" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
            )}
            <text x="0" y="-18" textAnchor="middle" fill={isClosed ? '#10b981' : '#f43f5e'} fontSize="9" fontWeight="bold">
              {isClosed ? 'مغلق ON' : 'مفتوح OFF'}
            </text>
          </g>
        );
      }

      case 'push_button':
      case 'push_button_nc': {
        const isPressed = !!element.properties.pressed;
        return (
          <g
            className="cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              onToggleComponent?.(element.id);
            }}
          >
            <line x1="-40" y1="0" x2="-16" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="16" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="-16" cy="0" r="3" fill="#38bdf8" />
            <circle cx="16" cy="0" r="3" fill="#38bdf8" />
            <line
              x1="-20"
              y1={isPressed ? 0 : -8}
              x2="20"
              y2={isPressed ? 0 : -8}
              stroke={isPressed ? '#10b981' : '#fbbf24'}
              strokeWidth="3"
            />
            <line x1="0" y1={isPressed ? 0 : -8} x2="0" y2={isPressed ? -12 : -18} stroke="#94a3b8" strokeWidth="2" />
            <circle cx="0" cy={isPressed ? -12 : -18} r="4" fill="#3b82f6" />
          </g>
        );
      }

      case 'potentiometer':
      case 'trimmer_pot': {
        const pos = element.properties.position ?? 0.5;
        const wiperX = -20 + pos * 40;
        return (
          <g>
            <line x1="-40" y1="-20" x2="-24" y2="-20" stroke="#38bdf8" strokeWidth="2" />
            <line x1="24" y1="-20" x2="40" y2="-20" stroke="#38bdf8" strokeWidth="2" />
            <line x1="0" y1="30" x2="0" y2="10" stroke="#38bdf8" strokeWidth="2" />
            <path
              d="M -24 -20 L -18 -28 L -9 -12 L 0 -28 L 9 -12 L 18 -28 L 24 -20"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
            />
            <line x1="0" y1="10" x2={wiperX} y2="-12" stroke="#38bdf8" strokeWidth="2" />
            <polygon points={`${wiperX},-12 ${wiperX - 4},-4 ${wiperX + 4},-4`} fill="#38bdf8" />
            <text x="0" y="24" textAnchor="middle" fill="#94a3b8" fontSize="9">
              {Math.round(pos * 100)}%
            </text>
          </g>
        );
      }

      case 'ldr': {
        return (
          <g>
            <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="-40" y1="0" x2="-22" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="22" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <path d="M -22 0 L -15 -8 L -5 8 L 5 -8 L 15 8 L 22 0" fill="none" stroke="#fbbf24" strokeWidth="2" />
            <line x1="-18" y1="-22" x2="-8" y2="-12" stroke="#eab308" strokeWidth="2" />
            <polygon points="-8,-12 -12,-16 -14,-10" fill="#eab308" />
            <line x1="-10" y1="-24" x2="0" y2="-14" stroke="#eab308" strokeWidth="2" />
            <polygon points="0,-14 -4,-18 -6,-12" fill="#eab308" />
          </g>
        );
      }

      case 'capacitor':
      case 'capacitor_ceramic':
      case 'capacitor_film':
      case 'capacitor_trimmer': {
        return (
          <g>
            <line x1="-40" y1="0" x2="-10" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="10" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="-10" y1="-18" x2="-10" y2="18" stroke="#38bdf8" strokeWidth="3" />
            <line x1="10" y1="-18" x2="10" y2="18" stroke="#38bdf8" strokeWidth="3" />
          </g>
        );
      }

      case 'capacitor_electrolytic':
      case 'capacitor_super': {
        return (
          <g>
            <line x1="-40" y1="0" x2="-10" y2="0" stroke="#ef4444" strokeWidth="2" />
            <line x1="10" y1="0" x2="40" y2="0" stroke="#94a3b8" strokeWidth="2" />
            <line x1="-10" y1="-18" x2="-10" y2="18" stroke="#ef4444" strokeWidth="3.5" />
            {/* Curved negative plate */}
            <path d="M 12 -18 Q 8 0 12 18" fill="none" stroke="#94a3b8" strokeWidth="3.5" />
            <text x="-18" y="-12" fill="#ef4444" fontSize="11" fontWeight="bold">+</text>
          </g>
        );
      }

      case 'inductor':
      case 'choke': {
        return (
          <g>
            <line x1="-40" y1="0" x2="-24" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="24" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            {/* 4 Loops */}
            <path
              d="M -24 0 A 6 6 0 0 1 -12 0 A 6 6 0 0 1 0 0 A 6 6 0 0 1 12 0 A 6 6 0 0 1 24 0"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
            />
          </g>
        );
      }

      case 'diode':
      case 'diode_schottky':
        return (
          <g>
            <line x1="-40" y1="0" x2="-16" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="16" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <polygon points="-16,-14 16,0 -16,14" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="16" y1="-14" x2="16" y2="14" stroke="#e2e8f0" strokeWidth="3" />
          </g>
        );

      case 'zener_diode':
        return (
          <g>
            <line x1="-40" y1="0" x2="-16" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="16" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <polygon points="-16,-14 16,0 -16,14" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
            <path d="M 22 -14 L 16 -14 L 16 14 L 10 14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          </g>
        );

      case 'led': {
        const isLit = !!element.properties.isLit;
        const color = element.properties.color || 'red';
        const colorHexMap: Record<string, string> = {
          red: '#ef4444',
          green: '#10b981',
          blue: '#3b82f6',
          yellow: '#f59e0b',
          white: '#f8fafc',
        };
        const activeColor = colorHexMap[color] || '#ef4444';

        return (
          <g>
            {isLit && !isBurnt && (
              <circle cx="0" cy="0" r="30" fill={activeColor} opacity="0.3" filter="blur(6px)" />
            )}
            <line x1="-40" y1="0" x2="-16" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="16" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <polygon
              points="-16,-14 16,0 -16,14"
              fill={isBurnt ? '#475569' : isLit ? activeColor : '#1e293b'}
              stroke={isBurnt ? '#dc2626' : activeColor}
              strokeWidth="2"
            />
            <line x1="16" y1="-14" x2="16" y2="14" stroke="#e2e8f0" strokeWidth="3" />
            <line x1="4" y1="-14" x2="16" y2="-24" stroke={isLit ? activeColor : '#64748b'} strokeWidth="2" />
            <polygon points="16,-24 10,-24 14,-20" fill={isLit ? activeColor : '#64748b'} />
            <line x1="12" y1="-10" x2="24" y2="-20" stroke={isLit ? activeColor : '#64748b'} strokeWidth="2" />
            <polygon points="24,-20 18,-20 22,-16" fill={isLit ? activeColor : '#64748b'} />
            {isBurnt && (
              <text x="0" y="22" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">محترق (Burnt!)</text>
            )}
          </g>
        );
      }

      case 'transistor_npn': {
        const vbe = (simResult.pinVoltages.get(`${element.id}:base`) ?? 0) - (simResult.pinVoltages.get(`${element.id}:emitter`) ?? 0);
        const isActive = vbe >= 0.65;
        return (
          <g>
            <circle cx="0" cy="0" r="24" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="-12" y1="-14" x2="-12" y2="14" stroke="#f8fafc" strokeWidth="3" />
            <line x1="-30" y1="0" x2="-12" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="-12" y1="-8" x2="14" y2="-20" stroke="#38bdf8" strokeWidth="2" />
            <line x1="14" y1="-20" x2="20" y2="-30" stroke="#38bdf8" strokeWidth="2" />
            <line x1="-12" y1="8" x2="14" y2="20" stroke="#38bdf8" strokeWidth="2" />
            <line x1="14" y1="20" x2="20" y2="30" stroke="#38bdf8" strokeWidth="2" />
            <polygon points="14,20 6,14 10,12" fill="#38bdf8" />
            {isActive && <circle cx="0" cy="0" r="4" fill="#10b981" />}
          </g>
        );
      }

      case 'transistor_pnp': {
        return (
          <g>
            <circle cx="0" cy="0" r="24" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="-12" y1="-14" x2="-12" y2="14" stroke="#f8fafc" strokeWidth="3" />
            <line x1="-30" y1="0" x2="-12" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="-12" y1="-8" x2="14" y2="-20" stroke="#38bdf8" strokeWidth="2" />
            <line x1="14" y1="-20" x2="20" y2="-30" stroke="#38bdf8" strokeWidth="2" />
            <polygon points="-8,-6 -2,-12 -4,-4" fill="#38bdf8" />
            <line x1="-12" y1="8" x2="14" y2="20" stroke="#38bdf8" strokeWidth="2" />
            <line x1="14" y1="20" x2="20" y2="30" stroke="#38bdf8" strokeWidth="2" />
          </g>
        );
      }

      case 'and_gate':
        return (
          <g>
            <line x1="-40" y1="-15" x2="-18" y2="-15" stroke="#38bdf8" strokeWidth="2" />
            <line x1="-40" y1="15" x2="-18" y2="15" stroke="#38bdf8" strokeWidth="2" />
            <line x1="20" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <path d="M -18 -24 L 2 -24 A 24 24 0 0 1 2 24 L -18 24 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="-4" y="4" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">&amp;</text>
          </g>
        );

      case 'or_gate':
        return (
          <g>
            <line x1="-40" y1="-15" x2="-14" y2="-15" stroke="#38bdf8" strokeWidth="2" />
            <line x1="-40" y1="15" x2="-14" y2="15" stroke="#38bdf8" strokeWidth="2" />
            <line x1="22" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <path d="M -20 -24 Q -8 0 -20 24 Q 4 22 22 0 Q 4 -22 -20 -24 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="-2" y="4" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">≥</text>
          </g>
        );

      case 'not_gate':
        return (
          <g>
            <line x1="-40" y1="0" x2="-18" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="20" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <polygon points="-18,-18 14,0 -18,18" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="17" cy="0" r="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <text x="-6" y="4" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">1</text>
          </g>
        );

      case 'dc_motor': {
        const isRunning = !!element.properties.isRunning;
        const rpm = element.properties.rpm || 0;
        return (
          <g>
            <circle cx="0" cy="0" r="26" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="-40" y1="0" x2="-26" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="26" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <g style={{ transformOrigin: '0px 0px', animation: isRunning ? 'spin 0.6s linear infinite' : 'none' }}>
              <line x1="-14" y1="0" x2="14" y2="0" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
              <line x1="0" y1="-14" x2="0" y2="14" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
              <circle cx="0" cy="0" r="6" fill="#f59e0b" />
            </g>
            <text x="0" y="16" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">
              {isRunning ? `${rpm} RPM` : 'M'}
            </text>
          </g>
        );
      }

      case 'lamp': {
        const brightness = element.properties.brightness || 0;
        const isGlowing = brightness > 0.05;
        return (
          <g>
            {isGlowing && (
              <circle cx="0" cy="0" r="32" fill="#fbbf24" opacity={Math.min(0.6, brightness * 0.8)} filter="blur(8px)" />
            )}
            <circle cx="0" cy="0" r="22" fill={isGlowing ? `rgba(251, 191, 36, ${Math.min(1, brightness)})` : '#0f172a'} stroke="#fbbf24" strokeWidth="2" />
            <line x1="-40" y1="0" x2="-22" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="22" y1="0" x2="40" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="-12" y1="-12" x2="12" y2="12" stroke={isGlowing ? '#fff' : '#fbbf24'} strokeWidth="2" />
            <line x1="-12" y1="12" x2="12" y2="-12" stroke={isGlowing ? '#fff' : '#fbbf24'} strokeWidth="2" />
          </g>
        );
      }

      case 'voltmeter': {
        const reading = element.properties.reading ?? 0;
        return (
          <g>
            <circle cx="0" cy="0" r="24" fill="#090d16" stroke="#0ea5e9" strokeWidth="2.5" />
            <line x1="-40" y1="0" x2="-24" y2="0" stroke="#ef4444" strokeWidth="2.5" />
            <line x1="24" y1="0" x2="40" y2="0" stroke="#64748b" strokeWidth="2.5" />
            <rect x="-18" y="-14" width="36" height="18" rx="3" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
            <text x="0" y="-1" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="IBM Plex Mono" fontWeight="bold">
              {reading.toFixed(2)}
            </text>
            <text x="0" y="16" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">VOLT</text>
          </g>
        );
      }

      case 'ammeter': {
        const reading = element.properties.reading ?? 0;
        return (
          <g>
            <circle cx="0" cy="0" r="24" fill="#090d16" stroke="#f59e0b" strokeWidth="2.5" />
            <line x1="-40" y1="0" x2="-24" y2="0" stroke="#f59e0b" strokeWidth="2.5" />
            <line x1="24" y1="0" x2="40" y2="0" stroke="#f59e0b" strokeWidth="2.5" />
            <rect x="-18" y="-14" width="36" height="18" rx="3" fill="#020617" stroke="#f59e0b" strokeWidth="1" />
            <text x="0" y="-1" textAnchor="middle" fill="#f59e0b" fontSize="10" fontFamily="IBM Plex Mono" fontWeight="bold">
              {reading.toFixed(1)}
            </text>
            <text x="0" y="16" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">mA</text>
          </g>
        );
      }

      case 'timer_555':
        return (
          <g>
            <rect x="-35" y="-40" width="70" height="80" rx="4" fill="#0f172a" stroke="#8b5cf6" strokeWidth="2" />
            <circle cx="0" cy="-40" r="5" fill="#020617" stroke="#8b5cf6" strokeWidth="1.5" />
            <text x="0" y="5" textAnchor="middle" fill="#c084fc" fontSize="12" fontWeight="bold">NE555</text>
          </g>
        );

      case 'junction':
        return <circle cx="0" cy="0" r="5" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />;

      default:
        return (
          <rect x="-30" y="-20" width="60" height="40" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
        );
    }
  };

  return (
    <g
      id={`comp-${element.id}`}
      transform={`translate(${element.x}, ${element.y}) rotate(${element.rotation})`}
      className={`select-none ${isSelected ? 'cursor-move' : 'cursor-pointer'}`}
    >
      {/* Selection bounding box indicator */}
      {isSelected && (
        <rect
          x={-meta.width / 2 - 8}
          y={-meta.height / 2 - 8}
          width={meta.width + 16}
          height={meta.height + 16}
          rx="8"
          fill="rgba(56, 189, 248, 0.08)"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      )}

      {/* Render Graphic: Realistic or Schematic */}
      {renderStyle === 'realistic' ? (
        <RealisticComponentGraphic element={element} simResult={simResult} />
      ) : (
        renderSchematicGraphic()
      )}

      {/* Component Label & Value text */}
      <g transform={`rotate(${-element.rotation})`}>
        <text
          x="0"
          y={meta.height / 2 + 14}
          textAnchor="middle"
          fill="#f1f5f9"
          fontSize="11"
          fontWeight="bold"
          className="pointer-events-none"
        >
          {element.label}
        </text>
        {element.unit && (
          <text
            x="0"
            y={meta.height / 2 + 26}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="10"
            fontFamily="IBM Plex Mono"
            className="pointer-events-none"
          >
            {element.value} {element.unit}
          </text>
        )}
      </g>

      {/* Connection Pins with Explicit Labels (Anode, Cathode, Base, Collector, Emitter, +, -, etc.) */}
      {meta.pins.map(pin => {
        const isPinActive = activePinId === `${element.id}:${pin.id}`;
        return (
          <g key={pin.id} transform={`translate(${pin.x}, ${pin.y})`}>
            {/* Visual pin circle */}
            <circle
              cx="0"
              cy="0"
              r={isPinActive ? 6.5 : 4}
              fill={isPinActive ? '#ef4444' : '#0284c7'}
              stroke="#f8fafc"
              strokeWidth="2"
              className="transition-all duration-150"
            />
            {/* Descriptive pin label */}
            <text
              x="0"
              y="-7"
              textAnchor="middle"
              fill="#cbd5e1"
              fontSize="8"
              fontWeight="bold"
              className="pointer-events-none"
            >
              {pin.label}
            </text>
            {/* Touch Hitbox (>= 44px hit target for mobile fingers!) */}
            <circle
              cx="0"
              cy="0"
              r="22"
              fill="transparent"
              className="cursor-crosshair active:scale-95"
              onClick={e => {
                e.stopPropagation();
                onPinClick(element.id, pin.id);
              }}
              onPointerDown={e => {
                e.stopPropagation();
                onPinPointerDown?.(element.id, pin.id, e);
              }}
            />
          </g>
        );
      })}
    </g>
  );
};
