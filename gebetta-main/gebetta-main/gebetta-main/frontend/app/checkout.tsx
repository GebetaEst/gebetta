import Button from "@/components/Button";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { restaurants } from "@/mocks/restaurants";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { OrderServiceType } from "@/types/restaurant";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Clock, MapPin, CreditCard, ShoppingBag, Gift } from "lucide-react-native";
import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Keyboard,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import responsive from "@/utils/responsive";
import SendGift from "./restaurant/GIft";

// Lightweight fetch helper with timeout and retries to handle transient network resets
const fetchWithTimeout = async (
  url: string,
  options: RequestInit & { headers?: Record<string, string> } = {},
  timeoutMs = 10000,
  retries = 2
) => {
  let lastError: any = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...(options.headers || {}),
          Connection: 'close',
        },
      });
      clearTimeout(id);
      return res;
    } catch (err) {
      clearTimeout(id);
      lastError = err;
      if (attempt === retries) break;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastError;
};

const { width } = Dimensions.get("window");
const isTablet = width > 768;

type SectionKey = "location" | "orderNotes" | "tip" | "total";

// Define address interface based on API response
interface Address {
  _id: string;
  userId: string;
  Name: string;
  phoneNumber: string;
  additionalInfo?: string;
  label: string;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
  location?: {
    coordinates?: [number, number];
  } | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const {
    getCartItems,
    getCartSubtotal,
    getDeliveryFee,
    getCartTotal,
    restaurantId,
    serviceType,
    setServiceType,
    clearCart,
    removeFromCart,
  } = useCartStore();
  console.log("rrrrrrrrrrrrr" , restaurantId)
  const { user } = useAuthStore();

  const scrollViewRef = useRef<ScrollView | null>(null);
  const sectionPositions = useRef<Record<SectionKey, number | null>>({
    location: null,
    orderNotes: null,
    tip: null,
    total: null,
  });
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSectionRef = useRef<SectionKey | null>(null);
  const pendingScrollDelayRef = useRef<number>(0);
  const guidedScrollActive = useRef(false);
  const locationStepCompletedRef = useRef(false);
  const orderNotesStepCompletedRef = useRef(false);
  const tipStepCompletedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, []);

  // State for addresses from API
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);


  // Helper function to get address ID
  const getAddressId = (address: Address) => address?._id || null;

  // Helper function to get address display name
  const getAddressDisplayName = (address: Address) => {
    return address.Name || 'Address';
  };

  // Helper function to get address type/label
  const getAddressType = (address: Address) => {
    return address.label || 'Address';
  };

  // Helper function to get address details
  const getAddressDetails = (address: Address) => {
    return address.additionalInfo || null;
  };

// Helper function to get address coordinates
const getAddressCoordinates = (
  address: Address
): { lat: number; lng: number } | null => {
  if (!address) return null;

  const coordinateObject = address.coordinates;
  if (
    coordinateObject &&
    typeof coordinateObject.lat === "number" &&
    typeof coordinateObject.lng === "number"
  ) {
    return {
      lat: coordinateObject.lat,
      lng: coordinateObject.lng,
    };
  }

  const locationCoordinates = address.location?.coordinates;
  if (
    Array.isArray(locationCoordinates) &&
    locationCoordinates.length >= 2 &&
    typeof locationCoordinates[0] === "number" &&
    typeof locationCoordinates[1] === "number"
  ) {
    const [lng, lat] = locationCoordinates;
    return { lat, lng };
  }

  return null;
};

  // Helper function to get formatted address display text
  const getAddressDisplayText = (address: Address) => {
    const parts = [];
    
    // Add the name/title
    if (address.Name) {
      parts.push(address.Name);
    }
    
    // Add additional info if available
    if (address.additionalInfo) {
      parts.push(address.additionalInfo);
    }
    
    // Add coordinates if available
  const coords = getAddressCoordinates(address);

  if (
    coords &&
    typeof coords.lat === "number" &&
    typeof coords.lng === "number"
  ) {
    parts.push(`(${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
    }
    
    // Return combined text or fallback
    return parts.length > 0 ? parts.join(', ') : 'Address';
  };

  // Function to fetch addresses from API
  const fetchAddresses = async () => {
    if (!user?.token) return;

    setIsLoadingAddresses(true);
    try {
      const response = await fetch("https://gebeta-delivery1.onrender.com/api/v1/users/myAddresses", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // console.log("&&&&&&&&&&&&&&&&&&&&", data);

        // Assuming the API returns addresses in data.addresses or directly in data
        const addressList = data.addresses || data.data || data || [];
        setAddresses(addressList);

      } else {
        console.error("Failed to fetch addresses:", response.status);
        Alert.alert("Error", "Failed to load addresses");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      Alert.alert("Error", "Failed to load addresses");
    } finally {
      setIsLoadingAddresses(false);
    }
  };
  useEffect(() => {
    fetchAddresses();
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [vehicleType, setVehicleType] = useState("Bicycle");
  const [showWebView, setShowWebView] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [orderDescription, setOrderDescription] = useState("");
  const [APIDeliveryFee, setAPIDeliveryFee] = useState<any>({});
  const [deliveryFeeDisplay, setDeliveryFeeDisplay] = useState(0);
  const [isDeliveryFeeLoading, setIsDeliveryFeeLoading] = useState(false);
  const [giftLocation, setGiftLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [reviserPhone, setReviserPhone ] = useState<number | null>(null);
  
  // Track keyboard visibility to avoid footer overlaying inputs
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Location tracking states
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationRefused, setLocationRefused] = useState(false);

  const cartItems = getCartItems();
  const subtotal = getCartSubtotal();
  const deliveryFee = getDeliveryFee();

  // Calculate delivery fee from API based on vehicle type
  const getAPIDeliveryFee = () => {
    if (serviceType !== "delivery" && serviceType !== "gift") return 0;
    if (!APIDeliveryFee || typeof APIDeliveryFee !== 'object') return 0;
    
    if (vehicleType === "Car" && APIDeliveryFee.Car) return APIDeliveryFee.Car.deliveryFee || 0;
    if (vehicleType === "Bicycle" && APIDeliveryFee.Bicycle) return APIDeliveryFee.Bicycle.deliveryFee || 0;
    if (vehicleType === "Motor" && APIDeliveryFee.Motor) return APIDeliveryFee.Motor.deliveryFee || 0;
    return 0;
  };

  const apiDeliveryFee = getAPIDeliveryFee();
  const total = getCartTotal() + tip + apiDeliveryFee;

  // const restaurant = restaurants.find((r) => r.id === restaurantId);

  // Function to get current location
  const getCurrentLocation = async () => {
    try {
      // Show confirmation alert first
      return new Promise<{ latitude: number, longitude: number } | null>((resolve) => {
        Alert.alert(
          "Location Access Required",
          "",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                console.log("User cancelled location access");
                setLocationRefused(true);
                resolve(null);
              },
            },
            {
              text: "Allow",
              style: "default",
              onPress: async () => {
                try {
                  setIsGettingLocation(true);

                  // Check if location services are enabled
                  const isLocationEnabled = await Location.hasServicesEnabledAsync();
                  if (!isLocationEnabled) {
                    Alert.alert(
                      "Location Services Disabled",
                      "Please enable location services in your device settings to use location tracking for orders."
                    );
                    setIsGettingLocation(false);
                    resolve(null);
                    return;
                  }

                  // Request location permission
                  const { status } = await Location.requestForegroundPermissionsAsync();
                  setLocationPermission(status === "granted");

                  if (status !== "granted") {
                    Alert.alert(
                      "Location Permission Required",
                      "Go to your Settings and enable location services to continue with your order."
                    );
                    setIsGettingLocation(false);
                    resolve(null);
                    return;
                  }

                  // Show getting location alert

                  // Get current position with high accuracy
                  const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 1,
                  });

                  const coords = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  };

                  setCurrentLocation(coords);
                  setLocationRefused(false); // Reset location refused state when location is obtained
                  console.log("Current location obtained:", coords);



                  setIsGettingLocation(false);
                  resolve(coords);
                } catch (error) {
                  console.error("Error getting location:", error);
                  Alert.alert(
                    "Location Error",
                    "Unable to get your current location. Please check your location settings and try again."
                  );
                  setIsGettingLocation(false);
                  resolve(null);
                }
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error("Error in getCurrentLocation:", error);
      setIsGettingLocation(false);
      return null;
    }
  };

  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();

    // console.log("(o) (o)" , addresses)
    // Get location permission status on mount
    const checkLocationPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationPermission(status === "granted");
      } catch (error) {
        console.warn("Error checking location permission:", error);
      }
    };

    checkLocationPermission();
  }, [addresses, serviceType]);

  const handleAddAddress = () => {
    router.push("/profile/addresses/add");
  };
  const token = user?.token;



  const handelDeliveryFee = async () => {
    // Only fetch delivery fee when service type is delivery
    if (serviceType !== "delivery" && serviceType !== "gift") {
      setIsDeliveryFeeLoading(false);
      return;
    }

    setIsDeliveryFeeLoading(true);

    let destinationCoords: { lat: number; lng: number } | null = null;
    
    // Priority 1: If user chose to use address list and selected an address
    if(serviceType === "gift" ) {
        destinationCoords = {
          lat: giftLocation?.lat as number,
          lng: giftLocation?.lng as number,
        };
      console.log("Using gift location coordinates:::::::::::::::::::::::::;", destinationCoords);
    }
    else if (locationRefused && selectedAddress) {
      const address = addresses.find(addr => getAddressId(addr) === selectedAddress);
      console.log("Address:", address);
      if (address) {
        const addressCoords = getAddressCoordinates(address);
        if (addressCoords && serviceType !== "gift") {
          // Use the selected address coordinates
          destinationCoords = addressCoords;
          console.log("Using selected address coordinates:", destinationCoords);
        }
      }
    }
    
    // Priority 2: If user chose to use current location (locationRefused is false)
    if (!destinationCoords && !locationRefused && currentLocation) {
      destinationCoords = {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      };
      console.log("Using current location:", destinationCoords);
    }
    
    // Priority 3: Fallback to current location if address doesn't have coordinates
    if (!destinationCoords && currentLocation) {
      destinationCoords = {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      };
      console.log("Fallback to current location:", destinationCoords);
    }
    console.log(responsive)
    
    // If no destination is available, return early
    if (!destinationCoords) {
      console.log("No destination coordinates available for delivery fee calculation");
      setIsDeliveryFeeLoading(false);
      return 0;
    }

    const deliveryPayload = {
      restaurantId: restaurantId,
      destination: destinationCoords
    };

    try {
      const deliveryResponse = await fetchWithTimeout("https://gebeta-delivery1.onrender.com/api/v1/orders/estimate-delivery-fee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deliveryPayload),
      }, 8000, 2);
      const deliveryData = await deliveryResponse.json();
      console.log("#################:", deliveryPayload);
      console.log("$$$$$$$$$$", deliveryData);

      setAPIDeliveryFee(deliveryData.data);

      // Return the delivery fee for the selected vehicle type
      if (deliveryData.data && typeof deliveryData.data === 'object') {
        if (vehicleType.toLowerCase() === "car" && deliveryData.data.Car) {
          return deliveryData.data.Car.deliveryFee || 0;
        }
        if (vehicleType.toLowerCase() === "bicycle" && deliveryData.data.Bicycle) {
          return deliveryData.data.Bicycle.deliveryFee || 0;
        }
        if (vehicleType.toLowerCase() === "motor" && deliveryData.data.Motor) {
          return deliveryData.data.Motor.deliveryFee || 0;
        }
      }
      return 0;

    }
    catch (error) {
      console.error("Error estimating delivery fee:", error);

      return 0;
    }
    finally {
      setIsDeliveryFeeLoading(false);
    }
  }
  console.log("selectedAddress", selectedAddress)

  useEffect(() => {
    handelDeliveryFee();
  }, [selectedAddress, serviceType, vehicleType, currentLocation, giftLocation])

  //handlePlaceOrder function to place an order
  const SERVICE_TYPE_TO_ORDER_TYPE = {
    delivery: "Delivery",
    pickup: "Pickup",
    "dine-in": "Dine-in",
  } as const;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    let result: any = null;
  
    try {
      // Validate required fields
      // if (serviceType === "delivery" && locationRefused) {
      //   Alert.alert("Error", "Please select a delivery address");
      //   setIsProcessing(false);
      //   return;
      // }
  
      if (serviceType === "dine-in" && !tableNumber) {
        Alert.alert("Error", "Please enter your table number");
        setIsProcessing(false);
        return;
      }
  
      if (serviceType === "pickup" && !pickupTime) {
        Alert.alert("Error", "Please select a pickup time");
        setIsProcessing(false);
        return;
      }

      if (serviceType === "gift") {
        if (!giftLocation) {
          Alert.alert("Error", "Please select a gift location on the map or by search");
          setIsProcessing(false);
          return;
        }
        if (!reviserPhone) {
          Alert.alert("Error", "Please enter the recipient's phone number");
          setIsProcessing(false);
          return;
        }
      }
  
      // Get current phone location for all order types
      let phoneLocation = currentLocation;
  
      // Only try to get location if we don't have it and user hasn't refused
      if (!phoneLocation && !locationRefused) {
        console.log("Getting current location for order...");
        phoneLocation = await getCurrentLocation();
  
        if (!phoneLocation) {
          // User refused location or location failed
          if (serviceType === "delivery") {
            Alert.alert(
              "Location or Address Required",
              "Please either allow location access or select a delivery address to continue with your order."
            );
          } else {
            Alert.alert(
              "Location Required",
              "Unable to get your current location. Please check your location settings and try again."
            );
          }
          setIsProcessing(false);
          return;
        }
      }
  
      const selectedAddressData = addresses.find(
        (addr) => getAddressId(addr) === selectedAddress
      );
  
      // Get destination coordinates for delivery
      let destinationLocation: { lat: number; lng: number } | null = null;
  
      if (serviceType === "delivery") {
        if (selectedAddressData) {
          // Use selected address
          const addressCoords = getAddressCoordinates(selectedAddressData);
          
          if (addressCoords) {
            destinationLocation = {
              lat: addressCoords.lat,
              lng: addressCoords.lng,
            };
          } else {
            // Fallback to phone location if address doesn't have coordinates
            destinationLocation = phoneLocation ? {
              lat: phoneLocation.latitude,
              lng: phoneLocation.longitude,
            } :null
          }
        } else {
          // Use phone location as destination when no address is selected
          destinationLocation = phoneLocation ? {
            lat: phoneLocation.latitude,
            lng: phoneLocation.longitude,
          } : null
        } 
      } else if (serviceType === "gift") {
        destinationLocation = giftLocation ? {
          lat: giftLocation.lat,
          lng: giftLocation.lng,
        } : null;
      }
  
      // Base payload structure
      const typeOfOrder =
        SERVICE_TYPE_TO_ORDER_TYPE[
          serviceType as keyof typeof SERVICE_TYPE_TO_ORDER_TYPE
        ] || "Delivery";

      const orderPayload: any = {
        restaurantId: restaurantId,
        orderItems: cartItems.map((item) => ({
          foodId: item.menuItemId,
          quantity: item.quantity,
        })),
        typeOfOrder,
        fromSponsore: serviceType === "gift" ? true : false,
        tip: tip,
        description: orderDescription,
        sponsoredPhone: serviceType === "gift" ? (reviserPhone !== null ? String(reviserPhone) : null) : null,
      };
      // Add service type specific fields
      if (serviceType === "delivery" ) {
        orderPayload.vehicleType = vehicleType;
        orderPayload.destinationLocation = destinationLocation
        orderPayload.callculatedDeliveryFee = apiDeliveryFee;
      } else if (serviceType === "pickup") {
        orderPayload.pickupTime = pickupTime;
      } else if (serviceType === "gift") {
        orderPayload.vehicleType = vehicleType;
        orderPayload.callculatedDeliveryFee = apiDeliveryFee;

        orderPayload.destinationLocation = giftLocation;
      } else if (serviceType === "dine-in") {
        orderPayload.tableNumber = tableNumber;
      }

      // Add console logging to debug payload
      console.log("Order Payload being sent:", JSON.stringify(orderPayload, null, 2));

      // Validate destinationLocation for delivery orders
      if ((serviceType === "delivery") && !destinationLocation ) {
        Alert.alert("Error", "Delivery location is required");
        setIsProcessing(false);
        return;
      }
console.log("Order Payload being sent: 633{checkout.tsx}", JSON.stringify(orderPayload, null, 2));
      const response = await fetchWithTimeout(
        "https://gebeta-delivery1.onrender.com/api/v1/orders/place-order",
        {
          method: "POST",          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderPayload),
        }, 10000, 2
      );
  
      const responseData = await response.json().catch(() => null);
        console.log("Response Data:333333333333333333", responseData);
      if (response.ok) {
        result = responseData;

        // Clear cart after successful order
        clearCart();
        console.log("Order placed successfully:", result);

        // If a payment checkout_url is available, show WebView
        if (
          typeof result === "object" &&
          result?.data?.payment?.checkout_url
        ) {
          const checkoutUrl = result.data.payment.checkout_url;
          setWebViewUrl(checkoutUrl);
          setShowWebView(true);
          return; // Don't show success alert yet, wait for payment
        }

        Alert.alert("Success", "Order placed successfully!", [
          {
            text: "OK",
            onPress: () => {
              // Navigate to home or order confirmation
              router.replace("/(tabs)");
            },
          },
        ]);
      } else {
        console.error("Order failed:", responseData);
        console.error("Response status:", response.status);
        console.error("Payload sent:", JSON.stringify(orderPayload, null, 2));
        const msg = typeof responseData?.message === 'string' ? responseData.message : '';
        const match = msg.match(/Food not found:\s*(\w+)/i);
        if (match && match[1]) {
          const missingId = match[1];
          removeFromCart(missingId);
          Alert.alert(
            "Item removed",
            "One of the items in your cart is no longer available. We've removed it from your cart. Please review your order and try again."
          );
        } else {
          Alert.alert("Error from the back", responseData?.message || "Failed to place order");
        }
      }
    } catch (error) {
      console.error("Order error:", error);
      console.log("Result:333333333333333333 line 667{checkout.tsx}", result);

      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to place order"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getOrderedSections = useCallback(() => {
    const sections: SectionKey[] = [];
    if (serviceType === "delivery") {
      sections.push("location");
    }
    sections.push("orderNotes");
    if (serviceType !== "dine-in") {
      sections.push("tip");
    }
    sections.push("total");
    return sections;
  }, [serviceType]);

  const scrollToSection = useCallback((section: SectionKey, delay = 500) => {
    if (!scrollViewRef.current) return;
    if (!getOrderedSections().includes(section)) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }

    const targetY = sectionPositions.current[section];

    if (typeof targetY !== "number") {
      pendingSectionRef.current = section;
      pendingScrollDelayRef.current = delay;
      return;
    }

    scrollTimeoutRef.current = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(targetY - 24, 0),
        animated: true,
      });
      scrollTimeoutRef.current = null;
    }, delay);
  }, [getOrderedSections]);

  const scrollToNextSection = useCallback((current: SectionKey, delay = 500) => {
    const orderedSections = getOrderedSections();
    const currentIndex = orderedSections.indexOf(current);
    if (currentIndex === -1) return;
    const nextSection = orderedSections[currentIndex + 1];
    if (!nextSection) return;
    scrollToSection(nextSection, delay);
  }, [getOrderedSections, scrollToSection]);

  const resetGuidedScrollProgress = () => {
    guidedScrollActive.current = true;
    locationStepCompletedRef.current = false;
    orderNotesStepCompletedRef.current = false;
    tipStepCompletedRef.current = false;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    pendingSectionRef.current = null;
    pendingScrollDelayRef.current = 0;
  };

  //handleTipChange function to handle tip change
  const handleTipChange = (amount: number) => {
    setTip(amount);
    setCustomTip("");
    handleTipStepCompletion();
  };

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value);
    const numericValue = parseFloat(value) || 0;
    setTip(numericValue);
  };

  const handleTipStepCompletion = () => {
    if (!getOrderedSections().includes("tip")) return;
    if (!guidedScrollActive.current) return;
    if (tipStepCompletedRef.current) return;
    tipStepCompletedRef.current = true;
    scrollToNextSection("tip");
  };

  const handleSectionLayout = (section: SectionKey) => (event: LayoutChangeEvent) => {
    sectionPositions.current[section] = event.nativeEvent.layout.y;

    if (pendingSectionRef.current === section) {
      const delay = pendingScrollDelayRef.current;
      pendingSectionRef.current = null;
      pendingScrollDelayRef.current = 0;
      scrollToSection(section, delay);
    }
  };

  const handleOrderNotesComplete = () => {
    if (!guidedScrollActive.current) return;
    if (orderNotesStepCompletedRef.current) return;
    orderNotesStepCompletedRef.current = true;
    scrollToNextSection("orderNotes");
  };

  const handleVehicleTypeSelection = (type: string) => {
    setVehicleType(type);
    if (serviceType === "delivery") {
      resetGuidedScrollProgress();
      scrollToSection("location", 500);
    }
  };

  useEffect(() => {
    if (serviceType !== "delivery") {
      guidedScrollActive.current = false;
      locationStepCompletedRef.current = false;
      orderNotesStepCompletedRef.current = false;
      tipStepCompletedRef.current = false;
      return;
    }

    if (!guidedScrollActive.current) return;
    if (locationStepCompletedRef.current) return;

    if (currentLocation || selectedAddress) {
      locationStepCompletedRef.current = true;
      scrollToNextSection("location");
    }
  }, [currentLocation, scrollToNextSection, selectedAddress, serviceType]);

  const handleServiceTypeChange = (type: OrderServiceType) => {
    guidedScrollActive.current = false;
    locationStepCompletedRef.current = false;
    orderNotesStepCompletedRef.current = false;
    tipStepCompletedRef.current = false;
    setServiceType(type);

    // Reset related fields when changing service type
    if (type === "dine-in") {
      setSelectedAddress(null);
    } else if (type === "pickup") {
      setSelectedAddress(null);
      setTableNumber("");
    } else if (type === "delivery") {
      // Try to get the user's current location immediately to enable fee calculation
      if (!currentLocation && !locationRefused) {
        getCurrentLocation();
      }
    } else {
      setTableNumber("");
      setPickupTime("");
    }
  };

  const getServiceTypeLabel = (type: OrderServiceType) => {
    switch (type) {
      case "delivery":
        return "Delivery";
      case "dine-in":
        return "Dine-in";
      case "pickup":
        return "Pickup";
      case "gift":
        return "Gift";
      default:
        return "Delivery";
    }
  };

  const getServiceTypeIcon = (type: any) => {
    switch (type) {
      case "delivery":
        return MapPin;
      case "dine-in":
        return Clock;
      case "pickup":
        return ShoppingBag;
      case "gift":
        return Gift;
      default:
        return MapPin;
    }
  };
  console.log("giftLocationnnnnnnnnnnnnnnnnnnnn ####", giftLocation)

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <Clock size={40} color={colors.primary} />
          </View>
          <Text style={styles.loadingText}>Preparing your checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        visible={showWebView && !!webViewUrl}
        animationType="slide"
        onRequestClose={() => setShowWebView(false)}
      >
        {/* WebView for payment */}
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 8, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: colors.divider }}>
            <TouchableOpacity onPress={() => { setShowWebView(false); router.replace("/(tabs)") }} style={{ padding: 8 }}>
              <Text style={{ color: colors.primary, fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
            <Text style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Payment</Text>
            <View style={{ width: 48 }} />
          </View>
          {webViewUrl && (
            <WebView
              source={{ uri: webViewUrl }}
              style={{ flex: 1 }}
              startInLoadingState
              javaScriptEnabled
              domStorageEnabled
              onNavigationStateChange={(navState) => {
                // Optionally, handle payment completion here
                // For example, if navState.url contains a success/cancel URL, close WebView and show success
                if (
                  navState.url.includes("payment-success") ||
                  navState.url.includes("success")
                ) {
                  setShowWebView(false);
                  Alert.alert("Success", "Payment completed!", [
                    {
                      text: "OK",
                      onPress: () => router.replace("/(tabs)"),
                    },
                  ]);
                }
                if (
                  navState.url.includes("payment-cancel") ||
                  navState.url.includes("cancel")
                ) {
                  setShowWebView(false);
                  Alert.alert("Payment Cancelled", "You cancelled the payment.");
                }
              }}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Header */}
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Checkout</Text>
          <Text style={styles.headerSubtitle}>Complete your order</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Service Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Service Type</Text>
            <View style={styles.serviceTypeContainer}>
              {(["delivery", "dine-in", "pickup", "gift"] as OrderServiceType[]).map((type) => {
                const IconComponent = getServiceTypeIcon(type);
                const isActive = serviceType === type;
                const onPress =
                  type === "gift"
                    ? () => setServiceType("gift")
                    : () => handleServiceTypeChange(type);
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.serviceTypeButton,
                      isActive && styles.serviceTypeButtonActive,
                    ]}
                    onPress={onPress}
                  >
                    <View style={[
                      styles.serviceTypeGradient,
                      isActive ? styles.serviceTypeActive : styles.serviceTypeInactive
                    ]}>
                      <IconComponent
                        size={24}
                        color={isActive ? colors.white : colors.primary}
                      />
                      <Text
                        style={[
                          styles.serviceTypeText,
                          isActive && styles.serviceTypeTextActive,
                        ]}
                      >
                        {type === "dine-in" ? "Dine In" : type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {serviceType === "gift" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gift Location</Text>
              <SendGift setGiftLocation={setGiftLocation} giftLocation={giftLocation} />
              <View style={{ marginTop: 16 }}>
                <Text style={styles.customTipLabel}>Reviser Phone</Text>
                <TextInput
                  style={[styles.customTipInput, { paddingVertical: 14 }]}
                  placeholder="Enter the phone number of the person you want to send the gift to"
                value={reviserPhone !== null ? String(reviserPhone) : ""}
                onChangeText={(text) => {
                  const digitsOnly = text.replace(/[^0-9]/g, "");
                  setReviserPhone(digitsOnly ? Number(digitsOnly) : null);
                }}
                keyboardType="phone-pad"
                />
              </View>
            </View>
          )}


          {/* Vehicle Type for Delivery */}
          {(serviceType === "delivery" || serviceType === "gift") ?  (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Vehicle</Text>
              <View style={styles.vehicleTypeContainer}>
                {["Bicycle", "Motor", "Car"].map((type) => {
                  const isActive = vehicleType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.vehicleTypeButton,
                        isActive && styles.vehicleTypeButtonActive,
                      ]}
                      onPress={() => handleVehicleTypeSelection(type)}
                    >
                      <Text style={styles.vehicleEmoji}>
                        {type === "Car" ? "🚗" : type === "Bicycle" ? "🚲" : "🏍️"}
                      </Text>
                      <View style={styles.vehicleTextContainer}>
                        <Text
                          style={[
                            styles.vehicleTypeText,
                            isActive && styles.vehicleTypeTextActive,
                          ]}
                        >
                          {type }
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ):null }
          {/* Location Tracking Section */}
          {serviceType !== "gift" && (
            <View style={styles.section} onLayout={handleSectionLayout("location")}>
              <Text style={styles.sectionTitle}>Use Current location</Text>
              <View style={styles.locationContainer}>
                {currentLocation ? (
                  <View style={styles.locationSuccessContainer}>
                    <MapPin size={20} color={colors.success} />
                    <View style={styles.locationDetails}>
                      <Text style={styles.locationStatusText}>Location captured successfully</Text>
                     
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.getLocationButton}
                    onPress={getCurrentLocation}
                    disabled={isGettingLocation}
                  >
                    <View style={styles.getLocationGradient}>
                      <MapPin size={24} color={colors.primary} />
                      <Text style={styles.getLocationText}>
                        {isGettingLocation ? "Getting Location..." : "Use Current Location"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
              {/* <Text style={styles.locationInfoText}>
              Your exact location will be tracked when placing the order for better service delivery.
            </Text> */}
            </View>
          )}

          {/* Delivery Address - Show/Hide Address List */}
          {serviceType !== "gift" && (
            <Button style={styles.section} title={`${locationRefused ? "Hide Address List" : "Use Other Addresses"}`} onPress={() => {
              setLocationRefused(prev => !prev);
              fetchAddresses();
            }} />
          )}

          {/* Delivery Address - Only show if user refused location */}
          {serviceType === "delivery" && locationRefused && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              {addresses.length === 0 ? (
                <TouchableOpacity style={styles.addAddressButton} onPress={handleAddAddress}>
                  <View style={styles.addAddressGradient}>
                    <MapPin size={24} color={colors.primary} />
                    <Text style={styles.addAddressText}>Add New Address</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.addressesContainer}>
                  {addresses?.map((address) => (
                    <TouchableOpacity
                      key={getAddressId(address)}
                      style={[
                        styles.addressCard,
                        selectedAddress === getAddressId(address) && styles.selectedAddressCard
                      ]}
                      onPress={() => setSelectedAddress(getAddressId(address) || null)}
                    >
                      <View style={styles.addressCardContent}>
                        <View style={styles.addressIconContainer}>
                          <MapPin size={20} color={colors.primary} />
                        </View>
                        <View style={styles.addressDetails}>
                          <Text style={styles.addressType}>
                            {getAddressType(address).charAt(0).toUpperCase() + getAddressType(address).slice(1)}
                           
                          </Text>
                          <Text style={styles.addressText}>
                            {getAddressDisplayName(address)}
                          </Text>
                          {getAddressDetails(address) && (
                            <Text style={styles.addressText}>
                              {getAddressDetails(address)}
                            </Text>
                          )}
                          {getAddressCoordinates(address) && (
                            <Text style={styles.addressText}>
                              {getAddressCoordinates(address)?.lat ?
                                `Coordinates: ${getAddressCoordinates(address)?.lat.toFixed(4)}, ${getAddressCoordinates(address)?.lng.toFixed(4)}` :
                                null
                              }
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.addressSelectionIndicator}>
                        {selectedAddress === getAddressId(address) ? (
                          <View style={styles.selectedAddressIndicator}>
                            <View style={styles.selectedTextContainer}>
                              <Text style={styles.selectedAddressText}>Selected</Text>
                            </View>
                          </View>
                        ) : (
                          <View style={styles.radioButton}>
                            <View style={styles.radioButtonInner} />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={styles.addNewAddressButton} onPress={handleAddAddress}>
                    <Text style={styles.addNewAddressText}>+ Add New Address</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Table Number for Dine-in */}
          {serviceType === "dine-in" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Table</Text>
              <View style={styles.tableNumberContainer}>
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.tableNumberButton,
                      tableNumber === num && styles.tableNumberButtonActive,
                    ]}
                    onPress={() => setTableNumber(num)}
                  >
                    <Text
                      style={[
                        styles.tableNumberText,
                        tableNumber === num && styles.tableNumberTextActive,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Pickup Time for Pickup */}
          {serviceType === "pickup" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pickup Time</Text>
              <View style={styles.pickupTimeContainer}>
                {["15 min", "30 min", "45 min", "1 hour", "1.5 hours", "2 hours"].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.pickupTimeButton,
                      pickupTime === time && styles.pickupTimeButtonActive,
                    ]}
                    onPress={() => setPickupTime(time)}
                  >
                    <Text
                      style={[
                        styles.pickupTimeText,
                        pickupTime === time && styles.pickupTimeTextActive,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Order Description */}
          <View style={styles.section} onLayout={handleSectionLayout("orderNotes")}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <View style={styles.orderDescriptionContainer}>
              <TextInput
                style={styles.orderDescriptionInput}
                placeholder="Add special instructions or notes for your order (optional)"
                placeholderTextColor={colors.lightText}
                value={orderDescription}
                onChangeText={setOrderDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                onEndEditing={handleOrderNotesComplete}
                onBlur={handleOrderNotesComplete}
              />
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.sectionIcon}>
                  <ShoppingBag size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, styles.sectionTitleCompact]}>Your Order</Text>
                </View>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </Text>
              </View>
            </View>

            <View style={styles.orderItemsCard}>
              {cartItems.map((item, index) => (
                <View
                  key={item.menuItemId}
                  style={[
                    styles.orderItem,
                    index === cartItems.length - 1 && styles.lastOrderItem,
                  ]}
                >
                  <View style={styles.orderItemLeft}>
                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                    </View>
                    <View style={styles.orderItemDetails}>
                      <Text style={styles.orderItemName}>{item.menuItem.name}</Text>
                      {item.menuItem?.description ? (
                        <Text style={styles.orderItemMeta} numberOfLines={1}>
                          {item.menuItem.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.orderItemRight}>
                    <Text style={styles.orderItemPrice}>
                      {Number(item.menuItem.price * item.quantity).toFixed(2).replace(/\.00$/, '')} Birr
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Tip Section */}
          {serviceType !== "dine-in" && (
            <View style={styles.section} onLayout={handleSectionLayout("tip")}>
              <Text style={styles.sectionTitle}>Add a Tip</Text>
              <View style={styles.tipContainer}>
                {[0, 10, 20, 30, 50, 100].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.tipButton,
                      tip === amount && !customTip && styles.tipButtonSelected,
                    ]}
                    onPress={() => handleTipChange(amount)}
                  >
                    <Text
                      style={[
                        styles.tipButtonText,
                        tip === amount && !customTip && styles.tipButtonTextSelected,
                      ]}
                    >
                      {amount === 0 ? "No Tip" : `${amount} Birr`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.customTipContainer}>
                <Text style={styles.customTipLabel}>Custom Amount</Text>
                <TextInput
                  style={styles.customTipInput}
                  placeholder="Enter custom tip amount"
                  placeholderTextColor={colors.lightText}
                  value={customTip}
                  onChangeText={handleCustomTipChange}
                  keyboardType="numeric"
                  onEndEditing={handleTipStepCompletion}
                  onBlur={handleTipStepCompletion}
                />
              </View>
            </View>
          )}

          {/* Order Summary */}
          <View style={styles.orderSummaryCard} onLayout={handleSectionLayout("total")}>
            <View style={styles.orderSummaryContainer}>
              <Text style={styles.orderSummaryTitle}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{Number(subtotal).toFixed(2).replace(/\.00$/, '')} Birr</Text>
              </View>

              {(serviceType === "delivery" || serviceType === "gift") && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  {isDeliveryFeeLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={styles.summaryValue}>{Number(apiDeliveryFee).toFixed(2).replace(/\.00$/, '')} Birr</Text>
                  )}
                </View>
              )}

              {serviceType !== "dine-in" && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tip</Text>
                  <Text style={styles.summaryValue}>{Number(tip).toFixed(2).replace(/\.00$/, '')} Birr</Text>
                </View>
              )}

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                {isDeliveryFeeLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.totalValue}>{Number(total).toFixed(2).replace(/\.00$/, '')} Birr</Text>
                )}
              </View>
            </View>
          </View>

        
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer with Place Order Button */}
      {!isKeyboardVisible && (
        <View style={styles.footer}>
          <View style={styles.footerContainer}>
            <View style={styles.totalContainer}>
              <View>
                <Text style={styles.footerTotalLabel}>Total Amount</Text>
                {isDeliveryFeeLoading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text style={styles.totalAmount}>{total.toFixed(2)} Birr</Text>
                    )}
              </View>
              <View style={styles.orderTypeBadge}>
                <Text style={styles.orderTypeText}>{getServiceTypeLabel(serviceType)}</Text>
              </View>
            </View>

            <Button
              title={`Place ${getServiceTypeLabel(serviceType)} Order`}
              onPress={handlePlaceOrder}
              loading={isProcessing}
              disabled={
                isLoading ||
                isProcessing ||
                (serviceType === "delivery" && locationRefused && !selectedAddress) ||
                (serviceType === "dine-in" && !tableNumber) ||
                (serviceType === "pickup" && !pickupTime) ||
                (serviceType === "gift" && (!giftLocation || !reviserPhone))
              }
              style={styles.placeOrderButton}
              variant="primary"
              size="large"
              fullWidth
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
  },

  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
    fontSize: 16,
  },
  restaurantCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  restaurantCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.primary,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 8,
  },
  deliveryTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  deliveryTimeIcon: {
    marginRight: 8,
  },
  deliveryTimeText: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
    marginLeft: 4,
  },
  section: {
    marginBottom: 28,

  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  sectionTitleCompact: {
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.lightText,
    marginTop: 4,
  },
  sectionBadge: {
    backgroundColor: colors.primary + "12",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sectionHelperText: {
    fontSize: 13,
    color: colors.lightText,
    marginBottom: 12,
  },
  serviceTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    
  },
  serviceTypeButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceTypeButtonActive: {
    elevation: 8,
    shadowOpacity: 0.2,
  },
  serviceTypeGradient: {
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    minHeight: 100,
  },
  serviceTypeActive: {
    backgroundColor: colors.primary,
  },
  serviceTypeInactive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  serviceTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 12,
    textAlign: 'center',
    // Avoid clipping of descenders like 'y' on Android
    lineHeight: 18,
    paddingBottom: 2,
    includeFontPadding: false,
  },
  serviceTypeTextActive: {
    color: colors.white,
  },
  vehicleTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  vehicleTypeButton: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.divider,
    minHeight: 80,
  },
  vehicleTypeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "15",
  },
  vehicleEmoji: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 28,
  },
  vehicleTextContainer: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  vehicleTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: Platform.OS === "ios" ? 20 : 22,
    height: 20,
    includeFontPadding: false,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  vehicleTypeTextActive: {
    color: colors.primary,
    fontWeight: "600",
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: Platform.OS === "ios" ? 20 : 22,
    height: 20,
    includeFontPadding: false,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  addAddressButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  addAddressGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderWidth: 2,
    borderColor: colors.divider,
    borderStyle: "dashed",
    backgroundColor: colors.inputBackground,
  },
  addAddressText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 12,
  },
  addressesContainer: {
    gap: 12,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.divider,
  },
  selectedAddressCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "08",
  },
  addressSelectionIndicator: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
  },
  selectedAddressIndicator: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 26,
    minWidth: 60,
  },
  selectedTextContainer: {
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  selectedAddressText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "600",
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: Platform.OS === "ios" ? 14 : 16,
    height: 14,
    includeFontPadding: false,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  addressCardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  addressDetails: {
    flex: 1,
  },
  addressType: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  addressNote: {
    fontSize: 12,
    color: colors.lightText,
    fontStyle: 'italic',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.divider,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  addNewAddressButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  addNewAddressText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  defaultBadge: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  defaultAddressIndicator: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  defaultAddressText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "600",
  },
  tableNumberContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  tableNumberButton: {
    width: "30%",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.divider,
  },
  tableNumberButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "15",
  },
  tableNumberText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  tableNumberTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  pickupTimeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  pickupTimeButton: {
    width: "48%",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.divider,
  },
  pickupTimeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "15",
  },
  pickupTimeText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  pickupTimeTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  orderDescriptionContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.divider,
  },
  orderDescriptionInput: {
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 80,
  },
  orderItemsCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.primary + "10",
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: 12,
  },
  lastOrderItem: {
    borderBottomWidth: 0,
  },
  orderItemLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  quantityBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 12,
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  orderItemName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
    flexShrink: 1,
    marginBottom: 4,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemMeta: {
    fontSize: 12,
    color: colors.lightText,
  },
  orderItemRight: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    backgroundColor: colors.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  tipButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: colors.divider,
    width: "31%",
    alignItems: "center",
  },
  tipButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "15",
  },
  tipButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  tipButtonTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  customTipContainer: {
    marginTop: 8,
  },
  customTipLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
  },
  customTipInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.divider,
    fontSize: 16,
    color: colors.text,
  },
  orderSummaryCard: {
    marginBottom: 44,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  orderSummaryContainer: {
    padding: 24,
    backgroundColor: colors.white,
  },
  orderSummaryTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.lightText,
  },
  summaryValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    color: colors.lightText,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerContainer: {
    padding: 20,
    paddingTop: 3,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    backgroundColor: colors.white,
    marginTop: 0,

  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  footerTotalLabel: {
    fontSize: 14,
    color: colors.lightText,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  orderTypeBadge: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  orderTypeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  placeOrderButton: {
    marginBottom: 0,
  },

  // Location tracking styles
  locationContainer: {
    marginBottom: 12,
  },
  getLocationButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  getLocationGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderWidth: 2,
    borderColor: colors.divider,
    borderStyle: "dashed",
    backgroundColor: colors.inputBackground,
  },
  getLocationText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 12,
  },
  locationSuccessContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.success,
  },
  locationDetails: {
    flex: 1,
    marginLeft: 16,
  },
  locationStatusText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.success,
    marginBottom: 4,
  },
  locationCoordsText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  refreshLocationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  locationInfoText: {
    fontSize: 12,
    color: colors.lightText,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});