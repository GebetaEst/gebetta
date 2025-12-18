import React, { useState, useRef, useEffect } from 'react';
import typography from "@/constants/typography";
import colors from "@/constants/colors";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Animated,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

type OTPInputRef = TextInput | null;

export default function VerifyScreen( { phoneNumber , signUP }: { phoneNumber: string , signUP: boolean } ) {
  // const { phone } = useLocalSearchParams<{ phone: string }>();
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef<Array<OTPInputRef>>(Array(6).fill(null));
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Start animation when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Focus first input after animation starts
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);
  }, []);

  useEffect(() => {
    const otpFilled = otp.every((digit) => digit !== '');
    const passwordsValid = !signUP || (password && confirmPassword && password === confirmPassword);
    if (otpFilled && passwordsValid) {
      handleVerify();
    }
  }, [otp, password, confirmPassword, signUP]);

  const handleChange = (value: string, index: number) => {
    let processedValue = value;

    // Handle paste for the first input (maxLength=6)
    if (index === 0 && value.length > 1) {
      if (value.length >= 6 && /^\d{6,}$/.test(value)) {
        // Extract first 6 digits if more than 6
        const otpString = value.slice(0, 6);
        const digits = otpString.split('');
        setOtp(digits);
        // Focus the last input
        inputRefs.current[5]?.focus();
        return; // Exit early since we've filled all fields
      } else if (/^\d+$/.test(value)) {
        // If less than 6 digits pasted into first, fill from start
        const digits = value.split('').slice(0, 6 - index);
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (index + i < 6) newOtp[index + i] = digit;
        });
        setOtp(newOtp);
        // Focus the next unfilled input
        const nextIndex = Math.min(index + digits.length, 5);
        if (nextIndex < 6) {
          inputRefs.current[nextIndex]?.focus();
        }
        return;
      } else {
        // Invalid paste, take first digit
        processedValue = value.charAt(0);
      }
    } else if (value.length > 1) {
      // For other inputs, take last character (in case of any multi-char input)
      processedValue = value.charAt(value.length - 1);
    }

    // Standard single digit update
    const newOtp = [...otp];
    newOtp[index] = processedValue;
    setOtp(newOtp);

    // Move to next input if filled
    if (processedValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    if (signUP) {
      if (!password || !confirmPassword) {
        setError('Please enter both passwords');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setError('');
    setSuccess('');

    const payload: { phone: string; code: string; password?: string; passwordConfirm?: string } = {
      phone: phoneNumber,
      code: otpCode,
      ...(signUP ? { password, passwordConfirm: confirmPassword } : {}),
    };

    try {
      const res = await fetch(
        `https://api.bahirandelivery.cloud/api/v1/users/verify${signUP ? 'Signup' : ''}OTP`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const response = await res.json();
      console.log('✅ Verify Response:', response);
      
      // console.log('✅ Login Response:', {
      //   hasUser: !!response.data?.user,
      //   userId: response.data?.user?._id,
      //   firstName: response.data?.user?.firstName,
      //   profilePicture: response.data?.user?.profilePicture,
      //   hasProfilePicture: !!response.data?.user?.profilePicture
      // });

      if (!res.ok) throw new Error(response?.message || 'OTP verification failed');

      // Store token and user data securely
      if (response.token && response.data?.user) {
        // Store the authentication token
        await SecureStore.setItemAsync('userToken', response.token);
        
        // Store the complete user data
        const userData = {
          _id: response.data.user._id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName || '',
          phone: response.data.user.phone,
          profilePicture: response.data.user.profilePicture || '',
          role: response.data.user.role,
          isPhoneVerified: response.data.user.isPhoneVerified,
          addresses: response.data.user.addresses || [],
          token: response.token
        };
        
        // Store the parsed user data
        await SecureStore.setItemAsync('userInfo', JSON.stringify(userData));
        
        // Update auth store with logged in user data
        const { setUser } = useAuthStore.getState();
        await setUser(userData);
      }

      setSuccess('✅ OTP verified successfully!');

      setTimeout(() => {
        router.replace({
          pathname: '/(tabs)' as any,
          params: { screen: 'home' }
        });
      }, 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Verification error';
      setError(errorMessage);
    }
  };

  return (
    <Animated.View 
      style={[
        { flex: 1 },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>OTP sent to {phoneNumber}</Text>

        <View style={styles.otpContainer}>
          <View style={styles.otpInputContainer}>
            
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={index === 0 ? 6 : 1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              selectTextOnFocus
            />
          ))}
          </View>
        </View>

        {signUP && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Create Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                placeholderTextColor="#999"
              />
            </View>
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleVerify}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // width: "60%",
    height: 50,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 15,
    // borderWidth: 1,
    borderColor: '#ccc',
    alignSelf: "center",
    alignItems: "center",
  },
  container: {
    flex: 0.5,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginHorizontal: 15,
    width: "98%",
    alignSelf: "center",
    height: "100%",
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
    textShadowOffset: { width: 2, height: 0 },
    textShadowRadius: 4,
    letterSpacing: 1,

  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#fff',
    zIndex: 1000,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  otpInput: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
    backgroundColor: '#f5f5f5',
    color: '#000',
    margin:2,
  },
  inputContainer: {
    marginHorizontal: 15,
    marginBottom: 16,
  },
  label: {
    color: colors.white,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    color: '#000',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    width: "60%",
    alignSelf: "center",
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    width: "100%",
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 8,
  },
  success: {
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
});