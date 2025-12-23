import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProfileStore } from '@/store/profileStore';
import AddressCard from '@/components/AddressCard';
import { AddressType } from '@/types/address';

// Define route parameters for type safety
type AddressRouteParams = {
  id?: string;
};

export default function AddressesPage() {
  const { addresses, removeAddress, setDefaultAddress } = useProfileStore();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const handleDeleteAddress = async (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeAddress(addressId),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Delivery Addresses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/profile/addresses/add')}
        >
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>
      </View>

      {addresses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No addresses added yet</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/profile/addresses/add')}
          >
            <Text style={styles.emptyButtonText}>Add Your First Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.addressList}>
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => router.push({ pathname: '/profile/addresses/edit', params: { id: address.id } })}
              onDelete={() => handleDeleteAddress(address.id)}
              onSetDefault={() => setDefaultAddress(address.id)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  addressList: {
    padding: 20,
  },
});
