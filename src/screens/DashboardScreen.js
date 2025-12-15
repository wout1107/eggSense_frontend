import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Card,
  Button,
  ProgressBar,
  Chip,
  IconButton,
  Divider,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import stallService from "../services/stallService";
import productionService from "../services/productionService";
import salesService from "../services/salesService";
import api from "../services/api";

const { width } = Dimensions.get("window");

export default function DashboardScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [stalls, setStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [weeklyProduction, setWeeklyProduction] = useState([]);
  const [todayProduction, setTodayProduction] = useState(null);
  const [weekStats, setWeekStats] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Load all stalls
      const stallsData = await stallService.listStalls();
      const activeStalls = stallsData.filter((s) => s.active);
      setStalls(activeStalls.length > 0 ? activeStalls : stallsData);

      // Select first active stall by default
      const activeStall =
        activeStalls.length > 0 ? activeStalls[0] : stallsData[0];
      if (activeStall) {
        setSelectedStall(activeStall);
        await loadStallData(activeStall.id);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      Alert.alert("Fout", "Kon dashboardgegevens niet ophalen");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStallData = async (stallId) => {
    try {
      // Load today's production
      const today = new Date().toISOString().split("T")[0];
      try {
        const todayData = await productionService.getDailyProduction(
          today,
          stallId
        );
        setTodayProduction(todayData);
      } catch (err) {
        setTodayProduction(null);
      }

      // Load last 7 days production
      const productions = await productionService.listForStall(stallId);
      const last7Days = productions.slice(0, 7).reverse();
      setWeeklyProduction(last7Days);

      // Calculate week statistics
      calculateWeekStats(productions.slice(0, 7));

      // Load inventory
      try {
        const invResponse = await api.get(
          `/feed-deliveries/stall/${stallId}/inventory`
        );
        setInventory(invResponse.data);
      } catch (err) {
        setInventory(null);
      }
    } catch (error) {
      console.error("Error loading stall production:", error);
    }
  };

  const calculateWeekStats = (weekData) => {
    if (weekData.length === 0) {
      setWeekStats(null);
      return;
    }

    const totalEggs = weekData.reduce(
      (sum, day) =>
        sum +
        (day.eggsSmall || 0) +
        (day.eggsMedium || 0) +
        (day.eggsLarge || 0),
      0
    );
    const avgEggsPerDay = totalEggs / weekData.length;
    const totalFeed = weekData.reduce((sum, day) => sum + (day.feedKg || 0), 0);
    const totalMortality = weekData.reduce(
      (sum, day) => sum + (day.mortality || 0),
      0
    );

    setWeekStats({
      totalEggs,
      avgEggsPerDay,
      totalFeed,
      totalMortality,
    });
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleStallChange = async (stall) => {
    setSelectedStall(stall);
    await loadStallData(stall.id);
  };

  const getTotalEggs = (production) => {
    if (!production) return 0;
    return (
      (production.eggsSmall || 0) +
      (production.eggsMedium || 0) +
      (production.eggsLarge || 0)
    );
  };

  const renderStallSelector = () => {
    if (stalls.length === 0) {
      return (
        <Card style={styles.warningCard}>
          <Card.Content>
            <View style={styles.warningContent}>
              <Icon name="alert-circle" size={48} color="#FF9800" />
              <Text style={styles.warningTitle}>Geen Stallen Gevonden</Text>
              <Text style={styles.warningText}>
                Maak eerst een stal aan om te beginnen met het bijhouden van
                productiegegevens.
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate("Settings")}
                style={styles.warningButton}
                buttonColor="#2E7D32"
                icon="cog"
              >
                Naar Instellingen
              </Button>
            </View>
          </Card.Content>
        </Card>
      );
    }

    if (stalls.length === 1) {
      return null; // Don't show selector if only one stall
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.stallSelector}
        contentContainerStyle={styles.stallSelectorContent}
      >
        {stalls.map((stall) => (
          <Chip
            key={stall.id}
            selected={selectedStall?.id === stall.id}
            onPress={() => handleStallChange(stall)}
            style={[
              styles.stallChip,
              selectedStall?.id === stall.id && styles.stallChipSelected,
            ]}
            textStyle={styles.stallChipText}
            mode={selectedStall?.id === stall.id ? "flat" : "outlined"}
          >
            {stall.name}
          </Chip>
        ))}
      </ScrollView>
    );
  };

  const renderCurrentStallInfo = () => {
    if (!selectedStall) return null;

    const activeChickens = selectedStall.currentChickenCount || 0;
    const totalChickens = selectedStall.capacity || 0;
    const utilizationPercent =
      totalChickens > 0 ? (activeChickens / totalChickens) * 100 : 0;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.stallHeader}>
            <View style={styles.stallHeaderLeft}>
              <Icon name="barn" size={32} color="#2E7D32" />
              <View style={styles.stallInfo}>
                <Text style={styles.stallName}>{selectedStall.name}</Text>
                {selectedStall.breed && (
                  <Text style={styles.stallBreed}>{selectedStall.breed}</Text>
                )}
              </View>
            </View>
            {!selectedStall.active && (
              <Chip
                mode="flat"
                style={styles.inactiveChip}
                textStyle={{ fontSize: 11 }}
              >
                Inactief
              </Chip>
            )}
          </View>

          <View style={styles.capacitySection}>
            <View style={styles.capacityHeader}>
              <Text style={styles.capacityLabel}>Bezetting</Text>
              <Text style={styles.capacityValue}>
                {activeChickens} / {totalChickens} kippen
              </Text>
            </View>
            <ProgressBar
              progress={totalChickens > 0 ? activeChickens / totalChickens : 0}
              color={utilizationPercent > 90 ? "#4CAF50" : "#FF9800"}
              style={styles.progressBar}
            />
            <Text style={styles.capacityPercentage}>
              {utilizationPercent.toFixed(1)}% bezet
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderTodayStats = () => {
    const todayEggs = getTotalEggs(todayProduction);
    const hasData = todayProduction !== null;

    return (
      <Card style={styles.card}>
        <Card.Title
          title="Vandaag"
          subtitle={new Date().toLocaleDateString("nl-NL", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
          left={(props) => <Icon {...props} name="calendar-today" size={24} />}
        />
        <Card.Content>
          {!hasData ? (
            <View style={styles.noDataContainer}>
              <Icon name="information-outline" size={48} color="#ccc" />
              <Text style={styles.noDataText}>
                Nog geen gegevens ingevoerd voor vandaag
              </Text>
              <Button
                mode="outlined"
                onPress={() =>
                  navigation.navigate("DailyInput", {
                    selectedStallId: selectedStall?.id,
                  })
                }
                style={styles.inputButton}
                icon="plus"
              >
                Gegevens Invoeren
              </Button>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Icon name="egg" size={32} color="#FF9800" />
                <Text style={styles.statValue}>{todayEggs}</Text>
                <Text style={styles.statLabel}>Eieren</Text>
              </View>
              <View style={styles.statBox}>
                <Icon name="food-drumstick" size={32} color="#2196F3" />
                <Text style={styles.statValue}>
                  {todayProduction.feedKg || 0}
                </Text>
                <Text style={styles.statLabel}>Voer (kg)</Text>
              </View>
              <View style={styles.statBox}>
                <Icon name="water" size={32} color="#00BCD4" />
                <Text style={styles.statValue}>
                  {todayProduction.waterLiters || 0}
                </Text>
                <Text style={styles.statLabel}>Water (L)</Text>
              </View>
              {todayProduction.mortality > 0 && (
                <View style={styles.statBox}>
                  <Icon name="alert-circle" size={32} color="#F44336" />
                  <Text style={styles.statValue}>
                    {todayProduction.mortality}
                  </Text>
                  <Text style={styles.statLabel}>Uitval</Text>
                </View>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderWeeklyChart = () => {
    if (weeklyProduction.length === 0) {
      return (
        <Card style={styles.card}>
          <Card.Title
            title="Week Overzicht"
            left={(props) => <Icon {...props} name="chart-line" size={24} />}
          />
          <Card.Content>
            <View style={styles.noDataContainer}>
              <Icon name="chart-line-variant" size={48} color="#ccc" />
              <Text style={styles.noDataText}>
                Geen productiegegevens beschikbaar voor deze week
              </Text>
            </View>
          </Card.Content>
        </Card>
      );
    }

    const maxValue = Math.max(
      ...weeklyProduction.map((d) => getTotalEggs(d)),
      1
    );

    return (
      <Card style={styles.card}>
        <Card.Title
          title="Week Overzicht"
          subtitle={`${weeklyProduction.length} dagen gegevens`}
          left={(props) => <Icon {...props} name="chart-line" size={24} />}
        />
        <Card.Content>
          <View style={styles.chartContainer}>
            {weeklyProduction.map((item, index) => {
              const total = getTotalEggs(item);
              const height = maxValue > 0 ? (total / maxValue) * 100 : 0;
              const date = new Date(item.recordDate);
              const dayName = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"][
                date.getDay()
              ];
              const isToday =
                date.toISOString().split("T")[0] ===
                new Date().toISOString().split("T")[0];

              return (
                <View key={index} style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(height, 2),
                        backgroundColor: isToday ? "#2E7D32" : "#4CAF50",
                      },
                    ]}
                  >
                    {height > 20 && (
                      <Text style={styles.barValueInside}>{total}</Text>
                    )}
                  </View>
                  {height <= 20 && total > 0 && (
                    <Text style={styles.barValueOutside}>{total}</Text>
                  )}
                  <Text
                    style={[styles.barLabel, isToday && styles.barLabelToday]}
                  >
                    {dayName}
                  </Text>
                  <Text style={styles.barDate}>
                    {date.getDate()}/{date.getMonth() + 1}
                  </Text>
                </View>
              );
            })}
          </View>

          {weekStats && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.weekStatsContainer}>
                <View style={styles.weekStatItem}>
                  <Text style={styles.weekStatLabel}>Totaal Eieren</Text>
                  <Text style={styles.weekStatValue}>
                    {weekStats.totalEggs}
                  </Text>
                </View>
                <View style={styles.weekStatItem}>
                  <Text style={styles.weekStatLabel}>Gemiddeld/Dag</Text>
                  <Text style={styles.weekStatValue}>
                    {weekStats.avgEggsPerDay.toFixed(0)}
                  </Text>
                </View>
                <View style={styles.weekStatItem}>
                  <Text style={styles.weekStatLabel}>Totaal Voer</Text>
                  <Text style={styles.weekStatValue}>
                    {weekStats.totalFeed.toFixed(0)} kg
                  </Text>
                </View>
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderInventoryAlert = () => {
    if (!inventory || !inventory.daysRemaining || inventory.daysRemaining > 7)
      return null;

    const isLow = inventory.daysRemaining <= 3;
    const isCritical = inventory.daysRemaining <= 1;
    const currentStock = inventory.currentStock || 0;
    const daysRemaining = inventory.daysRemaining || 0;

    return (
      <Card
        style={[
          styles.alertCard,
          {
            backgroundColor: isCritical
              ? "#FFEBEE"
              : isLow
              ? "#FFF3E0"
              : "#E8F5E9",
          },
        ]}
      >
        <Card.Content>
          <View style={styles.alertContent}>
            <Icon
              name={isCritical ? "alert-circle" : "information"}
              size={32}
              color={isCritical ? "#F44336" : isLow ? "#FF9800" : "#4CAF50"}
            />
            <View style={styles.alertText}>
              <Text style={styles.alertTitle}>
                {isCritical
                  ? "Kritiek Voerniveau!"
                  : isLow
                  ? "Lage Voervoorraad"
                  : "Voervoorraad Normaal"}
              </Text>
              <Text style={styles.alertDescription}>
                Nog {currentStock.toFixed(0)} kg voer beschikbaar (circa{" "}
                {daysRemaining.toFixed(0)} dagen)
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderQuickActions = () => (
    <Card style={styles.card}>
      <Card.Title
        title="Snelle Acties"
        left={(props) => <Icon {...props} name="lightning-bolt" size={24} />}
      />
      <Card.Content>
        <View style={styles.actionsGrid}>
          <Button
            mode="contained"
            icon="plus-circle"
            onPress={() =>
              navigation.navigate("DailyInput", {
                selectedStallId: selectedStall?.id,
              })
            }
            style={styles.actionButton}
            buttonColor="#2E7D32"
          >
            Dagelijkse Invoer
          </Button>
          <Button
            mode="outlined"
            icon="chart-bar"
            onPress={() => navigation.navigate("Reports")}
            style={styles.actionButton}
          >
            Rapporten
          </Button>
          <Button
            mode="outlined"
            icon="cart"
            onPress={() => navigation.navigate("Sales")}
            style={styles.actionButton}
          >
            Verkoop
          </Button>
          <Button
            mode="outlined"
            icon="truck-delivery"
            onPress={() => navigation.navigate("FeedDelivery")}
            style={styles.actionButton}
          >
            Voerleveringen
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Dashboard laden...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Dashboard</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
        <IconButton
          icon="plus-circle"
          size={32}
          iconColor="#fff"
          onPress={() =>
            navigation.navigate("DailyInput", {
              selectedStallId: selectedStall?.id,
            })
          }
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderStallSelector()}
        {renderInventoryAlert()}
        {renderCurrentStallInfo()}
        {renderTodayStats()}
        {renderWeeklyChart()}
        {renderQuickActions()}
      </ScrollView>
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
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    padding: 20,
    backgroundColor: "#2E7D32",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  date: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  stallSelector: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  stallSelectorContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  stallChip: {
    marginRight: 8,
  },
  stallChipSelected: {
    backgroundColor: "#2E7D32",
  },
  stallChipText: {
    fontSize: 14,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    backgroundColor: "#fff",
  },
  warningCard: {
    margin: 16,
    backgroundColor: "#FFF3E0",
    elevation: 2,
  },
  warningContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF9800",
    marginTop: 12,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  warningButton: {
    marginTop: 8,
  },
  stallHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  stallHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stallInfo: {
    marginLeft: 12,
    flex: 1,
  },
  stallName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  stallBreed: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  inactiveChip: {
    backgroundColor: "#FFE0B2",
  },
  capacitySection: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  capacityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  capacityLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  capacityValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  capacityPercentage: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textAlign: "right",
  },
  noDataContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
    marginTop: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  inputButton: {
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statBox: {
    alignItems: "center",
    minWidth: "22%",
    padding: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 140,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
  },
  bar: {
    width: "100%",
    maxWidth: 40,
    backgroundColor: "#4CAF50",
    borderRadius: 4,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 4,
  },
  barValueInside: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  barValueOutside: {
    fontSize: 10,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 2,
  },
  barLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 6,
    fontWeight: "500",
  },
  barLabelToday: {
    color: "#2E7D32",
    fontWeight: "bold",
  },
  barDate: {
    fontSize: 9,
    color: "#999",
    marginTop: 2,
  },
  divider: {
    marginVertical: 16,
  },
  weekStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  weekStatItem: {
    alignItems: "center",
  },
  weekStatLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  weekStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  alertCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertText: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: "#666",
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 4,
  },
});
