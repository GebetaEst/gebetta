import restaurantOwnerColors from "@/constants/restaurantOwnerColors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { AlertTriangle, CheckCircle, ChevronRight, Clock, Search, XCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Mock order data
const initialOrders = [
  {
    id: "1",
    customerName: "John Doe",
    customerPhone: "+1 (555) 123-4567",
    items: [
      { name: "Doro Wat", quantity: 2, price: 14.99 },
      { name: "Injera", quantity: 4, price: 3.99 },
    ],
    total: 45.94,
    status: "pending",
    paymentMethod: "Credit Card",
    deliveryAddress: "123 Main St, Apt 4B, New York, NY 10001",
    orderTime: "2023-06-15T14:30:00Z",
    specialInstructions: "Extra spicy please",
  },
  {
    id: "2",
    customerName: "Jane Smith",
    customerPhone: "+1 (555) 987-6543",
    items: [
      { name: "Tibs", quantity: 1, price: 16.99 },
      { name: "Ethiopian Coffee", quantity: 2, price: 4.99 },
    ],
    total: 26.97,
    status: "preparing",
    paymentMethod: "Cash on Delivery",
    deliveryAddress: "456 Oak Ave, Brooklyn, NY 11201",
    orderTime: "2023-06-15T15:15:00Z",
    specialInstructions: "",
  },
  {
    id: "3",
    customerName: "Michael Johnson",
    customerPhone: "+1 (555) 456-7890",
    items: [
      { name: "Kitfo", quantity: 1, price: 15.99 },
      { name: "Tibs", quantity: 1, price: 16.99 },
      { name: "Injera", quantity: 2, price: 3.99 },
    ],
    total: 40.96,
    status: "ready",
    paymentMethod: "Credit Card",
    deliveryAddress: "789 Pine St, Queens, NY 11354",
    orderTime: "2023-06-15T13:45:00Z",
    specialInstructions: "No onions please",
  },
  {
    id: "4",
    customerName: "Sarah Williams",
    customerPhone: "+1 (555) 789-0123",
    items: [
      { name: "Doro Wat", quantity: 1, price: 14.99 },
      { name: "Ethiopian Coffee", quantity: 1, price: 4.99 },
    ],
    total: 19.98,
    status: "delivered",
    paymentMethod: "Credit Card",
    deliveryAddress: "321 Elm St, Bronx, NY 10452",
    orderTime: "2023-06-15T12:00:00Z",
    specialInstructions: "",
  },
  {
    id: "5",
    customerName: "David Brown",
    customerPhone: "+1 (555) 234-5678",
    items: [
      { name: "Tibs", quantity: 2, price: 16.99 },
      { name: "Injera", quantity: 4, price: 3.99 },
    ],
    total: 49.94,
    status: "cancelled",
    paymentMethod: "Credit Card",
    deliveryAddress: "654 Maple Ave, Staten Island, NY 10301",
    orderTime: "2023-06-15T11:30:00Z",
    specialInstructions: "Deliver to back door",
  },
];

// Order status options
const orderStatuses = ["all", "pending", "preparing", "ready", "delivered", "cancelled"];

export default function OrdersManagement() {
  const router = useRouter();
  const { userRole } = useAuthStore();
  const [orders, setOrders] = useState(initialOrders);
  const [filteredOrders, setFilteredOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    // Filter orders based on search query and status
    let filtered = [...orders];
    
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.some(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }
    
    if (selectedStatus !== "all") {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }
    
    setFilteredOrders(filtered);
  }, [searchQuery, selectedStatus, orders]);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === id) {
        return {
          ...order,
          status: newStatus,
        };
      }
      return order;
    });
    setOrders(updatedOrders);
    
    Alert.alert(
      "Status Updated",
      `Order #${id} status has been updated to ${newStatus}.`
    );
  };

  const handleViewOrderDetails = (id: string) => {
    // In a real app, this would navigate to a detailed view of the order
    Alert.alert(
      "View Order Details",
      `This would open a detailed view of order #${id}`
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return restaurantOwnerColors.warning;
      case "preparing":
        return restaurantOwnerColors.info;
      case "ready":
        return restaurantOwnerColors.success;
      case "delivered":
        return restaurantOwnerColors.success;
      case "cancelled":
        return restaurantOwnerColors.error;
      default:
        return restaurantOwnerColors.lightText;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} color={getStatusColor(status)} />;
      case "preparing":
        return <Clock size={16} color={getStatusColor(status)} />;
      case "ready":
        return <CheckCircle size={16} color={getStatusColor(status)} />;
      case "delivered":
        return <CheckCircle size={16} color={getStatusColor(status)} />;
      case "cancelled":
        return <XCircle size={16} color={getStatusColor(status)} />;
      default:
        return <AlertTriangle size={16} color={getStatusColor(status)} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const calculateTotal = (items: Array<{ name: string; quantity: number; price: number }>) => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0).toFixed(2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={restaurantOwnerColors.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            placeholderTextColor={restaurantOwnerColors.placeholderText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilterContainer}
        contentContainerStyle={styles.statusFilterContent}
      >
        {orderStatuses.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusFilterPill,
              selectedStatus === status && styles.statusFilterPillActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.statusFilterText,
                selectedStatus === status && styles.statusFilterTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders found</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.ordersList}
          contentContainerStyle={styles.ordersListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>Order #{order.id}</Text>
                  <Text style={styles.orderTime}>{formatDate(order.orderTime)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + "20" }]}>
                  {getStatusIcon(order.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.customerPhone}>{order.customerPhone}</Text>
              </View>
              
              <View style={styles.orderItems}>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>${(item.quantity * item.price).toFixed(2)}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.orderTotal}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>${calculateTotal(order.items)}</Text>
              </View>
              
              {order.specialInstructions && (
                <View style={styles.specialInstructions}>
                  <Text style={styles.instructionsLabel}>Special Instructions:</Text>
                  <Text style={styles.instructionsText}>{order.specialInstructions}</Text>
                </View>
              )}
              
              <View style={styles.orderActions}>
                <TouchableOpacity
                  style={styles.viewDetailsButton}
                  onPress={() => handleViewOrderDetails(order.id)}
                >
                  <Text style={styles.viewDetailsText}>View Details</Text>
                  <ChevronRight size={16} color={restaurantOwnerColors.primary} />
                </TouchableOpacity>
                
                {(order.status === "pending" || order.status === "preparing" || order.status === "ready") && (
                  <View style={styles.statusActions}>
                    {order.status === "pending" && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.prepareButton]}
                        onPress={() => handleUpdateStatus(order.id, "preparing")}
                      >
                        <Text style={styles.actionButtonText}>Start Preparing</Text>
                      </TouchableOpacity>
                    )}
                    
                    {order.status === "preparing" && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.readyButton]}
                        onPress={() => handleUpdateStatus(order.id, "ready")}
                      >
                        <Text style={styles.actionButtonText}>Mark as Ready</Text>
                      </TouchableOpacity>
                    )}
                    
                    {order.status === "ready" && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deliveredButton]}
                        onPress={() => handleUpdateStatus(order.id, "delivered")}
                      >
                        <Text style={styles.actionButtonText}>Mark as Delivered</Text>
                      </TouchableOpacity>
                    )}
                    
                    {(order.status === "pending" || order.status === "preparing") && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => handleUpdateStatus(order.id, "cancelled")}
                      >
                        <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel Order</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: restaurantOwnerColors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: restaurantOwnerColors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: restaurantOwnerColors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: restaurantOwnerColors.text,
    ...typography.body,
  },
  statusFilterContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: restaurantOwnerColors.border,
  },
  statusFilterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
  },
  statusFilterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: restaurantOwnerColors.lightGray,
    marginRight: 8,
  },
  statusFilterPillActive: {
    backgroundColor: restaurantOwnerColors.primary,
  },
  statusFilterText: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.text,
    fontWeight: "500",
  },
  statusFilterTextActive: {
    color: restaurantOwnerColors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: restaurantOwnerColors.lightText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: restaurantOwnerColors.lightText,
  },
  ordersList: {
    flex: 1,
  },
  ordersListContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: restaurantOwnerColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    ...typography.bodyLarge,
    color: restaurantOwnerColors.text,
    fontWeight: "600",
  },
  orderTime: {
    ...typography.caption,
    color: restaurantOwnerColors.lightText,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "500",
    marginLeft: 4,
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerName: {
    ...typography.body,
    color: restaurantOwnerColors.text,
    fontWeight: "500",
  },
  customerPhone: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.lightText,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  itemQuantity: {
    ...typography.body,
    color: restaurantOwnerColors.primary,
    fontWeight: "600",
    width: 30,
  },
  itemName: {
    ...typography.body,
    color: restaurantOwnerColors.text,
    flex: 1,
  },
  itemPrice: {
    ...typography.body,
    color: restaurantOwnerColors.text,
    fontWeight: "500",
  },
  orderTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: restaurantOwnerColors.border,
    marginBottom: 12,
  },
  totalLabel: {
    ...typography.bodyLarge,
    color: restaurantOwnerColors.text,
    fontWeight: "600",
  },
  totalAmount: {
    ...typography.heading3,
    color: restaurantOwnerColors.text,
  },
  specialInstructions: {
    backgroundColor: restaurantOwnerColors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  instructionsLabel: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.text,
    fontWeight: "600",
    marginBottom: 4,
  },
  instructionsText: {
    ...typography.body,
    color: restaurantOwnerColors.text,
  },
  orderActions: {
    marginTop: 8,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  viewDetailsText: {
    ...typography.body,
    color: restaurantOwnerColors.primary,
    fontWeight: "500",
    marginRight: 4,
  },
  statusActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    minWidth: "48%",
  },
  prepareButton: {
    backgroundColor: restaurantOwnerColors.info + "20",
  },
  readyButton: {
    backgroundColor: restaurantOwnerColors.success + "20",
  },
  deliveredButton: {
    backgroundColor: restaurantOwnerColors.success + "20",
  },
  cancelButton: {
    backgroundColor: restaurantOwnerColors.error + "20",
  },
  actionButtonText: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: restaurantOwnerColors.text,
  },
  cancelButtonText: {
    color: restaurantOwnerColors.error,
  },
});
