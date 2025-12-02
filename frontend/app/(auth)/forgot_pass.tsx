import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  ImageBackground,
} from "react-native";
import axios from "axios";
import typography from "@/constants/typography";
import colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import ResetPass from "./resetPass";
import OtpVerificationForm from "./resetPass";
// import VerifyScreen and use as the OTP step page, like other auth flows
import VerifyScreen from "./verify";

const { width, height } = Dimensions.get("window");

const ForgotPasswordScreen = () => {
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [responseType, setResponseType] = useState<"success" | "error">(
    "success"
  );
  const [loading, setLoading] = useState(false);

  const [showOTPPage, setShowOTPPage] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();

  const handlePhoneChange = (value: string) => {
    // Strip leading zero if exists (Ethiopian 9 digits)
    let v = value.replace(/[^0-9]/g, "");
    if (v.startsWith("0")) v = v.slice(1);
    setPhone(v);
    setPhoneError("");
  };

  const validatePhone = () => {
    if (!phone || phone.length < 9) {
      setPhoneError("Please enter a valid 9-digit phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleSendOTP = async () => {
    if (!validatePhone()) return;
    setLoading(true);
    setResponseMessage("");

    try {
      const res = await axios.post(
        "https://api.bahirandelivery.cloud/api/v1/users/requestResetOTP",
        {
          phone: phone,
        }
      );

      if (res.data.status === "success") {
        setShowOTPPage(true);
        setResponseMessage(res.data.message || "OTP sent to your phone.");
        setResponseType("success");

      } else {
        setResponseMessage(res.data.message || "Failed to send OTP.");
        setResponseType("error");
      }
    //   if (res.data.status === "success") {
    //     navigation.navigate('/(auth)/resetPass' as never);
    //   }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send OTP. Please try again.";
      setResponseMessage(msg);
      setResponseType("error");
    } finally {
      setLoading(false);
    }
  };

  // This is a "reset password" flow, so use the verify OTP page and pass
  // signUP=false. (for password reset not registration)
  return (
    <View style={styles.outerContainer}>
      <ImageBackground
        source={require("@/assets/images/background.jpg")}
        style={styles.backgroundImage}
        // resizeMode="cover"
      >
        <View style={styles.overlay} />
        <KeyboardAvoidingView
          style={styles.kbView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={styles.container}
            
          >
            {!showOTPPage ? (
              <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
                <View style={styles.card}>
                  <Text style={styles.title}>Forgot Password</Text>
                  <Text style={styles.subtitle}>
                    Enter your phone number to receive an OTP
                  </Text>

                  <TextInput
                    style={[styles.input, phoneError ? { borderColor: colors.error } : {}]}
                    placeholder="Phone Number (9 digits)"
                    value={phone}
                    onChangeText={handlePhoneChange}
                    keyboardType="numeric"
                    maxLength={9}
                    placeholderTextColor="#9CA3AF"
                  />

                  {phoneError ? <Text style={styles.error}>{phoneError}</Text> : null}

                  {responseMessage ? (
                    <Text style={responseType === "success" ? styles.success : styles.error}>
                      {responseMessage}
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleSendOTP}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Send OTP</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.loginLinkContainer}>
                    <Text style={styles.loginLinkText}>Remember your password? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                      <Text style={styles.loginLink}>Login</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <OtpVerificationForm phone={phone} />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.40)",
    zIndex: 1,
  },
  kbView: {
    flex: 1,
    zIndex: 2,
    minHeight: height,
    width: "100%",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    minHeight: height,
    width: "100%",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 16,
    alignItems: "center",
    padding: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    marginTop: 50,
    marginBottom: 50,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  title: {
    ...typography.title,
    textAlign: "center",
    color: colors.white,
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontSize: 26,
    marginBottom: 12,
    marginTop: 2,
   
  },
  subtitle: {
    color: colors.white,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
    padding: 12,
    width: 240,
    marginBottom: 10,
    color: colors.text,
  },
  error: {
    color: colors.error || "#EF4444",
    textAlign: "center",
    marginBottom: 4,
    fontSize: 13,
  },
  success: {
    color: "#10b981",
    textAlign: "center",
    fontSize: 13,
    marginBottom: 4,
  },
  button: {
    backgroundColor: "#000000",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    width: 240,
    marginTop: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  loginLinkContainer: {
    flexDirection: "row",
    alignSelf: "center",
  },
  loginLinkText: {
    fontSize: 14,
    color: "#ffffff",
  },
  loginLink: {
    fontSize: 15,
    color: "#000000",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});

export default ForgotPasswordScreen;