import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  StatusBar as RNStatusBar,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import productService from "../service/menu.service";

type MenuItem = {
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

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState("");
  const [dataItems, setDataItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const router = useRouter();
  const numColumns = width >= 768 ? 3 : 2;
  const cardWidth = (width - (numColumns + 1) * 16) / numColumns;

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(dataItems.map((item) => item.category?.name || ""))
    ).filter(Boolean);

    return ["All", ...uniqueCategories];
  }, [dataItems]);

  const fetchMenu = async () => {
    try {
      const response = await productService.getMenuList();
      setDataItems(response);
    } catch (error) {
      console.error("Error fetching menu data:", error);
    }
  };
  useEffect(() => {
    fetchMenu();
  }, []);

  const filteredItems = dataItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderMenu = ({ item }: { item: MenuItem }) => {
    const cardPadding = width >= 768 ? 12 : 8;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            margin: cardPadding,
            width: cardWidth,
            maxWidth: `${100 / numColumns - 4}%`,
          },
        ]}
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
          <Text style={styles.cardType}>{item.category.name}</Text>
          <Text style={styles.cardPrice}>{`${item.price.toLocaleString(
            "vi-VN",
            {
              style: "currency",
              currency: "VND",
            }
          )}`}</Text>
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
          numColumns={numColumns}
          key={`column-${numColumns}`}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContainer,
            { paddingHorizontal: width >= 768 ? 12 : 8 },
          ]}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={
            numColumns > 1 ? { justifyContent: "flex-start" } : undefined
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
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
  listContainer: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    flex: 1,
    margin: 8,
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
