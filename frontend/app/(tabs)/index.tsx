import CategoryPill from "@/components/CategoryPill";
import RecipeCard from "@/components/RecipeCard";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { popularTags } from "@/mocks/recipes";
import { useAuthStore } from "@/store/useAuthStore";
import { useRecipeStore } from "@/store/recipeStore";
import { useRestaurantStore } from "@/store/restaurantStore";
import { useCartStore } from "@/store/cartStore";
import { Recipe } from "@/types/recipe";
import { Restaurant } from "@/types/restaurant";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronRight, MapPin, Clock, ShoppingBag, Search } from "lucide-react-native";
import React, { useState, useCallback, useEffect } from "react";
import * as Location from 'expo-location';
import axios from "axios";
// statusBar
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Convert API restaurant to app's Restaurant type
function toAppRestaurant(apiRestaurant: any): Restaurant {
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
    priceLevel: '$$', // Default price level
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
    deliveryFee: 0,
    estimatedDeliveryTime: '30-45 min',
    createdAt: apiRestaurant.createdAt || new Date().toISOString(),
    updatedAt: apiRestaurant.updatedAt || new Date().toISOString(),
    location: {
      latitude: coordinates[1],
      longitude: coordinates[0]
    }
  };
}

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const isTablet = width > 768;
  
  const { user, setUser } = useAuthStore();
  const { recipes, setSelectedTag, isLoading: recipesLoading } = useRecipeStore();
  const { restaurants: mockRestaurants, isLoading: restaurantsLoading } = useRestaurantStore();
  const { getCartItemsCount } = useCartStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [realRestaurants, setRealRestaurants] = useState<Restaurant[]>([]);
  const [isLoadingRealRestaurants, setIsLoadingRealRestaurants] = useState(true);
  
  // Animation values for enhanced UI
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const headerAnim = React.useRef(new Animated.Value(0)).current;
  const cardAnim = React.useRef(new Animated.Value(0)).current;

  
  // Fetch real restaurants from API
  const fetchRealRestaurants = async () => {
    try {
      setIsLoadingRealRestaurants(true);
      console.log('Fetching real restaurants for home page...');
      const response = await axios.get('https://gebeta-delivery1.onrender.com/api/v1/restaurants');
      console.log('Home page API Response:', response);
      
      let restaurantsData = [];
      
      if (response?.data?.data?.restaurants && Array.isArray(response.data.data.restaurants)) {
        console.log('Found restaurants in response.data.data.restaurants');
        restaurantsData = response.data.data.restaurants;
      } else if (Array.isArray(response?.data)) {
        console.log('Found restaurants directly in response.data');
        restaurantsData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        console.log('Found restaurants in response.data.data');
        restaurantsData = response.data.data;
      } else {
        console.warn('Unexpected API response structure:', response?.data);
        throw new Error('Unexpected data format received from server');
      }
      
      console.log('Setting real restaurants data for home page:', restaurantsData);
      const convertedRestaurants = restaurantsData.map(toAppRestaurant);
      setRealRestaurants(convertedRestaurants);
      
    } catch (err: unknown) {
      console.error('Error fetching real restaurants for home page:', err);
      // Fallback to mock restaurants if API fails
      setRealRestaurants(mockRestaurants);
    } finally {
      setIsLoadingRealRestaurants(false);
    }
  };

  // Get random featured recipes
  const getRandomRecipes = useCallback((count: number) => {
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }, [recipes]);

  // Update featured recipes when recipes change and set up rotation
  useEffect(() => {
    if (recipes.length === 0) return;
    
    // Set initial featured recipes
    setFeaturedRecipes(getRandomRecipes(1));
    
    // Set up automatic rotation every 5 seconds
    const rotationInterval = setInterval(() => {
      setFeaturedRecipes(getRandomRecipes(1));
    }, 5000); // 5 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(rotationInterval);
  }, [recipes, getRandomRecipes]);

  // Fetch real restaurants on component mount
  useEffect(() => {
    fetchRealRestaurants();
    
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const featuredRecipe = recipes[0];
  const popularRecipes = recipes.slice(1, 5);
  const featuredRestaurants = realRestaurants.length > 0 ? realRestaurants : mockRestaurants;
  
  // Filter recipes and restaurants based on selected category
  const filteredRecipes = selectedCategory
    ? recipes.filter((recipe) => recipe.tags.includes(selectedCategory))
    : popularRecipes;
    
  const filteredRestaurants = selectedCategory
    ? realRestaurants.filter((restaurant) => 
        restaurant.cuisineTypes.some(cuisine => 
          cuisine.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      )
    : realRestaurants;

  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const handleSeeAllPopular = () => {
    setSelectedTag(null);
    router.push("/search");
  };

  const handleSeeAllCategory = (category: string) => {
    setSelectedTag(category);
    router.push("/search");
  };

  const handleSeeAllRestaurants = () => {
    router.push("/restaurants");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh real restaurants data
    await fetchRealRestaurants();
    // In a real app, this would fetch fresh data from API
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const isLoading = recipesLoading || restaurantsLoading || isLoadingRealRestaurants;

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  return (
    <>
    <StatusBar style="light" />
    <View style={styles.container}>
      {/* Sticky Search Bar with Location and Profile Avatar */}
      <Animated.View 
        style={[
          styles.stickySearchContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Location Button */}
        <TouchableOpacity
          style={styles.topLocationButton}
          onPress={async () => {
            try {
              console.log('Requesting location permissions...');
              const { status } = await Location.requestForegroundPermissionsAsync();
              console.log('Location permission status:', status);
              
              if (status === "granted") {
                console.log('Getting current position...');
                const location = await Location.getCurrentPositionAsync({});
                console.log('Got location:', location);
                
                console.log('Reverse geocoding...');
                const geocode = await Location.reverseGeocodeAsync(location.coords);
                console.log('Geocode results:', geocode);
                
                if (geocode && geocode.length > 0) {
                  const { city, region } = geocode[0];
                  const locationString = `${city || ''}${city && region ? ', ' : ''}${region || ''}`.trim();
                  console.log('Formatted location string:', locationString);
                  
                  if (!user) {
                    console.error('No user object found');
                    return;
                  }
                  
                  // Create a new default address with the location
                  const newAddress = {
                    _id: `addr_${Date.now()}`,
                    Name: locationString,
                    isDefault: true,
                    label: 'Home' as const,
                    additionalInfo: city || 'Unknown City'
                  };
                  
                  console.log('New address to add:', newAddress);
                  
                  // Update user with new address
                  const updatedUser = {
                    ...user,
                    addresses: [newAddress, ...(user.addresses || []).map(addr => ({ ...addr, isDefault: false }))]
                  };
                  
                  await setUser(updatedUser);
                  console.log('User updated successfully');
                } else {
                  console.warn('No geocode results found');
                }
              } else {
                console.warn('Location permission denied');
              }
            } catch (error) {
              console.error('Error in location handling:', error);
            }
          }}
        >
          <Text style={styles.topLocationText}>
            📍 {user?.addresses?.find(addr => addr.isDefault)?.Name 
              ? `${user.addresses.find(addr => addr.isDefault)?.Name}`
              : ""}
          </Text>
        </TouchableOpacity>

        <View style={styles.searchBarRow}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.lightText} style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>Search for recipes, restaurants...</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/profile")} style={styles.topAvatarContainer}>
            <Image
              source={{ uri: user?.profilePicture || "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200" }}
              style={styles.topAvatar}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
       {/* Header */}
       <View style={styles.headerGradient}>
         <Animated.View 
           style={[
             styles.header,
             {
               opacity: headerAnim,
               transform: [{ translateY: headerAnim.interpolate({
                 inputRange: [0, 1],
                 outputRange: [-20, 0]
               })}]
             }
           ]}
         >


         </Animated.View>
       </View>



      {/* Featured Recipe */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, styles.sectionTitleInHeader]}>Featured Recipe</Text>
          <View style={styles.rotationIndicator}>
            <TouchableOpacity 
              onPress={() => setFeaturedRecipes(getRandomRecipes(1))}
              style={styles.refreshButton}
            >
              <Text style={styles.seeAll}>🔄 Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.singleRecipeContainer}>
          <View style={styles.featuredRecipeCard}>
            {featuredRecipes[0] ? (
              <TouchableOpacity 
                onPress={() => router.push(`/recipe/${featuredRecipes[0].id}` as any)}
                activeOpacity={0.9}
              >
                <View style={styles.featuredImageContainer}>
                  <Image
                    source={{ uri: featuredRecipes[0].imageUrl }}
                    style={styles.featuredImage}
                    contentFit="cover"
                    transition={300}
                  />
                  <View style={styles.featuredTitleContainer}>
                    <Text style={styles.featuredTitle} numberOfLines={2}>
                      {featuredRecipes[0].title}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder}>
                <Text>Loading featured recipe...</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {popularTags.map((tag) => (
            <CategoryPill
              key={tag}
              title={tag}
              selected={selectedCategory === tag}
              onPress={() => handleCategoryPress(tag)}
            />
          ))}
        </ScrollView>
      </View>

                           {/* Popular Recipes */}
        <View style={styles.popularContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, styles.sectionTitleInHeader]}>
              {selectedCategory ? `${selectedCategory} Recipes` : "🔥 Popular Recipes"}
            </Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() =>
                selectedCategory
                  ? handleSeeAllCategory(selectedCategory)
                  : handleSeeAllPopular()
              }
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recipesScrollContent}
          >
            {filteredRecipes.map((recipe) => (
              <TouchableOpacity 
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => router.push(`/recipe/${recipe.id}` as any)}
              >
                <Image
                  source={{ uri: recipe.imageUrl }}
                  style={styles.recipeImage}
                />
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeTitle} numberOfLines={2}>
                    {recipe.title}
                  </Text>
                  <View style={styles.recipeMeta}>
                    <View style={styles.ratingContainer}>
                      <Clock size={14} color={colors.secondary} />
                      <Text style={styles.ratingText}>{recipe.cookTime || '30 min'}</Text>
                    </View>
                    <View style={styles.locationContainer}>
                      <MapPin size={14} color={colors.lightText} />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {recipe.difficulty || 'Easy'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

       {/* Featured Restaurants */}
       <View style={styles.restaurantsContainer}>
         <View style={styles.sectionHeader}>
           <Text style={[styles.sectionTitle, styles.sectionTitleInHeader]}>
             {selectedCategory ? `${selectedCategory} Restaurants` : "🍽️ Popular Restaurants"}
           </Text>
           <TouchableOpacity
             style={styles.seeAllButton}
             onPress={handleSeeAllRestaurants}
           >
             <Text style={styles.seeAllText}>See All</Text>
             <ChevronRight size={16} color={colors.primary} />
           </TouchableOpacity>
         </View>

         <FlatList
           data={filteredRestaurants}
           keyExtractor={(item) => item.id}
           renderItem={({ item }) => (
             <TouchableOpacity 
               style={styles.restaurantCard}
               onPress={() => router.push(`/restaurant/${item.id}`)}
             >
               <Image
                 source={{ uri: item.imageUrl }}
                 style={styles.restaurantImage}
               />
               <View style={styles.restaurantInfo}>
                 <Text style={styles.restaurantName} numberOfLines={1}>
                   {item.name}
                 </Text>
                 <View style={styles.restaurantMeta}>
                   <View style={styles.ratingContainer}>
                     <Clock size={14} color={colors.secondary} />
                     <Text style={styles.ratingText}>{item.rating}</Text>
                   </View>
                   <View style={styles.locationContainer}>
                     <MapPin size={14} color={colors.lightText} />
                     <Text style={styles.locationText} numberOfLines={1}>
                       {item.address}
                     </Text>
                   </View>
                 </View>
               </View>
             </TouchableOpacity>
           )}
           ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
           scrollEnabled={false}
         />
       </View>
      </ScrollView>
      
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
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 90, // Space for sticky search bar with location
  },
  stickySearchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: width > 768 ? 16 : 12,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topAvatarContainer: {
    padding: 2,
  },
  topAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  topLocationButton: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  topLocationText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    marginTop: 16,
    color: colors.lightText,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cartButton: {
    position: 'relative',
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
  greeting: {
    ...typography.heading3,
    marginBottom: 4,
    color: colors.white,
  },
  subtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  featuredContainer: {
    paddingHorizontal: 20,
    marginBottom: width > 768 ? 24 : 16,
  },
  categoriesContainer: {
    marginBottom: width > 768 ? 24 : 16,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: width > 768 ? 16 : 12,
    paddingHorizontal: 20,
  },
  sectionTitleInHeader: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  categoriesScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  restaurantsContainer: {
    marginBottom: width > 768 ? 24 : 16,
  },
  restaurantsScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  recipesScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  recipeCard: {
    width: 180,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginRight: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  recipeImage: {
    width: "100%",
    height: width > 768 ? 120 : 100,
  },
  recipeInfo: {
    padding: 8,
  },
  recipeTitle: {
    ...typography.heading4,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...typography.bodySmall,
    color: colors.secondary,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.lightText,
    flex: 1,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  restaurantName: {
    ...typography.heading4,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    marginBottom: width > 768 ? 24 : 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: width > 768 ? 16 : 12,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  singleRecipeContainer: {
    paddingHorizontal: 20,
  },
  featuredRecipeCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  featuredImageContainer: {
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: width > 768 ? 200 : 160,
    borderRadius: 12,
  },
  featuredTitleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
  },
  featuredTitle: {
    ...typography.heading4,
    color: colors.white,
    fontWeight: 'bold',
  },
  placeholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  rotationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    padding: 4,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  popularContainer: {
    marginBottom: width > 768 ? 24 : 16,
  },
  locationButton: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: width > 768 ? 16 : 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    ...typography.bodySmall,
    color: colors.lightText,
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
    flexDirection: 'row',
    zIndex: 10,
  },
  cartButtonInner: {
    position: 'relative',
  },
});
