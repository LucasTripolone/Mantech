import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  color,
  impactTone,
  levelTone,
  machineStatusTone,
  radius,
  space,
  toneFor,
  workOrderStatusTone,
} from '../theme/tokens';
import { Txt } from './Text';

type Size = 'sm' | 'md';

interface BaseBadgeProps {
  label: string;
  bg: string;
  ink: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: Size;
  style?: ViewStyle;
}

function BaseBadge({ label, bg, ink, icon, size = 'md', style }: BaseBadgeProps) {
  const small = size === 'sm';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingVertical: small ? 3 : 5,
          paddingHorizontal: small ? space.sm : space.md,
        },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={small ? 12 : 14} color={ink} /> : null}
      <Txt variant={small ? 'overline' : 'captionStrong'} style={{ color: ink }}>
        {label}
      </Txt>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estado operativo de la máquina — el componente más identificador del producto:
// es lo que ve el operario al escanear el QR pegado en el equipo.
// ---------------------------------------------------------------------------

const machineStatusLabel: Record<string, string> = {
  OPERATIVA: 'Operativa',
  PREVENTIVO: 'En preventivo',
  FALLA: 'En falla',
};

const machineStatusIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  OPERATIVA: 'checkmark-circle',
  PREVENTIVO: 'construct',
  FALLA: 'warning',
};

export function MachineStatusPill({
  status,
  size = 'md',
  style,
}: {
  status?: string | null;
  size?: Size;
  style?: ViewStyle;
}) {
  const key = (status ?? '').toUpperCase();
  const tone = toneFor(machineStatusTone, key);
  return (
    <BaseBadge
      label={machineStatusLabel[key] ?? status ?? 'Sin dato'}
      bg={tone.bg}
      ink={tone.ink}
      icon={machineStatusIcon[key] ?? 'help-circle'}
      size={size}
      style={style}
    />
  );
}

// ---------------------------------------------------------------------------
// Estado de la orden de trabajo
// ---------------------------------------------------------------------------

const workOrderStatusLabel: Record<string, string> = {
  ABIERTA: 'Abierta',
  ASIGNADA: 'Asignada',
  EN_PROCESO: 'En proceso',
  PAUSADA: 'Pausada',
  CERRADA: 'Cerrada',
  CANCELADA: 'Cancelada',
};

export function StatusBadge({
  status,
  size = 'md',
  style,
}: {
  status?: string | null;
  size?: Size;
  style?: ViewStyle;
}) {
  const key = (status ?? '').toUpperCase();
  const tone = toneFor(workOrderStatusTone, key);
  return (
    <BaseBadge
      label={workOrderStatusLabel[key] ?? status ?? '-'}
      bg={tone.bg}
      ink={tone.ink}
      size={size}
      style={style}
    />
  );
}

// ---------------------------------------------------------------------------
// Criticidad del activo, prioridad e impacto comparten escala visual
// ---------------------------------------------------------------------------

export function LevelBadge({
  level,
  prefix,
  kind = 'level',
  size = 'sm',
  style,
}: {
  level?: string | null;
  /** Texto que antecede al valor, p. ej. "Criticidad". */
  prefix?: string;
  kind?: 'level' | 'impact';
  size?: Size;
  style?: ViewStyle;
}) {
  const key = (level ?? '').toUpperCase();
  const tone = toneFor(kind === 'impact' ? impactTone : levelTone, key);
  const pretty = key ? key.charAt(0) + key.slice(1).toLowerCase() : 'Sin dato';
  return (
    <BaseBadge
      label={prefix ? `${prefix} ${pretty.toLowerCase()}` : pretty}
      bg={tone.bg}
      ink={tone.ink}
      size={size}
      style={style}
    />
  );
}

/** Punto de color para prioridad, cuando no hay lugar para una insignia entera. */
export function PriorityDot({ priority }: { priority?: string | null }) {
  const tone = toneFor(levelTone, (priority ?? '').toUpperCase());
  return <View style={[styles.dot, { backgroundColor: tone.ink }]} />;
}

/** Insignia de tipo de orden: correctiva o preventiva. */
export function TypeBadge({ type, size = 'sm' }: { type?: string | null; size?: Size }) {
  const key = (type ?? '').toUpperCase();
  const isPreventive = key === 'PREVENTIVA';
  return (
    <BaseBadge
      label={isPreventive ? 'Preventiva' : key === 'CORRECTIVA' ? 'Correctiva' : type ?? '-'}
      bg={isPreventive ? color.infoBg : color.warningBg}
      ink={isPreventive ? color.info : color.warning}
      icon={isPreventive ? 'calendar' : 'alert-circle'}
      size={size}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: { width: 10, height: 10, borderRadius: radius.pill },
});
