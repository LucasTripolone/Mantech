import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  logoM: {
    fontSize: 55,
    fontWeight: '900',
    color: '#0B3A6E',
    marginRight: 8,
    fontStyle: 'italic',
  },
  logoTextBold: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
  },
  logoTextLight: {
    fontSize: 32,
    fontWeight: '400',
    color: '#0B3A6E',
  },
  subtitleContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#4C84E6',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  subtitleBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitleLight: {
    fontSize: 14,
    fontWeight: '400',
    color: '#717171',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    elevation: 5, 
    shadowColor: '#0F172A', 
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0B3A6E',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    height: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotText: {
    fontSize: 14,
    color: '#0B3A6E',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#4C84E6',
    borderRadius: 10,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: 1,
  }
});