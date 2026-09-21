import { api } from '@/lib/api';
import type { ApiResponse, Club } from '@/types/api';

export interface ClubDetail {
  club: Club;
  stats: { activeMembersCount: number; upcomingEventsCount: number };
}

export interface ClubRoleDef {
  _id: string;
  clubId: string;
  name: string;
  scope: 'CESA' | 'CLUB';
  permissions: string[];
}

export interface ClubRolesResponse {
  roles: ClubRoleDef[];
  executiveBoard: unknown[];
}

export const getClubs = () => api.get<ApiResponse<Club[]>>('/clubs').then((r) => r.data.data);

export const getClubById = (clubId: string) =>
  api.get<ApiResponse<ClubDetail>>(`/clubs/${clubId}`).then((r) => r.data.data);

export const getClubRoles = (clubId: string) =>
  api.get<ApiResponse<ClubRolesResponse>>(`/clubs/${clubId}/roles`).then((r) => r.data.data);

export const getClubExecutiveBoard = (clubId: string) =>
  api.get<ApiResponse<unknown[]>>(`/clubs/${clubId}/executive-board`).then((r) => r.data.data);

export interface UpdateClubPayload {
  name?: string;
  description?: string;
  code?: string;
  logoUrl?: string;
  bannerUrl?: string;
  isActive?: boolean;
}

export const updateClub = (clubId: string, payload: UpdateClubPayload) =>
  api.patch<ApiResponse<Club>>(`/clubs/${clubId}`, payload).then((r) => r.data.data);

export const updateClubLogo = (clubId: string, logoUrl: string) =>
  api.patch<ApiResponse<Club>>(`/clubs/${clubId}/logo`, { logoUrl }).then((r) => r.data.data);

export const removeClubLogo = (clubId: string) =>
  api.delete<ApiResponse<Club>>(`/clubs/${clubId}/logo`).then((r) => r.data.data);

export const updateClubName = (clubId: string, name: string) =>
  api.patch<ApiResponse<Club>>(`/clubs/${clubId}/name`, { name }).then((r) => r.data.data);

export const updateClubDescription = (clubId: string, description: string) =>
  api.patch<ApiResponse<Club>>(`/clubs/${clubId}/description`, { description }).then((r) => r.data.data);

export const updateClubCode = (clubId: string, code: string) =>
  api.patch<ApiResponse<Club>>(`/clubs/${clubId}/code`, { code }).then((r) => r.data.data);

export const updateClubStatus = (clubId: string, isActive: boolean) =>
  api.patch<ApiResponse<Club>>(`/clubs/${clubId}/status`, { isActive }).then((r) => r.data.data);

export const updateClubCoordinatorStatus = (clubId: string, isCoordinator: boolean) =>
  api.patch<ApiResponse<Club>>(`/clubs/${clubId}/coordinator`, { isCoordinator }).then((r) => r.data.data);
