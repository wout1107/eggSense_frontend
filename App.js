import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { View, ActivityIndicator } from "react-native";

// Import screens
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import SalesScreen from "./src/screens/SalesScreen";
import CustomersScreen from "./src/screens/CustomerDetailScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import DailyInputScreen from "./src/screens/DailyInputScreen";
import ReportScreen from "./src/screens/ReportsScreen";
import FeedDeliveryScreen from "./src/screens/FeedDeliveryScreen";
import CustomerDetailScreen from "./src/screens/CustomerDetailScreen";
import OrderDetailScreen from "./src/screens/OrderDetailScreen";

import authService from "./src/services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused ? "view-dashboard" : "view-dashboard-outline";
          } else if (route.name === "Sales") {
            iconName = focused ? "cart" : "cart-outline";
          } else if (route.name === "Customers") {
            iconName = focused ? "account-group" : "account-group-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "account" : "account-outline";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <Tab.Screen
        name="Sales"
        component={SalesScreen}
        options={{ title: "Verkoop" }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomersScreen}
        options={{ title: "Klanten" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profiel" }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();

    // Add listener for auth changes
    const interval = setInterval(checkAuthentication, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkAuthentication = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      const newAuthState = !!user;

      if (newAuthState !== isAuthenticated) {
        setIsAuthenticated(newAuthState);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {!isAuthenticated ? (
            // Auth Stack
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
            </>
          ) : (
            // Main App Stack
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="DailyInput" component={DailyInputScreen} />
              <Stack.Screen name="Reports" component={ReportScreen} />
              <Stack.Screen
                name="FeedDelivery"
                component={FeedDeliveryScreen}
              />
              <Stack.Screen
                name="CustomerDetail"
                component={CustomerDetailScreen}
              />
              <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
