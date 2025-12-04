import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { Card, Title, TextInput, Button, Divider } from "react-native-paper";
import productionService from "../services/productionService";
import stallService from "../services/stallService";

export default function DailyInputScreen() {
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
      setStalls(stallList);
      if (stallList.length > 0) {
        setSelectedStall(stallList[0].id);
      }
    } catch (error) {
      console.error("Error loading stalls:", error);
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
        recordDate: new Date().toISOString().split('T')[0],
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

      Alert.alert(
        "Gegevens Opgeslagen",
        `Totaal ${totalEggs} eieren geregistreerd voor vandaag`,
        [{ text: "OK", onPress: () => resetForm() }]
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Dagelijkse Invoer</Text>
      <Text style={styles.date}>{new Date().toLocaleDateString("nl-NL")}</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Eieren Productie</Title>
          <TextInput
            label="Kleine eieren (S)"
            value={eggData.small}
            onChangeText={(text) => setEggData({ ...eggData, small: text })}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Middelgrote eieren (M)"
            value={eggData.medium}
            onChangeText={(text) => setEggData({ ...eggData, medium: text })}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Grote eieren (L)"
            value={eggData.large}
            onChangeText={(text) => setEggData({ ...eggData, large: text })}
            keyboardType="numeric"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Verbruik</Title>
          <TextInput
            label="Voer verbruik (kg)"
            value={feedConsumption}
            onChangeText={setFeedConsumption}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Water verbruik (liter)"
            value={waterConsumption}
            onChangeText={setWaterConsumption}
            keyboardType="numeric"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Uitval</Title>
          <TextInput
            label="Aantal uitgevallen kippen"
            value={casualties}
            onChangeText={setCasualties}
            keyboardType="numeric"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.saveButton}
        buttonColor="#2E7D32"
        loading={isLoading}
        disabled={isLoading}
      >
        Gegevens Opslaan
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    color: "#2E7D32",
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 32,
    paddingVertical: 8,
  },
});
