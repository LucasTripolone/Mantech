import { api } from './client';

/** Magnitudes que reporta la placa de campo. */
export type SensorMetric = 'TEMPERATURA' | 'VIBRACION' | 'INCLINACION';

/** Clasificación de una lectura contra los umbrales de la planta. */
export type SensorStatus = 'NORMAL' | 'ALERTA' | 'CRITICO' | 'SIN_DATOS';

export interface SensorReading {
  metric: SensorMetric | string;
  label: string;
  value: number;
  unit: string;
  status: SensorStatus;
  recordedAt: string;
}

export interface IotDevice {
  id: number;
  name: string;
  description?: string | null;
  machineId?: number | null;
  machineName?: string | null;
  online: boolean;
  active: boolean;
  lastSeenAt?: string | null;
  firmwareVersion?: string | null;
  intervalSeconds: number;
  overallStatus: SensorStatus;
  readings: SensorReading[];
}

export interface SensorSeriesPoint {
  at: string;
  value: number;
  status: SensorStatus;
}

export interface SensorSeries {
  metric: string;
  label: string;
  unit: string;
  warningThreshold?: number | null;
  criticalThreshold?: number | null;
  min?: number | null;
  max?: number | null;
  average?: number | null;
  points: SensorSeriesPoint[];
}

/** Estado en vivo de todos los dispositivos con su última medición. */
export function listIotDevices(): Promise<IotDevice[]> {
  return api.get<IotDevice[]>('/api/iot/devices');
}

export function getIotDevice(id: number): Promise<IotDevice> {
  return api.get<IotDevice>(`/api/iot/devices/${id}`);
}

/** Serie temporal de una magnitud, para el gráfico. */
export function getSensorSeries(
  deviceId: number,
  metric: SensorMetric,
  limit = 60,
): Promise<SensorSeries> {
  return api.get<SensorSeries>(
    `/api/iot/devices/${deviceId}/series?metric=${metric}&limit=${limit}`,
  );
}

/** Unidad en el formato en que se lee en pantalla. */
export function formatUnit(unit: string): string {
  if (unit === 'C') return '°C';
  if (unit === 'deg') return '°';
  return unit;
}
