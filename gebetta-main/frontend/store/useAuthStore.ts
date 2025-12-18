import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '@/lib/api';

export interface Address {
  _id?: string;
  Name?: string;
  label: 'Home' | 'Work' | 'Other';
  additionalInfo?: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  profilePicture: string;
  role: 'Customer' | 'Manager' | 'Delivery_Person' | 'Admin';
  isPhoneVerified: boolean;
  addresses: Address[];
  token: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => Promise<void>;
  login: (userData: { user: User; token: string }) => Promise<User>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  updateProfile: (userData: { firstName: string; lastName: string; avatar?: string }) => Promise<void>;
  debugAuthState: () => Promise<{
    hasUser: boolean;
    hasToken: boolean;
    error?: any;
  }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: async (user) => {
    if (user) {
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
      await SecureStore.setItemAsync('userToken', user.token);
      set({ user, isAuthenticated: true, isLoading: false });
    } else {
      await SecureStore.deleteItemAsync('userInfo');
      await SecureStore.deleteItemAsync('userToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async ({ user, token }) => {
    try {
      // Ensure token is included in user data
      const userData = {
        ...user,
        token
      };

      // Store in both SecureStore and state
      await SecureStore.setItemAsync('userInfo', JSON.stringify(userData));
      await SecureStore.setItemAsync('userToken', token);

      // console.log('✅ Login successful - user data stored:', {
      //   hasUser: !!userData,
      //   hasToken: !!token,
      //   userId: userData._id
      // });

      set({
        user: userData,
        isAuthenticated: true,
        error: null
      });

      return userData;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('userInfo');
    await SecureStore.deleteItemAsync('userToken');
    set({ user: null, isAuthenticated: false });
  },

  initializeAuth: async () => {
    try {
      const [userJson, token] = await Promise.all([
        SecureStore.getItemAsync('userInfo'),
        SecureStore.getItemAsync('userToken')
      ]);

      // console.log('🔄 Initializing auth state...', {
      //   hasUserData: !!userJson,
      //   hasToken: !!token
      // });

      if (userJson && token) {
        const user = JSON.parse(userJson);

        // Ensure token is in the user object
        if (!user.token && token) {
          user.token = token;
          // Update stored user info with token
          await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
        }

        // console.log('✅ Auth initialized with user:', {
        //   userId: user._id,
        //   hasToken: !!user.token
        // });

        set({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        // console.log('ℹ️ No valid auth data found');
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      // console.error('❌ Error initializing auth:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  clearError: () => set({ error: null }),

  updateProfile: async (userData) => {
    try {
      // Don't set global loading state to prevent UI disruption
      set({ error: null });

      const currentUser = useAuthStore.getState().user;

      if (!currentUser || !currentUser.token) {
        throw new Error("Not authenticated");
      }

      // Prepare profile data for API
      const profileData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        profilePicture: userData.avatar !== currentUser.profilePicture ? userData.avatar : undefined,
      };

      // Call the real API
      const response = await authAPI.updateProfile(profileData, currentUser.token);

      // Update user data with API response
      const updatedUser = {
        ...currentUser,
        firstName: response.user?.firstName || userData.firstName,
        lastName: response.user?.lastName || userData.lastName,
        profilePicture: response.user?.profilePicture || userData.avatar || currentUser.profilePicture,
      };

      // Save updated user to secure store
      await SecureStore.setItemAsync('userInfo', JSON.stringify(updatedUser));

      // Update user without changing global loading state
      set({
        user: updatedUser,
      });

    } catch (error: any) {
      // console.error("Profile update error:", error);
      set({
        error: error?.response?.data?.message || error?.message || "Failed to update profile"
      });
      throw error;
    }
  },

  // Debug function to log stored auth data
  debugAuthState: async () => {
    try {
      const [userJson, token] = await Promise.all([
        SecureStore.getItemAsync('userInfo'),
        SecureStore.getItemAsync('userToken')
      ]);

      // console.log('Debug Auth State:', {
      //   hasUserJson: !!userJson,
      //   hasToken: !!token,
      //   userJson: userJson ? 'exists' : 'null',
      //   token: token ? 'exists' : 'null'
      // });

      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          // console.log('Stored User Data:', {
          //   id: user?._id,
          //   email: user?.email,
          //   role: user?.role
          // });
        } catch (e) {
          // console.error('Error parsing stored user data:', e);
        }
      }

      return { hasUser: !!userJson, hasToken: !!token };
    } catch (error) {
      // console.error('Error debugging auth state:', error);
      return { hasUser: false, hasToken: false, error };
    }
  },
}));

// Initialize auth state when the app starts
useAuthStore.getState().initializeAuth();
