import { api } from './client';
import { KpiOverview, MachineKpi } from './types';

export function getKpiOverview() {
  return api.get<KpiOverview>('/api/kpis/overview');
}

export function getMachineKpi(machineId: number) {
  return api.get<MachineKpi>(`/api/kpis/machine/${machineId}`);
}
