import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Si más adelante querés configurar algo específico por pantalla, se hace acá adentro */}
    </Stack>
  );
}