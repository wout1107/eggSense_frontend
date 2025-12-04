import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  RefreshControl,
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
  IconButton,
  Divider,
  ProgressBar,
  SegmentedButtons,
  List,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function FeedDeliveryScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const [feedInventory, setFeedInventory] = useState({
    currentStock: 850, // kg
    minimumStock: 200, // kg
    averageDailyConsumption: 28.5, // kg
    lastDeliveryDate: "2024-01-10",
    lastDeliveryAmount: 1000,
  });

  const [deliveries, setDeliveries] = useState([
    {
      id: "1",
      date: "2024-01-10",
      supplier: "Voerhandel De Kip",
      amount: 1000,
      pricePerKg: 0.45,
      totalCost: 450.0,
      invoiceNumber: "INV-2024-001",
      notes: "Reguliere levering",
      status: "Ontvangen",
    },
    {
      id: "2",
      date: "2023-12-28",
      supplier: "Voerhandel De Kip",
      amount: 1000,
      pricePerKg: 0.45,
      totalCost: 450.0,
      invoiceNumber: "INV-2023-245",
      notes: "",
      status: "Ontvangen",
    },
    {
      id: "3",
      date: "2023-12-15",
      supplier: "Voerhandel De Kip",
      amount: 1000,
      pricePerKg: 0.44,
      totalCost: 440.0,
      invoiceNumber: "INV-2023-232",
      notes: "",
      status: "Ontvangen",
    },
  ]);

  const [suppliers, setSuppliers] = useState([
    {
      id: "1",
      name: "Voerhandel De Kip",
      phone: "06-12345678",
      email: "info@voerhandeldekip.nl",
      pricePerKg: 0.45,
      deliveryDays: "Di, Do",
      totalDeliveries: 15,
      totalAmount: 15000,
    },
    {
      id: "2",
      name: "Agrarisch Voer BV",
      phone: "06-87654321",
      email: "verkoop@agrarischvoer.nl",
      pricePerKg: 0.42,
      deliveryDays: "Ma, Wo, Vr",
      totalDeliveries: 3,
      totalAmount: 3000,
    },
  ]);

  const [newDelivery, setNewDelivery] = useState({
    date: new Date().toISOString().split("T")[0],
    supplierId: "",
    supplierName: "",
    amount: "",
    pricePerKg: "",
    invoiceNumber: "",
    notes: "",
  });

  useEffect(() => {
    calculateFeedStatistics();
  }, [deliveries, feedInventory]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const calculateFeedStatistics = () => {
    // Calculate days until empty
    const daysUntilEmpty =
      feedInventory.currentStock / feedInventory.averageDailyConsumption;

    // Calculate monthly consumption
    const monthlyConsumption = feedInventory.averageDailyConsumption * 30;

    // Calculate total cost this month
    const thisMonthDeliveries = deliveries.filter((delivery) => {
      const deliveryDate = new Date(delivery.date);
      const now = new Date();
      return (
        deliveryDate.getMonth() === now.getMonth() &&
        deliveryDate.getFullYear() === now.getFullYear()
      );
    });

    const monthlyFeedCost = thisMonthDeliveries.reduce(
      (sum, delivery) => sum + delivery.totalCost,
      0
    );

    return {
      daysUntilEmpty: Math.round(daysUntilEmpty),
      monthlyConsumption: Math.round(monthlyConsumption),
      monthlyFeedCost: monthlyFeedCost.toFixed(2),
    };
  };

  const selectSupplierForDelivery = () => {
    Alert.alert(
      "Selecteer Leverancier",
      "Kies een leverancier voor deze levering",
      [
        ...suppliers.map((supplier) => ({
          text: supplier.name,
          onPress: () =>
            setNewDelivery({
              ...newDelivery,
              supplierId: supplier.id,
              supplierName: supplier.name,
              pricePerKg: supplier.pricePerKg.toString(),
            }),
        })),
        { text: "Annuleren", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const addDelivery = () => {
    if (!newDelivery.supplierId || !newDelivery.amount) {
      Alert.alert("Fout", "Vul alle verplichte velden in");
      return;
    }

    const amount = parseFloat(newDelivery.amount);
    const pricePerKg = parseFloat(newDelivery.pricePerKg);
    const totalCost = amount * pricePerKg;

    const delivery = {
      id: Date.now().toString(),
      date: newDelivery.date,
      supplier: newDelivery.supplierName,
      amount: amount,
      pricePerKg: pricePerKg,
      totalCost: totalCost,
      invoiceNumber: newDelivery.invoiceNumber,
      notes: newDelivery.notes,
      status: "Ontvangen",
    };

    setDeliveries([delivery, ...deliveries]);

    // Update inventory
    setFeedInventory({
      ...feedInventory,
      currentStock: feedInventory.currentStock + amount,
      lastDeliveryDate: newDelivery.date,
      lastDeliveryAmount: amount,
    });

    setNewDelivery({
      date: new Date().toISOString().split("T")[0],
      supplierId: "",
      supplierName: "",
      amount: "",
      pricePerKg: "",
      invoiceNumber: "",
      notes: "",
    });

    setModalVisible(false);
    Alert.alert("Succes", "Voerlevering toegevoegd en voorraad bijgewerkt");
  };

  const getStockStatusColor = () => {
    const percentage =
      (feedInventory.currentStock / (feedInventory.minimumStock * 5)) * 100;
    if (percentage > 50) return "#4CAF50";
    if (percentage > 25) return "#FF9800";
    return "#F44336";
  };

  const getStockStatusText = () => {
    const percentage =
      (feedInventory.currentStock / (feedInventory.minimumStock * 5)) * 100;
    if (percentage > 50) return "Goed";
    if (percentage > 25) return "Laag";
    return "Kritiek";
  };

  const orderNewFeed = (supplier) => {
    Alert.alert(
      "Voer Bestellen",
      `Wilt u voer bestellen bij ${supplier.name}?\n\nPrijs: €${supplier.pricePerKg}/kg\nTelefoon: ${supplier.phone}`,
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Bellen",
          onPress: () => Alert.alert("Bellen", `Bel ${supplier.phone}`),
        },
        {
          text: "E-mail",
          onPress: () =>
            Alert.alert("E-mail", `Stuur e-mail naar ${supplier.email}`),
        },
      ]
    );
  };

  const stats = calculateFeedStatistics();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Voer Beheer</Text>
          <IconButton
            icon="plus-circle"
            size={28}
            iconColor="#2E7D32"
            onPress={() => setModalVisible(true)}
          />
        </View>

        {/* Current Stock Status */}
        <Card style={styles.stockCard}>
          <Card.Content>
            <View style={styles.stockHeader}>
              <Title style={styles.cardTitle}>Huidige Voorraad</Title>
              <Chip
                icon="alert-circle"
                style={[
                  styles.stockStatusChip,
                  { backgroundColor: `${getStockStatusColor()}20` },
                ]}
                textStyle={{
                  color: getStockStatusColor(),
                  fontWeight: "bold",
                }}
              >
                {getStockStatusText()}
              </Chip>
            </View>

            <View style={styles.stockAmount}>
              <IconButton
                icon="food-apple"
                size={48}
                iconColor="#2E7D32"
                style={styles.stockIcon}
              />
              <View style={styles.stockNumbers}>
                <Text style={styles.stockMainNumber}>
                  {feedInventory.currentStock} kg
                </Text>
                <Text style={styles.stockSubtext}>Voer op voorraad</Text>
              </View>
            </View>

            <ProgressBar
              progress={
                feedInventory.currentStock / (feedInventory.minimumStock * 5)
              }
              color={getStockStatusColor()}
              style={styles.progressBar}
            />

            <View style={styles.stockDetails}>
              <View style={styles.stockDetailItem}>
                <Text style={styles.stockDetailLabel}>Dagen resterend:</Text>
                <Text
                  style={[
                    styles.stockDetailValue,
                    {
                      color: stats.daysUntilEmpty > 14 ? "#4CAF50" : "#FF9800",
                    },
                  ]}
                >
                  ~{stats.daysUntilEmpty} dagen
                </Text>
              </View>
              <View style={styles.stockDetailItem}>
                <Text style={styles.stockDetailLabel}>Minimale voorraad:</Text>
                <Text style={styles.stockDetailValue}>
                  {feedInventory.minimumStock} kg
                </Text>
              </View>
              <View style={styles.stockDetailItem}>
                <Text style={styles.stockDetailLabel}>Gemiddeld verbruik:</Text>
                <Text style={styles.stockDetailValue}>
                  {feedInventory.averageDailyConsumption} kg/dag
                </Text>
              </View>
            </View>

            {feedInventory.currentStock < feedInventory.minimumStock * 2 && (
              <Button
                mode="contained"
                onPress={() => orderNewFeed(suppliers[0])}
                style={styles.orderButton}
                buttonColor="#FF9800"
                icon="phone"
              >
                Bestel Nieuw Voer
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content>
              <IconButton
                icon="calendar-month"
                size={24}
                iconColor="#2E7D32"
                style={styles.statIcon}
              />
              <Text style={styles.statNumber}>{stats.monthlyConsumption}</Text>
              <Text style={styles.statLabel}>kg deze maand</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <IconButton
                icon="currency-eur"
                size={24}
                iconColor="#2E7D32"
                style={styles.statIcon}
              />
              <Text style={styles.statNumber}>€{stats.monthlyFeedCost}</Text>
              <Text style={styles.statLabel}>Kosten deze maand</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <IconButton
                icon="truck-delivery"
                size={24}
                iconColor="#2E7D32"
                style={styles.statIcon}
              />
              <Text style={styles.statNumber}>
                {feedInventory.lastDeliveryAmount}
              </Text>
              <Text style={styles.statLabel}>kg laatste levering</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <IconButton
                icon="calendar-check"
                size={24}
                iconColor="#2E7D32"
                style={styles.statIcon}
              />
              <Text style={styles.statNumber}>
                {feedInventory.lastDeliveryDate.split("-")[2]}/
                {feedInventory.lastDeliveryDate.split("-")[1]}
              </Text>
              <Text style={styles.statLabel}>Laatste levering</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Period Selector */}
        <SegmentedButtons
          value={selectedPeriod}
          onValueChange={setSelectedPeriod}
          buttons={[
            { value: "week", label: "Week" },
            { value: "month", label: "Maand" },
            { value: "year", label: "Jaar" },
          ]}
          style={styles.periodSelector}
        />

        {/* Recent Deliveries */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>
              Recente Leveringen ({deliveries.length})
            </Title>
            {deliveries.map((delivery) => (
              <View key={delivery.id}>
                <TouchableOpacity style={styles.deliveryItem}>
                  <View style={styles.deliveryHeader}>
                    <View style={styles.deliveryLeft}>
                      <Text style={styles.deliverySupplier}>
                        {delivery.supplier}
                      </Text>
                      <Text style={styles.deliveryDate}>{delivery.date}</Text>
                      {delivery.invoiceNumber && (
                        <Text style={styles.deliveryInvoice}>
                          Factuur: {delivery.invoiceNumber}
                        </Text>
                      )}
                    </View>
                    <Chip
                      mode="flat"
                      style={styles.deliveryStatusChip}
                      textStyle={{ fontSize: 11 }}
                      icon="check-circle"
                    >
                      {delivery.status}
                    </Chip>
                  </View>

                  <View style={styles.deliveryDetails}>
                    <View style={styles.deliveryDetailItem}>
                      <IconButton
                        icon="weight-kilogram"
                        size={20}
                        iconColor="#666666"
                        style={styles.deliveryIcon}
                      />
                      <View>
                        <Text style={styles.deliveryDetailLabel}>
                          Hoeveelheid
                        </Text>
                        <Text style={styles.deliveryDetailValue}>
                          {delivery.amount} kg
                        </Text>
                      </View>
                    </View>

                    <View style={styles.deliveryDetailItem}>
                      <IconButton
                        icon="cash"
                        size={20}
                        iconColor="#666666"
                        style={styles.deliveryIcon}
                      />
                      <View>
                        <Text style={styles.deliveryDetailLabel}>Prijs</Text>
                        <Text style={styles.deliveryDetailValue}>
                          €{delivery.pricePerKg}/kg
                        </Text>
                      </View>
                    </View>

                    <View style={styles.deliveryDetailItem}>
                      <IconButton
                        icon="calculator"
                        size={20}
                        iconColor="#666666"
                        style={styles.deliveryIcon}
                      />
                      <View>
                        <Text style={styles.deliveryDetailLabel}>Totaal</Text>
                        <Text style={styles.deliveryDetailValueBold}>
                          €{delivery.totalCost.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {delivery.notes && (
                    <View style={styles.deliveryNotes}>
                      <Text style={styles.deliveryNotesText}>
                        📝 {delivery.notes}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <Divider style={styles.deliveryDivider} />
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Suppliers */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>
              Leveranciers ({suppliers.length})
            </Title>
            {suppliers.map((supplier) => (
              <TouchableOpacity
                key={supplier.id}
                style={styles.supplierItem}
                onPress={() => orderNewFeed(supplier)}
              >
                <View style={styles.supplierHeader}>
                  <IconButton
                    icon="store"
                    size={40}
                    iconColor="#2E7D32"
                    style={styles.supplierIcon}
                  />
                  <View style={styles.supplierInfo}>
                    <Text style={styles.supplierName}>{supplier.name}</Text>
                    <Text style={styles.supplierContact}>{supplier.phone}</Text>
                    <Text style={styles.supplierContact}>{supplier.email}</Text>
                  </View>
                  <IconButton icon="chevron-right" iconColor="#2E7D32" />
                </View>

                <View style={styles.supplierDetails}>
                  <View style={styles.supplierStat}>
                    <Text style={styles.supplierStatValue}>
                      €{supplier.pricePerKg}
                    </Text>
                    <Text style={styles.supplierStatLabel}>per kg</Text>
                  </View>
                  <View style={styles.supplierStat}>
                    <Text style={styles.supplierStatValue}>
                      {supplier.deliveryDays}
                    </Text>
                    <Text style={styles.supplierStatLabel}>Leverdagen</Text>
                  </View>
                  <View style={styles.supplierStat}>
                    <Text style={styles.supplierStatValue}>
                      {supplier.totalDeliveries}
                    </Text>
                    <Text style={styles.supplierStatLabel}>Leveringen</Text>
                  </View>
                  <View style={styles.supplierStat}>
                    <Text style={styles.supplierStatValue}>
                      {supplier.totalAmount}
                    </Text>
                    <Text style={styles.supplierStatLabel}>kg totaal</Text>
                  </View>
                </View>

                <Divider style={styles.supplierDivider} />
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>

        {/* Consumption Chart */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Verbruik Analyse</Title>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Kosten per ei:</Text>
              <Text style={styles.analysisValue}>
                €
                {(
                  (feedInventory.averageDailyConsumption *
                    parseFloat(deliveries[0]?.pricePerKg || 0.45)) /
                  280
                ).toFixed(3)}
              </Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>
                Voer conversie ratio (FCR):
              </Text>
              <Text style={styles.analysisValue}>2.1 kg voer/kg eieren</Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Gemiddelde prijs:</Text>
              <Text style={styles.analysisValue}>
                €
                {(
                  deliveries.reduce((sum, d) => sum + d.pricePerKg, 0) /
                  deliveries.length
                ).toFixed(2)}
                /kg
              </Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>
                Verwachte bestelling over:
              </Text>
              <Text
                style={[
                  styles.analysisValue,
                  {
                    color: stats.daysUntilEmpty < 7 ? "#FF9800" : "#4CAF50",
                  },
                ]}
              >
                {stats.daysUntilEmpty} dagen
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Add Delivery Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>Nieuwe Voerlevering</Title>

            <TextInput
              label="Datum *"
              value={newDelivery.date}
              onChangeText={(text) =>
                setNewDelivery({ ...newDelivery, date: text })
              }
              style={styles.modalInput}
              left={<TextInput.Icon icon="calendar" />}
            />

            <TouchableOpacity onPress={selectSupplierForDelivery}>
              <TextInput
                label="Leverancier *"
                value={newDelivery.supplierName}
                editable={false}
                style={styles.modalInput}
                left={<TextInput.Icon icon="store" />}
                right={<TextInput.Icon icon="chevron-down" />}
              />
            </TouchableOpacity>

            <TextInput
              label="Hoeveelheid (kg) *"
              value={newDelivery.amount}
              onChangeText={(text) =>
                setNewDelivery({ ...newDelivery, amount: text })
              }
              keyboardType="numeric"
              style={styles.modalInput}
              left={<TextInput.Icon icon="weight-kilogram" />}
            />

            <TextInput
              label="Prijs per kg (€) *"
              value={newDelivery.pricePerKg}
              onChangeText={(text) =>
                setNewDelivery({ ...newDelivery, pricePerKg: text })
              }
              keyboardType="decimal-pad"
              style={styles.modalInput}
              left={<TextInput.Icon icon="currency-eur" />}
            />

            {newDelivery.amount && newDelivery.pricePerKg && (
              <View style={styles.totalCostDisplay}>
                <Text style={styles.totalCostLabel}>Totale kosten:</Text>
                <Text style={styles.totalCostValue}>
                  €
                  {(
                    parseFloat(newDelivery.amount) *
                    parseFloat(newDelivery.pricePerKg)
                  ).toFixed(2)}
                </Text>
              </View>
            )}

            <TextInput
              label="Factuurnummer"
              value={newDelivery.invoiceNumber}
              onChangeText={(text) =>
                setNewDelivery({ ...newDelivery, invoiceNumber: text })
              }
              style={styles.modalInput}
              left={<TextInput.Icon icon="file-document" />}
            />

            <TextInput
              label="Notities"
              value={newDelivery.notes}
              onChangeText={(text) =>
                setNewDelivery({ ...newDelivery, notes: text })
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
                onPress={addDelivery}
                style={styles.modalButton}
                buttonColor="#2E7D32"
              >
                Levering Toevoegen
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
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
  stockCard: {
    marginBottom: 16,
    elevation: 4,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    color: "#2E7D32",
    fontSize: 18,
  },
  stockStatusChip: {
    height: 32,
  },
  stockAmount: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stockIcon: {
    margin: 0,
    marginRight: 12,
  },
  stockNumbers: {
    flex: 1,
  },
  stockMainNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  stockSubtext: {
    fontSize: 14,
    color: "#666666",
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  stockDetails: {
    gap: 8,
  },
  stockDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  stockDetailLabel: {
    fontSize: 14,
    color: "#666666",
  },
  stockDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  orderButton: {
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    marginBottom: 8,
    elevation: 2,
  },
  statIcon: {
    margin: 0,
    alignSelf: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginTop: -8,
  },
  statLabel: {
    fontSize: 11,
    color: "#666666",
    textAlign: "center",
  },
  periodSelector: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  deliveryItem: {
    paddingVertical: 12,
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  deliveryLeft: {
    flex: 1,
  },
  deliverySupplier: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
  },
  deliveryInvoice: {
    fontSize: 11,
    color: "#999999",
  },
  deliveryStatusChip: {
    backgroundColor: "#E8F5E9",
    height: 28,
  },
  deliveryDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  deliveryDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deliveryIcon: {
    margin: 0,
    marginRight: 4,
  },
  deliveryDetailLabel: {
    fontSize: 10,
    color: "#999999",
  },
  deliveryDetailValue: {
    fontSize: 13,
    color: "#333333",
    fontWeight: "500",
  },
  deliveryDetailValueBold: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "bold",
  },
  deliveryNotes: {
    backgroundColor: "#FFF9E6",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  deliveryNotesText: {
    fontSize: 12,
    color: "#666666",
    fontStyle: "italic",
  },
  deliveryDivider: {
    marginTop: 12,
  },
  supplierItem: {
    marginBottom: 8,
  },
  supplierHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  supplierIcon: {
    margin: 0,
    marginRight: 8,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 2,
  },
  supplierContact: {
    fontSize: 11,
    color: "#666666",
  },
  supplierDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    marginBottom: 8,
  },
  supplierStat: {
    alignItems: "center",
  },
  supplierStatValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  supplierStatLabel: {
    fontSize: 10,
    color: "#666666",
  },
  supplierDivider: {
    marginTop: 12,
  },
  analysisItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  analysisLabel: {
    fontSize: 14,
    color: "#666666",
  },
  analysisValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
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
  totalCostDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  totalCostLabel: {
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "600",
  },
  totalCostValue: {
    fontSize: 24,
    color: "#2E7D32",
    fontWeight: "bold",
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
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#2E7D32",
  },
});
