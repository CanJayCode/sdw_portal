import { api } from '@/lib/api';
import type { AchievementStatus, ApiResponse, PaginationMeta } from '@/types/api';

export interface AchievementType {
  _id: string;
  code: string;
  name: string;
  category: string;
  defaultPoints: number;
  description: string;
}

export interface Achievement {
  _id: string;
  title: string;
  description: string;
  points: number;
  status: AchievementStatus;
  evidenceUrls: string[];
  achievementTypeId: { code: string; name: string } | string;
  assignedDocReviewerId?: string;
}

export interface SubmitAchievementPayload {
  title: string;
  description: string;
  achievementTypeId: string;
  evidenceUrls: string[];
  semesterId?: string;
}

export interface ReviewPayload {
  action: 'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE';
  notes: string;
}

export const getAchievementTypes = () =>
  api.get<ApiResponse<AchievementType[]>>('/achievements/types').then((r) => r.data.data);

export const submitAchievement = (payload: SubmitAchievementPayload) =>
  api.post<ApiResponse<Achievement>>('/achievements', payload).then((r) => r.data.data);

export const getMyAchievements = (params: { status?: AchievementStatus; page?: number; limit?: number } = {}) =>
  api
    .get<ApiResponse<Achievement[]>>('/achievements/my', { params })
    .then((r) => ({ achievements: r.data.data, meta: r.data.meta as PaginationMeta }));

export const getReviewQueue = (
  params: { status?: AchievementStatus; assignedToMe?: boolean; semesterId?: string; page?: number; limit?: number } = {}
) =>
  api
    .get<ApiResponse<Achievement[]>>('/achievements', { params })
    .then((r) => ({ achievements: r.data.data, meta: r.data.meta as PaginationMeta }));

export const reviewAchievement = (id: string, payload: ReviewPayload) =>
  api.patch<ApiResponse<Achievement>>(`/achievements/${id}/review`, payload).then((r) => r.data.data);

export const resubmitEvidence = (id: string, payload: { evidenceUrls: string[]; notes: string }) =>
  api.patch<ApiResponse<Achievement>>(`/achievements/${id}/evidence`, payload).then((r) => r.data.data);

export const approveAchievement = (id: string) =>
  api.post<ApiResponse<Achievement>>(`/achievements/${id}/approve`).then((r) => r.data.data);

export const rejectAchievement = (id: string, reason: string) =>
  api.post<ApiResponse<Achievement>>(`/achievements/${id}/reject`, { reason }).then((r) => r.data.data);

export const overrideAchievement = (id: string, reason: string) =>
  api.post<ApiResponse<Achievement>>(`/achievements/${id}/override`, { reason }).then((r) => r.data.data);
