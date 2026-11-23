import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import AnimatedSplash from "./components/splashscreen/AnimatedSplash";
import { AudioProvider } from "../context/AudioContext";

// Evita que la splash nativa se oculte sola
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Aquí carga fuentes, datos, sesión, etc.
      } finally {
        setAppReady(true);
        // Oculta la splash nativa para mostrar la animada
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!appReady) return null;

  return (
    <AudioProvider>
      <Stack screenOptions={{ headerShown: false }} />
      {!animationDone && (
        <AnimatedSplash onFinish={() => setAnimationDone(true)} />
      )}
    </AudioProvider>
  );
}