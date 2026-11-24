
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";

type Props = {
  onFinish: () => void;
};

export default function AnimatedSplash({ onFinish }: Props) {
  const handleAnimationFinish = useCallback(
    (isCancelled: boolean) => {
      if (!isCancelled) {
        onFinish();
      }
    },
    [onFinish]
  );

  return (
    <View style={styles.container}>
      <LottieView
        source={require("./Vapolock_splashcreen.json")}
        autoPlay
        loop={false}
        resizeMode="contain"
        onAnimationFinish={handleAnimationFinish}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
});
