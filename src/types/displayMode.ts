/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Display Mode Types
 */

export type DisplayMode = 'auto' | 'mobile' | 'desktop';

export interface DisplayModeConfig {
  mode: DisplayMode;
  labelAr: string;
  labelEn: string;
  icon: string;
  description: string;
}

export const DISPLAY_MODES: Record<DisplayMode, DisplayModeConfig> = {
  auto: {
    mode: 'auto',
    labelAr: 'الوضع التلقائي',
    labelEn: 'Auto Mode',
    icon: 'Sparkles',
    description: 'يتكيّف ذكياً مع نوع وحجم الشاشة المستخدمة',
  },
  mobile: {
    mode: 'mobile',
    labelAr: 'وضع الجوال 📱',
    labelEn: 'Mobile Mode',
    icon: 'Smartphone',
    description: 'واجهة لمسية متوافقة مع شاشات الهواتف والأجهزة المحمولة',
  },
  desktop: {
    mode: 'desktop',
    labelAr: 'وضع سطح المكتب 🖥️',
    labelEn: 'Desktop Mode',
    icon: 'Monitor',
    description: 'تخطيط عريض: مكتبة العناصر يميناً، مساحة العمل وسطاً، ولوحة الخصائص والقياسات يساراً',
  },
};
