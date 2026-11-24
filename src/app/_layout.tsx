import { useCallback, useEffect, useRef, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StyleSheet, View } from "react-native";
import AnimatedSplash from "./components/splashscreen/AnimatedSplash";
import CustomHeader from "./components/CustomHeader";
import { AudioProvider } from "../context/AudioContext";

void SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn("No se pudo mantener la splash nativa:", error);
});

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  const splashHidden = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function prepare() {
      try {
        // Cargar aquí fuentes, datos o recursos necesarios.
      } catch (error) {
        console.error("Error al preparar la aplicación:", error);
      } finally {
        if (mounted) {
          setAppReady(true);
        }
      }
    }

    void prepare();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLayout = useCallback(() => {
    if (!appReady || splashHidden.current) return;

    splashHidden.current = true;

    void SplashScreen.hideAsync().catch((error) => {
      console.warn("No se pudo ocultar la splash nativa:", error);
    });
  }, [appReady]);

  const handleAnimationFinish = useCallback(() => {
    setAnimationDone(true);
  }, []);

  if (!appReady) {
    return null;
  }

  return (
    <AudioProvider>
      <View style={styles.root} onLayout={handleLayout}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
        />

        <CustomHeader />

        {!animationDone && (
          <View style={styles.splashOverlay}>
            <AnimatedSplash onFinish={handleAnimationFinish} />
          </View>
        )}
      </View>
    </AudioProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#11131A",
  },
  splashOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9999,
    elevation: 9999,
  },
});