import React, { ReactNode } from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator, 
  View,
  StyleProp
} from 'react-native';
import { buttonSizes, spacing, borderRadius, isTablet, isSmallPhone } from '@/utils/responsive';
import ResponsiveText from './ResponsiveText';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger' | 'success' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeOpacity?: number;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  children?: ReactNode;
}

const ResponsiveButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  activeOpacity = 0.7,
  testID,
  accessibilityLabel,
  accessibilityHint,
  children,
}) => {
  // Get base button styles based on variant
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: '#6c757d',
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: '#007bff',
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          paddingVertical: 0,
        };
      case 'danger':
        return {
          backgroundColor: '#dc3545',
          borderWidth: 0,
        };
      case 'success':
        return {
          backgroundColor: '#28a745',
          borderWidth: 0,
        };
      case 'warning':
        return {
          backgroundColor: '#ffc107',
          borderWidth: 0,
        };
      case 'primary':
      default:
        return {
          backgroundColor: '#007bff',
          borderWidth: 0,
        };
    }
  };

  // Get text color based on variant
  const getTextColor = (): string => {
    if (variant === 'outline' || variant === 'text') {
      return '#007bff';
    } else if (variant === 'warning') {
      return '#212529';
    }
    return '#ffffff';
  };

  // Get button size styles
  const getSizeStyle = (): ViewStyle => {
    const baseSize = buttonSizes[size] || buttonSizes.md;
    
    if (isSmallPhone()) {
      return {
        ...baseSize,
        paddingHorizontal: baseSize.paddingHorizontal * 0.9,
        height: baseSize.height * 0.9,
      };
    }
    
    if (isTablet()) {
      return {
        ...baseSize,
        paddingHorizontal: baseSize.paddingHorizontal * 1.1,
        height: baseSize.height * 1.1,
      };
    }
    
    return baseSize;
  };

  // Combine all styles
  const buttonStyle: ViewStyle = {
    ...styles.button,
    ...getVariantStyle(),
    ...getSizeStyle(),
    ...(fullWidth && { width: '100%' }),
    ...(disabled && styles.disabled),
  };

  // Combine text styles
  const combinedTextStyle: TextStyle = {
    ...styles.text,
    color: getTextColor(),
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={activeOpacity}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
          <ResponsiveText
            variant="button"
            style={StyleSheet.flatten([
              combinedTextStyle,
              textStyle,
              { marginHorizontal: leftIcon || rightIcon ? spacing.sm : 0 },
            ])}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </ResponsiveText>
          {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
        </View>
      )}
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default ResponsiveButton;
