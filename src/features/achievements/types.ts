import type { AchievementStatus, PaginationMeta } from '@/types/api';

export type { AchievementStatus, PaginationMeta };

export interface AchievementType {
  _id: string;
  code: string;
  name: string;
  category: string;
  defaultPoints: number;
  description: string;
}

export interface StudentSummary {
  _id?: string;
  name: string;
  prn: string;
  email?: string;
  branch?: string;
  year?: string;
}

export interface GuestInfo {
  name: string;
  email: string;
  prn: string;
}

export interface ReviewHistoryItem {
  reviewerId: string | { _id: string; name: string };
  action: string;
  notes: string;
  reviewedAt: string;
}

export interface ApprovalInfo {
  approvedBy?: string | { _id: string; name: string };
  approvedAt?: string;
  approverRole?: string;
  coSecretaryApproved?: boolean;
  secretaryOverridden?: boolean;
  overrideReason?: string;
  overriddenAt?: string;
}

export interface Achievement {
  _id: string;
  title: string;
  description: string;
  points: number;
  status: AchievementStatus;
  submitterType?: 'STUDENT' | 'GUEST';
  studentId?: string | StudentSummary;
  guestInfo?: GuestInfo;
  achievementTypeId:
    | AchievementType
    | { _id: string; code: string; name: string; category?: string; defaultPoints?: number }
    | string;
  evidenceUrls: string[];
  assignedDocReviewerId?: string | { _id: string; name: string };
  semesterId?: string | { _id: string; code: string; name: string };
  reviewHistory?: ReviewHistoryItem[];
  approvalInfo?: ApprovalInfo;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmitAchievementPayload {
  title: string;
  description: string;
  achievementTypeId: string;
  evidenceUrls: string[];
  semesterId?: string;
}

export interface GuestAchievementPayload {
  name: string;
  email: string;
  prn: string;
  title: string;
  description: string;
  achievementTypeId: string;
  evidenceUrls: string[];
}

export interface ReviewPayload {
  action: 'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE';
  notes: string;
}

export interface EvidenceResubmitPayload {
  evidenceUrls: string[];
  notes: string;
}

export interface ReasonPayload {
  reason: string;
}

export interface GetMyAchievementsParams {
  status?: AchievementStatus;
  page?: number;
  limit?: number;
}

export interface GetReviewQueueParams {
  status?: AchievementStatus;
  assignedToMe?: boolean;
  semesterId?: string;
  page?: number;
  limit?: number;
}
