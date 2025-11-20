import React, { useState, useEffect, useRef } from "react";
import { BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  Text,
  TouchableOpacity,
  Platform,
  Linking,
  Vibration,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Region, Polyline } from "react-native-maps";
import { Truck, Bike, Navigation, MapPin } from "lucide-react-native";
import { ref, onValue, off, Database } from 'firebase/database';
import { Audio } from 'expo-av';
import { fetchAndInitializeFirebase } from '@/services/firebaseConfigService';
import { useAuthStore } from '@/store/useAuthStore'; 

const { width, height } = Dimensions.get("window");
const ICON_SIZE = 32;

const INITIAL_REGION: Region = {
  latitude: 9.0125,
  longitude: 38.7635,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

interface TrackingMapProps {
  orderId: string; // Can be MongoDB _id or orderCode (e.g., "ORD-706807")
}

interface DeliveryLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

interface Location {
  lat: number;
  lng: number;
}

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  deliveryMethod: string;
}

interface OrderData {
  orderId: string;
  orderCode: string;
  deliveryLocation: DeliveryLocation;
  lastLocationUpdate: string;
  deliveryPerson: DeliveryPerson;
  status: string;
  orderStatus: string;
  trackingEnabled: boolean;
  restaurantName?: string;
  restaurantLocation?: Location;
  customerLocation?: Location;
  destinationLocation?: Location; // Added for order.destinationLocation
  deliveryFee?: number;
  tip?: number;
  customerName?: string;
  customerPhone?: string;
  pickUpVerificationCode?: string;
}

const TrackingMap: React.FC<TrackingMapProps> = ({ orderId }) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("Loading...");
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [restaurantLocation, setRestaurantLocation] = useState<Location | null>(null);
  const [customerLocation, setCustomerLocation] = useState<Location | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [distanceLeft, setDistanceLeft] = useState<string>("");
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{latitude: number, longitude: number}>>([]);
  const [showRecenterButton, setShowRecenterButton] = useState(false); // Show recenter button after user interaction
  const [hasNotified500m, setHasNotified500m] = useState(false);
  const [hasNotified200m, setHasNotified200m] = useState(false);
  const [hasNotified100m, setHasNotified100m] = useState(false);
  const [hasNotifiedArrived, setHasNotifiedArrived] = useState(false);
  const [firebaseDatabase, setFirebaseDatabase] = useState<Database | null>(null);
  const [updateInterval, setUpdateInterval] = useState<number>(3); // Default 3 seconds
  const [isInitializingFirebase, setIsInitializingFirebase] = useState(true);
  const mapRef = useRef<MapView>(null);
  const hasInitiallyFitted = useRef(false); // Track if we've done initial fit
  const hasLoadedRoute = useRef(false); // Track if route has been loaded

  // Opens Google Maps for navigation
  const openGoogleMaps = async (lat: number, lng: number) => {
    const scheme = Platform.OS === "ios" ? "comgooglemaps://" : "geo:";
    const appUrl =
      Platform.OS === "ios"
        ? `${scheme}?q=${lat},${lng}&center=${lat},${lng}&zoom=14`
        : `${scheme}${lat},${lng}?q=${lat},${lng}`;
    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    try {
      const supported = await Linking.canOpenURL(appUrl);
      if (supported) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(fallbackUrl);
      }
    } catch (err) {
      Alert.alert("Error", "Unable to open Google Maps.");
    }
  };

  // Get delivery icon based on method
  const getDeliveryIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case "bicycle":
      case "bike":
      case "motor":
        return <Bike size={ICON_SIZE} color="#DC2626" />;
      case "car":
      case "truck":
      default:
        return <Truck size={ICON_SIZE} color="#DC2626" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "#FFA500";
      case "PickedUp":
        return "#FF9800";
      case "InTransit":
      case "Delivering":
        return "#2196F3";
      case "Delivered":
        return "#4CAF50";
      default:
        return "#9E9E9E";
    }
  };

  // Calculate distance between two points in meters
  const calculateDistance = (from: Location, to: Location): number => {
    const R = 6371000; // Earth radius in meters
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLon = (to.lng - from.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in meters
    return distance;
  };

  // Format distance for display
  const formatDistance = (distanceInMeters: number): string => {
    if (distanceInMeters < 1000) {
      // Show in meters if less than 1km
      return `${Math.round(distanceInMeters)}m`;
    } else {
      // Show in km with 1 decimal place
      const km = distanceInMeters / 1000;
      return `${km.toFixed(1)} km`;
    }
  };

  // Decode polyline from OSRM routing service
  const decodePolyline = (encoded: string): Array<{latitude: number, longitude: number}> => {
    const points: Array<{latitude: number, longitude: number}> = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  };

  // Get route from OSRM (FREE - no API key needed!)
  const getRouteFromOSRM = async (origin: DeliveryLocation, destination: Location) => {
    try {
      // OSRM uses longitude,latitude format (opposite of Google!)
      const originStr = `${origin.longitude},${origin.latitude}`;
      const destStr = `${destination.lng},${destination.lat}`;
      
      // Using OSRM - completely FREE and no API key required
      const url = `https://router.project-osrm.org/route/v1/driving/${originStr};${destStr}?overview=full&geometries=polyline`;

      console.log('🗺️ Fetching route from OSRM (one-time call)...');
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const points = decodePolyline(route.geometry);
        setRouteCoordinates(points);
        
        // Get actual distance and duration from OSRM
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMin = Math.round(route.duration / 60);
        
        console.log(`✅ Route loaded: ${points.length} points, ${distanceKm} km, ${durationMin} min`);
        hasLoadedRoute.current = true;
      } else {
        console.warn('⚠️ Could not get route from OSRM, using straight line');
        // Fallback to straight line
        setRouteCoordinates([
          { latitude: origin.latitude, longitude: origin.longitude },
          { latitude: destination.lat, longitude: destination.lng }
        ]);
        hasLoadedRoute.current = true;
      }
    } catch (error) {
      console.error('❌ Error fetching route from OSRM:', error);
      // Fallback to straight line on error
      setRouteCoordinates([
        { latitude: origin.latitude, longitude: origin.longitude },
        { latitude: destination.lat, longitude: destination.lng }
      ]);
      hasLoadedRoute.current = true;
    }
  };

  // Calculate estimated time based on distance and speed
  const calculateEstimatedTime = (from: Location, to: Location) => {
    const distance = calculateDistance(from, to) / 1000; // Convert to km
    
    // Assume average speed of 20 km/h for delivery
    const timeInHours = distance / 20;
    const timeInMinutes = Math.round(timeInHours * 60);
    
    return timeInMinutes > 0 ? `${timeInMinutes} min` : "Arriving soon";
  };

  // Play notification sound and vibrate
  const playNotificationSound = async () => {
    try {
      // Enable audio playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Create and play a beep sound (system sound)
      const { sound } = await Audio.Sound.createAsync(
        // Using Expo's system notification sound
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { shouldPlay: true, volume: 1.0 }
      ).catch((error: any) => {
        console.log('Sound loading error, using vibration only:', error);
        return { sound: null };
      });
      
      // Vibrate in a pattern: vibrate for 500ms, pause 200ms, vibrate 500ms
      Vibration.vibrate([0, 500, 200, 500, 200, 500]);

      if (sound) {
        await sound.playAsync();
        // Unload sound after playing
        setTimeout(() => {
          sound.unloadAsync();
        }, 5000);
      }
    } catch (error) {
      console.log('Notification error, using vibration fallback:', error);
      // Fallback to vibration only
      Vibration.vibrate([0, 500, 200, 500, 200, 500]);
    }
  };

  // Check proximity and send notifications
  const checkProximityAndNotify = (deliveryLoc: DeliveryLocation, customerLoc: Location) => {
    const distance = calculateDistance(
      { lat: deliveryLoc.latitude, lng: deliveryLoc.longitude },
      customerLoc
    );

    console.log(`📏 Distance to customer: ${Math.round(distance)}m`);

    // Notify at 500m
    if (distance <= 500 && distance > 200 && !hasNotified500m) {
      setHasNotified500m(true);
      playNotificationSound();
      Alert.alert(
        "🚚 Delivery Approaching!",
        "Your delivery is 500 meters away and will arrive soon!",
        [{ text: "OK", style: "default" }],
        { cancelable: true }
      );
    }
    // Notify at 200m
    else if (distance <= 200 && distance > 100 && !hasNotified200m) {
      setHasNotified200m(true);
      playNotificationSound();
      Alert.alert(
        "🎯 Almost There!",
        "Your delivery is only 200 meters away!",
        [{ text: "OK", style: "default" }],
        { cancelable: true }
      );
    }
    // Notify at 100m
    else if (distance <= 100 && distance > 50 && !hasNotified100m) {
      setHasNotified100m(true);
      playNotificationSound();
      Alert.alert(
        "📍 Very Close!",
        "Your delivery is 100 meters away. Get ready!",
        [{ text: "OK", style: "default" }],
        { cancelable: true }
      );
    }
    // Notify when arrived (within 50m)
    else if (distance <= 50 && !hasNotifiedArrived) {
      setHasNotifiedArrived(true);
      playNotificationSound();
      Alert.alert(
        "🎉 Delivery Arrived!",
        "Your delivery person has arrived at your location!",
        [{ text: "Great!", style: "default" }],
        { cancelable: true }
      );
    }
  };

  // Initialize Firebase with dynamic config
  useEffect(() => {
    const initFirebase = async () => {
      if (!user?.token) {
        Alert.alert("Error", "Authentication token is required for tracking.");
        setIsInitializingFirebase(false);
        return;
      }

      try {
        setIsInitializingFirebase(true);
        const { database, config } = await fetchAndInitializeFirebase(user.token);
        setFirebaseDatabase(database);
        
        // Set update interval from config (convert string to number)
        const interval = parseInt(config.sendDurationInSeconds || '3', 10);
        setUpdateInterval(interval);
        
        console.log(`✅ Firebase ready. Updates every ${interval} seconds`);
        setIsInitializingFirebase(false);
      } catch (error) {
        console.error('❌ Failed to initialize Firebase:', error);
        Alert.alert(
          "Firebase Error",
          "Unable to initialize real-time tracking. Please try again later."
        );
        setIsInitializingFirebase(false);
      }
    };

    initFirebase();
  }, [user?.token]);

  // Listen to Firebase updates
  useEffect(() => {
    if (!orderId || !firebaseDatabase) {
      return;
    }

    console.log(`📡 Starting real-time tracking for order: ${orderId}`);
    
    // Create Firebase reference for the specific order
    const orderRef = ref(firebaseDatabase, `deliveryOrders/${orderId}`);

    // Listen for real-time updates (updates every sendDurationInSeconds from delivery guy)
    const unsubscribe = onValue(
      orderRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const orderData: OrderData = snapshot.val();
          console.log(`📍 Location update received (updates every ${updateInterval}s)`);

          // Update delivery guy's current location
          if (orderData.deliveryLocation) {
            setDeliveryLocation(orderData.deliveryLocation);
            setIsTracking(true);

            // Use destinationLocation first, then fall back to customerLocation
            const destinationLoc = orderData.destinationLocation || orderData.customerLocation;

             // Calculate estimated time and distance if we have destination location
             if (destinationLoc) {
               const from = { 
                 lat: orderData.deliveryLocation.latitude, 
                 lng: orderData.deliveryLocation.longitude 
               };
               const eta = calculateEstimatedTime(from, destinationLoc);
               setEstimatedTime(eta);

               // Calculate and display distance left
               const distance = calculateDistance(from, destinationLoc);
               const formattedDistance = formatDistance(distance);
               setDistanceLeft(formattedDistance);

               // Load route ONLY ONCE when tracking starts
               if (!hasLoadedRoute.current) {
                 getRouteFromOSRM(orderData.deliveryLocation, destinationLoc);
               }

               // Check proximity and send notifications if delivery is approaching
               checkProximityAndNotify(orderData.deliveryLocation, destinationLoc);
             }

            // Animate map to show all markers - ONLY on initial load
            // After that, let user control the zoom/pan for better live tracking
            if (
              mapRef.current && 
              orderData.restaurantLocation && 
              destinationLoc &&
              !hasInitiallyFitted.current
            ) {
              const coordinates = [
                { latitude: orderData.restaurantLocation.lat, longitude: orderData.restaurantLocation.lng },
                { latitude: orderData.deliveryLocation.latitude, longitude: orderData.deliveryLocation.longitude },
                { latitude: destinationLoc.lat, longitude: destinationLoc.lng },
              ];
              
              mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                animated: true,
              });
              
              // Mark that we've done the initial fit
              hasInitiallyFitted.current = true;
            }
          }

          // Update delivery person info
          if (orderData.deliveryPerson) {
            setDeliveryPerson(orderData.deliveryPerson);
          }

          // Update order status
          const status = orderData.orderStatus || orderData.status || "Unknown";
          setOrderStatus(status);

          // Update restaurant info
          if (orderData.restaurantLocation) {
            setRestaurantLocation(orderData.restaurantLocation);
          }
          if (orderData.restaurantName) {
            setRestaurantName(orderData.restaurantName);
          }

          // Update customer/destination location (prioritize destinationLocation)
          if (orderData.destinationLocation) {
            setCustomerLocation(orderData.destinationLocation);
          } else if (orderData.customerLocation) {
            setCustomerLocation(orderData.customerLocation);
          }

          // Update last update time
          if (orderData.lastLocationUpdate) {
            const updateTime = new Date(orderData.lastLocationUpdate);
            setLastUpdate(updateTime.toLocaleTimeString());
          }

        } else {
          setIsTracking(false);
          setOrderStatus("No tracking data available");
          console.log('⚠️ No tracking data found in Firebase');
        }
      },
      (error) => {
        console.error('❌ Firebase tracking error:', error);
        Alert.alert(
          "Tracking Error",
          "Unable to track delivery. Please check your connection."
        );
        setIsTracking(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      console.log('🔌 Disconnecting Firebase listener');
      off(orderRef, "value", unsubscribe);
    };
  }, [orderId, firebaseDatabase, updateInterval]);

  // Prevent Android hardware back from returning to a previous Home screen
  useEffect(() => {
    const onBackPress = () => {
      // Replace to tabs root so Home or previous screen isn't reachable
      router.replace('/(tabs)');
      return true; // prevent default
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      backHandler.remove(); // Use .remove() instead of removeEventListener
    };
  }, [router]);

  // Handle user interaction with map (zoom/pan)
  const handleRegionChange = () => {
    // Show recenter button after user has interacted
    if (!showRecenterButton) {
      setShowRecenterButton(true);
    }
  };

  // Recenter map to show all markers
  const recenterMap = () => {
    if (mapRef.current && restaurantLocation && customerLocation && deliveryLocation) {
      const coordinates = [
        { latitude: restaurantLocation.lat, longitude: restaurantLocation.lng },
        { latitude: deliveryLocation.latitude, longitude: deliveryLocation.longitude },
        { latitude: customerLocation.lat, longitude: customerLocation.lng },
      ];
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      {isInitializingFirebase ? (
        <View style={styles.initLoadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.initLoadingText}>Initializing real-time tracking...</Text>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={INITIAL_REGION}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsTraffic={false}
            onRegionChangeComplete={handleRegionChange}
            onPanDrag={handleRegionChange}
          >
         {/* Restaurant/Pickup Location - START POINT */}
         {restaurantLocation && (
           <Marker
             coordinate={{
               latitude: restaurantLocation.lat,
               longitude: restaurantLocation.lng,
             }}
             title={restaurantName || "Restaurant"}
             description="🏪 Pickup Location (Start)"
           >
             <View style={styles.restaurantMarker}>
               <MapPin size={30} color="#FFFFFF" />
               <Text style={styles.markerLabel}>START</Text>
             </View>
           </Marker>
         )}

         {/* Delivery Guy Current Location - MOVING BETWEEN START AND END */}
         {deliveryLocation && (
           <Marker
             coordinate={deliveryLocation}
             title={deliveryPerson?.name || "Delivery Person"}
             description={`🚚 ${orderStatus} • ${deliveryPerson?.deliveryMethod || "Vehicle"}`}
             anchor={{ x: 0.5, y: 0.5 }}
           >
             <View style={styles.deliveryMarker}>
               {getDeliveryIcon(deliveryPerson?.deliveryMethod)}
               <View style={styles.pulseCircle} />
             </View>
           </Marker>
         )}

         {/* Customer/Destination Location - END POINT */}
         {customerLocation && (
           <Marker
             coordinate={{
               latitude: customerLocation.lat,
               longitude: customerLocation.lng,
             }}
             title="Delivery Destination"
             description="📍 Your Location (End)"
           >
             <View style={styles.destinationMarker}>
               <MapPin size={30} color="#FFFFFF" />
               <Text style={styles.markerLabel}>END</Text>
             </View>
           </Marker>
         )}

         {/* Route from delivery guy to customer - Using actual road route */}
         {routeCoordinates.length > 0 && (
           <Polyline
             coordinates={routeCoordinates}
             strokeColor="#2196F3"
             strokeWidth={4}
             lineDashPattern={[1, 0]} // Solid line for actual route
           />
         )}
      </MapView>

      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderStatus) }]}>
          <Text style={styles.statusText}>{orderStatus}</Text>
        </View>
        {lastUpdate && (
          <Text style={styles.lastUpdateText}>Updated: {lastUpdate}</Text>
        )}
        {distanceLeft && orderStatus !== "Delivered" && (
          <Text style={styles.distanceText}>📍 {distanceLeft} away</Text>
        )}
        {estimatedTime && orderStatus !== "Delivered" && (
          <Text style={styles.etaText}>🕒 ETA: {estimatedTime}</Text>
        )}
      </View>

      {/* Recenter Button - Show after user has interacted */}
      {showRecenterButton && deliveryLocation && (
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={recenterMap}
          activeOpacity={0.8}
        >
          <Navigation size={18} color="#4285F4" />
          <Text style={styles.recenterText}>Recenter</Text>
        </TouchableOpacity>
      )}

      {/* Delivery Person Info Card */}
      {deliveryPerson && (
        <View style={styles.driverCard}>
          <Text style={styles.driverTitle}>Your Delivery Person</Text>
          <Text style={styles.driverName}>{deliveryPerson.name}</Text>
          <Text style={styles.driverPhone}>📞 {deliveryPerson.phone}</Text>
          <Text style={styles.driverMethod}>
            🚚 {deliveryPerson.deliveryMethod}
          </Text>
          {restaurantName && (
            <Text style={styles.restaurantText}>🏪 From: {restaurantName}</Text>
          )}
        </View>
      )}

      {/* Open in Google Maps Button */}
      {deliveryLocation && (
        <TouchableOpacity
          style={styles.googleMapsButton}
          onPress={() =>
            openGoogleMaps(
              deliveryLocation.latitude,
              deliveryLocation.longitude
            )
          }
        >
          <Navigation size={20} color="white" />
          <Text style={styles.buttonText}>Track in Google Maps</Text>
        </TouchableOpacity>
      )}

          {/* Loading Indicator */}
          {!isTracking && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                {orderStatus === "Loading..." ? "Loading tracking data..." : orderStatus}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  restaurantMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryMarker: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#DC2626',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DC2626',
    opacity: 0.2,
    zIndex: -1,
  },
  markerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusContainer: {
    position: "absolute",
    top: 50,
    right: 10,
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  lastUpdateText: {
    marginTop: 5,
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "white",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  distanceText: {
    marginTop: 5,
    backgroundColor: "#2196F3",
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  etaText: {
    marginTop: 5,
    backgroundColor: "#4CAF50",
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  driverCard: {
    position: "absolute",
    top: 120,
    left: 10,
    right: 10,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  driverTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  driverPhone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  driverMethod: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  restaurantText: {
    fontSize: 13,
    color: "#FF9800",
    fontWeight: "600",
    marginTop: 5,
  },
  googleMapsButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#4285F4",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -75 }, { translateY: -25 }],
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 15,
    borderRadius: 10,
  },
  loadingText: {
    color: "white",
    fontSize: 14,
  },
  recenterButton: {
    position: "absolute",
    top: 50,
    left: 10,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recenterText: {
    color: "#4285F4",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 5,
  },
  initLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  initLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default TrackingMap;