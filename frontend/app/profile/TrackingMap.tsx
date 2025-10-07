
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  Text,
  TouchableOpacity,
  Platform,
  Linking,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import io from "socket.io-client";
import { Truck, Bike, Navigation } from "lucide-react-native";

const { width, height } = Dimensions.get("window");
const ICON_SIZE = 32;

const INITIAL_REGION: Region = {
  latitude: 9.0125,
  longitude: 38.7635,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// Replace with your server URL (use env for production)
const SERVER_URL =
  process.env.EXPO_PUBLIC_SERVER_URL || "https://gebeta-delivery1.onrender.com";

interface TrackingMapProps {
  token: string;
  userId: string;
  orderId: string;
  deliveryVehicle?: string;
}

interface DeliveryLocation {
  latitude: number;
  longitude: number;
}

const TrackingMap: React.FC<TrackingMapProps> = ({
  token,
  userId,
  orderId,
  deliveryVehicle,
}) => {
  const [deliveryLocation, setDeliveryLocation] =
    useState<DeliveryLocation | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const mapRef = useRef<MapView>(null);

  // ✅ Improved: Opens Google Maps app if available, otherwise web fallback
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
      console.error("Error opening Google Maps:", err);
      Alert.alert(
        "Error",
        "Unable to open Google Maps. Please install the app or try again."
      );
    }
  };

  // Map deliveryVehicle to icon
  const getDeliveryIcon = (vehicle?: string) => {
    switch (vehicle) {
      case "Bicycle":
      case "Motor":
        return <Bike size={ICON_SIZE} color="#DC2626" />;
      case "Car":
      case "Truck":
      default:
        return <Truck size={ICON_SIZE} color="#DC2626" />;
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      Alert.alert("Error", "Token or User ID is required for tracking.");
      return;
    }

    const newSocket = io(SERVER_URL, { auth: { token } });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected for customer tracking");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("errorMessage", (error: string) => {
      console.error("Socket error:", error);
      Alert.alert("Connection Error", error);
    });

    newSocket.on(
      "deliveryLocationUpdate",
      (data: {
        orderId: string;
        location: DeliveryLocation;
        deliveryPersonId?: string;
      }) => {
        if (data.orderId === orderId) {
          console.log("📍 Received delivery update:", data.location);
          setDeliveryLocation(data.location);
          if (mapRef.current && data.location) {
            const newRegion: Region = {
              latitude: data.location.latitude,
              longitude: data.location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };
            mapRef.current.animateToRegion(newRegion, 1000);
          }
        }
      }
    );

    newSocket.on(
      "customerMessage",
      (message: { type: string; orderId: string }) => {
        if (message.type === "orderAccepted" && message.orderId === orderId) {
          console.log("✅ Order accepted, starting tracking");
        }
      }
    );

    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, [token, userId, orderId]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {deliveryLocation && (
          <Marker
            key="delivery-person"
            coordinate={deliveryLocation}
            title="Delivery Person"
            description="Your delivery is on the way!"
          >
            {getDeliveryIcon(deliveryVehicle)}
          </Marker>
        )}
      </MapView>

      {/* Button to open Google Maps */}
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
          <Text style={styles.buttonText}>Open in Google Maps</Text>
        </TouchableOpacity>
      )}

      {/* Connection status indicator */}
      {socket && (
        <View style={styles.status}>
          <Text style={{ color: isConnected ? "green" : "red" }}>
            {isConnected ? "Connected" : "Disconnected"}
          </Text>
        </View>
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
  status: {
    position: "absolute",
    top: 50,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 5,
    borderRadius: 5,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: { elevation: 5 },
    }),
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default TrackingMap;

