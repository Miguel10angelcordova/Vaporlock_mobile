import { Ionicons } from "@expo/vector-icons";
import {
  CameraView,
  useCameraPermissions,
  type CameraType,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library/legacy";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  type ImageSourcePropType,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { captureRef } from "react-native-view-shot";

type CharacterCameraModalProps = {
  visible: boolean;
  onClose: () => void;
};

type SpriteFrame = {
  source: ImageSourcePropType;
  filename: string;
  number: number;
};

type SpriteAnimation = {
  id: string;
  name: string;
  frames: SpriteFrame[];
  fps: number;
};

/**
 * Estructura admitida:
 * personajes/
 *   cualquier-nombre/
 *     frame_00.png
 *     frame_01.png
 *
 * El catálogo se construye a partir de las carpetas reales.
 * No se exige que el nombre de la carpeta coincida con un nombre fijo.
 */
const spriteContext = (require as any).context(
  "../personajes",
  true,
  /^\.\/.*\/frame_\d+\.png$/i
);

function normalizeName(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createSpriteCatalog(): SpriteAnimation[] {
  const grouped = new Map<string, SpriteFrame[]>();

  for (const file of spriteContext.keys() as string[]) {
    const segments = file.split("/");
    const folder = segments.slice(1, -1).join("/");
    const filename = segments[segments.length - 1] ?? "";
    const match = filename.match(/frame_(\d+)\.png$/i);

    if (!folder || !match) continue;

    const frames = grouped.get(folder) ?? [];
    frames.push({
      source: spriteContext(file) as ImageSourcePropType,
      filename,
      number: Number(match[1]),
    });
    grouped.set(folder, frames);
  }

  return Array.from(grouped.entries())
    .map(([folder, frames]) => {
      const sortedFrames = frames.sort((a, b) => a.number - b.number);
      const folderName = folder.split("/").pop() ?? folder;

      return {
        id: folder,
        name: normalizeName(folderName),
        frames: sortedFrames,
        fps: 8,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

const SPRITE_CATALOG = createSpriteCatalog();

const COLORS = {
  background: "#111719",
  panel: "#1A2425",
  panelLight: "#243031",
  panelDark: "#101819",
  ink: "#172021",
  brass: "#D6B56D",
  brassLight: "#E9D49A",
  brassDark: "#92713B",
  copper: "#BD754B",
  copperDark: "#74432F",
  oxidized: "#5C9A8D",
  oxidizedDark: "#315F58",
  text: "#E7E0CF",
  textMuted: "#9A9B8E",
  border: "#594B38",
  borderLight: "#806644",
  danger: "#B85C4A",
};

const MIN_X = -180;
const MAX_X = 180;
const MIN_Y = -260;
const MAX_Y = 120;

export default function CharacterCameraModal({
  visible,
  onClose,
}: CharacterCameraModalProps) {
  const cameraRef = useRef<CameraView | null>(null);
  const stampRef = useRef<ComponentRef<typeof View>>(null);
  const stampResolveRef = useRef<(() => void) | null>(null);
  const stampTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragOriginRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });

  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  const [selectedAnimationId, setSelectedAnimationId] = useState(
    SPRITE_CATALOG[0]?.id ?? ""
  );
  const [frameIndex, setFrameIndex] = useState(0);
  const [facing, setFacing] = useState<CameraType>("back");
  const [busy, setBusy] = useState(false);
  const [loadingSprite, setLoadingSprite] = useState(true);
  const [loadedFrameIndexes, setLoadedFrameIndexes] = useState<number[]>([]);
  const [spriteError, setSpriteError] = useState(false);
  const [lastCaptureUri, setLastCaptureUri] = useState<string | null>(null);
  const [photoToStampUri, setPhotoToStampUri] = useState<string | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const selectedAnimation = useMemo(
    () =>
      SPRITE_CATALOG.find((animation) => animation.id === selectedAnimationId) ??
      SPRITE_CATALOG[0],
    [selectedAnimationId]
  );

  const frames = selectedAnimation?.frames ?? [];
  const currentFrame = frames[frameIndex] ?? frames[0];
  const fps = selectedAnimation?.fps ?? 8;
  const frameDuration = 1000 / Math.max(1, fps);

  const hasCamera = cameraPermission?.granted === true;
  const hasFrames = frames.length > 0;
  const previewHeight = Math.max(180, screenHeight * 0.42);
  const spriteSize = Math.min(210, Math.max(130, screenWidth * 0.43));

  useEffect(() => {
    setFrameIndex(0);
    setSpriteError(false);
    setLoadingSprite(true);
    setLoadedFrameIndexes([]);
  }, [selectedAnimationId]);

  useEffect(() => {
    if (frames.length > 0 && loadedFrameIndexes.length >= frames.length) {
      setLoadingSprite(false);
    }
  }, [frames.length, loadedFrameIndexes.length]);

  const handlePreviewFrameLoad = useCallback((index: number) => {
    setLoadedFrameIndexes((previous) =>
      previous.includes(index) ? previous : [...previous, index]
    );
  }, []);

  useEffect(() => {
    if (!visible || frames.length <= 1 || busy) return;

    const interval = setInterval(() => {
      setFrameIndex((previous) => (previous + 1) % frames.length);
    }, frameDuration);

    return () => clearInterval(interval);
  }, [visible, frames.length, frameDuration, busy]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(floatAnim, {
          toValue: 5,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [floatAnim]);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    const initializePermissions = async () => {
      try {
        if (!cameraPermission?.granted) {
          await requestCameraPermission();
        }

        if (Platform.OS !== "web") {
          await MediaLibrary.requestPermissionsAsync(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("No se pudieron solicitar todos los permisos:", error);
        }
      }
    };

    void initializePermissions();

    return () => {
      cancelled = true;
    };
  }, [visible, cameraPermission?.granted, requestCameraPermission]);

  const clampX = (value: number) => Math.max(MIN_X, Math.min(MAX_X, value));
  const clampY = (value: number) => Math.max(MIN_Y, Math.min(MAX_Y, value));

  /**
   * El responder se crea una sola vez. La posición vive también en una ref
   * para evitar que cada render reinicie el gesto y devuelva el sticker.
   */
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragOriginRef.current = { ...offsetRef.current };
        },
        onPanResponderMove: (_event, gesture) => {
          const next = {
            x: Math.max(MIN_X, Math.min(MAX_X, dragOriginRef.current.x + gesture.dx)),
            y: Math.max(MIN_Y, Math.min(MAX_Y, dragOriginRef.current.y + gesture.dy)),
          };
          offsetRef.current = next;
          setOffsetX(next.x);
          setOffsetY(next.y);
        },
        onPanResponderRelease: () => undefined,
        onPanResponderTerminate: () => undefined,
        onShouldBlockNativeResponder: () => true,
      }),
    []
  );

  const savePhotoToGallery = useCallback(
    async (uri: string) => {
      setLastCaptureUri(uri);

      if (Platform.OS === "web") {
        Alert.alert(
          "Fotografía capturada",
          `Fotografía generada con ${selectedAnimation?.name ?? "el personaje"}.`
        );
        return;
      }

      try {
        const permission = await MediaLibrary.requestPermissionsAsync(true);

        if (!permission.granted) {
          Alert.alert(
            "Permiso requerido",
            "Se necesita permiso para guardar fotografías en la galería."
          );
          return;
        }

        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert(
          "Fotografía guardada",
          "La fotografía se guardó correctamente en tu galería."
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "No se pudo guardar la fotografía.";

        Alert.alert("Error al guardar", message);
      }
    },
    [selectedAnimation]
  );

  const waitForStampImageLoad = useCallback(
    () =>
      new Promise<void>((resolve) => {
        if (stampTimeoutRef.current) {
          clearTimeout(stampTimeoutRef.current);
        }

        stampResolveRef.current = resolve;
        stampTimeoutRef.current = setTimeout(() => {
          if (stampResolveRef.current === resolve) {
            stampResolveRef.current = null;
            resolve();
          }
        }, 5000);
      }),
    []
  );

  const finishStampImageLoad = useCallback(() => {
    const resolve = stampResolveRef.current;
    if (!resolve) return;

    stampResolveRef.current = null;

    if (stampTimeoutRef.current) {
      clearTimeout(stampTimeoutRef.current);
      stampTimeoutRef.current = null;
    }

    requestAnimationFrame(resolve);
  }, []);

  const handleTakePhoto = useCallback(async () => {
    if (!cameraRef.current || busy) return;

    if (!currentFrame || spriteError) {
      Alert.alert(
        "Animación no disponible",
        `No se encontraron fotogramas para ${selectedAnimation?.name ?? "esta animación"}.`
      );
      return;
    }

    setBusy(true);

    try {
      const rawPhoto = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });

      if (!rawPhoto?.uri) {
        throw new Error("La cámara no devolvió una imagen.");
      }

      if (Platform.OS === "web") {
        await savePhotoToGallery(rawPhoto.uri);
        return;
      }

      const loadPromise = waitForStampImageLoad();
      setPhotoToStampUri(rawPhoto.uri);
      await loadPromise;

      await new Promise((resolve) => setTimeout(resolve, 150));

      if (!stampRef.current) {
        throw new Error("No se pudo preparar la composición.");
      }

      const stampedUri = await captureRef(stampRef.current, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      if (!stampedUri) {
        throw new Error("No se pudo generar la fotografía compuesta.");
      }

      setPhotoToStampUri(null);
      await savePhotoToGallery(stampedUri);
    } catch (error) {
      stampResolveRef.current = null;
      if (stampTimeoutRef.current) {
        clearTimeout(stampTimeoutRef.current);
        stampTimeoutRef.current = null;
      }
      setPhotoToStampUri(null);

      const message =
        error instanceof Error ? error.message : "Intenta nuevamente.";

      Alert.alert("Error", `No se pudo tomar la fotografía: ${message}`);
    } finally {
      setBusy(false);
    }
  }, [
    busy,
    currentFrame,
    savePhotoToGallery,
    selectedAnimation,
    spriteError,
    waitForStampImageLoad,
  ]);

  const handleClose = useCallback(() => {
    stampResolveRef.current = null;

    if (stampTimeoutRef.current) {
      clearTimeout(stampTimeoutRef.current);
      stampTimeoutRef.current = null;
    }

    setPhotoToStampUri(null);
    setBusy(false);
    onClose();
  }, [onClose]);

  const handleSelectAnimation = (id: string) => {
    if (busy || id === selectedAnimationId) return;

    setSelectedAnimationId(id);
    offsetRef.current = { x: 0, y: 0 };
    setOffsetX(0);
    setOffsetY(0);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar cámara de personajes"
          >
            <Ionicons name="close" size={22} color={COLORS.brass} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.eyebrow}>VAPORLOCK // VISUAL LAB</Text>
            <Text style={styles.topTitle}>CÁMARA DE PERSONAJES</Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              setFacing((previous) => (previous === "back" ? "front" : "back"))
            }
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Cambiar cámara"
          >
            <Ionicons
              name="camera-reverse-outline"
              size={22}
              color={COLORS.brass}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.cameraBox, { minHeight: previewHeight * 0.55 }]}>
          {!cameraPermission ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={COLORS.brass} />
              <Text style={styles.infoText}>Inicializando cámara...</Text>
            </View>
          ) : !hasCamera ? (
            <View style={styles.centerBox}>
              <Ionicons name="camera-outline" size={48} color={COLORS.brass} />
              <Text style={styles.infoText}>
                Se necesita permiso para utilizar la cámara.
              </Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={() => void requestCameraPermission()}
              >
                <Text style={styles.permissionButtonText}>CONCEDER PERMISO</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.previewWrapper}>
              <CameraView
                ref={cameraRef}
                style={styles.absoluteFill}
                facing={facing}
                mode="picture"
              />

              {currentFrame && !spriteError && (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.characterOverlay,
                    {
                      width: spriteSize,
                      height: spriteSize,
                      transform: [
                        { translateX: offsetX },
                        { translateY: Animated.add(floatAnim, offsetY) },
                      ],
                    },
                  ]}
                >
                  {frames.map((frame, index) => (
                    <Image
                      key={`${selectedAnimationId}-${frame.filename}`}
                      source={frame.source}
                      style={[
                        styles.characterSprite,
                        styles.stackedCharacterFrame,
                        { opacity: frameIndex === index ? 1 : 0 },
                      ]}
                      resizeMode="contain"
                      fadeDuration={0}
                      onLoad={() => handlePreviewFrameLoad(index)}
                      onError={() => setSpriteError(true)}
                    />
                  ))}
                  <View pointerEvents="none" style={styles.dragHint}>
                    <Ionicons name="move" size={12} color={COLORS.brassLight} />
                    <Text style={styles.dragHintText}>ARRASTRAR</Text>
                  </View>
                </Animated.View>
              )}

              {loadingSprite && hasFrames && (
                <View style={styles.spriteLoader} pointerEvents="none">
                  <ActivityIndicator size="small" color={COLORS.brass} />
                </View>
              )}

              {spriteError && (
                <View style={styles.spriteError}>
                  <Text style={styles.infoText}>No se pudo cargar el personaje.</Text>
                </View>
              )}

              {!hasFrames && (
                <View style={styles.spriteError}>
                  <Text style={styles.infoText}>
                    No hay fotogramas disponibles en la carpeta de personajes.
                  </Text>
                </View>
              )}

              {photoToStampUri && currentFrame && (
                <View
                  ref={stampRef}
                  collapsable={false}
                  style={styles.absoluteFill}
                  pointerEvents="none"
                >
                  <Image
                    source={{ uri: photoToStampUri }}
                    style={styles.absoluteFill}
                    resizeMode="cover"
                    onLoad={finishStampImageLoad}
                    onError={finishStampImageLoad}
                  />
                  <View
                    style={[
                      styles.characterOverlay,
                      {
                        width: spriteSize,
                        height: spriteSize,
                        transform: [
                          { translateX: offsetX },
                          { translateY: offsetY },
                        ],
                      },
                    ]}
                  >
                    <Image
                      source={currentFrame.source}
                      style={styles.characterSprite}
                      resizeMode="contain"
                      onLoad={finishStampImageLoad}
                      onError={finishStampImageLoad}
                    />
                  </View>
                </View>
              )}

              <View style={styles.previewInfo} pointerEvents="none">
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>EN VIVO</Text>
                </View>
                <Text style={styles.previewInfoText}>
                  {frameIndex + 1} / {frames.length}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.controlPanel}>
          <View style={styles.sectionHeading}>
            <View style={styles.headingCopy}>
              <Text style={styles.sectionEyebrow}>EDICIÓN DIRECTA</Text>
              <Text style={styles.sectionTitle}>MUEVE EL PERSONAJE</Text>
              <Text style={styles.helperText}>
                Mantén pulsado y arrastra el personaje sobre la cámara.
              </Text>
            </View>
            <View style={styles.fpsBadge}>
              <Text style={styles.fpsValue}>{fps} FPS</Text>
            </View>
          </View>

          <View style={styles.selectorHeader}>
            <Text style={styles.sectionEyebrow}>BIBLIOTECA DE ANIMACIONES</Text>
            <Text style={styles.animationCount}>
              {SPRITE_CATALOG.length} REGISTROS
            </Text>
          </View>

          {SPRITE_CATALOG.length > 0 ? (
            <View style={styles.selectorGrid}>
              {SPRITE_CATALOG.map((animation) => {
                const active = selectedAnimationId === animation.id;
                const thumbnail = animation.frames[0]?.source;

                return (
                  <TouchableOpacity
                    key={animation.id}
                    style={[styles.characterCard, active && styles.characterCardActive]}
                    onPress={() => handleSelectAnimation(animation.id)}
                    disabled={busy}
                    activeOpacity={0.78}
                  >
                    <View style={styles.characterThumbnail}>
                      {thumbnail ? (
                        <Image source={thumbnail} style={styles.characterThumbnailImage} resizeMode="contain" />
                      ) : null}
                      {active && <View style={styles.selectedMark}><Ionicons name="checkmark" size={12} color={COLORS.ink} /></View>}
                    </View>
                    <Text style={[styles.characterCardName, active && styles.characterCardNameActive]} numberOfLines={1}>
                      {animation.name}
                    </Text>
                    <Text style={styles.characterCardMeta}>{animation.frames.length} fotogramas</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCatalog}>
              <Text style={styles.infoText}>
                No se encontraron archivos frame_XX.png en ../personajes.
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <View style={styles.captureDescription}>
              <Ionicons name="aperture-outline" size={18} color={COLORS.copper} />
              <Text style={styles.captureDescriptionText}>
                CAPTURA CON PERSONAJE
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.captureButton,
                (!hasCamera || busy || loadingSprite || !hasFrames || spriteError) &&
                  styles.captureButtonDisabled,
              ]}
              onPress={() => void handleTakePhoto()}
              disabled={!hasCamera || busy || loadingSprite || !hasFrames || spriteError}
            >
              {busy ? (
                <ActivityIndicator color={COLORS.ink} />
              ) : (
                <Ionicons name="camera" size={23} color={COLORS.ink} />
              )}
              <Text style={styles.captureButtonText}>
                {busy ? "PROCESANDO..." : "TOMAR FOTOGRAFÍA"}
              </Text>
            </TouchableOpacity>
          </View>

          {lastCaptureUri && (
            <Text style={styles.lastCaptureText} numberOfLines={1}>
              ÚLTIMA CAPTURA: {lastCaptureUri}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "android" ? 32 : 46,
    paddingBottom: 10,
  },
  topBar: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.brassDark,
    backgroundColor: COLORS.panel,
  },
  headerButton: {
    width: 43,
    height: 43,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.panelDark,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  eyebrow: {
    color: COLORS.copper,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
  },
  topTitle: {
    color: COLORS.brassLight,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginTop: 3,
  },
  cameraBox: {
    flex: 1,
    minHeight: 180,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 13,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.brassDark,
    backgroundColor: "#000",
  },
  previewWrapper: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  absoluteFill: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  characterOverlay: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    elevation: 5,
  },
  characterSprite: {
    width: "100%",
    height: "100%",
  },
  stackedCharacterFrame: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  dragHint: {
    position: "absolute",
    bottom: 2,
    right: 2,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "rgba(16,24,25,0.82)",
  },
  dragHintText: {
    color: COLORS.brassLight,
    fontSize: 7,
    fontWeight: "900",
    marginLeft: 3,
    letterSpacing: 0.5,
  },
  spriteLoader: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  spriteError: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(17,23,25,0.92)",
    borderWidth: 1,
    borderColor: COLORS.copper,
  },
  previewInfo: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 8,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    backgroundColor: "rgba(17,23,25,0.9)",
    borderWidth: 1,
    borderColor: COLORS.oxidizedDark,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.oxidized,
    marginRight: 6,
  },
  liveText: {
    color: COLORS.oxidized,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  previewInfoText: {
    color: COLORS.brassLight,
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: "rgba(17,23,25,0.9)",
    borderRadius: 5,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  infoText: {
    color: COLORS.text,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 10,
  },
  permissionButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 14,
    backgroundColor: COLORS.copperDark,
    borderWidth: 1,
    borderColor: COLORS.brassDark,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: COLORS.brassLight,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  controlPanel: {
    paddingHorizontal: 13,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.panel,
    borderTopWidth: 2,
    borderTopColor: COLORS.brassDark,
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headingCopy: {
    flex: 1,
    paddingRight: 8,
  },
  sectionEyebrow: {
    color: COLORS.copper,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginTop: 3,
  },
  helperText: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  fpsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    backgroundColor: COLORS.panelDark,
    borderWidth: 1,
    borderColor: COLORS.oxidizedDark,
  },
  fpsValue: {
    color: COLORS.oxidized,
    fontSize: 11,
    fontWeight: "900",
  },
  selectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  animationCount: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: "800",
  },
  selectorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingBottom: 12,
  },
  characterCard: {
    width: "31.5%",
    marginRight: "1.8%",
    marginBottom: 9,
    minHeight: 102,
    padding: 6,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: COLORS.panelDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  characterCardActive: {
    backgroundColor: COLORS.oxidizedDark,
    borderColor: COLORS.brass,
  },
  characterThumbnail: {
    width: "100%",
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderRadius: 5,
    backgroundColor: COLORS.panel,
    marginBottom: 5,
  },
  characterThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  selectedMark: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 17,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: COLORS.brass,
  },
  characterCardName: {
    width: "100%",
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
  characterCardNameActive: {
    color: COLORS.brassLight,
  },
  characterCardMeta: {
    color: COLORS.textMuted,
    fontSize: 8,
    marginTop: 2,
  },
  emptyCatalog: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.panelDark,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  captureDescription: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 6,
  },
  captureDescriptionText: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
    flexShrink: 1,
    marginLeft: 7,
  },
  captureButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    backgroundColor: COLORS.brass,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.brassLight,
  },
  captureButtonDisabled: {
    opacity: 0.45,
  },
  captureButtonText: {
    color: COLORS.ink,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginLeft: 9,
  },
  lastCaptureText: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: 8,
  },
});
