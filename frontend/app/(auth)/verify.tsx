import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

type OTPInputRef = TextInput | null;

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef<Array<OTPInputRef>>(Array(6).fill(null));

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const filled = otp.every((digit) => digit !== '');
    if (filled) {
      handleVerify();
    }
  }, [otp]);

  const handleChange = (value: string, index: number) => {
    if (value.length > 1) value = value.charAt(value.length - 1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
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

    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        'https://gebeta-delivery1.onrender.com/api/v1/users/verifySignupOTP',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, code: otpCode }),
        }
      );

      const response = await res.json();
      
      console.log('✅ Login Response:', {
        hasUser: !!response.data?.user,
        userId: response.data?.user?._id,
        firstName: response.data?.user?.firstName,
        profilePicture: response.data?.user?.profilePicture,
        hasProfilePicture: !!response.data?.user?.profilePicture
      });

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
          email: response.data.user.email || '',
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>OTP sent to {phone}</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputRefs.current[index] = ref;
            }}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            selectTextOnFocus
          />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
    backgroundColor: '#f5f5f5',
    color: '#000',
  },
  button: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
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
