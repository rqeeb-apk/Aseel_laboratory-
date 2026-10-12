/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Hybrid Auth & API Service (Server + Vercel / Offline Fallback)
 */

import { StudentUser, OwnerUser, OwnerDashboardStats, PreapprovedMember, SubscriptionStatus } from '../types/auth';
import { localAuthStore } from './localAuthStore';

const TOKEN_KEY = 'ym_session_token';
const ROLE_KEY = 'ym_session_role';

export const authService = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string, role: 'student' | 'owner') {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(ROLE_KEY, role);
    } catch {}
  },

  clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
    } catch {}
  },

  getStoredRole(): 'student' | 'owner' | null {
    try {
      return localStorage.getItem(ROLE_KEY) as any;
    } catch {
      return null;
    }
  },

  /**
   * Helper to perform network request with intelligent Vercel/Offline detection.
   * If Vercel serves static HTML index.html for API requests, or server is unreachable,
   * it returns a fallback flag so operations proceed locally without displaying "حدث خطأ غير متوقع".
   */
  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(endpoint, {
        ...options,
        headers,
      });

      const contentType = res.headers.get('content-type') || '';

      // If server returned HTML (Vercel SPA rewrite fallback) or 404/502
      if (!contentType.includes('application/json') || res.status === 404 || res.status === 502) {
        return { __fallback: true, status: res.status };
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // If legitimate API error (e.g. invalid password, wrong phone)
        throw new Error(data.error || 'حدث خطأ أثناء معالجة الطلب');
      }

      return data;
    } catch (err: any) {
      // If it is a known business validation error from the API, rethrow it
      if (
        err.message &&
        (err.message.includes('بيانات اعتماد') ||
          err.message.includes('كلمة المرور') ||
          err.message.includes('رقم الهاتف') ||
          err.message.includes('غير متطابقتين') ||
          err.message.includes('مسجل بالفعل'))
      ) {
        throw err;
      }

      // Otherwise network failure / server unavailable (e.g. Vercel static deployment)
      return { __fallback: true, error: err.message };
    }
  },

  // Student auth
  async register(params: {
    fullName: string;
    phone: string;
    password: string;
    confirmPassword: string;
    isAcademyMember: boolean;
  }): Promise<{ user: StudentUser; token: string; message: string }> {
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (res && res.__fallback) {
      const data = await localAuthStore.register(params);
      this.setToken(data.token, 'student');
      return data;
    }

    this.setToken(res.token, 'student');
    return res;
  },

  async login(phone: string, password: string): Promise<{ user: StudentUser; token: string }> {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });

    if (res && res.__fallback) {
      const data = await localAuthStore.login(phone, password);
      this.setToken(data.token, 'student');
      return data;
    }

    this.setToken(res.token, 'student');
    return res;
  },

  async getMe(): Promise<{ role: 'student' | 'owner'; user: StudentUser | OwnerUser }> {
    const res = await this.request('/api/auth/me');

    if (res && res.__fallback) {
      return localAuthStore.getMe();
    }

    return res;
  },

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch {}
    await localAuthStore.logout();
    this.clearToken();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res && res.__fallback) {
      const me = await localAuthStore.getMe();
      if (me.role === 'student' && 'id' in me.user) {
        await localAuthStore.changePassword((me.user as StudentUser).id, currentPassword, newPassword);
      }
    }
  },

  // Owner auth & management
  async ownerLogin(usernameOrPhone: string, password: string): Promise<{ owner: OwnerUser; token: string }> {
    const res = await this.request('/api/owner/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrPhone, password }),
    });

    if (res && res.__fallback) {
      const data = await localAuthStore.ownerLogin(usernameOrPhone, password);
      this.setToken(data.token, 'owner');
      return data;
    }

    this.setToken(res.token, 'owner');
    return res;
  },

  async getOwnerStats(): Promise<OwnerDashboardStats> {
    const res = await this.request('/api/owner/stats');
    if (res && res.__fallback) {
      return localAuthStore.getOwnerStats();
    }
    return res;
  },

  async getOwnerUsers(search = '', status = ''): Promise<{ users: StudentUser[] }> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    const res = await this.request(`/api/owner/users?${params.toString()}`);
    if (res && res.__fallback) {
      return localAuthStore.getOwnerUsers(search, status);
    }
    return res;
  },

  async updateUserStatus(
    userId: string,
    status: SubscriptionStatus,
    ownerNotes?: string,
    extendMonths?: number
  ): Promise<void> {
    const res = await this.request(`/api/owner/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ownerNotes, extendMonths }),
    });
    if (res && res.__fallback) {
      await localAuthStore.updateUserStatus(userId, status, ownerNotes, extendMonths);
    }
  },

  async deleteUser(userId: string): Promise<void> {
    const res = await this.request(`/api/owner/users/${userId}`, {
      method: 'DELETE',
    });
    if (res && res.__fallback) {
      await localAuthStore.deleteUser(userId);
    }
  },

  async getPreapproved(): Promise<{ members: PreapprovedMember[] }> {
    const res = await this.request('/api/owner/preapproved');
    if (res && res.__fallback) {
      return localAuthStore.getPreapprovedList();
    }
    return res;
  },

  async addPreapproved(phone: string, name?: string, notes?: string): Promise<void> {
    const res = await this.request('/api/owner/preapproved', {
      method: 'POST',
      body: JSON.stringify({ phone, name, notes }),
    });
    if (res && res.__fallback) {
      await localAuthStore.addPreapproved(phone, name, notes);
    }
  },

  async deletePreapproved(id: number): Promise<void> {
    const res = await this.request(`/api/owner/preapproved/${id}`, {
      method: 'DELETE',
    });
    if (res && res.__fallback) {
      await localAuthStore.deletePreapproved(id);
    }
  },

  async changeOwnerPassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await this.request('/api/owner/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (res && res.__fallback) {
      await localAuthStore.changeOwnerPassword(currentPassword, newPassword);
    }
  },
};
