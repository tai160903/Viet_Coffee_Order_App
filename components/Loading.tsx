import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type LoadingProps = {
  message?: string;
  type?: "default" | "fullscreen" | "overlay";
  color?: string;
};

export default function Loading({
  message = "Đang tải...",
  type = "default",
  color = "#0984e3",
}: LoadingProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateY: `${rotation.value}deg` }],
    };
  });

  const getSize = () => {
    if (type === "fullscreen") {
      return isTablet ? 80 : 60;
    } else if (type === "overlay") {
      return isTablet ? 70 : 50;
    }
    return isTablet ? 60 : 40;
  };

  const size = getSize();

  if (type === "fullscreen") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <Animated.View style={animatedStyle}>
            <Ionicons name="cafe-outline" size={60} color={color} />
          </Animated.View>
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (type === "overlay") {
    return (
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          <Animated.View style={animatedStyle}>
            <Ionicons name="cafe-outline" size={size} color={color} />
          </Animated.View>
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Ionicons name="cafe-outline" size={size} color={color} />
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fffff",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    color: "#2d3436",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 36,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3436",
    textAlign: "center",
  },
});
