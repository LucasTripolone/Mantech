import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, radius, space } from '../theme/tokens';
import { Txt } from './Text';
import { Card } from './Card';

/** Encabezado de sección, antes definido cuatro veces con tres tamaños. */
export function SectionTitle({
  title,
  action,
  style,
}: {
  title: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.sectionTitle, style]}>
      <Txt variant="h3">{title}</Txt>
      {action}
    </View>
  );
}

/**
 * Ficha de KPI.
 *
 * El número manda: va grande y tabular. La etiqueta explica y el pie da
 * contexto. Cuando no hay dato se dice "sin datos" en vez de mostrar un cero,
 * porque un cero es una afirmación y la ausencia de dato no lo es.
 */
export function KpiTile({
  label,
  value,
  unit,
  caption,
  tone = 'neutral',
  icon,
  style,
}: {
  label: string;
  value: number | string | null | undefined;
  unit?: string;
  caption?: string;
  tone?: 'neutral' | 'good' | 'warn' | 'bad';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}) {
  const hasValue = value !== null && value !== undefined && value !== '';
  const valueColor =
    !hasValue
      ? color.textMuted
      : tone === 'good'
        ? color.success
        : tone === 'warn'
          ? color.warning
          : tone === 'bad'
            ? color.danger
            : color.text;

  return (
    <Card style={[styles.kpi, style as ViewStyle]}>
      <View style={styles.kpiHead}>
        <Txt variant="overline" tone="muted">
          {label.toUpperCase()}
        </Txt>
        {icon ? <Ionicons name={icon} size={16} color={color.textMuted} /> : null}
      </View>

      <View style={styles.kpiValueRow}>
        <Txt variant="metric" tabular style={{ color: valueColor }}>
          {hasValue ? value : '—'}
        </Txt>
        {hasValue && unit ? (
          <Txt variant="bodyStrong" tone="muted" style={styles.kpiUnit}>
            {unit}
          </Txt>
        ) : null}
      </View>

      <Txt variant="caption" tone="muted">
        {hasValue ? caption ?? ' ' : 'Sin datos suficientes'}
      </Txt>
    </Card>
  );
}

/** Contador compacto para totales (órdenes abiertas, vencidas, etc.). */
export function Counter({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: number | string;
  tone?: 'neutral' | 'good' | 'warn' | 'bad';
}) {
  const ink =
    tone === 'good'
      ? color.success
      : tone === 'warn'
        ? color.warning
        : tone === 'bad'
          ? color.danger
          : color.text;
  return (
    <View style={styles.counter}>
      <Txt variant="h2" tabular style={{ color: ink }}>
        {value}
      </Txt>
      <Txt variant="caption" tone="muted" align="center">
        {label}
      </Txt>
    </View>
  );
}

/** Fila etiqueta/valor de una ficha de detalle. */
export function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.detailRow}>
      <Txt variant="caption" tone="muted" style={styles.detailLabel}>
        {label}
      </Txt>
      <View style={styles.detailValue}>
        {children ?? (
          typeof value === 'string' || typeof value === 'number' ? (
            <Txt variant="body">{value}</Txt>
          ) : (
            value ?? <Txt variant="body" tone="muted">—</Txt>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  kpi: { gap: space.xs, minWidth: 150, flexGrow: 1, flexBasis: 150 },
  kpiHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kpiValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.xs },
  kpiUnit: { marginBottom: 2 },
  counter: { alignItems: 'center', gap: 2, flex: 1, minWidth: 72 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    paddingVertical: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.borderSubtle,
  },
  detailLabel: { width: 118, paddingTop: 2 },
  detailValue: { flex: 1, alignItems: 'flex-start' },
  radiusRef: { borderRadius: radius.sm },
});
