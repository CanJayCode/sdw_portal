import { api } from '@/lib/api';
import type { ApiResponse, PaginationMeta } from '@/types/api';

export interface AuditLog {
  _id: string;
  action: string;
  targetResource: string;
  performedBy: { name: string; prn: string } | string;
  reason?: string;
  createdAt: string;
}

export interface AuditLogParams {
  action?: string;
  targetResource?: string;
  clubId?: string;
  page?: number;
  limit?: number;
}

export const getAuditLogs = (params: AuditLogParams = {}) =>
  api
    .get<ApiResponse<AuditLog[]>>('/audit-logs', { params })
    .then((r) => ({ logs: r.data.data, meta: r.data.meta as PaginationMeta }));
