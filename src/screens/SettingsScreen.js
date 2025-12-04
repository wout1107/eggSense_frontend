import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import {
  Card,
  Title,
  TextInput,
  Button,
  List,
  Divider,
  RadioButton,
  IconButton,
  Chip,
  Portal,
  Dialog,
  SegmentedButtons,
} from "react-native-paper";
import stallService from "../services/stallService";

export default function SettingsScreen({ navigation, route }) {
  const [selectedCategory, setSelectedCategory] = useState("farm");
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editStallDialogVisible, setEditStallDialogVisible] = useState(false);
  const [selectedStall, setSelectedStall] = useState(null);

  const [farmSettings, setFarmSettings] = useState({
    farmName: "Boerderij de Gouden Kip",
    ownerName: "Jan Jansen",
    address: "Hoofdstraat 123, 1234 AB Dorp",
    kvkNumber: "12345678",
    btwNumber: "NL123456789B01",
  });

  const [stalls, setStalls] = useState([
    {
      id: "1",
      name: "Stal 1 - Bruine Hennen",
      totalChickens: 280,
      breed: "Bruine Leghennen",
      age: 28,
      setupDate: "2023-06-15",
      active: true,
    },
    {
      id: "2",
      name: "Stal 2 - Witte Hennen",
      totalChickens: 320,
      breed: "Witte Leghennen",
      age: 34,
      setupDate: "2023-05-01",
      active: true,
    },
  ]);

  const [editedStall, setEditedStall] = useState({
    name: "",
    totalChickens: "",
    breed: "",
    setupDate: "",
  });

  const [priceSettings, setPriceSettings] = useState({
    smallEgg: "0.20",
    mediumEgg: "0.25",
    largeEgg: "0.30",
    feedPerKg: "0.45",
    currency: "EUR",
    taxRate: "9",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    dailyReminder: true,
    reminderTime: "09:00",
    lowStock: true,
    lowStockThreshold: "200",
    highMortality: true,
    mortalityThreshold: "2",
    performance: true,
    orderReminders: true,
    feedDelivery: true,
  });

  const [appSettings, setAppSettings] = useState({
    theme: "light",
    language: "nl",
    dateFormat: "dd-mm-yyyy",
    autoBackup: true,
    backupFrequency: "daily",
    showTutorials: true,
  });

  const currencies = [
    { label: "Euro (€)", value: "EUR" },
    { label: "Dollar ($)", value: "USD" },
    { label: "Pond (£)", value: "GBP" },
  ];

  const languages = [
    { label: "Nederlands", value: "nl" },
    { label: "English", value: "en" },
    { label: "Deutsch", value: "de" },
    { label: "Français", value: "fr" },
  ];

  const dateFormats = [
    { label: "DD-MM-YYYY", value: "dd-mm-yyyy" },
    { label: "MM-DD-YYYY", value: "mm-dd-yyyy" },
    { label: "YYYY-MM-DD", value: "yyyy-mm-dd" },
  ];

  const saveFarmSettings = () => {
    if (!farmSettings.farmName || !farmSettings.ownerName) {
      Alert.alert("Fout", "Vul alle verplichte velden in");
      return;
    }
    Alert.alert("Succes", "Bedrijfsgegevens opgeslagen");
  };

  const addNewStall = () => {
    setEditedStall({
      name: "",
      totalChickens: "",
      breed: "brown",
      setupDate: new Date().toISOString().split("T")[0],
    });
    setSelectedStall(null);
    setEditStallDialogVisible(true);
  };

  const editStall = (stall) => {
    setEditedStall({
      name: stall.name,
      totalChickens: stall.totalChickens.toString(),
      breed: stall.breed,
      setupDate: stall.setupDate,
    });
    setSelectedStall(stall);
    setEditStallDialogVisible(true);
  };

  useEffect(() => {
    loadStalls();
  }, []);

  const loadStalls = async () => {
    try {
      const data = await stallService.listStalls();
      setStalls(data);
    } catch (error) {
      console.error("Error loading stalls:", error);
    }
  };

  const saveStall = async () => {
    try {
      if (selectedStall) {
        // Update existing
        const updated = await stallService.updateStall(
          selectedStall.id,
          editedStall
        );
        setStalls(stalls.map((s) => (s.id === selectedStall.id ? updated : s)));
      } else {
        // Create new
        const created = await stallService.createStall(editedStall);
        setStalls([...stalls, created]);
      }
      setEditStallDialogVisible(false);
    } catch (error) {
      Alert.alert("Fout", "Kon stal niet opslaan");
    }
  };

  const deleteStall = async (stall) => {
    try {
      await stallService.deleteStall(stall.id);
      setStalls(stalls.filter((s) => s.id !== stall.id));
      setDeleteDialogVisible(false);
    } catch (error) {
      Alert.alert("Fout", "Kon stal niet verwijderen");
    }
  };

  const toggleStallActive = (stallId) => {
    setStalls(
      stalls.map((s) => (s.id === stallId ? { ...s, active: !s.active } : s))
    );
  };

  const savePriceSettings = () => {
    Alert.alert("Succes", "Prijsinstellingen opgeslagen");
  };

  const exportData = () => {
    Alert.alert("Data Exporteren", "Kies een export formaat", [
      { text: "Annuleren", style: "cancel" },
      {
        text: "Excel (CSV)",
        onPress: () =>
          Alert.alert(
            "Succes",
            "Data geëxporteerd naar Downloads/eggSense_export.csv"
          ),
      },
      {
        text: "JSON Backup",
        onPress: () =>
          Alert.alert(
            "Succes",
            "Backup gemaakt: Downloads/eggSense_backup.json"
          ),
      },
    ]);
  };

  const importData = () => {
    Alert.alert(
      "Data Importeren",
      "Let op: Dit overschrijft huidige data. Zorg dat u eerst een backup maakt.",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Bestand Kiezen",
          onPress: () => Alert.alert("Info", "Bestandskiezer wordt geopend..."),
        },
      ]
    );
  };

  const resetApp = () => {
    setDeleteDialogVisible(true);
  };

  const confirmReset = () => {
    setDeleteDialogVisible(false);
    Alert.alert(
      "App Gereset",
      "Alle data is gewist en instellingen zijn hersteld"
    );
  };

  const handleLogout = () => {
    Alert.alert("Uitloggen", "Weet u zeker dat u wilt uitloggen?", [
      { text: "Annuleren", style: "cancel" },
      {
        text: "Uitloggen",
        style: "destructive",
        onPress: () => {
          Alert.alert("Uitgelogd", "Tot ziens!");
        },
      },
    ]);
  };

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case "EUR":
        return "€";
      case "USD":
        return "$";
      case "GBP":
        return "£";
      default:
        return "€";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.header}>Instellingen</Text>

        {/* Category Selector */}
        <SegmentedButtons
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          buttons={[
            { value: "farm", label: "Bedrijf", icon: "barn" },
            { value: "prices", label: "Prijzen", icon: "currency-eur" },
            { value: "app", label: "App", icon: "cog" },
          ]}
          style={styles.categorySelector}
        />

        {/* Farm Settings */}
        {selectedCategory === "farm" && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Title style={styles.cardTitle}>Bedrijfsgegevens</Title>
                  <IconButton
                    icon="information"
                    size={20}
                    iconColor="#2E7D32"
                    onPress={() =>
                      Alert.alert(
                        "Info",
                        "Deze gegevens worden gebruikt op facturen en documenten"
                      )
                    }
                  />
                </View>

                <TextInput
                  label="Bedrijfsnaam *"
                  value={farmSettings.farmName}
                  onChangeText={(text) =>
                    setFarmSettings({ ...farmSettings, farmName: text })
                  }
                  style={styles.input}
                  left={<TextInput.Icon icon="domain" />}
                />

                <TextInput
                  label="Eigenaar *"
                  value={farmSettings.ownerName}
                  onChangeText={(text) =>
                    setFarmSettings({ ...farmSettings, ownerName: text })
                  }
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                />

                <TextInput
                  label="Adres"
                  value={farmSettings.address}
                  onChangeText={(text) =>
                    setFarmSettings({ ...farmSettings, address: text })
                  }
                  multiline
                  numberOfLines={2}
                  style={styles.input}
                  left={<TextInput.Icon icon="map-marker" />}
                />

                <TextInput
                  label="KVK Nummer"
                  value={farmSettings.kvkNumber}
                  onChangeText={(text) =>
                    setFarmSettings({ ...farmSettings, kvkNumber: text })
                  }
                  keyboardType="numeric"
                  style={styles.input}
                  left={<TextInput.Icon icon="file-document" />}
                />

                <TextInput
                  label="BTW Nummer"
                  value={farmSettings.btwNumber}
                  onChangeText={(text) =>
                    setFarmSettings({ ...farmSettings, btwNumber: text })
                  }
                  style={styles.input}
                  left={<TextInput.Icon icon="receipt" />}
                />

                <Button
                  mode="contained"
                  onPress={saveFarmSettings}
                  style={styles.saveButton}
                  buttonColor="#2E7D32"
                  icon="content-save"
                >
                  Gegevens Opslaan
                </Button>
              </Card.Content>
            </Card>

            {/* Stallen Management */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Title style={styles.cardTitle}>
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

                {stalls.map((stall) => (
                  <View key={stall.id} style={styles.stallItem}>
                    <View style={styles.stallHeader}>
                      <View style={styles.stallInfo}>
                        <Text style={styles.stallName}>{stall.name}</Text>
                        <Text style={styles.stallDetails}>
                          {stall.totalChickens} kippen • {stall.age} weken oud
                        </Text>
                        <Text style={styles.stallBreed}>{stall.breed}</Text>
                      </View>
                      <View style={styles.stallActions}>
                        <Switch
                          value={stall.active}
                          onValueChange={() => toggleStallActive(stall.id)}
                          thumbColor={stall.active ? "#2E7D32" : "#f4f3f4"}
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
                        onPress={() => deleteStall(stall)}
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
              </Card.Content>
            </Card>
          </>
        )}

        {/* Price Settings */}
        {selectedCategory === "prices" && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Eieren Prijzen</Title>

                <TextInput
                  label={`Klein Ei (S) - ${getCurrencySymbol(
                    priceSettings.currency
                  )}`}
                  value={priceSettings.smallEgg}
                  onChangeText={(text) =>
                    setPriceSettings({ ...priceSettings, smallEgg: text })
                  }
                  keyboardType="decimal-pad"
                  style={styles.input}
                  left={<TextInput.Icon icon="egg" />}
                />

                <TextInput
                  label={`Medium Ei (M) - ${getCurrencySymbol(
                    priceSettings.currency
                  )}`}
                  value={priceSettings.mediumEgg}
                  onChangeText={(text) =>
                    setPriceSettings({ ...priceSettings, mediumEgg: text })
                  }
                  keyboardType="decimal-pad"
                  style={styles.input}
                  left={<TextInput.Icon icon="egg" />}
                />

                <TextInput
                  label={`Groot Ei (L) - ${getCurrencySymbol(
                    priceSettings.currency
                  )}`}
                  value={priceSettings.largeEgg}
                  onChangeText={(text) =>
                    setPriceSettings({ ...priceSettings, largeEgg: text })
                  }
                  keyboardType="decimal-pad"
                  style={styles.input}
                  left={<TextInput.Icon icon="egg" />}
                />

                <Divider style={styles.divider} />

                <TextInput
                  label={`Voerprijs per kg - ${getCurrencySymbol(
                    priceSettings.currency
                  )}`}
                  value={priceSettings.feedPerKg}
                  onChangeText={(text) =>
                    setPriceSettings({ ...priceSettings, feedPerKg: text })
                  }
                  keyboardType="decimal-pad"
                  style={styles.input}
                  left={<TextInput.Icon icon="food-apple" />}
                />

                <Button
                  mode="contained"
                  onPress={savePriceSettings}
                  style={styles.saveButton}
                  buttonColor="#2E7D32"
                  icon="content-save"
                >
                  Prijzen Opslaan
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Valuta & BTW</Title>

                <Text style={styles.sectionLabel}>Valuta:</Text>
                <RadioButton.Group
                  onValueChange={(value) =>
                    setPriceSettings({ ...priceSettings, currency: value })
                  }
                  value={priceSettings.currency}
                >
                  {currencies.map((curr) => (
                    <RadioButton.Item
                      key={curr.value}
                      label={curr.label}
                      value={curr.value}
                    />
                  ))}
                </RadioButton.Group>

                <Divider style={styles.divider} />

                <TextInput
                  label="BTW Tarief (%)"
                  value={priceSettings.taxRate}
                  onChangeText={(text) =>
                    setPriceSettings({ ...priceSettings, taxRate: text })
                  }
                  keyboardType="numeric"
                  style={styles.input}
                  left={<TextInput.Icon icon="percent" />}
                />
              </Card.Content>
            </Card>
          </>
        )}

        {/* App Settings */}
        {selectedCategory === "app" && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Weergave</Title>

                <Text style={styles.sectionLabel}>Thema:</Text>
                <RadioButton.Group
                  onValueChange={(value) =>
                    setAppSettings({ ...appSettings, theme: value })
                  }
                  value={appSettings.theme}
                >
                  <RadioButton.Item label="☀️ Licht" value="light" />
                  <RadioButton.Item label="🌙 Donker" value="dark" />
                  <RadioButton.Item label="📱 Systeem" value="system" />
                </RadioButton.Group>

                <Divider style={styles.divider} />

                <Text style={styles.sectionLabel}>Taal:</Text>
                <RadioButton.Group
                  onValueChange={(value) =>
                    setAppSettings({ ...appSettings, language: value })
                  }
                  value={appSettings.language}
                >
                  {languages.map((lang) => (
                    <RadioButton.Item
                      key={lang.value}
                      label={lang.label}
                      value={lang.value}
                    />
                  ))}
                </RadioButton.Group>

                <Divider style={styles.divider} />

                <Text style={styles.sectionLabel}>Datumnotatie:</Text>
                <RadioButton.Group
                  onValueChange={(value) =>
                    setAppSettings({ ...appSettings, dateFormat: value })
                  }
                  value={appSettings.dateFormat}
                >
                  {dateFormats.map((format) => (
                    <RadioButton.Item
                      key={format.value}
                      label={format.label}
                      value={format.value}
                    />
                  ))}
                </RadioButton.Group>
              </Card.Content>
            </Card>

            {/* Notifications Settings - Optional */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Title style={styles.cardTitle}>Notificaties</Title>
                  <Switch
                    value={notificationSettings.enabled}
                    onValueChange={(value) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        enabled: value,
                      })
                    }
                    thumbColor={
                      notificationSettings.enabled ? "#2E7D32" : "#f4f3f4"
                    }
                  />
                </View>

                {notificationSettings.enabled && (
                  <>
                    <List.Item
                      title="Dagelijkse Herinnering"
                      description="Herinner me om dagelijkse data in te voeren"
                      left={(props) => <List.Icon {...props} icon="alarm" />}
                      right={() => (
                        <Switch
                          value={notificationSettings.dailyReminder}
                          onValueChange={(value) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              dailyReminder: value,
                            })
                          }
                        />
                      )}
                    />

                    {notificationSettings.dailyReminder && (
                      <TextInput
                        label="Herinneringstijd"
                        value={notificationSettings.reminderTime}
                        onChangeText={(text) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            reminderTime: text,
                          })
                        }
                        style={styles.input}
                        left={<TextInput.Icon icon="clock-outline" />}
                        placeholder="09:00"
                      />
                    )}

                    <Divider />

                    <List.Item
                      title="Lage Voorraad"
                      description="Waarschuwing bij lage voer/eieren voorraad"
                      left={(props) => (
                        <List.Icon {...props} icon="package-variant" />
                      )}
                      right={() => (
                        <Switch
                          value={notificationSettings.lowStock}
                          onValueChange={(value) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              lowStock: value,
                            })
                          }
                        />
                      )}
                    />

                    {notificationSettings.lowStock && (
                      <TextInput
                        label="Drempelwaarde (kg)"
                        value={notificationSettings.lowStockThreshold}
                        onChangeText={(text) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            lowStockThreshold: text,
                          })
                        }
                        keyboardType="numeric"
                        style={styles.input}
                        left={<TextInput.Icon icon="gauge" />}
                      />
                    )}

                    <Divider />

                    <List.Item
                      title="Hoge Uitval"
                      description="Waarschuwing bij ongewoon hoge uitval"
                      left={(props) => (
                        <List.Icon {...props} icon="alert-circle" />
                      )}
                      right={() => (
                        <Switch
                          value={notificationSettings.highMortality}
                          onValueChange={(value) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              highMortality: value,
                            })
                          }
                        />
                      )}
                    />

                    {notificationSettings.highMortality && (
                      <TextInput
                        label="Drempel (%)"
                        value={notificationSettings.mortalityThreshold}
                        onChangeText={(text) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            mortalityThreshold: text,
                          })
                        }
                        keyboardType="numeric"
                        style={styles.input}
                        left={<TextInput.Icon icon="percent" />}
                      />
                    )}

                    <Divider />

                    <List.Item
                      title="Prestatie Waarschuwingen"
                      description="Melding bij ondermaatse prestaties"
                      left={(props) => (
                        <List.Icon {...props} icon="chart-line" />
                      )}
                      right={() => (
                        <Switch
                          value={notificationSettings.performance}
                          onValueChange={(value) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              performance: value,
                            })
                          }
                        />
                      )}
                    />

                    <Divider />

                    <List.Item
                      title="Bestelling Herinneringen"
                      description="Herinnering voor openstaande orders"
                      left={(props) => <List.Icon {...props} icon="cart" />}
                      right={() => (
                        <Switch
                          value={notificationSettings.orderReminders}
                          onValueChange={(value) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              orderReminders: value,
                            })
                          }
                        />
                      )}
                    />

                    <Divider />

                    <List.Item
                      title="Voer Leveringen"
                      description="Melding bij verwachte voerlevering"
                      left={(props) => (
                        <List.Icon {...props} icon="truck-delivery" />
                      )}
                      right={() => (
                        <Switch
                          value={notificationSettings.feedDelivery}
                          onValueChange={(value) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              feedDelivery: value,
                            })
                          }
                        />
                      )}
                    />
                  </>
                )}
              </Card.Content>
            </Card>

            {/* Backup Settings */}
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Backup & Data</Title>

                <List.Item
                  title="Automatische Backup"
                  description="Maak automatisch dagelijkse backups"
                  left={(props) => (
                    <List.Icon {...props} icon="backup-restore" />
                  )}
                  right={() => (
                    <Switch
                      value={appSettings.autoBackup}
                      onValueChange={(value) =>
                        setAppSettings({ ...appSettings, autoBackup: value })
                      }
                    />
                  )}
                />

                {appSettings.autoBackup && (
                  <>
                    <Divider />
                    <Text style={styles.sectionLabel}>Backup Frequentie:</Text>
                    <RadioButton.Group
                      onValueChange={(value) =>
                        setAppSettings({
                          ...appSettings,
                          backupFrequency: value,
                        })
                      }
                      value={appSettings.backupFrequency}
                    >
                      <RadioButton.Item label="Dagelijks" value="daily" />
                      <RadioButton.Item label="Wekelijks" value="weekly" />
                      <RadioButton.Item label="Maandelijks" value="monthly" />
                    </RadioButton.Group>
                  </>
                )}

                <Divider style={styles.divider} />

                <Button
                  mode="outlined"
                  onPress={exportData}
                  style={styles.dataButton}
                  icon="export"
                >
                  Data Exporteren
                </Button>

                <Button
                  mode="outlined"
                  onPress={importData}
                  style={styles.dataButton}
                  icon="import"
                >
                  Data Importeren
                </Button>
              </Card.Content>
            </Card>

            {/* Tutorials */}
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Hulp & Tutorials</Title>

                <List.Item
                  title="Tutorials Tonen"
                  description="Laat tutorials zien bij eerste gebruik"
                  left={(props) => <List.Icon {...props} icon="school" />}
                  right={() => (
                    <Switch
                      value={appSettings.showTutorials}
                      onValueChange={(value) =>
                        setAppSettings({ ...appSettings, showTutorials: value })
                      }
                    />
                  )}
                />

                <Divider />

                <Button
                  mode="outlined"
                  onPress={() =>
                    Alert.alert("Help", "Help documentatie wordt geopend...")
                  }
                  style={styles.dataButton}
                  icon="help-circle"
                >
                  Hulp Documentatie
                </Button>

                <Button
                  mode="outlined"
                  onPress={() =>
                    Alert.alert(
                      "Video Tutorials",
                      "Video tutorials worden binnenkort beschikbaar"
                    )
                  }
                  style={styles.dataButton}
                  icon="video"
                >
                  Video Tutorials
                </Button>
              </Card.Content>
            </Card>

            {/* Danger Zone */}
            <Card style={[styles.card, styles.dangerCard]}>
              <Card.Content>
                <Title style={styles.dangerTitle}>Gevaarlijke Zone</Title>

                <Button
                  mode="outlined"
                  onPress={resetApp}
                  style={styles.dataButton}
                  textColor="#F44336"
                  icon="delete-forever"
                >
                  Alle Data Wissen
                </Button>

                <Text style={styles.warningText}>
                  ⚠️ Deze actie kan niet ongedaan worden gemaakt!
                </Text>
              </Card.Content>
            </Card>
          </>
        )}

        {/* App Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>App Informatie</Title>
            <List.Item
              title="Versie"
              description="1.0.0"
              left={(props) => <List.Icon {...props} icon="information" />}
            />
            <Divider />
            <List.Item
              title="Ontwikkelaar"
              description="EggSense Solutions"
              left={(props) => <List.Icon {...props} icon="code-tags" />}
            />
            <Divider />
            <List.Item
              title="Support"
              description="support@eggsense.nl"
              left={(props) => <List.Icon {...props} icon="email" />}
              onPress={() =>
                Alert.alert("Contact", "E-mail client wordt geopend...")
              }
            />
            <Divider />
            <List.Item
              title="Website"
              description="www.eggsense.nl"
              left={(props) => <List.Icon {...props} icon="web" />}
              onPress={() => Alert.alert("Website", "Browser wordt geopend...")}
            />
          </Card.Content>
        </Card>

        {/* Account Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Account</Title>
            <View style={styles.accountInfo}>
              <List.Item
                title="Ingelogd als"
                description="test@eggsense.nl"
                left={(props) => <List.Icon {...props} icon="account-circle" />}
              />
            </View>

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
      </ScrollView>

      {/* Stall Edit Dialog */}
      <Portal>
        <Dialog
          visible={editStallDialogVisible}
          onDismiss={() => setEditStallDialogVisible(false)}
        >
          <Dialog.Title>
            {selectedStall ? "Stal Bewerken" : "Nieuwe Stal"}
          </Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={styles.dialogScroll}>
              <TextInput
                label="Stal Naam *"
                value={editedStall.name}
                onChangeText={(text) =>
                  setEditedStall({ ...editedStall, name: text })
                }
                style={styles.dialogInput}
                left={<TextInput.Icon icon="barn" />}
              />

              <TextInput
                label="Aantal Kippen *"
                value={editedStall.totalChickens}
                onChangeText={(text) =>
                  setEditedStall({ ...editedStall, totalChickens: text })
                }
                keyboardType="numeric"
                style={styles.dialogInput}
                left={<TextInput.Icon icon="counter" />}
              />

              <Text style={styles.dialogLabel}>Kippenras:</Text>
              <RadioButton.Group
                onValueChange={(value) =>
                  setEditedStall({ ...editedStall, breed: value })
                }
                value={editedStall.breed}
              >
                <RadioButton.Item label="Bruine Leghennen" value="brown" />
                <RadioButton.Item label="Witte Leghennen" value="white" />
                <RadioButton.Item label="Gemengd" value="mixed" />
              </RadioButton.Group>

              <TextInput
                label="Startdatum Koppel"
                value={editedStall.setupDate}
                onChangeText={(text) =>
                  setEditedStall({ ...editedStall, setupDate: text })
                }
                style={styles.dialogInput}
                left={<TextInput.Icon icon="calendar" />}
                placeholder="YYYY-MM-DD"
              />
            </ScrollView>
          </Dialog.ScrollArea>
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
          <Dialog.Title>App Resetten</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.deleteWarningText}>
              Weet u absoluut zeker dat u alle data wilt wissen?
            </Text>
            <Text style={styles.deleteWarningSubtext}>
              Dit omvat:
              {"\n"}• Alle productiegegevens
              {"\n"}• Klanten en bestellingen
              {"\n"}• Voer leveringen
              {"\n"}• Stallen configuratie
              {"\n"}• Instellingen
              {"\n\n"}
              Deze actie kan NIET ongedaan worden gemaakt!
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              Annuleren
            </Button>
            <Button textColor="#F44336" onPress={confirmReset}>
              Alles Wissen
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 16,
  },
  categorySelector: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    color: "#2E7D32",
    fontSize: 18,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginTop: 8,
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 4,
  },
  divider: {
    marginVertical: 16,
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
    color: "#2E7D32",
    marginBottom: 4,
  },
  stallDetails: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 2,
  },
  stallBreed: {
    fontSize: 12,
    color: "#999999",
  },
  stallActions: {
    alignItems: "flex-end",
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
  dataButton: {
    marginBottom: 8,
  },
  dangerCard: {
    backgroundColor: "#FFEBEE",
  },
  dangerTitle: {
    color: "#F44336",
    fontSize: 18,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 12,
    color: "#F44336",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  accountInfo: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 16,
  },
  logoutButton: {
    paddingVertical: 4,
  },
  dialogScroll: {
    maxHeight: 400,
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  dialogLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginTop: 8,
    marginBottom: 8,
  },
  deleteWarningText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F44336",
    marginBottom: 12,
  },
  deleteWarningSubtext: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});
