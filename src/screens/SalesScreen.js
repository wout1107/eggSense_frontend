import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ScrollView,
} from "react-native";
import {
  Card,
  Button,
  Dialog,
  Portal,
  TextInput,
  Chip,
  FAB,
  Searchbar,
  SegmentedButtons,
  IconButton,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import salesService from "../services/salesService";
import customerService from "../services/customerService";

export default function SalesScreen({ navigation }) {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [newSale, setNewSale] = useState({
    customerId: null,
    eggsSmall: "",
    eggsMedium: "",
    eggsLarge: "",
    eggsRejected: "",
    totalPrice: "",
    notes: "",
  });

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      // Load sales from last 30 days
      const salesData = await salesService.listOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setSales(salesData);
      setFilteredSales(salesData);

      // Load customers for dropdown
      const customersData = await customerService.listCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading sales data:", error);
      Alert.alert("Fout", "Kon verkoopgegevens niet ophalen");
    } finally {
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Filter sales based on search query
    if (searchQuery.trim() === "") {
      setFilteredSales(sales);
    } else {
      const filtered = sales.filter((sale) => {
        const customer = customers.find((c) => c.id === sale.customerId);
        return (
          customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sale.id.toString().includes(searchQuery)
        );
      });
      setFilteredSales(filtered);
    }
  }, [searchQuery, sales, customers]);

  const onRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim()) {
      Alert.alert("Fout", "Vul een naam in voor de klant");
      return;
    }

    try {
      const createdCustomer = await customerService.createCustomer({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
        notes: newCustomer.notes,
      });

      // Reload customers and select the newly created one
      const customersData = await customerService.listCustomers();
      setCustomers(customersData);
      setNewSale({ ...newSale, customerId: createdCustomer.id });

      setShowCustomerDialog(false);
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      });
      Alert.alert("Succes", "Klant succesvol aangemaakt");
    } catch (error) {
      console.error("Error creating customer:", error);
      Alert.alert("Fout", "Kon klant niet aanmaken");
    }
  };

  const handleCreateSale = async () => {
    if (!newSale.customerId) {
      Alert.alert("Fout", "Selecteer een klant");
      return;
    }

    const totalEggs =
      parseInt(newSale.eggsSmall || 0) +
      parseInt(newSale.eggsMedium || 0) +
      parseInt(newSale.eggsLarge || 0);

    if (totalEggs === 0) {
      Alert.alert("Fout", "Voer minstens één type ei in");
      return;
    }

    try {
      await salesService.createOrder({
        customerId: newSale.customerId,
        eggsSmall: parseInt(newSale.eggsSmall || 0),
        eggsMedium: parseInt(newSale.eggsMedium || 0),
        eggsLarge: parseInt(newSale.eggsLarge || 0),
        eggsRejected: parseInt(newSale.eggsRejected || 0),
        totalPrice: parseFloat(newSale.totalPrice || 0),
        notes: newSale.notes,
      });

      setShowDialog(false);
      setNewSale({
        customerId: null,
        eggsSmall: "",
        eggsMedium: "",
        eggsLarge: "",
        eggsRejected: "",
        totalPrice: "",
        notes: "",
      });
      await loadData();
      Alert.alert("Succes", "Verkoop succesvol aangemaakt");
    } catch (error) {
      console.error("Error creating sale:", error);
      Alert.alert("Fout", "Kon verkoop niet aanmaken");
    }
  };

  const handleUpdateStatus = async (saleId, newStatus) => {
    try {
      await salesService.updateStatus(saleId, newStatus);
      await loadData();
      Alert.alert("Succes", "Status bijgewerkt");
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Fout", "Kon status niet bijwerken");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#FF9800";
      case "CONFIRMED":
        return "#2196F3";
      case "DELIVERED":
        return "#4CAF50";
      case "CANCELLED":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "In behandeling";
      case "CONFIRMED":
        return "Bevestigd";
      case "DELIVERED":
        return "Geleverd";
      case "CANCELLED":
        return "Geannuleerd";
      default:
        return status;
    }
  };

  const renderSaleItem = ({ item }) => {
    const customer = customers.find((c) => c.id === item.customerId);
    const totalEggs =
      (item.eggsSmall || 0) + (item.eggsMedium || 0) + (item.eggsLarge || 0);

    return (
      <Card
        style={styles.saleCard}
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
      >
        <Card.Content>
          <View style={styles.saleHeader}>
            <View style={styles.saleInfo}>
              <Text
                style={styles.customerName}
                onPress={() =>
                  customer &&
                  navigation.navigate("CustomerDetail", {
                    customerId: customer.id,
                  })
                }
              >
                {customer?.name || "Onbekende klant"}
              </Text>
              <Text style={styles.saleDate}>
                {new Date(item.saleTime).toLocaleDateString("nl-NL", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            <Chip
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(item.status) },
              ]}
              textStyle={styles.statusText}
            >
              {getStatusLabel(item.status)}
            </Chip>
          </View>

          <View style={styles.eggBreakdown}>
            {item.eggsSmall > 0 && (
              <View style={styles.eggItem}>
                <Icon name="egg" size={16} color="#666" />
                <Text style={styles.eggText}>S: {item.eggsSmall}</Text>
              </View>
            )}
            {item.eggsMedium > 0 && (
              <View style={styles.eggItem}>
                <Icon name="egg" size={18} color="#666" />
                <Text style={styles.eggText}>M: {item.eggsMedium}</Text>
              </View>
            )}
            {item.eggsLarge > 0 && (
              <View style={styles.eggItem}>
                <Icon name="egg" size={20} color="#666" />
                <Text style={styles.eggText}>L: {item.eggsLarge}</Text>
              </View>
            )}
          </View>

          <View style={styles.saleFooter}>
            <Text style={styles.totalEggs}>Totaal: {totalEggs} eieren</Text>
            <Text style={styles.totalPrice}>€{item.totalPrice.toFixed(2)}</Text>
          </View>

          {item.status === "PENDING" && (
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => handleUpdateStatus(item.id, "CONFIRMED")}
                style={styles.confirmButton}
                buttonColor="#4CAF50"
              >
                Bevestigen
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleUpdateStatus(item.id, "CANCELLED")}
                style={styles.cancelButton}
                textColor="#F44336"
              >
                Annuleren
              </Button>
            </View>
          )}

          {item.status === "CONFIRMED" && (
            <Button
              mode="contained"
              onPress={() => handleUpdateStatus(item.id, "DELIVERED")}
              style={styles.deliverButton}
              buttonColor="#2196F3"
            >
              Markeer als geleverd
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verkoop</Text>
        <Searchbar
          placeholder="Zoek op klant of order #"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <SegmentedButtons
          value={statusFilter}
          onValueChange={setStatusFilter}
          buttons={[
            { value: "all", label: "Alle" },
            { value: "PENDING", label: "Pending" },
            { value: "CONFIRMED", label: "Bevestigd" },
            { value: "DELIVERED", label: "Geleverd" },
          ]}
          style={styles.filterButtons}
        />
      </View>

      <FlatList
        data={filteredSales}
        renderItem={renderSaleItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="cart-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Geen verkopen gevonden</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowDialog(true)}
        label="Nieuwe Verkoop"
      />

      {/* Main Sale Dialog */}
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Nieuwe Verkoop</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView
              contentContainerStyle={styles.dialogContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.customerSectionHeader}>
                <Text style={styles.inputLabel}>Klant *</Text>
                <IconButton
                  icon="account-plus"
                  size={24}
                  onPress={() => setShowCustomerDialog(true)}
                  iconColor="#2E7D32"
                />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.customerScrollView}
                contentContainerStyle={styles.customerSelector}
              >
                {customers.map((customer) => (
                  <Chip
                    key={customer.id}
                    selected={newSale.customerId === customer.id}
                    onPress={() =>
                      setNewSale({ ...newSale, customerId: customer.id })
                    }
                    style={styles.customerChip}
                  >
                    {customer.name}
                  </Chip>
                ))}
              </ScrollView>

              <TextInput
                label="Kleine Eieren"
                value={newSale.eggsSmall}
                onChangeText={(text) =>
                  setNewSale({ ...newSale, eggsSmall: text })
                }
                keyboardType="numeric"
                style={styles.input}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <TextInput
                label="Middelgrote Eieren"
                value={newSale.eggsMedium}
                onChangeText={(text) =>
                  setNewSale({ ...newSale, eggsMedium: text })
                }
                keyboardType="numeric"
                style={styles.input}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <TextInput
                label="Grote Eieren"
                value={newSale.eggsLarge}
                onChangeText={(text) =>
                  setNewSale({ ...newSale, eggsLarge: text })
                }
                keyboardType="numeric"
                style={styles.input}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <TextInput
                label="Totaalprijs (€)"
                value={newSale.totalPrice}
                onChangeText={(text) =>
                  setNewSale({ ...newSale, totalPrice: text })
                }
                keyboardType="decimal-pad"
                style={styles.input}
                returnKeyType="done"
              />

              <TextInput
                label="Notities"
                value={newSale.notes}
                onChangeText={(text) => setNewSale({ ...newSale, notes: text })}
                multiline
                numberOfLines={3}
                style={styles.input}
                returnKeyType="done"
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Annuleren</Button>
            <Button onPress={handleCreateSale}>Aanmaken</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* New Customer Dialog */}
      <Portal>
        <Dialog
          visible={showCustomerDialog}
          onDismiss={() => setShowCustomerDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Nieuwe Klant</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView
              contentContainerStyle={styles.dialogContent}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                label="Naam *"
                value={newCustomer.name}
                onChangeText={(text) =>
                  setNewCustomer({ ...newCustomer, name: text })
                }
                style={styles.input}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <TextInput
                label="Email"
                value={newCustomer.email}
                onChangeText={(text) =>
                  setNewCustomer({ ...newCustomer, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <TextInput
                label="Telefoon"
                value={newCustomer.phone}
                onChangeText={(text) =>
                  setNewCustomer({ ...newCustomer, phone: text })
                }
                keyboardType="phone-pad"
                style={styles.input}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <TextInput
                label="Adres"
                value={newCustomer.address}
                onChangeText={(text) =>
                  setNewCustomer({ ...newCustomer, address: text })
                }
                multiline
                numberOfLines={2}
                style={styles.input}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <TextInput
                label="Notities"
                value={newCustomer.notes}
                onChangeText={(text) =>
                  setNewCustomer({ ...newCustomer, notes: text })
                }
                multiline
                numberOfLines={3}
                style={styles.input}
                returnKeyType="done"
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowCustomerDialog(false)}>
              Annuleren
            </Button>
            <Button onPress={handleCreateCustomer}>Aanmaken</Button>
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
    marginBottom: 12,
  },
  searchBar: {
    marginBottom: 12,
    elevation: 0,
    backgroundColor: "#f5f5f5",
  },
  filterButtons: {
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
  },
  saleCard: {
    marginBottom: 12,
    elevation: 2,
  },
  saleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  saleInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  saleDate: {
    fontSize: 14,
    color: "#666",
  },
  statusChip: {
    marginLeft: 8,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  eggBreakdown: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  eggItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  eggText: {
    fontSize: 14,
    color: "#666",
  },
  saleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  totalEggs: {
    fontSize: 14,
    color: "#666",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  confirmButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  deliverButton: {
    marginTop: 12,
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
  dialog: {
    maxHeight: "90%",
  },
  scrollArea: {
    maxHeight: 400,
    paddingHorizontal: 0,
  },
  dialogContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  customerSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  customerScrollView: {
    marginBottom: 16,
  },
  customerSelector: {
    flexDirection: "row",
    gap: 8,
  },
  customerChip: {
    marginBottom: 4,
  },
  input: {
    marginBottom: 12,
  },
});
