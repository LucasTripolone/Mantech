/** Formateo compartido de fechas, duraciones y etiquetas de dominio. */

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Fecha en lenguaje cercano: "Hoy", "Mañana" o el día con mes. */
export function formatDayLabel(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const today = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (sameDay(d, today)) return 'Hoy';
  if (sameDay(d, tomorrow)) return 'Mañana';
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'short' });
}

export function formatDuration(minutes?: number | null): string {
  if (minutes == null) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** Número con coma decimal, como se escribe en Argentina. */
export function formatNumber(value?: number | null, decimals = 1): string {
  if (value == null || isNaN(value)) return '—';
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export const TYPE_LABEL: Record<string, string> = {
  CORRECTIVA: 'Correctiva',
  PREVENTIVA: 'Preventiva',
};

export function typeLabel(type?: string | null): string {
  if (!type) return '—';
  return TYPE_LABEL[type.toUpperCase()] ?? type;
}

export function roleLabel(role?: string | null): string {
  if (!role) return '';
  const map: Record<string, string> = {
    OPERARIO: 'Operario',
    SUPERVISOR: 'Supervisor',
    MANTENIMIENTO: 'Mantenimiento',
    JEFE_PLANTA: 'Jefe de planta',
  };
  return map[role] ?? role.replace('_', ' ');
}
