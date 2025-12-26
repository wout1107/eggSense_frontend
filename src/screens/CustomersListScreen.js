import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import {
    Card,
    Searchbar,
    Chip,
    FAB,
    Dialog,
    Portal,
    TextInput,
    Button,
} from "react-native-paper";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import customerService from "../services/customerService";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";

export default function CustomersListScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { isDarkMode, colors } = useTheme();
    const { t } = useSettings();
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
    });

    const loadCustomers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await customerService.listCustomers();
            setCustomers(data);
            setFilteredCustomers(data);
        } catch (error) {
            console.error("Error loading customers:", error);
            Alert.alert(t('error'), t('couldNotLoad'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            loadCustomers();
        });
        return unsubscribe;
    }, [navigation, loadCustomers]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredCustomers(customers);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredCustomers(
                customers.filter(
                    (c) =>
                        c.name.toLowerCase().includes(query) ||
                        (c.email && c.email.toLowerCase().includes(query)) ||
                        (c.phone && c.phone.includes(query))
                )
            );
        }
    }, [searchQuery, customers]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadCustomers();
        setRefreshing(false);
    }, [loadCustomers]);

    const handleAddCustomer = async () => {
        if (!newCustomer.name.trim()) {
            Alert.alert(t('error'), t('fillRequired'));
            return;
        }

        try {
            await customerService.createCustomer(newCustomer);
            setShowAddDialog(false);
            setNewCustomer({ name: "", email: "", phone: "", address: "", notes: "" });
            await loadCustomers();
            Alert.alert(t('success'), t('customerCreated'));
        } catch (error) {
            console.error("Error adding customer:", error);
            Alert.alert(t('error'), t('couldNotSave'));
        }
    };

    const renderCustomerItem = ({ item }) => (
        <Card
            style={[styles.customerCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate("CustomerDetail", { customerId: item.id })}
        >
            <Card.Content>
                <View style={styles.customerHeader}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.customerInfo}>
                        <Text style={[styles.customerName, { color: colors.onSurface }]}>
                            {item.name}
                        </Text>
                        {item.email && (
                            <Text style={[styles.customerEmail, { color: colors.onSurfaceVariant }]}>
                                {item.email}
                            </Text>
                        )}
                        {item.phone && (
                            <Text style={[styles.customerPhone, { color: colors.onSurfaceVariant }]}>
                                {item.phone}
                            </Text>
                        )}
                    </View>
                    <Icon name="chevron-right" size={24} color={colors.onSurfaceVariant} />
                </View>
            </Card.Content>
        </Card>
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            // backgroundColor: colors.background, // Removed as it's now inline
        },
        header: {
            padding: 20,
            // backgroundColor: colors.primary, // Removed as it's now inline
            borderBottomWidth: 1, // Added for borderBottomColor
            flexDirection: 'row', // Added for layout
            justifyContent: 'space-between', // Added for layout
            alignItems: 'center', // Added for layout
        },
        title: { // Renamed from headerTitle
            fontSize: 24,
            fontWeight: "bold",
            // color: "#fff", // Removed as it's now inline
        },
        headerSubtitle: {
            fontSize: 14,
            color: "rgba(255,255,255,0.8)",
            marginTop: 4,
        },
        searchContainer: {
            padding: 16,
            paddingBottom: 8,
        },
        searchbar: {
            backgroundColor: colors.surface,
        },
        listContent: {
            padding: 16,
            paddingTop: 8,
        },
        customerCard: {
            marginBottom: 12,
            elevation: 2,
        },
        customerHeader: {
            flexDirection: "row",
            alignItems: "center",
        },
        avatarContainer: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
        },
        avatarText: {
            fontSize: 20,
            fontWeight: "bold",
            color: "#fff",
        },
        customerInfo: {
            flex: 1,
        },
        customerName: {
            fontSize: 16,
            fontWeight: "bold",
        },
        customerEmail: {
            fontSize: 14,
            marginTop: 2,
        },
        customerPhone: {
            fontSize: 14,
            marginTop: 2,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 48,
        },
        emptyText: {
            fontSize: 16,
            color: colors.onSurfaceVariant,
            marginTop: 12,
        },
        emptySubtext: {
            fontSize: 14,
            color: colors.onSurfaceVariant,
            marginTop: 4,
            textAlign: "center",
        },
        fab: {
            position: "absolute",
            right: 16,
            bottom: 16,
            backgroundColor: colors.primary,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        dialog: {
            backgroundColor: colors.surface,
        },
        dialogContent: {
            paddingHorizontal: 24,
        },
        input: {
            marginBottom: 12,
            backgroundColor: colors.surface,
        },
    });

    if (loading && customers.length === 0) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.onSurface, marginTop: 12 }}>
                    {t('customersLoading')}
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: isDarkMode ? '#333' : '#e0e0e0', paddingTop: insets.top }]}>
                <Text style={[styles.title, { color: colors.primary }]}>{t('customers')}</Text>
                <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
                    {customers.length} {customers.length !== 1 ? t('customers').toLowerCase() : t('customer').toLowerCase()}
                </Text>
            </View>

            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder={t('search') + ' ' + t('customers').toLowerCase() + '...'}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchbar}
                    iconColor={colors.onSurfaceVariant}
                    inputStyle={{ color: colors.onSurface }}
                    placeholderTextColor={colors.onSurfaceVariant}
                />
            </View>

            <FlatList
                data={filteredCustomers}
                renderItem={renderCustomerItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="account-group-outline" size={64} color={colors.onSurfaceVariant} />
                        <Text style={styles.emptyText}>
                            {searchQuery ? t('noCustomersFound') : t('noCustomersFound')}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {searchQuery
                                ? t('search') + '...'
                                : t('addFirstCustomer')}
                        </Text>
                    </View>
                }
            />

            < FAB
                icon="plus"
                style={styles.fab}
                onPress={() => setShowAddDialog(true)}
                color="#fff"
            />

            <Portal>
                <Dialog
                    visible={showAddDialog}
                    onDismiss={() => setShowAddDialog(false)}
                    style={styles.dialog}
                >
                    <Dialog.Title style={{ color: colors.onSurface }}>
                        {t('newCustomer')}
                    </Dialog.Title>
                    <Dialog.ScrollArea style={{ maxHeight: 400 }}>
                        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 80 }}>
                            <View style={styles.dialogContent}>
                                <TextInput
                                    label={t('customerName') + ' *'}
                                    value={newCustomer.name}
                                    onChangeText={(text) =>
                                        setNewCustomer({ ...newCustomer, name: text })
                                    }
                                    style={styles.input}
                                    mode="outlined"
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
                                    mode="outlined"
                                />
                                <TextInput
                                    label={t('phone')}
                                    value={newCustomer.phone}
                                    onChangeText={(text) =>
                                        setNewCustomer({ ...newCustomer, phone: text })
                                    }
                                    keyboardType="phone-pad"
                                    style={styles.input}
                                    mode="outlined"
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
                                    mode="outlined"
                                />
                                <TextInput
                                    label={t('notes')}
                                    value={newCustomer.notes}
                                    onChangeText={(text) =>
                                        setNewCustomer({ ...newCustomer, notes: text })
                                    }
                                    multiline
                                    numberOfLines={2}
                                    style={styles.input}
                                    mode="outlined"
                                />
                            </View>
                        </ScrollView>
                    </Dialog.ScrollArea>
                    <Dialog.Actions>
                        <Button onPress={() => setShowAddDialog(false)}>{t('cancel')}</Button>
                        <Button onPress={handleAddCustomer}>{t('add')}</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View >
    );
}
