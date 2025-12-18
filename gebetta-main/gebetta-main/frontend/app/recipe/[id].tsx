import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRecipeStore } from '@/store/recipeStore';
import { Recipe } from '@/types/recipe';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { ChevronLeft, Clock, Users, ChefHat } from 'lucide-react-native';

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes } = useRecipeStore();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && recipes.length > 0) {
      const foundRecipe = recipes.find(r => r.id === id);
      setRecipe(foundRecipe || null);
      setIsLoading(false);
    }
  }, [id, recipes]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Recipe not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recipe</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Recipe Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.recipeImage}
            contentFit="cover"
          />
        </View>

        {/* Recipe Content */}
        <View style={styles.contentContainer}>
          {/* Title and basic info */}
          <View style={styles.titleSection}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <Text style={styles.recipeDescription}>{recipe.description}</Text>
          </View>

          {/* Recipe stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Clock size={20} color={colors.primary} />
              <Text style={styles.statText}>{recipe.cookTime || '30 min'}</Text>
            </View>
            <View style={styles.statItem}>
              <Users size={20} color={colors.primary} />
              <Text style={styles.statText}>{recipe.servings || '4'} servings</Text>
            </View>
            <View style={styles.statItem}>
              <ChefHat size={20} color={colors.primary} />
              <Text style={styles.statText}>{recipe.difficulty || 'Easy'}</Text>
            </View>
          </View>

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <Text style={styles.ingredientText}>
                    • {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Instructions */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              {recipe.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {recipe.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    marginTop: 16,
    color: colors.lightText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...typography.heading3,
    color: colors.error,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    ...typography.heading3,
    color: colors.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    width: '100%',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  recipeTitle: {
    ...typography.heading1,
    marginBottom: 12,
    color: colors.text,
  },
  recipeDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
    color: colors.text,
  },
  ingredientItem: {
    marginBottom: 8,
  },
  ingredientText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepNumberText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.primary + '20',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});









