import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { space } from '../theme/tokens';

/**
 * Grilla fluida.
 *
 * Los hijos crecen hasta llenar la fila en vez de usar anchos fijos en
 * porcentaje, que era lo que forzaba dos columnas incluso donde entraban cuatro
 * y dejaba huecos muertos al final.
 */
export function Grid({
  children,
  minItemWidth = 160,
  gap = space.md,
  style,
}: {
  children: React.ReactNode;
  /** Ancho mínimo de cada celda antes de pasar a la fila siguiente. */
  minItemWidth?: number;
  gap?: number;
  style?: ViewStyle;
}) {
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={[styles.grid, { gap }, style]}>
      {items.map((child, i) => (
        <View key={i} style={{ flexGrow: 1, flexShrink: 1, flexBasis: minItemWidth }}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch' },
});
