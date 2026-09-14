import { api } from '@/lib/api';
import type { ApiResponse, PaginationMeta, User } from '@/types/api';

export interface MemberSearchParams {
  name?: string;
  clubId?: string;
  page?: number;
  limit?: number;
}

export const searchMembers = (params: MemberSearchParams = {}) =>
  api
    .get<ApiResponse<User[]>>('/members/search', { params })
    .then((r) => ({ members: r.data.data, meta: r.data.meta as PaginationMeta }));

export const addMember = (clubId: string, userId: string, roleIds?: string[]) =>
  api.post<ApiResponse<unknown>>(`/clubs/${clubId}/members`, { userId, roleIds }).then((r) => r.data.data);

export const modifyMemberRoles = (clubId: string, userId: string, roleIds: string[]) =>
  api
    .patch<ApiResponse<unknown>>(`/clubs/${clubId}/members/${userId}`, { roleIds })
    .then((r) => r.data.data);

export const removeMember = (clubId: string, userId: string, reason: string) =>
  api
    .delete<ApiResponse<unknown>>(`/clubs/${clubId}/members/${userId}`, { data: { reason } })
    .then((r) => r.data.data);

export const selfLeaveClub = (clubId: string) =>
  api.delete<ApiResponse<unknown>>(`/users/me/clubs/${clubId}`).then((r) => r.data.data);
