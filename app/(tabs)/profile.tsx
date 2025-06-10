"use client";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinDate: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const profileData = await AsyncStorage.getItem("userProfile");

      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      } else {
        // Mock user data - replace with actual API call
        const mockProfile: UserProfile = {
          id: "1",
          name: "Người dùng",
          email: "user@example.com",
          phone: "0123456789",
          joinDate: new Date().toLocaleDateString("vi-VN"),
        };
        setUserProfile(mockProfile);
        await AsyncStorage.setItem("userProfile", JSON.stringify(mockProfile));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove(["userToken", "userProfile"]);
            router.replace("/");
          } catch (error) {
            console.error("Error logging out:", error);
          }
        },
      },
    ]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "white",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      padding: 20,
    },
    profileCard: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    profileHeader: {
      alignItems: "center",
      marginBottom: 20,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#ccc",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    name: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#333",
      textAlign: "center",
    },
    email: {
      fontSize: 16,
      color: "#666",
      opacity: 0.7,
      textAlign: "center",
      marginTop: 4,
    },
    infoSection: {
      marginBottom: 20,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: "#ddd",
    },
    infoIcon: {
      marginRight: 12,
    },
    infoLabel: {
      flex: 1,
      fontSize: 16,
      color: "#333",
    },
    infoValue: {
      fontSize: 16,
      color: "#666",
      opacity: 0.7,
    },
    logoutButton: {
      backgroundColor: "#e74c3c",
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      marginTop: 20,
    },
    logoutText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={"#0984e3"} />
        <Text style={{ color: "#0984e3", marginTop: 12 }}>
          Đang tải thông tin...
        </Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#0984e3" }}>
          Không thể tải thông tin người dùng
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="white" />
            </View>
            <Text style={styles.name}>{userProfile.name}</Text>
            <Text style={styles.email}>{userProfile.email}</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={"#333"}
                style={styles.infoIcon}
              />
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userProfile.email}</Text>
            </View>

            {userProfile.phone && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={"#333"}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{userProfile.phone}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={"#333"}
                style={styles.infoIcon}
              />
              <Text style={styles.infoLabel}>Ngày tham gia</Text>
              <Text style={styles.infoValue}>{userProfile.joinDate}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
