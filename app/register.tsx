import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const containerPadding = isTablet ? 40 : 24;
  const logoSize = isTablet ? 100 : 80;

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { fullName, email, phone, username, password, confirmPassword } =
      formData;

    if (!fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ và tên.");
      return false;
    }

    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Lỗi", "Vui lòng nhập email hợp lệ.");
      return false;
    }

    if (!phone.trim() || phone.length < 10) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại hợp lệ.");
      return false;
    }

    if (!username.trim() || username.length < 3) {
      Alert.alert("Lỗi", "Tên đăng nhập phải có ít nhất 3 ký tự.");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự.");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return false;
    }

    if (!acceptTerms) {
      Alert.alert("Lỗi", "Vui lòng đồng ý với điều khoản sử dụng.");
      return false;
    }

    return true;
  };

  const handleRegister = () => {
    if (!validateForm()) return;

    // For demo purposes only - in a real app, you would call your registration service
    Alert.alert(
      "Đăng ký thành công",
      "Tài khoản của bạn đã được tạo thành công!",
      [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]
    );
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0)
      return { strength: 0, text: "", color: "#E0E0E0" };
    if (password.length < 4)
      return { strength: 1, text: "Yếu", color: "#FF6B6B" };
    if (password.length < 6)
      return { strength: 2, text: "Trung bình", color: "#FFB347" };
    if (password.length < 8)
      return { strength: 3, text: "Mạnh", color: "#4ECDC4" };
    return { strength: 4, text: "Rất mạnh", color: "#45B7D1" };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const styles = createStyles(isTablet, containerPadding, logoSize);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Stack.Screen
        options={{
          title: "Đăng ký tài khoản",
          headerShown: true,
          headerBackVisible: true,
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: isTablet ? 20 : 18,
          },
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
        }}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              <Text style={styles.subtitle}>
                Tạo tài khoản để trải nghiệm những ly cà phê tuyệt vời!
              </Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.formContainer}>
              {/* Username Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Tên đăng nhập *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="at-outline"
                    size={20}
                    color="#8B4513"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Tên đăng nhập duy nhất"
                    value={formData.username}
                    onChangeText={(text) => updateFormData("username", text)}
                    autoCapitalize="none"
                    autoComplete="username"
                    placeholderTextColor="#A0A0A0"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#8B4513"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="example@email.com"
                    value={formData.email}
                    onChangeText={(text) => updateFormData("email", text)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    placeholderTextColor="#A0A0A0"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Mật khẩu *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#8B4513"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChangeText={(text) => updateFormData("password", text)}
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

                {/* Password Strength Indicator */}
                {formData.password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.strengthBarContainer}>
                      {[1, 2, 3, 4].map((level) => (
                        <View
                          key={level}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor:
                                level <= passwordStrength.strength
                                  ? passwordStrength.color
                                  : "#E0E0E0",
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text
                      style={[
                        styles.strengthText,
                        { color: passwordStrength.color },
                      ]}
                    >
                      {passwordStrength.text}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Xác nhận mật khẩu *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#8B4513"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChangeText={(text) =>
                      updateFormData("confirmPassword", text)
                    }
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    placeholderTextColor="#A0A0A0"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={20}
                      color="#8B4513"
                    />
                  </TouchableOpacity>
                </View>

                {/* Password Match Indicator */}
                {formData.confirmPassword.length > 0 && (
                  <View style={styles.passwordMatchContainer}>
                    <Ionicons
                      name={
                        formData.password === formData.confirmPassword
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={16}
                      color={
                        formData.password === formData.confirmPassword
                          ? "#4ECDC4"
                          : "#FF6B6B"
                      }
                    />
                    <Text
                      style={[
                        styles.matchText,
                        {
                          color:
                            formData.password === formData.confirmPassword
                              ? "#4ECDC4"
                              : "#FF6B6B",
                        },
                      ]}
                    >
                      {formData.password === formData.confirmPassword
                        ? "Mật khẩu khớp"
                        : "Mật khẩu không khớp"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  !acceptTerms && styles.registerButtonDisabled,
                ]}
                onPress={handleRegister}
                activeOpacity={0.8}
                disabled={!acceptTerms}
              >
                <Text style={styles.registerButtonText}>Tạo tài khoản</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.orContainer}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>HOẶC</Text>
                <View style={styles.orLine} />
              </View>

              {/* Google Register */}
              <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text style={styles.googleButtonText}>Đăng ký với Google</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.switchMode}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.switchModeText}>
                Đã có tài khoản?{" "}
                <Text style={styles.switchModeLink}>Đăng nhập ngay</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const createStyles = (
  isTablet: boolean,
  containerPadding: number,
  logoSize: number
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FAFAFA",
    },
    contentContainer: {
      flexGrow: 1,
      paddingHorizontal: containerPadding,
      paddingTop: isTablet ? 30 : 20,
      paddingBottom: 40,
    },
    headerSection: {
      alignItems: "center",
      marginBottom: 30,
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
      marginBottom: 16,
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
      fontSize: isTablet ? 28 : 24,
      fontWeight: "bold",
      color: "#8B4513",
      marginBottom: 8,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    subtitle: {
      fontSize: isTablet ? 16 : 14,
      color: "#666666",
      textAlign: "center",
      fontWeight: "500",
      paddingHorizontal: 20,
      lineHeight: 20,
    },
    formSection: {
      flex: 1,
    },
    formContainer: {
      width: "100%",
      maxWidth: isTablet ? 400 : "100%",
      alignSelf: "center",
    },
    inputWrapper: {
      marginBottom: 16,
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
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 52,
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
      fontSize: 15,
      color: "#333333",
      fontWeight: "500",
    },
    eyeIcon: {
      padding: 4,
    },
    passwordStrengthContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      marginLeft: 4,
    },
    strengthBarContainer: {
      flexDirection: "row",
      marginRight: 8,
    },
    strengthBar: {
      width: 20,
      height: 3,
      marginRight: 2,
      borderRadius: 2,
    },
    strengthText: {
      fontSize: 12,
      fontWeight: "600",
    },
    passwordMatchContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      marginLeft: 4,
    },
    matchText: {
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
    },
    termsContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginVertical: 20,
      paddingHorizontal: 4,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: "#E0E0E0",
      marginRight: 12,
      marginTop: 2,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxChecked: {
      backgroundColor: "#8B4513",
      borderColor: "#8B4513",
    },
    termsText: {
      flex: 1,
      fontSize: 14,
      color: "#666666",
      lineHeight: 20,
    },
    termsLink: {
      color: "#8B4513",
      fontWeight: "600",
    },
    registerButton: {
      backgroundColor: "#8B4513",
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: 20,
      shadowColor: "#8B4513",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    registerButtonDisabled: {
      backgroundColor: "#CCCCCC",
      shadowOpacity: 0,
      elevation: 0,
    },
    registerButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#FFFFFF",
      letterSpacing: 0.5,
    },
    orContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 20,
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
      borderRadius: 12,
      paddingVertical: 14,
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
      fontSize: 15,
      marginLeft: 12,
      color: "#333333",
      fontWeight: "600",
    },
    footer: {
      marginTop: 20,
      alignItems: "center",
    },
    switchMode: {
      padding: 16,
    },
    switchModeText: {
      fontSize: 14,
      color: "#666666",
      textAlign: "center",
    },
    switchModeLink: {
      color: "#8B4513",
      fontWeight: "bold",
    },
  });
