import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthState, User, UserRole } from "@/types/auth";
import { API_CONFIG } from "@/constants/api";
import { authAPI } from "@/lib/api";

// Mock user data for demo purposes
const mockUsers: User[] = [
  {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+251911223344",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200",
    bio: "Food enthusiast and home chef",
    location: "Addis Ababa, Ethiopia",
    website: "https://johndoe.com",
    followers: 120,
    following: 85,
    recipes: 24,
    reviews: 36,
    role: "user",
    createdAt: "2023-01-15T12:00:00Z",
  },
  {
    id: "owner1",
    name: "Sarah Johnson",
    email: "sarah@habesharestaurant.com",
    phone: "+251911223355",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
    bio: "Restaurant owner and chef",
    location: "Addis Ababa",
    website: "https://habesharestaurant.com",
    followers: 250,
    following: 120,
    recipes: 45,
    reviews: 18,
    role: "owner",
    createdAt: "2022-11-10T10:30:00Z",
    restaurantId: "1",
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
      phoneNumber: null,
      userRole: "user",
      generatedOtp: null,
      
      login: async (phoneNumber: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Generate a 6-digit OTP
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          
          // Create a new user if they don't exist
          let user = mockUsers.find(u => u.phone.replace(/\D/g, "") === phoneNumber.replace(/\D/g, ""));
          
          if (!user) {
            user = {
              id: `user-${Date.now()}`,
              name: "New User",
              email: "",
              phone: phoneNumber,
              avatar: "",
              bio: "",
              location: "",
              website: "",
              followers: 0,
              following: 0,
              recipes: 0,
              reviews: 0,
              role: "user" as UserRole,
              createdAt: new Date().toISOString()
            };
            // Add the new user to the mock data
            mockUsers.push(user);
          }
          
          set({
            isLoading: false,
            token: "demo-token-" + Math.random().toString(36).substring(2),
            phoneNumber: phoneNumber,
            userRole: user.role || "user",
            generatedOtp: otp,
            isAuthenticated: true,
            user: user
          });
          
          // In a real app, you would send this OTP via SMS
          console.log("Generated OTP for", phoneNumber + ":", otp);
          return otp;
        } catch (error) {
          console.error("Login error:", error);
          set({ 
            isLoading: false, 
            error: "Failed to login. Please try again." 
          });
        }
      },
      
      verifyOtp: async (otp: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const generatedOtp = get().generatedOtp;
          const phoneNumber = get().phoneNumber;
          const userRole = get().userRole;
          
          // For demo purposes, check if OTP matches or if it's "123456"
          if (otp !== generatedOtp && otp !== "123456") {
            set({ 
              isLoading: false, 
              error: "Invalid OTP. Please enter a valid 6-digit code." 
            });
            return false;
          }
          
          // Find a user based on the phone number
          const user = mockUsers.find(u => 
            u.phone.replace(/\D/g, "") === (phoneNumber || "").replace(/\D/g, "")
          );
          
          // If no user found, create a mock user
          const authenticatedUser: User = user || {
            id: "user-" + Math.random().toString(36).substring(2),
            name: "Demo User",
            email: "demo@example.com",
            phone: phoneNumber || "",
            avatar: "https://ui-avatars.com/api/?name=Demo+User&background=random",
            role: userRole,
            createdAt: new Date().toISOString(),
          };
          
          set({
            user: authenticatedUser,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return true;
        } catch (error) {
          console.error("OTP verification error:", error);
          set({ 
            isLoading: false, 
            error: "Failed to verify OTP. Please try again." 
          });
          return false;
        }
      },
      
      resendOtp: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const phoneNumber = get().phoneNumber;
          
          if (!phoneNumber) {
            set({ 
              isLoading: false, 
              error: "Phone number not found. Please try logging in again." 
            });
            return;
          }
          
          // Generate a new 6-digit OTP for demo purposes
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          
          set({
            isLoading: false,
            generatedOtp: otp, // Store the new OTP
          });
          
          console.log("Resent OTP:", otp);
          return otp;
        } catch (error) {
          console.error("Resend OTP error:", error);
          set({ 
            isLoading: false, 
            error: "Failed to resend OTP. Please try again." 
          });
        }
      },
      
      register: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Check if user with this phone already exists
          const phone = userData.phone || "";
          const existingUser = mockUsers.find(u => 
            u.phone.replace(/\D/g, "") === phone.replace(/\D/g, "")
          );
          
          if (existingUser) {
            set({ 
              isLoading: false, 
              error: "An account with this phone number already exists." 
            });
            return;
          }
          
          // Generate a 6-digit OTP for demo purposes
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          
          set({
            isLoading: false,
            token: "demo-token-" + Math.random().toString(36).substring(2),
            phoneNumber: phone,
            userRole: userData.role || "user",
            generatedOtp: otp, // Store the OTP for demo purposes
          });
          
          console.log("Generated OTP for registration:", otp);
          return otp;
        } catch (error) {
          console.error("Registration error:", error);
          set({ 
            isLoading: false, 
            error: "Failed to register. Please try again." 
          });
        }
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          phoneNumber: null,
          userRole: "user",
          generatedOtp: null,
        });
      },
      
      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const currentUser = get().user;
          if (!currentUser) {
            set({ 
              isLoading: false, 
              error: "Not logged in" 
            });
            return;
          }
          
          // Update user data
          const updatedUser = {
            ...currentUser,
            ...userData,
          };
          
          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error) {
          console.error("Profile update error:", error);
          set({ 
            isLoading: false, 
            error: "Failed to update profile. Please try again." 
          });
        }
      },
      
      followUser: async (userId) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update following count
          set({
            user: {
              ...currentUser,
              following: (currentUser.following || 0) + 1,
            },
          });
        } catch (error) {
          console.error("Follow user error:", error);
        }
      },
      
      unfollowUser: async (userId) => {
        const currentUser = get().user;
        if (!currentUser || !(currentUser.following && currentUser.following > 0)) return;
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update following count
          set({
            user: {
              ...currentUser,
              following: currentUser.following - 1,
            },
          });
        } catch (error) {
          console.error("Unfollow user error:", error);
        }
      },
      
      isFollowing: (userId) => {
        // In a real app, this would check if the current user is following the specified user
        // For demo purposes, return a random boolean
        return Math.random() > 0.5;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
