import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "@react-navigation/native";
import { analyticsAPI } from "@/api/analytics";
import { useAuth } from "@/context/AuthContext";
import { colors, typography } from "@/styles/theme";
import { AnalyticsData, Period } from "@/types/analytics";
import { UserRole } from "@/types/user";

const { width } = Dimensions.get("window");

export default function AnalyticsScreen() {
  const { colors: themeColors } = useTheme();
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>(Period.MONTH);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get available periods based on user role
  const isRestaurantOwner = user?.role === UserRole.RESTAURANT_OWNER;
  const periodOptions: { value: Period; label: string }[] = isRestaurantOwner
    ? [
        { value: Period.MONTH, label: "Monthly" },
        { value: Period.YEAR, label: "Yearly" },
      ]
    : [
        { value: Period.DAY, label: "Daily" },
        { value: Period.WEEK, label: "Weekly" },
        { value: Period.MONTH, label: "Monthly" },
      ];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await analyticsAPI.getAnalytics(period);
        setAnalyticsData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [period, user?.restaurantId]);

  const getChartConfig = (colors: any) => ({
    backgroundGradientFrom: colors.cardBackground,
    backgroundGradientTo: colors.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary,
    labelColor: (opacity = 1) => colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary,
    },
    propsForBackgroundLines: {
      strokeWidth: "1",
      stroke: colors.border,
    },
    yAxisLabel: "Orders",
    yAxisSuffix: "",
    propsForGridLines: {
      horizontal: true,
      vertical: false,
    },
    verticalLabelRotation: 30,
  });

  const renderChart = (data: any, title: string, colors: any) => {
    if (!data) return null;

    const chartData = {
      labels: data.labels,
      datasets: [
        {
          data: data.values,
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <LineChart
          data={chartData}
          width={width - 64}
          height={200}
          chartConfig={getChartConfig(colors)}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.periodSelector}>
          {periodOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.periodButton,
                period === option.value && styles.activePeriodButton,
              ]}
              onPress={() => setPeriod(option.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  period === option.value && styles.activePeriodButtonText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Total Orders</Text>
          <Text style={styles.statValue}>{analyticsData?.totalOrders}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Completed Orders</Text>
          <Text style={styles.statValue}>{analyticsData?.completedOrders}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Cancelled Orders</Text>
          <Text style={styles.statValue}>{analyticsData?.cancelledOrders}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Total Revenue</Text>
          <Text style={styles.statValue}>ETB{analyticsData?.totalRevenue}</Text>
        </View>
      </View>

      {renderChart(analyticsData?.orderTrends, "Order Trends", themeColors)}

      <View style={styles.popularItemsContainer}>
        <Text style={styles.popularItemsTitle}>Popular Items</Text>
        <FlatList
          data={analyticsData?.popularItems}
          renderItem={({ item }) => (
            <View style={styles.popularItem}>
              <Text style={styles.popularItemName}>{item.name}</Text>
              <Text style={styles.popularItemCount}>{item.orders} orders</Text>
            </View>
          )}
          keyExtractor={(item) => item.name}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text,
  },
  periodSelector: {
    flexDirection: "row",
    gap: 8,
  },
  periodButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  activePeriodButton: {
    backgroundColor: colors.primary,
  },
  activePeriodButtonText: {
    color: colors.white,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 100,
  },
  statTitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
  chartContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  chartStyle: {
    borderRadius: 16,
    width: width - 64,
    height: 200,
  },
  popularItemsContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  popularItemsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  popularItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  popularItemName: {
    fontSize: 16,
    flex: 1,
  },
  popularItemCount: {
    fontSize: 16,
    color: colors.primary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginBottom: 24,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
