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
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { settings, updateSetting, t } = useSettings();

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
      Alert.alert(t('error'), t('couldNotLoadSettings'));
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
      Alert.alert(t('error'), t('couldNotLoadStalls'));
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
      Alert.alert(t('error'), t('stallNameRequired'));
      return;
    }

    if (!editedStall.capacity || parseInt(editedStall.capacity) <= 0) {
      Alert.alert(t('error'), t('validCapacityRequired'));
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
        Alert.alert(t('success'), t('stallUpdated'));
      } else {
        stallData.initialChickenCount = parseInt(
          editedStall.initialChickenCount || editedStall.capacity
        );
        await stallService.createStall(stallData);
        Alert.alert(t('success'), t('stallCreated'));
      }

      setEditStallDialogVisible(false);
      await loadStalls();
    } catch (error) {
      console.error("Error saving stall:", error);
      Alert.alert(t('error'), t('couldNotSaveStall'));
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
      Alert.alert(t('success'), t('stallDeleted'));
    } catch (error) {
      console.error("Error deleting stall:", error);
      Alert.alert(t('error'), t('couldNotDeleteStall'));
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
      Alert.alert(t('error'), t('couldNotChangeStatus'));
    }
  };

  const handleLogout = async () => {
    Alert.alert(t('logout'), t('confirmLogout'), [
      { text: t('cancel'), style: "cancel" },
      {
        text: t('logout'),
        style: "destructive",
        onPress: async () => {
          try {
            // Call logout service - this clears storage and calls backend
            await authService.logout();
            // App.js will detect the auth state change and navigate automatically
          } catch (error) {
            console.error("Error logging out:", error);
            // Even if backend fails, try to clear local storage
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("refreshToken");
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
      paddingTop: insets.top + 16,
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
        <Text style={[styles.loadingText, { color: colors.onSurface }]}>{t('loading')}</Text>
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
        <Text style={dynamicStyles.headerTitle}>{t('settings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Category Selector */}
        <SegmentedButtons
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          buttons={[
            { value: "stalls", label: t('stalls'), icon: "barn" },
            { value: "app", label: t('app'), icon: "cog" },
            { value: "account", label: t('account'), icon: "account" },
          ]}
          style={styles.categorySelector}
        />

        {/* Stalls Management */}
        {selectedCategory === "stalls" && (
          <Card style={dynamicStyles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={dynamicStyles.cardTitle}>
                  {t('stalls')} ({stalls.length})
                </Title>
                <Button
                  mode="outlined"
                  onPress={addNewStall}
                  compact
                  icon="plus"
                >
                  {t('add')}
                </Button>
              </View>

              {stalls.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, dynamicStyles.subText]}>{t('noStallsFound')}</Text>
                  <Text style={[styles.emptySubtext, dynamicStyles.subText]}>
                    {t('addStallToStart')}
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
                            {t('capacity')}: {stall.capacity} {t('chickens')}
                          </Text>
                          {stall.notes && (
                            <Text style={[styles.stallNotes, dynamicStyles.subText]}>{stall.notes}</Text>
                          )}
                        </View>
                        <View style={styles.stallActions}>
                          <Text style={[styles.stallStatusLabel, dynamicStyles.subText]}>
                            {stall.active ? t('active') : t('inactive')}
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
                          {t('edit')}
                        </Button>
                        <Button
                          mode="outlined"
                          onPress={() => confirmDeleteStall(stall)}
                          compact
                          icon="delete"
                          textColor="#F44336"
                          style={styles.stallButton}
                        >
                          {t('delete')}
                        </Button>
                      </View>

                      {!stall.active && (
                        <Chip
                          mode="flat"
                          style={styles.inactiveChip}
                          textStyle={{ fontSize: 11 }}
                        >
                          {t('inactive')}
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
            {/* Theme & Preferences Card */}
            <Card style={dynamicStyles.card}>
              <Card.Content>
                <Title style={dynamicStyles.cardTitle}>{t('displayPreferences')}</Title>

                {/* Setting 1: Dark/Light Theme */}
                <View
                  style={styles.settingRow}
                  accessible={true}
                  accessibilityLabel="Donker thema instelling"
                  accessibilityHint="Dubbelklik om te schakelen tussen licht en donker thema"
                  accessibilityRole="switch"
                  accessibilityState={{ checked: isDarkMode }}
                >
                  <View style={styles.settingInfo}>
                    <List.Icon icon={isDarkMode ? "weather-night" : "weather-sunny"} color={colors.primary} />
                    <View style={styles.settingText}>
                      <Text style={[styles.settingTitle, dynamicStyles.text]}>{t('darkTheme')}</Text>
                      <Text style={[styles.settingDescription, dynamicStyles.subText]}>
                        {t('switchTheme')}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    thumbColor={isDarkMode ? colors.primary : "#f4f3f4"}
                    trackColor={{ false: "#e0e0e0", true: colors.primaryContainer }}
                    accessibilityLabel="Schakel donker thema"
                  />
                </View>

                <Divider style={styles.settingDivider} />

                {/* Setting: Language Selection */}
                <View
                  style={styles.settingRow}
                  accessible={true}
                  accessibilityLabel="Taal instelling"
                  accessibilityHint="Selecteer de taal van de applicatie"
                >
                  <View style={styles.settingInfo}>
                    <List.Icon icon="translate" color={colors.primary} />
                    <View style={styles.settingText}>
                      <Text style={[styles.settingTitle, dynamicStyles.text]}>Taal / Language</Text>
                      <Text style={[styles.settingDescription, dynamicStyles.subText]}>
                        {settings.language === 'nl' ? 'Nederlands geselecteerd' : 'English selected'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.stallChipsContainer}>
                  <Chip
                    mode={settings.language === 'nl' ? "flat" : "outlined"}
                    selected={settings.language === 'nl'}
                    onPress={() => updateSetting('language', 'nl')}
                    style={styles.stallChip}
                    icon="flag"
                    accessibilityLabel="Nederlands selecteren"
                    accessibilityRole="button"
                    accessibilityState={{ selected: settings.language === 'nl' }}
                  >
                    🇳🇱 Nederlands
                  </Chip>
                  <Chip
                    mode={settings.language === 'en' ? "flat" : "outlined"}
                    selected={settings.language === 'en'}
                    onPress={() => updateSetting('language', 'en')}
                    style={styles.stallChip}
                    icon="flag"
                    accessibilityLabel="Select English"
                    accessibilityRole="button"
                    accessibilityState={{ selected: settings.language === 'en' }}
                  >
                    🇬🇧 English
                  </Chip>
                </View>

                <Divider style={styles.settingDivider} />

                {/* Setting 2: Default Stal Selection */}
                <View
                  style={styles.settingRow}
                  accessible={true}
                  accessibilityLabel="Standaard stal instelling"
                  accessibilityHint="Selecteer welke stal standaard wordt geladen"
                >
                  <View style={styles.settingInfo}>
                    <List.Icon icon="barn" color={colors.primary} />
                    <View style={styles.settingText}>
                      <Text style={[styles.settingTitle, dynamicStyles.text]}>{t('defaultStall')}</Text>
                      <Text style={[styles.settingDescription, dynamicStyles.subText]}>
                        {t('selectDefaultStall')}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.stallChipsContainer}>
                  <Chip
                    mode={settings.defaultStallId === null ? "flat" : "outlined"}
                    selected={settings.defaultStallId === null}
                    onPress={() => updateSetting('defaultStallId', null)}
                    style={styles.stallChip}
                    accessibilityLabel="Geen standaard stal"
                    accessibilityRole="button"
                    accessibilityState={{ selected: settings.defaultStallId === null }}
                  >
                    {t('none')}
                  </Chip>
                  {stalls.map((stall) => (
                    <Chip
                      key={stall.id}
                      mode={settings.defaultStallId === stall.id ? "flat" : "outlined"}
                      selected={settings.defaultStallId === stall.id}
                      onPress={() => updateSetting('defaultStallId', stall.id)}
                      style={styles.stallChip}
                      accessibilityLabel={`Stal ${stall.name} als standaard instellen`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: settings.defaultStallId === stall.id }}
                    >
                      {stall.name}
                    </Chip>
                  ))}
                </View>

                <Divider style={styles.settingDivider} />

                {/* Setting 3: Low Stock Alert Threshold */}
                <View
                  style={styles.settingRow}
                  accessible={true}
                  accessibilityLabel={`Voervoorraad waarschuwing bij ${settings.lowStockAlertDays} dagen`}
                  accessibilityHint="Stel in bij hoeveel dagen voervoorraad een waarschuwing wordt getoond"
                >
                  <View style={styles.settingInfo}>
                    <List.Icon icon="alert-circle" color={colors.primary} />
                    <View style={styles.settingText}>
                      <Text style={[styles.settingTitle, dynamicStyles.text]}>{t('stockAlert')}</Text>
                      <Text style={[styles.settingDescription, dynamicStyles.subText]}>
                        {t('showAlertWhenLow', { days: settings.lowStockAlertDays })}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.thresholdContainer}>
                  {[3, 5, 7, 10, 14].map((days) => (
                    <Chip
                      key={days}
                      mode={settings.lowStockAlertDays === days ? "flat" : "outlined"}
                      selected={settings.lowStockAlertDays === days}
                      onPress={() => updateSetting('lowStockAlertDays', days)}
                      style={styles.thresholdChip}
                      accessibilityLabel={`${days} dagen voorraad drempel`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: settings.lowStockAlertDays === days }}
                    >
                      {days} {t('days')}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>

            <Card style={dynamicStyles.card}>
              <Card.Content>
                <Title style={dynamicStyles.cardTitle}>{t('appInfo')}</Title>
                <List.Item
                  title={t('version')}
                  description="1.0.0"
                  titleStyle={dynamicStyles.text}
                  descriptionStyle={dynamicStyles.subText}
                  left={(props) => <List.Icon {...props} icon="information" color={colors.primary} />}
                  accessibilityLabel="App versie 1.0.0"
                />
                <Divider />
                <List.Item
                  title="Ontwikkelaar"
                  description="EggSense Solutions"
                  titleStyle={dynamicStyles.text}
                  descriptionStyle={dynamicStyles.subText}
                  left={(props) => <List.Icon {...props} icon="code-tags" color={colors.primary} />}
                  accessibilityLabel="Ontwikkeld door EggSense Solutions"
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
                  accessibilityLabel="Contact support via email"
                  accessibilityHint="Dubbelklik voor contactgegevens"
                  accessibilityRole="button"
                />
              </Card.Content>
            </Card>

            <Card style={dynamicStyles.card}>
              <Card.Content>
                <Title style={dynamicStyles.cardTitle}>Over EggSense</Title>
                <Text
                  style={[styles.aboutText, dynamicStyles.subText]}
                  accessibilityRole="text"
                >
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
                  accessibilityLabel="Privacy beleid bekijken"
                  accessibilityRole="button"
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
                  accessibilityLabel="Algemene voorwaarden bekijken"
                  accessibilityRole="button"
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
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
    marginLeft: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  settingDivider: {
    marginVertical: 8,
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
  // New styles for settings chips
  stallChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  stallChip: {
    marginBottom: 4,
  },
  thresholdContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  thresholdChip: {
    marginBottom: 4,
  },
});
