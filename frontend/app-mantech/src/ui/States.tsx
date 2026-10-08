import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, radius, space } from '../theme/tokens';
import { Txt } from './Text';
import { Button } from './Button';

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.huge,
    paddingHorizontal: space.xl,
    gap: space.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { gap: space.xs, alignItems: 'center' },
});

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={color.brand} />
      <Txt variant="caption" tone="muted">
        {label}
      </Txt>
    </View>
  );
}

/**
 * Error con reintento.
 *
 * Antes algunas pantallas mostraban el error sin forma de recuperarse y otras
 * quedaban cargando para siempre. Un error siempre ofrece una salida.
 */
export function ErrorState({
  message,
  onRetry,
}: {
  message?: string | null;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconCircle, { backgroundColor: color.dangerBg }]}>
        <Ionicons name="cloud-offline-outline" size={30} color={color.danger} />
      </View>
      <View style={styles.text}>
        <Txt variant="h3" align="center">
          No pudimos cargar la información
        </Txt>
        <Txt variant="caption" tone="secondary" align="center">
          {message || 'Revisá tu conexión e intentá de nuevo.'}
        </Txt>
      </View>
      {onRetry ? <Button label="Reintentar" variant="secondary" icon="refresh" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyState({
  title,
  description,
  icon = 'file-tray-outline',
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconCircle, { backgroundColor: color.surfaceMuted }]}>
        <Ionicons name={icon} size={30} color={color.textMuted} />
      </View>
      <View style={styles.text}>
        <Txt variant="h3" align="center">
          {title}
        </Txt>
        {description ? (
          <Txt variant="caption" tone="secondary" align="center">
            {description}
          </Txt>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="secondary" onPress={onAction} />
      ) : null}
    </View>
  );
}
