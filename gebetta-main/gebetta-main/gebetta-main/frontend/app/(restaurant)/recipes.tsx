import restaurantOwnerColors from "@/constants/restaurantOwnerColors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Edit2, Eye, Lock, Plus, Search, Trash2, Unlock } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Mock recipe data
const initialRecipes = [
  {
    id: "1",
    name: "Doro Wat",
    description: "Traditional Ethiopian chicken stew",
    ingredients: [
      "2 lbs chicken thighs",
      "3 tbsp berbere spice",
      "2 onions, finely chopped",
      "3 cloves garlic, minced",
      "1 tbsp ginger, minced",
      "1/4 cup niter kibbeh (spiced butter)",
      "2 cups chicken broth",
      "4 hard-boiled eggs",
      "Salt to taste",
    ],
    instructions: [
      "Sauté onions until caramelized (about 20 minutes)",
      "Add garlic and ginger, cook for 2 minutes",
      "Add berbere spice and niter kibbeh, cook for 5 minutes",
      "Add chicken pieces and brown on all sides",
      "Pour in chicken broth, bring to a simmer",
      "Cover and cook for 45 minutes until chicken is tender",
      "Add hard-boiled eggs for the last 10 minutes",
      "Adjust seasoning and serve with injera",
    ],
    image: "https://images.unsplash.com/photo-1567364816519-cbc9c4ffe1eb?q=80&w=500",
    isPrivate: true,
    createdBy: "owner",
  },
  {
    id: "2",
    name: "Tibs",
    description: "Ethiopian sautéed meat dish",
    ingredients: [
      "1 lb beef or lamb, cut into small pieces",
      "2 onions, sliced",
      "2 tomatoes, diced",
      "2 jalapeños, sliced",
      "2 tbsp niter kibbeh (spiced butter)",
      "1 tbsp berbere spice",
      "Salt and pepper to taste",
    ],
    instructions: [
      "Heat niter kibbeh in a pan over medium-high heat",
      "Add meat and brown on all sides",
      "Add onions and cook until softened",
      "Add tomatoes, jalapeños, and berbere spice",
      "Cook for 10-15 minutes until meat is cooked through",
      "Season with salt and pepper",
      "Serve hot with injera",
    ],
    image: "https://images.unsplash.com/photo-1511910849309-0dffb8785146?q=80&w=500",
    isPrivate: false,
    createdBy: "manager",
  },
  {
    id: "3",
    name: "Injera",
    description: "Ethiopian sourdough flatbread",
    ingredients: [
      "2 cups teff flour",
      "1/2 cup all-purpose flour",
      "3 cups water",
      "1/2 tsp salt",
      "1/4 tsp instant yeast (for starter)",
    ],
    instructions: [
      "Mix teff flour with water and instant yeast",
      "Let ferment for 2-3 days in a warm place",
      "Add all-purpose flour and salt, mix well",
      "Let rest for 1 hour",
      "Heat a large non-stick pan over medium heat",
      "Pour batter in a spiral pattern to cover the pan",
      "Cover and cook for 2-3 minutes until bubbles form and top is set",
      "Remove and let cool on a cloth",
    ],
    image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?q=80&w=500",
    isPrivate: false,
    createdBy: "owner",
  },
];

export default function RecipeManagement() {
  const router = useRouter();
  const { userRole } = useAuthStore();
  const [recipes, setRecipes] = useState(initialRecipes);
  const [filteredRecipes, setFilteredRecipes] = useState(initialRecipes);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPrivate, setShowPrivate] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    // Filter recipes based on search query and privacy setting
    let filtered = [...recipes];
    
    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }
    
    if (!showPrivate) {
      filtered = filtered.filter((recipe) => !recipe.isPrivate);
    }
    
    // If manager, only show recipes they can access
    if (userRole === "manager") {
      filtered = filtered.filter(
        (recipe) => !recipe.isPrivate || recipe.createdBy === "manager"
      );
    }
    
    setFilteredRecipes(filtered);
  }, [searchQuery, showPrivate, recipes, userRole]);

  const handleAddRecipe = () => {
    // In a real app, this would navigate to a form to add a new recipe
    Alert.alert(
      "Add Recipe",
      "This would open a form to add a new recipe."
    );
  };

  const handleEditRecipe = (id: string) => {
    // In a real app, this would navigate to a form to edit the recipe
    Alert.alert(
      "Edit Recipe",
      `This would open a form to edit recipe with ID: ${id}`
    );
  };

  const handleDeleteRecipe = (id: string) => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedRecipes = recipes.filter((recipe) => recipe.id !== id);
            setRecipes(updatedRecipes);
          },
        },
      ]
    );
  };

  const handleTogglePrivacy = (id: string) => {
    const updatedRecipes = recipes.map((recipe) => {
      if (recipe.id === id) {
        return {
          ...recipe,
          isPrivate: !recipe.isPrivate,
        };
      }
      return recipe;
    });
    setRecipes(updatedRecipes);
  };

  const handleViewRecipe = (id: string) => {
    // In a real app, this would navigate to a detailed view of the recipe
    Alert.alert(
      "View Recipe",
      `This would open a detailed view of recipe with ID: ${id}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={restaurantOwnerColors.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor={restaurantOwnerColors.placeholderText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddRecipe}
        >
          <Plus size={20} color={restaurantOwnerColors.white} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowPrivate(!showPrivate)}
        >
          {showPrivate ? (
            <>
              <Eye size={16} color={restaurantOwnerColors.text} />
              <Text style={styles.filterButtonText}>Showing All Recipes</Text>
            </>
          ) : (
            <>
              <Lock size={16} color={restaurantOwnerColors.text} />
              <Text style={styles.filterButtonText}>Hiding Private Recipes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      ) : filteredRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recipes found</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.recipeList}
          contentContainerStyle={styles.recipeListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredRecipes.map((recipe) => (
            <View key={recipe.id} style={styles.recipeCard}>
              <Image
                source={{ uri: recipe.image }}
                style={styles.recipeImage}
                contentFit="cover"
              />
              <View style={styles.recipeContent}>
                <View style={styles.recipeHeader}>
                  <Text style={styles.recipeName}>{recipe.name}</Text>
                  {recipe.isPrivate && (
                    <Lock size={16} color={restaurantOwnerColors.lightText} />
                  )}
                </View>
                <Text style={styles.recipeDescription}>{recipe.description}</Text>
                
                <View style={styles.recipeFooter}>
                  <Text style={styles.ingredientsCount}>
                    {recipe.ingredients.length} ingredients
                  </Text>
                  
                  <View style={styles.recipeActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleViewRecipe(recipe.id)}
                    >
                      <Eye size={16} color={restaurantOwnerColors.text} />
                      <Text style={styles.actionButtonText}>View</Text>
                    </TouchableOpacity>
                    
                    {(userRole === "owner" || recipe.createdBy === "manager") && (
                      <>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEditRecipe(recipe.id)}
                        >
                          <Edit2 size={16} color={restaurantOwnerColors.text} />
                          <Text style={styles.actionButtonText}>Edit</Text>
                        </TouchableOpacity>
                        
                        {userRole === "owner" && (
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleTogglePrivacy(recipe.id)}
                          >
                            {recipe.isPrivate ? (
                              <>
                                <Unlock size={16} color={restaurantOwnerColors.text} />
                                <Text style={styles.actionButtonText}>Make Public</Text>
                              </>
                            ) : (
                              <>
                                <Lock size={16} color={restaurantOwnerColors.text} />
                                <Text style={styles.actionButtonText}>Make Private</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => handleDeleteRecipe(recipe.id)}
                        >
                          <Trash2 size={16} color={restaurantOwnerColors.error} />
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: restaurantOwnerColors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: restaurantOwnerColors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: restaurantOwnerColors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: restaurantOwnerColors.text,
    ...typography.body,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: restaurantOwnerColors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 12,
  },
  addButtonText: {
    color: restaurantOwnerColors.white,
    fontWeight: "600",
    marginLeft: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: restaurantOwnerColors.border,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: restaurantOwnerColors.lightGray,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  filterButtonText: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.text,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: restaurantOwnerColors.lightText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: restaurantOwnerColors.lightText,
  },
  recipeList: {
    flex: 1,
  },
  recipeListContent: {
    padding: 16,
  },
  recipeCard: {
    backgroundColor: restaurantOwnerColors.cardBackground,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: 160,
  },
  recipeContent: {
    padding: 16,
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recipeName: {
    ...typography.heading3,
    color: restaurantOwnerColors.text,
  },
  recipeDescription: {
    ...typography.body,
    color: restaurantOwnerColors.lightText,
    marginBottom: 16,
  },
  recipeFooter: {
    flexDirection: "column",
    gap: 12,
  },
  ingredientsCount: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.lightText,
  },
  recipeActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: restaurantOwnerColors.lightGray,
  },
  actionButtonText: {
    ...typography.caption,
    color: restaurantOwnerColors.text,
    fontWeight: "500",
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: restaurantOwnerColors.error + "20", // 20% opacity
  },
  deleteButtonText: {
    ...typography.caption,
    color: restaurantOwnerColors.error,
    fontWeight: "500",
    marginLeft: 4,
  },
});
