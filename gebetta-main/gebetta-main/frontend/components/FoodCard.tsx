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
  compact?: boolean;
}

export default function FoodCard({ food, compact = false }: FoodCardProps) {
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
      style={[styles.card, compact && styles.compactCard]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={[styles.imageContainer, compact && styles.compactImageContainer]}>
        <Image
          source={{
            uri: food.imageCover || 'https://via.placeholder.com/400x250?text=No+Image',
          }}
          style={[styles.image, compact && styles.compactImage]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.gradient}
        />
      </View>

      <View style={[styles.content, compact && styles.compactContent]}>
        <View style={styles.header}>
          <Text style={[styles.title, compact && styles.compactTitle]} numberOfLines={1}>
            {food.foodName}
          </Text>
          <Text style={styles.price}>{food.price.toFixed(2)} birr</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.infoContainer}>
            {food.rating > 0 && (
              <View style={styles.infoItem}>
                <Star size={16} style={{ color: colors.primary }} />
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
    // Gray shadow
    // shadowColor: colors.gray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    overflow: 'hidden',
    marginBottom: 16,
    width: CARD_WIDTH,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  compactCard: {
    width: (CARD_WIDTH / 2) - 10,
    marginBottom: 12,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    overflow: 'hidden',
  },
  compactImageContainer: {
    height: 120,
  },
  compactImage: {
    height: '100%',
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
    padding: 12,
  },
  compactContent: {
    padding: 8,
  },
  compactTitle: {
    fontSize: 14,
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

