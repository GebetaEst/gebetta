'use client';
import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, StyleSheet, Dimensions, Text, ActivityIndicator, Image } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import io from "socket.io-client";
import { useAuthStore } from "@/store/useAuthStore";

const { width, height } = Dimensions.get("window");

type DeliveryLocation = {
  latitude: number;
  longitude: number;
  timestamp?: number;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  accuracy?: number;
  orderId?: string;
};

interface TrackingMapProps {
  orderId: string;
  disconnectToIo: boolean;
  setDisconnectToIo: (value: boolean) => void;
}

type TrackingInfo = { deliveryId: string; orderId: string };

const INITIAL_REGION: Region = {
  latitude: 9.0125,
  longitude: 38.7635,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const DEFAULT_SOCKET_URL = "https://api.bahirandelivery.cloud";

const TrackingMap: React.FC<TrackingMapProps> = ({ orderId, disconnectToIo, setDisconnectToIo }) => {
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  }, []);

  const addNotification = useCallback((message: string) => {
    setNotifications((prev) => [message, ...prev.slice(0, 9)]);
  }, []);
  
 console.log("disconnectToIo", disconnectToIo);
  // console.log("orderIIIIIIIIIIIIIIIId", orderId);
  useEffect(() => {
    if (!orderId || disconnectToIo === false) return;
  
    const socket = io(DEFAULT_SOCKET_URL, {
      auth: user?.token ? { token: user.token } : undefined,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;
    console.log("socket(++++++++++++++++++++++++)", user?.token);

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("customerRequestDeliveryLocation", { orderId });
      console.log("connected to socket(--------------------------------)");
      console.log("orderId", orderId);
    });
    console.log("isConnected", isConnected);

    // general server message
    socket.on("message", (msg: any) => {
      addLog(`Server: ${String(msg)}`);
    });

    // trackingStarted event
    socketRef.current.on("trackingStarted", (data: any) => {
      setIsTracking(true);
      setTrackingInfo({
        deliveryId: data?.deliveryId,
        orderId: data?.orderId,
      });
      addLog(`Tracking started - Order: ${data?.orderId}, Delivery Person: ${data?.deliveryId}`);
      addNotification(`Now tracking your delivery! Driver ID: ${data?.deliveryId}`);
    });

    socket.on("deliveryLocationUpdate", (data: any) => {
      const payload = data?.location ?? data;
      const lat = Number(payload?.latitude);
      const lng = Number(payload?.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        const loc: DeliveryLocation = {
          latitude: lat,
          longitude: lng,
          timestamp: payload?.timestamp ? new Date(payload.timestamp).getTime() : Date.now(),
          deliveryPersonId: payload?.deliveryPersonId,
          deliveryPersonName: payload?.deliveryPersonName,
          accuracy: typeof payload?.accuracy === 'number' ? payload.accuracy : undefined,
          orderId: payload?.orderId,
        };
        addLog(
          `Location update received: (${lat}, ${lng}) from ${payload?.deliveryPersonName || payload?.deliveryPersonId || "unknown"}`
        );
        setDeliveryLocation(loc);
        setLastUpdate(new Date(loc.timestamp || Date.now()).toLocaleTimeString());
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
            600
          );
        }
      }
    });

    // customer messages (notifications)
    socket.on("customerMessage", (data: any) => {
      const message = data?.message || JSON.stringify(data);
      addLog(`Notification: ${message}`);
      addNotification(data?.message || `Order update: ${data?.type}`);
      if (data?.type === "orderAccepted") {
        addLog(`Order ${data?.orderId} accepted by delivery person ${data?.deliveryPersonId}`);
      }
    });

    socket.on("trackingStopped", () => {
      setIsTracking(false);
      setTrackingInfo(null);
      addLog("Tracking stopped");
      addNotification("Delivery tracking has been stopped");
    });

    socket.on("connect_error", (err: any) => {
      setError(err?.message || "Connection error");
      setIsConnected(false);
      addLog(`Connection error: ${err?.message || String(err)}`);
    });

    socket.on("errorMessage", (msg: any) => {
      const message = typeof msg === "string" ? msg : JSON.stringify(msg);
      addLog(`Error: ${message}`);
      setError(message);
      if (typeof msg === "string" && (msg.includes("No active delivery") || msg.includes("offline"))) {
        setIsTracking(false);
        setTrackingInfo(null);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsTracking(false);
      setTrackingInfo(null);
      addLog("Disconnected");
      // console.log("disconnect(*********************************)");
    });

    return () => {
      try {
        socket.removeAllListeners();
        socket.disconnect();
      } catch {}
      socketRef.current = null;
    };
  }, [orderId, user?.token, disconnectToIo]);

  // React to external disconnect flag from parent
  useEffect(() => {
    if (disconnectToIo === false && socketRef.current) {
      try {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      } catch {}
      socketRef.current = null;
      setIsConnected(false);
      setIsTracking(false);
      setTrackingInfo(null);
      addLog("Disconnected by flag (disconnectToIo=false)");
    }
  }, [disconnectToIo, setDisconnectToIo, addLog]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {deliveryLocation && (
          <Marker
            coordinate={{ latitude: deliveryLocation.latitude, longitude: deliveryLocation.longitude }}
            title="Delivery"
            description={lastUpdate ? `Updated: ${lastUpdate}` : undefined}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Image
              source={require("../../assets/images/android-chrome-192x192.png")}
              style={styles.deliveryImage}
              resizeMode="contain"
            />
          </Marker>
        )}
      </MapView>

      {!deliveryLocation && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.overlayText}>
            {error ? `Error: ${error}` : isConnected ? "Waiting for location..." : "Connecting..."}
          </Text>
        </View>  
      )}

      {notifications.length > 0 && (
        <View style={styles.notifications}>
          {notifications.slice(0, 3).map((n, idx) => (
            <View key={`${n}-${idx}`} style={styles.notificationItem}>
              <Text style={styles.notificationText}>{n}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width, height },
  map: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    top: "50%",
    left: "40%",
    transform: [{ translateX: -90 }, { translateY: -25 }],
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayText: { color: "white", marginTop: 8, fontSize: 14 },
  deliveryImage: {
    width: 36,
    height: 36,
    borderRadius: 18, 
  },
  notifications: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    alignItems: "center",
    gap: 8,
  },
  notificationItem: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  notificationText: {
    color: "white",
    fontSize: 12,
  },
});

export default TrackingMap;