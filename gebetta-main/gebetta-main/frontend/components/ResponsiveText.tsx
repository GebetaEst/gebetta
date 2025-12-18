import React, { ReactNode } from "react";
import {
  Text as RNText,
  StyleSheet,
  TextStyle,
  TextProps as RNTextProps,
} from "react-native";
import { normalizeFontSize, isTablet, isSmallPhone } from "@/utils/responsive";

// Define text variants
type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "button"
  | "caption"
  | "overline"
  | "custom";

// Define text sizes
type TextSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | number;

// Define text weights
type TextWeight =
  | "thin"
  | "light"
  | "regular"
  | "medium"
  | "semiBold"
  | "bold"
  | "extraBold"
  | "black"
  | "normal";

// Define text colors
type TextColor =
  | "primary"
  | "secondary"
  | "textPrimary"
  | "textSecondary"
  | "error"
  | "success"
  | "warning"
  | "info"
  | "light"
  | "dark"
  | "white"
  | "black"
  | string;

// Extend TextProps with our custom props
interface ResponsiveTextProps extends RNTextProps {
  children: ReactNode;
  variant?: TextVariant;
  size?: TextSize;
  color?: TextColor;
  align?: "left" | "center" | "right" | "justify" | "auto";
  weight?: TextWeight;
  style?: TextStyle;
  numberOfLines?: number;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
  allowFontScaling?: boolean;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
  maxFontSizeMultiplier?: number;
}

const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = "body1",
  size = "md",
  color = "textPrimary",
  align = "left",
  weight = "normal",
  style,
  numberOfLines,
  ellipsizeMode,
  allowFontScaling = true,
  adjustsFontSizeToFit,
  minimumFontScale = 0.8,
  maxFontSizeMultiplier,
  ...rest
}) => {
  // Get base font size based on variant and size
  const getFontSize = (): number => {
    if (typeof size === "number") return size;

    const sizeMap: Record<string, number> = {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      "2xl": 20,
      "3xl": 24,
      "4xl": 30,
      "5xl": 36,
      "6xl": 48,
    };

    return sizeMap[size] || 14;
  };

  // Get font family based on weight
  const getFontFamily = (): string => {
    // This is a simplified example - adjust based on your font setup
    if (weight === "bold") return "System";
    return "System";
  };

  // Create base text style
  const baseStyle: TextStyle = {
    fontSize: normalizeFontSize(getFontSize()),
    textAlign: align,
    color: color.startsWith("#") || color.startsWith("rgb") ? color : undefined,
    fontWeight: 600,
  };

  // Apply variant styles
  const variantStyles: Record<TextVariant, TextStyle> = {
    h1: {
      fontSize: normalizeFontSize(32),
      fontWeight: "300",
      letterSpacing: -1.5,
    },
    h2: {
      fontSize: normalizeFontSize(28),
      fontWeight: "300",
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: normalizeFontSize(24),
      fontWeight: "400",
      letterSpacing: 0,
    },
    h4: {
      fontSize: normalizeFontSize(20),
      fontWeight: "400",
      letterSpacing: 0.25,
    },
    h5: {
      fontSize: normalizeFontSize(18),
      fontWeight: "400",
      letterSpacing: 0,
    },
    h6: {
      fontSize: normalizeFontSize(16),
      fontWeight: "500",
      letterSpacing: 0.15,
    },
    subtitle1: {
      fontSize: normalizeFontSize(16),
      fontWeight: "400",
      letterSpacing: 0.15,
    },
    subtitle2: {
      fontSize: normalizeFontSize(14),
      fontWeight: "500",
      letterSpacing: 0.1,
    },
    body1: {
      fontSize: normalizeFontSize(16),
      fontWeight: "400",
      letterSpacing: 0.5,
    },
    body2: {
      fontSize: normalizeFontSize(14),
      fontWeight: "400",
      letterSpacing: 0.25,
    },
    button: {
      fontSize: normalizeFontSize(14),
      fontWeight: "500",
      letterSpacing: 0.75,
      textTransform: "uppercase",
    },
    caption: {
      fontSize: normalizeFontSize(12),
      fontWeight: "400",
      letterSpacing: 0.4,
    },
    overline: {
      fontSize: normalizeFontSize(10),
      fontWeight: "400",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    custom: {},
  };

  // Merge styles with priority: style prop > variant > base
  const textStyle = StyleSheet.flatten(
    [baseStyle, variant !== "custom" && variantStyles[variant], style].filter(
      Boolean
    ) as TextStyle[]
  );

  // Adjust font size for small phones
  if (isSmallPhone() && textStyle.fontSize) {
    textStyle.fontSize = textStyle.fontSize * 0.9;
  }

  // Adjust font size for tablets
  if (isTablet() && textStyle.fontSize) {
    textStyle.fontSize = textStyle.fontSize * 1.1;
  }

  return (
    <RNText
      style={textStyle}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      allowFontScaling={allowFontScaling}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...rest}
    >
      {children}
    </RNText>
  );
};

export default ResponsiveText;
