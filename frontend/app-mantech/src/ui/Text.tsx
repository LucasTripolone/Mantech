import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { color, typography, TypographyVariant } from '../theme/tokens';

type Tone = 'default' | 'secondary' | 'muted' | 'onBrand' | 'success' | 'warning' | 'danger' | 'brand';

const toneColor: Record<Tone, string> = {
  default: color.text,
  secondary: color.textSecondary,
  muted: color.textMuted,
  onBrand: color.textOnBrand,
  success: color.success,
  warning: color.warning,
  danger: color.danger,
  brand: color.brand,
};

export interface TxtProps extends TextProps {
  variant?: TypographyVariant;
  tone?: Tone;
  /** Alinea el texto; por defecto hereda. */
  align?: TextStyle['textAlign'];
  /** Dígitos de ancho fijo: para que los números no bailen al actualizarse. */
  tabular?: boolean;
}

/**
 * Texto tipado contra la escala del sistema.
 *
 * Antes había 16 tamaños de fuente combinados ad-hoc con 8 pesos. Acá sólo se
 * elige un rol semántico y el sistema resuelve tamaño, interlineado y peso.
 */
export function Txt({
  variant = 'body',
  tone = 'default',
  align,
  tabular,
  style,
  ...rest
}: TxtProps) {
  return (
    <RNText
      style={[
        typography[variant] as TextStyle,
        { color: toneColor[tone] },
        align ? { textAlign: align } : null,
        tabular ? { fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] } : null,
        style,
      ]}
      {...rest}
    />
  );
}

export default Txt;
