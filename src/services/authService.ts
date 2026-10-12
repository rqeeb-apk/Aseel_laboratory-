/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Auth & API Service
 */

import { StudentUser, OwnerUser, OwnerDashboardStats, PreapprovedMember, SubscriptionStatus } from '../types/auth';

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

  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'حدث خطأ غير متوقع، يُرجى المحاولة مرة أخرى');
    }

    return data;
  },

  // Student auth
  async register(params: {
    fullName: string;
    phone: string;
    password: string;
    confirmPassword: string;
    isAcademyMember: boolean;
  }): Promise<{ user: StudentUser; token: string; message: string }> {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    this.setToken(data.token, 'student');
    return data;
  },

  async login(phone: string, password: string): Promise<{ user: StudentUser; token: string }> {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
    this.setToken(data.token, 'student');
    return data;
  },

  async getMe(): Promise<{ role: 'student' | 'owner'; user: StudentUser | OwnerUser }> {
    return this.request('/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch {}
    this.clearToken();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Owner auth & management
  async ownerLogin(usernameOrPhone: string, password: string): Promise<{ owner: OwnerUser; token: string }> {
    const data = await this.request('/api/owner/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrPhone, password }),
    });
    this.setToken(data.token, 'owner');
    return data;
  },

  async getOwnerStats(): Promise<OwnerDashboardStats> {
    return this.request('/api/owner/stats');
  },

  async getOwnerUsers(search = '', status = ''): Promise<{ users: StudentUser[] }> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    return this.request(`/api/owner/users?${params.toString()}`);
  },

  async updateUserStatus(
    userId: string,
    status: SubscriptionStatus,
    ownerNotes?: string,
    extendMonths?: number
  ): Promise<void> {
    await this.request(`/api/owner/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ownerNotes, extendMonths }),
    });
  },

  async deleteUser(userId: string): Promise<void> {
    await this.request(`/api/owner/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async getPreapproved(): Promise<{ members: PreapprovedMember[] }> {
    return this.request('/api/owner/preapproved');
  },

  async addPreapproved(phone: string, name?: string, notes?: string): Promise<void> {
    await this.request('/api/owner/preapproved', {
      method: 'POST',
      body: JSON.stringify({ phone, name, notes }),
    });
  },

  async deletePreapproved(id: number): Promise<void> {
    await this.request(`/api/owner/preapproved/${id}`, {
      method: 'DELETE',
    });
  },

  async changeOwnerPassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.request('/api/owner/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};
