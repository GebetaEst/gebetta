import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import {  Car, Bike } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

const ICON_SIZE = 32;

const locations = [
  {
    id: "sickle",
    title: "Sickle",
    coordinate: {
      latitude: 9.0108,
      longitude: 38.7613,
    },
    icon: <Bike size={ICON_SIZE} color="#F59E0B" />,
  },
  {
    id: "motor",
    title: "Motor",
    coordinate: {
      latitude: 9.0125,
      longitude: 38.7635,
    },
    icon: <Bike size={ICON_SIZE} color="#10B981" />,
  },
  {
    id: "car",
    title: "Car",
    coordinate: {
      latitude: 9.0140,
      longitude: 38.7650,
    },
    icon: <Car size={ICON_SIZE} color="#3B82F6" />,
  },
];

const INITIAL_REGION = {
  latitude: 9.0125,
  longitude: 38.7635,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const TrackingMap = () => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
      >
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={loc.coordinate}
            title={loc.title}
          >
            {loc.icon}
          </Marker>
        ))}
      </MapView>
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
});

export default TrackingMap;