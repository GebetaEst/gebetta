import restaurantOwnerColors from "@/constants/restaurantOwnerColors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, ChevronRight, Clock, Globe, Mail, MapPin, Phone, Save } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Mock restaurant data
const initialRestaurantData = {
  id: "1",
  name: "Habesha Ethiopian Restaurant",
  description: "Authentic Ethiopian cuisine in the heart of the city",
  address: "123 Main St, New York, NY 10001",
  phone: "+1 (555) 123-4567",
  email: "info@habeshaethiopian.com",
  website: "www.habeshaethiopian.com",
  logo: "https://ui-avatars.com/api/?name=Habesha+Ethiopian&background=random&size=200",
  coverImage: "https://images.unsplash.com/photo-1567364816519-cbc9c4ffe1eb?q=80&w=1000",
  openingHours: [
    { day: "Monday", open: "11:00", close: "22:00", isOpen: true },
    { day: "Tuesday", open: "11:00", close: "22:00", isOpen: true },
    { day: "Wednesday", open: "11:00", close: "22:00", isOpen: true },
    { day: "Thursday", open: "11:00", close: "22:00", isOpen: true },
    { day: "Friday", open: "11:00", close: "23:00", isOpen: true },
    { day: "Saturday", open: "10:00", close: "23:00", isOpen: true },
    { day: "Sunday", open: "10:00", close: "21:00", isOpen: true },
  ],
  cuisineType: "Ethiopian",
  priceRange: "$$",
  deliveryFee: 3.99,
  minimumOrder: 15.00,
  estimatedDeliveryTime: "30-45 min",
  acceptsOnlinePayments: true,
  acceptsCash: true,
  isActive: true,
  staff: [
    { id: "1", name: "John Doe", role: "Manager", email: "john@habeshaethiopian.com" },
    { id: "2", name: "Jane Smith", role: "Chef", email: "jane@habeshaethiopian.com" },
    { id: "3", name: "Michael Johnson", role: "Waiter", email: "michael@habeshaethiopian.com" },
  ],
};

// Setting sections
const settingSections = [
  { id: "general", title: "General Information" },
  { id: "hours", title: "Opening Hours" },
  { id: "delivery", title: "Delivery Settings" },
  { id: "staff", title: "Staff Management" },
  { id: "payment", title: "Payment Methods" },
];

export default function RestaurantSettings() {
  const router = useRouter();
  const { userRole } = useAuthStore();
  const [restaurantData, setRestaurantData] = useState(initialRestaurantData);
  const [activeSection, setActiveSection] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialRestaurantData);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleOpeningHoursChange = (index: number, field: string, value: any) => {
    const updatedHours = [...formData.openingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value,
    };
    
    setFormData({
      ...formData,
      openingHours: updatedHours,
    });
  };

  const handleSaveChanges = () => {
    // In a real app, this would send the updated data to the server
    setRestaurantData(formData);
    setIsEditing(false);
    
    Alert.alert(
      "Changes Saved",
      "Your restaurant settings have been updated successfully."
    );
  };

  const handlePickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleInputChange("logo", result.assets[0].uri);
    }
  };

  const handlePickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleInputChange("coverImage", result.assets[0].uri);
    }
  };

  const handleAddStaffMember = () => {
    // In a real app, this would open a form to add a new staff member
    Alert.alert(
      "Add Staff Member",
      "This would open a form to add a new staff member."
    );
  };

  const handleEditStaffMember = (id: string) => {
    // In a real app, this would open a form to edit the staff member
    Alert.alert(
      "Edit Staff Member",
      `This would open a form to edit staff member with ID: ${id}`
    );
  };

  const handleRemoveStaffMember = (id: string) => {
    Alert.alert(
      "Remove Staff Member",
      "Are you sure you want to remove this staff member?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const updatedStaff = formData.staff.filter((member) => member.id !== id);
            handleInputChange("staff", updatedStaff);
          },
        },
      ]
    );
  };

  const renderGeneralSettings = () => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>General Information</Text>
      
      <View style={styles.imageSection}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: formData.logo }}
            style={styles.logo}
            contentFit="cover"
          />
          {isEditing && (
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={handlePickLogo}
            >
              <Camera size={16} color={restaurantOwnerColors.white} />
              <Text style={styles.changeImageText}>Change Logo</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.coverImageContainer}>
          <Image
            source={{ uri: formData.coverImage }}
            style={styles.coverImage}
            contentFit="cover"
          />
          {isEditing && (
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={handlePickCoverImage}
            >
              <Camera size={16} color={restaurantOwnerColors.white} />
              <Text style={styles.changeImageText}>Change Cover</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Restaurant Name</Text>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={(text) => handleInputChange("name", text)}
            placeholder="Enter restaurant name"
            placeholderTextColor={restaurantOwnerColors.placeholderText}
          />
        ) : (
          <Text style={styles.infoText}>{restaurantData.name}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Description</Text>
        {isEditing ? (
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => handleInputChange("description", text)}
            placeholder="Enter restaurant description"
            placeholderTextColor={restaurantOwnerColors.placeholderText}
            multiline
            numberOfLines={4}
          />
        ) : (
          <Text style={styles.infoText}>{restaurantData.description}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Cuisine Type</Text>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={formData.cuisineType}
            onChangeText={(text) => handleInputChange("cuisineType", text)}
            placeholder="Enter cuisine type"
            placeholderTextColor={restaurantOwnerColors.placeholderText}
          />
        ) : (
          <Text style={styles.infoText}>{restaurantData.cuisineType}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Price Range</Text>
        {isEditing ? (
          <View style={styles.priceRangeSelector}>
            {["$", "$$", "$$$", "$$$$"].map((price) => (
              <TouchableOpacity
                key={price}
                style={[
                  styles.priceRangeButton,
                  formData.priceRange === price && styles.priceRangeButtonActive,
                ]}
                onPress={() => handleInputChange("priceRange", price)}
              >
                <Text
                  style={[
                    styles.priceRangeButtonText,
                    formData.priceRange === price && styles.priceRangeButtonTextActive,
                  ]}
                >
                  {price}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.infoText}>{restaurantData.priceRange}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Address</Text>
        {isEditing ? (
          <View style={styles.inputWithIcon}>
            <MapPin size={20} color={restaurantOwnerColors.lightText} style={styles.inputIcon} />
            <TextInput
              style={styles.iconTextInput}
              value={formData.address}
              onChangeText={(text) => handleInputChange("address", text)}
              placeholder="Enter restaurant address"
              placeholderTextColor={restaurantOwnerColors.placeholderText}
            />
          </View>
        ) : (
          <View style={styles.infoWithIcon}>
            <MapPin size={20} color={restaurantOwnerColors.lightText} style={styles.infoIcon} />
            <Text style={styles.infoText}>{restaurantData.address}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        {isEditing ? (
          <View style={styles.inputWithIcon}>
            <Phone size={20} color={restaurantOwnerColors.lightText} style={styles.inputIcon} />
            <TextInput
              style={styles.iconTextInput}
              value={formData.phone}
              onChangeText={(text) => handleInputChange("phone", text)}
              placeholder="Enter phone number"
              placeholderTextColor={restaurantOwnerColors.placeholderText}
              keyboardType="phone-pad"
            />
          </View>
        ) : (
          <View style={styles.infoWithIcon}>
            <Phone size={20} color={restaurantOwnerColors.lightText} style={styles.infoIcon} />
            <Text style={styles.infoText}>{restaurantData.phone}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        {isEditing ? (
          <View style={styles.inputWithIcon}>
            <Mail size={20} color={restaurantOwnerColors.lightText} style={styles.inputIcon} />
            <TextInput
              style={styles.iconTextInput}
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              placeholder="Enter email address"
              placeholderTextColor={restaurantOwnerColors.placeholderText}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        ) : (
          <View style={styles.infoWithIcon}>
            <Mail size={20} color={restaurantOwnerColors.lightText} style={styles.infoIcon} />
            <Text style={styles.infoText}>{restaurantData.email}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Website</Text>
        {isEditing ? (
          <View style={styles.inputWithIcon}>
            <Globe size={20} color={restaurantOwnerColors.lightText} style={styles.inputIcon} />
            <TextInput
              style={styles.iconTextInput}
              value={formData.website}
              onChangeText={(text) => handleInputChange("website", text)}
              placeholder="Enter website URL"
              placeholderTextColor={restaurantOwnerColors.placeholderText}
              autoCapitalize="none"
            />
          </View>
        ) : (
          <View style={styles.infoWithIcon}>
            <Globe size={20} color={restaurantOwnerColors.lightText} style={styles.infoIcon} />
            <Text style={styles.infoText}>{restaurantData.website}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Restaurant Status</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>
            {formData.isActive ? "Active (Accepting Orders)" : "Inactive (Not Accepting Orders)"}
          </Text>
          {isEditing && (
            <Switch
              value={formData.isActive}
              onValueChange={(value) => handleInputChange("isActive", value)}
              trackColor={{ false: restaurantOwnerColors.lightGray, true: restaurantOwnerColors.primary + "80" }}
              thumbColor={formData.isActive ? restaurantOwnerColors.primary : restaurantOwnerColors.lightText}
            />
          )}
        </View>
      </View>
    </View>
  );

  const renderOpeningHours = () => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>Opening Hours</Text>
      
      {formData.openingHours.map((hours, index) => (
        <View key={hours.day} style={styles.hoursRow}>
          <View style={styles.dayContainer}>
            <Text style={styles.dayText}>{hours.day}</Text>
            {isEditing && (
              <Switch
                value={hours.isOpen}
                onValueChange={(value) => handleOpeningHoursChange(index, "isOpen", value)}
                trackColor={{ false: restaurantOwnerColors.lightGray, true: restaurantOwnerColors.primary + "80" }}
                thumbColor={hours.isOpen ? restaurantOwnerColors.primary : restaurantOwnerColors.lightText}
              />
            )}
          </View>
          
          {hours.isOpen ? (
            <View style={styles.hoursContainer}>
              {isEditing ? (
                <>
                  <View style={styles.timeInputContainer}>
                    <Clock size={16} color={restaurantOwnerColors.lightText} style={styles.timeIcon} />
                    <TextInput
                      style={styles.timeInput}
                      value={hours.open}
                      onChangeText={(text) => handleOpeningHoursChange(index, "open", text)}
                      placeholder="09:00"
                      placeholderTextColor={restaurantOwnerColors.placeholderText}
                    />
                  </View>
                  <Text style={styles.toText}>to</Text>
                  <View style={styles.timeInputContainer}>
                    <Clock size={16} color={restaurantOwnerColors.lightText} style={styles.timeIcon} />
                    <TextInput
                      style={styles.timeInput}
                      value={hours.close}
                      onChangeText={(text) => handleOpeningHoursChange(index, "close", text)}
                      placeholder="17:00"
                      placeholderTextColor={restaurantOwnerColors.placeholderText}
                    />
                  </View>
                </>
              ) : (
                <Text style={styles.hoursText}>{hours.open} - {hours.close}</Text>
              )}
            </View>
          ) : (
            <Text style={styles.closedText}>Closed</Text>
          )}
        </View>
      ))}
    </View>
  );

  const renderDeliverySettings = () => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>Delivery Settings</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Delivery Fee ($)</Text>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={formData.deliveryFee.toString()}
            onChangeText={(text) => handleInputChange("deliveryFee", parseFloat(text) || 0)}
            placeholder="Enter delivery fee"
            placeholderTextColor={restaurantOwnerColors.placeholderText}
            keyboardType="numeric"
          />
        ) : (
          <Text style={styles.infoText}>${restaurantData.deliveryFee.toFixed(2)}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Minimum Order ($)</Text>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={formData.minimumOrder.toString()}
            onChangeText={(text) => handleInputChange("minimumOrder", parseFloat(text) || 0)}
            placeholder="Enter minimum order amount"
            placeholderTextColor={restaurantOwnerColors.placeholderText}
            keyboardType="numeric"
          />
        ) : (
          <Text style={styles.infoText}>${restaurantData.minimumOrder.toFixed(2)}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Estimated Delivery Time</Text>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={formData.estimatedDeliveryTime}
            onChangeText={(text) => handleInputChange("estimatedDeliveryTime", text)}
            placeholder="Enter estimated delivery time"
            placeholderTextColor={restaurantOwnerColors.placeholderText}
          />
        ) : (
          <Text style={styles.infoText}>{restaurantData.estimatedDeliveryTime}</Text>
        )}
      </View>
    </View>
  );

  const renderStaffManagement = () => (
    <View style={styles.settingSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Staff Management</Text>
        {isEditing && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddStaffMember}
          >
            <Text style={styles.addButtonText}>Add Staff</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {formData.staff.map((member) => (
        <View key={member.id} style={styles.staffMember}>
          <View style={styles.staffInfo}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random` }}
              style={styles.staffAvatar}
              contentFit="cover"
            />
            <View style={styles.staffDetails}>
              <Text style={styles.staffName}>{member.name}</Text>
              <Text style={styles.staffRole}>{member.role}</Text>
              <Text style={styles.staffEmail}>{member.email}</Text>
            </View>
          </View>
          
          {isEditing && (
            <View style={styles.staffActions}>
              <TouchableOpacity
                style={styles.staffActionButton}
                onPress={() => handleEditStaffMember(member.id)}
              >
                <Text style={styles.staffActionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.staffActionButton, styles.staffDeleteButton]}
                onPress={() => handleRemoveStaffMember(member.id)}
              >
                <Text style={styles.staffDeleteText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>Payment Methods</Text>
      
      <View style={styles.formGroup}>
        <View style={styles.paymentMethodRow}>
          <Text style={styles.paymentMethodText}>Accept Online Payments</Text>
          {isEditing ? (
            <Switch
              value={formData.acceptsOnlinePayments}
              onValueChange={(value) => handleInputChange("acceptsOnlinePayments", value)}
              trackColor={{ false: restaurantOwnerColors.lightGray, true: restaurantOwnerColors.primary + "80" }}
              thumbColor={formData.acceptsOnlinePayments ? restaurantOwnerColors.primary : restaurantOwnerColors.lightText}
            />
          ) : (
            <Text style={styles.paymentStatusText}>
              {restaurantData.acceptsOnlinePayments ? "Yes" : "No"}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.paymentMethodRow}>
          <Text style={styles.paymentMethodText}>Accept Cash on Delivery</Text>
          {isEditing ? (
            <Switch
              value={formData.acceptsCash}
              onValueChange={(value) => handleInputChange("acceptsCash", value)}
              trackColor={{ false: restaurantOwnerColors.lightGray, true: restaurantOwnerColors.primary + "80" }}
              thumbColor={formData.acceptsCash ? restaurantOwnerColors.primary : restaurantOwnerColors.lightText}
            />
          ) : (
            <Text style={styles.paymentStatusText}>
              {restaurantData.acceptsCash ? "Yes" : "No"}
            </Text>
          )}
        </View>
      </View>
      
      {isEditing && formData.acceptsOnlinePayments && (
        <TouchableOpacity
          style={styles.setupPaymentButton}
          onPress={() => Alert.alert("Setup Payment", "This would open a form to set up payment processing.")}
        >
          <Text style={styles.setupPaymentText}>Setup Payment Processing</Text>
          <ChevronRight size={16} color={restaurantOwnerColors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "general":
        return renderGeneralSettings();
      case "hours":
        return renderOpeningHours();
      case "delivery":
        return renderDeliverySettings();
      case "staff":
        return renderStaffManagement();
      case "payment":
        return renderPaymentMethods();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading restaurant settings...</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContainer}
            >
              {settingSections.map((section) => (
                <TouchableOpacity
                  key={section.id}
                  style={[
                    styles.tabButton,
                    activeSection === section.id && styles.activeTabButton,
                  ]}
                  onPress={() => setActiveSection(section.id)}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      activeSection === section.id && styles.activeTabButtonText,
                    ]}
                  >
                    {section.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {userRole === "owner" && (
              <TouchableOpacity
                style={[styles.editButton, isEditing && styles.saveButton]}
                onPress={() => {
                  if (isEditing) {
                    handleSaveChanges();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? (
                  <>
                    <Save size={16} color={restaurantOwnerColors.white} />
                    <Text style={styles.editButtonText}>Save</Text>
                  </>
                ) : (
                  <Text style={styles.editButtonText}>Edit</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {renderActiveSection()}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: restaurantOwnerColors.background,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: restaurantOwnerColors.border,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flex: 1,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: restaurantOwnerColors.lightGray,
  },
  activeTabButton: {
    backgroundColor: restaurantOwnerColors.primary,
  },
  tabButtonText: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.text,
    fontWeight: "500",
  },
  activeTabButtonText: {
    color: restaurantOwnerColors.white,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: restaurantOwnerColors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  saveButton: {
    backgroundColor: restaurantOwnerColors.primary,
  },
  editButtonText: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.white,
    fontWeight: "500",
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  settingSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.heading3,
    color: restaurantOwnerColors.text,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: restaurantOwnerColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.white,
    fontWeight: "500",
  },
  imageSection: {
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  coverImageContainer: {
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
  },
  changeImageButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  changeImageText: {
    ...typography.caption,
    color: restaurantOwnerColors.white,
    marginLeft: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.lightText,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: restaurantOwnerColors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: restaurantOwnerColors.text,
    ...typography.body,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  infoText: {
    ...typography.body,
    color: restaurantOwnerColors.text,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: restaurantOwnerColors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  iconTextInput: {
    flex: 1,
    paddingVertical: 10,
    color: restaurantOwnerColors.text,
    ...typography.body,
  },
  infoWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 8,
  },
  priceRangeSelector: {
    flexDirection: "row",
  },
  priceRangeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: restaurantOwnerColors.inputBackground,
    borderWidth: 1,
    borderColor: restaurantOwnerColors.border,
  },
  priceRangeButtonActive: {
    backgroundColor: restaurantOwnerColors.primary,
    borderColor: restaurantOwnerColors.primary,
  },
  priceRangeButtonText: {
    ...typography.body,
    color: restaurantOwnerColors.text,
  },
  priceRangeButtonTextActive: {
    color: restaurantOwnerColors.white,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    ...typography.body,
    color: restaurantOwnerColors.text,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: restaurantOwnerColors.border,
  },
  dayContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
  },
  dayText: {
    ...typography.body,
    color: restaurantOwnerColors.text,
    marginRight: 8,
  },
  hoursContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: restaurantOwnerColors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeIcon: {
    marginRight: 4,
  },
  timeInput: {
    width: 60,
    color: restaurantOwnerColors.text,
    ...typography.body,
  },
  toText: {
    ...typography.body,
    color: restaurantOwnerColors.lightText,
    marginHorizontal: 8,
  },
  hoursText: {
    ...typography.body,
    color: restaurantOwnerColors.text,
  },
  closedText: {
    ...typography.body,
    color: restaurantOwnerColors.error,
  },
  staffMember: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: restaurantOwnerColors.border,
  },
  staffInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  staffDetails: {
    flex: 1,
  },
  staffName: {
    ...typography.bodyLarge,
    color: restaurantOwnerColors.text,
    fontWeight: "500",
  },
  staffRole: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.primary,
    marginBottom: 2,
  },
  staffEmail: {
    ...typography.bodySmall,
    color: restaurantOwnerColors.lightText,
  },
  staffActions: {
    flexDirection: "row",
  },
  staffActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: restaurantOwnerColors.lightGray,
    marginLeft: 8,
  },
  staffActionText: {
    ...typography.caption,
    color: restaurantOwnerColors.text,
  },
  staffDeleteButton: {
    backgroundColor: restaurantOwnerColors.error + "20",
  },
  staffDeleteText: {
    ...typography.caption,
    color: restaurantOwnerColors.error,
  },
  paymentMethodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: restaurantOwnerColors.border,
  },
  paymentMethodText: {
    ...typography.body,
    color: restaurantOwnerColors.text,
  },
  paymentStatusText: {
    ...typography.body,
    color: restaurantOwnerColors.primary,
    fontWeight: "500",
  },
  setupPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 16,
  },
  setupPaymentText: {
    ...typography.body,
    color: restaurantOwnerColors.primary,
    fontWeight: "500",
    marginRight: 4,
  },
});
