import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthUser } from '../api/types';

const TOKEN_KEY = 'mantech_token';
const USER_KEY = 'mantech_user';

// Cache en memoria para evitar I/O en cada request.
let memoryToken: string | null = null;

const isWeb = Platform.OS === 'web';

async function readItem(key: string): Promise<string | null> {
  try {
    if (isWeb) return globalThis.localStorage?.getItem(key) ?? null;
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeItem(key: string, value: string): Promise<void> {
  if (isWeb) globalThis.localStorage?.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) globalThis.localStorage?.removeItem(key);
  else await SecureStore.deleteItemAsync(key);
}

export async function getUser(): Promise<AuthUser | null> {
  const raw = await readItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function setUser(user: AuthUser): Promise<void> {
  await writeItem(USER_KEY, JSON.stringify(user));
}

export async function getToken(): Promise<string | null> {
  if (memoryToken !== null) return memoryToken;
  memoryToken = await readItem(TOKEN_KEY);
  return memoryToken;
}

export async function setToken(token: string): Promise<void> {
  memoryToken = token;
  await writeItem(TOKEN_KEY, token);
}

/** Borra token y usuario: cierre de sesion completo. */
export async function clearSession(): Promise<void> {
  memoryToken = null;
  await removeItem(TOKEN_KEY);
  await removeItem(USER_KEY);
}
