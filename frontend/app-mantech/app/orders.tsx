import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Screen,
  AppHeader,
  ChipSelect,
  ChipOption,
  Grid,
  WorkOrderCard,
  LoadingState,
  ErrorState,
  EmptyState,
  Txt,
} from '../src/ui';
import { space } from '../src/theme/tokens';
import { useResponsive } from '../src/theme/useResponsive';
import { listWorkOrders, getMyWorkOrders } from '../src/api/workorders.service';
import { WorkOrder } from '../src/api/types';

type FilterKey = 'TODAS' | 'MIAS' | 'ABIERTA' | 'EN_PROCESO' | 'CERRADA';

const FILTERS: ChipOption<FilterKey>[] = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'MIAS', label: 'Mías' },
  { value: 'ABIERTA', label: 'Abiertas' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'CERRADA', label: 'Cerradas' },
];

/** Estados que el backend devuelve para cada filtro de estado. */
const STATUS_FILTER: Partial<Record<FilterKey, string>> = {
  ABIERTA: 'ABIERTA',
  EN_PROCESO: 'EN_PROCESO',
  CERRADA: 'CERRADA',
};

export default function OrdersScreen() {
  const router = useRouter();
  const { isPhone, pick } = useResponsive();

  const [filter, setFilter] = useState<FilterKey>('TODAS');
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (key: FilterKey, mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      let data: WorkOrder[];
      if (key === 'MIAS') data = await getMyWorkOrders();
      else if (key === 'TODAS') data = await listWorkOrders();
      else data = await listWorkOrders({ status: key });
      setOrders(data);
    } catch (e: any) {
      setError(e?.message ?? 'No se pudieron cargar las órdenes.');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Recargar cada vez que la pantalla toma foco (vuelta desde el detalle).
  useFocusEffect(
    useCallback(() => {
      load(filter);
    }, [filter, load]),
  );

  const selectFilter = (key: FilterKey) => {
    setFilter(key);
    load(key);
  };

  /**
   * Red de contención en el cliente: el filtro combinado del backend tiene un
   * bug conocido y a veces devuelve órdenes de otros estados. Volvemos a
   * filtrar acá para que la pantalla nunca contradiga el chip elegido.
   */
  const visibleOrders = useMemo(() => {
    const expected = STATUS_FILTER[filter];
    if (!expected) return orders;
    return orders.filter((o) => (o.status ?? '').toUpperCase() === expected);
  }, [orders, filter]);

  // En teléfono una sola columna; a partir de tablet la grilla se llena sola.
  const minItemWidth = isPhone ? 480 : pick({ phone: 480, tablet: 300, desktop: 320 });

  const subtitle =
    loading || error
      ? undefined
      : `${visibleOrders.length} ${visibleOrders.length === 1 ? 'orden' : 'órdenes'}`;

  const emptyDescription =
    filter === 'MIAS'
      ? 'No tenés órdenes asignadas en este momento.'
      : 'Probá con otro filtro o tirá hacia abajo para refrescar.';

  return (
    <Screen
      header={<AppHeader title="Órdenes de trabajo" subtitle={subtitle} />}
      refreshing={refreshing}
      onRefresh={() => load(filter, 'refresh')}
    >
      <View style={styles.filters}>
        <ChipSelect
          options={FILTERS}
          value={filter}
          onChange={selectFilter}
          accessibilityLabel="Filtrar órdenes por estado"
        />
      </View>

      {loading && visibleOrders.length === 0 ? (
        <LoadingState label="Cargando órdenes…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(filter)} />
      ) : visibleOrders.length === 0 ? (
        <EmptyState
          title="No hay órdenes para este filtro"
          description={emptyDescription}
          icon="clipboard-outline"
          actionLabel={filter === 'TODAS' ? undefined : 'Ver todas'}
          onAction={filter === 'TODAS' ? undefined : () => selectFilter('TODAS')}
        />
      ) : (
        <>
          <Grid minItemWidth={minItemWidth} gap={space.md}>
            {visibleOrders.map((o) => (
              <WorkOrderCard
                key={o.id}
                order={o}
                onPress={() =>
                  router.push({ pathname: '/order-detail', params: { id: String(o.id) } })
                }
              />
            ))}
          </Grid>
          <Txt variant="caption" tone="muted" align="center">
            Tirá hacia abajo para actualizar
          </Txt>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { marginBottom: space.xs },
});
