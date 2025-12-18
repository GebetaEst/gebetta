import CategoryPill from "@/components/CategoryPill";
import RestaurantCard from "@/components/RestaurantCard";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

import { useCartStore } from "@/store/cartStore";
import { useRouter } from "expo-router";
import { Search, X, ShoppingBag, Settings, Star } from "lucide-react-native";
import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Animated, Switch, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ImageBackground, ImageSourcePropType } from "react-native";
import axios from "axios";

// Define the OpeningHours type to be more flexible
type OpeningHours = {
  [key: string]: {
    open: string;
    close: string;
  };
};

// Parse openHours string (e.g., "9:00 AM - 9:00 PM") into OpeningHours object
const parseOpeningHours = (openHours: string): OpeningHours => {
  const [open, close] = openHours.split(" - ").map(time => time.trim());
  return {
    default: { open, close },
  };
};

// Import the main Restaurant interface
import { Restaurant as AppRestaurant } from "@/types/restaurant";

// Define the API response format for restaurant location
interface ApiRestaurantLocation {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

// Define the API response format for restaurant
interface ApiRestaurant {
  _id: string;
  name: string;
  slug: string;
  location: ApiRestaurantLocation;
  description: string;
  deliveryRadiusMeters: number;
  license: string;
  managerId: string | { _id: string } | string;
  cuisineTypes: string[];
  imageCover: string;
  ratingAverage: number;
  ratingQuantity: number;
  openHours: string;
  isDeliveryAvailable: boolean;
  isOpenNow: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  reviews?: any[];
  shortDescription?: string;
  reviewCount?: number;
}

// Convert API restaurant to app's Restaurant type
function toAppRestaurant(apiRestaurant: ApiRestaurant): AppRestaurant {
  const location = apiRestaurant.location;
  const coordinates = location?.coordinates || [0, 0];

  return {
    id: apiRestaurant._id,
    _id: apiRestaurant._id,
    name: apiRestaurant.name,
    slug: apiRestaurant.slug || apiRestaurant.name.toLowerCase().replace(/\s+/g, '-'),
    ownerId: typeof apiRestaurant.managerId === 'object'
      ? (apiRestaurant.managerId?._id || '')
      : (apiRestaurant.managerId || ''),
    imageUrl: apiRestaurant.imageCover || '',
    imageCover: apiRestaurant.imageCover || '',
    address: location?.address || 'Address not available',
    cuisine: apiRestaurant.cuisineTypes?.[0] || 'Other',
    cuisineTypes: apiRestaurant.cuisineTypes || [],
    priceLevel: '', // Default price level
    rating: apiRestaurant.ratingAverage || 0,
    ratingAverage: apiRestaurant.ratingAverage || 0,
    ratingQuantity: apiRestaurant.ratingQuantity || 0,
    isOpen: !!apiRestaurant.isOpenNow,
    isOpenNow: !!apiRestaurant.isOpenNow,
    isDeliveryAvailable: !!apiRestaurant.isDeliveryAvailable,
    active: !!apiRestaurant.active,
    description: apiRestaurant.description || '',
    deliveryRadiusMeters: apiRestaurant.deliveryRadiusMeters || 5000,
    license: apiRestaurant.license || 'N/A',
    managerId: typeof apiRestaurant.managerId === 'object'
      ? (apiRestaurant.managerId?._id || '')
      : (apiRestaurant.managerId || ''),
    openHours: apiRestaurant.openHours || '9:00 AM - 10:00 PM',
    reviews: apiRestaurant.reviews || [],
    reviewCount: apiRestaurant.reviewCount || 0,
    shortDescription: apiRestaurant.shortDescription ||
      (apiRestaurant.description ?
        apiRestaurant.description.substring(0, 100) +
        (apiRestaurant.description.length > 100 ? '...' : '')
        : ''),
    deliveryFee: apiRestaurant.isDeliveryAvailable ? 50 : 0,
    estimatedDeliveryTime: apiRestaurant.deliveryRadiusMeters ? "" : '',
    createdAt: apiRestaurant.createdAt || new Date().toISOString(),
    updatedAt: apiRestaurant.updatedAt || new Date().toISOString(),
    location: {
      latitude: coordinates[1],
      longitude: coordinates[0]
    }
  };
}
const restaurantCategories = [
  'All',
  'Ethiopian',
  'Italian',
  'Chinese',
  'Indian',
  'Fast Food',
  'Vegan',
  'Other'
];

// Alias for backward compatibility
type Restaurant = AppRestaurant;

export default function RestaurantsScreen() {
  const router = useRouter();
  const { getCartItemsCount } = useCartStore();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Animation ref for filter panel
  const filterAnim = useRef(new Animated.Value(0)).current;

  type Filters = {
    minRating: number;
    openNow: boolean;
  };

  const [filters, setFilters] = useState<Filters>({
    minRating: 0,
    openNow: false,
  });


  // Fetch restaurants from API
  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching restaurants...');
      const response = await axios.get('https://api.bahirandelivery.cloud/api/v1/restaurants');
      console.log('API Response:', response);

      // Handle different possible response structures
      let restaurantsData = [];

      // Case 1: Data is nested under response.data.data.restaurants (from logs)
      if (response?.data?.data?.restaurants && Array.isArray(response.data.data.restaurants)) {
        console.log('Found restaurants in response.data.data.restaurants');
        restaurantsData = response.data.data.restaurants;
      }
      // Case 2: Data is directly in response.data (array)
      else if (Array.isArray(response?.data)) {
        console.log('Found restaurants directly in response.data');
        restaurantsData = response.data;
      }
      // Case 3: Data is nested under response.data.data (array)
      else if (Array.isArray(response?.data?.data)) {
        console.log('Found restaurants in response.data.data');
        restaurantsData = response.data.data;
      }
      // Case 4: No valid data found
      else {
        console.warn('Unexpected API response structure:', response?.data);
        throw new Error('Unexpected data format received from server');
      }

      console.log('Setting restaurants data:', restaurantsData);
      setRestaurants(restaurantsData);
      setFilteredRestaurants(restaurantsData);

    } catch (err: unknown) {
      console.error('Error fetching restaurants:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load restaurants. Please try again.';
      setError(errorMessage);
      setRestaurants([]);
      setFilteredRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Animate filters when toggled
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


  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const filterRestaurants = useCallback(() => {
    let filtered = [...restaurants];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.cuisineTypes.some(cuisine => cuisine.toLowerCase().includes(query)) ||
        restaurant.description?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(restaurant =>
        restaurant.cuisineTypes.includes(selectedCategory)
      );
    }


    // Apply open now filter
    if (filters.openNow) {
      filtered = filtered.filter(restaurant => restaurant.isOpenNow);
    }

    // Apply rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(restaurant => restaurant.ratingAverage >= filters.minRating);
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, selectedCategory, filters, restaurants]);

  useEffect(() => {
    filterRestaurants();
  }, [filterRestaurants]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setFilters(prev => ({
      ...prev,
      openNow: false,
      minRating: 0,
    }));
    setSearchQuery("");
  };

  const handleRatingSelect = (rating: number) => {
    setFilters(prev => ({
      ...prev,
      minRating: prev.minRating === rating ? 0 : rating,
    }));
  };

  // Background image with food illustration
  const backgroundImage: ImageSourcePropType = { 
    uri: 'https://images.unsplash.com/photo-1581281863883-2469417a1662?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80'
  };

  return (
    <ImageBackground 
      source={backgroundImage} 
      style={styles.backgroundImage}
      resizeMode="cover"
      imageStyle={styles.backgroundImageStyle}
    >
      <SafeAreaView style={styles.overlay}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants..."
            placeholderTextColor={colors.placeholderText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search restaurants"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <X size={18} color={colors.lightText} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            (selectedCategory !== 'All' || filters.openNow || filters.minRating > 0)
              ? styles.activeFilterButton
              : {}
          ]}
          onPress={toggleFilters}
          accessibilityLabel="Open filter options"
        >
          <Settings
            size={20}
            color={
              (selectedCategory !== 'All' || filters.openNow || filters.minRating > 0)
                ? colors.white
                : colors.text
            }
          />
        </TouchableOpacity>
      </View>

      

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
              <Text style={styles.filterTitle}>Cuisine Type</Text>
              {selectedCategory !== 'All' && (
                <TouchableOpacity onPress={() => setSelectedCategory('All')}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsContainer}
            >
              {restaurantCategories.map(category => (
                <View key={category} style={styles.categoryPillContainer}>
                  <CategoryPill
                    title={category}
                    selected={selectedCategory === category}
                    onPress={() => handleCategoryPress(category)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Minimum Rating</Text>
              {filters.minRating > 0 && (
                <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, minRating: 0 }))}>
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
                    color={filters.minRating >= rating ? colors.primary : colors.lightText}
                    fill={filters.minRating >= rating ? colors.primary : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {filters.minRating > 0 && (
              <Text style={styles.ratingText}>
                {filters.minRating} star{filters.minRating > 1 ? 's' : ''} & above
              </Text>
            )}
          </View>

          <View style={styles.filterSection}>
            <View style={styles.filterRow}>
              <Text style={styles.filterTitle}>Open Now</Text>
              <View style={styles.switchContainer}>
                <Switch
                  value={filters.openNow}
                  onValueChange={value =>
                    setFilters(prev => ({ ...prev, openNow: value }))
                  }
                  trackColor={{ false: colors.lightGray, true: colors.primary }}
                  thumbColor="#fff"
                  accessibilityLabel="Toggle open now filter"
                />
              </View>
            </View>
          </View>

          <View style={styles.filterButtonsContainer}>
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={toggleFilters}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
      {/* Show restaurant count */}
      <View style={styles.restaurantCountContainer}>
        <Text style={styles.restaurantCountText}>
          {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchRestaurants}
            accessibilityLabel="Retry loading restaurants"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredRestaurants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No restaurants found</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.restaurantsList}
          contentContainerStyle={styles.restaurantsListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredRestaurants.map((restaurant: any) => {
            const restaurantData = toAppRestaurant(restaurant);

            return (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurantData}
                onPress={() => router.push(`/restaurant/${restaurant.id}`)}
              />
            );
          })}
        </ScrollView>
      )}

      {/* Floating Cart Button - Only visible when there are items in cart */}
      {getCartItemsCount() > 0 && (
        <TouchableOpacity
          style={styles.floatingCartButton}
          onPress={() => router.push("/cart")}
        >
          <ShoppingBag size={24} color={colors.white} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{getCartItemsCount()}</Text>
          </View>
        </TouchableOpacity>
      )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImageStyle: {
    opacity: 0.15, // Adjust this value to make the image more or less visible
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // More opaque white overlay to make the content more readable
    paddingTop: 30,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.text,
    ...typography.body,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginLeft: 12,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    elevation: 6,
    shadowOpacity: 0.2,
  },
  cartButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  switchContainer: {
    transform: [{ scale: 1.2 }],
    marginRight: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  restaurantCountContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 4,
  },
  restaurantCountText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.lightText,
  },
  restaurantsList: {
    flex: 1,
  },
  restaurantsListContent: {
    padding: 16,
    paddingTop: 0,
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
    width: '100%',
    gap: 8,
  },
  clearAllButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clearAllText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  applyButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  applyButtonText: {
    color: colors.white,
    ...typography.body,
    fontWeight: '600',
    fontSize: 15,
  },
  categoryPillContainer: {
    marginRight: 8,
    marginVertical: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});