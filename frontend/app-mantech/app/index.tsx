import React from 'react';
import { Text, View, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles } from './index.styles'; // <-- IMPORTAMOS LOS ESTILOS ACÁ

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