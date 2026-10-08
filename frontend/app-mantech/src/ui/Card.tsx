import React from 'react';
import { Pressable, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { color, elevation, radius, space } from '../theme/tokens';

export interface CardProps extends ViewProps {
  /**
   * `plain` es la superficie por defecto; `sunken` para bloques embebidos;
   * `accent` lleva una franja lateral de color para señalar estado.
   */
  tone?: 'plain' | 'sunken' | 'accent';
  accentColor?: string;
  /** Sin relleno interno: para tarjetas que manejan su propio layout. */
  flush?: boolean;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
}

/**
 * Superficie contenedora.
 *
 * Reemplaza doce definiciones equivalentes de tarjeta repartidas por las
 * pantallas. El borde y la elevación se gastan por rol: una tarjeta pulsable se
 * eleva, una embebida se hunde.
 */
export function Card({
  tone = 'plain',
  accentColor,
  flush = false,
  onPress,
  style,
  children,
  accessibilityLabel,
  ...rest
}: CardProps) {
  const base: ViewStyle[] = [
    styles.card,
    tone === 'sunken' ? styles.sunken : styles.plain,
  ];
  if (!flush) base.push(styles.padded);

  if (tone === 'accent') {
    base.push({ borderLeftWidth: 4, borderLeftColor: accentColor ?? color.brand });
  }

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [...base, pressed && styles.pressed, style as ViewStyle]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[...base, style as ViewStyle]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  plain: {
    backgroundColor: color.surface,
    borderColor: color.borderSubtle,
    ...elevation.low,
  },
  sunken: {
    backgroundColor: color.surfaceSunken,
    borderColor: color.borderSubtle,
  },
  padded: { padding: space.lg },
  pressed: { backgroundColor: color.brandTint, borderColor: color.border },
});

export default Card;
