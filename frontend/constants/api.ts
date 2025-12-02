export const API_CONFIG = {
  BASE_URL: "https://api.bahirandelivery.cloud/api/v1",
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export const ENDPOINTS = {
  // Auth
  REGISTER: "/users/register",
  LOGIN: "/auth/login",
  VERIFY_OTP: "/auth/verify-otp",
  RESEND_OTP: "/auth/resend-otp",
  
  // Profile
  UPDATE_PROFILE: "/users/updateMe",
  
  // Addresses
  MY_ADDRESSES: "/users/myAddresses",
  ADD_ADDRESS: "/users/addAddress",
  ADD_CURRENT_LOCATION: "/users/address/current-location",
  EDIT_ADDRESS: (id: string) => `/users/address/${id}`,
  DELETE_ADDRESS: (id: string) => `/users/address/${id}`,
  SET_DEFAULT_ADDRESS: (id: string) => `/users/address/${id}/setDefault`,
  
  // Restaurants
  RESTAURANTS: "/restaurants",
  RESTAURANT: (id: string) => `/restaurants/${id}`,
  OWNER_RESTAURANTS: (ownerId: string) => `/restaurants/owner/${ownerId}`,
  
  // Menu
  MENU: (restaurantId: string) => `/restaurants/${restaurantId}/menu`,
  MENU_ITEM: (restaurantId: string, itemId: string) => 
    `/restaurants/${restaurantId}/menu/${itemId}`,
  
  // Orders
  ORDERS: "/orders",
  USER_ORDERS: (userId: string) => `/orders/user/${userId}`,
  RESTAURANT_ORDERS: (restaurantId: string) => `/orders/restaurant/${restaurantId}`,
  ORDER_STATUS: (orderId: string) => `/orders/${orderId}/status`,
  
  // Recipes
  RECIPES: "/recipes",
  RECIPE: (id: string) => `/recipes/${id}`,
  RECIPE_COMMENTS: (recipeId: string) => `/recipes/${recipeId}/comments`,
  
  // Foods
  FOODS: "/foods",
  FOOD: (id: string) => `/foods/${id}`,
  
  // Analytics
  RESTAURANT_ANALYTICS: (restaurantId: string) => 
    `/analytics/restaurant/${restaurantId}`,
};
