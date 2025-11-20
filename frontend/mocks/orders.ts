import { Order } from "@/types/restaurant";

export const mockOrders: Order[] = [
  {
    id: "order1",
    userId: "user1",
    restaurantId: "rest1", // Habesha Restaurant
    items: [
      {
        id: "orderitem1",
        menuItemId: "item1",
        name: "Doro Wat",
        price: 14.99,
        quantity: 2,
        specialInstructions: "Extra spicy please"
      },
      {
        id: "orderitem2",
        menuItemId: "item3",
        name: "Injera",
        price: 3.99,
        quantity: 4
      }
    ],
    status: "delivered",
    subtotal: 45.94,
    deliveryFee: 2.99,
    tax: 6.89,
    tip: 5.00,
    totalAmount: 60.82,
    paymentMethod: "card",
    paymentStatus: "paid",
    serviceType: "delivery",
    deliveryAddress: {
      addressLine1: "123 Main St",
      addressLine2: "Apt 4B",
      city: "Addis Ababa",
      instructions: "Gate code: 1234",
      location: {
        latitude: 9.0222,
        longitude: 38.7468
      },
      id: "",
      userId: "",
      name: "",
      isDefault: false,
      street: "",
      apt: "",
      type: ""
    },
    driverInfo: {
      name: "Dawit Haile",
      phone: "+251922345678",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
      currentLocation: {
        latitude: 9.0222,
        longitude: 38.7468
      }
    },
    createdAt: "2023-06-15T14:30:00Z",
    estimatedDeliveryTime: 30,
    updatedAt: ""
  },
  {
    id: "order2",
    userId: "user1",
    restaurantId: "rest2",
    items: [
      {
        id: "orderitem3",
        menuItemId: "item5",
        name: "Kitfo",
        price: 15.99,
        quantity: 1,
        specialInstructions: "Medium rare"
      },
      {
        id: "orderitem4",
        menuItemId: "item3",
        name: "Injera",
        price: 3.99,
        quantity: 2
      },
      {
        id: "orderitem5",
        menuItemId: "item4",
        name: "Ethiopian Coffee",
        price: 4.99,
        quantity: 2
      }
    ],
    status: "out-for-delivery",
    subtotal: 33.95,
    deliveryFee: 0,
    tax: 5.09,
    tip: 0,
    totalAmount: 39.04,
    paymentMethod: "cash",
    paymentStatus: "pending",
    serviceType: "pickup",
    pickupTime: "2023-06-20T18:30:00Z",
    createdAt: "2023-06-20T17:45:00Z",
    estimatedDeliveryTime: 0,
    deliveryAddress: {
      addressLine1: "789 Pickup Location",
      addressLine2: "",
      city: "Addis Ababa",
      instructions: "Pickup at counter",
      location: {
        latitude: 9.0222,
        longitude: 38.7468
      },
      id: "",
      userId: "",
      name: "",
      isDefault: false,
      street: "",
      apt: "",
      type: ""
    },
    updatedAt: ""
  },
  {
    id: "order3",
    userId: "user1",
    restaurantId: "rest1", // Back to Habesha Restaurant
    items: [
      {
        id: "orderitem6",
        menuItemId: "item2",
        name: "Tibs",
        price: 16.99,
        quantity: 2
      },
      {
        id: "orderitem7",
        menuItemId: "item3",
        name: "Injera",
        price: 3.99,
        quantity: 3
      },
      {
        id: "orderitem8",
        menuItemId: "item4",
        name: "Ethiopian Coffee",
        price: 4.99,
        quantity: 1
      }
    ],
    status: "cancelled",
    subtotal: 46.94,
    deliveryFee: 0,
    tax: 7.04,
    tip: 8.00,
    totalAmount: 61.98,
    paymentMethod: "mobile_money",
    paymentStatus: "paid",
    serviceType: "dine-in",
    tableNumber: "12",
    createdAt: "2023-06-25T19:15:00Z",
    estimatedDeliveryTime: 0,
    deliveryAddress: {
      id: "address3",
      userId: "user1",
      name: "John Doe",
      addressLine1: "789 Pine St",
      addressLine2: "",
      isDefault: true,
      street: "Pine St",
      apt: "",
      city: "Addis Ababa",
      instructions: "Leave at door",
      type: "Delivery",
      location: {
        latitude: 9.0350,
        longitude: 38.7600
      }
    },
    updatedAt: ""
  },
  {
    id: "order4",
    userId: "user1",
    restaurantId: "rest2", // Second restaurant again
    items: [
      {
        id: "orderitem9",
        menuItemId: "item1",
        name: "Doro Wat",
        price: 14.99,
        quantity: 1
      },
      {
        id: "orderitem10",
        menuItemId: "item2",
        name: "Tibs",
        price: 16.99,
        quantity: 1
      }
    ],
    status: "pending",
    subtotal: 31.98,
    deliveryFee: 2.99,
    tax: 4.80,
    tip: 6.00,
    totalAmount: 45.77,
    paymentMethod: "card",
    paymentStatus: "paid",
    serviceType: "delivery",
    deliveryAddress: {
      addressLine1: "456 Oak Ave",
      addressLine2: "",
      city: "Addis Ababa",
      instructions: "Leave at door",
      location: {
        latitude: 9.0300,
        longitude: 38.7500
      },
      id: "",
      userId: "",
      name: "",
      isDefault: false,
      street: "",
      apt: "",
      type: ""
    },
    driverInfo: {
      name: "Selam Tadesse",
      phone: "+251911234567",
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
      currentLocation: {
        latitude: 9.0280,
        longitude: 38.7490
      }
    },
    createdAt: "2023-07-01T12:00:00Z",
    estimatedDeliveryTime: 35,
    updatedAt: ""
  },
  {
    id: "order5",
    userId: "user1",
    restaurantId: "rest2",
    items: [
      {
        id: "orderitem11",
        menuItemId: "item5",
        name: "Kitfo",
        price: 15.99,
        quantity: 2
      },
      {
        id: "orderitem12",
        menuItemId: "item3",
        name: "Injera",
        price: 3.99,
        quantity: 4
      }
    ],
    status: "delivered",
    subtotal: 47.94,
    deliveryFee: 0,
    tax: 7.19,
    tip: 0,
    totalAmount: 55.13,
    paymentMethod: "cash",
    serviceType: "dine-in",
    tableNumber: "8",
    createdAt: "2023-07-05T20:30:00Z",
    estimatedDeliveryTime: 0,
    deliveryAddress: {
      addressLine1: "456 Oak Ave",
      addressLine2: "",
      city: "Addis Ababa",
      instructions: "Leave at door",
      location: {
        latitude: 9.0300,
        longitude: 38.7500
      },
      id: "",
      userId: "",
      name: "",
      isDefault: false,
      street: "",
      apt: "",
      type: ""
    },
    paymentStatus: "pending",
    updatedAt: ""
  }
];

export default mockOrders;