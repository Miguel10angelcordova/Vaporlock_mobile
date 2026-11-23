import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const URL = 'https://vaporlock.vercel.app/';

// Ajusta esta ruta a tu archivo .gif en assets/
const CENTER_IMAGE = require('../app/personajes/jack-veil.gif');

export default function Index() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handlePress = () => {
    router.push('/components/Menu');
  };

  const WebView =
    Platform.OS !== 'web' ? require('react-native-webview').WebView : null;

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          src={URL}
          style={{ border: 'none', width: '100%', height: '100%' }}
          title="Vaporlock"
        />
      ) : (
        <WebView
          source={{ uri: URL }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          onError={(e: any) => console.log('WebView error:', e.nativeEvent)}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
        />
      )}

      {/* Capa superior que contiene los textos, GIF central y el botón interactivo */}
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.textContainer}>
          <Text style={styles.subtitle}>Bienvenido</Text>
          <Text style={styles.paragraph}>
            Jugador a la pagina de Vaporlock
          </Text>
        </View>

        <View style={styles.imageWrapper} pointerEvents="none">
          <Image
            source={CENTER_IMAGE}
            style={styles.centerImage}
            contentFit="contain"
            autoplay
          />
        </View>

        <View style={styles.buttonWrapper} pointerEvents="auto">
          <TouchableOpacity
            style={styles.button}
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
          <Text style={styles.buttonSubtext}>Toca para empezar</Text>
        </View>
      </View>

      {loading && Platform.OS !== 'web' && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1, backgroundColor: 'black' },
  loader: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3b1d0a',
    marginBottom: 8,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    color: '#3b1d0a',
    textAlign: 'center',
  },
  imageWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  centerImage: {
    width: 220,
    height: 180,
  },
  buttonWrapper: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  button: {
    width: '80%',
    maxWidth: 300,
    height: 50,
    backgroundColor: '#b87d4b',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#6b3e16',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#2e1206',
    fontWeight: '600',
  },
});