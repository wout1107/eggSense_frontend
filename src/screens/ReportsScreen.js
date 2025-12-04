import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
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

const { width } = Dimensions.get("window");

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedMetric, setSelectedMetric] = useState("production");
  const [reportData, setReportData] = useState({
    production: [],
    financial: {},
    performance: {},
    trends: {},
    alerts: [],
  });

  useEffect(() => {
    generateReportData(selectedPeriod);
  }, [selectedPeriod]);

  const generateReportData = (period) => {
    // Mock data generation based on period
    const mockProduction = {
      week: [
        {
          day: "Ma",
          eggs: 245,
          small: 45,
          medium: 120,
          large: 80,
          target: 250,
          percentage: 87.5,
        },
        {
          day: "Di",
          eggs: 238,
          small: 42,
          medium: 118,
          large: 78,
          target: 250,
          percentage: 85.0,
        },
        {
          day: "Wo",
          eggs: 252,
          small: 48,
          medium: 125,
          large: 79,
          target: 250,
          percentage: 90.0,
        },
        {
          day: "Do",
          eggs: 241,
          small: 44,
          medium: 119,
          large: 78,
          target: 250,
          percentage: 86.1,
        },
        {
          day: "Vr",
          eggs: 249,
          small: 46,
          medium: 123,
          large: 80,
          target: 250,
          percentage: 89.0,
        },
        {
          day: "Za",
          eggs: 243,
          small: 45,
          medium: 120,
          large: 78,
          target: 250,
          percentage: 86.8,
        },
        {
          day: "Zo",
          eggs: 247,
          small: 47,
          medium: 122,
          large: 78,
          target: 250,
          percentage: 88.2,
        },
      ],
      month: [
        {
          day: "Week 1",
          eggs: 1715,
          small: 318,
          medium: 851,
          large: 546,
          target: 1750,
          percentage: 87.2,
        },
        {
          day: "Week 2",
          eggs: 1698,
          small: 315,
          medium: 842,
          large: 541,
          target: 1750,
          percentage: 86.3,
        },
        {
          day: "Week 3",
          eggs: 1729,
          small: 321,
          medium: 857,
          large: 551,
          target: 1750,
          percentage: 87.9,
        },
        {
          day: "Week 4",
          eggs: 1712,
          small: 318,
          medium: 849,
          large: 545,
          target: 1750,
          percentage: 87.0,
        },
      ],
      year: [
        {
          day: "Jan",
          eggs: 7154,
          small: 1328,
          medium: 3548,
          large: 2278,
          target: 7500,
          percentage: 86.8,
        },
        {
          day: "Feb",
          eggs: 6892,
          small: 1280,
          medium: 3420,
          large: 2192,
          target: 7000,
          percentage: 87.3,
        },
        {
          day: "Mrt",
          eggs: 7298,
          small: 1356,
          medium: 3620,
          large: 2322,
          target: 7500,
          percentage: 88.5,
        },
        {
          day: "Apr",
          eggs: 7145,
          small: 1328,
          medium: 3545,
          large: 2272,
          target: 7500,
          percentage: 86.9,
        },
      ],
    };

    const mockFinancial = {
      week: {
        revenue: 435.75,
        costs: 198.5,
        profit: 237.25,
        feedCost: 145.2,
        otherCosts: 53.3,
        eggRevenue: { small: 85.5, medium: 245.0, large: 105.25 },
      },
      month: {
        revenue: 1843.2,
        costs: 789.4,
        profit: 1053.8,
        feedCost: 612.8,
        otherCosts: 176.6,
        eggRevenue: { small: 362.4, medium: 1035.0, large: 445.8 },
      },
      year: {
        revenue: 22518.4,
        costs: 9472.8,
        profit: 13045.6,
        feedCost: 7353.6,
        otherCosts: 2119.2,
        eggRevenue: { small: 4348.8, medium: 12420.0, large: 5349.6 },
      },
    };

    const mockPerformance = {
      week: {
        avgEggWeight: 58.2,
        feedConversion: 2.1,
        waterConsumption: 285.4,
        mortality: 0.2,
        avgDailyEggs: 245,
        eggWeightDistribution: { small: 18.5, medium: 49.2, large: 32.3 },
      },
      month: {
        avgEggWeight: 58.8,
        feedConversion: 2.0,
        waterConsumption: 1234.6,
        mortality: 0.8,
        avgDailyEggs: 243,
        eggWeightDistribution: { small: 18.7, medium: 49.5, large: 31.8 },
      },
      year: {
        avgEggWeight: 59.1,
        feedConversion: 2.05,
        waterConsumption: 14815.2,
        mortality: 3.2,
        avgDailyEggs: 242,
        eggWeightDistribution: { small: 18.9, medium: 49.8, large: 31.3 },
      },
    };

    const mockTrends = {
      week: {
        productionTrend: 2.5, // percentage increase
        feedEfficiencyTrend: -3.2, // percentage decrease (improvement)
        mortalityTrend: -15.0, // percentage decrease
        profitTrend: 8.5, // percentage increase
      },
      month: {
        productionTrend: 1.8,
        feedEfficiencyTrend: -2.8,
        mortalityTrend: -10.5,
        profitTrend: 12.3,
      },
      year: {
        productionTrend: 5.2,
        feedEfficiencyTrend: -5.5,
        mortalityTrend: -8.2,
        profitTrend: 18.7,
      },
    };

    const mockAlerts = [
      {
        id: 1,
        type: "success",
        title: "Uitstekende Productie",
        message: "Productie 5% boven gemiddelde deze periode",
        severity: "low",
      },
      {
        id: 2,
        type: "warning",
        title: "Voerconversie Afwijking",
        message: "Voerconversie ratio licht gestegen t.o.v. vorige periode",
        severity: "medium",
      },
      {
        id: 3,
        type: "info",
        title: "Seizoenspatroon",
        message: "Normale seizoensvariatie in eigewicht gedetecteerd",
        severity: "low",
      },
    ];

    setReportData({
      production: mockProduction[period],
      financial: mockFinancial[period],
      performance: mockPerformance[period],
      trends: mockTrends[period],
      alerts: mockAlerts,
    });
  };

  const exportReport = () => {
    Alert.alert("Rapport Exporteren", "Kies een export formaat", [
      { text: "Annuleren", style: "cancel" },
      {
        text: "PDF",
        onPress: () =>
          Alert.alert("Succes", "Rapport geëxporteerd als PDF naar Downloads"),
      },
      {
        text: "Excel",
        onPress: () =>
          Alert.alert(
            "Succes",
            "Rapport geëxporteerd als Excel naar Downloads"
          ),
      },
    ]);
  };

  const shareReport = () => {
    Alert.alert("Rapport Delen", "Wilt u dit rapport delen?", [
      { text: "Annuleren", style: "cancel" },
      {
        text: "E-mail",
        onPress: () => Alert.alert("E-mail", "Rapport wordt verzonden..."),
      },
      {
        text: "WhatsApp",
        onPress: () => Alert.alert("WhatsApp", "Rapport wordt gedeeld..."),
      },
    ]);
  };

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
                  {/* Target line */}
                  <View style={[styles.targetLine, { bottom: targetHeight }]} />
                  {/* Actual bar */}
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
                  {item.percentage}%
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.header}>Rapporten & Analyses</Text>
          <Text style={styles.subheader}>
            {new Date().toLocaleDateString("nl-NL")}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon="share-variant"
            size={24}
            iconColor="#2E7D32"
            onPress={shareReport}
          />
          <IconButton
            icon="download"
            size={24}
            iconColor="#2E7D32"
            onPress={exportReport}
          />
        </View>
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
                {reportData.trends.productionTrend}%
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
                {reportData.trends.feedEfficiencyTrend}%
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
                {reportData.trends.mortalityTrend}%
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
                {reportData.trends.profitTrend}%
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

      {/* Export Button */}
      <View style={styles.exportContainer}>
        <Button
          mode="contained"
          onPress={exportReport}
          style={styles.exportButton}
          buttonColor="#2E7D32"
          icon="download"
        >
          Exporteer Volledig Rapport
        </Button>
        <Button
          mode="outlined"
          onPress={shareReport}
          style={styles.shareButton}
          icon="share-variant"
        >
          Deel Rapport
        </Button>
      </View>
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
});
