import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER SUPERIOR */}
      <View style={styles.topHeader}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoM}>M</Text>
          <Text style={styles.logoTextBold}>Mantech </Text>
          <Text style={styles.logoTextLight}>Latam</Text>
        </View>
        <View style={styles.headerIcons}>
          <Feather name="search" size={24} color="#717171" />
          <Ionicons name="notifications-outline" size={24} color="#717171" style={styles.iconSpacing} />
          <Ionicons name="chatbubble-outline" size={24} color="#717171" />
        </View>
      </View>
      <View style={styles.headerDivider} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TITULO Y ESTADO */}
        <View style={styles.machineHeader}>
          <Text style={styles.title}>Prensa #14</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>OPERATIVA</Text>
          </View>
        </View>

        {/* TARJETA QR */}
        <View style={styles.qrCard}>
          <MaterialCommunityIcons name="qrcode-scan" size={100} color="#0F172A" style={styles.qrIcon} />
          <TouchableOpacity style={styles.qrButton}>
            <Text style={styles.qrButtonText}>ESCANEAR QR</Text>
          </TouchableOpacity>
        </View>

        {/* BARRA DE ESTADOS */}
        <View style={styles.statusBarCard}>
          <View style={styles.statusItem}>
            <MaterialIcons name="check-circle" size={24} color="#2F9E44" />
            <Text style={styles.statusText}>Operativa</Text>
          </View>
          <View style={styles.statusItem}>
            <MaterialIcons name="build" size={22} color="#F59E0B" />
            <Text style={styles.statusText}>Preventivo</Text>
          </View>
          <View style={styles.statusItem}>
            <MaterialCommunityIcons name="alarm-light" size={24} color="#DC2626" />
            <Text style={styles.statusNumberText}>1</Text>
          </View>
        </View>

        {/* TARJETA DE ACCIONES */}
        <View style={styles.actionsCard}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/report')} // <-- Agregá esto
          >
            <Feather name="camera" size={30} color="#0B3A6E" />
            <Text style={styles.actionText}>Capturar{"\n"}Falla</Text>
          </TouchableOpacity>
          <View style={styles.verticalDivider} />
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="message-plus-outline" size={30} color="#717171" />
            <Text style={styles.actionText}>Solicitar{"\n"}Ayuda</Text>
          </TouchableOpacity>
        </View>

        {/* TARJETA DE INSTRUCCIONES */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Feather name="info" size={24} color="#0B3A6E" />
            <Text style={styles.infoText}>Escaneá el QR de la máquina para abrir un Reporte.</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="mic" size={24} color="#0B3A6E" />
            <Text style={styles.infoText}>Podés grabar un Audio si no podes escribir.</Text>
          </View>
        </View>

        {/* SOBRE NOSOTROS */}
      <TouchableOpacity 
        style={styles.aboutUsContainer}
        onPress={() => router.push('/about')} // <-- Agregá esta línea
      >
        <MaterialCommunityIcons name="account-star-outline" size={32} color="#0B3A6E" />
        <Text style={styles.aboutUsText}>Sobre Nosotros</Text>
      </TouchableOpacity>

      </ScrollView>

      {/* NAVEGACIÓN INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="document-text-outline" size={28} color="#0B3A6E" />
          <Text style={styles.navText}>Mis Reportes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#F5F5F5',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoM: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0B3A6E',
    marginRight: 8,
    fontStyle: 'italic',
  },
  logoTextBold: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  logoTextLight: {
    fontSize: 22,
    fontWeight: '400',
    color: '#0B3A6E',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconSpacing: {
    marginHorizontal: 15,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Espacio para que el nav inferior no tape el contenido
  },
  machineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: '#0F172A',
    marginRight: 15,
  },
  badge: {
    backgroundColor: '#2F9E44',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4, // Esto le da la sombra en tu Xiaomi/Android
    shadowColor: '#0F172A', // Esto es para iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  qrIcon: {
    marginBottom: 30,
  },
  qrButton: {
    backgroundColor: '#4C84E6',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  statusBarCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
  },
  statusNumberText: {
    marginLeft: 5,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  actionText: {
    fontWeight: '700',
    fontSize: 16,
    color: 'rgba(15, 23, 42, 0.8)',
    marginLeft: 10,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 15,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginLeft: 15,
    flex: 1,
  },
  aboutUsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingLeft: 10,
  },
  aboutUsText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 10,
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