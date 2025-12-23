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
import { ArrowLeft, X, Lock, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

const { width } = Dimensions.get('window');

type PinStep = 'current' | 'new' | 'confirm';

export default function ChangePinScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<PinStep>('current');
  const [currentPin, setCurrentPin] = useState(['', '', '', '']);
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // For demo purposes - in real app, this would come from secure storage
  const STORED_PIN = '1234';
  
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

  const getCurrentPin = () => {
    switch (currentStep) {
      case 'current':
        return currentPin;
      case 'new':
        return newPin;
      case 'confirm':
        return confirmPin;
      default:
        return currentPin;
    }
  };

  const setCurrentPinArray = (pin: string[]) => {
    switch (currentStep) {
      case 'current':
        setCurrentPin(pin);
        break;
      case 'new':
        setNewPin(pin);
        break;
      case 'confirm':
        setConfirmPin(pin);
        break;
    }
  };

  const handleNumberPress = (number: string) => {
    const pin = getCurrentPin();
    
    // Find the first empty slot
    const emptyIndex = pin.findIndex(digit => digit === '');
    if (emptyIndex !== -1) {
      const newPinArray = [...pin];
      newPinArray[emptyIndex] = number;
      setCurrentPinArray(newPinArray);
      setActiveIndex(emptyIndex + 1);
      
      // Animate the PIN box
      animatePinBox(emptyIndex);
      
      // If all 4 digits are filled
      if (emptyIndex === 3) {
        setTimeout(() => {
          processPinStep(newPinArray);
        }, 300);
      }
    }
  };

  const processPinStep = (pin: string[]) => {
    const pinString = pin.join('');
    
    switch (currentStep) {
      case 'current':
        // Verify current PIN
        if (pinString === STORED_PIN) {
          // Move to new PIN step
          transitionToNextStep('new');
        } else {
          // Wrong PIN
          handleWrongPin();
        }
        break;
        
      case 'new':
        // Move to confirm step
        transitionToNextStep('confirm');
        break;
        
      case 'confirm':
        // Verify new PIN matches
        const newPinString = newPin.join('');
        if (pinString === newPinString) {
          // PIN changed successfully
          handlePinChangeSuccess();
        } else {
          // PINs don't match
          handlePinMismatch();
        }
        break;
    }
  };

  const transitionToNextStep = (nextStep: PinStep) => {
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
      setCurrentStep(nextStep);
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
  };

  const handleWrongPin = () => {
    Vibration.vibrate([100, 50, 100, 50, 100]);
    
    // Shake animation
    const shakeAnimation = Animated.sequence([
      Animated.timing(slideAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]);
    
    shakeAnimation.start();
    
    setTimeout(() => {
      Alert.alert(
        '❌ Incorrect PIN',
        'The current PIN you entered is incorrect. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setCurrentPin(['', '', '', '']);
              setActiveIndex(0);
            },
          },
        ]
      );
    }, 200);
  };

  const handlePinMismatch = () => {
    Vibration.vibrate([100, 50, 100, 50, 100]);
    
    // Shake animation
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
        'The new PINs you entered don\'t match. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setNewPin(['', '', '', '']);
              setConfirmPin(['', '', '', '']);
              setCurrentStep('new');
              setActiveIndex(0);
            },
          },
        ]
      );
    }, 200);
  };

  const handlePinChangeSuccess = () => {
    // Success animation
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
        '🎉 PIN Changed Successfully!',
        'Your app lock PIN has been updated.',
        [
          {
            text: 'Great!',
            onPress: () => {
              // In real app, save new PIN to secure storage
              router.back();
            },
          },
        ]
      );
    }, 800);
  };

  const handleDelete = () => {
    const pin = getCurrentPin();
    
    // Find the last filled slot
    const lastFilledIndex = pin.slice().reverse().findIndex(digit => digit !== '');
    if (lastFilledIndex !== -1) {
      const actualIndex = pin.length - 1 - lastFilledIndex;
      const newPinArray = [...pin];
      newPinArray[actualIndex] = '';
      setCurrentPinArray(newPinArray);
      setActiveIndex(actualIndex);
    }
  };

  const handleBack = () => {
    if (currentStep === 'current') {
      router.back();
    } else {
      // Go back to previous step
      const previousStep: PinStep = currentStep === 'confirm' ? 'new' : 'current';
      setCurrentStep(previousStep);
      setActiveIndex(0);
      
      // Clear current step data
      if (currentStep === 'confirm') {
        setConfirmPin(['', '', '', '']);
      } else if (currentStep === 'new') {
        setNewPin(['', '', '', '']);
      }
    }
  };

  const getStepInfo = () => {
    switch (currentStep) {
      case 'current':
        return {
          title: 'Enter Current PIN',
          subtitle: 'Please enter your current 4-digit PIN',
          icon: <User size={32} color="#F59E0B" />,
          headerIcon: <User size={20} color="#F59E0B" />,
        };
      case 'new':
        return {
          title: 'Create New PIN',
          subtitle: 'Enter your new 4-digit PIN',
          icon: <Lock size={32} color="#3B82F6" />,
          headerIcon: <Lock size={20} color="#3B82F6" />,
        };
      case 'confirm':
        return {
          title: 'Confirm New PIN',
          subtitle: 'Enter your new PIN again to confirm',
          icon: <Lock size={32} color="#10B981" />,
          headerIcon: <Lock size={20} color="#10B981" />,
        };
      default:
        return {
          title: 'Change PIN',
          subtitle: '',
          icon: <User size={32} color="#F59E0B" />,
          headerIcon: <User size={20} color="#F59E0B" />,
        };
    }
  };

  const renderPinBox = (index: number) => {
    const pin = getCurrentPin();
    const isFilled = pin[index] !== '';
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

  const stepInfo = getStepInfo();

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
          <Text style={styles.headerTitle}>Change PIN</Text>
          <View style={styles.headerIcon}>
            {stepInfo.headerIcon}
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
                {stepInfo.icon}
              </Animated.View>
              <Text style={styles.title}>{stepInfo.title}</Text>
              <Text style={styles.subtitle}>{stepInfo.subtitle}</Text>
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
