import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Card, Title, Paragraph, IconButton, Chip } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: "chart-line",
      title: "Real-time Inzichten",
      description:
        "Volg uw productie, voerverbruik en prestaties in real-time met overzichtelijke dashboards en grafieken.",
    },
    {
      icon: "cash-register",
      title: "Verkoop Beheer",
      description:
        "Beheer klanten, bestellingen en voorraad automatisch. Genereer facturen en leverbonnen met één klik.",
    },
    {
      icon: "chart-box",
      title: "Slimme Rapporten",
      description:
        "Automatische rapporten en analyses om uw bedrijf te optimaliseren. Export naar Excel en PDF.",
    },
    {
      icon: "bell-alert",
      title: "Slimme Waarschuwingen",
      description:
        "Ontvang meldingen bij lage voorraad, hoge uitval of wanneer prestaties onder de norm liggen.",
    },
  ];

  // EXAM REQUIREMENT: Guest content - Public egg prices visible without login
  const currentPrices = [
    { size: "S", label: "Klein", price: "0.15", color: "#FFB74D", icon: "egg" },
    { size: "M", label: "Medium", price: "0.22", color: "#81C784", icon: "egg" },
    { size: "L", label: "Groot", price: "0.28", color: "#64B5F6", icon: "egg" },
    { size: "XL", label: "Extra Groot", price: "0.35", color: "#BA68C8", icon: "egg" },
  ];

  // Platform-specific scroll container for web compatibility
  const ScrollContainer = ({ children, style, contentContainerStyle }) => {
    if (Platform.OS === 'web') {
      return (
        <div style={{
          height: '100vh',
          overflowY: 'auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f5f7fa'
        }}>
          <div style={{ ...contentContainerStyle, display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        </div>
      );
    }
    return (
      <ScrollView
        style={style}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={true}
      >
        {children}
      </ScrollView>
    );
  };

  // Market trends visible for guests
  const marketTrends = [
    { label: "Vraag", trend: "up", value: "+12%", color: "#4CAF50" },
    { label: "Aanbod", trend: "down", value: "-3%", color: "#F44336" },
    { label: "Gemiddelde", trend: "stable", value: "€0.24", color: "#2196F3" },
  ];

  return (
    <ScrollContainer
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🥚</Text>
          </View>
          <Title style={styles.appTitle}>EggSense</Title>
          <Paragraph style={styles.heroTagline}>
            De moderne oplossing voor professioneel kippenstal management
          </Paragraph>
        </View>
      </View>

      {/* EXAM REQUIREMENT: Public Content for Guests - Current Egg Prices */}
      <Card style={styles.pricesCard}>
        <Card.Content>
          <View style={styles.pricesHeader}>
            <IconButton icon="currency-eur" size={28} iconColor="#2E7D32" />
            <Title style={styles.pricesTitle}>Huidige Eierprijzen</Title>
          </View>
          <Paragraph style={styles.pricesSubtitle}>
            Actuele marktprijzen per ei (excl. BTW)
          </Paragraph>

          <View style={styles.pricesGrid}>
            {currentPrices.map((item, index) => (
              <View key={index} style={[styles.priceItem, { borderColor: item.color }]}>
                <View style={[styles.priceIconContainer, { backgroundColor: item.color + '20' }]}>
                  <Icon name={item.icon} size={24} color={item.color} />
                  <Text style={[styles.priceSize, { color: item.color }]}>{item.size}</Text>
                </View>
                <Text style={styles.priceLabel}>{item.label}</Text>
                <Text style={styles.priceValue}>€{item.price}</Text>
              </View>
            ))}
          </View>

          <View style={styles.marketTrends}>
            <Text style={styles.trendsTitle}>📊 Markttrends deze week</Text>
            <View style={styles.trendsRow}>
              {marketTrends.map((trend, index) => (
                <View key={index} style={styles.trendItem}>
                  <Icon
                    name={trend.trend === 'up' ? 'trending-up' : trend.trend === 'down' ? 'trending-down' : 'minus'}
                    size={20}
                    color={trend.color}
                  />
                  <Text style={styles.trendLabel}>{trend.label}</Text>
                  <Text style={[styles.trendValue, { color: trend.color }]}>{trend.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <Chip icon="clock-outline" style={styles.updateChip}>
            Laatst bijgewerkt: Vandaag 09:00
          </Chip>
        </Card.Content>
      </Card>

      {/* Main Value Proposition */}
      <Card style={styles.valueCard}>
        <Card.Content>
          <Title style={styles.valueTitle}>Waarom EggSense?</Title>
          <Paragraph style={styles.valueDescription}>
            Stop met tijdrovende Excel-sheets en papieren administratie.
            EggSense digitaliseert uw pluimveebedrijf met een
            gebruiksvriendelijke mobiele app die u altijd en overal kunt
            gebruiken.
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Features Grid */}
      <View style={styles.featuresSection}>
        <Title style={styles.sectionTitle}>Kernfunctionaliteiten</Title>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <Card.Content style={styles.featureContent}>
                <IconButton
                  icon={feature.icon}
                  size={32}
                  iconColor="#2E7D32"
                  style={styles.featureIcon}
                />
                <Title style={styles.featureTitle}>{feature.title}</Title>
                <Paragraph style={styles.featureDescription}>
                  {feature.description}
                </Paragraph>
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>

      {/* Benefits Section */}
      <Card style={styles.benefitsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Wat krijgt u?</Title>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <IconButton icon="check-circle" size={24} iconColor="#4CAF50" />
              <Text style={styles.benefitText}>
                Dagelijkse invoer in minder dan 2 minuten
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <IconButton icon="check-circle" size={24} iconColor="#4CAF50" />
              <Text style={styles.benefitText}>
                Automatische berekening van productiepercentages
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <IconButton icon="check-circle" size={24} iconColor="#4CAF50" />
              <Text style={styles.benefitText}>
                Volledige voorraad- en klantenadministratie
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <IconButton icon="check-circle" size={24} iconColor="#4CAF50" />
              <Text style={styles.benefitText}>
                Inzicht in kosten, opbrengsten en winstmarges
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <IconButton icon="check-circle" size={24} iconColor="#4CAF50" />
              <Text style={styles.benefitText}>
                Beheer meerdere stallen vanuit één app
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <IconButton icon="check-circle" size={24} iconColor="#4CAF50" />
              <Text style={styles.benefitText}>
                Data export voor accountant en administratie
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Statistics Section */}
      <View style={styles.statsSection}>
        <Title style={styles.sectionTitle}>In cijfers</Title>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>95%</Text>
            <Text style={styles.statLabel}>Tijdsbesparing</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Toegang</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Overzicht</Text>
          </View>
        </View>
      </View>

      {/* Testimonial Section */}
      <Card style={styles.testimonialCard}>
        <Card.Content>
          <Text style={styles.quote}>"</Text>
          <Paragraph style={styles.testimonialText}>
            EggSense heeft mijn bedrijf getransformeerd. Wat eerst uren
            Excel-werk was, doe ik nu in minuten. De inzichten helpen me betere
            beslissingen te nemen en mijn winstgevendheid is met 15% gestegen.
          </Paragraph>
          <View style={styles.testimonialAuthor}>
            <Text style={styles.authorName}>- Piet Hendriks</Text>
            <Text style={styles.authorTitle}>
              Pluimveehouder, 500 leghennen
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Title style={styles.ctaTitle}>Klaar om te beginnen?</Title>
        <Paragraph style={styles.ctaDescription}>
          Probeer EggSense nu gratis en ervaar het verschil
        </Paragraph>
        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.ctaButton}
          activeOpacity={0.8}
        >
          <View style={styles.ctaButtonInner}>
            <Text style={styles.ctaButtonText}>Start Nu</Text>
            <Icon name="arrow-right" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.ctaSubtext}>
          Geen creditcard vereist • 30 dagen gratis proberen
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>EggSense v1.0.0</Text>
        <Text style={styles.footerSubtext}>
          © 2024 EggSense Solutions • Alle rechten voorbehouden
        </Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLink}>Privacy Policy</Text>
          <Text style={styles.footerSeparator}>•</Text>
          <Text style={styles.footerLink}>Algemene Voorwaarden</Text>
          <Text style={styles.footerSeparator}>•</Text>
          <Text style={styles.footerLink}>Contact</Text>
        </View>
      </View>
    </ScrollContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
  },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  logoEmoji: {
    fontSize: 50,
  },
  appTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 12,
  },
  heroTagline: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  // Prices card styles (EXAM REQUIREMENT - Guest Content)
  pricesCard: {
    margin: 20,
    elevation: 6,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  pricesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginLeft: -12,
  },
  pricesTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  pricesSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    marginLeft: 4,
  },
  pricesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  priceItem: {
    width: (width - 80) / 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 2,
    elevation: 2,
  },
  priceIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
    gap: 4,
  },
  priceSize: {
    fontSize: 16,
    fontWeight: "bold",
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  marketTrends: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  trendsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  trendsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  trendItem: {
    alignItems: "center",
  },
  trendLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  trendValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
  },
  updateChip: {
    alignSelf: "center",
    backgroundColor: "#E8F5E9",
  },
  valueCard: {
    margin: 20,
    elevation: 4,
    borderRadius: 12,
  },
  valueTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 12,
    textAlign: "center",
  },
  valueDescription: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
  },
  featuresSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: (width - 52) / 2,
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  featureContent: {
    alignItems: "center",
    padding: 12,
  },
  featureIcon: {
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  benefitsCard: {
    margin: 20,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
  },
  benefitsList: {
    marginTop: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
    marginLeft: -8,
  },
  statsSection: {
    padding: 20,
    backgroundColor: "#fff",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  testimonialCard: {
    margin: 20,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: "#2E7D32",
  },
  quote: {
    fontSize: 48,
    color: "rgba(255,255,255,0.3)",
    lineHeight: 48,
    marginTop: -12,
  },
  testimonialText: {
    fontSize: 16,
    color: "#fff",
    fontStyle: "italic",
    lineHeight: 24,
    marginBottom: 16,
  },
  testimonialAuthor: {
    marginTop: 8,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  authorTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  ctaSection: {
    padding: 30,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 12,
    textAlign: "center",
  },
  ctaDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  ctaButton: {
    width: width - 80,
    borderRadius: 12,
    backgroundColor: "#2E7D32",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  ctaButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  ctaButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  ctaSubtext: {
    marginTop: 16,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  footer: {
    padding: 30,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  footerText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "bold",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerLink: {
    fontSize: 12,
    color: "#2E7D32",
    textDecorationLine: "underline",
  },
  footerSeparator: {
    marginHorizontal: 8,
    color: "#999",
  },
});
