import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNav from '../components/BottomNav'; // <-- IMPORTAMOS EL NUEVO MENÚ
import { styles } from '../styles/sensor.styles';
import { SafeAreaView } from 'react-native-safe-area-context'; 

export default function SensorsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* HEADER TIPO APP */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#0B3A6E" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoM}>M</Text>
          <Text style={styles.logoTextBold}>Mantech </Text>
          <Text style={styles.logoTextLight}>Latam</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ==========================================
            TARJETA PRINCIPAL - ESTADO CRÍTICO
        ========================================== */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <View style={styles.mainCardTitleContainer}>
              <MaterialCommunityIcons name="wifi" size={24} color="#0B3A6E" />
              <Text style={styles.mainCardTitle}>Sensor IoT</Text>
            </View>
            <TouchableOpacity>
              <Feather name="more-horizontal" size={24} color="#0B3A6E" />
            </TouchableOpacity>
          </View>

          <View style={styles.criticalAlertContainer}>
            <Feather name="alert-triangle" size={16} color="#DC2626" />
            <Text style={styles.criticalAlertText}>Estado crítico</Text>
          </View>
          
          <Text style={styles.locationText}>Zona de Compresores - Planta Alfa</Text>

          <View style={styles.tempContainer}>
            <View>
              <Text style={styles.bigTemp}>118°C</Text>
              <View style={styles.tempAlertContainer}>
                <Feather name="alert-triangle" size={14} color="#DC2626" />
                <Text style={styles.tempAlertText}>Sobrecalentamiento detectado</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.sensorIconButton}>
              <MaterialCommunityIcons name="access-point" size={32} color="#0B3A6E" />
            </TouchableOpacity>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <View style={styles.metricValueContainer}>
                <MaterialCommunityIcons name="thermometer" size={16} color="#DC2626" style={styles.metricIcon} />
                <Text style={styles.metricValue}>118</Text>
                <Text style={styles.metricUnit}>°C</Text>
              </View>
              <Text style={styles.metricLabel}>Temp</Text>
            </View>

            <View style={styles.metricItem}>
              <View style={styles.metricValueContainer}>
                <Ionicons name="water-outline" size={16} color="#0B3A6E" style={styles.metricIcon} />
                <Text style={styles.metricValue}>92</Text>
                <Text style={styles.metricUnit}>%</Text>
              </View>
              <Text style={styles.metricLabel}>Humedad</Text>
            </View>

            <View style={styles.metricItem}>
              <View style={styles.metricValueContainer}>
                <MaterialCommunityIcons name="waveform" size={16} color="#F59E0B" style={styles.metricIcon} />
                <Text style={styles.metricValue}>6.4</Text>
                <Text style={styles.metricUnit}>mm/s</Text>
              </View>
              <Text style={styles.metricLabel}>Vibración</Text>
            </View>

            <View style={styles.metricItem}>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>9.2</Text>
                <Text style={styles.metricUnit}>bar</Text>
              </View>
              <Text style={styles.metricLabel}>Presión</Text>
            </View>
          </View>

          <View style={styles.statusFooter}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Activo <Text style={styles.statusTime}>· Actualizado hace 2 min</Text></Text>
          </View>
        </View>

        {/* ==========================================
            LISTA DE EQUIPOS
        ========================================== */}
        
        {/* ITEM 1 - CRÍTICO */}
        <View style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemTitleContainer}>
              <View style={[styles.itemIconContainer, styles.itemIconContainerYellow]}>
                <MaterialCommunityIcons name="engine-outline" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.itemTitle}>Compresor A1</Text>
            </View>
            <View style={styles.badgeCritical}>
              <Text style={styles.badgeText}>Crítico</Text>
            </View>
          </View>

          <View style={styles.itemAlertContainer}>
            <Feather name="alert-triangle" size={18} color="#DC2626" />
            <Text style={styles.itemAlertTextRed}>118°C</Text>
          </View>

          <View style={styles.itemMetricsRow}>
             <View style={styles.metricValueContainer}>
                <MaterialCommunityIcons name="thermometer" size={14} color="#DC2626" style={styles.metricIcon} />
                <Text style={styles.metricValue}>6.4</Text>
                <Text style={styles.metricUnit}>mm/s</Text>
              </View>
              <View style={styles.metricValueContainer}>
                <Ionicons name="water-outline" size={14} color="#0B3A6E" style={styles.metricIcon} />
                <Text style={styles.metricValue}>92</Text>
                <Text style={styles.metricUnit}>%</Text>
              </View>
              <View style={styles.metricValueContainer}>
                <MaterialCommunityIcons name="waveform" size={14} color="#F59E0B" style={styles.metricIcon} />
                <Text style={styles.metricValue}>9.2</Text>
                <Text style={styles.metricUnit}>mm</Text>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>9.2</Text>
                <Text style={styles.metricUnit}>bar</Text>
              </View>
          </View>
        </View>

        {/* ITEM 2 - PRECAUCIÓN */}
        <View style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemTitleContainer}>
              <View style={[styles.itemIconContainer, styles.itemIconContainerYellow]}>
                <MaterialCommunityIcons name="engine-outline" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.itemTitle}>Compresor A2</Text>
            </View>
            <View style={styles.badgeWarning}>
              <Text style={styles.badgeText}>Precaución</Text>
            </View>
          </View>

          <View style={styles.itemAlertContainer}>
            <Feather name="alert-triangle" size={18} color="#F59E0B" />
            <Text style={styles.itemAlertTextYellow}>98°C</Text>
          </View>

          <View style={styles.itemMetricsRow}>
             <View style={styles.metricValueContainer}>
                <MaterialCommunityIcons name="thermometer" size={14} color="#DC2626" style={styles.metricIcon} />
                <Text style={styles.metricValue}>3.8</Text>
                <Text style={styles.metricUnit}>mm/s</Text>
              </View>
              <View style={styles.metricValueContainer}>
                <Ionicons name="water-outline" size={14} color="#0B3A6E" style={styles.metricIcon} />
                <Text style={styles.metricValue}>88</Text>
                <Text style={styles.metricUnit}>%</Text>
              </View>
              <View style={styles.metricValueContainer}>
                <MaterialCommunityIcons name="waveform" size={14} color="#F59E0B" style={styles.metricIcon} />
                <Text style={styles.metricValue}>7.8</Text>
                <Text style={styles.metricUnit}>bar</Text>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>7.8</Text>
                <Text style={styles.metricUnit}>bar</Text>
              </View>
          </View>
        </View>

        {/* ITEM 3 - NORMAL */}
        <View style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemTitleContainer}>
              <View style={[styles.itemIconContainer, styles.itemIconContainerBlue]}>
                <MaterialCommunityIcons name="fan" size={24} color="#0B3A6E" />
              </View>
              <Text style={styles.itemTitle}>Centrífuga General</Text>
            </View>
            <View style={styles.badgeNormal}>
              <Text style={styles.badgeText}>Normal</Text>
            </View>
          </View>

          <View style={styles.itemAlertContainer}>
            <MaterialCommunityIcons name="check-circle" size={18} color="#2F9E44" />
            <Text style={styles.itemAlertTextGreen}>62°C</Text>
          </View>

          <View style={styles.itemMetricsRow}>
             <View style={styles.metricValueContainer}>
                <MaterialCommunityIcons name="thermometer" size={14} color="#F59E0B" style={styles.metricIcon} />
                <Text style={styles.metricValue}>0.9</Text>
                <Text style={styles.metricUnit}>mm/s</Text>
              </View>
              <View style={styles.metricValueContainer}>
                <Ionicons name="water-outline" size={14} color="#0B3A6E" style={styles.metricIcon} />
                <Text style={styles.metricValue}>43</Text>
                <Text style={styles.metricUnit}>%</Text>
              </View>
              <View style={styles.metricValueContainer}>
                <MaterialCommunityIcons name="waveform" size={14} color="#F59E0B" style={styles.metricIcon} />
                <Text style={styles.metricValue}>2.3</Text>
                <Text style={styles.metricUnit}>mm</Text>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>3.5</Text>
                <Text style={styles.metricUnit}>bar</Text>
              </View>
          </View>
        </View>

      </ScrollView>

      {/* RENDERIZAMOS EL COMPONENTE REUTILIZABLE DEL MENÚ INFERIOR */}
      <BottomNav activeRoute="sensors" />

    </SafeAreaView>
  );
}