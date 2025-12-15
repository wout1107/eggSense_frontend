import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import {
  Card,
  Title,
  TextInput,
  Button,
  List,
  Divider,
  IconButton,
  Chip,
  Portal,
  Dialog,
  SegmentedButtons,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import stallService from "../services/stallService";
import authService from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";

export default function SettingsScreen({ navigation }) {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { settings, updateSetting } = useSettings();

  const [selectedCategory, setSelectedCategory] = useState("stalls");
  const [loading, setLoading] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editStallDialogVisible, setEditStallDialogVisible] = useState(false);
  const [selectedStall, setSelectedStall] = useState(null);
  const [stallToDelete, setStallToDelete] = useState(null);
  const [user, setUser] = useState(null);

  const [stalls, setStalls] = useState([]);

  const [editedStall, setEditedStall] = useState({
    name: "",
    breed: "",
    capacity: "",
    initialChickenCount: "",
    notes: "",
    active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await loadStalls();
      await loadUserData();
    } catch (error) {
      console.error("Error loading settings data:", error);
      Alert.alert("Fout", "Kon instellingen niet laden");
    } finally {
      setLoading(false);
    }
  };

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

  const loadStalls = async () => {
    try {
      const data = await stallService.listStalls();
      setStalls(data);
    } catch (error) {
      console.error("Error loading stalls:", error);
      Alert.alert("Fout", "Kon stallen niet laden");
    }
  };

  const addNewStall = () => {
    setEditedStall({
      name: "",
      breed: "",
      capacity: "",
      initialChickenCount: "",
      notes: "",
      active: true,
    });
    setSelectedStall(null);
    setEditStallDialogVisible(true);
  };

  const editStall = (stall) => {
    setEditedStall({
      name: stall.name,
      breed: stall.breed || "",
      capacity: stall.capacity.toString(),
      initialChickenCount:
        stall.currentChickenCount?.toString() || stall.capacity.toString(),
      notes: stall.notes || "",
      active: stall.active,
    });
    setSelectedStall(stall);
    setEditStallDialogVisible(true);
  };

  const saveStall = async () => {
    if (!editedStall.name.trim()) {
      Alert.alert("Fout", "Vul een stal naam in");
      return;
    }

    if (!editedStall.capacity || parseInt(editedStall.capacity) <= 0) {
      Alert.alert("Fout", "Vul een geldige capaciteit in");
      return;
    }

    try {
      const stallData = {
        name: editedStall.name,
        breed: editedStall.breed || null,
        capacity: parseInt(editedStall.capacity),
        notes: editedStall.notes,
        active: editedStall.active,
      };

      if (selectedStall) {
        await stallService.updateStall(selectedStall.id, stallData);
        Alert.alert("Succes", "Stal succesvol bijgewerkt");
      } else {
        stallData.initialChickenCount = parseInt(
          editedStall.initialChickenCount || editedStall.capacity
        );
        await stallService.createStall(stallData);
        Alert.alert("Succes", "Stal succesvol aangemaakt");
      }

      setEditStallDialogVisible(false);
      await loadStalls();
    } catch (error) {
      console.error("Error saving stall:", error);
      Alert.alert("Fout", "Kon stal niet opslaan");
    }
  };

  const confirmDeleteStall = (stall) => {
    setStallToDelete(stall);
    setDeleteDialogVisible(true);
  };

  const deleteStall = async () => {
    if (!stallToDelete) return;

    try {
      await stallService.deleteStall(stallToDelete.id);
      setDeleteDialogVisible(false);
      setStallToDelete(null);
      await loadStalls();
      Alert.alert("Succes", "Stal succesvol verwijderd");
    } catch (error) {
      console.error("Error deleting stall:", error);
      Alert.alert("Fout", "Kon stal niet verwijderen");
    }
  };

  const toggleStallActive = async (stall) => {
    try {
      await stallService.updateStall(stall.id, {
        ...stall,
        active: !stall.active,
      });
      await loadStalls();
    } catch (error) {
      console.error("Error toggling stall status:", error);
      Alert.alert("Fout", "Kon stal status niet wijzigen");
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

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#333" : "#e0e0e0",
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
    },
    card: {
      marginBottom: 16,
      elevation: 2,
      backgroundColor: colors.surface,
    },
    cardTitle: {
      color: colors.primary,
      fontSize: 18,
    },
    text: {
      color: colors.onSurface,
    },
    subText: {
      color: isDarkMode ? "#aaa" : "#666",
    },
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.onSurface }]}>Laden...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor={colors.primary}
        />
        <Text style={dynamicStyles.headerTitle}>Instellingen</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Category Selector */}
        <SegmentedButtons
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          buttons={[
            { value: "stalls", label: "Stallen", icon: "barn" },
            { value: "app", label: "App", icon: "cog" },
            { value: "account", label: "Account", icon: "account" },
          ]}
          style={styles.categorySelector}
        />

        {/* Stalls Management */}
        {selectedCategory === "stalls" && (
          <Card style={dynamicStyles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={dynamicStyles.cardTitle}>
                  Stallen ({stalls.length})
                </Title>
                <Button
                  mode="outlined"
                  onPress={addNewStall}
                  compact
                  icon="plus"
                >
                  Toevoegen
                </Button>
              </View>

              {stalls.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, dynamicStyles.subText]}>Geen stallen gevonden</Text>
                  <Text style={[styles.emptySubtext, dynamicStyles.subText]}>
                    Voeg een stal toe om te beginnen
                  </Text>
                </View>
              ) : (
                <>
                  {stalls.map((stall) => (
                    <View key={stall.id} style={styles.stallItem}>
                      <View style={styles.stallHeader}>
                        <View style={styles.stallInfo}>
                          <Text style={[styles.stallName, { color: colors.primary }]}>{stall.name}</Text>
                          <Text style={[styles.stallDetails, dynamicStyles.subText]}>
                            Capaciteit: {stall.capacity} kippen
                          </Text>
                          {stall.notes && (
                            <Text style={[styles.stallNotes, dynamicStyles.subText]}>{stall.notes}</Text>
                          )}
                        </View>
                        <View style={styles.stallActions}>
                          <Text style={[styles.stallStatusLabel, dynamicStyles.subText]}>
                            {stall.active ? "Actief" : "Inactief"}
                          </Text>
                          <Switch
                            value={stall.active}
                            onValueChange={() => toggleStallActive(stall)}
                            thumbColor={stall.active ? colors.primary : "#f4f3f4"}
                          />
                        </View>
                      </View>

                      <View style={styles.stallButtons}>
                        <Button
                          mode="outlined"
                          onPress={() => editStall(stall)}
                          compact
                          icon="pencil"
                          style={styles.stallButton}
                        >
                          Bewerken
                        </Button>
                        <Button
                          mode="outlined"
                          onPress={() => confirmDeleteStall(stall)}
                          compact
                          icon="delete"
                          textColor="#F44336"
                          style={styles.stallButton}
                        >
                          Verwijderen
                        </Button>
                      </View>

                      {!stall.active && (
                        <Chip
                          mode="flat"
                          style={styles.inactiveChip}
                          textStyle={{ fontSize: 11 }}
                        >
                          Inactief
                        </Chip>
                      )}

                      <Divider style={styles.stallDivider} />
                    </View>
                  ))}
                </>
              )}
            </Card.Content>
          </Card>
        )}

        {/* App Settings */}
        {selectedCategory === "app" && (
          <>
            {/* IMPORTANT: Theme & Preferences Card - Exam Requirement */}
            <Card style={dynamicStyles.card}>
              <Card.Content>
                <Title style={dynamicStyles.cardTitle}>Weergave & Voorkeuren</Title>

                {/* Toggle 1: Dark/Light Theme */}
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <List.Icon icon={isDarkMode ? "weather-night" : "weather-sunny"} color={colors.primary} />
                    <View style={styles.settingText}>
                      <Text style={[styles.settingTitle, dynamicStyles.text]}>Donker Thema</Text>
                      <Text style={[styles.settingDescription, dynamicStyles.subText]}>
                        Schakel tussen licht en donker thema
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    thumbColor={isDarkMode ? colors.primary : "#f4f3f4"}
                    trackColor={{ false: "#e0e0e0", true: colors.primaryContainer }}
                  />
                </View>

                <Divider style={styles.settingDivider} />

                {/* Toggle 2: Low Stock Notifications */}
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <List.Icon icon="bell-alert" color={colors.primary} />
                    <View style={styles.settingText}>
                      <Text style={[styles.settingTitle, dynamicStyles.text]}>Voorraad Meldingen</Text>
                      <Text style={[styles.settingDescription, dynamicStyles.subText]}>
                        Ontvang meldingen bij lage voervoorraad
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.lowStockAlerts}
                    onValueChange={(value) => updateSetting('lowStockAlerts', value)}
                    thumbColor={settings.lowStockAlerts ? colors.primary : "#f4f3f4"}
                    trackColor={{ false: "#e0e0e0", true: colors.primaryContainer }}
                  />
                </View>

                <Divider style={styles.settingDivider} />

                {/* Toggle 3: Data Saver Mode (WiFi Only Images) */}
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <List.Icon icon="wifi" color={colors.primary} />
                    <View style={styles.settingText}>
                      <Text style={[styles.settingTitle, dynamicStyles.text]}>Databesparing</Text>
                      <Text style={[styles.settingDescription, dynamicStyles.subText]}>
                        Afbeeldingen alleen via WiFi laden
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.wifiOnlyImages}
                    onValueChange={(value) => updateSetting('wifiOnlyImages', value)}
                    thumbColor={settings.wifiOnlyImages ? colors.primary : "#f4f3f4"}
                    trackColor={{ false: "#e0e0e0", true: colors.primaryContainer }}
                  />
                </View>

                <Divider style={styles.settingDivider} />

                {/* Toggle 4: Notifications Enabled */}
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <List.Icon icon="bell-outline" color={colors.primary} />
                    <View style={styles.settingText}>
                      <Text style={[styles.settingTitle, dynamicStyles.text]}>Push Notificaties</Text>
                      <Text style={[styles.settingDescription, dynamicStyles.subText]}>
                        Ontvang push notificaties
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.notificationsEnabled}
                    onValueChange={(value) => updateSetting('notificationsEnabled', value)}
                    thumbColor={settings.notificationsEnabled ? colors.primary : "#f4f3f4"}
                    trackColor={{ false: "#e0e0e0", true: colors.primaryContainer }}
                  />
                </View>
              </Card.Content>
            </Card>

            <Card style={dynamicStyles.card}>
              <Card.Content>
                <Title style={dynamicStyles.cardTitle}>App Informatie</Title>
                <List.Item
                  title="Versie"
                  description="1.0.0"
                  titleStyle={dynamicStyles.text}
                  descriptionStyle={dynamicStyles.subText}
                  left={(props) => <List.Icon {...props} icon="information" color={colors.primary} />}
                />
                <Divider />
                <List.Item
                  title="Ontwikkelaar"
                  description="EggSense Solutions"
                  titleStyle={dynamicStyles.text}
                  descriptionStyle={dynamicStyles.subText}
                  left={(props) => <List.Icon {...props} icon="code-tags" color={colors.primary} />}
                />
                <Divider />
                <List.Item
                  title="Support"
                  description="support@eggsense.com"
                  titleStyle={dynamicStyles.text}
                  descriptionStyle={dynamicStyles.subText}
                  left={(props) => <List.Icon {...props} icon="email" color={colors.primary} />}
                  onPress={() =>
                    Alert.alert(
                      "Support",
                      "Voor vragen of problemen:\n\nEmail: support@eggsense.com\nTelefoon: +32 123 45 67 89"
                    )
                  }
                />
              </Card.Content>
            </Card>

            <Card style={dynamicStyles.card}>
              <Card.Content>
                <Title style={dynamicStyles.cardTitle}>Over EggSense</Title>
                <Text style={[styles.aboutText, dynamicStyles.subText]}>
                  EggSense is een professioneel management systeem voor
                  pluimveebedrijven. Het helpt u bij het bijhouden van
                  productie, verkoop en voorraden.
                </Text>
                <Divider style={styles.divider} />
                <List.Item
                  title="Privacy Beleid"
                  titleStyle={dynamicStyles.text}
                  left={(props) => <List.Icon {...props} icon="shield-lock" color={colors.primary} />}
                  right={(props) => (
                    <List.Icon {...props} icon="chevron-right" />
                  )}
                  onPress={() =>
                    Alert.alert(
                      "Privacy Beleid",
                      "Uw gegevens worden veilig opgeslagen en nooit gedeeld met derden."
                    )
                  }
                />
                <Divider />
                <List.Item
                  title="Algemene Voorwaarden"
                  titleStyle={dynamicStyles.text}
                  left={(props) => (
                    <List.Icon {...props} icon="file-document" color={colors.primary} />
                  )}
                  right={(props) => (
                    <List.Icon {...props} icon="chevron-right" />
                  )}
                  onPress={() =>
                    Alert.alert(
                      "Algemene Voorwaarden",
                      "Algemene voorwaarden worden binnenkort beschikbaar."
                    )
                  }
                />
              </Card.Content>
            </Card>
          </>
        )}

        {/* Account Settings */}
        {selectedCategory === "account" && (
          <>
            <Card style={dynamicStyles.card}>
              <Card.Content>
                <Title style={dynamicStyles.cardTitle}>Account Informatie</Title>
                <View style={[styles.accountInfo, { backgroundColor: isDarkMode ? colors.surfaceVariant : "#f8f9fa" }]}>
                  <List.Item
                    title="Gebruikersnaam"
                    description={user?.username || "Niet beschikbaar"}
                    titleStyle={dynamicStyles.text}
                    descriptionStyle={dynamicStyles.subText}
                    left={(props) => <List.Icon {...props} icon="account" color={colors.primary} />}
                  />
                  <Divider />
                  <List.Item
                    title="Rol"
                    description={user?.role || "Gebruiker"}
                    titleStyle={dynamicStyles.text}
                    descriptionStyle={dynamicStyles.subText}
                    left={(props) => (
                      <List.Icon {...props} icon="shield-account" color={colors.primary} />
                    )}
                  />
                </View>
              </Card.Content>
            </Card>

            <Card style={dynamicStyles.card}>
              <Card.Content>
                <Title style={dynamicStyles.cardTitle}>Account Acties</Title>
                <Button
                  mode="contained"
                  onPress={handleLogout}
                  style={styles.logoutButton}
                  buttonColor="#F44336"
                  icon="logout"
                >
                  Uitloggen
                </Button>
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>

      {/* Stall Edit Dialog */}
      <Portal>
        <Dialog
          visible={editStallDialogVisible}
          onDismiss={() => setEditStallDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>
            {selectedStall ? "Stal Bewerken" : "Nieuwe Stal"}
          </Dialog.Title>
          <Dialog.Content>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              <TextInput
                label="Stal Naam *"
                value={editedStall.name}
                onChangeText={(text) =>
                  setEditedStall({ ...editedStall, name: text })
                }
                style={styles.dialogInput}
                mode="outlined"
                left={<TextInput.Icon icon="barn" />}
              />

              <TextInput
                label="Ras"
                value={editedStall.breed}
                onChangeText={(text) =>
                  setEditedStall({ ...editedStall, breed: text })
                }
                style={styles.dialogInput}
                mode="outlined"
                left={<TextInput.Icon icon="bird" />}
              />

              <TextInput
                label="Capaciteit (maximum aantal kippen) *"
                value={editedStall.capacity}
                onChangeText={(text) =>
                  setEditedStall({ ...editedStall, capacity: text })
                }
                keyboardType="numeric"
                style={styles.dialogInput}
                mode="outlined"
                left={<TextInput.Icon icon="counter" />}
              />

              {!selectedStall && (
                <TextInput
                  label="Huidig aantal kippen"
                  value={editedStall.initialChickenCount}
                  onChangeText={(text) =>
                    setEditedStall({
                      ...editedStall,
                      initialChickenCount: text,
                    })
                  }
                  keyboardType="numeric"
                  style={styles.dialogInput}
                  mode="outlined"
                  left={<TextInput.Icon icon="checkbox-multiple-marked" />}
                  placeholder={editedStall.capacity || "0"}
                />
              )}

              {selectedStall && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    Huidige bezetting: {selectedStall.currentChickenCount || 0}{" "}
                    kippen
                  </Text>
                </View>
              )}

              <TextInput
                label="Notities"
                value={editedStall.notes}
                onChangeText={(text) =>
                  setEditedStall({ ...editedStall, notes: text })
                }
                multiline
                numberOfLines={3}
                style={styles.dialogInput}
                mode="outlined"
                left={<TextInput.Icon icon="note-text" />}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Stal actief</Text>
                <Switch
                  value={editedStall.active}
                  onValueChange={(value) =>
                    setEditedStall({ ...editedStall, active: value })
                  }
                  thumbColor={editedStall.active ? colors.primary : "#f4f3f4"}
                />
              </View>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditStallDialogVisible(false)}>
              Annuleren
            </Button>
            <Button onPress={saveStall}>Opslaan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Stal Verwijderen</Dialog.Title>
          <Dialog.Content>
            <Text>
              Weet je zeker dat je de stal "{stallToDelete?.name}" wilt
              verwijderen?
            </Text>
            <Text style={styles.deleteWarning}>
              Deze actie kan niet ongedaan worden gemaakt.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              Annuleren
            </Button>
            <Button onPress={deleteStall} textColor="#F44336">
              Verwijderen
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categorySelector: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
  },
  stallItem: {
    marginBottom: 16,
  },
  stallHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stallInfo: {
    flex: 1,
  },
  stallName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  stallDetails: {
    fontSize: 13,
    marginBottom: 2,
  },
  stallNotes: {
    fontSize: 12,
    fontStyle: "italic",
  },
  stallActions: {
    alignItems: "flex-end",
  },
  stallStatusLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  stallButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  stallButton: {
    flex: 1,
  },
  inactiveChip: {
    alignSelf: "flex-start",
    backgroundColor: "#FFE0B2",
    marginBottom: 8,
  },
  stallDivider: {
    marginTop: 8,
  },
  // Settings row styles
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    flex: 1,
    marginLeft: -8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  settingDivider: {
    marginVertical: 4,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 12,
  },
  accountInfo: {
    borderRadius: 8,
  },
  logoutButton: {
    paddingVertical: 4,
    marginTop: 8,
  },
  dialog: {
    maxHeight: "80%",
  },
  dialogInput: {
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
  deleteWarning: {
    marginTop: 8,
    color: "#F44336",
    fontStyle: "italic",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1976D2",
    flex: 1,
  },
});
