import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { TextInput, Card } from "react-native-paper";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import authService from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen({ navigation }) {
  const { isDarkMode, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Fout", "Vul gebruikersnaam en wachtwoord in");
      return;
    }

    setLoading(true);

    try {
      const userData = await authService.login(username, password);

      // Login successful - App.js will handle navigation via auth state change
      // Just show success message
      Alert.alert("Welkom!", `Succesvol ingelogd als ${userData.username}`);

      // Force a re-render by clearing and re-checking auth
      // The App.js useEffect will pick this up and navigate to MainTabs
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Fout", error.message || "Inloggen mislukt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Icon name="egg" size={60} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.primary }]}>EggSense</Text>
          <Text style={[styles.tagline, { color: colors.onSurfaceVariant }]}>Professioneel Kippenstal Beheer</Text>
        </View>

        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Text style={[styles.welcomeText, { color: colors.onSurface }]}>Welkom terug!</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Log in om door te gaan</Text>

            <TextInput
              label="Gebruikersnaam"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={[styles.input, { backgroundColor: colors.surface }]}
              mode="outlined"
              theme={{ colors: { primary: colors.primary, text: colors.onSurface } }}
              left={<TextInput.Icon icon="account" color={colors.onSurfaceVariant} />}
              accessibilityLabel="Gebruikersnaam invoerveld"
              accessibilityHint="Voer hier uw gebruikersnaam in"
            />

            <TextInput
              label="Wachtwoord"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={[styles.input, { backgroundColor: colors.surface }]}
              mode="outlined"
              theme={{ colors: { primary: colors.primary, text: colors.onSurface } }}
              left={<TextInput.Icon icon="lock" color={colors.onSurfaceVariant} />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  color={colors.onSurfaceVariant}
                  accessibilityLabel={showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
                />
              }
              accessibilityLabel="Wachtwoord invoerveld"
              accessibilityHint="Voer hier uw wachtwoord in"
            />

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[styles.loginButton, { backgroundColor: colors.primary }, loading && styles.loginButtonDisabled]}
              activeOpacity={0.8}
              accessible={true}
              accessibilityLabel={loading ? "Bezig met inloggen" : "Inloggen knop"}
              accessibilityHint="Dubbelklik om in te loggen met de ingevoerde gegevens"
              accessibilityRole="button"
              accessibilityState={{ disabled: loading }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Inloggen</Text>
              )}
            </TouchableOpacity>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text
            style={[styles.footerText, { color: colors.onSurfaceVariant }]}
            accessibilityRole="text"
          >
            Nog geen account? Neem contact op met je beheerder
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    pointerEvents: "auto",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    pointerEvents: "auto",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#666",
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  loginButton: {
    marginTop: 8,
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
