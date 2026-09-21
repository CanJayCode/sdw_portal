import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

export interface UploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

export interface UploadSignature {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export const uploadFile = (file: File, folder?: string) => {
  const formData = new FormData();
  formData.append('image', file);
  if (folder) formData.append('folder', folder);

  return api.post<ApiResponse<UploadResult>>('/upload/image', formData).then((r) => r.data.data);
};

export const getUploadSignature = (folder?: string) =>
  api
    .post<ApiResponse<UploadSignature>>('/upload/signature', folder ? { folder } : {})
    .then((r) => r.data.data);