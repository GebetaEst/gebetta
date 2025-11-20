export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard" | string; // Allow string for backward compatibility
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  region?: string;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  isFavorite?: boolean; // Alias for isSaved
  rating: number;
  ratingCount: number;
  comments: Comment[];
  restaurantId: string;
  updatedAt: string;
  creditTo?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface Step {
  id: string;
  description: string;
  imageUrl?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  likes?: number;
  replies?: Comment[];
}

export interface RecipeCategory {
  id: string;
  name: string;
  imageUrl: string;
}

export interface RecipeRegion {
  id: string;
  name: string;
  imageUrl: string;
}
