import { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import { ComponentType } from 'react';

interface ImageProps {
  source: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  transition?: number;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: Error) => void;
}

declare module 'expo-image' {
  const Image: ComponentType<ImageProps>;
  export default Image;
}
