import AddressForm from "../components/AddressForm";
import { useProfileStore } from "@/store/profileStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AddressFormData } from "@/types/address-form";
import { AddressType } from "@/types/address";
import React from "react";
import { useAuthStore } from '@/store/useAuthStore';

export default function EditAddressScreen() {
  const router = useRouter();
  const { addresses, editAddress } = useProfileStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const address = addresses?.find(addr => addr.id === id);

  if (!address) {
    router.back();
    return null;
  }

  const handleSubmit = async (data: AddressFormData) => {
    try {
      const { user } = useAuthStore.getState();
      
      if (!user?.token) {
        console.error('No auth token found');
        return;
      }

      // Map form data to API structure
      const updatedAddress = {
        name: data.street, // Use street as name
        label: data.customLabel && data.label === 'other' ? data.customLabel : data.label,
        additionalInfo: data.city, // Use city as additional info
        isDefault: data.isDefault
      };
      
      await editAddress(id, updatedAddress, user.token);
      router.back();
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  return (
    <AddressForm
      initialData={{
        street: address.street || address.name || '',
        city: address.city || address.additionalInfo || '',
        label: (['home', 'work', 'other'].includes(address.label)) ? address.label as 'home' | 'work' | 'other' : 'other',
        customLabel: address.customLabel || ((!['home', 'work', 'other'].includes(address.label)) ? address.label : ''),
        isDefault: address.isDefault
      }}
      onSubmit={handleSubmit}
    />
  );
}
