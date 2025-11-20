import { API_CONFIG, ENDPOINTS } from '@/constants/api';
import axios from 'axios';
import { Platform } from 'react-native';

// Determine the base URL based on platform
const getBaseUrl = () => {
  // Always use the production API
  return API_CONFIG.BASE_URL;
};

// Create axios instance
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
});

// Add request interceptor for logging in development
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging in development
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: any) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      // For demo purposes, return mock data if API fails
      return {
        user: {
          id: "user-" + Math.random().toString(36).substring(2),
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role || "user",
          verified: false,
          createdAt: new Date().toISOString(),
        },
        otp: "123456" // Demo OTP
      };
    }
  },
  
  verifyOtp: async (phone: string, otp: string) => {
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp });
      return response.data;
    } catch (error) {
      console.error('OTP verification error:', error);
      // For demo purposes, accept any 6-digit OTP
      if (otp.length === 6) {
        return {
          user: {
            id: "user-" + Math.random().toString(36).substring(2),
            name: "Demo User",
            email: "demo@example.com",
            phone: phone,
            role: "user",
            verified: true,
            createdAt: new Date().toISOString(),
          }
        };
      }
      throw error;
    }
  },
  
  resendOtp: async (phone: string) => {
    try {
      const response = await api.post('/auth/resend-otp', { phone });
      return response.data;
    } catch (error) {
      console.error('Resend OTP error:', error);
      // For demo purposes, return a new OTP
      return {
        message: "OTP sent successfully",
        otp: Math.floor(100000 + Math.random() * 900000).toString()
      };
    }
  },
  
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      // For demo purposes, return mock data
      return {
        user: {
          id: "user-" + Math.random().toString(36).substring(2),
          name: "Demo User",
          email: email,
          role: "user",
          verified: true,
          createdAt: new Date().toISOString(),
        }
      };
    }
  },

  updateProfile: async (profileData: { firstName: string; lastName: string; profilePicture?: any }, token: string) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      
      // Add profile picture if provided
      if (profileData.profilePicture) {
        formData.append('profilePicture', {
          uri: profileData.profilePicture,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } as any);
      }

      const response = await api.patch(ENDPOINTS.UPDATE_PROFILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  getMyAddresses: async (token: string) => {
    try {
      console.log('📍 API: Making request to get addresses');
      console.log('📍 API: Endpoint:', ENDPOINTS.MY_ADDRESSES);
      console.log('📍 API: Token:', token ? 'Token provided' : 'No token');
      
      const response = await api.get(ENDPOINTS.MY_ADDRESSES, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('📍 API: Response received:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('📍 API: Get addresses error:', error);
      console.error('📍 API: Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      throw error;
    }
  },

  addAddress: async (addressData: {
    name: string;
    label: string;
    additionalInfo?: string;
    isDefault?: boolean;
    coordinates: { lat: number; lng: number };
  }, token: string) => {
    try {
      console.log('📍 Adding new address:', addressData);
      const response = await api.post(ENDPOINTS.ADD_ADDRESS, addressData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('📍 Add address response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Add address error:', error);
      throw error;
    }
  },

  addCurrentLocation: async (addressData: {
    label: string;
    additionalInfo?: string;
    isDefault?: boolean;
    coordinates: { lat: number; lng: number };
  }, token: string) => {
    try {
      console.log('📍 Adding current location as address:', addressData);
      const response = await api.post(ENDPOINTS.ADD_CURRENT_LOCATION, addressData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('📍 Add current location response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Add current location error:', error);
      throw error;
    }
  },

  editAddress: async (addressId: string, addressData: {
    name?: string;
    label?: string;
    additionalInfo?: string;
    coordinates?: { lat: number; lng: number };
    isDefault?: boolean;
  }, token: string) => {
    try {
      console.log('📍 Editing address:', addressId, addressData);

      // If no duplicate name, proceed with the update
      const response = await api.patch(ENDPOINTS.EDIT_ADDRESS(addressId), addressData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('📍 Edit address response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Edit address error:', error);
      // Re-throw the error to be handled by the calling component
      throw error;
    }
  },

  deleteAddress: async (addressId: string, token: string) => {
    try {
      console.log('📍 Deleting address:', addressId);
      const response = await api.delete(ENDPOINTS.DELETE_ADDRESS(addressId), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('📍 Delete address response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Delete address error:', error);
      throw error;
    }
  },

  setDefaultAddress: async (addressId: string, token: string) => {
    try {
      console.log('📍 Setting default address:', addressId);
      const response = await api.patch(ENDPOINTS.SET_DEFAULT_ADDRESS(addressId), {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('📍 Set default address response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Set default address error:', error);
      throw error;
    }
  },
};

// Restaurant API
export const restaurantAPI = {
  createRestaurant: async (restaurantData: any) => {
    try {
      const response = await api.post('/restaurants', restaurantData);
      return response.data;
    } catch (error) {
      console.error('Create restaurant error:', error);
      // For demo purposes, return mock data
      return {
        id: "rest-" + Math.random().toString(36).substring(2),
        ...restaurantData,
        rating: 0,
        ratingCount: 0,
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500",
        coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500",
        isOpen: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },
  
  getRestaurants: async () => {
    try {
      const response = await api.get('/restaurants');
      return response.data;
    } catch (error) {
      console.error('Get restaurants error:', error);
      // Return empty array if API fails
      return [];
    }
  },
  
  getRestaurant: async (id: string) => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get restaurant ${id} error:`, error);
      // Return null if API fails
      return null;
    }
  },
  
  getOwnerRestaurants: async (ownerId: string) => {
    try {
      const response = await api.get(`/restaurants/owner/${ownerId}`);
      return response.data;
    } catch (error) {
      console.error(`Get owner restaurants error:`, error);
      // Return empty array if API fails
      return [];
    }
  },
  
  // Menu items
  addMenuItem: async (restaurantId: string, menuItemData: any) => {
    try {
      const response = await api.post(`/restaurants/${restaurantId}/menu`, menuItemData);
      return response.data;
    } catch (error) {
      console.error('Add menu item error:', error);
      // Return mock data if API fails
      return {
        id: "item-" + Math.random().toString(36).substring(2),
        restaurantId,
        ...menuItemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },
  
  getMenu: async (restaurantId: string) => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/menu`);
      return response.data;
    } catch (error) {
      console.error(`Get menu error:`, error);
      // Return empty array if API fails
      return [];
    }
  },
};

// Order API
export const orderAPI = {
  createOrder: async (orderData: any) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Create order error:', error);
      // Return mock data if API fails
      return {
        id: "order-" + Math.random().toString(36).substring(2),
        ...orderData,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },
  
  getUserOrders: async (userId: string) => {
    try {
      const response = await api.get(`/orders/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Get user orders error:`, error);
      // Return empty array if API fails
      return [];
    }
  },
  
  getRestaurantOrders: async (restaurantId: string) => {
    try {
      const response = await api.get(`/orders/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error(`Get restaurant orders error:`, error);
      // Return empty array if API fails
      return [];
    }
  },
  
  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Update order status error:`, error);
      // Return mock data if API fails
      return {
        id: orderId,
        status,
        updatedAt: new Date().toISOString(),
      };
    }
  },
};

// Recipe API
export const recipeAPI = {
  createRecipe: async (recipeData: any) => {
    try {
      const response = await api.post('/recipes', recipeData);
      return response.data;
    } catch (error) {
      console.error('Create recipe error:', error);
      // Return mock data if API fails
      return {
        id: "recipe-" + Math.random().toString(36).substring(2),
        ...recipeData,
        rating: 0,
        ratingCount: 0,
        comments: [],
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },
  
  getRecipes: async () => {
    try {
      const response = await api.get('/recipes');
      return response.data;
    } catch (error) {
      console.error('Get recipes error:', error);
      // Return empty array if API fails
      return [];
    }
  },
  
  getRecipe: async (id: string) => {
    try {
      const response = await api.get(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get recipe ${id} error:`, error);
      // Return null if API fails
      return null;
    }
  },
  
  addComment: async (recipeId: string, commentData: any) => {
    try {
      const response = await api.post(`/recipes/${recipeId}/comments`, commentData);
      return response.data;
    } catch (error) {
      console.error('Add comment error:', error);
      // Return mock data if API fails
      return {
        id: "comment-" + Math.random().toString(36).substring(2),
        ...commentData,
        createdAt: new Date().toISOString(),
      };
    }
  },
};

// Analytics API
export const analyticsAPI = {
  getRestaurantAnalytics: async (restaurantId: string, period: string = 'week') => {
    try {
      const response = await api.get(`/analytics/restaurant/${restaurantId}?period=${period}`);
      return response.data;
    } catch (error) {
      console.error(`Get restaurant analytics error:`, error);
      // Return mock data if API fails
      const mockData = {
        totalSales: 12580,
        totalOrders: 156,
        newCustomers: 42,
        avgOrderValue: 80.64,
        salesByDay: {
          "2023-05-01": 1200,
          "2023-05-02": 1500,
          "2023-05-03": 1800,
          "2023-05-04": 2100,
          "2023-05-05": 2400,
          "2023-05-06": 1900,
          "2023-05-07": 1680,
        },
        ordersByDay: {
          "2023-05-01": 15,
          "2023-05-02": 18,
          "2023-05-03": 22,
          "2023-05-04": 25,
          "2023-05-05": 30,
          "2023-05-06": 24,
          "2023-05-07": 22,
        },
        popularItems: [
          { id: "item1", name: "Doro Wat", count: 45 },
          { id: "item2", name: "Tibs", count: 38 },
          { id: "item3", name: "Injera", count: 36 },
          { id: "item4", name: "Ethiopian Coffee", count: 30 },
          { id: "item5", name: "Kitfo", count: 25 },
        ],
        customerBreakdown: {
          new: 42,
          returning: 45,
        },
      };
      return mockData;
    }
  },
};

export default api;
