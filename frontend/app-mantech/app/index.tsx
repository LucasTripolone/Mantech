import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/auth/AuthContext';
import { ApiError } from '../src/api/client';
import { Button, Card, Field, Screen, Txt } from '../src/ui';
import { color, layout, radius, space, touch, typography } from '../src/theme/tokens';
import { useResponsive } from '../src/theme/useResponsive';

/**
 * Login.
 *
 * Misma lógica que antes (`useAuth().login` y redirección a /home), pero los
 * errores se muestran en línea junto al campo que los provoca en vez de en un
 * diálogo nativo, que en la web no se comporta igual que en el teléfono.
 */
export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { isWide } = useResponsive();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async () => {
    const missingEmail = !email.trim();
    const missingPassword = !password;
    setEmailError(missingEmail ? 'Ingresá tu correo.' : null);
    setPasswordError(missingPassword ? 'Ingresá tu contraseña.' : null);
    setFormError(null);
    if (missingEmail || missingPassword) return;

    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/home');
    } catch (e) {
      const msg =
        e instanceof ApiError && e.status === 401
          ? 'Correo o contraseña incorrectos.'
          : e instanceof ApiError
            ? e.message
            : 'No se pudo iniciar sesión. Revisá tu conexión.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen nav={false} contentStyle={styles.content}>
      <View style={styles.column}>
        {/* Marca */}
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Txt variant="h1" tone="onBrand">
              M
            </Txt>
          </View>
          <View>
            <Txt variant={isWide ? 'display' : 'h1'}>
              Mantech <Txt variant={isWide ? 'display' : 'h1'} tone="brand">Latam</Txt>
            </Txt>
            <Txt variant="overline" tone="muted">
              SIMPLICIDAD GENERA RENTABILIDAD
            </Txt>
          </View>
        </View>

        {/* Tarjeta de ingreso */}
        <Card style={styles.card}>
          <View style={styles.cardHead}>
            <Txt variant="h2">Iniciar sesión</Txt>
            <Txt variant="caption" tone="secondary">
              Entrá con tu cuenta de planta para ver tus órdenes y reportar fallas.
            </Txt>
          </View>

          <Field
            label="Correo electrónico"
            placeholder="nombre@empresa.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(null);
              if (formError) setFormError(null);
            }}
            editable={!submitting}
            error={emailError}
            returnKeyType="next"
          />

          <Field
            label="Contraseña"
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError(null);
              if (formError) setFormError(null);
            }}
            editable={!submitting}
            error={passwordError}
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />

          {formError ? (
            <View style={styles.formError} accessibilityRole="alert">
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={typography.bodyLg.fontSize}
                color={color.danger}
              />
              <Txt variant="caption" tone="danger" style={styles.formErrorText}>
                {formError}
              </Txt>
            </View>
          ) : null}

          <Button
            label="Ingresar"
            size="lg"
            block
            icon="log-in-outline"
            loading={submitting}
            onPress={handleLogin}
            accessibilityHint="Inicia sesión con el correo y la contraseña ingresados"
          />

          <Pressable
            onPress={() =>
              Alert.alert(
                'Recuperar contraseña',
                'Pedile a tu supervisor que restablezca tu contraseña desde el panel de Mantech.',
              )
            }
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="¿Olvidaste tu contraseña?"
            style={styles.forgot}
          >
            <Txt variant="captionStrong" tone="brand">
              ¿Olvidaste tu contraseña?
            </Txt>
          </Pressable>
        </Card>

        <Txt variant="overline" tone="muted" align="center">
          AGROINDUSTRIA | METALMECÁNICA
        </Txt>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  column: {
    // Ocupa el ancho disponible y recién ahí la acota `maxWidth`, centrándose
    // con `alignSelf` cuando sobra lugar.
    width: '100%',
    maxWidth: layout.maxProseWidth,
    alignSelf: 'center',
    gap: space.xxl,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  brandMark: {
    width: touch.minTarget,
    height: touch.minTarget,
    borderRadius: radius.md,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { gap: space.lg },
  cardHead: { gap: space.xs },
  formError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: color.dangerBg,
  },
  formErrorText: { flex: 1 },
  forgot: {
    minHeight: touch.minTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
