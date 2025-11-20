import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useRecipeStore } from "@/store/recipeStore";
import { Recipe } from "@/types/recipe";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Bookmark, Clock } from "lucide-react-native";
import Feather from '@expo/vector-icons/Feather';
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from "react-native";

interface RecipeCardProps {
  recipe: Recipe;
  variant?: "horizontal" | "vertical" | "featured";
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

const { width } = Dimensions.get("window");

export default function RecipeCard({
  recipe,
  variant = "vertical",
  style,
  imageStyle,
  contentStyle,
}: RecipeCardProps) {
  const router = useRouter();
  const { toggleLike, toggleSave } = useRecipeStore();

  const handlePress = () => {
    router.push(`/recipe/${recipe.id}`);
  };

  const handleLike = (e: any) => {
    e.stopPropagation();
    toggleLike(recipe.id);
  };

  const handleSave = (e: any) => {
    e.stopPropagation();
    toggleSave(recipe.id);
  };

  const totalTime = recipe.prepTime + recipe.cookTime;
  
  const cardStyles = [
    styles.card,
    variant === "horizontal" && styles.horizontalCard,
    variant === "featured" && styles.featuredCard,
    style,
  ];
  
  const imageStyles = [
    styles.image,
    variant === "horizontal" && styles.horizontalImage,
    variant === "featured" && styles.featuredImage,
    imageStyle,
  ];
  
  const contentStyles = [
    styles.content,
    variant === "horizontal" && styles.horizontalContent,
    variant === "featured" && styles.featuredContent,
    contentStyle,
  ];

  return (
    <TouchableOpacity
      style={cardStyles}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: recipe.imageUrl }}
        style={imageStyles}
        contentFit="cover"
        transition={300}
      />
      
      {variant === "featured" && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
      
      <View style={contentStyles}>
        <View style={styles.header}>
          <Text
            style={[
              variant === "featured" ? typography.heading3 : typography.heading4,
              styles.title,
            ]}
            numberOfLines={2}
          >
            {recipe.title}
          </Text>
          
          <View style={styles.authorContainer}>
            <Image
              source={{ uri: recipe.authorAvatar }}
              style={styles.authorAvatar}
            />
            <Text style={styles.authorName}>{recipe.authorName}</Text>
          </View>
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Clock size={16} color={colors.text} />
            <Text style={styles.metaText}>{totalTime} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="users" size={16} color={colors.text} />
            <Text style={styles.metaText}>{recipe.servings} servings</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="star" size={16} color={colors.warning} style={styles.starIcon} />
            <Text style={[styles.metaText, { color: colors.warning }]}>{recipe.rating?.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.tagsContainer}>
            {recipe.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {recipe.tags.length > 2 && (
              <Text style={styles.moreTags}>+{recipe.tags.length - 2} more</Text>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
              <Feather
                name={recipe.isLiked ? "heart" : "heart"}
                size={20}
                color={recipe.isLiked ? colors.danger : colors.textSecondary}
                style={!recipe.isLiked ? { opacity: 0.7 } : {}}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
              <Feather
                name={recipe.isSaved ? "bookmark" : "bookmark"}
                size={20}
                color={recipe.isSaved ? colors.primary : colors.textSecondary}
                style={!recipe.isSaved ? { opacity: 0.7 } : {}}
              />
            </TouchableOpacity>
          </View>
        </View>
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
    width: width * 0.9,
  },
  horizontalCard: {
    flexDirection: "row",
    height: 120,
    width: width * 0.9,
  },
  featuredCard: {
    height: 400,
    width: width * 0.9,
  },
  image: {
    height: 180,
    width: "100%",
  },
  horizontalImage: {
    height: "100%",
    width: 120,
  },
  featuredImage: {
    height: 250,
  },
  featuredBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  featuredText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  horizontalContent: {
    flex: 1,
  },
  featuredContent: {
    padding: 20,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorName: {
    ...typography.caption,
    color: colors.lightText,
  },
  description: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    width: '100%',
    flexWrap: 'nowrap',
  },
  metaContainer: {
    flexDirection: "row",
    flexShrink: 1,
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metaText: {
    ...typography.caption,
    marginLeft: 4,
  },
  actions: {
    flexDirection: "row",
    marginLeft: 8,
    flexShrink: 0,
  },
  actionButton: {
    marginLeft: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    ...typography.caption,
    color: colors.text,
  },
  moreTags: {
    ...typography.caption,
    color: colors.text,
    marginLeft: 8,
  },
  starIcon: {
    marginRight: 4,
  },
});
