import AddressForm from "../components/AddressForm";
import { useProfileStore } from "@/store/profileStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { AddressFormData } from "@/types/address-form";
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';

export default function AddAddressScreen() {
  const router = useRouter();
  const { addAddress } = useProfileStore();
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied 24',
          'Location permission is required to get your current coordinates.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      };
      
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Failed to get your current location. Please try again or enter coordinates manually.',
        [{ text: 'OK' }]
      );
      return null;
    } finally {
      setIsGettingLocation(false);
    }
  };



  const handleSubmit = async (data: AddressFormData) => {
    try {
      const { user } = useAuthStore.getState();
      
      if (!user?.token) {
        console.error('No auth token found');
        return;
      }

      // Get current location coordinates
      const coordinates = await getCurrentLocation();
      
      if (!coordinates) {
        // If location failed, use default coordinates as fallback
        console.warn('**** Using default coordinates as fallback');
        // coordinates = { lat: 9.03, lng: 38.74 };
      }

      // Map form data to API structure
      const newAddress = {
        name: data.street, // Use street as name
        label: data.customLabel && data.label === 'other' ? data.customLabel : data.label,
        additionalInfo: data.city, // Use city as additional info
        isDefault: data.isDefault || false,
        coordinates: !coordinates ? { lat: 9.03, lng: 38.74 } : coordinates // Use actual phone coordinates
      };
      
      console.log('📍 Adding address with coordinates:', coordinates);
      await addAddress(newAddress, user.token);
      // Navigate back to addresses list safely
      router.replace('/profile/addresses');
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  return (
    <AddressForm
      initialData={{
        street: '',
        city: '',
        label: 'home',
        isDefault: false,
        customLabel: '',
      }}
      onSubmit={handleSubmit}
      isGettingLocation={isGettingLocation}
    />
  );
}
