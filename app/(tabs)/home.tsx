import Loading from "@/components/Loading";
import { formatCurrency } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  image: string;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  validUntil: string;
  discountPercent?: number;
  code?: string;
}

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const user = AsyncStorage.getItem("userData");
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Get user info for greeting
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserName(user.name || "");
        }

        // Load featured products, categories and promotions
        // const [productsRes, categoriesRes, promotionsRes, bestsellersRes] =
        //   await Promise.all([
        //     productService.getFeaturedProducts(),
        //     productService.getCategories(),
        //     productService.getPromotions(),
        //     productService.getBestSellers(),
        //   ]);

        // setFeaturedProducts(productsRes || []);
        // setCategories(categoriesRes || []);
        // setPromotions(promotionsRes || []);
        // setBestSellers(bestsellersRes || []);
      } catch (error) {
        console.error("Error loading home data:", error);
        // Load sample data if API fails
        loadSampleData();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sample data for development/testing
  const loadSampleData = () => {
    // Sample categories
    setCategories([
      { id: "1", name: "Cà Phê", image: "https://example.com/coffee.png" },
      { id: "2", name: "Trà Trái Cây", image: "https://example.com/tea.png" },
      { id: "3", name: "Đá Xay", image: "https://example.com/frappe.png" },
      { id: "4", name: "Bánh Ngọt", image: "https://example.com/bakery.png" },
    ]);

    // Sample featured products
    setFeaturedProducts([
      {
        id: "101",
        name: "Cà phê sữa đá",
        price: 29000,
        image: "https://example.com/cafe-sua-da.jpg",
        category: { id: "1", name: "Cà Phê" },
      },
      {
        id: "102",
        name: "Trà đào cam sả",
        price: 45000,
        image: "https://example.com/tra-dao.jpg",
        category: { id: "2", name: "Trà Trái Cây" },
      },
      {
        id: "103",
        name: "Matcha đá xay",
        price: 55000,
        image: "https://example.com/matcha.jpg",
        category: { id: "3", name: "Đá Xay" },
      },
    ]);

    // Sample promotions
    setPromotions([
      {
        id: "1",
        title: "Khuyến mãi mùa hè",
        description: "Giảm 20% cho tất cả đồ uống đá xay",
        imageUrl: "https://example.com/summer-promo.jpg",
        validUntil: "2023-12-31",
        discountPercent: 20,
        code: "SUMMER20",
      },
      {
        id: "2",
        title: "Mua 1 tặng 1",
        description: "Mua 1 tặng 1 cho tất cả cà phê vào ngày thứ 2 hàng tuần",
        imageUrl: "https://example.com/bogo-promo.jpg",
        validUntil: "2023-12-31",
      },
    ]);

    // Sample bestsellers
    setBestSellers([
      {
        id: "201",
        name: "Bạc xỉu đá",
        price: 35000,
        image: "https://example.com/bac-xiu.jpg",
        category: { id: "1", name: "Cà Phê" },
      },
      {
        id: "202",
        name: "Cà phê đen đá",
        price: 25000,
        image: "https://example.com/cafe-den.jpg",
        category: { id: "1", name: "Cà Phê" },
      },
      {
        id: "203",
        name: "Trà sen vàng",
        price: 45000,
        image: "https://example.com/tra-sen.jpg",
        category: { id: "2", name: "Trà Trái Cây" },
      },
    ]);
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Loading type="fullscreen" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{userName || "Quý khách"}</Text>
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push("/(tabs)/menu")}
          >
            <Ionicons name="search" size={22} color="#8B4513" />
          </TouchableOpacity>
        </View>

        {/* Promotions carousel */}
        {promotions.length > 0 && (
          <View style={styles.carouselContainer}>
            <Carousel
              width={width - 32}
              height={180}
              data={promotions}
              loop
              autoPlay
              autoPlayInterval={5000}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.promotionCard}
                  onPress={() => {
                    // Navigate to promotion detail or apply promo
                    if (item.code) {
                      // Copy promo code or apply it
                      Alert.alert(
                        "Mã khuyến mãi",
                        `Sử dụng mã: ${item.code} để được giảm ${item.discountPercent}%`
                      );
                    }
                  }}
                >
                  <ImageBackground
                    source={{ uri: item.imageUrl }}
                    style={styles.promotionImage}
                    imageStyle={{ borderRadius: 12 }}
                  >
                    <View style={styles.promotionOverlay}>
                      <View style={styles.promotionContent}>
                        <Text style={styles.promotionTitle}>{item.title}</Text>
                        <Text
                          style={styles.promotionDescription}
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => {
                  // Navigate to category products
                  router.push({
                    pathname: "/(tabs)/menu",
                    params: { category: item.id },
                  });
                }}
              >
                <View style={styles.categoryImageContainer}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.categoryImage}
                  />
                </View>
                <Text style={styles.categoryName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Featured Products */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đặc biệt hôm nay</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/menu")}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => {
                  router.push({
                    pathname: "/details/[id]",
                    params: { id: item.id },
                  });
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.productCategory}>
                    {item.category.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    {formatCurrency(item.price)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.productList}
          />
        </View>

        {/* Best Sellers */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bán chạy nhất</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/menu")}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={bestSellers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => {
                  router.push({
                    pathname: "/details/[id]",
                    params: { id: item.id },
                  });
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.productCategory}>
                    {item.category.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    {formatCurrency(item.price)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.productList}
          />
        </View>

        {/* About our coffee */}
        <TouchableOpacity
          style={styles.aboutCard}
          onPress={() => {
            // Navigate to about page when implemented
            Alert.alert("About Us", "Coming soon!");
          }}
        >
          <ImageBackground
            source={require("../../assets/images/coffee-beans-bg.jpg")}
            style={styles.aboutBackground}
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={styles.aboutOverlay}>
              <Text style={styles.aboutTitle}>Hạt cà phê chất lượng cao</Text>
              <Text style={styles.aboutDescription}>
                Tìm hiểu thêm về hành trình cà phê của chúng tôi và cam kết về
                chất lượng
              </Text>
              <View style={styles.aboutButton}>
                <Text style={styles.aboutButtonText}>Khám phá</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: "#64748B",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: "#F8F7F5",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselContainer: {
    marginBottom: 24,
  },
  promotionCard: {
    width: width - 32,
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
  },
  promotionImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  promotionOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 16,
  },
  promotionContent: {
    maxWidth: "80%",
  },
  promotionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  promotionDescription: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  viewAllText: {
    fontSize: 14,
    color: "#8B4513",
    fontWeight: "600",
  },
  categoryList: {
    paddingRight: 16,
  },
  categoryCard: {
    alignItems: "center",
    marginRight: 16,
    width: 80,
  },
  categoryImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F8F7F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryImage: {
    width: 40,
    height: 40,
  },
  categoryName: {
    fontSize: 12,
    color: "#334155",
    textAlign: "center",
  },
  productList: {
    paddingRight: 16,
  },
  productCard: {
    width: 160,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
  },
  aboutCard: {
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  aboutBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  aboutOverlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 16,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  aboutDescription: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  aboutButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  aboutButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 8,
  },
});
