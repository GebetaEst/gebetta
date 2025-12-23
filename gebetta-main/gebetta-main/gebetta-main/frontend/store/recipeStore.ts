import { recipes as mockRecipes } from "@/mocks/recipes";
import { currentUser } from "@/mocks/users";
import { Comment, Recipe } from "@/types/recipe";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface RecipeState {
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  selectedTag: string | null;
  selectedRegion: string | null;
  searchQuery: string;
  
  // Actions
  setRecipes: (recipes: Recipe[]) => void;
  toggleLike: (recipeId: string) => void;
  toggleSave: (recipeId: string) => void;
  toggleFavorite: (recipeId: string) => void;
  setSelectedTag: (tag: string | null) => void;
  setSelectedRegion: (region: string | null) => void;
  setSearchQuery: (query: string) => void;
  filterRecipes: () => void;
  addRecipe: (recipe: Omit<Recipe, "id" | "authorId" | "authorName" | "authorAvatar" | "createdAt" | "likes" | "isLiked" | "isSaved" | "rating" | "ratingCount" | "comments">) => void;
  updateRecipe: (recipeId: string, recipeData: Partial<Recipe>) => void;
  deleteRecipe: (recipeId: string) => void;
  rateRecipe: (recipeId: string, rating: number) => void;
  addComment: (recipeId: string, text: string) => void;
  getComments: (recipeId: string) => Comment[];
  sortRecipes: (sortBy: string) => void;
  filterByDifficulty: (difficulty: string | null) => void;
  filterByTime: (maxTime: number | null) => void;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isLoading: boolean;
}

// Ensure recipes have all required properties
const prepareRecipes = (recipes: any[]): Recipe[] => {
  return recipes.map(recipe => ({
    ...recipe,
    rating: recipe.rating || 0,
    ratingCount: recipe.ratingCount || 0,
    comments: recipe.comments || [],
    isFavorite: recipe.isSaved || false
  }));
};

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: prepareRecipes(mockRecipes),
      filteredRecipes: prepareRecipes(mockRecipes),
      selectedTag: null,
      selectedRegion: null,
      searchQuery: "",
      isLoading: false,
      
      setRecipes: (recipes) => set({ recipes, filteredRecipes: recipes }),
      
      toggleLike: (recipeId) => {
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === recipeId
              ? {
                  ...recipe,
                  isLiked: !recipe.isLiked,
                  likes: recipe.isLiked ? recipe.likes - 1 : recipe.likes + 1,
                }
              : recipe
          ),
        }));
        get().filterRecipes();
      },
      
      toggleSave: (recipeId) => {
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === recipeId
              ? { 
                  ...recipe, 
                  isSaved: !recipe.isSaved,
                  isFavorite: !recipe.isSaved 
                }
              : recipe
          ),
        }));
        get().filterRecipes();
      },
      
      // Alias for toggleSave for backward compatibility
      toggleFavorite: (recipeId) => {
        get().toggleSave(recipeId);
      },
      
      setSelectedTag: (tag) => {
        set({ selectedTag: tag });
        get().filterRecipes();
      },
      
      setSelectedRegion: (region) => {
        set({ selectedRegion: region });
        get().filterRecipes();
      },
      
      setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().filterRecipes();
      },
      
      filterRecipes: () => {
        const { recipes, selectedTag, selectedRegion, searchQuery } = get();
        
        let filtered = [...recipes];
        
        if (selectedTag) {
          filtered = filtered.filter((recipe) =>
            recipe.tags.includes(selectedTag)
          );
        }
        
        if (selectedRegion && selectedRegion !== "All regions") {
          filtered = filtered.filter(
            (recipe) => recipe.region === selectedRegion
          );
        }
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (recipe) =>
              recipe.title.toLowerCase().includes(query) ||
              recipe.description.toLowerCase().includes(query) ||
              recipe.tags.some((tag) => tag.toLowerCase().includes(query)) ||
              recipe.ingredients.some((ing) =>
                ing.name.toLowerCase().includes(query)
              )
          );
        }
        
        set({ filteredRecipes: filtered });
      },
      
      addRecipe: (recipeData) => {
        if (!currentUser) return;
        
        const newRecipe: Recipe = {
          id: Date.now().toString(),
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar || "",
          createdAt: new Date().toISOString(),
          likes: 0,
          isLiked: false,
          isSaved: false,
          isFavorite: false,
          rating: 0,
          ratingCount: 0,
          comments: [],
          ...recipeData,
        };
        
        set((state) => ({
          recipes: [newRecipe, ...state.recipes],
        }));
        get().filterRecipes();
      },
      
      updateRecipe: (recipeId, recipeData) => {
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === recipeId
              ? { ...recipe, ...recipeData }
              : recipe
          ),
        }));
        get().filterRecipes();
      },
      
      deleteRecipe: (recipeId) => {
        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== recipeId),
        }));
        get().filterRecipes();
      },

      rateRecipe: (recipeId, rating) => {
        if (!currentUser) return;
        
        set((state) => ({
          recipes: state.recipes.map((recipe) => {
            if (recipe.id === recipeId) {
              const newRatingCount = recipe.ratingCount + 1;
              const newRating = (recipe.rating * recipe.ratingCount + rating) / newRatingCount;
              return {
                ...recipe,
                rating: newRating,
                ratingCount: newRatingCount,
              };
            }
            return recipe;
          }),
        }));
        get().filterRecipes();
      },

      addComment: (recipeId, text) => {
        if (!currentUser || !text.trim()) return;

        const newComment: Comment = {
          id: Date.now().toString(),
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar || "",
          text: text.trim(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          recipes: state.recipes.map((recipe) => {
            if (recipe.id === recipeId) {
              return {
                ...recipe,
                comments: [newComment, ...(recipe.comments || [])],
              };
            }
            return recipe;
          }),
        }));
      },

      getComments: (recipeId) => {
        const recipe = get().recipes.find(r => r.id === recipeId);
        return recipe?.comments || [];
      },

      sortRecipes: (sortBy) => {
        const { filteredRecipes } = get();
        let sorted = [...filteredRecipes];

        switch (sortBy) {
          case "popular":
            sorted.sort((a, b) => b.likes - a.likes);
            break;
          case "rating":
            sorted.sort((a, b) => b.rating - a.rating);
            break;
          case "newest":
            sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case "time":
            sorted.sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime));
            break;
          default:
            break;
        }

        set({ filteredRecipes: sorted });
      },

      filterByDifficulty: (difficulty) => {
        if (!difficulty) {
          get().filterRecipes();
          return;
        }

        set((state) => {
          let filtered = [...state.recipes];
          
          if (state.selectedTag) {
            filtered = filtered.filter((recipe) =>
              recipe.tags.includes(state.selectedTag!)
            );
          }
          
          if (state.selectedRegion && state.selectedRegion !== "All regions") {
            filtered = filtered.filter(
              (recipe) => recipe.region === state.selectedRegion
            );
          }
          
          if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (recipe) =>
                recipe.title.toLowerCase().includes(query) ||
                recipe.description.toLowerCase().includes(query) ||
                recipe.tags.some((tag) => tag.toLowerCase().includes(query)) ||
                recipe.ingredients.some((ing) =>
                  ing.name.toLowerCase().includes(query)
                )
            );
          }

          // Filter by difficulty
          filtered = filtered.filter(recipe => recipe.difficulty === difficulty);
          
          return { filteredRecipes: filtered };
        });
      },

      filterByTime: (maxTime) => {
        if (!maxTime) {
          get().filterRecipes();
          return;
        }

        set((state) => {
          let filtered = [...state.recipes];
          
          if (state.selectedTag) {
            filtered = filtered.filter((recipe) =>
              recipe.tags.includes(state.selectedTag!)
            );
          }
          
          if (state.selectedRegion && state.selectedRegion !== "All regions") {
            filtered = filtered.filter(
              (recipe) => recipe.region === state.selectedRegion
            );
          }
          
          if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (recipe) =>
                recipe.title.toLowerCase().includes(query) ||
                recipe.description.toLowerCase().includes(query) ||
                recipe.tags.some((tag) => tag.toLowerCase().includes(query)) ||
                recipe.ingredients.some((ing) =>
                  ing.name.toLowerCase().includes(query)
                )
            );
          }

          // Filter by total cooking time
          filtered = filtered.filter(recipe => (recipe.prepTime + recipe.cookTime) <= maxTime);
          
          return { filteredRecipes: filtered };
        });
      },
      
      followUser: (userId) => {
        // In a real app, this would update a user's followers/following lists
        console.log(`Following user ${userId}`);
      },
      
      unfollowUser: (userId) => {
        // In a real app, this would update a user's followers/following lists
        console.log(`Unfollowing user ${userId}`);
      },
    }),
    {
      name: "recipe-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
