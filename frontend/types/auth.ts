export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  followers?: number;
  following?: number;
  recipes?: number;
  reviews?: number;
  role?: UserRole;
  createdAt?: string;
  preferences?: UserPreferences;
  restaurantId?: string;
  restaurantName?: string;
  address?: string;
}

export type UserRole = 'Customer' | 'Manager' | 'Delivery_Person' | 'Admin';

export interface UserPreferences {
  darkMode?: boolean;
  notifications?: {
    orders?: boolean;
    promotions?: boolean;
    messages?: boolean;
  };
  dietaryRestrictions?: string[];
  favoriteCategories?: string[];
}

export interface CountryCode {
  name: string;
  code: string;
  flag: string;
  format?: string;
  minLength?: number;
  maxLength?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  phoneNumber: string | null;
  userRole: UserRole;
  generatedOtp: string | null;
  
  // Auth actions
  login: (credentials: string, password?: string, role?: UserRole) => Promise<string | undefined>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<string | undefined>;
  verifyOtp: (otp: string) => Promise<boolean>;
  resendOtp: () => Promise<string | undefined>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  
  // Social actions
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
}
