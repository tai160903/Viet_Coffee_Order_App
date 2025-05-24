import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import productService from "../../service/menu.service";

type Items = {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  price: number;
  image: string;
  rating: number;
  description: string;
};

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [dataItems, setDataItems] = useState<Items>(); // Replace 'any' with your actual data type
  // const [selectedSize, setSelectedSize] = useState<string | null>(null);
  // const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  // const [selectedTemperature, setSelectedTemperature] = useState<string | null>(
  //   null
  // );
  // const [selectedMilk, setSelectedMilk] = useState<string | null>(null);
  // const [selectedSugar, setSelectedSugar] = useState<string | null>(null);
  // const [totalPrice, setTotalPrice] = useState(0);

  const fetchDetails = async () => {
    try {
      const response = await productService.getDetailsProduct(id as string);
      setDataItems(response);
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  // // Calculate total price based on selections
  // useEffect(() => {
  //   calculateTotalPrice();
  // }, [quantity, selectedSize, selectedAddOns, selectedMilk]);

  // const calculateTotalPrice = () => {
  //   if (!item) return;

  //   let price = item.price;

  //   // Add size price
  //   if (selectedSize && item.customizationOptions?.sizes) {
  //     price += item.customizationOptions.sizes[selectedSize] || 0;
  //   }

  //   // Add add-ons prices
  //   if (selectedAddOns.length > 0 && item.customizationOptions?.addOns) {
  //     selectedAddOns.forEach((addon) => {
  //       const addonPrice = item.customizationOptions?.addOns?.[addon];
  //       if (typeof addonPrice === "number") {
  //         price += addonPrice;
  //       }
  //     });
  //   }

  //   // Add milk price if it contains a price indicator (+$X.XX)
  //   if (selectedMilk && selectedMilk.includes("+$")) {
  //     const priceMatch = selectedMilk.match(/\+\$(\d+\.\d+)/);
  //     if (priceMatch && priceMatch[1]) {
  //       price += parseFloat(priceMatch[1]);
  //     }
  //   }

  //   // Multiply by quantity
  //   price *= quantity;

  //   setTotalPrice(price);
  // };

  // const toggleAddOn = (addon: string) => {
  //   setSelectedAddOns((prev) => {
  //     if (prev.includes(addon)) {
  //       return prev.filter((item) => item !== addon);
  //     } else {
  //       return [...prev, addon];
  //     }
  //   });
  // };

  // // Fix the error in the "item not found" view
  // if (!item) {
  //   return (
  //     <SafeAreaView
  //       style={[
  //         styles.safeArea,
  //         { justifyContent: "center", alignItems: "center" },
  //       ]}
  //     >
  //       <Ionicons name="cafe-outline" size={60} color="#0984e3" />
  //       <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 16 }}>
  //         Item not found
  //       </Text>
  //       <TouchableOpacity
  //         style={{
  //           flexDirection: "row",
  //           alignItems: "center",
  //           justifyContent: "center",
  //           backgroundColor: "#0984e3",
  //           paddingHorizontal: 24,
  //           paddingVertical: 12,
  //           borderRadius: 25,
  //           marginTop: 20,
  //           width: 200,
  //         }}
  //         onPress={() => router.back()}
  //       >
  //         <Ionicons
  //           name="arrow-back-outline"
  //           size={18}
  //           color="#fff"
  //           style={{ marginRight: 8 }}
  //         />
  //         <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 16 }}>
  //           Back to Menu
  //         </Text>
  //       </TouchableOpacity>
  //     </SafeAreaView>
  //   );
  // }

  // Update the main return statement with enhanced image and styling
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
                {dataItems?.price.toLocaleString("vi-VN", {
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
            {/* {item.customizationOptions?.sizes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Kích cỡ:</Text>
                <View style={styles.optionsContainer}>
                  {Object.entries(item.customizationOptions.sizes).map(
                    ([size, price]) => (
                      <TouchableOpacity
                        key={size}
                        style={[
                          styles.optionButton,
                          selectedSize === size && styles.optionButtonSelected,
                        ]}
                        onPress={() => setSelectedSize(size)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedSize === size && styles.optionTextSelected,
                          ]}
                        >
                          {size} {price > 0 ? `(+${price}K)` : ""}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            )} */}

            {/* Sugar level selection */}
            {/* {item.customizationOptions?.sugarLevels && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mức đường:</Text>
                <View style={styles.optionsContainer}>
                  {item.customizationOptions.sugarLevels.map((sugar) => (
                    <TouchableOpacity
                      key={sugar}
                      style={[
                        styles.optionButton,
                        selectedSugar === sugar && styles.optionButtonSelected,
                      ]}
                      onPress={() => setSelectedSugar(sugar)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedSugar === sugar && styles.optionTextSelected,
                        ]}
                      >
                        {sugar}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )} */}

            {/* Temperature selection */}
            {/* {item.customizationOptions?.temperature && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nhiệt độ:</Text>
                <View style={styles.optionsContainer}>
                  {item.customizationOptions.temperature.map((temp) => (
                    <TouchableOpacity
                      key={temp}
                      style={[
                        styles.optionButton,
                        selectedTemperature === temp &&
                          styles.optionButtonSelected,
                      ]}
                      onPress={() => setSelectedTemperature(temp)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedTemperature === temp &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {temp}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )} */}

            {/* Milk selection */}
            {/* {item.customizationOptions?.milk && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sữa:</Text>
                <View style={styles.optionsContainer}>
                  {item.customizationOptions.milk.map((milk) => (
                    <TouchableOpacity
                      key={milk}
                      style={[
                        styles.optionButton,
                        selectedMilk === milk && styles.optionButtonSelected,
                      ]}
                      onPress={() => setSelectedMilk(milk)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedMilk === milk && styles.optionTextSelected,
                        ]}
                      >
                        {milk}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )} */}

            {/* Add-ons selection */}
            {/* {item.customizationOptions?.addOns &&
              Object.keys(item.customizationOptions.addOns).length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Thêm:</Text>
                  <View style={styles.optionsContainer}>
                    {Object.entries(item.customizationOptions.addOns).map(
                      ([addon, price]) => (
                        <TouchableOpacity
                          key={addon}
                          style={[
                            styles.optionButton,
                            selectedAddOns.includes(addon) &&
                              styles.optionButtonSelected,
                          ]}
                          onPress={() => toggleAddOn(addon)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              selectedAddOns.includes(addon) &&
                                styles.optionTextSelected,
                            ]}
                          >
                            {addon} {price > 0 ? `(+${price}K)` : ""}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>
              )} */}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total:</Text>
            <Text style={styles.price}>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(quantity * (dataItems?.price ?? 0))}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => {
              // Add to cart logic here
              alert(`Đã thêm ${quantity} ${dataItems?.name} vào giỏ hàng!`);
              router.back();
            }}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
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
