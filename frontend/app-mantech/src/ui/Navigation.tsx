import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { color, elevation, radius, space, touch } from '../theme/tokens';
import { useResponsive } from '../theme/useResponsive';
import { Txt } from './Text';
import { useAuth } from '../auth/AuthContext';

type IconName = keyof typeof Ionicons.glyphMap;

/** Ancho de la barra lateral de escritorio; lo descuenta `Screen` del contenido. */
export const SIDEBAR_WIDTH = 232;

export interface NavItem {
  route: string;
  label: string;
  icon: IconName;
  /** Icono de MaterialCommunity cuando Ionicons no tiene el símbolo justo. */
  mdi?: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Roles que ven la entrada; vacío = todos. */
  roles?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { route: '/home', label: 'Inicio', icon: 'home-outline' },
  { route: '/orders', label: 'Órdenes', icon: 'clipboard-outline', mdi: 'clipboard-list-outline' },
  { route: '/report', label: 'Reportar', icon: 'add-circle-outline' },
  { route: '/dashboard', label: 'Tablero', icon: 'stats-chart-outline' },
  { route: '/sensor', label: 'Sensores', icon: 'hardware-chip-outline' },
  {
    route: '/preventive-plans',
    label: 'Planes',
    icon: 'calendar-outline',
    roles: ['SUPERVISOR', 'JEFE_PLANTA', 'MANTENIMIENTO'],
  },
];

function visibleItems(role?: string | null): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || (role ? item.roles.includes(role) : false));
}

function isActive(pathname: string, route: string): boolean {
  if (route === '/home') return pathname === '/home' || pathname === '/';
  return pathname.startsWith(route);
}

function NavIcon({ item, active }: { item: NavItem; active: boolean }) {
  const tint = active ? color.brand : color.textSecondary;
  if (item.mdi) {
    return <MaterialCommunityIcons name={item.mdi} size={24} color={tint} />;
  }
  return <Ionicons name={item.icon} size={24} color={tint} />;
}

/**
 * Barra inferior para teléfono.
 *
 * El estado activo se marca con color e indicador, no sólo con una barrita gris:
 * antes los cinco iconos eran del mismo color y no se distinguía dónde estabas.
 */
function BottomBar({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const router = useRouter();
  return (
    <View style={styles.bottomBar} accessibilityRole="tablist">
      {items.map((item) => {
        const active = isActive(pathname, item.route);
        return (
          <Pressable
            key={item.route}
            onPress={() => !active && router.push(item.route as never)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            style={styles.bottomItem}
          >
            <View style={[styles.bottomIndicator, active && styles.bottomIndicatorActive]} />
            <NavIcon item={item} active={active} />
            <Txt variant="overline" style={{ color: active ? color.brand : color.textSecondary }}>
              {item.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Navegación lateral para escritorio, con identidad de marca y cierre de sesión. */
function SideBar({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <View style={styles.sidebar} accessibilityRole="tablist">
      <View style={styles.brand}>
        <View style={styles.brandMark}>
          <Txt variant="h2" style={{ color: color.onBrand }}>
            M
          </Txt>
        </View>
        <View style={styles.brandText}>
          <Txt variant="h3">Mantech</Txt>
          <Txt variant="overline" tone="muted">
            GESTIÓN DE ACTIVOS
          </Txt>
        </View>
      </View>

      <View style={styles.sideItems}>
        {items.map((item) => {
          const active = isActive(pathname, item.route);
          return (
            <Pressable
              key={item.route}
              onPress={() => !active && router.push(item.route as never)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[styles.sideItem, active && styles.sideItemActive]}
            >
              <NavIcon item={item} active={active} />
              <Txt
                variant="bodyStrong"
                style={{ color: active ? color.brand : color.textSecondary }}
              >
                {item.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      {user ? (
        <View style={styles.sideFooter}>
          <View style={styles.avatar}>
            <Txt variant="captionStrong" style={{ color: color.brand }}>
              {(user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')}
            </Txt>
          </View>
          <View style={styles.sideUser}>
            <Txt variant="captionStrong" numberOfLines={1}>
              {user.firstName} {user.lastName}
            </Txt>
            <Txt variant="overline" tone="muted" numberOfLines={1}>
              {(user.role ?? '').replace('_', ' ')}
            </Txt>
          </View>
          <Pressable
            onPress={logout}
            hitSlop={touch.iconHitSlop}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Ionicons name="log-out-outline" size={20} color={color.textSecondary} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export function AppNavigation({ placement }: { placement: 'bottom' | 'side' }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = visibleItems(user?.role);

  if (items.length === 0) return null;
  return placement === 'side' ? (
    <SideBar items={items} pathname={pathname} />
  ) : (
    <BottomBar items={items} pathname={pathname} />
  );
}

export function useNavPlacement(): 'bottom' | 'side' {
  const { isDesktop } = useResponsive();
  return isDesktop ? 'side' : 'bottom';
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: color.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.border,
    paddingBottom: Platform.OS === 'ios' ? space.xl : space.sm,
    paddingTop: space.xxs,
    ...elevation.medium,
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: touch.minTarget,
    paddingVertical: space.xs,
  },
  bottomIndicator: { height: 3, width: 26, borderRadius: radius.pill, backgroundColor: 'transparent' },
  bottomIndicatorActive: { backgroundColor: color.brand },

  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: color.surface,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: color.border,
    paddingVertical: space.xl,
    paddingHorizontal: space.md,
    gap: space.xl,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.sm },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { flex: 1 },
  sideItems: { gap: space.xxs, flex: 1 },
  sideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: touch.minTarget,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
  },
  sideItemActive: { backgroundColor: color.brandTint },
  sideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingTop: space.md,
    paddingHorizontal: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.borderSubtle,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideUser: { flex: 1 },
});
