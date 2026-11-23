// src/app/characters.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomFooter from './components/CustomFooter';
import CustomHeader from './components/CustomHeader';

const CHARACTERS_URL = 'https://menu-nu-coral.vercel.app/';

interface CharacterRecord {
  id: string;
  initials: string;
  nombre: string;
  rol: string;
  salud: string;
  actitud: string;
  apariciones: string[];
  acciones: string[];
  habilidades: string[];
  descripcion: string;
}

// Salud y actitud configuradas manualmente por personaje
const CHARACTERS_DATA: CharacterRecord[] = [
  {
    id: 'jack-veil',
    initials: 'JV',
    nombre: 'Jack Veil',
    rol: 'Protagonista',
    salud: '100',
    actitud: 'Sin IA',
    apariciones: ['Todos'],
    acciones: ['Caminar', 'Correr', 'Saltar', 'Atacar'],
    habilidades: [
      'Ataque Corto',
      'Ataque Intermedio (Golpe)',
      'Ataque a Distancia (Proyectil o Laser)',
    ],
    descripcion: 'Registro de personaje operativo en Metronia (2943).',
  },
  {
    id: 'doctor',
    initials: 'D',
    nombre: 'Doctor',
    rol: 'NPC',
    salud: '—',
    actitud: 'Sin IA',
    apariciones: ['Nivel 1'],
    acciones: ['Observar', 'Dialogar'],
    habilidades: ['Asistencia Técnica'],
    descripcion: 'La información adicional de este personaje se incorporará cuando esté definida.',
  },
  {
    id: 'tecnocrata',
    initials: 'T',
    nombre: 'Tecnócrata',
    rol: 'NPC',
    salud: '—',
    actitud: 'Sin IA',
    apariciones: ['Nivel 2'],
    acciones: ['Supervisar', 'Dialogar'],
    habilidades: ['Control de Sistemas'],
    descripcion: 'La información adicional de este personaje se incorporará cuando esté definida.',
  },
  {
    id: 'sentinela-alpha-34',
    initials: 'SA3',
    nombre: 'Sentinela Alpha-34',
    rol: 'Enemigo',
    salud: '75',
    actitud: 'Fácil',
    apariciones: ['Todos'],
    acciones: ['Caminar', 'Correr', 'Atacar'],
    habilidades: ['Ataque Corto', 'Patrullaje'],
    descripcion: 'Unidad de vigilancia automatizada registrada en el archivo de Metronia.',
  },
  {
    id: 'cyborg-omega-06',
    initials: 'CO0',
    nombre: 'Cyborg Omega-06',
    rol: 'Enemigo',
    salud: '100',
    actitud: 'Intermedio',
    apariciones: ['Nivel 2', 'Nivel 3'],
    acciones: ['Caminar', 'Correr', 'Saltar', 'Atacar'],
    habilidades: ['Ataque Corto', 'Ataque Intermedio (Golpe)'],
    descripcion: 'Unidad cibernética de combate con respuesta táctica intermedia.',
  },
  {
    id: 'dron-epsilon-21',
    initials: 'DE2',
    nombre: 'Dron Epsilon-21',
    rol: 'Enemigo',
    salud: '45',
    actitud: 'Fácil',
    apariciones: ['Nivel 2', 'Nivel 3'],
    acciones: ['Volar', 'Atacar'],
    habilidades: ['Ataque a Distancia (Proyectil o Laser)'],
    descripcion: 'Dron ligero de reconocimiento y hostigamiento aéreo.',
  },
  {
    id: 'victoria-ashford',
    initials: 'VA',
    nombre: 'Victoria Ashford',
    rol: 'Sub-Jefe',
    salud: '—',
    actitud: 'Sin IA',
    apariciones: ['Nivel 2', 'Nivel 3'],
    acciones: ['Caminar', 'Atacar'],
    habilidades: ['Ataque Intermedio (Golpe)', 'Ataque a Distancia (Proyectil o Laser)'],
    descripcion: 'La información adicional de este personaje se incorporará cuando esté definida.',
  },
];

export default function CharactersScreen() {
  const [loadingWeb, setLoadingWeb] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterRecord | null>(null);

  const router = useRouter();

  const WebView =
    Platform.OS !== 'web' ? require('react-native-webview').WebView : null;

  const handleNavigation = (route: string) => {
    switch (route) {
      case '/':
        router.push('/');
        break;
      case '/history':
        router.push('/history' as any);
        break;
      case '/characters':
        router.push('/characters' as any);
        break;
      case 'Logout':
      case '/logout':
        if (Platform.OS === 'android') {
          BackHandler.exitApp();
        } else {
          router.replace('/');
        }
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer} pointerEvents="box-none">
        <CustomHeader />
      </View>

      <View style={styles.contentContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={CHARACTERS_URL}
            style={{
              border: 'none',
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
            }}
            title="Personajes"
          />
        ) : (
          <WebView
            source={{ uri: CHARACTERS_URL }}
            style={[styles.webview, StyleSheet.absoluteFill]}
            onLoadEnd={() => setLoadingWeb(false)}
            onError={() => setLoadingWeb(false)}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
          />
        )}

        {/* BLOQUE CONTENEDOR DELIMITADO: NUNCA SUBE ENCIMA DEL HEADER NI BAJA DEL FOOTER */}
        <View style={styles.charactersBlock} pointerEvents="box-none">
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled
          >
            {CHARACTERS_DATA.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.characterCard}
                onPress={() => setSelectedCharacter(item)}
                activeOpacity={0.85}
              >
                <View style={styles.initialsBadge}>
                  <Text style={styles.initialsText}>{item.initials}</Text>
                </View>

                <View style={styles.cardInfo}>
                  <View style={styles.topRow}>
                    <Text style={styles.characterName}>{item.nombre}</Text>
                    <View style={styles.roleTag}>
                      <Text style={styles.roleTagText}>{item.rol}</Text>
                    </View>
                  </View>

                  <View style={styles.statsInline}>
                    <View style={styles.statPill}>
                      <Ionicons name="heart" size={13} color="#9E2A2B" />
                      <Text style={styles.statPillText}>SALUD: {item.salud}</Text>
                    </View>

                    <View style={styles.statPill}>
                      <Ionicons name="shield" size={13} color="#6F421E" />
                      <Text style={styles.statPillText}>ACTITUD: {item.actitud}</Text>
                    </View>
                  </View>

                  <Text style={styles.appearanceLine}>
                    Aparición: {item.apariciones.join(', ')}
                  </Text>
                  <Text style={styles.tapHint}>Tocar para ver ficha completa →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loadingWeb && Platform.OS !== 'web' && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#c18f34" />
          </View>
        )}
      </View>

      {/* MODAL DE DETALLES CON ESTÉTICA PERGAMINO / CUERO / DORADO */}
      <Modal
        visible={!!selectedCharacter}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCharacter(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopBanner}>
              <Text style={styles.modalTitle}>{selectedCharacter?.nombre}</Text>
              <Text style={styles.modalSubtitle}>{selectedCharacter?.rol}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={true}>
              <Text style={styles.modalDescription}>{selectedCharacter?.descripcion}</Text>

              {/* ATRIBUTOS */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="pulse-outline" size={16} color="#8C5228" />
                  <Text style={styles.sectionHeaderText}>ATRIBUTOS</Text>
                  <View style={styles.sectionDivider} />
                </View>

                <View style={styles.attributeRowCard}>
                  <View style={styles.attributeLeft}>
                    <Ionicons name="heart-outline" size={18} color="#9E2A2B" />
                    <Text style={styles.attributeLabel}>SALUD</Text>
                  </View>
                  <Text style={styles.attributeValue}>{selectedCharacter?.salud}</Text>
                </View>

                <View style={styles.attributeRowCard}>
                  <View style={styles.attributeLeft}>
                    <Ionicons name="shield-outline" size={18} color="#6F421E" />
                    <Text style={styles.attributeLabel}>ACTITUD</Text>
                  </View>
                  <Text style={styles.attributeValue}>{selectedCharacter?.actitud}</Text>
                </View>

                <View style={styles.attributeRowCard}>
                  <View style={styles.attributeLeft}>
                    <Ionicons name="locate-outline" size={18} color="#8C5228" />
                    <Text style={styles.attributeLabel}>ROL</Text>
                  </View>
                  <Text style={styles.attributeValue}>{selectedCharacter?.rol}</Text>
                </View>
              </View>

              {/* APARICIONES */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="book-outline" size={16} color="#8C5228" />
                  <Text style={styles.sectionHeaderText}>APARICIONES</Text>
                  <View style={styles.sectionDivider} />
                </View>
                <View style={styles.chipsWrap}>
                  {(selectedCharacter?.apariciones ?? []).map((app, idx) => (
                    <View key={`app-${idx}`} style={styles.parchmentChip}>
                      <Text style={styles.chipText}>{app}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* ACCIONES */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="walk-outline" size={16} color="#8C5228" />
                  <Text style={styles.sectionHeaderText}>ACCIONES</Text>
                  <View style={styles.sectionDivider} />
                </View>
                <View style={styles.chipsWrap}>
                  {(selectedCharacter?.acciones ?? []).map((action, idx) => (
                    <View key={`act-${idx}`} style={styles.leatherChip}>
                      <Text style={styles.leatherChipText}>{action}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* HABILIDADES */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="flash-outline" size={16} color="#8C5228" />
                  <Text style={styles.sectionHeaderText}>HABILIDADES</Text>
                  <View style={styles.sectionDivider} />
                </View>
                <View style={styles.chipsWrap}>
                  {(selectedCharacter?.habilidades ?? []).map((skill, idx) => (
                    <View key={`skl-${idx}`} style={styles.brassChip}>
                      <Ionicons name="flash-outline" size={14} color="#e3bd26" />
                      <Text style={styles.leatherChipText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedCharacter(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.closeButtonText}>CERRAR FICHA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.footerContainer}>
        <CustomFooter onNavigate={handleNavigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 30,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'black',
  },
  charactersBlock: {
    position: 'absolute',
    top: 120,
    left: 14,
    right: 14,
    bottom: 86,
    zIndex: 10,
    elevation: 10,
    backgroundColor: 'rgba(42, 24, 16, 0.35)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.55)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    gap: 14,
  },
  characterCard: {
    flexDirection: 'row',
    backgroundColor: '#8d7238',
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  initialsBadge: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#2A1810',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialsText: {
    color: '#F3E5AB',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  cardInfo: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  characterName: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2A1810',
  },
  roleTag: {
    backgroundColor: '#8C5228',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleTagText: {
    color: '#FFF8DC',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statsInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8F0DD',
    borderWidth: 1,
    borderColor: '#C59B38',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statPillText: {
    color: '#2C1810',
    fontSize: 12,
    fontWeight: '700',
  },
  appearanceLine: {
    fontSize: 13,
    color: '#4A2B1D',
    fontWeight: '600',
  },
  tapHint: {
    fontSize: 12,
    color: '#8C5228',
    marginTop: 5,
    fontWeight: 'bold',
  },
  loader: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    zIndex: 15,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '86%',
    backgroundColor: '#EFE2C6',
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalTopBanner: {
    backgroundColor: '#2A1810',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 2,
    borderBottomColor: '#D4AF37',
    alignItems: 'center',
  },
  modalScroll: {
    padding: 18,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F3E5AB',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 3,
    letterSpacing: 1,
  },
  modalDescription: {
    fontSize: 15,
    color: '#2C1810',
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: 18,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sectionHeaderText: {
    color: '#5C3317',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(140, 82, 40, 0.35)',
  },
  attributeRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#9c751a',
    borderWidth: 1.2,
    borderColor: '#C59B38',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  attributeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attributeLabel: {
    color: '#3B2219',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  attributeValue: {
    color: '#2A1810',
    fontSize: 15,
    fontWeight: 'bold',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  parchmentChip: {
    backgroundColor: '#cf9818',
    borderWidth: 1.2,
    borderColor: '#B88B2D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  leatherChip: {
    backgroundColor: '#4A2B1D',
    borderWidth: 1.2,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  brassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8C5228',
    borderWidth: 1.2,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    color: '#2C1810',
    fontSize: 13,
    fontWeight: '600',
  },
  leatherChipText: {
    color: '#FFF8DC',
    fontSize: 13,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#8C5228',
    borderTopWidth: 2,
    borderTopColor: '#D4AF37',
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF8DC',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});