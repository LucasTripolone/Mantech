import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { backgroundColor: 'rgba(11, 58, 110, 0.05)', borderWidth: 1, borderColor: 'rgba(11, 58, 110, 0.2)', borderRadius: 10, padding: 15, marginBottom: 25, marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 16, fontWeight: '600', color: '#000000', marginLeft: 10 },
  textLight: { fontWeight: '400', color: '#717171' },
  player: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10 },
  time: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginLeft: 10, width: 45 },
  progressBar: { flex: 1, height: 4, backgroundColor: '#E2E8F0', marginHorizontal: 10, borderRadius: 2, overflow: 'hidden' },
  progressFillRecording: { width: '100%', height: '100%', backgroundColor: '#DC2626' }, 
  sendIcon: { marginLeft: 15 }
});