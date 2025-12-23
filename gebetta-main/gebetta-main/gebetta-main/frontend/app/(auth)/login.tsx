import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/store/useAuthStore';
import VerifyScreen from './verify';

type Country = {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
};

const countries: Country[] = [
  { name: 'Ethiopia', code: 'ET', dialCode: '+251', flag: '🇪🇹' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
];

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [responseMessage, setResponseMessage] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [responseType, setResponseType] = useState<'success' | 'error'>('success');
  const [showPassword, setShowPassword] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showOTPPage, setShowOTPPage] = useState(true);
  const [backgroundImageError, setBackgroundImageError] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();

  const validateForm = () => {
    let isValid = true;

    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 9) {
      setPhoneError('Please enter a valid phone number');
      isValid = false;
    } else {
      setPhoneError('');
    }

    // Validate password
    if (!password ) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setResponseMessage('');
    console.log('🔐 Attempting login with:', {
      phone: phoneNumber,
      password: password
    });
    const cleanedNumber = phoneNumber.replace(/\D/g, '').replace(/^0+/, '');
    const formattedPhone = `${selectedCountry.dialCode}${cleanedNumber}`.replace('+', '');

    // console.log('🔐 Attempting login with:', {
    //   phone: formattedPhone,
    //   passwordLength: password.length
    // });

    try {
      const response = await fetch('https://gebeta-delivery1.onrender.com/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber,
          password: password 
        }),
      });

      
      const data = await response.json();
      console.log('✅✅✅✅✅ Server response: {login.tsx}', data);
      

      if (!response.ok) {
        throw new Error(data?.message || 'Login failed');
      }

      // if (data.data?.message.includes('OTP sent to your')){
      //   setShowOTPPage(false)
      //   return;
      // }
      if (!data.data.user){
        setShowOTPPage(false)
        return;
      }

      // Store user data in auth store
      if (data.token && data.data?.user) {
        // console.log('✅ Storing user data: {login.tsx}', { user: data.data.user, token: data.token });
        const userData = {
          ...data.data.user,
          token: data.token  // Ensure token is included in user data
        };
        
        // Store both the token and user data
        await login({ 
          user: userData, 
          token: data.token 
        });
        
        // Also store in SecureStore for persistence
        await SecureStore.setItemAsync('userToken', data.token);
        await SecureStore.setItemAsync('userInfo', JSON.stringify(userData));
        
        console.log('✅ User data stored successfully {login.tsx}');
      } else {
        console.error('❌ Missing user data or token in response: {login.tsx}', data);
        throw new Error('Invalid response format from server');
      }

      setResponseMessage('Successful!');
      setResponseType('success');
      setShowResponse(true);

      setTimeout(() => {
        setShowResponse(false);
        router.replace('/(tabs)');
      }, 2000);
    } catch (error: any) {
      console.error('❌ Error logging in:', error.message);
      setResponseMessage(`❌ ${error.message}`);
      setResponseType('error');
      setShowResponse(true);

      setTimeout(() => setShowResponse(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const renderCountryItem = (country: Country) => (
    <TouchableOpacity
      key={country.code}
      style={styles.countryItem}
      onPress={() => {
        setSelectedCountry(country);
        setShowCountryPicker(false);
      }}
    >
      <Text style={styles.flag}>{country.flag}</Text>
      <Text style={styles.countryName}>{country.name}</Text>
      <Text style={styles.dialCode}>{country.dialCode}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.fullScreen}>
      <ImageBackground
        source={require('@/assets/images/background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
        onError={() => {
          console.log('❌ Background image failed to load {login.tsx}');
          setBackgroundImageError(true);
        }}
      >
          {showOTPPage && (
        <SafeAreaView style={styles.safeArea}>
          {showResponse && (
            <View
              style={[
                styles.responseBanner,
                responseType === 'success' ? styles.successBanner : styles.errorBanner,
              ]}
            >
              <Text style={styles.responseText}>{responseMessage} ok</Text>
            </View>
          )}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.container}
              keyboardVerticalOffset={Platform.OS === 'ios' ? -100 : 0}
            >
              <View
                style={styles.scrollContent}
              >
                <View style={styles.logoContainer}>
                  {!imageError ? (
                    <Image
                      source={require('@/assets/images/new.png')}
                      style={styles.logo}
                      resizeMode="contain"
                      onError={() => {
                        console.log('❌ Logo image failed to load');
                        setImageError(true);
                      }}
                    />
                  ) : (
                    <View style={styles.logoFallback}>
                      <Ionicons name="restaurant" size={60} color="#fff" />
                    </View>
                  )}
                  <Text style={styles.welcomeText}>Welcome to Bahiran</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Sign In</Text>
                  <Text style={styles.cardSubtitle}>Enter your phone number and password</Text>

                  <View style={styles.phoneInputContainer}>
                    <TouchableOpacity
                      style={styles.countryPicker}
                      onPress={() => setShowCountryPicker(!showCountryPicker)}
                    >
                      <Text style={styles.flag}>{selectedCountry.flag}</Text>
                      <Text style={styles.dialCodeText}>{selectedCountry.dialCode}</Text>
                      <Ionicons name="chevron-down" size={16} color="black" />
                    </TouchableOpacity>

                    <TextInput
                      style={[styles.input, phoneError ? styles.inputError : null]}
                      placeholder="Phone number"
                      placeholderTextColor="#999"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>

                  {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={[styles.passwordInput, passwordError ? styles.inputError : null]}
                      placeholder="Password"
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                  </View>

                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                  {showCountryPicker && (
                    <ScrollView style={styles.countryScrollView} nestedScrollEnabled={true}>
                      <View style={styles.countryList}>{countries.map(renderCountryItem)}</View>
                    </ScrollView>
                  )}

                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.linksContainer}>
                    <TouchableOpacity onPress={() => router.push('/(auth)/forgot_pass')}>
                      <Text style={styles.linkText}>Forgot Password?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/(auth)/restaurant-owner-signup')}>
                      <Text style={styles.linkText}>Create Account</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.termsText}>
                    By signing in, you agree to our{' '}
                    <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                    <Text style={styles.linkText}>Privacy Policy</Text>
                  </Text>
                </View>
              </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
          )}
      </ImageBackground>
      {!showOTPPage &&
      <View style={styles.verifyContainer}>
        <VerifyScreen phoneNumber={phoneNumber} signUP={false}/>
      </View>
      }
    </View>
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
  fullScreen: {
    flex: 1,
    width: width,
    height: height,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    minHeight: height,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: width * 0.43,  // Increased size for bigger screens
    height: width * 0.43,
    marginTop: 10,
    maxWidth: 240,
    maxHeight: 240,
    alignSelf: 'center',
  },
  logoFallback: {
    width: 100,
    height: 100,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#f0f0f0',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111',
    fontFamily: 'Roboto',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRightWidth: 0,
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  dialCodeText: {
    fontSize: 16,
    color: '#333',
    marginRight: 4,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderLeftWidth: 0,
    fontSize: 16,
    // color: '#333',
  },
  passwordInputContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  passwordInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
    paddingRight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 10,
    padding: 4,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  button: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 13,
    marginTop: 0,
    marginBottom: 10,
    marginLeft: 4,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  termsText: {
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
  linkText: {
    color: '#000000',
    textDecorationLine: 'underline',
    fontSize: 16,
    // fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  countryList: {
    maxHeight: 220,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 4,
    overflow: 'hidden',
    
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countryName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  dialCode: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  responseBanner: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: '70%',
    padding: 6,
    borderRadius: 8,
    position: 'absolute',
    top: 280,
    left: 'auto',
    right: 'auto',
    zIndex: 1000,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(141, 139, 139, 0.71)',
  },
  successBanner: {
    backgroundColor: 'rgba(75, 181, 67, 0.9)',

  },
  errorBanner: {
    backgroundColor: 'rgba(255, 76, 76, 0.9)',
  },
  responseText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    opacity: 1,
  },
  countryScrollView: {
    width: '100%',
    maxHeight: 150,
    zIndex: 5000,
    position: 'absolute',
    top: 150,
    left: 20,
    right: 20,
  },
});
