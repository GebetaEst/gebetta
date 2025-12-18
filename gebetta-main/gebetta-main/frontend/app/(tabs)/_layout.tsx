import colors from "@/constants/colors";
import { Tabs } from "expo-router";
import { Home, Search } from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function TabsLayout() {

  return (
    <>
      <StatusBar backgroundColor="#333" style="light" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.lightText,
          tabBarStyle: {
            backgroundColor: 'rgba(255, 255, 255, 0.99)',
            height: Platform.OS === 'ios' ? 65 : 60,
            paddingBottom: Platform.OS === 'ios' ? 8 : 6,
            paddingTop: 4,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            marginTop: 2,
            marginBottom: 2,
            includeFontPadding: false,
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
          tabBarLabelPosition: 'below-icon',
          headerShown: false, // This will hide all headers by default
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
          headerShadowVisible: false,
          headerRight: undefined,
          headerRightContainerStyle: {
            paddingRight: 16,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => <Home size={focused ? 28 : 24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color, focused }) => <Search size={focused ? 28 : 24} color={color} />,
          }}
        />
      <Tabs.Screen
          name="restaurants"
          options={{
            title: "Restaurants",
            tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name="silverware-fork-knife" size={focused ? 28 : 24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => <FontAwesome name="user-circle" size={focused ? 28 : 24} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  // Tab bar styles
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    height: Platform.OS === "ios" ? 85 : 70,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  header: {
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontWeight: "600",
    fontSize: 18,
  },
});