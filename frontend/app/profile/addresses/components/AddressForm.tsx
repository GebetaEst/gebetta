import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Picker } from '@react-native-picker/picker';
import colors from '@/constants/colors';
import { useState } from 'react';
import * as Location from 'expo-location';
import { useAuthStore } from '@/store/useAuthStore';

// Define the form data type
interface AddressFormData {
  additionalInfo: string;
  label: 'home' | 'work' | 'other';
  customLabel?: string;
  isDefault: boolean;
}

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  initialData?: AddressFormData;
}

interface Styles {
  container: ViewStyle;
  title: TextStyle;
  input: TextStyle;
  button: {
    backgroundColor: string;
    padding: number;
    borderRadius: number;
    alignItems: 'center';
    marginTop: number;
  };
  buttonText: {
    color: string;
    fontWeight: 'bold';
    fontSize: number;
  };
  picker: {
    borderWidth: number;
    borderColor: string;
    borderRadius: number;
    padding: number;
    marginBottom: number;
    fontSize: number;
  };
  pickerContainer: {
    marginVertical: number;
  };
  pickerLabel: {
    textAlign: 'left';
    padding: number;
    borderRadius: number;
  };
}

interface ExtendedAddressFormProps extends AddressFormProps {
  isGettingLocation?: boolean;
}

export function AddressForm({ onSubmit, initialData }: ExtendedAddressFormProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const baseUrl = process.env.EXPO_PUBLIC_BASE_URL || 'https://gebeta-delivery1.onrender.com'; // Use env variable or fallback
  const { user } = useAuthStore();
  const addressSchema = z.object({
    additionalInfo: z.string().min(1, 'Additional info is required'),
    label: z.enum(['home', 'work', 'other'], { message: 'Please select a valid label' }),
    customLabel: z.string().optional(),
    isDefault: z.boolean(),
  });

  const { control, handleSubmit, formState: { errors }, watch } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData || {
      additionalInfo: '',
      label: 'home',
      customLabel: '',
      isDefault: false,
    },
  });

  const selectedLabel = watch('label');

  const handleSave = handleSubmit((data) => {
    onSubmit(data);
  });

  const getAndSendLocation = async () => {
    setIsGettingLocation(true);
    try {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to use this feature.');
        return;
      }

      // Get current position
      let location = await Location.getCurrentPositionAsync({});
      const payload = {
        name: selectedLabel === 'other' ? watch('customLabel') || 'Current Location' : selectedLabel,
        label: selectedLabel === 'other' ? watch('customLabel') || 'Current Location' : selectedLabel,
        additionalInfo: watch('additionalInfo'),
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        isDefault: watch('isDefault'),
      };

      // Send to API
      const response = await fetch(`${baseUrl}/api/v1/users/saveLocation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert('Success', 'Location saved successfully!');
        // onSubmit(payload); // Call onSubmit with the payload for consistency
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to save location. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while getting or saving location.');
      console.error('Location Error:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Address</Text>
      <Controller
        control={control}
        name="additionalInfo"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Additional Info (e.g., Apartment 402, near Edna Mall)"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.additionalInfo && <Text style={styles.errorText}>{errors.additionalInfo.message}</Text>}

      <Controller
        control={control}
        name="label"
        render={({ field: { onChange, value } }) => (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={styles.picker}
            >
              <Picker.Item label="Home" value="home" />
              <Picker.Item label="Work" value="work" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        )}
      />
      {errors.label && <Text style={styles.errorText}>{errors.label.message}</Text>}

      {selectedLabel === 'other' && (
        <Controller
          control={control}
          name="customLabel"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Custom Label (e.g., Church, Gym, School)"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      )}
      {errors.customLabel && <Text style={styles.errorText}>{errors.customLabel.message}</Text>}

      <Controller
        control={control}
        name="isDefault"
        render={({ field: { onChange, value } }) => (
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              onPress={() => onChange(!value)}
              style={styles.checkbox}
            >
              <Text>{value ? '☑' : '☐'} Set as Default</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        style={[styles.button, isGettingLocation && styles.disabledButton]}
        onPress={getAndSendLocation}
        disabled={isGettingLocation}
      >
        <Text style={styles.buttonText}>
          {isGettingLocation ? 'Getting Location...' : 'Save Current Location'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, isGettingLocation && styles.disabledButton]}
        onPress={handleSave}
        disabled={isGettingLocation}
      >
        <Text style={styles.buttonText}>Save Address</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    marginVertical: 10,
  },
  pickerLabel: {
    textAlign: 'left',
    padding: 15,
    borderRadius: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  checkboxContainer: {
    marginVertical: 10,
  },
  checkbox: {
    padding: 10,
  },
});

export default AddressForm;