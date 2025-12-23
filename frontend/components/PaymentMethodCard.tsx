import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { PaymentMethod } from "@/types/restaurant";
import { Check, CreditCard, Edit, Smartphone, Trash } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export default function PaymentMethodCard({
  method,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  showActions = true,
}: PaymentMethodCardProps) {
  const renderCardBrandIcon = () => {
    // In a real app, you would use actual card brand icons
    return <CreditCard size={20} color={selected ? colors.primary : colors.lightText} />;
  };

  const renderMobileMoneyIcon = () => {
    return <Smartphone size={20} color={selected ? colors.primary : colors.lightText} />;
  };

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
        <View style={styles.methodContainer}>
          {method.type === "card" ? renderCardBrandIcon() : renderMobileMoneyIcon()}
          
          <View style={styles.methodInfo}>
            {method.type === "card" ? (
              <>
                <Text style={[styles.methodName, selected && styles.selectedText]}>
                  {method.cardBrand?.toUpperCase()} •••• {method.last4}
                </Text>
                <Text style={styles.methodDetails}>
                  Expires {method.expiryMonth}/{method.expiryYear}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.methodName, selected && styles.selectedText]}>
                  {method.provider?.charAt(0).toUpperCase() + method.provider?.slice(1)}
                </Text>
                <Text style={styles.methodDetails}>
                  {method.phoneNumber}
                </Text>
              </>
            )}
          </View>
          
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        
        {selected && (
          <View style={styles.checkCircle}>
            <Check size={14} color={colors.white} />
          </View>
        )}
      </View>
      
      {showActions && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEdit}
            >
              <Edit size={16} color={colors.primary} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}
          
          {onDelete && !method.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDelete}
            >
              <Trash size={16} color={colors.error} />
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
  },
  methodContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  methodInfo: {
    marginLeft: 12,
    flex: 1,
  },
  methodName: {
    ...typography.body,
    fontWeight: "600",
  },
  selectedText: {
    color: colors.primary,
  },
  methodDetails: {
    ...typography.caption,
    color: colors.lightText,
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
