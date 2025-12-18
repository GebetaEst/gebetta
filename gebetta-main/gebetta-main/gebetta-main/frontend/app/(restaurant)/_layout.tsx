import restaurantOwnerColors from "@/constants/restaurantOwnerColors";
import { useAuthStore } from "@/store/authStore";
import { Stack } from "expo-router";
import React from "react";

export default function RestaurantLayout() {
  const { userRole } = useAuthStore();
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: restaurantOwnerColors.background,
        },
        headerTintColor: restaurantOwnerColors.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: restaurantOwnerColors.background,
        },
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: userRole === "owner" ? "Owner Dashboard" : "Manager Dashboard",
        }}
      />
      <Stack.Screen
        name="menu"
        options={{
          title: "Menu Management",
        }}
      />
      <Stack.Screen
        name="recipes"
        options={{
          title: "Recipe Management",
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          title: "Orders",
        }}
      />
      <Stack.Screen
        name="customers"
        options={{
          title: "Customers",
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          title: "Analytics",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Restaurant Settings",
        }}
      />
    </Stack>
  );
}
