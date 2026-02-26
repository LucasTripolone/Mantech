import React, { useState } from 'react';
import { Text, View, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import QRScannerModal from '../components/QRScanner'; 
import PhotoCameraModal from '../components/PhotoCamera'; // <-- IMPORTAMOS LA CÁMARA DE FOTOS
import AudioRecorder from '../components/AudioRecorder'; // <-- IMPORTAMOS LA GRABADORA
import { styles } from './report.styles';

export default function ReportScreen() {
  const router = useRouter();

  // Estados para permisos y modales
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  
  // Estado para guardar el URI de la foto tomada
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Funciones para el QR
  const handleOpenScanner = async () => {
    if (!permission) return;
    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Permiso Denegado", "Se necesita acceso a la cámara para escanear la máquina.");
        return;
      }
    }
    setIsScanning(true);
  };

  const handleBarcodeScanned = (data: string) => {
    setIsScanning(false);
    Alert.alert(
      "Máquina Identificada",
      `Código escaneado: ${data}\n\nLos datos de la máquina se auto-completarán en el reporte.`,
      [{ text: "Entendido" }]
    );
  };

  // Funciones para la cámara de fotos
  const handleOpenPhotoCamera = async () => {
    if (!permission) return;
    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Permiso Denegado", "Se necesita acceso a la cámara para tomar fotos.");
        return;
      }
    }
    setIsTakingPhoto(true);
  };

  const handlePhotoTaken = (uri: string) => {
    setPhotoUri(uri);
    Alert.alert("Foto guardada", "La foto se adjuntará al reporte.");
  };

  // Función para manejar el audio grabado
  const handleAudioRecorded = (uri: string) => {
    console.log("Audio guardado en un archivo temporal:", uri);
    Alert.alert("Audio grabado", "El audio se adjuntará al reporte correctamente.");
  };

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

        {/* ÁREA DE FOTO ACTUALIZADA CON PREVISUALIZACIÓN */}
        <View style={styles.photoContainer}>
          {photoUri ? (
             <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', borderRadius: 10, resizeMode: 'cover' }} />
          ) : (
             <MaterialCommunityIcons name="camera-image" size={60} color="#D9D9D9" />
          )}
          
          <TouchableOpacity style={styles.newPhotoButton} onPress={handleOpenPhotoCamera}>
            <Feather name="camera" size={18} color="#FFFFFF" />
            <Text style={styles.newPhotoText}>{photoUri ? "Cambiar Foto" : "Nueva Foto"}</Text>
          </TouchableOpacity>
        </View>

        {/* ÁREA DE AUDIO (Usamos el componente reutilizable nuevo) */}
        <AudioRecorder onAudioRecorded={handleAudioRecorded} />

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
        <TouchableOpacity style={styles.qrBigButton} onPress={handleOpenScanner}>
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
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
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

      {/* RENDERIZAMOS EL COMPONENTE REUTILIZABLE DEL QR */}
      <QRScannerModal 
        visible={isScanning} 
        onClose={() => setIsScanning(false)} 
        onScan={handleBarcodeScanned} 
      />

      {/* RENDERIZAMOS EL COMPONENTE REUTILIZABLE DE LA FOTO */}
      <PhotoCameraModal 
        visible={isTakingPhoto}
        onClose={() => setIsTakingPhoto(false)}
        onPhotoTaken={handlePhotoTaken}
      />

    </SafeAreaView>
  );
}