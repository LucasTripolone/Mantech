import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ReportScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* HEADER FIJO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={28} color="#0B3A6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportar Falla</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ==========================================
            PANTALLA 1 (COMPACT 2) - FORMULARIO 
        ========================================== */}
        <View style={styles.machineInfoContainer}>
          <View style={styles.machineTitleRow}>
            <MaterialCommunityIcons name="arrow-up-circle" size={24} color="#2F9E44" />
            <Text style={styles.machineName}>Mezcladora B1 – Línea{"\n"}de Producción 2</Text>
          </View>
          <View style={styles.badgePreventivo}>
            <MaterialCommunityIcons name="wrench" size={16} color="#FFFFFF" style={styles.badgeIcon}/>
            <Text style={styles.badgeText}>PREVENTIVO</Text>
          </View>
        </View>

        <Text style={styles.instructions}>
          Saca una foto, con luz clara, del problema para que el Técnico lo arregle rápido.
        </Text>

        <View style={styles.photoContainer}>
          <MaterialCommunityIcons name="camera-image" size={60} color="#D9D9D9" />
          <TouchableOpacity style={styles.newPhotoButton}>
            <Feather name="camera" size={18} color="#FFFFFF" />
            <Text style={styles.newPhotoText}>Nueva Foto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.audioContainer}>
          <View style={styles.audioHeader}>
            <MaterialCommunityIcons name="microphone-outline" size={30} color="#0B3A6E" />
            <Text style={styles.audioTitle}>Graba un Audio explicando{"\n"}el problema <Text style={styles.textLight}>(opcional)</Text></Text>
          </View>
          <View style={styles.audioPlayer}>
            <MaterialCommunityIcons name="play-circle" size={40} color="#2F9E44" />
            <Text style={styles.audioTime}>0:14</Text>
            <View style={styles.progressBar}><View style={styles.progressFill} /></View>
            <MaterialCommunityIcons name="pause-circle" size={40} color="#F59E0B" />
            <Feather name="send" size={28} color="#0B3A6E" style={styles.sendIcon} />
          </View>
        </View>

        <Text style={styles.inputLabel}>Detalle Opcional</Text>
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.textInput}
            placeholder="Podes escribir lo que viste"
            placeholderTextColor="#717171"
            multiline={true}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>0/256</Text>
        </View>

        <View style={styles.noteContainer}>
          <Feather name="alert-circle" size={20} color="#717171" />
          <Text style={styles.noteText}>NOTA: Podés escribir sólo como guía y adjuntar audio si no podés usar el teclado.</Text>
        </View>

        <View style={styles.divider} />

        {/* ==========================================
            PANTALLA 2 (COMPACT 3) - FEED REPORTES 
        ========================================== */}
        <Text style={styles.sectionTitle}>Mis Últimos Reportes</Text>

        {/* Item 1 */}
        <View style={styles.reportItem}>
          <View style={styles.reportHeader}>
            <View style={styles.reportStatus}>
              <MaterialIcons name="check-circle" size={20} color="#2F9E44" />
              <Text style={styles.statusText}>Operativo</Text>
            </View>
            <Text style={styles.reportDate}>Hoy, 14:30 hs.</Text>
          </View>
          <Text style={styles.reportDesc}>Revisión correcta de Puente Grúa</Text>
        </View>

        {/* Item 2 */}
        <View style={styles.reportItem}>
          <View style={styles.reportHeader}>
            <View style={styles.reportStatus}>
              <MaterialIcons name="build" size={18} color="#F59E0B" />
              <Text style={styles.statusText}>Preventivo</Text>
            </View>
            <Text style={styles.reportDate}>Ayer, 10:45 hs.</Text>
          </View>
          <Text style={styles.reportDesc}>Ruido raro en Mezcladora</Text>
        </View>

        {/* Item 3 */}
        <View style={styles.reportItem}>
          <View style={styles.reportHeader}>
            <View style={styles.reportStatus}>
              <MaterialCommunityIcons name="alarm-light" size={20} color="#DC2626" />
              <Text style={styles.statusText}>Falla</Text>
            </View>
            <Text style={styles.reportDate}>20-02-2026, 12:20 hs.</Text>
          </View>
          <Text style={styles.reportDesc}>Pérdida de aceite en la bomba</Text>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Ver Historial Completo</Text>
            <Feather name="chevron-right" size={16} color="#0B3A6E" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.newReportButton}>
          <MaterialCommunityIcons name="alert-outline" size={24} color="#F59E0B" />
          <Text style={styles.newReportText}>Reportar una Nueva Falla</Text>
        </TouchableOpacity>

        <View style={styles.emergencyBanner}>
          <View style={styles.emergencyLeft}>
            <Text style={styles.emergencyTitle}>EMERGENCIA</Text>
            <MaterialCommunityIcons name="cog-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.emergencyRight}>
            <MaterialCommunityIcons name="alarm-light-outline" size={30} color="#DC2626" />
            <View>
              <Text style={styles.emergencyNumber}>861</Text>
              <Text style={styles.emergencySub}>N° Emergencias Planta</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ==========================================
            PANTALLA 3 (COMPACT 4) - DASHBOARD 
        ========================================== */}
        <TouchableOpacity style={styles.qrBigButton}>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#FFFFFF" />
          <Text style={styles.qrBigText}>ESCANEAR CÓDIGO QR</Text>
          <Feather name="chevron-right" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.metricsCard}>
          <View style={styles.metricsTop}>
            <View style={styles.metricItem}>
              <MaterialCommunityIcons name="arrow-up-circle" size={30} color="#2F9E44" />
              <View>
                <Text style={styles.metricValueGreen}>95%</Text>
                <Text style={styles.metricLabel}>Disponibilidad</Text>
              </View>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <MaterialCommunityIcons name="chart-line-variant" size={30} color="#2F9E44" />
              <View>
                <Text style={styles.metricValueBlack}>1.2h</Text>
                <Text style={styles.metricLabel}>MTTR reducido</Text>
              </View>
            </View>
          </View>
          <View style={styles.metricsBottom}>
            <MaterialCommunityIcons name="check" size={24} color="#2F9E44" />
            <Text style={styles.metricHighlight}>3 Paradas Críticas <Text style={styles.textLight}>Evitadas</Text></Text>
          </View>
        </View>

        <View style={styles.actionMenuCard}>
          <TouchableOpacity style={styles.menuRow}>
            <Feather name="camera" size={24} color="#4C84E6" />
            <Text style={styles.menuText}>Ver Estado de la Máquina</Text>
            <Feather name="chevron-right" size={20} color="#717171" />
          </TouchableOpacity>
          <View style={styles.menuLine} />
          <TouchableOpacity style={styles.menuRow}>
            <MaterialCommunityIcons name="alert-outline" size={24} color="#F59E0B" />
            <Text style={styles.menuText}>Reportar una Falla</Text>
            <Feather name="chevron-right" size={20} color="#717171" />
          </TouchableOpacity>
        </View>

        <Text style={styles.helpText}>
          ¿Problemas? Escanéa el código QR de la máquina y grabá un audio si no podés escribir.
        </Text>

        <View style={styles.templateCard}>
          <View style={styles.templateHeader}>
            <MaterialCommunityIcons name="cog-outline" size={24} color="#0B3A6E" />
            <Text style={styles.templateTitle}>Plantilla de Control</Text>
          </View>
          <View style={styles.templateLine} />
          <View style={styles.templateLine} />
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Ver Historial Completo</Text>
            <Feather name="chevron-right" size={16} color="#0B3A6E" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* NAVEGACIÓN INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/report')}>
          <Ionicons name="document-text-outline" size={28} color="#0B3A6E" />
          <Text style={styles.navText}>Mis Reportes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="time-outline" size={28} color="#0B3A6E" />
          <Text style={styles.navText}>Historial</Text>
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
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 20 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  
  // SECCIÓN 1
  machineInfoContainer: { marginBottom: 15 },
  machineTitleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  machineName: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginLeft: 10, flex: 1 },
  badgePreventivo: { flexDirection: 'row', backgroundColor: '#F59E0B', alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', marginTop: -20 },
  badgeIcon: { marginRight: 5 },
  badgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  instructions: { fontSize: 16, fontWeight: '500', color: '#0F172A', lineHeight: 22, marginBottom: 20 },
  photoContainer: { backgroundColor: '#E2E8F0', height: 180, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20, position: 'relative' },
  newPhotoButton: { position: 'absolute', bottom: -15, right: 20, backgroundColor: '#2F9E44', flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, elevation: 4 },
  newPhotoText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginLeft: 8 },
  audioContainer: { backgroundColor: 'rgba(11, 58, 110, 0.05)', borderWidth: 1, borderColor: 'rgba(11, 58, 110, 0.2)', borderRadius: 10, padding: 15, marginBottom: 25, marginTop: 10 },
  audioHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  audioTitle: { fontSize: 16, fontWeight: '600', color: '#000000', marginLeft: 10 },
  textLight: { fontWeight: '400', color: '#717171' },
  audioPlayer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10 },
  audioTime: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginLeft: 10 },
  progressBar: { flex: 1, height: 4, backgroundColor: '#E2E8F0', marginHorizontal: 10, borderRadius: 2 },
  progressFill: { width: '30%', height: '100%', backgroundColor: '#0F172A', borderRadius: 2 },
  sendIcon: { marginLeft: 15 },
  inputLabel: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  inputContainer: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, height: 120, padding: 15, marginBottom: 15 },
  textInput: { flex: 1, fontSize: 16, color: '#0F172A' },
  charCount: { textAlign: 'right', fontSize: 12, color: '#717171', marginTop: 5 },
  noteContainer: { flexDirection: 'row', backgroundColor: 'rgba(11, 58, 110, 0.05)', padding: 15, borderRadius: 10, alignItems: 'center' },
  noteText: { flex: 1, fontSize: 13, color: '#0F172A', marginLeft: 10, lineHeight: 18 },
  divider: { height: 1, backgroundColor: '#D9D9D9', marginVertical: 30 },

  // SECCIÓN 2
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#000000', marginBottom: 15 },
  reportItem: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  reportStatus: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginLeft: 5 },
  reportDate: { fontSize: 13, color: '#717171' },
  reportDesc: { fontSize: 16, color: '#0F172A', marginBottom: 10 },
  linkButton: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  linkText: { fontSize: 14, color: '#0B3A6E', marginRight: 5 },
  newReportButton: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  newReportText: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginLeft: 10 },
  emergencyBanner: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  emergencyLeft: { backgroundColor: '#DC2626', padding: 15, justifyContent: 'center', alignItems: 'center', width: '40%' },
  emergencyTitle: { color: '#FFFFFF', fontWeight: '700', marginBottom: 5 },
  emergencyRight: { flexDirection: 'row', padding: 15, alignItems: 'center', width: '60%' },
  emergencyNumber: { fontSize: 24, fontWeight: '900', color: '#000000', marginLeft: 10 },
  emergencySub: { fontSize: 12, color: '#717171', marginLeft: 10 },

  // SECCIÓN 3
  qrBigButton: { flexDirection: 'row', backgroundColor: '#4C84E6', borderRadius: 10, padding: 18, alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  qrBigText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  metricsCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 15, marginBottom: 20, elevation: 2 },
  metricsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  metricItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  metricDivider: { width: 1, height: 40, backgroundColor: '#E2E8F0', marginHorizontal: 15 },
  metricValueGreen: { fontSize: 22, fontWeight: '700', color: '#2F9E44', marginLeft: 10 },
  metricValueBlack: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginLeft: 10 },
  metricLabel: { fontSize: 12, color: '#0F172A', marginLeft: 10 },
  metricsBottom: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 15 },
  metricHighlight: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginLeft: 10 },
  actionMenuCard: { backgroundColor: '#FFFFFF', borderRadius: 10, marginBottom: 20, elevation: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#0F172A', marginLeft: 15 },
  menuLine: { height: 1, backgroundColor: '#E2E8F0' },
  helpText: { fontSize: 14, color: '#717171', textAlign: 'center', marginBottom: 20, paddingHorizontal: 10 },
  templateCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 15, elevation: 2 },
  templateHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', padding: 10, borderRadius: 8, marginBottom: 15 },
  templateTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginLeft: 10 },
  templateLine: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 15 },

  // BOTTOM NAV
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 10, justifyContent: 'space-around', borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10 },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  navText: { fontSize: 12, fontWeight: '500', color: '#0F172A', marginTop: 4 }
});