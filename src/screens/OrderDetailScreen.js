import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
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
  Portal,
  Dialog,
  RadioButton,
  TextInput,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function OrderDetailScreen({ route }) {
  const navigation = useNavigation();
  const { orderId } = route.params;

  // Mock order data - in real app, fetch from storage/API
  const [order, setOrder] = useState({
    id: orderId,
    orderNumber: "ORD-2024-001",
    customerId: "1",
    customerName: "Jan Bakker",
    customerEmail: "jan@bakkerij.nl",
    customerPhone: "06-12345678",
    customerAddress: "Hoofdstraat 123, Amsterdam",
    date: "2024-01-15",
    deliveryDate: "2024-01-16",
    small: 20,
    medium: 30,
    large: 25,
    pricePerEgg: 0.25,
    total: 18.75,
    status: "Pending",
    paymentStatus: "Openstaand",
    paymentMethod: "Factuur",
    notes: "Levering voor 10:00 's ochtends",
    trackingInfo: {
      ordered: { date: "2024-01-15 09:30", completed: true },
      preparing: { date: "2024-01-15 10:15", completed: true },
      packed: { date: null, completed: false },
      inTransit: { date: null, completed: false },
      delivered: { date: null, completed: false },
    },
  });

  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [notesDialogVisible, setNotesDialogVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(
    order.paymentStatus
  );
  const [orderNotes, setOrderNotes] = useState(order.notes);

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

  const updateOrderStatus = () => {
    setOrder({ ...order, status: selectedStatus });
    setStatusDialogVisible(false);

    // Update tracking info based on status
    const newTrackingInfo = { ...order.trackingInfo };
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");

    switch (selectedStatus) {
      case "In Transit":
        newTrackingInfo.packed = { date: now, completed: true };
        newTrackingInfo.inTransit = { date: now, completed: true };
        break;
      case "Geleverd":
        newTrackingInfo.packed = { date: now, completed: true };
        newTrackingInfo.inTransit = { date: now, completed: true };
        newTrackingInfo.delivered = { date: now, completed: true };
        break;
    }

    setOrder({
      ...order,
      status: selectedStatus,
      trackingInfo: newTrackingInfo,
    });
    Alert.alert("Succes", `Order status bijgewerkt naar ${selectedStatus}`);
  };

  const updatePaymentStatus = () => {
    setOrder({ ...order, paymentStatus: selectedPaymentStatus });
    setPaymentDialogVisible(false);
    Alert.alert(
      "Succes",
      `Betaalstatus bijgewerkt naar ${selectedPaymentStatus}`
    );
  };

  const updateNotes = () => {
    setOrder({ ...order, notes: orderNotes });
    setNotesDialogVisible(false);
    Alert.alert("Succes", "Notities bijgewerkt");
  };

  const cancelOrder = () => {
    Alert.alert(
      "Order Annuleren",
      "Weet u zeker dat u deze order wilt annuleren?",
      [
        { text: "Nee", style: "cancel" },
        {
          text: "Ja, Annuleren",
          style: "destructive",
          onPress: () => {
            setOrder({ ...order, status: "Geannuleerd" });
            Alert.alert("Order Geannuleerd", "De order is geannuleerd");
          },
        },
      ]
    );
  };

  const printInvoice = () => {
    Alert.alert("Factuur Printen", "Factuur wordt gegenereerd en geprint...");
  };

  const sendInvoice = () => {
    Alert.alert(
      "Factuur Versturen",
      `Factuur wordt verzonden naar ${order.customerEmail}`
    );
  };

  const viewCustomer = () => {
    navigation.navigate("CustomerDetail", { customerId: order.customerId });
  };

  const totalEggs = order.small + order.medium + order.large;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Text style={styles.orderDate}>Besteld op {order.date}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Chip
            mode="flat"
            textStyle={{
              color: getStatusColor(order.status),
              fontWeight: "bold",
            }}
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(order.status) + "20" },
            ]}
          >
            {order.status}
          </Chip>
          <Chip
            mode="flat"
            textStyle={{
              color: getPaymentStatusColor(order.paymentStatus),
              fontWeight: "bold",
            }}
            style={[
              styles.paymentChip,
              {
                backgroundColor:
                  getPaymentStatusColor(order.paymentStatus) + "20",
              },
            ]}
          >
            {order.paymentStatus}
          </Chip>
        </View>
      </View>

      {/* Customer Info */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.cardTitle}>Klant Informatie</Title>
            <Button mode="text" onPress={viewCustomer} compact>
              Details
            </Button>
          </View>
          <TouchableOpacity onPress={viewCustomer}>
            <List.Item
              title={order.customerName}
              description={order.customerEmail}
              left={(props) => <List.Icon {...props} icon="account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
              title={order.customerPhone}
              description={order.customerAddress}
              left={(props) => <List.Icon {...props} icon="map-marker" />}
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Order Details */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Order Details</Title>
          <View style={styles.orderDetailsRow}>
            <Text style={styles.detailLabel}>Leverdatum:</Text>
            <Text style={styles.detailValue}>{order.deliveryDate}</Text>
          </View>
          <View style={styles.orderDetailsRow}>
            <Text style={styles.detailLabel}>Betaalmethode:</Text>
            <Text style={styles.detailValue}>{order.paymentMethod}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.eggBreakdown}>
            <Text style={styles.breakdownTitle}>Eieren Specificatie:</Text>
            {order.small > 0 && (
              <View style={styles.eggRow}>
                <Chip icon="egg" style={styles.eggSizeChip}>
                  Klein (S)
                </Chip>
                <Text style={styles.eggQuantity}>{order.small} stuks</Text>
                <Text style={styles.eggPrice}>
                  €{(order.small * order.pricePerEgg).toFixed(2)}
                </Text>
              </View>
            )}
            {order.medium > 0 && (
              <View style={styles.eggRow}>
                <Chip icon="egg" style={styles.eggSizeChip}>
                  Medium (M)
                </Chip>
                <Text style={styles.eggQuantity}>{order.medium} stuks</Text>
                <Text style={styles.eggPrice}>
                  €{(order.medium * order.pricePerEgg).toFixed(2)}
                </Text>
              </View>
            )}
            {order.large > 0 && (
              <View style={styles.eggRow}>
                <Chip icon="egg" style={styles.eggSizeChip}>
                  Groot (L)
                </Chip>
                <Text style={styles.eggQuantity}>{order.large} stuks</Text>
                <Text style={styles.eggPrice}>
                  €{(order.large * order.pricePerEgg).toFixed(2)}
                </Text>
              </View>
            )}
          </View>
          <Divider style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Totaal ({totalEggs} eieren):</Text>
            <Text style={styles.totalAmount}>€{order.total.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Tracking Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Order Tracking</Title>
          <View style={styles.trackingContainer}>
            <View
              style={[
                styles.trackingStep,
                order.trackingInfo.ordered.completed &&
                  styles.trackingStepCompleted,
              ]}
            >
              <View style={styles.trackingIconContainer}>
                <IconButton
                  icon="clipboard-check"
                  size={24}
                  iconColor={
                    order.trackingInfo.ordered.completed ? "#4CAF50" : "#ccc"
                  }
                />
              </View>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingTitle}>Bestelling Ontvangen</Text>
                {order.trackingInfo.ordered.date && (
                  <Text style={styles.trackingDate}>
                    {order.trackingInfo.ordered.date}
                  </Text>
                )}
              </View>
            </View>

            <View
              style={[
                styles.trackingStep,
                order.trackingInfo.preparing.completed &&
                  styles.trackingStepCompleted,
              ]}
            >
              <View style={styles.trackingIconContainer}>
                <IconButton
                  icon="package-variant"
                  size={24}
                  iconColor={
                    order.trackingInfo.preparing.completed ? "#4CAF50" : "#ccc"
                  }
                />
              </View>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingTitle}>In Voorbereiding</Text>
                {order.trackingInfo.preparing.date && (
                  <Text style={styles.trackingDate}>
                    {order.trackingInfo.preparing.date}
                  </Text>
                )}
              </View>
            </View>

            <View
              style={[
                styles.trackingStep,
                order.trackingInfo.packed.completed &&
                  styles.trackingStepCompleted,
              ]}
            >
              <View style={styles.trackingIconContainer}>
                <IconButton
                  icon="package"
                  size={24}
                  iconColor={
                    order.trackingInfo.packed.completed ? "#4CAF50" : "#ccc"
                  }
                />
              </View>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingTitle}>Ingepakt</Text>
                {order.trackingInfo.packed.date && (
                  <Text style={styles.trackingDate}>
                    {order.trackingInfo.packed.date}
                  </Text>
                )}
              </View>
            </View>

            <View
              style={[
                styles.trackingStep,
                order.trackingInfo.inTransit.completed &&
                  styles.trackingStepCompleted,
              ]}
            >
              <View style={styles.trackingIconContainer}>
                <IconButton
                  icon="truck-delivery"
                  size={24}
                  iconColor={
                    order.trackingInfo.inTransit.completed ? "#4CAF50" : "#ccc"
                  }
                />
              </View>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingTitle}>Onderweg</Text>
                {order.trackingInfo.inTransit.date && (
                  <Text style={styles.trackingDate}>
                    {order.trackingInfo.inTransit.date}
                  </Text>
                )}
              </View>
            </View>

            <View
              style={[
                styles.trackingStep,
                order.trackingInfo.delivered.completed &&
                  styles.trackingStepCompleted,
              ]}
            >
              <View style={styles.trackingIconContainer}>
                <IconButton
                  icon="check-circle"
                  size={24}
                  iconColor={
                    order.trackingInfo.delivered.completed ? "#4CAF50" : "#ccc"
                  }
                />
              </View>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingTitle}>Geleverd</Text>
                {order.trackingInfo.delivered.date && (
                  <Text style={styles.trackingDate}>
                    {order.trackingInfo.delivered.date}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Notes */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.cardTitle}>Notities</Title>
            <Button
              mode="text"
              onPress={() => setNotesDialogVisible(true)}
              compact
            >
              Bewerken
            </Button>
          </View>
          <Paragraph style={styles.notesText}>
            {order.notes || "Geen notities"}
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Acties</Title>
          <Button
            mode="contained"
            onPress={() => setStatusDialogVisible(true)}
            style={styles.actionButton}
            buttonColor="#2E7D32"
            icon="update"
          >
            Status Bijwerken
          </Button>
          <Button
            mode="contained"
            onPress={() => setPaymentDialogVisible(true)}
            style={styles.actionButton}
            buttonColor="#1976D2"
            icon="cash"
          >
            Betaalstatus Bijwerken
          </Button>
          <Button
            mode="outlined"
            onPress={printInvoice}
            style={styles.actionButton}
            icon="printer"
          >
            Factuur Printen
          </Button>
          <Button
            mode="outlined"
            onPress={sendInvoice}
            style={styles.actionButton}
            icon="email"
          >
            Factuur E-mailen
          </Button>
          {order.status !== "Geannuleerd" && order.status !== "Geleverd" && (
            <Button
              mode="outlined"
              onPress={cancelOrder}
              style={styles.actionButton}
              textColor="#F44336"
              icon="close-circle"
            >
              Order Annuleren
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Status Update Dialog */}
      <Portal>
        <Dialog
          visible={statusDialogVisible}
          onDismiss={() => setStatusDialogVisible(false)}
        >
          <Dialog.Title>Order Status Bijwerken</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => setSelectedStatus(value)}
              value={selectedStatus}
            >
              <RadioButton.Item label="Pending" value="Pending" />
              <RadioButton.Item label="In Transit" value="In Transit" />
              <RadioButton.Item label="Geleverd" value="Geleverd" />
              <RadioButton.Item label="Geannuleerd" value="Geannuleerd" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStatusDialogVisible(false)}>
              Annuleren
            </Button>
            <Button onPress={updateOrderStatus}>Opslaan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Payment Status Dialog */}
      <Portal>
        <Dialog
          visible={paymentDialogVisible}
          onDismiss={() => setPaymentDialogVisible(false)}
        >
          <Dialog.Title>Betaalstatus Bijwerken</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => setSelectedPaymentStatus(value)}
              value={selectedPaymentStatus}
            >
              <RadioButton.Item label="Openstaand" value="Openstaand" />
              <RadioButton.Item label="Betaald" value="Betaald" />
              <RadioButton.Item label="Achterstallig" value="Achterstallig" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPaymentDialogVisible(false)}>
              Annuleren
            </Button>
            <Button onPress={updatePaymentStatus}>Opslaan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Notes Dialog */}
      <Portal>
        <Dialog
          visible={notesDialogVisible}
          onDismiss={() => setNotesDialogVisible(false)}
        >
          <Dialog.Title>Notities Bewerken</Dialog.Title>
          <Dialog.Content>
            <TextInput
              value={orderNotes}
              onChangeText={setOrderNotes}
              multiline
              numberOfLines={4}
              style={styles.notesInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNotesDialogVisible(false)}>
              Annuleren
            </Button>
            <Button onPress={updateNotes}>Opslaan</Button>
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
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    gap: 8,
  },
  statusChip: {
    marginBottom: 4,
  },
  paymentChip: {
    height: 32,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    color: "#2E7D32",
    fontSize: 18,
  },
  orderDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    marginVertical: 12,
  },
  eggBreakdown: {
    marginTop: 8,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  eggRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eggSizeChip: {
    flex: 1,
  },
  eggQuantity: {
    fontSize: 14,
    color: "#666",
    marginLeft: 12,
    flex: 1,
  },
  eggPrice: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  trackingContainer: {
    marginTop: 12,
  },
  trackingStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    opacity: 0.5,
  },
  trackingStepCompleted: {
    opacity: 1,
  },
  trackingIconContainer: {
    marginRight: 12,
  },
  trackingInfo: {
    flex: 1,
  },
  trackingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  trackingDate: {
    fontSize: 12,
    color: "#666",
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    fontStyle: (order) => (!order.notes ? "italic" : "normal"),
  },
  notesInput: {
    backgroundColor: "white",
  },
  actionButton: {
    marginBottom: 8,
  },
});
