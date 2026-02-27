import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles } from './BottomNav.styles';

// Definimos las 4 pantallas posibles
interface BottomNavProps {
  activeRoute: 'home' | 'support' | 'report' | 'sensors';
}

export default function BottomNav({ activeRoute }: BottomNavProps) {
  const router = useRouter();

  return (
    <View style={styles.bottomNav}>
      
      {/* 1. Historial (Home) */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'home' && styles.navItemActive]} 
        onPress={() => activeRoute !== 'home' && router.push('/home')}
      >
        <Ionicons name="time-outline" size={28} color="#0B3A6E" />
        <Text style={styles.navText}>Historial</Text>
        {activeRoute === 'home' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

      {/* 2. Soporte */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'support' && styles.navItemActive]} 
        onPress={() => activeRoute !== 'support' && router.push('/support')}
      >
        <Feather name="info" size={28} color="#0B3A6E" />
        <Text style={styles.navText}>Soporte</Text>
        {activeRoute === 'support' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

      {/* 3. Mis Reportes */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'report' && styles.navItemActive]} 
        onPress={() => activeRoute !== 'report' && router.push('/report')}
      >
        <Ionicons name="document-text-outline" size={28} color="#0B3A6E" />
        <Text style={styles.navText}>Mis Reportes</Text>
        {activeRoute === 'report' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

      {/* 4. Sensores IoT */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'sensors' && styles.navItemActive]} 
        onPress={() => activeRoute !== 'sensors' && router.push('/sensor')}
      >
        <MaterialCommunityIcons name="access-point-network" size={28} color="#0B3A6E" />
        <Text style={styles.navText}>Sensores IoT</Text>
        {activeRoute === 'sensors' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

    </View>
  );
}