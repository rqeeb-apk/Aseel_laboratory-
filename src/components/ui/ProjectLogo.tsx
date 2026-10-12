/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Official Project Logo & Emblem Component
 * شعار وهوية مختبر الميكاترونكس اليمني الرسمية (قبعة التخرج، الترس، الشريحة، والكتاب)
 */

import React from 'react';

export interface ProjectLogoProps {
  variant?: 'emblem' | 'compact' | 'horizontal' | 'full';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light';
  className?: string;
  showSlogan?: boolean;
}

export const ProjectLogo: React.FC<ProjectLogoProps> = ({
  variant = 'compact',
  size = 'md',
  theme = 'dark',
  className = '',
  showSlogan = true,
}) => {
  // Dimensions for the emblem symbol
  const emblemSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  // Text color based on theme
  const titleColor = theme === 'light' ? 'text-[#0a2540]' : 'text-white';
  const subtitleColor = theme === 'light' ? 'text-slate-600' : 'text-slate-300';

  // Standalone Vector Emblem Graphic
  const EmblemSvg = (
    <svg
      viewBox="0 0 512 512"
      className={`${emblemSizes[size]} shrink-0 transition-transform duration-300 hover:scale-105 select-none`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pl-cap" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a2540"/>
          <stop offset="100%" stopColor="#1e3a8a"/>
        </linearGradient>

        <linearGradient id="pl-book" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#0284c7"/>
        </linearGradient>

        <linearGradient id="pl-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#d97706"/>
        </linearGradient>

        <linearGradient id="pl-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#0ea5e9"/>
        </linearGradient>
      </defs>

      <g transform="translate(32, 20) scale(0.56)">
        {/* Left Circuit Tracks */}
        <path d="M 110 240 L 250 240" fill="none" stroke="url(#pl-cyan)" strokeWidth="12" strokeLinecap="round"/>
        <circle cx="110" cy="240" r="16" fill="#ffffff" stroke="url(#pl-cyan)" strokeWidth="8"/>

        <path d="M 90 300 L 235 300" fill="none" stroke="url(#pl-gold)" strokeWidth="12" strokeLinecap="round"/>
        <circle cx="90" cy="300" r="16" fill="#ffffff" stroke="url(#pl-gold)" strokeWidth="8"/>

        <path d="M 110 360 L 250 360" fill="none" stroke="url(#pl-cyan)" strokeWidth="12" strokeLinecap="round"/>
        <circle cx="110" cy="360" r="16" fill="#ffffff" stroke="url(#pl-cyan)" strokeWidth="8"/>

        {/* Right Circuit Tracks */}
        <path d="M 690 240 L 550 240" fill="none" stroke="url(#pl-cyan)" strokeWidth="12" strokeLinecap="round"/>
        <circle cx="690" cy="240" r="16" fill="#ffffff" stroke="url(#pl-cyan)" strokeWidth="8"/>

        <path d="M 710 300 L 565 300" fill="none" stroke="url(#pl-gold)" strokeWidth="12" strokeLinecap="round"/>
        <circle cx="710" cy="300" r="16" fill="#ffffff" stroke="url(#pl-gold)" strokeWidth="8"/>

        <path d="M 690 360 L 550 360" fill="none" stroke="url(#pl-cyan)" strokeWidth="12" strokeLinecap="round"/>
        <circle cx="690" cy="360" r="16" fill="#ffffff" stroke="url(#pl-cyan)" strokeWidth="8"/>

        {/* Mechanical Cogwheel / Gear */}
        <g fill="#0a2540">
          <circle cx="400" cy="300" r="140"/>
          <rect x="376" y="140" width="48" height="40" rx="6"/>
          <rect x="376" y="420" width="48" height="40" rx="6"/>
          <rect x="240" y="276" width="40" height="48" rx="6"/>
          <rect x="520" y="276" width="40" height="48" rx="6"/>
          <rect x="376" y="140" width="48" height="40" rx="6" transform="rotate(30 400 300)"/>
          <rect x="376" y="140" width="48" height="40" rx="6" transform="rotate(60 400 300)"/>
          <rect x="376" y="140" width="48" height="40" rx="6" transform="rotate(120 400 300)"/>
          <rect x="376" y="140" width="48" height="40" rx="6" transform="rotate(150 400 300)"/>
          <rect x="376" y="140" width="48" height="40" rx="6" transform="rotate(210 400 300)"/>
          <rect x="376" y="140" width="48" height="40" rx="6" transform="rotate(240 400 300)"/>
          <rect x="376" y="140" width="48" height="40" rx="6" transform="rotate(300 400 300)"/>
          <rect x="376" y="140" width="48" height="40" rx="6" transform="rotate(330 400 300)"/>
        </g>

        <circle cx="400" cy="300" r="92" fill="#ffffff"/>

        {/* Central Integrated Circuit (IC / CPU) */}
        <rect x="355" y="255" width="90" height="90" rx="14" fill="#ffffff" stroke="#0a2540" strokeWidth="12"/>
        <rect x="375" y="275" width="50" height="50" rx="8" fill="#0a2540"/>

        {/* IC Pin Nodes */}
        <circle cx="378" cy="235" r="7" fill="#0a2540"/>
        <circle cx="422" cy="235" r="7" fill="#0a2540"/>
        <circle cx="378" cy="365" r="7" fill="#0a2540"/>
        <circle cx="422" cy="365" r="7" fill="#0a2540"/>
        <circle cx="335" cy="278" r="7" fill="#0a2540"/>
        <circle cx="335" cy="322" r="7" fill="#0a2540"/>
        <circle cx="465" cy="278" r="7" fill="#0a2540"/>
        <circle cx="465" cy="322" r="7" fill="#0a2540"/>

        {/* Academic Graduation Cap on Top */}
        <path d="M 280 145 C 280 205, 520 205, 520 145 Z" fill="url(#pl-cap)"/>
        <path d="M 275 145 L 525 145" stroke="#ffffff" strokeWidth="5" strokeLinecap="round"/>
        <polygon points="400,50 690,140 400,210 110,140" fill="url(#pl-cap)"/>
        <ellipse cx="400" cy="133" rx="16" ry="10" fill="#38bdf8"/>
        {/* Tassel on Right */}
        <path d="M 400 133 Q 580 140 590 200 L 590 250" fill="none" stroke="url(#pl-cyan)" strokeWidth="8" strokeLinecap="round"/>
        <circle cx="590" cy="255" r="10" fill="url(#pl-cyan)"/>

        {/* Open Engineering Textbook Below */}
        <path d="M 90 480 C 230 410, 370 460, 400 515 C 430 460, 570 410, 710 480 C 660 520, 470 490, 400 550 C 330 490, 140 520, 90 480 Z" fill="#0a2540"/>
        <path d="M 110 440 C 240 380, 360 420, 400 480 C 440 420, 560 380, 690 440 C 630 480, 480 445, 400 510 C 320 445, 170 480, 110 440 Z" fill="url(#pl-book)"/>
      </g>
    </svg>
  );

  // Variant 1: Just the Emblem Icon
  if (variant === 'emblem') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{EmblemSvg}</div>;
  }

  // Variant 2: Compact Header Style (Ideal for Mobile & Tablet Top Bar)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 sm:gap-3 min-w-0 select-none ${className}`} dir="rtl">
        <div className="p-1 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-sm shrink-0 flex items-center justify-center">
          {EmblemSvg}
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <h1 className={`text-xs sm:text-sm font-black tracking-tight ${titleColor} truncate leading-tight`}>
            مختبر الميكاترونكس اليمني
          </h1>
          <span className={`text-[10px] sm:text-[11px] font-semibold ${subtitleColor} truncate leading-tight`}>
            Yemen Mechatronics Lab
          </span>
        </div>
      </div>
    );
  }

  // Variant 3: Horizontal Desktop Toolbar Style
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`} dir="rtl">
        <div className="p-1.5 rounded-2xl bg-slate-950/80 border border-sky-500/30 shadow-lg shadow-sky-500/10 shrink-0">
          {EmblemSvg}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className={`text-sm sm:text-base font-extrabold ${titleColor} tracking-tight truncate`}>
              مختبر الميكاترونكس اليمني
            </h1>
            <span className="hidden xl:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
              افتراضي
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden md:block">
            Yemen Mechatronics Lab • تعلَم • حاكِ • جرّب • ابتكر
          </p>
        </div>
      </div>
    );
  }

  // Variant 4: Full Hero Showcase (Ideal for Login, Welcome, and About screens)
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`} dir="rtl">
      {/* Glow Effect behind Emblem */}
      <div className="relative mb-3">
        <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full" />
        <div className="relative p-2 rounded-3xl bg-slate-900/90 border border-sky-500/30 shadow-2xl shadow-sky-500/20 backdrop-blur-sm">
          {EmblemSvg}
        </div>
      </div>

      <h1 className={`text-xl sm:text-2xl md:text-3xl font-black ${titleColor} tracking-tight`}>
        مختبر الميكاترونكس اليمني
      </h1>
      <h2 className="text-xs sm:text-sm font-bold text-sky-400/90 font-mono tracking-wider mt-1">
        YEMEN MECHATRONICS LAB
      </h2>

      {showSlogan && (
        <div className="flex items-center gap-2 sm:gap-3 mt-3">
          <div className="h-0.5 w-6 sm:w-10 bg-sky-500/40 rounded-full" />
          <div className="px-3.5 py-1 rounded-full bg-sky-600/20 border border-sky-500/40 text-sky-300 text-xs sm:text-sm font-bold shadow-sm backdrop-blur-md">
            تعلَم • حاكِ • جرّب • ابتكر
          </div>
          <div className="h-0.5 w-6 sm:w-10 bg-sky-500/40 rounded-full" />
        </div>
      )}
    </div>
  );
};
