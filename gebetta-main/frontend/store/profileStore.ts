import { User } from "@/types/auth";
import { PaymentMethod } from "@/types/restaurant";
import { AddressType } from "@/types/address";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "./useAuthStore";

export interface ProfileState {
  profiles: User[];
  followers: User[];
  following: User[];
  addresses: AddressType[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  
  // Profile actions
  fetchProfile: (userId: string) => Promise<User | null>;
  fetchFollowers: (userId: string) => Promise<User[]>;
  fetchFollowing: (userId: string) => Promise<User[]>;
  
  // Social actions
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;

  // Address actions
  fetchAddresses: (token: string) => Promise<AddressType[]>;
  addAddress: (address: { name: string; label: string; additionalInfo?: string; isDefault?: boolean; coordinates: { lat: number; lng: number } }, token: string) => Promise<void>;
  editAddress: (id: string, updates: { name?: string; label?: string; additionalInfo?: string; coordinates?: { lat: number; lng: number }; isDefault?: boolean }, token: string) => Promise<void>;
  removeAddress: (id: string, token: string) => Promise<void>;
  setDefaultAddress: (id: string, token: string) => Promise<void>;
  addCurrentLocation: (address: { label: string; additionalInfo?: string; isDefault?: boolean; coordinates: { lat: number; lng: number } }, token: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      followers: [],
      following: [],
      addresses: [],
      paymentMethods: [],
      isLoading: false,
      error: null,
      
      fetchAddresses: async (token: string) => {
        set({ isLoading: true, error: null });
        
        try {
          if (!token) {
            console.error('❌ No token provided to fetchAddresses');
            throw new Error('Authentication required');
          }
        
          
          const response = await authAPI.getMyAddresses(token);
          
          console.log('📍 Addresses API response:', {
            // status: response?.status,
            // addressCount: response?.addresses?.length || 0,
            hasData: !!response?.addresses
          });
          
          if (response?.status === 'success' && response.addresses) {
            // Transform API addresses to match our AddressType
            const addresses: AddressType[] = response.addresses.map((addr: any) => {
              console.log('📍 Processing address:', { 
                id: addr._id || addr.id,
                label: addr.label,
                name: addr.name
              });
              
              const address: AddressType = {
                id: addr._id || addr.id,
                name: addr.name || '',
                label: addr.label || 'Other',
                additionalInfo: addr.additionalInfo || '',
                isDefault: addr.isDefault || false,
                coordinates: addr.coordinates ? {
                  lat: addr.coordinates.lat,
                  lng: addr.coordinates.lng
                } : undefined,
                createdAt: addr.createdAt || new Date().toISOString(),
                updatedAt: addr.updatedAt || new Date().toISOString(),
                
                // Legacy fields for backward compatibility with existing UI
                street: addr.name || addr.label || 'Address not specified',
                city: addr.additionalInfo || 'City not specified',
                customLabel: addr.label === 'home' || addr.label === 'work' ? undefined : addr.label,
                note: addr.additionalInfo || '',
              };
              
              return address;
            });
            
            console.log(`✅ Successfully loaded ${addresses.length} addresses`);
            set({ addresses, isLoading: false });
            return addresses;
            
          } else if (response?.status === 'success' && (!response.addresses || response.addresses.length === 0)) {
            // Successfully got response but no addresses
            console.log('ℹ️ No addresses found - user has no saved addresses');
            set({ addresses: [], isLoading: false });
            return [];
            
          } else {
            console.error('❌ Invalid response format:', response);
            throw new Error('Invalid response format from server');
          }
          
        } catch (error: any) {
          console.error('❌ Error in fetchAddresses:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          
          // If unauthorized, clear the auth state
          if (error.response?.status === 401) {
            console.log('⚠️ Unauthorized - clearing auth state');
            useAuthStore.getState().logout();
          }
          
          const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch addresses";
          console.error('📍 Error fetching addresses:', errorMessage);
          
          set({ 
            isLoading: false, 
            error: errorMessage
          });
          
          // Don't clear existing addresses on error
          throw error;
        }
      },
      
      removeAddress: async (id: string, token: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('📍 Removing address:', id);
          await authAPI.deleteAddress(id, token);
          
          set(state => ({
            addresses: state.addresses.filter(address => address.id !== id),
            isLoading: false,
          }));
          console.log('📍 Successfully removed address');
        } catch (error: any) {
          console.error('📍 Error removing address:', error);
          set({
            isLoading: false,
            error: error?.response?.data?.message || error?.message || "Failed to remove address"
          });
          throw error;
        }
      },
      
      setDefaultAddress: async (id: string, token: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('📍 Setting default address:', id);
          await authAPI.setDefaultAddress(id, token);
          
          set(state => ({
            addresses: state.addresses.map(address =>
              address.id === id ? { ...address, isDefault: true } : { ...address, isDefault: false }
            ),
            isLoading: false,
          }));
          console.log('📍 Successfully set default address');
        } catch (error: any) {
          console.error('📍 Error setting default address:', error);
          set({
            isLoading: false,
            error: error?.response?.data?.message || error?.message || "Failed to set default address"
          });
          throw error;
        }
      },
      
      addAddress: async (addressData: { name: string; label: string; additionalInfo?: string; isDefault?: boolean; coordinates: { lat: number; lng: number } }, token: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('📍 Adding new address:', addressData);
          const response = await authAPI.addAddress(addressData, token);
          
          // Refresh addresses from server to get the latest data
          await get().fetchAddresses(token);
          console.log('📍 Successfully added address');
        } catch (error: any) {
          console.error('📍 Error adding address:', error);
          set({
            isLoading: false,
            error: error?.response?.data?.message || error?.message || "Failed to add address"
          });
          throw error;
        }
      },
      
      editAddress: async (id: string, updates: { name?: string; label?: string; additionalInfo?: string; coordinates?: { lat: number; lng: number }; isDefault?: boolean }, token: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('📍 Editing address:', id, updates);
          const response = await authAPI.editAddress(id, updates, token);
          
          // Refresh addresses from server to get the latest data
          await get().fetchAddresses(token);
          console.log('📍 Successfully edited address');
        } catch (error: any) {
          console.error('📍 Error editing address:', error);
          set({
            isLoading: false,
            error: error?.response?.data?.message || error?.message || "Failed to edit address"
          });
          throw error;
        }
      },

      addCurrentLocation: async (addressData: { label: string; additionalInfo?: string; isDefault?: boolean; coordinates: { lat: number; lng: number } }, token: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('📍 Adding current location as address:', addressData);
          const response = await authAPI.addCurrentLocation(addressData, token);
          
          // Refresh addresses from server to get the latest data
          await get().fetchAddresses(token);
          console.log('📍 Successfully added current location as address');
        } catch (error: any) {
          console.error('📍 Error adding current location as address:', error);
          set({
            isLoading: false,
            error: error?.response?.data?.message || error?.message || "Failed to add current location as address"
          });
          throw error;
        }
      },
      
      fetchProfile: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if profile is already in state
          const existingProfile = get().profiles.find(p => p.id === userId);
          if (existingProfile) {
            set({ isLoading: false });
            return existingProfile;
          }
          
          // Mock profile data
          const profile: User = {
            id: userId,
            name: "User " + userId.substring(0, 4),
            email: `user${userId.substring(0, 4)}@example.com`,
            phone: "+1 (555) 123-4567",
            avatar: `https://ui-avatars.com/api/?name=User+${userId.substring(0, 4)}&background=random`,
            bio: "Food enthusiast and home chef",
            location: "New York, NY",
            followers: Math.floor(Math.random() * 500),
            following: Math.floor(Math.random() * 300),
            recipes: Math.floor(Math.random() * 50),
            reviews: Math.floor(Math.random() * 100),
            role: "Customer",
            createdAt: new Date().toISOString(),
          };
          
          // Update state
          set(state => ({
            profiles: [...state.profiles, profile],
            isLoading: false,
          }));
          
          return profile;
        } catch (error) {
          console.error("Error fetching profile:", error);
          set({ 
            isLoading: false, 
            error: "Failed to fetch profile. Please try again." 
          });
          return null;
        }
      },
      
      fetchFollowers: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate mock followers
          const count = Math.floor(Math.random() * 20) + 5;
          const followers: User[] = Array.from({ length: count }, (_, i) => ({
            id: `follower-${i}-${Math.random().toString(36).substring(2, 7)}`,
            name: `Follower ${i + 1}`,
            email: `follower${i + 1}@example.com`,
            phone: "+1 (555) 123-4567",
            avatar: `https://ui-avatars.com/api/?name=Follower+${i + 1}&background=random`,
            bio: "Food lover",
            location: "Various locations",
            followers: Math.floor(Math.random() * 200),
            following: Math.floor(Math.random() * 150),
            recipes: Math.floor(Math.random() * 20),
            reviews: Math.floor(Math.random() * 40),
            role: "Customer",
            createdAt: new Date().toISOString(),
          }));
          
          set({ followers, isLoading: false });
          return followers;
        } catch (error) {
          console.error("Error fetching followers:", error);
          set({ 
            isLoading: false, 
            error: "Failed to fetch followers. Please try again." 
          });
          return [];
        }
      },
      
      fetchFollowing: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate mock following
          const count = Math.floor(Math.random() * 15) + 3;
          const following: User[] = Array.from({ length: count }, (_, i) => ({
            id: `following-${i}-${Math.random().toString(36).substring(2, 7)}`,
            name: `Following ${i + 1}`,
            email: `following${i + 1}@example.com`,
            phone: "+1 (555) 123-4567",
            avatar: `https://ui-avatars.com/api/?name=Following+${i + 1}&background=random`,
            bio: "Chef and food blogger",
            location: "Various locations",
            followers: Math.floor(Math.random() * 300),
            following: Math.floor(Math.random() * 200),
            recipes: Math.floor(Math.random() * 30),
            reviews: Math.floor(Math.random() * 50),
            role: "Customer",
            createdAt: new Date().toISOString(),
          }));
          
          set({ following, isLoading: false });
          return following;
        } catch (error) {
          console.error("Error fetching following:", error);
          set({ 
            isLoading: false, 
            error: "Failed to fetch following. Please try again." 
          });
          return [];
        }
      },
      
      followUser: async (userId: string) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update following list
          set(state => ({
            following: [
              ...state.following,
              {
                id: userId,
                name: `User ${userId.substring(0, 4)}`,
                email: `user${userId.substring(0, 4)}@example.com`,
                phone: "+1 (555) 123-4567",
                avatar: `https://ui-avatars.com/api/?name=User+${userId.substring(0, 4)}&background=random`,
                role: "Customer",
                createdAt: new Date().toISOString(),
              },
            ],
          }));
        } catch (error) {
          console.error("Error following user:", error);
        }
      },
      
      unfollowUser: async (userId: string) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update following list
          set(state => ({
            following: state.following.filter(user => user.id !== userId),
          }));
        } catch (error) {
          console.error("Error unfollowing user:", error);
        }
      },
      
      isFollowing: (userId: string) => {
        return get().following.some(user => user.id === userId);
      },
    }),
    {
      name: "profile-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )

);
