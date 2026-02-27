import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoM: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0B3A6E',
    marginRight: 5,
    fontStyle: 'italic',
  },
  logoTextBold: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  logoTextLight: {
    fontSize: 20,
    fontWeight: '400',
    color: '#0B3A6E',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120, // Espacio para el nuevo nav más ancho
  },

  // TARJETA PRINCIPAL (SENSOR IoT)
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mainCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 10,
  },
  criticalAlertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  criticalAlertText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  locationText: {
    color: '#717171',
    fontSize: 13,
    marginBottom: 15,
  },
  tempContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  bigTemp: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0F172A',
  },
  tempAlertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  tempAlertText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 5,
  },
  sensorIconButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  metricIcon: {
    marginRight: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#717171',
    marginLeft: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#717171',
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 15,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2F9E44',
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  statusTime: {
    fontSize: 13,
    color: '#717171',
  },

  // LISTA DE SENSORES
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  itemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIconContainer: {
    padding: 10,
    borderRadius: 10,
    marginRight: 12,
  },
  itemIconContainerYellow: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  itemIconContainerBlue: {
    backgroundColor: 'rgba(11, 58, 110, 0.1)',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgeCritical: {
    backgroundColor: '#DC2626',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeWarning: {
    backgroundColor: '#F59E0B',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeNormal: {
    backgroundColor: '#2F9E44',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  itemAlertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginLeft: 54, // Alineado con el texto, saltando el ícono
  },
  itemAlertTextRed: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 5,
  },
  itemAlertTextYellow: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 5,
  },
  itemAlertTextGreen: {
    color: '#2F9E44',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 5,
  },
  itemMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  itemMetricBox: {
    alignItems: 'center',
  },

  // NAV INFERIOR (Con 4 items)
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    justifyContent: 'space-around',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    flex: 1,
  },
  navItemActive: {
    position: 'relative',
  },
  navText: {
    fontSize: 11, // Un poco más chico para que entren los 4
    fontWeight: '500',
    color: '#0F172A',
    marginTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -10,
    width: '80%',
    height: 4,
    backgroundColor: '#717171',
    borderRadius: 2,
    alignSelf: 'center',
  }
});