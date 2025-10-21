import Button from "@/components/Button";
import OrderStatusTracker from "@/components/OrderStatusTracker";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { restaurants } from "@/mocks/restaurants";
import { useCartStore } from "@/store/cartStore";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Clock, MapIcon, MapPin, Phone } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getOrderById, updateOrderStatus } = useCartStore();
  
  const order = getOrderById(id);
  const restaurant = restaurants.find(r => r.id === order?.restaurantId);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  useEffect(() => {
    if (order && order.status !== "delivered" && order.status !== "cancelled") {
      // Simulate order progress
      const timer = setTimeout(() => {
        if (order.status === "pending") {
          updateOrderStatus(order.id, "confirmed");
        } else if (order.status === "confirmed") {
          updateOrderStatus(order.id, "preparing");
        } else if (order.status === "preparing") {
          updateOrderStatus(order.id, "out-for-delivery");
        } else if (order.status === "out-for-delivery") {
          updateOrderStatus(order.id, "delivered");
        }
      }, 15000); // Update status every 15 seconds for demo
      
      return () => clearTimeout(timer);
    }
  }, [order?.status]);
  
  useEffect(() => {
    if (order && order.status !== "delivered" && order.status !== "cancelled") {
      // Parse estimated delivery time (e.g., "30-45 min")
      const timeRange = order.estimatedDeliveryTime?.toString().match(/(\d+)-(\d+)/);
      if (timeRange) {
        const maxMinutes = parseInt(timeRange[2]);
        setTimeLeft(maxMinutes);
        
        const interval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 60000); // Update every minute
        
        return () => clearInterval(interval);
      }
    }
  }, [order]);
  
  const handleCallDriver = () => {
    if (order?.driverInfo?.phone) {
      Linking.openURL(`tel:${order.driverInfo.phone}`);
    }
  };
  
  const handleViewMap = () => {
    // Use replace so Home / previous screen isn't left in navigation stack
    router.replace(`/delivery-tracking/${order?.id}`);
  };
  
  if (!order || !restaurant) {
    return (
      <View style={styles.notFound}>
        <Text style={typography.heading2}>Order not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/profile")}
        >
          <Text style={styles.backButtonText}>Go to Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.id.slice(-4)}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statusContainer}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>
              {order.status === "pending" && "Order Placed"}
              {order.status === "confirmed" && "Order Confirmed"}
              {order.status === "preparing" && "Preparing Your Food"}
              {order.status === "out-for-delivery" && "On the Way"}
              {order.status === "delivered" && "Delivered"}
              {order.status === "cancelled" && "Cancelled"}
            </Text>
            
            {timeLeft !== null && order.status !== "delivered" && order.status !== "cancelled" && (
              <View style={styles.timeContainer}>
                <Clock size={16} color={colors.secondary} />
                <Text style={styles.timeText}>
                  {timeLeft} min
                </Text>
              </View>
            )}
          </View>
          
          <OrderStatusTracker status={order.status} />
          
          {order.status === "out-for-delivery" && order.driverInfo && (
            <View style={styles.driverContainer}>
              <View style={styles.driverHeader}>
                <Image
                  source={{ uri: order.driverInfo.photoUrl }}
                  style={styles.driverImage}
                  contentFit="cover"
                />
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{order.driverInfo.name}</Text>
                  <Text style={styles.driverRole}>Your Delivery Driver</Text>
                </View>
              </View>
              
              <View style={styles.driverActions}>
                <TouchableOpacity
                  style={styles.driverAction}
                  onPress={handleCallDriver}
                >
                  <Phone size={20} color={colors.primary} />
                  <Text style={styles.driverActionText}>Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.driverAction}
                  onPress={handleViewMap}
                >
                  <MapIcon size={20} color={colors.primary} />
                  <Text style={styles.driverActionText}>Track</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.restaurantContainer}>
          <Image
            source={{ uri: restaurant.imageUrl }}
            style={styles.restaurantImage}
            contentFit="cover"
          />
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <TouchableOpacity
              onPress={() => router.push(`/restaurant/${restaurant.id}`)}
            >
              <Text style={styles.viewRestaurantText}>View Restaurant</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          <View style={styles.orderItems}>
            {order.items.map((item) => (
              <View key={item.menuItemId} style={styles.orderItem}>
                <View style={styles.orderItemHeader}>
                  <Text style={styles.orderItemQuantity}>{item.quantity}x</Text>
                  <Text style={styles.orderItemName}>{item.name}</Text>
                  <Text style={styles.orderItemPrice}>
                    {item.price * item.quantity} Birr
                  </Text>
                </View>
                
                {item.specialInstructions && (
                  <Text style={styles.orderItemInstructions}>
                    Note: {item.specialInstructions}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          
          <View style={styles.infoItem}>
            <MapPin size={18} color={colors.primary} />
            <Text style={styles.infoText}>
              {order.deliveryAddress?.addressLine1}
              {order.deliveryAddress?.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ""}
              {", "}
              {order.deliveryAddress?.city}
            </Text>
          </View>
          
          {order.deliveryAddress?.instructions && (
            <View style={styles.infoItem}>
              <Text style={styles.instructionsText}>
                Note: {order.deliveryAddress.instructions}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          
          <View style={styles.paymentMethod}>
            {order.paymentMethod === "card" ? (
              <View style={styles.paymentMethodItem}>
                <Text style={styles.paymentMethodText}>
                  Paid with Credit Card
                </Text>
              </View>
            ) : order.paymentMethod === "mobile-money" ? (
              <View style={styles.paymentMethodItem}>
                <Text style={styles.paymentMethodText}>
                  Paid with Mobile Money
                </Text>
              </View>
            ) : (
              <View style={styles.paymentMethodItem}>
                <Text style={styles.paymentMethodText}>
                  Cash on Delivery
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{order.subtotal} Birr</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>{order.deliveryFee} Birr</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>{order.tax.toFixed(2)} Birr</Text>
          </View>
          
          {order.tip > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Driver Tip</Text>
              <Text style={styles.summaryValue}>{order.tip} Birr</Text>
            </View>
          )}
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{order.totalAmount.toFixed(2)} Birr</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoLabel}>Order ID:</Text>
            <Text style={styles.orderInfoValue}>#{order.id}</Text>
          </View>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoLabel}>Order Date:</Text>
            <Text style={styles.orderInfoValue}>{formatDate(order.createdAt)}</Text>
          </View>
        </View>
        
        {order.status !== "delivered" && order.status !== "cancelled" && (
          <View style={styles.actionsContainer}>
            <Button
              title="View Live Tracking"
              onPress={handleViewMap}
              variant="primary"
              fullWidth
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...typography.heading3,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  statusContainer: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusTitle: {
    ...typography.heading3,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary + "20", // 20% opacity
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeText: {
    ...typography.bodySmall,
    color: colors.secondary,
    fontWeight: "600",
    marginLeft: 4,
  },
  driverContainer: {
    marginTop: 16,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    ...typography.heading4,
    marginBottom: 2,
  },
  driverRole: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  driverActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
  },
  driverAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  driverActionText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 8,
  },
  restaurantContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    margin: 20,
    marginTop: 0,
    marginBottom: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantImage: {
    width: 80,
    height: 80,
  },
  restaurantInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  restaurantName: {
    ...typography.heading4,
    marginBottom: 4,
  },
  viewRestaurantText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginTop: 0,
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  orderItems: {
    marginBottom: 8,
  },
  orderItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  orderItemHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderItemQuantity: {
    ...typography.body,
    fontWeight: "600",
    marginRight: 8,
  },
  orderItemName: {
    ...typography.body,
    flex: 1,
  },
  orderItemPrice: {
    ...typography.body,
    fontWeight: "600",
  },
  orderItemInstructions: {
    ...typography.caption,
    color: colors.lightText,
    marginTop: 4,
    fontStyle: "italic",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoText: {
    ...typography.body,
    marginLeft: 12,
    flex: 1,
  },
  instructionsText: {
    ...typography.bodySmall,
    color: colors.lightText,
    fontStyle: "italic",
    marginLeft: 30, // Align with the text above
  },
  paymentMethod: {
    marginBottom: 16,
  },
  paymentMethodItem: {
    backgroundColor: colors.inputBackground,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  paymentMethodText: {
    ...typography.bodySmall,
    fontWeight: "500",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.lightText,
  },
  summaryValue: {
    ...typography.body,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    ...typography.heading4,
  },
  totalValue: {
    ...typography.heading4,
    color: colors.primary,
  },
  orderInfo: {
    flexDirection: "row",
    marginBottom: 8,
  },
  orderInfoLabel: {
    ...typography.body,
    color: colors.lightText,
    width: 100,
  },
  orderInfoValue: {
    ...typography.body,
    flex: 1,
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
    marginBottom: 20,
  },
});
