import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import QRScannerModal from '../components/QRScanner';
import PhotoCameraModal from '../components/PhotoCamera';
import { getMachineByQr } from '../src/api/machines.service';
import { Machine } from '../src/api/types';
import { ApiError } from '../src/api/client';
import { useAuth } from '../src/auth/AuthContext';
import {
  AppHeader,
  Button,
  Card,
  DetailRow,
  Grid,
  LevelBadge,
  LoadingState,
  MachineStatusPill,
  Screen,
  SectionTitle,
  Txt,
  roleLabel,
  useConfirm,
} from '../src/ui';
import { color, layout, radius, space, touch, typography } from '../src/theme/tokens';
import { useResponsive } from '../src/theme/useResponsive';

/** Roles que gestionan la programación preventiva (mismo criterio que la navegación). */
const PLAN_ROLES = ['SUPERVISOR', 'JEFE_PLANTA', 'MANTENIMIENTO'];

/** Ancho mínimo de una tarjeta de sección: dos columnas en escritorio, una en teléfono. */
const SECTION_ITEM_WIDTH = layout.maxProseWidth / 2;

type MdiName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Acceso a una sección: tarjeta pulsable, con alto mínimo de planta. */
function ActionTile({
  icon,
  title,
  description,
  onPress,
  tone = 'plain',
}: {
  icon: MdiName;
  title: string;
  description: string;
  onPress: () => void;
  tone?: 'plain' | 'brand';
}) {
  const isBrand = tone === 'brand';
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${title}. ${description}`}
      style={isBrand ? [styles.tile, styles.tileBrand] : [styles.tile]}
    >
      <View style={isBrand ? [styles.tileIcon, styles.tileIconBrand] : styles.tileIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={typography.h1.fontSize}
          color={isBrand ? color.onBrand : color.brand}
        />
      </View>
      <View style={styles.tileText}>
        <Txt variant="bodyStrong" tone={isBrand ? 'onBrand' : 'default'}>
          {title}
        </Txt>
        <Txt variant="caption" tone={isBrand ? 'onBrand' : 'secondary'}>
          {description}
        </Txt>
      </View>
    </Card>
  );
}

/**
 * Hub del operario.
 *
 * Lo que antes era contenido fijo ("Prensa #14", estados de adorno) pasó a ser
 * un centro de acciones: la acción principal es escanear el QR de la máquina y el
 * resultado del escaneo se muestra en una tarjeta con el estado real del equipo,
 * en vez de un diálogo de texto plano.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isWide } = useResponsive();
  const { confirm, dialog } = useConfirm();

  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const canSeePlans = !!user?.role && PLAN_ROLES.includes(user.role);
  const greeting = user?.firstName ? `Hola, ${user.firstName}` : 'Inicio';

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Cerrar sesión',
      message: '¿Querés salir de tu cuenta?',
      confirmLabel: 'Salir',
      variant: 'danger',
    });
    if (ok) await logout();
  };

  const ensureCamera = async () => {
    if (!permission) return false;
    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) return false;
    }
    return true;
  };

  const handleOpenScanner = async () => {
    const granted = await ensureCamera();
    if (!granted) {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos acceso a la cámara para escanear el QR de la máquina.',
      );
      return;
    }
    setIsScanning(true);
  };

  const handleBarcodeScanned = async (data: string) => {
    setIsScanning(false);
    setLookingUp(true);
    setScanError(null);
    setMachine(null);
    try {
      const found = await getMachineByQr(data);
      setMachine(found);
    } catch (e) {
      const msg =
        e instanceof ApiError && e.status === 404
          ? `No se encontró ninguna máquina con el código: ${data}`
          : e instanceof ApiError
            ? e.message
            : 'No se pudo conectar con el servidor.';
      setScanError(msg);
    } finally {
      setLookingUp(false);
    }
  };

  const handleReportMachine = () => {
    if (!machine) return;
    router.push({
      pathname: '/report',
      params: {
        machineId: String(machine.id),
        machineName: machine.name,
        machineSector: machine.sector ?? '',
        machineStatus: machine.currentStatus,
      },
    });
  };

  const handleOpenPhotoCamera = async () => {
    const granted = await ensureCamera();
    if (!granted) {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara para tomar fotos.');
      return;
    }
    setIsTakingPhoto(true);
  };

  const handlePhotoTaken = (uri: string) => {
    setIsTakingPhoto(false);
    router.push({ pathname: '/report', params: { initialPhotoUri: uri } });
  };

  return (
    <Screen
      header={
        <AppHeader
          title={greeting}
          subtitle={user ? `${roleLabel(user.role)} · ${user.email}` : undefined}
          actions={
            <Pressable
              onPress={() =>
                Alert.alert('Notificaciones', 'Todavía no tenés avisos pendientes.')
              }
              hitSlop={touch.iconHitSlop}
              accessibilityRole="button"
              accessibilityLabel="Notificaciones"
            >
              <Ionicons
                name="notifications-outline"
                size={typography.h2.fontSize}
                color={color.textSecondary}
              />
            </Pressable>
          }
        />
      }
    >
      {/* ACCIÓN PRINCIPAL: ESCANEAR EL QR DE LA MÁQUINA */}
      <Card style={styles.hero}>
        <View style={isWide ? [styles.heroBody, styles.heroBodyWide] : styles.heroBody}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={touch.primaryAction}
              color={color.brand}
            />
          </View>
          <View style={styles.heroText}>
            <Txt variant={isWide ? 'h1' : 'h2'}>Escaneá la máquina</Txt>
            <Txt variant="body" tone="secondary">
              Apuntá al QR pegado en el equipo para ver su estado y abrir un reporte.
            </Txt>
          </View>
        </View>
        <Button
          label="Escanear QR"
          icon="qr-code-outline"
          size="lg"
          block={!isWide}
          loading={lookingUp}
          onPress={handleOpenScanner}
          accessibilityHint="Abre la cámara para leer el código QR de la máquina"
          style={isWide ? styles.heroAction : undefined}
        />
      </Card>

      {/* RESULTADO DEL ESCANEO */}
      {lookingUp ? (
        <Card>
          <LoadingState label="Buscando máquina…" />
        </Card>
      ) : null}

      {!lookingUp && scanError ? (
        <Card tone="accent" accentColor={color.danger} style={styles.resultCard}>
          <Txt variant="h3">QR no reconocido</Txt>
          <Txt variant="caption" tone="secondary">
            {scanError}
          </Txt>
          <View style={styles.resultActions}>
            <Button label="Escanear de nuevo" variant="secondary" icon="qr-code-outline" onPress={handleOpenScanner} />
            <Button label="Descartar" variant="ghost" onPress={() => setScanError(null)} />
          </View>
        </Card>
      ) : null}

      {!lookingUp && machine ? (
        <Card tone="accent" accentColor={color.brand} style={styles.resultCard}>
          <View style={styles.resultHead}>
            <View style={styles.resultTitle}>
              <Txt variant="h3">{machine.name}</Txt>
              <Txt variant="caption" tone="muted">
                {machine.plantName}
              </Txt>
            </View>
            <MachineStatusPill status={machine.currentStatus} />
          </View>

          <View style={styles.badgeRow}>
            <LevelBadge level={machine.criticality} prefix="Criticidad" />
          </View>

          <View>
            <DetailRow label="Sector" value={machine.sector ?? '—'} />
            <DetailRow label="Código QR" value={machine.qrCode} />
          </View>

          <View style={styles.resultActions}>
            <Button
              label="Reportar falla"
              icon="alert-circle-outline"
              onPress={handleReportMachine}
              accessibilityHint="Abre el formulario de reporte para esta máquina"
            />
            <Button label="Descartar" variant="ghost" onPress={() => setMachine(null)} />
          </View>
        </Card>
      ) : null}

      {/* ACCESOS RÁPIDOS */}
      <SectionTitle title="Acciones rápidas" />
      <Grid>
        <ActionTile
          icon="camera-outline"
          title="Capturar falla"
          description="Sacá una foto y abrí el reporte"
          onPress={handleOpenPhotoCamera}
        />
        <ActionTile
          icon="message-plus-outline"
          title="Solicitar ayuda"
          description="Contactá a soporte de Mantech"
          onPress={() => router.push('/support')}
        />
      </Grid>

      <SectionTitle title="Secciones" />
      <Grid minItemWidth={SECTION_ITEM_WIDTH}>
        <ActionTile
          icon="clipboard-list-outline"
          title="Órdenes de trabajo"
          description="Ver, asignar y ejecutar mantenimientos"
          tone="brand"
          onPress={() => router.push('/orders')}
        />
        <ActionTile
          icon="chart-box-outline"
          title="Indicadores (KPIs)"
          description="Disponibilidad, MTTR, MTBF y más"
          onPress={() => router.push('/dashboard')}
        />
        {canSeePlans ? (
          <ActionTile
            icon="calendar-clock"
            title="Planes preventivos"
            description="Programación y agenda de mantenimiento"
            onPress={() => router.push('/preventive-plans')}
          />
        ) : null}
        <ActionTile
          icon="account-star-outline"
          title="Sobre nosotros"
          description="Conocé al equipo de Mantech Latam"
          onPress={() => router.push('/about')}
        />
      </Grid>

      {/* AYUDA */}
      <Card tone="sunken" style={styles.tips}>
        <View style={styles.tipRow}>
          <MaterialCommunityIcons
            name="information-outline"
            size={typography.h3.fontSize}
            color={color.brand}
          />
          <Txt variant="caption" tone="secondary" style={styles.tipText}>
            Escaneá el QR de la máquina para abrir un reporte.
          </Txt>
        </View>
        <View style={styles.tipRow}>
          <MaterialCommunityIcons
            name="microphone-outline"
            size={typography.h3.fontSize}
            color={color.brand}
          />
          <Txt variant="caption" tone="secondary" style={styles.tipText}>
            Podés grabar un audio si no podés escribir.
          </Txt>
        </View>
      </Card>

      <Button
        label="Cerrar sesión"
        variant="ghost"
        icon="log-out-outline"
        onPress={handleLogout}
        accessibilityHint="Cierra tu sesión y vuelve al inicio"
      />

      {/* MODAL QR */}
      <QRScannerModal
        visible={isScanning}
        onClose={() => setIsScanning(false)}
        onScan={handleBarcodeScanned}
      />

      {/* MODAL DE FOTO */}
      <PhotoCameraModal
        visible={isTakingPhoto}
        onClose={() => setIsTakingPhoto(false)}
        onPhotoTaken={handlePhotoTaken}
      />

      {dialog}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: space.lg },
  heroBody: { gap: space.md },
  heroBodyWide: { flexDirection: 'row', alignItems: 'center' },
  heroIcon: {
    width: touch.primaryAction + space.xxl,
    height: touch.primaryAction + space.xxl,
    borderRadius: radius.lg,
    backgroundColor: color.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, gap: space.xs },
  heroAction: { alignSelf: 'flex-start' },

  resultCard: { gap: space.md },
  resultHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.md,
  },
  resultTitle: { flex: 1, gap: space.xxs },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  resultActions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },

  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: touch.minTarget + space.xxl,
    height: '100%',
  },
  tileBrand: { backgroundColor: color.brand, borderColor: color.brand },
  tileIcon: {
    width: touch.minTarget,
    height: touch.minTarget,
    borderRadius: radius.md,
    backgroundColor: color.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconBrand: { backgroundColor: color.brandDark },
  tileText: { flex: 1, gap: space.xxs },

  tips: { gap: space.md },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  tipText: { flex: 1 },
});
