import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Divider,
} from "react-native-paper";
import authService from "../services/authService";

export default function LoginScreen({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Test credentials
  const testCredentials = {
    email: "test@eggsense.nl",
    password: "demo123",
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Fout", "Vul alle velden in");
      return;
    }

    setIsLoading(true);

    try {
      // We gebruiken email als username voor de backend
      await authService.login(email, password);

      // Als login slaagt (geen error), roepen we de parent functie aan
      onLogin();
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Inloggen mislukt. Controleer uw gegevens of de serververbinding.";

      Alert.alert("Fout", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail(testCredentials.email);
    setPassword(testCredentials.password);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Wachtwoord Vergeten",
      "Voer uw e-mailadres in om een wachtwoord reset link te ontvangen.",
      [
        {
          text: "Annuleren",
          style: "cancel",
        },
        {
          text: "Verstuur Reset Link",
          onPress: () => {
            if (!email) {
              Alert.alert(
                "E-mail Vereist",
                "Vul eerst uw e-mailadres in het e-mailveld hierboven."
              );
            } else {
              Alert.alert(
                "Reset Link Verstuurd",
                `Een wachtwoord reset link is verstuurd naar ${email}. Controleer uw inbox.`
              );
            }
          },
        },
      ]
    );
  };

  const handleRegister = () => {
    Alert.alert(
      "Account Aanmaken",
      "Wilt u een nieuw EggSense account aanmaken?",
      [
        {
          text: "Annuleren",
          style: "cancel",
        },
        {
          text: "Doorgaan",
          onPress: () => {
            // In a real app, navigate to registration screen
            Alert.alert(
              "Registratie",
              "De registratie pagina wordt binnenkort beschikbaar. Voor nu kunt u de demo gebruiken met:\n\nE-mail: test@eggsense.nl\nWachtwoord: demo123"
            );
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>🥚</Text>
            </View>
            <Title style={styles.appTitle}>EggSense</Title>
            <Paragraph style={styles.tagline}>
              Slim kippenstal management
            </Paragraph>
          </View>
        </View>

        {/* Login Form */}
        <Card style={styles.loginCard}>
          <Card.Content style={styles.cardContent}>
            <Title style={styles.loginTitle}>Welkom terug</Title>
            <Paragraph style={styles.loginSubtitle}>
              Log in om uw dashboard te bekijken
            </Paragraph>

            <TextInput
              label="E-mailadres"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Wachtwoord"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Button
              mode="text"
              onPress={handleForgotPassword}
              style={styles.forgotButton}
              textColor="#2E7D32"
            >
              Wachtwoord vergeten?
            </Button>

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              buttonColor="#2E7D32"
              contentStyle={styles.buttonContent}
            >
              {isLoading ? "Inloggen..." : "Inloggen"}
            </Button>

            <Divider style={styles.divider} />

            {/* Register Section */}
            <View style={styles.registerSection}>
              <Text style={styles.registerText}>Nog geen account?</Text>
              <Button
                mode="outlined"
                onPress={handleRegister}
                style={styles.registerButton}
                textColor="#2E7D32"
              >
                Account Aanmaken
              </Button>
            </View>

            <Divider style={styles.divider} />

            {/* Test Credentials Section */}
            <View style={styles.testSection}>
              <Text style={styles.testTitle}>Demo Toegang</Text>
              <Text style={styles.testInfo}>
                Probeer de app met test credentials:
              </Text>
              <View style={styles.credentialsContainer}>
                <Text style={styles.credentialText}>📧 test@eggsense.nl</Text>
                <Text style={styles.credentialText}>🔑 demo123</Text>
              </View>
              <Button
                mode="outlined"
                onPress={fillTestCredentials}
                style={styles.fillButton}
                textColor="#2E7D32"
                icon="auto-fix"
              >
                Automatisch Invullen
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Help Section */}
        <Card style={styles.helpCard}>
          <Card.Content>
            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>Hulp nodig?</Text>
              <Text style={styles.helpText}>
                • Vergeten wachtwoord? Klik op "Wachtwoord vergeten?" hierboven
              </Text>
              <Text style={styles.helpText}>
                • Geen account? Klik op "Account Aanmaken"
              </Text>
              <Text style={styles.helpText}>
                • Problemen met inloggen? Contact: support@eggsense.nl
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>EggSense v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Ontwikkeld voor moderne pluimveehouders
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  headerSection: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  loginCard: {
    elevation: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardContent: {
    padding: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "white",
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: "#e0e0e0",
  },
  registerSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  registerText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  registerButton: {
    borderColor: "#2E7D32",
    borderRadius: 8,
    width: "100%",
  },
  testSection: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  testTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
    textAlign: "center",
  },
  testInfo: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },
  credentialsContainer: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  credentialText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  fillButton: {
    borderColor: "#2E7D32",
    borderRadius: 6,
  },
  helpCard: {
    elevation: 2,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#fff3e0",
  },
  helpSection: {
    padding: 8,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E65100",
    marginBottom: 12,
    textAlign: "center",
  },
  helpText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "bold",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
