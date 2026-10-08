import React from 'react';
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color, layout, space, touch } from '../theme/tokens';
import { useResponsive } from '../theme/useResponsive';
import { Txt } from './Text';
import { AppNavigation, SIDEBAR_WIDTH, useNavPlacement } from './Navigation';
import { useAuth } from '../auth/AuthContext';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** Muestra la flecha de volver. */
  back?: boolean;
  /** Acciones a la derecha del título. */
  actions?: React.ReactNode;
}

/**
 * Encabezado de pantalla.
 *
 * Reemplaza las cuatro copias del mismo marcado que había en el detalle de
 * orden, el tablero, los planes y los reportes.
 */
export function AppHeader({ title, subtitle, back, actions }: AppHeaderProps) {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { user, logout } = useAuth();

  return (
    <View style={styles.header}>
      {back ? (
        <Pressable
          onPress={() => router.back()}
          hitSlop={touch.iconHitSlop}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={color.text} />
        </Pressable>
      ) : null}

      <View style={styles.headerTitles}>
        <Txt variant={isDesktop ? 'h1' : 'h2'} numberOfLines={1}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="caption" tone="secondary" numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : null}
      </View>

      <View style={styles.headerActions}>
        {actions}
        {/* En escritorio el cierre de sesión vive en la barra lateral. */}
        {!isDesktop && user ? (
          <Pressable
            onPress={logout}
            hitSlop={touch.iconHitSlop}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            style={styles.backButton}
          >
            <Ionicons name="log-out-outline" size={21} color={color.textSecondary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export interface ScreenProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  /** Oculta la navegación (login, por ejemplo). */
  nav?: boolean;
  /** Contenido fijo al pie, por encima de la navegación. */
  footer?: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: ViewStyle;
}

/**
 * Contenedor de pantalla.
 *
 * Resuelve de una vez lo que antes estaba repetido o faltaba: área segura,
 * fondo, ancho máximo del contenido y ubicación de la navegación según el
 * tamaño de ventana. En escritorio la navegación pasa al costado y el contenido
 * deja de estirarse a todo el ancho del monitor.
 */
export function Screen({
  children,
  header,
  nav = true,
  footer,
  scroll = true,
  refreshing,
  onRefresh,
  contentStyle,
}: ScreenProps) {
  const { isDesktop, width } = useResponsive();
  const placement = useNavPlacement();
  const showSide = nav && placement === 'side';
  const showBottom = nav && placement === 'bottom';

  // Ancho explícito en vez de `maxWidth` sobre un padre sin ancho definido: ahí
  // el contenido largo empuja el contenedor hasta el máximo y desborda la
  // ventana en teléfono. Descontamos la barra lateral cuando está presente.
  const available = Math.max(0, width - (showSide ? SIDEBAR_WIDTH : 0));
  const columnWidth = Math.min(available, layout.maxContentWidth);

  const inner = (
    <View style={[styles.contentColumn, { width: columnWidth }]}>
      {header}
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={isDesktop}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!refreshing}
                onRefresh={onRefresh}
                tintColor={color.brand}
                colors={[color.brand]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, styles.scrollContent, contentStyle]}>{children}</View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={showSide ? ['top', 'bottom'] : ['top']}>
      <View style={styles.row}>
        {showSide ? <AppNavigation placement="side" /> : null}
        <View style={styles.main}>{inner}</View>
      </View>
      {showBottom ? <AppNavigation placement="bottom" /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.background },
  row: { flex: 1, flexDirection: 'row' },
  main: { flex: 1 },
  contentColumn: {
    flex: 1,
    alignSelf: 'center',
  },
  scroll: { flex: 1, width: '100%' },
  scrollContent: {
    // `width: 100%` es necesario: sin él, el contenedor de scroll se dimensiona
    // según su contenido y un texto largo lo empuja más allá del ancho de la
    // ventana, desbordando la pantalla en teléfono.
    width: '100%',
    maxWidth: '100%',
    padding: layout.screenPadding,
    paddingBottom: space.huge,
    gap: space.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: layout.screenPadding,
    paddingTop: space.lg,
    paddingBottom: space.md,
  },
  headerTitles: { flex: 1, gap: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  backButton: {
    width: touch.minTarget - 8,
    height: touch.minTarget - 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.borderSubtle,
    backgroundColor: color.surface,
    gap: space.sm,
    ...(Platform.OS === 'web' ? {} : {}),
  },
});
