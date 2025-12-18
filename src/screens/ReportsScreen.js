import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  SegmentedButtons,
  DataTable,
  IconButton,
  Chip,
  Divider,
  ProgressBar,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../services/api";
import productionService from "../services/productionService";
import salesService from "../services/salesService";

const { width } = Dimensions.get("window");

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedMetric, setSelectedMetric] = useState("production");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    production: [],
    financial: {
      revenue: 0,
      costs: 0,
      profit: 0,
      feedCost: 0,
      otherCosts: 0,
      eggRevenue: { small: 0, medium: 0, large: 0 },
    },
    performance: {
      avgEggWeight: 58,
      feedConversion: 2.1,
      waterConsumption: 0,
      mortality: 0,
      avgDailyEggs: 0,
      eggWeightDistribution: { small: 33.3, medium: 33.3, large: 33.4 },
    },
    trends: {
      productionTrend: 0,
      feedEfficiencyTrend: 0,
      mortalityTrend: 0,
      profitTrend: 0,
    },
    alerts: [],
  });

  useEffect(() => {
    loadReportData(selectedPeriod);
  }, [selectedPeriod]);

  const loadReportData = async (period) => {
    try {
      setLoading(true);

      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case "week":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Load production data
      const productionResponse = await productionService.listProduction({
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      });

      // Load sales data
      const salesResponse = await salesService.listOrders({
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      });

      // Load feed deliveries
      const feedResponse = await api.get("/feed-deliveries", {
        params: {
          start: startDate.toISOString().split("T")[0],
          end: endDate.toISOString().split("T")[0],
        },
      });

      // Process data
      const processedData = processReportData(
        productionResponse,
        salesResponse,
        feedResponse.data,
        period
      );

      setReportData(processedData);
    } catch (error) {
      console.error("Error loading report data:", error);
      // Set safe default data to prevent render errors
      setReportData({
        production: [],
        financial: {
          revenue: 0,
          costs: 0,
          profit: 0,
          feedCost: 0,
          otherCosts: 0,
          eggRevenue: { small: 0, medium: 0, large: 0 },
        },
        performance: {
          avgEggWeight: 58,
          feedConversion: 2.1,
          waterConsumption: 0,
          mortality: 0,
          avgDailyEggs: 0,
          eggWeightDistribution: { small: 33.3, medium: 33.3, large: 33.4 },
        },
        trends: {
          productionTrend: 0,
          feedEfficiencyTrend: 0,
          mortalityTrend: 0,
          profitTrend: 0,
        },
        alerts: [],
      });
      Alert.alert("Fout", "Kon rapportgegevens niet laden");
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (production, sales, feedDeliveries, period) => {
    // Group production data by period
    const groupedProduction = groupProductionByPeriod(production, period);

    // Calculate financial metrics
    const financial = calculateFinancialMetrics(sales, feedDeliveries);

    // Calculate performance metrics
    const performance = calculatePerformanceMetrics(production, feedDeliveries);

    // Calculate trends
    const trends = calculateTrends(production, sales, period);

    // Generate alerts
    const alerts = generateAlerts(performance, trends);

    return {
      production: groupedProduction,
      financial,
      performance,
      trends,
      alerts,
    };
  };

  const groupProductionByPeriod = (production, period) => {
    const grouped = {};

    production.forEach((record) => {
      const date = new Date(record.recordDate);
      let key;

      switch (period) {
        case "week":
          key = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"][date.getDay()];
          break;
        case "month":
          const weekNum = Math.ceil(date.getDate() / 7);
          key = `Week ${weekNum}`;
          break;
        case "year":
          key = [
            "Jan",
            "Feb",
            "Mrt",
            "Apr",
            "Mei",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Okt",
            "Nov",
            "Dec",
          ][date.getMonth()];
          break;
      }

      if (!grouped[key]) {
        grouped[key] = {
          day: key,
          eggsSmall: 0,
          eggsMedium: 0,
          eggsLarge: 0,
          eggsRejected: 0,
          eggs: 0,
          target: period === "week" ? 250 : period === "month" ? 1750 : 7500,
          count: 0,
        };
      }

      grouped[key].eggsSmall += record.eggsSmall || 0;
      grouped[key].eggsMedium += record.eggsMedium || 0;
      grouped[key].eggsLarge += record.eggsLarge || 0;
      grouped[key].eggsRejected += record.eggsRejected || 0;
      grouped[key].eggs +=
        (record.eggsSmall || 0) +
        (record.eggsMedium || 0) +
        (record.eggsLarge || 0);
      grouped[key].count += 1;
    });

    // Convert to array and calculate percentages
    return Object.values(grouped).map((item) => ({
      ...item,
      small: item.eggsSmall,
      medium: item.eggsMedium,
      large: item.eggsLarge,
      percentage: (item.eggs / item.target) * 100,
    }));
  };

  const calculateFinancialMetrics = (sales, feedDeliveries) => {
    // Calculate revenue
    const revenue = sales
      .filter((s) => s.status !== "CANCELLED")
      .reduce((sum, sale) => sum + sale.totalPrice, 0);

    // Calculate feed costs
    const feedCost = feedDeliveries.reduce(
      (sum, delivery) => sum + (delivery.cost || 0),
      0
    );

    // Estimate other costs (10% of revenue)
    const otherCosts = revenue * 0.1;

    const costs = feedCost + otherCosts;
    const profit = revenue - costs;

    // Calculate revenue per egg size
    const eggRevenue = {
      small: sales.reduce((sum, s) => sum + (s.eggsSmall || 0) * 1.9, 0),
      medium: sales.reduce((sum, s) => sum + (s.eggsMedium || 0) * 2.5, 0),
      large: sales.reduce((sum, s) => sum + (s.eggsLarge || 0) * 3.2, 0),
    };

    return {
      revenue,
      costs,
      profit,
      feedCost,
      otherCosts,
      eggRevenue,
    };
  };

  const calculatePerformanceMetrics = (production, feedDeliveries) => {
    // Return default values if no production data
    if (!production || production.length === 0) {
      return {
        avgEggWeight: 58,
        feedConversion: 2.1,
        waterConsumption: 0,
        mortality: 0,
        avgDailyEggs: 0,
        eggWeightDistribution: { small: 33.3, medium: 33.3, large: 33.4 },
      };
    }

    const totalEggs = production.reduce(
      (sum, p) =>
        sum + (p.eggsSmall || 0) + (p.eggsMedium || 0) + (p.eggsLarge || 0),
      0
    );

    const totalFeed = (feedDeliveries || []).reduce(
      (sum, f) => sum + (f.quantityKg || 0),
      0
    );
    const totalWater = production.reduce(
      (sum, p) => sum + (p.waterLiters || 0),
      0
    );
    const totalMortality = production.reduce(
      (sum, p) => sum + (p.mortality || 0),
      0
    );

    const avgDailyEggs = totalEggs / (production.length || 1);
    const feedConversion = totalEggs > 0 ? totalFeed / (totalEggs / 1000) : 2.1; // kg feed per 1000 eggs
    const waterConsumption = totalWater;
    const mortality = production.length > 0 ? (totalMortality / production.length) * 100 : 0;

    // Calculate average egg weight (estimate based on size distribution)
    const smallWeight =
      production.reduce((sum, p) => sum + (p.eggsSmall || 0), 0) * 50;
    const mediumWeight =
      production.reduce((sum, p) => sum + (p.eggsMedium || 0), 0) * 58;
    const largeWeight =
      production.reduce((sum, p) => sum + (p.eggsLarge || 0), 0) * 65;
    const avgEggWeight = totalEggs > 0 ? (smallWeight + mediumWeight + largeWeight) / totalEggs : 58;

    // Egg weight distribution
    const smallTotal = production.reduce((sum, p) => sum + (p.eggsSmall || 0), 0);
    const mediumTotal = production.reduce((sum, p) => sum + (p.eggsMedium || 0), 0);
    const largeTotal = production.reduce((sum, p) => sum + (p.eggsLarge || 0), 0);

    const eggWeightDistribution = totalEggs > 0 ? {
      small: (smallTotal / totalEggs) * 100,
      medium: (mediumTotal / totalEggs) * 100,
      large: (largeTotal / totalEggs) * 100,
    } : { small: 33.3, medium: 33.3, large: 33.4 };

    return {
      avgEggWeight: avgEggWeight || 58,
      feedConversion: isNaN(feedConversion) ? 2.1 : feedConversion,
      waterConsumption,
      mortality: isNaN(mortality) ? 0 : mortality,
      avgDailyEggs: avgDailyEggs || 0,
      eggWeightDistribution,
    };
  };

  const calculateTrends = (production, sales, period) => {
    // Return defaults if no data
    if (!production || production.length === 0) {
      return {
        productionTrend: 0,
        feedEfficiencyTrend: 0,
        mortalityTrend: 0,
        profitTrend: 0,
      };
    }

    // Split data into current and previous period
    const midpoint = Math.floor(production.length / 2);
    const previous = production.slice(0, midpoint);
    const current = production.slice(midpoint);

    const prevTotalEggs = previous.reduce(
      (sum, p) =>
        sum + (p.eggsSmall || 0) + (p.eggsMedium || 0) + (p.eggsLarge || 0),
      0
    );
    const currTotalEggs = current.reduce(
      (sum, p) =>
        sum + (p.eggsSmall || 0) + (p.eggsMedium || 0) + (p.eggsLarge || 0),
      0
    );

    const productionTrend = prevTotalEggs > 0
      ? ((currTotalEggs - prevTotalEggs) / prevTotalEggs) * 100
      : 0;

    // Similar calculations for other trends
    const safeSliceSales = sales || [];
    const prevRevenue = safeSliceSales
      .slice(0, Math.floor(safeSliceSales.length / 2))
      .reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    const currRevenue = safeSliceSales
      .slice(Math.floor(safeSliceSales.length / 2))
      .reduce((sum, s) => sum + (s.totalPrice || 0), 0);

    const profitTrend = prevRevenue > 0
      ? ((currRevenue - prevRevenue) / prevRevenue) * 100
      : 0;

    return {
      productionTrend: isNaN(productionTrend) ? 0 : productionTrend,
      feedEfficiencyTrend: -2.5, // Mock for now
      mortalityTrend: -10.0, // Mock for now
      profitTrend: isNaN(profitTrend) ? 0 : profitTrend,
    };
  };

  const generateAlerts = (performance, trends) => {
    const alerts = [];

    // Safely get values with defaults
    const productionTrend = trends?.productionTrend ?? 0;
    const feedConversion = performance?.feedConversion ?? 2.1;
    const mortality = performance?.mortality ?? 0;

    // Production alert
    if (productionTrend > 3) {
      alerts.push({
        id: 1,
        type: "success",
        title: "Uitstekende Productie",
        message: `Productie ${productionTrend.toFixed(1)}% boven vorige periode`,
        severity: "low",
      });
    }

    // Feed conversion alert
    if (feedConversion > 2.5) {
      alerts.push({
        id: 2,
        type: "warning",
        title: "Voerconversie Aandacht",
        message: "Voerconversie ratio hoger dan optimaal (>2.5)",
        severity: "medium",
      });
    }

    // Mortality alert
    if (mortality > 2.0) {
      alerts.push({
        id: 3,
        type: "error",
        title: "Verhoogde Uitval",
        message: `Uitval percentage ${mortality.toFixed(1)}% - Controleer gezondheid`,
        severity: "high",
      });
    }

    return alerts;
  };

  // Export and share functionality removed - was mock implementation

  const getPerformanceColor = (value, type) => {
    switch (type) {
      case "percentage":
        return value >= 85 ? "#4CAF50" : value >= 70 ? "#FF9800" : "#F44336";
      case "feedConversion":
        return value <= 2.2 ? "#4CAF50" : value <= 2.5 ? "#FF9800" : "#F44336";
      case "mortality":
        return value <= 1.0 ? "#4CAF50" : value <= 2.0 ? "#FF9800" : "#F44336";
      case "weight":
        return value >= 58 ? "#4CAF50" : value >= 55 ? "#FF9800" : "#F44336";
      default:
        return "#2E7D32";
    }
  };

  const getTrendIcon = (value) => {
    if (value > 0) return "trending-up";
    if (value < 0) return "trending-down";
    return "trending-neutral";
  };

  const getTrendColor = (value, isPositiveGood = true) => {
    if (value === 0) return "#666666";
    if (isPositiveGood) {
      return value > 0 ? "#4CAF50" : "#F44336";
    } else {
      return value < 0 ? "#4CAF50" : "#F44336";
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "success":
        return "check-circle";
      case "warning":
        return "alert";
      case "error":
        return "close-circle";
      default:
        return "information";
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "warning":
        return "#FF9800";
      case "error":
        return "#F44336";
      default:
        return "#2196F3";
    }
  };

  const renderProductionChart = () => {
    if (reportData.production.length === 0) return null;

    const maxValue = Math.max(...reportData.production.map((d) => d.eggs));

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          {reportData.production.map((item, index) => {
            const height = (item.eggs / maxValue) * 150;
            const targetHeight = (item.target / maxValue) * 150;

            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View style={[styles.targetLine, { bottom: targetHeight }]} />
                  <View
                    style={[
                      styles.bar,
                      {
                        height: height,
                        backgroundColor: getPerformanceColor(
                          item.percentage,
                          "percentage"
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.barValueInside}>{item.eggs}</Text>
                  </View>
                </View>
                <Text style={styles.barLabel}>{item.day}</Text>
                <Chip
                  mode="flat"
                  textStyle={{ fontSize: 10 }}
                  style={[
                    styles.percentageChip,
                    {
                      backgroundColor:
                        getPerformanceColor(item.percentage, "percentage") +
                        "20",
                    },
                  ]}
                >
                  {item.percentage.toFixed(1)}%
                </Chip>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderEggDistributionChart = () => {
    const totalEggs = reportData.production.reduce(
      (sum, item) => sum + item.eggs,
      0
    );

    if (totalEggs === 0) return null;

    const totalSmall = reportData.production.reduce(
      (sum, item) => sum + item.small,
      0
    );
    const totalMedium = reportData.production.reduce(
      (sum, item) => sum + item.medium,
      0
    );
    const totalLarge = reportData.production.reduce(
      (sum, item) => sum + item.large,
      0
    );

    const smallPercent = (totalSmall / totalEggs) * 100;
    const mediumPercent = (totalMedium / totalEggs) * 100;
    const largePercent = (totalLarge / totalEggs) * 100;

    return (
      <View style={styles.distributionContainer}>
        <View style={styles.distributionBar}>
          <View
            style={[
              styles.distributionSegment,
              { flex: smallPercent, backgroundColor: "#FF9800" },
            ]}
          />
          <View
            style={[
              styles.distributionSegment,
              { flex: mediumPercent, backgroundColor: "#4CAF50" },
            ]}
          />
          <View
            style={[
              styles.distributionSegment,
              { flex: largePercent, backgroundColor: "#2196F3" },
            ]}
          />
        </View>
        <View style={styles.distributionLegend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#FF9800" }]}
            />
            <Text style={styles.legendText}>
              Klein: {totalSmall} ({smallPercent.toFixed(1)}%)
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#4CAF50" }]}
            />
            <Text style={styles.legendText}>
              Medium: {totalMedium} ({mediumPercent.toFixed(1)}%)
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#2196F3" }]}
            />
            <Text style={styles.legendText}>
              Groot: {totalLarge} ({largePercent.toFixed(1)}%)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Rapporten laden...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.header}>Rapporten & Analyses</Text>
          <Text style={styles.subheader}>
            {new Date().toLocaleDateString("nl-NL")}
          </Text>
        </View>
        {/* Export/share buttons removed - functionality not implemented */}
      </View>

      {/* Period Selection */}
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

      {/* Alerts & Notifications */}
      {reportData.alerts && reportData.alerts.length > 0 && (
        <Card style={styles.alertsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Inzichten & Waarschuwingen</Title>
            {reportData.alerts.map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <IconButton
                  icon={getAlertIcon(alert.type)}
                  size={20}
                  iconColor={getAlertColor(alert.type)}
                  style={styles.alertIcon}
                />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Key Trends */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Belangrijkste Trends</Title>
          <View style={styles.trendsGrid}>
            <View style={styles.trendItem}>
              <IconButton
                icon={getTrendIcon(reportData.trends.productionTrend)}
                size={24}
                iconColor={getTrendColor(
                  reportData.trends.productionTrend,
                  true
                )}
              />
              <Text style={styles.trendLabel}>Productie</Text>
              <Text
                style={[
                  styles.trendValue,
                  {
                    color: getTrendColor(
                      reportData.trends.productionTrend,
                      true
                    ),
                  },
                ]}
              >
                {reportData.trends.productionTrend > 0 ? "+" : ""}
                {reportData.trends.productionTrend.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.trendItem}>
              <IconButton
                icon={getTrendIcon(reportData.trends.feedEfficiencyTrend)}
                size={24}
                iconColor={getTrendColor(
                  reportData.trends.feedEfficiencyTrend,
                  false
                )}
              />
              <Text style={styles.trendLabel}>Voer Eff.</Text>
              <Text
                style={[
                  styles.trendValue,
                  {
                    color: getTrendColor(
                      reportData.trends.feedEfficiencyTrend,
                      false
                    ),
                  },
                ]}
              >
                {reportData.trends.feedEfficiencyTrend > 0 ? "+" : ""}
                {reportData.trends.feedEfficiencyTrend.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.trendItem}>
              <IconButton
                icon={getTrendIcon(reportData.trends.mortalityTrend)}
                size={24}
                iconColor={getTrendColor(
                  reportData.trends.mortalityTrend,
                  false
                )}
              />
              <Text style={styles.trendLabel}>Uitval</Text>
              <Text
                style={[
                  styles.trendValue,
                  {
                    color: getTrendColor(
                      reportData.trends.mortalityTrend,
                      false
                    ),
                  },
                ]}
              >
                {reportData.trends.mortalityTrend > 0 ? "+" : ""}
                {reportData.trends.mortalityTrend.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.trendItem}>
              <IconButton
                icon={getTrendIcon(reportData.trends.profitTrend)}
                size={24}
                iconColor={getTrendColor(reportData.trends.profitTrend, true)}
              />
              <Text style={styles.trendLabel}>Winst</Text>
              <Text
                style={[
                  styles.trendValue,
                  { color: getTrendColor(reportData.trends.profitTrend, true) },
                ]}
              >
                {reportData.trends.profitTrend > 0 ? "+" : ""}
                {reportData.trends.profitTrend.toFixed(1)}%
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Metric Selector */}
      <SegmentedButtons
        value={selectedMetric}
        onValueChange={setSelectedMetric}
        buttons={[
          { value: "production", label: "Productie", icon: "egg" },
          { value: "financial", label: "Financieel", icon: "currency-eur" },
          { value: "performance", label: "Prestatie", icon: "chart-line" },
        ]}
        style={styles.metricSelector}
      />

      {/* Production View */}
      {selectedMetric === "production" && (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Productie Overzicht</Title>
              {renderProductionChart()}
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#4CAF50" }]}
                  />
                  <Text style={styles.legendText}>≥ 85%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#FF9800" }]}
                  />
                  <Text style={styles.legendText}>70-85%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#F44336" }]}
                  />
                  <Text style={styles.legendText}>{"< 70%"}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={styles.targetLineLegend} />
                  <Text style={styles.legendText}>Doel</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Eieren Verdeling per Maat</Title>
              {renderEggDistributionChart()}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Productie Details</Title>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Periode</DataTable.Title>
                  <DataTable.Title numeric>Klein</DataTable.Title>
                  <DataTable.Title numeric>Medium</DataTable.Title>
                  <DataTable.Title numeric>Groot</DataTable.Title>
                  <DataTable.Title numeric>Totaal</DataTable.Title>
                </DataTable.Header>

                {reportData.production.map((item, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>{item.day}</DataTable.Cell>
                    <DataTable.Cell numeric>{item.small}</DataTable.Cell>
                    <DataTable.Cell numeric>{item.medium}</DataTable.Cell>
                    <DataTable.Cell numeric>{item.large}</DataTable.Cell>
                    <DataTable.Cell numeric style={{ fontWeight: "bold" }}>
                      {item.eggs}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Financial View */}
      {selectedMetric === "financial" && (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Financieel Overzicht</Title>
              <View style={styles.financialGrid}>
                <View style={styles.financialItem}>
                  <IconButton icon="cash-plus" size={32} iconColor="#4CAF50" />
                  <Text style={[styles.financialAmount, { color: "#4CAF50" }]}>
                    €{reportData.financial.revenue?.toFixed(2)}
                  </Text>
                  <Text style={styles.financialLabel}>Omzet</Text>
                </View>
                <View style={styles.financialItem}>
                  <IconButton icon="cash-minus" size={32} iconColor="#F44336" />
                  <Text style={[styles.financialAmount, { color: "#F44336" }]}>
                    €{reportData.financial.costs?.toFixed(2)}
                  </Text>
                  <Text style={styles.financialLabel}>Kosten</Text>
                </View>
                <View style={styles.financialItem}>
                  <IconButton icon="cash-check" size={32} iconColor="#2E7D32" />
                  <Text style={[styles.financialAmount, { color: "#2E7D32" }]}>
                    €{reportData.financial.profit?.toFixed(2)}
                  </Text>
                  <Text style={styles.financialLabel}>Winst</Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.profitMargin}>
                <Text style={styles.profitMarginLabel}>Winstmarge:</Text>
                <Text style={styles.profitMarginValue}>
                  {(
                    (reportData.financial.profit /
                      reportData.financial.revenue) *
                    100
                  ).toFixed(1)}
                  %
                </Text>
              </View>
              <ProgressBar
                progress={
                  reportData.financial.profit / reportData.financial.revenue
                }
                color="#2E7D32"
                style={styles.profitMarginBar}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Omzet per Ei Maat</Title>
              <View style={styles.revenueBreakdown}>
                <View style={styles.revenueItem}>
                  <View style={styles.revenueHeader}>
                    <IconButton
                      icon="egg"
                      size={20}
                      iconColor="#FF9800"
                      style={{ margin: 0 }}
                    />
                    <Text style={styles.revenueTitle}>Klein (S)</Text>
                  </View>
                  <Text style={styles.revenueAmount}>
                    €{reportData.financial.eggRevenue?.small.toFixed(2)}
                  </Text>
                  <Text style={styles.revenuePercentage}>
                    {(
                      (reportData.financial.eggRevenue?.small /
                        reportData.financial.revenue) *
                      100
                    ).toFixed(1)}
                    % van totaal
                  </Text>
                </View>

                <View style={styles.revenueItem}>
                  <View style={styles.revenueHeader}>
                    <IconButton
                      icon="egg"
                      size={24}
                      iconColor="#4CAF50"
                      style={{ margin: 0 }}
                    />
                    <Text style={styles.revenueTitle}>Medium (M)</Text>
                  </View>
                  <Text style={styles.revenueAmount}>
                    €{reportData.financial.eggRevenue?.medium.toFixed(2)}
                  </Text>
                  <Text style={styles.revenuePercentage}>
                    {(
                      (reportData.financial.eggRevenue?.medium /
                        reportData.financial.revenue) *
                      100
                    ).toFixed(1)}
                    % van totaal
                  </Text>
                </View>

                <View style={styles.revenueItem}>
                  <View style={styles.revenueHeader}>
                    <IconButton
                      icon="egg"
                      size={28}
                      iconColor="#2196F3"
                      style={{ margin: 0 }}
                    />
                    <Text style={styles.revenueTitle}>Groot (L)</Text>
                  </View>
                  <Text style={styles.revenueAmount}>
                    €{reportData.financial.eggRevenue?.large.toFixed(2)}
                  </Text>
                  <Text style={styles.revenuePercentage}>
                    {(
                      (reportData.financial.eggRevenue?.large /
                        reportData.financial.revenue) *
                      100
                    ).toFixed(1)}
                    % van totaal
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Kosten Breakdown</Title>
              <View style={styles.costBreakdown}>
                <View style={styles.costItem}>
                  <View style={styles.costHeader}>
                    <IconButton
                      icon="food-apple"
                      size={24}
                      iconColor="#2E7D32"
                      style={{ margin: 0 }}
                    />
                    <Text style={styles.costTitle}>Voerkosten</Text>
                  </View>
                  <Text style={styles.costAmount}>
                    €{reportData.financial.feedCost?.toFixed(2)}
                  </Text>
                  <ProgressBar
                    progress={
                      reportData.financial.feedCost / reportData.financial.costs
                    }
                    color="#2E7D32"
                    style={styles.costBar}
                  />
                  <Text style={styles.costPercentage}>
                    {(
                      (reportData.financial.feedCost /
                        reportData.financial.costs) *
                      100
                    ).toFixed(1)}
                    % van totale kosten
                  </Text>
                </View>

                <View style={styles.costItem}>
                  <View style={styles.costHeader}>
                    <IconButton
                      icon="wrench"
                      size={24}
                      iconColor="#666666"
                      style={{ margin: 0 }}
                    />
                    <Text style={styles.costTitle}>Overige Kosten</Text>
                  </View>
                  <Text style={styles.costAmount}>
                    €{reportData.financial.otherCosts?.toFixed(2)}
                  </Text>
                  <ProgressBar
                    progress={
                      reportData.financial.otherCosts /
                      reportData.financial.costs
                    }
                    color="#666666"
                    style={styles.costBar}
                  />
                  <Text style={styles.costPercentage}>
                    {(
                      (reportData.financial.otherCosts /
                        reportData.financial.costs) *
                      100
                    ).toFixed(1)}
                    % van totale kosten
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Performance View */}
      {selectedMetric === "performance" && (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Prestatie Indicatoren</Title>

              <View style={styles.performanceItem}>
                <View style={styles.performanceHeader}>
                  <IconButton icon="weight" size={24} iconColor="#2E7D32" />
                  <View style={styles.performanceInfo}>
                    <Text style={styles.performanceLabel}>
                      Gemiddeld Eigewicht
                    </Text>
                    <Text
                      style={[
                        styles.performanceValue,
                        {
                          color: getPerformanceColor(
                            reportData.performance.avgEggWeight,
                            "weight"
                          ),
                        },
                      ]}
                    >
                      {reportData.performance.avgEggWeight}g
                    </Text>
                  </View>
                </View>
                <ProgressBar
                  progress={reportData.performance.avgEggWeight / 65}
                  color={getPerformanceColor(
                    reportData.performance.avgEggWeight,
                    "weight"
                  )}
                  style={styles.performanceBar}
                />
                <Text style={styles.performanceNote}>
                  {reportData.performance.avgEggWeight >= 58
                    ? "✓ Uitstekend"
                    : reportData.performance.avgEggWeight >= 55
                      ? "⚠ Gemiddeld"
                      : "✗ Onder norm"}
                </Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.performanceItem}>
                <View style={styles.performanceHeader}>
                  <IconButton icon="food-apple" size={24} iconColor="#2E7D32" />
                  <View style={styles.performanceInfo}>
                    <Text style={styles.performanceLabel}>
                      Voer Conversie Ratio (FCR)
                    </Text>
                    <Text
                      style={[
                        styles.performanceValue,
                        {
                          color: getPerformanceColor(
                            reportData.performance.feedConversion,
                            "feedConversion"
                          ),
                        },
                      ]}
                    >
                      {reportData.performance.feedConversion}
                    </Text>
                  </View>
                </View>
                <ProgressBar
                  progress={Math.min(
                    reportData.performance.feedConversion / 3,
                    1
                  )}
                  color={getPerformanceColor(
                    reportData.performance.feedConversion,
                    "feedConversion"
                  )}
                  style={styles.performanceBar}
                />
                <Text style={styles.performanceNote}>
                  {reportData.performance.feedConversion <= 2.2
                    ? "✓ Uitstekende efficiëntie"
                    : reportData.performance.feedConversion <= 2.5
                      ? "⚠ Gemiddelde efficiëntie"
                      : "✗ Verbetering nodig"}
                </Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.performanceItem}>
                <View style={styles.performanceHeader}>
                  <IconButton
                    icon="alert-circle"
                    size={24}
                    iconColor="#2E7D32"
                  />
                  <View style={styles.performanceInfo}>
                    <Text style={styles.performanceLabel}>
                      Uitval Percentage
                    </Text>
                    <Text
                      style={[
                        styles.performanceValue,
                        {
                          color: getPerformanceColor(
                            reportData.performance.mortality,
                            "mortality"
                          ),
                        },
                      ]}
                    >
                      {reportData.performance.mortality}%
                    </Text>
                  </View>
                </View>
                <ProgressBar
                  progress={Math.min(reportData.performance.mortality / 5, 1)}
                  color={getPerformanceColor(
                    reportData.performance.mortality,
                    "mortality"
                  )}
                  style={styles.performanceBar}
                />
                <Text style={styles.performanceNote}>
                  {reportData.performance.mortality <= 1.0
                    ? "✓ Zeer laag (uitstekend)"
                    : reportData.performance.mortality <= 2.0
                      ? "⚠ Acceptabel"
                      : "✗ Aandacht vereist"}
                </Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.performanceItem}>
                <View style={styles.performanceHeader}>
                  <IconButton icon="water" size={24} iconColor="#2196F3" />
                  <View style={styles.performanceInfo}>
                    <Text style={styles.performanceLabel}>Water Verbruik</Text>
                    <Text style={styles.performanceValue}>
                      {reportData.performance.waterConsumption}L
                    </Text>
                  </View>
                </View>
                <Text style={styles.performanceSubtext}>
                  Gem:{" "}
                  {(
                    reportData.performance.waterConsumption /
                    (selectedPeriod === "week"
                      ? 7
                      : selectedPeriod === "month"
                        ? 30
                        : 365)
                  ).toFixed(1)}
                  L/dag
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Ei Gewicht Distributie</Title>
              <View style={styles.weightDistribution}>
                <View style={styles.weightItem}>
                  <Text style={styles.weightLabel}>Klein {"(<52g)"}</Text>
                  <Text style={styles.weightValue}>
                    {reportData.performance.eggWeightDistribution?.small.toFixed(
                      1
                    )}
                    %
                  </Text>
                  <ProgressBar
                    progress={
                      reportData.performance.eggWeightDistribution?.small / 100
                    }
                    color="#FF9800"
                    style={styles.weightBar}
                  />
                </View>
                <View style={styles.weightItem}>
                  <Text style={styles.weightLabel}>Medium (52-63g)</Text>
                  <Text style={styles.weightValue}>
                    {reportData.performance.eggWeightDistribution?.medium.toFixed(
                      1
                    )}
                    %
                  </Text>
                  <ProgressBar
                    progress={
                      reportData.performance.eggWeightDistribution?.medium / 100
                    }
                    color="#4CAF50"
                    style={styles.weightBar}
                  />
                </View>
                <View style={styles.weightItem}>
                  <Text style={styles.weightLabel}>Groot {">63g"}</Text>
                  <Text style={styles.weightValue}>
                    {reportData.performance.eggWeightDistribution?.large.toFixed(
                      1
                    )}
                    %
                  </Text>
                  <ProgressBar
                    progress={
                      reportData.performance.eggWeightDistribution?.large / 100
                    }
                    color="#2196F3"
                    style={styles.weightBar}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Productie Efficiency</Title>
              <DataTable>
                <DataTable.Row>
                  <DataTable.Cell>Eieren per dag (gem.)</DataTable.Cell>
                  <DataTable.Cell numeric style={{ fontWeight: "bold" }}>
                    {reportData.performance.avgDailyEggs}
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Voer per ei (gem.)</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {(
                      (reportData.performance.feedConversion /
                        reportData.performance.avgDailyEggs) *
                      1000
                    ).toFixed(0)}
                    g
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Water per ei (gem.)</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {(
                      reportData.performance.waterConsumption /
                      (selectedPeriod === "week"
                        ? 7
                        : selectedPeriod === "month"
                          ? 30
                          : 365) /
                      reportData.performance.avgDailyEggs
                    ).toFixed(2)}
                    L
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Kosten per ei</DataTable.Cell>
                  <DataTable.Cell numeric>
                    €
                    {(
                      reportData.financial.costs /
                      reportData.production.reduce(
                        (sum, item) => sum + item.eggs,
                        0
                      )
                    ).toFixed(3)}
                  </DataTable.Cell>
                </DataTable.Row>
              </DataTable>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Summary Card */}
      <Card style={[styles.card, styles.summaryCard]}>
        <Card.Content>
          <Title style={styles.cardTitle}>Samenvatting</Title>
          <Paragraph style={styles.summaryText}>
            {selectedPeriod === "week" && "Deze week "}
            {selectedPeriod === "month" && "Deze maand "}
            {selectedPeriod === "year" && "Dit jaar "}
            zijn er in totaal{" "}
            <Text style={styles.summaryHighlight}>
              {reportData.production.reduce((sum, item) => sum + item.eggs, 0)}{" "}
              eieren
            </Text>{" "}
            geproduceerd met een gemiddeld productiepercentage van{" "}
            <Text style={styles.summaryHighlight}>
              {(
                reportData.production.reduce(
                  (sum, item) => sum + item.percentage,
                  0
                ) / reportData.production.length
              ).toFixed(1)}
              %
            </Text>
            . De voerconversie ratio bedraagt{" "}
            <Text style={styles.summaryHighlight}>
              {reportData.performance.feedConversion}
            </Text>
            , wat resulteert in een winstmarge van{" "}
            <Text style={styles.summaryHighlight}>
              {(
                (reportData.financial.profit / reportData.financial.revenue) *
                100
              ).toFixed(1)}
              %
            </Text>
            .
          </Paragraph>
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
  subheader: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
  },
  periodSelector: {
    marginBottom: 16,
  },
  metricSelector: {
    marginBottom: 16,
  },
  alertsCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: "#FFF9E6",
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  alertIcon: {
    margin: 0,
    marginRight: 8,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 13,
    color: "#666666",
  },
  trendsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  trendItem: {
    alignItems: "center",
  },
  trendLabel: {
    fontSize: 11,
    color: "#666666",
    marginTop: -8,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    color: "#2E7D32",
    fontSize: 18,
    marginBottom: 12,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    height: 200,
    marginBottom: 16,
  },
  barContainer: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  barWrapper: {
    position: "relative",
    alignItems: "center",
    height: 150,
    justifyContent: "flex-end",
  },
  targetLine: {
    position: "absolute",
    width: 40,
    height: 2,
    backgroundColor: "#FF9800",
    borderStyle: "dashed",
  },
  bar: {
    width: 32,
    backgroundColor: "#2E7D32",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 20,
  },
  barValueInside: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  barLabel: {
    fontSize: 11,
    color: "#666666",
    marginTop: 4,
    fontWeight: "bold",
  },
  percentageChip: {
    height: 20,
    marginTop: 4,
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  targetLineLegend: {
    width: 20,
    height: 2,
    backgroundColor: "#FF9800",
  },
  legendText: {
    fontSize: 11,
    color: "#666666",
  },
  distributionContainer: {
    marginTop: 16,
  },
  distributionBar: {
    flexDirection: "row",
    height: 40,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  distributionSegment: {
    justifyContent: "center",
    alignItems: "center",
  },
  distributionLegend: {
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  financialGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  financialItem: {
    alignItems: "center",
  },
  financialAmount: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: -8,
  },
  financialLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  profitMargin: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  profitMarginLabel: {
    fontSize: 14,
    color: "#666666",
  },
  profitMarginValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  profitMarginBar: {
    height: 12,
    borderRadius: 6,
  },
  revenueBreakdown: {
    gap: 16,
    marginTop: 8,
  },
  revenueItem: {
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  revenueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  revenueTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  revenueAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  revenuePercentage: {
    fontSize: 12,
    color: "#666666",
  },
  costBreakdown: {
    gap: 16,
    marginTop: 8,
  },
  costItem: {
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  costHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  costTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  costAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F44336",
    marginBottom: 8,
  },
  costBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  costPercentage: {
    fontSize: 11,
    color: "#666666",
  },
  performanceItem: {
    marginBottom: 16,
  },
  performanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  performanceInfo: {
    flex: 1,
  },
  performanceLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  performanceBar: {
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  performanceNote: {
    fontSize: 12,
    color: "#666666",
    fontStyle: "italic",
  },
  performanceSubtext: {
    fontSize: 12,
    color: "#999999",
    marginTop: 4,
  },
  weightDistribution: {
    gap: 16,
    marginTop: 8,
  },
  weightItem: {
    marginBottom: 12,
  },
  weightLabel: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 4,
  },
  weightValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  weightBar: {
    height: 10,
    borderRadius: 5,
  },
  summaryCard: {
    backgroundColor: "#E8F5E9",
  },
  summaryText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 22,
  },
  summaryHighlight: {
    fontWeight: "bold",
    color: "#2E7D32",
  },
  exportContainer: {
    gap: 8,
    marginBottom: 32,
  },
  exportButton: {
    paddingVertical: 8,
  },
  shareButton: {
    borderColor: "#2E7D32",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#666666",
  },
});
