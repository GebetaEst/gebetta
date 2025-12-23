import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { MenuItem } from "@/types/restaurant";
import { Image } from "expo-image";
import { Flame, Leaf, Plus } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MenuItemCardProps {
  item: MenuItem;
  onPress: () => void;
  onAddToCart?: () => void;
  variant?: "horizontal" | "vertical";
}

const { width } = Dimensions.get("window");

export default function MenuItemCard({
  item,
  onPress,
  onAddToCart,
  variant = "horizontal",
}: MenuItemCardProps) {
  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart();
    }
  };

  const cardStyles = [
    styles.card,
    variant === "vertical" && styles.verticalCard,
  ];
  
  const imageStyles = [
    styles.image,
    variant === "vertical" && styles.verticalImage,
  ];
  
  const contentStyles = [
    styles.content,
    variant === "vertical" && styles.verticalContent,
  ];

  return (
    <TouchableOpacity
      style={cardStyles}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={imageStyles}
        contentFit="cover"
        transition={300}
      />
      
      <View style={contentStyles}>
        <View style={styles.header}>
          <Text
            style={styles.title}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          
          <View style={styles.badgesContainer}>
            {item.isSpicy && (
              <View style={styles.badge}>
                <Flame size={12} color={colors.primary} />
              </View>
            )}
            {item.isVegetarian && (
              <View style={styles.badge}>
                <Leaf size={12} color={colors.accent} />
              </View>
            )}
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>{item.price} Birr</Text>
          
          {onAddToCart && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToCart}
            >
              <Plus size={18} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
        
        {item.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "row",
    width: width * 0.9,
  },
  verticalCard: {
    flexDirection: "column",
    width: width * 0.45,
  },
  image: {
    height: 100,
    width: 100,
  },
  verticalImage: {
    height: 140,
    width: "100%",
  },
  content: {
    flex: 1,
    padding: 12,
  },
  verticalContent: {
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    ...typography.heading4,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  badgesContainer: {
    flexDirection: "row",
  },
  badge: {
    marginLeft: 4,
  },
  description: {
    ...typography.caption,
    color: colors.lightText,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    ...typography.bodySmall,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  popularBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  popularText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "600",
    fontSize: 10,
  },
});
