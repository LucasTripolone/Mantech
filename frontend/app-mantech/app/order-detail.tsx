import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuth } from '../src/auth/AuthContext';
import {
  Screen,
  AppHeader,
  Card,
  SectionTitle,
  DetailRow,
  StatusBadge,
  LevelBadge,
  TypeBadge,
  Button,
  Txt,
  Field,
  Sheet,
  useConfirm,
  LoadingState,
  ErrorState,
  formatDateTime,
  formatDuration,
  typeLabel,
  roleLabel,
} from '../src/ui';
import { color, space } from '../src/theme/tokens';
import { useResponsive } from '../src/theme/useResponsive';
import {
  getWorkOrder, startWorkOrder, finishWorkOrder, cancelWorkOrder,
} from '../src/api/workorders.service';
import { WorkOrder } from '../src/api/types';

const EXECUTOR_ROLES = ['MANTENIMIENTO', 'SUPERVISOR', 'JEFE_PLANTA'];
const MANAGER_ROLES = ['SUPERVISOR', 'JEFE_PLANTA'];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { isWide } = useResponsive();
  const { confirm, dialog } = useConfirm();
  const orderId = Number(id);

  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [closeVisible, setCloseVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setOrder(await getWorkOrder(orderId));
    } catch (e: any) {
      setLoadError(e?.message ?? 'No se pudo cargar la orden.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const canExecute = !!user && EXECUTOR_ROLES.includes(user.role);
  const canManage = !!user && MANAGER_ROLES.includes(user.role);

  const doStart = async () => {
    setActing(true);
    setActionError(null);
    try {
      setOrder(await startWorkOrder(orderId));
      setNotice('Trabajo iniciado. El reloj de la orden está corriendo.');
    } catch (e: any) {
      setActionError(e?.message ?? 'No se pudo iniciar la orden.');
    } finally {
      setActing(false);
    }
  };

  const doFinish = async () => {
    setActing(true);
    setActionError(null);
    try {
      const updated = await finishWorkOrder(orderId, notes.trim() || undefined, signature.trim() || undefined);
      setOrder(updated);
      setCloseVisible(false);
      setNotes('');
      setSignature('');
      setNotice(`Orden cerrada. Duración registrada: ${formatDuration(updated.durationMinutes)}.`);
    } catch (e: any) {
      setActionError(e?.message ?? 'No se pudo cerrar la orden.');
    } finally {
      setActing(false);
    }
  };

  const doCancel = async () => {
    const ok = await confirm({
      title: 'Cancelar orden',
      message: '¿Seguro que querés cancelar esta orden de trabajo? La acción no se puede deshacer.',
      confirmLabel: 'Sí, cancelar',
      cancelLabel: 'No, volver',
      variant: 'danger',
    });
    if (!ok) return;
    setActing(true);
    setActionError(null);
    try {
      setOrder(await cancelWorkOrder(orderId));
      setNotice('La orden quedó cancelada.');
    } catch (e: any) {
      setActionError(e?.message ?? 'No se pudo cancelar.');
    } finally {
      setActing(false);
    }
  };

  // --- Estados de pantalla -------------------------------------------------

  if (loading && !order) {
    return (
      <Screen header={<AppHeader title="Orden de trabajo" back />}>
        <LoadingState label="Cargando orden…" />
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen header={<AppHeader title="Orden de trabajo" back />}>
        <ErrorState message={loadError} onRetry={load} />
        {dialog}
      </Screen>
    );
  }

  const isOpen = order.status === 'ABIERTA' || order.status === 'ASIGNADA';
  const inProgress = order.status === 'EN_PROCESO';
  const isClosed = order.status === 'CERRADA' || order.status === 'CANCELADA';

  const showStart = isOpen && canExecute;
  const showFinish = inProgress && canExecute;
  const showCancel = !isClosed && canManage;
  const hasActions = showStart || showFinish || showCancel;

  const footer = hasActions || actionError ? (
    <View style={styles.footerInner}>
      {actionError ? (
        <Txt variant="caption" tone="danger">
          {actionError}
        </Txt>
      ) : null}
      <View style={[styles.actions, isWide && styles.actionsWide]}>
        {showStart ? (
          <Button
            label="Iniciar trabajo"
            icon="play"
            size="lg"
            variant="primary"
            loading={acting}
            onPress={doStart}
            accessibilityHint="Registra el inicio del trabajo en esta orden"
            style={styles.action}
          />
        ) : null}
        {showFinish ? (
          <Button
            label="Finalizar"
            icon="checkmark-circle"
            size="lg"
            variant="success"
            disabled={acting}
            onPress={() => setCloseVisible(true)}
            accessibilityHint="Abre el formulario de cierre de la orden"
            style={styles.action}
          />
        ) : null}
        {showCancel ? (
          <Button
            label="Cancelar orden"
            icon="close-circle"
            size="lg"
            variant="secondary"
            disabled={acting}
            onPress={doCancel}
            accessibilityHint="Cancela definitivamente esta orden de trabajo"
            style={styles.action}
          />
        ) : null}
      </View>
    </View>
  ) : null;

  return (
    <Screen
      header={
        <AppHeader
          title={`Orden #${order.id}`}
          subtitle={order.machineName ?? undefined}
          back
        />
      }
      footer={footer}
      refreshing={loading}
      onRefresh={load}
    >
      {notice ? (
        <Card tone="accent" accentColor={color.success} style={styles.notice}>
          <Txt variant="bodyStrong" tone="success">{notice}</Txt>
        </Card>
      ) : null}

      {/* Bloque 1: identificación */}
      <Card style={styles.card}>
        <View style={styles.identityRow}>
          <StatusBadge status={order.status} />
          <TypeBadge type={order.type} size="md" />
          {order.priority ? <LevelBadge level={order.priority} prefix="Prioridad" size="md" /> : null}
        </View>
        <DetailRow label="Orden" value={`#${order.id}`} />
        <DetailRow label="Tipo" value={typeLabel(order.type)} />
        <DetailRow label="Creada por" value={order.createdBy ?? undefined} />
        {order.reportId != null ? (
          <DetailRow label="Reporte de origen" value={`#${order.reportId}`} />
        ) : null}
      </Card>

      {/* Bloque 2: activo */}
      <Card style={styles.card}>
        <SectionTitle title="Activo" />
        <DetailRow label="Máquina" value={order.machineName} />
        <DetailRow label="Sector" value={order.machineSector ?? undefined} />
        <DetailRow label="Criticidad">
          {order.machineCriticality ? (
            <LevelBadge level={order.machineCriticality} size="md" />
          ) : (
            <Txt variant="body" tone="muted">—</Txt>
          )}
        </DetailRow>
        <DetailRow label="Planta" value={order.plantName ?? undefined} />
      </Card>

      {/* Bloque 3: información operativa */}
      <Card style={styles.card}>
        <SectionTitle title="Información operativa" />
        <DetailRow label="Descripción" value={order.description ?? undefined} />
        <DetailRow label="Tipo de falla" value={order.failureType ?? undefined} />
        <DetailRow label="Impacto">
          {order.impact ? (
            <LevelBadge level={order.impact} kind="impact" size="md" />
          ) : (
            <Txt variant="body" tone="muted">—</Txt>
          )}
        </DetailRow>
        <DetailRow label="¿Detuvo producción?">
          <Txt variant="bodyStrong" tone={order.stoppedProduction ? 'danger' : 'secondary'}>
            {order.stoppedProduction ? 'Sí' : 'No'}
          </Txt>
        </DetailRow>
      </Card>

      {/* Bloque 4: ejecución */}
      <Card style={styles.card}>
        <SectionTitle title="Ejecución" />
        <DetailRow label="Técnico" value={order.assignedTechnician ?? undefined}>
          {order.assignedTechnician ? undefined : (
            <Txt variant="body" tone="muted">Sin asignar</Txt>
          )}
        </DetailRow>
        <DetailRow label="Creada" value={formatDateTime(order.createdAt)} />
        <DetailRow label="Programada" value={formatDateTime(order.scheduledAt)} />
        <DetailRow label="Inicio" value={formatDateTime(order.startedAt)} />
        <DetailRow label="Fin" value={formatDateTime(order.finishedAt)} />
        <DetailRow label="Duración">
          <Txt
            variant="bodyStrong"
            tone={order.durationMinutes == null ? 'muted' : 'success'}
            tabular
          >
            {formatDuration(order.durationMinutes)}
          </Txt>
        </DetailRow>
      </Card>

      {/* Bloque 5: cierre */}
      <Card style={styles.card}>
        <SectionTitle title="Cierre" />
        <DetailRow label="Resolución" value={order.resolutionNotes ?? undefined}>
          {order.resolutionNotes ? undefined : (
            <Txt variant="body" tone="muted">
              {isClosed ? 'Sin notas de resolución' : 'Pendiente'}
            </Txt>
          )}
        </DetailRow>
        <DetailRow label="Firma" value={order.signature ?? undefined} />
        {user ? <DetailRow label="Tu rol" value={roleLabel(user.role)} /> : null}
      </Card>

      {/* Hoja de cierre: notas de resolución + firma */}
      <Sheet
        visible={closeVisible}
        title={`Cerrar orden #${order.id}`}
        onClose={() => setCloseVisible(false)}
        footer={
          <View style={styles.sheetActions}>
            <Button
              label="Volver"
              variant="secondary"
              disabled={acting}
              onPress={() => setCloseVisible(false)}
              style={styles.action}
            />
            <Button
              label="Confirmar cierre"
              variant="success"
              loading={acting}
              onPress={doFinish}
              accessibilityHint="Registra el cierre de la orden con las notas y la firma"
              style={styles.action}
            />
          </View>
        }
      >
        <Txt variant="caption" tone="secondary">
          Contá qué se hizo y firmá con tu nombre. Al confirmar se registra la duración del trabajo.
        </Txt>
        <Field
          label="Notas de resolución"
          placeholder="¿Qué se hizo para resolverla?"
          multiline
          value={notes}
          onChangeText={setNotes}
          hint="Opcional, pero ayuda al próximo turno."
        />
        <Field
          label="Firma (tu nombre)"
          placeholder="Nombre y apellido"
          value={signature}
          onChangeText={setSignature}
        />
      </Sheet>

      {dialog}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.xxs },
  notice: { gap: space.xs },
  identityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.sm,
    paddingBottom: space.sm,
  },
  footerInner: { gap: space.sm },
  actions: { gap: space.sm },
  actionsWide: { flexDirection: 'row' },
  action: { flex: 1 },
  sheetActions: { flexDirection: 'row', gap: space.sm },
});
