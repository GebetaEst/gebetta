import colors from "@/constants/colors";
import { Tabs } from "expo-router";
import { Home, Search, UtensilsCrossed, UserCircle } from 'lucide-react-native';
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
          },
          tabBarItemStyle: {
            paddingVertical: 5,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "400",
          },
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
            tabBarIcon: ({ color, focused }) => <UtensilsCrossed size={focused ? 28 : 24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => <UserCircle size={focused ? 28 : 24} color={color} />,
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
    height: Platform.OS === "ios" ? 90 : 70,
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
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