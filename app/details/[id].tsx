import Loading from "@/components/Loading";
import { Product } from "@/interfaces/product.interface";
import cartService from "@/services/cart.service";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import productService from "../../services/product.service";

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [dataItems, setDataItems] = useState<Product>();
  const [sizes, setSizes] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [note, setNote] = useState("");

  const fetchDetails = async () => {
    try {
      const response = await productService.getDetailsProduct(id as string);

      setDataItems(response);
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  const fetchSize = async () => {
    try {
      const response = await productService.getAllSizes();
      setSizes(response);
      if (response && response.length > 0) {
        setSelectedSize(response[0].id);
      }
    } catch (error) {
      console.error("Error fetching sizes:", error);
    }
  };

  useEffect(() => {
    let isActive = true;

    const fetchToppings = async () => {
      const categoryName = dataItems?.category?.name;
      if (categoryName && categoryName.toLowerCase() !== "cafe") {
        try {
          const response = await productService.getAllToppings();
          if (isActive) {
            setToppings(response || []);
          }
        } catch (error) {
          console.error("Error fetching toppings:", error);
          if (isActive) {
            setToppings([]);
          }
        }
      } else {
        setToppings([]);
      }
    };

    fetchToppings();

    return () => {
      isActive = false;
    };
  }, [dataItems?.category?.name]);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchDetails(), fetchSize()]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (dataItems) {
      let price = dataItems.price;
      if (selectedSize && sizes.length > 0) {
        const size = sizes.find((s) => s.id === selectedSize);
        if (size) {
          price += size.extraPrice || 0;
        }
      }
      const toppingsPrice = selectedToppings.reduce(
        (sum, topping) => sum + (topping.price || 0),
        0
      );
      price += toppingsPrice;
      price *= quantity;

      setTotalPrice(price);
    }
  }, [dataItems, selectedSize, selectedToppings, quantity, sizes]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Loading type="fullscreen" />
        </View>
      </SafeAreaView>
    );
  }

  if (!dataItems) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Ionicons name="cafe-outline" size={60} color="#0984e3" />
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 16 }}>
          Item not found
        </Text>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0984e3",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 25,
            marginTop: 20,
            width: 200,
          }}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back-outline"
            size={18}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 16 }}>
            Back to Menu
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const addToCart = async () => {
    if (!dataItems) return;

    const addToCartForm: any = {
      note: note,
      sizeId: selectedSize,
      productId: dataItems.id,
      quantity: quantity,
      customizeToppings: selectedToppings.map((topping) => ({
        toppingId: topping.id,
        quantity: 1,
      })),
    };

    try {
      const response = await cartService.addToCart(addToCartForm);
      if (response) {
        router.push("/cart");
      } else {
        console.error("Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const toggleTopping = (topping: any) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const totalWithToppings =
    totalPrice +
    selectedToppings.reduce(
      (sum, topping) => sum + topping.price * quantity,
      0
    );

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: dataItems?.image }} style={styles.image} />
            <View style={styles.badgeContainer}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {dataItems?.category?.name}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>{dataItems?.name}</Text>
              <Text style={styles.basePrice}>
                {(
                  (dataItems?.price ?? 0) +
                  (selectedSize
                    ? sizes.find((s) => s.id === selectedSize)?.extraPrice ?? 0
                    : 0)
                ).toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </Text>
            </View>

            <Text style={styles.description}>{dataItems?.description}</Text>

            <View style={styles.divider} />

            <View style={styles.quantityContainer}>
              <Text style={styles.sectionTitle}>Số lượng:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity <= 1 && { opacity: 0.5 },
                  ]}
                  onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Size selection */}
            {sizes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Kích cỡ:</Text>
                <View style={styles.optionsContainer}>
                  <FlatList
                    data={sizes}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.optionButton,
                          selectedSize === item.id &&
                            styles.optionButtonSelected,
                        ]}
                        onPress={() => setSelectedSize(item.id)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedSize === item.id &&
                              styles.optionTextSelected,
                          ]}
                        >
                          {item.name}{" "}
                          {item.extraPrice > 0
                            ? `+ ${item.extraPrice.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}`
                            : ""}
                        </Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
              </View>
            )}

            {toppings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Topping:</Text>
                <FlatList
                  data={toppings}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        selectedToppings.some((t) => t.id === item.id) &&
                          styles.optionButtonSelected,
                      ]}
                      onPress={() => toggleTopping(item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedToppings.some((t) => t.id === item.id) &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {item.name} +{" "}
                        {item.price.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}

            {/* Note input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ghi chú:</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Thêm ghi chú cho món này (không bắt buộc)"
                value={note}
                onChangeText={setNote}
                multiline
                maxLength={100}
                numberOfLines={3}
              />
              <Text style={styles.noteCounter}>{note.length}/100</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Tổng cộng:</Text>
            <Text style={styles.price}>
              {totalWithToppings.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </Text>
          </View>

          <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.addToCartButtonText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 250,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badgeContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeBadge: {
    backgroundColor: "#0984e3",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  typeBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 4,
  },
  basePrice: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2d3436",
  },
  description: {
    fontSize: 16,
    color: "#2d3436",
    lineHeight: 24,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#e1e8ed",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#2d3436",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f1f3f5",
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: "#0984e3",
  },
  optionText: {
    fontSize: 14,
    color: "#636e72",
  },
  optionTextSelected: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 80,
    textAlignVertical: "top",
  },
  noteCounter: {
    alignSelf: "flex-end",
    color: "#636e72",
    fontSize: 12,
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f3f5",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0984e3",
  },
  quantity: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: "center",
  },
  footer: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e1e8ed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: Platform.OS === "ios" ? 20 : 16,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: "#636e72",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3436",
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0984e3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    marginLeft: 16,
  },
  addToCartButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
