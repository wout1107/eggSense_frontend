import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Card,
  Title,
  TextInput,
  Button,
  IconButton,
  SegmentedButtons,
  Chip,
} from "react-native-paper";
import productionService from "../services/productionService";
import stallService from "../services/stallService";
import { useTheme } from "../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DailyInputScreen({ navigation, route }) {
  const { isDarkMode, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { selectedStallId } = route.params || {};

  const [eggData, setEggData] = useState({
    small: "",
    medium: "",
    large: "",
  });
  const [feedConsumption, setFeedConsumption] = useState("");
  const [waterConsumption, setWaterConsumption] = useState("");
  const [casualties, setCasualties] = useState("");
  const [stalls, setStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStalls();
  }, []);

  const loadStalls = async () => {
    try {
      const stallList = await stallService.listStalls();
      const activeStalls = stallList.filter((stall) => stall.active);
      setStalls(activeStalls.length > 0 ? activeStalls : stallList);

      // Priority: 1. Stall from navigation params, 2. First active stall, 3. First stall
      if (selectedStallId) {
        const preSelectedStall = stallList.find(
          (stall) => stall.id === selectedStallId
        );
        if (preSelectedStall) {
          setSelectedStall(preSelectedStall.id);
          return;
        }
      }

      if (activeStalls.length > 0) {
        setSelectedStall(activeStalls[0].id);
      } else if (stallList.length > 0) {
        setSelectedStall(stallList[0].id);
        Alert.alert(
          "Let op",
          "Er zijn geen actieve stallen. Selecteer een inactieve stal of activeer een stal in de instellingen."
        );
      } else {
        Alert.alert(
          "Geen Stallen",
          "Er zijn nog geen stallen aangemaakt. Maak eerst een stal aan in de instellingen.",
          [
            {
              text: "Naar Instellingen",
              onPress: () => navigation.navigate("Settings"),
            },
            {
              text: "Annuleren",
              onPress: () => navigation.goBack(),
              style: "cancel",
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error loading stalls:", error);
      Alert.alert("Fout", "Kon stallen niet ophalen");
    }
  };

  const handleSave = async () => {
    // Validate input
    if (!eggData.small && !eggData.medium && !eggData.large) {
      Alert.alert("Fout", "Voer minimaal één eieren categorie in");
      return;
    }

    if (!selectedStall) {
      Alert.alert("Fout", "Selecteer een stal");
      return;
    }

    setIsLoading(true);

    try {
      const productionData = {
        recordDate: new Date().toISOString().split("T")[0],
        stallId: selectedStall,
        eggsSmall: parseInt(eggData.small || 0),
        eggsMedium: parseInt(eggData.medium || 0),
        eggsLarge: parseInt(eggData.large || 0),
        eggsRejected: 0,
        feedKg: parseFloat(feedConsumption || 0),
        waterLiters: parseFloat(waterConsumption || 0),
        mortality: parseInt(casualties || 0),
        healthNotes: "",
      };

      await productionService.createDailyProduction(productionData);

      const totalEggs =
        parseInt(eggData.small || 0) +
        parseInt(eggData.medium || 0) +
        parseInt(eggData.large || 0);

      const selectedStallName =
        stalls.find((s) => s.id === selectedStall)?.name || "Stal";

      Alert.alert(
        "Gegevens Opgeslagen",
        `Totaal ${totalEggs} eieren geregistreerd voor ${selectedStallName} op ${new Date().toLocaleDateString(
          "nl-NL"
        )}`,
        [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("MainTabs", { screen: "Dashboard" });
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Fout", error.message || "Kon gegevens niet opslaan");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEggData({ small: "", medium: "", large: "" });
    setFeedConsumption("");
    setWaterConsumption("");
    setCasualties("");
  };

  const renderStallSelector = () => {
    if (stalls.length === 0) {
      return (
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Text style={[styles.noStallsText, { color: colors.onSurfaceVariant }]}>
              Geen stallen beschikbaar. Maak eerst een stal aan in de
              instellingen.
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("Settings")}
              style={styles.settingsButton}
              buttonColor={colors.primary}
              icon="cog"
            >
              Naar Instellingen
            </Button>
          </Card.Content>
        </Card>
      );
    }

    if (stalls.length === 1) {
      const currentStall = stalls[0];
      const isPreSelected = selectedStallId === currentStall.id;

      return (
        <Card style={[styles.stallCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={styles.singleStallHeader}>
              <Text style={[styles.stallLabel, { color: colors.primary }]}>Stal:</Text>
              <Chip
                mode="flat"
                icon="barn"
                style={[styles.selectedStallChip, { backgroundColor: isDarkMode ? '#1B5E20' : '#E8F5E9' }]}
                textStyle={[styles.selectedStallText, { color: colors.primary }]}
              >
                {currentStall.name}
                {isPreSelected && " ✓"}
              </Chip>
            </View>
            <Text style={[styles.stallCapacity, { color: colors.onSurfaceVariant }]}>
              Capaciteit: {currentStall.capacity} kippen
            </Text>
            {isPreSelected && (
              <Text style={styles.preSelectedText}>
                Automatisch geselecteerd van Dashboard
              </Text>
            )}
          </Card.Content>
        </Card>
      );
    }

    // Multiple stalls - show selector
    return (
      <Card style={[styles.stallCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Title style={[styles.stallSelectorTitle, { color: colors.primary }]}>Selecteer Stal</Title>
          {selectedStallId && (
            <Text style={styles.preSelectedHint}>
              ✓ Stal geselecteerd van Dashboard
            </Text>
          )}
          <View style={styles.stallChipsContainer}>
            {stalls.map((stall) => {
              const isCurrentlySelected = selectedStall === stall.id;
              const wasPreSelected = selectedStallId === stall.id;

              return (
                <Chip
                  key={stall.id}
                  mode={isCurrentlySelected ? "flat" : "outlined"}
                  selected={isCurrentlySelected}
                  onPress={() => setSelectedStall(stall.id)}
                  style={[
                    styles.stallChip,
                    isCurrentlySelected && { backgroundColor: colors.primary },
                  ]}
                  textStyle={isCurrentlySelected ? { color: '#fff', fontWeight: 'bold' } : { color: colors.onSurface }}
                  icon={wasPreSelected ? "check-circle" : "barn"}
                >
                  {stall.name}
                </Chip>
              );
            })}
          </View>
          {selectedStall && (
            <View style={[styles.selectedStallInfo, { backgroundColor: isDarkMode ? '#1B5E20' : '#E8F5E9' }]}>
              <Text style={[styles.selectedStallInfoText, { color: colors.primary }]}>
                Capaciteit:{" "}
                {stalls.find((s) => s.id === selectedStall)?.capacity} kippen
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: isDarkMode ? '#333' : '#e0e0e0', paddingTop: insets.top }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Dagelijkse Invoer</Text>
        <IconButton
          icon="close"
          size={24}
          iconColor={colors.primary}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("MainTabs", { screen: "Dashboard" });
            }
          }}
        />
      </View>

      <ScrollView style={styles.scrollContent}>
        <Text style={[styles.date, { color: colors.onSurfaceVariant }]}>
          {new Date().toLocaleDateString("nl-NL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>

        {renderStallSelector()}

        {stalls.length > 0 && selectedStall && (
          <>
            <Card style={[styles.card, { backgroundColor: colors.surface }]}>
              <Card.Content>
                <Title style={[styles.cardTitle, { color: colors.primary }]}>Eieren Productie</Title>
                <TextInput
                  label="Kleine eieren (S)"
                  value={eggData.small}
                  onChangeText={(text) =>
                    setEggData({ ...eggData, small: text })
                  }
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: colors.surface }]}
                  mode="outlined"
                  left={<TextInput.Icon icon="egg" color={colors.onSurfaceVariant} />}
                />
                <TextInput
                  label="Middelgrote eieren (M)"
                  value={eggData.medium}
                  onChangeText={(text) =>
                    setEggData({ ...eggData, medium: text })
                  }
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: colors.surface }]}
                  mode="outlined"
                  left={<TextInput.Icon icon="egg" color={colors.onSurfaceVariant} />}
                />
                <TextInput
                  label="Grote eieren (L)"
                  value={eggData.large}
                  onChangeText={(text) =>
                    setEggData({ ...eggData, large: text })
                  }
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: colors.surface }]}
                  mode="outlined"
                  left={<TextInput.Icon icon="egg" color={colors.onSurfaceVariant} />}
                />
                <View style={[styles.totalEggsContainer, { backgroundColor: isDarkMode ? '#1B5E20' : '#E8F5E9' }]}>
                  <Text style={[styles.totalEggsLabel, { color: colors.primary }]}>Totaal:</Text>
                  <Text style={[styles.totalEggsValue, { color: colors.primary }]}>
                    {parseInt(eggData.small || 0) +
                      parseInt(eggData.medium || 0) +
                      parseInt(eggData.large || 0) || 0}{" "}
                    eieren
                  </Text>
                </View>
              </Card.Content>
            </Card>

            <Card style={[styles.card, { backgroundColor: colors.surface }]}>
              <Card.Content>
                <Title style={[styles.cardTitle, { color: colors.primary }]}>Verbruik</Title>
                <TextInput
                  label="Voer verbruik (kg)"
                  value={feedConsumption}
                  onChangeText={setFeedConsumption}
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: colors.surface }]}
                  mode="outlined"
                  left={<TextInput.Icon icon="food-drumstick" color={colors.onSurfaceVariant} />}
                />
                <TextInput
                  label="Water verbruik (liter)"
                  value={waterConsumption}
                  onChangeText={setWaterConsumption}
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: colors.surface }]}
                  mode="outlined"
                  left={<TextInput.Icon icon="water" color={colors.onSurfaceVariant} />}
                />
              </Card.Content>
            </Card>

            <Card style={[styles.card, { backgroundColor: colors.surface }]}>
              <Card.Content>
                <Title style={[styles.cardTitle, { color: colors.primary }]}>Uitval</Title>
                <TextInput
                  label="Aantal uitgevallen kippen"
                  value={casualties}
                  onChangeText={setCasualties}
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: colors.surface }]}
                  mode="outlined"
                  left={<TextInput.Icon icon="alert-circle" color={colors.onSurfaceVariant} />}
                />
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              buttonColor={colors.primary}
              loading={isLoading}
              disabled={isLoading}
              icon="check"
            >
              Gegevens Opslaan
            </Button>
          </>
        )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  date: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
    fontWeight: "500",
  },
  stallCard: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: "#fff",
  },
  singleStallHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stallLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  selectedStallChip: {
    backgroundColor: "#E8F5E9",
  },
  selectedStallText: {
    color: "#2E7D32",
    fontWeight: "bold",
  },
  stallCapacity: {
    fontSize: 14,
    color: "#666",
  },
  preSelectedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontStyle: "italic",
    marginTop: 4,
  },
  stallSelectorTitle: {
    fontSize: 18,
    color: "#2E7D32",
    marginBottom: 8,
  },
  preSelectedHint: {
    fontSize: 12,
    color: "#4CAF50",
    marginBottom: 12,
    fontStyle: "italic",
  },
  stallChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  stallChip: {
    marginBottom: 4,
  },
  selectedStallChipMulti: {
    backgroundColor: "#2E7D32",
  },
  selectedStallTextMulti: {
    color: "#fff",
    fontWeight: "bold",
  },
  selectedStallInfo: {
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
  },
  selectedStallInfoText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
  },
  noStallsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  settingsButton: {
    marginTop: 8,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    color: "#2E7D32",
    marginBottom: 12,
    fontSize: 18,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  totalEggsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  totalEggsLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  totalEggsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 32,
    paddingVertical: 8,
  },
});
