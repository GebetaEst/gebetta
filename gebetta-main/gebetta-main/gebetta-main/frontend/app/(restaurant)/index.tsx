import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { analyticsAPI, orderAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Web-compatible chart component
const LineChart = Platform.OS === 'web' 
  ? ({ data, width, height, chartConfig, bezier, style }: any) => (
      <View style={[{ width, height }, style, styles.webChartPlaceholder]}>
        <Text style={styles.webChartText}>
          Chart visualization available on mobile devices
        </Text>
      </View>
    )
  : require('react-native-chart-kit').LineChart;

export default function RestaurantDashboard() {
  const router = useRouter();
  const { user, userRole, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  const screenWidth = Dimensions.get("window").width - 40;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would get the restaurant ID from the user's profile
      const restaurantId = user?.restaurantId || "restaurant-123";
      
      // Fetch analytics data
      const analyticsData = await analyticsAPI.getRestaurantAnalytics(restaurantId, "week");
      
      // Fetch recent orders
      const orders = await orderAPI.getRestaurantOrders(restaurantId);
      const recentOrders = orders.slice(0, 5); // Get 5 most recent orders
      
      // Set stats
      setStats({
        totalOrders: analyticsData.totalOrders,
        pendingOrders: orders.filter((o: any) => o.status === "pending").length,
        totalRevenue: analyticsData.totalSales,
        totalCustomers: analyticsData.newCustomers + analyticsData.customerBreakdown.returning,
      });
      
      // Set recent orders
      setRecentOrders(recentOrders);
      
      // Prepare chart data
      const labels = Object.keys(analyticsData.salesByDay).map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      });
      
      const data = Object.values(analyticsData.salesByDay);
      
      setChartData({
        labels,
        datasets: [
          {
            data: data as number[],
            color: () => colors.primary,
            strokeWidth: 2,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      
      // For demo purposes, set mock data if API fails
      setStats({
        totalOrders: 156,
        pendingOrders: 8,
        totalRevenue: 12580,
        totalCustomers: 87,
      });
      
      setRecentOrders([
        {
          id: "order1",
          status: "pending",
          totalAmount: 350,
          createdAt: new Date().toISOString(),
          items: [
            { name: "Doro Wat", quantity: 2 },
            { name: "Injera", quantity: 4 },
          ],
        },
        {
          id: "order2",
          status: "confirmed",
          totalAmount: 420,
          createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
          items: [
            { name: "Tibs", quantity: 1 },
            { name: "Ethiopian Coffee", quantity: 2 },
          ],
        },
        {
          id: "order3",
          status: "preparing",
          totalAmount: 280,
          createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
          items: [
            { name: "Kitfo", quantity: 1 },
            { name: "Injera", quantity: 2 },
          ],
        },
      ]);
      
      setChartData({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            data: [20, 45, 28, 80, 99, 43, 50],
            color: () => colors.primary,
            strokeWidth: 2,
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    backgroundGradientFrom: colors.cardBackground,
    backgroundGradientTo: colors.cardBackground,
    decimalPlaces: 0,
    color: () => colors.primary,
    labelColor: () => colors.lightText,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary,
    },
  };

  const handleLogout = () => {
    logout();
    router.replace("/(auth)");
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // In a real app, we would call an API to update the order status
      await orderAPI.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setRecentOrders(recentOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      ));
      
      Alert.alert("Success", "Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      Alert.alert("Error", "Failed to update order status. Please try again.");
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string> = {
      "pending": "confirmed",
      "confirmed": "preparing",
      "preparing": "ready",
      "ready": "delivered",
    };
    
    return statusFlow[currentStatus] || "delivered";
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      "pending": colors.warning,
      "confirmed": colors.info,
      "preparing": colors.info,
      "ready": colors.success,
      "in-delivery": colors.info,
      "delivered": colors.success,
      "cancelled": colors.error,
    };
    
    return statusColors[status] || colors.lightText;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const menuItems = [
    {
      id: "menu",
      title: "Menu Management",
      icon: <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={colors.text} />,
      description: "Add, edit or remove menu items",
      route: "/menu",
      permission: ["owner", "manager"],
    },
    {
      id: "recipes",
      title: "Recipe Management",
      icon: <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={colors.text} />,
      description: "Manage your restaurant recipes",
      route: "/recipes",
      permission: ["owner", "manager"],
    },
    {
      id: "orders",
      title: "Orders",
      icon: <MaterialIcons name="shopping-bag" size={24} color={colors.text} />,
      description: "View and manage customer orders",
      route: "/orders",
      permission: ["owner", "manager"],
    },
    {
      id: "customers",
      title: "Customers",
      icon: <MaterialIcons name="people" size={24} color={colors.text} />,
      description: "View customer information",
      route: "/customers",
      permission: ["owner"],
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: <MaterialIcons name="bar-chart" size={24} color={colors.text} />,
      description: "View sales and performance metrics",
      route: "/analytics",
      permission: ["owner"],
    },
    {
      id: "settings",
      title: "Restaurant Settings",
      icon: <Feather name="settings" size={24} color={colors.text} />,
      description: "Manage restaurant profile and settings",
      route: "/settings",
      permission: ["owner"],
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) =>
    item.permission.includes(userRole || "owner")
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri: user?.avatar || "https://ui-avatars.com/api/?name=Restaurant&background=random",
              }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || "Restaurant Owner"}</Text>
              <Text style={styles.userRole}>
                {userRole === "owner" ? "Restaurant Owner" : "Restaurant Manager"}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.pendingOrders}</Text>
              <Text style={styles.statLabel}>Pending Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${stats.totalRevenue}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalCustomers}</Text>
              <Text style={styles.statLabel}>Customers</Text>
            </View>
          </View>
        </View>

        {userRole === "owner" && chartData && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Weekly Sales</Text>
            <View style={styles.chart}>
              <LineChart
                data={chartData}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
              />
            </View>
          </View>
        )}

        <View style={styles.recentOrdersContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push("/(restaurant)/orders")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>Order #{order.id.slice(-4)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + "20" }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderTime}>{formatDate(order.createdAt)}</Text>
                </View>
                
                <View style={styles.orderItems}>
                  {order.items.map((item: any, index: number) => (
                    <Text key={index} style={styles.orderItem}>
                      {item.quantity}x {item.name}
                    </Text>
                  ))}
                </View>
                
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>${order.totalAmount}</Text>
                  
                  {order.status !== "delivered" && order.status !== "cancelled" && (
                    <TouchableOpacity
                      style={styles.updateStatusButton}
                      onPress={() => handleUpdateOrderStatus(order.id, getNextStatus(order.status))}
                    >
                      <Text style={styles.updateStatusText}>
                        Mark as {getNextStatus(order.status).charAt(0).toUpperCase() + getNextStatus(order.status).slice(1)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyOrdersContainer}>
              <MaterialIcons name="warning" size={24} color={colors.lightText} />
              <Text style={styles.emptyOrdersText}>No recent orders</Text>
            </View>
          )}
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {filteredMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(`/(restaurant)/menu`)}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemIcon}>{item.icon}</View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.lightText} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userDetails: {},
  welcomeText: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  userName: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 4,
  },
  userRole: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  logoutText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: "500",
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statValue: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: 8,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chart: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  chartStyle: {
    borderRadius: 12,
    paddingRight: 16,
  },
  webChartPlaceholder: {
    height: 220,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 24,
  },
  webChartText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
    padding: 20,
  },
  recentOrdersContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderId: {
    ...typography.bodyLarge,
    fontWeight: "600",
    marginRight: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "600",
  },
  orderTime: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  orderTotal: {
    ...typography.bodyLarge,
    fontWeight: "700",
    color: colors.primary,
  },
  updateStatusButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  updateStatusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "600",
  },
  emptyOrdersContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyOrdersText: {
    ...typography.body,
    color: colors.lightText,
    marginTop: 8,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 4,
  },
  menuItemDescription: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
});
