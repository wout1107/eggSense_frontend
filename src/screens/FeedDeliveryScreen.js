import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Card,
  Button,
  Dialog,
  Portal,
  TextInput,
  FAB,
  Chip,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import api from "../services/api";
import stallService from "../services/stallService";

export default function FeedDeliveryScreen() {
  const [deliveries, setDeliveries] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const [newDelivery, setNewDelivery] = useState({
    stallId: null,
    supplier: "",
    quantityKg: "",
    cost: "",
    notes: "",
  });

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      // Load stalls
      const stallsData = await stallService.listStalls();
      setStalls(stallsData);

      const activeStall = stallsData.find((s) => s.active) || stallsData[0];
      if (activeStall) {
        setSelectedStall(activeStall);
        setNewDelivery({ ...newDelivery, stallId: activeStall.id });
        await loadStallData(activeStall.id);
      }
    } catch (error) {
      console.error("Error loading feed deliveries:", error);
      Alert.alert("Fout", "Kon voerleveringen niet ophalen");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadStallData = async (stallId) => {
    try {
      // Load deliveries for selected stall
      const response = await api.get("/feed-deliveries", {
        params: { stallId },
      });
      setDeliveries(response.data);

      // Load inventory
      const invResponse = await api.get(
        `/feed-deliveries/stall/${stallId}/inventory`
      );
      setInventory(invResponse.data);
    } catch (error) {
      console.error("Error loading stall feed data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const handleStallChange = async (stall) => {
    setSelectedStall(stall);
    setNewDelivery({ ...newDelivery, stallId: stall.id });
    await loadStallData(stall.id);
  };

  const handleCreateDelivery = async () => {
    if (!newDelivery.supplier.trim()) {
      Alert.alert("Fout", "Vul een leverancier in");
      return;
    }

    if (!newDelivery.quantityKg || parseFloat(newDelivery.quantityKg) <= 0) {
      Alert.alert("Fout", "Vul een geldige hoeveelheid in");
      return;
    }

    try {
      await api.post("/feed-deliveries", {
        stallId: newDelivery.stallId,
        supplier: newDelivery.supplier,
        quantityKg: parseFloat(newDelivery.quantityKg),
        cost: parseFloat(newDelivery.cost || 0),
        notes: newDelivery.notes,
      });

      setShowDialog(false);
      setNewDelivery({
        stallId: selectedStall?.id,
        supplier: "",
        quantityKg: "",
        cost: "",
        notes: "",
      });
      await loadData();
      Alert.alert("Succes", "Voerlevering succesvol aangemaakt");
    } catch (error) {
      console.error("Error creating feed delivery:", error);
      Alert.alert("Fout", "Kon voerlevering niet aanmaken");
    }
  };

  const renderStallSelector = () => {
    if (stalls.length === 0) return null;

    return (
      <View style={styles.stallSelector}>
        {stalls.map((stall) => (
          <Chip
            key={stall.id}
            selected={selectedStall?.id === stall.id}
            onPress={() => handleStallChange(stall)}
            style={styles.stallChip}
          >
            {stall.name}
          </Chip>
        ))}
      </View>
    );
  };

  const renderInventoryCard = () => {
    if (!inventory) return null;

    return (
      <Card style={styles.inventoryCard}>
        <Card.Content>
          <View style={styles.inventoryHeader}>
            <Icon name="warehouse" size={32} color="#2E7D32" />
            <Text style={styles.inventoryTitle}>Voorraad Overzicht</Text>
          </View>
          <View style={styles.inventoryStats}>
            <View style={styles.inventoryStat}>
              <Text style={styles.inventoryValue}>
                {inventory.currentStock?.toFixed(0) || 0} kg
              </Text>
              <Text style={styles.inventoryLabel}>Huidige voorraad</Text>
            </View>
            <View style={styles.inventoryStat}>
              <Text style={styles.inventoryValue}>
                {inventory.avgDailyConsumption?.toFixed(1) || 0} kg/dag
              </Text>
              <Text style={styles.inventoryLabel}>Gemiddeld verbruik</Text>
            </View>
            <View style={styles.inventoryStat}>
              <Text style={styles.inventoryValue}>
                {inventory.daysRemaining?.toFixed(0) || 0} dagen
              </Text>
              <Text style={styles.inventoryLabel}>Voorraad resterend</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderDeliveryItem = ({ item }) => (
    <Card style={styles.deliveryCard}>
      <Card.Content>
        <View style={styles.deliveryHeader}>
          <View style={styles.deliveryInfo}>
            <Text style={styles.supplierName}>{item.supplier}</Text>
            <Text style={styles.deliveryDate}>
              {new Date(item.deliveryTime).toLocaleDateString("nl-NL", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <Icon name="truck-delivery" size={32} color="#2E7D32" />
        </View>

        <View style={styles.deliveryDetails}>
          <View style={styles.detailRow}>
            <Icon name="weight-kilogram" size={20} color="#666" />
            <Text style={styles.detailText}>{item.quantityKg} kg</Text>
          </View>
          {item.cost > 0 && (
            <View style={styles.detailRow}>
              <Icon name="currency-eur" size={20} color="#666" />
              <Text style={styles.detailText}>€{item.cost.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {item.notes && <Text style={styles.notes}>Notitie: {item.notes}</Text>}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voerleveringen</Text>
      </View>

      {renderStallSelector()}
      {renderInventoryCard()}

      <FlatList
        data={deliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="truck-delivery-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Geen leveringen gevonden</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowDialog(true)}
        label="Nieuwe Levering"
      />

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Nieuwe Voerlevering</Dialog.Title>
          <Dialog.ScrollArea>
            <View style={styles.dialogContent}>
              <TextInput
                label="Leverancier *"
                value={newDelivery.supplier}
                onChangeText={(text) =>
                  setNewDelivery({ ...newDelivery, supplier: text })
                }
                style={styles.input}
              />

              <TextInput
                label="Hoeveelheid (kg) *"
                value={newDelivery.quantityKg}
                onChangeText={(text) =>
                  setNewDelivery({ ...newDelivery, quantityKg: text })
                }
                keyboardType="numeric"
                style={styles.input}
              />

              <TextInput
                label="Kosten (€)"
                value={newDelivery.cost}
                onChangeText={(text) =>
                  setNewDelivery({ ...newDelivery, cost: text })
                }
                keyboardType="decimal-pad"
                style={styles.input}
              />

              <TextInput
                label="Notities"
                value={newDelivery.notes}
                onChangeText={(text) =>
                  setNewDelivery({ ...newDelivery, notes: text })
                }
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            </View>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Annuleren</Button>
            <Button onPress={handleCreateDelivery}>Aanmaken</Button>
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
  stallSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 16,
    backgroundColor: "#fff",
  },
  stallChip: {
    marginBottom: 4,
  },
  inventoryCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  inventoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  inventoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginLeft: 12,
  },
  inventoryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  inventoryStat: {
    alignItems: "center",
  },
  inventoryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  inventoryLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  deliveryCard: {
    marginBottom: 12,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 14,
    color: "#666",
  },
  deliveryDetails: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
  },
  notes: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#2E7D32",
  },
  dialogContent: {
    padding: 16,
  },
  input: {
    marginBottom: 12,
  },
});
