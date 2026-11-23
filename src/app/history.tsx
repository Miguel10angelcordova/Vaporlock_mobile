import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CustomFooter from './components/CustomFooter';
import CustomHeader from './components/CustomHeader';

const WEB_DESIGN_URL = 'https://cronos-mauve-one.vercel.app/';
const API_URL = 'https://vaporlock-api.onrender.com/api/historias';

export default function HistoryScreen() {
  const [loadingWeb, setLoadingWeb] = useState(true);
  const [loadingApi, setLoadingApi] = useState(true);
  const [storyData, setStoryData] = useState<any>(null);

  const router = useRouter();

  const lastScrollY = useRef(0);
  const headerTranslateY = useRef(new Animated.Value(0)).current;

  const WebView =
    Platform.OS !== 'web'
      ? require('react-native-webview').WebView
      : null;

  async function fetchHistoryFromBackend() {
    setLoadingApi(true);
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const data = await response.json();
      const historyItem = Array.isArray(data)
        ? data[0] ?? null
        : data?.data && Array.isArray(data.data)
          ? data.data[0] ?? null
          : data ?? null;

      setStoryData(historyItem);
    } catch (error) {
      console.error('Error al conectar con la API:', error);
      setStoryData(null);
    } finally {
      setLoadingApi(false);
    }
  }

  useEffect(() => {
    fetchHistoryFromBackend();
  }, []);

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;

    if (currentScrollY <= 0) {
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      lastScrollY.current = currentScrollY;
      return;
    }

    if (currentScrollY > lastScrollY.current + 5) {
      Animated.timing(headerTranslateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else if (currentScrollY < lastScrollY.current - 5) {
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    lastScrollY.current = currentScrollY;
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

  const apiTitle =
    storyData?.titulo ?? storyData?.title ?? storyData?.nombre ?? '';
  const apiBody =
    storyData?.contenido ??
    storyData?.historia ??
    storyData?.descripcion ??
    storyData?.texto ??
    storyData?.body ??
    '';

  return (
    <View style={styles.container}>
      {/* CONTENIDO PRINCIPAL: Diseño de v0 como fondo completo */}
      <View style={styles.contentContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={WEB_DESIGN_URL}
            title="Historia"
            style={{
              border: 'none',
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        ) : (
          <WebView
            source={{ uri: WEB_DESIGN_URL }}
            style={styles.webview}
            onLoadEnd={() => setLoadingWeb(false)}
            onError={(e: any) => {
              console.log('WebView error:', e.nativeEvent);
              setLoadingWeb(false);
            }}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            originWhitelist={['*']}
          />
        )}

        {/* CAPA DE TEXTO DE LA API SOBRE EL FONDO DE V0 */}
        <View style={styles.textCardContainer} pointerEvents="box-none">
          {loadingApi ? (
            <View style={styles.loaderCenter}>
              <ActivityIndicator size="large" color="#5C3018" />
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {Boolean(apiTitle) && (
                <Text style={styles.title}>{String(apiTitle)}</Text>
              )}

              {Boolean(apiBody) && (
                <Text style={styles.bodyText}>{String(apiBody)}</Text>
              )}
            </ScrollView>
          )}
        </View>

        {loadingWeb && Platform.OS !== 'web' && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#5C3018" />
          </View>
        )}
      </View>

      {/* HEADER ANIMADO EN LA CAPA SUPERIOR */}
      <Animated.View
        style={[
          styles.headerContainer,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
        pointerEvents="box-none"
      >
        <CustomHeader />
      </Animated.View>

      {/* FOOTER */}
      <View style={styles.footerContainer}>
        <CustomFooter currentRoute="/history" onNavigate={handleNavigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBD39B',
  },

  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 30,
  },

  contentContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#EBD39B',
  },

  webview: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    zIndex: 1,
  },

  textCardContainer: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 22,
    paddingTop: 170,
    paddingBottom: 90,
    backgroundColor: 'transparent',
    zIndex: 10,
  },

  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 14,
    paddingBottom: 40,
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2A1810',
    marginBottom: 14,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
  },

  bodyText: {
    fontSize: 16,
    color: '#2A1810',
    lineHeight: 24,
    textAlign: 'justify',
    width: '100%',
  },

  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loader: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 211, 155, 0.75)',
    zIndex: 15,
  },

  footerContainer: {
    width: '100%',
    zIndex: 20,
    elevation: 20,
    backgroundColor: '#2A1810',
  },
});