import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.title}>Prensa #14</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>OPERATIVA</Text>
        </View>
      </View>

      <View style={styles.qrCard}>
        <TouchableOpacity style={styles.qrButton}>
          <Text style={styles.qrButtonText}>ESCANEAR QR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Capturar Falla</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Solicitar Ayuda</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Escaneá el QR de la máquina para abrir un Reporte.</Text>
        <Text style={styles.infoSubtitle}>Podés grabar un Audio si no podes escribir.</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 27,
    fontWeight: '500',
    color: '#0F172A',
    marginRight: 15,
  },
  badge: {
    backgroundColor: '#2F9E44',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    height: 250,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 4, 
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  qrButton: {
    backgroundColor: '#1C5BDE',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  qrButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 25,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  actionText: {
    fontWeight: '700',
    fontSize: 18,
    color: '#0F172A',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 5,
  },
  infoSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
  }
});