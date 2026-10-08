import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../src/auth/AuthContext';
import { getKpiOverview } from '../src/api/kpis.service';
import { getMyWorkOrders } from '../src/api/workorders.service';
import { KpiOverview, MachineKpi, WorkOrder } from '../src/api/types';
import { color, radius, space } from '../src/theme/tokens';
import { useResponsive } from '../src/theme/useResponsive';
import {
  AppHeader,
  Button,
  Card,
  Counter,
  EmptyState,
  ErrorState,
  Grid,
  KpiTile,
  LevelBadge,
  LoadingState,
  Screen,
  SectionTitle,
  Txt,
  WorkOrderCard,
  formatNumber,
} from '../src/ui';

// ---------------------------------------------------------------------------
// Formateo de KPIs
//
// Clave: cuando el backend manda `null` no hay dato, y `null` se propaga hasta
// el tile para que diga "Sin datos suficientes". Convertirlo a 0 sería afirmar
// algo que no sabemos.
// ---------------------------------------------------------------------------

type Tone = 'neutral' | 'good' | 'warn' | 'bad';

/** Porcentaje legible, preservando la ausencia de dato. */
function pctValue(v: number | null | undefined): string | null {
  if (v == null) return null;
  return formatNumber(v, v % 1 === 0 ? 0 : 1);
}

/** Horas en la unidad que mejor se lee, preservando la ausencia de dato. */
function hoursValue(v: number | null | undefined): { value: string | null; unit?: string } {
  if (v == null) return { value: null };
  if (v >= 48) return { value: formatNumber(v / 24, 1), unit: 'd' };
  if (v >= 1) return { value: formatNumber(v, 1), unit: 'h' };
  return { value: formatNumber(Math.round(v * 60), 0), unit: 'min' };
}

/** Semáforo de un porcentaje de salud (disponibilidad, cumplimiento). */
function healthTone(v: number | null | undefined): Tone {
  if (v == null) return 'neutral';
  if (v >= 90) return 'good';
  if (v >= 70) return 'warn';
  return 'bad';
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const isTechnician = user?.role === 'MANTENIMIENTO';
  return isTechnician ? <TechnicianDashboard /> : <OverviewDashboard />;
}

// ---------------------------------------------------------------------------
// Tablero de jefatura y supervisión: indicadores de planta
// ---------------------------------------------------------------------------

function OverviewDashboard() {
  const { isWide } = useResponsive();
  const [data, setData] = useState<KpiOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getKpiOverview());
    } catch (e: any) {
      setError(e?.message ?? 'No se pudieron cargar los KPIs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const mttr = hoursValue(data?.avgMttrHours);
  const mtbf = hoursValue(data?.avgMtbfHours);

  const ranking = (data?.criticalMachines ?? []).filter(
    (m) => m.criticalityIndex != null && m.criticalityIndex > 0,
  );

  return (
    <Screen
      header={
        <AppHeader
          title="Indicadores"
          subtitle="Estado de la planta en tiempo real"
          back
        />
      }
      refreshing={loading}
      onRefresh={load}
    >
      {loading && !data ? <LoadingState label="Calculando indicadores…" /> : null}

      {error && !data ? <ErrorState message={error} onRetry={load} /> : null}

      {data ? (
        <>
          <Grid minItemWidth={isWide ? 220 : 150}>
            <KpiTile
              label="Disponibilidad"
              value={pctValue(data.avgAvailabilityPercent)}
              unit="%"
              caption="MTBF / (MTBF + MTTR)"
              tone={healthTone(data.avgAvailabilityPercent)}
              icon="pulse-outline"
            />
            <KpiTile
              label="MTTR"
              value={mttr.value}
              unit={mttr.unit}
              caption="Tiempo medio de reparación"
              icon="timer-outline"
            />
            <KpiTile
              label="MTBF"
              value={mtbf.value}
              unit={mtbf.unit}
              caption="Tiempo medio entre fallas"
              icon="trending-up-outline"
            />
            <KpiTile
              label="Cumpl. preventivo"
              value={pctValue(data.preventiveCompliancePercent)}
              unit="%"
              caption="Preventivas hechas a término"
              tone={healthTone(data.preventiveCompliancePercent)}
              icon="calendar-outline"
            />
          </Grid>

          <Card style={styles.counters}>
            <Counter label="Abiertas" value={data.openWorkOrders} tone="warn" />
            <View style={styles.divider} />
            <Counter label="Correctivas" value={data.correctiveCount} tone="bad" />
            <View style={styles.divider} />
            <Counter label="Preventivas" value={data.preventiveCount} />
            <View style={styles.divider} />
            <Counter
              label="Prev. vencidas"
              value={data.overduePreventiveCount}
              tone={data.overduePreventiveCount > 0 ? 'bad' : 'good'}
            />
          </Card>

          <Grid minItemWidth={160}>
            <Card tone="sunken" style={styles.totals}>
              <Txt variant="overline" tone="muted">
                MÁQUINAS RELEVADAS
              </Txt>
              <Txt variant="h2" tabular>
                {data.totalMachines}
              </Txt>
            </Card>
            <Card tone="sunken" style={styles.totals}>
              <Txt variant="overline" tone="muted">
                ÓRDENES TOTALES
              </Txt>
              <Txt variant="h2" tabular>
                {data.totalWorkOrders}
              </Txt>
            </Card>
            <Card tone="sunken" style={styles.totals}>
              <Txt variant="overline" tone="muted">
                ÓRDENES CERRADAS
              </Txt>
              <Txt variant="h2" tabular>
                {data.closedWorkOrders}
              </Txt>
            </Card>
          </Grid>

          <View style={styles.section}>
            <SectionTitle title="Activos más críticos" />
            {ranking.length === 0 ? (
              <EmptyState
                title="Sin fallas registradas"
                description="Cuando se cierren órdenes correctivas vas a ver acá el ranking de activos por índice de criticidad."
                icon="shield-checkmark-outline"
              />
            ) : (
              <Grid minItemWidth={320}>
                {ranking.map((m, i) => (
                  <MachineRankCard key={m.machineId} machine={m} position={i + 1} />
                ))}
              </Grid>
            )}
          </View>

          <Txt variant="caption" tone="muted">
            Los indicadores se calculan automáticamente a partir de las órdenes de trabajo
            cerradas. Disponibilidad = MTBF / (MTBF + MTTR).
          </Txt>
        </>
      ) : null}
    </Screen>
  );
}

/** Fila del ranking de activos: el índice manda, el detalle acompaña. */
function MachineRankCard({ machine, position }: { machine: MachineKpi; position: number }) {
  const mttr = hoursValue(machine.mttrHours);

  return (
    <Card
      style={styles.rankCard}
      accessibilityLabel={`Puesto ${position}: ${machine.machineName}, índice de criticidad ${formatNumber(machine.criticalityIndex, 1)}`}
    >
      <View style={styles.rankPosition}>
        <Txt variant="captionStrong" tone="brand" tabular>
          {position}
        </Txt>
      </View>

      <View style={styles.rankBody}>
        <View style={styles.rankTitleRow}>
          <Txt variant="bodyStrong" numberOfLines={1} style={styles.rankName}>
            {machine.machineName}
          </Txt>
          {machine.criticality ? (
            <LevelBadge level={machine.criticality} prefix="Criticidad" />
          ) : null}
        </View>
        <Txt variant="caption" tone="secondary">
          {machine.correctiveCount} fallas · MTTR {mttr.value ?? '—'}
          {mttr.unit ? ` ${mttr.unit}` : ''} · disp. {pctValue(machine.availabilityPercent) ?? '—'}
          {machine.availabilityPercent == null ? '' : ' %'}
        </Txt>
      </View>

      <View style={styles.rankIndex}>
        <Txt variant="h2" tone="brand" tabular>
          {formatNumber(machine.criticalityIndex, 1)}
        </Txt>
        <Txt variant="overline" tone="muted">
          ÍNDICE
        </Txt>
      </View>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tablero de mantenimiento: "mi trabajo"
// ---------------------------------------------------------------------------

function TechnicianDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  // Un error de red no es "no tenés trabajo": antes se tragaba con `catch {}` y
  // el técnico veía la agenda vacía como si estuviera libre.
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await getMyWorkOrders());
      setLoaded(true);
    } catch (e: any) {
      setError(e?.message ?? 'No se pudieron cargar tus órdenes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const open = orders.filter((o) => o.status === 'ABIERTA' || o.status === 'ASIGNADA');
  const inProgress = orders.filter((o) => o.status === 'EN_PROCESO');
  const closed = orders.filter((o) => o.status === 'CERRADA');

  const upcoming = orders
    .filter((o) => o.scheduledAt && o.status !== 'CERRADA' && o.status !== 'CANCELADA')
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());

  const showError = !!error && !loaded;

  return (
    <Screen
      header={
        <AppHeader
          title="Mi trabajo"
          subtitle={user?.firstName ? `Hola, ${user.firstName}` : undefined}
          back
        />
      }
      refreshing={loading}
      onRefresh={load}
    >
      {showError ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <Card style={styles.counters}>
            <Counter label="Pendientes" value={open.length} tone="warn" />
            <View style={styles.divider} />
            <Counter label="En proceso" value={inProgress.length} />
            <View style={styles.divider} />
            <Counter label="Cerradas" value={closed.length} tone="good" />
          </Card>

          {/* Si ya había datos en pantalla y falla el refresco, se avisa sin
              borrar lo que el técnico está mirando. */}
          {error && loaded ? (
            <Card tone="accent" accentColor={color.danger}>
              <Txt variant="captionStrong" tone="danger">
                No pudimos actualizar la lista
              </Txt>
              <Txt variant="caption" tone="secondary">
                {error} Estás viendo la última información cargada.
              </Txt>
            </Card>
          ) : null}

          <View style={styles.section}>
            <SectionTitle title="Mi agenda" />
            {loading && !loaded ? (
              <LoadingState label="Buscando tus órdenes…" />
            ) : upcoming.length === 0 ? (
              <EmptyState
                title="No tenés órdenes programadas"
                description="Cuando te asignen una orden con fecha, va a aparecer acá."
                icon="calendar-clear-outline"
                actionLabel="Ver todas mis órdenes"
                onAction={() => router.push('/orders')}
              />
            ) : (
              <Grid minItemWidth={300}>
                {upcoming.map((o) => (
                  <WorkOrderCard
                    key={o.id}
                    order={o}
                    onPress={() =>
                      router.push({ pathname: '/order-detail', params: { id: String(o.id) } })
                    }
                  />
                ))}
              </Grid>
            )}
          </View>

          <Button
            label="Ver todas mis órdenes"
            variant="secondary"
            icon="list-outline"
            block
            onPress={() => router.push('/orders')}
            accessibilityHint="Abre el listado completo de órdenes asignadas"
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.md },
  counters: { flexDirection: 'row', alignItems: 'center' },
  divider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: color.border },
  totals: { gap: space.xxs },

  rankCard: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  rankPosition: {
    minWidth: space.xxl,
    height: space.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.brandSoft,
    borderRadius: radius.sm,
  },
  rankBody: { flex: 1, gap: space.xxs },
  rankTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  rankName: { flexShrink: 1 },
  rankIndex: { alignItems: 'center' },
});
