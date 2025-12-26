import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Card,
  Button,
  Divider,
  Chip,
  IconButton,
  Dialog,
  Portal,
  TextInput,
  Menu,
} from "react-native-paper";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import salesService from "../services/salesService";
import customerService from "../services/customerService";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OrderDetailScreen({ route, navigation }) {
  const { isDarkMode, colors } = useTheme();
  const { t } = useSettings();
  const insets = useSafeAreaInsets();
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const [editedOrder, setEditedOrder] = useState(null);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      // Load order details
      const orderData = await salesService.getOrder(orderId);
      setOrder(orderData);
      setEditedOrder({
        customerId: orderData.customerId,
        eggsSmall: orderData.eggsSmall.toString(),
        eggsMedium: orderData.eggsMedium.toString(),
        eggsLarge: orderData.eggsLarge.toString(),
        eggsRejected: orderData.eggsRejected?.toString() || "0",
        totalPrice: orderData.totalPrice.toString(),
        notes: orderData.notes || "",
      });

      // Load customer details
      const customerData = await customerService.getCustomer(
        orderData.customerId
      );
      setCustomer(customerData);
    } catch (error) {
      console.error("Error loading order details:", error);
      Alert.alert(t('error'), t('couldNotLoadOrder'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    const totalEggs =
      parseInt(editedOrder.eggsSmall || 0) +
      parseInt(editedOrder.eggsMedium || 0) +
      parseInt(editedOrder.eggsLarge || 0);

    if (totalEggs === 0) {
      Alert.alert(t('error'), t('enterAtLeastOneEgg'));
      return;
    }

    try {
      await salesService.updateOrder(orderId, {
        customerId: editedOrder.customerId,
        eggsSmall: parseInt(editedOrder.eggsSmall || 0),
        eggsMedium: parseInt(editedOrder.eggsMedium || 0),
        eggsLarge: parseInt(editedOrder.eggsLarge || 0),
        eggsRejected: parseInt(editedOrder.eggsRejected || 0),
        totalPrice: parseFloat(editedOrder.totalPrice || 0),
        notes: editedOrder.notes,
      });

      setShowEditDialog(false);
      await loadOrderDetails();
      Alert.alert(t('success'), t('orderUpdated'));
    } catch (error) {
      console.error("Error updating order:", error);
      Alert.alert(t('error'), t('couldNotUpdateOrder'));
    }
  };

  const handleDeleteOrder = async () => {
    try {
      await salesService.deleteOrder(orderId);
      setShowDeleteDialog(false);
      Alert.alert(t('success'), t('orderDeleted'), [
        { text: t('ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error deleting order:", error);
      Alert.alert(t('error'), t('couldNotDeleteOrder'));
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await salesService.updateStatus(orderId, newStatus);
      await loadOrderDetails();
      Alert.alert(t('success'), t('statusUpdated'));
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert(t('error'), t('couldNotUpdateStatus'));
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

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>{t('loading')}</Text>
      </View>
    );
  }

  if (!order || !customer) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.onSurface }}>{t('orderNotFound')}</Text>
      </View>
    );
  }

  const totalEggs =
    (order.eggsSmall || 0) + (order.eggsMedium || 0) + (order.eggsLarge || 0);

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
          <Text style={styles.headerTitle}>Order #{order.id}</Text>
          <Text style={styles.headerSubtitle}>
            {new Date(order.saleTime).toLocaleDateString("nl-NL", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
        <Chip
          style={[
            styles.statusChip,
            { backgroundColor: getStatusColor(order.status) },
          ]}
          textStyle={styles.statusText}
        >
          {getStatusLabel(order.status)}
        </Chip>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
              iconColor="#fff"
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setShowEditDialog(true);
            }}
            title={t('edit')}
            leadingIcon="pencil"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setShowDeleteDialog(true);
            }}
            title={t('delete')}
            leadingIcon="delete"
          />
        </Menu>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Customer Information */}
        <Card
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={() =>
            navigation.navigate("CustomerDetail", { customerId: customer.id })
          }
        >
          <Card.Title
            title={t('customerInfo')}
            titleStyle={{ color: colors.onSurface }}
            subtitle={t('tapToViewCustomer')}
            subtitleStyle={{ color: colors.onSurfaceVariant }}
            left={(props) => <Icon {...props} name="account" size={24} color={colors.onSurfaceVariant} />}
            right={(props) => (
              <Icon {...props} name="chevron-right" size={24} color={colors.onSurfaceVariant} />
            )}
          />
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>{t('name')}:</Text>
              <Text style={[styles.infoValue, { color: colors.onSurface }]}>{customer.name}</Text>
            </View>
            {customer.email && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>{t('email')}:</Text>
                <Text style={[styles.infoValue, { color: colors.onSurface }]}>{customer.email}</Text>
              </View>
            )}
            {customer.phone && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>{t('phone')}:</Text>
                <Text style={[styles.infoValue, { color: colors.onSurface }]}>{customer.phone}</Text>
              </View>
            )}
            {customer.address && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>{t('address')}:</Text>
                <Text style={[styles.infoValue, { color: colors.onSurface }]}>{customer.address}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Order Details */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={t('orderDetails')}
            titleStyle={{ color: colors.onSurface }}
            left={(props) => <Icon {...props} name="receipt" size={24} color={colors.primary} />}
          />
          <Card.Content>
            <View style={styles.eggBreakdown}>
              {order.eggsSmall > 0 && (
                <View style={styles.eggRow}>
                  <View style={styles.eggInfo}>
                    <Icon name="egg" size={20} color={colors.onSurfaceVariant} />
                    <Text style={[styles.eggLabel, { color: colors.onSurface }]}>{t('eggsSmall')}</Text>
                  </View>
                  <Text style={[styles.eggValue, { color: colors.onSurface }]}>{order.eggsSmall}</Text>
                </View>
              )}
              {order.eggsMedium > 0 && (
                <View style={styles.eggRow}>
                  <View style={styles.eggInfo}>
                    <Icon name="egg" size={24} color={colors.onSurfaceVariant} />
                    <Text style={[styles.eggLabel, { color: colors.onSurface }]}>{t('eggsMedium')}</Text>
                  </View>
                  <Text style={[styles.eggValue, { color: colors.onSurface }]}>{order.eggsMedium}</Text>
                </View>
              )}
              {order.eggsLarge > 0 && (
                <View style={styles.eggRow}>
                  <View style={styles.eggInfo}>
                    <Icon name="egg" size={28} color={colors.onSurfaceVariant} />
                    <Text style={[styles.eggLabel, { color: colors.onSurface }]}>{t('eggsLarge')}</Text>
                  </View>
                  <Text style={[styles.eggValue, { color: colors.onSurface }]}>{order.eggsLarge}</Text>
                </View>
              )}
              {order.eggsRejected > 0 && (
                <View style={styles.eggRow}>
                  <View style={styles.eggInfo}>
                    <Icon name="egg-off" size={24} color="#F44336" />
                    <Text style={[styles.eggLabel, { color: colors.onSurface }]}>{t('rejected')}</Text>
                  </View>
                  <Text style={[styles.eggValue, { color: colors.onSurface }]}>{order.eggsRejected}</Text>
                </View>
              )}
            </View>

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.onSurface }]}>{t('totalEggsCount')}:</Text>
              <Text style={[styles.totalValue, { color: colors.onSurface }]}>{totalEggs}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={[styles.priceLabel, { color: colors.primary }]}>{t('totalPrice')}:</Text>
              <Text style={[styles.priceValue, { color: colors.primary }]}>
                €{order.totalPrice.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Title
              title={t('notes')}
              titleStyle={{ color: colors.onSurface }}
              left={(props) => <Icon {...props} name="note-text" size={24} color={colors.primary} />}
            />
            <Card.Content>
              <Text style={[styles.notesText, { color: colors.onSurface }]}>{order.notes}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Order Timeline */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={t('orderStatus')}
            titleStyle={{ color: colors.onSurface }}
            left={(props) => <Icon {...props} name="timeline" size={24} color={colors.primary} />}
          />
          <Card.Content>
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View
                  style={[styles.timelineDot, { backgroundColor: "#4CAF50" }]}
                />
                <Text style={[styles.timelineText, { color: colors.onSurface }]}>{t('orderCreated')}</Text>
                <Text style={[styles.timelineDate, { color: colors.onSurfaceVariant }]}>
                  {new Date(order.saleTime).toLocaleString("nl-NL")}
                </Text>
              </View>
              {order.status !== "CREATED" && (
                <View style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      { backgroundColor: getStatusColor(order.status) },
                    ]}
                  />
                  <Text style={[styles.timelineText, { color: colors.onSurface }]}>
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        {order.status === "CREATED" && (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => handleStatusUpdate("CONFIRMED")}
              style={styles.confirmButton}
              buttonColor="#4CAF50"
              icon="check"
            >
              {t('confirmOrder')}
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleStatusUpdate("CANCELLED")}
              style={styles.cancelButton}
              textColor="#F44336"
              icon="close"
            >
              {t('cancelOrder')}
            </Button>
          </View>
        )}

        {order.status === "CONFIRMED" && (
          <Button
            mode="contained"
            onPress={() => handleStatusUpdate("PAID")}
            style={styles.deliverButton}
            buttonColor="#2196F3"
            icon="truck-delivery"
          >
            {t('markAsDelivered')}
          </Button>
        )}
      </ScrollView>

      {/* Edit Order Dialog */}
      <Portal>
        <Dialog
          visible={showEditDialog}
          onDismiss={() => setShowEditDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>{t('editOrder')}</Dialog.Title>
          <Dialog.Content>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              <TextInput
                label={t('eggsSmall')}
                value={editedOrder?.eggsSmall || ""}
                onChangeText={(text) =>
                  setEditedOrder({ ...editedOrder, eggsSmall: text })
                }
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label={t('eggsMedium')}
                value={editedOrder?.eggsMedium || ""}
                onChangeText={(text) =>
                  setEditedOrder({ ...editedOrder, eggsMedium: text })
                }
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label={t('eggsLarge')}
                value={editedOrder?.eggsLarge || ""}
                onChangeText={(text) =>
                  setEditedOrder({ ...editedOrder, eggsLarge: text })
                }
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label={t('rejected')}
                value={editedOrder?.eggsRejected || ""}
                onChangeText={(text) =>
                  setEditedOrder({ ...editedOrder, eggsRejected: text })
                }
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label={`${t('totalPrice')} (€)`}
                value={editedOrder?.totalPrice || ""}
                onChangeText={(text) =>
                  setEditedOrder({ ...editedOrder, totalPrice: text })
                }
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label={t('notes')}
                value={editedOrder?.notes || ""}
                onChangeText={(text) =>
                  setEditedOrder({ ...editedOrder, notes: text })
                }
                multiline
                numberOfLines={3}
                mode="outlined"
                style={styles.input}
              />
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEditDialog(false)}>{t('cancel')}</Button>
            <Button onPress={handleUpdateOrder}>{t('save')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
        >
          <Dialog.Title>{t('deleteOrder')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('confirmDeleteOrder')}</Text>
            <Text style={styles.deleteWarning}>
              {t('cannotUndo')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onPress={handleDeleteOrder} textColor="#F44336">
              {t('delete')}
            </Button>
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
  statusChip: {
    marginLeft: 8,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  eggBreakdown: {
    marginTop: 8,
  },
  eggRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  eggInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  eggLabel: {
    fontSize: 16,
    color: "#333",
  },
  eggValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  divider: {
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  priceLabel: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  timelineDate: {
    fontSize: 12,
    color: "#999",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  confirmButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  deliverButton: {
    margin: 16,
  },
  dialog: {
    maxHeight: "80%",
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
  deleteWarning: {
    marginTop: 8,
    color: "#F44336",
    fontStyle: "italic",
  },
});
