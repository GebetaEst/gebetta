import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Clock, Star } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Food } from "@/types/food";
import { normalizeRestaurantId } from "@/utils/restaurant";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;

interface FoodCardProps {
  food: Food;
}

export default function FoodCard({ food }: FoodCardProps) {
  const router = useRouter();

  const handlePress = () => {
    // Navigate to food detail page
    const restaurantId =
      normalizeRestaurantId(food.restaurantId) ??
      normalizeRestaurantId(food.menuId?.restaurantId);
    const foodId = food._id || food.id;
    if (restaurantId && foodId) {
      router.push(`/menu-item/${restaurantId}/${foodId}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ 
            uri: food.imageCover || 'https://via.placeholder.com/400x250?text=No+Image' 
          }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.gradient}
        />
        
        {/* Category Badge */}
        {food.menuId?.menuType && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {food.menuId.menuType}
            </Text>
          </View>
        )}

        {/* Status Badge */}
        {food.status === "Available" && (
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Available</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {food.foodName}
          </Text>
          <Text style={styles.price}>{food.price.toFixed(2)} birr</Text>
        </View>

        

        <View style={styles.footer}>
          <View style={styles.infoContainer}>
            

            {food.rating > 0 && (
              <View style={styles.infoItem}>
                <Star 
                  size={16} 
                  color={colors.primary} 
                  fill={colors.primary}
                />
                <Text style={styles.infoText}>
                  {food.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: CARD_WIDTH,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 4,
  },
  statusText: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.text,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  header: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    ...typography.heading4,
    flex: 1,
    marginRight: 12,
    textTransform: "capitalize",
  },
  price: {
    ...typography.heading4,
    color: colors.primary,
    fontWeight: "700",
  },
  description: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: "500",
  },
});

