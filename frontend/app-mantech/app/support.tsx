import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SupportScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={28} color="#0B3A6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Soporte</Text>
        <View style={styles.headerIconContainer}>
          <MaterialCommunityIcons name="headset" size={36} color="#0B3A6E" />
          <View style={styles.chatBubbleIcon}>
            <MaterialCommunityIcons name="message-processing-outline" size={18} color="#0B3A6E" />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SUBTÍTULO */}
        <Text style={styles.subheader}>
          ¿Necesitas Ayuda?  <Text style={styles.separator}>|</Text>  ¿Problemas en la Planta?
        </Text>

        {/* TARJETA: TELÉFONO */}
        <TouchableOpacity style={styles.contactCard}>
          <Feather name="phone-call" size={32} color="#0B3A6E" style={styles.cardIcon} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Contactar por Teléfono</Text>
            <View style={styles.highlightBadge}>
              <Text style={styles.highlightText}>+54 03496 123456</Text>
            </View>
            <Text style={styles.cardSubtext}>Lunes a Viernes de 8:00 a 18:00 hs.</Text>
          </View>
        </TouchableOpacity>

        {/* TARJETA: CORREO */}
        <TouchableOpacity style={styles.contactCard}>
          <MaterialCommunityIcons name="message-text-outline" size={32} color="#0B3A6E" style={styles.cardIcon} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Enviar Gmail a:</Text>
            <View style={styles.highlightBadge}>
              <Text style={styles.highlightText}>help@mantech.com</Text>
            </View>
            <Text style={styles.cardSubtext}>+ Foto del Problema + Descripción</Text>
          </View>
        </TouchableOpacity>

        {/* TÍTULO PREGUNTAS FRECUENTES */}
        <View style={styles.faqHeader}>
          <Feather name="info" size={24} color="#F59E0B" />
          <Text style={styles.faqTitle}>Preguntas Frecuentes</Text>
        </View>

        {/* TARJETA PREGUNTAS FRECUENTES */}
        <View style={styles.faqCard}>
          
          <View style={styles.faqItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4C84E6" style={styles.faqCheck} />
            <View style={styles.faqTextContainer}>
              <Text style={styles.question}>¿Qué hago si la máquina está en estado Preventivo (amarillo)?</Text>
              <Text style={styles.answer}>Podés seguir operando con precaución. Revisá el checklist rápido (ruidos, vibraciones, pérdidas) y dejá asentado el reporte para que mantenimiento lo programe.</Text>
            </View>
          </View>

          <View style={styles.faqItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4C84E6" style={styles.faqCheck} />
            <View style={styles.faqTextContainer}>
              <Text style={styles.question}>¿Cómo adjunto fotos o audio al reporte?</Text>
              <Text style={styles.answer}>Al tocar Reportar Falla, podés sacar una foto en el momento o grabar un audio si no podés escribir. Eso ayuda a que soporte entienda mejor el problema.</Text>
            </View>
          </View>

          <View style={styles.faqItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4C84E6" style={styles.faqCheck} />
            <View style={styles.faqTextContainer}>
              <Text style={styles.question}>¿Qué pasa si marco una Falla por error?</Text>
              <Text style={styles.answer}>No pasa nada. Podés editar o cancelar el reporte desde Mis Reportes. Si ya fue tomado por mantenimiento, dejá una nota aclarando el error.</Text>
            </View>
          </View>

          <View style={styles.faqDivider} />

          <TouchableOpacity style={styles.moreFaqButton}>
            <Text style={styles.moreFaqText}>Ver Más Preguntas Frecuentes</Text>
            <Feather name="chevron-right" size={18} color="#0B3A6E" />
          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* NAVEGACIÓN INFERIOR (Soporte Activo) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/report')}>
          <Ionicons name="document-text-outline" size={28} color="#0B3A6E" />
          <Text style={styles.navText}>Mis Reportes</Text>
        </TouchableOpacity>
        
        {/* Le agregamos la ruta para que también te lleve al inicio o a donde decidas */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="time-outline" size={28} color="#0B3A6E" />
          <Text style={styles.navText}>Historial</Text>
        </TouchableOpacity>
        
        {/* Este queda igual porque es la pantalla actual */}
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Feather name="info" size={28} color="#0B3A6E" />
          <Text style={styles.navText}>Soporte</Text>
          <View style={styles.activeIndicator} />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#0F172A', marginLeft: 15 },
  headerIconContainer: { flexDirection: 'row', position: 'relative', paddingRight: 10 },
  chatBubbleIcon: { position: 'absolute', top: -5, right: -5, backgroundColor: '#F5F5F5', borderRadius: 10, padding: 2 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  subheader: { fontSize: 16, fontWeight: '500', color: '#0F172A', textAlign: 'center', marginBottom: 25 },
  separator: { color: '#717171', fontWeight: '300' },
  contactCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  cardIcon: { marginRight: 20, marginTop: 5 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#000000', marginBottom: 5 },
  highlightBadge: { backgroundColor: 'rgba(245, 158, 11, 0.2)', alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, marginBottom: 5 },
  highlightText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  cardSubtext: { fontSize: 13, color: '#717171' },
  faqHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 15, paddingHorizontal: 5 },
  faqTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginLeft: 10 },
  faqCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  faqItem: { flexDirection: 'row', marginBottom: 20 },
  faqCheck: { marginRight: 10, marginTop: 2 },
  faqTextContainer: { flex: 1 },
  question: { fontSize: 14, fontWeight: '700', color: '#0B3A6E', marginBottom: 5 },
  answer: { fontSize: 13, color: '#000000', lineHeight: 18 },
  faqDivider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 15 },
  moreFaqButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moreFaqText: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 10, justifyContent: 'space-around', borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10 },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  navItemActive: { position: 'relative' },
  navText: { fontSize: 12, fontWeight: '500', color: '#0F172A', marginTop: 4 },
  activeIndicator: { position: 'absolute', bottom: -10, width: '100%', height: 4, backgroundColor: '#717171', borderRadius: 2 }
});