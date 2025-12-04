import React, { useState } from "react";
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
  Paragraph,
  Button,
  Divider,
  Chip,
  IconButton,
  List,
  Avatar,
  Portal,
  Dialog,
  TextInput,
  SegmentedButtons,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function CustomerDetailScreen({ route }) {
  const navigation = useNavigation();
  const { customerId } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("orders");
  const [editDialogVisible, setEditDialogVisible] = useState(false);

  // Mock customer data - in real app, fetch from storage/API
  const [customer, setCustomer] = useState({
    id: customerId,
    name: "Jan Bakker",
    email: "jan@bakkerij.nl",
    phone: "06-12345678",
    address: "Hoofdstraat 123, 1012 AB Amsterdam",
    company: "Bakkerij De Gouden Korst",
    kvkNumber: "12345678",
    btw: "NL123456789B01",
    memberSince: "2023-01-15",
    lastOrderDate: "2024-01-15",
    notes: "Levering bij voorkeur voor 10:00 's ochtends",
    preferences: {
      preferredSize: "Medium",
      deliveryDay: "Maandag & Donderdag",
      paymentMethod: "Factuur 14 dagen",
      discount: 5,
    },
    stats: {
      totalOrders: 45,
      totalRevenue: 1243.75,
      averageOrderValue: 27.64,
      totalEggsPurchased: 4975,
      outstandingBalance: 0.0,
    },
    orderHistory: [
      {
        id: "1",
        orderNumber: "ORD-2024-001",
        date: "2024-01-15",
        deliveryDate: "2024-01-16",
        small: 20,
        medium: 30,
        large: 25,
        total: 18.75,
        status: "Geleverd",
        paymentStatus: "Betaald",
      },
      {
        id: "2",
        orderNumber: "ORD-2024-002",
        date: "2024-01-12",
        deliveryDate: "2024-01-13",
        small: 15,
        medium: 35,
        large: 30,
        total: 20.0,
        status: "Geleverd",
        paymentStatus: "Betaald",
      },
      {
        id: "3",
        orderNumber: "ORD-2024-003",
        date: "2024-01-08",
        deliveryDate: "2024-01-09",
        small: 25,
        medium: 40,
        large: 20,
        total: 21.25,
        status: "Geleverd",
        paymentStatus: "Betaald",
      },
      {
        id: "4",
        orderNumber: "ORD-2024-004",
        date: "2024-01-05",
        deliveryDate: "2024-01-06",
        small: 10,
        medium: 25,
        large: 35,
        total: 17.5,
        status: "Geleverd",
        paymentStatus: "Betaald",
      },
    ],
    recentActivity: [
      {
        id: 1,
        type: "order",
        description: "Nieuwe bestelling geplaatst",
        date: "2024-01-15 09:30",
        amount: "€18.75",
      },
      {
        id: 2,
        type: "payment",
        description: "Betaling ontvangen",
        date: "2024-01-14 14:22",
        amount: "€20.00",
      },
      {
        id: 3,
        type: "delivery",
        description: "Order geleverd",
        date: "2024-01-13 10:15",
        amount: null,
      },
    ],
  });

  const [editedCustomer, setEditedCustomer] = useState({ ...customer });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Reload customer data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

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
        return "#666";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Betaald":
        return "#4CAF50";
      case "Openstaand":
        return "#FF9800";
      case "Achterstallig":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const calculateMembershipDuration = () => {
    const memberDate = new Date(customer.memberSince);
    const now = new Date();
    const months = Math.floor((now - memberDate) / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0) {
      return `${years} jaar${
        remainingMonths > 0 ? ` en ${remainingMonths} maanden` : ""
      }`;
    }
    return `${months} maanden`;
  };

  const handleEditCustomer = () => {
    setCustomer(editedCustomer);
    setEditDialogVisible(false);
    Alert.alert("Succes", "Klantgegevens bijgewerkt");
  };

  const createNewOrder = () => {
    navigation.navigate("SalesList", {
      screen: "OrderCreate",
      params: { customerId: customer.id, customerName: customer.name },
    });
  };

  const viewOrderDetail = (orderId) => {
    navigation.navigate("OrderDetail", { orderId });
  };

  const sendInvoice = () => {
    Alert.alert(
      "Factuur Versturen",
      `Factuur wordt verzonden naar ${customer.email}`
    );
  };

  const callCustomer = () => {
    Alert.alert("Bellen", `Bel ${customer.name}?\n${customer.phone}`, [
      { text: "Annuleren", style: "cancel" },
      { text: "Bellen", onPress: () => {} },
    ]);
  };

  const emailCustomer = () => {
    Alert.alert("E-mail", `E-mail sturen naar ${customer.email}?`, [
      { text: "Annuleren", style: "cancel" },
      { text: "E-mail", onPress: () => {} },
    ]);
  };

  const deleteCustomer = () => {
    Alert.alert(
      "Klant Verwijderen",
      "Weet u zeker dat u deze klant wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: () => {
            Alert.alert("Klant Verwijderd", "De klant is succesvol verwijderd");
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "order":
        return "cart";
      case "payment":
        return "cash";
      case "delivery":
        return "truck-delivery";
      default:
        return "information";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "order":
        return "#2196F3";
      case "payment":
        return "#4CAF50";
      case "delivery":
        return "#FF9800";
      default:
        return "#666";
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <Avatar.Icon
              size={72}
              icon="account"
              style={styles.avatar}
              color="#fff"
            />
            <View style={styles.headerInfo}>
              <Title style={styles.customerName}>{customer.name}</Title>
              {customer.company && (
                <Paragraph style={styles.companyName}>
                  {customer.company}
                </Paragraph>
              )}
              <Chip icon="calendar" style={styles.memberChip}>
                Klant sinds {calculateMembershipDuration()}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton
              icon="shopping"
              size={24}
              iconColor="#2E7D32"
              style={styles.statIcon}
            />
            <Text style={styles.statNumber}>{customer.stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Bestellingen</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton
              icon="currency-eur"
              size={24}
              iconColor="#2E7D32"
              style={styles.statIcon}
            />
            <Text style={styles.statNumber}>
              €{customer.stats.totalRevenue.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Omzet</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton
              icon="chart-line"
              size={24}
              iconColor="#2E7D32"
              style={styles.statIcon}
            />
            <Text style={styles.statNumber}>
              €{customer.stats.averageOrderValue.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Gem. Bestelling</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton
              icon="egg"
              size={24}
              iconColor="#2E7D32"
              style={styles.statIcon}
            />
            <Text style={styles.statNumber}>
              {customer.stats.totalEggsPurchased}
            </Text>
            <Text style={styles.statLabel}>Eieren Totaal</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Outstanding Balance Alert */}
      {customer.stats.outstandingBalance > 0 && (
        <Card style={[styles.card, styles.alertCard]}>
          <Card.Content>
            <View style={styles.balanceAlert}>
              <IconButton icon="alert-circle" iconColor="#FF9800" size={24} />
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceText}>Openstaand saldo</Text>
                <Text style={styles.balanceAmount}>
                  €{customer.stats.outstandingBalance.toFixed(2)}
                </Text>
              </View>
              <Button mode="outlined" compact>
                Herinnering
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Snelle Acties</Title>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              icon="plus"
              onPress={createNewOrder}
              style={styles.actionButton}
              buttonColor="#2E7D32"
            >
              Nieuwe Bestelling
            </Button>
            <Button
              mode="outlined"
              icon="phone"
              onPress={callCustomer}
              style={styles.actionButton}
            >
              Bellen
            </Button>
            <Button
              mode="outlined"
              icon="email"
              onPress={emailCustomer}
              style={styles.actionButton}
            >
              E-mail
            </Button>
            <Button
              mode="outlined"
              icon="file-document"
              onPress={sendInvoice}
              style={styles.actionButton}
            >
              Factuur
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Tab Navigation */}
      <SegmentedButtons
        value={selectedTab}
        onValueChange={setSelectedTab}
        buttons={[
          { value: "orders", label: "Bestellingen" },
          { value: "info", label: "Gegevens" },
          { value: "activity", label: "Activiteit" },
        ]}
        style={styles.tabButtons}
      />

      {/* Orders Tab */}
      {selectedTab === "orders" && (
        <View style={styles.tabContent}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Title style={styles.cardTitle}>Bestelgeschiedenis</Title>
                <Paragraph style={styles.orderCount}>
                  {customer.orderHistory.length} bestellingen
                </Paragraph>
              </View>
              {customer.orderHistory.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => viewOrderDetail(order.id)}
                >
                  <View style={styles.orderItem}>
                    <View style={styles.orderHeader}>
                      <View>
                        <Text style={styles.orderNumber}>
                          {order.orderNumber}
                        </Text>
                        <Text style={styles.orderDate}>
                          {order.date} • Levering: {order.deliveryDate}
                        </Text>
                      </View>
                      <View style={styles.orderStatus}>
                        <Chip
                          mode="flat"
                          textStyle={{
                            color: getStatusColor(order.status),
                            fontSize: 11,
                          }}
                          style={[
                            styles.statusChipSmall,
                            {
                              backgroundColor:
                                getStatusColor(order.status) + "20",
                            },
                          ]}
                        >
                          {order.status}
                        </Chip>
                      </View>
                    </View>
                    <View style={styles.orderDetails}>
                      <View style={styles.orderEggs}>
                        {order.small > 0 && (
                          <Chip icon="egg" style={styles.eggChipSmall}>
                            S: {order.small}
                          </Chip>
                        )}
                        {order.medium > 0 && (
                          <Chip icon="egg" style={styles.eggChipSmall}>
                            M: {order.medium}
                          </Chip>
                        )}
                        {order.large > 0 && (
                          <Chip icon="egg" style={styles.eggChipSmall}>
                            L: {order.large}
                          </Chip>
                        )}
                      </View>
                      <Text style={styles.orderTotal}>
                        €{order.total.toFixed(2)}
                      </Text>
                    </View>
                    <Chip
                      mode="flat"
                      textStyle={{
                        color: getPaymentStatusColor(order.paymentStatus),
                        fontSize: 10,
                      }}
                      style={[
                        styles.paymentChipSmall,
                        {
                          backgroundColor:
                            getPaymentStatusColor(order.paymentStatus) + "20",
                        },
                      ]}
                    >
                      {order.paymentStatus}
                    </Chip>
                  </View>
                  <Divider style={styles.orderDivider} />
                </TouchableOpacity>
              ))}
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Info Tab */}
      {selectedTab === "info" && (
        <View style={styles.tabContent}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Title style={styles.cardTitle}>Contactgegevens</Title>
                <Button
                  mode="text"
                  onPress={() => setEditDialogVisible(true)}
                  compact
                >
                  Bewerken
                </Button>
              </View>
              <List.Item
                title="Telefoon"
                description={customer.phone}
                left={(props) => <List.Icon {...props} icon="phone" />}
                right={(props) => <List.Icon {...props} icon="phone" />}
                onPress={callCustomer}
              />
              <Divider />
              <List.Item
                title="E-mail"
                description={customer.email}
                left={(props) => <List.Icon {...props} icon="email" />}
                right={(props) => <List.Icon {...props} icon="email" />}
                onPress={emailCustomer}
              />
              <Divider />
              <List.Item
                title="Adres"
                description={customer.address}
                left={(props) => <List.Icon {...props} icon="map-marker" />}
              />
            </Card.Content>
          </Card>

          {customer.company && (
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Bedrijfsgegevens</Title>
                <List.Item
                  title="Bedrijfsnaam"
                  description={customer.company}
                  left={(props) => (
                    <List.Icon {...props} icon="office-building" />
                  )}
                />
                <Divider />
                <List.Item
                  title="KvK Nummer"
                  description={customer.kvkNumber}
                  left={(props) => (
                    <List.Icon {...props} icon="file-document" />
                  )}
                />
                <Divider />
                <List.Item
                  title="BTW Nummer"
                  description={customer.btw}
                  left={(props) => <List.Icon {...props} icon="cash" />}
                />
              </Card.Content>
            </Card>
          )}

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Voorkeuren</Title>
              <List.Item
                title="Voorkeur eieren maat"
                description={customer.preferences.preferredSize}
                left={(props) => <List.Icon {...props} icon="egg" />}
              />
              <Divider />
              <List.Item
                title="Leverdagen"
                description={customer.preferences.deliveryDay}
                left={(props) => <List.Icon {...props} icon="calendar" />}
              />
              <Divider />
              <List.Item
                title="Betaalmethode"
                description={customer.preferences.paymentMethod}
                left={(props) => <List.Icon {...props} icon="credit-card" />}
              />
              <Divider />
              <List.Item
                title="Korting"
                description={`${customer.preferences.discount}%`}
                left={(props) => <List.Icon {...props} icon="percent" />}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Notities</Title>
              <Paragraph style={styles.notesText}>
                {customer.notes || "Geen notities"}
              </Paragraph>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Activity Tab */}
      {selectedTab === "activity" && (
        <View style={styles.tabContent}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Recente Activiteit</Title>
              {customer.recentActivity.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <Avatar.Icon
                    size={40}
                    icon={getActivityIcon(activity.type)}
                    style={[
                      styles.activityIcon,
                      {
                        backgroundColor: getActivityColor(activity.type) + "20",
                      },
                    ]}
                    color={getActivityColor(activity.type)}
                  />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityDescription}>
                      {activity.description}
                    </Text>
                    <Text style={styles.activityDate}>{activity.date}</Text>
                  </View>
                  {activity.amount && (
                    <Text style={styles.activityAmount}>{activity.amount}</Text>
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Danger Zone */}
      <Card style={[styles.card, styles.dangerCard]}>
        <Card.Content>
          <Title style={styles.dangerTitle}>Danger Zone</Title>
          <Button
            mode="outlined"
            onPress={deleteCustomer}
            style={styles.dangerButton}
            textColor="#F44336"
            icon="delete"
          >
            Klant Verwijderen
          </Button>
        </Card.Content>
      </Card>

      {/* Edit Customer Dialog */}
      <Portal>
        <Dialog
          visible={editDialogVisible}
          onDismiss={() => setEditDialogVisible(false)}
        >
          <Dialog.Title>Klantgegevens Bewerken</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView>
              <TextInput
                label="Naam"
                value={editedCustomer.name}
                onChangeText={(text) =>
                  setEditedCustomer({ ...editedCustomer, name: text })
                }
                style={styles.dialogInput}
              />
              <TextInput
                label="E-mail"
                value={editedCustomer.email}
                onChangeText={(text) =>
                  setEditedCustomer({ ...editedCustomer, email: text })
                }
                style={styles.dialogInput}
              />
              <TextInput
                label="Telefoon"
                value={editedCustomer.phone}
                onChangeText={(text) =>
                  setEditedCustomer({ ...editedCustomer, phone: text })
                }
                style={styles.dialogInput}
              />
              <TextInput
                label="Adres"
                value={editedCustomer.address}
                onChangeText={(text) =>
                  setEditedCustomer({ ...editedCustomer, address: text })
                }
                multiline
                numberOfLines={2}
                style={styles.dialogInput}
              />
              <TextInput
                label="Bedrijfsnaam"
                value={editedCustomer.company}
                onChangeText={(text) =>
                  setEditedCustomer({ ...editedCustomer, company: text })
                }
                style={styles.dialogInput}
              />
              <TextInput
                label="Notities"
                value={editedCustomer.notes}
                onChangeText={(text) =>
                  setEditedCustomer({ ...editedCustomer, notes: text })
                }
                multiline
                numberOfLines={3}
                style={styles.dialogInput}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>
              Annuleren
            </Button>
            <Button onPress={handleEditCustomer}>Opslaan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#2E7D32",
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 22,
    color: "#2E7D32",
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  memberChip: {
    alignSelf: "flex-start",
    height: 28,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statCard: {
    width: "48%",
    marginBottom: 8,
    elevation: 2,
  },
  statContent: {
    alignItems: "center",
    padding: 8,
  },
  statIcon: {
    margin: 0,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: -8,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  alertCard: {
    backgroundColor: "#FFF3E0",
  },
  balanceAlert: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceInfo: {
    flex: 1,
    marginLeft: 8,
  },
  balanceText: {
    fontSize: 14,
    color: "#666",
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF9800",
  },
  cardTitle: {
    color: "#2E7D32",
    fontSize: 18,
  },
  quickActions: {
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 4,
  },
  tabButtons: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tabContent: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderCount: {
    fontSize: 12,
    color: "#666",
  },
  orderItem: {
    paddingVertical: 12,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  orderDate: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  orderStatus: {
    alignItems: "flex-end",
  },
  statusChipSmall: {
    height: 24,
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  orderEggs: {
    flexDirection: "row",
    gap: 4,
  },
  eggChipSmall: {
    height: 24,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  paymentChipSmall: {
    height: 20,
    alignSelf: "flex-start",
  },
  orderDivider: {
    marginTop: 12,
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    lineHeight: 20,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 11,
    color: "#999",
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  dangerCard: {
    backgroundColor: "#FFEBEE",
  },
  dangerTitle: {
    color: "#F44336",
    fontSize: 16,
    marginBottom: 8,
  },
  dangerButton: {
    borderColor: "#F44336",
  },
  dialogScroll: {
    maxHeight: 400,
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: "white",
  },
});
