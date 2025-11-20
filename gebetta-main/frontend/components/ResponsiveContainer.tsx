import React, { ReactNode } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  useWindowDimensions, 
  StyleProp, 
  ViewStyle,
  ScrollViewProps
} from 'react-native';
import { responsiveWidth, responsiveHeight, screen } from '@/utils/responsive';

interface ResponsiveContainerProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  safeArea?: boolean;
  padding?: number | { horizontal?: number; vertical?: number; top?: number; bottom?: number; left?: number; right?: number };
  margin?: number | { horizontal?: number; vertical?: number; top?: number; bottom?: number; left?: number; right?: number };
  backgroundColor?: string;
  fullWidth?: boolean;
  fullHeight?: boolean;
  centerContent?: boolean;
  maxWidth?: number;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  scrollable = false,
  safeArea = true,
  padding = 0,
  margin = 0,
  backgroundColor,
  fullWidth = false,
  fullHeight = false,
  centerContent = false,
  maxWidth,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  
  // Handle padding
  const getPadding = (): ViewStyle => {
    if (typeof padding === 'number') {
      return {
        padding: responsiveWidth(padding),
      };
    }
    return {
      paddingTop: padding.top !== undefined ? responsiveWidth(padding.top) : padding.vertical !== undefined ? responsiveWidth(padding.vertical) : 0,
      paddingBottom: padding.bottom !== undefined ? responsiveWidth(padding.bottom) : padding.vertical !== undefined ? responsiveWidth(padding.vertical) : 0,
      paddingLeft: padding.left !== undefined ? responsiveWidth(padding.left) : padding.horizontal !== undefined ? responsiveWidth(padding.horizontal) : 0,
      paddingRight: padding.right !== undefined ? responsiveWidth(padding.right) : padding.horizontal !== undefined ? responsiveWidth(padding.horizontal) : 0,
    };
  };

  // Handle margin
  const getMargin = (): ViewStyle => {
    if (typeof margin === 'number') {
      return {
        margin: responsiveWidth(margin),
      };
    }
    return {
      marginTop: margin.top !== undefined ? responsiveWidth(margin.top) : margin.vertical !== undefined ? responsiveWidth(margin.vertical) : 0,
      marginBottom: margin.bottom !== undefined ? responsiveWidth(margin.bottom) : margin.vertical !== undefined ? responsiveWidth(margin.vertical) : 0,
      marginLeft: margin.left !== undefined ? responsiveWidth(margin.left) : margin.horizontal !== undefined ? responsiveWidth(margin.horizontal) : 0,
      marginRight: margin.right !== undefined ? responsiveWidth(margin.right) : margin.horizontal !== undefined ? responsiveWidth(margin.horizontal) : 0,
    };
  };

  // Base container styles
  const baseContainerStyle: ViewStyle = {
    ...styles.container,
    ...getPadding(),
    ...getMargin(),
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(fullWidth ? styles.fullWidth : {}),
    ...(fullHeight ? styles.fullHeight : {}),
    ...(centerContent ? styles.centerContent : {}),
    ...(maxWidth ? { maxWidth: responsiveWidth(maxWidth) } : {}),
  };

  // Flatten the base container style
  const containerStyle = StyleSheet.flatten([baseContainerStyle, style]);

  // Render content with proper typing
  const renderContent = () => {
    if (scrollable) {
      const scrollViewStyle: ViewStyle = {
        ...styles.flex1,
        ...(!safeArea ? containerStyle : {})
      };

      const contentContainerStyle: ViewStyle = {
        ...styles.flexGrow1,
        ...(centerContent ? styles.centerContent : {}),
        ...(safeArea ? containerStyle : {})
      };

      return (
        <ScrollView
          style={scrollViewStyle}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }
    return children;
  };

  if (safeArea) {
    return (
      <SafeAreaView style={[styles.flex1, !scrollable && containerStyle]}>
        {renderContent()}
      </SafeAreaView>
    );
  }

  return scrollable ? (
    renderContent()
  ) : (
    <View style={containerStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  flexGrow1: {
    flexGrow: 1,
  },
  fullWidth: {
    width: '100%',
  },
  fullHeight: {
    height: '100%',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ResponsiveContainer;
