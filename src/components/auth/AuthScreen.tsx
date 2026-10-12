/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Splash, Login & Registration Screen
 */

import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  LogIn,
  UserPlus,
  Shield,
  Phone,
  Lock,
  User,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { StudentUser, OwnerUser } from '../../types/auth';
import { PWAInstallButton } from '../ui/PWAInstallButton';
import { ProjectLogo } from '../ui/ProjectLogo';

interface AuthScreenProps {
  onStudentSuccess: (user: StudentUser) => void;
  onOwnerSuccess: (owner: OwnerUser) => void;
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
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [isAcademyMember, setIsAcademyMember] = useState<boolean | null>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Owner modal state
  const [ownerUsername, setOwnerUsername] = useState('785502919');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState<string | null>(null);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginPhone.trim()) {
      setLoginError('يُرجى إدخال رقم الهاتف');
      return;
    }
    if (!loginPassword) {
      setLoginError('يُرجى إدخال كلمة المرور');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await authService.login(loginPhone, loginPassword);
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

    if (!regFullName.trim() || regFullName.trim().length < 3) {
      setRegError('يُرجى إدخال الاسم الكامل (ثلاثي على الأقل)');
      return;
    }
    if (!regPhone.trim() || regPhone.replace(/\D/g, '').length < 8) {
      setRegError('يُرجى إدخال رقم هاتف يمني صحيح (مثال: 785502919)');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }
    if (isAcademyMember === null) {
      setRegError('يُرجى الإجابة على سؤال: هل أنت مشترك في منصة أكاديمية الميكاترونكس اليمنية؟');
      return;
    }

    setRegLoading(true);
    try {
      const res = await authService.register({
        fullName: regFullName,
        phone: regPhone,
        password: regPassword,
        confirmPassword: regConfirmPassword,
        isAcademyMember,
      });

      // If user selected not a member, provide the WhatsApp message pre-fill helper
      if (!isAcademyMember) {
        // Compose WhatsApp url for registration
        const phoneFormatted = regPhone.trim();
        const msg = encodeURIComponent(
          `السلام عليكم، أنا الطالب: ${regFullName.trim()}، رقم الهاتف: ${phoneFormatted}.\nأود الاشتراك في منصة أكاديمية الميكاترونكس اليمنية لتفعيل حسابي في المختبر الافتراضي.`
        );
        const waUrl = `https://wa.me/967785502919?text=${msg}`;
        window.open(waUrl, '_blank');
      }

      onStudentSuccess(res.user);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 select-none relative overflow-y-auto">
      {/* Decorative tech background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Discreet Owner Icon */}
      <header className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between pb-4 border-b border-slate-800/80">
        <ProjectLogo variant="compact" size="sm" />

        <div className="flex items-center gap-2">
          <PWAInstallButton compact />

          {/* Discreet Owner Entry Button */}
          <button
            onClick={() => {
              setOwnerError(null);
              setIsOwnerModalOpen(true);
            }}
            title="دخول إدارة المختبر والمالك"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-amber-400 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition-all shadow-sm"
          >
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>بوابة الإدارة</span>
          </button>
        </div>
      </header>

      {/* Main Content Box */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto pt-4 pb-8">
        {/* Official Branding & Logo Showcase */}
        <div className="mb-6">
          <ProjectLogo variant="full" size="xl" showSlogan />
        </div>

        {/* Auth Form Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl backdrop-blur-md">
          {/* Segmented Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800/80 rounded-xl mb-5">
            <button
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
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-950/60 border border-red-800/70 rounded-xl text-xs text-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  رقم الهاتف (اليمن)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    value={loginPhone}
                    onChange={e => setLoginPhone(e.target.value)}
                    placeholder="785502919"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-left"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    dir="ltr"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-left"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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

              <div className="pt-2 text-center text-xs text-slate-400">
                <span>ليس لديك حساب بعد؟ </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setLoginError(null);
                  }}
                  className="text-cyan-400 font-semibold hover:underline"
                >
                  إنشاء حساب جديد
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regError && (
                <div className="p-3 bg-red-950/60 border border-red-800/70 rounded-xl text-xs text-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  الاسم الكامل (طالب / مهندس)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    placeholder="مثال: م. علي صالح الحكيمي"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    required
                  />
                  <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  رقم الهاتف (الواتساب للتفعيل)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="785502919"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-left"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      dir="ltr"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 pl-8 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all text-left"
                      required
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      dir="ltr"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 pl-8 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all text-left"
                      required
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                  </div>
                </div>
              </div>

              {/* MANDATORY QUESTION SECTION */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>هل أنت مشترك في منصة أكاديمية الميكاترونكس اليمنية؟</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Option 1: Yes, I am a member */}
                  <button
                    type="button"
                    onClick={() => setIsAcademyMember(true)}
                    className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                      isAcademyMember === true
                        ? 'bg-cyan-950/60 border-cyan-500 ring-1 ring-cyan-500 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                      isAcademyMember === true ? 'border-cyan-400 bg-cyan-500' : 'border-slate-600'
                    }`}>
                      {isAcademyMember === true && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">نعم، أنا مشترك</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        سيتم التحقق من بيانات عضويتك مع إدارة الأكاديمية
                      </div>
                    </div>
                  </button>

                  {/* Option 2: No, not a member yet */}
                  <button
                    type="button"
                    onClick={() => setIsAcademyMember(false)}
                    className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                      isAcademyMember === false
                        ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-500 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                      isAcademyMember === false ? 'border-amber-400 bg-amber-500' : 'border-slate-600'
                    }`}>
                      {isAcademyMember === false && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">لا، لست مشتركاً</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        يتطلب الاشتراك عبر واتساب (785502919) لتفعيل المختبر
                      </div>
                    </div>
                  </button>
                </div>

                {isAcademyMember === false && (
                  <div className="mt-2.5 p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-[11px] text-amber-200 flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span>عند إتمام التسجيل، سيتم توجيهك إلى واتساب على الرقم </span>
                      <strong className="text-amber-300 font-mono">785502919</strong>
                      <span> لطلب الاشتراك وتفعيل حسابك من قِبل المالك.</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {regLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>إنشاء الحساب ومتابعة التفعيل</span>
                  </>
                )}
              </button>

              <div className="pt-1 text-center text-xs text-slate-400">
                <span>لديك حساب بالفعل؟ </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setRegError(null);
                  }}
                  className="text-cyan-400 font-semibold hover:underline"
                >
                  تسجيل الدخول
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto pt-4 text-center text-xs text-slate-500 border-t border-slate-800/80">
        <p>جميع الحقوق محفوظة © {new Date().getFullYear()} • منصة أكاديمية الميكاترونكس اليمنية</p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          مستوحى من معايير المحاكاة الهندسية Circuit Wizard لشاشات الهواتف واللمس
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
                  onChange={e => setOwnerUsername(e.target.value)}
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
