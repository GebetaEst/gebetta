export interface Restaurant {
  id: string;
  _id: string; // MongoDB identifier
  name: string;
  slug: string;
  description?: string;
  address: string;
  cuisine: string;
  priceLevel: string;
  rating?: number;
  imageUrl: string;
  coverImageUrl?: string;
  isOpen?: boolean;
  ownerId: string;
  managerId?: string;
  menu?: MenuItem[];
  reviews?: Review[];
  openingHours?: Record<string, { open: string; close: string }>;
  contactPhone?: string;
  contactEmail?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  deliveryRadiusMeters: number;
  license: string;
  cuisineTypes: string[];
  imageCover: string;
  ratingAverage: number;
  ratingQuantity: number;
  openHours: string;
  isDeliveryAvailable: boolean;
  isOpenNow: boolean;
  active: boolean;
  shortDescription?: string;
  reviewCount?: number;
  deliveryTime?: string | number;
  distance?: string;
  categories?: string[];
  createdAt: string;
  updatedAt: string;
  deliveryFee?: number;
  estimatedDeliveryTime?: number | string;
  phone?: string;
  website?: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  image?: string;
  isAvailable?: boolean;
  preparationTime?: number;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  isFeatured?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  createdAt: string;
  updatedAt: string;
  popular?: boolean;
  spicy?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
}

export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  images?: string[];
  likes?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  restaurantId: string | Restaurant;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  tax: number;
  tip: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  serviceType: OrderServiceType;
  deliveryFee?: number;
  tableNumber?: string;
  pickupTime?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  driverInfo?: {
    name: string;
    phone: string;
    currentLocation: {
      latitude: number;
      longitude: number;
    };
    photoUrl?: string;
  };
  deliveryTime?: string;
  date?: string;
  estimatedDeliveryTime?: string | number;
  deliveryAddress?: {
    id: string;
    userId: string;
    name: string;
    addressLine1: string;
    addressLine2: string;
    isDefault: boolean;
    street: string;
    apt: string;
    city: string;
    instructions: string;
    type: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export type OrderStatus = 
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out-for-delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed";

export type OrderServiceType = "delivery" | "pickup" | "dine-in" | "gift";

export interface RestaurantFilter {
  cuisine?: string[];
  priceLevel?: string[];
  rating?: number;
  isOpen?: boolean;
  distance?: number;
  searchQuery?: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  label: string;
  addressLine1: string;
  addressLine2: string;
  isDefault: boolean;
  street: string;
  apt: string;
  city: string;
  instructions: string;
  type: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  cardBrand: string;
  last4: string;
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  provider: string;
  phoneNumber?: string;
  number?: string;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  restaurantId: string;
}