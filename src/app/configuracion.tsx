import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  BackHandler,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useAppAudio } from "../context/AudioContext";
import CustomFooter from "./components/CustomFooter";

const STEP = 0.1;

const COLORS = {
  background: "#17191C",
  backgroundDeep: "#101215",
  panel: "#22252B",
  panelLight: "#2B3039",
  paper: "#E9D5AD",
  paperDark: "#C2A779",
  muted: "#B6B0A4",
  orange: "#C28B43",
  copper: "#8F4C32",
  teal: "#24D7D1",
  red: "#E34C3B",
  ink: "#090A0C",
  text: "#F5EEE0",
  border: "#514337",
};

type VolumeCardProps = {
  title: string;
  description: string;
  iconName: "volume-high" | "musical-notes";
  volume: number;
  onMinus: () => void;
  onPlus: () => void;
  onToggleMute: () => void;
};

function VolumeCard({
  title,
  description,
  iconName,
  volume,
  onMinus,
  onPlus,
  onToggleMute,
}: VolumeCardProps) {
  const percentage = Math.round(volume * 100);
  const isMuted = volume <= 0;

  return (
    <View style={styles.settingCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeading}>
          <View style={styles.iconFrame}>
            <Ionicons name={iconName} size={21} color={COLORS.orange} />
          </View>
          <View style={styles.cardHeadingCopy}>
            <Text style={styles.cardEyebrow}>AJUSTES DE AUDIO</Text>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
          </View>
        </View>
        <View style={styles.percentageBox}>
          <Text style={styles.percentageValue}>{percentage}</Text>
          <Text style={styles.percentageSymbol}>%</Text>
        </View>
      </View>

      <View
        style={styles.meterTrack}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: percentage }}
      >
        <View style={[styles.meterFill, { width: `${percentage}%` }]} />
        {Array.from({ length: 9 }).map((_, index) => (
          <View
            key={index}
            pointerEvents="none"
            style={[
              styles.meterTick,
              { left: `${(index + 1) * 10}%` },
            ]}
          />
        ))}
      </View>

      <View style={styles.cardControls}>
        <View style={styles.stepControls}>
          <TouchableOpacity
            style={styles.stepButton}
            onPress={onMinus}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`Disminuir ${title.toLowerCase()}`}
          >
            <Ionicons name="remove" size={19} color={COLORS.paper} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stepButton}
            onPress={onPlus}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`Aumentar ${title.toLowerCase()}`}
          >
            <Ionicons name="add" size={19} color={COLORS.paper} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.muteButton,
            isMuted && styles.muteButtonActive,
          ]}
          onPress={onToggleMute}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={
            isMuted ? `Activar ${title.toLowerCase()}` : `Silenciar ${title.toLowerCase()}`
          }
        >
          <Ionicons
            name={isMuted ? "volume-mute" : "checkmark-circle"}
            size={16}
            color={isMuted ? COLORS.text : COLORS.ink}
          />
          <Text
            style={[
              styles.muteButtonText,
              isMuted && styles.muteButtonTextActive,
            ]}
          >
            {isMuted ? "SILENCIADO" : "ACTIVO"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardFooterLabel}>NIVEL DE SALIDA</Text>
        <Text style={styles.cardFooterValue}>{percentage}/100</Text>
      </View>
    </View>
  );
}

export default function ConfigScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const isTablet = width >= 700;

  const {
    musicVolume,
    sfxVolume,
    setMusicVolume,
    setSfxVolume,
    playButtonSound,
  } = useAppAudio();

  const updateVolume = useCallback(
    async (
      current: number,
      setter: (value: number) => Promise<void>,
      delta: number,
      playSound: boolean
    ) => {
      const next = Math.max(
        0,
        Math.min(1, Number((current + delta).toFixed(2)))
      );
      await setter(next);
      if (playSound && next > 0) playButtonSound();
    },
    [playButtonSound]
  );

  const adjustMusic = (delta: number) =>
    updateVolume(musicVolume, setMusicVolume, delta, true);

  const adjustSfx = (delta: number) =>
    updateVolume(sfxVolume, setSfxVolume, delta, true);

  const toggleMusicMute = async () => {
    await setMusicVolume(musicVolume > 0 ? 0 : 0.5);
    if (musicVolume === 0) playButtonSound();
  };

  const toggleSfxMute = async () => {
    await setSfxVolume(sfxVolume > 0 ? 0 : 0.7);
    if (sfxVolume === 0) playButtonSound();
  };

  const handleNavigation = (route: string) => {
    switch (route) {
      case "/":
        router.replace("/");
        break;
      case "/history":
        router.replace("/history" as any);
        break;
      case "/characters":
        router.replace("/characters" as any);
        break;
      case "Logout":
      case "/logout":
        if (Platform.OS === "android") BackHandler.exitApp();
        else router.replace("/");
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.backgroundTexture}>
        <View style={styles.backgroundGlowTop} />
        <View style={styles.backgroundGlowBottom} />
        {Array.from({ length: 12 }).map((_, index) => (
          <View
            key={`vertical-${index}`}
            style={[
              styles.gridVertical,
              { left: `${((index + 1) * 100) / 13}%` },
            ]}
          />
        ))}
        {Array.from({ length: 16 }).map((_, index) => (
          <View
            key={`horizontal-${index}`}
            style={[
              styles.gridHorizontal,
              { top: `${((index + 1) * 100) / 17}%` },
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: isCompact ? 15 : isTablet ? 34 : 21,
            paddingBottom: 112,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.pageContainer,
            { maxWidth: isTablet ? 820 : 620 },
          ]}
        >
          <View style={styles.fileLabel}>
            <View style={styles.pixelDot} />
            <Text style={styles.fileLabelText}>ARCHIVO DE METRONIA</Text>
            <Text style={styles.fileLabelDivider}>//</Text>
            <Text style={styles.fileLabelText}>SISTEMA</Text>
          </View>

          <View style={styles.pageHeading}>
            <Text style={styles.eyebrow}>PANEL DE CONTROL</Text>
            <Text
              style={[
                styles.pageTitle,
                { fontSize: isCompact ? 38 : isTablet ? 58 : 48 },
              ]}
            >
              CONFIGURACIÓN
            </Text>
            <Text style={styles.pageDescription}>
              Ajusta los niveles de audio del sistema y personaliza la
              experiencia de Metronia.
            </Text>
          </View>

          <View style={styles.systemPanel}>
            <View style={styles.systemPanelMain}>
              <View style={styles.systemIcon}>
                <Ionicons
                  name="options-outline"
                  size={22}
                  color={COLORS.orange}
                />
              </View>
              <View style={styles.systemPanelCopy}>
                <Text style={styles.systemKicker}>CONTROL CENTRAL</Text>
                <Text style={styles.systemTitle}>PARÁMETROS DE AUDIO</Text>
              </View>
              <View style={styles.systemStatus}>
                <View style={styles.systemStatusDot} />
                <Text style={styles.systemStatusText}>EN LÍNEA</Text>
              </View>
            </View>
            <View style={styles.systemPanelFooter}>
              <Text style={styles.systemFooterText}>METRONIA</Text>
              <Text style={styles.systemFooterText}>SYS // 2943</Text>
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <View style={styles.sectionHeadingCopy}>
              <View style={styles.sectionKickerRow}>
                <View style={styles.pixelDot} />
                <Text style={styles.sectionKicker}>PREFERENCIAS DEL USUARIO</Text>
              </View>
              <Text style={styles.sectionTitle}>AUDIO</Text>
            </View>
            <Ionicons
              name="musical-notes-outline"
              size={20}
              color={COLORS.orange}
            />
          </View>

          <VolumeCard
            title="Efectos de sonido"
            description="Interfaz, acciones y efectos del juego"
            iconName="volume-high"
            volume={sfxVolume}
            onMinus={() => adjustSfx(-STEP)}
            onPlus={() => adjustSfx(STEP)}
            onToggleMute={toggleSfxMute}
          />

          <VolumeCard
            title="Música"
            description="Banda sonora y música ambiental"
            iconName="musical-notes"
            volume={musicVolume}
            onMinus={() => adjustMusic(-STEP)}
            onPlus={() => adjustMusic(STEP)}
            onToggleMute={toggleMusicMute}
          />

          <View style={styles.infoPanel}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.teal}
              />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>SOBRE LOS CONTROLES</Text>
              <Text style={styles.infoText}>
                Utiliza los botones + y − para ajustar el volumen en intervalos
                de 10 %. El control de estado permite silenciar o reactivar cada
                canal de audio.
              </Text>
            </View>
          </View>

          <View style={styles.pageFooter}>
            <View style={styles.pageFooterCopy}>
              <Text style={styles.pageFooterCode}>VAPORLOCK // 2943</Text>
              <Text style={styles.pageFooterTitle}>SISTEMA DE METRONIA</Text>
              <Text style={styles.pageFooterDescription}>
                Los parámetros se aplican a la experiencia de juego.
              </Text>
            </View>
            <View style={styles.footerPixelMark}>
              {Array.from({ length: 9 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.footerPixel,
                    index % 3 === 1 && styles.footerPixelMuted,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerContainer}>
        <CustomFooter
          currentRoute="/configuracion"
          onNavigate={handleNavigation}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: "hidden",
  },
  backgroundTexture: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
    opacity: 0.65,
  },
  backgroundGlowTop: {
    position: "absolute",
    top: 20,
    left: -110,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(143,76,50,0.12)",
  },
  backgroundGlowBottom: {
    position: "absolute",
    right: -130,
    bottom: 80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(194,139,67,0.08)",
  },
  gridVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(233,213,173,0.035)",
  },
  gridHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(233,213,173,0.035)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 25,
  },
  pageContainer: {
    width: "100%",
    alignSelf: "center",
  },
  fileLabel: {
    alignSelf: "flex-start",
    minHeight: 31,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.panel,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  pixelDot: {
    width: 7,
    height: 7,
    marginRight: 8,
    backgroundColor: COLORS.orange,
  },
  fileLabelText: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  fileLabelDivider: {
    marginHorizontal: 8,
    color: COLORS.orange,
    fontSize: 10,
    fontWeight: "900",
  },
  pageHeading: {
    marginTop: 19,
    paddingLeft: 12,
    paddingBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.copper,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  eyebrow: {
    marginBottom: 7,
    color: COLORS.orange,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8,
  },
  pageTitle: {
    color: COLORS.paper,
    fontWeight: "900",
    letterSpacing: 0.6,
    lineHeight: 62,
    textShadowColor: COLORS.copper,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  pageDescription: {
    maxWidth: 590,
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  systemPanel: {
    minHeight: 95,
    marginTop: 17,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.panel,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  systemPanelMain: {
    minHeight: 65,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
  },
  systemIcon: {
    width: 39,
    height: 39,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundDeep,
  },
  systemPanelCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  systemKicker: {
    color: COLORS.orange,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  systemTitle: {
    marginTop: 4,
    color: COLORS.paper,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  systemStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundDeep,
  },
  systemStatusDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 3,
    backgroundColor: COLORS.teal,
  },
  systemStatusText: {
    color: COLORS.teal,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  systemPanelFooter: {
    minHeight: 26,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.backgroundDeep,
  },
  systemFooterText: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  sectionHeading: {
    marginTop: 22,
    marginBottom: 13,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  sectionHeadingCopy: {
    flex: 1,
    minWidth: 0,
  },
  sectionKickerRow: {
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionKicker: {
    color: COLORS.orange,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  sectionTitle: {
    color: COLORS.paper,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
    textShadowColor: COLORS.copper,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  settingCard: {
    marginBottom: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.panel,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeading: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  iconFrame: {
    width: 43,
    height: 43,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundDeep,
  },
  cardHeadingCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  cardEyebrow: {
    color: COLORS.orange,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },
  cardTitle: {
    marginTop: 3,
    color: COLORS.paper,
    fontSize: 16,
    fontWeight: "900",
  },
  cardDescription: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 14,
  },
  percentageBox: {
    minWidth: 48,
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
  },
  percentageValue: {
    color: COLORS.paper,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 27,
    textShadowColor: COLORS.copper,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  percentageSymbol: {
    marginTop: 2,
    marginLeft: 1,
    color: COLORS.orange,
    fontSize: 10,
    fontWeight: "900",
  },
  meterTrack: {
    position: "relative",
    height: 13,
    marginTop: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.backgroundDeep,
  },
  meterFill: {
    height: "100%",
    backgroundColor: COLORS.orange,
  },
  meterTick: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(9,10,12,0.65)",
  },
  cardControls: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepButton: {
    width: 42,
    height: 40,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundDeep,
  },
  muteButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orange,
  },
  muteButtonActive: {
    borderColor: COLORS.red,
    backgroundColor: COLORS.red,
  },
  muteButtonText: {
    marginLeft: 7,
    color: COLORS.ink,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  muteButtonTextActive: {
    color: COLORS.text,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cardFooterLabel: {
    color: COLORS.muted,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  cardFooterValue: {
    color: COLORS.orange,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  infoPanel: {
    marginTop: 4,
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.panel,
  },
  infoIcon: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundDeep,
  },
  infoCopy: {
    flex: 1,
    marginLeft: 10,
  },
  infoTitle: {
    color: COLORS.teal,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  infoText: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
  },
  pageFooter: {
    minHeight: 96,
    marginTop: 19,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.panel,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  pageFooterCopy: {
    flex: 1,
    paddingRight: 10,
  },
  pageFooterCode: {
    color: COLORS.orange,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  pageFooterTitle: {
    marginTop: 5,
    color: COLORS.paper,
    fontSize: 16,
    fontWeight: "900",
  },
  pageFooterDescription: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
  },
  footerPixelMark: {
    width: 40,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  footerPixel: {
    width: 8,
    height: 8,
    margin: 2,
    backgroundColor: COLORS.orange,
  },
  footerPixelMuted: {
    backgroundColor: COLORS.paperDark,
    opacity: 0.35,
  },
  footerContainer: {
    width: "100%",
    zIndex: 20,
    elevation: 20,
    backgroundColor: COLORS.backgroundDeep,
  },
});
