import { MenuItem, Restaurant, Review } from "@/types/restaurant";
import { mockRestaurants } from "@/mocks/restaurants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { v4 as uuidv4 } from 'uuid';

export interface RestaurantState {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  isLoading: boolean;
  error: string | null;
  
  // Restaurant actions
  fetchRestaurants: () => Promise<Restaurant[]>;
  fetchRestaurant: (id: string) => Promise<Restaurant | null>;
  fetchOwnerRestaurants: (ownerId: string) => Promise<Restaurant[]>;
  createRestaurant: (restaurantData: Partial<Restaurant>) => Promise<Restaurant | null>;
  updateRestaurant: (id: string, restaurantData: Partial<Restaurant>) => Promise<Restaurant | null>;
  
  // Menu actions
  addMenuItem: (restaurantId: string, menuItemData: Partial<MenuItem>) => Promise<MenuItem | null>;
  updateMenuItem: (restaurantId: string, itemId: string, menuItemData: Partial<MenuItem>) => Promise<MenuItem | null>;
  deleteMenuItem: (restaurantId: string, itemId: string) => Promise<boolean>;
  
  // Review actions
  addReview: (restaurantId: string, reviewData: Partial<Review>) => Promise<Review | null>;
}

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set, get) => ({
      restaurants: [],
      currentRestaurant: null,
      isLoading: false,
      error: null,
      
      fetchRestaurants: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Use mock data instead of API call
          set({ restaurants: mockRestaurants, isLoading: false });
          return mockRestaurants;
        } catch (error) {
          console.error("Error fetching restaurants:", error);
          set({ 
            isLoading: false, 
            error: "Failed to fetch restaurants. Please try again." 
          });
          return [];
        }
      },
      
      fetchRestaurant: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Check if restaurant is already in state
          const existingRestaurant = get().restaurants.find(r => r.id === id);
          
          if (existingRestaurant) {
            set({ currentRestaurant: existingRestaurant, isLoading: false });
            return existingRestaurant;
          }
          
          // Find restaurant in mock data
          const restaurant = mockRestaurants.find(r => r.id === id) || null;
          
          if (restaurant) {
            set({ 
              currentRestaurant: restaurant,
              restaurants: [...get().restaurants.filter(r => r.id !== id), restaurant],
              isLoading: false 
            });
            return restaurant;
          }
          
          set({ 
            isLoading: false, 
            error: "Restaurant not found." 
          });
          return null;
        } catch (error) {
          console.error("Error fetching restaurant:", error);
          set({ 
            isLoading: false, 
            error: "Failed to fetch restaurant. Please try again." 
          });
          return null;
        }
      },
      
      fetchOwnerRestaurants: async (ownerId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // For demo purposes, return all restaurants as owner's restaurants
          set({ restaurants: mockRestaurants, isLoading: false });
          return mockRestaurants;
        } catch (error) {
          console.error("Error fetching owner restaurants:", error);
          set({ 
            isLoading: false, 
            error: "Failed to fetch your restaurants." 
          });
          return [];
        }
      },
      
      createRestaurant: async (restaurantData: Partial<Restaurant>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Create a new restaurant with mock data
          const now = new Date().toISOString();
          const newRestaurant: Restaurant = {
            id: uuidv4(),
            _id: uuidv4(), // MongoDB identifier
            ownerId: restaurantData.ownerId || 'mock-owner-id',
            name: restaurantData.name || 'New Restaurant',
            slug: restaurantData.name ? restaurantData.name.toLowerCase().replace(/\s+/g, '-') : 'new-restaurant',
            createdAt: now,
            updatedAt: now,
            description: restaurantData.description || 'A new Ethiopian restaurant',
            address: restaurantData.address || '123 New St, Addis Ababa',
            cuisine: restaurantData.cuisine || 'Ethiopian',
            priceLevel: '$$',
            rating: 0,
            reviewCount: 0,
            imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500',
            coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500',
            isOpen: true,
            distance: '1.0 km',
            categories: ['Ethiopian'],
            menu: [],
            location: {
              latitude: 9.025,
              longitude: 38.75
            },
            phone: '+251 11 000 0000',
            website: '',
            deliveryRadiusMeters: 5000, // 5km default delivery radius
            license: 'mock-license-123',
            cuisineTypes: ['Ethiopian'],
            imageCover: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500',
            ratingAverage: 0,
            ratingQuantity: 0,
            openHours: '9:00 AM - 10:00 PM',
            isDeliveryAvailable: true,
            isOpenNow: true,
            active: true,
            openingHours: {
              'Monday': { open: '9:00 AM', close: '10:00 PM' },
              'Tuesday': { open: '9:00 AM', close: '10:00 PM' },
              'Wednesday': { open: '9:00 AM', close: '10:00 PM' },
              'Thursday': { open: '9:00 AM', close: '10:00 PM' },
              'Friday': { open: '9:00 AM', close: '11:00 PM' },
              'Saturday': { open: '10:00 AM', close: '11:00 PM' },
              'Sunday': { open: '10:00 AM', close: '9:00 PM' }
            },
            deliveryFee: 2.99,
            estimatedDeliveryTime: '30-45 min',
            ...restaurantData
          };
          
          // In a real app, you would add this to your mock data array
          // mockRestaurants.push(newRestaurant);
          
          set(state => ({
            restaurants: [...state.restaurants, newRestaurant],
            currentRestaurant: newRestaurant,
            isLoading: false
          }));
          
          return newRestaurant;
        } catch (error) {
          console.error("Error creating restaurant:", error);
          set({ 
            isLoading: false, 
            error: "Failed to create restaurant." 
          });
          return null;
        }
      },
      
      updateRestaurant: async (id: string, restaurantData: Partial<Restaurant>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Find the restaurant to update
          const restaurantIndex = mockRestaurants.findIndex(r => r.id === id);
          
          if (restaurantIndex === -1) {
            set({ 
              isLoading: false, 
              error: "Restaurant not found." 
            });
            return null;
          }
          
          // Create updated restaurant object
          const updatedRestaurant = {
            ...mockRestaurants[restaurantIndex],
            ...restaurantData,
            id // Ensure ID doesn't change
          };
          
          // Update the store state
          set(state => ({
            restaurants: state.restaurants.map(r => 
              r.id === id ? updatedRestaurant : r
            ),
            currentRestaurant: state.currentRestaurant?.id === id 
              ? updatedRestaurant
              : state.currentRestaurant,
            isLoading: false
          }));
          
          return updatedRestaurant;
        } catch (error) {
          console.error("Error updating restaurant:", error);
          set({ 
            isLoading: false, 
            error: "Failed to update restaurant." 
          });
          return null;
        }
      },
      
      addMenuItem: async (restaurantId: string, menuItemData: Partial<MenuItem>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Create a new menu item with mock data
          const now = new Date().toISOString();
          const newMenuItem: MenuItem = {
            id: uuidv4(),
            restaurantId: restaurantId, // Ensure restaurantId is set
            name: menuItemData.name || 'New Item',
            description: menuItemData.description || '',
            price: menuItemData.price || 0,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=500',
            category: menuItemData.category || 'Main Dishes',
            popular: menuItemData.popular || false,
            spicy: menuItemData.spicy || false,
            isAvailable: true,
            preparationTime: 20,
            ingredients: [],
            createdAt: now,
            updatedAt: now,
            ...menuItemData
          };
          
          // Update the store state
          set(state => {
            const updateRestaurantMenu = (restaurant: Restaurant) => ({
              ...restaurant,
              menu: [...(restaurant.menu || []), newMenuItem]
            });
            
            return {
              restaurants: state.restaurants.map(restaurant => 
                restaurant.id === restaurantId 
                  ? updateRestaurantMenu(restaurant) 
                  : restaurant
              ),
              currentRestaurant: state.currentRestaurant?.id === restaurantId
                ? updateRestaurantMenu(state.currentRestaurant)
                : state.currentRestaurant,
              isLoading: false
            };
          });
          
          return newMenuItem;
        } catch (error) {
          console.error("Error adding menu item:", error);
          set({ 
            isLoading: false, 
            error: "Failed to add menu item." 
          });
          return null;
        }
      },
      
      updateMenuItem: async (restaurantId: string, itemId: string, menuItemData: Partial<MenuItem>) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would call an API to update the menu item
          // For demo purposes, we'll update it locally
          
          const currentRestaurant = get().currentRestaurant;
          
          if (!currentRestaurant || currentRestaurant.id !== restaurantId) {
            set({ 
              isLoading: false, 
              error: "Restaurant not found." 
            });
            return null;
          }
          
          // Find the menu item
          const menuItem = currentRestaurant.menu?.find(item => item.id === itemId);
          
          if (!menuItem) {
            set({ 
              isLoading: false, 
              error: "Menu item not found." 
            });
            return null;
          }
          
          // Update the menu item
          const updatedMenuItem = {
            ...menuItem,
            ...menuItemData,
            updatedAt: new Date().toISOString(),
          };
          
          // Update the restaurant
          const updatedRestaurant = {
            ...currentRestaurant,
            menu: currentRestaurant.menu?.map(item => item.id === itemId ? updatedMenuItem : item),
            updatedAt: new Date().toISOString(),
          };
          
          // Update state
          set({ 
            currentRestaurant: updatedRestaurant,
            isLoading: false 
          });
          
          return updatedMenuItem;
        } catch (error) {
          console.error("Error updating menu item:", error);
          set({ 
            isLoading: false, 
            error: "Failed to update menu item. Please try again." 
          });
          return null;
        }
      },
      
      deleteMenuItem: async (restaurantId: string, itemId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would call an API to delete the menu item
          // For demo purposes, we'll delete it locally
          
          const currentRestaurant = get().currentRestaurant;
          
          if (!currentRestaurant || currentRestaurant.id !== restaurantId) {
            set({ 
              isLoading: false, 
              error: "Restaurant not found." 
            });
            return false;
          }
          
          // Update the restaurant
          const updatedRestaurant = {
            ...currentRestaurant,
            menu: currentRestaurant.menu?.filter(item => item.id !== itemId),
            updatedAt: new Date().toISOString(),
          };
          
          // Update state
          set({ 
            currentRestaurant: updatedRestaurant,
            isLoading: false 
          });
          
          return true;
        } catch (error) {
          console.error("Error deleting menu item:", error);
          set({ 
            isLoading: false, 
            error: "Failed to delete menu item. Please try again." 
          });
          return false;
        }
      },
      
      addReview: async (restaurantId: string, reviewData: Partial<Review>) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would call an API to add the review
          // For demo purposes, we'll add it locally
          
          const currentRestaurant = get().currentRestaurant;
          const restaurants = get().restaurants;
          
          if (!currentRestaurant || currentRestaurant.id !== restaurantId) {
            set({ 
              isLoading: false, 
              error: "Restaurant not found." 
            });
            return null;
          }
          
          // Create the review
          const newReview: Review = {
            id: `review-${Math.random().toString(36).substring(2, 9)}`,
            ...reviewData,
            restaurantId,
            createdAt: new Date().toISOString(),
          } as Review;
          
          // Calculate new rating
          const currentRating = currentRestaurant.rating || 0;
          const currentCount = currentRestaurant.reviewCount || 0;
          const newRating = reviewData.rating 
            ? ((currentRating * currentCount) + reviewData.rating) / (currentCount + 1)
            : currentRating;
          
          // Update the restaurant
          const updatedRestaurant = {
            ...currentRestaurant,
            reviews: [...(currentRestaurant.reviews || []), newReview],
            rating: newRating,
            reviewCount: currentCount + 1,
            updatedAt: new Date().toISOString(),
          };
          
          // Update state
          set({ 
            currentRestaurant: updatedRestaurant,
            restaurants: restaurants.map(r => r.id === restaurantId ? updatedRestaurant : r),
            isLoading: false 
          });
          
          return newReview;
        } catch (error) {
          console.error("Error adding review:", error);
          set({ 
            isLoading: false, 
            error: "Failed to add review. Please try again." 
          });
          return null;
        }
      },
    }),
    {
      name: "restaurant-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
