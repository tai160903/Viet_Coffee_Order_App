import Loading from "@/components/Loading";
import authService from "@/services/auth.service";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface JwtPayload {
  exp: number;
  iat: number;
  sub: string;
}

export default function LoginScreen() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const containerPadding = isTablet ? 40 : 24;
  const logoSize = isTablet ? 180 : 150;

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          try {
            const decoded = jwtDecode<JwtPayload>(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp > currentTime) {
              router.replace("/(tabs)/home");
            } else {
              await AsyncStorage.removeItem("userToken");
              Toast.show({
                type: "info",
                text1: "Phiên đăng nhập đã hết hạn",
                text2: "Vui lòng đăng nhập lại",
              });
            }
          } catch (decodeError) {
            console.error("Invalid token format:", decodeError);
            await AsyncStorage.removeItem("userToken");
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkToken();
  }, []);

  const handleLogin = async () => {
    if (!username.trim()) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập tài khoản.",
        text2: "Tên đăng nhập không được để trống.",
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập mật khẩu.",
        text2: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
      return;
    }
    setLoading(true);
    const response: any = await authService.login(username, password);
    if (response.status !== 200) {
      Toast.show({
        type: "error",
        text1: `${
          response.data.message || "Vui lòng kiểm tra lại thông tin đăng nhập."
        }`,
        text2: "Vui lòng thử lại sau.",
      });
      setLoading(false);
      return;
    } else {
      await AsyncStorage.setItem("userToken", response.data.data.accessToken);
      Toast.show({
        type: "success",
        text1: "Đăng nhập thành công!",
        text2: "Chào mừng bạn trở lại!",
      });

      setLoading(false);
      router.replace("/(tabs)/home");
    }
  };

  const handleRegisterNavigation = () => {
    router.push("/register");
  };

  const styles = createStyles(isTablet, containerPadding, logoSize);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Loading type="fullscreen" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Pressable onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <Ionicons name="cafe" size={logoSize * 0.6} color="#8B4513" />
              </View>
              <Text style={styles.logoText}>Việt Coffee</Text>
              <Text style={styles.subtitle}>Chào mừng trở lại!</Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.formContainer}>
              {/* Username Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Tên đăng nhập</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#8B4513"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoComplete="username"
                    placeholderTextColor="#A0A0A0"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Mật khẩu</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#8B4513"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    placeholderTextColor="#A0A0A0"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#8B4513"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.orContainer}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>HOẶC</Text>
                <View style={styles.orLine} />
              </View>

              {/* Google Login */}
              <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.registerLink}
              onPress={handleRegisterNavigation}
              activeOpacity={0.7}
            >
              <Text style={styles.registerText}>
                Bạn chưa có tài khoản?{" "}
                <Text style={styles.registerLinkText}>Đăng ký ngay</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const createStyles = (
  isTablet: boolean,
  containerPadding: number,
  logoSize: number
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#f8f9fa",
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    container: {
      minHeight: "100%",
      backgroundColor: "#FAFAFA",
    },
    contentContainer: {
      flexGrow: 1,
      paddingHorizontal: containerPadding,
      paddingTop: isTablet ? 40 : 20,
      paddingBottom: 40,
    },
    headerSection: {
      flex: 1,
      justifyContent: "center",
      minHeight: isTablet ? 300 : 250,
    },
    logoContainer: {
      alignItems: "center",
    },
    logoWrapper: {
      width: logoSize,
      height: logoSize,
      borderRadius: logoSize / 2,
      backgroundColor: "#FFF8F0",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
      shadowColor: "#8B4513",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    logoText: {
      fontSize: isTablet ? 32 : 28,
      fontWeight: "bold",
      color: "#8B4513",
      marginBottom: 8,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    subtitle: {
      fontSize: isTablet ? 18 : 16,
      color: "#666666",
      textAlign: "center",
      fontWeight: "500",
    },
    formSection: {
      flex: 2,
      justifyContent: "center",
    },
    formContainer: {
      width: "100%",
      maxWidth: isTablet ? 400 : "100%",
      alignSelf: "center",
    },
    inputWrapper: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#333333",
      marginBottom: 8,
      marginLeft: 4,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      borderWidth: 1,
      borderColor: "#E8E8E8",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      height: "100%",
      fontSize: 16,
      color: "#333333",
      fontWeight: "500",
    },
    eyeIcon: {
      padding: 4,
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginTop: -8,
      marginBottom: 24,
      padding: 4,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: "#8B4513",
      fontWeight: "600",
    },
    loginButton: {
      backgroundColor: "#8B4513",
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: "center",
      marginBottom: 24,
      shadowColor: "#8B4513",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    loginButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#FFFFFF",
      letterSpacing: 0.5,
    },
    orContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 24,
    },
    orLine: {
      flex: 1,
      height: 1,
      backgroundColor: "#E0E0E0",
    },
    orText: {
      fontSize: 12,
      color: "#999999",
      marginHorizontal: 16,
      fontWeight: "600",
      letterSpacing: 1,
    },
    googleButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: "#E8E8E8",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    googleButtonText: {
      fontSize: 16,
      marginLeft: 12,
      color: "#333333",
      fontWeight: "600",
    },
    footer: {
      flex: 1,
      justifyContent: "flex-end",
      minHeight: 60,
    },
    registerLink: {
      alignItems: "center",
      padding: 16,
    },
    registerText: {
      fontSize: 14,
      color: "#666666",
      textAlign: "center",
    },
    registerLinkText: {
      color: "#8B4513",
      fontWeight: "bold",
    },
  });
