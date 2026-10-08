import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { color, radius, space, touch } from '../theme/tokens';
import { Txt } from './Text';

export interface FieldProps extends TextInputProps {
  label: string;
  /** Mensaje de error en línea; antes todo error iba a un diálogo nativo. */
  error?: string | null;
  hint?: string;
  /** Contador de caracteres cuando hay `maxLength`. */
  showCount?: boolean;
  containerStyle?: ViewStyle;
}

export function Field({
  label,
  error,
  hint,
  showCount,
  containerStyle,
  style,
  value,
  maxLength,
  multiline,
  ...rest
}: FieldProps) {
  const len = typeof value === 'string' ? value.length : 0;

  return (
    <View style={[styles.field, containerStyle]}>
      <View style={styles.labelRow}>
        <Txt variant="captionStrong" tone="secondary">
          {label}
        </Txt>
        {showCount && maxLength ? (
          <Txt variant="caption" tone="muted" tabular>
            {len}/{maxLength}
          </Txt>
        ) : null}
      </View>

      <TextInput
        value={value}
        maxLength={maxLength}
        multiline={multiline}
        placeholderTextColor={color.textMuted}
        accessibilityLabel={label}
        style={[
          styles.input,
          multiline && styles.multiline,
          !!error && styles.inputError,
          style,
        ]}
        {...rest}
      />

      {error ? (
        <Txt variant="caption" tone="danger">
          {error}
        </Txt>
      ) : hint ? (
        <Txt variant="caption" tone="muted">
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Selección por chips: el patrón que la app ya usaba para filtrar y elegir
// máquina o técnico, ahora en un solo componente.
// ---------------------------------------------------------------------------

export interface ChipOption<T extends string = string> {
  value: T;
  label: string;
}

export function ChipSelect<T extends string = string>({
  options,
  value,
  onChange,
  label,
  accessibilityLabel,
}: {
  options: ChipOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label?: string;
  accessibilityLabel?: string;
}) {
  return (
    <View style={styles.field}>
      {label ? (
        <Txt variant="captionStrong" tone="secondary">
          {label}
        </Txt>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        accessibilityLabel={accessibilityLabel ?? label}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={opt.label}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Txt
                variant="captionStrong"
                style={{ color: active ? color.onBrand : color.textSecondary }}
              >
                {opt.label}
              </Txt>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: space.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  input: {
    minHeight: touch.minTarget,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    fontSize: 15,
    color: color.text,
  },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  inputError: { borderColor: color.danger, backgroundColor: color.dangerBg },
  chipRow: { gap: space.sm, paddingVertical: space.xxs, paddingRight: space.sm },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
  },
  chipActive: { backgroundColor: color.brand, borderColor: color.brand },
});
