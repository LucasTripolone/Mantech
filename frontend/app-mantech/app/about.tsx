import { Text, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles } from './about.styles'; // <-- IMPORTAMOS LOS ESTILOS

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
            onPress={() => router.push('/report')}
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