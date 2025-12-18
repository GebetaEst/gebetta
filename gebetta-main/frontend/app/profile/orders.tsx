import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { ChevronRight, Clock, MapPin, ShoppingBag, X, ChevronDown, ChevronUp } from "lucide-react-native";
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
  Modal,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import TrackingMap from "./TrackingMap";



export default function OrdersScreen() {
  const API_URL = "https://api.bahirandelivery.cloud/api/v1/orders/my-orders";
  const router = useRouter();
  const { user } = useAuthStore();
  const AUTH_TOKEN = "user?.token";
 
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [fullScreenOrderId, setFullScreenOrderId] = useState<string | null>(null);
  const [disconnectToIo, setDisconnectToIo] = useState(false);
  const [qrModalData, setQrModalData] = useState<{
    orderCode: string;
    verificationCode: string;
  } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const ordersAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  const currentOrder = trackingOrderId 
    ? orders.find(o => o.orderCode === trackingOrderId || o._id === trackingOrderId) 
    : null;

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
      console.log('#########  data', data);
      // The API returns { data: [orders] }
      
      setOrders(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      setFetchError(err.message || "Failed to fetch orders");
      setOrders([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchOrders(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up interval to fetch every 5 minutes (300000 ms)
    intervalRef.current = setInterval(() => {
      fetchOrders(false); // Don't show loading spinner for background refresh
    }, 550000) as unknown as NodeJS.Timeout;

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
    setTrackingOrderId(trackingOrderId === id ? null : id);
  };

  const handleFullScreen = (id: string) => {
    setFullScreenOrderId(id);
  };

  const normaliseStatus = (status: string) =>
    (status || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

  const getStatusColor = (status: string) => {
    switch (normaliseStatus(status)) {
      case "delivered":
      case "completed":
        return "#10B981"; // Emerald green
      case "in-progress":
      case "inprogress":
      case "processing":
      case "pending":
      case "awaiting-confirmation":
        return "#3B82F6"; // Blue
      case "cancelled":
      case "canceled":
        return "#EF4444"; // Red
      case "out-for-delivery":
      case "delivering":
        return "#F59E0B"; // Amber
      default:
        return colors.lightText;
    }
  };

  const getStatusGradient = (status: string): [string, string] => {
    switch (normaliseStatus(status)) {
      case "delivered":
      case "completed":
        return ["#10B981", "#059669"]; // Green gradient
      case "in-progress":
      case "inprogress":
      case "processing":
      case "pending":
      case "awaiting-confirmation":
        return ["#3B82F6", "#2563EB"]; // Blue gradient
      case "cancelled":
      case "canceled":
        return ["#EF4444", "#DC2626"]; // Red gradient
      case "out-for-delivery":
      case "delivering":
        return ["#F59E0B", "#D97706"]; // Amber gradient
      default:
        return [colors.lightText, colors.lightText];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (normaliseStatus(status)) {
      case "delivered":
      case "completed":
        return "✅";
      case "in-progress":
      case "inprogress":
      case "processing":
        return "⏳";
      case "pending":
      case "awaiting-confirmation":
        return "🕐";
      case "cancelled":
      case "canceled":
        return "❌";
      case "out-for-delivery":
      case "delivering":
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
            {/* <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => fetchOrders()}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#3B82F6", "#2563EB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.refreshButtonGradient,
                    isLoading ? { opacity: 0.7 } : null,
                  ]}
                >
                  {/* <Text style={styles.refreshButtonIcon}>🔄</Text> 
                  
                </LinearGradient>
              </TouchableOpacity> 
            </View>*/}
          </Animated.View>
        </LinearGradient>
      </Animated.View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
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
                // Sort by orderDate (or createdAt/updatedAt if missing), descending (newest at top)
                const aDate = new Date(a.orderDate || a.createdAt || a.updatedAt || 0).getTime();
                const bDate = new Date(b.orderDate || b.createdAt || b.updatedAt || 0).getTime();
                return bDate - aDate;
              })
              .map((order) => {
                // Defensive: fallback for missing fields
                // Adapted for new order format
                // Use orderCode for Firebase tracking (matches delivery guy app)
                const orderId =
                 order.orderId ||  order.orderCode || order._id || order.id || "N/A";

                const normalizedItems = Array.isArray(order.orderItems)
                  ? order.orderItems.map((item: any) => ({
                      name:
                        item.name ||
                        item.foodId?.foodName ||
                        item.foodId?.name ||
                        "Item",
                      quantity: item.quantity || 1,
                      price:
                        typeof item.price === "object"
                          ? parseFloat(
                              item.price?.$numberDecimal ??
                                item.price?.amount ??
                                "0"
                            )
                          : Number(item.price ?? item.foodId?.price ?? 0),
                    }))
                  : Array.isArray(order.items)
                  ? order.items.map((item: any) => ({
                      name: item.foodName || item.name || "Item",
                      quantity: item.quantity || 1,
                      price: Number(item.price ?? 0),
                    }))
                  : [];

                const orderName =
                  normalizedItems.length > 0
                    ? normalizedItems.map((item: any) => item.name).join(", ")
                    : order.description || "Order";

                const orderDate =
                  order.orderDate || order.createdAt || order.updatedAt || "";

                const rawStatus = order.orderStatus ?? order.status ?? "pending";
                const statusKey =
                  typeof rawStatus === "string"
                    ? rawStatus.toLowerCase().replace(/\s+/g, "-")
                    : "pending";
                const statusLabel =
                  typeof rawStatus === "string" && rawStatus.length > 0
                    ? rawStatus
                        .replace(/[-_]/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())
                    : "Pending";

                const totalItems = normalizedItems.reduce(
                  (sum: number, item: any) => sum + (item.quantity || 1),
                  0
                );

                const totalAmountSource =
                  order.totalFoodPrice ??
                  order.totalPrice ??
                  order.total ??
                  (order.transaction &&
                  order.transaction.totalPrice &&
                  order.transaction.totalPrice.$numberDecimal
                    ? parseFloat(order.transaction.totalPrice.$numberDecimal)
                    : undefined);

                const totalAmount =
                  typeof totalAmountSource === "number"
                    ? totalAmountSource
                    : Number(totalAmountSource ?? 0);

                const orderCode = order.orderCode || orderId;
                const orderVerificationCode =
                  order.userVerificationCode ||
                  order.verification_code ||
                  "N/A";
                const hasVerificationCode =
                  typeof orderVerificationCode === "string" &&
                  orderVerificationCode.trim().length > 0 &&
                  orderVerificationCode !== "N/A";

                const orderTypeRaw =
                  order.orderType || order.deliveryVehicle || "delivery";
                const orderTypeKey =
                  typeof orderTypeRaw === "string"
                    ? orderTypeRaw.toLowerCase()
                    : "delivery";
                const formattedOrderType =
                  orderTypeKey.charAt(0).toUpperCase() + orderTypeKey.slice(1);

                const deliveryMethodIcon = (() => {
                  if (
                    orderTypeKey.includes("bicycle") ||
                    orderTypeKey.includes("bike")
                  ) {
                    return "🚲";
                  }
                  if (
                    orderTypeKey.includes("motor") ||
                    orderTypeKey.includes("scooter")
                  ) {
                    return "🛵";
                  }
                  if (
                    orderTypeKey.includes("pickup") ||
                    orderTypeKey.includes("takeaway")
                  ) {
                    return "🥡";
                  }
                  if (orderTypeKey.includes("dine")) {
                    return "🍽️";
                  }
                  return "🚗";
                })();

                const restaurant =
                  (typeof order.restaurant_id === "object" && order.restaurant_id) ||
                  (typeof order.restaurant === "object" && order.restaurant) ||
                  {};
                const restaurantName =
                  order.restaurantName ||
                  order.restaurant?.name ||
                  order.restaurantId?.name ||
                  (order.phone ? `Customer ${order.phone}` : undefined) ||
                  "Gebeta Delivery";
                const restaurantImage =
                  restaurant.imageCover ||
                  restaurant.image ||
                  `https://placehold.co/48x48?text=${restaurantName?.charAt(0)}`;

                const deliveryTime = orderDate
                  ? new Date(orderDate).toLocaleString()
                  : "";

                const itemsListText =
                  normalizedItems.length > 0
                    ? normalizedItems
                        .map((item: any) => `${item.quantity}x ${item.name}`)
                        .join(", ")
                    : "No items found";
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
                      <View style={styles.cardTouchable}>
                        {/* Card Header with Gradient */}
                        <LinearGradient
                          colors={getStatusGradient(statusKey)}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.cardHeader}
                        >
                          <View style={styles.headerContent}>
                            <View style={styles.orderTitleSection}>
                              <View style={styles.statusIconContainer}>
                                <Text style={styles.statusIcon}>{getStatusIcon(statusKey)}</Text>
                              </View>
                              <View style={styles.orderMainInfo}>
                                <Text style={styles.orderTitle}>{orderName}</Text>
                                <Text style={styles.orderSubtitle}>Order Code: {orderCode}</Text>
                                <Text style={styles.orderSubtitle}>Verification Code: #{orderVerificationCode}</Text>
                              </View>
                            </View>
                            <View style={styles.statusContainer}>
                              <Text style={styles.statusLabel}>
                                {statusLabel}
                              </Text>
                              {/* <Text style={styles.orderDateHeader}>{formatDate(orderDate)}</Text> */}
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



                              <View style={styles.orderSummary}>
                                <ShoppingBag size={14} color="#6B7280" style={styles.summaryIcon} />
                                <Text style={styles.itemCount}>
                                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                                </Text>
                                <Text style={styles.priceSeparator}>•</Text>
                                <Text style={styles.totalPrice}>ETB {Number(totalAmount).toFixed(2)}</Text>
                              </View>
                              <Text style={styles.itemsList} numberOfLines={2}>
                                {itemsListText}
                              </Text>
                              <Text style={styles.itemsList}>
                                Order Type: {formattedOrderType} {deliveryMethodIcon}
                              </Text>
                              
                              {order.phone && (
                                <Text style={styles.itemsList}>Phone: {order.phone}</Text>
                              )}
                              {order.description && (
                                <Text style={styles.itemsList} numberOfLines={2}>
                                  Note: {order.description}
                                </Text>
                              )}
                              {hasVerificationCode && statusKey === "delivering" && (
                                <TouchableOpacity
                                  style={styles.qrButton}
                                  activeOpacity={0.9}
                                  onPress={() =>
                                    setQrModalData({
                                      orderCode,
                                      verificationCode: orderVerificationCode,
                                    })
                                  }
                                >
                                  <LinearGradient
                                    colors={["#3B82F6", "#2563EB"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.qrButtonGradient}
                                  >
                                    <Text style={styles.qrButtonIcon}>🔳</Text>
                                    <Text style={styles.qrButtonText}>Show QR Code</Text>
                                  </LinearGradient>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>

                    {/* Order Items List */}
                    

                          {/* Order Details */}
                          <View style={styles.orderDetailsContainer}>
                            <View style={styles.detailCard}>
                              {/* Order Time Row */}
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
                              {/* Delivery Method Row */}
                              {/* {deliveryMethod && (
                                <View style={styles.detailRow}>
                                  <View style={styles.detailIconContainer}>
                                    <MapPin size={16} color="#6B7280" />
                                  </View>
                                  <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>Delivery Method</Text>
                                    <Text style={styles.detailValue}>
                                      {deliveryMethod.charAt(0).toUpperCase() +
                                        deliveryMethod.slice(1).replace(/-/g, " ")}
                                    </Text>
                                  </View>
                                </View>
                              )} */}
                            </View>
                          </View>

                          {/* Track Delivery Button */}
                          {["delivering", "out-for-delivery"].includes(statusKey) && (
                            <View style={styles.actionContainer}>
                              <TouchableOpacity
                                style={styles.trackButton}
                                onPress={() => {handleTrackDelivery(orderId); trackingOrderId === orderId ? setDisconnectToIo(!disconnectToIo) :null}}
                                activeOpacity={0.9}
                              >
                                <LinearGradient
                                  colors={["#F59E0B", "#D97706"]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={styles.trackButtonGradient}
                                >
                                  <Text style={styles.trackButtonText}>
                                    {trackingOrderId === orderId ? "Hide Map" : "Track Delivery"}
                                  </Text>
                                  {trackingOrderId === orderId ? (
                                    <ChevronUp size={18} color="#FFFFFF" />
                                  ) : (
                                    <ChevronDown size={18} color="#FFFFFF" />
                                  )}
                                </LinearGradient>
                              </TouchableOpacity>
                            </View>
                          )}

                          {/* Inline Map View */}
                          {trackingOrderId === orderId && user?.token && user?._id && (
                            <View style={styles.inlineMapContainer}>
                              <View style={styles.inlineMapWrapper}>
                                <TrackingMap 
                                  orderId={orderId}
                                  disconnectToIo={disconnectToIo}
                                  setDisconnectToIo={setDisconnectToIo}
                                />
                              </View>
                              <TouchableOpacity
                                style={styles.fullScreenButton}
                                onPress={() => handleFullScreen(orderId)}
                                activeOpacity={0.9}
                              >
                                <LinearGradient
                                  colors={["#3B82F6", "#2563EB"]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={styles.fullScreenButtonGradient}
                                >
                  <Text style={styles.fullScreenButtonIcon}>🔍</Text>
                                  <Text style={styles.fullScreenButtonText}>
                                    View Full Screen
                                  </Text>
                                </LinearGradient>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    </Animated.View>
                );
              })}
          </View>
        )}

        {fullScreenOrderId && user?.token && user?._id && (
          <Modal
            visible={true}
            animationType="slide"
            transparent={false}
            onRequestClose={() => setFullScreenOrderId(null)}
          >
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={["#FFFFFF", "#F8F9FA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalHeader}
              >
                <View style={styles.modalHeaderContent}>
                  <Text style={styles.modalTitle}>
                    Tracking Delivery 
                  </Text>
                  <TouchableOpacity
                    onPress={() => setFullScreenOrderId(null)}
                    style={styles.closeButtonContainer}
                  >
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.modalBody}>
                <TrackingMap 
                  orderId={fullScreenOrderId || ""}
                  disconnectToIo={disconnectToIo}
                  setDisconnectToIo={setDisconnectToIo}
                />
              </View>
            </View>
          </Modal>
        )}

        {qrModalData && (
          <Modal
            visible={true}
            transparent
            animationType="fade"
            onRequestClose={() => setQrModalData(null)}
          >
            <View style={styles.qrModalOverlay}>
              <View style={styles.qrModalCard}>
                <Text style={styles.qrModalTitle}>Scan Verification Code</Text>
                <Text style={styles.qrModalSubtitle}>
                  Order {qrModalData.orderCode}
                </Text>
                <Image
                  source={{
                    uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                      qrModalData.verificationCode
                    )}`,
                  }}
                  style={styles.qrImage}
                  contentFit="contain"
                />
                <Text style={styles.qrCodeValueText}>
                  {qrModalData.verificationCode}
                </Text>
                <TouchableOpacity
                  style={styles.qrCloseButton}
                  activeOpacity={0.85}
                  onPress={() => setQrModalData(null)}
                >
                  <LinearGradient
                    colors={["#EF4444", "#DC2626"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.qrCloseButtonGradient}
                  >
                    <Text style={styles.qrCloseButtonText}>Close</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
  headerActions: {
    marginTop: 12,
    alignItems: 'center',
  },
  refreshButton: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  refreshButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  refreshButtonIcon: {
    fontSize: 16,
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
    borderRadius:7,
    backgroundColor:"#333",
    padding:5,
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
  qrButton: {
    marginTop: 12,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    
  },
  qrButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 8,
  },
  qrButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  qrButtonIcon: {
    fontSize: 16,
  },
  orderDetailsContainer: {
    marginTop: 1,
    
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.heading3,
    color: colors.black,
    fontWeight: '600',
  },
  closeButtonContainer: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  qrModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  qrModalTitle: {
    ...typography.heading3,
    color: colors.black,
    fontWeight: '700',
    textAlign: 'center',
  },
  qrModalSubtitle: {
    ...typography.body,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  qrImage: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    marginVertical: 12,
  },
  qrCodeValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    letterSpacing: 1,
  },
  qrCloseButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
  },
  qrCloseButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCloseButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  inlineMapContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inlineMapWrapper: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fullScreenButton: {
    margin: 12,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fullScreenButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fullScreenButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  fullScreenButtonIcon: {
    fontSize: 16,
  },
});