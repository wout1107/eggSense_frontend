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
  TouchableOpacity,
} from "react-native";
import {
  Card,
  Button,
  ProgressBar,
  Chip,
  IconButton,
  Divider,
} from "react-native-paper";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarChart } from "react-native-chart-kit";
import stallService from "../services/stallService";
import productionService from "../services/productionService";
import salesService from "../services/salesService";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";

const { width: screenWidth } = Dimensions.get("window");

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors } = useTheme();
  const { t, settings } = useSettings();
  const [refreshing, setRefreshing] = useState(false);
  const [stalls, setStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [weeklyProduction, setWeeklyProduction] = useState([]);
  const [todayProduction, setTodayProduction] = useState(null);
  const [weekStats, setWeekStats] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChartData, setSelectedChartData] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Load all stalls
      const stallsData = await stallService.listStalls();
      const activeStalls = stallsData.filter((s) => s.active);
      setStalls(activeStalls.length > 0 ? activeStalls : stallsData);

      // Select stall based on settings or first active
      let stallToSelect = null;

      // Check if defaultStallId is set in settings
      if (settings.defaultStallId) {
        stallToSelect = stallsData.find(s => s.id === settings.defaultStallId);
      }

      // Fallback to first active stall or first stall
      if (!stallToSelect) {
        stallToSelect = activeStalls.length > 0 ? activeStalls[0] : stallsData[0];
      }

      if (stallToSelect) {
        setSelectedStall(stallToSelect);
        await loadStallData(stallToSelect.id);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      Alert.alert(t('error'), t('couldNotLoad'));
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

  // React to default stall changes from settings
  useEffect(() => {
    if (settings.defaultStallId && stalls.length > 0) {
      const defaultStall = stalls.find(s => s.id === settings.defaultStallId);
      if (defaultStall && (!selectedStall || selectedStall.id !== settings.defaultStallId)) {
        setSelectedStall(defaultStall);
        loadStallData(defaultStall.id);
      }
    }
  }, [settings.defaultStallId, stalls]);

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
        <Card style={[styles.warningCard, { backgroundColor: isDarkMode ? '#3E2723' : '#FFF3E0' }]}>
          <Card.Content>
            <View style={styles.warningContent}>
              <Icon name="alert-circle" size={48} color="#FF9800" />
              <Text style={[styles.warningTitle, { color: colors.onSurface }]}>{t('noStallsWarning')}</Text>
              <Text style={[styles.warningText, { color: colors.onSurfaceVariant }]}>
                {t('createStallFirst')}
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate("Settings")}
                style={styles.warningButton}
                buttonColor={colors.primary}
                icon="cog"
              >
                {t('goToSettings')}
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
        style={[styles.stallSelector, { backgroundColor: colors.surface, borderBottomColor: isDarkMode ? '#333' : '#e0e0e0' }]}
        contentContainerStyle={styles.stallSelectorContent}
      >
        {stalls.map((stall) => (
          <Chip
            key={stall.id}
            selected={selectedStall?.id === stall.id}
            onPress={() => handleStallChange(stall)}
            style={[
              styles.stallChip,
              selectedStall?.id === stall.id && { backgroundColor: colors.primary },
            ]}
            textStyle={[styles.stallChipText, { color: selectedStall?.id === stall.id ? '#fff' : colors.onSurface }]}
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
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.stallHeader}>
            <View style={styles.stallHeaderLeft}>
              <Icon name="barn" size={32} color={colors.primary} />
              <View style={styles.stallInfo}>
                <Text style={[styles.stallName, { color: colors.primary }]}>{selectedStall.name}</Text>
                {selectedStall.breed && (
                  <Text style={[styles.stallBreed, { color: colors.onSurfaceVariant }]}>{selectedStall.breed}</Text>
                )}
              </View>
            </View>
            {!selectedStall.active && (
              <Chip
                mode="flat"
                style={styles.inactiveChip}
                textStyle={{ fontSize: 11 }}
              >
                {t('inactive')}
              </Chip>
            )}
          </View>

          <View style={[styles.capacitySection, { backgroundColor: isDarkMode ? '#1E1E1E' : '#f8f9fa' }]}>
            <View style={styles.capacityHeader}>
              <Text style={[styles.capacityLabel, { color: colors.onSurfaceVariant }]}>{t('occupancy')}</Text>
              <Text style={[styles.capacityValue, { color: colors.primary }]}>
                {activeChickens} / {totalChickens} {t('chickens')}
              </Text>
            </View>
            <ProgressBar
              progress={totalChickens > 0 ? activeChickens / totalChickens : 0}
              color={utilizationPercent > 90 ? "#4CAF50" : "#FF9800"}
              style={[styles.progressBar, { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }]}
            />
            <Text style={[styles.capacityPercentage, { color: colors.onSurfaceVariant }]}>
              {utilizationPercent.toFixed(1)}% {t('occupied')}
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
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title
          title={t('today')}
          titleStyle={{ color: colors.onSurface }}
          subtitle={new Date().toLocaleDateString("nl-NL", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
          subtitleStyle={{ color: colors.onSurfaceVariant }}
          left={(props) => <Icon {...props} name="calendar-today" size={24} color={colors.onSurfaceVariant} />}
        />
        <Card.Content>
          {!hasData ? (
            <View style={styles.noDataContainer}>
              <Icon name="information-outline" size={48} color={colors.onSurfaceVariant} />
              <Text style={[styles.noDataText, { color: colors.onSurfaceVariant }]}>
                {t('noDataToday')}
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
                {t('enterData')}
              </Button>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Icon name="egg" size={32} color="#FF9800" />
                <Text style={[styles.statValue, { color: colors.onSurface }]}>{todayEggs}</Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{t('eggs')}</Text>
              </View>
              <View style={styles.statBox}>
                <Icon name="food-drumstick" size={32} color="#2196F3" />
                <Text style={[styles.statValue, { color: colors.onSurface }]}>
                  {todayProduction.feedKg || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{t('feedKg')}</Text>
              </View>
              <View style={styles.statBox}>
                <Icon name="water" size={32} color="#00BCD4" />
                <Text style={[styles.statValue, { color: colors.onSurface }]}>
                  {todayProduction.waterLiters || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{t('waterL')}</Text>
              </View>
              {todayProduction.mortality > 0 && (
                <View style={styles.statBox}>
                  <Icon name="alert-circle" size={32} color="#F44336" />
                  <Text style={[styles.statValue, { color: colors.onSurface }]}>
                    {todayProduction.mortality}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{t('mortality')}</Text>
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
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={t('weekOverview')}
            titleStyle={{ color: colors.onSurface }}
            left={(props) => <Icon {...props} name="chart-line" size={24} color={colors.onSurfaceVariant} />}
          />
          <Card.Content>
            <View style={styles.noDataContainer}>
              <Icon name="chart-line-variant" size={48} color={colors.onSurfaceVariant} />
              <Text style={[styles.noDataText, { color: colors.onSurfaceVariant }]}>
                {t('noProductionData')}
              </Text>
            </View>
          </Card.Content>
        </Card>
      );
    }

    // Prepare data for chart
    const chartLabels = weeklyProduction.map((item) => {
      const date = new Date(item.recordDate);
      return ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"][date.getDay()];
    });

    const chartData = weeklyProduction.map((item) => getTotalEggs(item));

    const chartConfig = {
      backgroundColor: isDarkMode ? colors.surface : "#ffffff",
      backgroundGradientFrom: isDarkMode ? colors.surface : "#ffffff",
      backgroundGradientTo: isDarkMode ? colors.surface : "#ffffff",
      decimalPlaces: 0,
      color: (opacity = 1) => isDarkMode ? `rgba(76, 175, 80, ${opacity})` : `rgba(46, 125, 50, ${opacity})`,
      labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForBackgroundLines: {
        strokeDasharray: "",
        stroke: isDarkMode ? "#333" : "#e0e0e0",
      },
      barPercentage: 0.7,
    };

    const handleBarPress = (data) => {
      if (data && data.index !== undefined) {
        const item = weeklyProduction[data.index];
        const date = new Date(item.recordDate);
        setSelectedChartData({
          day: ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"][date.getDay()],
          date: `${date.getDate()}/${date.getMonth() + 1}`,
          total: getTotalEggs(item),
          small: item.eggsSmall || 0,
          medium: item.eggsMedium || 0,
          large: item.eggsLarge || 0,
          feed: item.feedKg || 0,
          water: item.waterLiters || 0,
        });
      }
    };

    return (
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title
          title="Week Overzicht"
          titleStyle={{ color: colors.onSurface }}
          subtitle={`${weeklyProduction.length} dagen gegevens - Tik op een balk voor details`}
          subtitleStyle={{ color: colors.onSurfaceVariant }}
          left={(props) => <Icon {...props} name="chart-bar" size={24} color={colors.primary} />}
        />
        <Card.Content>
          {/* Interactive Tooltip */}
          {selectedChartData && (
            <TouchableOpacity
              style={[styles.chartTooltip, { backgroundColor: isDarkMode ? '#2E7D32' : '#E8F5E9', borderColor: colors.primary }]}
              onPress={() => setSelectedChartData(null)}
              accessibilityLabel="Sluit detail weergave"
              accessibilityHint="Tik om te sluiten"
            >
              <View style={styles.tooltipHeader}>
                <Text style={[styles.tooltipTitle, { color: isDarkMode ? '#fff' : colors.primary }]}>
                  {selectedChartData.day} ({selectedChartData.date})
                </Text>
                <Icon name="close" size={18} color={isDarkMode ? '#fff' : colors.primary} />
              </View>
              <View style={styles.tooltipContent}>
                <View style={styles.tooltipRow}>
                  <Icon name="egg" size={16} color="#FF9800" />
                  <Text style={[styles.tooltipText, { color: isDarkMode ? '#fff' : '#333' }]}>
                    {t('totalEggs')}: <Text style={styles.tooltipValue}>{selectedChartData.total}</Text> {t('eggs')}
                  </Text>
                </View>
                <View style={styles.tooltipDivider} />
                <View style={styles.tooltipBreakdown}>
                  <Text style={[styles.tooltipSmall, { color: isDarkMode ? '#ddd' : '#666' }]}>
                    {t('small')}: {selectedChartData.small} | {t('medium')}: {selectedChartData.medium} | {t('large')}: {selectedChartData.large}
                  </Text>
                </View>
                {(selectedChartData.feed > 0 || selectedChartData.water > 0) && (
                  <View style={styles.tooltipBreakdown}>
                    <Text style={[styles.tooltipSmall, { color: isDarkMode ? '#ddd' : '#666' }]}>
                      {t('feed')}: {selectedChartData.feed}kg | {t('water')}: {selectedChartData.water}L
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Interactive Bar Chart */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={{
                labels: chartLabels,
                datasets: [{ data: chartData }],
              }}
              width={Math.max(screenWidth - 64, chartLabels.length * 50)}
              height={220}
              chartConfig={chartConfig}
              style={styles.interactiveChart}
              fromZero
              showValuesOnTopOfBars
              withInnerLines={true}
              onDataPointClick={handleBarPress}
              accessibilityLabel="Weekproductie grafiek"
            />
          </ScrollView>

          <Text style={[styles.chartHint, { color: colors.onSurfaceVariant }]}>
            👆 Tik op een balk voor gedetailleerde informatie
          </Text>

          {weekStats && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.weekStatsContainer}>
                <View style={styles.weekStatItem}>
                  <Text style={[styles.weekStatLabel, { color: colors.onSurfaceVariant }]}>{t('totalEggs')}</Text>
                  <Text style={[styles.weekStatValue, { color: colors.primary }]}>
                    {weekStats.totalEggs}
                  </Text>
                </View>
                <View style={styles.weekStatItem}>
                  <Text style={[styles.weekStatLabel, { color: colors.onSurfaceVariant }]}>{t('avgPerDay')}</Text>
                  <Text style={[styles.weekStatValue, { color: colors.primary }]}>
                    {weekStats.avgEggsPerDay.toFixed(0)}
                  </Text>
                </View>
                <View style={styles.weekStatItem}>
                  <Text style={[styles.weekStatLabel, { color: colors.onSurfaceVariant }]}>{t('totalFeed')}</Text>
                  <Text style={[styles.weekStatValue, { color: colors.primary }]}>
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
    const alertDays = settings.lowStockAlertDays || 7;
    if (!inventory || !inventory.daysRemaining || inventory.daysRemaining > alertDays)
      return null;

    const isLow = inventory.daysRemaining <= Math.floor(alertDays / 2);
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
                  ? t('criticalFeedLevel')
                  : isLow
                    ? t('lowFeedStock')
                    : t('feedStockNormal')}
              </Text>
              <Text style={styles.alertDescription}>
                {t('feedRemaining', { kg: currentStock.toFixed(0), days: daysRemaining.toFixed(0) })}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderQuickActions = () => (
    <Card
      style={[styles.card, { backgroundColor: colors.surface }]}
      accessible={true}
      accessibilityLabel="Snelle acties sectie"
    >
      <Card.Title
        title={t('quickActions')}
        titleStyle={{ color: colors.onSurface }}
        left={(props) => <Icon {...props} name="lightning-bolt" size={24} color={colors.primary} />}
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
            accessibilityLabel="Dagelijkse invoer"
            accessibilityHint="Ga naar het scherm voor dagelijkse productie invoer"
          >
            {t('dailyInput')}
          </Button>
          <Button
            mode="outlined"
            icon="chart-bar"
            onPress={() => navigation.navigate("Reports")}
            style={styles.actionButton}
            textColor={colors.onSurface}
            accessibilityLabel="Rapporten bekijken"
            accessibilityHint="Bekijk productie rapporten en analyses"
          >
            {t('reports')}
          </Button>
          <Button
            mode="outlined"
            icon="cart"
            onPress={() => navigation.navigate("Sales")}
            style={styles.actionButton}
            textColor={colors.onSurface}
            accessibilityLabel="Verkoop beheren"
            accessibilityHint="Ga naar verkoop overzicht en orders"
          >
            {t('sales')}
          </Button>
          <Button
            mode="outlined"
            icon="truck-delivery"
            onPress={() => navigation.navigate("FeedDelivery")}
            style={styles.actionButton}
            textColor={colors.onSurface}
            accessibilityLabel="Voerleveringen"
            accessibilityHint="Beheer voerleveringen en voorraad"
          >
            {t('feedDeliveries')}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>{t('loadingDashboard')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: insets.top }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{t('dashboard')}</Text>
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
  // Interactive chart styles
  interactiveChart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  chartHint: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  chartTooltip: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tooltipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tooltipContent: {
    gap: 4,
  },
  tooltipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tooltipText: {
    fontSize: 14,
  },
  tooltipValue: {
    fontWeight: "bold",
    fontSize: 16,
  },
  tooltipDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: 6,
  },
  tooltipBreakdown: {
    marginTop: 2,
  },
  tooltipSmall: {
    fontSize: 12,
  },
});
