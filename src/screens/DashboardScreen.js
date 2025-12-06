import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  RefreshControl, // Add RefreshControl
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  IconButton,
  ProgressBar,
  Menu,
  Divider,
  ActivityIndicator, // Add ActivityIndicator
  Chip,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
// Import services
import stallService from "../services/stallService";
import productionService from "../services/productionService";
import salesService from "../services/salesService";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [selectedFarm, setSelectedFarm] = useState(null); // Changed default to null
  const [farmMenuVisible, setFarmMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    farms: {}, // We will map backend stalls to this structure
    weeklyProduction: [],
    alerts: [],
    quickStats: {
      weeklyRevenue: 0,
      weeklyProfit: 0,
      totalInventory: 0,
      feedConversion: 0,
    },
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Stalls
      const stalls = await stallService.listStalls();

      // 2. Fetch Stats (You might need to create a specific endpoint for dashboard stats)
      // For now, we'll simulate aggregating data or fetch individual stats if available
      const productionStats = await productionService
        .getDailyProduction(new Date().toISOString().split("T")[0])
        .catch(() => null);

      // Transform backend list to frontend object structure
      const farmsMap = {};
      stalls.forEach((stall) => {
        farmsMap[stall.id] = {
          id: stall.id,
          name: stall.name,
          age: stall.age || 0,
          totalChickens: stall.capacity || 0,
          activeChickens: stall.currentStock || 0,
          dailyStats: {
            totalEggs: productionStats?.totalEggs || 0,
            productionPercentage: productionStats?.percentage || 0,
            feedConsumption: productionStats?.feedKg || 0,
            waterConsumption: productionStats?.waterLiters || 0,
          },
        };
      });

      // Set selected farm if not set
      if (!selectedFarm && stalls.length > 0) {
        setSelectedFarm(stalls[0].id);
      }

      setDashboardData((prev) => ({
        ...prev,
        farms: farmsMap,
        // You would fetch these from salesService/productionService
        quickStats: {
          weeklyRevenue: 1250.0, // Placeholder until backend calc available
          weeklyProfit: 850.0,
          totalInventory: 4500,
          feedConversion: 2.1,
        },
      }));
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const currentFarm = selectedFarm ? dashboardData.farms[selectedFarm] : null;

  const getStatusColor = (percentage) => {
    if (percentage >= 85) return "#4CAF50"; // Green
    if (percentage >= 70) return "#FF9800"; // Orange
    return "#F44336"; // Red
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "warning":
        return "#FF9800";
      case "success":
        return "#4CAF50";
      case "info":
        return "#2196F3";
      case "error":
        return "#F44336";
      default:
        return "#666666";
    }
  };

  const calculateWeeklyTotal = () => {
    return dashboardData.weeklyProduction.reduce(
      (acc, day) => acc + day.stal1 + day.stal2,
      0
    );
  };

  const calculateWeeklyTarget = () => {
    return dashboardData.weeklyProduction.reduce(
      (acc, day) => acc + day.target,
      0
    );
  };

  const handleAlertPress = (alert) => {
    if (alert.action) {
      navigation.navigate(alert.action);
    }
  };

  const renderMiniChart = () => {
    const maxValue = Math.max(
      ...dashboardData.weeklyProduction.map((d) => d.stal1 + d.stal2)
    );

    return (
      <View style={styles.chartContainer}>
        {dashboardData.weeklyProduction.map((item, index) => {
          const total = item.stal1 + item.stal2;
          // FIX: Check if maxValue is > 0 to avoid division by zero (NaN)
          const height = maxValue > 0 ? (total / maxValue) * 80 : 0;
          const isToday = index === new Date().getDay() - 1; // Adjust for Monday start

          return (
            <View key={index} style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: height,
                    backgroundColor:
                      total >= item.target ? "#4CAF50" : "#FF9800",
                    opacity: isToday ? 1 : 0.7,
                  },
                ]}
              />
              <Text
                style={[
                  styles.barLabel,
                  { fontWeight: isToday ? "bold" : "normal" },
                ]}
              >
                {item.day}
              </Text>
              <Text style={styles.barValue}>{total}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 10 }}>Dashboard laden...</Text>
      </View>
    );
  }

  if (!currentFarm) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Geen stallen gevonden. Voeg eerst een stal toe.</Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("Settings")}
          style={{ marginTop: 20 }}
        >
          Stal Toevoegen
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#2E7D32"]}
        />
      }
    >
      {/* Header with Farm Selection */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.header}>Dashboard</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("nl-NL")}
          </Text>
        </View>
        <Menu
          visible={farmMenuVisible}
          onDismiss={() => setFarmMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setFarmMenuVisible(true)}
              icon="chevron-down"
              compact
            >
              {currentFarm?.name}
            </Button>
          }
        >
          {Object.values(dashboardData.farms).map((farm) => (
            <Menu.Item
              key={farm.id}
              onPress={() => {
                setSelectedFarm(farm.id);
                setFarmMenuVisible(false);
              }}
              title={farm.name}
            />
          ))}
          <Divider />
          <Menu.Item
            onPress={() => {
              setFarmMenuVisible(false);
              navigation.navigate("Settings");
            }}
            title="Stallen Beheren"
            leadingIcon="cog"
          />
        </Menu>
      </View>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Snelle Acties</Title>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate("Input")}
            >
              <IconButton icon="plus-circle" size={24} iconColor="#2E7D32" />
              <Text style={styles.quickActionText}>Dagelijkse Invoer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate("Sales")}
            >
              <IconButton icon="cash-register" size={24} iconColor="#2E7D32" />
              <Text style={styles.quickActionText}>Nieuwe Verkoop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate("Reports")}
            >
              <IconButton icon="chart-line" size={24} iconColor="#2E7D32" />
              <Text style={styles.quickActionText}>Rapporten</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate("Feed")}
            >
              <IconButton icon="nutrition" size={24} iconColor="#2E7D32" />
              <Text style={styles.quickActionText}>Voer Beheer</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Current Farm Stats */}
      <Card style={styles.farmInfoCard}>
        <Card.Content>
          <View style={styles.farmHeader}>
            <Title style={styles.cardTitle}>{currentFarm.name}</Title>
            <Chip mode="outlined">{currentFarm.age} weken oud</Chip>
          </View>
          <View style={styles.farmDetails}>
            <Text style={styles.farmDetailText}>
              Actieve hennen: {currentFarm.activeChickens}/
              {currentFarm.totalChickens}
            </Text>
            <ProgressBar
              // FIX: Check if totalChickens > 0 to avoid NaN (0/0)
              progress={
                currentFarm.totalChickens > 0
                  ? currentFarm.activeChickens / currentFarm.totalChickens
                  : 0
              }
              color="#4CAF50"
              style={styles.progressBar}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Today's Production Stats */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statNumber}>
              {currentFarm.dailyStats.totalEggs}
            </Title>
            <Paragraph style={styles.statLabel}>Eieren Vandaag</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Title
              style={[
                styles.statNumber,
                {
                  color: getStatusColor(
                    currentFarm.dailyStats.productionPercentage
                  ),
                },
              ]}
            >
              {currentFarm.dailyStats.productionPercentage}%
            </Title>
            <Paragraph style={styles.statLabel}>Productie</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statNumber}>
              {currentFarm.dailyStats.feedConsumption}kg
            </Title>
            <Paragraph style={styles.statLabel}>Voer Verbruik</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statNumber}>
              {currentFarm.dailyStats.waterConsumption}L
            </Title>
            <Paragraph style={styles.statLabel}>Water Verbruik</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Weekly Production Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Title style={styles.cardTitle}>Productie Deze Week</Title>
            <View style={styles.chartLegend}>
              <Text style={styles.chartTotal}>
                {calculateWeeklyTotal()}/{calculateWeeklyTarget()}
              </Text>
            </View>
          </View>
          {renderMiniChart()}
          <Text style={styles.chartNote}>
            * Groene balken = doel behaald, oranje = onder doel
          </Text>
        </Card.Content>
      </Card>

      {/* Combined Farm Overview */}
      <Card style={styles.overviewCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>
            Totaal Overzicht (Alle Stallen)
          </Title>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>
                €{dashboardData.quickStats.weeklyRevenue}
              </Text>
              <Text style={styles.overviewLabel}>Week Omzet</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>
                €{dashboardData.quickStats.weeklyProfit}
              </Text>
              <Text style={styles.overviewLabel}>Week Winst</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>
                {dashboardData.quickStats.totalInventory}
              </Text>
              <Text style={styles.overviewLabel}>Eieren Voorraad</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>
                {dashboardData.quickStats.feedConversion}
              </Text>
              <Text style={styles.overviewLabel}>Voer Conversie</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Alerts & Notifications */}
      <Card style={styles.alertCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Meldingen & Waarschuwingen</Title>
          {dashboardData.alerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={styles.alertItem}
              onPress={() => handleAlertPress(alert)}
            >
              <View
                style={[
                  styles.alertIndicator,
                  { backgroundColor: getAlertColor(alert.type) },
                ]}
              />
              <Text style={styles.alertText}>{alert.message}</Text>
              {alert.action && (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#666"
                  style={{ marginLeft: 8 }}
                />
              )}
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>

      {/* Performance Indicators */}
      <Card style={styles.performanceCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Prestatie Indicatoren</Title>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Productie vs Norm</Text>
            <View style={styles.performanceBar}>
              <ProgressBar
                progress={currentFarm.dailyStats.productionPercentage / 100}
                color={getStatusColor(
                  currentFarm.dailyStats.productionPercentage
                )}
                style={styles.progressBar}
              />
              <Text style={styles.performanceText}>
                {currentFarm.dailyStats.productionPercentage}%
              </Text>
            </View>
          </View>

          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Voer Efficiëntie</Text>
            <View style={styles.performanceBar}>
              <ProgressBar
                progress={0.85}
                color="#4CAF50"
                style={styles.progressBar}
              />
              <Text style={styles.performanceText}>Goed (2.1)</Text>
            </View>
          </View>

          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Gezondheid Score</Text>
            <View style={styles.performanceBar}>
              <ProgressBar
                progress={0.92}
                color="#4CAF50"
                style={styles.progressBar}
              />
              <Text style={styles.performanceText}>Uitstekend</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Links Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Meer Opties</Title>
          <Button
            mode="outlined"
            icon="account"
            onPress={() => navigation.navigate("Profile")}
            style={styles.linkButton}
          >
            Bekijk Profiel
          </Button>
          <Button
            mode="outlined"
            icon="cog"
            onPress={() => navigation.navigate("Settings")}
            style={styles.linkButton}
          >
            Instellingen Beheren
          </Button>
          <Button
            mode="outlined"
            icon="chart-box"
            onPress={() => navigation.navigate("Reports")}
            style={styles.linkButton}
          >
            Uitgebreide Rapporten
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: "#666",
  },
  quickActionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    color: "#2E7D32",
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  quickAction: {
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    minWidth: 80,
    margin: 4,
  },
  quickActionText: {
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    marginTop: 4,
  },
  farmInfoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  farmHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  farmDetails: {
    marginTop: 8,
  },
  farmDetailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: (width - 48) / 2,
    marginBottom: 12,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 4,
  },
  statLabel: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
  },
  chartCard: {
    marginBottom: 16,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartLegend: {
    alignItems: "center",
  },
  chartTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
    marginBottom: 12,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 20,
    backgroundColor: "#2E7D32",
    borderRadius: 2,
    marginBottom: 8,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: "#333",
    fontWeight: "bold",
  },
  chartNote: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
  },
  overviewCard: {
    marginBottom: 16,
    elevation: 2,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  overviewItem: {
    alignItems: "center",
    width: (width - 80) / 2,
    marginBottom: 12,
  },
  overviewNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  overviewLabel: {
    fontSize: 12,
    color: "#666",
  },
  alertCard: {
    marginBottom: 16,
    elevation: 2,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  alertIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  alertText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  performanceCard: {
    marginBottom: 16,
    elevation: 2,
  },
  performanceItem: {
    marginBottom: 16,
  },
  performanceLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  performanceBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  performanceText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 12,
    minWidth: 60,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  linkButton: {
    marginBottom: 8,
  },
});
