import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, levelTone, space, toneFor } from '../theme/tokens';
import { Txt } from './Text';
import { Card } from './Card';
import { StatusBadge, TypeBadge } from './Badge';
import { formatDateTime } from './format';

export interface WorkOrderLike {
  id: number;
  type?: string | null;
  status?: string | null;
  priority?: string | null;
  machineName?: string | null;
  description?: string | null;
  scheduledAt?: string | null;
  createdAt?: string | null;
  assignedTechnician?: string | null;
}

/**
 * Tarjeta de orden de trabajo.
 *
 * Unifica las tres implementaciones distintas que convivían (listado, agenda del
 * técnico y agenda de planes). La franja lateral codifica la prioridad, así que
 * el nivel se lee antes de leer el texto.
 */
export function WorkOrderCard({
  order,
  onPress,
  showMachine = true,
}: {
  order: WorkOrderLike;
  onPress?: () => void;
  showMachine?: boolean;
}) {
  const priorityInk = toneFor(levelTone, (order.priority ?? '').toUpperCase()).ink;
  const when = order.scheduledAt ?? order.createdAt;

  return (
    <Card
      tone="accent"
      accentColor={order.priority ? priorityInk : color.border}
      onPress={onPress}
      accessibilityLabel={`Orden ${order.id}, ${order.machineName ?? 'sin máquina'}`}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.badges}>
          <TypeBadge type={order.type} />
          <StatusBadge status={order.status} size="sm" />
        </View>
        <Txt variant="overline" tone="muted" tabular>
          #{order.id}
        </Txt>
      </View>

      {showMachine && order.machineName ? (
        <Txt variant="bodyStrong" numberOfLines={1}>
          {order.machineName}
        </Txt>
      ) : null}

      {order.description ? (
        <Txt variant="caption" tone="secondary" numberOfLines={2}>
          {order.description}
        </Txt>
      ) : null}

      <View style={styles.metaRow}>
        {when ? (
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={13} color={color.textMuted} />
            <Txt variant="caption" tone="muted">
              {formatDateTime(when)}
            </Txt>
          </View>
        ) : null}
        {order.assignedTechnician ? (
          <View style={styles.meta}>
            <Ionicons name="person-outline" size={13} color={color.textMuted} />
            <Txt variant="caption" tone="muted" numberOfLines={1}>
              {order.assignedTechnician}
            </Txt>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.sm, flexGrow: 1, flexBasis: 280 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  badges: { flexDirection: 'row', alignItems: 'center', gap: space.xs, flexWrap: 'wrap', flex: 1 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.xxs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
});
