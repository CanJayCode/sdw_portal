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

export const getClubs = () => api.get<ApiResponse<Club[]>>('/clubs').then((r) => r.data.data);

export const getClubById = (clubId: string) =>
  api.get<ApiResponse<ClubDetail>>(`/clubs/${clubId}`).then((r) => r.data.data);

export const getClubRoles = (clubId: string) =>
  api.get<ApiResponse<ClubRoleDef[]>>(`/clubs/${clubId}/roles`).then((r) => r.data.data);
