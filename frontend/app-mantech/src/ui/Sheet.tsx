import React, { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, elevation, layout, radius, space, touch } from '../theme/tokens';
import { useResponsive } from '../theme/useResponsive';
import { Txt } from './Text';
import { Button, ButtonVariant } from './Button';

export interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Acciones al pie; en teléfono se apilan a ancho completo. */
  footer?: React.ReactNode;
}

/**
 * Diálogo de la app.
 *
 * En teléfono se presenta como hoja anclada abajo (el pulgar llega); en pantalla
 * ancha, como tarjeta centrada. Reemplaza el overlay duplicado literal entre
 * el detalle de orden y los planes preventivos.
 */
export function Sheet({ visible, title, onClose, children, footer }: SheetProps) {
  const { isWide } = useResponsive();

  return (
    <Modal visible={visible} transparent animationType={isWide ? 'fade' : 'slide'} onRequestClose={onClose}>
      <View style={[styles.overlay, isWide ? styles.overlayCentered : styles.overlayBottom]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cerrar" />
        <View
          style={[
            styles.sheet,
            isWide ? styles.sheetWide : styles.sheetPhone,
          ]}
        >
          <View style={styles.header}>
            <Txt variant="h2" style={styles.headerTitle}>
              {title}
            </Txt>
            <Pressable
              onPress={onClose}
              hitSlop={touch.iconHitSlop}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              style={styles.close}
            >
              <Ionicons name="close" size={22} color={color.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Confirmación
// ---------------------------------------------------------------------------

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ButtonVariant;
}

/**
 * Confirmación de acciones destructivas.
 *
 * No usa `Alert.alert`: en la web (react-native-web) los diálogos con varios
 * botones y callbacks no funcionan de forma confiable, y cancelar una orden,
 * eliminar un plan o cerrar sesión dependían de eso.
 */
export function useConfirm() {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (ok: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => setState({ options, resolve }));
  }, []);

  const settle = useCallback(
    (ok: boolean) => {
      state?.resolve(ok);
      setState(null);
    },
    [state],
  );

  const dialog = state ? (
    <Sheet
      visible
      title={state.options.title}
      onClose={() => settle(false)}
      footer={
        <View style={styles.confirmActions}>
          <Button
            label={state.options.cancelLabel ?? 'Volver'}
            variant="secondary"
            onPress={() => settle(false)}
            style={styles.confirmButton}
          />
          <Button
            label={state.options.confirmLabel ?? 'Confirmar'}
            variant={state.options.variant ?? 'danger'}
            onPress={() => settle(true)}
            style={styles.confirmButton}
          />
        </View>
      }
    >
      {state.options.message ? (
        <Txt variant="body" tone="secondary">
          {state.options.message}
        </Txt>
      ) : null}
    </Sheet>
  ) : null;

  return { confirm, dialog };
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: color.overlay },
  overlayCentered: { alignItems: 'center', justifyContent: 'center', padding: space.xl },
  overlayBottom: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: color.surface,
    ...elevation.high,
    overflow: 'hidden',
  },
  sheetPhone: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '88%',
    paddingBottom: space.sm,
  },
  sheetWide: {
    borderRadius: radius.lg,
    width: '100%',
    maxWidth: 520,
    maxHeight: '86%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    paddingBottom: space.md,
  },
  headerTitle: { flex: 1 },
  close: { padding: space.xs },
  body: { paddingHorizontal: space.xl, paddingBottom: space.lg, gap: space.lg },
  footer: {
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    paddingBottom: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.borderSubtle,
    gap: space.sm,
  },
  confirmActions: { flexDirection: 'row', gap: space.sm },
  confirmButton: { flex: 1 },
  maxRef: { maxWidth: layout.maxProseWidth },
});
