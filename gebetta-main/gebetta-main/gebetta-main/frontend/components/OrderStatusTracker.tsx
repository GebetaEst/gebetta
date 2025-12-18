import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Order } from "@/types/restaurant";
import { Bike, Check, ChefHat, Clock, Package } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface OrderStatusTrackerProps {
  status: Order["status"];
}

export default function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
  const statuses: Array<{
    key: Order["status"];
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "confirmed",
      label: "Confirmed",
      icon: <Check size={20} color={colors.white} />,
    },
    {
      key: "preparing",
      label: "Preparing",
      icon: <ChefHat size={20} color={colors.white} />,
    },
    {
      key: "out-for-delivery",
      label: "On the way",
      icon: <Bike size={20} color={colors.white} />,
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: <Package size={20} color={colors.white} />,
    },
  ];

  const getCurrentStatusIndex = () => {
    if (status === "pending") return -1;
    if (status === "cancelled") return -1;
    return statuses.findIndex(s => s.key === status);
  };

  const currentStatusIndex = getCurrentStatusIndex();

  return (
    <View style={styles.container}>
      {status === "pending" && (
        <View style={styles.pendingContainer}>
          <View style={styles.pendingIconContainer}>
            <Clock size={24} color={colors.secondary} />
          </View>
          <Text style={styles.pendingText}>
            Waiting for restaurant to confirm your order...
          </Text>
        </View>
      )}

      {status === "cancelled" && (
        <View style={styles.cancelledContainer}>
          <Text style={styles.cancelledText}>
            This order has been cancelled
          </Text>
        </View>
      )}

      {status !== "pending" && status !== "cancelled" && (
        <>
          <View style={styles.stepsContainer}>
            {statuses.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <React.Fragment key={step.key}>
                  {index > 0 && (
                    <View
                      style={[
                        styles.connector,
                        isCompleted && styles.completedConnector,
                      ]}
                    />
                  )}
                  <View
                    style={[
                      styles.step,
                      isCompleted && styles.completedStep,
                      isCurrent && styles.currentStep,
                    ]}
                  >
                    {step.icon}
                  </View>
                </React.Fragment>
              );
            })}
          </View>

          <View style={styles.labelsContainer}>
            {statuses.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <View key={step.key} style={styles.labelContainer}>
                  <Text
                    style={[
                      styles.label,
                      isCompleted && styles.completedLabel,
                      isCurrent && styles.currentLabel,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  pendingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary + "20", // 20% opacity
    padding: 16,
    borderRadius: 12,
  },
  pendingIconContainer: {
    marginRight: 12,
  },
  pendingText: {
    ...typography.body,
    color: colors.secondary,
    flex: 1,
  },
  cancelledContainer: {
    backgroundColor: colors.error + "20", // 20% opacity
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelledText: {
    ...typography.body,
    color: colors.error,
    fontWeight: "500",
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.divider,
  },
  completedStep: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  currentStep: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  connector: {
    flex: 1,
    height: 3,
    backgroundColor: colors.divider,
  },
  completedConnector: {
    backgroundColor: colors.primary,
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  labelContainer: {
    width: 80,
    alignItems: "center",
  },
  label: {
    ...typography.caption,
    color: colors.lightText,
    textAlign: "center",
  },
  completedLabel: {
    color: colors.text,
    fontWeight: "500",
  },
  currentLabel: {
    color: colors.primary,
    fontWeight: "600",
  },
});
