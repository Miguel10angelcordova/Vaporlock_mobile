import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";

const COLORS = {
  background: "#11131A",
  panel: "#191B24",
  panelLight: "#26232A",
  copper: "#E38A42",
  copperLight: "#F2A65E",
  copperDark: "#76513B",
  cream: "#F4E8CF",
  teal: "#24D7D1",
  border: "#39343A",
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Agrega aquí las rutas donde SÍ quieras que aparezca el botón (por ejemplo "/characters", "/configuracion", "/history")
const VISIBLE_ROUTES = ["/characters", "/configuracion", "/history"];

export default function CustomHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isCompact = width < 380;
  const buttonSize = isCompact ? 46 : 54;
  const topOffset = Platform.OS === "ios" ? 50 : 40;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  if (!VISIBLE_ROUTES.includes(pathname)) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[styles.headerContainer, { top: topOffset, right: 16 }]}
    >
      <AnimatedTouchable
        activeOpacity={0.85}
        onPress={() => router.push("/components/Menu")}
        style={[
          styles.menuButton,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.outerRing,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />

        <View style={styles.innerDecoration}>
          <View style={styles.iconBackground}>
            <Ionicons
              name="menu"
              size={isCompact ? 20 : 22}
              color={COLORS.cream}
            />
          </View>
        </View>

        <View style={[styles.rivet, styles.topRivet]} />
        <View style={[styles.rivet, styles.bottomRivet]} />
        <View style={styles.statusIndicator} />
      </AnimatedTouchable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    zIndex: 999,
    elevation: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  // BOTON PRINCIPAL

  menuButton: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: COLORS.copper,
    elevation: 7,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.55,
    shadowRadius: 5,
  },

  // ANILLO ANIMADO

  outerRing: {
    position: "absolute",
    top: -4,
    right: -4,
    bottom: -4,
    left: -4,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: COLORS.teal,
  },

  // ESTRUCTURA INTERIOR

  innerDecoration: {
    width: "78%",
    height: "78%",
    borderRadius: 50,
    backgroundColor: COLORS.panelLight,
    borderWidth: 1,
    borderColor: COLORS.copperDark,
    justifyContent: "center",
    alignItems: "center",
  },

  iconBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  // REMACHES

  rivet: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.copperLight,
    borderWidth: 0.5,
    borderColor: COLORS.cream,
  },

  topRivet: {
    top: 5,
  },

  bottomRivet: {
    bottom: 5,
  },

  // INDICADOR DE ESTADO

  statusIndicator: {
    position: "absolute",
    right: 6,
    top: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.teal,
    borderWidth: 0.5,
    borderColor: COLORS.background,
  },
});