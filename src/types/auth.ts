/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Auth & Subscription Types
 */

export type SubscriptionStatus =
  | 'active' // اشتراك فعال
  | 'pending_verification' // بانتظار التحقق من الاشتراك في الأكاديمية
  | 'pending_subscription' // بانتظار الاشتراك في الأكاديمية
  | 'suspended' // تم إيقاف الحساب
  | 'rejected'; // تم رفض الطلب

export interface StudentUser {
  id: string;
  phone: string;
  fullName: string;
  email?: string;
  isAcademyMember: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: string | null;
  ownerNotes?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface OwnerUser {
  username: string;
  phone: string;
  isOwner: true;
}

export interface OwnerDashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingVerification: number;
  pendingSubscription: number;
  suspendedUsers: number;
  preapprovedTotal: number;
}

export interface PreapprovedMember {
  id: number;
  phone: string;
  name?: string;
  notes?: string;
  added_at: string;
}
