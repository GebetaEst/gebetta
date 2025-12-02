import Button from "@/components/Button";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useCartStore } from "@/store/cartStore";
import { OrderServiceType } from "@/types/restaurant";
import { normalizeRestaurantId } from "@/utils/restaurant";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";

// Food item interface matching the API structure
interface Food {
  _id: string;
  foodName: string;
  price: number;
  imageCover: string;
  ingredients: string;
  cookingTimeMinutes: number;
  rating: number;
  isFeatured: boolean;
  status: string;
  menuId: {
    _id: string;
    restaurantId: string;
    menuType: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function MenuItemDetailScreen() {
  const { restaurantId, itemId } = useLocalSearchParams<{ restaurantId: string; itemId: string }>();
  const router = useRouter();
  const { addToCart, serviceType, setServiceType } = useCartStore();
  
  const [menuItem, setMenuItem] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch menu item data
  useEffect(() => {
    const fetchMenuItem = async () => {
      if (!itemId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://api.bahirandelivery.cloud/api/v1/foods/${itemId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch menu item: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Menu item API response:', data);
        
        if (data.status === 'success' && data.data) {
          setMenuItem(data.data);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (error) {
        console.error('Error fetching menu item:', error);
        setError(error instanceof Error ? error.message : 'Failed to load menu item details');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [itemId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading menu item...</Text>
      </View>
    );
  }

  if (error && !menuItem) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!menuItem) {
    return (
      <View style={styles.notFound}>
        <Text style={typography.heading2}>Item not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddToCart = () => {
    if (!menuItem) {
      return;
    }

    const resolvedRestaurantId =
      normalizeRestaurantId(restaurantId as string | undefined) ??
      normalizeRestaurantId(menuItem.menuId?.restaurantId);

    if (!resolvedRestaurantId) {
      // Alert.alert(
      //   "Unable to add item",
      //   "We couldn't determine which restaurant this item belongs to. Please try again later."
      // );
      setErrorMessage("something went wrong check your internet connection");
      return;
    }

    // Add the item to cart with default quantity of 1
    addToCart(resolvedRestaurantId, menuItem._id, 1, serviceType, {
      name: menuItem.foodName,
      price: menuItem.price,
      restaurantId: resolvedRestaurantId,
    });
    
    // Alert.alert(
    //   "Added to Cart",
    //   `${menuItem.foodName} added to your cart.`,
    //   [
    //     {
    //       text: "Continue Shopping",
    //       onPress: () => router.back(),
    //       style: "cancel",
    //     },
    //     {
    //       text: "View Cart",
    //       onPress: () => router.push("/cart"),
    //     },
    //   ]
    // );
    router.push("/cart");    
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: menuItem.imageCover || 'https://via.placeholder.com/400x300?text=No+Image' }}
            style={styles.image}
            contentFit="cover"
          />
          <View style={styles.gradient} />
          <TouchableOpacity
            style={styles.backIconButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="chevron-left" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.badgesContainer}>
            {menuItem.status === 'Available' && (
              <View style={styles.badge}>
                <FontAwesome name="check" size={16} color={colors.white} />
                <Text style={styles.badgeText}>Available</Text>
              </View>
            )}
            {menuItem.isFeatured && (
              <View style={[styles.badge, styles.featuredBadge]}>
                <FontAwesome name="star" size={16} color={colors.white} />
                <Text style={styles.badgeText}>Featured</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{menuItem.foodName}</Text>
            <Text style={styles.price}>{menuItem.price} Birr</Text>
          </View>
          
          {/* Info Cards */}
          <View style={styles.infoCardsContainer}>
            {menuItem.cookingTimeMinutes > 0 && (
              <View style={styles.infoCard}>
                <FontAwesome name="clock-o" size={20} color={colors.primary} />
                <Text style={styles.infoCardLabel}>Cooking Time</Text>
                <Text style={styles.infoCardValue}>{menuItem.cookingTimeMinutes} min</Text>
              </View>
            )}
            
            {menuItem.rating !== undefined && (
              <View style={styles.infoCard}>
                <FontAwesome name="star" size={20} color="#FFB800" />
                <Text style={styles.infoCardLabel}>Rating</Text>
                <Text style={styles.infoCardValue}>
                  {menuItem.rating > 0 ? menuItem.rating.toFixed(1) : 'New'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="leaf" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Ingredients</Text>
            </View>
            <Text style={styles.ingredientsText}>{menuItem.ingredients}</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Price</Text>
          <Text style={styles.totalPrice}>{menuItem.price} Birr</Text>
        </View>
        
        <Button
          title="Add to Cart"
          onPress={handleAddToCart}
          variant="primary"
          style={styles.addButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 28,
   
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  imageContainer: {
    height: 300,
    position: "relative",
    
  },
  image: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backIconButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgesContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "column",
    alignItems: "flex-end",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  featuredBadge: {
    backgroundColor: "#FFB800",
  },
  badgeText: {
    color: colors.white,
    fontWeight: "600",
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    ...typography.heading1,
    flex: 1,
    marginRight: 16,
  },
  price: {
    ...typography.heading2,
    color: colors.primary,
  },
  description: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: 24,
  },
  infoCardsContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCardLabel: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginTop: 8,
  },
  infoCardValue: {
    ...typography.heading3,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    ...typography.heading3,
  },
  ingredientsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  ingredient: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  ingredientText: {
    ...typography.bodySmall,
  },
  footer: {
    backgroundColor: colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    flexDirection: "row",
    alignItems: "center",
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  totalPrice: {
    ...typography.heading3,
  },
  addButton: {
    flex: 1,
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  ingredientsText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
    backgroundColor: colors.inputBackground,
    padding: 16,
    borderRadius: 12,
  },
});
