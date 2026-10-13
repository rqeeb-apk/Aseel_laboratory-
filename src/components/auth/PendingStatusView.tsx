/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Pending Subscription Status Screen
 */

import React, { useState } from 'react';
import {
  Clock,
  MessageCircle,
  RefreshCw,
  LogOut,
  ShieldAlert,
  Phone,
  User,
  KeyRound,
  ExternalLink,
  Mail,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { StudentUser } from '../../types/auth';

interface PendingStatusViewProps {
  user: StudentUser;
  onRefreshStatus: () => Promise<void>;
  onLogout: () => void;
  onOpenChangePassword: () => void;
}

export function PendingStatusView({
  user,
  onRefreshStatus,
  onLogout,
  onOpenChangePassword,
}: PendingStatusViewProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  // Auto-poll every 4 seconds so that when the owner activates the student,
  // the student's phone immediately enters the lab automatically!
  React.useEffect(() => {
    const timer = setInterval(() => {
      onRefreshStatus().catch(() => {});
    }, 4000);
    return () => clearInterval(timer);
  }, [onRefreshStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      await onRefreshStatus();
      setRefreshMsg('تم فحص الحالة مع الخادم. إذا قام المالك بتفعيل حسابك فسيتم دخولك تلقائياً.');
    } catch {
      setRefreshMsg('تعذر الاتصال بالخادم، يُرجى التحقق من اتصال الإنترنت.');
    } finally {
      setRefreshing(false);
    }
  };

  // Build the WhatsApp message link strictly according to user specifications
  const buildWhatsAppUrl = () => {
    const cleanName = user.fullName || '';
    const cleanPhone = user.phone || '';
    const cleanEmail = user.email || '';

    let message = `السلام عليكم، أريد الاشتراك في مختبر الميكاترونكس اليمني وتفعيل حسابي.\n\nالاسم: ${cleanName}\nرقم الهاتف: ${cleanPhone}`;
    if (cleanEmail) {
      message += `\nالبريد الإلكتروني: ${cleanEmail}`;
    }
    message += `\n\nأرجو مراجعة طلبي وتفعيل حسابي. شكرًا لكم.`;

    return `https://wa.me/967785502919?text=${encodeURIComponent(message)}`;
  };

  const isSuspended = user.subscriptionStatus === 'suspended';
  const isRejected = user.subscriptionStatus === 'rejected';

  return (
    <div
      className="min-h-screen min-h-[100dvh] w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between p-3.5 sm:p-6 md:p-8 overflow-y-auto"
      dir="rtl"
    >
      {/* Top Header */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between pb-3.5 border-b border-slate-800">
        <div>
          <h1 className="text-sm sm:text-base font-extrabold text-white">مختبر الميكاترونكس اليمني</h1>
          <p className="text-[11px] sm:text-xs text-cyan-400">نظام إدارة العضويات وتفعيل الحسابات</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>تسجيل الخروج</span>
        </button>
      </header>

      {/* Main Status Container */}
      <main className="w-full max-w-lg mx-auto my-auto py-6 sm:py-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-7 shadow-2xl backdrop-blur-md text-center">
          {/* Status Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl mb-4">
            {isSuspended || isRejected ? (
              <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500 animate-pulse" />
            ) : (
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 animate-pulse" />
            )}
          </div>

          {/* Status Title Badge */}
          <div className="mb-3">
            <span
              className={`inline-block px-3.5 py-1 rounded-full border text-xs font-bold ${
                isSuspended || isRejected
                  ? 'bg-rose-950/80 text-rose-300 border-rose-600/50'
                  : 'bg-amber-950/80 text-amber-300 border-amber-600/50'
              }`}
            >
              {isSuspended
                ? 'الحساب موقوف'
                : isRejected
                ? 'طلب الاشتراك مرفوض'
                : 'الحساب بانتظار موافقة المالك'}
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-white mb-2">
            مرحباً بك، {user.fullName}
          </h2>

          {/* Explicit User Facing Requirement Notice */}
          <div className="p-3.5 sm:p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl mb-5 text-right flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-200 leading-relaxed font-semibold">
              تم إنشاء حسابك بنجاح، لكن حسابك غير مفعّل. أرسل طلب الاشتراك إلى المالك وانتظر الموافقة لتتمكن من استخدام المختبر.
            </p>
          </div>

          {/* User Details Summary Box */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl mb-5 text-right space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>الاسم:</span>
              </span>
              <span className="font-semibold text-white">{user.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>رقم الهاتف:</span>
              </span>
              <span className="font-mono text-cyan-300">{user.phone}</span>
            </div>
            {user.email && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>البريد الإلكتروني:</span>
                </span>
                <span className="font-mono text-slate-300">{user.email}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
              <span className="text-slate-400">حالة التفعيل:</span>
              <span className="font-bold text-amber-400">
                {isSuspended ? 'موقوف مؤقتاً' : isRejected ? 'مرفوض' : 'بانتظار موافقة المالك'}
              </span>
            </div>
            {user.ownerNotes && (
              <div className="pt-2 border-t border-slate-800/80 text-amber-300">
                <span className="font-semibold block mb-0.5">ملاحظات الإدارة:</span>
                <p className="text-[11px] text-slate-300">{user.ownerNotes}</p>
              </div>
            )}
          </div>

          {/* REQUIRED WHATSAPP BUTTON: "إرسال طلب الاشتراك إلى المالك عبر واتساب" */}
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 sm:py-4 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all mb-3 text-sm active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span className="truncate">إرسال طلب الاشتراك إلى المالك عبر واتساب</span>
            <ExternalLink className="w-4 h-4 opacity-80 shrink-0" />
          </a>

          {/* WhatsApp Guidance Note */}
          <p className="text-[11px] text-slate-400 mb-5 leading-normal">
            * سيتم فتح واتساب مع المالك على الرقم <span className="font-mono text-emerald-400">785502919</span> مع رسالة جاهزة تتضمن بياناتك. اضغط إرسال وسيقوم المالك بتفعيل حسابك فور مراجعة الطلب.
          </p>

          {/* Refresh & Password Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[42px] active:scale-98"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{refreshing ? 'جارٍ الفحص...' : 'فحص هل تم التفعيل من المالك'}</span>
            </button>

            <button
              onClick={onOpenChangePassword}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition-all min-h-[42px] active:scale-98"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>تغيير كلمة المرور</span>
            </button>
          </div>

          {refreshMsg && (
            <div className="p-2.5 mt-3 bg-cyan-950/40 border border-cyan-800/60 rounded-lg text-[11px] text-cyan-300">
              {refreshMsg}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl mx-auto pt-4 text-center text-xs text-slate-500 border-t border-slate-800">
        <p>مختبر الميكاترونكس اليمني • هاتف المالك والاشتراكات: 785502919</p>
      </footer>
    </div>
  );
}
