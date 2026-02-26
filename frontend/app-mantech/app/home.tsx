import React, { useState } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import QRScannerModal from '../components/QRScanner'; 
import { styles } from './home.styles'; // <-- IMPORTAMOS LOS ESTILOS

export default function HomeScreen() {
  const router = useRouter();
  
  // Estados para controlar la cámara
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);

  // Función para abrir la cámara
  const handleOpenScanner = async () => {
    if (!permission) return;
    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Permiso Denegado", "Necesitamos acceso a la cámara para escanear el QR de la máquina.");
        return;
      }
    }
    setIsScanning(true);
  };

  // Función que se ejecuta cuando la cámara lee un QR
  const handleBarcodeScanned = (data: string) => {
    setIsScanning(false); 
    Alert.alert(
      "Máquina Detectada",
      `Código QR escaneado:\n${data}\n\n¿Querés abrir un reporte para esta máquina?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Reportar Falla", 
          onPress: () => router.push('/report') 
        }
      ]
    );
  };

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
          <TouchableOpacity style={styles.qrButton} onPress={handleOpenScanner}>
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
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/report')}>
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
        <TouchableOpacity style={styles.aboutUsContainer} onPress={() => router.push('/about')}>
          <MaterialCommunityIcons name="account-star-outline" size={32} color="#0B3A6E" />
          <Text style={styles.aboutUsText}>Sobre Nosotros</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* NAVEGACIÓN INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/report')}>
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

      {/* RENDERIZAMOS EL COMPONENTE REUTILIZABLE DE LA CÁMARA */}
      <QRScannerModal 
        visible={isScanning} 
        onClose={() => setIsScanning(false)} 
        onScan={handleBarcodeScanned} 
      />

    </SafeAreaView>
  );
}