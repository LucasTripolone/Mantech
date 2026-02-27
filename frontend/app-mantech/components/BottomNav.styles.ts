import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
    fontSize: 11, 
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