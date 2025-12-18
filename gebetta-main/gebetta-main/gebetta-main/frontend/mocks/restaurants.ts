import { MenuItem, Restaurant } from "@/types/restaurant";

// Mock menu items
const menuItems: MenuItem[] = [
  {
    id: "item1",
    name: "Doro Wat",
    description: "Spicy chicken stew with berbere spice",
    price: 14.99,
    imageUrl: "https://images.unsplash.com/photo-1567364816519-cbc9c4ffe1eb?q=80&w=500",
    category: "Main Dishes",
    popular: true,
    spicy: true,
    restaurantId: "",
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "item2",
    name: "Tibs",
    description: "Sautéed meat with vegetables",
    price: 16.99,
    imageUrl: "https://images.unsplash.com/photo-1511910849309-0dffb8785146?q=80&w=500",
    category: "Main Dishes",
    popular: true,
    restaurantId: "",
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "item3",
    name: "Injera",
    description: "Sourdough flatbread",
    price: 3.99,
    imageUrl: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?q=80&w=500",
    category: "Sides",
    restaurantId: "",
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "item4",
    name: "Ethiopian Coffee",
    description: "Traditional coffee ceremony",
    price: 4.99,
    imageUrl: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?q=80&w=500",
    category: "Beverages",
    restaurantId: "",
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "item5",
    name: "Kitfo",
    description: "Minced raw beef with spiced butter",
    price: 15.99,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=500",
    category: "Main Dishes",
    spicy: true,
    restaurantId: "",
    createdAt: "",
    updatedAt: ""
  },
];

// Mock restaurants
export const mockRestaurants: Restaurant[] = [
  {
    id: "rest1",
    name: "Habesha Restaurant",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500",
    coverImageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500",
    cuisine: "Ethiopian",
    rating: 4.7,
    reviewCount: 128,
    deliveryFee: 2.99,
    estimatedDeliveryTime: "30-45 min",
    address: "123 Main St, Addis Ababa",
    description: "Authentic Ethiopian cuisine with traditional coffee ceremony",
    priceLevel: "$$",
    isOpen: true,
    distance: "1.2 km",
    categories: ["Ethiopian", "Traditional", "Vegetarian-friendly"],
    menu: menuItems,
    location: {
      latitude: 9.0222,
      longitude: 38.7468
    },
    phone: "+251 11 234 5678",
    website: "https://habesharestaurant.com",
    openingHours: {
      "Monday": { open: "10:00 AM", close: "10:00 PM" },
      "Tuesday": { open: "10:00 AM", close: "10:00 PM" },
      "Wednesday": { open: "10:00 AM", close: "10:00 PM" },
      "Thursday": { open: "10:00 AM", close: "10:00 PM" },
      "Friday": { open: "10:00 AM", close: "11:00 PM" },
      "Saturday": { open: "10:00 AM", close: "11:00 PM" },
      "Sunday": { open: "11:00 AM", close: "9:00 PM" }
    },
    ownerId: "",
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "rest2",
    name: "Addis Ababa Cafe",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500",
    coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500",
    cuisine: "Ethiopian Fusion",
    rating: 4.5,
    reviewCount: 86,
    deliveryFee: 3.99,
    estimatedDeliveryTime: "25-40 min",
    address: "456 Oak St, Addis Ababa",
    description: "Modern take on Ethiopian classics with international influences",
    priceLevel: "$$$",
    isOpen: true,
    distance: "2.5 km",
    categories: ["Ethiopian", "Fusion", "Modern"],
    menu: menuItems,
    location: {
      latitude: 9.0300,
      longitude: 38.7500
    },
    phone: "+251 11 987 6543",
    website: "https://addisababacafe.com",
    openingHours: {
      "Monday": { open: "8:00 AM", close: "9:00 PM" },
      "Tuesday": { open: "8:00 AM", close: "9:00 PM" },
      "Wednesday": { open: "8:00 AM", close: "9:00 PM" },
      "Thursday": { open: "8:00 AM", close: "9:00 PM" },
      "Friday": { open: "8:00 AM", close: "10:00 PM" },
      "Saturday": { open: "9:00 AM", close: "10:00 PM" },
      "Sunday": { open: "9:00 AM", close: "8:00 PM" }
    },
    ownerId: "",
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "rest3",
    name: "Lalibela Restaurant",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=500",
    coverImageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=500",
    cuisine: "Traditional Ethiopian",
    rating: 4.8,
    reviewCount: 152,
    deliveryFee: 1.99,
    estimatedDeliveryTime: "35-50 min",
    address: "789 Pine St, Addis Ababa",
    description: "Family-owned restaurant serving authentic Ethiopian dishes",
    priceLevel: "$$",
    isOpen: true,
    distance: "3.7 km",
    categories: ["Ethiopian", "Traditional", "Family-style"],
    menu: menuItems,
    location: {
      latitude: 9.0350,
      longitude: 38.7600
    },
    phone: "+251 11 345 6789",
    website: "https://lalibelarestaurant.com",
    openingHours: {
      "Monday": { open: "11:00 AM", close: "9:00 PM" },
      "Tuesday": { open: "11:00 AM", close: "9:00 PM" },
      "Wednesday": { open: "11:00 AM", close: "9:00 PM" },
      "Thursday": { open: "11:00 AM", close: "9:00 PM" },
      "Friday": { open: "11:00 AM", close: "10:00 PM" },
      "Saturday": { open: "11:00 AM", close: "10:00 PM" },
      "Sunday": { open: "12:00 PM", close: "8:00 PM" }
    },
    ownerId: "",
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "rest4",
    name: "Merkato Cafe",
    imageUrl: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=500",
    coverImageUrl: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=500",
    cuisine: "Ethiopian Street Food",
    rating: 4.3,
    reviewCount: 64,
    deliveryFee: 0.99,
    estimatedDeliveryTime: "20-35 min",
    address: "101 Market St, Addis Ababa",
    description: "Quick and delicious Ethiopian street food favorites",
    priceLevel: "$",
    isOpen: true,
    distance: "1.8 km",
    categories: ["Ethiopian", "Street Food", "Quick Bites"],
    menu: menuItems,
    location: {
      latitude: 9.0100,
      longitude: 38.7300
    },
    phone: "+251 11 456 7890",
    website: "https://merkatocafe.com",
    openingHours: {
      "Monday": { open: "7:00 AM", close: "8:00 PM" },
      "Tuesday": { open: "7:00 AM", close: "8:00 PM" },
      "Wednesday": { open: "7:00 AM", close: "8:00 PM" },
      "Thursday": { open: "7:00 AM", close: "8:00 PM" },
      "Friday": { open: "7:00 AM", close: "9:00 PM" },
      "Saturday": { open: "8:00 AM", close: "9:00 PM" },
      "Sunday": { open: "8:00 AM", close: "7:00 PM" }
    },
    ownerId: "",
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "rest5",
    name: "Blue Nile Restaurant",
    imageUrl: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=500",
    coverImageUrl: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=500",
    cuisine: "Ethiopian & Eritrean",
    rating: 4.6,
    reviewCount: 98,
    deliveryFee: 2.49,
    estimatedDeliveryTime: "40-55 min",
    address: "222 River Rd, Addis Ababa",
    description: "Serving both Ethiopian and Eritrean specialties in a cozy setting",
    priceLevel: "$$",
    isOpen: false,
    distance: "4.2 km",
    categories: ["Ethiopian", "Eritrean", "Regional"],
    menu: menuItems,
    location: {
      latitude: 9.0400,
      longitude: 38.7700
    },
    phone: "+251 11 567 8901",
    website: "https://bluenilerestaurant.com",
    openingHours: {
      "Monday": { open: "11:00 AM", close: "9:00 PM" },
      "Tuesday": { open: "11:00 AM", close: "9:00 PM" },
      "Wednesday": { open: "11:00 AM", close: "9:00 PM" },
      "Thursday": { open: "11:00 AM", close: "9:00 PM" },
      "Friday": { open: "11:00 AM", close: "10:00 PM" },
      "Saturday": { open: "11:00 AM", close: "10:00 PM" },
      "Sunday": { open: "Closed", close: "Closed" }
    },
    ownerId: "",
    createdAt: "",
    updatedAt: "" 
  }
];

export const restaurants = mockRestaurants;

export const menuCategories = [
  "All",
  "Main Dishes",
  "Sides",
  "Beverages",
  "Desserts",
  "Appetizers",
  "Specials"
];

export const restaurantCategories = [
  "All",
  "Ethiopian",
  "Traditional",
  "Fusion",
  "Street Food",
  "Vegetarian-friendly",
  "Family-style",
];
