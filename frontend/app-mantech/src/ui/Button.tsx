import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, radius, space, touch } from '../theme/tokens';
import { Txt } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Muestra spinner y bloquea el botón. */
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Ocupa todo el ancho disponible. */
  block?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

interface Skin {
  bg: string;
  border: string;
  fg: string;
  pressedBg: string;
}

const skins: Record<ButtonVariant, Skin> = {
  primary: { bg: color.brand, border: color.brand, fg: color.onBrand, pressedBg: color.brandDark },
  secondary: { bg: color.surface, border: color.border, fg: color.brand, pressedBg: color.surfaceMuted },
  success: { bg: color.success, border: color.success, fg: color.onBrand, pressedBg: color.successDark },
  danger: { bg: color.danger, border: color.danger, fg: color.onBrand, pressedBg: color.dangerDark },
  ghost: { bg: 'transparent', border: 'transparent', fg: color.brand, pressedBg: color.brandTint },
};

/**
 * Acción única de la app.
 *
 * Reemplaza ocho botones sin relación entre sí, cada uno con su propio manejo
 * de "enviando". El alto mínimo sale de los tokens de ergonomía: la app se opera
 * con guantes, así que ningún control baja de 48 dp.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  block = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const skin = skins[variant];
  const isOff = disabled || loading;
  const height = size === 'lg' ? touch.primaryAction : touch.minTarget;

  return (
    <Pressable
      onPress={isOff ? undefined : onPress}
      disabled={isOff}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isOff, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          backgroundColor: pressed && !isOff ? skin.pressedBg : skin.bg,
          borderColor: skin.border,
          opacity: isOff ? 0.55 : 1,
        },
        block && styles.block,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={skin.fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={size === 'lg' ? 22 : 19} color={skin.fg} /> : null}
          <Txt
            variant={size === 'lg' ? 'bodyLg' : 'bodyStrong'}
            style={{ color: skin.fg, fontWeight: '600' }}
          >
            {label}
          </Txt>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  block: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});

export default Button;
