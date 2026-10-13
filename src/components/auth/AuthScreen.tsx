/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Splash, Login & Registration Screen
 */

import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  Shield,
  Phone,
  Lock,
  User,
  Mail,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  MessageCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { StudentUser, OwnerUser } from '../../types/auth';
import { PWAInstallButton } from '../ui/PWAInstallButton';
import { ProjectLogo } from '../ui/ProjectLogo';

interface AuthScreenProps {
  onStudentSuccess: (user: StudentUser) => void;
  onOwnerSuccess: (owner: OwnerUser) => void;
}

// Convert Eastern Arabic / Persian numerals to standard ASCII 0-9
function convertArabicNumerals(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/[٠۰]/g, '0')
    .replace(/[١۱]/g, '1')
    .replace(/[٢۲]/g, '2')
    .replace(/[٣۳]/g, '3')
    .replace(/[٤۴]/g, '4')
    .replace(/[٥۵]/g, '5')
    .replace(/[٦۶]/g, '6')
    .replace(/[٧۷]/g, '7')
    .replace(/[٨۸]/g, '8')
    .replace(/[٩۹]/g, '9');
}

export function AuthScreen({ onStudentSuccess, onOwnerSuccess }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [isAcademyMember, setIsAcademyMember] = useState<boolean>(true);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Registration successful state
  const [registeredUser, setRegisteredUser] = useState<StudentUser | null>(null);

  // Password visibility toggles for mobile convenience
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Owner modal state
  const [ownerUsername, setOwnerUsername] = useState('785502919');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState<string | null>(null);

  // Compose standard WhatsApp URL with requested message template
  const buildWhatsAppUrl = (name: string, phone: string, email?: string) => {
    const cleanName = name.trim() || '[اسم المستخدم]';
    const cleanPhone = phone.trim() || '[رقم الهاتف المسجل]';
    const cleanEmail = email?.trim();

    let message = `السلام عليكم، أريد الاشتراك في مختبر الميكاترونكس اليمني وتفعيل حسابي.\n\nالاسم: ${cleanName}\nرقم الهاتف: ${cleanPhone}`;
    if (cleanEmail) {
      message += `\nالبريد الإلكتروني: ${cleanEmail}`;
    }
    message += `\n\nأرجو مراجعة طلبي وتفعيل حسابي. شكرًا لكم.`;

    return `https://wa.me/967785502919?text=${encodeURIComponent(message)}`;
  };

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanPhone = convertArabicNumerals(loginPhone).trim();
    if (!cleanPhone) {
      setLoginError('يُرجى إدخال رقم الهاتف');
      return;
    }
    if (!loginPassword) {
      setLoginError('يُرجى إدخال كلمة المرور');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await authService.login(cleanPhone, loginPassword);
      onStudentSuccess(res.user);
    } catch (err: any) {
      setLoginError(err.message || 'فشل تسجيل الدخول، تحقق من صحة البيانات');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const cleanName = regFullName.trim();
    if (!cleanName || cleanName.length < 2) {
      setRegError('يُرجى إدخال الاسم الكامل للطالب أو المهندس');
      return;
    }

    const cleanPhone = convertArabicNumerals(regPhone).trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 7) {
      setRegError('يُرجى إدخال رقم هاتف صحيح (مثال: 785502919)');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setRegError('يجب أن تتكون كلمة المرور من 6 خانات على الأقل');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    setRegLoading(true);
    try {
      const res = await authService.register({
        fullName: cleanName,
        phone: cleanPhone,
        email: regEmail.trim() || undefined,
        password: regPassword,
        confirmPassword: regConfirmPassword,
        isAcademyMember,
      });

      // Show the explicit post-registration confirmation view with WhatsApp button
      setRegisteredUser(res.user);
    } catch (err: any) {
      setRegError(err.message || 'فشل إنشاء الحساب، يُرجى المحاولة مرة أخرى');
    } finally {
      setRegLoading(false);
    }
  };

  // Handle Owner Login
  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerError(null);
    if (!ownerUsername || !ownerPassword) {
      setOwnerError('يُرجى إدخال اسم المستخدم وكلمة المرور للمالك');
      return;
    }

    setOwnerLoading(true);
    try {
      const res = await authService.ownerLogin(ownerUsername, ownerPassword);
      setIsOwnerModalOpen(false);
      onOwnerSuccess(res.owner);
    } catch (err: any) {
      setOwnerError(err.message || 'بيانات اعتماد المالك غير صحيحة');
    } finally {
      setOwnerLoading(false);
    }
  };



  return (
    <div
      className="w-full min-h-screen min-h-[100dvh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden relative"
      dir="rtl"
    >
      {/* Decorative tech background glows */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="fixed bottom-10 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Main Scrollable Box with ample bottom clearance for mobile keyboards */}
      <main className="relative z-10 w-full max-w-md mx-auto flex-1 flex flex-col justify-start px-3 py-4 sm:px-6 sm:py-6 pb-36 sm:pb-20">
        {/* Top Header */}
        <header className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
          <ProjectLogo variant="compact" size="xs" className="sm:hidden" />
          <ProjectLogo variant="compact" size="sm" className="hidden sm:flex" />

          <div className="flex items-center gap-1.5 sm:gap-2">
            <PWAInstallButton compact />

            {/* Discreet Owner Entry Button */}
            <button
              onClick={() => {
                setOwnerError(null);
                setIsOwnerModalOpen(true);
              }}
              title="دخول إدارة المختبر والمالك"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-amber-400 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition-all shadow-sm active:scale-95"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xs:inline">بوابة الإدارة</span>
              <span className="xs:hidden">الإدارة</span>
            </button>
          </div>
        </header>

        {/* Title Banner */}
        <div className="text-center mb-3">
          <h2 className="text-base sm:text-lg font-black text-white">
            {registeredUser
              ? 'تأكيد إنشاء الحساب'
              : activeTab === 'register'
              ? 'إنشاء حساب جديد'
              : 'تسجيل الدخول للمختبر'}
          </h2>
          <p className="text-xs text-sky-400/90 font-medium mt-0.5">
            مختبر الميكاترونكس اليمني الافتراضي
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
          {/* POST-REGISTRATION SUCCESS SCREEN */}
          {registeredUser ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="w-9 h-9 text-emerald-400 animate-bounce" />
              </div>

              {/* Exact user requirement notice */}
              <div className="p-4 bg-amber-950/50 border border-amber-500/40 rounded-xl text-right">
                <p className="text-xs sm:text-sm text-amber-200 font-bold leading-relaxed">
                  تم إنشاء حسابك بنجاح، لكن حسابك غير مفعّل. أرسل طلب الاشتراك إلى المالك وانتظر الموافقة لتتمكن من استخدام المختبر.
                </p>
              </div>

              {/* Account summary */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-right text-xs space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">الاسم:</span>
                  <span className="font-semibold text-white">{registeredUser.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">رقم الهاتف:</span>
                  <span className="font-mono text-cyan-300">{registeredUser.phone}</span>
                </div>
                {registeredUser.email && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">البريد الإلكتروني:</span>
                    <span className="font-mono text-slate-300">{registeredUser.email}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-800 text-amber-400 font-bold">
                  <span>الحالة:</span>
                  <span>⏳ بانتظار موافقة وتفعيل المالك</span>
                </div>
              </div>

              {/* Primary Action: Send Request to Owner via WhatsApp */}
              <a
                href={buildWhatsAppUrl(registeredUser.fullName, registeredUser.phone, registeredUser.email)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
              >
                <MessageCircle className="w-5 h-5 text-white" />
                <span>إرسال طلب الاشتراك إلى المالك عبر واتساب</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              <p className="text-[11px] text-slate-400 leading-normal">
                الرقم المعتمد لإدارة المختبر: <strong className="font-mono text-emerald-400">785502919</strong>
              </p>

              {/* Secondary Navigation */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onStudentSuccess(registeredUser)}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-all"
                >
                  متابعة إلى حسابي وفحص حالة التفعيل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegisteredUser(null);
                    setActiveTab('login');
                  }}
                  className="text-xs text-cyan-400 hover:underline py-1"
                >
                  العودة لصفحة تسجيل الدخول
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Segmented Tab Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800/80 rounded-xl mb-4 sm:mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setLoginError(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'login'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setRegError(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'register'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إنشاء حساب جديد</span>
                </button>
              </div>

              {/* TAB 1: LOGIN FORM */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5 sm:space-y-4">
                  {loginError && (
                    <div className="p-3 bg-red-950/60 border border-red-800/70 rounded-xl text-xs text-red-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      رقم الهاتف (الواتساب المسجل)
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        dir="ltr"
                        autoComplete="tel"
                        value={loginPhone}
                        onChange={e => setLoginPhone(convertArabicNumerals(e.target.value))}
                        placeholder="785502919 أو 771234567"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 sm:py-3 pl-10 text-base sm:text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-left"
                        required
                      />
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">كلمة المرور</label>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        dir="ltr"
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 sm:py-3 pl-10 pr-10 text-base sm:text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-left"
                        required
                      />
                      <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(prev => !prev)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg"
                        title={showLoginPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[46px] active:scale-[0.98] text-sm"
                  >
                    {loginLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>تسجيل الدخول للمختبر</span>
                      </>
                    )}
                  </button>



                  <div className="pt-1 text-center text-xs text-slate-400">
                    <span>ليس لديك حساب بعد؟ </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('register');
                        setLoginError(null);
                      }}
                      className="text-cyan-400 font-semibold hover:underline py-1"
                    >
                      إنشاء حساب جديد
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: REGISTER FORM */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3 sm:space-y-3.5">
                  {regError && (
                    <div className="p-3 bg-red-950/60 border border-red-800/70 rounded-xl text-xs text-red-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      الاسم الكامل (طالب / مهندس) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        autoComplete="name"
                        value={regFullName}
                        onChange={e => setRegFullName(e.target.value)}
                        placeholder="مثال: م. علي صالح الحكيمي"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 sm:py-3 pr-10 text-base sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        required
                      />
                      <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Phone Input with Arabic numerals auto-conversion */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      رقم الهاتف (الواتساب للتفعيل) *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        dir="ltr"
                        autoComplete="tel"
                        value={regPhone}
                        onChange={e => setRegPhone(convertArabicNumerals(e.target.value))}
                        placeholder="785502919 أو 771234567"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 sm:py-3 pl-10 text-base sm:text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-left"
                        required
                      />
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Optional Email Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      البريد الإلكتروني <span className="text-slate-500 font-normal">(اختياري)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        dir="ltr"
                        autoComplete="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="example@domain.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 sm:py-3 pl-10 text-base sm:text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-left"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Password Fields with Toggle - Responsive Stack */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        كلمة المرور *
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          dir="ltr"
                          autoComplete="new-password"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 pl-9 pr-9 text-base sm:text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all text-left"
                          required
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(prev => !prev)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1.5"
                          title={showRegPassword ? 'إخفاء' : 'إظهار'}
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        تأكيد كلمة المرور *
                      </label>
                      <div className="relative">
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          dir="ltr"
                          autoComplete="new-password"
                          value={regConfirmPassword}
                          onChange={e => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 pl-9 pr-9 text-base sm:text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all text-left"
                          required
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(prev => !prev)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1.5"
                          title={showRegConfirmPassword ? 'إخفاء' : 'إظهار'}
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Direct Action Button (Visible right in the registration page) */}
                  <div className="pt-2">
                    <a
                      href={buildWhatsAppUrl(regFullName, regPhone, regEmail)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-3 bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-600/60 text-emerald-300 hover:text-emerald-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-xs active:scale-[0.98]"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">إرسال طلب الاشتراك إلى المالك عبر واتساب</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-75 shrink-0" />
                    </a>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[46px] active:scale-[0.98] text-sm"
                  >
                    {regLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>إنشاء حساب جديد</span>
                      </>
                    )}
                  </button>

                  <div className="pt-1 pb-2 text-center text-xs text-slate-400">
                    <span>لديك حساب بالفعل؟ </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setRegError(null);
                      }}
                      className="text-cyan-400 font-semibold hover:underline py-1"
                    >
                      تسجيل الدخول
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto pt-4 pb-6 text-center text-xs text-slate-500 border-t border-slate-800/80 px-4">
        <p>جميع الحقوق محفوظة © {new Date().getFullYear()} • مختبر الميكاترونكس اليمني</p>
        <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
          هاتف المالك والتفعيل المباشر: 785502919
        </p>
      </footer>

      {/* OWNER LOGIN MODAL */}
      {isOwnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">دخول إدارة المختبر (المالك)</h3>
                <p className="text-xs text-amber-400/80">لوحة المراقبة والتحكم بالاشتراكات</p>
              </div>
            </div>

            {ownerError && (
              <div className="p-3 mb-4 bg-red-950/60 border border-red-800/70 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{ownerError}</span>
              </div>
            )}

            <form onSubmit={handleOwnerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم المستخدم أو هاتف المالك
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={ownerUsername}
                  onChange={e => setOwnerUsername(convertArabicNumerals(e.target.value))}
                  placeholder="785502919 أو owner"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white text-left focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  كلمة مرور المالك
                </label>
                <input
                  type="password"
                  dir="ltr"
                  value={ownerPassword}
                  onChange={e => setOwnerPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white text-left focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOwnerModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={ownerLoading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {ownerLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-3.5 h-3.5" />
                      <span>دخول المالك</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
