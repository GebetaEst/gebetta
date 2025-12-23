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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
    marginRight: 8,
    marginVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedPill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
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
