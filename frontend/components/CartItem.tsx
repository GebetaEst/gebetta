import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { MenuItem } from "@/types/restaurant";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CartItemProps {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onUpdateInstructions?: (instructions: string) => void;
}

export default function CartItem({
  menuItem,
  quantity,
  specialInstructions,
  onUpdateQuantity,
  onRemove,
  onUpdateInstructions,
}: CartItemProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  const handleIncrement = () => {
    onUpdateQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdateQuantity(quantity - 1);
    } else {
      onRemove();
    }
  };

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.quantity}>{quantity}x</Text>
          <Text style={styles.name}>{menuItem.name}</Text>
        </View>
        <Text style={styles.price}>{menuItem.price * quantity} Birr</Text>
      </View>
      
      {specialInstructions && (
        <Text style={styles.instructions}>
          Note: {specialInstructions}
        </Text>
      )}
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.instructionsButton}
          onPress={toggleInstructions}
        >
          <Text style={styles.instructionsButtonText}>
            {specialInstructions ? "Edit Note" : "Add Note"}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleDecrement}
          >
            {quantity === 1 ? (
              <FontAwesome name="trash" size={16} color={colors.error} />
            ) : (
              <FontAwesome name="minus" size={16} color={colors.text} />
            )}
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleIncrement}
          >
            <FontAwesome name="plus" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: "row",
    flex: 1,
    marginRight: 8,
  },
  quantity: {
    ...typography.body,
    fontWeight: "600",
    marginRight: 8,
  },
  name: {
    ...typography.body,
    flex: 1,
  },
  price: {
    ...typography.body,
    fontWeight: "600",
  },
  instructions: {
    ...typography.caption,
    color: colors.lightText,
    marginBottom: 12,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  instructionsButton: {
    paddingVertical: 6,
  },
  instructionsButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "500",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.inputBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    ...typography.body,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
});
