import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import axios from "axios";

// Prefer same-origin in Docker via Nginx, fallback for local dev
const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE as string) ||
  (typeof window !== "undefined" ? "/api" : "http://localhost:8080/api");

interface Stall {
  id: number;
  name: string;
}

export default function App() {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [stallName, setStallName] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStalls();
  }, []);

  const fetchStalls = async () => {
    try {
      setRefreshing(true);
      setError(null);
      console.log("Fetching stalls from:", `${API_BASE_URL}/stalls`);

      const response = await axios.get(`${API_BASE_URL}/stalls`);
      console.log("Response:", response.data);

      setStalls(response.data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Kon stallen niet ophalen";

      console.error("Error fetching stalls:", error);
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  const createStall = async () => {
    if (!stallName.trim()) {
      Alert.alert("Validatie", "Naam is verplicht");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Creating stall:", { name: stallName.trim() });

      const response = await axios.post(`${API_BASE_URL}/stalls`, {
        name: stallName.trim(),
      });

      console.log("Stall created:", response.data);

      // Add the new stall to the list
      setStalls([...stalls, response.data]);
      setStallName("");
      Alert.alert("Succes", "Stal succesvol toegevoegd");
    } catch (error: any) {
      let errorMessage = "Kon stal niet toevoegen";

      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error("Error creating stall:", error);
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStall = ({ item }: { item: Stall }) => (
    <View style={styles.stallItem}>
      <Text style={styles.stallName}>{item.name}</Text>
      <Text style={styles.stallId}>ID: {item.id}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Text style={styles.title}>EggSense - Stallen</Text>
        <Text style={styles.subtitle}>{API_BASE_URL}</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.dismissText}>Sluiten</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Stal naam"
          value={stallName}
          onChangeText={setStallName}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={createStall}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Toevoegen</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Stallen ({stalls.length})</Text>
        <TouchableOpacity onPress={fetchStalls} disabled={refreshing}>
          <Text style={styles.refreshText}>
            {refreshing ? "Laden..." : "🔄 Vernieuwen"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={stalls}
        renderItem={renderStall}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={fetchStalls}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {refreshing
              ? "Laden..."
              : "Geen stallen gevonden\nVoeg er een toe!"}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 12,
    color: "#fff",
    marginTop: 5,
    opacity: 0.8,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: "#c62828",
    flex: 1,
    fontSize: 14,
  },
  dismissText: {
    color: "#c62828",
    fontWeight: "bold",
    marginLeft: 10,
  },
  formContainer: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 10,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  refreshText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    padding: 20,
  },
  stallItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stallName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  stallId: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 20,
    lineHeight: 24,
  },
});
