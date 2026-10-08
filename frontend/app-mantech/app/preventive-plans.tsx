import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../src/auth/AuthContext';
import {
  listPlans,
  createPlan,
  deletePlan,
  setPlanActive,
  generateDuePlans,
} from '../src/api/plans.service';
import { getAgenda } from '../src/api/workorders.service';
import { listMachines } from '../src/api/machines.service';
import { getTechnicians, UserSummary } from '../src/api/users.service';
import { PreventivePlan, WorkOrder, Machine, FrequencyType } from '../src/api/types';
import { color, radius, space, touch } from '../src/theme/tokens';
import { useResponsive } from '../src/theme/useResponsive';
import {
  AppHeader,
  Button,
  Card,
  ChipOption,
  ChipSelect,
  Counter,
  EmptyState,
  ErrorState,
  Field,
  Grid,
  LoadingState,
  Screen,
  SectionTitle,
  Sheet,
  Txt,
  WorkOrderCard,
  formatDateTime,
  formatDayLabel,
  formatDuration,
  useConfirm,
} from '../src/ui';

const MANAGER_ROLES = ['SUPERVISOR', 'JEFE_PLANTA'];

const FREQ: ChipOption<FrequencyType>[] = [
  { value: 'DIAS', label: 'Días' },
  { value: 'SEMANAS', label: 'Semanas' },
  { value: 'MESES', label: 'Meses' },
];

/** Clave estable de agrupación por día, independiente del texto que se muestre. */
function dayKey(iso: string): string {
  return new Date(iso).toDateString();
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

interface PlanForm {
  machineId: number | null;
  title: string;
  frequencyType: FrequencyType;
  frequencyValue: string;
  durationMin: string;
  dueInDays: string;
  technicianId: number | null;
}

const EMPTY_FORM: PlanForm = {
  machineId: null,
  title: '',
  frequencyType: 'MESES',
  frequencyValue: '1',
  durationMin: '',
  dueInDays: '0',
  technicianId: null,
};

export default function PreventivePlansScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isWide } = useResponsive();
  const { confirm, dialog } = useConfirm();

  const canManage = !!user && MANAGER_ROLES.includes(user.role);

  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [agenda, setAgenda] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  /** Resultado de la última acción, en pantalla y no en un diálogo nativo. */
  const [notice, setNotice] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);

  // Alta de plan
  const [sheetVisible, setSheetVisible] = useState(false);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [techs, setTechs] = useState<UserSummary[]>([]);
  const [form, setForm] = useState<PlanForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<{ title?: string; frequency?: string; machine?: string }>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, a] = await Promise.all([listPlans(false), getAgenda()]);
      setPlans(p);
      setAgenda(a);
      setLoaded(true);
    } catch (e: any) {
      setError(e?.message ?? 'No se pudieron cargar los planes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onGenerate = async () => {
    setGenerating(true);
    setNotice(null);
    try {
      const res = await generateDuePlans();
      setNotice({
        tone: 'ok',
        text:
          res.generated === 0
            ? 'No había planes vencidos: no se generó ninguna orden.'
            : `Se generaron ${res.generated} órdenes preventivas programadas.`,
      });
      await load();
    } catch (e: any) {
      setNotice({ tone: 'bad', text: e?.message ?? 'No se pudieron generar las órdenes.' });
    } finally {
      setGenerating(false);
    }
  };

  const openSheet = async () => {
    setFormError({});
    setSheetVisible(true);
    try {
      const [m, t] = await Promise.all([listMachines(), getTechnicians()]);
      setMachines(m);
      setTechs(t);
    } catch { /* se muestran vacíos */ }
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setFormError({});
  };

  const submitPlan = async () => {
    const errors: typeof formError = {};
    if (!form.machineId) errors.machine = 'Elegí la máquina del plan.';
    if (!form.title.trim()) errors.title = 'Poné un título que identifique la tarea.';
    const value = parseInt(form.frequencyValue, 10);
    if (!value || value < 1) errors.frequency = 'La frecuencia debe ser un número mayor a 0.';
    setFormError(errors);
    if (Object.keys(errors).length > 0 || !form.machineId) return;

    setSaving(true);
    try {
      const dueInDays = parseInt(form.dueInDays, 10) || 0;
      const nextDueAt = new Date(Date.now() + dueInDays * 86400000).toISOString();
      await createPlan({
        machineId: form.machineId,
        title: form.title.trim(),
        frequencyType: form.frequencyType,
        frequencyValue: value,
        estimatedDurationMinutes: form.durationMin ? parseInt(form.durationMin, 10) : undefined,
        nextDueAt,
        assignedTechnicianId: form.technicianId ?? undefined,
      });
      setSheetVisible(false);
      setForm(EMPTY_FORM);
      setFormError({});
      setNotice({ tone: 'ok', text: 'Plan preventivo creado.' });
      await load();
    } catch (e: any) {
      setFormError({ title: e?.message ?? 'No se pudo crear el plan.' });
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (plan: PreventivePlan) => {
    try {
      await setPlanActive(plan.id, !plan.active);
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, active: !p.active } : p)));
    } catch (e: any) {
      setNotice({ tone: 'bad', text: e?.message ?? 'No se pudo actualizar el plan.' });
    }
  };

  const onDelete = async (plan: PreventivePlan) => {
    // Sin `Alert.alert`: en la web el diálogo nativo con varios botones no
    // dispara los callbacks y el plan nunca se eliminaba.
    const ok = await confirm({
      title: 'Eliminar plan',
      message: `Se va a eliminar "${plan.title}" de ${plan.machineName}. Las órdenes ya generadas no se tocan.`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'No, volver',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await deletePlan(plan.id);
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
      setNotice({ tone: 'ok', text: 'Plan eliminado.' });
    } catch (e: any) {
      setNotice({ tone: 'bad', text: e?.message ?? 'No se pudo eliminar el plan.' });
    }
  };

  // Agenda agrupada por día, en orden cronológico.
  const grouped = useMemo(() => {
    const groups: { key: string; iso: string; items: WorkOrder[] }[] = [];
    agenda
      .filter((o) => o.scheduledAt)
      .slice()
      .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
      .forEach((o) => {
        const key = dayKey(o.scheduledAt!);
        const g = groups.find((x) => x.key === key);
        if (g) g.items.push(o);
        else groups.push({ key, iso: o.scheduledAt!, items: [o] });
      });
    return groups;
  }, [agenda]);

  const activeCount = plans.filter((p) => p.active).length;

  const machineOptions: ChipOption[] = machines.map((m) => ({
    value: String(m.id),
    label: m.name,
  }));
  const techOptions: ChipOption[] = [
    { value: '', label: 'Sin técnico' },
    ...techs.map((t) => ({ value: String(t.id), label: t.fullName })),
  ];

  const showError = !!error && !loaded;

  return (
    <Screen
      header={
        <AppHeader
          title="Planes preventivos"
          subtitle="Rutinas programadas y agenda de planta"
          back
          actions={
            canManage && isWide ? (
              <Button label="Nuevo plan" icon="add" onPress={openSheet} />
            ) : null
          }
        />
      }
      refreshing={loading}
      onRefresh={load}
    >
      {/* Acciones */}
      <Grid minItemWidth={canManage && !isWide ? 160 : 240}>
        <Button
          label="Generar preventivas"
          icon="sync-outline"
          loading={generating}
          onPress={onGenerate}
          block
          accessibilityHint="Crea las órdenes de los planes cuyo vencimiento ya pasó"
        />
        {canManage && !isWide ? (
          <Button label="Nuevo plan" variant="secondary" icon="add" onPress={openSheet} block />
        ) : null}
      </Grid>

      {notice ? (
        <Card tone="accent" accentColor={notice.tone === 'ok' ? color.success : color.danger}>
          <Txt variant="bodyStrong" tone={notice.tone === 'ok' ? 'success' : 'danger'}>
            {notice.tone === 'ok' ? 'Listo' : 'No se pudo completar'}
          </Txt>
          <Txt variant="caption" tone="secondary">
            {notice.text}
          </Txt>
        </Card>
      ) : null}

      {showError ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading && !loaded ? (
        <LoadingState label="Cargando planes y agenda…" />
      ) : (
        <>
          {error && loaded ? (
            <Card tone="accent" accentColor={color.danger}>
              <Txt variant="captionStrong" tone="danger">
                No pudimos actualizar
              </Txt>
              <Txt variant="caption" tone="secondary">
                {error} Estás viendo la última información cargada.
              </Txt>
            </Card>
          ) : null}

          <Card style={styles.counters}>
            <Counter label="Planes" value={plans.length} />
            <View style={styles.divider} />
            <Counter label="Activos" value={activeCount} tone="good" />
            <View style={styles.divider} />
            <Counter label="En pausa" value={plans.length - activeCount} tone="warn" />
            <View style={styles.divider} />
            <Counter label="Programadas" value={agenda.length} />
          </Card>

          {/* PLANES */}
          <View style={styles.section}>
            <SectionTitle title={`Planes (${plans.length})`} />
            {plans.length === 0 ? (
              <EmptyState
                title="Todavía no hay planes preventivos"
                description="Un plan define cada cuánto se repite una rutina sobre una máquina y genera las órdenes solo."
                icon="calendar-outline"
                actionLabel={canManage ? 'Crear el primer plan' : undefined}
                onAction={canManage ? openSheet : undefined}
              />
            ) : (
              <Grid minItemWidth={340}>
                {plans.map((p) => (
                  <PlanCard
                    key={p.id}
                    plan={p}
                    canManage={canManage}
                    onToggle={() => onToggle(p)}
                    onDelete={() => onDelete(p)}
                  />
                ))}
              </Grid>
            )}
          </View>

          {/* AGENDA */}
          <View style={styles.section}>
            <SectionTitle title="Agenda programada" />
            {grouped.length === 0 ? (
              <EmptyState
                title="Sin órdenes programadas"
                description="Tocá “Generar preventivas” para crear las órdenes de los planes vencidos."
                icon="time-outline"
              />
            ) : (
              grouped.map((g) => (
                <View key={g.key} style={styles.dayGroup}>
                  <View style={styles.dayHeader}>
                    <Txt variant="overline" tone="brand">
                      {formatDayLabel(g.iso).toUpperCase()}
                    </Txt>
                    <Txt variant="caption" tone="muted" tabular>
                      {g.items.length} {g.items.length === 1 ? 'orden' : 'órdenes'}
                    </Txt>
                  </View>
                  <Grid minItemWidth={300}>
                    {g.items.map((o) => (
                      <WorkOrderCard
                        key={o.id}
                        order={{
                          ...o,
                          description: o.description
                            ? `${timeLabel(o.scheduledAt!)} · ${o.description}`
                            : `${timeLabel(o.scheduledAt!)} · ${o.type}`,
                        }}
                        onPress={() =>
                          router.push({ pathname: '/order-detail', params: { id: String(o.id) } })
                        }
                      />
                    ))}
                  </Grid>
                </View>
              ))
            )}
          </View>
        </>
      )}

      {/* ALTA DE PLAN */}
      <Sheet
        visible={sheetVisible}
        title="Nuevo plan preventivo"
        onClose={closeSheet}
        footer={
          <View style={styles.sheetActions}>
            <Button
              label="Cancelar"
              variant="secondary"
              onPress={closeSheet}
              disabled={saving}
              style={styles.sheetAction}
            />
            <Button
              label="Crear plan"
              onPress={submitPlan}
              loading={saving}
              style={styles.sheetAction}
            />
          </View>
        }
      >
        <ChipSelect
          label="Máquina"
          options={machineOptions}
          value={form.machineId == null ? null : String(form.machineId)}
          onChange={(v) => {
            setForm((f) => ({ ...f, machineId: Number(v) }));
            setFormError((e) => ({ ...e, machine: undefined }));
          }}
          accessibilityLabel="Elegir máquina del plan"
        />
        {formError.machine ? (
          <Txt variant="caption" tone="danger">
            {formError.machine}
          </Txt>
        ) : null}

        <Field
          label="Título"
          placeholder="Ej: Lubricación mensual"
          value={form.title}
          error={formError.title}
          onChangeText={(t) => {
            setForm((f) => ({ ...f, title: t }));
            setFormError((e) => ({ ...e, title: undefined }));
          }}
        />

        <ChipSelect<FrequencyType>
          label="Unidad de frecuencia"
          options={FREQ}
          value={form.frequencyType}
          onChange={(v) => setForm((f) => ({ ...f, frequencyType: v }))}
          accessibilityLabel="Elegir unidad de frecuencia"
        />

        <View style={styles.formRow}>
          <Field
            label="Cada (nº)"
            keyboardType="numeric"
            value={form.frequencyValue}
            error={formError.frequency}
            containerStyle={styles.formCol}
            onChangeText={(t) => {
              setForm((f) => ({ ...f, frequencyValue: t.replace(/[^0-9]/g, '') }));
              setFormError((e) => ({ ...e, frequency: undefined }));
            }}
          />
          <Field
            label="1er venc. (días)"
            keyboardType="numeric"
            value={form.dueInDays}
            hint="0 = vence hoy"
            containerStyle={styles.formCol}
            onChangeText={(t) => setForm((f) => ({ ...f, dueInDays: t.replace(/[^0-9]/g, '') }))}
          />
        </View>

        <Field
          label="Duración estimada (min, opcional)"
          keyboardType="numeric"
          value={form.durationMin}
          onChangeText={(t) => setForm((f) => ({ ...f, durationMin: t.replace(/[^0-9]/g, '') }))}
        />

        <ChipSelect
          label="Técnico (opcional)"
          options={techOptions}
          value={form.technicianId == null ? '' : String(form.technicianId)}
          onChange={(v) => setForm((f) => ({ ...f, technicianId: v ? Number(v) : null }))}
          accessibilityLabel="Asignar técnico al plan"
        />
      </Sheet>

      {dialog}
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta de plan
// ---------------------------------------------------------------------------

function PlanCard({
  plan,
  canManage,
  onToggle,
  onDelete,
}: {
  plan: PreventivePlan;
  canManage: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const overdue = new Date(plan.nextDueAt).getTime() < Date.now();

  return (
    <Card
      tone="accent"
      accentColor={!plan.active ? color.border : overdue ? color.danger : color.success}
      style={styles.planCard}
    >
      <View style={styles.planTop}>
        <View style={styles.planTitles}>
          <Txt variant="bodyStrong" numberOfLines={2}>
            {plan.title}
          </Txt>
          <Txt variant="caption" tone="secondary" numberOfLines={1}>
            {plan.machineName}
          </Txt>
        </View>
        <View
          style={[styles.statePill, plan.active ? styles.statePillOn : styles.statePillOff]}
          accessibilityLabel={plan.active ? 'Plan activo' : 'Plan en pausa'}
        >
          <Txt variant="overline" tone={plan.active ? 'success' : 'muted'}>
            {plan.active ? 'ACTIVO' : 'EN PAUSA'}
          </Txt>
        </View>
      </View>

      <View style={styles.planMeta}>
        <MetaPill text={plan.frequencyLabel} />
        <MetaPill
          text={`Próximo: ${formatDateTime(plan.nextDueAt)}`}
          tone={plan.active && overdue ? 'bad' : 'neutral'}
        />
        {plan.estimatedDurationMinutes != null ? (
          <MetaPill text={formatDuration(plan.estimatedDurationMinutes)} />
        ) : null}
      </View>

      <Txt variant="caption" tone="muted">
        {plan.assignedTechnician ? `Técnico: ${plan.assignedTechnician}` : 'Sin técnico asignado'}
      </Txt>

      {canManage ? (
        <View style={styles.planActions}>
          <Button
            label={plan.active ? 'Pausar' : 'Activar'}
            variant="secondary"
            icon={plan.active ? 'pause-outline' : 'play-outline'}
            onPress={onToggle}
            style={styles.planAction}
            accessibilityHint={
              plan.active
                ? 'Deja de generar órdenes para este plan'
                : 'Vuelve a generar órdenes para este plan'
            }
          />
          <Button
            label="Eliminar"
            variant="danger"
            icon="trash-outline"
            onPress={onDelete}
            style={styles.planAction}
            accessibilityHint="Pide confirmación antes de eliminar el plan"
          />
        </View>
      ) : null}
    </Card>
  );
}

function MetaPill({ text, tone = 'neutral' }: { text: string; tone?: 'neutral' | 'bad' }) {
  return (
    <View style={[styles.metaPill, tone === 'bad' && styles.metaPillBad]}>
      <Txt variant="caption" tone={tone === 'bad' ? 'danger' : 'brand'}>
        {text}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.md },
  counters: { flexDirection: 'row', alignItems: 'center' },
  divider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: color.border },

  dayGroup: { gap: space.sm },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },

  planCard: { gap: space.sm, flex: 1 },
  planTop: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  planTitles: { flex: 1, gap: space.xxs },
  statePill: {
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
  },
  statePillOn: { backgroundColor: color.successBg },
  statePillOff: { backgroundColor: color.surfaceMuted },
  planMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  metaPill: {
    backgroundColor: color.brandTint,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  metaPillBad: { backgroundColor: color.dangerBg },
  planActions: { flexDirection: 'row', gap: space.sm, minHeight: touch.minTarget },
  planAction: { flex: 1 },

  sheetActions: { flexDirection: 'row', gap: space.sm },
  sheetAction: { flex: 1 },
  formRow: { flexDirection: 'row', gap: space.md },
  formCol: { flex: 1 },
});
