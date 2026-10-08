import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { AuthUser } from '../api/types';
import { login as loginRequest } from '../api/auth.service';
import { setUnauthorizedHandler } from '../api/client';
import { clearSession, getToken, getUser, setToken, setUser } from './tokenStore';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Decodifica el `exp` del JWT y dice si ya venció. */
function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    let b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    b64 += '='.repeat((4 - (b64.length % 4)) % 4);
    const json = globalThis.atob ? globalThis.atob(b64) : '';
    if (!json) return false;
    const { exp } = JSON.parse(json);
    if (!exp) return false; // sin exp -> no asumimos vencido
    return exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sesion guardada al abrir la app (descartando tokens vencidos).
  useEffect(() => {
    (async () => {
      try {
        const [token, savedUser] = await Promise.all([getToken(), getUser()]);
        if (token && savedUser && !isTokenExpired(token)) {
          setUserState(savedUser);
        } else if (token) {
          await clearSession(); // token vencido/corrupto -> limpiar
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Si una request devuelve 401 (sesión vencida), cerramos sesión y vamos al login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setUserState(null);
      router.replace('/');
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginRequest(email.trim(), password);
    const authUser: AuthUser = {
      email: res.email,
      firstName: res.firstName,
      lastName: res.lastName,
      role: res.role,
    };
    await setToken(res.token);
    await setUser(authUser);
    setUserState(authUser);
  };

  const logout = async () => {
    await clearSession();
    setUserState(null);
    router.replace('/');
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAuthenticated: !!user, login, logout }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
