import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/auth/AuthContext';
import { color } from '../src/theme/tokens';
import { LoadingState } from '../src/ui';

/** Rutas accesibles sin sesión. */
const PUBLIC_ROUTES = ['/', '/index'];

/**
 * Guard de sesión.
 *
 * `isAuthenticated` e `isLoading` existían en el contexto pero no los consumía
 * nadie: en la web se podía entrar directo a /orders y ver una pantalla vacía, y
 * quien tenía sesión guardada aterrizaba igual en el login.
 */
function SessionGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isPublic) {
      router.replace('/');
    } else if (isAuthenticated && isPublic) {
      router.replace('/home');
    }
  }, [isAuthenticated, isLoading, isPublic, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: color.background, justifyContent: 'center' }}>
        <LoadingState label="Abriendo Mantech…" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <SessionGate>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: color.background },
              animation: 'fade',
            }}
          />
        </SessionGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
