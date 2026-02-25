import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TÍTULOS PRINCIPALES */}
        <Text style={styles.mainTitle}>Somos Mantech</Text>
        <Text style={styles.subtitleBold}>
          Gestión de Excelencia en Mantenimiento pensada para la planta real
        </Text>
        <Text style={styles.subtitleLight}>
          Hecho para operarios, supervisores y mantenimiento de Agroindustria Metalmecánica.
        </Text>

        {/* TARJETA: ¿Qué hacemos? */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="#0B3A6E" />
            <Text style={styles.cardTitle}>¿Qué hacemos?</Text>
          </View>
          <Text style={styles.cardText}>
            Mantech es una app para registrar fallas, revisar el estado de máquinas y organizar el mantenimiento en planta.{"\n\n"}
            La usamos para que el operario pueda avisar rápido y el equipo de mantenimiento tenga la información clara para actuar.
          </Text>
        </View>

        {/* SECCIÓN: Pensado para el día a día */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Pensado para el día a día en fábrica</Text>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>•</Text>
            <Text style={styles.listText}>Operarios de línea</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>•</Text>
            <Text style={styles.listText}>Supervisores de turno</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>•</Text>
            <Text style={styles.listText}>Mantenimiento mecánico / eléctrico</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>•</Text>
            <Text style={styles.listText}>Jefes de planta</Text>
          </View>
        </View>

        {/* TARJETA: Cómo funciona */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="help-circle" size={24} color="#0B3A6E" />
            <Text style={styles.cardTitle}>Cómo funciona en Planta</Text>
          </View>
          
          <View style={styles.stepRow}>
            <MaterialCommunityIcons name="qrcode-scan" size={20} color="#0B3A6E" style={styles.stepIcon} />
            <Text style={styles.stepText}>Escanéas el QR de la Máquina</Text>
          </View>
          
          <View style={styles.stepRow}>
            <MaterialCommunityIcons name="traffic-light" size={20} color="#0B3A6E" style={styles.stepIcon} />
            <Text style={styles.stepText}>Elegís: Operativa, Preventiva o Falla</Text>
          </View>
          
          <View style={styles.stepRow}>
            <Feather name="send" size={18} color="#0B3A6E" style={styles.stepIcon} />
            <Text style={styles.stepText}>Mandas foto, texto o audio</Text>
          </View>
        </View>

        {/* BOTÓN CALL TO ACTION */}
        <TouchableOpacity 
            style={styles.ctaButton} 
            onPress={() => router.push('/report')} // <-- Agregá esto
            >
            <Text style={styles.ctaButtonText}>Empezar a usar Mantech</Text>
            <Text style={styles.ctaSubText}>Registra tu primera Máquina en menos de 1 minuto</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* NAVEGACIÓN INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/report')}>
          <Ionicons name="document-text-outline" size={28} color="#0B3A6E" />
          <Text style={styles.navText}>Mis Reportes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]} onPress={() => router.push('/home')}>
          <Ionicons name="time-outline" size={28} color="#0B3A6E" />
          <Text style={styles.navText}>Historial</Text>
          <View style={styles.activeIndicator} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/support')}>
          <Feather name="info" size={28} color="#0B3A6E" />
          <Text style={styles.navText}>Soporte</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 100, // Espacio para el menú inferior
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
  },
  subtitleBold: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0F172A',
    lineHeight: 24,
    marginBottom: 10,
  },
  subtitleLight: {
    fontSize: 15,
    fontWeight: '500',
    color: '#717171',
    lineHeight: 22,
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // Sombras
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 10,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 20,
  },
  listSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listBullet: {
    fontSize: 20,
    color: '#000000',
    marginRight: 10,
  },
  listText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  ctaButton: {
    backgroundColor: '#4C84E6',
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  ctaButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  ctaSubText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    justifyContent: 'space-around',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  navItemActive: {
    position: 'relative',
  },
  navText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0F172A',
    marginTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -10,
    width: '100%',
    height: 4,
    backgroundColor: '#717171',
    borderRadius: 2,
  }
});