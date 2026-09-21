import { api } from '@/lib/api';
import type { ApiResponse, Club, EventSummary, PaginationMeta, User, Year } from '@/types/api';

export interface WhitelistedPrn {
  _id: string;
  prn: string;
  name?: string;
  email?: string;
  branch?: string;
  year?: Year;
  isRegistered: boolean;
}

export interface WhitelistPrnPayload {
  prn: string;
  name?: string;
  email?: string;
  branch?: string;
  year?: Year;
}

export interface UpdateWhitelistPrnPayload {
  newPrn?: string;
  name?: string;
  branch?: string;
  year?: Year;
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  isRegistered?: boolean;
}

export const addWhitelistedPrn = (payload: WhitelistPrnPayload) =>
  api.post<ApiResponse<WhitelistedPrn>>('/admin/prns', payload).then((r) => r.data.data);

export const updateWhitelistedPrn = (prn: string, payload: UpdateWhitelistPrnPayload) =>
  api.patch<ApiResponse<WhitelistedPrn>>(`/admin/prns/${encodeURIComponent(prn)}`, payload).then((r) => r.data.data);

export const deleteWhitelistedPrn = (prn: string) =>
  api.delete<ApiResponse<null>>(`/admin/prns/${encodeURIComponent(prn)}`).then((r) => r.data.data);

export const bulkAddWhitelistedPrns = (prns: Array<string | WhitelistPrnPayload>) =>
  api.post<ApiResponse<unknown>>('/admin/prns/bulk', { prns }).then((r) => r.data.data);

export const bulkDeleteWhitelistedPrns = (prns: string[]) =>
  api.delete<ApiResponse<unknown>>('/admin/prns/bulk', { data: { prns } }).then((r) => r.data.data);

export const listWhitelistedPrns = (params: AdminListParams = {}) =>
  api
    .get<ApiResponse<WhitelistedPrn[]>>('/admin/prns', { params })
    .then((r) => ({ items: r.data.data, meta: r.data.meta as PaginationMeta }));

export const assignClubAdmin = (clubId: string, userId: string, roleId?: string) =>
  api.post<ApiResponse<unknown>>(`/admin/clubs/${clubId}/admins`, { userId, roleId }).then((r) => r.data.data);

export const removeClubAdmin = (clubId: string, userId: string) =>
  api.delete<ApiResponse<unknown>>(`/admin/clubs/${clubId}/admins/${userId}`).then((r) => r.data.data);

export const listClubAdmins = (clubId: string) =>
  api.get<ApiResponse<User[]>>(`/admin/clubs/${clubId}/admins`).then((r) => r.data.data);

export const createAdminRole = (payload: Record<string, unknown>) =>
  api.post<ApiResponse<unknown>>('/admin/roles', payload).then((r) => r.data.data);

export const listAdminRoles = (params: { clubId?: string; canBeAdmin?: boolean } = {}) =>
  api.get<ApiResponse<unknown[]>>('/admin/roles', { params }).then((r) => r.data.data);

export const getAdminRole = (roleId: string) =>
  api.get<ApiResponse<unknown>>(`/admin/roles/${roleId}`).then((r) => r.data.data);

export const updateAdminRole = (roleId: string, payload: Record<string, unknown>) =>
  api.patch<ApiResponse<unknown>>(`/admin/roles/${roleId}`, payload).then((r) => r.data.data);

export const deleteAdminRole = (roleId: string) =>
  api.delete<ApiResponse<null>>(`/admin/roles/${roleId}`).then((r) => r.data.data);

export const listAdminClubs = () => api.get<ApiResponse<Club[]>>('/admin/clubs').then((r) => r.data.data);

export const getAdminClub = (clubId: string) =>
  api.get<ApiResponse<Club>>(`/admin/clubs/${clubId}`).then((r) => r.data.data);

export const createAdminClub = (payload: Record<string, unknown>) =>
  api.post<ApiResponse<Club>>('/admin/clubs', payload).then((r) => r.data.data);

export const updateAdminClub = (clubId: string, payload: Record<string, unknown>) =>
  api.patch<ApiResponse<Club>>(`/admin/clubs/${clubId}`, payload).then((r) => r.data.data);

export const deactivateAdminClub = (clubId: string) =>
  api.delete<ApiResponse<Club>>(`/admin/clubs/${clubId}`).then((r) => r.data.data);

export const transferMasterAdmin = (newMasterUserId: string) =>
  api.post<ApiResponse<unknown>>('/admin/transfer-master', { newMasterUserId }).then((r) => r.data.data);

export type AdminEvent = EventSummary;