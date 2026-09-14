import { api } from '@/lib/api';
import type { ApiResponse, PaginationMeta, User } from '@/types/api';

export interface LeaderboardEntry {
  rank: number;
  user: Pick<User, 'name' | 'prn' | 'branch' | 'year' | 'avatar'> & { _id: string };
  totalPoints: number;
  achievementCount: number;
  lastUpdated: string;
}

export interface Semester {
  _id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export const getLeaderboard = (params: { semesterId?: string; page?: number; limit?: number } = {}) =>
  api
    .get<ApiResponse<LeaderboardEntry[]>>('/leaderboard', { params })
    .then((r) => ({ entries: r.data.data, meta: r.data.meta as PaginationMeta }));

export const getUserLeaderboardProfile = (userId: string, semesterId?: string) =>
  api
    .get<ApiResponse<unknown>>(`/leaderboard/users/${userId}`, { params: { semesterId } })
    .then((r) => r.data.data);

export const getLeaderboardHistory = () =>
  api.get<ApiResponse<unknown[]>>('/leaderboard/history').then((r) => r.data.data);

export const getCurrentSemester = () =>
  api.get<ApiResponse<Semester>>('/semesters/current').then((r) => r.data.data);
