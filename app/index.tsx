import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type MenuItem = {
  id: number;
  name: string;
  type: string;
  price: number;
  image: string;
  description: string;
  customizationOptions?: {
    sugarLevels?: string[];
    sizes?: { [key: string]: number };
    addOns?: { [key: string]: number };
    temperature?: string[];
    milk?: string[];
  };
};

const dataItems: MenuItem[] = [
  {
    id: 1,
    name: "Cappuccino",
    type: "Coffee",
    price: 3.5,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&h=200&auto=format&fit=crop",
    description:
      "A classic espresso-based coffee drink with steamed milk foam.",
    customizationOptions: {
      sugarLevels: ["No Sugar", "Less Sugar", "Normal", "Extra Sugar"],
      sizes: { Small: 0, Medium: 0.5, Large: 1.0 },
      addOns: {
        "Espresso Shot": 0.75,
        "Vanilla Syrup": 0.5,
        "Caramel Syrup": 0.5,
        "Whipped Cream": 0.5,
      },
      temperature: ["Hot", "Extra Hot"],
      milk: [
        "Whole Milk",
        "Skim Milk",
        "Almond Milk (+$0.75)",
        "Oat Milk (+$0.75)",
      ],
    },
  },
  {
    id: 2,
    name: "Green Tea",
    type: "Tea",
    price: 2.0,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&h=200&auto=format&fit=crop",
    description:
      "A refreshing and healthy tea made from steamed green tea leaves.",
    customizationOptions: {
      sugarLevels: ["No Sugar", "Less Sugar", "Normal", "Extra Sugar"],
      sizes: { Small: 0, Medium: 0.5, Large: 1.0 },
      addOns: { Honey: 0.5, Lemon: 0.25 },
      temperature: ["Hot", "Iced"],
    },
  },
  {
    id: 3,
    name: "Mango Smoothie",
    type: "Smoothie",
    price: 4.5,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&h=200&auto=format&fit=crop",
    description: "A tropical fruit smoothie made with fresh mango and yogurt.",
    customizationOptions: {
      sugarLevels: ["No Sugar", "Less Sugar", "Normal"],
      sizes: { Regular: 0, Large: 1.5 },
      addOns: { "Extra Mango": 1.0, "Protein Boost": 1.5, "Chia Seeds": 0.75 },
    },
  },
  {
    id: 4,
    name: "Iced Latte",
    type: "Coffee",
    price: 3.75,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&h=200&auto=format&fit=crop",
    description:
      "Chilled espresso with milk served over ice for a cool caffeine kick.",
    customizationOptions: {
      sugarLevels: ["No Sugar", "Less Sugar", "Normal", "Extra Sugar"],
      sizes: { Small: 0, Medium: 0.5, Large: 1.0 },
      addOns: {
        "Espresso Shot": 0.75,
        "Vanilla Syrup": 0.5,
        "Caramel Syrup": 0.5,
        "Whipped Cream": 0.5,
      },
      milk: [
        "Whole Milk",
        "Skim Milk",
        "Almond Milk (+$0.75)",
        "Oat Milk (+$0.75)",
      ],
    },
  },
  {
    id: 5,
    name: "Lemonade",
    type: "Juice",
    price: 2.5,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&h=200&auto=format&fit=crop",
    description:
      "A sweet and tangy drink made with lemon juice, water, and sugar.",
    customizationOptions: {
      sugarLevels: ["No Sugar", "Less Sugar", "Normal", "Extra Sugar"],
      sizes: { Regular: 0, Large: 1.0 },
      addOns: { "Mint Leaves": 0.5, Strawberry: 0.75 },
    },
  },
  {
    id: 6,
    name: "Strawberry Milkshake",
    type: "Milkshake",
    price: 4.0,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&h=200&auto=format&fit=crop",
    description:
      "Creamy milkshake made with strawberries and vanilla ice cream.",
    customizationOptions: {
      sizes: { Regular: 0, Large: 1.5 },
      addOns: {
        "Extra Strawberry": 1.0,
        "Whipped Cream": 0.5,
        "Chocolate Syrup": 0.5,
      },
    },
  },
  {
    id: 7,
    name: "Chai Tea Latte",
    type: "Tea",
    price: 3.25,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&h=200&auto=format&fit=crop",
    description:
      "Spiced tea blended with steamed milk and a hint of sweetness.",
    customizationOptions: {
      sugarLevels: ["No Sugar", "Less Sugar", "Normal", "Extra Sugar"],
      sizes: { Small: 0, Medium: 0.5, Large: 1.0 },
      temperature: ["Hot", "Iced"],
      milk: [
        "Whole Milk",
        "Skim Milk",
        "Almond Milk (+$0.75)",
        "Oat Milk (+$0.75)",
      ],
    },
  },
  {
    id: 8,
    name: "Cold Brew Coffee",
    type: "Coffee",
    price: 4.25,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&h=200&auto=format&fit=crop",
    description:
      "Slow-brewed coffee served cold with a smooth, low-acid taste.",
    customizationOptions: {
      sugarLevels: ["No Sugar", "Less Sugar", "Normal", "Extra Sugar"],
      sizes: { Small: 0, Medium: 0.5, Large: 1.0 },
      addOns: {
        "Vanilla Syrup": 0.5,
        "Caramel Syrup": 0.5,
        "Sweet Cream": 0.75,
      },
      milk: [
        "No Milk",
        "Splash of Milk",
        "Almond Milk (+$0.75)",
        "Oat Milk (+$0.75)",
      ],
    },
  },
  {
    id: 9,
    name: "Avocado Smoothie",
    type: "Smoothie",
    price: 4.75,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&h=200&auto=format&fit=crop",
    description: "A rich and creamy smoothie made with ripe avocados and milk.",
    customizationOptions: {
      sugarLevels: ["No Sugar", "Less Sugar", "Normal"],
      sizes: { Regular: 0, Large: 1.5 },
      addOns: { "Protein Boost": 1.5, "Chia Seeds": 0.75, Honey: 0.5 },
    },
  },
  {
    id: 10,
    name: "Orange Juice",
    type: "Juice",
    price: 2.25,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&h=200&auto=format&fit=crop",
    description:
      "Freshly squeezed orange juice full of vitamin C and natural flavor.",
    customizationOptions: {
      sizes: { Small: 0, Medium: 0.75, Large: 1.5 },
      addOns: { "Pulp-Free": 0, "Extra Pulp": 0 },
    },
  },
  {
    id: 11,
    name: "Creamy Hot Chocolate",
    type: "Coffee",
    price: 3.5,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&h=200&auto=format&fit=crop",
    description:
      "Freshly squeezed orange juice full of vitamin C and natural flavor.",
    customizationOptions: {
      sizes: { Small: 0, Medium: 0.75, Large: 1.5 },
      addOns: { "Pulp-Free": 0, "Extra Pulp": 0 },
    },
  },
];

const screenWidth = Dimensions.get("window").width;
const cardWidth = (screenWidth - 3 * 16) / 2;

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const router = useRouter();

  // Extract unique categories from data
  const categories = [
    "All",
    ...Array.from(new Set(dataItems.map((item) => item.type))),
  ];

  // Filter items by search query and category
  const filteredItems = dataItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderMenu = ({ item }: { item: MenuItem }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/details/[id]",
            params: { id: item.id.toString() },
          })
        }
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardType}>{item.type}</Text>
          <Text style={styles.cardPrice}>{`${item.price.toFixed(
            2
          )}K VND`}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Tìm đồ uống yêu thích..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            placeholderTextColor="#999"
          />
        </View>

        {/* Category Selector */}
        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  selectedCategory === item && styles.categoryItemSelected,
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item && styles.categoryTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        <FlatList
          data={filteredItems}
          renderItem={renderMenu}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    marginVertical: 15,
  },
  searchInput: {
    width: "100%",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },

  categoryContainer: {
    marginBottom: 20,
  },
  categoryList: {
    paddingLeft: 4,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f1f3f5",
  },
  categoryItemSelected: {
    backgroundColor: "#0984e3",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#636e72",
  },
  categoryTextSelected: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  // The rest of your styles remain the same
  listContainer: {
    paddingBottom: 20,
    gap: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
    gap: 16,
  },
  card: {
    flex: 1,
    maxWidth: "48%",
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardImage: {
    width: "100%",
    height: 130,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3436",
  },
  cardType: {
    fontSize: 14,
    color: "#636e72",
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0984e3",
    marginTop: 4,
  },
});
