import React, { useCallback, useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import QRScannerModal from '../components/QRScanner';
import PhotoCameraModal from '../components/PhotoCamera';
import AudioRecorder from '../components/AudioRecorder';
import {
  Screen,
  AppHeader,
  Card,
  Button,
  Txt,
  Field,
  Grid,
  SectionTitle,
  MachineStatusPill,
  LevelBadge,
  LoadingState,
  ErrorState,
  EmptyState,
  formatDateTime,
} from '../src/ui';
import { color, layout, radius, space, levelTone, toneFor } from '../src/theme/tokens';
import { useResponsive } from '../src/theme/useResponsive';
import { createReport, attachFile, getMyReports } from '../src/api/reports.service';
import { getMachineByQr } from '../src/api/machines.service';
import { ApiError } from '../src/api/client';
import { Report } from '../src/api/types';

const DESCRIPTION_LIMIT = 256;

/** Etiqueta legible del ciclo de vida de un reporte. */
const REPORT_STATUS_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTO: 'Resuelto',
};

type StatusTone = 'warning' | 'brand' | 'success' | 'secondary';

const REPORT_STATUS_TONE: Record<string, StatusTone> = {
  PENDIENTE: 'warning',
  EN_PROCESO: 'brand',
  RESUELTO: 'success',
};

export default function ReportScreen() {
  const router = useRouter();
  const { isWide } = useResponsive();

  // Parámetros que llegan desde el Home / escaneo QR.
  const params = useLocalSearchParams<{
    initialPhotoUri?: string;
    machineId?: string;
    machineName?: string;
    machineSector?: string;
    machineStatus?: string;
  }>();
  const { initialPhotoUri } = params;

  // Datos de la máquina (vienen del escaneo en Home, o de escanear acá).
  const [machineId, setMachineId] = useState<number | null>(
    params.machineId ? Number(params.machineId) : null,
  );
  const [machineName, setMachineName] = useState<string>(params.machineName || '');
  const [machineSector, setMachineSector] = useState<string>(params.machineSector || '');
  const [machineStatus, setMachineStatus] = useState<string>(params.machineStatus || '');
  const [machineCriticality, setMachineCriticality] = useState<string>('');

  // Permisos y modales.
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  // Contenido del reporte.
  const [photoUri, setPhotoUri] = useState<string | null>(initialPhotoUri || null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Errores en línea: antes todo error iba a un diálogo nativo que tapaba el campo.
  const [machineError, setMachineError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Mis reportes (getMyReports ya existía en el servicio y nadie lo llamaba).
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoadingReports(true);
    setReportsError(null);
    try {
      setReports(await getMyReports());
    } catch (e: any) {
      setReportsError(e?.message ?? 'No se pudieron cargar tus reportes.');
      setReports([]);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports]),
  );

  // --- QR -------------------------------------------------------------------
  const handleOpenScanner = async () => {
    if (!permission) return;
    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setMachineError('Se necesita acceso a la cámara para escanear la máquina.');
        return;
      }
    }
    setMachineError(null);
    setIsScanning(true);
  };

  const handleBarcodeScanned = async (data: string) => {
    setIsScanning(false);
    try {
      const machine = await getMachineByQr(data);
      setMachineId(machine.id);
      setMachineName(machine.name);
      setMachineSector(machine.sector ?? '');
      setMachineStatus(machine.currentStatus ?? '');
      setMachineCriticality(machine.criticality ?? '');
      setMachineError(null);
    } catch (e) {
      const msg =
        e instanceof ApiError && e.status === 404
          ? `No se encontró ninguna máquina con el código ${data}.`
          : 'No se pudo identificar la máquina.';
      setMachineError(msg);
    }
  };

  // --- Cámara de fotos ------------------------------------------------------
  const handleOpenPhotoCamera = async () => {
    if (!permission) return;
    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setSubmitError('Se necesita acceso a la cámara para tomar fotos.');
        return;
      }
    }
    setSubmitError(null);
    setIsTakingPhoto(true);
  };

  const handlePhotoTaken = (uri: string) => {
    setPhotoUri(uri);
  };

  const handleAudioRecorded = (uri: string) => {
    setAudioUri(uri);
  };

  // --- Envío ----------------------------------------------------------------
  const handleSubmitReport = async () => {
    setSubmitError(null);
    setDescriptionError(null);

    if (!machineId) {
      setMachineError('Escaneá el QR de una máquina antes de enviar el reporte.');
      return;
    }

    // Si no hay nada que mostrar, al menos pedimos una descripción.
    if (!photoUri && !audioUri && !description.trim()) {
      setDescriptionError('Contanos qué viste, o adjuntá una foto o un audio.');
      return;
    }

    setSubmitting(true);
    try {
      const report = await createReport({
        machineId,
        type: 'FALLA',
        description: description.trim() || undefined,
        priority: 'ALTA',
      });

      // Adjuntamos archivos (no bloqueamos el éxito si alguno falla).
      const attachErrors: string[] = [];
      if (photoUri) {
        try {
          await attachFile(report.id, photoUri, 'PHOTO');
        } catch {
          attachErrors.push('foto');
        }
      }
      if (audioUri) {
        try {
          await attachFile(report.id, audioUri, 'AUDIO');
        } catch {
          attachErrors.push('audio');
        }
      }

      const extra =
        attachErrors.length > 0
          ? `\n\n(No se pudo adjuntar: ${attachErrors.join(', ')})`
          : '';
      Alert.alert(
        'Reporte enviado',
        `Tu reporte para ${machineName || 'la máquina'} fue registrado y enviado a Mantenimiento.${extra}`,
        [{ text: 'OK', onPress: () => router.replace('/home') }],
      );
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : 'No se pudo enviar el reporte. Revisá tu conexión.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const machineReady = machineId !== null;

  return (
    <Screen
      header={<AppHeader title="Reportar falla" subtitle="Foto, audio y detalle" back />}
      footer={
        <Button
          label="Enviar reporte"
          icon="send"
          size="lg"
          block
          loading={submitting}
          onPress={handleSubmitReport}
          accessibilityHint="Registra la falla y la envía al equipo de mantenimiento"
        />
      }
    >
      {/* ------------------------------------------------------------------ */}
      {/* Máquina                                                            */}
      {/* ------------------------------------------------------------------ */}
      {machineReady ? (
        <Card
          tone="accent"
          accentColor={toneFor(levelTone, machineCriticality).ink}
          style={styles.block}
        >
          <Txt variant="overline" tone="muted">
            MÁQUINA DEL REPORTE
          </Txt>
          <Txt variant="h2">{machineName}</Txt>
          {machineSector ? (
            <Txt variant="caption" tone="secondary">
              {machineSector}
            </Txt>
          ) : null}
          <View style={styles.badges}>
            {machineStatus ? <MachineStatusPill status={machineStatus} /> : null}
            {machineCriticality ? (
              <LevelBadge level={machineCriticality} prefix="Criticidad" size="md" />
            ) : null}
          </View>
          <Button
            label="Escanear otra máquina"
            variant="secondary"
            icon="qr-code-outline"
            block
            onPress={handleOpenScanner}
            accessibilityHint="Abre la cámara para leer el QR de otra máquina"
          />
          {machineError ? (
            <Txt variant="caption" tone="danger">
              {machineError}
            </Txt>
          ) : null}
        </Card>
      ) : (
        <Card style={styles.block}>
          <Txt variant="overline" tone="muted">
            PASO 1
          </Txt>
          <Txt variant="h3">¿Qué máquina está fallando?</Txt>
          <Txt variant="body" tone="secondary">
            Escaneá el código QR pegado en el equipo. Así el reporte llega con el historial de esa
            máquina.
          </Txt>
          <Button
            label="Escanear código QR"
            icon="qr-code-outline"
            size="lg"
            block
            onPress={handleOpenScanner}
            accessibilityHint="Abre la cámara para leer el QR de la máquina"
          />
          {machineError ? (
            <Txt variant="caption" tone="danger">
              {machineError}
            </Txt>
          ) : null}
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Adjuntos                                                           */}
      {/* ------------------------------------------------------------------ */}
      <SectionTitle title="Evidencia" style={styles.block} />
      <Txt variant="caption" tone="secondary" style={styles.block}>
        Una foto con buena luz del problema le ahorra un viaje al técnico. Si no podés escribir,
        grabá un audio.
      </Txt>

      <Grid minItemWidth={isWide ? layout.maxProseWidth / 2 : layout.maxProseWidth} style={styles.block}>
        <Card flush style={styles.attachment}>
          <View style={styles.attachmentHead}>
            <Txt variant="captionStrong" tone="secondary">
              FOTO
            </Txt>
            {photoUri ? (
              <View style={styles.attached} accessibilityLabel="Foto adjuntada">
                <Ionicons name="checkmark-circle" size={16} color={color.success} />
                <Txt variant="captionStrong" tone="success">
                  Adjuntada
                </Txt>
              </View>
            ) : null}
          </View>

          <View style={styles.preview}>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={styles.previewImage}
                resizeMode="cover"
                accessibilityLabel="Vista previa de la foto adjunta"
              />
            ) : (
              <Ionicons name="image-outline" size={44} color={color.textDisabled} />
            )}
          </View>

          <View style={styles.attachmentFoot}>
            <Button
              label={photoUri ? 'Cambiar foto' : 'Tomar foto'}
              variant={photoUri ? 'secondary' : 'primary'}
              icon="camera"
              size="lg"
              block
              onPress={handleOpenPhotoCamera}
              accessibilityHint="Abre la cámara para fotografiar la falla"
            />
          </View>
        </Card>

        <Card flush style={styles.attachment}>
          <View style={styles.attachmentHead}>
            <Txt variant="captionStrong" tone="secondary">
              AUDIO
            </Txt>
            {audioUri ? (
              <View style={styles.attached} accessibilityLabel="Audio adjuntado">
                <Ionicons name="checkmark-circle" size={16} color={color.success} />
                <Txt variant="captionStrong" tone="success">
                  Adjuntado
                </Txt>
              </View>
            ) : null}
          </View>

          <View style={styles.attachmentFoot}>
            <AudioRecorder onAudioRecorded={handleAudioRecorded} />
            <Txt variant="caption" tone="muted">
              {audioUri
                ? 'Se enviará junto al reporte. Podés volver a grabarlo.'
                : 'Mantené apretado para contar qué pasa.'}
            </Txt>
          </View>
        </Card>
      </Grid>

      {/* ------------------------------------------------------------------ */}
      {/* Detalle                                                            */}
      {/* ------------------------------------------------------------------ */}
      <Card style={styles.block}>
        <Field
          label="Detalle de la falla"
          placeholder="Ruido metálico al arrancar, pierde aceite…"
          value={description}
          onChangeText={(t) => {
            setDescription(t.slice(0, DESCRIPTION_LIMIT));
            if (descriptionError) setDescriptionError(null);
          }}
          maxLength={DESCRIPTION_LIMIT}
          showCount
          multiline
          error={descriptionError}
          hint="Opcional si adjuntás foto o audio."
          editable={!submitting}
        />
        {submitError ? (
          <View style={styles.submitError}>
            <Ionicons name="alert-circle" size={18} color={color.danger} />
            <Txt variant="caption" tone="danger" style={styles.submitErrorText}>
              {submitError}
            </Txt>
          </View>
        ) : null}
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Mis reportes (datos reales)                                        */}
      {/* ------------------------------------------------------------------ */}
      <SectionTitle title="Mis últimos reportes" style={styles.block} />

      {loadingReports ? (
        <LoadingState label="Cargando tus reportes…" />
      ) : reportsError ? (
        <ErrorState message={reportsError} onRetry={loadReports} />
      ) : reports.length === 0 ? (
        <EmptyState
          title="Todavía no reportaste ninguna falla"
          description="Cuando envíes un reporte vas a poder seguir acá en qué estado quedó."
          icon="document-text-outline"
        />
      ) : (
        <Grid minItemWidth={isWide ? layout.maxProseWidth / 2 : layout.maxProseWidth}>
          {reports.slice(0, 6).map((r) => {
            const key = (r.status ?? '').toUpperCase();
            return (
              <Card
                key={r.id}
                tone="accent"
                accentColor={toneFor(levelTone, r.priority).ink}
                style={styles.reportCard}
              >
                <View style={styles.reportHead}>
                  <Txt variant="bodyStrong" numberOfLines={1} style={styles.reportTitle}>
                    {r.machineName}
                  </Txt>
                  <LevelBadge level={r.priority} />
                </View>
                {r.description ? (
                  <Txt variant="body" tone="secondary" numberOfLines={3}>
                    {r.description}
                  </Txt>
                ) : null}
                <View style={styles.reportFoot}>
                  <Txt variant="captionStrong" tone={REPORT_STATUS_TONE[key] ?? 'secondary'}>
                    {REPORT_STATUS_LABEL[key] ?? r.status}
                  </Txt>
                  <Txt variant="caption" tone="muted">
                    {formatDateTime(r.createdAt)}
                  </Txt>
                </View>
              </Card>
            );
          })}
        </Grid>
      )}

      {/* MODALES */}
      <QRScannerModal
        visible={isScanning}
        onClose={() => setIsScanning(false)}
        onScan={handleBarcodeScanned}
      />

      <PhotoCameraModal
        visible={isTakingPhoto}
        onClose={() => setIsTakingPhoto(false)}
        onPhotoTaken={handlePhotoTaken}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: space.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginVertical: space.sm },
  attachment: { gap: space.sm, paddingBottom: space.lg },
  attachmentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
  },
  attachmentFoot: { paddingHorizontal: space.lg, gap: space.sm },
  attached: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  preview: {
    height: space.huge * 4,
    marginHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: color.surfaceSunken,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  submitError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: color.dangerBg,
  },
  submitErrorText: { flex: 1 },
  reportCard: { gap: space.xs },
  reportHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  reportTitle: { flex: 1 },
  reportFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.xs,
  },
});
