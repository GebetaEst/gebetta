import Button from "@/components/Button";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { restaurantAPI } from "@/lib/api";
import { menuCategories } from "@/mocks/restaurants";
import { useAuthStore } from "@/store/authStore";
import { useRestaurantStore } from "@/store/restaurantStore";
import { MenuItem } from "@/types/restaurant";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { FontAwesome, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
const CameraIcon = MaterialCommunityIcons;
const DollarSignIcon = FontAwesome;
const PlusIcon = MaterialIcons;
const TrashIcon = MaterialIcons;
const AlertCircle = MaterialIcons;
const Check = MaterialIcons;
const ChevronDown = MaterialIcons;
const Edit2 = MaterialIcons;
const Search = MaterialIcons;
const X = MaterialIcons;
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MenuScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    updateRestaurant, 
    fetchRestaurant, 
    addMenuItem, 
    updateMenuItem,
    deleteMenuItem 
  } = useRestaurantStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  
  // Modal states
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("Main Dishes");
  const [itemImage, setItemImage] = useState("");
  const [itemPopular, setItemPopular] = useState(false);
  const [itemSpicy, setItemSpicy] = useState(false);
  const [itemVegetarian, setItemVegetarian] = useState(false);
  const [showCategoryPickerModal, setShowCategoryPickerModal] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategory, menuItems]);

  const fetchMenuItems = async () => {
    if (!user?.restaurantId) {
      setMenuItems([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const restaurant = await fetchRestaurant(user.restaurantId);
      
      if (restaurant?.menu) {
        setMenuItems(restaurant.menu);
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      Alert.alert("Error", "Failed to load menu items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...menuItems];
    
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredItems(filtered);
  };

  const handleAddItem = () => {
    setCurrentItem(null);
    setIsEditing(false);
    resetForm();
    setShowAddEditModal(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setCurrentItem(item);
    setIsEditing(true);
    
    // Populate form with item data
    setItemName(item.name);
    setItemDescription(item.description);
    setItemPrice(item.price.toString());
    setItemCategory(item.category);
    setItemImage(item.imageUrl || "");
    setItemPopular(item.popular || false);
    setItemSpicy(item.spicy || false);
    setItemVegetarian(item.vegetarian || false);
    
    setShowAddEditModal(true);
  };

  const handleDeleteItem = (item: MenuItem) => {
    setCurrentItem(item);
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = async () => {
    if (!currentItem || !user?.restaurantId) return;
    
    try {
      setIsLoading(true);
      const success = await deleteMenuItem(user.restaurantId, currentItem.id);
      
      if (success) {
        // Refresh the menu items after successful deletion
        await fetchMenuItems();
        setShowDeleteModal(false);
        Alert.alert("Success", "Menu item deleted successfully");
      } else {
        throw new Error("Failed to delete menu item");
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      Alert.alert("Error", "Failed to delete menu item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveItem = async () => {
    // Validate form
    if (!itemName.trim()) {
      Alert.alert("Error", "Please enter a name for the item");
      return;
    }
    
    if (!itemDescription.trim()) {
      Alert.alert("Error", "Please enter a description for the item");
      return;
    }
    
    if (!itemPrice.trim() || isNaN(parseFloat(itemPrice)) || parseFloat(itemPrice) <= 0) {
      Alert.alert("Error", "Please enter a valid price for the item");
      return;
    }
    
    if (!itemCategory) {
      Alert.alert("Error", "Please select a category for the item");
      return;
    }
    
    if (!itemImage.trim()) {
      Alert.alert("Error", "Please add an image URL for the item");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const newItem: MenuItem = {
        id: isEditing && currentItem ? currentItem.id : `item${Date.now()}`,
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice),
        imageUrl: itemImage,
        category: itemCategory,
        popular: itemPopular,
        spicy: itemSpicy,
        vegetarian: itemVegetarian,
        restaurantId: user?.restaurantId || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      let savedItem: MenuItem | null = null;
      
      if (isEditing && currentItem) {
        // Update existing item
        if (user?.restaurantId) {
          savedItem = await updateMenuItem(user.restaurantId, currentItem.id, newItem);
        }
      } else {
        // Add new item
        if (user?.restaurantId) {
          savedItem = await addMenuItem(user.restaurantId, newItem);
        }
      }
      
      if (savedItem) {
        // Refresh the menu items
        await fetchMenuItems();
        setShowAddEditModal(false);
        Alert.alert(
          "Success", 
          isEditing ? "Menu item updated successfully" : "Menu item added successfully"
        );
      } else {
        throw new Error("Failed to save menu item");
      }
    } catch (error) {
      console.error("Error saving menu item:", error);
      Alert.alert("Error", "Failed to save menu item. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setItemName("");
    setItemDescription("");
    setItemPrice("");
    setItemCategory("Main Dishes");
    setItemImage("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500");
    setItemPopular(false);
    setItemSpicy(false);
    setItemVegetarian(false);
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItemCard}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.menuItemImage}
        contentFit="cover"
      />
      
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemHeader}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
        </View>
        
        <Text style={styles.menuItemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.menuItemTags}>
          <View style={styles.menuItemCategory}>
            <Text style={styles.menuItemCategoryText}>{item.category}</Text>
          </View>
          
          {item.popular && (
            <View style={[styles.menuItemTag, styles.popularTag]}>
              <Text style={styles.menuItemTagText}>Popular</Text>
            </View>
          )}
          
          {item.spicy && (
            <View style={[styles.menuItemTag, styles.spicyTag]}>
              <Text style={styles.menuItemTagText}>Spicy</Text>
            </View>
          )}
          
          {item.vegetarian && (
            <View style={[styles.menuItemTag, styles.vegetarianTag]}>
              <Text style={styles.menuItemTagText}>Vegetarian</Text>
            </View>
          )}
        </View>
        
        <View style={styles.menuItemActions}>
          <TouchableOpacity
            style={[styles.menuItemActionButton, styles.editButton]}
            onPress={() => handleEditItem(item)}
          >
            <MaterialIcons name="edit" size={16} color={colors.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuItemActionButton, styles.deleteButton]}
            onPress={() => handleDeleteItem(item)}
          >
            <MaterialIcons name="delete" size={16} color={colors.error} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddItem}
        >
          <MaterialIcons name="add" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color={colors.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            placeholderTextColor={colors.placeholderText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
            >
              <MaterialIcons name="close" size={16} color={colors.lightText} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.categoryFilterContainer}>
          <TouchableOpacity
            style={styles.categoryFilterButton}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={styles.categoryFilterText}>{selectedCategory}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color={colors.text} />
          </TouchableOpacity>
          
          {showCategoryDropdown && (
            <View style={styles.categoryDropdown}>
              {menuCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    selectedCategory === category && styles.categoryOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      selectedCategory === category && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                  {selectedCategory === category && (
                    <MaterialIcons name="check" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading menu items...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {searchQuery.trim() !== "" || selectedCategory !== "All"
              ? "No items match your filters"
              : "No menu items yet"}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery.trim() !== "" || selectedCategory !== "All"
              ? "Try changing your search or category filter"
              : "Add your first menu item to get started"}
          </Text>
          {(searchQuery.trim() !== "" || selectedCategory !== "All") && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.menuList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add/Edit Item Modal */}
      <Modal
        visible={showAddEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Edit Menu Item" : "Add Menu Item"}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAddEditModal(false)}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Item Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter item name"
                  placeholderTextColor={colors.placeholderText}
                  value={itemName}
                  onChangeText={setItemName}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Enter item description"
                  placeholderTextColor={colors.placeholderText}
                  value={itemDescription}
                  onChangeText={setItemDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Price</Text>
                <View style={styles.priceInputContainer}>
                  <DollarSignIcon size={20} color={colors.lightText} />
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0.00"
                    placeholderTextColor={colors.placeholderText}
                    value={itemPrice}
                    onChangeText={setItemPrice}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                <TouchableOpacity
                  style={styles.categoryPickerButton}
                  onPress={() => setShowCategoryPickerModal(true)}
                >
                  <Text style={styles.categoryPickerText}>{itemCategory}</Text>
                  <ChevronDown size={20} color={colors.lightText} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Image URL</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter image URL"
                  placeholderTextColor={colors.placeholderText}
                  value={itemImage}
                  onChangeText={setItemImage}
                />
                <View style={styles.imagePreviewContainer}>
                  {itemImage ? (
                    <Image
                      source={{ uri: itemImage }}
                      style={styles.imagePreview}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.noImagePreview}>
                      <CameraIcon size={24} color={colors.lightText} />
                      <Text style={styles.noImageText}>No image</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Options</Text>
                <View style={styles.optionsContainer}>
                  <View style={styles.optionItem}>
                    <Text style={styles.optionLabel}>Popular Item</Text>
                    <Switch
                      value={itemPopular}
                      onValueChange={setItemPopular}
                      trackColor={{ false: colors.lightGray, true: colors.primary + "80" }}
                      thumbColor={itemPopular ? colors.primary : colors.white}
                    />
                  </View>
                  
                  <View style={styles.optionItem}>
                    <Text style={styles.optionLabel}>Spicy</Text>
                    <Switch
                      value={itemSpicy}
                      onValueChange={setItemSpicy}
                      trackColor={{ false: colors.lightGray, true: colors.error + "80" }}
                      thumbColor={itemSpicy ? colors.error : colors.white}
                    />
                  </View>
                  
                  <View style={styles.optionItem}>
                    <Text style={styles.optionLabel}>Vegetarian</Text>
                    <Switch
                      value={itemVegetarian}
                      onValueChange={setItemVegetarian}
                      trackColor={{ false: colors.lightGray, true: colors.success + "80" }}
                      thumbColor={itemVegetarian ? colors.success : colors.white}
                    />
                  </View>
                </View>
              </View>
              
              <View style={styles.formActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowAddEditModal(false)}
                  variant="secondary"
                  size="medium"
                  style={styles.cancelButton}
                />
                <Button
                  title={isEditing ? "Update Item" : "Add Item"}
                  onPress={handleSaveItem}
                  variant="primary"
                  size="medium"
                  loading={isSaving}
                  style={styles.saveButton}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryPickerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCategoryPickerModal(false)}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={menuCategories.filter(c => c !== "All")}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryListItem,
                    itemCategory === item && styles.categoryListItemSelected,
                  ]}
                  onPress={() => {
                    setItemCategory(item);
                    setShowCategoryPickerModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryListItemText,
                      itemCategory === item && styles.categoryListItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {itemCategory === item && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.confirmModalContainer}>
          <View style={styles.confirmModalContent}>
            <AlertCircle size={48} color={colors.error} style={styles.confirmIcon} />
            <Text style={styles.confirmTitle}>Delete Menu Item</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete "{currentItem?.name}"? This action cannot be undone.
            </Text>
            
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelConfirmButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelConfirmText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={confirmDeleteItem}
              >
                <Text style={styles.deleteConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: "600",
    marginLeft: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  categoryFilterContainer: {
    position: "relative",
  },
  categoryFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryFilterText: {
    ...typography.body,
    color: colors.text,
  },
  categoryDropdown: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary + "15",
  },
  categoryOptionText: {
    ...typography.body,
    color: colors.text,
  },
  categoryOptionTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
    marginBottom: 16,
  },
  clearFiltersButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
  },
  clearFiltersText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  menuList: {
    padding: 16,
  },
  menuItemCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemImage: {
    width: 100,
    height: "100%",
  },
  menuItemContent: {
    flex: 1,
    padding: 12,
  },
  menuItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  menuItemName: {
    ...typography.body,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  menuItemPrice: {
    ...typography.body,
    fontWeight: "600",
    color: colors.primary,
  },
  menuItemDescription: {
    ...typography.caption,
    color: colors.lightText,
    marginBottom: 8,
  },
  menuItemTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  menuItemCategory: {
    backgroundColor: colors.cardBackground,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  menuItemCategoryText: {
    ...typography.caption,
    color: colors.text,
  },
  menuItemTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  popularTag: {
    backgroundColor: colors.primary + "20",
  },
  spicyTag: {
    backgroundColor: colors.error + "20",
  },
  vegetarianTag: {
    backgroundColor: colors.success + "20",
  },
  menuItemTagText: {
    ...typography.caption,
    color: colors.text,
  },
  menuItemActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  menuItemActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: colors.primary + "15",
  },
  editButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: colors.error + "15",
  },
  deleteButtonText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: "600",
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.heading3,
    color: colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...typography.body,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    ...typography.body,
    color: colors.text,
  },
  categoryPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryPickerText: {
    ...typography.body,
    color: colors.text,
  },
  imagePreviewContainer: {
    marginTop: 12,
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.cardBackground,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  noImagePreview: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    ...typography.caption,
    color: colors.lightText,
    marginTop: 8,
  },
  optionsContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 16,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  optionLabel: {
    ...typography.body,
    color: colors.text,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: colors.lightGray,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  categoryListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryListItemSelected: {
    backgroundColor: colors.primary + "15",
  },
  categoryListItemText: {
    ...typography.body,
    color: colors.text,
  },
  categoryListItemTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  confirmModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmModalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  confirmIcon: {
    marginBottom: 16,
  },
  confirmTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  confirmText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelConfirmText: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  deleteConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.error,
    borderRadius: 8,
    marginLeft: 8,
  },
  deleteConfirmText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
});
