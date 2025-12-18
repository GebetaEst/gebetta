import React, { useEffect, useState } from 'react';

import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator,
  StatusBar,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/profileStore';
import { AddressType } from '@/types/address';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import Button from '@/components/Button';
import { LocateFixed } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';

type GroupedAddresses = {
  [key: string]: AddressType[];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text,
    marginTop: 16,
  },
  addButton: {
    margin: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mapInstructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mapIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#DBEAFE',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mapInstructionContent: {
    flex: 1,
    marginRight: 12,
  },
  mapInstructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  mapInstructionText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  quickAddButton: {
    width: 36,
    height: 36,
    backgroundColor: '#3B82F6',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

// Mock addresses to be used if none exist in the store
// const mockAddresses: AddressType[] = [
//   // Home addresses
//   {
//     id: 'home-1',
//     street: 'Bole Road, House #123',
//     city: 'Addis Ababa',
//     label: 'home',
//     isDefault: true,
//     note: 'Main residence - 3rd floor, Ring Road',
//     createdAt: '2025-01-15T08:30:00.000Z',
//     updatedAt: '2025-06-20T14:25:00.000Z'
//   },
//   {
//     id: 'home-2',
//     street: 'Megenagna, Condo #4B',
//     city: 'Addis Ababa',
//     label: 'home',
//     isDefault: false,
//     note: 'Weekend house - Near Friendship Center',
//     createdAt: '2024-11-05T10:15:00.000Z',
//     updatedAt: '2025-05-12T16:45:00.000Z'
//   },
//   // Work addresses
//   {
//     id: 'work-1',
//     street: 'Kazanchis Business District, 5th Floor',
//     city: 'Addis Ababa',
//     label: 'work',
//     isDefault: false,
//     note: 'EthioTech Solutions HQ - Reception on 1st floor',
//     createdAt: '2024-09-10T09:00:00.000Z',
//     updatedAt: '2025-06-18T11:30:00.000Z'
//   },
//   {
//     id: 'work-2',
//     street: 'CMC Road, Building #42',
//     city: 'Addis Ababa',
//     label: 'work',
//     isDefault: false,
//     note: 'Client site - Ask for security at main gate',
//     createdAt: '2025-02-20T13:45:00.000Z',
//     updatedAt: '2025-06-22T10:15:00.000Z'
//   },
//   {
//     id: 'work-3',
//     street: 'Bole Road, Dembel City Center, 7th Floor',
//     city: 'Addis Ababa',
//     label: 'work',
//     isDefault: false,
//     note: 'Co-working space - Available 24/7 with access card',
//     createdAt: '2025-04-05T08:00:00.000Z',
//     updatedAt: '2025-06-21T17:30:00.000Z'
//   },
//   // Other addresses
//   {
//     id: 'other-1',
//     street: 'Sarbet District, Near Edna Mall',
//     city: 'Addis Ababa',
//     label: 'other',
//     isDefault: false,
//     note: 'Spa & Wellness Center - Open 9AM-9PM',
//     createdAt: '2024-10-15T07:30:00.000Z',
//     updatedAt: '2025-06-19T19:45:00.000Z'
//   },
//   {
//     id: 'other-2',
//     street: 'Bole Atlas, Behind DH Geda Tower',
//     city: 'Addis Ababa',
//     label: 'other',
//     isDefault: false,
//     note: 'Friend\'s apartment - Call before visiting',
//     createdAt: '2025-03-12T16:20:00.000Z',
//     updatedAt: '2025-06-17T20:15:00.000Z'
//   },
//   {
//     id: 'other-3',
//     street: '4 Kilo, Arat Kilo Cultural Center',
//     city: 'Addis Ababa',
//     label: 'other',
//     isDefault: false,
//     note: 'Weekly coffee meetup - Every Saturday 4PM',
//     createdAt: '2025-01-30T10:00:00.000Z',
//     updatedAt: '2025-06-23T15:30:00.000Z'
//   }
// ];

export default function AddressesScreen() {
  const router = useRouter();
  const { addresses, removeAddress, setDefaultAddress, fetchAddresses, isLoading, error } = useProfileStore();
  const [displayAddresses, setDisplayAddresses] = useState<AddressType[]>([]);

  // Debug: Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { user, isAuthenticated } = useAuthStore.getState();
      
      console.log('📍 Addresses: Auth state on mount:', {
        isAuthenticated,
        hasUser: !!user,
        hasToken: !!user?.token,
        userId: user?._id
      });
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get auth token from secure storage
        const { user } = useAuthStore.getState();
        
        console.log('📍 Addresses: Checking auth state...', {
          hasUser: !!user,
          hasToken: !!user?.token,
          userId: user?._id
        });
        
        if (user?.token) {
          console.log('📍 Loading addresses from API...');
          await fetchAddresses(user.token);
        } else {
          console.log('📍 No auth token found, cannot fetch addresses');
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      }
    };
    
    loadData();
  }, [fetchAddresses]);

  // Update display addresses when addresses change
  useEffect(() => {
    setDisplayAddresses([...addresses]);
  }, [addresses]);

  // Group addresses by label
  const groupedAddresses = displayAddresses.reduce<GroupedAddresses>((acc, address) => {
    const label = address.label.toLowerCase();
    console.log(`Processing address:`, { id: address.id, label, street: address.street });
    if (!acc[label]) {
      console.log(`Creating new group for label: ${label}`);
      acc[label] = [];
    }
    acc[label].push(address);
    console.log(`Added to group ${label}:`, address.street);
    return acc;
  }, {});

  console.log('Grouped addresses:', Object.keys(groupedAddresses));
  console.log('Display addresses:', displayAddresses.map(a => ({ id: a.id, label: a.label, street: a.street })));

  const handleAddAddress = () => {
    router.push("/profile/addresses/add");
  };

  const handleEditAddress = (id: string) => {
    router.push(`/profile/addresses/edit/${id}`);
  };

  const handleRemoveAddress = async (id: string) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const { user } = useAuthStore.getState();
              if (user?.token) {
                await removeAddress(id, user.token);
              }
            } catch (error) {
              console.error('Error removing address:', error);
            }
          }
        }
      ]
    );
  };

  const handleSetDefaultAddress = async (id: string) => {
    Alert.alert(
      "Set as Default",
      "Do you want to set this as your default address?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Set as Default",
          onPress: async () => {
            try {
              const { user } = useAuthStore.getState();
              if (user?.token) {
                await setDefaultAddress(id, user.token);
              }
            } catch (error) {
              console.error('Error setting default address:', error);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    );
  }
  const getAddressIcon = (label: string): keyof typeof MaterialIcons.glyphMap => {
    switch (label.toLowerCase()) {
      case 'home':
        return 'home';
      case 'work':
        return 'work';
      default:
        return 'location-on';
    }
  };

  // Get display name for address label
  const getLabelDisplayName = (label: string, customLabel?: string): string => {
    if (label === 'other' && customLabel) {
      return customLabel;
    }
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.title}>My Addresses</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if API failed
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.title}>My Addresses</Text>
        </View>
        <View style={[styles.loadingContainer, { justifyContent: 'center' }]}>
          <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 16, fontSize: 16 }}>
            Failed to load addresses
          </Text>
          <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 24, fontSize: 14 }}>
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
            onPress={async () => {
              const { user } = useAuthStore.getState();
              if (user?.token) {
                fetchAddresses(user.token);
              }
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>My Addresses</Text>
      </View>

      {/* Map Pin Instructions Banner */}
      <View style={styles.mapInstructionBanner}>
        <View style={styles.mapIconContainer}>
        <LocateFixed color="blue" />
          
        </View>
        <View style={styles.mapInstructionContent}>
          <Text style={styles.mapInstructionTitle}> <MaterialIcons name="location-on" size={16} color="#3B82F6" /> Pin Your Location</Text>
          <Text style={styles.mapInstructionText}>
            Tap the + button to add new addresses
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.quickAddButton}
          onPress={handleAddAddress}
        >
          <MaterialIcons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {displayAddresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="location-off"
            size={48}
            color={colors.lightText}
            style={styles.emptyIcon}
          />
          <Text style={[typography.h6, { color: colors.text, marginBottom: 8 }]}>
            No Saved Addresses
          </Text>
          <Text style={styles.emptyText}>
            You haven't saved any addresses yet. Add your first address to get started.
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {Object.entries(groupedAddresses).map(([label, addresses]) => {
            // Get the first address to access customLabel for "other" type addresses
            const firstAddress = addresses[0];
            const labelDisplayName = getLabelDisplayName(label, firstAddress?.customLabel);
            const labelIcon = getAddressIcon(label);
            
            return (
              <View key={label} style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <MaterialIcons 
                    name={labelIcon} 
                    size={20} 
                    color={colors.primary} 
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[typography.subtitle1, { color: colors.text }]}>
                    {labelDisplayName}
                  </Text>
                </View>
                
                {addresses.map((address) => (
                  <View 
                    key={address.id} 
                    style={[
                      {
                        backgroundColor: colors.white,
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: address.isDefault ? colors.primary : colors.border,
                      },
                      address.isDefault && {
                        borderLeftWidth: 3,
                        borderLeftColor: colors.primary,
                      }
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[typography.subtitle2, { color: colors.text }]}>
                        {address.street}
                      </Text>
                      {address.isDefault && (
                        <View 
                          style={{
                            backgroundColor: colors.primary + '20', // Add transparency
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 4,
                          }}
                        >
                          <Text style={[typography.caption, { color: colors.primary }]}>
                            Default
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={[typography.body2, { color: colors.lightText, marginTop: 4 }]}>
                      {address.city}
                    </Text>
                    
                    <View 
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        marginTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        paddingTop: 12
                      }}
                    >
                      
                      
                      {/* <TouchableOpacity 
                        style={{ marginRight: 16 }}
                        onPress={() => handleSetDefaultAddress(address.id)}
                        disabled={address.isDefault}
                      >
                        <Text style={{ 
                          color: address.isDefault ? colors.lightText : colors.primary 
                        }}>
                          {address.isDefault ? 'Default' : 'Set as Default'}
                        </Text>
                      </TouchableOpacity> */}
                      
                      <TouchableOpacity onPress={() => handleRemoveAddress(address.id)}>
                        <Text style={{ color: colors.error }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}
      
      <View style={styles.footer}>
        <Button 
          title="Add New Address" 
          onPress={handleAddAddress}
          style={styles.addButton}
        />
      </View>
    </SafeAreaView>
  );
}
