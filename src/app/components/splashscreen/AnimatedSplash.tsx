import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

type Props = {
  onFinish: () => void;
};

export default function AnimatedSplash({ onFinish }: Props) {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("./Vapolock_splashcreen.json")}
        autoPlay
        loop={false}
        resizeMode="contain"
        onAnimationFinish={onFinish}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000000", // cambia al color de fondo de tu animación
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
});