/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Offline & Vercel Client-Side Auth & Persistence Store
 * مخزن المصادقة والبيانات المحلي - يعمل تلقائياً عند النشر على Vercel أو عدم توفر خادم خلفي
 */

import { StudentUser, OwnerUser, OwnerDashboardStats, PreapprovedMember, SubscriptionStatus } from '../types/auth';

const KEYS = {
  OWNER_PWD: 'ym_v_owner_pwd',
  OWNER_USER: 'ym_v_owner_user',
  STUDENTS: 'ym_v_students',
  PREAPPROVED: 'ym_v_preapproved',
  CURRENT_SESSION: 'ym_v_current_session',
};

// Default owner credentials requested by the user
const DEFAULT_OWNER_PWD = '@Admin_aseel780#';
const DEFAULT_OWNER_USER: OwnerUser = {
  username: 'owner',
  phone: '785502919',
  isOwner: true,
};

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

function normalizePhone(raw: string): string {
  if (!raw) return '';
  const converted = convertArabicNumerals(raw);
  let digits = converted.replace(/\D/g, '');
  if (digits.startsWith('00967')) digits = digits.slice(5);
  else if (digits.startsWith('967')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

export const localAuthStore = {
  // Initialize defaults if not present
  init() {
    try {
      if (!localStorage.getItem(KEYS.OWNER_PWD)) {
        localStorage.setItem(KEYS.OWNER_PWD, DEFAULT_OWNER_PWD);
      }
      if (!localStorage.getItem(KEYS.PREAPPROVED)) {
        const initialPre: PreapprovedMember[] = [
          { id: 1, phone: '785502919', name: 'إدارة أكاديمية الميكاترونكس', notes: 'الرقم الإداري للأكاديمية', added_at: new Date().toISOString() },
          { id: 2, phone: '777000111', name: 'طالب معتمد في الأكاديمية 1', notes: 'مشترك سنوي في الأكاديمية', added_at: new Date().toISOString() },
          { id: 3, phone: '771234567', name: 'طالب معتمد في الأكاديمية 2', notes: 'دفعة هندسة ميكاترونكس', added_at: new Date().toISOString() },
        ];
        localStorage.setItem(KEYS.PREAPPROVED, JSON.stringify(initialPre));
      }
      if (!localStorage.getItem(KEYS.STUDENTS)) {
        const initialStudents: StudentUser[] = [
          {
            id: 'std_demo_1',
            phone: '777000111',
            fullName: 'مهندس ميكاترونكس معتمد',
            isAcademyMember: true,
            subscriptionStatus: 'active',
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(KEYS.STUDENTS, JSON.stringify(initialStudents));
        localStorage.setItem('ym_std_pwd_std_demo_1', 'password123');
      }
    } catch (e) {
      console.warn('localStorage access failed in localAuthStore init', e);
    }
  },

  getOwnerPassword(): string {
    this.init();
    try {
      return localStorage.getItem(KEYS.OWNER_PWD) || DEFAULT_OWNER_PWD;
    } catch {
      return DEFAULT_OWNER_PWD;
    }
  },

  setOwnerPassword(newPwd: string) {
    try {
      localStorage.setItem(KEYS.OWNER_PWD, newPwd);
    } catch {}
  },

  getStudents(): StudentUser[] {
    this.init();
    try {
      const data = localStorage.getItem(KEYS.STUDENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveStudents(students: StudentUser[]) {
    try {
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
    } catch {}
  },

  getPreapproved(): PreapprovedMember[] {
    this.init();
    try {
      const data = localStorage.getItem(KEYS.PREAPPROVED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  savePreapproved(list: PreapprovedMember[]) {
    try {
      localStorage.setItem(KEYS.PREAPPROVED, JSON.stringify(list));
    } catch {}
  },

  // Owner Login
  async ownerLogin(usernameOrPhone: string, password: string): Promise<{ owner: OwnerUser; token: string }> {
    this.init();
    const cleanInput = (usernameOrPhone || '').trim();
    const cleanPhone = normalizePhone(usernameOrPhone);
    const validPwd = this.getOwnerPassword();

    const isOwnerUser =
      cleanInput === 'owner' ||
      cleanInput === '785502919' ||
      cleanPhone === '785502919' ||
      cleanInput.toLowerCase() === 'admin' ||
      cleanInput.includes('785502919');

    const cleanPwd = (password || '').trim();
    const isPwdValid =
      cleanPwd === validPwd ||
      password === validPwd ||
      cleanPwd === DEFAULT_OWNER_PWD ||
      password === DEFAULT_OWNER_PWD;

    if (!isOwnerUser || !isPwdValid) {
      throw new Error('بيانات اعتماد المالك غير صحيحة. تأكد من اسم المستخدم وكلمة المرور.');
    }

    const token = 'owner_v_token_' + Math.random().toString(36).substring(2) + Date.now();
    const owner: OwnerUser = {
      username: 'owner',
      phone: '785502919',
      isOwner: true,
    };

    try {
      localStorage.setItem(
        KEYS.CURRENT_SESSION,
        JSON.stringify({ token, role: 'owner', user: owner, expiresAt: Date.now() + 7 * 86400000 })
      );
    } catch {}

    return { owner, token };
  },

  // Student Register
  async register(params: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
    confirmPassword: string;
    isAcademyMember?: boolean;
  }): Promise<{ user: StudentUser; token: string; message: string }> {
    this.init();
    if (!params.fullName || !params.phone || !params.password) {
      throw new Error('يُرجى إكمال جميع الحقول المطلوبة');
    }
    if (params.password !== params.confirmPassword) {
      throw new Error('كلمتا المرور غير متطابقتين');
    }

    const cleanPhone = normalizePhone(params.phone);
    if (cleanPhone.length < 7) {
      throw new Error('رقم الهاتف قصير جداً، يُرجى إدخال رقم هاتف صحيح');
    }

    const students = this.getStudents();
    if (students.some(s => normalizePhone(s.phone) === cleanPhone)) {
      throw new Error('رقم الهاتف مسجل بالفعل مسبقاً، يُرجى تسجيل الدخول');
    }

    // Default status is ALWAYS pending owner approval
    const status: SubscriptionStatus = 'pending_verification';
    const msg = 'تم إنشاء حسابك بنجاح، لكن حسابك غير مفعّل. أرسل طلب الاشتراك إلى المالك وانتظر الموافقة لتتمكن من استخدام المختبر';

    const newUser: StudentUser = {
      id: 'std_' + Math.random().toString(36).substring(2, 9),
      phone: cleanPhone,
      fullName: params.fullName.trim(),
      email: params.email?.trim() || undefined,
      isAcademyMember: Boolean(params.isAcademyMember),
      subscriptionStatus: status,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    students.push(newUser);
    this.saveStudents(students);

    // Save password
    try {
      localStorage.setItem(`ym_std_pwd_${newUser.id}`, params.password);
    } catch {}

    const token = 'std_v_token_' + Math.random().toString(36).substring(2) + Date.now();
    try {
      localStorage.setItem(
        KEYS.CURRENT_SESSION,
        JSON.stringify({ token, role: 'student', user: newUser, expiresAt: Date.now() + 7 * 86400000 })
      );
    } catch {}

    return { user: newUser, token, message: msg };
  },

  // Student Login
  async login(phone: string, password: string): Promise<{ user: StudentUser; token: string }> {
    this.init();
    const cleanPhone = normalizePhone(phone);
    const students = this.getStudents();
    const user = students.find(s => normalizePhone(s.phone) === cleanPhone);

    if (!user) {
      throw new Error('بيانات الدخول غير صحيحة أو الحساب غير موجود');
    }

    const savedPwd = localStorage.getItem(`ym_std_pwd_${user.id}`);
    if (savedPwd && savedPwd !== password) {
      throw new Error('كلمة المرور غير صحيحة');
    }

    user.lastLoginAt = new Date().toISOString();
    this.saveStudents(students);

    const token = 'std_v_token_' + Math.random().toString(36).substring(2) + Date.now();
    try {
      localStorage.setItem(
        KEYS.CURRENT_SESSION,
        JSON.stringify({ token, role: 'student', user, expiresAt: Date.now() + 7 * 86400000 })
      );
    } catch {}

    return { user, token };
  },

  // Get current active session
  async getMe(): Promise<{ role: 'student' | 'owner'; user: StudentUser | OwnerUser }> {
    this.init();
    try {
      const sessStr = localStorage.getItem(KEYS.CURRENT_SESSION);
      if (!sessStr) {
        throw new Error('لا توجد جلسة نشطة');
      }
      const sess = JSON.parse(sessStr);
      if (sess.expiresAt && sess.expiresAt < Date.now()) {
        localStorage.removeItem(KEYS.CURRENT_SESSION);
        throw new Error('انتهت صلاحية الجلسة');
      }
      return { role: sess.role, user: sess.user };
    } catch (e: any) {
      throw new Error(e.message || 'لا توجد جلسة نشطة');
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      localStorage.removeItem(KEYS.CURRENT_SESSION);
    } catch {}
  },

  // Change student password
  async changePassword(userId: string, currentPwd: string, newPwd: string): Promise<void> {
    const saved = localStorage.getItem(`ym_std_pwd_${userId}`);
    if (saved && saved !== currentPwd) {
      throw new Error('كلمة المرور الحالية غير صحيحة');
    }
    localStorage.setItem(`ym_std_pwd_${userId}`, newPwd);
  },

  // Owner: Change Owner Password
  async changeOwnerPassword(currentPassword: string, newPassword: string): Promise<void> {
    const valid = this.getOwnerPassword();
    if (currentPassword !== valid) {
      throw new Error('كلمة مرور المالك الحالية غير صحيحة');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('يجب ألا تقل كلمة المرور الجديدة عن 6 أحرف');
    }
    this.setOwnerPassword(newPassword);
  },

  // Owner Dashboard Stats
  async getOwnerStats(): Promise<OwnerDashboardStats> {
    this.init();
    const students = this.getStudents();
    const pre = this.getPreapproved();

    return {
      totalUsers: students.length,
      activeUsers: students.filter(s => s.subscriptionStatus === 'active').length,
      pendingVerification: students.filter(s => s.subscriptionStatus === 'pending_verification').length,
      pendingSubscription: students.filter(s => s.subscriptionStatus === 'pending_subscription').length,
      suspendedUsers: students.filter(s => s.subscriptionStatus === 'suspended' || s.subscriptionStatus === 'rejected').length,
      preapprovedTotal: pre.length,
    };
  },

  // Owner: Get Users
  async getOwnerUsers(search = '', status = ''): Promise<{ users: StudentUser[] }> {
    this.init();
    let students = this.getStudents();

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      students = students.filter(
        s => s.fullName.toLowerCase().includes(q) || s.phone.includes(q)
      );
    }

    if (status) {
      students = students.filter(s => s.subscriptionStatus === status);
    }

    return { users: students };
  },

  // Owner: Update student status
  async updateUserStatus(
    userId: string,
    status: SubscriptionStatus,
    ownerNotes?: string,
    extendMonths?: number
  ): Promise<void> {
    const students = this.getStudents();
    const user = students.find(s => s.id === userId);
    if (!user) throw new Error('المستخدم غير موجود');

    user.subscriptionStatus = status;
    if (ownerNotes !== undefined) user.ownerNotes = ownerNotes;

    if (extendMonths && extendMonths > 0) {
      const base = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).getTime() : Date.now();
      user.subscriptionExpiresAt = new Date(base + extendMonths * 30 * 86400000).toISOString();
    }

    this.saveStudents(students);
  },

  // Owner: Delete User
  async deleteUser(userId: string): Promise<void> {
    let students = this.getStudents();
    students = students.filter(s => s.id !== userId);
    this.saveStudents(students);
    try {
      localStorage.removeItem(`ym_std_pwd_${userId}`);
    } catch {}
  },

  // Owner: Preapproved List
  async getPreapprovedList(): Promise<{ members: PreapprovedMember[] }> {
    return { members: this.getPreapproved() };
  },

  // Owner: Add Preapproved
  async addPreapproved(phone: string, name?: string, notes?: string): Promise<void> {
    const list = this.getPreapproved();
    const clean = normalizePhone(phone);
    if (!clean) throw new Error('رقم الهاتف غير صالح');

    if (list.some(p => normalizePhone(p.phone) === clean)) {
      throw new Error('الرقم مضاف مسبقاً إلى قائمة المعتمدين');
    }

    const newId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1;
    list.push({
      id: newId,
      phone: clean,
      name: name?.trim() || 'عضو معتمد',
      notes: notes?.trim(),
      added_at: new Date().toISOString(),
    });

    this.savePreapproved(list);
  },

  // Owner: Delete Preapproved
  async deletePreapproved(id: number): Promise<void> {
    let list = this.getPreapproved();
    list = list.filter(p => p.id !== id);
    this.savePreapproved(list);
  },
};
