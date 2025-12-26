import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import {
  Card,
  Button,
  IconButton,
  Dialog,
  Portal,
  TextInput,
  Chip,
} from "react-native-paper";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import customerService from "../services/customerService";
import salesService from "../services/salesService";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomerDetailScreen({ route, navigation }) {
  const { isDarkMode, colors } = useTheme();
  const { t } = useSettings();
  const insets = useSafeAreaInsets();
  const { customerId } = route.params;
  const [customer, setCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerStats, setCustomerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(null);

  useEffect(() => {
    loadCustomerDetails();
  }, [customerId]);

  const loadCustomerDetails = async () => {
    try {
      setLoading(true);
      // Load customer details
      const customerData = await customerService.getCustomer(customerId);
      setCustomer(customerData);
      setEditedCustomer(customerData);

      // Load customer's orders using new endpoint
      const orders = await customerService.getCustomerOrders(customerId);
      setCustomerOrders(orders);

      // Load customer statistics using new endpoint
      const stats = await customerService.getCustomerStatistics(customerId);
      setCustomerStats(stats);
    } catch (error) {
      console.error("Error loading customer details:", error);
      Alert.alert(t('error'), t('couldNotLoadCustomer'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async () => {
    if (!editedCustomer.name.trim()) {
      Alert.alert(t('error'), t('enterCustomerName'));
      return;
    }

    try {
      await customerService.updateCustomer(customerId, {
        name: editedCustomer.name,
        email: editedCustomer.email,
        phone: editedCustomer.phone,
        address: editedCustomer.address,
        notes: editedCustomer.notes,
      });

      setShowEditDialog(false);
      await loadCustomerDetails();
      Alert.alert(t('success'), t('customerUpdated'));
    } catch (error) {
      console.error("Error updating customer:", error);
      Alert.alert(t('error'), t('couldNotUpdateCustomer'));
    }
  };

  const handleDeleteCustomer = () => {
    Alert.alert(
      t('confirm'),
      t('confirmDeleteCustomer'),
      [
        { text: t('cancel'), style: "cancel" },
        {
          text: t('delete'),
          style: "destructive",
          onPress: async () => {
            try {
              await customerService.deleteCustomer(customerId);
              Alert.alert(t('success'), t('customerDeleted'));
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting customer:", error);
              Alert.alert(t('error'), t('couldNotDeleteCustomer'));
            }
          },
        },
      ]
    );
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
        return t('inProgress');
      case "CONFIRMED":
        return t('confirmed');
      case "DELIVERED":
        return t('delivered');
      case "CANCELLED":
        return t('cancelled');
      default:
        return status;
    }
  };

  const calculateTotalSpent = () => {
    return customerOrders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((sum, order) => sum + order.totalPrice, 0);
  };

  const calculateTotalOrders = () => {
    return customerOrders.filter((order) => order.status !== "CANCELLED")
      .length;
  };

  const renderOrderItem = ({ item }) => {
    const totalEggs =
      (item.eggsSmall || 0) + (item.eggsMedium || 0) + (item.eggsLarge || 0);

    return (
      <Card
        style={[styles.orderCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
      >
        <Card.Content>
          <View style={styles.orderHeader}>
            <Text style={[styles.orderNumber, { color: colors.onSurface }]}>Order #{item.id}</Text>
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
          <Text style={[styles.orderDate, { color: colors.onSurfaceVariant }]}>
            {new Date(item.saleTime).toLocaleDateString("nl-NL", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
          <View style={styles.orderFooter}>
            <Text style={[styles.orderEggs, { color: colors.onSurfaceVariant }]}>{totalEggs} {t('eggs')}</Text>
            <Text style={[styles.orderPrice, { color: colors.primary }]}>€{item.totalPrice.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>{t('loading')}</Text>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.onSurface }}>{t('customerNotFound')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: insets.top }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor="#fff"
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{customer.name}</Text>
          <Text style={styles.headerSubtitle}>{t('customerDetails')}</Text>
        </View>
        <IconButton
          icon="pencil"
          size={24}
          onPress={() => setShowEditDialog(true)}
          iconColor="#fff"
        />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Customer Statistics */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="cart" size={32} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.onSurface }]}>
                  {customerStats?.orderCount || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{t('orders')}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="currency-eur" size={32} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.onSurface }]}>
                  €{(customerStats?.totalRevenue || 0).toFixed(2)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{t('totalSpent')}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="chart-line" size={32} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.onSurface }]}>
                  €{(customerStats?.averageOrderValue || 0).toFixed(2)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{t('avgOrderValue')}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={t('contactInfo')}
            titleStyle={{ color: colors.onSurface }}
            left={(props) => (
              <Icon {...props} name="card-account-details" size={24} color={colors.onSurfaceVariant} />
            )}
          />
          <Card.Content>
            {customer.email && (
              <View style={styles.infoRow}>
                <Icon name="email" size={20} color={colors.onSurfaceVariant} />
                <Text style={[styles.infoText, { color: colors.onSurface }]}>{customer.email}</Text>
              </View>
            )}
            {customer.phone && (
              <View style={styles.infoRow}>
                <Icon name="phone" size={20} color={colors.onSurfaceVariant} />
                <Text style={[styles.infoText, { color: colors.onSurface }]}>{customer.phone}</Text>
              </View>
            )}
            {customer.address && (
              <View style={styles.infoRow}>
                <Icon name="map-marker" size={20} color={colors.onSurfaceVariant} />
                <Text style={[styles.infoText, { color: colors.onSurface }]}>{customer.address}</Text>
              </View>
            )}
            {customer.notes && (
              <View style={styles.infoRow}>
                <Icon name="note-text" size={20} color={colors.onSurfaceVariant} />
                <Text style={[styles.infoText, { color: colors.onSurface }]}>{customer.notes}</Text>
              </View>
            )}
            {!customer.email &&
              !customer.phone &&
              !customer.address &&
              !customer.notes && (
                <Text style={[styles.noInfoText, { color: colors.onSurfaceVariant }]}>
                  {t('noAdditionalInfo')}
                </Text>
              )}
          </Card.Content>
        </Card>

        {/* Order History */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={t('orderHistory')}
            titleStyle={{ color: colors.onSurface }}
            subtitle={`${customerOrders.length} ${t('orders').toLowerCase()}${customerOrders.length !== 1 ? "" : ""
              }`}
            subtitleStyle={{ color: colors.onSurfaceVariant }}
            left={(props) => <Icon {...props} name="history" size={24} color={colors.onSurfaceVariant} />}
          />
          <Card.Content>
            {customerOrders.length > 0 ? (
              <FlatList
                data={customerOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyOrders}>
                <Icon name="cart-off" size={48} color={colors.onSurfaceVariant} />
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>{t('noOrders')}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Delete Button */}
        <Button
          mode="outlined"
          onPress={handleDeleteCustomer}
          style={styles.deleteButton}
          textColor="#F44336"
          icon="delete"
        >
          {t('deleteCustomer')}
        </Button>
      </ScrollView>

      {/* Edit Dialog */}
      <Portal>
        <Dialog
          visible={showEditDialog}
          onDismiss={() => setShowEditDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>{t('editCustomer')}</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView
              contentContainerStyle={styles.dialogContent}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                label={`${t('customerName')} *`}
                value={editedCustomer?.name || ""}
                onChangeText={(text) =>
                  setEditedCustomer({ ...editedCustomer, name: text })
                }
                style={styles.input}
              />

              <TextInput
                label={t('email')}
                value={editedCustomer?.email || ""}
                onChangeText={(text) =>
                  setEditedCustomer({ ...editedCustomer, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <TextInput
                label={t('phone')}
                value={editedCustomer?.phone || ""}
                onChangeText={(text) =>
                  setEditedCustomer({ ...editedCustomer, phone: text })
                }
                keyboardType="phone-pad"
                style={styles.input}
              />

              <TextInput
                label={t('address')}
                value={editedCustomer?.address || ""}
                onChangeText={(text) =>
                  setEditedCustomer({ ...editedCustomer, address: text })
                }
                multiline
                numberOfLines={2}
                style={styles.input}
              />

              <TextInput
                label={t('notes')}
                value={editedCustomer?.notes || ""}
                onChangeText={(text) =>
                  setEditedCustomer({ ...editedCustomer, notes: text })
                }
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowEditDialog(false)}>{t('cancel')}</Button>
            <Button onPress={handleUpdateCustomer}>{t('save')}</Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2E7D32",
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  noInfoText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 12,
  },
  orderCard: {
    marginBottom: 8,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderEggs: {
    fontSize: 14,
    color: "#666",
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  emptyOrders: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    marginTop: 12,
  },
  deleteButton: {
    margin: 16,
    borderColor: "#F44336",
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
  input: {
    marginBottom: 12,
  },
});
