import { api } from './client';
import { Machine } from './types';

export function listMachines() {
  return api.get<Machine[]>('/api/machines');
}

export function getMachineByQr(qrCode: string) {
  return api.get<Machine>(`/api/machines/qr/${encodeURIComponent(qrCode)}`);
}

export function getMachineById(id: number) {
  return api.get<Machine>(`/api/machines/${id}`);
}

export function updateMachineStatus(id: number, status: string, reason?: string) {
  return api.patch<void>(`/api/machines/${id}/status`, { status, reason });
}
