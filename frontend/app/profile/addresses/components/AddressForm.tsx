import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, Alert, ScrollView } from 'react-native';
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
  name: string;
  additionalInfo: string;
  label: 'Home' | 'Work' | 'Other';
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
    name: z.string().min(3, 'Name must be at least 3 characters'),
    additionalInfo: z.string().min(5, 'Additional info must be at least 5 characters'),
    label: z.enum(['Home', 'Work', 'Other'], { message: 'Please select a valid label' }),
    customLabel: z.string().optional(),
    isDefault: z.boolean(),
  });

  const { control, handleSubmit, formState: { errors }, watch } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData || {
      name: '',
      additionalInfo: '',
      label: 'Home',
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
        name: watch('name'),
        label: selectedLabel === 'Other' ? watch('customLabel') || selectedLabel.substring(0, 1).toUpperCase() + selectedLabel.slice(1) : selectedLabel.substring(0, 1).toUpperCase() + selectedLabel.slice(1),
        additionalInfo: watch('additionalInfo'),
        // isDefault: watch('isDefault'),
        location: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
      };

      // Send to API
      const response = await fetch(`${baseUrl}/api/v1/users/saveLocation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify( payload),
      });
      console.log("77777777777777777",  payload);


      console.log("77777777777777777",  selectedLabel);
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Address</Text>
        <Text style={styles.subtitle}>Fill in your address details</Text>
      </View>

      {/* Name Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address Name *</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="e.g., Work Office, My Home"
              placeholderTextColor="#999"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
      </View>

      {/* Label Picker */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address Type *</Text>
        <Controller
          control={control}
          name="label"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.pickerWrapper, errors.label && styles.inputError]}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
              >
                <Picker.Item label="🏠 Home" value="Home" />
                <Picker.Item label="💼 Work" value="Work" />
                <Picker.Item label="📍 Other" value="Other" />
              </Picker>
            </View>
          )}
        />
        {errors.label && <Text style={styles.errorText}>{errors.label.message}</Text>}
      </View>

      {/* Custom Label (conditional) */}
      {selectedLabel === 'Other' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Custom Label</Text>
          <Controller
            control={control}
            name="customLabel"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.customLabel && styles.inputError]}
                placeholder="e.g., Church, Gym, School"
                placeholderTextColor="#999"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.customLabel && <Text style={styles.errorText}>{errors.customLabel.message}</Text>}
        </View>
      )}

      {/* Additional Info */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Additional Information *</Text>
        <Controller
          control={control}
          name="additionalInfo"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.textArea, errors.additionalInfo && styles.inputError]}
              placeholder="e.g., Apartment 402, near Edna Mall, Downtown Addis Ababa"
              placeholderTextColor="#999"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}
        />
        {errors.additionalInfo && <Text style={styles.errorText}>{errors.additionalInfo.message}</Text>}
      </View>

      {/* Set as Default Checkbox */}
      <Controller
        control={control}
        name="isDefault"
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            onPress={() => onChange(!value)}
            style={styles.checkboxContainer}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, value && styles.checkboxChecked]}>
              {value && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Set as Default Address</Text>
          </TouchableOpacity>
        )}
      />

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.button, isGettingLocation && styles.disabledButton]}
        onPress={getAndSendLocation}
        disabled={isGettingLocation}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {isGettingLocation ? '📍 Getting Location...' : '📍 Save Current Location'}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  inputGroup: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 1.5,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
    minHeight: 100,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 13,
    marginTop: 5,
    fontWeight: '500',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginTop: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginTop: 30,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default AddressForm;