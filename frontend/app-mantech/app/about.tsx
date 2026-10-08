import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen, AppHeader, Card, Txt, Button, SectionTitle } from '../src/ui';
import { color, layout, radius, space } from '../src/theme/tokens';

const AUDIENCES = [
  'Operarios de línea',
  'Supervisores de turno',
  'Mantenimiento mecánico y eléctrico',
  'Jefes de planta',
];

const STEPS: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }[] = [
  {
    icon: 'qr-code-outline',
    title: 'Escaneás el QR de la máquina',
    text: 'El código pegado en el equipo identifica el activo y su historial.',
  },
  {
    icon: 'options-outline',
    title: 'Elegís el estado',
    text: 'Operativa, en preventivo o en falla: el semáforo que ya se usa en planta.',
  },
  {
    icon: 'send-outline',
    title: 'Mandás foto, texto o audio',
    text: 'Si no podés escribir con guantes, grabás un audio y listo.',
  },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <Screen header={<AppHeader title="Somos Mantech" subtitle="Gestión de mantenimiento" back />}>
      <View style={styles.prose}>
        <Card style={styles.card}>
          <Txt variant="h2">Gestión de excelencia en mantenimiento, pensada para la planta real</Txt>
          <Txt variant="bodyLg" tone="secondary">
            Hecho para operarios, supervisores y mantenimiento de la agroindustria metalmecánica.
          </Txt>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.icon}>
              <Ionicons name="clipboard-outline" size={20} color={color.brand} />
            </View>
            <Txt variant="h3">¿Qué hacemos?</Txt>
          </View>
          <Txt variant="body" tone="secondary">
            Mantech es una app para registrar fallas, revisar el estado de las máquinas y organizar
            el mantenimiento en planta.
          </Txt>
          <Txt variant="body" tone="secondary">
            La usamos para que el operario pueda avisar rápido y el equipo de mantenimiento tenga la
            información clara para actuar.
          </Txt>
        </Card>

        <SectionTitle title="Pensado para el día a día en fábrica" />
        <Card style={styles.card}>
          {AUDIENCES.map((a) => (
            <View key={a} style={styles.listRow}>
              <Ionicons name="checkmark-circle" size={20} color={color.success} />
              <Txt variant="body" style={styles.listText}>
                {a}
              </Txt>
            </View>
          ))}
        </Card>

        <SectionTitle title="Cómo funciona en planta" />
        <Card style={styles.card}>
          {STEPS.map((s, i) => (
            <View key={s.title} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Txt variant="captionStrong" tone="brand" tabular>
                  {i + 1}
                </Txt>
              </View>
              <View style={styles.stepBody}>
                <View style={styles.stepTitle}>
                  <Ionicons name={s.icon} size={18} color={color.brand} />
                  <Txt variant="bodyStrong">{s.title}</Txt>
                </View>
                <Txt variant="caption" tone="secondary">
                  {s.text}
                </Txt>
              </View>
            </View>
          ))}
        </Card>

        <Card tone="sunken" style={styles.cta}>
          <Txt variant="h3" align="center">
            Empezá a usar Mantech
          </Txt>
          <Txt variant="caption" tone="secondary" align="center">
            Registrá tu primer reporte en menos de un minuto.
          </Txt>
          <Button
            label="Reportar una falla"
            icon="alert-circle-outline"
            size="lg"
            block
            onPress={() => router.push('/report')}
            accessibilityHint="Abre el formulario de reporte de falla"
          />
          <Button
            label="Ver soporte y preguntas frecuentes"
            variant="ghost"
            icon="help-buoy-outline"
            block
            onPress={() => router.push('/support')}
            accessibilityHint="Abre la pantalla de soporte"
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  prose: { width: '100%', maxWidth: layout.maxProseWidth, alignSelf: 'center', gap: space.lg },
  card: { gap: space.sm },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icon: {
    width: space.xxxl,
    height: space.xxxl,
    borderRadius: radius.pill,
    backgroundColor: color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  listText: { flex: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  stepNumber: {
    width: space.xxl,
    height: space.xxl,
    borderRadius: radius.pill,
    backgroundColor: color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBody: { flex: 1, gap: space.xxs },
  stepTitle: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  cta: { gap: space.md, alignItems: 'stretch' },
});
