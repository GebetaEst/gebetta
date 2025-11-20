import colors from "@/constants/colors";
import countryCodes from "@/constants/countryCodes";
import typography from "@/constants/typography";
import { CountryCode } from "@/types/auth";
import { Search, X } from "lucide-react-native";
import React from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Input from "./Input";

interface CountryCodePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: CountryCode) => void;
  selectedCountry?: CountryCode;
  currentCode?: string;
}

const CountryCodePicker: React.FC<CountryCodePickerProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCountry,
  currentCode,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredCountries, setFilteredCountries] = React.useState<CountryCode[]>(countryCodes);

  // Find the selected country based on code if not directly provided
  const selected = selectedCountry || 
    (currentCode ? countryCodes.find(c => c.code === currentCode) : countryCodes[0]);

  React.useEffect(() => {
    if (searchQuery) {
      const filtered = countryCodes.filter(
        (country) =>
          country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.code.includes(searchQuery)
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countryCodes);
    }
  }, [searchQuery]);

  const renderItem = ({ item }: { item: CountryCode }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        selected?.code === item.code && styles.selectedCountryItem,
      ]}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.countryCode}>{item.code}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Country</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colors.lightText} style={styles.searchIcon} />
            <Input
              placeholder="Search country or code"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              containerStyle={styles.searchInputWrapper}
            />
          </View>
        </View>

        <FlatList
          data={filteredCountries}
          renderItem={renderItem}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.heading3,
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInputWrapper: {
    flex: 1,
    marginBottom: 0,
  },
  searchInput: {
    paddingLeft: 40,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedCountryItem: {
    backgroundColor: colors.primary + "10",
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  countryCode: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
});

export default CountryCodePicker;
