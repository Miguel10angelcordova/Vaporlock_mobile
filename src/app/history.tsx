import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import CustomFooter from "./components/CustomFooter";
const API_URL = "https://vaporlock-api.onrender.com/api/historias";
interface HistoriaApi {
  titulo?: string;
  title?: string;
  nombre?: string;
  contenido?: string;
  historia?: string;
  descripcion?: string;
  texto?: string;
  body?: string;
  fecha?: string;
  createdAt?: string;
  [key: string]: unknown;
}
interface HistoriaRecord {
  titulo: string;
  contenido: string;
  fecha: string;
}
interface HistoriaSection {
  heading: string;
  paragraphs: string[];
}
function parseStorySections(content: string): HistoriaSection[] {
  const lines = content
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.trim());
  const sections: HistoriaSection[] = [];
  let currentHeading = "CONTENIDO";
  let currentParagraph: string[] = [];
  const flushParagraph = () => {
    const paragraph = currentParagraph.join(" ").replace(/\s+/g, " ").trim();
    if (paragraph) {
      let section = sections[sections.length - 1];
      if (!section || section.heading !== currentHeading) {
        section = { heading: currentHeading, paragraphs: [] };
        sections.push(section);
      }
      section.paragraphs.push(paragraph);
    }
    currentParagraph = [];
  };
  const isHeading = (line: string) => {
    if (!line || line.length > 48 || /[.!?,;:]$/.test(line)) return false;
    const letters = line.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ]/g, "");
    if (letters.length < 3) return false;
    return line === line.toLocaleUpperCase("es-MX");
  };
  for (const line of lines) {
    if (!line) {
      flushParagraph();
      continue;
    }
    if (isHeading(line)) {
      flushParagraph();
      currentHeading = line;
      continue;
    }
    currentParagraph.push(line);
  }
  flushParagraph();
  if (sections.length === 0 && content.trim()) {
    return [{
      heading: "CONTENIDO",
      paragraphs: [content.trim().replace(/\s+/g, " ")],
    }];
  }
  return sections;
}
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
function getHistoryRecord(data: unknown): HistoriaRecord | null {
  const payload = data as any;
  const item = Array.isArray(payload)
    ? payload[0]
    : Array.isArray(payload?.data)
      ? payload.data[0]
      : payload?.data ?? payload;
  if (!item || typeof item !== "object") return null;
  const titulo =
    item.titulo ?? item.title ?? item.nombre ?? "Historia de Metronia";
  const contenido =
    item.contenido ??
    item.historia ??
    item.descripcion ??
    item.texto ??
    item.body ??
    "";
  return {
    titulo: String(titulo),
    contenido: String(contenido),
    fecha: String(item.fecha ?? item.createdAt ?? ""),
  };
}
export default function HistoryScreen() {
  const [story, setStory] = useState<HistoriaRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const isTablet = width >= 700;
  const storySections = story ? parseStorySections(story.contenido) : [];
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }
      const data: unknown = await response.json();
      setStory(getHistoryRecord(data));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la historia de Metronia."
      );
      setStory(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);
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
        if (Platform.OS === "android") {
          BackHandler.exitApp();
        } else {
          router.replace("/");
        }
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
        style={styles.pageScroll}
        contentContainerStyle={[
          styles.pageContent,
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
            { maxWidth: isTablet ? 900 : 650 },
          ]}
        >
          <View style={styles.fileLabel}>
            <View style={styles.pixelDot} />
            <Text style={styles.fileLabelText}>ARCHIVO DE METRONIA</Text>
            <Text style={styles.fileLabelDivider}>//</Text>
            <Text style={styles.fileLabelText}>CRÓNICAS</Text>
          </View>
          <View style={styles.pageHeading}>
            <Text style={styles.eyebrow}>REGISTRO HISTÓRICO</Text>
            <Text
              style={[
                styles.pageTitle,
                { fontSize: isCompact ? 42 : isTablet ? 62 : 54 },
              ]}
            >
              HISTORIA
            </Text>
            <Text style={styles.pageDescription}>
              El origen de Metronia, los acontecimientos que marcaron su
              desarrollo y los hechos que condujeron a la revolución.
            </Text>
          </View>
          <View style={styles.archivePanel}>
            <View style={styles.archivePanelMain}>
              <View style={styles.archiveIcon}>
                <Ionicons
                  name="book-outline"
                  size={23}
                  color={COLORS.orange}
                />
              </View>
              <View style={styles.archivePanelCopy}>
                <Text style={styles.archiveKicker}>DOCUMENTO CENTRAL</Text>
                <Text style={styles.archivePanelTitle}>CRÓNICAS DE METRONIA</Text>
              </View>
              <View style={styles.archiveIndex}>
                <Text style={styles.archiveIndexNumber}>01</Text>
                <Text style={styles.archiveIndexLabel}>ARCHIVO</Text>
              </View>
            </View>
            <View style={styles.archivePanelFooter}>
              <Text style={styles.archiveFooterText}>METRONIA</Text>
              <Text style={styles.archiveFooterText}>2943</Text>
            </View>
          </View>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionHeadingCopy}>
              <View style={styles.sectionKickerRow}>
                <View style={styles.pixelDot} />
                <Text style={styles.sectionKicker}>DOCUMENTO DESCLASIFICADO</Text>
              </View>
              <Text style={styles.sectionTitle}>EL RELATO</Text>
            </View>
            <Ionicons
              name="time-outline"
              size={20}
              color={COLORS.orange}
            />
          </View>
          {loading ? (
            <View style={styles.statePanel}>
              <ActivityIndicator size="large" color={COLORS.orange} />
              <Text style={styles.stateTitle}>CONSULTANDO ARCHIVO...</Text>
              <Text style={styles.stateDescription}>
                Recuperando los registros históricos de Metronia.
              </Text>
            </View>
          ) : error ? (
            <View style={[styles.statePanel, styles.errorPanel]}>
              <Ionicons
                name="warning-outline"
                size={30}
                color={COLORS.red}
              />
              <Text style={styles.stateTitle}>NO SE PUDO CARGAR LA HISTORIA</Text>
              <Text style={styles.stateDescription}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={loadHistory}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="refresh"
                  size={16}
                  color={COLORS.ink}
                />
                <Text style={styles.retryButtonText}>REINTENTAR</Text>
              </TouchableOpacity>
            </View>
          ) : !story || !story.contenido.trim() ? (
            <View style={styles.statePanel}>
              <Ionicons
                name="document-text-outline"
                size={30}
                color={COLORS.orange}
              />
              <Text style={styles.stateTitle}>SIN REGISTROS DISPONIBLES</Text>
              <Text style={styles.stateDescription}>
                Todavía no hay contenido histórico publicado en el archivo
                central.
              </Text>
            </View>
          ) : (
            <View style={styles.storyCard}>
              <View style={styles.storyCardHeader}>
                <View style={styles.storyHeaderMark}>
                  <Ionicons
                    name="document-text-outline"
                    size={17}
                    color={COLORS.ink}
                  />
                </View>
                <View style={styles.storyHeaderCopy}>
                  <Text style={styles.storyHeaderKicker}>
                    ARCHIVO // REGISTRO 001
                  </Text>
                  <Text style={styles.storyHeaderTitle} numberOfLines={2}>
                    {story.titulo}
                  </Text>
                </View>
              </View>
              <View style={styles.storyDivider} />
              <View style={styles.storySections}>
                {storySections.map((section, sectionIndex) => (
                  <View
                    key={`${section.heading}-${sectionIndex}`}
                    style={styles.storySection}
                  >
                    <View style={styles.storySectionHeading}>
                      <View style={styles.storySectionMarker} />
                      <Text style={styles.storySectionTitle}>
                        {section.heading}
                      </Text>
                    </View>
                    <View style={styles.storyParagraphs}>
                      {section.paragraphs.map((paragraph, paragraphIndex) => (
                        <Text
                          key={`${sectionIndex}-${paragraphIndex}`}
                          style={styles.storyBody}
                        >
                          {paragraph}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.storyCardFooter}>
                <Text style={styles.storyFooterText}>VAPORLOCK</Text>
                <Text style={styles.storyFooterText}>FIN DEL REGISTRO</Text>
              </View>
            </View>
          )}
          <View style={styles.pageFooter}>
            <View style={styles.pageFooterCopy}>
              <Text style={styles.pageFooterCode}>VAPORLOCK // 2943</Text>
              <Text style={styles.pageFooterTitle}>LA MEMORIA DE METRONIA</Text>
              <Text style={styles.pageFooterDescription}>
                Cada acontecimiento dejó una marca en la ciudad. Cada registro
                conserva una parte de su historia.
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
          currentRoute="/history"
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
  pageScroll: {
    flex: 1,
  },
  pageContent: {
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
    letterSpacing: 1.2,
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
  archivePanel: {
    minHeight: 104,
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
  archivePanelMain: {
    minHeight: 72,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
  },
  archiveIcon: {
    width: 39,
    height: 39,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundDeep,
  },
  archivePanelCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  archiveKicker: {
    color: COLORS.orange,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  archivePanelTitle: {
    marginTop: 4,
    color: COLORS.paper,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  archiveIndex: {
    alignItems: "flex-end",
  },
  archiveIndexNumber: {
    color: COLORS.paper,
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 34,
    textShadowColor: COLORS.copper,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  archiveIndexLabel: {
    color: COLORS.muted,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  archivePanelFooter: {
    minHeight: 27,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.backgroundDeep,
  },
  archiveFooterText: {
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
  statePanel: {
    minHeight: 185,
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.panel,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  errorPanel: {
    borderLeftWidth: 5,
    borderLeftColor: COLORS.red,
  },
  stateTitle: {
    marginTop: 12,
    color: COLORS.paper,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  stateDescription: {
    maxWidth: 390,
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  retryButton: {
    minHeight: 39,
    marginTop: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  retryButtonText: {
    marginLeft: 7,
    color: COLORS.ink,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  storyCard: {
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.panel,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  storyCardHeader: {
    minHeight: 82,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.panelLight,
  },
  storyHeaderMark: {
    width: 39,
    height: 39,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.orange,
  },
  storyHeaderCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  storyHeaderKicker: {
    color: COLORS.orange,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  storyHeaderTitle: {
    marginTop: 4,
    color: COLORS.paper,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  storyDivider: {
    height: 3,
    backgroundColor: COLORS.copper,
  },
  storySections: {
    paddingHorizontal: 13,
    paddingTop: 12,
    paddingBottom: 8,
  },
  storySection: {
    marginBottom: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundDeep,
  },
  storySectionHeading: {
    minHeight: 38,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.panelLight,
  },
  storySectionMarker: {
    width: 6,
    height: 6,
    marginRight: 9,
    backgroundColor: COLORS.orange,
  },
  storySectionTitle: {
    color: COLORS.orange,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  storyParagraphs: {
    paddingHorizontal: 13,
    paddingTop: 13,
    paddingBottom: 3,
  },
  storyBody: {
    marginBottom: 13,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 22,
    textAlign: "left",
    letterSpacing: 0.1,
  },
  storyCardFooter: {
    minHeight: 31,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.backgroundDeep,
  },
  storyFooterText: {
    color: COLORS.muted,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  pageFooter: {
    minHeight: 105,
    marginTop: 22,
    paddingHorizontal: 14,
    paddingVertical: 13,
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
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.3,
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
