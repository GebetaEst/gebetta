import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Animated,
  StatusBar,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Settings, ChevronDown, ShoppingBag, Search, X, Star, ListFilter } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { popularTags } from "@/mocks/recipes";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import CategoryPill from "@/components/CategoryPill";
import FoodCard from "@/components/FoodCard";
import { useFoodStore } from "@/store/foodStore";
import { useCartStore } from "@/store/cartStore";

type SortOption = {
  label: string;
  value: string;
};

const sortOptions: SortOption[] = [
  { label: "Most Popular", value: "popular" },
  { label: "Highest Rated", value: "rating" },
  { label: "Newest", value: "newest" },
  { label: "Cooking Time", value: "time" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
];

export default function SearchScreen() {
  const router = useRouter();

  const {
    foods,
    filteredFoods,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    sortFoods,
    filterByTime,
    filterByRating,
    fetchFoods,
    isLoading,
    error,
  } = useFoodStore();

  const { getCartItemsCount } = useCartStore();

  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>("popular");
  const [maxTime, setMaxTime] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const { width } = Dimensions.get("window");
  const isTablet = width > 768;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;
  const resultsAnim = useRef(new Animated.Value(0)).current;

  // Fetch foods on mount
  useEffect(() => {
    fetchFoods();
  }, []);

  // Extract unique categories from foods
  useEffect(() => {
    if (foods.length > 0) {
      const uniqueCategories = Array.from(
        new Set(
          foods
            .map((food) => food.menuId?.menuType)
            .filter((type) => type)
        )
      );
      setCategories(["All", ...uniqueCategories]);
    }
  }, [foods]);

  useEffect(() => {
    // Apply sorting when selected option changes
    sortFoods(selectedSort);
  }, [selectedSort, sortFoods]);

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate results when they change
  useEffect(() => {
    resultsAnim.setValue(0);
    Animated.timing(resultsAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [filteredFoods]);

  // Animate filters
  useEffect(() => {
    if (showFilters) {
      Animated.timing(filterAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      filterAnim.setValue(0);
    }
  }, [showFilters]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleTimeSelect = (time: number | null) => {
    setMaxTime(time);
    filterByTime(time);
  };

  const handleRatingSelect = (rating: number) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
    filterByRating(newRating);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const toggleSortOptions = () => {
    setShowSortOptions(!showSortOptions);
    if (showFilters) setShowFilters(false);
  };

  const handleSortSelect = (sortValue: string) => {
    setSelectedSort(sortValue);
    setShowSortOptions(false);
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setMaxTime(null);
    setSelectedRating(null);
    setSearchQuery("");
    filterByTime(null);
    filterByRating(null);
  };

  const getSelectedSortLabel = () => {
    return sortOptions.find((option) => option.value === selectedSort)?.label;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Search Header */}
      <Animated.View
        style={[
          styles.searchHeader,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBarCustom}>
            <Search size={20} color={colors.lightText} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for delicious food..."
              placeholderTextColor={colors.lightText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                <X size={18} color={colors.lightText} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            (selectedCategory || maxTime || selectedRating) ? styles.activeFilterButton : {},
          ]}
          onPress={toggleFilters}
        >
          <ListFilter
            size={20}
            color={
              selectedCategory || maxTime || selectedRating
                ? colors.white
                : colors.text
            }
          />
        </TouchableOpacity>
      </Animated.View>

      {showFilters && (
        <Animated.View
          style={[
            styles.filtersContainer,
            {
              opacity: filterAnim,
              transform: [
                {
                  translateY: filterAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Categories</Text>
              {selectedCategory && (
                <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsContainer}
            >
              {popularTags.map((category) => (
                <CategoryPill
                  key={category}
                  title={category}
                  selected={selectedCategory === category}
                  onPress={() => handleCategorySelect(category)}
                />
              ))}
            </ScrollView>
          </View>

          

          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Cooking Time</Text>
              {maxTime && (
                <TouchableOpacity onPress={() => handleTimeSelect(null)}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.timeContainer}>
              {[30, 60, 90, 120].map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    maxTime === time && styles.selectedTimeButton,
                  ]}
                  onPress={() => handleTimeSelect(time)}
                >
                  <Text
                    style={[
                      styles.timeButtonText,
                      maxTime === time && styles.selectedTimeButtonText,
                    ]}
                  >
                    {time === 120 ? "2+ hours" : `${time} min`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Minimum Rating</Text>
              {selectedRating && (
                <TouchableOpacity onPress={() => setSelectedRating(null)}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={styles.starButton}
                  onPress={() => handleRatingSelect(rating)}
                >
                  <Star
                    size={32}
                    color={selectedRating && rating <= selectedRating ? colors.primary : colors.lightText}
                    fill={selectedRating && rating <= selectedRating ? colors.primary : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {selectedRating && (
              <Text style={styles.ratingText}>
                {selectedRating} star{selectedRating > 1 ? 's' : ''} & above
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={clearAllFilters}
          >
            <Text style={styles.clearAllText}> Clear All Filters</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading delicious food...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchFoods}
          >
            <Text style={styles.retryButtonText}>🔄 Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : filteredFoods.length > 0 ? (
        <Animated.View
          style={[
            styles.resultsContainer,
            {
              opacity: resultsAnim,
              transform: [
                {
                  translateY: resultsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.resultsCount}>
            {filteredFoods.length} {filteredFoods.length === 1 ? 'item' : 'items'} found
          </Text>
          <FlatList
            data={filteredFoods}
            keyExtractor={(item) => item.id || item._id}
            renderItem={({ item }) => <FoodCard food={item} />}
            contentContainerStyle={styles.recipesList}
            showsVerticalScrollIndicator={false}
            numColumns={1}
          />
        </Animated.View>
      ) : (
        <Animated.View
          style={[
            styles.emptyContainer,
            {
              opacity: resultsAnim,
              transform: [{ scale: resultsAnim }],
            },
          ]}
        >
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No food items found</Text>
          <Text style={styles.emptyText}>
            Try adjusting your search or filters to find what you're looking for
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={clearAllFilters}
          >
            <Text style={styles.retryButtonText}> Clear Filters & Try Again</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Enhanced Floating Cart Button */}
      {getCartItemsCount() > 0 && (
        <Animated.View
          style={[
            styles.floatingCartButton,
            {
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.cartButtonContent}
            onPress={() => router.push("/cart")}
          >
            <ShoppingBag size={24} color={colors.white} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getCartItemsCount()}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    zIndex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.heading2,
    color: colors.white,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flex: 1,
    marginRight: 12,
    marginTop: 10,
  },
  searchBarCustom: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 48,
    marginTop: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    padding: 0,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  filterSortContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  filterButton: {
    width: 48,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 13,

  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    elevation: 6,
    shadowOpacity: 0.2,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.inputBackground,
    marginLeft: 8,
  },
  sortButtonText: {
    ...typography.bodySmall,
    marginHorizontal: 8,
  },
  sortOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  sortOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSortOption: {
    backgroundColor: colors.primary,
  },
  sortOptionText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  selectedSortOptionText: {
    color: colors.white,
    fontWeight: "600",
  },
  filtersContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width: '100%',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsCount: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filterTitle: {
    ...typography.heading4,
  },
  clearText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  difficultyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    alignItems: "center",
  },
  selectedDifficultyButton: {
    backgroundColor: colors.primary,
  },
  difficultyButtonText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  selectedDifficultyButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    alignItems: "center",
  },
  selectedTimeButton: {
    backgroundColor: colors.primary,
  },
  timeButtonText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  selectedTimeButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  starButton: {
    paddingHorizontal: 4,
  },
  ratingText: {
    ...typography.bodySmall,
    color: colors.primary,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  clearAllButton: {
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  clearAllText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  recipesList: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    ...typography.heading3,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    ...typography.heading3,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  cartButton: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: "600",
  },
  floatingCartButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 10,
  },
  cartButtonContent: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
