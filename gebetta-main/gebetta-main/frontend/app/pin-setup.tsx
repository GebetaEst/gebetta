import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Vibration,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, X, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

const { width } = Dimensions.get('window');

export default function PinSetupScreen() {
  const router = useRouter();
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [isConfirming, setIsConfirming] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const pinBoxAnimations = useState(() => 
    Array.from({ length: 4 }, () => new Animated.Value(1))
  )[0];
  const successAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Initial entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate PIN box when digit is entered
  const animatePinBox = (index: number) => {
    Animated.sequence([
      Animated.timing(pinBoxAnimations[index], {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pinBoxAnimations[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNumberPress = (number: string) => {
    const currentPin = isConfirming ? confirmPin : pin;
    const setCurrentPin = isConfirming ? setConfirmPin : setPin;
    
    // Find the first empty slot
    const emptyIndex = currentPin.findIndex(digit => digit === '');
    if (emptyIndex !== -1) {
      const newPin = [...currentPin];
      newPin[emptyIndex] = number;
      setCurrentPin(newPin);
      setActiveIndex(emptyIndex + 1);
      
      // Animate the PIN box
      animatePinBox(emptyIndex);
      
      // If all 4 digits are filled
      if (emptyIndex === 3) {
        if (!isConfirming) {
          // Move to confirmation step with animation
          setTimeout(() => {
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(slideAnim, {
                toValue: -30,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start(() => {
              setIsConfirming(true);
              setActiveIndex(0);
              Animated.parallel([
                Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]).start();
            });
          }, 300);
        } else {
          // Validate pins match with success animation
          setTimeout(() => {
            validatePins(pin, newPin);
          }, 300);
        }
      }
    }
  };

  const handleDelete = () => {
    const currentPin = isConfirming ? confirmPin : pin;
    const setCurrentPin = isConfirming ? setConfirmPin : setPin;
    
    // Find the last filled slot
    const lastFilledIndex = currentPin.slice().reverse().findIndex(digit => digit !== '');
    if (lastFilledIndex !== -1) {
      const actualIndex = currentPin.length - 1 - lastFilledIndex;
      const newPin = [...currentPin];
      newPin[actualIndex] = '';
      setCurrentPin(newPin);
      setActiveIndex(actualIndex);
    }
  };

  const validatePins = (originalPin: string[], confirmedPin: string[]) => {
    const originalPinString = originalPin.join('');
    const confirmedPinString = confirmedPin.join('');
    
    if (originalPinString === confirmedPinString) {
      // PIN created successfully - Show success animation
      Animated.sequence([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      setTimeout(() => {
        Alert.alert(
          '🎉 PIN Created Successfully!',
          'Your app is now secured with a 4-digit PIN.',
          [
            {
              text: 'Great!',
              onPress: () => {
                // Save PIN (in real app, save to secure storage)
                router.back();
              },
            },
          ]
        );
      }, 800);
    } else {
      // PINs don't match - Shake animation
      Vibration.vibrate([100, 50, 100, 50, 100]);
      
      // Shake animation for PIN boxes
      const shakeAnimation = Animated.sequence([
        Animated.timing(slideAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]);
      
      shakeAnimation.start();
      
      setTimeout(() => {
        Alert.alert(
          '❌ PINs Don\'t Match',
          'The PINs you entered don\'t match. Please try again.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                // Reset to start over with animation
                setPin(['', '', '', '']);
                setConfirmPin(['', '', '', '']);
                setIsConfirming(false);
                setActiveIndex(0);
                
                // Reset animations
                Animated.parallel([
                  Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                  Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                ]).start();
              },
            },
          ]
        );
      }, 200);
    }
  };

  const handleBack = () => {
    if (isConfirming) {
      // Go back to PIN creation
      setIsConfirming(false);
      setConfirmPin(['', '', '', '']);
      setActiveIndex(0);
    } else {
      // Go back to settings
      router.back();
    }
  };

  const renderPinBox = (index: number) => {
    const currentPin = isConfirming ? confirmPin : pin;
    const isFilled = currentPin[index] !== '';
    const isActive = activeIndex === index;
    
    return (
      <Animated.View
        key={index}
        style={[
          styles.pinBox,
          isFilled && styles.pinBoxFilled,
          isActive && styles.pinBoxActive,
          {
            transform: [{ scale: pinBoxAnimations[index] }],
          }
        ]}
      >
        {isFilled ? (
          <Animated.View 
            style={[
              styles.pinDot,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]} 
          />
        ) : (
          isActive && (
            <Animated.View
              style={[
                styles.pinPlaceholder,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.7],
                  }),
                }
              ]}
            />
          )
        )}
      </Animated.View>
    );
  };

  const renderNumberButton = (number: string) => (
    <TouchableOpacity
      key={number}
      style={styles.numberButton}
      onPress={() => handleNumberPress(number)}
      activeOpacity={0.6}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        style={styles.numberButtonGradient}
      >
        <Text style={styles.numberText}>{number}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#F8FAFC', '#E2E8F0', '#F1F5F9']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isConfirming ? 'Confirm PIN' : 'Create PIN'}
          </Text>
          <View style={styles.headerIcon}>
            <Lock size={20} color={isConfirming ? "#10B981" : "#3B82F6"} />
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Top Section */}
          <View>
            <View style={styles.titleSection}>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: scaleAnim }],
                }
              ]}
            >
              <Lock size={32} color={isConfirming ? "#10B981" : "#3B82F6"} />
            </Animated.View>
            <Text style={styles.title}>
              {isConfirming ? 'Confirm your PIN' : 'Create a 4-digit PIN'}
            </Text>
            <Text style={styles.subtitle}>
              {isConfirming 
                ? 'Enter your PIN again to confirm'
                : 'This PIN will be used to unlock your app'
              }
            </Text>
            </View>

            {/* PIN Boxes */}
            <Animated.View 
              style={[
                styles.pinContainer,
                {
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              {[0, 1, 2, 3].map(renderPinBox)}
            </Animated.View>
          </View>

          {/* Success Overlay */}
          <Animated.View
            style={[
              styles.successOverlay,
              {
                opacity: successAnim,
                transform: [{ scale: successAnim }],
              }
            ]}
            pointerEvents="none"
          >
            <Text style={styles.successText}>✅</Text>
          </Animated.View>

          {/* Number Pad */}
          <Animated.View 
            style={[
              styles.numberPad,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim.interpolate({
                  inputRange: [-30, 0, 30],
                  outputRange: [30, 0, -30],
                }) }],
              }
            ]}
          >
            <View style={styles.numberRow}>
              {['1', '2', '3'].map(renderNumberButton)}
            </View>
            <View style={styles.numberRow}>
              {['4', '5', '6'].map(renderNumberButton)}
            </View>
            <View style={styles.numberRow}>
              {['7', '8', '9'].map(renderNumberButton)}
            </View>
            <View style={styles.numberRow}>
              <View style={styles.numberButton} />
              {renderNumberButton('0')}
              <TouchableOpacity
                style={styles.numberButton}
                onPress={handleDelete}
                activeOpacity={0.6}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F8F9FA']}
                  style={styles.numberButtonGradient}
                >
                  <X size={24} color={colors.text} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.5)',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerTitle: {
    ...typography.heading3,
    color: colors.text,
    fontWeight: '700',
  },
  headerIcon: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    ...typography.heading3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
    fontSize: 20,
  },
  subtitle: {
    ...typography.body,
    color: colors.lightText,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
    paddingHorizontal: 10,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 16,
  },
  pinBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pinBoxFilled: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  pinBoxActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    elevation: 6,
    shadowOpacity: 0.15,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  pinPlaceholder: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  successOverlay: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    fontSize: 30,
  },
  numberPad: {
    alignItems: 'center',
  },
  numberRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 20,
  },
  numberButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  numberButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  numberText: {
    ...typography.heading3,
    color: colors.text,
    fontWeight: '700',
    fontSize: 20,
  },
});
