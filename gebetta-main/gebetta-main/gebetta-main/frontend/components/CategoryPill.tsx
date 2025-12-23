import colors from "@/constants/colors";
import typography from "@/constants/typography";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface CategoryPillProps extends React.ComponentPropsWithoutRef<typeof TouchableOpacity> {
  title: string;
  selected?: boolean;
  onPress: () => void;
}

export default function CategoryPill({
  title,
  selected = false,
  onPress,
}: CategoryPillProps) {
  return (
    <TouchableOpacity
      style={[styles.pill, selected && styles.selectedPill]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.pillText, selected && styles.selectedPillText]}
      >
        {title.charAt(0).toUpperCase() + title.slice(1)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    marginRight: 8,
    marginVertical: 4,
    alignItems: "center",
    justifyContent: "center",
    // Add shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  selectedPill: {
    backgroundColor: colors.primary,
    // Enhanced shadow for selected state
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  pillText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  selectedPillText: {
    color: colors.white,
  },
});
