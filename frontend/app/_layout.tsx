import { useAuthStore } from "@/store/useAuthStore";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import colors from "@/constants/colors";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, isLoading, initializeAuth, user } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);
  const router = useRouter();

  // Debug log auth state changes
  useEffect(() => {
    console.log('RootLayout auth state changed:', {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      isInitialized
    });
  }, [isAuthenticated, isLoading, user, isInitialized]);

  // Initialize auth
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize auth
        console.log('RootLayout: Initializing auth...');
        await initializeAuth();
        console.log('RootLayout: Auth initialization complete');
      } catch (error) {
        console.error('RootLayout: Error during initialization:', error);
      } finally {
        // Tell the application to render
        setIsInitialized(true);
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [initializeAuth]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  // Show loading indicator while initializing
  if (!isInitialized || isLoading) {
    return (
      <View 
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}
        onLayout={onLayoutRootView}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(restaurant)" options={{ headerShown: false }} />
      <Stack.Screen name="restaurant/[id]" options={{ headerShown: false, title: "Restaurant" }} />
      <Stack.Screen name="menu-item/[restaurantId]/[itemId]" options={{ headerShown: false, title: "Menu Item" }} />
      <Stack.Screen name="checkout" options={{ headerShown: false, title: "Checkout" }} />
      <Stack.Screen name="order/[id]" options={{ headerShown: false, title: "Order Details" }} />
      <Stack.Screen name="delivery-tracking/[id]" options={{ headerShown: false, title: "Delivery Tracking" }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: false, title: "Edit Profile" }} />
      <Stack.Screen name="profile/addresses/index" options={{ headerShown: false, title: "My Addresses" }} />
      <Stack.Screen name="profile/addresses/add/index" options={{ headerShown: false, title: "Add Address" }} />
      <Stack.Screen name="profile/addresses/edit/[id]" options={{ headerShown: false, title: "Edit Address" }} />
      <Stack.Screen name="profile/payment/index" options={{ headerShown: false, title: "Payment Methods" }} />
              <Stack.Screen name="profile/orders" options={{ headerShown: false, title: "My Orders" }} />
        <Stack.Screen name="recipe/[id]" options={{ headerShown: false, title: "Recipe Details" }} />
        <Stack.Screen name="settings" options={{ headerShown: false, title: "Settings" }} />
        <Stack.Screen name="pin-setup" options={{ headerShown: false, title: "PIN Setup" }} />
        <Stack.Screen name="change-pin" options={{ headerShown: false, title: "Change PIN" }} />
        <Stack.Screen name="help-center" options={{ headerShown: false, title: "Help Center" }} />
        <Stack.Screen name="cart" options={{ headerShown: false, title: "Cart" }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
