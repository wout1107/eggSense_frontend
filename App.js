import React, { useState, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Provider as PaperProvider,
  MD3LightTheme, // Import MD3LightTheme explicitly instead of DefaultTheme
  // ...existing code...
} from "react-native-paper";

import {
  TouchableOpacity,
  Platform,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from "react-native";
import { authService } from "./src/services/authService";
import { setToken, removeToken } from "./src/services/api";
import * as Linking from "expo-linking";

// Import screens
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import DailyInputScreen from "./src/screens/DailyInputScreen";
import SalesScreen from "./src/screens/SalesScreen";
import OrderDetailScreen from "./src/screens/OrderDetailScreen";
import CustomerDetailScreen from "./src/screens/CustomerDetailScreen";
import ReportsScreen from "./src/screens/ReportsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import FeedDeliveryScreen from "./src/screens/FeedDeliveryScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Theme configuration
const theme = {
  ...MD3LightTheme, // Extend MD3LightTheme
  colors: {
    ...MD3LightTheme.colors, // CRITICAL: Preserves 'elevation' object required for Dialogs
    primary: "#2E7D32",
    secondary: "#FF9800",
    tertiary: "#FF9800", // MD3 often requires tertiary
    background: "#f5f5f5",
    surface: "#ffffff",
    error: "#B00020",
    onPrimary: "#ffffff",
    onSecondary: "#000000",
    onSurface: "#000000",
  },
};

// Web URL configuration
const prefix = Linking.createURL("/");
const linking = {
  prefixes: [prefix],
  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: "welcome",
          Login: "login",
        },
      },
      Main: {
        screens: {
          Dashboard: "dashboard",
          Sales: "sales",
          DailyInput: "daily",
          Reports: "reports",
          Settings: "settings",
        },
      },
    },
  },
};

// Create Sales Stack Navigator
function SalesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2E7D32",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="SalesList"
        component={SalesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: "Order Details" }}
      />
      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{ title: "Klant Details" }}
      />
    </Stack.Navigator>
  );
}

// Main Bottom Tab Navigator
function MainTabs({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = "home";
          } else if (route.name === "Input") {
            iconName = "plus-circle";
          } else if (route.name === "Sales") {
            iconName = "cash-multiple";
          } else if (route.name === "Feed") {
            iconName = "food-apple";
          } else if (route.name === "Reports") {
            iconName = "chart-bar";
          } else if (route.name === "Profile") {
            iconName = "account";
          } else if (route.name === "Settings") {
            iconName = "cog";
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Overzicht",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Input"
        component={DailyInputScreen}
        options={{
          title: "Invoer",
          headerShown: true,
          headerStyle: { backgroundColor: "#2E7D32" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <Tab.Screen
        name="Sales"
        component={SalesStack}
        options={{
          title: "Verkoop",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedDeliveryScreen}
        options={{
          title: "Voer",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: "Rapporten",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        children={() => <ProfileScreen onLogout={onLogout} />}
        options={{
          title: "Profiel",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Instellingen",
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// Authentication Navigation
function AuthNavigator({ onLogin, onRegister }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome">
        {(props) => (
          <WelcomeScreen
            {...props}
            onContinue={() => props.navigation.navigate("Login")}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Login">
        {(props) => (
          <LoginScreen {...props} onLogin={onLogin} onRegister={onRegister} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // Check if we have a token stored
      // This is a simplified check. Ideally, validate token with backend.
      // For now, we rely on the token presence.
      // const token = await getToken(); // You'd need to export getToken from api.js or use a hook
      // if (token) {
      //   setIsLoggedIn(true);
      //   setShowWelcome(false);
      // }
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const handleContinueFromWelcome = () => {
    setShowWelcome(false);
  };

  const handleBackToWelcome = () => {
    setShowWelcome(true);
  };

  const handleLogin = async (username, password) => {
    try {
      await authService.login(username, password);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login failed", error);
      throw error; // Let LoginScreen handle the error display
    }
  };

  // Add this function
  const handleRegister = async (username, email, password) => {
    try {
      await authService.register(username, email, password);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setShowWelcome(true);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <View style={styles.container}>
          <NavigationContainer
            linking={linking}
            fallback={<Text>Loading...</Text>}
          >
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {!isLoggedIn ? (
                <Stack.Screen name="Auth">
                  {() => (
                    <AuthNavigator
                      onLogin={handleLogin}
                      onRegister={handleRegister}
                    />
                  )}
                </Stack.Screen>
              ) : (
                <Stack.Screen name="Main" component={MainTabs} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    // Critical fix for Web: ensures the app fills the browser window
    ...Platform.select({
      web: {
        height: "100vh",
        overflow: "hidden",
      },
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
