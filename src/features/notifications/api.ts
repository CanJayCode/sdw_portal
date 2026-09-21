import { api } from '@/lib/api';
import type { ApiResponse, PaginationMeta } from '@/types/api';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'NONE';

export const listNotifications = (params: { unreadOnly?: boolean; page?: number; limit?: number } = {}) =>
  api
    .get<ApiResponse<Notification[]>>('/notifications', { params })
    .then((r) => ({
      notifications: r.data.data,
      meta: r.data.meta as PaginationMeta & { unreadCount: number },
    }));

export const markAsRead = (id: string) =>
  api.patch<ApiResponse<unknown>>(`/notifications/${id}/read`).then((r) => r.data.data);

export const markAllAsRead = () =>
  api.patch<ApiResponse<unknown>>('/notifications/read-all').then((r) => r.data.data);

export const getNotificationPreferences = () =>
  api
    .get<ApiResponse<Record<string, NotificationChannel>>>('/users/me/notification-preferences')
    .then((r) => r.data.data);

export const updateNotificationPreferences = (preferences: Record<string, NotificationChannel>) =>
  api
    .patch<ApiResponse<unknown>>('/users/me/notification-preferences', { preferences })
    .then((r) => r.data.data);
