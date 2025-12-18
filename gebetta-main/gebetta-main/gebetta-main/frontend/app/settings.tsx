import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  Clock,
  Globe,
  HelpCircle,
  Lock,
  LogOut,
  Moon,
  Settings,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions
} from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showLockTimeoutModal, setShowLockTimeoutModal] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: "English",
    appLock: false,
    lockTimeout: "5", // minutes
  });

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleToggleSetting = (setting: string, value: boolean) => {
    setSettings({
      ...settings,
      [setting]: value,
    });
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/(auth)");
          },
        },
      ]
    );
  };

  const handleLanguageSelect = () => {
    Alert.alert(
      "Select Language",
      "Choose your preferred language",
      [
        { text: "English", onPress: () => setSettings({ ...settings, language: "English" }) },
        { text: "Amharic", onPress: () => setSettings({ ...settings, language: "Amharic" }) },
        { text: "French", onPress: () => setSettings({ ...settings, language: "French" }) },
        { text: "Spanish", onPress: () => setSettings({ ...settings, language: "Spanish" }) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };



  const handleTermsAndConditions = () => {
    // In a real app, this would navigate to the terms and conditions page
    Alert.alert("Terms and Conditions", "This would open the terms and conditions page.");
  };

  const handleTermsOfService = () => {
    // In a real app, this would navigate to the terms of service page
    Alert.alert("Terms of Service", "This would open the terms of service page.");
  };

  const handleHelpCenter = () => {
    router.push("/help-center");
  };

  const handleContactSupport = () => {
    // In a real app, this would navigate to the contact support page
    Alert.alert("Contact Support", "This would open the contact support page.");
  };



  const handleChangePin = () => {
    // Navigate to change PIN screen
    router.push("/change-pin");
  };

  const handleLockTimeoutSelect = () => {
    console.log('Opening lock timeout modal');
    setShowLockTimeoutModal(true);
  };

  const lockTimeoutOptions = [
    { value: "1", label: "1 minute" },
    { value: "2", label: "2 minutes" },
    { value: "5", label: "5 minutes" },
    { value: "10", label: "10 minutes" },
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "never", label: "Never" },
  ];

  const handleSelectTimeout = (value: string) => {
    setSettings({ ...settings, lockTimeout: value });
    setShowLockTimeoutModal(false);
  };

  const handleAppLockToggle = (value: boolean) => {
    if (value) {
      // If enabling app lock, navigate to PIN creation
      router.push("/pin-setup");
      // The PIN setup screen will enable app lock when PIN is created
      setSettings({ ...settings, appLock: true });
    } else {
      // If disabling, just toggle off
      setSettings({ ...settings, appLock: value });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Customize your app preferences
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Bell size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>Push Notifications</Text>
                </View>
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => handleToggleSetting("notifications", value)}
                  trackColor={{ false: colors.lightGray, true: colors.primary + "80" }}
                  thumbColor={settings.notifications ? colors.primary : colors.lightText}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Moon size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>Dark Mode</Text>
                </View>
                <Switch
                  value={settings.darkMode}
                  onValueChange={(value) => handleToggleSetting("darkMode", value)}
                  trackColor={{ false: colors.lightGray, true: colors.primary + "80" }}
                  thumbColor={settings.darkMode ? colors.primary : colors.lightText}
                />
              </View>
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleLanguageSelect}
              >
                <View style={styles.settingInfo}>
                  <Globe size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>Language</Text>
                </View>
                <View style={styles.settingValue}>
                  <Text style={styles.settingValueText}>{settings.language}</Text>
                  <ChevronRight size={16} color={colors.lightText} />
                </View>
              </TouchableOpacity>
              

            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Privacy & Security</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Lock size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>App Lock</Text>
                </View>
                <Switch
                  value={settings.appLock}
                  onValueChange={handleAppLockToggle}
                  trackColor={{ false: colors.lightGray, true: colors.primary + "80" }}
                  thumbColor={settings.appLock ? colors.primary : colors.lightText}
                />
              </View>
              
              {settings.appLock && (
                <>
                  <TouchableOpacity
                    style={styles.settingItem}
                    onPress={handleChangePin}
                  >
                    <View style={styles.settingInfo}>
                      <Lock size={20} color={colors.text} style={styles.settingIcon} />
                      <Text style={styles.settingText}>Change PIN</Text>
                    </View>
                    <ChevronRight size={16} color={colors.lightText} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.settingItem}
                    onPress={handleLockTimeoutSelect}
                  >
                    <View style={styles.settingInfo}>
                      <Clock size={20} color={colors.text} style={styles.settingIcon} />
                      <Text style={styles.settingText}>Auto-lock Time</Text>
                    </View>
                    <View style={styles.settingValue}>
                      <Text style={styles.settingValueText}>
                        {settings.lockTimeout === "never" ? "Never" : `${settings.lockTimeout} min`}
                      </Text>
                      <ChevronRight size={16} color={colors.lightText} />
                    </View>
                  </TouchableOpacity>
                </>
              )}
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleTermsAndConditions}
              >
                <View style={styles.settingInfo}>
                  <Settings size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>Terms and Conditions</Text>
                </View>
                <ChevronRight size={16} color={colors.lightText} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleTermsOfService}
              >
                <View style={styles.settingInfo}>
                  <Settings size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>Terms of Service</Text>
                </View>
                <ChevronRight size={16} color={colors.lightText} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support</Text>
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleHelpCenter}
              >
                <View style={styles.settingInfo}>
                  <HelpCircle size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>Help Center</Text>
                </View>
                <ChevronRight size={16} color={colors.lightText} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleContactSupport}
              >
                <View style={styles.settingInfo}>
                  <HelpCircle size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>Contact Support</Text>
                </View>
                <ChevronRight size={16} color={colors.lightText} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LogOut size={20} color={colors.error} style={styles.logoutIcon} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </>
        )}
      </ScrollView>

      {/* Auto-lock Time Modal */}
      <Modal
        visible={showLockTimeoutModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLockTimeoutModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLockTimeoutModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Auto-lock Time</Text>
              <Text style={styles.modalSubtitle}>
                Choose when to automatically lock the app
              </Text>
            </View>
            
            <ScrollView 
              style={styles.modalOptions}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {lockTimeoutOptions.map((option, index) => (
                <View key={option.value}>
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      settings.lockTimeout === option.value && styles.modalOptionSelected
                    ]}
                    onPress={() => {
                      console.log('Selected option:', option.value);
                      handleSelectTimeout(option.value);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalOptionContent}>
                      <Text style={[
                        styles.modalOptionLabel,
                        settings.lockTimeout === option.value && styles.modalOptionLabelSelected
                      ]}>
                        {option.label}
                      </Text>
                    </View>
                    {settings.lockTimeout === option.value && (
                      <View style={styles.modalOptionCheck}>
                        <View style={styles.checkmark} />
                      </View>
                    )}
                  </TouchableOpacity>
                  {index < lockTimeoutOptions.length - 1 && (
                    <View style={{
                      height: 0.5,
                      backgroundColor: 'rgba(60, 60, 67, 0.29)',
                      marginLeft: 20,
                    }} />
                  )}
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLockTimeoutModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.lightText,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 16,
  },

  settingText: {
    ...typography.body,
    color: colors.text,
  },
  settingValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValueText: {
    ...typography.body,
    color: colors.lightText,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.error + "10",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
    fontWeight: "600",
  },
  versionText: {
    ...typography.caption,
    color: colors.lightText,
    textAlign: "center",
    marginBottom: 24,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingBottom: 34, // Safe area bottom
    maxHeight: '80%',
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.heading3,
    color: colors.text,
    fontWeight: '600',
    fontSize: 17,
    marginBottom: 4,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.lightText,
    fontSize: 13,
    textAlign: 'center',
  },
  modalOptions: {
    flex: 1,
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.background,
    minHeight: 56,
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  modalOptionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  modalOptionLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
  },
  modalOptionLabelSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalOptionDescription: {
    ...typography.caption,
    color: colors.lightText,
    fontSize: 13,
    lineHeight: 16,
    marginTop: 2,
  },
  modalOptionDescriptionSelected: {
    color: '#007AFF',
    opacity: 0.8,
  },
  modalOptionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  checkmark: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  modalCloseButton: {
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderRadius: 14,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(60, 60, 67, 0.29)',
  },
  modalCloseText: {
    ...typography.body,
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 20,
  },
});
