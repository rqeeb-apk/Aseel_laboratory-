/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Physical Workbench Backgrounds Configuration
 */

export type WorkbenchBackgroundId = 'esd_green' | 'tech_blue' | 'dark_slate' | 'grid';

export interface WorkbenchBackgroundOption {
  id: WorkbenchBackgroundId;
  nameAr: string;
  nameEn: string;
  imageSrc?: string;
  defaultOpacity: number;
  descriptionAr: string;
}

export const WORKBENCH_BACKGROUNDS: WorkbenchBackgroundOption[] = [
  {
    id: 'esd_green',
    nameAr: 'طاولة فحص إلكترونيات (ESD خضراء)',
    nameEn: 'ESD Green Electronics Mat',
    imageSrc: '/src/assets/images/workbench_esd_green_1791813453578.jpg',
    defaultOpacity: 0.7,
    descriptionAr: 'طاولة عمل حقيقية مع مفرش تفريغ شحنات أخضر ومعدات قياس وأدوات دقيقة',
  },
  {
    id: 'tech_blue',
    nameAr: 'طاولة ميكاترونكس (ESD زرقاء)',
    nameEn: 'Tech Blue Mechatronics Bench',
    imageSrc: '/src/assets/images/workbench_tech_blue_1791813470666.jpg',
    defaultOpacity: 0.7,
    descriptionAr: 'طاولة مختبر حديثة مع مفرش أزرق وصناديق مكونات وأدوات لحام وتحكم',
  },
  {
    id: 'dark_slate',
    nameAr: 'طاولة روبوتات صناعية داكنة',
    nameEn: 'Dark Slate Robotics Workbench',
    imageSrc: '/src/assets/images/workbench_dark_slate_1791813485576.jpg',
    defaultOpacity: 0.7,
    descriptionAr: 'طاولة أبحاث وتطوير صناعية داكنة مع محركات خطوية ومعدات راسم إشارة',
  },
  {
    id: 'grid',
    nameAr: 'شبكة هندسية رقمية (مخطط)',
    nameEn: 'Engineering Blueprint Grid',
    defaultOpacity: 1.0,
    descriptionAr: 'شبكة نقطية هندسية كلاسيكية عالية التباين للرسم والمحاكاة التجريدية',
  },
];
