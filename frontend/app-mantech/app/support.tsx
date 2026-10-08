import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppHeader, Card, Txt, SectionTitle } from '../src/ui';
import { color, layout, radius, space, touch } from '../src/theme/tokens';

const PHONE_LABEL = '+54 03496 123456';
const PHONE_URL = 'tel:+5403496123456';
const EMAIL_LABEL = 'help@mantech.com';
const EMAIL_URL = 'mailto:help@mantech.com?subject=Soporte%20App%20Mantech';

const FAQ: { question: string; answer: string }[] = [
  {
    question: '¿Qué hago si la máquina está en estado preventivo (amarillo)?',
    answer:
      'Podés seguir operando con precaución. Revisá el checklist rápido (ruidos, vibraciones, pérdidas) y dejá asentado el reporte para que mantenimiento lo programe.',
  },
  {
    question: '¿Cómo adjunto fotos o audio al reporte?',
    answer:
      'Al tocar Reportar falla podés sacar una foto en el momento o grabar un audio si no podés escribir. Eso ayuda a que soporte entienda mejor el problema.',
  },
  {
    question: '¿Qué pasa si marco una falla por error?',
    answer:
      'No pasa nada. Podés editar o cancelar el reporte desde Mis reportes. Si ya fue tomado por mantenimiento, dejá una nota aclarando el error.',
  },
  {
    question: '¿Cómo sé si mi reporte fue visto por mantenimiento?',
    answer:
      'En Mis reportes vas a ver el estado del caso: pendiente, en proceso o resuelto. También te llega una notificación cuando cambie el estado.',
  },
];

function ContactCard({
  icon,
  title,
  value,
  caption,
  url,
  hint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  caption: string;
  url: string;
  hint: string;
}) {
  return (
    <Card
      onPress={() => Linking.openURL(url)}
      accessibilityLabel={`${title}: ${value}`}
      style={styles.contact}
    >
      <View style={styles.contactRow}>
        <View style={styles.contactIcon}>
          <Ionicons name={icon} size={24} color={color.brand} />
        </View>
        <View style={styles.contactBody}>
          <Txt variant="captionStrong" tone="secondary">
            {title}
          </Txt>
          <Txt variant="h3" tone="brand">
            {value}
          </Txt>
          <Txt variant="caption" tone="muted">
            {caption}
          </Txt>
        </View>
        <Ionicons name="chevron-forward" size={20} color={color.textMuted} />
      </View>
      <Txt variant="caption" tone="muted" accessibilityElementsHidden>
        {hint}
      </Txt>
    </Card>
  );
}

export default function SupportScreen() {
  return (
    <Screen
      header={<AppHeader title="Soporte" subtitle="¿Problemas en la planta? Escribinos" back />}
    >
      <View style={styles.prose}>
        <ContactCard
          icon="call-outline"
          title="CONTACTAR POR TELÉFONO"
          value={PHONE_LABEL}
          caption="Lunes a viernes de 8:00 a 18:00 hs."
          url={PHONE_URL}
          hint="Toca para llamar desde este teléfono."
        />

        <ContactCard
          icon="mail-outline"
          title="ENVIAR UN CORREO"
          value={EMAIL_LABEL}
          caption="Sumá una foto del problema y una descripción corta."
          url={EMAIL_URL}
          hint="Toca para abrir tu app de correo."
        />

        <SectionTitle title="Preguntas frecuentes" />

        {FAQ.map((item) => (
          <Card key={item.question} style={styles.faq}>
            <View style={styles.faqHead}>
              <Ionicons name="help-circle" size={20} color={color.info} />
              <Txt variant="bodyStrong" style={styles.faqQuestion}>
                {item.question}
              </Txt>
            </View>
            <Txt variant="body" tone="secondary">
              {item.answer}
            </Txt>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  prose: { width: '100%', maxWidth: layout.maxProseWidth, alignSelf: 'center', gap: space.lg },
  contact: { gap: space.sm, minHeight: touch.minTarget },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  contactIcon: {
    width: space.huge,
    height: space.huge,
    borderRadius: radius.pill,
    backgroundColor: color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactBody: { flex: 1, gap: space.xxs },
  faq: { gap: space.sm },
  faqHead: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  faqQuestion: { flex: 1 },
});
