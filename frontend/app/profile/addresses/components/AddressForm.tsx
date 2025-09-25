import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AddressFormData, AddressFormProps } from '../../../../types/address-form';
import { Picker } from '@react-native-picker/picker';
import type { AddressType } from '../../../../types/address';
import colors from '@/constants/colors';

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
  saveButton: {
    backgroundColor: string;
    padding: number;
    borderRadius: number;
    alignItems: 'center';
    marginTop: number;
  };
  saveButtonText: {
    color: string;
    fontWeight: 'bold';
    fontSize: number;
  };
}

interface ExtendedAddressFormProps extends AddressFormProps {
  isGettingLocation?: boolean;
}

export function AddressForm({ onSubmit, initialData, isGettingLocation }: ExtendedAddressFormProps) {
  const addressSchema = z.object({
    street: z.string().min(1, 'Name is required'),
    city: z.string().min(1, 'Label is required'),
    label: z.enum(['home', 'work', 'other']),
    customLabel: z.string().optional(),
    isDefault: z.boolean()
  }) as any;

  const { control, handleSubmit, formState: { errors }, watch } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData || {
      street: '',
      city: '',
      label: 'home',
      customLabel: '',
      isDefault: false
    } as AddressFormData,
  });

  const selectedLabel = watch('label');

  const handleSave = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Address</Text>
      <Controller
        control={control}
        name="street"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Label"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

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
      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={isGettingLocation}
      >
        <Text style={styles.buttonText}>
          {isGettingLocation ? 'Getting Location...' : 'Save Address'}
        </Text>
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
  saveButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddressForm;
