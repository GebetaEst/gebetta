import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { ChevronRight, Clock, MapPin, ShoppingBag } from "lucide-react-native";
import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";


export default function OrdersScreen() {
  const API_URL = "https://gebeta-delivery1.onrender.com/api/v1/orders/my-orders";
  const router = useRouter();
  const { user } = useAuthStore();
  const AUTH_TOKEN = "user?.token";
  console.log(user?.token);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const ordersAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  // Extracted fetchOrders so it can be reused in interval
  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await res.json();
      // The API returns { data: [orders] }
      console.log(data.data.orders);
      setOrders(Array.isArray(data.data.orders) ? data.data.orders : []);
    } catch (err: any) {
      setFetchError(err.message || "Failed to fetch orders");
      setOrders([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up interval to fetch every 5 minutes (300000 ms)
    intervalRef.current = setInterval(() => {
      fetchOrders(false); // Don't show loading spinner for background refresh
    }, 5000) as unknown as NodeJS.Timeout;

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Initialize animations
  useEffect(() => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ];

    const staggeredAnimations = [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(ordersAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel(animations).start();
    
    const staggerDelay = 200;
    staggeredAnimations.forEach((animation, index) => {
      setTimeout(() => animation.start(), index * staggerDelay);
    });
  }, []);



  const handleViewOrder = (id: string) => {
    router.push(`/order/${id}`);
  };

  const handleTrackDelivery = (id: string) => {
    router.push(`/delivery-tracking/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "#10B981"; // Emerald green
      case "in-progress":
      case "pending":
      case "processing":
        return "#3B82F6"; // Blue
      case "cancelled":
        return "#EF4444"; // Red
      case "out-for-delivery":
        return "#F59E0B"; // Amber
      default:
        return colors.lightText;
    }
  };

  const getStatusGradient = (status: string): [string, string] => {
    switch (status) {
      case "delivered":
        return ["#10B981", "#059669"]; // Green gradient
      case "in-progress":
      case "pending":
      case "processing":
        return ["#3B82F6", "#2563EB"]; // Blue gradient
      case "cancelled":
        return ["#EF4444", "#DC2626"]; // Red gradient
      case "out-for-delivery":
        return ["#F59E0B", "#D97706"]; // Amber gradient
      default:
        return [colors.lightText, colors.lightText];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return "✅";
      case "in-progress":
      case "processing":
        return "⏳";
      case "pending":
        return "🕐";
      case "cancelled":
        return "❌";
      case "out-for-delivery":
        return "🚚";
      default:
        return "📦";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View 
        style={[
          styles.headerGradient,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={["#FFFFFF", "#F8F9FA"]}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: headerAnim,
                transform: [{ scale: headerAnim }],
              },
            ]}
          >
            <Text style={styles.title}>📦 My Orders</Text>
            <Text style={styles.subtitle}>
              View and track your order history
            </Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {isLoading ? (
          <Animated.View 
            style={[
              styles.loadingContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim }],
              },
            ]}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>🔄 Loading orders...</Text>
          </Animated.View>
        ) : fetchError ? (
          <Animated.View 
            style={[
              styles.emptyContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim }],
              },
            ]}
          >
            <Text style={styles.emptyIcon}>❌</Text>
            <Text style={styles.emptyTitle}>Error</Text>
            <Text style={styles.emptyText}>{fetchError}</Text>
          </Animated.View>
        ) : orders.length === 0 ? (
          <Animated.View 
            style={[
              styles.emptyContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim }],
              },
            ]}
          >
            <Text style={styles.emptyIcon}>🛍️</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>
              Your order history will appear here
            </Text>
          </Animated.View>
        ) : (
          <View style={styles.ordersList}>
            {[...orders]
              .sort((a, b) => {
                // Sort by createdAt (or updatedAt if missing), descending (newest at top)
                const aDate = new Date(a.createdAt || a.updatedAt || 0).getTime();
                const bDate = new Date(b.createdAt || b.updatedAt || 0).getTime();
                return bDate - aDate;
              })
              .map((order) => {
                // Defensive: fallback for missing fields
                // Adapted for new order format
                const orderId = order._id || order.id || "N/A";
                // const orderVerificationCode = order.verification_code || "N/A";
                // There is no "foodName" at the order level; show first foodName or fallback
                const orderName =
                  order.orderItems && order.orderItems.length > 0
                    ? order.orderItems[0].foodId?.foodName || "Order"
                    : "Order";
                const restaurant =
                  typeof order.restaurant_id === "object" && order.restaurant_id
                    ? order.restaurant_id
                    : {};
                const restaurantName =
                  restaurant.name || "Unknown Restaurant";
                const restaurantImage =
                  restaurant.imageCover ||
                  restaurant.image ||
                  "https://placehold.co/48x48?text=R";
                // Use order.createdAt or fallback to updatedAt
                const orderDate =
                  order.createdAt || order.updatedAt || "";
                // Use orderStatus (new format) or fallback
                const status = order.orderStatus || order.status || "pending";
                // Items: flatten orderItems to array of {foodId, quantity}
                const items = Array.isArray(order.orderItems)
                  ? order.orderItems
                      .map((item: any) => ({
                        foodId: item.foodId,
                        quantity: item.quantity,
                      }))
                  : [];
                
                // Calculate total items and create grouped items display
                const totalItems = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
                const groupedItems = items.reduce((acc: Record<string, number>, item: any) => {
                  const foodName = item.foodId?.foodName || 'Unknown Item';
                  if (acc[foodName]) {
                    acc[foodName] += item.quantity || 1;
                  } else {
                    acc[foodName] = item.quantity || 1;
                  }
                  return acc;
                }, {});
                const orderVId = order.order_id || order._id || order.id || "N/A";
                const orderVerificationCode = order.verification_code || "N/A";
                // Create items display text
                const itemsDisplay = Object.entries(groupedItems)
                  .map(([name, quantity]) => `${name}${(quantity as number) > 1 ? ` (${quantity})` : ''}`)
                  .join(', ');
                
                // Total: prefer totalPrice, fallback to foodTotal
                const totalAmount =
                  typeof order.totalPrice === "number"
                    ? order.totalPrice
                    : (typeof order.foodTotal === "number" ? order.foodTotal : 0);
                // Delivery time: not present, fallback to orderDate
                const deliveryTime = new Date(orderDate).toLocaleString();
                // Delivery address: try restaurant.location.address or null
                const deliveryAddress =
                  restaurant.location && restaurant.location.address
                    ? restaurant.location.address
                    : null;

                return (
                    <Animated.View
                      key={orderId}
                      style={[
                        styles.orderCard,
                        {
                          opacity: ordersAnim,
                          transform: [{ 
                            translateY: ordersAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [50, 0],
                            })
                          }],
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.cardTouchable}
                        activeOpacity={0.95}
                        onPress={() => handleViewOrder(orderId)}
                      >
                        {/* Card Header with Gradient */}
                        <LinearGradient
                          colors={getStatusGradient(status)}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.cardHeader}
                        >
                          <View style={styles.headerContent}>
                            <View style={styles.orderTitleSection}>
                              <View style={styles.statusIconContainer}>
                                <Text style={styles.statusIcon}>{getStatusIcon(status)}</Text>
                              </View>
                              <View style={styles.orderMainInfo}>
                                <Text style={styles.orderTitle}>{orderName}</Text>
                                <Text style={styles.orderSubtitle}>Order ID: {orderVId}</Text>
                                <Text style={styles.orderSubtitle}>Verification Code: #{orderVerificationCode}</Text>
                              </View>
                            </View>
                            <View style={styles.statusContainer}>
                              <Text style={styles.statusLabel}>
                                {status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, " ")}
                              </Text>
                              <Text style={styles.orderDateHeader}>{formatDate(orderDate)}</Text>
                            </View>
                          </View>
                        </LinearGradient>

                        {/* Card Body */}
                        <View style={styles.cardBody}>
                          {/* Restaurant Info */}
                          <View style={styles.restaurantSection}>
                            <View style={styles.restaurantImageContainer}>
                              <Image
                                source={{ uri: restaurantImage }}
                                style={styles.restaurantImage}
                                contentFit="cover"
                              />
                              <View style={styles.restaurantImageOverlay} />
                            </View>
                            <View style={styles.restaurantDetails}>
                              <Text style={styles.restaurantName}>{restaurantName}</Text>
                              <View style={styles.orderSummary}>
                                <ShoppingBag size={14} color="#6B7280" style={styles.summaryIcon} />
                                <Text style={styles.itemCount}>
                                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                                </Text>
                                <Text style={styles.priceSeparator}>•</Text>
                                <Text style={styles.totalPrice}>ETB {Number(totalAmount).toFixed(2)}</Text>
                              </View>
                              <Text style={styles.itemsList} numberOfLines={2}>
                                {itemsDisplay}
                              </Text>
                            </View>
                          </View>

                    {/* Order Items List */}
                    {/* {items.length > 0 && (
                      <View style={styles.orderItemsContainer}>
                        <Text style={[styles.orderItemsTitle, { color: colors.text, fontSize: 14, fontWeight: "600", marginBottom: 8 }]}>
                          Order Items:
                        </Text>
                        {items.map((item: any, index: number) => (
                          <View key={index} style={styles.orderItemRow}>
                            <Text style={[styles.orderItemName, { color: colors.text, fontSize: 13, flex: 1 }]}>
                              {item.foodId?.foodName || 'Unknown Item'}
                            </Text>
                            <Text style={[styles.orderItemQuantity, { color: colors.primary, fontSize: 13, fontWeight: "600" }]}>
                              x{item.quantity || 1}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )} */}

                          {/* Order Details */}
                          <View style={styles.orderDetailsContainer}>
                            <View style={styles.detailCard}>
                              <View style={styles.detailRow}>
                                <View style={styles.detailIconContainer}>
                                  <Clock size={16} color="#6B7280" />
                                </View>
                                <View style={styles.detailTextContainer}>
                                  <Text style={styles.detailLabel}>Order Time</Text>
                                  <Text style={styles.detailValue}>
                                    {deliveryTime
                                      ? typeof deliveryTime === "string"
                                        ? deliveryTime
                                        : formatDate(deliveryTime)
                                      : ""}
                                  </Text>
                                </View>
                              </View>
                              
                              <View style={styles.detailRow}>
                                <View style={styles.detailIconContainer}>
                                  <MapPin size={16} color="#6B7280" />
                                </View>
                                <View style={styles.detailTextContainer}>
                                  <Text style={styles.detailLabel}>Delivery Address</Text>
                                  <Text style={styles.detailValue} numberOfLines={2}>
                                    {deliveryAddress?.addressLine1 ||
                                      deliveryAddress?.street ||
                                      deliveryAddress?.address ||
                                      "Address not available"}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>

                          {/* Track Delivery Button */}
                          {status === "out-for-delivery" && (
                            <View style={styles.actionContainer}>
                              <TouchableOpacity
                                style={styles.trackButton}
                                onPress={() => handleTrackDelivery(orderId)}
                                activeOpacity={0.9}
                              >
                                <LinearGradient
                                  colors={["#F59E0B", "#D97706"]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={styles.trackButtonGradient}
                                >
                                  <Text style={styles.trackButtonText}>Track Delivery</Text>
                                  <ChevronRight size={18} color="#FFFFFF" />
                                </LinearGradient>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                );
              })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
    paddingBottom: 10,
  },
  gradientContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    ...typography.heading2,
    color: colors.black,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: '#666666',
    textAlign: 'center',
    opacity: 0.9,
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
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    marginTop: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
    lineHeight: 22,
  },
  ordersList: {
    marginBottom: 24,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  cardTouchable: {
    flex: 1,
  },
  cardHeader: {
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIcon: {
    fontSize: 24,
  },
  orderMainInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  orderSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  orderDateHeader: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  cardBody: {
    padding: 20,
    paddingTop: 0,
  },
  restaurantSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  restaurantImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  restaurantImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  restaurantImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  orderSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryIcon: {
    marginRight: 6,
  },
  itemCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceSeparator: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  itemsList: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  orderDetailsContainer: {
    marginTop: 8,
  },
  detailCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  trackButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trackButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginRight: 8,
  },
});