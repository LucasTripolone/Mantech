import React from 'react';
import { StyleSheet, View } from 'react-native';
import { color, radius, sensorStatusTone, space, toneFor } from '../theme/tokens';
import { Txt } from './Text';

export interface ChartPoint {
  at: string;
  value: number;
  status: string;
}

/**
 * Gráfico de la serie de un sensor.
 *
 * Dibujado con vistas en lugar de SVG: son barras sobre una escala común y no
 * justifica sumar una dependencia de gráficos al proyecto. Cada barra toma el
 * color de su propia clasificación, así un pico en rojo se ve sin leer números,
 * y las líneas de umbral se dibujan sobre la misma escala que las barras.
 */
export function SensorChart({
  points,
  unit,
  warningThreshold,
  criticalThreshold,
  height = 140,
}: {
  points: ChartPoint[];
  unit: string;
  warningThreshold?: number | null;
  criticalThreshold?: number | null;
  height?: number;
}) {
  if (points.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Txt variant="caption" tone="muted">
          Todavía no hay mediciones para graficar
        </Txt>
      </View>
    );
  }

  const values = points.map((p) => p.value);
  const dataMax = Math.max(...values);
  const dataMin = Math.min(...values);

  // La escala incluye los umbrales para que las líneas de referencia siempre
  // entren en el dibujo, y arranca en cero salvo que los valores sean negativos.
  const candidates = [dataMax, warningThreshold ?? dataMax, criticalThreshold ?? dataMax];
  const top = Math.max(...candidates) * 1.1 || 1;
  const bottom = Math.min(0, dataMin);
  const span = top - bottom || 1;

  const toOffset = (v: number) => ((v - bottom) / span) * height;

  return (
    <View style={styles.wrap}>
      <View style={[styles.plot, { height }]}>
        {/* Líneas de umbral, sobre la misma escala que las barras. */}
        {criticalThreshold != null && criticalThreshold <= top ? (
          <View
            style={[
              styles.threshold,
              { bottom: toOffset(criticalThreshold), borderColor: color.danger },
            ]}
          />
        ) : null}
        {warningThreshold != null && warningThreshold <= top ? (
          <View
            style={[
              styles.threshold,
              { bottom: toOffset(warningThreshold), borderColor: color.warning },
            ]}
          />
        ) : null}

        <View style={styles.bars}>
          {points.map((p, i) => {
            const tone = toneFor(sensorStatusTone, p.status);
            const barHeight = Math.max(2, toOffset(p.value));
            return (
              <View
                key={`${p.at}-${i}`}
                style={[styles.bar, { height: barHeight, backgroundColor: tone.ink }]}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.axis}>
        <Txt variant="overline" tone="muted" tabular>
          MÍN {dataMin.toFixed(1)} {unit}
        </Txt>
        <Txt variant="overline" tone="muted" tabular>
          MÁX {dataMax.toFixed(1)} {unit}
        </Txt>
      </View>

      <View style={styles.legend}>
        {warningThreshold != null ? (
          <View style={styles.legendItem}>
            <View style={[styles.legendDash, { borderColor: color.warning }]} />
            <Txt variant="overline" tone="muted" tabular>
              ALERTA {warningThreshold} {unit}
            </Txt>
          </View>
        ) : null}
        {criticalThreshold != null ? (
          <View style={styles.legendItem}>
            <View style={[styles.legendDash, { borderColor: color.danger }]} />
            <Txt variant="overline" tone="muted" tabular>
              CRÍTICO {criticalThreshold} {unit}
            </Txt>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  plot: {
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    paddingHorizontal: space.sm,
    paddingVertical: 0,
  },
  bar: { flex: 1, minWidth: 2, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  threshold: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  legendDash: { width: 14, borderTopWidth: 1, borderStyle: 'dashed' },
  empty: {
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
