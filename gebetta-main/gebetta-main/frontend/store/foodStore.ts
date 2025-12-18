import { create } from "zustand";
import { Food, FoodApiResponse } from "@/types/food";
import { API_CONFIG, ENDPOINTS } from "@/constants/api";

interface FoodState {
  foods: Food[];
  filteredFoods: Food[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchFoods: () => Promise<void>;
  setFoods: (foods: Food[]) => void;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  filterFoods: () => void;
  sortFoods: (sortBy: string) => void;
  filterByTime: (maxTime: number | null) => void;
  filterByRating: (minRating: number | null) => void;
}

export const useFoodStore = create<FoodState>((set, get) => ({
  foods: [],
  filteredFoods: [],
  selectedCategory: null,
  searchQuery: "",
  isLoading: false,
  error: null,
  
  fetchFoods: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.FOODS}`, {
        headers: API_CONFIG.HEADERS,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: FoodApiResponse = await response.json();
      
      if (data.status === "success" && data.data) {
        // Filter to show only available foods
        const availableFoods = data.data.filter(food => food.status === "Available");
        set({ 
          foods: availableFoods, 
          filteredFoods: availableFoods,
          isLoading: false 
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching foods:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch foods",
        isLoading: false 
      });
    }
  },
  
  setFoods: (foods) => set({ foods, filteredFoods: foods }),
  
  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().filterFoods();
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterFoods();
  },
  
  filterFoods: () => {
    const { foods, selectedCategory, searchQuery } = get();
    
    let filtered = [...foods];
    
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter((food) => {
        const menuType = food.menuId?.menuType?.toLowerCase() || "";
        return menuType.includes(selectedCategory.toLowerCase());
      });
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (food) =>
          food.foodName.toLowerCase().includes(query) ||
          food.ingredients?.toLowerCase().includes(query) ||
          food.menuId?.menuType?.toLowerCase().includes(query)
      );
    }
    
    set({ filteredFoods: filtered });
  },
  
  sortFoods: (sortBy) => {
    const { filteredFoods } = get();
    let sorted = [...filteredFoods];

    switch (sortBy) {
      case "popular":
        sorted.sort((a, b) => (b.rating * 100) - (a.rating * 100));
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "time":
        sorted.sort((a, b) => a.cookingTimeMinutes - b.cookingTimeMinutes);
        break;
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    set({ filteredFoods: sorted });
  },

  filterByTime: (maxTime) => {
    if (!maxTime) {
      get().filterFoods();
      return;
    }

    set((state) => {
      let filtered = [...state.foods];
      
      if (state.selectedCategory && state.selectedCategory !== "All") {
        filtered = filtered.filter((food) => {
          const menuType = food.menuId?.menuType?.toLowerCase() || "";
          return menuType.includes(state.selectedCategory!.toLowerCase());
        });
      }
      
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (food) =>
            food.foodName.toLowerCase().includes(query) ||
            food.ingredients?.toLowerCase().includes(query) ||
            food.menuId?.menuType?.toLowerCase().includes(query)
        );
      }

      filtered = filtered.filter(food => food.cookingTimeMinutes <= maxTime);
      
      return { filteredFoods: filtered };
    });
  },

  filterByRating: (minRating) => {
    if (!minRating) {
      get().filterFoods();
      return;
    }

    set((state) => {
      let filtered = [...state.foods];
      
      if (state.selectedCategory && state.selectedCategory !== "All") {
        filtered = filtered.filter((food) => {
          const menuType = food.menuId?.menuType?.toLowerCase() || "";
          return menuType.includes(state.selectedCategory!.toLowerCase());
        });
      }
      
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (food) =>
            food.foodName.toLowerCase().includes(query) ||
            food.ingredients?.toLowerCase().includes(query) ||
            food.menuId?.menuType?.toLowerCase().includes(query)
        );
      }

      filtered = filtered.filter(food => food.rating >= minRating);
      
      return { filteredFoods: filtered };
    });
  },
}));

