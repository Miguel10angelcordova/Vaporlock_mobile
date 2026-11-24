import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  type ImageSourcePropType,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import CustomFooter from "./components/CustomFooter";
import { apiGet } from "../services/api";

interface PersonajeApi {
  pkPersonaje: number;
  nombre: string;
  slug: string;
  agresividad: string;
  rol: string;
  puntosSalud: number;
  descripcion: string | null;
  historia: string | null;
  publicado: boolean;
}

interface CharacterRecord {
  id: number;
  initials: string;
  nombre: string;
  rol: string;
  salud: number;
  actitud: string;
  descripcion: string;
  historia: string;
  frameSource: ImageSourcePropType | null;
}

type LocalCharacterFrame = {
  folder: string;
  source: ImageSourcePropType;
};

const characterFrameContext = (require as any).context(
  "./personajes",
  true,
  /^\.\/[^/]+\/frame_00\.png$/i
);

const LOCAL_CHARACTER_FRAMES: LocalCharacterFrame[] =
  characterFrameContext.keys().map((file: string) => {
    const segments = file.split("/");
    return {
      folder: segments[1] ?? "",
      source: characterFrameContext(file) as ImageSourcePropType,
    };
  });

function normalizeCharacterKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/*
 * La clave de cada entrada representa términos que pueden aparecer
 * en el slug o nombre devuelto por la API. El valor es la carpeta
 * real del proyecto que contiene el frame_00.png que se debe mostrar.
 *
 * Se seleccionan explícitamente Jack_Veil_Running y Lucius_Invocar.
 * Las variantes repetidas de sus carpetas quedan fuera del catálogo.
 */
const CHARACTER_FRAME_FOLDERS: Record<string, string> = {
  jackveil: "Jack_Veil_Running",
  jack: "Jack_Veil_Running",
  doctor: "Doctor",
  tecnocrata: "Tecnocrata",
  beta32: "Beta32",
  sentinelabeta32: "Beta32",
  epsilon21: "Epsilon21",
  dronepsilon21: "Epsilon21",
  gamma128: "Gamma128_Martillo",
  gamma128martillo: "Gamma128_Martillo",
  kar: "KAR_Walk",
  lucius: "Lucius_Invocar",
  sirbielas: "SirBielas_Estocada",
  omega06: "Omega06_Attack",
  sentinelaalpha16: "SentinelaAlpha16_attack",
};

function getCharacterFrame(
  slug: string,
  name: string
): ImageSourcePropType | null {
  const apiKeys = [slug, name].map(normalizeCharacterKey).filter(Boolean);

  for (const apiKey of apiKeys) {
    const matchingAlias = Object.keys(CHARACTER_FRAME_FOLDERS).find(
      (alias) => apiKey.includes(alias) || alias.includes(apiKey)
    );

    if (!matchingAlias) continue;

    const folderName = CHARACTER_FRAME_FOLDERS[matchingAlias];
    const frame = LOCAL_CHARACTER_FRAMES.find(
      (item) => item.folder === folderName
    );

    if (frame) return frame.source;
  }

  return null;
}

const COLORS = {
  background: "#17191C",
  backgroundDeep: "#101215",
  panel: "#22252B",
  panelLight: "#2B3039",
  paper: "#E9D5AD",
  paperDark: "#C2A779",
  muted: "#B6B0A4",
  red: "#E34C3B",
  orange: "#C28B43",
  copper: "#8F4C32",
  teal: "#24D7D1",
  ink: "#090A0C",
  text: "#F5EEE0",
  border: "#514337",
};

export default function CharactersScreen() {
  const [characters, setCharacters] = useState<CharacterRecord[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const isTablet = width >= 700;

  const loadCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet<PersonajeApi[]>("/personajes");
      const publishedCharacters = (data ?? [])
        .filter((item) => item.publicado === true)
        .map((item) => ({
          id: item.pkPersonaje,
          initials: item.nombre.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase(),
          nombre: item.nombre,
          rol: item.rol,
          salud: item.puntosSalud,
          actitud: item.agresividad,
          descripcion: item.descripcion ?? "",
          historia: item.historia ?? "",
          frameSource: getCharacterFrame(item.slug, item.nombre),
        }));
      setCharacters(publishedCharacters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los personajes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const handleNavigation = (route: string) => {
    switch (route) {
      case "/":
        router.push("/");
        break;
      case "/history":
        router.push("/history" as any);
        break;
      case "/characters":
        router.push("/characters" as any);
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
        {Array.from({ length: 13 }).map((_, index) => (
          <View key={`grid-v-${index}`} style={[styles.gridVertical, { left: `${(index + 1) * (100 / 14)}%` }]} />
        ))}
        {Array.from({ length: 17 }).map((_, index) => (
          <View key={`grid-h-${index}`} style={[styles.gridHorizontal, { top: `${(index + 1) * (100 / 18)}%` }]} />
        ))}
      </View>

      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={[styles.pageContent, { paddingHorizontal: isCompact ? 15 : isTablet ? 34 : 21, paddingBottom: 112 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageContainer, { maxWidth: isTablet ? 920 : 620 }]}>
          <View style={styles.fileLabel}>
            <View style={styles.pixelDot} />
            <Text style={styles.fileLabelText}>ARCHIVO DE METRONIA</Text>
            <Text style={styles.fileLabelDivider}>//</Text>
            <Text style={styles.fileLabelText}>PERSONAL</Text>
          </View>

          <View style={styles.pageHeading}>
            <View style={styles.headingCopy}>
              <Text style={styles.eyebrow}>REGISTRO DE PERSONAJES</Text>
              <Text style={[styles.pageTitle, { fontSize: isCompact ? 16 : isTablet ? 44 : 36 }]}>PERSONAJES</Text>
              <Text style={styles.pageDescription}>Conoce a quienes habitan Metronia, sus historias y los atributos que definen su papel en la aventura.</Text>
            </View>
            <View style={styles.totalPanel}>
              <View style={styles.totalPanelMain}>
                <Ionicons name="people-outline" size={24} color={COLORS.orange} />
                <Text style={styles.totalLabel}>REGISTROS</Text>
                <Text style={styles.totalNumber}>{loading ? "--" : String(characters.length).padStart(2, "0")}</Text>
              </View>
              <View style={styles.totalPanelFooter}>
                <Text style={styles.totalFooterText}>METRONIA</Text>
                <Text style={styles.totalFooterText}>2943</Text>
              </View>
              <View style={styles.pixelDecoration}>
                {Array.from({ length: 9 }).map((_, index) => <View key={index} style={[styles.pixelDecorationCell, index % 2 === 0 && styles.pixelDecorationCellDim]} />)}
              </View>
            </View>
          </View>

          <View style={styles.directoryHeading}>
            <View style={styles.directoryHeadingCopy}>
              <View style={styles.sectionKickerRow}>
                <View style={styles.pixelDot} />
                <Text style={styles.sectionKicker}>DIRECTORIO CENTRAL</Text>
              </View>
              <Text style={styles.sectionTitle}>HABITANTES DE METRONIA</Text>
            </View>
            <Text style={styles.directoryCount}>{String(characters.length).padStart(2, "0")} ARCHIVOS</Text>
          </View>

          {loading ? (
            <View style={styles.statePanel}>
              <ActivityIndicator size="large" color={COLORS.orange} />
              <Text style={styles.stateTitle}>CONSULTANDO ARCHIVO...</Text>
              <Text style={styles.stateDescription}>Conectando con los registros de Metronia.</Text>
            </View>
          ) : error ? (
            <View style={[styles.statePanel, styles.errorPanel]}>
              <Ionicons name="warning-outline" size={30} color={COLORS.red} />
              <Text style={styles.stateTitle}>NO SE PUDO CARGAR EL ARCHIVO</Text>
              <Text style={styles.stateDescription}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadCharacters} activeOpacity={0.85}>
                <Ionicons name="refresh" size={16} color={COLORS.ink} />
                <Text style={styles.retryButtonText}>REINTENTAR</Text>
              </TouchableOpacity>
            </View>
          ) : characters.length === 0 ? (
            <View style={styles.statePanel}>
              <Ionicons name="people-outline" size={30} color={COLORS.orange} />
              <Text style={styles.stateTitle}>SIN REGISTROS DISPONIBLES</Text>
              <Text style={styles.stateDescription}>Todavía no hay personajes publicados en el archivo central.</Text>
            </View>
          ) : (
            <View style={[styles.characterList, isTablet && styles.characterGrid]}>
              {characters.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.characterCard, isTablet && styles.characterCardTablet]}
                  onPress={() => setSelectedCharacter(item)}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ficha de ${item.nombre}`}
                >
                  <View style={styles.characterCardMain}>
                    <View style={styles.characterPortrait}>
                      {item.frameSource ? (
                        <Image
                          source={item.frameSource}
                          style={styles.characterFrameImage}
                          resizeMode="contain"
                          fadeDuration={0}
                          accessibilityLabel={`Retrato de ${item.nombre}`}
                        />
                      ) : (
                        <View style={styles.portraitFallback}>
                          <Ionicons name="person-outline" size={42} color={COLORS.paperDark} />
                          <Text style={styles.portraitFallbackInitials}>{item.initials || "??"}</Text>
                        </View>
                      )}
                      <View style={styles.portraitFrameCorner} />
                      <Text style={styles.portraitRecord}>VL // {String(index + 1).padStart(2, "0")}</Text>
                    </View>
                    <View style={styles.characterSummary}>
                      <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText} numberOfLines={1}>{item.rol || "SIN CLASIFICAR"}</Text>
                      </View>
                      <Text style={styles.characterIndex}>REGISTRO {String(index + 1).padStart(3, "0")}</Text>
                      <Text style={styles.characterName} numberOfLines={2}>{item.nombre}</Text>
                      <View style={styles.summaryDivider} />
                      <View style={styles.summaryStat}>
                        <Ionicons name="heart" size={14} color={COLORS.red} />
                        <Text style={styles.summaryStatLabel}>SALUD</Text>
                        <Text style={styles.summaryStatValue}>{item.salud}</Text>
                      </View>
                      <View style={styles.summaryStat}>
                        <Ionicons name="shield-half-outline" size={14} color={COLORS.orange} />
                        <Text style={styles.summaryStatLabel}>AGRESIVIDAD</Text>
                        <Text style={styles.summaryStatValue} numberOfLines={1}>{item.actitud || "SIN DATOS"}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.characterInfo}>
                    <Text style={styles.cardActionText}>CONSULTAR EXPEDIENTE</Text>
                    <Ionicons name="arrow-forward" size={17} color={COLORS.teal} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.pageFooter}>
            <View style={styles.pageFooterCopy}>
              <Text style={styles.pageFooterCode}>VAPORLOCK // 2943</Text>
              <Text style={styles.pageFooterTitle}>EL ARCHIVO DE METRONIA</Text>
              <Text style={styles.pageFooterDescription}>Cada habitante forma parte de una ciudad al borde de la revolución.</Text>
            </View>
            <View style={styles.footerPixelMark}>
              {Array.from({ length: 9 }).map((_, index) => <View key={index} style={[styles.footerPixel, index % 3 === 1 && styles.footerPixelMuted]} />)}
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={selectedCharacter !== null} transparent animationType="fade" onRequestClose={() => setSelectedCharacter(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopBanner}>
              <View style={styles.modalBannerLine} />
              <Text style={styles.modalEyebrow}>ARCHIVO DE METRONIA // EXPEDIENTE</Text>
              <Text style={styles.modalTitle}>{selectedCharacter?.nombre}</Text>
              <Text style={styles.modalSubtitle}>{selectedCharacter?.rol}</Text>
              <TouchableOpacity style={styles.modalCloseIcon} onPress={() => setSelectedCharacter(null)} accessibilityLabel="Cerrar ficha">
                <Ionicons name="close" size={21} color={COLORS.paper} />
              </TouchableOpacity>
            </View>
            {selectedCharacter?.frameSource && (
              <View style={styles.modalPortraitPanel}>
                <Image
                  source={selectedCharacter.frameSource}
                  style={styles.modalPortraitImage}
                  resizeMode="contain"
                  fadeDuration={0}
                />
              </View>
            )}
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="person-outline" size={17} color={COLORS.orange} />
                  <Text style={styles.sectionHeaderText}>DESCRIPCIÓN</Text>
                  <View style={styles.sectionDivider} />
                </View>
                <Text style={styles.modalDescription}>{selectedCharacter?.descripcion?.trim() || "No hay una descripción registrada para este personaje."}</Text>
              </View>
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="book-outline" size={17} color={COLORS.orange} />
                  <Text style={styles.sectionHeaderText}>HISTORIA</Text>
                  <View style={styles.sectionDivider} />
                </View>
                <Text style={styles.modalDescription}>{selectedCharacter?.historia?.trim() || "No hay una historia registrada para este personaje."}</Text>
              </View>
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="pulse-outline" size={17} color={COLORS.orange} />
                  <Text style={styles.sectionHeaderText}>ATRIBUTOS</Text>
                  <View style={styles.sectionDivider} />
                </View>
                <View style={styles.attributeRowCard}>
                  <View style={styles.attributeLeft}><Ionicons name="heart-outline" size={18} color={COLORS.red} /><Text style={styles.attributeLabel}>SALUD</Text></View>
                  <Text style={styles.attributeValue}>{selectedCharacter?.salud}</Text>
                </View>
                <View style={styles.attributeRowCard}>
                  <View style={styles.attributeLeft}><Ionicons name="shield-outline" size={18} color={COLORS.orange} /><Text style={styles.attributeLabel}>AGRESIVIDAD</Text></View>
                  <Text style={styles.attributeValue}>{selectedCharacter?.actitud}</Text>
                </View>
                <View style={styles.attributeRowCard}>
                  <View style={styles.attributeLeft}><Ionicons name="locate-outline" size={18} color={COLORS.teal} /><Text style={styles.attributeLabel}>ROL</Text></View>
                  <Text style={styles.attributeValue}>{selectedCharacter?.rol}</Text>
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedCharacter(null)} activeOpacity={0.85}>
              <Text style={styles.closeButtonText}>CERRAR EXPEDIENTE</Text>
              <Ionicons name="arrow-forward" size={17} color={COLORS.ink} />
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
  container: { flex: 1, backgroundColor: COLORS.background, overflow: "hidden" },
  backgroundTexture: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, overflow: "hidden", opacity: 0.65 },
  backgroundGlowTop: { position: "absolute", top: 20, left: -110, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(143,76,50,0.12)" },
  backgroundGlowBottom: { position: "absolute", right: -130, bottom: 80, width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(194,139,67,0.08)" },
  gridVertical: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(233,213,173,0.035)" },
  gridHorizontal: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "rgba(233,213,173,0.035)" },
  pageScroll: { flex: 1 },
  pageContent: { flexGrow: 1, alignItems: "center", paddingTop: 25 },
  pageContainer: { width: "100%", alignSelf: "center" },
  fileLabel: { alignSelf: "flex-start", minHeight: 31, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.panel, shadowColor: COLORS.ink, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
  pixelDot: { width: 7, height: 7, backgroundColor: COLORS.orange, marginRight: 8 },
  fileLabelText: { color: COLORS.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  fileLabelDivider: { color: COLORS.orange, marginHorizontal: 8, fontSize: 10, fontWeight: "900" },
  pageHeading: { marginTop: 19, paddingLeft: 12, paddingBottom: 15, borderLeftWidth: 4, borderLeftColor: COLORS.copper, borderBottomWidth: 2, borderBottomColor: COLORS.border },
  headingCopy: { minWidth: 0 },
  eyebrow: { color: COLORS.orange, fontSize: 10, fontWeight: "900", letterSpacing: 1.8, marginBottom: 7 },
  pageTitle: { color: COLORS.paper, fontWeight: "900", letterSpacing: 1.2, lineHeight: 58, textShadowColor: COLORS.copper, textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0 },
  pageDescription: { maxWidth: 590, marginTop: 7, color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  totalPanel: { position: "relative", minHeight: 104, marginTop: 17, overflow: "hidden", borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.panel, shadowColor: COLORS.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  totalPanelMain: { minHeight: 72, paddingHorizontal: 13, paddingVertical: 9, flexDirection: "row", alignItems: "center" },
  totalLabel: { marginLeft: 10, color: COLORS.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1, flex: 1 },
  totalNumber: { color: COLORS.paper, fontSize: 38, fontWeight: "900", lineHeight: 43, textShadowColor: COLORS.copper, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  totalPanelFooter: { minHeight: 27, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 2, borderTopColor: COLORS.border, backgroundColor: COLORS.backgroundDeep },
  totalFooterText: { color: COLORS.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  pixelDecoration: { position: "absolute", top: 8, right: 9, flexDirection: "row", flexWrap: "wrap", width: 29 },
  pixelDecorationCell: { width: 5, height: 5, margin: 1, backgroundColor: COLORS.orange },
  pixelDecorationCellDim: { opacity: 0.2 },
  directoryHeading: { marginTop: 21, marginBottom: 13, paddingBottom: 10, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", borderBottomWidth: 2, borderBottomColor: COLORS.border },
  directoryHeadingCopy: { flex: 1, minWidth: 0 },
  sectionKickerRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  sectionKicker: { color: COLORS.orange, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  sectionTitle: { color: COLORS.paper, fontSize: 22, fontWeight: "900", lineHeight: 28, textShadowColor: COLORS.copper, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  directoryCount: { color: COLORS.orange, fontSize: 8, fontWeight: "900", letterSpacing: 0.7, marginLeft: 8, marginBottom: 3 },
  characterList: { width: "100%" },
  characterGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  characterCard: { width: "100%", marginBottom: 12, overflow: "hidden", borderWidth: 2, borderColor: COLORS.ink, backgroundColor: COLORS.panel, shadowColor: COLORS.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  characterCardTablet: { width: "48.5%" },
  characterCardMain: { minHeight: 148, flexDirection: "row", backgroundColor: COLORS.panel },
  characterPortrait: { position: "relative", width: 116, minHeight: 148, justifyContent: "center", alignItems: "center", overflow: "hidden", borderRightWidth: 2, borderRightColor: COLORS.ink, backgroundColor: "#252D38" },
  characterFrameImage: { width: "100%", height: 130 },
  portraitFallback: { flex: 1, width: "100%", justifyContent: "center", alignItems: "center" },
  portraitFallbackInitials: { marginTop: 5, color: COLORS.orange, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  portraitFrameCorner: { position: "absolute", top: 7, left: 7, width: 15, height: 15, borderTopWidth: 2, borderLeftWidth: 2, borderColor: COLORS.orange },
  portraitRecord: { position: "absolute", right: 4, bottom: 5, left: 4, color: COLORS.teal, fontSize: 7, fontWeight: "900", textAlign: "center", letterSpacing: 0.4 },
  characterSummary: { flex: 1, minWidth: 0, justifyContent: "center", paddingHorizontal: 12, paddingVertical: 10 },
  roleBadge: { alignSelf: "flex-start", maxWidth: "100%", marginBottom: 7, paddingHorizontal: 7, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.ink, backgroundColor: COLORS.red },
  roleBadgeText: { color: COLORS.text, fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
  characterIndex: { color: COLORS.orange, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  characterName: { marginTop: 3, color: COLORS.paper, fontSize: 18, fontWeight: "900", lineHeight: 22 },
  summaryDivider: { height: 1, marginTop: 8, marginBottom: 6, backgroundColor: COLORS.border },
  summaryStat: { minHeight: 21, flexDirection: "row", alignItems: "center" },
  summaryStatLabel: { flex: 1, marginLeft: 6, color: COLORS.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
  summaryStatValue: { maxWidth: "48%", color: COLORS.text, fontSize: 10, fontWeight: "800", textAlign: "right" },
  characterInfo: { minHeight: 36, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.backgroundDeep },
  cardActionText: { color: COLORS.teal, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  statePanel: { minHeight: 185, padding: 22, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.panel, shadowColor: COLORS.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  errorPanel: { borderLeftWidth: 5, borderLeftColor: COLORS.red },
  stateTitle: { marginTop: 12, color: COLORS.paper, fontSize: 12, fontWeight: "900", letterSpacing: 0.8, textAlign: "center" },
  stateDescription: { maxWidth: 390, marginTop: 7, color: COLORS.muted, fontSize: 12, lineHeight: 18, textAlign: "center" },
  retryButton: { minHeight: 39, marginTop: 15, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: COLORS.ink, backgroundColor: COLORS.orange, shadowColor: COLORS.ink, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
  retryButtonText: { marginLeft: 7, color: COLORS.ink, fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  pageFooter: { minHeight: 105, marginTop: 22, paddingHorizontal: 14, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.panel, shadowColor: COLORS.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  pageFooterCopy: { flex: 1, paddingRight: 10 },
  pageFooterCode: { color: COLORS.orange, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  pageFooterTitle: { marginTop: 5, color: COLORS.paper, fontSize: 18, fontWeight: "900", letterSpacing: 0.4 },
  pageFooterDescription: { marginTop: 4, color: COLORS.muted, fontSize: 10, lineHeight: 15 },
  footerPixelMark: { width: 40, flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end" },
  footerPixel: { width: 8, height: 8, margin: 2, backgroundColor: COLORS.orange },
  footerPixelMuted: { backgroundColor: COLORS.paperDark, opacity: 0.35 },
  footerContainer: { position: "absolute", right: 0, bottom: 0, left: 0, zIndex: 20, elevation: 20 },
  modalBackdrop: { flex: 1, padding: 16, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(5,7,10,0.88)" },
  modalCard: { width: "100%", maxWidth: 480, maxHeight: "88%", overflow: "hidden", borderWidth: 3, borderColor: COLORS.ink, backgroundColor: COLORS.panel, shadowColor: COLORS.ink, shadowOffset: { width: 7, height: 7 }, shadowOpacity: 1, shadowRadius: 0, elevation: 10 },
  modalTopBanner: { position: "relative", paddingHorizontal: 18, paddingTop: 18, paddingBottom: 15, alignItems: "center", borderBottomWidth: 3, borderBottomColor: COLORS.ink, backgroundColor: COLORS.backgroundDeep },
  modalBannerLine: { width: 55, height: 4, marginBottom: 10, backgroundColor: COLORS.orange },
  modalEyebrow: { color: COLORS.orange, fontSize: 8, fontWeight: "900", letterSpacing: 1.1 },
  modalTitle: { marginTop: 8, color: COLORS.paper, fontSize: 25, fontWeight: "900", textAlign: "center", textShadowColor: COLORS.copper, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  modalSubtitle: { marginTop: 4, color: COLORS.teal, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  modalCloseIcon: { position: "absolute", top: 9, right: 9, width: 34, height: 34, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.panel },
  modalPortraitPanel: { height: 150, justifyContent: "center", alignItems: "center", borderBottomWidth: 2, borderBottomColor: COLORS.ink, backgroundColor: "#252D38" },
  modalPortraitImage: { width: 130, height: 140 },
  modalScroll: { paddingHorizontal: 17, paddingTop: 17, paddingBottom: 8 },
  sectionBlock: { marginBottom: 17 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 9 },
  sectionHeaderText: { marginLeft: 7, color: COLORS.orange, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  sectionDivider: { flex: 1, height: 1, marginLeft: 10, backgroundColor: COLORS.border },
  modalDescription: { color: COLORS.text, fontSize: 13, lineHeight: 20 },
  attributeRowCard: { minHeight: 48, marginBottom: 8, paddingHorizontal: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.panelLight },
  attributeLeft: { flexDirection: "row", alignItems: "center" },
  attributeLabel: { marginLeft: 9, color: COLORS.muted, fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  attributeValue: { maxWidth: "55%", color: COLORS.paper, fontSize: 12, fontWeight: "900", textAlign: "right" },
  closeButton: { minHeight: 49, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", borderTopWidth: 3, borderTopColor: COLORS.ink, backgroundColor: COLORS.orange },
  closeButtonText: { marginRight: 9, color: COLORS.ink, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
});
