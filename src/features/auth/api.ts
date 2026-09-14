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
