# 🥚 EggSense Frontend

> **Professioneel Kippenstal Management Systeem**  
> Een moderne React Native/Expo mobiele applicatie voor het beheren van pluimveebedrijven.

---

## 📋 Inhoudsopgave

- [Overzicht](#overzicht)
- [Opdrachtvereisten Status](#opdrachtvereisten-status)
- [Technische Stack](#technische-stack)
- [Projectstructuur](#projectstructuur)
- [Functionaliteiten](#functionaliteiten)
- [Services (API Integratie)](#services-api-integratie)
- [Installatie & Setup](#installatie--setup)
- [Bibliografie](#bibliografie)

---

## 🎯 Overzicht

EggSense is een complete oplossing voor het digitaliseren van pluimveebedrijven. De app vervangt tijdrovende papieren administratie met een gebruiksvriendelijke mobiele interface die altijd en overal toegankelijk is.

### Kernwaarden
- ✅ Dagelijkse invoer in minder dan 2 minuten
- ✅ Automatische berekening van productiepercentages
- ✅ Volledige voorraad- en klantenadministratie
- ✅ Inzicht in kosten, opbrengsten en winstmarges
- ✅ Beheer meerdere stallen vanuit één app
- ✅ **Dark Mode ondersteuning** (volledig geïntegreerd + persistent)
- ✅ **Persistente gebruikersinstellingen** (AsyncStorage)

---

## 📚 Opdrachtvereisten Status (Cross-Platform Development)

> **Academiejaar 2025-2026 | Deadline: 21 december**

### ✅ VOLLEDIG GEÏMPLEMENTEERD

| Vereiste | Status | Implementatie |
|----------|--------|---------------|
| **Foutloos werkende app op Android, iOS, Browser** | ✅ | Expo cross-platform |
| **Overzichtspagina met zoekfunctie** | ✅ | `SalesScreen` (zoek op klant), `CustomersListScreen` (zoek op naam) |
| **Detailpagina** | ✅ | `CustomerDetailScreen`, `OrderDetailScreen` |
| **Gelinkt scherm** | ✅ | `CustomerDetailScreen` → toont orders van klant |
| **Instellingenpagina** | ✅ | `SettingsScreen` met 3 tabs |
| **Profielpagina** | ✅ | `ProfileScreen` |
| **Aanmeldscherm** | ✅ | `LoginScreen` |
| **Aanmeldscherm NIET eerste scherm** | ✅ | `WelcomeScreen` is eerste scherm |
| **Zaken zichtbaar voor niet-aangemelde gebruikers** | ✅ | `WelcomeScreen` toont eierprijzen en features |
| **Afgeschermde zaken na login** | ✅ | Hele MainTabs + alle Stack screens |
| **Twee soorten navigatie** | ✅ | Bottom Tab Navigator + Stack Navigator |
| **FlatList/SectionList/View componenten** | ✅ | FlatList: 3 schermen, SectionList: `SalesScreen` |
| **Styling op headers/tabs** | ✅ | Custom styling via `ThemeContext` |
| **Lichte en donkere modus** | ✅ | `ThemeContext` met AsyncStorage persistentie |
| **Minstens 3 instellingen** | ✅ | Dark mode, Default Stal, Low Stock Alert threshold |
| **Instellingen op instellingenpagina** | ✅ | Alle 3 instellingen bewerkbaar |
| **Gegevens ophalen uit externe API** | ✅ | Spring Boot backend via Axios |
| **Gegevens terugsturen naar API** | ✅ | CRUD operaties voor stallen, klanten, orders, productie |
| **Veilige authenticatie** | ✅ | JWT tokens + refresh tokens via AsyncStorage |
| **Foutafhandeling** | ✅ | Try-catch in alle services, 401/403 auto-logout |
| **Instellingen persistent opgeslagen** | ✅ | Via AsyncStorage (**BONUS!**) |
| **Toegankelijkheid** | ✅ | `accessibilityLabel` op 23+ interactieve elementen |
| **Mockups PDF** | ✅ | Ingediend op 31 oktober |

---

### ❌ NOG TE DOEN

| Vereiste | Status | Prioriteit |
|----------|--------|------------|
| **Demofilmpje** | ❌ | **KRITIEK** - `wout_devriese_eggsense.mp4` |

---

### 📊 Schermen Overzicht

| Scherm | Type | Beschrijving |
|--------|------|--------------|
| `WelcomeScreen.js` | Stack | Marketing landingspagina met eierprijzen |
| `LoginScreen.js` | Stack | Login formulier |
| `DashboardScreen.js` | Tab | Hoofddashboard met statistieken |
| `SalesScreen.js` | Tab | Verkoop overzicht met SectionList |
| `CustomersListScreen.js` | Tab | Klantenlijst met FlatList + zoekfunctie |
| `ProfileScreen.js` | Tab | Gebruikersprofiel |
| `SettingsScreen.js` | Stack | App instellingen (3 tabs) |
| `DailyInputScreen.js` | Stack | Dagelijkse productie invoer |
| `ReportsScreen.js` | Stack | Rapporten & analyses |
| `FeedDeliveryScreen.js` | Stack | Voerleveringen beheer |
| `CustomerDetailScreen.js` | Stack | Klant details + ordergeschiedenis |
| `OrderDetailScreen.js` | Stack | Order details |

---

### ⚙️ Instellingen (3 vereist - 3 geïmplementeerd)

| Instelling | Type | Default | Persistent | Bestand |
|------------|------|---------|------------|---------|
| **1. Dark/Light Mode** | Toggle | Light | ✅ AsyncStorage | `ThemeContext.js` |
| **2. Default Stal** | Picker | null | ✅ AsyncStorage | `SettingsContext.js` |
| **3. Low Stock Alert (dagen)** | Picker | 7 | ✅ AsyncStorage | `SettingsContext.js` |

---

## 🛠 Technische Stack

| Technologie | Versie | Doel |
|-------------|--------|------|
| **React Native** | 0.81.5 | Cross-platform mobiele ontwikkeling |
| **Expo** | ~54.0.0 | Development framework & build tools |
| **React** | 19.1.0 | UI componenten |
| **React Navigation** | ^6.x | Navigatie (Stack & Bottom Tabs) |
| **React Native Paper** | ^5.0.0 | Material Design 3 UI componenten |
| **Axios** | ^1.6.0 | HTTP client voor API calls |
| **AsyncStorage** | 2.2.0 | Lokale data opslag |

---

## 📁 Projectstructuur

```
eggSense_frontend/
├── App.js                      # Hoofdcomponent met navigatie setup
├── app.json                    # Expo configuratie
├── package.json                # Dependencies
└── src/
    ├── context/                # React Context providers
    │   ├── ThemeContext.js     # Dark/Light mode + persistentie
    │   └── SettingsContext.js  # 3 app-brede instellingen
    ├── screens/                # Alle app schermen (12 bestanden)
    └── services/               # API service modules (7 bestanden)
        ├── api.js              # Axios instance & interceptors
        ├── authService.js      # Authenticatie
        ├── customerService.js  # Klantenbeheer
        ├── feedService.js      # Voerleveringen
        ├── productionService.js # Productie data
        ├── salesService.js     # Verkoop orders
        └── stallService.js     # Stallen beheer
```

---

## 🚀 Installatie & Setup

### Vereisten
- Node.js 18+
- npm of yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator / Expo Go app

### Stappen

```bash
# 1. Navigeer naar frontend directory
cd eggSense_frontend

# 2. Installeer dependencies
npm install

# 3. Configureer API URL in src/services/api.js

# 4. Start de development server
npm start
```

---

## 📚 Bibliografie

> **Bronvermelding conform opdrachtvereisten Cross-Platform Development**

### Frameworks & Core Libraries

| Bron | Versie | Gebruik in App | URL |
|------|--------|----------------|-----|
| **React Native** | 0.81.5 | Core framework voor cross-platform development | https://reactnative.dev/ |
| **Expo** | ~54.0.0 | Development platform, build tools, Expo Go | https://expo.dev/ |
| **React** | 19.1.0 | Component-based UI framework | https://react.dev/ |

### Navigatie

| Bron | Versie | Gebruik in App | URL |
|------|--------|----------------|-----|
| **@react-navigation/native** | ^6.x | NavigationContainer, navigatie hooks | https://reactnavigation.org/ |
| **@react-navigation/stack** | ^6.x | Stack Navigator voor scherm transities | https://reactnavigation.org/docs/stack-navigator/ |
| **@react-navigation/bottom-tabs** | ^6.x | Bottom Tab Navigator voor hoofdnavigatie | https://reactnavigation.org/docs/bottom-tab-navigator/ |

### UI Componenten

| Bron | Versie | Gebruik in App | URL |
|------|--------|----------------|-----|
| **React Native Paper** | ^5.0.0 | Material Design 3 componenten (Card, Button, Dialog, TextInput, Chip, IconButton, SegmentedButtons, DataTable) | https://callstack.github.io/react-native-paper/ |
| **react-native-vector-icons** | - | MaterialCommunityIcons voor alle app iconen | https://github.com/oblador/react-native-vector-icons |

### Data & Storage

| Bron | Versie | Gebruik in App | URL |
|------|--------|----------------|-----|
| **Axios** | ^1.6.0 | HTTP client voor REST API communicatie, request/response interceptors | https://axios-http.com/ |
| **@react-native-async-storage/async-storage** | 2.2.0 | Lokale opslag van JWT tokens, thema voorkeuren, instellingen | https://react-native-async-storage.github.io/async-storage/ |

### Platform & Layout

| Bron | Versie | Gebruik in App | URL |
|------|--------|----------------|-----|
| **react-native-safe-area-context** | ~5.6.0 | Safe area insets voor notches en statusbars | https://github.com/th3rdwave/react-native-safe-area-context |
| **react-native-screens** | ~4.16.0 | Native screen containers voor betere performance | https://github.com/software-mansion/react-native-screens |
| **react-native-gesture-handler** | ~2.28.0 | Touch gestures en swipe handlers | https://docs.swmansion.com/react-native-gesture-handler/ |
| **react-native-web** | ^0.21.0 | Web platform ondersteuning | https://necolas.github.io/react-native-web/ |

### Documentatie Referenties

| Bron | Onderwerp | URL |
|------|-----------|-----|
| React Native Docs | FlatList, SectionList, View, ScrollView, Alert, RefreshControl | https://reactnative.dev/docs/components-and-apis |
| Expo Docs | Configuratie, Build, Publicatie | https://docs.expo.dev/ |
| React Navigation Docs | Tab en Stack navigatie patronen | https://reactnavigation.org/docs/getting-started |
| React Native Paper Theming | MD3 Light/Dark theme configuratie | https://callstack.github.io/react-native-paper/docs/guides/theming |

### Design Resources

| Bron | Gebruik | URL |
|------|---------|-----|
| Material Design 3 | Design system, kleurenpalet, typografie | https://m3.material.io/ |
| Material Community Icons | App iconen (egg, cart, account, chart-line, etc.) | https://materialdesignicons.com/ |

### AI-Assistentie

| Tool | Gebruik |
|------|---------|
| **Claude (Anthropic)** | Code assistentie, debugging, refactoring, documentatie |
