import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.contentContainer}>
          
          {/* HEADER / LOGO */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoM}>M</Text>
            <Text style={styles.logoTextBold}>Mantech </Text>
            <Text style={styles.logoTextLight}>Latam</Text>
          </View>
          
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitleBold}>SIMPLICIDAD GENERA </Text>
            <Text style={styles.subtitleLight}>RENTABILIDAD</Text>
          </View>

          {/* TARJETA DE LOGIN */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Iniciar Sesión</Text>

            {/* Input Correo */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="email-outline" size={24} color="#0B3A6E" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Gmail"
                placeholderTextColor="rgba(11, 58, 110, 0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Input Contraseña */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={24} color="#0B3A6E" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="rgba(11, 58, 110, 0.5)"
                secureTextEntry={true}
              />
            </View>

            {/* Olvidaste contraseña */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Botón Ingresar */}
            <TouchableOpacity 
              style={styles.loginButton} 
              // Usamos replace en vez de push para que el usuario no pueda volver atrás al login haciendo el gesto de retroceso en Android
              onPress={() => router.replace('/home')} 
            >
              <Text style={styles.loginButtonText}>Ingresar</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>AGROINDUSTRIA | METALMECÁNICA</Text>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    elevation: 5, // Sombra para Android
    shadowColor: '#0F172A', // Sombra para iOS
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