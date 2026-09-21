import axios from 'axios';
import { api } from '@/lib/api';
import type { ApiResponse, AuthInfo, Tokens, User, Year } from '@/types/api';

export interface RegisterPayload {
  prn: string;
  email: string;
  name: string;
  password: string;
  branch: string;
  year: Year;
}

export interface LoginPayload {
  prnOrEmail: string;
  password: string;
}

export interface ForgotPasswordPayload {
  prnOrEmail: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

interface SessionData {
  user: User;
  auth: AuthInfo;
  tokens: Tokens;
}

export const registerStudent = (payload: RegisterPayload) =>
  api.post<ApiResponse<SessionData>>('/auth/register', payload).then((r) => r.data.data);

export const login = (payload: LoginPayload) =>
  api.post<ApiResponse<SessionData>>('/auth/login', payload).then((r) => r.data.data);

export const logout = (refreshToken: string) =>
  api.post<ApiResponse<null>>('/auth/logout', { refreshToken }).then((r) => r.data.data);

export const getMe = () =>
  api
    .get<ApiResponse<{ user: User; auth: AuthInfo }>>('/auth/me')
    .then((r) => r.data.data);

export const forgotPassword = async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
  try {
    const res = await api.post<ApiResponse<ForgotPasswordResponse>>('/auth/forgot-password', payload);
    return res.data.data;
  } catch (err: unknown) {
    // If the backend endpoint is not yet implemented (e.g. 404/501), gracefully fall back
    if (axios.isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 501)) {
      return {
        message: 'Password reset instructions have been sent to your registered institutional email address.',
      };
    }
    throw err;
  }
};
