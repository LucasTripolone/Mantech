// Tipos compartidos que reflejan los DTOs del backend (com.mantech.app.dto).

export interface LoginResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Machine {
  id: number;
  name: string;
  qrCode: string;
  sector: string | null;
  criticality: string | null;
  currentStatus: string;
  plantName: string;
}

export type ReportType = 'FALLA' | 'PREVENTIVO' | 'RUTINA';
export type Priority = 'ALTA' | 'MEDIA' | 'BAJA';
export type ReportStatus = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO';

export interface Report {
  id: number;
  machineId: number;
  machineName: string;
  reportedBy: string;
  type: string;
  description: string | null;
  priority: string | null;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  fileUrls: string[];
}

export interface CreateReportInput {
  machineId: number;
  type: ReportType;
  description?: string;
  priority?: Priority;
}

// ----- Órdenes de Trabajo -----

export type WorkOrderType = 'CORRECTIVA' | 'PREVENTIVA';
export type WorkOrderStatus =
  | 'ABIERTA'
  | 'ASIGNADA'
  | 'EN_PROCESO'
  | 'PAUSADA'
  | 'CERRADA'
  | 'CANCELADA';

export interface WorkOrder {
  id: number;
  machineId: number;
  machineName: string;
  machineSector: string | null;
  machineCriticality: string | null;
  plantName: string | null;
  reportId: number | null;
  type: string;
  status: string;
  priority: string | null;
  description: string | null;
  failureType: string | null;
  impact: string | null;
  stoppedProduction: boolean;
  createdBy: string | null;
  assignedTechnicianId: number | null;
  assignedTechnician: string | null;
  scheduledAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  resolutionNotes: string | null;
  signature: string | null;
  createdAt: string;
  durationMinutes: number | null;
}

export interface CreateWorkOrderInput {
  machineId: number;
  type: WorkOrderType;
  priority?: Priority;
  description?: string;
  failureType?: string;
  impact?: 'ALTO' | 'MEDIO' | 'BAJO';
  stoppedProduction?: boolean;
  scheduledAt?: string;
  assignedTechnicianId?: number;
  reportId?: number;
}

// ----- KPIs -----

export interface MachineKpi {
  machineId: number;
  machineName: string;
  criticality: string | null;
  correctiveCount: number;
  preventiveCount: number;
  openCount: number;
  mttrHours: number | null;
  mtbfHours: number | null;
  availabilityPercent: number | null;
  preventiveCompliancePercent: number | null;
  criticalityIndex: number | null;
  lastFailureAt: string | null;
}

export interface KpiOverview {
  totalMachines: number;
  totalWorkOrders: number;
  openWorkOrders: number;
  closedWorkOrders: number;
  correctiveCount: number;
  preventiveCount: number;
  avgMttrHours: number | null;
  avgMtbfHours: number | null;
  avgAvailabilityPercent: number | null;
  preventiveCompliancePercent: number | null;
  overduePreventiveCount: number;
  criticalMachines: MachineKpi[];
}

// ----- Planes Preventivos -----

export type FrequencyType = 'DIAS' | 'SEMANAS' | 'MESES';

export interface PreventivePlan {
  id: number;
  machineId: number;
  machineName: string;
  title: string;
  description: string | null;
  frequencyType: string;
  frequencyValue: number;
  frequencyLabel: string;
  estimatedDurationMinutes: number | null;
  nextDueAt: string;
  lastGeneratedAt: string | null;
  active: boolean;
  assignedTechnicianId: number | null;
  assignedTechnician: string | null;
}

export interface CreatePreventivePlanInput {
  machineId: number;
  title: string;
  description?: string;
  frequencyType: FrequencyType;
  frequencyValue: number;
  estimatedDurationMinutes?: number;
  nextDueAt?: string;
  assignedTechnicianId?: number;
}
