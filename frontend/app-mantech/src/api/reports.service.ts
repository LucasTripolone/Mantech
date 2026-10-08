import { api } from './client';
import { CreateReportInput, Report } from './types';

export function createReport(input: CreateReportInput) {
  return api.post<Report>('/api/reports', input);
}

export function getMyReports() {
  return api.get<Report[]>('/api/reports/mine');
}

export function getReportsByMachine(machineId: number) {
  return api.get<Report[]>(`/api/reports/machine/${machineId}`);
}

export function resolveReport(id: number) {
  return api.patch<Report>(`/api/reports/${id}/resolve`);
}

/**
 * Adjunta una foto o audio a un reporte. `uri` es la ruta local que devuelven
 * expo-camera / expo-av. fileType: 'PHOTO' | 'AUDIO'.
 */
export function attachFile(
  reportId: number,
  uri: string,
  fileType: 'PHOTO' | 'AUDIO',
) {
  const form = new FormData();
  const isAudio = fileType === 'AUDIO';
  const name = uri.split('/').pop() || (isAudio ? 'audio.m4a' : 'photo.jpg');
  const mimeType = isAudio ? 'audio/m4a' : 'image/jpeg';

  // En React Native el "file" de un FormData es { uri, name, type }.
  form.append('file', { uri, name, type: mimeType } as any);
  form.append('fileType', fileType);

  return api.postForm<{ fileUrl: string }>(`/api/reports/${reportId}/files`, form);
}
