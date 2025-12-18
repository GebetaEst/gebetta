import { Dimensions, Platform, PixelRatio } from 'react-native';
import { StyleSheet } from 'react-native';

// Screen size based on width
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 12 Pro Max - 428x926)
const BASE_WIDTH = 428;
const BASE_HEIGHT = 926;

// Scale factor based on screen width
const scale = SCREEN_WIDTH / BASE_WIDTH;

// Function to normalize font size based on screen width
export const normalizeFontSize = (size: number): number => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
  }
};

// Function to normalize size based on screen width
export const normalizeSize = (size: number): number => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Function to check if device is a tablet
export const isTablet = (): boolean => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  
  return (
    (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) ||
    (pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920))
  );
};

// Function to check if device is a small phone
export const isSmallPhone = (): boolean => {
  return SCREEN_WIDTH < 375; // iPhone SE, 5S, etc.
};

// Function to get responsive padding/margin
export const responsivePadding = (size: number): number => {
  return normalizeSize(size);
};

// Function to get responsive border radius
export const responsiveBorderRadius = (size: number): number => {
  return normalizeSize(size);
};

// Function to get responsive width percentage
export const responsiveWidth = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

// Function to get responsive height percentage
export const responsiveHeight = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

// Platform specific styles
export const platformStyles = {
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),
  shadowMd: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    android: {
      elevation: 5,
    },
    default: {},
  }),
  shadowLg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
};

// Export screen dimensions
export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallPhone: isSmallPhone(),
  isTablet: isTablet(),
  isAndroid: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios',
};

// Responsive font sizes
export const fontSizes = {
  xs: normalizeFontSize(10),
  sm: normalizeFontSize(12),
  base: normalizeFontSize(14),
  lg: normalizeFontSize(16),
  xl: normalizeFontSize(18),
  '2xl': normalizeFontSize(20),
  '3xl': normalizeFontSize(24),
  '4xl': normalizeFontSize(30),
  '5xl': normalizeFontSize(36),
};

// Responsive spacing
export const spacing = {
  xs: normalizeSize(4),
  sm: normalizeSize(8),
  md: normalizeSize(12),
  lg: normalizeSize(16),
  xl: normalizeSize(20),
  '2xl': normalizeSize(24),
  '3xl': normalizeSize(32),
  '4xl': normalizeSize(40),
  '5xl': normalizeSize(48),
};

// Responsive border radius
export const borderRadius = {
  none: 0,
  sm: normalizeSize(2),
  default: normalizeSize(4),
  md: normalizeSize(6),
  lg: normalizeSize(8),
  xl: normalizeSize(12),
  '2xl': normalizeSize(16),
  full: 9999,
};

// Responsive icon sizes
export const iconSizes = {
  xs: normalizeSize(16),
  sm: normalizeSize(20),
  md: normalizeSize(24),
  lg: normalizeSize(28),
  xl: normalizeSize(32),
  '2xl': normalizeSize(40),
};

// Responsive button sizes
export const buttonSizes = {
  sm: {
    paddingVertical: normalizeSize(6),
    paddingHorizontal: normalizeSize(12),
    fontSize: fontSizes.sm,
    height: normalizeSize(32),
  },
  md: {
    paddingVertical: normalizeSize(8),
    paddingHorizontal: normalizeSize(16),
    fontSize: fontSizes.base,
    height: normalizeSize(40),
  },
  lg: {
    paddingVertical: normalizeSize(12),
    paddingHorizontal: normalizeSize(20),
    fontSize: fontSizes.lg,
    height: normalizeSize(48),
  },
  xl: {
    paddingVertical: normalizeSize(14),
    paddingHorizontal: normalizeSize(24),
    fontSize: fontSizes.xl,
    height: normalizeSize(56),
  },
};

// Responsive input sizes
export const inputSizes = {
  sm: {
    height: normalizeSize(36),
    paddingHorizontal: normalizeSize(12),
    fontSize: fontSizes.sm,
  },
  md: {
    height: normalizeSize(44),
    paddingHorizontal: normalizeSize(16),
    fontSize: fontSizes.base,
  },
  lg: {
    height: normalizeSize(52),
    paddingHorizontal: normalizeSize(20),
    fontSize: fontSizes.lg,
  },
};

// Responsive grid system
export const grid = {
  gutter: normalizeSize(16),
  column: (columns: number = 12, gutter: number = normalizeSize(16)) => {
    const columnWidth = (SCREEN_WIDTH - (gutter * (columns - 1))) / columns;
    return {
      width: columnWidth,
      marginRight: gutter,
      '&:last-child': {
        marginRight: 0,
      },
    };
  },
};

// Responsive container
export const container = {
  sm: normalizeSize(640),
  md: normalizeSize(768),
  lg: normalizeSize(1024),
  xl: normalizeSize(1280),
  '2xl': normalizeSize(1536),
};

// Helper function to use in StyleSheet.create
export const createResponsiveStyle = <T extends Record<string, any>>(styles: T): T => {
    return StyleSheet.create(styles);
  };

// Export all utilities as default
export default {
  normalizeFontSize,
  normalizeSize,
  isTablet,
  isSmallPhone,
  responsivePadding,
  responsiveBorderRadius,
  responsiveWidth,
  responsiveHeight,
  platformStyles,
  screen,
  fontSizes,
  spacing,
  borderRadius,
  iconSizes,
  buttonSizes,
  inputSizes,
  grid,
  container,
  createResponsiveStyle,
};
