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
  KeyboardAvoidingView,
  Image,
} from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE, MapPressEvent } from "react-native-maps";
import * as Location from "expo-location";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "@/components/Button";

type Coordinates = { lat: number | null; lng: number | null };
type MapType = "standard" | "satellite" | "hybrid" | "terrain";

const SendGift: React.FC<{ setGiftLocation: (location: { lat: number, lng: number }) => void, giftLocation: { lat: number, lng: number } | null }> = ({ setGiftLocation, giftLocation }) => {
  const [address, setAddress] = useState<string>("");
  const [coords, setCoords] = useState<Coordinates>({ lat: null, lng: null });
  const [processing, setProcessing] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 9.0108, // Default center (Addis Ababa)
    longitude: 38.7613,
    latitudeDelta: 5.05,
    longitudeDelta: 5.05,
  });
  const [mapType, setMapType] = useState<MapType>("standard");
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
        setGiftLocation({ lat: latitude, lng: longitude });
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
    pitch: 0,
    heading: 0,
    altitude: 1000,
    zoom: 17,
  });

  return (
    <View style={styles.container}>
      {/* <Text style={styles.sectionTitle}>Select Gift Location</Text> */}
      <Text style={styles.instructions}>
        Enter a place name or tap anywhere on the map to select a location.
      </Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.textInputWrapper}>
          <TextInput
            placeholder="Enter address (e.g., Ethiopia, Addis Ababa, Ayertena)"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            editable={!processing}
            placeholderTextColor={colors.lightText}
          />
        </View>
      </KeyboardAvoidingView>

      <Button
        title={processing ? "Searching..." : "Find Location"}
        onPress={handleSearch}
        disabled={!address.trim() || processing}
        loading={processing}
        variant="primary"
        size="large"
        fullWidth
        style={styles.ctaButton}
      />

      {/* Map Style Selector */}
      <View style={styles.mapStyleContainer}>
        <Text style={styles.mapStyleLabel}>Map Style</Text>
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
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Image
                source={require("../../assets/images/android-chrome-192x192.png")}
                style={styles.markerImage}
                resizeMode="contain"
              />
            </Marker>
          )}
        </MapView>
      </View>

      {/* Coordinates Display */}
      {coords.lat && coords.lng ? (
        // <View>
        <View style={styles.coordsContainer}>
          <View style={styles.coordsRow}>
            <Text style={styles.label}>Location has been captured.</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.placeholder}>Tap on the map or search an address</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 12 , paddingTop: 0},
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  instructions: { ...typography.body, color: colors.lightText, marginBottom: 12 },
  input: {
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  inputContainer: {
    marginBottom: 12,
  },
  textInputWrapper: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.divider,
    overflow: "hidden",
  },
  ctaButton: {
    marginBottom: 10,
  },
  mapStyleContainer: { marginBottom: 10 },
  mapStyleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  mapTypeRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 8 },
  mapTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.white,
    minWidth: 60,
    alignItems: "center",
  },
  selectedMapTypeButton: { backgroundColor: colors.primary, borderColor: colors.primary },
  mapTypeButtonText: { fontSize: 12, fontWeight: "500", color: colors.lightText },
  selectedMapTypeButtonText: { color: colors.white },
  toggleButton: {
    backgroundColor: colors.cardBackground,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  selectedToggleButton: { backgroundColor: colors.success },
  toggleButtonText: { fontSize: 14, fontWeight: "500", color: colors.text },
  selectedToggleButtonText: { color: colors.white },
  mapContainer: {
    width: "100%",
    height: 280,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
    borderWidth: 2,
    borderColor: colors.divider,
    backgroundColor: colors.white,
  },
  map: { width: "100%", height: "100%" },
  coordsContainer: {
    backgroundColor: "lightgreen",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 2,
    borderColor: colors.divider,
  },
  coordsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { fontWeight: "600", fontSize: 20, color: colors.lightText },
  value: { fontSize: 16, color: colors.text, fontWeight: "500" },
  placeholder: { color: colors.lightText, fontStyle: "italic", fontSize: 14, marginTop: 8 },
  markerImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});

export default SendGift;
