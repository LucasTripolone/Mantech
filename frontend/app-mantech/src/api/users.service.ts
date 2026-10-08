import { api } from './client';

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export function getTechnicians() {
  return api.get<UserSummary[]>('/api/users/technicians');
}
