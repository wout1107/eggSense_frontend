import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
  Alert,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
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
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import salesService from "../services/salesService";
import customerService from "../services/customerService";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";

export default function SalesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors } = useTheme();
  const { t } = useSettings();

  // Refs for keyboard navigation
  const eggsMediumRef = useRef(null);
  const eggsLargeRef = useRef(null);
  const totalPriceRef = useRef(null);
  const notesRef = useRef(null);

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
      const salesData = await salesService.listOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setSales(salesData);
      setFilteredSales(salesData);

      const customersData = await customerService.listCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading sales data:", error);
      Alert.alert(t('error'), t('couldNotLoadSales'));
    } finally {
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
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

  // Group sales by status for SectionList (EXAM REQUIREMENT)
  const sectionedSales = useMemo(() => {
    // Status values must match backend SaleStatus enum: CREATED, CONFIRMED, PAID, CANCELLED
    const statusOrder = ['CREATED', 'CONFIRMED', 'PAID', 'CANCELLED'];
    const statusLabels = {
      'CREATED': `🟠 ${t('inProgress')}`,
      'CONFIRMED': `🔵 ${t('confirmed')}`,
      'PAID': `🟢 ${t('paid')}`,
      'CANCELLED': `🔴 ${t('cancelled')}`,
    };

    const grouped = filteredSales.reduce((acc, sale) => {
      const status = sale.status || 'CREATED';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(sale);
      return acc;
    }, {});

    return statusOrder
      .filter(status => grouped[status] && grouped[status].length > 0)
      .map(status => ({
        title: statusLabels[status] || status,
        status: status,
        data: grouped[status].sort((a, b) =>
          new Date(b.saleTime) - new Date(a.saleTime)
        ),
      }));
  }, [filteredSales]);

  const onRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim()) {
      Alert.alert(t('error'), t('enterCustomerName'));
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
      Alert.alert(t('success'), t('customerSuccessfullyCreated'));
    } catch (error) {
      console.error("Error creating customer:", error);
      Alert.alert(t('error'), t('couldNotCreateCustomer'));
    }
  };

  const handleCreateSale = async () => {
    if (!newSale.customerId) {
      Alert.alert(t('error'), t('selectACustomer'));
      return;
    }

    const eggsSmall = parseInt(newSale.eggsSmall || 0);
    const eggsMedium = parseInt(newSale.eggsMedium || 0);
    const eggsLarge = parseInt(newSale.eggsLarge || 0);
    const eggsRejected = parseInt(newSale.eggsRejected || 0);

    const totalEggs = eggsSmall + eggsMedium + eggsLarge;

    if (totalEggs === 0) {
      Alert.alert(t('error'), t('enterAtLeastOneEgg'));
      return;
    }

    // Calculate price in frontend if not manually entered
    // Default prices: Small=0.15, Medium=0.22, Large=0.28, Rejected=0.05
    let totalPrice = parseFloat(newSale.totalPrice || 0);
    if (totalPrice <= 0) {
      totalPrice =
        eggsSmall * 0.15 +
        eggsMedium * 0.22 +
        eggsLarge * 0.28 +
        eggsRejected * 0.05;
    }

    try {
      await salesService.createOrder({
        customerId: newSale.customerId,
        eggsSmall,
        eggsMedium,
        eggsLarge,
        eggsRejected,
        totalPrice,
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
      Alert.alert(t('success'), t('saleCreated'));
    } catch (error) {
      console.error("Error creating sale:", error);
      Alert.alert(t('error'), t('couldNotCreateSale'));
    }
  };

  const handleUpdateStatus = async (saleId, newStatus) => {
    try {
      await salesService.updateStatus(saleId, newStatus);
      await loadData();
      Alert.alert(t('success'), t('statusUpdated'));
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert(t('error'), t('couldNotUpdateStatus'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CREATED":
        return "#FF9800";
      case "CONFIRMED":
        return "#2196F3";
      case "PAID":
        return "#4CAF50";
      case "CANCELLED":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "CREATED":
        return t('inProgress');
      case "CONFIRMED":
        return t('confirmed');
      case "PAID":
        return t('delivered');
      case "CANCELLED":
        return t('cancelled');
      default:
        return status;
    }
  };

  // Section header renderer for SectionList
  const renderSectionHeader = ({ section }) => (
    <View style={[styles.sectionHeader, { backgroundColor: isDarkMode ? colors.surfaceVariant : '#f0f0f0' }]}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
        {section.title}
      </Text>
      <Chip
        mode="flat"
        style={[styles.countChip, { backgroundColor: getStatusColor(section.status) }]}
        textStyle={styles.countChipText}
      >
        {section.data.length}
      </Chip>
    </View>
  );

  const renderSaleItem = ({ item }) => {
    const customer = customers.find((c) => c.id === item.customerId);
    const totalEggs =
      (item.eggsSmall || 0) + (item.eggsMedium || 0) + (item.eggsLarge || 0);

    return (
      <Card
        style={[styles.saleCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
      >
        <Card.Content>
          <View style={styles.saleHeader}>
            <View style={styles.saleInfo}>
              <Text
                style={[styles.customerName, { color: colors.onSurface }]}
                onPress={() =>
                  customer &&
                  navigation.navigate("CustomerDetail", {
                    customerId: customer.id,
                  })
                }
              >
                {customer?.name || t('unknownCustomer')}
              </Text>
              <Text style={[styles.saleDate, { color: isDarkMode ? '#aaa' : '#666' }]}>
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
                <Icon name="egg" size={16} color={isDarkMode ? '#aaa' : '#666'} />
                <Text style={[styles.eggText, { color: isDarkMode ? '#aaa' : '#666' }]}>S: {item.eggsSmall}</Text>
              </View>
            )}
            {item.eggsMedium > 0 && (
              <View style={styles.eggItem}>
                <Icon name="egg" size={18} color={isDarkMode ? '#aaa' : '#666'} />
                <Text style={[styles.eggText, { color: isDarkMode ? '#aaa' : '#666' }]}>M: {item.eggsMedium}</Text>
              </View>
            )}
            {item.eggsLarge > 0 && (
              <View style={styles.eggItem}>
                <Icon name="egg" size={20} color={isDarkMode ? '#aaa' : '#666'} />
                <Text style={[styles.eggText, { color: isDarkMode ? '#aaa' : '#666' }]}>L: {item.eggsLarge}</Text>
              </View>
            )}
          </View>

          <View style={[styles.saleFooter, { borderTopColor: isDarkMode ? '#333' : '#e0e0e0' }]}>
            <Text style={[styles.totalEggs, { color: isDarkMode ? '#aaa' : '#666' }]}>{t('totalEggs')}: {totalEggs} {t('eggs')}</Text>
            <Text style={[styles.totalPrice, { color: colors.primary }]}>€{item.totalPrice.toFixed(2)}</Text>
          </View>

          {item.status === "CREATED" && (
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => handleUpdateStatus(item.id, "CONFIRMED")}
                style={styles.confirmButton}
                buttonColor="#4CAF50"
              >
                {t('confirmOrder')}
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleUpdateStatus(item.id, "CANCELLED")}
                style={styles.cancelButton}
                textColor="#F44336"
              >
                {t('cancelOrder')}
              </Button>
            </View>
          )}

          {item.status === "CONFIRMED" && (
            <Button
              mode="contained"
              onPress={() => handleUpdateStatus(item.id, "PAID")}
              style={styles.deliverButton}
              buttonColor="#2196F3"
            >
              {t('markAsDelivered')}
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: isDarkMode ? '#333' : '#e0e0e0', paddingTop: insets.top }]}>
        <Text style={[styles.title, { color: colors.primary }]}>{t('sales')}</Text>
        <Searchbar
          placeholder={t('searchByCustomer')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: isDarkMode ? colors.surfaceVariant : '#f5f5f5' }]}
          iconColor={colors.primary}
          inputStyle={{ color: colors.onSurface }}
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
        />
        <SegmentedButtons
          value={statusFilter}
          onValueChange={setStatusFilter}
          buttons={[
            { value: "all", label: t('allStatus') },
            { value: "CREATED", label: t('inProgress') },
            { value: "CONFIRMED", label: t('confirmed') },
            { value: "PAID", label: t('paid') },
          ]}
          style={styles.filterButtons}
        />
      </View>

      {/* SECTIONLIST - EXAM REQUIREMENT */}
      <SectionList
        sections={sectionedSales}
        renderItem={renderSaleItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        stickySectionHeadersEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="cart-off" size={64} color={isDarkMode ? '#555' : '#ccc'} />
            <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#999' }]}>
              {t('noSalesFound')}
            </Text>
            <Text style={[styles.emptySubtext, { color: isDarkMode ? '#666' : '#bbb' }]}>
              {t('groupedByStatus')}
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowDialog(true)}
        label={t('newSale')}
        color="#fff"
      />

      {/* Main Sale Dialog */}
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>{t('newSale')}</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView
              contentContainerStyle={styles.dialogContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.customerSectionHeader}>
                <Text style={styles.inputLabel}>{t('customer')} *</Text>
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
                label={t('eggsSmall')}
                value={newSale.eggsSmall}
                onChangeText={(text) =>
                  setNewSale({ ...newSale, eggsSmall: text })
                }
                keyboardType="numeric"
                style={styles.input}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => eggsMediumRef.current?.focus()}
              />

              <TextInput
                ref={eggsMediumRef}
                label={t('eggsMedium')}
                value={newSale.eggsMedium}
                onChangeText={(text) =>
                  setNewSale({ ...newSale, eggsMedium: text })
                }
                keyboardType="numeric"
                style={styles.input}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => eggsLargeRef.current?.focus()}
              />

              <TextInput
                ref={eggsLargeRef}
                label={t('eggsLarge')}
                value={newSale.eggsLarge}
                onChangeText={(text) =>
                  setNewSale({ ...newSale, eggsLarge: text })
                }
                keyboardType="numeric"
                style={styles.input}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => totalPriceRef.current?.focus()}
              />

              <TextInput
                ref={totalPriceRef}
                label={t('totalPrice') + " (€)"}
                value={newSale.totalPrice}
                onChangeText={(text) =>
                  setNewSale({ ...newSale, totalPrice: text })
                }
                keyboardType="decimal-pad"
                style={styles.input}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => notesRef.current?.focus()}
              />

              <TextInput
                ref={notesRef}
                label={t('notes')}
                value={newSale.notes}
                onChangeText={(text) => setNewSale({ ...newSale, notes: text })}
                multiline
                numberOfLines={3}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>{t('cancel')}</Button>
            <Button onPress={handleCreateSale}>{t('createSale')}</Button>
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
          <Dialog.Title>{t('newCustomer')}</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView
              contentContainerStyle={styles.dialogContent}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                label={`${t('customerName')} *`}
                value={newCustomer.name}
                onChangeText={(text) =>
                  setNewCustomer({ ...newCustomer, name: text })
                }
                style={styles.input}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <TextInput
                label={t('email')}
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
                label={t('phone')}
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
                label={t('address')}
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
                label={t('notes')}
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
              {t('cancel')}
            </Button>
            <Button onPress={handleCreateCustomer}>{t('create')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  searchBar: {
    marginBottom: 12,
    elevation: 0,
  },
  filterButtons: {
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  // Section header styles for SectionList
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  countChip: {
    height: 28,
  },
  countChipText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
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
    marginBottom: 4,
  },
  saleDate: {
    fontSize: 14,
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
  },
  saleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalEggs: {
    fontSize: 14,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
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
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
  dialog: {
    maxHeight: "90%",
  },
  scrollArea: {
    maxHeight: 500,
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
