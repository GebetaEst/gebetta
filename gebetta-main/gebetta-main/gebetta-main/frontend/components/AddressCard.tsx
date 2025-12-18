import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { AddressType } from "@/types/address";
import { MaterialIcons } from '@expo/vector-icons';
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AddressCardProps {
  address: AddressType;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  onSetDefault?: () => void;
}

export default function AddressCard({
  address,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  showActions = true,
}: AddressCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selectedContainer,
      ]}
      onPress={onSelect}
      disabled={!onSelect}
    >
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <MaterialIcons 
            name="location-on" 
            size={16} 
            color={selected ? colors.primary : colors.lightText} 
          />
          <Text style={[styles.label, selected && styles.selectedText]}>
            {address.label === 'other' && address.customLabel 
              ? address.customLabel 
              : address.label.charAt(0).toUpperCase() + address.label.slice(1)
            }
          </Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        
        {selected && (
          <View style={styles.checkCircle}>
            <MaterialIcons name="check" size={16} color={colors.white} />
          </View>
        )}
      </View>
      
      <Text style={[styles.address, selected && styles.selectedText]}>
        {address.additionalInfo}
      </Text>
      
      {address.coordinates && (
        <Text style={styles.coordinates}>
          {address.coordinates.lat.toFixed(4)}, {address.coordinates.lng.toFixed(4)}
        </Text>
      )}
      
      {showActions && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEdit}
            >
              <MaterialIcons name="edit" size={18} color={colors.text} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}
          
          {onDelete && !address.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDelete}
            >
              <MaterialIcons name="delete" size={18} color={colors.error} />
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  selectedContainer: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10", // 10% opacity
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    ...typography.body,
    fontWeight: "600",
    marginLeft: 8,
  },
  selectedText: {
    color: colors.primary,
  },
  defaultBadge: {
    backgroundColor: colors.secondary + "30", // 30% opacity
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  defaultText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: "600",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  address: {
    ...typography.body,
    marginBottom: 4,
  },
  coordinates: {
    ...typography.caption,
    color: colors.lightText,
    marginTop: 4,
  },
  instructions: {
    ...typography.caption,
    color: colors.lightText,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: 4,
  },
  deleteText: {
    color: colors.error,
  },
});
