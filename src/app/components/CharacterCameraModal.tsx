// src/app/components/CharacterCameraModal.tsx
import { Ionicons } from '@expo/vector-icons';
import {
  CameraType,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import * as MediaLibraryLegacy from 'expo-media-library/legacy';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';

type CharacterKey = 'jack' | 'lucius' | 'logo';

interface CharacterCameraModalProps {
  visible: boolean;
  onClose: () => void;
}

const CHARACTER_SPRITES: Record<
  CharacterKey,
  { label: string; source: any }
> = {
  jack: {
    label: 'Jack Veil',
    source: require('../personajes/jack-veil.gif'),
  },
  lucius: {
    label: 'Lucius Core',
    source: require('../personajes/lucius-core.gif'),
  },
  logo: {
    label: 'Menu Logo',
    source: require('../personajes/Menu_Logo.png'),
  },
};

const MOVE_STEP = 24;
const MIN_X = -110;
const MAX_X = 110;
const MIN_Y = -220;
const MAX_Y = 40;

export default function CharacterCameraModal({
  visible,
  onClose,
}: CharacterCameraModalProps) {
  const cameraRef = useRef<CameraView | null>(null);
  const stampRef = useRef<any>(null);
  const stampResolveRef = useRef<(() => void) | null>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterKey>('jack');
  const [facing, setFacing] = useState<CameraType>('back');
  const [busy, setBusy] = useState(false);
  const [lastCaptureUri, setLastCaptureUri] = useState<string | null>(null);
  const [photoToStampUri, setPhotoToStampUri] = useState<string | null>(null);

  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 8,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
      if (Platform.OS !== 'web') {
        try {
          await MediaLibraryLegacy.requestPermissionsAsync(true);
        } catch {
          // Se solicita nuevamente al guardar
        }
      }
    })();
  }, [visible, cameraPermission?.granted, requestCameraPermission]);

  const moveOverlay = (dx: number, dy: number) => {
    setOffsetX((prev) => Math.max(MIN_X, Math.min(MAX_X, prev + dx)));
    setOffsetY((prev) => Math.max(MIN_Y, Math.min(MAX_Y, prev + dy)));
  };

  const resetOverlayPosition = () => {
    setOffsetX(0);
    setOffsetY(0);
  };

  const savePhotoToGallery = async (uri: string) => {
    setLastCaptureUri(uri);

    if (Platform.OS === 'web') {
      Alert.alert(
        'Foto capturada',
        `Archivo generado con ${CHARACTER_SPRITES[selectedCharacter].label}.`
      );
      return;
    }

    try {
      const perm = await MediaLibraryLegacy.requestPermissionsAsync(true);
      if (!perm.granted) {
        Alert.alert(
          'Permiso de galería requerido',
          `No se concedió permiso para guardar en la galería. Archivo temporal: ${uri}`
        );
        return;
      }

      await MediaLibraryLegacy.saveToLibraryAsync(uri);

      Alert.alert(
        'Guardado en galería',
        `La foto con ${CHARACTER_SPRITES[selectedCharacter].label} ya se guardó en tu galería.`
      );
    } catch (error: any) {
      Alert.alert(
        'No se pudo guardar en galería',
        `Archivo en caché (${uri}). Detalle: ${error?.message || 'Error al guardar en galería'}`
      );
    }
  };

  const waitForStampImageLoad = () =>
    new Promise<void>((resolve) => {
      stampResolveRef.current = resolve;
      setTimeout(() => {
        if (stampResolveRef.current === resolve) {
          stampResolveRef.current = null;
          resolve();
        }
      }, 1200);
    });

  const handleStampLoaded = () => {
    if (stampResolveRef.current) {
      const resolve = stampResolveRef.current;
      stampResolveRef.current = null;
      requestAnimationFrame(() => resolve());
    }
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    try {
      const rawPhoto = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (!rawPhoto?.uri) {
        Alert.alert('Error', 'La cámara no devolvió una imagen.');
        return;
      }

      if (Platform.OS === 'web') {
        await savePhotoToGallery(rawPhoto.uri);
        return;
      }

      const loadPromise = waitForStampImageLoad();
      setPhotoToStampUri(rawPhoto.uri);
      await loadPromise;
      await new Promise((resolve) => setTimeout(resolve, 350));

      if (!stampRef.current) {
        setPhotoToStampUri(null);
        await savePhotoToGallery(rawPhoto.uri);
        return;
      }

      const stampedUri = await captureRef(stampRef, {
        format: 'jpg',
        quality: 1,
        result: 'tmpfile',
      });

      setPhotoToStampUri(null);
      await savePhotoToGallery(stampedUri || rawPhoto.uri);
    } catch (error: any) {
      stampResolveRef.current = null;
      setPhotoToStampUri(null);
      Alert.alert(
        'Error',
        `No se pudo tomar la foto: ${error?.message || 'Intenta de nuevo'}`
      );
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    stampResolveRef.current = null;
    setPhotoToStampUri(null);
    onClose();
  };

  const hasCamera = !!cameraPermission?.granted;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#F3E5AB" />
          </TouchableOpacity>

          <Text style={styles.topTitle}>
            Cámara • {CHARACTER_SPRITES[selectedCharacter].label}
          </Text>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() =>
              setFacing((prev) => (prev === 'back' ? 'front' : 'back'))
            }
            disabled={busy}
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#F3E5AB" />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraBox}>
          {!cameraPermission ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#D4AF37" />
              <Text style={styles.infoText}>Verificando permisos de cámara...</Text>
            </View>
          ) : !hasCamera ? (
            <View style={styles.centerBox}>
              <Ionicons name="camera-outline" size={44} color="#D4AF37" />
              <Text style={styles.infoText}>
                Se necesita permiso de cámara para tomar fotos con los personajes y el logo.
              </Text>
              <TouchableOpacity
                style={styles.permBtn}
                onPress={requestCameraPermission}
              >
                <Text style={styles.permBtnText}>CONCEDER PERMISO</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.previewWrapper}>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={facing}
                mode="picture"
              />

              <Animated.View
                style={[
                  styles.characterOverlay,
                  {
                    transform: [
                      { translateX: offsetX },
                      { translateY: Animated.add(floatAnim, offsetY) },
                    ],
                  },
                ]}
                pointerEvents="none"
              >
                <Image
                  source={CHARACTER_SPRITES[selectedCharacter].source}
                  style={[styles.characterSprite, { opacity: 1 }]}
                  resizeMode="contain"
                />
              </Animated.View>

              {photoToStampUri && (
                <View
                  ref={stampRef}
                  collapsable={false}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                >
                  <Image
                    source={{ uri: photoToStampUri }}
                    style={[StyleSheet.absoluteFill, { opacity: 1 }]}
                    resizeMode="cover"
                    onLoad={handleStampLoaded}
                    onError={handleStampLoaded}
                  />
                  <View
                    style={[
                      styles.characterOverlay,
                      {
                        transform: [
                          { translateX: offsetX },
                          { translateY: offsetY },
                        ],
                      },
                    ]}
                  >
                    <Image
                      source={CHARACTER_SPRITES[selectedCharacter].source}
                      style={[styles.characterSprite, { opacity: 1 }]}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.positionBar}>
          <TouchableOpacity
            style={styles.posBtn}
            onPress={() => moveOverlay(-MOVE_STEP, 0)}
            disabled={!hasCamera || busy}
          >
            <Ionicons name="arrow-back" size={18} color="#F3E5AB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.posBtn}
            onPress={() => moveOverlay(0, -MOVE_STEP)}
            disabled={!hasCamera || busy}
          >
            <Ionicons name="arrow-up" size={18} color="#F3E5AB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.posBtn}
            onPress={() => moveOverlay(0, MOVE_STEP)}
            disabled={!hasCamera || busy}
          >
            <Ionicons name="arrow-down" size={18} color="#F3E5AB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.posBtn}
            onPress={() => moveOverlay(MOVE_STEP, 0)}
            disabled={!hasCamera || busy}
          >
            <Ionicons name="arrow-forward" size={18} color="#F3E5AB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetPosBtn}
            onPress={resetOverlayPosition}
            disabled={!hasCamera || busy}
          >
            <Text style={styles.resetPosText}>CENTRAR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.selectorWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorRow}
          >
            {(Object.keys(CHARACTER_SPRITES) as CharacterKey[]).map((key) => {
              const active = selectedCharacter === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.charChip, active && styles.charChipActive]}
                  onPress={() => setSelectedCharacter(key)}
                  disabled={busy}
                >
                  <Text
                    style={[
                      styles.charChipText,
                      active && styles.charChipTextActive,
                    ]}
                  >
                    {CHARACTER_SPRITES[key].label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.controlsBar}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.photoBtn]}
            onPress={handleTakePhoto}
            disabled={!hasCamera || busy}
          >
            <Ionicons name="camera" size={22} color="#2A1810" />
            <Text style={styles.photoBtnText}>
              {busy ? 'TOMANDO...' : 'TOMAR FOTO'}
            </Text>
          </TouchableOpacity>
        </View>

        {lastCaptureUri && (
          <Text style={styles.lastCaptureText} numberOfLines={1}>
            Último archivo: {lastCaptureUri}
          </Text>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#160D08',
    justifyContent: 'space-between',
    paddingBottom: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#2A1810',
    borderBottomWidth: 2,
    borderBottomColor: '#D4AF37',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A2B1D',
    borderWidth: 1,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: {
    color: '#F3E5AB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraBox: {
    flex: 1,
    margin: 12,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D4AF37',
    backgroundColor: '#000',
  },
  previewWrapper: {
    flex: 1,
    position: 'relative',
  },
  characterOverlay: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 170,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterSprite: {
    width: '100%',
    height: '100%',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 14,
  },
  infoText: {
    color: '#F3E5AB',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  permBtn: {
    backgroundColor: '#8C5228',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  permBtnText: {
    color: '#FFF8DC',
    fontWeight: 'bold',
    fontSize: 13,
  },
  positionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  posBtn: {
    width: 38,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#2A1810',
    borderWidth: 1.5,
    borderColor: '#8C5228',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetPosBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#4A2B1D',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetPosText: {
    color: '#F3E5AB',
    fontWeight: 'bold',
    fontSize: 12,
  },
  selectorWrapper: {
    height: 44,
    marginBottom: 8,
    justifyContent: 'center',
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  charChip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#2A1810',
    borderWidth: 1.5,
    borderColor: '#8C5228',
    justifyContent: 'center',
    alignItems: 'center',
  },
  charChipActive: {
    backgroundColor: '#8d7238',
    borderColor: '#D4AF37',
  },
  charChipText: {
    color: '#D8C39E',
    fontWeight: 'bold',
    fontSize: 13,
  },
  charChipTextActive: {
    color: '#2A1810',
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  photoBtn: {
    backgroundColor: '#D4AF37',
    borderColor: '#F3E5AB',
  },
  photoBtnText: {
    color: '#2A1810',
    fontWeight: 'bold',
    fontSize: 14,
  },
  lastCaptureText: {
    color: '#C59B38',
    fontSize: 11,
    paddingHorizontal: 18,
    marginTop: 8,
  },
});