import Loading from "@/components/Loading";
import { formatCurrency } from "@/utils/formatCurrency";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import productService from "../../services/product.service";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";

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

export default function MenuScreen() {
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState("");
  const [dataItems, setDataItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const numColumns = width >= 768 ? 4 : 3;
  const cardWidth = (width - (numColumns + 1) * 16) / numColumns;

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(dataItems.map((item) => item.category?.name || ""))
    ).filter(Boolean);
    return ["All", ...uniqueCategories];
  }, [dataItems]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await productService.getMenuList();
      setDataItems(response);
      setLoading(false);
    } catch (error) {
      console.error(
        "Error fetching menu data:",
        error instanceof Error ? error.message : error
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMenu()
      .then(() => setRefreshing(false))
      .catch((error) => {
        console.error("Error refreshing data:", error);
        setRefreshing(false);
      });
  }, []);

  const filteredItems = dataItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDataWithEmptyItems = (data: any, numColumns: number) => {
    const numberOfFullRows = Math.floor(data.length / numColumns);
    let numberOfElementsLastRow = data.length - numberOfFullRows * numColumns;
    if (numberOfElementsLastRow === 0) {
      return data;
    }
    const formattedData = [...data];
    while (
      numberOfElementsLastRow !== 0 &&
      numberOfElementsLastRow !== numColumns
    ) {
      formattedData.push({
        id: `empty-${numberOfElementsLastRow}`,
        empty: true,
      });
      numberOfElementsLastRow++;
    }
    return formattedData;
  };

  const renderMenu = ({ item }: { item: any }) => {
    if (item.empty) {
      return <View style={[styles.itemContainer, styles.invisibleItem]} />;
    }

    const cardPadding = width >= 768 ? 12 : 8;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            flexDirection: isGridView ? "column" : "row",
            margin: cardPadding,
            width: isGridView ? cardWidth : "100%",
          },
        ]}
        onPress={() =>
          router.push({
            pathname: "/details/[id]",
            params: { id: item.id.toString() },
          })
        }
      >
        <Image
          source={{ uri: item.image }}
          style={[
            styles.cardImage,
            {
              width: isGridView ? "100%" : 100,
              height: 100,
              borderRadius: 8,
            },
          ]}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardType}>{item.category.name}</Text>
          <Text style={styles.cardPrice}>{formatCurrency(item.price)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Tìm đồ uống yêu thích..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            placeholderTextColor="#999"
          />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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
          <View style={styles.toggleContainer}>
            <TouchableOpacity onPress={() => setIsGridView(!isGridView)}>
              <Text style={styles.toggleText}>
                {isGridView ? (
                  <MaterialCommunityIcons
                    name="format-list-bulleted-square"
                    size={24}
                    color="#0984e3"
                  />
                ) : (
                  <Entypo name="grid" size={24} color="#0984e3" />
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu List */}
        <FlatList
          data={formatDataWithEmptyItems(filteredItems, numColumns)}
          renderItem={renderMenu}
          key={`layout-${isGridView ? "grid" : "list"}`}
          numColumns={isGridView ? numColumns : 1}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContainer,
            { paddingHorizontal: width >= 768 ? 12 : 8 },
          ]}
          columnWrapperStyle={isGridView ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery || selectedCategory !== "All"
                  ? "Không tìm thấy sản phẩm nào"
                  : "Không có sản phẩm nào"}
              </Text>
            </View>
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
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
    flexGrow: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#636e72",
    textAlign: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  toggleText: {
    fontSize: 14,
    color: "#0984e3",
    fontWeight: "500",
  },
  row: {
    justifyContent: "flex-start",
    paddingHorizontal: 8,
  },
  itemContainer: {
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
  invisibleItem: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
});
