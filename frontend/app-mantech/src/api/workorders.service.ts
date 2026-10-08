import { api } from './client';
import { CreateWorkOrderInput, WorkOrder } from './types';

interface ListFilters {
  status?: string;
  type?: string;
  machineId?: number;
}

export function listWorkOrders(filters: ListFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.type) params.append('type', filters.type);
  if (filters.machineId != null) params.append('machineId', String(filters.machineId));
  const qs = params.toString();
  return api.get<WorkOrder[]>(`/api/work-orders${qs ? `?${qs}` : ''}`);
}

export function getMyWorkOrders() {
  return api.get<WorkOrder[]>('/api/work-orders/mine');
}

export function getAgenda(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const qs = params.toString();
  return api.get<WorkOrder[]>(`/api/work-orders/agenda${qs ? `?${qs}` : ''}`);
}

export function getWorkOrder(id: number) {
  return api.get<WorkOrder>(`/api/work-orders/${id}`);
}

export function createWorkOrder(input: CreateWorkOrderInput) {
  return api.post<WorkOrder>('/api/work-orders', input);
}

export function createWorkOrderFromReport(reportId: number) {
  return api.post<WorkOrder>(`/api/work-orders/from-report/${reportId}`);
}

export function assignTechnician(id: number, technicianId: number) {
  return api.patch<WorkOrder>(`/api/work-orders/${id}/assign`, { technicianId });
}

export function startWorkOrder(id: number) {
  return api.patch<WorkOrder>(`/api/work-orders/${id}/start`);
}

export function finishWorkOrder(id: number, resolutionNotes?: string, signature?: string) {
  return api.patch<WorkOrder>(`/api/work-orders/${id}/finish`, { resolutionNotes, signature });
}

export function cancelWorkOrder(id: number) {
  return api.patch<WorkOrder>(`/api/work-orders/${id}/cancel`);
}
