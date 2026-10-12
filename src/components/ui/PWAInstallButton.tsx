/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - In-App PWA Install Component
 */

import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showManualModal, setShowManualModal] = useState(false);

  // If already running as an installed PWA in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowManualModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 rounded-xl font-bold transition-all ${
          compact
            ? 'px-2.5 py-1.5 text-[11px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500'
            : 'px-3 py-2 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 min-h-[40px]'
        }`}
        title="تثبيت مختبر الميكاترونكس اليمني كتطبيق على الهاتف (PWA)"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>تثبيت التطبيق</span>
      </button>

      {/* Manual Android / iOS Install Guidance Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">تثبيت التطبيق على هاتفك</h3>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>خطوات التثبيت على نظام Android:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>اضغط على قائمة المتصفح (الثلاث نقاط <strong>⋮</strong> في أعلى زاوية الشاشة).</li>
                  <li>اختر <strong>«تثبيت التطبيق»</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</li>
                  <li>اضغط <strong>«تثبيت»</strong> وسيعمل التطبيق كبرنامج مستقل كامل الشاشة.</li>
                </ol>
              </div>

              {isIOS && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <div className="font-bold text-sky-400 mb-1 flex items-center gap-1.5">
                    <Share className="w-3.5 h-3.5" />
                    <span>على هواتف iPhone (Safari):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>اضغط على زر المشاركة <strong>Share</strong> في أسفل المتصفح.</li>
                    <li>اختر <strong>«إضافة إلى الصفحة الرئيسية (Add to Home Screen)»</strong>.</li>
                  </ol>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowManualModal(false)}
              className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              فهمت، العودة إلى المختبر
            </button>
          </div>
        </div>
      )}
    </>
  );
};
