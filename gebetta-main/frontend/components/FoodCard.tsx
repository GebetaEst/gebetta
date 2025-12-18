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
const CARD_WIDTH = width * 0.44; // Make cards slightly less than half width to fit two in a row with spacing

interface FoodCardProps {
  food: Food;
  compact?: boolean;
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
    borderRadius: 10,
    marginBottom: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: CARD_WIDTH,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  imageContainer: {
    width: "100%",
    height: 120, // Slightly reduced height
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
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
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
    padding: 8,
  },
  header: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
    marginRight: 4,
    marginBottom: 2,
    fontSize: 13,
    textTransform: "capitalize",
    lineHeight: 16,
  },
  price: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
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

