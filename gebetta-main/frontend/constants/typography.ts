import { Platform, StyleSheet } from "react-native";
import colors from "./colors";

// Define font families based on platform
const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    semiBold: 'sans-serif-medium',
    bold: 'sans-serif-bold',
  },
  default: {
    regular: 'Arial',
    medium: 'Arial',
    semiBold: 'Arial',
    bold: 'Arial',
  },
});

// Define the type for our typography object
interface TypographyStyle {
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginHorizontal?: number;
  marginVertical?: number;
}

interface Typography {
  regular: TypographyStyle;
  medium: TypographyStyle;
  semiBold: TypographyStyle;
  bold: TypographyStyle;
  heading1: TypographyStyle;
  heading2: TypographyStyle;
  heading3: TypographyStyle;
  heading4: TypographyStyle;
  body: TypographyStyle;
  bodyLarge: TypographyStyle;
  bodySmall: TypographyStyle;
  bodyXSmall: TypographyStyle;
  caption: TypographyStyle;
  button: TypographyStyle;
  buttonSmall: TypographyStyle;
  [key: string]: TypographyStyle; // For any additional styles
}

const typography: Typography = {
  // Base Font Weights
  regular: {
    fontFamily: fontFamily?.regular,
    fontWeight: '400',
  },
  medium: {
    fontFamily: fontFamily?.medium,
    fontWeight: '500',
  },
  semiBold: {
    fontFamily: fontFamily?.semiBold,
    fontWeight: '600',
  },
  bold: {
    fontFamily: fontFamily?.bold,
    fontWeight: '700',
  },

  // Text Styles
  h1: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: fontFamily?.bold,
  },
  heading1: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: fontFamily?.bold,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: fontFamily?.bold,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: fontFamily?.semiBold,
  },
  heading4: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: fontFamily?.semiBold,
  },
  
  // Body Text
  body: {
    fontSize: 16,
    fontFamily: fontFamily?.regular,
    fontWeight: '400',
  },
  bodyLarge: {
    fontSize: 18,
    fontFamily: fontFamily?.regular,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 14,
    fontFamily: fontFamily?.regular,
    fontWeight: '400',
  },
  // Caption text (smaller than body)
  caption: {
    fontSize: 12,
    fontFamily: fontFamily?.regular,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.gray,
  },
  
  bodyXSmall: {
    fontSize: 12,
    fontFamily: fontFamily?.regular,
    fontWeight: '400',
  },
  
  // Buttons
  button: {
    fontSize: 16,
    fontFamily: fontFamily?.medium,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonSmall: {
    fontSize: 14,
    fontFamily: fontFamily?.medium,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    // color: colors.white,
  },
  link: {
    fontSize: 16,
    fontWeight: "400",
    // color: colors.primary,
    textDecorationLine: "underline",
  },
  linkSmall: {
    fontSize: 14,
    fontWeight: "400",
    // color: colors.primary,
    textDecorationLine: "underline",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.lightText,
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamily?.medium,
    fontWeight: '500',
    marginBottom: 4,
  },
  error: {
    fontSize: 12,
    fontFamily: fontFamily?.regular,
    color: colors.error,
    marginTop: 4
  }
};

// Helper function to combine multiple text styles
export const combineStyles = (...styles: any[]) => {
  return StyleSheet.flatten(styles);
};

export default typography;
