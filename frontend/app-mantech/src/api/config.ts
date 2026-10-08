import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Puerto donde corre el backend Spring Boot.
const BACKEND_PORT = 8080;

/**
 * Resuelve el host del backend segun donde corra la app:
 *  - Web (Expo Web): localhost
 *  - Emulador Android: 10.0.2.2 (alias del localhost de la PC host)
 *  - Dispositivo fisico (Expo Go): la IP LAN de la PC donde corre Metro,
 *    que Expo expone en Constants.expoConfig.hostUri.
 *
 * Se puede forzar con la variable de entorno EXPO_PUBLIC_API_URL.
 */
function resolveBaseUrl(): string {
  const override = process.env.EXPO_PUBLIC_API_URL;
  if (override) return override.replace(/\/$/, '');

  if (Platform.OS === 'web') {
    return `http://localhost:${BACKEND_PORT}`;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    // Campo legacy disponible en algunos runtimes de Expo Go.
    (Constants as any).manifest?.debuggerHost ??
    '';

  const host = hostUri.split(':')[0];

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    // Sin IP de Metro: en Android el localhost del host es 10.0.2.2.
    return `http://${Platform.OS === 'android' ? '10.0.2.2' : 'localhost'}:${BACKEND_PORT}`;
  }

  return `http://${host}:${BACKEND_PORT}`;
}

export const API_BASE_URL = resolveBaseUrl();
