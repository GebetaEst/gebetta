import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProfileStore } from '@/store/profileStore';
import { AddressType } from '@/types/address';
import { useEffect, useState } from 'react';
import colors from '@/constants/colors';

interface AddressFormData {
  street: string;
  city: string;
  label: 'home' | 'work' | 'other';
  customLabel: string;
  isDefault: boolean;
}

export default function EditAddressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addresses, editAddress } = useProfileStore();
  
  const [formData, setFormData] = useState<AddressFormData>({
    street: '',
    city: '',
    label: 'home',
    customLabel: '',
    isDefault: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const existingAddress = addresses.find(addr => addr.id === id);
      if (existingAddress) {
        setFormData({
          street: existingAddress.street,
          city: existingAddress.city,
          label: existingAddress.label,
          customLabel: existingAddress.customLabel || '',
          isDefault: existingAddress.isDefault,
        });
      }
    }
  }, [id, addresses]);

  const handleSubmit = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      await editAddress(id, formData);
      router.back();
    } catch (error) {
      console.error('Failed to update address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Address</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Label</Text>
        <View style={styles.radioGroup}>
          {(['home', 'work', 'other'] as const).map((label) => (
            <View key={label} style={styles.radioButton}>
              <View style={styles.radioInput}>
                {formData.label === label && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.radioLabel}>
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {formData.label === 'other' && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Custom Label</Text>
          <TextInput
            value={formData.customLabel}
            onChangeText={(text: string) => handleChange('customLabel', text)}
            style={styles.input}
            placeholder="e.g., Church, Gym, School"
          />
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Street</Text>
        <TextInput
          value={formData.street}
          onChangeText={(text: string) => handleChange('street', text)}
          style={styles.input}
          placeholder="Enter street address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>City</Text>
        <TextInput
          value={formData.city}
          onChangeText={(text: string) => handleChange('city', text)}
          style={styles.input}
          placeholder="Enter city"
        />
      </View>



      <TouchableOpacity
        onPress={handleSubmit}
        style={styles.button}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Saving...' : 'Save Address'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.button, { backgroundColor: '#f5f5f5', marginTop: 8 }]}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>
          Cancel
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: colors.text,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.text,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioInput: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 16,
  },
  button: {
    marginTop: 24,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
