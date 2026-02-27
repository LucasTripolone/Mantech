import { Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles } from '../styles/support.styles';
import { SafeAreaView } from 'react-native-safe-area-context'; 

export default function SupportScreen() {
  const router = useRouter();

  // Función para abrir el marcador telefónico
  const handlePhonePress = () => {
    Linking.openURL('tel:+5403496123456');
  };

  // Función para abrir la app de correos (Gmail, etc.)
  const handleEmailPress = () => {
    Linking.openURL('mailto:help@mantech.com?subject=Soporte%20App%20Mantech');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={28} color="#0B3A6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Soporte</Text>
        <View style={styles.headerIconContainer}>
          <MaterialCommunityIcons name="headset" size={36} color="#0B3A6E" />
          <View style={styles.chatBubbleIcon}>
            <MaterialCommunityIcons name="message-processing-outline" size={18} color="#0B3A6E" />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SUBTÍTULO */}
        <Text style={styles.subheader}>
          ¿Necesitas Ayuda?  <Text style={styles.separator}>|</Text>  ¿Problemas en la Planta?
        </Text>

        {/* TARJETA: TELÉFONO (Ahora funciona) */}
        <TouchableOpacity style={styles.contactCard} onPress={handlePhonePress}>
          <Feather name="phone-call" size={32} color="#0B3A6E" style={styles.cardIcon} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Contactar por Teléfono</Text>
            <View style={styles.highlightBadge}>
              <Text style={styles.highlightText}>+54 03496 123456</Text>
            </View>
            <Text style={styles.cardSubtext}>Lunes a Viernes de 8:00 a 18:00 hs.</Text>
          </View>
        </TouchableOpacity>

        {/* TARJETA: CORREO (Ahora funciona) */}
        <TouchableOpacity style={styles.contactCard} onPress={handleEmailPress}>
          <MaterialCommunityIcons name="message-text-outline" size={32} color="#0B3A6E" style={styles.cardIcon} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Enviar Gmail a:</Text>
            <View style={styles.highlightBadge}>
              <Text style={styles.highlightText}>help@mantech.com</Text>
            </View>
            <Text style={styles.cardSubtext}>+ Foto del Problema + Descripción</Text>
          </View>
        </TouchableOpacity>

        {/* TÍTULO PREGUNTAS FRECUENTES */}
        <View style={styles.faqHeader}>
          <Feather name="info" size={24} color="#F59E0B" />
          <Text style={styles.faqTitle}>Preguntas Frecuentes</Text>
        </View>

        {/* TARJETA PREGUNTAS FRECUENTES */}
        <View style={styles.faqCard}>
          
          <View style={styles.faqItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4C84E6" style={styles.faqCheck} />
            <View style={styles.faqTextContainer}>
              <Text style={styles.question}>¿Qué hago si la máquina está en estado Preventivo (amarillo)?</Text>
              <Text style={styles.answer}>Podés seguir operando con precaución. Revisá el checklist rápido (ruidos, vibraciones, pérdidas) y dejá asentado el reporte para que mantenimiento lo programe.</Text>
            </View>
          </View>

          <View style={styles.faqItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4C84E6" style={styles.faqCheck} />
            <View style={styles.faqTextContainer}>
              <Text style={styles.question}>¿Cómo adjunto fotos o audio al reporte?</Text>
              <Text style={styles.answer}>Al tocar Reportar Falla, podés sacar una foto en el momento o grabar un audio si no podés escribir. Eso ayuda a que soporte entienda mejor el problema.</Text>
            </View>
          </View>

          <View style={styles.faqItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4C84E6" style={styles.faqCheck} />
            <View style={styles.faqTextContainer}>
              <Text style={styles.question}>¿Qué pasa si marco una Falla por error?</Text>
              <Text style={styles.answer}>No pasa nada. Podés editar o cancelar el reporte desde Mis Reportes. Si ya fue tomado por mantenimiento, dejá una nota aclarando el error.</Text>
            </View>
          </View>

          <View style={styles.faqItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4C84E6" style={styles.faqCheck} />
            <View style={styles.faqTextContainer}>
              <Text style={styles.question}>¿Cómo sé si mi reporte fue visto por mantenimiento?</Text>
              <Text style={styles.answer}>En Mis Reportes vas a ver el estado del caso: 🟡 En revisión · 🟢 En proceso · 🔵 Resuelto. También te llega una notificación cuando cambie el estado.</Text>
            </View>
          </View>

          <View style={styles.faqDivider} />

          <TouchableOpacity style={styles.moreFaqButton}>
            <Text style={styles.moreFaqText}>Ver Más Preguntas Frecuentes</Text>
            <Feather name="chevron-right" size={18} color="#0B3A6E" />
          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* NAVEGACIÓN INFERIOR (Soporte Activo) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/report')}>
          <Ionicons name="document-text-outline" size={28} color="#0B3A6E" />
          <Text style={styles.navText}>Mis Reportes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="time-outline" size={28} color="#0B3A6E" />
          <Text style={styles.navText}>Historial</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Feather name="info" size={28} color="#0B3A6E" />
          <Text style={styles.navText}>Soporte</Text>
          <View style={styles.activeIndicator} />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}