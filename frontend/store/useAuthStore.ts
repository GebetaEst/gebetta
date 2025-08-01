import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

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
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => Promise<void>;
  login: (userData: { user: User; token: string }) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
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
    const userData = { ...user, token };
    await SecureStore.setItemAsync('userInfo', JSON.stringify(userData));
    await SecureStore.setItemAsync('userToken', token);
    set({ user: userData, isAuthenticated: true, error: null });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('userInfo');
    await SecureStore.deleteItemAsync('userToken');
    set({ user: null, isAuthenticated: false });
  },

  initializeAuth: async () => {
    try {
      const userJson = await SecureStore.getItemAsync('userInfo');
      const token = await SecureStore.getItemAsync('userToken');
      
      if (userJson && token) {
        const user = JSON.parse(userJson);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  
  // Debug function to log stored auth data
  debugAuthState: async () => {
    try {
      const [userJson, token] = await Promise.all([
        SecureStore.getItemAsync('userInfo'),
        SecureStore.getItemAsync('userToken')
      ]);
      
      console.log('Debug Auth State:', {
        hasUserJson: !!userJson,
        hasToken: !!token,
        userJson: userJson ? 'exists' : 'null',
        token: token ? 'exists' : 'null'
      });
      
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          console.log('Stored User Data:', {
            id: user?._id,
            email: user?.email,
            role: user?.role
          });
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }
      
      return { hasUser: !!userJson, hasToken: !!token };
    } catch (error) {
      console.error('Error debugging auth state:', error);
      return { hasUser: false, hasToken: false, error };
    }
  },
}));

// Initialize auth state when the app starts
useAuthStore.getState().initializeAuth();
