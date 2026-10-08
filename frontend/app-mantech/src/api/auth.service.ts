import { api } from './client';
import { LoginResponse } from './types';

export function login(email: string, password: string) {
  return api.post<LoginResponse>('/api/auth/login', { email, password });
}
