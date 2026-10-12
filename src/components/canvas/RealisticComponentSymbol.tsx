/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Realistic Pictorial Component View
 * Provides real-world photographic/vector rendering of components
 */

import React from 'react';
import { CircuitElement, SimulationResult } from '../../types/circuit';
import { COMPONENT_CATALOG } from '../../data/componentsCatalog';

interface RealisticProps {
  element: CircuitElement;
  simResult: SimulationResult;
}

// Helper to determine resistor 4-band colors from resistance value
function getResistorBands(resistance: number): [string, string, string, string] {
  const colorMap = [
    '#020617', // 0 Black
    '#78350f', // 1 Brown
    '#dc2626', // 2 Red
    '#ea580c', // 3 Orange
    '#eab308', // 4 Yellow
    '#16a34a', // 5 Green
    '#2563eb', // 6 Blue
    '#9333ea', // 7 Violet
    '#64748b', // 8 Gray
    '#f8fafc', // 9 White
  ];

  if (!resistance || resistance <= 0) return [colorMap[1], colorMap[0], colorMap[2], '#d97706'];

  const str = resistance.toExponential(); // e.g. "1e+3" or "4.7e+2"
  const parts = str.split('e');
  let coeff = parseFloat(parts[0]);
  let exp = parseInt(parts[1], 10);

  // Normalize to 2 significant digits
  while (coeff < 10 && exp > 0) {
    coeff *= 10;
    exp -= 1;
  }
  const roundCoeff = Math.round(coeff);
  const d1 = Math.floor(roundCoeff / 10) % 10;
  const d2 = roundCoeff % 10;
  const mult = Math.max(0, Math.min(9, exp));

  return [
    colorMap[d1] || colorMap[1],
    colorMap[d2] || colorMap[0],
    colorMap[mult] || colorMap[2],
    '#d97706', // Gold 5% tolerance
  ];
}

export const RealisticComponentGraphic: React.FC<RealisticProps> = ({ element, simResult }) => {
  const isBurnt = !!element.properties.isBurnt;

  switch (element.type) {
    // ------------------------------------
    // BATTERIES
    // ------------------------------------
    case 'battery_9v':
    case 'dc_source': {
      const v = element.properties.voltage ?? element.value ?? 9;
      return (
        <g>
          {/* Rectangular metal casing */}
          <rect x="-24" y="-32" width="48" height="64" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <rect x="-24" y="-32" width="48" height="18" fill="#d97706" />
          {/* Brand/Label */}
          <text x="0" y="-20" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">HEAVY DUTY</text>
          <text x="0" y="5" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="black" fontFamily="IBM Plex Mono">{v}V</text>
          <text x="0" y="18" textAnchor="middle" fill="#94a3b8" fontSize="7">TRANSISTOR 9V</text>
          {/* Top terminals */}
          {/* Positive male stud */}
          <circle cx="12" cy="-35" r="4.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
          <text x="12" y="-42" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">+</text>
          {/* Negative female socket */}
          <polygon points="-16,-38 -8,-38 -6,-32 -10,-28 -18,-28" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
          <text x="-12" y="-42" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">-</text>
          {/* Connection wires to canvas pins */}
          <line x1="12" y1="-35" x2="40" y2="0" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          <line x1="-12" y1="-35" x2="-40" y2="0" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    }

    case 'battery_aa':
    case 'battery_aaa':
    case 'battery_c':
    case 'battery_d': {
      const isSmall = element.type === 'battery_aaa';
      const w = isSmall ? 52 : 62;
      const h = isSmall ? 22 : 28;
      const v = element.properties.voltage ?? 1.5;
      return (
        <g>
          {/* Wire leads */}
          <line x1={-w / 2} y1="0" x2="-40" y2="0" stroke="#64748b" strokeWidth="2" />
          <line x1={w / 2 + 5} y1="0" x2="40" y2="0" stroke="#ef4444" strokeWidth="2" />
          {/* Cylindrical battery body */}
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          {/* Copper top end */}
          <rect x={w / 2 - 16} y={-h / 2} width="16" height={h} rx="2" fill="#d97706" />
          {/* Positive Nub */}
          <rect x={w / 2} y="-5" width="5" height="10" rx="1.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.8" />
          {/* White separator line */}
          <line x1={w / 2 - 16} y1={-h / 2} x2={w / 2 - 16} y2={h / 2} stroke="#f8fafc" strokeWidth="1.5" />
          {/* Text */}
          <text x={-6} y="3" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono">
            {element.type === 'battery_aa' ? 'AA' : element.type === 'battery_aaa' ? 'AAA' : 'CELL'} {v}V
          </text>
          <text x={w / 2 - 8} y="3" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">+</text>
        </g>
      );
    }

    case 'battery_18650': {
      return (
        <g>
          <line x1="-34" y1="0" x2="-45" y2="0" stroke="#64748b" strokeWidth="2" />
          <line x1="38" y1="0" x2="45" y2="0" stroke="#ef4444" strokeWidth="2" />
          {/* Teal/Green shrink tube sleeve */}
          <rect x="-34" y="-14" width="68" height="28" rx="4" fill="#0d9488" stroke="#115e59" strokeWidth="1.5" />
          {/* Positive button top */}
          <rect x="34" y="-6" width="4" height="12" rx="1" fill="#e2e8f0" />
          {/* Negative flat bottom */}
          <rect x="-34" y="-14" width="4" height="28" fill="#94a3b8" />
          <text x="0" y="3" textAnchor="middle" fill="#ccfbf1" fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono">
            18650 3.7V Li-ion
          </text>
        </g>
      );
    }

    case 'battery_lead_acid': {
      return (
        <g>
          {/* Black plastic rectangular box */}
          <rect x="-35" y="-25" width="70" height="50" rx="3" fill="#090d16" stroke="#334155" strokeWidth="2" />
          {/* Top handle bar */}
          <rect x="-20" y="-30" width="40" height="6" rx="2" fill="#ef4444" />
          {/* Terminals */}
          <rect x="-25" y="-28" width="10" height="5" fill="#475569" />
          <rect x="15" y="-28" width="10" height="5" fill="#ef4444" />
          <text x="20" y="-15" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">+</text>
          <text x="-20" y="-15" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">-</text>
          <text x="0" y="8" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">12V LEAD-ACID</text>
          <line x1="-20" y1="-28" x2="-40" y2="-20" stroke="#475569" strokeWidth="2" />
          <line x1="20" y1="-28" x2="40" y2="-20" stroke="#ef4444" strokeWidth="2" />
        </g>
      );
    }

    case 'solar_cell': {
      return (
        <g>
          {/* Blue solar wafer */}
          <rect x="-32" y="-24" width="64" height="48" rx="2" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
          {/* Grid busbars */}
          <line x1="-16" y1="-24" x2="-16" y2="24" stroke="#93c5fd" strokeWidth="1" opacity="0.7" />
          <line x1="0" y1="-24" x2="0" y2="24" stroke="#93c5fd" strokeWidth="1.5" opacity="0.8" />
          <line x1="16" y1="-24" x2="16" y2="24" stroke="#93c5fd" strokeWidth="1" opacity="0.7" />
          <line x1="-32" y1="-8" x2="32" y2="-8" stroke="#93c5fd" strokeWidth="0.5" opacity="0.5" />
          <line x1="-32" y1="8" x2="32" y2="8" stroke="#93c5fd" strokeWidth="0.5" opacity="0.5" />
          <line x1="32" y1="0" x2="40" y2="0" stroke="#ef4444" strokeWidth="2" />
          <line x1="-32" y1="0" x2="-40" y2="0" stroke="#0f172a" strokeWidth="2" />
          <text x="0" y="3" textAnchor="middle" fill="#fef08a" fontSize="8" fontWeight="bold">SOLAR 6V</text>
        </g>
      );
    }

    case 'ground':
      return (
        <g>
          <line x1="0" y1="-20" x2="0" y2="0" stroke="#38bdf8" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="4" fill="#0284c7" />
          <line x1="-18" y1="0" x2="18" y2="0" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <line x1="-12" y1="6" x2="12" y2="6" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="-6" y1="12" x2="6" y2="12" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          <text x="0" y="24" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">GND (0V)</text>
        </g>
      );

    case 'vcc': {
      const v = element.properties.voltage ?? element.value ?? 5;
      return (
        <g>
          <line x1="0" y1="0" x2="0" y2="20" stroke="#f43f5e" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="9" fill="#e11d48" stroke="#fda4af" strokeWidth="1.5" />
          <polygon points="0,-12 -6,-2 6,-2" fill="#f43f5e" />
          <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">+{v}V</text>
        </g>
      );
    }

    // ------------------------------------
    // RESISTORS
    // ------------------------------------
    case 'resistor': {
      const r = element.properties.resistance ?? element.value ?? 1000;
      const bands = getResistorBands(r);
      return (
        <g>
          {/* Wire leads */}
          <line x1="-40" y1="0" x2="-22" y2="0" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <line x1="22" y1="0" x2="40" y2="0" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          {/* Beige ceramic body */}
          <rect x="-20" y="-8" width="40" height="16" rx="5" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
          {/* Bulbous ends */}
          <circle cx="-18" cy="0" r="8" fill="#fef3c7" stroke="#d97706" strokeWidth="0.8" />
          <circle cx="18" cy="0" r="8" fill="#fef3c7" stroke="#d97706" strokeWidth="0.8" />
          {/* 4 Colored rings */}
          <rect x="-14" y="-8" width="4" height="16" fill={bands[0]} />
          <rect x="-7" y="-8" width="4" height="16" fill={bands[1]} />
          <rect x="0" y="-8" width="4" height="16" fill={bands[2]} />
          <rect x="9" y="-8" width="3.5" height="16" fill={bands[3]} />
        </g>
      );
    }

    case 'resistor_smd': {
      const code = element.properties.smdCode || '103';
      return (
        <g>
          <line x1="-30" y1="0" x2="-20" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="20" y1="0" x2="30" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          {/* Black ceramic chip */}
          <rect x="-20" y="-10" width="40" height="20" rx="1.5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          {/* Silver solder terminations */}
          <rect x="-20" y="-10" width="6" height="20" fill="#cbd5e1" />
          <rect x="14" y="-10" width="6" height="20" fill="#cbd5e1" />
          {/* Printed white number */}
          <text x="0" y="3" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono">
            {code}
          </text>
        </g>
      );
    }

    case 'resistor_power': {
      return (
        <g>
          <line x1="-45" y1="0" x2="-28" y2="0" stroke="#94a3b8" strokeWidth="2" />
          <line x1="28" y1="0" x2="45" y2="0" stroke="#94a3b8" strokeWidth="2" />
          {/* White ceramic rectangular block */}
          <rect x="-28" y="-12" width="56" height="24" rx="2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
          <text x="0" y="-2" textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="bold">5W 10ΩJ</text>
          <text x="0" y="7" textAnchor="middle" fill="#475569" fontSize="6">CERAMIC</text>
        </g>
      );
    }

    case 'potentiometer': {
      const pos = element.properties.position ?? 0.5;
      const angle = -135 + pos * 270;
      return (
        <g>
          {/* Blue metal casing */}
          <circle cx="0" cy="-6" r="22" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
          {/* Metallic knurled rotating shaft */}
          <circle cx="0" cy="-6" r="12" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
          {/* Position indicator notch */}
          <g transform={`rotate(${angle}, 0, -6)`}>
            <line x1="0" y1="-6" x2="0" y2="-17" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          {/* 3 Silver solder lugs */}
          <line x1="-20" y1="12" x2="-40" y2="-20" stroke="#94a3b8" strokeWidth="2" />
          <line x1="0" y1="16" x2="0" y2="30" stroke="#94a3b8" strokeWidth="2" />
          <line x1="20" y1="12" x2="40" y2="-20" stroke="#94a3b8" strokeWidth="2" />
        </g>
      );
    }

    case 'ldr': {
      return (
        <g>
          <line x1="-40" y1="0" x2="-20" y2="0" stroke="#94a3b8" strokeWidth="2" />
          <line x1="20" y1="0" x2="40" y2="0" stroke="#94a3b8" strokeWidth="2" />
          {/* Red ceramic disc */}
          <circle cx="0" cy="0" r="20" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          {/* Yellow translucent photo-conductive track */}
          <path
            d="M -12 -8 Q -6 -14 0 -8 Q 6 -2 12 -8 Q 6 4 0 10 Q -6 16 -12 10"
            fill="none"
            stroke="#fef08a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      );
    }

    // ------------------------------------
    // CAPACITORS
    // ------------------------------------
    case 'capacitor_ceramic': {
      return (
        <g>
          <line x1="-35" y1="0" x2="-14" y2="0" stroke="#94a3b8" strokeWidth="2" />
          <line x1="14" y1="0" x2="35" y2="0" stroke="#94a3b8" strokeWidth="2" />
          {/* Orange/Yellow disc */}
          <circle cx="0" cy="0" r="16" fill="#ea580c" stroke="#c2410c" strokeWidth="1.5" />
          <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono">104</text>
        </g>
      );
    }

    case 'capacitor_electrolytic': {
      return (
        <g>
          <line x1="-40" y1="0" x2="-20" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="20" y1="0" x2="40" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          {/* Blue aluminum can */}
          <rect x="-20" y="-14" width="40" height="28" rx="3" fill="#1d4ed8" stroke="#1e40af" strokeWidth="1.5" />
          {/* Negative stripe on right */}
          <rect x="8" y="-14" width="10" height="28" rx="1" fill="#cbd5e1" />
          <text x="13" y="-3" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">-</text>
          <text x="13" y="8" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">-</text>
          <text x="-6" y="3" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="IBM Plex Mono">100µF</text>
        </g>
      );
    }

    // ------------------------------------
    // SEMICONDUCTORS
    // ------------------------------------
    case 'diode':
    case 'diode_schottky': {
      return (
        <g>
          <line x1="-40" y1="0" x2="-18" y2="0" stroke="#94a3b8" strokeWidth="2" />
          <line x1="18" y1="0" x2="40" y2="0" stroke="#94a3b8" strokeWidth="2" />
          {/* Black cylinder DO-41 */}
          <rect x="-18" y="-9" width="36" height="18" rx="3" fill="#090d16" stroke="#334155" strokeWidth="1" />
          {/* Silver cathode band on right */}
          <rect x="8" y="-9" width="6" height="18" fill="#e2e8f0" />
          <text x="-4" y="3" textAnchor="middle" fill="#64748b" fontSize="6" fontWeight="bold">1N4007</text>
        </g>
      );
    }

    case 'led': {
      const isLit = !!element.properties.isLit;
      const color = element.properties.color || 'red';
      const colorMap: Record<string, string> = {
        red: '#ef4444',
        green: '#10b981',
        blue: '#3b82f6',
        yellow: '#f59e0b',
        white: '#f8fafc',
      };
      const c = colorMap[color] || '#ef4444';
      return (
        <g>
          {/* Glow if lit */}
          {isLit && !isBurnt && (
            <circle cx="0" cy="0" r="32" fill={c} opacity="0.35" filter="blur(8px)" />
          )}
          {/* Wire leads (Anode longer on left) */}
          <line x1="-40" y1="0" x2="-12" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="12" y1="0" x2="40" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          {/* Translucent epoxy dome */}
          <circle cx="0" cy="0" r="16" fill={isBurnt ? '#475569' : c} opacity={isBurnt ? 0.8 : isLit ? 1.0 : 0.75} stroke="#fff" strokeWidth="1" />
          {/* Internal reflective cup & post */}
          <polygon points="-4,-4 4,-4 2,4 -2,4" fill="#f8fafc" opacity="0.6" />
          {isBurnt && (
            <text x="0" y="24" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">محترق (Burnt!)</text>
          )}
        </g>
      );
    }

    case 'transistor_npn':
    case 'transistor_pnp': {
      return (
        <g>
          {/* TO-92 black epoxy body */}
          <path d="M -16 -12 C -16 -24 16 -24 16 -12 L 16 12 L -16 12 Z" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
          <text x="0" y="2" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">
            {element.type === 'transistor_npn' ? 'BC547' : 'BC557'}
          </text>
          {/* 3 silver legs */}
          <line x1="-30" y1="0" x2="-10" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="10" y1="-12" x2="20" y2="-30" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="10" y1="12" x2="20" y2="30" stroke="#cbd5e1" strokeWidth="2" />
          {/* Pin labels */}
          <text x="-24" y="-5" fill="#38bdf8" fontSize="8" fontWeight="bold">B</text>
          <text x="14" y="-22" fill="#38bdf8" fontSize="8" fontWeight="bold">C</text>
          <text x="14" y="24" fill="#38bdf8" fontSize="8" fontWeight="bold">E</text>
        </g>
      );
    }

    case 'timer_555':
    case 'opamp': {
      return (
        <g>
          {/* DIP-8 IC Black Epoxy package */}
          <rect x="-32" y="-36" width="64" height="72" rx="3" fill="#090d16" stroke="#475569" strokeWidth="1.5" />
          {/* Notch at top */}
          <circle cx="0" cy="-36" r="4.5" fill="#020617" stroke="#475569" strokeWidth="1" />
          {/* Pin 1 dot indent */}
          <circle cx="-22" cy="-26" r="2.5" fill="#1e293b" />
          <text x="0" y="4" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold">
            {element.type === 'timer_555' ? 'NE555P' : 'LM741CN'}
          </text>
          {/* Silver legs */}
          {[-25, -8, 8, 25].map((y, idx) => (
            <React.Fragment key={idx}>
              <line x1="-40" y1={y} x2="-32" y2={y} stroke="#cbd5e1" strokeWidth="2.5" />
              <line x1="32" y1={y} x2="40" y2={y} stroke="#cbd5e1" strokeWidth="2.5" />
            </React.Fragment>
          ))}
        </g>
      );
    }

    // ------------------------------------
    // ACTUATORS & MOTORS
    // ------------------------------------
    case 'dc_motor': {
      const isRunning = !!element.properties.isRunning;
      const rpm = element.properties.rpm || 0;
      return (
        <g>
          <line x1="-40" y1="0" x2="-26" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="26" y1="0" x2="40" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          {/* Metal cylindrical housing */}
          <circle cx="0" cy="0" r="26" fill="#475569" stroke="#64748b" strokeWidth="2" />
          <circle cx="0" cy="0" r="20" fill="#334155" />
          {/* Motor Axle & Propeller */}
          <g style={{ transformOrigin: '0px 0px', animation: isRunning ? 'spin 0.4s linear infinite' : 'none' }}>
            <circle cx="0" cy="0" r="6" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1" />
            <polygon points="0,-16 -4,-4 4,-4" fill="#38bdf8" />
            <polygon points="0,16 -4,4 4,4" fill="#38bdf8" />
            <polygon points="-16,0 -4,-4 -4,4" fill="#38bdf8" />
            <polygon points="16,0 4,-4 4,4" fill="#38bdf8" />
          </g>
          <text x="0" y="16" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
            {isRunning ? `${rpm} RPM` : 'DC MOTOR'}
          </text>
        </g>
      );
    }

    case 'servo_motor': {
      return (
        <g>
          {/* Blue micro servo casing */}
          <rect x="-26" y="-20" width="52" height="40" rx="3" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          {/* White horn arm */}
          <circle cx="10" cy="-6" r="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="10" y1="-6" x2="24" y2="-6" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
          <text x="-6" y="8" textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="bold">SG90</text>
          <line x1="-26" y1="-10" x2="-35" y2="-15" stroke="#ef4444" strokeWidth="2" />
          <line x1="-26" y1="0" x2="-35" y2="0" stroke="#475569" strokeWidth="2" />
          <line x1="-26" y1="10" x2="-35" y2="15" stroke="#f59e0b" strokeWidth="2" />
        </g>
      );
    }

    case 'lamp': {
      const brightness = element.properties.brightness || 0;
      const isGlowing = brightness > 0.05;
      return (
        <g>
          {isGlowing && (
            <circle cx="0" cy="-6" r="34" fill="#fbbf24" opacity={Math.min(0.7, brightness)} filter="blur(8px)" />
          )}
          {/* Clear glass bulb */}
          <circle cx="0" cy="-6" r="22" fill={isGlowing ? `rgba(254, 240, 138, ${Math.min(1, brightness)})` : '#1e293b'} stroke="#fef08a" strokeWidth="1.5" />
          {/* Tungsten filament */}
          <path d="M -8 4 L -6 -6 L -2 -14 L 2 -14 L 6 -6 L 8 4" fill="none" stroke={isGlowing ? '#fff' : '#f59e0b'} strokeWidth="1.5" />
          {/* Metallic threaded base */}
          <rect x="-10" y="8" width="20" height="12" rx="2" fill="#94a3b8" />
          <line x1="-40" y1="0" x2="-10" y2="12" stroke="#94a3b8" strokeWidth="2" />
          <line x1="40" y1="0" x2="10" y2="12" stroke="#94a3b8" strokeWidth="2" />
        </g>
      );
    }

    case 'buzzer': {
      const isActive = !!element.properties.isActive;
      return (
        <g>
          <line x1="-30" y1="0" x2="-18" y2="0" stroke="#94a3b8" strokeWidth="2" />
          <line x1="18" y1="0" x2="30" y2="0" stroke="#94a3b8" strokeWidth="2" />
          {/* Black plastic cylinder */}
          <circle cx="0" cy="0" r="20" fill="#090d16" stroke="#334155" strokeWidth="2" />
          {/* Central sound emission hole */}
          <circle cx="0" cy="0" r="6" fill="#020617" />
          <text x="-10" y="-8" fill="#ef4444" fontSize="10" fontWeight="bold">+</text>
          {isActive && (
            <g stroke="#10b981" strokeWidth="2" fill="none">
              <path d="M 22 -12 A 16 16 0 0 1 22 12" />
              <path d="M 28 -18 A 24 24 0 0 1 28 18" />
            </g>
          )}
        </g>
      );
    }

    case 'relay_spdt': {
      return (
        <g>
          {/* Blue rectangular sugar cube relay */}
          <rect x="-35" y="-25" width="70" height="50" rx="3" fill="#1d4ed8" stroke="#1e40af" strokeWidth="1.5" />
          <text x="0" y="-8" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">SONGLE</text>
          <text x="0" y="2" textAnchor="middle" fill="#93c5fd" fontSize="7">SRD-05VDC</text>
          <text x="0" y="12" textAnchor="middle" fill="#bfdbfe" fontSize="6">10A 250VAC</text>
          <line x1="-40" y1="-20" x2="-35" y2="-20" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="-40" y1="20" x2="-35" y2="20" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="35" y1="0" x2="40" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="35" y1="-25" x2="40" y2="-25" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="35" y1="25" x2="40" y2="25" stroke="#cbd5e1" strokeWidth="2" />
        </g>
      );
    }

    // ------------------------------------
    // SWITCHES & SENSORS
    // ------------------------------------
    case 'spst_switch': {
      const isClosed = !!element.properties.closed;
      return (
        <g>
          <line x1="-35" y1="0" x2="-18" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="18" y1="0" x2="35" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          {/* Miniature toggle switch casing */}
          <rect x="-18" y="-14" width="36" height="28" rx="3" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
          {/* Threaded collar */}
          <circle cx="0" cy="0" r="8" fill="#64748b" stroke="#cbd5e1" strokeWidth="1" />
          {/* Metal toggle bat */}
          <g transform={`rotate(${isClosed ? 25 : -25}, 0, 0)`}>
            <line x1="0" y1="0" x2="0" y2="-16" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="0" cy="-16" r="3.5" fill="#e2e8f0" />
          </g>
          <text x="0" y="22" textAnchor="middle" fill={isClosed ? '#10b981' : '#f59e0b'} fontSize="7" fontWeight="bold">
            {isClosed ? 'مغلق (ON)' : 'مفتوح (OFF)'}
          </text>
        </g>
      );
    }

    case 'push_button':
    case 'push_button_nc': {
      const isPressed = !!element.properties.closed;
      return (
        <g>
          {/* 4 Silver PCB legs */}
          <line x1="-25" y1="-10" x2="-35" y2="-10" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="-25" y1="10" x2="-35" y2="10" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="25" y1="-10" x2="35" y2="-10" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="25" y1="10" x2="35" y2="10" stroke="#cbd5e1" strokeWidth="2" />
          {/* Black square tactile button body 6x6mm */}
          <rect x="-24" y="-24" width="48" height="48" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          {/* Silver dome rim */}
          <circle cx="0" cy="0" r="14" fill="#334155" stroke="#64748b" strokeWidth="1" />
          {/* Round actuator button */}
          <circle cx="0" cy="0" r={isPressed ? 9 : 11} fill={element.type === 'push_button_nc' ? '#ef4444' : '#0284c7'} stroke="#f8fafc" strokeWidth="1" />
          <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">
            {isPressed ? 'DOWN' : 'PUSH'}
          </text>
        </g>
      );
    }

    // ------------------------------------
    // LOGIC GATES (REALISTIC DIP-14 ICs)
    // ------------------------------------
    case 'not_gate':
    case 'and_gate':
    case 'or_gate':
    case 'nand_gate':
    case 'nor_gate':
    case 'xor_gate':
    case 'xnor_gate': {
      const icNames: Record<string, string> = {
        not_gate: '74LS04 (NOT)',
        and_gate: '74LS08 (AND)',
        or_gate: '74LS32 (OR)',
        nand_gate: '74LS00 (NAND)',
        nor_gate: '74LS02 (NOR)',
        xor_gate: '74LS86 (XOR)',
        xnor_gate: '74LS266 (XNOR)',
      };
      return (
        <g>
          {/* DIP-14 dual-in-line package */}
          <rect x="-35" y="-22" width="70" height="44" rx="2.5" fill="#090d16" stroke="#475569" strokeWidth="1.5" />
          {/* Left orientation notch */}
          <circle cx="-35" cy="0" r="4.5" fill="#020617" stroke="#475569" strokeWidth="1" />
          {/* Pin 1 indent dot */}
          <circle cx="-25" cy="-14" r="2" fill="#1e293b" />
          {/* Laser etched text */}
          <text x="0" y="-3" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontWeight="bold" fontFamily="IBM Plex Mono">
            {icNames[element.type] || '74LSxx'}
          </text>
          <text x="0" y="8" textAnchor="middle" fill="#94a3b8" fontSize="6">TI MALAYSIA</text>
          {/* 7 silver pins top and bottom */}
          {[-25, -17, -9, 0, 9, 17, 25].map((x, idx) => (
            <React.Fragment key={idx}>
              <line x1={x} y1="-28" x2={x} y2="-22" stroke="#cbd5e1" strokeWidth="2" />
              <line x1={x} y1="22" x2={x} y2="28" stroke="#cbd5e1" strokeWidth="2" />
            </React.Fragment>
          ))}
          {/* External wire connection leads to schematic pins */}
          <line x1="-35" y1="-10" x2="-45" y2="-10" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="-35" y1="10" x2="-45" y2="10" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="35" y1="0" x2="45" y2="0" stroke="#cbd5e1" strokeWidth="2" />
        </g>
      );
    }

    // ------------------------------------
    // SEVEN SEGMENT DISPLAY
    // ------------------------------------
    case 'seven_segment': {
      return (
        <g>
          {/* Black plastic rectangular LED housing */}
          <rect x="-24" y="-32" width="48" height="64" rx="3" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
          {/* Grey face */}
          <rect x="-20" y="-28" width="40" height="56" rx="2" fill="#1e293b" />
          {/* 7 Segments (Red LED bars) */}
          <rect x="-10" y="-24" width="20" height="4" rx="1.5" fill="#ef4444" />
          <rect x="10" y="-22" width="4" height="18" rx="1.5" fill="#ef4444" />
          <rect x="10" y="-1" width="4" height="18" rx="1.5" fill="#ef4444" />
          <rect x="-10" y="15" width="20" height="4" rx="1.5" fill="#ef4444" />
          <rect x="-14" y="-1" width="4" height="18" rx="1.5" fill="#ef4444" />
          <rect x="-14" y="-22" width="4" height="18" rx="1.5" fill="#ef4444" />
          <rect x="-10" y="-4" width="20" height="4" rx="1.5" fill="#ef4444" />
          {/* Decimal dot DP */}
          <circle cx="16" cy="18" r="2.5" fill="#ef4444" />
          {/* Silver pins */}
          <line x1="-20" y1="28" x2="-20" y2="38" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="0" y1="28" x2="0" y2="38" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="20" y1="28" x2="20" y2="38" stroke="#cbd5e1" strokeWidth="2" />
        </g>
      );
    }

    // ------------------------------------
    // HC-SR04 ULTRASONIC SENSOR
    // ------------------------------------
    case 'ultrasonic_sensor': {
      return (
        <g>
          {/* Blue rectangular PCB */}
          <rect x="-42" y="-22" width="84" height="44" rx="3" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          {/* Left Aluminum Transducer (T) */}
          <circle cx="-20" cy="0" r="14" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          <circle cx="-20" cy="0" r="10" fill="#94a3b8" />
          <text x="-20" y="3" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">T</text>
          {/* Right Aluminum Transducer (R) */}
          <circle cx="20" cy="0" r="14" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          <circle cx="20" cy="0" r="10" fill="#94a3b8" />
          <text x="20" y="3" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">R</text>
          {/* Crystal */}
          <rect x="-5" y="-12" width="10" height="5" rx="1" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.5" />
          {/* 4 Pin Header at bottom */}
          <text x="0" y="16" textAnchor="middle" fill="#f8fafc" fontSize="6" fontWeight="bold">HC-SR04</text>
          <line x1="-15" y1="22" x2="-15" y2="32" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="-5" y1="22" x2="-5" y2="32" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="5" y1="22" x2="5" y2="32" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="15" y1="22" x2="15" y2="32" stroke="#e2e8f0" strokeWidth="2" />
        </g>
      );
    }

    // ------------------------------------
    // METERS & INSTRUMENTS
    // ------------------------------------
    case 'voltmeter': {
      const v = element.properties.reading ?? 0;
      return (
        <g>
          {/* Bezel frame */}
          <rect x="-35" y="-22" width="70" height="44" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Digital LCD screen */}
          <rect x="-28" y="-16" width="56" height="24" rx="2" fill="#0284c7" opacity="0.2" />
          <rect x="-28" y="-16" width="56" height="24" rx="2" fill="none" stroke="#0284c7" strokeWidth="1" />
          <text x="0" y="1" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold" fontFamily="IBM Plex Mono">
            {v.toFixed(2)}V
          </text>
          <text x="0" y="16" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">DIGITAL VOLTMETER</text>
          {/* Probes/Leads */}
          <line x1="-35" y1="0" x2="-45" y2="0" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="35" y1="0" x2="45" y2="0" stroke="#0f172a" strokeWidth="2.5" />
        </g>
      );
    }

    case 'ammeter': {
      const i = (simResult.elementCurrents?.get(element.id) ?? 0) * 1000;
      return (
        <g>
          {/* Bezel frame */}
          <rect x="-35" y="-22" width="70" height="44" rx="4" fill="#090d16" stroke="#f59e0b" strokeWidth="1.5" />
          {/* Digital LCD screen */}
          <rect x="-28" y="-16" width="56" height="24" rx="2" fill="#d97706" opacity="0.2" />
          <rect x="-28" y="-16" width="56" height="24" rx="2" fill="none" stroke="#d97706" strokeWidth="1" />
          <text x="0" y="1" textAnchor="middle" fill="#fbbf24" fontSize="13" fontWeight="bold" fontFamily="IBM Plex Mono">
            {i.toFixed(2)}mA
          </text>
          <text x="0" y="16" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">DIGITAL AMMETER</text>
          {/* Probes/Leads */}
          <line x1="-35" y1="0" x2="-45" y2="0" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="35" y1="0" x2="45" y2="0" stroke="#0f172a" strokeWidth="2.5" />
        </g>
      );
    }

    // ------------------------------------
    // PASSIVE INDUCTORS & REGULATORS
    // ------------------------------------
    case 'inductor':
    case 'choke': {
      return (
        <g>
          <line x1="-40" y1="0" x2="-22" y2="0" stroke="#94a3b8" strokeWidth="2" />
          <line x1="22" y1="0" x2="40" y2="0" stroke="#94a3b8" strokeWidth="2" />
          {/* Toroidal copper coil wrapped on black ferrite ring */}
          <circle cx="0" cy="0" r="18" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="7" fill="#090d16" />
          {/* Copper enamel wire loops */}
          {[-12, -6, 0, 6, 12].map((x, idx) => (
            <ellipse key={idx} cx={x} cy="0" rx="3" ry="16" fill="none" stroke="#ea580c" strokeWidth="2" />
          ))}
        </g>
      );
    }

    case 'regulator_7805': {
      return (
        <g>
          {/* TO-220 Package with metal heatsink tab */}
          <rect x="-18" y="-26" width="36" height="14" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="0" cy="-19" r="4" fill="#0f172a" />
          {/* Black plastic body */}
          <rect x="-18" y="-12" width="36" height="24" rx="2" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
          <text x="0" y="2" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontWeight="bold">LM7805</text>
          {/* 3 Silver legs (Input, GND, Output) */}
          <line x1="-12" y1="12" x2="-12" y2="28" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="0" y1="12" x2="0" y2="28" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="12" y1="12" x2="12" y2="28" stroke="#cbd5e1" strokeWidth="2" />
        </g>
      );
    }

    // Default mechatronics module packaging (never returns null!)
    default: {
      const meta = COMPONENT_CATALOG[element.type];
      const w = meta?.width || 60;
      const h = meta?.height || 40;
      return (
        <g>
          <rect
            x={-w / 2}
            y={-h / 2}
            width={w}
            height={h}
            rx="4"
            fill="#0f172a"
            stroke="#0284c7"
            strokeWidth="1.5"
          />
          <text x="0" y="3" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
            {meta?.nameEn || element.type}
          </text>
        </g>
      );
    }
  }
};

