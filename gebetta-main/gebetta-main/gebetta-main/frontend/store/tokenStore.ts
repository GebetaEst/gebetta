import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TokenState {
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken?: string, expiry?: number) => void;
  clearTokens: () => void;
  getAuthHeaders: () => Record<string, string>;
  isTokenExpired: () => boolean;
  refreshAccessToken: () => Promise<boolean>;
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      isAuthenticated: false,

      setTokens: (accessToken: string, refreshToken?: string, expiry?: number) => {
        const tokenExpiry = expiry || Date.now() + (24 * 60 * 60 * 1000); // Default 24 hours
        set({
          accessToken,
          refreshToken: refreshToken || null,
          tokenExpiry,
          isAuthenticated: true,
        });
      },

      clearTokens: () => {
        set({
          accessToken: null,
          refreshToken: null,
          tokenExpiry: null,
          isAuthenticated: false,
        });
      },

      getAuthHeaders: () => {
        const { accessToken } = get();
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      },

      isTokenExpired: () => {
        const { tokenExpiry } = get();
        return tokenExpiry ? Date.now() > tokenExpiry : true;
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await fetch('https://gebeta-delivery1.onrender.com/api/v1/users/refresh-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (response.ok) {
            const data = await response.json();
            get().setTokens(data.accessToken, data.refreshToken, data.expiry);
            return true;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
        }

        // If refresh fails, clear tokens
        get().clearTokens();
        return false;
      },
    }),
    {
      name: 'token-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);


