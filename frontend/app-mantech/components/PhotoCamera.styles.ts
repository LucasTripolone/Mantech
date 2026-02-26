import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: '#000000' },
  cameraHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10 },
  cameraTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '600' },
  cameraCloseBtn: { padding: 5 },
  cameraView: { flex: 1, justifyContent: 'flex-end' },
  shutterContainer: { alignItems: 'center', marginBottom: 40 },
  shutterButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFFFFF' },
  previewContainer: { flex: 1, backgroundColor: '#000' },
  previewImage: { flex: 1, resizeMode: 'contain' },
  previewActions: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: 'rgba(0,0,0,0.8)' },
  actionBtn: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#333' },
  saveBtn: { backgroundColor: '#4C84E6' },
  actionText: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});