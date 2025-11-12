import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE, MapPressEvent } from "react-native-maps";
import * as Location from "expo-location";

type Coordinates = { lat: number | null; lng: number | null };
type MapType = "standard" | "satellite" | "hybrid" | "terrain";

const SendGift: React.FC<{ setGiftLocation: (location: { latitude: number, longitude: number }) => void, giftLocation: { latitude: number, longitude: number } | null }> = ({ setGiftLocation, giftLocation }) => {
  const [address, setAddress] = useState<string>("");
  const [coords, setCoords] = useState<Coordinates>({ lat: null, lng: null });
  const [processing, setProcessing] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 9.0108, // Default center (Addis Ababa)
    longitude: 38.7613,
    latitudeDelta: 5.05,
    longitudeDelta: 5.05,
  });
  const [mapType, setMapType] = useState<MapType>("satellite");
  const [is3D, setIs3D] = useState(true);

  // 🧭 When coordinates change, update map region
  useEffect(() => {
    if (coords.lat && coords.lng) {
      setMapRegion({
        latitude: coords.lat,
        longitude: coords.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [coords]);

  // 📍 Handle text address search using Expo Location
  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!address.trim()) return;

    setProcessing(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Allow location access to search places.");
        setProcessing(false);
        return;
      }

      const results = await Location.geocodeAsync(address);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        setCoords({ lat: latitude, lng: longitude });
        setGiftLocation({ latitude, longitude });
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        Alert.alert("Location not found", "Try a more specific address.");
      }
    } catch (error) {
      console.log("Geocoding error:", error);
      Alert.alert("Error", "Could not find coordinates for this address.");
    }
    setProcessing(false);
  };

  // 🗺️ Handle tap on map to get coordinates
  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCoords({ lat: latitude, lng: longitude });
    setGiftLocation({ lat: latitude, lng: longitude });
    setMapRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  // 🎛️ Toggle 3D map tilt
  const toggle3D = () => {
    setIs3D(!is3D);
  };

  const getCamera = () => ({
    center: {
      latitude: mapRegion.latitude,
      longitude: mapRegion.longitude,
    },
    pitch: 0 ,
    heading: 0,
    altitude: 1000,
    zoom: 17,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Enter a place name or tap anywhere on the map to select a location.
      </Text>

      <TextInput
        placeholder="Enter address (e.g., Ethiopia, Addis Ababa, Ayertena)"
        value={address}
        onChangeText={setAddress}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        editable={!processing}
      />

      <TouchableOpacity
        style={[styles.button, (!address.trim() || processing) && { opacity: 0.5 }]}
        activeOpacity={0.8}
        disabled={!address.trim() || processing}
        onPress={handleSearch}
      >
        <Text style={styles.buttonText}>{processing ? "Searching..." : "Find Location"}</Text>
      </TouchableOpacity>

      {/* Map Style Selector */}
      <View style={styles.mapStyleContainer}>
        <Text style={styles.mapStyleLabel}>Map Style:</Text>
        <View style={styles.mapTypeRow}>
          {(["standard", "satellite", "hybrid"] as MapType[]).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setMapType(type)}
              style={[
                styles.mapTypeButton,
                mapType === type && styles.selectedMapTypeButton,
              ]}
            >
              <Text
                style={[
                  styles.mapTypeButtonText,
                  mapType === type && styles.selectedMapTypeButtonText,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={mapRegion}
          mapType={mapType}
          onPress={handleMapPress}
          showsBuildings
          showsCompass
          showsPointsOfInterest
          pitchEnabled
          rotateEnabled
          initialCamera={getCamera()}
          camera={getCamera()}
        >
          {coords.lat && coords.lng && (
            <Marker
              coordinate={{
                latitude: coords.lat,
                longitude: coords.lng,
              }}
              title="Selected Location"
              description={`Lat: ${coords.lat}, Lng: ${coords.lng}`}
            />
          )}
        </MapView>
      </View>

      {/* Coordinates Display */}
      {coords.lat && coords.lng ? (
        <View style={styles.coordsContainer}>
          <Text style={styles.label}>Latitude:</Text>
          <Text style={styles.value}>{coords.lat}</Text>
          <Text style={styles.label}>Longitude:</Text>
          <Text style={styles.value}>{coords.lng}</Text>
        </View>
      ) : (
        <Text style={styles.placeholder}>Tap on the map or search an address</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff", padding: 6 },
  heading: { fontSize: 22, fontWeight: "800", color: "#333", marginBottom: 6, marginTop: 18 },
  instructions: { fontSize: 15, color: "#555", marginBottom: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#96B7FF",
    backgroundColor: "#FFF",
    padding: 13,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#4C8BF5",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  mapStyleContainer: { marginBottom: 10 },
  mapStyleLabel: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 6 },
  mapTypeRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 8 },
  mapTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
    minWidth: 60,
    alignItems: "center",
  },
  selectedMapTypeButton: { backgroundColor: "#4C8BF5", borderColor: "#4C8BF5" },
  mapTypeButtonText: { fontSize: 12, fontWeight: "500", color: "#666" },
  selectedMapTypeButtonText: { color: "#FFF" },
  toggleButton: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  selectedToggleButton: { backgroundColor: "#10B981" },
  toggleButtonText: { fontSize: 14, fontWeight: "500", color: "#374151" },
  selectedToggleButtonText: { color: "#FFF" },
  mapContainer: {
    width: "100%",
    height: 280,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
  },
  map: { width: "100%", height: "100%" },
  coordsContainer: {
    backgroundColor: "#EDF2FF",
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
  },
  label: { fontWeight: "700", fontSize: 15, color: "#3756a3" },
  value: { fontSize: 16, marginBottom: 7, color: "#333" },
  placeholder: { color: "#9CA3AF", fontStyle: "italic", fontSize: 16, marginTop: 8 },
});

export default SendGift;
