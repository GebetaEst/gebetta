import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Restaurant } from "@/types/restaurant";
import { Image } from "expo-image";
import { Clock } from "lucide-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as React from "react";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";

interface RestaurantCardProps extends React.ComponentPropsWithoutRef<typeof TouchableOpacity> {
  restaurant: Restaurant;
  onPress: () => void;
}

export default function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const {
    name,
    imageUrl = '',
    cuisine,
    rating = 0,
    deliveryFee = 0,
    estimatedDeliveryTime = '30-45 min',
    priceLevel,
    isOpen = true,
  } = restaurant;

  // Format delivery fee
  const formattedDeliveryFee = deliveryFee === 0 ? "Free" : `${deliveryFee} Birr`;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        {!imageError && imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, imageLoading && { opacity: 0 }]}
            contentFit="cover"
            transition={200}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="restaurant" size={32} color={colors.lightText} />
          </View>
        )}
      </View>
      
      {!isOpen && (
        <View style={styles.closedBadge}>
          <Text style={styles.closedText}>Closed</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={14} color={colors.warning} />
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
          </View>
        </View>
        
        <Text style={styles.cuisine}>{cuisine}</Text>
        
        <View style={styles.footer}>
          <View style={styles.infoItem}>
            <Clock size={14} color={colors.lightText} />
            <Text style={styles.infoText}>{estimatedDeliveryTime}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialIcons name="local-shipping" size={14} color={colors.lightText} style={styles.carIcon} />
            <Text style={styles.infoText}>{formattedDeliveryFee} delivery</Text>
          </View>
          
          {priceLevel && (
            <View style={styles.infoItem}>
              <Text style={styles.infoText}>{priceLevel}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: "100%",
    height: 160,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.inputBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  closedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  closedText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "500",
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    ...typography.subtitle,
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.warning}20`, // Add 20% opacity to warning color
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rating: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "600",
    marginLeft: 2,
  },
  cuisine: {
    ...typography.caption,
    color: colors.lightText,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  carIcon: {
    marginRight: 4,
  },
  infoText: {
    ...typography.caption,
    color: colors.lightText,
    marginLeft: 4,
  },
});
