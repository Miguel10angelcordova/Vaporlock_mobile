import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CharacterCameraModal from './CharacterCameraModal';
import CustomFooter from './CustomFooter';
import CustomHeader from './CustomHeader';

const MENU_URL = 'https://menu-coral-hazel.vercel.app/';
const GAME_URL = 'https://gus-lpz.itch.io/vaporlock';

export default function MenuScreen() {
  const [loading, setLoading] = useState(true);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const router = useRouter();

  const WebView =
    Platform.OS !== 'web' ? require('react-native-webview').WebView : null;

  const handleJugarPress = () => {
    Linking.openURL(GAME_URL);
  };

  const handleConfigPress = () => {
    router.push('/configuracion' as any);
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
      {/* HEADER fijo en la parte superior */}
      <View style={styles.headerContainer} pointerEvents="box-none">
        <CustomHeader />
      </View>

      {/* CONTENEDOR PRINCIPAL */}
      <View style={styles.contentContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={MENU_URL}
            style={{
              border: 'none',
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: '#160D08',
            }}
            title="Menu"
          />
        ) : (
          <WebView
            source={{ uri: MENU_URL }}
            style={[styles.webview, StyleSheet.absoluteFill]}
            onLoadEnd={() => setLoading(false)}
            onError={(e: any) => {
              console.log('WebView error:', e.nativeEvent);
              setLoading(false);
            }}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
          />
        )}

        {/* Botón flotante de cámara */}
        <TouchableOpacity
          style={styles.floatingCameraButton}
          onPress={() => setCameraModalVisible(true)}
          activeOpacity={0.85}
          accessibilityLabel="Abrir cámara con personajes"
        >
          <Ionicons name="camera" size={22} color="#F3E5AB" />
        </TouchableOpacity>

        {/* Capa flotante interactiva para los botones centrados */}
        <View style={styles.buttonsOverlay} pointerEvents="box-none">
          <View style={styles.buttonContainer} pointerEvents="auto">
            <TouchableOpacity
              style={styles.steampunkButton}
              onPress={handleJugarPress}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>JUGAR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.steampunkButton}
              onPress={handleConfigPress}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Configuración</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading && Platform.OS !== 'web' && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#D4AF37" />
          </View>
        )}
      </View>

      <CharacterCameraModal
        visible={cameraModalVisible}
        onClose={() => setCameraModalVisible(false)}
      />

      {/* FOOTER fijo en la parte inferior */}
      <View style={styles.footerContainer}>
        <CustomFooter onNavigate={handleNavigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#160D08',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#160D08',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#160D08',
  },
  buttonsOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  buttonContainer: {
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
    marginTop: 80,
  },
  steampunkButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#8C5228',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonText: {
    color: '#FFF8DC',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  floatingCameraButton: {
    position: 'absolute',
    top: 112,
    left: 76,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8C5228',
    borderWidth: 2,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  loader: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#160D08',
    zIndex: 15,
  },
  footerContainer: {
    width: '100%',
    zIndex: 20,
    elevation: 20,
    backgroundColor: '#000',
  },
});