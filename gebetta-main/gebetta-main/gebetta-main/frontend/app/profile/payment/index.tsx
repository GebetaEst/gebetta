import Button from "@/components/Button";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useProfileStore } from "@/store/profileStore";
import { useRouter } from "expo-router";
import { CreditCard, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from "react-native";

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { paymentMethods } = useProfileStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleAddPaymentMethod = () => {
    // In a real app, this would navigate to a payment method form
    router.push({
      pathname: "/profile/payment/add" as any,
    });
  };

  const handleEditPaymentMethod = (id: string) => {
    // In a real app, this would navigate to a payment method form with the data
    router.push({
      pathname: "/profile/payment/edit/[id]" as any,
      params: { id }
    });
  };

  const handleRemovePaymentMethod = (id: string) => {
    Alert.alert(
      "Remove Payment Method",
      "Are you sure you want to remove this payment method?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => {
            // In a real app, this would call removePaymentMethod(id)
            Alert.alert("Not implemented", "This feature is not implemented yet.");
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    // In a real app, this would call setDefaultPaymentMethod(id)
    Alert.alert("Success", "Default payment method updated (not implemented yet)");
  };

  const renderCardIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'visa':
        return 'credit-card';
      case 'mastercard':
        return 'credit-card';
      case 'amex':
        return 'credit-card';
      default:
        return 'credit-card';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Payment Methods</Text>
          <Text style={styles.subtitle}>
            Manage your saved payment methods
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading payment methods...</Text>
          </View>
        ) : paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CreditCard size={48} color={colors.lightText} />
            <Text style={styles.emptyTitle}>No payment methods</Text>
            <Text style={styles.emptyText}>
              Add a payment method to get started
            </Text>
          </View>
        ) : (
          <View style={styles.paymentMethodsList}>
            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.paymentMethodCard}>
                <View style={styles.paymentMethodHeader}>
                  <CreditCard size={20} color={colors.primary} style={styles.paymentMethodIcon} />
                  <Text style={styles.paymentMethodType}>{method.type} •••• {method.last4}</Text>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.paymentMethodName}>{method.type === 'card' ? 'Card' : 'Payment Method'}</Text>
                <Text style={styles.paymentMethodExpiry}>Expires {method.expiryMonth}/{method.expiryYear}</Text>
                
                <View style={styles.paymentMethodActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditPaymentMethod(method.id)}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemovePaymentMethod(method.id)}
                  >
                    <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remove</Text>
                  </TouchableOpacity>
                  
                  {!method.isDefault && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.setDefaultButton]}
                      onPress={() => handleSetDefaultPaymentMethod(method.id)}
                    >
                      <Text style={[styles.actionButtonText, styles.setDefaultButtonText]}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <Button
          title="Add Payment Method"
          icon={<Plus size={20} color={colors.white} />}
          onPress={handleAddPaymentMethod}
          fullWidth
          style={styles.addButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.lightText,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  emptyTitle: {
    ...typography.heading3,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
  },
  paymentMethodsList: {
    marginBottom: 24,
  },
  paymentMethodCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentMethodIcon: {
    marginRight: 8,
  },
  paymentMethodType: {
    ...typography.subtitle2,
    color: colors.text,
  },
  paymentMethodName: {
    ...typography.body,
    color: colors.text,
    marginBottom: 4,
  },
  paymentMethodExpiry: {
    ...typography.caption,
    color: colors.lightText,
    marginBottom: 12,
  },
  paymentMethodActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.lightGray,
  },
  actionButtonText: {
    ...typography.button,
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
  },
  removeButtonText: {
    color: colors.error,
  },
  setDefaultButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  setDefaultButtonText: {
    color: colors.primary,
  },
  defaultBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 'auto',
  },
  defaultBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 12,
  },
  addButton: {
    marginBottom: 24,
  },
});
