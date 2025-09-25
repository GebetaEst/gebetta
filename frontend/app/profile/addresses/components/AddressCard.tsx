import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AddressType } from '@/types/address';
import { MapPin, Edit2, X, Check } from 'lucide-react-native';

interface AddressCardProps {
  address: AddressType;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const getLabelStyle = (type: string) => ({
    backgroundColor: 
      type === 'home' ? '#E3F2FD' : 
      type === 'work' ? '#E8F5E9' : '#F3E5F5',
    color: 
      type === 'home' ? '#1976D2' : 
      type === 'work' ? '#2E7D32' : '#7B1FA2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600' as const,
    marginRight: 8,
  });

  const labelMap = {
    home: 'Home',
    work: 'Work',
    other: 'Other',
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Text style={getLabelStyle(address.label)}>{labelMap[address.label as keyof typeof labelMap]}</Text>
          {address.isDefault && (
            <Text style={styles.defaultBadge}>Default</Text>
          )}
        </View>
      </View>
      
      <View style={styles.addressContainer}>
        <Text style={styles.address}>{address.street}</Text>
        <Text style={styles.address}>{address.city}</Text>
        {address.note && <Text style={styles.note}>{address.note}</Text>}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={onEdit}
        >
          <Edit2 size={16} color="#fff" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
        >
          <X size={16} color="#fff" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
        
        {!address.isDefault && (
          <TouchableOpacity
            style={[styles.actionButton, styles.defaultButton]}
            onPress={onSetDefault}
          >
            <Check size={16} color="#fff" />
            <Text style={styles.actionText}>Set Default</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#007AFF',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
  addressContainer: {
    marginBottom: 16,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  note: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  defaultButton: {
    backgroundColor: '#2196F3',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});
