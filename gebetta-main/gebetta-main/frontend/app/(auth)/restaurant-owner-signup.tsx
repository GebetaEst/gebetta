import Button from "@/components/Button";
import Input from "@/components/Input";
import colors from "@/constants/colors";
import countryCodes from "@/constants/countryCodes";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { ChevronDown } from "lucide-react-native";
import TermsOfServices from "./terms_of_services"
import PrivacyPolice from "./Privacy_police";
import VerifyScreen from "./verify";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ImageBackground,
  Dimensions,
  Image, // Added import for Image
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type FixedCountryCode = {
  code: string;
  name: string;
  flag: string;
  dial_code: string;
};

// Ensure countryCodes is typed correctly
const typedCountryCodes: FixedCountryCode[] = countryCodes as FixedCountryCode[];

export default function Signup() {
  const router = useRouter();
  const { login } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<FixedCountryCode>(
    typedCountryCodes[0]
  );
  const [isCountryPickerVisible, setIsCountryPickerVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showOTPPage, setShowOTPPage] = useState<boolean>(false);

  // Remove any non-number chars and leading zeroes
  

  const handleSignup = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }
    console.log("***********" ,  selectedCountry )
    // Check if country is supported (use dial_code for consistency)
    if (selectedCountry.code !== "+251" || selectedCountry.flag !== "🇪🇹"  || selectedCountry.name !== "Ethiopia") {
      setError("This country is not supported yet");
      return;
    }

    // Validate phone number length
    if (phoneNumber.length < 9) {
      setError("Please enter a valid phone number ");
      return;
    }

    // const fullPhoneNumber = formatFullPhone(selectedCountry, phoneNumber);

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("https://api.bahirandelivery.cloud/api/v1/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber, // Send formatted phone number with dial code
        }),
      });
      const data = await response.json();
      console.log("#######" ,  data )

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
        
      } else {
        setShowOTPPage(true)
      }

      // if (data.token && data.data?.user) {
      //   // const userData = {
      //   //   ...data.data.user,
      //   //   token: data.token,
      //   // };
      //   // await login(userData);
      //   Alert.alert("Success", "Account created successfully!");
      //   router.replace("/(tabs)");
      //   setShowOTPPage(true)
      // } else {
      //   throw new Error("Invalid response from server");
      // }
    } catch (err) {
      console.error("Signup error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create account";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectCountry = (country: FixedCountryCode) => {
    setSelectedCountry(country);
    setIsCountryPickerVisible(false);
  };

  return (
    <ImageBackground
      source={require("@/assets/images/background.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[styles.keyboardView, showOTPPage && { display: 'none' }]}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.content}>
                {/* Add Logo at the Top */}
                <View style={styles.logoContainer}>
                  <Image
                    source={require("@/assets/images/new.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                    accessible
                    accessibilityLabel="App Logo"
                  />
                </View>
                <View style={styles.header}>
                  <Text style={styles.title}>Create Account</Text>
                  <Text style={styles.subtitle}>
                    Enter your phone number to get started
                  </Text>
                </View>

                <View style={styles.form}>
                  <View style={styles.phoneInputContainer}>
                    <TouchableOpacity
                      style={styles.countrySelector}
                      onPress={() => setIsCountryPickerVisible(true)}
                      disabled={isLoading}
                      accessibilityLabel="Select country"
                      accessibilityHint="Opens a modal to choose a country code"
                    >
                      <Text style={styles.flag}>{selectedCountry.flag}</Text>
                      <Text style={styles.dialCode}>
                        {selectedCountry.dial_code}
                      </Text>
                      <ChevronDown size={15} color={colors.gray[600]} />
                    </TouchableOpacity>

                    <View style={styles.phoneInputWrapper}>
                      <Input
                        placeholder="Phone number"
                        value={phoneNumber}
                        onChangeText={(text) => {
                          setPhoneNumber(text);
                          setError("");
                        }}
                        keyboardType="phone-pad"
                        style={styles.phoneInput}
                        accessibilityLabel="Phone number input"
                      />
                    </View>
                  </View>
                  {error && <Text style={styles.errorText}>{error}</Text>}

                  <Button
                    title="Sign Up"
                    onPress={handleSignup}
                    loading={isLoading}
                    disabled={isLoading || !phoneNumber.trim() || !isTermsAccepted}
                    style={styles.signupButton}
                  />

                  <View style={styles.termsContainer}>
                    <View style={styles.checkboxContainer}>
                      <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => setIsTermsAccepted(!isTermsAccepted)}
                        accessibilityLabel="Accept terms and conditions"
                      >
                        {isTermsAccepted && (
                          <Ionicons name="checkmark" size={16} color={colors.white} />
                        )}
                      </TouchableOpacity>
                      <View style={styles.termsTextContainer}>
                        <Text style={styles.termsText}>
                          By signing up, you agree to our{" "}
                          <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                            <Text style={styles.linkText}>Terms of Service</Text>
                          </TouchableOpacity>
                          {" "}and{" "}
                          <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
                            <Text style={styles.linkText}>Privacy Policy</Text>
                          </TouchableOpacity>
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        <Modal
          visible={isCountryPickerVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsCountryPickerVisible(false)}
        >
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity
                onPress={() => setIsCountryPickerVisible(false)}
                style={styles.closeButton}
                accessibilityLabel="Close country picker"
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.countryList}>
              {typedCountryCodes.map((country , index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.countryItem,
                    selectedCountry.code === country.code &&
                      styles.selectedCountryItem,
                  ]}
                  onPress={() => selectCountry(country)}
                  accessibilityLabel={`Select ${country.name}`}
                >
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <Text style={styles.countryName}>{country.name}</Text>
                  <Text style={styles.countryDialCode}>{country.dial_code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>

        {/* Terms of Service Modal */}
        <Modal
          visible={showTermsModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowTermsModal(false)}
        >
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms of Service</Text>
              <TouchableOpacity
                onPress={() => setShowTermsModal(false)}
                style={styles.closeButton}
                accessibilityLabel="Close terms of service"
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <TermsOfServices/>
            </ScrollView>
          </View>
        </Modal>

        {/* Privacy Policy Modal */}
        <Modal
          visible={showPrivacyModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPrivacyModal(false)}
        >
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity
                onPress={() => setShowPrivacyModal(false)}
                style={styles.closeButton}
                accessibilityLabel="Close privacy policy"
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>

              <PrivacyPolice/>

            </ScrollView>
          </View>
        </Modal>
      </View>
      {showOTPPage && 
      <View style={styles.verifyContainer}>
          <VerifyScreen phoneNumber={phoneNumber} signUP={true}/>
        </View>}
    </ImageBackground>
  );
}
const { width, height } = Dimensions.get('window');


const styles = StyleSheet.create({
    
  verifyContainer: {
    position: "absolute",
    marginHorizontal: 15,
    alignSelf: "center",
    top: height * 0.18, // 18% from top instead of fixed 150
    height: height * 0.85, // 85% of screen height instead of fixed 700
    width: width * 0.9, // 90% of screen width
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",

  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 14,
    marginTop: 8,
  },
  logoImage: {
    width: width * 0.43,  // Increased size for bigger screens
    height: width * 0.43,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    ...typography.title,
    marginBottom: 12,
    fontSize: 27,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    lineHeight: 25,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  subtitle: {
    ...typography.body,
    color: colors.white,
    textAlign: "center",
    lineHeight: 25,
    fontSize: 20,
  },
  form: {
    gap: 24,
  },
  phoneInputContainer: {
    flexDirection: "row",
    gap: 12,
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 5,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderRadius: 12,
    backgroundColor: colors.white,
    height: 50,
    justifyContent: "center",
  },
  flag: {
    fontSize: 20,
    paddingVertical: 0,
  },
  dialCode: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.black,
  },
  phoneInputWrapper: {
    flex: 1,
    

  },
  phoneInput: {
    marginBottom: 0,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  signupButton: {
    marginTop: 8,
    backgroundColor: colors.black,
    zIndex: 1000,
  },
  termsContainer: {
    paddingHorizontal: 0,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    marginTop: 2,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    ...typography.small,
    lineHeight: 25,
    color: colors.white,
  },
  linkText: {
    color: colors.white,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    ...typography.heading,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 5,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  selectedCountryItem: {
    backgroundColor: colors.gray[50],
  },
  countryFlag: {
    fontSize: 24,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  countryDialCode: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[600],
  },
  errorText: {
    textAlign: "center",
    marginTop: 10,
    padding:10,
    color: colors.white,
    fontSize: 16,
    backgroundColor: "rgba(252, 88, 88, 0.8)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(252, 88, 88, 1)",
    width: "70%",
    alignSelf: "center",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 18,
    color: colors.black,
  },
});