import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Search, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search recipes...",
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Search size={20} color={colors.lightText} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.lightText}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <X size={18} color={colors.lightText} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
});
