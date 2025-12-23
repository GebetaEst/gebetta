import restaurantOwnerColors from "@/constants/restaurantOwnerColors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronRight, Clock, Filter, Mail, Phone, Search, Star } from "lucide-react-native";
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

// Mock customer data
const initialCustomers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Apt 4B, New York, NY 10001",
    totalOrders: 12,
    totalSpent: 345.67,
    lastOrderDate: "2023-06-10T14:30:00Z",
    favoriteItems: ["Doro Wat", "Injera"],
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=random",
    loyaltyPoints: 120,
    notes: "Prefers extra spicy food",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
    address: "456 Oak Ave, Brooklyn, NY 11201",
    totalOrders: 8,
    totalSpent: 210.45,
    lastOrderDate: "2023-06-12T15:15:00Z",
    favoriteItems: ["Tibs", "Ethiopian Coffee"],
    avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=random",
    loyaltyPoints: 85,
    notes: "",
  },
  {
    id: "3",
    name: "Michael Johnson",
    email: "michael.johnson@example.com",
    phone: "+1 (555) 456-7890",
    address: "789 Pine St, Queens, NY 11354",
    totalOrders: 5,
    totalSpent: 178.32,
    lastOrderDate: "2023-06-08T13:45:00Z",
    favoriteItems: ["Kitfo", "Tibs"],
    avatar: "https://ui-avatars.com/api/?name=Michael+Johnson&background=random",
    loyaltyPoints: 50,
    notes: "Allergic to nuts",
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    phone: "+1 (555) 789-0123",
    address: "321 Elm St, Bronx, NY 10452",
    totalOrders: 15,
    totalSpent: 412.89,
    lastOrderDate: "2023-06-14T12:00:00Z",
    favoriteItems: ["Doro Wat", "Ethiopian Coffee"],
    avatar: "https://ui-avatars.com/api/?name=Sarah+Williams&background=random",
    loyaltyPoints: 150,
    notes: "VIP customer",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@example.com",
    phone: "+1 (555) 234-5678",
    address: "654 Maple Ave, Staten Island, NY 10301",
    totalOrders: 3,
    totalSpent: 87.65,
    lastOrderDate: "2023-06-05T11:30:00Z",
    favoriteItems: ["Tibs"],
    avatar: "https://ui-avatars.com/api/?name=David+Brown&background=random",
    loyaltyPoints: 30,
    notes: "New customer",
  },
];

// Sort options
const sortOptions = [
  { id: "recent", label: "Most Recent Order" },
  { id: "orders", label: "Most Orders" },
  { id: "spent", label: "Highest Spent" },
  { id: "loyalty", label: "Most Loyalty Points" },
];

export default function CustomersManagement() {
  const router = useRouter();
  const { userRole } = useAuthStore();
  const [customers, setCustomers] = useState(initialCustomers);
  const [filteredCustomers, setFilteredCustomers] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [showSortOptions, setShowSortOptions] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    // Filter and sort customers
    let filtered = [...customers];
    
    if (searchQuery) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery)
      );
    }
    
    // Sort customers based on selected option
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
        break;
      case "orders":
        filtered.sort((a, b) => b.totalOrders - a.totalOrders);
        break;
      case "spent":
        filtered.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      case "loyalty":
        filtered.sort((a, b) => b.loyaltyPoints - a.loyaltyPoints);
        break;
      default:
        break;
    }
    
    setFilteredCustomers(filtered);
  }, [searchQuery, sortBy, customers]);

  const handleViewCustomerDetails = (id: string) => {
    // In a real app, this would navigate to a detailed view of the customer
    Alert.alert(
      "View Customer Details",
      `This would open a detailed view of customer with ID: ${id}`
    );
  };

  const handleAddNote = (id: string) => {
    // In a real app, this would open a form to add a note to the customer
    Alert.alert(
      "Add Note",
      `This would open a form to add a note to customer with ID: ${id}`
    );
  };

  const handleSendPromotion = (id: string) => {
    // In a real app, this would open a form to send a promotion to the customer
    Alert.alert(
      "Send Promotion",
      `This would open a form to send a promotion to customer with ID: ${id}`
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.id === sortBy);
    return option ? option.label : "Sort By";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={restaurantOwnerColors.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            placeholderTextColor={restaurantOwnerColors.placeholderText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <Filter size={20} color={restaurantOwnerColors.text} />
        </TouchableOpacity>
      </View>

      {showSortOptions && (
        <View style={styles.sortOptionsContainer}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                sortBy === option.id && styles.sortOptionActive,
              ]}
              onPress={() => {
                setSortBy(option.id);
                setShowSortOptions(false);
              }}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option.id && styles.sortOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.sortIndicator}>
        <Text style={styles.sortIndicatorText}>
          Sorted by: {getSortLabel()}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : filteredCustomers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No customers found</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.customersList}
          contentContainerStyle={styles.customersListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredCustomers.map((customer) => (
            <TouchableOpacity
              key={customer.id}
              style={styles.customerCard}
              onPress={() => handleViewCustomerDetails(customer.id)}
            >
              <View style={styles.customerHeader}>
                <Image
                  source={{ uri: customer.avatar }}
                  style={styles.customerAvatar}
                  contentFit="cover"
                />
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <View style={styles.customerContact}>
                    <Mail size={14} color={restaurantOwnerColors.lightText} style={styles.contactIcon} />
                    <Text style={styles.contactText}>{customer.email}</Text>
                  </View>
                  <View style={styles.customerContact}>
                    <Phone size={14} color={restaurantOwnerColors.lightText} style={styles.contactIcon} />
                    <Text style={styles.contactText}>{customer.phone}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.customerStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{customer.totalOrders}</Text>
                  <Text style={styles.statLabel}>Orders</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>${customer.totalSpent.toFixed(2)}</Text>
                  <Text style={styles.statLabel}>Spent</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{customer.loyaltyPoints}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
              </View>
              
              <View style={styles.customerDetails}>
                <View style={styles.detailItem}>
                  <Clock size={16} color={restaurantOwnerColors.lightText} style={styles.detailIcon} />
                  <Text style={styles.detailText}>
                    Last order: {formatDate(customer.lastOrderDate)}
                  </Text>
                </View>
                
                {customer.favoriteItems.length > 0 && (
                  <View style={styles.detailItem}>
                    <Star size={16} color={restaurantOwnerColors.lightText} style={styles.detailIcon} />
                    <Text style={styles.detailText}>
                      Favorites: {customer.favoriteItems.join(", ")}
                    </Text>
                  </View>
                )}
                
                {customer.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{customer.notes}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.customerActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAddNote(customer.id)}
                >
                  <Text style={styles.actionButtonText}>Add Note</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSendPromotion(customer.id)}
                >
                  <Text style={styles.actionButtonText}>Send Promotion</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.viewDetailsContainer}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <ChevronRight size={16} color={restaurantOwnerColors.primary} />
              </View>
            </TouchableOpacity>
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
  sortButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    backgroundColor: restaurantOwnerColors.lightGray,
    borderRadius: 8,
  },
  sortOptionsContainer: {
    backgroundColor: restaurantOwnerColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: restaurantOwnerColors.border,
    padding: 12,
  },
  sortOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  sortOptionActive: {
    backgroundColor: restaurantOwnerColors.primary + "20",
  },
  sortOptionText: {
    ...typography.body,
    color: restaurantOwnerColors.text,
  },
  sortOptionTextActive: {
    color: restaurantOwnerColors.primary,
    fontWeight: "600",
  },
  sortIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: restaurantOwnerColors.border,
  },
  sortIndicatorText: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.lightText,
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
  customersList: {
    flex: 1,
  },
  customersListContent: {
    padding: 16,
  },
  customerCard: {
    backgroundColor: restaurantOwnerColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  customerHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  customerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  customerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  customerName: {
    ...typography.heading3,
    color: restaurantOwnerColors.text,
    marginBottom: 4,
  },
  customerContact: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  contactIcon: {
    marginRight: 4,
  },
  contactText: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.lightText,
  },
  customerStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: restaurantOwnerColors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    ...typography.heading3,
    color: restaurantOwnerColors.text,
  },
  statLabel: {
    ...typography.caption,
    color: restaurantOwnerColors.lightText,
  },
  customerDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    ...typography.body,
    color: restaurantOwnerColors.text,
  },
  notesContainer: {
    backgroundColor: restaurantOwnerColors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  notesLabel: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.text,
    fontWeight: "600",
    marginBottom: 4,
  },
  notesText: {
    ...typography.body,
    color: restaurantOwnerColors.text,
  },
  customerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: restaurantOwnerColors.lightGray,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },
  actionButtonText: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.text,
    fontWeight: "500",
  },
  viewDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: restaurantOwnerColors.border,
  },
  viewDetailsText: {
    ...typography.body,
    color: restaurantOwnerColors.primary,
    fontWeight: "500",
    marginRight: 4,
  },
});
