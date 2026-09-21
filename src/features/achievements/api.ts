import { api } from '@/lib/api';
import type { ApiResponse, PaginationMeta } from '@/types/api';
import type {
  Achievement,
  AchievementType,
  EvidenceResubmitPayload,
  GetMyAchievementsParams,
  GetReviewQueueParams,
  GuestAchievementPayload,
  ReasonPayload,
  ReviewPayload,
  SubmitAchievementPayload,
} from './types';

// Re-export types for convenience
export * from './types';

/**
 * 1. Get Achievement Types & Default Points
 * GET /achievements/types
 */
export const getAchievementTypes = () =>
  api.get<ApiResponse<AchievementType[]>>('/achievements/types').then((r) => r.data.data);

/**
 * 2. Submit Achievement (Authenticated Student)
 * POST /achievements
 */
export const submitAchievement = (payload: SubmitAchievementPayload) =>
  api.post<ApiResponse<Achievement>>('/achievements', payload).then((r) => r.data.data);

/**
 * 3. Submit Achievement as Guest
 * POST /achievements/guest
 */
export const submitGuestAchievement = (payload: GuestAchievementPayload) =>
  api.post<ApiResponse<Achievement>>('/achievements/guest', payload).then((r) => r.data.data);

/**
 * 4. Get My Submitted Achievements
 * GET /achievements/my
 */
export const getMyAchievements = (params: GetMyAchievementsParams = {}) =>
  api
    .get<ApiResponse<Achievement[]>>('/achievements/my', { params })
    .then((r) => ({ achievements: r.data.data, meta: r.data.meta as PaginationMeta }));

/**
 * 5. Reviewer Queue (ACM Doc Member / Secretary)
 * GET /achievements
 */
export const getReviewQueue = (params: GetReviewQueueParams = {}) =>
  api
    .get<ApiResponse<Achievement[]>>('/achievements', { params })
    .then((r) => ({ achievements: r.data.data, meta: r.data.meta as PaginationMeta }));

/**
 * Get Single Achievement
 * GET /achievements/:id
 */
export const getAchievementById = (id: string) =>
  api.get<ApiResponse<Achievement>>(`/achievements/${id}`).then((r) => r.data.data);

export interface PublicAchievementsParams {
  semesterId?: string;
  achievementTypeId?: string;
  studentId?: string;
  page?: number;
  limit?: number;
}

export const getPublicAchievements = (params: PublicAchievementsParams = {}) =>
  api
    .get<ApiResponse<Achievement[]>>('/achievements/public', { params })
    .then((r) => ({ achievements: r.data.data, meta: r.data.meta as PaginationMeta }));

/**
 * 6. Step 3: Documentation Review (ACM Doc Member Only)
 * PATCH /achievements/:id/review
 */
export const reviewAchievement = (id: string, payload: ReviewPayload) =>
  api.patch<ApiResponse<Achievement>>(`/achievements/${id}/review`, payload).then((r) => r.data.data);

/**
 * 7. Step 3b: Student Resubmits Evidence
 * PATCH /achievements/:id/evidence
 */
export const resubmitEvidence = (id: string, payload: EvidenceResubmitPayload) =>
  api.patch<ApiResponse<Achievement>>(`/achievements/${id}/evidence`, payload).then((r) => r.data.data);

/**
 * 8. Step 4: Secretary / Co-Secretary Approval
 * POST /achievements/:id/approve
 */
export const approveAchievement = (id: string) =>
  api.post<ApiResponse<Achievement>>(`/achievements/${id}/approve`).then((r) => r.data.data);

/**
 * 9. Step 4b: Secretary / Co-Secretary Rejection
 * POST /achievements/:id/reject
 */
export const rejectAchievement = (id: string, reason: string) =>
  api.post<ApiResponse<Achievement>>(`/achievements/${id}/reject`, { reason } as ReasonPayload).then((r) => r.data.data);

/**
 * 10. Step 4c: Secretary Override (ACM Secretary Only)
 * POST /achievements/:id/override
 */
export const overrideAchievement = (id: string, reason: string) =>
  api.post<ApiResponse<Achievement>>(`/achievements/${id}/override`, { reason } as ReasonPayload).then((r) => r.data.data);
