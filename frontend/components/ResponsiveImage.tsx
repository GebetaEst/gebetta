import React from "react";
import {
  Animated,
  Image as RNImage,
  ImageProps as RNImageProps,
  StyleSheet,
  View,
  ImageStyle,
  ViewStyle,
  Platform,
  DimensionValue,
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  isTablet,
  isSmallPhone,
} from "@/utils/responsive";

interface ResponsiveImageProps
  extends Omit<RNImageProps, "style" | "source" | "width" | "height"> {
  source: any; // Can be require() or { uri: string }
  width?: DimensionValue;
  height?: DimensionValue;
  aspectRatio?: number;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
  style?: ImageStyle | ImageStyle[];
  containerStyle?: ViewStyle | ViewStyle[];
  round?: boolean | number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: boolean;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowRadius?: number;
  shadowOffset?: { width: number; height: number };
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  onLayout?: (event: any) => void;
  loadingIndicatorSource?: any;
  loadingIndicatorStyle?: ImageStyle | ImageStyle[];
  fadeDuration?: number;
  progressiveRenderingEnabled?: boolean;
  blurRadius?: number;
  fallback?: boolean;
  defaultSource?: any;
  loadingIndicator?: React.ReactNode;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  source,
  width,
  height,
  aspectRatio,
  resizeMode = "cover",
  style,
  containerStyle,
  round = false,
  borderWidth = 0,
  borderColor = "transparent",
  shadow = false,
  shadowColor = "#000",
  shadowOpacity = 0.3,
  shadowRadius = 5,
  shadowOffset = { width: 0, height: 2 },
  testID,
  accessibilityLabel,
  accessibilityHint,
  onLoadStart,
  onLoadEnd,
  onError,
  onLayout,
  loadingIndicatorSource,
  loadingIndicatorStyle,
  fadeDuration = 300,
  progressiveRenderingEnabled = true,
  blurRadius = 0,
  fallback = false,
  defaultSource,
  loadingIndicator,
  ...rest
}) => {
  // Calculate responsive dimensions
  const getDimensions = () => {
    const dimensions: {
      width?: DimensionValue;
      height?: DimensionValue;
    } = {};

    // Helper function to safely get responsive dimension
    const getResponsiveDimension = (
      value: DimensionValue,
      isHeight = false
    ): DimensionValue => {
      if (typeof value === "number") {
        return isHeight ? responsiveHeight(value) : responsiveWidth(value);
      }
      // Return as is for strings, Animated values, etc.
      return value;
    };

    if (width) {
      dimensions.width = getResponsiveDimension(width, false);
    }

    if (height) {
      dimensions.height = getResponsiveDimension(height, true);
    }

    // If aspectRatio is provided, calculate height based on width or vice versa
    if (aspectRatio) {
      if (dimensions.width && !dimensions.height) {
        dimensions.height = Number(dimensions.width) / aspectRatio;
      } else if (dimensions.height && !dimensions.width) {
        dimensions.width = Number(dimensions.height) * aspectRatio;
      }
    }

    // Adjust dimensions for small phones - only if we have number values
    if (isSmallPhone()) {
      if (typeof dimensions.width === "number") {
        dimensions.width = dimensions.width * 0.9;
      }
      if (typeof dimensions.height === "number") {
        dimensions.height = dimensions.height * 0.9;
      }
    }

    // Adjust dimensions for tablets - only if we have number values
    if (isTablet()) {
      if (typeof dimensions.width === "number") {
        dimensions.width = dimensions.width * 1.1;
      }
      if (typeof dimensions.height === "number") {
        dimensions.height = dimensions.height * 1.1;
      }
    }

    return dimensions;
  };

  const dimensions = getDimensions();
  const borderRadius =
    round === true ? 9999 : typeof round === "number" ? round : 0;

  // Combine styles
  const imageStyle = StyleSheet.flatten([
    styles.image,
    dimensions,
    { resizeMode },
    { borderRadius },
    { borderWidth, borderColor },
    shadow &&
      Platform.select({
        ios: {
          shadowColor,
          shadowOpacity,
          shadowRadius,
          shadowOffset,
        },
        android: {
          elevation: shadow ? 5 : 0,
        },
      }),
    style,
  ]);

  // Combine container styles
  const combinedContainerStyle = StyleSheet.flatten([
    styles.container,
    containerStyle,
  ]);

  return (
    <View style={combinedContainerStyle} testID={testID} onLayout={onLayout}>
      <RNImage
        source={source}
        style={imageStyle}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        onError={onError}
        fadeDuration={fadeDuration}
        progressiveRenderingEnabled={progressiveRenderingEnabled}
        blurRadius={blurRadius}
        defaultSource={defaultSource}
        {...rest}
      />
      {loadingIndicator && (
        <View style={[styles.loadingContainer, dimensions]}>
          {loadingIndicator}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
});

export default ResponsiveImage;
