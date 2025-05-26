import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Platform,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LoadingProps = {
  message?: string;
  type?: "default" | "fullscreen" | "overlay";
  color?: string;
};

export default function Loading({
  message = "Đang tải...",
  type = "default",
  color = "#8B4513", // Coffee brown color from your theme
}: LoadingProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 768;

  // Create rotating animation for coffee cup
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1, // Infinite repetitions
      false // Don't reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateY: `${rotation.value}deg` }],
    };
  });

  // Get appropriate size based on type and device
  const getSize = () => {
    if (type === "fullscreen") {
      return isTablet ? 120 : 80;
    } else if (type === "overlay") {
      return isTablet ? 80 : 60;
    }
    return isTablet ? 70 : 50;
  };

  const size = getSize();

  // Different style based on type
  if (type === "fullscreen") {
    return (
      <View
        style={[
          styles.fullscreen,
          { paddingBottom: insets.bottom, paddingTop: insets.top },
        ]}
      >
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <Ionicons name="cafe" size={size} color={color} />
        </Animated.View>

        <Text style={[styles.message, { fontSize: isTablet ? 20 : 18 }]}>
          {message}
        </Text>

        <ActivityIndicator
          size={isTablet ? "large" : "small"}
          color={color}
          style={styles.spinner}
        />

        <Text style={styles.brandName}>Việt Coffee</Text>
      </View>
    );
  }

  if (type === "overlay") {
    return (
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          <Animated.View style={animatedStyle}>
            <Ionicons name="cafe" size={size} color={color} />
          </Animated.View>
          <Text style={[styles.message, { marginTop: 16 }]}>{message}</Text>
        </View>
      </View>
    );
  }

  // Default loading indicator
  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Ionicons name="cafe" size={size} color={color} />
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  fullscreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
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
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  iconContainer: {
    marginBottom: 16,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#2C3E50",
    textAlign: "center",
  },
  spinner: {
    marginTop: 20,
  },
  brandName: {
    position: "absolute",
    bottom: 40,
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },
});
