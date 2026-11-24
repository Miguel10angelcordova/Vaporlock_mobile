import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Easing,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import CharacterCameraModal from './CharacterCameraModal';
import CustomFooter from './CustomFooter';
const GAME_URL = 'https://gus-lpz.itch.io/vaporlock';
const COLORS = {
  background: '#11131A',
  panel: '#191B24',
  panelLight: '#22232C',
  panelDark: '#14151C',
  cream: '#F4E8CF',
  muted: '#B8B1A3',
  copper: '#E38A42',
  copperLight: '#F2A65E',
  teal: '#24D7D1',
  red: '#BD4034',
  border: '#39343A',
  black: '#08090C',
};
export default function MenuScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [launchingGame, setLaunchingGame] = useState(false);
  const isCompact = width < 380;
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isLandscape = width > height;
  const nativeDriver = Platform.OS !== 'web';
  const entrance = useRef(new Animated.Value(0)).current;
  const floating = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.4)).current;
  //*&#x20;Animaciones de entrada y ambiente.*
  useEffect(() => {
    const entranceAnimation = Animated.timing(entrance, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    });
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floating, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: nativeDriver,
        }),
        Animated.timing(floating, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: nativeDriver,
        }),
      ])
    );
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: nativeDriver,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 1800,
          useNativeDriver: nativeDriver,
        }),
      ])
    );
    entranceAnimation.start();
    floatingAnimation.start();
    pulseAnimation.start();
    return () => {
      entranceAnimation.stop();
      floatingAnimation.stop();
      pulseAnimation.stop();
    };
  }, [entrance, floating, pulse, nativeDriver]);
  const entranceStyle = {
    opacity: entrance,
    transform: [
      {
        translateY: entrance.interpolate({
          inputRange: [0, 1],
          outputRange: [22, 0],
        }),
      },
    ],
  };
  //*&#x20;Acciones.*
  const handleJugarPress = async () => {
    if (launchingGame) return;
    try {
      setLaunchingGame(true);
      await Linking.openURL(GAME_URL);
    } catch (error) {
      console.error('Error al abrir el juego:', error);
    } finally {
      setLaunchingGame(false);
    }
  };
  const handleConfigPress = () => {
    router.push('/configuracion' as any);
  };
  const handleCameraPress = () => {
    setCameraModalVisible(true);
  };
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
      <StatusBar style="light" />
      {/**&#x20;FONDO INDUSTRIAL&#x20;**/}
      <View
        style={styles.backgroundGrid}
        pointerEvents="none"
      >
        {Array.from({ length: 15 }).map((_, index) => (
          <View
            key={`vertical-${index}`}
            style={[
              styles.gridVertical,
              {
                left: `${(index + 1) * (100 / 16)}%`,
              },
            ]}
          />
        ))}
        {Array.from({ length: 15 }).map((_, index) => (
          <View
            key={`horizontal-${index}`}
            style={[
              styles.gridHorizontal,
              {
                top: `${(index + 1) * (100 / 16)}%`,
              },
            ]}
          />
        ))}
      </View>
      {/**&#x20;LUZ AMBIENTAL&#x20;**/}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ambientLight,
          {
            opacity: pulse.interpolate({
              inputRange: [0.4, 1],
              outputRange: [0.035, 0.09],
            }),
          },
        ]}
      />
      {/**&#x20;CONTENIDO DESPLAZABLE&#x20;**/}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: isCompact ? 14 : isTablet ? 35 : 22,
            paddingTop: isCompact ? 17 : 24,
            paddingBottom: 35,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={Platform.OS !== 'web'}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.mainContent,
            {
              maxWidth: isTablet ? 760 : 480,
            },
            isTablet && isLandscape && styles.landscapeContent,
          ]}
        >
          {/**&#x20;IDENTIDAD&#x20;**/}
          <Animated.View
            style={[
              styles.header,
              entranceStyle,
              isCompact && styles.compactHeader,
            ]}
          >
            <View style={styles.brandContainer}>
              <View style={styles.brandMark}>
                <Ionicons
                  name="settings"
                  size={19}
                  color={COLORS.copper}
                />
              </View>
              <View>
                <Text style={styles.brandName}>
                  VAPOR<Text style={styles.brandAccent}>LOCK</Text>
                </Text>
                <Text style={styles.brandSubtitle}>
                  METRONIA // 2943
                </Text>
              </View>
            </View>
            <View style={styles.headerStatus}>
              <Animated.View
                style={[
                  styles.statusDot,
                  { opacity: pulse },
                ]}
              />
              <Text style={styles.headerStatusText}>
                SISTEMA ACTIVO
              </Text>
            </View>
          </Animated.View>
          {/**&#x20;TITULO&#x20;**/}
          <Animated.View
            style={[
              styles.titleSection,
              entranceStyle,
            ]}
          >
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowLine} />
              <Text style={styles.eyebrowText}>
                ARCHIVO CENTRAL / METRONIA
              </Text>
              <View style={styles.eyebrowLine} />
            </View>
            <Text
              style={[
                styles.mainTitle,
                {
                  fontSize: isCompact ? 43 : isTablet ? 66 : 54,
                  lineHeight: isCompact ? 55 : isTablet ? 78 : 65,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              MENÚ
            </Text>
            <Text style={styles.titleDescription}>
              UNA CIUDAD. UNA CORPORACIÓN.
              {'\n'}
              UNA REVOLUCIÓN.
            </Text>
          </Animated.View>
          {/**&#x20;TARJETA DE EXPEDIENTE&#x20;**/}
          <Animated.View
            style={[
              styles.characterCard,
              entranceStyle,
            ]}
          >
            <View style={styles.cardBackplate} />
            <View style={styles.cardFrame}>
              {/**&#x20;BARRA SUPERIOR&#x20;**/}
              <View style={styles.cardTopbar}>
                <View style={styles.cardTopbarLeft}>
                  <View style={styles.cardIndicator} />
                  <Text style={styles.cardTopbarText}>
                    VAPORIS // DATABASE
                  </Text>
                </View>
                <Text style={styles.cardRecord}>
                  EXP. 001
                </Text>
              </View>
              {/**&#x20;ESCENA&#x20;**/}
              <View
                style={[
                  styles.cardScene,
                  {
                    height: isCompact
                      ? 135
                      : isMobile
                        ? 155
                        : isTablet
                          ? 220
                          : 190,
                  },
                ]}
              >
                <View style={styles.sceneGrid} />
                <Animated.View
                  style={[
                    styles.sceneSun,
                    {
                      transform: [
                        {
                          scale: pulse.interpolate({
                            inputRange: [0.4, 1],
                            outputRange: [0.97, 1.03],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <Ionicons
                  name="settings-outline"
                  size={isCompact ? 39 : 52}
                  color="#D4A36C"
                  style={styles.sceneGearOne}
                />
                <Ionicons
                  name="settings-outline"
                  size={isCompact ? 28 : 38}
                  color="#D4A36C"
                  style={styles.sceneGearTwo}
                />
                {/**&#x20;CIUDAD&#x20;**/}
                <View style={styles.cityscape}>
                  {[35, 60, 43, 75, 52, 68, 40, 57, 72].map(
                    (item, index) => (
                      <View
                        key={`building-${index}`}
                        style={[
                          styles.building,
                          { height: `${item}%` },
                        ]}
                      />
                    )
                  )}
                </View>
                {/**&#x20;EMBLEMA&#x20;**/}
                <Animated.View
                  style={[
                    styles.centralEmblem,
                    {
                      transform: [
                        {
                          translateY: floating.interpolate({
                            inputRange: [0, 1],
                            outputRange: [2, -4],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={isCompact ? 60 : 78}
                    color={COLORS.cream}
                  />
                  <Ionicons
                    name="flash"
                    size={isCompact ? 25 : 32}
                    color={COLORS.teal}
                    style={styles.emblemFlash}
                  />
                </Animated.View>
                {/**&#x20;SEÑAL&#x20;**/}
                <View style={styles.signalLabel}>
                  <View style={styles.signalDot} />
                  <Text style={styles.signalText}>
                    SIGNAL DETECTED
                  </Text>
                </View>
                <View style={styles.sceneCornerTop} />
                <View style={styles.sceneCornerBottom} />
              </View>
              {/**&#x20;INFORMACIÓN&#x20;**/}
              <View style={styles.cardIdentity}>
                <View style={styles.actionsHeading}>
                  <Text style={styles.actionsTitle}>ACCESO AL SISTEMA</Text>
                  <View style={styles.actionsDivider} />
                </View>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleJugarPress}
                  activeOpacity={0.8}
                  disabled={launchingGame}
                  accessibilityRole="button"
                  accessibilityLabel="Iniciar aventura"
                >
                  {launchingGame ? (
                    <ActivityIndicator color={COLORS.background} />
                  ) : (
                    <>
                      <View style={styles.buttonIcon}>
                        <Ionicons name="game-controller-outline" size={22} color={COLORS.background} />
                      </View>
                      <View style={styles.buttonCopy}>
                        <Text style={styles.primaryButtonText}>INICIAR AVENTURA</Text>
                        <Text style={styles.primaryButtonSubtitle}>ACCEDER AL JUEGO</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={22} color={COLORS.background} />
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleConfigPress}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Abrir configuración"
                >
                  <View style={styles.secondaryIcon}>
                    <Ionicons name="options-outline" size={21} color={COLORS.copper} />
                  </View>
                  <View style={styles.buttonCopy}>
                    <Text style={styles.secondaryButtonText}>CONFIGURACIÓN</Text>
                    <Text style={styles.secondaryButtonSubtitle}>PREFERENCIAS DEL SISTEMA</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={21} color={COLORS.muted} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleCameraPress}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Abrir cámara de personajes"
                >
                  <View style={styles.secondaryIcon}>
                    <Ionicons name="camera-outline" size={21} color={COLORS.teal} />
                  </View>
                  <View style={styles.buttonCopy}>
                    <Text style={styles.secondaryButtonText}>CÁMARA</Text>
                    <Text style={styles.secondaryButtonSubtitle}>CAPTURAR CON PERSONAJES</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={21} color={COLORS.muted} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => handleNavigation('/')}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Ir al menú principal"
                >
                  <View style={styles.secondaryIcon}>
                    <Ionicons name="menu-outline" size={22} color={COLORS.copper} />
                  </View>
                  <View style={styles.buttonCopy}>
                    <Text style={styles.secondaryButtonText}>MENÚ PRINCIPAL</Text>
                    <Text style={styles.secondaryButtonSubtitle}>VOLVER AL INICIO</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={21} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
              {/**&#x20;PIE DE TARJETA&#x20;**/}
              <View style={styles.cardFooter}>
                <View style={styles.footerInfo}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={COLORS.teal}
                  />
                  <Text style={styles.footerInfoText}>
                    METRONIA
                  </Text>
                </View>
                <View style={styles.footerInfo}>
                  <Ionicons
                    name="hardware-chip-outline"
                    size={13}
                    color={COLORS.copper}
                  />
                  <Text style={styles.footerInfoText}>
                    VAPORIS CORP.
                  </Text>
                </View>
              </View>
            </View>
            {/**&#x20;SELLO&#x20;**/}
            <View style={styles.classifiedStamp}>
              <Text style={styles.stampText}>
                CLASSIFIED
              </Text>
            </View>
          </Animated.View>
          {/**&#x20;METADATOS&#x20;**/}
          <View style={styles.metadata}>
            {['STEAMPUNK', 'ACCIÓN 2D', 'PIXEL ART'].map(
              (item) => (
                <View
                  key={item}
                  style={styles.metadataItem}
                >
                  <View style={styles.metadataSquare} />
                  <Text style={styles.metadataText}>
                    {item}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>
      {/**&#x20;MODAL&#x20;**/}
      <CharacterCameraModal
        visible={cameraModalVisible}
        onClose={() => setCameraModalVisible(false)}
      />
      {/**&#x20;FOOTER FIJO&#x20;**/}
      <View style={styles.footerContainer}>
        <CustomFooter
          currentRoute="/"
          onNavigate={handleNavigation}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  //*&#x20;CONTENEDOR GENERAL*
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  //*&#x20;FONDO*
  backgroundGrid: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  gridVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(112,131,138,0.09)',
  },
  gridHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(112,131,138,0.07)',
  },
  ambientLight: {
    position: 'absolute',
    top: '20%',
    right: '-35%',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: COLORS.teal,
  },
  //*&#x20;SCROLL*
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  mainContent: {
    width: '100%',
    alignSelf: 'center',
  },
  landscapeContent: {
    maxWidth: 1050,
  },
  //*&#x20;HEADER*
  header: {
    width: '100%',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  compactHeader: {
    marginBottom: 19,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandMark: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: '#76533D',
    marginRight: 10,
  },
  brandName: {
    color: COLORS.cream,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandAccent: {
    color: COLORS.copper,
  },
  brandSubtitle: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 3,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.teal,
    marginRight: 6,
  },
  headerStatusText: {
    color: COLORS.teal,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  //*&#x20;TITULO*
  titleSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  eyebrow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
    gap: 7,
  },
  eyebrowLine: {
    flex: 1,
    maxWidth: 30,
    height: 2,
    backgroundColor: COLORS.copper,
  },
  eyebrowText: {
    color: COLORS.copper,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  mainTitle: {
    color: COLORS.cream,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
    includeFontPadding: false,
    textShadowColor: COLORS.copper,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  titleDescription: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 9,
    paddingHorizontal: 8,
  },
  //*&#x20;TARJETA*
  characterCard: {
    position: 'relative',
    width: '100%',
    marginBottom: 23,
    padding: 5,
  },
  cardBackplate: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#292731',
    borderWidth: 1,
    borderColor: '#55505A',
    transform: [{ rotate: '0.8deg' }],
  },
  cardFrame: {
    overflow: 'hidden',
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: '#8B6B50',
    elevation: 7,
    shadowColor: COLORS.black,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.55,
    shadowRadius: 0,
  },
  cardTopbar: {
    minHeight: 35,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#26232A',
    borderBottomWidth: 1,
    borderBottomColor: '#8B6B50',
  },
  cardTopbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIndicator: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.teal,
    marginRight: 7,
  },
  cardTopbarText: {
    color: COLORS.cream,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  cardRecord: {
    color: COLORS.copper,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  //*&#x20;ESCENA*
  cardScene: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#263E42',
  },
  sceneGrid: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 1,
    borderColor: 'rgba(36,215,209,0.12)',
  },
  sceneSun: {
    position: 'absolute',
    top: '12%',
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#B85B43',
    borderWidth: 2,
    borderColor: '#E9B16C',
    opacity: 0.85,
  },
  sceneGearOne: {
    position: 'absolute',
    top: 9,
    right: 13,
    opacity: 0.55,
  },
  sceneGearTwo: {
    position: 'absolute',
    bottom: 30,
    left: 13,
    opacity: 0.55,
  },
  cityscape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(10,15,22,0.35)',
  },
  building: {
    width: '10%',
    backgroundColor: '#171A22',
    borderTopWidth: 2,
    borderTopColor: '#36343A',
  },
  centralEmblem: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 110,
    zIndex: 3,
  },
  emblemFlash: {
    position: 'absolute',
  },
  signalLabel: {
    position: 'absolute',
    left: 9,
    bottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: 'rgba(36,215,209,0.5)',
  },
  signalDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.teal,
    marginRight: 6,
  },
  signalText: {
    color: COLORS.teal,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  sceneCornerTop: {
    position: 'absolute',
    top: 9,
    left: 9,
    width: 17,
    height: 17,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: COLORS.teal,
  },
  sceneCornerBottom: {
    position: 'absolute',
    right: 9,
    bottom: 9,
    width: 17,
    height: 17,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.teal,
  },
  //* ACCIONES DENTRO DEL EXPEDIENTE*
  cardIdentity: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 13,
    borderTopWidth: 1,
    borderTopColor: '#8B6B50',
  },
  actionsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },
  actionsTitle: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginRight: 10,
  },
  actionsDivider: {
    height: 1,
    flex: 1,
    backgroundColor: COLORS.border,
  },
  cardFooter: {
    minHeight: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
    backgroundColor: COLORS.panelDark,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerInfoText: {
    color: '#99939A',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginLeft: 4,
  },
  //*&#x20;SELLO*
  classifiedStamp: {
    position: 'absolute',
    top: 11,
    right: -3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: COLORS.red,
    borderWidth: 2,
    borderColor: COLORS.black,
    elevation: 5,
    transform: [{ rotate: '5deg' }],
  },
  stampText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  //*&#x20;ACCIONES*
  primaryButton: {
    minHeight: 60,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.copper,
    borderWidth: 1.5,
    borderColor: COLORS.copperLight,
    marginBottom: 10,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.65,
    shadowRadius: 0,
  },
  buttonIcon: {
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.copperLight,
    borderWidth: 1,
    borderColor: '#A65C32',
    marginRight: 11,
  },
  buttonCopy: {
    flex: 1,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  primaryButtonSubtitle: {
    color: '#44291B',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 3,
  },
  secondaryButton: {
    minHeight: 57,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: '#665448',
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  secondaryIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.panelDark,
    borderWidth: 1,
    borderColor: '#76533D',
    marginRight: 11,
  },
  secondaryButtonText: {
    color: COLORS.cream,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  secondaryButtonSubtitle: {
    color: COLORS.muted,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 3,
  },
  //*&#x20;METADATOS*
  metadata: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 7,
    marginBottom: 5,
  },
  metadataSquare: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.teal,
    marginRight: 5,
  },
  metadataText: {
    color: COLORS.muted,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  //*&#x20;CÁMARA*
  footerContainer: {
    width: '100%',
    zIndex: 20,
    elevation: 20,
    backgroundColor: COLORS.panelDark,
  },
});
