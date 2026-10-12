/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Owner Control Dashboard
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  UserCheck,
  Clock,
  UserX,
  Search,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Plus,
  RefreshCw,
  LogOut,
  Phone,
  Calendar,
  Lock,
  FileText,
  AlertTriangle,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import { StudentUser, OwnerUser, OwnerDashboardStats, PreapprovedMember, SubscriptionStatus } from '../../types/auth';
import { authService } from '../../services/authService';
import { ProjectLogo } from '../ui/ProjectLogo';

interface OwnerDashboardModalProps {
  owner: OwnerUser;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function OwnerDashboardModal({
  owner,
  isOpen,
  onClose,
  onLogout,
}: OwnerDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'requests' | 'all_students' | 'preapproved' | 'settings'>('requests');

  // Stats
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Students list
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Preapproved list
  const [preapproved, setPreapproved] = useState<PreapprovedMember[]>([]);
  const [newPrePhone, setNewPrePhone] = useState('');
  const [newPreName, setNewPreName] = useState('');
  const [newPreNotes, setNewPreNotes] = useState('');
  const [loadingPre, setLoadingPre] = useState(false);

  // Note editing state
  const [editingNotesUser, setEditingNotesUser] = useState<StudentUser | null>(null);
  const [noteText, setNoteText] = useState('');

  // Owner security settings
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [secSuccess, setSecSuccess] = useState<string | null>(null);
  const [secError, setSecError] = useState<string | null>(null);

  // Alert/action state
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Fetch initial data
  const loadAllData = async () => {
    setLoadingStats(true);
    setLoadingStudents(true);
    setLoadingPre(true);
    try {
      const [statsRes, studentsRes, preRes] = await Promise.all([
        authService.getOwnerStats(),
        authService.getOwnerUsers(searchQuery, statusFilter),
        authService.getPreapproved(),
      ]);
      setStats(statsRes);
      setStudents(studentsRes.users);
      setPreapproved(preRes.members);
    } catch (err: any) {
      console.error('Failed to load owner data:', err);
    } finally {
      setLoadingStats(false);
      setLoadingStudents(false);
      setLoadingPre(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, statusFilter]);

  // Debounced/instant search
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoadingStudents(true);
    try {
      const res = await authService.getOwnerUsers(searchQuery, statusFilter);
      setStudents(res.users);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Change student status
  const handleUpdateStatus = async (
    userId: string,
    status: SubscriptionStatus,
    months = 12,
    customNotes?: string
  ) => {
    try {
      await authService.updateUserStatus(userId, status, customNotes, months);
      setActionMessage(`تم تحديث حالة الطالب بنجاح (${status})`);
      setTimeout(() => setActionMessage(null), 4000);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'فشل تحديث الحالة');
    }
  };

  // Delete student
  const handleDeleteStudent = async (userId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف حساب الطالب "${name}" نهائياً من قاعدة البيانات؟`)) return;
    try {
      await authService.deleteUser(userId);
      setActionMessage('تم حذف الحساب بنجاح');
      setTimeout(() => setActionMessage(null), 4000);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'فشل حذف الحساب');
    }
  };

  // Add preapproved number
  const handleAddPreapproved = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrePhone.trim()) return;
    setLoadingPre(true);
    try {
      await authService.addPreapproved(newPrePhone, newPreName, newPreNotes);
      setNewPrePhone('');
      setNewPreName('');
      setNewPreNotes('');
      setActionMessage('تمت إضافة الرقم إلى قائمة المعتمدين وتفعيل الحساب المرتبط إن وُجد');
      setTimeout(() => setActionMessage(null), 4000);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'فشل إضافة الرقم');
    } finally {
      setLoadingPre(false);
    }
  };

  // Delete preapproved number
  const handleDeletePreapproved = async (id: number) => {
    if (!confirm('هل تريد إزالة هذا الرقم من سجل المعتمدين؟')) return;
    try {
      await authService.deletePreapproved(id);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'فشل إزالة الرقم');
    }
  };

  // Save notes
  const handleSaveNotes = async () => {
    if (!editingNotesUser) return;
    try {
      await authService.updateUserStatus(
        editingNotesUser.id,
        editingNotesUser.subscriptionStatus,
        noteText
      );
      setEditingNotesUser(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'فشل حفظ الملاحظات');
    }
  };

  // Owner Change Password
  const handleOwnerChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecSuccess(null);
    setSecError(null);
    if (!currPassword || !newPassword) {
      setSecError('يُرجى إدخال كلمة المرور الحالية والجديدة');
      return;
    }
    try {
      await authService.changeOwnerPassword(currPassword, newPassword);
      setSecSuccess('تم تغيير كلمة مرور المالك بنجاح');
      setCurrPassword('');
      setNewPassword('');
    } catch (err: any) {
      setSecError(err.message || 'فشل تغيير كلمة المرور');
    }
  };

  if (!isOpen) return null;

  const pendingRequests = students.filter(
    s => s.subscriptionStatus === 'pending_verification' || s.subscriptionStatus === 'pending_subscription'
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ProjectLogo variant="emblem" size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">لوحة تحكم مالك مختبر الميكاترونكس</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  صلاحيات الخادم الكاملة
                </span>
              </div>
              <p className="text-xs text-slate-400">
                هاتف المالك: <span className="font-mono text-amber-400">785502919</span> • إدارة وتفعيل الاشتراكات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllData}
              title="تحديث البيانات"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج المالك</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Action message banner */}
        {actionMessage && (
          <div className="bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 text-xs py-2 px-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-950/40 border-b border-slate-800/80 shrink-0">
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>إجمالي الطلاب</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {stats?.totalUsers ?? '...'}
            </div>
          </div>

          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
            <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
              <span>اشتراكات فعالة</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-300">
              {stats?.activeUsers ?? '...'}
            </div>
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl">
            <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
              <span>بانتظار التحقق</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-300">
              {stats?.pendingVerification ?? '...'}
            </div>
          </div>

          <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl">
            <div className="flex items-center justify-between text-xs text-cyan-400 mb-1">
              <span>بانتظار الاشتراك</span>
              <UserPlus className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-cyan-300">
              {stats?.pendingSubscription ?? '...'}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-800 bg-slate-950 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'requests'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>طلبات التحقق والاشتراك الجديدة</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500 text-black font-extrabold">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('all_students')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'all_students'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>جميع الطلاب المسجلين</span>
          </button>

          <button
            onClick={() => setActiveTab('preapproved')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'preapproved'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>أرقام المشتركين المعتمدين مسبقاً ({preapproved.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>أمان وحساب المالك</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: PENDING REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>الطلبات التي تحتاج موافقة وتفعيل من قِبل المالك:</span>
                <span>{pendingRequests.length} طلب</span>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/40 rounded-xl border border-slate-800">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-slate-300">لا توجد طلبات معلقة حالياً</p>
                  <p className="text-xs text-slate-500 mt-1">جميع طلبات الطلاب تم البت فيها</p>
                </div>
              ) : (
                pendingRequests.map(student => (
                  <div
                    key={student.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{student.fullName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            student.subscriptionStatus === 'pending_verification'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-blue-950 text-cyan-300 border border-blue-800'
                          }`}
                        >
                          {student.subscriptionStatus === 'pending_verification'
                            ? 'بانتظار التحقق من عضوية الأكاديمية'
                            : 'بانتظار الاشتراك'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="font-mono text-cyan-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {student.phone}
                        </span>
                        <span className="text-slate-500">
                          مسجل في: {student.createdAt ? new Date(student.createdAt).toLocaleDateString('ar-YE') : '-'}
                        </span>
                      </div>
                      {student.ownerNotes && (
                        <p className="text-xs text-amber-400/90 mt-1">ملاحظة: {student.ownerNotes}</p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleUpdateStatus(student.id, 'active', 12)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>قبول وتفعيل (سنة)</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(student.id, 'active', 1)}
                        className="px-2.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <span>تفعيل (شهر)</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(student.id, 'rejected')}
                        className="px-2.5 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-semibold"
                      >
                        <span>رفض</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingNotesUser(student);
                          setNoteText(student.ownerNotes || '');
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="إضافة ملاحظة"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: ALL STUDENTS */}
          {activeTab === 'all_students' && (
            <div className="space-y-4">
              {/* Search and filters bar */}
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم الكامل أو برقم الهاتف..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="">جميع الحالات</option>
                  <option value="active">اشتراك فعال</option>
                  <option value="pending_verification">بانتظار التحقق</option>
                  <option value="pending_subscription">بانتظار الاشتراك</option>
                  <option value="suspended">موقوف</option>
                  <option value="rejected">مرفوض</option>
                </select>

                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl"
                >
                  بحث
                </button>
              </form>

              {/* Table / Cards */}
              <div className="space-y-2.5">
                {students.map(st => (
                  <div
                    key={st.id}
                    className="p-3.5 bg-slate-950 border border-slate-800/90 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{st.fullName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.subscriptionStatus === 'active'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : st.subscriptionStatus === 'pending_verification'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : st.subscriptionStatus === 'suspended'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : 'bg-blue-950 text-cyan-300 border border-blue-800'
                          }`}
                        >
                          {st.subscriptionStatus === 'active'
                            ? 'فعال'
                            : st.subscriptionStatus === 'pending_verification'
                            ? 'بانتظار التحقق'
                            : st.subscriptionStatus === 'pending_subscription'
                            ? 'بانتظار الاشتراك'
                            : st.subscriptionStatus === 'suspended'
                            ? 'موقوف'
                            : 'مرفوض'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 mt-1">
                        <span className="font-mono text-cyan-400">{st.phone}</span>
                        {st.subscriptionExpiresAt && (
                          <span className="text-slate-400">
                            ينتهي في:{' '}
                            {new Date(st.subscriptionExpiresAt).toLocaleDateString('ar-YE')}
                          </span>
                        )}
                        {st.ownerNotes && (
                          <span className="text-amber-400/90 truncate max-w-[200px]">
                            ملاحظة: {st.ownerNotes}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {st.subscriptionStatus !== 'active' ? (
                        <button
                          onClick={() => handleUpdateStatus(st.id, 'active', 12)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                        >
                          تفعيل (سنة)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(st.id, 'suspended')}
                          className="px-2.5 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg font-medium"
                        >
                          إيقاف مؤقت
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingNotesUser(st);
                          setNoteText(st.ownerNotes || '');
                        }}
                        className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                        title="تعديل الملاحظات"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteStudent(st.id, st.fullName)}
                        className="px-2 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-800/60 rounded-lg"
                        title="حذف الحساب نهائياً"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRE-APPROVED ACADEMY MEMBERS */}
          {activeTab === 'preapproved' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-200">
                💡 <strong>التحقق التلقائي:</strong> عند إضافة أرقام المشتركين المعتمدين في الأكاديمية هنا، سيتم تفعيل حساب أي طالب يسجل بهذا الرقم تلقائياً ومباشرة دون الحاجة لتدخلك اليدوي!
              </div>

              {/* Add form */}
              <form onSubmit={handleAddPreapproved} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>إضافة رقم مشترك معتمد في الأكاديمية</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="tel"
                    dir="ltr"
                    value={newPrePhone}
                    onChange={e => setNewPrePhone(e.target.value)}
                    placeholder="رقم الهاتف (785502919)"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white text-left focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="text"
                    value={newPreName}
                    onChange={e => setNewPreName(e.target.value)}
                    placeholder="اسم الطالب (اختياري)"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={newPreNotes}
                    onChange={e => setNewPreNotes(e.target.value)}
                    placeholder="ملاحظات العضوية (مثال: دفعة 2025)"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingPre}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 disabled:opacity-50"
                >
                  {loadingPre ? 'جارٍ الإضافة...' : 'إضافة وتفعيل الحساب فوراً'}
                </button>
              </form>

              {/* Preapproved list */}
              <div className="space-y-2">
                {preapproved.map(m => (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-cyan-400 font-bold text-sm ml-3">{m.phone}</span>
                      {m.name && <span className="text-white font-medium ml-2">{m.name}</span>}
                      {m.notes && <span className="text-slate-400">({m.notes})</span>}
                    </div>
                    <button
                      onClick={() => handleDeletePreapproved(m.id)}
                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800"
                      title="حذف الرقم"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OWNER SECURITY & PASSWORD */}
          {activeTab === 'settings' && (
            <div className="max-w-md mx-auto space-y-4 pt-2">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>تغيير كلمة مرور المالك</span>
                </h4>

                {secSuccess && (
                  <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-xs text-emerald-300">
                    {secSuccess}
                  </div>
                )}
                {secError && (
                  <div className="p-3 bg-red-950 border border-red-800 rounded-xl text-xs text-red-300">
                    {secError}
                  </div>
                )}

                <form onSubmit={handleOwnerChangePassword} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      كلمة المرور الحالية
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      value={currPassword}
                      onChange={e => setCurrPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white text-left focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="6 أحرف أو أرقام على الأقل"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white text-left focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/30"
                  >
                    تحديث كلمة المرور
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal for editing notes */}
        {editingNotesUser && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-white">
                تعديل ملاحظة الطالب: {editingNotesUser.fullName}
              </h4>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="أضف ملاحظة خاصة بالإدارة حول الطالب..."
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingNotesUser(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-xs text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                >
                  حفظ الملاحظة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
