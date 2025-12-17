import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { Card, Button, List, Avatar, Divider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import authService from "../services/authService";
import { useTheme } from "../context/ThemeContext";

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors } = useTheme();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Uitloggen", "Weet je zeker dat je wilt uitloggen?", [
      { text: "Annuleren", style: "cancel" },
      {
        text: "Uitloggen",
        style: "destructive",
        onPress: async () => {
          try {
            await authService.logout();
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            navigation.reset({
              index: 0,
              routes: [{ name: "Welcome" }],
            });
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert("Fout", "Kon niet uitloggen");
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: isDarkMode ? '#333' : '#e0e0e0', paddingTop: insets.top }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Profiel</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <Card style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Icon
              size={80}
              icon="account"
              style={styles.avatar}
              color="#fff"
            />
            <Text style={[styles.userName, { color: colors.onSurface }]}>{user?.username || "Gebruiker"}</Text>
            <Text style={[styles.userRole, { color: colors.onSurfaceVariant }]}>
              {user?.role || "Gebruiker"} Account
            </Text>
          </Card.Content>
        </Card>

        {/* Account Information */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title="Account Informatie"
            titleStyle={{ color: colors.onSurface }}
            left={(props) => (
              <Icon {...props} name="account-details" size={24} color={colors.onSurfaceVariant} />
            )}
          />
          <Card.Content>
            <List.Item
              title="Gebruikersnaam"
              description={user?.username || "Niet beschikbaar"}
              titleStyle={{ color: colors.onSurface }}
              descriptionStyle={{ color: colors.onSurfaceVariant }}
              left={(props) => <List.Icon {...props} icon="account" color={colors.onSurfaceVariant} />}
            />
            <Divider style={{ backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }} />
            <List.Item
              title="Rol"
              description={user?.role || "Gebruiker"}
              titleStyle={{ color: colors.onSurface }}
              descriptionStyle={{ color: colors.onSurfaceVariant }}
              left={(props) => <List.Icon {...props} icon="shield-account" color={colors.onSurfaceVariant} />}
            />
          </Card.Content>
        </Card>

        {/* Settings & Management */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title="Beheer"
            titleStyle={{ color: colors.onSurface }}
            left={(props) => <Icon {...props} name="cog" size={24} color={colors.onSurfaceVariant} />}
          />
          <Card.Content>
            <List.Item
              title="Instellingen"
              description="Stallen, app en account instellingen"
              titleStyle={{ color: colors.onSurface }}
              descriptionStyle={{ color: colors.onSurfaceVariant }}
              left={(props) => <List.Icon {...props} icon="cog-outline" color={colors.onSurfaceVariant} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.onSurfaceVariant} />}
              onPress={() => navigation.navigate("Settings")}
            />
            <Divider style={{ backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }} />
            <List.Item
              title="Over EggSense"
              description="Versie en app informatie"
              titleStyle={{ color: colors.onSurface }}
              descriptionStyle={{ color: colors.onSurfaceVariant }}
              left={(props) => (
                <List.Icon {...props} icon="information-outline" color={colors.onSurfaceVariant} />
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.onSurfaceVariant} />}
              onPress={() =>
                Alert.alert(
                  "Over EggSense",
                  "EggSense v1.0.0\n\nProfessioneel kippenstal management systeem.\n\n© 2024 EggSense Solutions"
                )
              }
            />
            <Divider style={{ backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }} />
            <List.Item
              title="Privacy Beleid"
              description="Gegevensbescherming en privacy"
              titleStyle={{ color: colors.onSurface }}
              descriptionStyle={{ color: colors.onSurfaceVariant }}
              left={(props) => <List.Icon {...props} icon="shield-lock" color={colors.onSurfaceVariant} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.onSurfaceVariant} />}
              onPress={() =>
                Alert.alert(
                  "Privacy Beleid",
                  "Uw gegevens worden veilig opgeslagen en nooit gedeeld met derden."
                )
              }
            />
            <Divider style={{ backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }} />
            <List.Item
              title="Hulp & Support"
              description="Contact opnemen met support"
              titleStyle={{ color: colors.onSurface }}
              descriptionStyle={{ color: colors.onSurfaceVariant }}
              left={(props) => <List.Icon {...props} icon="help-circle" color={colors.onSurfaceVariant} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.onSurfaceVariant} />}
              onPress={() =>
                Alert.alert(
                  "Support",
                  "Voor vragen of problemen:\n\nEmail: support@eggsense.com\nTelefoon: +32 123 45 67 89"
                )
              }
            />
          </Card.Content>
        </Card>

        {/* App Information */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title="Applicatie"
            titleStyle={{ color: colors.onSurface }}
            left={(props) => <Icon {...props} name="information" size={24} color={colors.onSurfaceVariant} />}
          />
          <Card.Content>
            <List.Item
              title="Versie"
              description="1.0.0"
              titleStyle={{ color: colors.onSurface }}
              descriptionStyle={{ color: colors.onSurfaceVariant }}
              left={(props) => <List.Icon {...props} icon="tag" color={colors.onSurfaceVariant} />}
            />
            <Divider style={{ backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }} />
            <List.Item
              title="Laatste update"
              description="December 2024"
              titleStyle={{ color: colors.onSurface }}
              descriptionStyle={{ color: colors.onSurfaceVariant }}
              left={(props) => <List.Icon {...props} icon="update" color={colors.onSurfaceVariant} />}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#F44336"
          icon="logout"
        >
          Uitloggen
        </Button>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.primary }]}>EggSense v1.0.0</Text>
          <Text style={[styles.footerSubtext, { color: colors.onSurfaceVariant }]}>© 2024 EggSense Solutions</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  content: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  profileContent: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatar: {
    backgroundColor: "#2E7D32",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: "#666",
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 8,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingBottom: 48,
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
  },
});
