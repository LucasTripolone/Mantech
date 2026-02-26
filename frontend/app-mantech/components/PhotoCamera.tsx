import React, { useState, useRef } from 'react';
import { Text, View, TouchableOpacity, Modal, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { styles } from './PhotoCamera.styles'; // <-- IMPORTAMOS LOS ESTILOS

interface PhotoCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoTaken: (photoUri: string) => void;
}

export default function PhotoCameraModal({ visible, onClose, onPhotoTaken }: PhotoCameraModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if(photo && photo.uri) {
          setPreview(photo.uri);
      }
    }
  };

  const savePhoto = () => {
    if (preview) {
      onPhotoTaken(preview);
      setPreview(null);
      onClose();
    }
  };

  const retakePhoto = () => {
      setPreview(null);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.cameraContainer}>
        <View style={styles.cameraHeader}>
          <Text style={styles.cameraTitle}>Tomar Foto</Text>
          <TouchableOpacity onPress={onClose} style={styles.cameraCloseBtn}>
            <Feather name="x" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {preview ? (
          <View style={styles.previewContainer}>
              <Image source={{ uri: preview }} style={styles.previewImage} />
              <View style={styles.previewActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={retakePhoto}>
                      <Text style={styles.actionText}>Volver a tomar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={savePhoto}>
                      <Text style={styles.actionText}>Usar Foto</Text>
                  </TouchableOpacity>
              </View>
          </View>
        ) : (
          <CameraView style={styles.cameraView} facing="back" ref={cameraRef}>
            <View style={styles.shutterContainer}>
              <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            </View>
          </CameraView>
        )}
      </View>
    </Modal>
  );
}