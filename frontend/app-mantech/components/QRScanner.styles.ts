import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: '#000000' },
  cameraHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10 },
  cameraTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '600' },
  cameraCloseBtn: { padding: 5 },
  cameraView: { flex: 1 },
  scannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  scannerFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#4C84E6', backgroundColor: 'transparent', borderRadius: 20 }
});