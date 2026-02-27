import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  cameraContainer: { 
    flex: 1, 
    backgroundColor: '#000000' 
  },
  cameraHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    paddingBottom: 15, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    zIndex: 10 
  },
  cameraTitle: { 
    color: '#FFFFFF', 
    fontSize: 20, 
    fontWeight: '600' 
  },
  cameraCloseBtn: { 
    padding: 5 
  },
  // --- NUEVO: ESTILO PARA LA CÁMARA ---
  absoluteCamera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // --- ACTUALIZADO: REEMPLAZAMOS EL ABSOLUTE FILL ---
  scannerOverlay: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scannerFrame: { 
    width: 250, 
    height: 250, 
    borderWidth: 2, 
    borderColor: '#4C84E6', 
    backgroundColor: 'transparent', 
    borderRadius: 20 
  }
});