import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { View, ActivityIndicator, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Context providers
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { SettingsProvider } from "./src/context/SettingsContext";

// Import screens
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import SalesScreen from "./src/screens/SalesScreen";
import CustomersListScreen from "./src/screens/CustomersListScreen";
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
  const { isDarkMode, colors } = useTheme();

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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDarkMode ? "#888" : "gray",
        tabBarStyle: {
          backgroundColor: isDarkMode ? colors.surface : "#fff",
          borderTopColor: isDarkMode ? "#333" : "#e0e0e0",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Dashboard",
          tabBarAccessibilityLabel: "Dashboard tab, overzicht van productie en statistieken",
        }}
      />
      <Tab.Screen
        name="Sales"
        component={SalesScreen}
        options={{
          title: "Verkoop",
          tabBarAccessibilityLabel: "Verkoop tab, beheer orders en verkopen",
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomersListScreen}
        options={{
          title: "Klanten",
          tabBarAccessibilityLabel: "Klanten tab, bekijk en beheer klantenlijst",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profiel",
          tabBarAccessibilityLabel: "Profiel tab, accountinstellingen en uitloggen",
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { theme, isDarkMode, colors } = useTheme();
  const isAuthenticatedRef = React.useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Ensure proper root height on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        html, body, #root {
          height: 100%;
          width: 100%;
          overflow: hidden; /* Let React Native manage scrolling */
        }
      `;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
    }
  }, []);

  const checkAuthentication = React.useCallback(async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      const newAuthState = !!user;

      // Use ref to get current value, avoiding stale closure
      if (newAuthState !== isAuthenticatedRef.current) {
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
  }, [isLoading]);

  useEffect(() => {
    checkAuthentication();

    // Add listener for auth changes
    const interval = setInterval(checkAuthentication, 500); // Check more frequently
    return () => clearInterval(interval);
  }, [checkAuthentication]);

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: isDarkMode ? colors.background : "#fff",
        height: Platform.OS === 'web' ? '100vh' : '100%',
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <View style={{ flex: 1 }}>
        <NavigationContainer
          theme={{
            dark: isDarkMode,
            colors: {
              primary: colors.primary,
              background: colors.background,
              card: colors.surface,
              text: colors.onSurface,
              border: isDarkMode ? '#333' : '#e0e0e0',
              notification: colors.error,
            },
          }}
        >
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: 'transparent', flex: 1, height: '100%' },
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
      </View>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
