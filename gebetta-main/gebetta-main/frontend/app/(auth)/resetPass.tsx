import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
const { width, height } = Dimensions.get('window');

type OtpVerificationFormProps = {
  phone: string;
  setShowOtpForm?: (show: boolean) => void;
};

const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({ phone, setShowOtpForm }) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]); // for 6-digit OTP
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const navigation = useNavigation<NavigationProp<any>>();
  const router = useRouter();

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    const key = event.nativeEvent.key;
    if (key === "Backspace") {
      if (otp[index] === "") {
        if (index > 0) inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }

    // Handle Enter key to submit
    if ((key === "Enter" || key === "Done") && index === otp.length - 1) {
      handleSubmit();
    }
  };

  const handleSubmit = async (e?: any) => {
    e?.preventDefault?.();

    const code = otp.join("");
    if (code.length !== 6 || !phone || !password || !passwordConfirm) {
      setError("Please complete all fields");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "https://api.bahirandelivery.cloud/api/v1/users/resetPasswordOTP",
        {
          phone,
          code,
          password,
          passwordConfirm,
        }
      );
      if (res?.data?.status === "success") {
        console.log(res.data.status);
        setTimeout(() => {
          router.push("/(auth)/login");
        }, 800);
      }

      setMessage(res.data.message || "OTP verified successfully");
      setError("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid or expired OTP");
      } else {
        setError("Invalid or expired OTP");
      }
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone) {
      setError("Phone number is required");
      return;
    }
    try {
      const res = await axios.post(
        "https://api.bahirandelivery.cloud/api/v1/users/requestResetOTP",
        { phone }
      );
      setMessage(res.data.message || "OTP resent");
      setError("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to resend OTP");
      } else {
        setError("Failed to resend OTP");
      }
      setMessage("");
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.kbView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.card}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Enter the 6-digit OTP sent to {phone}</Text>

              {/* OTP */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) {
                        inputRefs.current[index] = ref;
                      }
                    }}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(value) => handleChange(index, value)}
                    onKeyPress={(event) => handleKeyPress(index, event)}
                    maxLength={1}
                    keyboardType="number-pad"
                    textAlign="center"
                    placeholder=""
                    returnKeyType={index === otp.length - 1 ? 'done' : 'next'}
                    blurOnSubmit={false}
                  />
                ))}
              </View>

              {/* Password Inputs */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={[styles.input, { paddingRight: 40 }]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="Enter new password"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setShowPassword((show) => !show)}
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    hitSlop={10}
                  >
                    {showPassword
                      ? <Ionicons name="eye-off" size={22} color="#222" />
                      : <Ionicons name="eye" size={22} color="gray" />}
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={[styles.input, { paddingRight: 40 }]}
                    value={passwordConfirm}
                    onChangeText={setPasswordConfirm}
                    secureTextEntry={!showPasswordConfirm}
                    placeholder="Confirm new password"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setShowPasswordConfirm((show) => !show)}
                    accessibilityLabel={showPasswordConfirm ? "Hide password" : "Show password"}
                    hitSlop={10}
                  >
                    {showPasswordConfirm
                      ? <Ionicons name="eye-off" size={22} color="#00000" />
                      : <Ionicons name="eye" size={22} color="gray" />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error & Message */}
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {message ? <Text style={styles.success}>{message}</Text> : null}

              {/* Submit Button */}
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                {loading ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.buttonText}>Reset Password</Text>}
              </TouchableOpacity>
                
              {/* Resend */}
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(0, 0, 0, 0.40)',
    zIndex: 1,
  },
  kbView: {
    flex: 1,
    zIndex: 2,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    alignItems: 'center',
    padding: 28,
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginBottom: 8,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 3,
    marginBottom: 20,
    width: '100%',
  },
  otpInput: {
    width: 40,
    height: 50,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  inputWithIcon: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  iconButton: {
    position: 'absolute',
    right: 8,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
    zIndex: 2,
  },
  error: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '500',
    padding:5,
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderColor: 'rgba(255, 0, 0, 0.7)',
  },
  success: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '500',
    padding:5,
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: 'rgba(101, 171, 97, 0.7)',
    borderColor: 'rgba(3, 181, 51, 0.7)',
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#000000',
    textDecorationLine: 'underline',
    fontWeight: '600',
    marginTop: 4,
  },
});

export default OtpVerificationForm;