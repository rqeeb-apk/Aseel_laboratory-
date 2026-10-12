/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Pending Subscription & Verification Status Screen
 */

import React, { useState } from 'react';
import {
  Clock,
  MessageCircle,
  RefreshCw,
  LogOut,
  ShieldAlert,
  CheckCircle2,
  Phone,
  User,
  KeyRound,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { StudentUser } from '../../types/auth';
import { authService } from '../../services/authService';

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

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      await onRefreshStatus();
      setRefreshMsg('تم فحص الحالة مع الخادم.');
    } catch {
      setRefreshMsg('تعذر الاتصال بالخادم، يُرجى المحاولة لاحقاً.');
    } finally {
      setRefreshing(false);
    }
  };

  // Compose WhatsApp message link to 785502919
  const handleOpenWhatsApp = () => {
    const isVerification = user.subscriptionStatus === 'pending_verification';
    const message = isVerification
      ? `السلام عليكم، أنا الطالب: ${user.fullName}، رقم هاتفي: ${user.phone}.\nأرجو التحقق من اشتراكي في أكاديمية الميكاترونكس اليمنية وتفعيل حسابي في مختبر الميكاترونكس اليمني الافتراضي.`
      : `السلام عليكم، أنا الطالب: ${user.fullName}، رقم هاتفي: ${user.phone}.\nأود طلب الاشتراك في منصة أكاديمية الميكاترونكس اليمنية لتفعيل حسابي في مختبر الميكاترونكس اليمني الافتراضي.`;

    const waUrl = `https://wa.me/967785502919?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const getStatusBadge = () => {
    switch (user.subscriptionStatus) {
      case 'pending_verification':
        return {
          title: 'بانتظار التحقق من الاشتراك',
          badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-600/50',
          icon: <Clock className="w-8 h-8 text-amber-400 animate-pulse" />,
          description:
            'تم تسجيل رغبتك بالدخول كعضو في أكاديمية الميكاترونكس اليمنية. يجري حالياً التحقق من بياناتك واعتمادها من قِبل إدارة المنصة لمنحك الصلاحية الكاملة لدخول المختبر.',
          callToAction: 'طلب استعجال التحقق عبر واتساب',
        };
      case 'pending_subscription':
        return {
          title: 'بانتظار الاشتراك في الأكاديمية',
          badgeColor: 'bg-blue-950/80 text-cyan-300 border-cyan-600/50',
          icon: <MessageCircle className="w-8 h-8 text-cyan-400" />,
          description:
            'للوصول إلى المختبر الافتراضي وبناء الدوائر الإلكترونية، يلزمك الاشتراك في منصة أكاديمية الميكاترونكس اليمنية. يمكنك طلب الاشتراك السريع عبر التواصل المباشر مع إدارة الأكاديمية عبر واتساب.',
          callToAction: 'طلب الاشتراك عبر واتساب (785502919)',
        };
      case 'suspended':
        return {
          title: 'تم إيقاف الحساب مؤقتاً',
          badgeColor: 'bg-red-950/80 text-red-300 border-red-600/50',
          icon: <ShieldAlert className="w-8 h-8 text-red-400" />,
          description:
            'تم تعليق هذا الحساب من قِبل إدارة الأكاديمية. يُرجى مراجعة الدعم الفني أو المالك لمعرفة سبب الإيقاف وتجديد الاشتراك.',
          callToAction: 'التواصل مع إدارة الأكاديمية عبر واتساب',
        };
      case 'rejected':
        return {
          title: 'تم رفض طلب العضوية',
          badgeColor: 'bg-red-950/80 text-red-300 border-red-600/50',
          icon: <ShieldAlert className="w-8 h-8 text-red-400" />,
          description:
            'تعذر التحقق من بيانات عضويتك في الأكاديمية. يمكنك التواصل المباشر عبر واتساب لتصحيح البيانات أو الاشتراك.',
          callToAction: 'طلب مساعدة عبر واتساب (785502919)',
        };
      default:
        return {
          title: 'حالة الحساب غير نشطة',
          badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: <Clock className="w-8 h-8 text-slate-400" />,
          description: 'حسابك بانتظار الاعتماد والموافقة من قِبل إدارة المختبر.',
          callToAction: 'طلب المساعدة عبر واتساب',
        };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 select-none">
      {/* Header */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-base font-bold text-white">مختبر الميكاترونكس اليمني</h1>
          <p className="text-xs text-cyan-400">تعلّم • حاكِ • جرّب • ابتكر</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>تسجيل الخروج</span>
        </button>
      </header>

      {/* Main Status Container */}
      <main className="w-full max-w-lg mx-auto my-auto py-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md text-center">
          {/* Status Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl mb-4">
            {statusInfo.icon}
          </div>

          {/* Status Title Badge */}
          <div className="mb-3">
            <span
              className={`inline-block px-4 py-1.5 rounded-full border text-xs font-bold ${statusInfo.badgeColor}`}
            >
              {statusInfo.title}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2">
            مرحباً بك، {user.fullName}
          </h2>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
            {statusInfo.description}
          </p>

          {/* User Details Box */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl mb-6 text-right space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">الاسم المسجل:</span>
              <span className="font-semibold text-white">{user.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">رقم الهاتف:</span>
              <span className="font-mono text-cyan-300">{user.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">عضوية الأكاديمية:</span>
              <span className={user.isAcademyMember ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                {user.isAcademyMember ? 'مشترك (قيد التدقيق)' : 'غير مشترك'}
              </span>
            </div>
            {user.ownerNotes && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-amber-400 font-semibold block mb-0.5">ملاحظات الإدارة:</span>
                <span className="text-slate-300">{user.ownerNotes}</span>
              </div>
            )}
          </div>

          {/* Action 1: WhatsApp Button */}
          <button
            onClick={handleOpenWhatsApp}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all mb-3 text-sm"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{statusInfo.callToAction}</span>
            <ExternalLink className="w-4 h-4 opacity-75" />
          </button>

          {/* Note regarding WhatsApp manual send as required */}
          <p className="text-[11px] text-slate-400 mb-4">
            * تنبيه: سيتم فتح تطبيق واتساب مع الرقم <span className="font-mono text-emerald-400">785502919</span>، ويجب عليك الضغط على زر "إرسال" داخل واتساب لتأكيد طلبك.
          </p>

          {/* Action 2: Refresh Status */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{refreshing ? 'جارٍ الفحص...' : 'فحص هل تم التفعيل'}</span>
            </button>

            <button
              onClick={onOpenChangePassword}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition-all"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>تغيير كلمة المرور</span>
            </button>
          </div>

          {refreshMsg && (
            <p className="text-[11px] text-cyan-400 mt-3">{refreshMsg}</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto pt-4 text-center text-xs text-slate-500 border-t border-slate-800">
        <p>أكاديمية الميكاترونكس اليمنية • هاتف الإدارة والاشتراكات: 785502919</p>
      </footer>
    </div>
  );
}
