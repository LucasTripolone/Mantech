import { api } from './client';
import { CreatePreventivePlanInput, PreventivePlan } from './types';

export function listPlans(activeOnly = false) {
  return api.get<PreventivePlan[]>(`/api/preventive-plans?activeOnly=${activeOnly}`);
}

export function createPlan(input: CreatePreventivePlanInput) {
  return api.post<PreventivePlan>('/api/preventive-plans', input);
}

export function setPlanActive(id: number, active: boolean) {
  return api.patch<PreventivePlan>(`/api/preventive-plans/${id}/active?value=${active}`);
}

export function deletePlan(id: number) {
  return api.delete<void>(`/api/preventive-plans/${id}`);
}

export function generateDuePlans() {
  return api.post<{ generated: number }>('/api/preventive-plans/generate-due');
}
