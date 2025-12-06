import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert, // Add Alert
} from "react-native";
import {
  Card,
  Title,
  TextInput,
  Button,
  Paragraph,
  FAB,
  Modal,
  Portal,
  Chip,
  Searchbar,
  SegmentedButtons,
  IconButton,
  Avatar,
  Divider,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import salesService from "../services/salesService";
import customerService from "../services/customerService";

export default function SalesScreen() {
  const navigation = useNavigation();
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [eggInventory, setEggInventory] = useState({
    small: 150,
    medium: 200,
    large: 180,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [customerDetailVisible, setCustomerDetailVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [newOrder, setNewOrder] = useState({
    customerId: "",
    customerName: "",
    small: "",
    medium: "",
    large: "",
    pricePerEgg: "0.25",
    deliveryDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [customersData, ordersData] = await Promise.all([
        customerService.listCustomers(),
        salesService.listOrders(),
      ]);

      setCustomers(customersData);
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setFilteredCustomers(customersData);
    } catch (error) {
      console.error("Error loading sales data:", error);
      Alert.alert("Fout", "Kon gegevens niet ophalen");
    } finally {
      setRefreshing(false);
    }
  };

  // Add this function if missing
  const onRefresh = React.useCallback(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, orderFilter, searchQuery]);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery]);

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (orderFilter !== "all") {
      filtered = filtered.filter((order) => {
        switch (orderFilter) {
          case "pending":
            return order.status === "Pending";
          case "transit":
            return order.status === "In Transit";
          case "delivered":
            return order.status === "Geleverd";
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((order) =>
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const filterCustomers = () => {
    if (searchQuery) {
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  };

  const addCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      Alert.alert("Fout", "Naam en telefoonnummer zijn verplicht");
      return;
    }

    try {
      const createdCustomer = await customerService.createCustomer(newCustomer);
      setCustomers([...customers, createdCustomer]);
      setModalVisible(false);
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      });
      Alert.alert("Succes", "Klant toegevoegd");
    } catch (error) {
      Alert.alert("Fout", "Kon klant niet toevoegen");
    }
  };

  const addOrder = async () => {
    if (!newOrder.customerId) {
      Alert.alert("Fout", "Selecteer een klant");
      return;
    }

    try {
      const createdOrder = await salesService.createOrder({
        ...newOrder,
        status: "Pending",
        paymentStatus: "Unpaid",
        date: new Date().toISOString().split("T")[0],
      });

      setOrders([createdOrder, ...orders]);
      setOrderModalVisible(false);
      // Reset form...
      Alert.alert("Succes", "Bestelling geplaatst");
    } catch (error) {
      Alert.alert("Fout", "Kon bestelling niet plaatsen");
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    Alert.alert("Succes", `Bestelling status bijgewerkt naar ${newStatus}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Geleverd":
        return "#4CAF50";
      case "In Transit":
        return "#2196F3";
      case "Pending":
        return "#FF9800";
      case "Geannuleerd":
        return "#F44336";
      default:
        return "#666666";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Betaald":
        return "#4CAF50";
      case "Openstaand":
        return "#FF9800";
      default:
        return "#666666";
    }
  };

  const selectCustomerForOrder = () => {
    Alert.alert(
      "Selecteer Klant",
      "Kies een klant voor deze bestelling",
      [
        ...customers.map((customer) => ({
          text: customer.name,
          onPress: () =>
            setNewOrder({
              ...newOrder,
              customerId: customer.id,
              customerName: customer.name,
            }),
        })),
        { text: "Annuleren", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setCustomerDetailVisible(true);
  };

  const renderCustomer = ({ item }) => (
    <TouchableOpacity onPress={() => viewCustomerDetails(item)}>
      <Card style={styles.customerCard}>
        <Card.Content>
          <View style={styles.customerHeader}>
            <Avatar.Icon
              size={48}
              icon="account"
              style={styles.customerAvatar}
              color="#2E7D32"
            />
            <View style={styles.customerInfo}>
              <Title style={styles.customerName}>{item.name}</Title>
              <Paragraph style={styles.customerContact}>{item.phone}</Paragraph>
              <Paragraph style={styles.customerContact}>{item.email}</Paragraph>
            </View>
          </View>
          <Divider style={styles.customerDivider} />
          <View style={styles.customerStats}>
            <View style={styles.customerStat}>
              <Text style={styles.customerStatNumber}>{item.totalOrders}</Text>
              <Text style={styles.customerStatLabel}>Bestellingen</Text>
            </View>
            <View style={styles.customerStat}>
              <Text style={styles.customerStatNumber}>
                €{item.totalRevenue.toFixed(2)}
              </Text>
              <Text style={styles.customerStatLabel}>Omzet</Text>
            </View>
            <View style={styles.customerStat}>
              <Text style={styles.customerStatNumber}>
                {item.lastOrder || "N/A"}
              </Text>
              <Text style={styles.customerStatLabel}>Laatste order</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
    >
      <Card style={styles.orderCard}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Title style={styles.orderCustomer}>{item.customerName}</Title>
              <Text style={styles.orderDate}>Besteld: {item.date}</Text>
              <Text style={styles.orderDate}>
                Levering: {item.deliveryDate}
              </Text>
            </View>
            <View style={styles.orderHeaderRight}>
              <Chip
                mode="flat"
                textStyle={{
                  color: getStatusColor(item.status),
                  fontWeight: "bold",
                }}
                style={[
                  styles.statusChip,
                  { backgroundColor: `${getStatusColor(item.status)}20` },
                ]}
              >
                {item.status}
              </Chip>
              <Chip
                mode="flat"
                textStyle={{
                  color: getPaymentStatusColor(item.paymentStatus),
                  fontSize: 11,
                }}
                style={[
                  styles.paymentChip,
                  {
                    backgroundColor: `${getPaymentStatusColor(
                      item.paymentStatus
                    )}20`,
                  },
                ]}
              >
                {item.paymentStatus}
              </Chip>
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.orderEggs}>
              {item.small > 0 && (
                <Chip icon="egg" style={styles.eggChip}>
                  S: {item.small}
                </Chip>
              )}
              {item.medium > 0 && (
                <Chip icon="egg" style={styles.eggChip}>
                  M: {item.medium}
                </Chip>
              )}
              {item.large > 0 && (
                <Chip icon="egg" style={styles.eggChip}>
                  L: {item.large}
                </Chip>
              )}
            </View>
            <Text style={styles.orderTotal}>€{item.total.toFixed(2)}</Text>
          </View>

          {item.status === "Pending" && (
            <View style={styles.orderActions}>
              <Button
                mode="outlined"
                onPress={() => updateOrderStatus(item.id, "In Transit")}
                compact
                style={styles.actionButton}
              >
                Start Levering
              </Button>
              <Button
                mode="outlined"
                onPress={() => updateOrderStatus(item.id, "Geannuleerd")}
                compact
                textColor="#F44336"
                style={styles.actionButton}
              >
                Annuleren
              </Button>
            </View>
          )}

          {item.status === "In Transit" && (
            <View style={styles.orderActions}>
              <Button
                mode="contained"
                onPress={() => updateOrderStatus(item.id, "Geleverd")}
                compact
                buttonColor="#4CAF50"
                style={styles.actionButton}
              >
                Markeer Geleverd
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const totalInventory =
    eggInventory.small + eggInventory.medium + eggInventory.large;
  const inventoryValue =
    eggInventory.small * 0.2 +
    eggInventory.medium * 0.25 +
    eggInventory.large * 0.3;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Verkoop Beheer</Text>
          <IconButton
            icon="plus-circle"
            size={28}
            iconColor="#2E7D32"
            onPress={() => setOrderModalVisible(true)}
          />
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Zoek klanten of bestellingen..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#2E7D32"
        />

        {/* Inventory Overview */}
        <Card style={styles.inventoryCard}>
          <Card.Content>
            <View style={styles.inventoryHeader}>
              <Title style={styles.cardTitle}>Eieren Voorraad</Title>
              <Chip
                icon="package-variant"
                style={styles.inventoryTotalChip}
                textStyle={{ fontWeight: "bold" }}
              >
                {totalInventory} stuks
              </Chip>
            </View>
            <View style={styles.inventoryGrid}>
              <View style={styles.inventoryItem}>
                <IconButton
                  icon="egg"
                  size={20}
                  iconColor="#FF9800"
                  style={styles.inventoryIcon}
                />
                <View>
                  <Text style={styles.inventoryNumber}>
                    {eggInventory.small}
                  </Text>
                  <Text style={styles.inventoryLabel}>Klein (S)</Text>
                </View>
              </View>
              <View style={styles.inventoryItem}>
                <IconButton
                  icon="egg"
                  size={24}
                  iconColor="#2E7D32"
                  style={styles.inventoryIcon}
                />
                <View>
                  <Text style={styles.inventoryNumber}>
                    {eggInventory.medium}
                  </Text>
                  <Text style={styles.inventoryLabel}>Medium (M)</Text>
                </View>
              </View>
              <View style={styles.inventoryItem}>
                <IconButton
                  icon="egg"
                  size={28}
                  iconColor="#1976D2"
                  style={styles.inventoryIcon}
                />
                <View>
                  <Text style={styles.inventoryNumber}>
                    {eggInventory.large}
                  </Text>
                  <Text style={styles.inventoryLabel}>Groot (L)</Text>
                </View>
              </View>
            </View>
            <Divider style={styles.inventoryDivider} />
            <View style={styles.inventoryValue}>
              <Text style={styles.inventoryValueLabel}>Voorraad waarde:</Text>
              <Text style={styles.inventoryValueAmount}>
                €{inventoryValue.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Order Filter */}
        <SegmentedButtons
          value={orderFilter}
          onValueChange={setOrderFilter}
          buttons={[
            { value: "all", label: "Alle" },
            { value: "pending", label: "Pending" },
            { value: "transit", label: "Transit" },
            { value: "delivered", label: "Geleverd" },
          ]}
          style={styles.orderFilter}
        />

        {/* Recent Orders */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>
            Bestellingen ({filteredOrders.length})
          </Title>
          {filteredOrders.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Paragraph style={styles.emptyText}>
                  Geen bestellingen gevonden
                </Paragraph>
              </Card.Content>
            </Card>
          ) : (
            <FlatList
              data={filteredOrders}
              renderItem={renderOrder}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Customers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>
              Klanten ({filteredCustomers.length})
            </Title>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(true)}
              compact
              icon="plus"
            >
              Nieuwe Klant
            </Button>
          </View>
          {filteredCustomers.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Paragraph style={styles.emptyText}>
                  Geen klanten gevonden
                </Paragraph>
              </Card.Content>
            </Card>
          ) : (
            <FlatList
              data={filteredCustomers.slice(0, 5)}
              renderItem={renderCustomer}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Customer Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>Nieuwe Klant</Title>
            <TextInput
              label="Naam *"
              value={newCustomer.name}
              onChangeText={(text) =>
                setNewCustomer({ ...newCustomer, name: text })
              }
              style={styles.modalInput}
              left={<TextInput.Icon icon="account" />}
            />
            <TextInput
              label="Telefoonnummer *"
              value={newCustomer.phone}
              onChangeText={(text) =>
                setNewCustomer({ ...newCustomer, phone: text })
              }
              keyboardType="phone-pad"
              style={styles.modalInput}
              left={<TextInput.Icon icon="phone" />}
            />
            <TextInput
              label="Email"
              value={newCustomer.email}
              onChangeText={(text) =>
                setNewCustomer({ ...newCustomer, email: text })
              }
              keyboardType="email-address"
              style={styles.modalInput}
              left={<TextInput.Icon icon="email" />}
            />
            <TextInput
              label="Adres"
              value={newCustomer.address}
              onChangeText={(text) =>
                setNewCustomer({ ...newCustomer, address: text })
              }
              multiline
              numberOfLines={2}
              style={styles.modalInput}
              left={<TextInput.Icon icon="map-marker" />}
            />
            <TextInput
              label="Notities"
              value={newCustomer.notes}
              onChangeText={(text) =>
                setNewCustomer({ ...newCustomer, notes: text })
              }
              multiline
              numberOfLines={3}
              style={styles.modalInput}
              left={<TextInput.Icon icon="note-text" />}
            />
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                Annuleren
              </Button>
              <Button
                mode="contained"
                onPress={addCustomer}
                style={styles.modalButton}
                buttonColor="#2E7D32"
              >
                Toevoegen
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Order Modal */}
      <Portal>
        <Modal
          visible={orderModalVisible}
          onDismiss={() => setOrderModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>Nieuwe Bestelling</Title>
            <TouchableOpacity onPress={selectCustomerForOrder}>
              <TextInput
                label="Klant *"
                value={newOrder.customerName}
                editable={false}
                style={styles.modalInput}
                left={<TextInput.Icon icon="account" />}
                right={<TextInput.Icon icon="chevron-down" />}
              />
            </TouchableOpacity>
            <View style={styles.eggInputRow}>
              <TextInput
                label="Klein (S)"
                value={newOrder.small}
                onChangeText={(text) =>
                  setNewOrder({ ...newOrder, small: text })
                }
                keyboardType="numeric"
                style={[styles.modalInput, styles.eggInput]}
                left={<TextInput.Icon icon="egg" />}
              />
              <TextInput
                label="Medium (M)"
                value={newOrder.medium}
                onChangeText={(text) =>
                  setNewOrder({ ...newOrder, medium: text })
                }
                keyboardType="numeric"
                style={[styles.modalInput, styles.eggInput]}
                left={<TextInput.Icon icon="egg" />}
              />
              <TextInput
                label="Groot (L)"
                value={newOrder.large}
                onChangeText={(text) =>
                  setNewOrder({ ...newOrder, large: text })
                }
                keyboardType="numeric"
                style={[styles.modalInput, styles.eggInput]}
                left={<TextInput.Icon icon="egg" />}
              />
            </View>
            <TextInput
              label="Prijs per ei (€)"
              value={newOrder.pricePerEgg}
              onChangeText={(text) =>
                setNewOrder({ ...newOrder, pricePerEgg: text })
              }
              keyboardType="decimal-pad"
              style={styles.modalInput}
              left={<TextInput.Icon icon="currency-eur" />}
            />
            <TextInput
              label="Leverdatum"
              value={newOrder.deliveryDate}
              onChangeText={(text) =>
                setNewOrder({ ...newOrder, deliveryDate: text })
              }
              style={styles.modalInput}
              left={<TextInput.Icon icon="calendar" />}
            />
            <TextInput
              label="Notities"
              value={newOrder.notes}
              onChangeText={(text) => setNewOrder({ ...newOrder, notes: text })}
              multiline
              numberOfLines={3}
              style={styles.modalInput}
              left={<TextInput.Icon icon="note-text" />}
            />
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setOrderModalVisible(false)}
                style={styles.modalButton}
              >
                Annuleren
              </Button>
              <Button
                mode="contained"
                onPress={addOrder}
                style={styles.modalButton}
                buttonColor="#2E7D32"
              >
                Bestelling Maken
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Customer Detail Modal */}
      <Portal>
        <Modal
          visible={customerDetailVisible}
          onDismiss={() => setCustomerDetailVisible(false)}
          contentContainerStyle={styles.modal}
        >
          {selectedCustomer && (
            <ScrollView>
              <View style={styles.customerDetailHeader}>
                <Avatar.Icon size={64} icon="account" color="#2E7D32" />
                <Title style={styles.customerDetailName}>
                  {selectedCustomer.name}
                </Title>
              </View>
              <Divider style={styles.modalDivider} />
              <View style={styles.customerDetailInfo}>
                <IconButton icon="phone" size={20} iconColor="#2E7D32" />
                <Text style={styles.customerDetailText}>
                  {selectedCustomer.phone}
                </Text>
              </View>
              <View style={styles.customerDetailInfo}>
                <IconButton icon="email" size={20} iconColor="#2E7D32" />
                <Text style={styles.customerDetailText}>
                  {selectedCustomer.email}
                </Text>
              </View>
              <View style={styles.customerDetailInfo}>
                <IconButton icon="map-marker" size={20} iconColor="#2E7D32" />
                <Text style={styles.customerDetailText}>
                  {selectedCustomer.address}
                </Text>
              </View>
              <Divider style={styles.modalDivider} />
              <View style={styles.customerDetailStats}>
                <View style={styles.customerDetailStat}>
                  <Text style={styles.customerDetailStatNumber}>
                    {selectedCustomer.totalOrders}
                  </Text>
                  <Text style={styles.customerDetailStatLabel}>
                    Bestellingen
                  </Text>
                </View>
                <View style={styles.customerDetailStat}>
                  <Text style={styles.customerDetailStatNumber}>
                    €{selectedCustomer.totalRevenue.toFixed(2)}
                  </Text>
                  <Text style={styles.customerDetailStatLabel}>
                    Totale Omzet
                  </Text>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() => {
                  setCustomerDetailVisible(false);
                  setNewOrder({
                    ...newOrder,
                    customerId: selectedCustomer.id,
                    customerName: selectedCustomer.name,
                  });
                  setOrderModalVisible(true);
                }}
                style={styles.customerDetailButton}
                buttonColor="#2E7D32"
                icon="plus"
              >
                Nieuwe Bestelling
              </Button>
              <Button
                mode="outlined"
                onPress={() => setCustomerDetailVisible(false)}
                style={styles.customerDetailButton}
              >
                Sluiten
              </Button>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      {/* FAB for quick order */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setOrderModalVisible(true)}
        color="#fff"
      />
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  inventoryCard: {
    marginBottom: 16,
    elevation: 2,
  },
  inventoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    color: "#2E7D32",
    fontSize: 18,
  },
  inventoryTotalChip: {
    backgroundColor: "#E8F5E9",
  },
  inventoryGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  inventoryItem: {
    alignItems: "center",
    flexDirection: "row",
  },
  inventoryIcon: {
    margin: 0,
    marginRight: 8,
  },
  inventoryNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  inventoryLabel: {
    fontSize: 11,
    color: "#666666",
  },
  inventoryDivider: {
    marginVertical: 12,
  },
  inventoryValue: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inventoryValueLabel: {
    fontSize: 14,
    color: "#666666",
  },
  inventoryValueAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  orderFilter: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#2E7D32",
    fontSize: 18,
  },
  customerCard: {
    marginBottom: 12,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  customerAvatar: {
    backgroundColor: "#E8F5E9",
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    color: "#2E7D32",
    marginBottom: 4,
  },
  customerContact: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
  },
  customerDivider: {
    marginVertical: 12,
  },
  customerStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  customerStat: {
    alignItems: "center",
  },
  customerStatNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  customerStatLabel: {
    fontSize: 11,
    color: "#666666",
  },
  orderCard: {
    marginBottom: 12,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderHeaderRight: {
    alignItems: "flex-end",
  },
  orderCustomer: {
    fontSize: 16,
    color: "#2E7D32",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 11,
    color: "#666666",
    marginBottom: 2,
  },
  statusChip: {
    marginBottom: 4,
  },
  paymentChip: {
    height: 24,
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderEggs: {
    flexDirection: "row",
    gap: 4,
  },
  eggChip: {
    height: 28,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  orderActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyCard: {
    elevation: 1,
  },
  emptyText: {
    textAlign: "center",
    color: "#999999",
    fontStyle: "italic",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: "90%",
  },
  modalTitle: {
    color: "#2E7D32",
    marginBottom: 16,
    textAlign: "center",
    fontSize: 20,
  },
  modalInput: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  eggInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  eggInput: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 8,
  },
  modalButton: {
    flex: 1,
  },
  modalDivider: {
    marginVertical: 16,
  },
  customerDetailHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  customerDetailName: {
    marginTop: 12,
    color: "#2E7D32",
  },
  customerDetailInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  customerDetailText: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
  },
  customerDetailStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  customerDetailStat: {
    alignItems: "center",
  },
  customerDetailStatNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  customerDetailStatLabel: {
    fontSize: 12,
    color: "#666666",
  },
  customerDetailButton: {
    marginBottom: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#2E7D32",
  },
});
