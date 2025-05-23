import Ionicons from "@expo/vector-icons/Ionicons"; // Hoặc 'react-native-vector-icons/Ionicons'
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type RootStackParamList = {
  Login: undefined;
};

const CustomHeader = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.header}>
      <Text style={styles.logo}>Việt Coffee</Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Ionicons
          name="log-in-outline"
          size={20}
          color="#fff"
          style={{ marginRight: 4 }}
        />
        <Text style={styles.loginText}>Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
  },
  logo: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0284c7",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  loginText: {
    color: "#fff",
    fontSize: 14,
  },
});
