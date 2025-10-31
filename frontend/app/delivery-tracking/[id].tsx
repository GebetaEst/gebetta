import OrderStatusTracker from "@/components/OrderStatusTracker";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { restaurants } from "@/mocks/restaurants";
import { useCartStore } from "@/store/cartStore";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, MapPin, MessageCircle, Navigation, Phone } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { BackHandler } from 'react-native';
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useDeliveryTracking } from "@/hooks/useDeliveryTracking";

// Conditionally import MapView to avoid web issues
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let PROVIDER_GOOGLE: any = null;

// Only import on native platforms
if (Platform.OS !== "web") {
  try {
    const ReactNativeMaps = require("react-native-maps");
    MapView = ReactNativeMaps.default;
    Marker = ReactNativeMaps.Marker;
    Polyline = ReactNativeMaps.Polyline;
    PROVIDER_GOOGLE = ReactNativeMaps.PROVIDER_GOOGLE;
  } catch (error) {
    console.warn("react-native-maps could not be loaded", error);
  }
}

// Conditionally import Location to avoid web issues
let Location: any = null;
if (Platform.OS !== "web") {
  try {
    Location = require("expo-location");
  } catch (error) {
    console.warn("expo-location could not be loaded", error);
  }
}

export default function DeliveryTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getOrderById } = useCartStore();
  const mapRef = useRef<any>(null);
  
  // Activate hardware back prevention while on this screen
  usePreventBackNavigation(router);
  
  const order = getOrderById(id);
  const restaurant = restaurants.find(r => r.id === order?.restaurantId);
  
  // Use Firebase real-time tracking
  const { 
    deliveryOrder, 
    deliveryGuy, 
    isLoading: isTrackingLoading, 
    error: trackingError, 
    currentLocation: firebaseDriverLocation 
  } = useDeliveryTracking(id);
  
  // Use Firebase location if available, fallback to order data, then restaurant location
  const [driverLocation, setDriverLocation] = useState(
    firebaseDriverLocation || order?.driverInfo?.currentLocation || restaurant?.location
  );
  
  const [estimatedTime, setEstimatedTime] = useState<number>(
    order?.estimatedDeliveryTime ? parseInt(order.estimatedDeliveryTime.toString().split("-")[1]) : 30
  );

  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  
  // Update driver location when Firebase data changes
  useEffect(() => {
    if (firebaseDriverLocation) {
      console.log('📍 Updating driver location from Firebase:', firebaseDriverLocation);
      setDriverLocation(firebaseDriverLocation);
    }
  }, [firebaseDriverLocation]);
  
  useEffect(() => {
    if (Platform.OS !== "web" && Location) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          setLocationPermission(status === "granted");
          
          if (status === "granted") {
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        } catch (error) {
          console.warn("Error getting location:", error);
        }
      })();
    }
  }, []);
  
  // No longer need to simulate driver movement - using Firebase real-time data

  useEffect(() => {
    // Fit map to show all markers
    if (Platform.OS !== "web" && mapRef.current && restaurant?.location && order?.deliveryAddress?.location && driverLocation) {
      const points = [
        restaurant.location,
        order.deliveryAddress.location,
        driverLocation
      ];
      
      mapRef.current.fitToCoordinates(points, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [restaurant, order, driverLocation]);
  
  const handleCallDriver = () => {
    if (order?.driverInfo?.phone) {
      Linking.openURL(`tel:${order.driverInfo.phone}`);
    }
  };
  
  const handleMessageDriver = () => {
    if (order?.driverInfo?.phone) {
      Linking.openURL(`sms:${order.driverInfo.phone}`);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === "web" || !Location) return;
    
    Alert.alert(
      "Location Permission",
      "We need your location to show you on the map and provide better delivery tracking.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              const { status } = await Location.requestForegroundPermissionsAsync();
              setLocationPermission(status === "granted");
              
              if (status === "granted") {
                const location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                });
              }
            } catch (error) {
              console.warn("Error requesting location permission:", error);
            }
          }
        }
      ]
    );
  };
  
  // Show loading state while tracking data loads
  if (isTrackingLoading) {
    return (
      <View style={styles.notFound}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, { marginTop: 16 }]}>Loading delivery tracking...</Text>
      </View>
    );
  }

  // Show error if tracking failed
  if (trackingError) {
    return (
      <View style={styles.notFound}>
        <Text style={typography.heading3}>⚠️ Tracking Not Available</Text>
        <Text style={[typography.body, { marginTop: 8, textAlign: 'center' }]}>{trackingError}</Text>
        <Text style={[typography.bodySmall, { marginTop: 16, textAlign: 'center', color: colors.lightText }]}>
          Don't worry! Your order is still being processed. Tracking will be available once a delivery person accepts your order.
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: colors.white }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order || !restaurant) {
    return (
      <View style={styles.notFound}>
        <Text style={typography.heading2}>Order not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/profile")}
        >
          <Text style={styles.backButtonText}>Go to Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            // Replace instead of going back so Home isn't reachable via back
            router.replace('/(tabs)');
          }}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Tracking</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.mapContainer}>
        {Platform.OS === "web" || !MapView ? (
          <View style={[styles.map, { backgroundColor: "#e0e0e0", justifyContent: "center", alignItems: "center" }]}>
            <Text style={{ ...typography.body, color: colors.lightText }}>Map View</Text>
            <Text style={{ ...typography.caption, color: colors.lightText, marginTop: 8 }}>
              (Map would be displayed here in a real app)
            </Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: restaurant.location?.latitude,
              longitude: restaurant.location?.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* Polyline from restaurant to driver (if driver has accepted) */}
            {driverLocation && restaurant.location && (deliveryOrder?.status === 'Accepted' || deliveryOrder?.status === 'PickedUp' || deliveryOrder?.status === 'InTransit') && Polyline && (
              <Polyline
                coordinates={[
                  restaurant.location,
                  driverLocation,
                ]}
                strokeColor={colors.secondary}
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            )}
            
            {/* Polyline from driver to delivery address (if order picked up) */}
            {driverLocation && order.deliveryAddress?.location && (deliveryOrder?.status === 'PickedUp' || deliveryOrder?.status === 'InTransit') && Polyline && (
              <Polyline
                coordinates={[
                  driverLocation,
                  order.deliveryAddress.location,
                ]}
                strokeColor={colors.primary}
                strokeWidth={4}
              />
            )}

            {/* Restaurant marker */}
            <Marker
              coordinate={restaurant.location}
              title={restaurant.name}
              description="Restaurant location"
            >
              <View style={styles.restaurantMarker}>
                <MapPin size={24} color={colors.white} />
              </View>
            </Marker>
            
            {/* Delivery address marker */}
            {order.deliveryAddress?.location && (
              <Marker
                coordinate={order.deliveryAddress.location}
                title="Delivery Address"
                description={order.deliveryAddress.addressLine1}
              >
                <View style={styles.destinationMarker}>
                  <MapPin size={24} color={colors.white} />
                </View>
              </Marker>
            )}
            
            {/* Driver marker with animation */}
            {driverLocation && (
              <Marker
                coordinate={driverLocation}
                title={deliveryGuy?.deliveryPerson?.name || deliveryOrder?.deliveryPerson?.name || order.driverInfo?.name || "Delivery Driver"}
                description={`Status: ${deliveryOrder?.status || 'On the way'}`}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.driverMarker}>
                  <Navigation size={24} color={colors.white} />
                </View>
              </Marker>
            )}

            {/* User location marker */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Your Location"
              >
                <View style={styles.userMarker}>
                  <View style={styles.userMarkerInner} />
                </View>
              </Marker>
            )}
          </MapView>
        )}

        {!locationPermission && Platform.OS !== "web" && Location && (
          <TouchableOpacity 
            style={styles.locationPermissionButton}
            onPress={requestLocationPermission}
          >
            <Text style={styles.locationPermissionText}>Show my location</Text>
          </TouchableOpacity>
        )}

        {/* Real-time tracking indicator */}
        {deliveryOrder && (
          <View style={styles.trackingStatusIndicator}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            {deliveryOrder.lastLocationUpdate && (
              <Text style={styles.lastUpdateText}>
                Updated {new Date(deliveryOrder.lastLocationUpdate).toLocaleTimeString()}
              </Text>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.statusContainer}>
          <OrderStatusTracker status={deliveryOrder?.status || order.status} />
        </View>
        
        {/* Delivery Status Info */}
        {deliveryOrder && (
          <View style={styles.deliveryStatusInfo}>
            <Text style={styles.deliveryStatusLabel}>Current Status</Text>
            <Text style={styles.deliveryStatusValue}>{deliveryOrder.status}</Text>
            {deliveryGuy?.isTracking && (
              <Text style={styles.trackingActiveText}>📍 Location tracking active</Text>
            )}
          </View>
        )}
        
        <View style={styles.estimatedTimeContainer}>
          <Text style={styles.estimatedTimeLabel}>Estimated Arrival</Text>
          <Text style={styles.estimatedTimeValue}>
            {estimatedTime} minutes
          </Text>
        </View>
        
        {/* Show driver info if available from Firebase or order data */}
        {((deliveryOrder?.deliveryPerson || deliveryGuy?.deliveryPerson || order.driverInfo) && (order.status === "out-for-delivery" || deliveryOrder?.status)) && (
          <View style={styles.driverContainer}>
            <View style={styles.driverHeader}>
              {order.driverInfo?.photoUrl && (
                <Image
                  source={{ uri: order.driverInfo.photoUrl }}
                  style={styles.driverImage}
                  contentFit="cover"
                />
              )}
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>
                  {deliveryGuy?.deliveryPerson?.name || deliveryOrder?.deliveryPerson?.name || order.driverInfo?.name || "Delivery Driver"}
                </Text>
                <Text style={styles.driverRole}>Your Delivery Driver</Text>
                {deliveryGuy?.deliveryPerson?.deliveryMethod && (
                  <Text style={styles.driverVehicle}>🛵 {deliveryGuy.deliveryPerson.deliveryMethod}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.driverActions}>
              <TouchableOpacity
                style={styles.driverAction}
                onPress={handleCallDriver}
              >
                <Phone size={20} color={colors.white} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.driverAction}
                onPress={handleMessageDriver}
              >
                <MessageCircle size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.deliveryAddressContainer}>
          <Text style={styles.deliveryAddressTitle}>Delivery Address</Text>
          <Text style={styles.deliveryAddress}>
            {order.deliveryAddress?.addressLine1}
            {order.deliveryAddress?.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ""}
            {", "}
            {order.deliveryAddress?.city}
          </Text>
          
          {order.deliveryAddress?.instructions && (
            <Text style={styles.deliveryInstructions}>
              Note: {order.deliveryAddress.instructions}
            </Text>
          )}
        </View>
        
        <View style={styles.orderSummaryContainer}>
          <Text style={styles.orderSummaryTitle}>Order Summary</Text>
          
          <View style={styles.orderItems}>
            {order.items.map((item) => (
              <View key={item.menuItemId} style={styles.orderItem}>
                <Text style={styles.orderItemQuantity}>{item.quantity}x</Text>
                <Text style={styles.orderItemName}>{item.name}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{order.totalAmount.toFixed(2)} Birr</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Prevent Android hardware back button from navigating back to previous screens
// when on the delivery tracking screen. We replace to the tabs root instead.
// This is a safety-net in case navigation used push elsewhere.
function usePreventBackNavigation(router: any) {
  useEffect(() => {
    const onBackPress = () => {
      // Replace stack to root tabs (safe place) and consume the event
      router.replace('/(tabs)');
      return true; // Prevent default behavior
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [router]);
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...typography.heading3,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  mapContainer: {
    height: height * 0.4,
    width: width,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  restaurantMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary + "40",
    justifyContent: "center",
    alignItems: "center",
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  locationPermissionButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationPermissionText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  statusContainer: {
    marginBottom: 16,
  },
  estimatedTimeContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  estimatedTimeLabel: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginBottom: 4,
  },
  estimatedTimeValue: {
    ...typography.heading2,
    color: colors.primary,
  },
  driverContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.inputBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    ...typography.heading4,
    marginBottom: 2,
  },
  driverRole: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  driverActions: {
    flexDirection: "row",
  },
  driverAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  deliveryAddressContainer: {
    marginBottom: 24,
  },
  deliveryAddressTitle: {
    ...typography.heading4,
    marginBottom: 8,
  },
  deliveryAddress: {
    ...typography.body,
    marginBottom: 4,
  },
  deliveryInstructions: {
    ...typography.bodySmall,
    color: colors.lightText,
    fontStyle: "italic",
  },
  orderSummaryContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 16,
  },
  orderSummaryTitle: {
    ...typography.heading4,
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  orderItemQuantity: {
    ...typography.body,
    fontWeight: "600",
    marginRight: 8,
    width: 30,
  },
  orderItemName: {
    ...typography.body,
    flex: 1,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
  },
  totalLabel: {
    ...typography.heading4,
  },
  totalValue: {
    ...typography.heading4,
    color: colors.primary,
  },
  trackingStatusIndicator: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 6,
  },
  liveText: {
    ...typography.caption,
    color: "#22c55e",
    fontWeight: "700",
    fontSize: 10,
  },
  lastUpdateText: {
    ...typography.caption,
    color: colors.lightText,
    fontSize: 10,
  },
  deliveryStatusInfo: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  deliveryStatusLabel: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginBottom: 4,
  },
  deliveryStatusValue: {
    ...typography.heading3,
    color: colors.primary,
    marginBottom: 8,
  },
  trackingActiveText: {
    ...typography.caption,
    color: "#22c55e",
    fontWeight: "600",
  },
  driverVehicle: {
    ...typography.caption,
    color: colors.lightText,
    marginTop: 2,
  },
});
