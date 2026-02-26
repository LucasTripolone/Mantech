import React from 'react';
import { Text, View, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { styles } from './QRScanner.styles'; // <-- IMPORTAMOS LOS ESTILOS ACÁ

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function QRScannerModal({ visible, onClose, onScan }: QRScannerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.cameraContainer}>
        <View style={styles.cameraHeader}>
          <Text style={styles.cameraTitle}>Escaneando QR...</Text>
          <TouchableOpacity onPress={onClose} style={styles.cameraCloseBtn}>
            <Feather name="x" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <CameraView
          style={styles.cameraView}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={visible ? ({ data }) => onScan(data) : undefined}
        >
          {/* Marco visual */}
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}