import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  Card,
  Title,
  TextInput,
  Button,
  Avatar,
  IconButton,
  Divider,
  List,
  Chip,
  ProgressBar,
  Portal,
  Dialog,
  SegmentedButtons,
} from "react-native-paper";

export default function ProfileScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState("personal");
  const [editPersonalDialogVisible, setEditPersonalDialogVisible] =
    useState(false);
  const [editBusinessDialogVisible, setEditBusinessDialogVisible] =
    useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    name: "Jan Jansen",
    email: "jan@eggsense.nl",
    phone: "06-12345678",
    address: "Hoofdstraat 123",
    city: "1234 AB Dorp",
    country: "Nederland",
    birthDate: "1975-03-15",
    memberSince: "2023-06-15",
  });

  const [editedPersonal, setEditedPersonal] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "Boerderij de Gouden Kip",
    kvkNumber: "12345678",
    btwNumber: "NL123456789B01",
    businessAddress: "Boerderijweg 45",
    businessCity: "1234 CD Landgoed",
    businessPhone: "0123-456789",
    businessEmail: "info@goudenkip.nl",
    website: "www.goudenkip.nl",
    bankAccount: "NL12 BANK 0123 4567 89",
    established: "2015-01-01",
  });

  const [editedBusiness, setEditedBusiness] = useState({
    businessName: "",
    kvkNumber: "",
    btwNumber: "",
    businessAddress: "",
    businessCity: "",
    businessPhone: "",
    businessEmail: "",
  });

  const [chickenOverview, setChickenOverview] = useState({
    totalStalls: 2,
    totalChickens: 600,
    activeChickens: 596,
    averageAge: 31, // weeks
    breeds: [
      {
        name: "Bruine Leghennen",
        count: 280,
        percentage: 46.7,
        stall: "Stal 1",
      },
      {
        name: "Witte Leghennen",
        count: 320,
        percentage: 53.3,
        stall: "Stal 2",
      },
    ],
    healthStatus: {
      excellent: 92,
      good: 6,
      attention: 2,
    },
    productionStats: {
      todayEggs: 530,
      weeklyAverage: 3710,
      monthlyAverage: 15840,
      bestDay: { date: "2024-01-10", eggs: 548 },
    },
    feedConsumption: {
      daily: 60.6,
      weekly: 424.2,
      costPerDay: 27.27,
    },
  });

  const [accountStats, setAccountStats] = useState({
    daysActive: 214,
    totalDataEntries: 856,
    totalOrders: 342,
    totalRevenue: 45623.45,
    totalCustomers: 28,
    averageRating: 4.8,
  });

  const openEditPersonal = () => {
    setEditedPersonal({
      name: personalInfo.name,
      email: personalInfo.email,
      phone: personalInfo.phone,
      address: personalInfo.address,
      city: personalInfo.city,
    });
    setEditPersonalDialogVisible(true);
  };

  const savePersonalInfo = () => {
    setPersonalInfo({
      ...personalInfo,
      ...editedPersonal,
    });
    setEditPersonalDialogVisible(false);
    Alert.alert("Succes", "Persoonlijke gegevens bijgewerkt");
  };

  const openEditBusiness = () => {
    setEditedBusiness({
      businessName: businessInfo.businessName,
      kvkNumber: businessInfo.kvkNumber,
      btwNumber: businessInfo.btwNumber,
      businessAddress: businessInfo.businessAddress,
      businessCity: businessInfo.businessCity,
      businessPhone: businessInfo.businessPhone,
      businessEmail: businessInfo.businessEmail,
    });
    setEditBusinessDialogVisible(true);
  };

  const saveBusinessInfo = () => {
    setBusinessInfo({
      ...businessInfo,
      ...editedBusiness,
    });
    setEditBusinessDialogVisible(false);
    Alert.alert("Succes", "Bedrijfsgegevens bijgewerkt");
  };

  const changeProfilePicture = () => {
    Alert.alert("Profielfoto Wijzigen", "Kies een optie", [
      {
        text: "Camera",
        onPress: () => Alert.alert("Camera", "Camera wordt geopend..."),
      },
      {
        text: "Galerij",
        onPress: () => Alert.alert("Galerij", "Galerij wordt geopend..."),
      },
      { text: "Annuleren", style: "cancel" },
    ]);
  };

  const changePassword = () => {
    Alert.alert(
      "Wachtwoord Wijzigen",
      "Een wachtwoord reset link wordt naar uw e-mail gestuurd",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Versturen",
          onPress: () =>
            Alert.alert(
              "Verzonden",
              `Reset link verzonden naar ${personalInfo.email}`
            ),
        },
      ]
    );
  };

  const downloadData = () => {
    Alert.alert("Data Downloaden", "Download al uw data als backup", [
      { text: "Annuleren", style: "cancel" },
      {
        text: "Download",
        onPress: () =>
          Alert.alert(
            "Download Gestart",
            "Uw data wordt gedownload naar Downloads/eggsense_data.zip"
          ),
      },
    ]);
  };

  const calculateMembershipDuration = () => {
    const memberDate = new Date(personalInfo.memberSince);
    const now = new Date();
    const days = Math.floor((now - memberDate) / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0) {
      return `${years} jaar${
        remainingMonths > 0 ? ` en ${remainingMonths} maanden` : ""
      }`;
    }
    return `${months} maanden`;
  };

  const getHealthColor = (status) => {
    switch (status) {
      case "excellent":
        return "#4CAF50";
      case "good":
        return "#8BC34A";
      case "attention":
        return "#FF9800";
      default:
        return "#666666";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <TouchableOpacity onPress={changeProfilePicture}>
                <Avatar.Text
                  size={80}
                  label={personalInfo.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                  style={styles.avatar}
                  color="#fff"
                />
                <View style={styles.editBadge}>
                  <IconButton
                    icon="camera"
                    size={16}
                    iconColor="#fff"
                    style={styles.editIcon}
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.profileInfo}>
                <Title style={styles.profileName}>{personalInfo.name}</Title>
                <Text style={styles.profileEmail}>{personalInfo.email}</Text>
                <Chip icon="calendar" style={styles.memberChip}>
                  Lid sinds {calculateMembershipDuration()}
                </Chip>
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStatsGrid}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatNumber}>
                  {accountStats.daysActive}
                </Text>
                <Text style={styles.quickStatLabel}>Dagen Actief</Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatNumber}>
                  {accountStats.totalDataEntries}
                </Text>
                <Text style={styles.quickStatLabel}>Invoeren</Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatNumber}>
                  {accountStats.totalOrders}
                </Text>
                <Text style={styles.quickStatLabel}>Bestellingen</Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatNumber}>
                  €{(accountStats.totalRevenue / 1000).toFixed(1)}K
                </Text>
                <Text style={styles.quickStatLabel}>Omzet</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Tab Selector */}
        <SegmentedButtons
          value={selectedTab}
          onValueChange={setSelectedTab}
          buttons={[
            { value: "personal", label: "Persoonlijk", icon: "account" },
            { value: "business", label: "Bedrijf", icon: "domain" },
            { value: "chickens", label: "Kippen", icon: "egg" },
          ]}
          style={styles.tabSelector}
        />

        {/* Personal Tab */}
        {selectedTab === "personal" && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Title style={styles.cardTitle}>Persoonlijke Gegevens</Title>
                  <Button
                    mode="text"
                    onPress={openEditPersonal}
                    compact
                    icon="pencil"
                  >
                    Bewerken
                  </Button>
                </View>

                <List.Item
                  title="Naam"
                  description={personalInfo.name}
                  left={(props) => <List.Icon {...props} icon="account" />}
                />
                <Divider />
                <List.Item
                  title="E-mail"
                  description={personalInfo.email}
                  left={(props) => <List.Icon {...props} icon="email" />}
                />
                <Divider />
                <List.Item
                  title="Telefoon"
                  description={personalInfo.phone}
                  left={(props) => <List.Icon {...props} icon="phone" />}
                />
                <Divider />
                <List.Item
                  title="Adres"
                  description={`${personalInfo.address}, ${personalInfo.city}`}
                  left={(props) => <List.Icon {...props} icon="map-marker" />}
                />
                <Divider />
                <List.Item
                  title="Land"
                  description={personalInfo.country}
                  left={(props) => <List.Icon {...props} icon="flag" />}
                />
                <Divider />
                <List.Item
                  title="Geboortedatum"
                  description={new Date(
                    personalInfo.birthDate
                  ).toLocaleDateString("nl-NL")}
                  left={(props) => <List.Icon {...props} icon="cake-variant" />}
                />
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Account Beveiliging</Title>
                <Button
                  mode="outlined"
                  onPress={changePassword}
                  style={styles.securityButton}
                  icon="lock-reset"
                >
                  Wachtwoord Wijzigen
                </Button>
                <Button
                  mode="outlined"
                  onPress={() =>
                    Alert.alert(
                      "2FA",
                      "Twee-factor authenticatie wordt binnenkort beschikbaar"
                    )
                  }
                  style={styles.securityButton}
                  icon="two-factor-authentication"
                >
                  Twee-Factor Authenticatie
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Activiteiten Overzicht</Title>
                <View style={styles.activityStats}>
                  <View style={styles.activityItem}>
                    <IconButton
                      icon="calendar-check"
                      size={24}
                      iconColor="#2E7D32"
                    />
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityValue}>
                        {accountStats.daysActive} dagen
                      </Text>
                      <Text style={styles.activityLabel}>Account actief</Text>
                    </View>
                  </View>
                  <View style={styles.activityItem}>
                    <IconButton icon="database" size={24} iconColor="#2E7D32" />
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityValue}>
                        {accountStats.totalDataEntries}
                      </Text>
                      <Text style={styles.activityLabel}>Data invoeren</Text>
                    </View>
                  </View>
                  <View style={styles.activityItem}>
                    <IconButton icon="cart" size={24} iconColor="#2E7D32" />
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityValue}>
                        {accountStats.totalOrders}
                      </Text>
                      <Text style={styles.activityLabel}>
                        Totale bestellingen
                      </Text>
                    </View>
                  </View>
                  <View style={styles.activityItem}>
                    <IconButton
                      icon="account-group"
                      size={24}
                      iconColor="#2E7D32"
                    />
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityValue}>
                        {accountStats.totalCustomers}
                      </Text>
                      <Text style={styles.activityLabel}>Klanten</Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Privacy & Data</Title>
                <Button
                  mode="outlined"
                  onPress={downloadData}
                  style={styles.securityButton}
                  icon="download"
                >
                  Mijn Data Downloaden
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate("Settings")}
                  style={styles.securityButton}
                  icon="cog"
                >
                  Privacy Instellingen
                </Button>
              </Card.Content>
            </Card>
          </>
        )}

        {/* Business Tab */}
        {selectedTab === "business" && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Title style={styles.cardTitle}>Bedrijfsgegevens</Title>
                  <Button
                    mode="text"
                    onPress={openEditBusiness}
                    compact
                    icon="pencil"
                  >
                    Bewerken
                  </Button>
                </View>

                <List.Item
                  title="Bedrijfsnaam"
                  description={businessInfo.businessName}
                  left={(props) => <List.Icon {...props} icon="domain" />}
                />
                <Divider />
                <List.Item
                  title="KVK Nummer"
                  description={businessInfo.kvkNumber}
                  left={(props) => (
                    <List.Icon {...props} icon="file-document" />
                  )}
                />
                <Divider />
                <List.Item
                  title="BTW Nummer"
                  description={businessInfo.btwNumber}
                  left={(props) => <List.Icon {...props} icon="receipt" />}
                />
                <Divider />
                <List.Item
                  title="Vestigingsadres"
                  description={`${businessInfo.businessAddress}, ${businessInfo.businessCity}`}
                  left={(props) => <List.Icon {...props} icon="map-marker" />}
                />
                <Divider />
                <List.Item
                  title="Telefoon"
                  description={businessInfo.businessPhone}
                  left={(props) => <List.Icon {...props} icon="phone" />}
                />
                <Divider />
                <List.Item
                  title="E-mail"
                  description={businessInfo.businessEmail}
                  left={(props) => <List.Icon {...props} icon="email" />}
                />
                <Divider />
                <List.Item
                  title="Website"
                  description={businessInfo.website}
                  left={(props) => <List.Icon {...props} icon="web" />}
                />
                <Divider />
                <List.Item
                  title="Bankrekening"
                  description={businessInfo.bankAccount}
                  left={(props) => <List.Icon {...props} icon="bank" />}
                />
                <Divider />
                <List.Item
                  title="Opgericht"
                  description={new Date(
                    businessInfo.established
                  ).toLocaleDateString("nl-NL")}
                  left={(props) => (
                    <List.Icon {...props} icon="calendar-star" />
                  )}
                />
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Prestaties Overzicht</Title>
                <View style={styles.performanceGrid}>
                  <View style={styles.performanceCard}>
                    <IconButton
                      icon="currency-eur"
                      size={32}
                      iconColor="#4CAF50"
                    />
                    <Text style={styles.performanceValue}>
                      €{accountStats.totalRevenue.toLocaleString("nl-NL")}
                    </Text>
                    <Text style={styles.performanceLabel}>Totale Omzet</Text>
                  </View>
                  <View style={styles.performanceCard}>
                    <IconButton
                      icon="account-group"
                      size={32}
                      iconColor="#2196F3"
                    />
                    <Text style={styles.performanceValue}>
                      {accountStats.totalCustomers}
                    </Text>
                    <Text style={styles.performanceLabel}>Klanten</Text>
                  </View>
                  <View style={styles.performanceCard}>
                    <IconButton icon="star" size={32} iconColor="#FF9800" />
                    <Text style={styles.performanceValue}>
                      {accountStats.averageRating}
                    </Text>
                    <Text style={styles.performanceLabel}>
                      Gemiddelde Rating
                    </Text>
                  </View>
                  <View style={styles.performanceCard}>
                    <IconButton
                      icon="chart-line"
                      size={32}
                      iconColor="#9C27B0"
                    />
                    <Text style={styles.performanceValue}>+15%</Text>
                    <Text style={styles.performanceLabel}>Groei dit jaar</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>
                  Certificeringen & Keurmerken
                </Title>
                <View style={styles.certificationsGrid}>
                  <Chip
                    icon="check-circle"
                    style={styles.certChip}
                    textStyle={{ color: "#4CAF50" }}
                  >
                    Biologisch ✓
                  </Chip>
                  <Chip
                    icon="check-circle"
                    style={styles.certChip}
                    textStyle={{ color: "#4CAF50" }}
                  >
                    Scharrel ✓
                  </Chip>
                  <Chip
                    icon="check-circle"
                    style={styles.certChip}
                    textStyle={{ color: "#4CAF50" }}
                  >
                    Diervriendelijk ✓
                  </Chip>
                  <Chip
                    icon="check-circle"
                    style={styles.certChip}
                    textStyle={{ color: "#4CAF50" }}
                  >
                    KKM ✓
                  </Chip>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Bedrijfsdocumenten</Title>
                <Button
                  mode="outlined"
                  icon="file-document"
                  style={styles.docButton}
                  onPress={() =>
                    Alert.alert("Document", "KVK Uittreksel wordt geopend...")
                  }
                >
                  KVK Uittreksel
                </Button>
                <Button
                  mode="outlined"
                  icon="file-document"
                  style={styles.docButton}
                  onPress={() =>
                    Alert.alert("Document", "Verzekering wordt geopend...")
                  }
                >
                  Verzekeringsbewijs
                </Button>
                <Button
                  mode="outlined"
                  icon="file-document"
                  style={styles.docButton}
                  onPress={() =>
                    Alert.alert("Document", "Vergunning wordt geopend...")
                  }
                >
                  Bedrijfsvergunning
                </Button>
              </Card.Content>
            </Card>
          </>
        )}

        {/* Chickens Tab */}
        {selectedTab === "chickens" && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Kippen Overzicht</Title>
                <View style={styles.chickenSummary}>
                  <View style={styles.chickenSummaryItem}>
                    <IconButton icon="barn" size={40} iconColor="#2E7D32" />
                    <View>
                      <Text style={styles.chickenSummaryValue}>
                        {chickenOverview.totalStalls}
                      </Text>
                      <Text style={styles.chickenSummaryLabel}>Stallen</Text>
                    </View>
                  </View>
                  <View style={styles.chickenSummaryItem}>
                    <IconButton icon="egg" size={40} iconColor="#2E7D32" />
                    <View>
                      <Text style={styles.chickenSummaryValue}>
                        {chickenOverview.totalChickens}
                      </Text>
                      <Text style={styles.chickenSummaryLabel}>
                        Totaal Kippen
                      </Text>
                    </View>
                  </View>
                  <View style={styles.chickenSummaryItem}>
                    <IconButton
                      icon="heart-pulse"
                      size={40}
                      iconColor="#4CAF50"
                    />
                    <View>
                      <Text style={styles.chickenSummaryValue}>
                        {chickenOverview.activeChickens}
                      </Text>
                      <Text style={styles.chickenSummaryLabel}>Actief</Text>
                    </View>
                  </View>
                  <View style={styles.chickenSummaryItem}>
                    <IconButton
                      icon="calendar-month"
                      size={40}
                      iconColor="#2E7D32"
                    />
                    <View>
                      <Text style={styles.chickenSummaryValue}>
                        {chickenOverview.averageAge}
                      </Text>
                      <Text style={styles.chickenSummaryLabel}>
                        Weken (Gem.)
                      </Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Rassen Verdeling</Title>
                {chickenOverview.breeds.map((breed, index) => (
                  <View key={index} style={styles.breedItem}>
                    <View style={styles.breedHeader}>
                      <Text style={styles.breedName}>{breed.name}</Text>
                      <Chip mode="flat" style={styles.breedChip}>
                        {breed.stall}
                      </Chip>
                    </View>
                    <View style={styles.breedStats}>
                      <Text style={styles.breedCount}>
                        {breed.count} kippen
                      </Text>
                      <Text style={styles.breedPercentage}>
                        {breed.percentage.toFixed(1)}%
                      </Text>
                    </View>
                    <ProgressBar
                      progress={breed.percentage / 100}
                      color="#2E7D32"
                      style={styles.breedProgress}
                    />
                  </View>
                ))}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Gezondheid Status</Title>
                <View style={styles.healthGrid}>
                  <View style={styles.healthItem}>
                    <View
                      style={[
                        styles.healthCircle,
                        { backgroundColor: getHealthColor("excellent") + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.healthPercentage,
                          { color: getHealthColor("excellent") },
                        ]}
                      >
                        {chickenOverview.healthStatus.excellent}%
                      </Text>
                    </View>
                    <Text style={styles.healthLabel}>Uitstekend</Text>
                  </View>
                  <View style={styles.healthItem}>
                    <View
                      style={[
                        styles.healthCircle,
                        { backgroundColor: getHealthColor("good") + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.healthPercentage,
                          { color: getHealthColor("good") },
                        ]}
                      >
                        {chickenOverview.healthStatus.good}%
                      </Text>
                    </View>
                    <Text style={styles.healthLabel}>Goed</Text>
                  </View>
                  <View style={styles.healthItem}>
                    <View
                      style={[
                        styles.healthCircle,
                        { backgroundColor: getHealthColor("attention") + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.healthPercentage,
                          { color: getHealthColor("attention") },
                        ]}
                      >
                        {chickenOverview.healthStatus.attention}%
                      </Text>
                    </View>
                    <Text style={styles.healthLabel}>Aandacht</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Productie Statistieken</Title>
                <View style={styles.productionStats}>
                  <View style={styles.productionItem}>
                    <Text style={styles.productionLabel}>Vandaag</Text>
                    <Text style={styles.productionValue}>
                      {chickenOverview.productionStats.todayEggs} eieren
                    </Text>
                  </View>
                  <View style={styles.productionItem}>
                    <Text style={styles.productionLabel}>Week Gemiddeld</Text>
                    <Text style={styles.productionValue}>
                      {chickenOverview.productionStats.weeklyAverage} eieren
                    </Text>
                  </View>
                  <View style={styles.productionItem}>
                    <Text style={styles.productionLabel}>Maand Gemiddeld</Text>
                    <Text style={styles.productionValue}>
                      {chickenOverview.productionStats.monthlyAverage} eieren
                    </Text>
                  </View>
                </View>

                <Divider style={styles.statsDivider} />

                <View style={styles.bestDayCard}>
                  <IconButton icon="trophy" size={32} iconColor="#FFD700" />
                  <View style={styles.bestDayInfo}>
                    <Text style={styles.bestDayLabel}>Beste Dag</Text>
                    <Text style={styles.bestDayValue}>
                      {chickenOverview.productionStats.bestDay.eggs} eieren
                    </Text>
                    <Text style={styles.bestDayDate}>
                      {new Date(
                        chickenOverview.productionStats.bestDay.date
                      ).toLocaleDateString("nl-NL")}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Voer Verbruik</Title>
                <View style={styles.feedStats}>
                  <View style={styles.feedItem}>
                    <IconButton
                      icon="food-apple"
                      size={24}
                      iconColor="#2E7D32"
                    />
                    <View style={styles.feedInfo}>
                      <Text style={styles.feedLabel}>Dagelijks</Text>
                      <Text style={styles.feedValue}>
                        {chickenOverview.feedConsumption.daily} kg
                      </Text>
                    </View>
                  </View>
                  <View style={styles.feedItem}>
                    <IconButton
                      icon="calendar-week"
                      size={24}
                      iconColor="#2E7D32"
                    />
                    <View style={styles.feedInfo}>
                      <Text style={styles.feedLabel}>Wekelijks</Text>
                      <Text style={styles.feedValue}>
                        {chickenOverview.feedConsumption.weekly} kg
                      </Text>
                    </View>
                  </View>
                  <View style={styles.feedItem}>
                    <IconButton
                      icon="currency-eur"
                      size={24}
                      iconColor="#2E7D32"
                    />
                    <View style={styles.feedInfo}>
                      <Text style={styles.feedLabel}>Kosten per Dag</Text>
                      <Text style={styles.feedValue}>
                        €{chickenOverview.feedConsumption.costPerDay.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>

                <Divider style={styles.statsDivider} />

                <View style={styles.efficiencyCard}>
                  <Text style={styles.efficiencyLabel}>
                    Voer Efficiëntie (per kip per dag)
                  </Text>
                  <Text style={styles.efficiencyValue}>
                    {(
                      (chickenOverview.feedConsumption.daily /
                        chickenOverview.activeChickens) *
                      1000
                    ).toFixed(0)}
                    g
                  </Text>
                  <Chip icon="check" style={styles.efficiencyChip}>
                    Binnen Norm (100-125g)
                  </Chip>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Snelle Acties</Title>
                <Button
                  mode="contained"
                  icon="barn"
                  onPress={() => navigation.navigate("Settings")}
                  style={styles.quickActionButton}
                  buttonColor="#2E7D32"
                >
                  Stallen Beheren
                </Button>
                <Button
                  mode="outlined"
                  icon="plus"
                  onPress={() => navigation.navigate("Input")}
                  style={styles.quickActionButton}
                >
                  Dagelijkse Data Invoeren
                </Button>
                <Button
                  mode="outlined"
                  icon="food-apple"
                  onPress={() => navigation.navigate("Feed")}
                  style={styles.quickActionButton}
                >
                  Voer Beheer
                </Button>
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>

      {/* Edit Personal Dialog */}
      <Portal>
        <Dialog
          visible={editPersonalDialogVisible}
          onDismiss={() => setEditPersonalDialogVisible(false)}
        >
          <Dialog.Title>Persoonlijke Gegevens Bewerken</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={styles.dialogScroll}>
              <TextInput
                label="Naam"
                value={editedPersonal.name}
                onChangeText={(text) =>
                  setEditedPersonal({ ...editedPersonal, name: text })
                }
                style={styles.dialogInput}
                left={<TextInput.Icon icon="account" />}
              />
              <TextInput
                label="E-mail"
                value={editedPersonal.email}
                onChangeText={(text) =>
                  setEditedPersonal({ ...editedPersonal, email: text })
                }
                style={styles.dialogInput}
                left={<TextInput.Icon icon="email" />}
              />
              <TextInput
                label="Telefoon"
                value={editedPersonal.phone}
                onChangeText={(text) =>
                  setEditedPersonal({ ...editedPersonal, phone: text })
                }
                style={styles.dialogInput}
                left={<TextInput.Icon icon="phone" />}
              />
              <TextInput
                label="Adres"
                value={editedPersonal.address}
                onChangeText={(text) =>
                  setEditedPersonal({ ...editedPersonal, address: text })
                }
                style={styles.dialogInput}
                left={<TextInput.Icon icon="map-marker" />}
              />
              <TextInput
                label="Stad"
                value={editedPersonal.city}
                onChangeText={(text) =>
                  setEditedPersonal({ ...editedPersonal, city: text })
                }
                style={styles.dialogInput}
                left={<TextInput.Icon icon="city" />}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setEditPersonalDialogVisible(false)}>
              Annuleren
            </Button>
            <Button onPress={savePersonalInfo}>Opslaan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Business Dialog */}
      <Portal>
        <Dialog
          visible={editBusinessDialogVisible}
          onDismiss={() => setEditBusinessDialogVisible(false)}
        >
          <Dialog.Title>Bedrijfsgegevens Bewerken</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={styles.dialogScroll}>
              <TextInput
                label="Bedrijfsnaam"
                value={editedBusiness.businessName}
                onChangeText={(text) =>
                  setEditedBusiness({ ...editedBusiness, businessName: text })
                }
                style={styles.dialogInput}
                left={<TextInput.Icon icon="domain" />}
              />
              <TextInput
                label="KVK Nummer"
                value={editedBusiness.kvkNumber}
                onChangeText={(text) =>
                  setEditedBusiness({ ...editedBusiness, kvkNumber: text })
                }
                style={styles.dialogInput}
                left={<TextInput.Icon icon="file-document" />}
              />
              <TextInput
                label="BTW Nummer"
                value={editedBusiness.btwNumber}
                onChangeText={(text) =>
                  setEditedBusiness({ ...editedBusiness, btwNumber: text })
                }
                style={styles.dialogInput}
                left={<TextInput.Icon icon="receipt" />}
              />
              <TextInput
                label="Vestigingsadres"
                value={editedBusiness.businessAddress}
                onChangeText={(text) =>
                  setEditedBusiness({
                    ...editedBusiness,
                    businessAddress: text,
                  })
                }
                style={styles.dialogInput}
                left={<TextInput.Icon icon="map-marker" />}
              />
              <TextInput
                label="Stad"
                value={editedBusiness.businessCity}
                onChangeText={(text) =>
                  setEditedBusiness({ ...editedBusiness, businessCity: text })
                }
                style={styles.dialogInput}
                left={<TextInput.Icon icon="city" />}
              />
              <TextInput
                label="Telefoon"
                value={editedBusiness.businessPhone}
                onChangeText={(text) =>
                  setEditedBusiness({ ...editedBusiness, businessPhone: text })
                }
                style={styles.dialogInput}
                left={<TextInput.Icon icon="phone" />}
              />
              <TextInput
                label="E-mail"
                value={editedBusiness.businessEmail}
                onChangeText={(text) =>
                  setEditedBusiness({ ...editedBusiness, businessEmail: text })
                }
                style={styles.dialogInput}
                left={<TextInput.Icon icon="email" />}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setEditBusinessDialogVisible(false)}>
              Annuleren
            </Button>
            <Button onPress={saveBusinessInfo}>Opslaan</Button>
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
  content: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: "#2E7D32",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    margin: 0,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    color: "#2E7D32",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  memberChip: {
    alignSelf: "flex-start",
    height: 28,
    backgroundColor: "#E8F5E9",
  },
  quickStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 16,
  },
  quickStat: {
    alignItems: "center",
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  tabSelector: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    color: "#2E7D32",
    fontSize: 18,
  },
  securityButton: {
    marginBottom: 8,
  },
  activityStats: {
    gap: 12,
    marginTop: 8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 2,
  },
  activityLabel: {
    fontSize: 13,
    color: "#666",
  },
  performanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  performanceCard: {
    width: "48%",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 8,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: -8,
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  certificationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  certChip: {
    backgroundColor: "#E8F5E9",
  },
  docButton: {
    marginBottom: 8,
  },
  chickenSummary: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  chickenSummaryItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 8,
  },
  chickenSummaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  chickenSummaryLabel: {
    fontSize: 11,
    color: "#666",
  },
  breedItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  breedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  breedName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  breedChip: {
    height: 24,
    backgroundColor: "#E8F5E9",
  },
  breedStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  breedCount: {
    fontSize: 14,
    color: "#666",
  },
  breedPercentage: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  breedProgress: {
    height: 8,
    borderRadius: 4,
  },
  healthGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  healthItem: {
    alignItems: "center",
  },
  healthCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  healthPercentage: {
    fontSize: 24,
    fontWeight: "bold",
  },
  healthLabel: {
    fontSize: 13,
    color: "#666",
  },
  productionStats: {
    gap: 12,
    marginTop: 8,
  },
  productionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  productionLabel: {
    fontSize: 14,
    color: "#666",
  },
  productionValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  statsDivider: {
    marginVertical: 16,
  },
  bestDayCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF9E6",
    borderRadius: 8,
  },
  bestDayInfo: {
    flex: 1,
  },
  bestDayLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  bestDayValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 2,
  },
  bestDayDate: {
    fontSize: 12,
    color: "#999",
  },
  feedStats: {
    gap: 12,
    marginTop: 8,
  },
  feedItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  feedInfo: {
    flex: 1,
  },
  feedLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  feedValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  efficiencyCard: {
    padding: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    alignItems: "center",
  },
  efficiencyLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  efficiencyValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  efficiencyChip: {
    backgroundColor: "#4CAF50",
  },
  quickActionButton: {
    marginBottom: 8,
  },
  dialogScroll: {
    maxHeight: 400,
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: "white",
  },
});
