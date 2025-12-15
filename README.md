# 🥚 EggSense Frontend

> **Professioneel Kippenstal Management Systeem**  
> Een moderne React Native/Expo mobiele applicatie voor het beheren van pluimveebedrijven.

---

## 📋 Inhoudsopgave

- [Overzicht](#overzicht)
- [Technische Stack](#technische-stack)
- [Projectstructuur](#projectstructuur)
- [Functionaliteiten](#functionaliteiten)
  - [Authenticatie](#1-authenticatie)
  - [Dashboard](#2-dashboard)
  - [Dagelijkse Invoer](#3-dagelijkse-invoer)
  - [Verkoop Beheer](#4-verkoop-beheer)
  - [Klantenbeheer](#5-klantenbeheer)
  - [Rapporten & Analyses](#6-rapporten--analyses)
  - [Voerleveringen](#7-voerleveringen)
  - [Instellingen](#8-instellingen)
  - [Profiel](#9-profiel)
- [Services (API Integratie)](#services-api-integratie)
- [Installatie & Setup](#installatie--setup)
- [TODO's & Verbeterpunten](#todos--verbeterpunten)
- [Bekende Problemen](#bekende-problemen)

---

## 🎯 Overzicht

EggSense is een complete oplossing voor het digitaliseren van pluimveebedrijven. De app vervangt tijdrovende Excel-sheets en papieren administratie met een gebruiksvriendelijke mobiele interface die altijd en overal toegankelijk is.

### Kernwaarden
- ✅ Dagelijkse invoer in minder dan 2 minuten
- ✅ Automatische berekening van productiepercentages
- ✅ Volledige voorraad- en klantenadministratie
- ✅ Inzicht in kosten, opbrengsten en winstmarges
- ✅ Beheer meerdere stallen vanuit één app
- ✅ Data export voor accountant en administratie

---

## 🛠 Technische Stack

| Technologie | Versie | Doel |
|-------------|--------|------|
| **React Native** | 0.81.5 | Cross-platform mobiele ontwikkeling |
| **Expo** | ~54.0.0 | Development framework & build tools |
| **React** | 19.1.0 | UI componenten |
| **React Navigation** | ^6.x | Navigatie (Stack & Bottom Tabs) |
| **React Native Paper** | ^5.0.0 | Material Design UI componenten |
| **Axios** | ^1.6.0 | HTTP client voor API calls |
| **AsyncStorage** | 2.2.0 | Lokale data opslag |
| **Expo Secure Store** | ~15.0.7 | Veilige opslag voor tokens |

---

## 📁 Projectstructuur

```
eggSense_frontend/
├── App.js                      # Hoofdcomponent met navigatie setup
├── app.json                    # Expo configuratie
├── package.json                # Dependencies
├── index.js                    # App entry point
├── Dockerfile                  # Docker configuratie
├── assets/                     # Iconen en splash screens
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
└── src/
    ├── screens/                # Alle app schermen (11 bestanden)
    │   ├── WelcomeScreen.js
    │   ├── LoginScreen.js
    │   ├── DashboardScreen.js
    │   ├── SalesScreen.js
    │   ├── CustomerDetailScreen.js
    │   ├── OrderDetailScreen.js
    │   ├── ProfileScreen.js
    │   ├── SettingsScreen.js
    │   ├── DailyInputScreen.js
    │   ├── ReportsScreen.js
    │   └── FeedDeliveryScreen.js
    ├── services/               # API service modules (7 bestanden)
    │   ├── api.js              # Axios instance & interceptors
    │   ├── authService.js      # Authenticatie
    │   ├── customerService.js  # Klantenbeheer
    │   ├── feedService.js      # Voerleveringen
    │   ├── productionService.js # Productie data
    │   ├── salesService.js     # Verkoop orders
    │   └── stallService.js     # Stallen beheer
    └── types/
        └── index.js            # TypeScript-like type definities (JSDoc)
```

---

## ✨ Functionaliteiten

### 1. Authenticatie

**Status: ✅ Volledig werkend**

| Feature | Status | Beschrijving |
|---------|--------|--------------|
| Login scherm | ✅ | Gebruikersnaam/wachtwoord authenticatie |
| Token opslag | ✅ | JWT token opslag via AsyncStorage |
| Auto-logout | ✅ | Automatische logout bij 401/403 responses |
| Session check | ✅ | Periodieke authenticatie controle |
| Welcome pagina | ✅ | Landingspagina met feature showcase |

**Bestanden:**
- `src/screens/WelcomeScreen.js` - Marketing landingspagina
- `src/screens/LoginScreen.js` - Login formulier
- `src/services/authService.js` - Login/logout/checkAuth API calls

---

### 2. Dashboard

**Status: ✅ Volledig werkend**

| Feature | Status | Beschrijving |
|---------|--------|--------------|
| Stal selector | ✅ | Chip-based selectie bij meerdere stallen |
| Vandaag statistieken | ✅ | Eieren, voer, water, uitval |
| Week grafiek | ✅ | Staafdiagram met 7 dagen productie |
| Week statistieken | ✅ | Totaal eieren, gemiddelde, voer |
| Voervoorraad alert | ✅ | Waarschuwing bij lage voorraad |
| Snelle acties | ✅ | Navigatie naar belangrijke functies |
| Pull-to-refresh | ✅ | Ververs data door te swipen |

**Bestanden:**
- `src/screens/DashboardScreen.js` (873 regels)

---

### 3. Dagelijkse Invoer

**Status: ✅ Volledig werkend**

| Feature | Status | Beschrijving |
|---------|--------|--------------|
| Stal selectie | ✅ | Automatisch of handmatig selecteren |
| Eieren invoer | ✅ | Klein (S), Medium (M), Groot (L) |
| Verbruik invoer | ✅ | Voer (kg) en water (liter) |
| Uitval registratie | ✅ | Aantal gestorven kippen |
| Totaal berekening | ✅ | Real-time som van eieren |
| Datum weergave | ✅ | Huidige datum automatisch |

**Bestanden:**
- `src/screens/DailyInputScreen.js` (540 regels)
- `src/services/productionService.js`

---

### 4. Verkoop Beheer

**Status: ✅ Volledig werkend**

| Feature | Status | Beschrijving |
|---------|--------|--------------|
| Verkoop overzicht | ✅ | Lijst van alle orders |
| Zoekfunctie | ✅ | Zoeken op klant of order nummer |
| Status filter | ✅ | Filter: Alle/Pending/Bevestigd/Geleverd |
| Nieuwe verkoop | ✅ | Modal met klant selectie & eieren invoer |
| Nieuwe klant (inline) | ✅ | Direct klant aanmaken binnen verkoop flow |
| Status updates | ✅ | Bevestigen, Annuleren, Geleverd markeren |
| Order detail | ✅ | Volledige order informatie |
| Order bewerken | ✅ | Aanpassen van aantallen en prijs |
| Order verwijderen | ✅ | Met bevestigingsdialoog |

**Order Statussen:**
- 🟠 `PENDING` - In behandeling
- 🔵 `CONFIRMED` - Bevestigd
- 🟢 `DELIVERED` - Geleverd
- 🔴 `CANCELLED` - Geannuleerd

**Bestanden:**
- `src/screens/SalesScreen.js` (724 regels)
- `src/screens/OrderDetailScreen.js` (717 regels)
- `src/services/salesService.js`

---

### 5. Klantenbeheer

**Status: ✅ Volledig werkend**

| Feature | Status | Beschrijving |
|---------|--------|--------------|
| Klantenlijst | ✅ | Via Customers tab (hergebruikt CustomerDetailScreen) |
| Klant details | ✅ | Naam, email, telefoon, adres, notities |
| Klant statistieken | ✅ | Order count, totaal uitgegeven, gemiddelde |
| Order geschiedenis | ✅ | Alle orders van een klant |
| Klant bewerken | ✅ | Alle velden aanpasbaar |
| Klant verwijderen | ✅ | Met bevestigingsdialoog |

**Bestanden:**
- `src/screens/CustomerDetailScreen.js` (564 regels)
- `src/services/customerService.js`

---

### 6. Rapporten & Analyses

**Status: ⚠️ Grotendeels werkend**

| Feature | Status | Beschrijving |
|---------|--------|--------------|
| Periode selectie | ✅ | Week, Maand, Jaar |
| Productie overzicht | ✅ | Staafdiagram met target line |
| Ei distributie | ✅ | Klein/Medium/Groot verdeling |
| Financiële metrics | ✅ | Omzet, kosten, winst |
| Performance metrics | ✅ | Voerconversie, uitval, gemiddeld gewicht |
| Trend analyse | ✅ | Productie, efficiëntie, winst trends |
| Alerts & inzichten | ✅ | Automatische waarschuwingen |
| Export PDF | ⚠️ | Alleen mock/Alert - niet echt geïmplementeerd |
| Export Excel | ⚠️ | Alleen mock/Alert - niet echt geïmplementeerd |
| Delen (Email/WhatsApp) | ⚠️ | Alleen mock/Alert - niet echt geïmplementeerd |

**Bestanden:**
- `src/screens/ReportsScreen.js` (1759 regels - grootste scherm)

---

### 7. Voerleveringen

**Status: ✅ Volledig werkend**

| Feature | Status | Beschrijving |
|---------|--------|--------------|
| Leveringen overzicht | ✅ | Lijst per stal |
| Stal selector | ✅ | Wisselen tussen stallen |
| Voorraad overzicht | ✅ | Huidige voorraad, verbruik, dagen resterend |
| Nieuwe levering | ✅ | Leverancier, hoeveelheid, kosten |
| Pull-to-refresh | ✅ | Ververs data |

**Bestanden:**
- `src/screens/FeedDeliveryScreen.js` (437 regels)
- `src/services/feedService.js`

---

### 8. Instellingen

**Status: ✅ Volledig werkend**

| Feature | Status | Beschrijving |
|---------|--------|--------------|
| Categorie tabs | ✅ | Stallen, App, Account |
| **Stallen beheer** | | |
| └ Stallen overzicht | ✅ | Lijst met capaciteit en status |
| └ Nieuwe stal | ✅ | Naam, ras, capaciteit, initieel aantal |
| └ Stal bewerken | ✅ | Alle velden behalve huidig aantal |
| └ Stal verwijderen | ✅ | Met bevestigingsdialoog |
| └ Actief/inactief toggle | ✅ | Quick switch |
| **App info** | | |
| └ Versie info | ✅ | v1.0.0 |
| └ Privacy beleid | ✅ | Alert met placeholder tekst |
| └ Algemene voorwaarden | ✅ | Alert met placeholder tekst |
| └ Support contact | ✅ | Email en telefoon |
| **Account** | | |
| └ Gebruikersinfo | ✅ | Gebruikersnaam en rol |
| └ Uitloggen | ✅ | Met bevestigingsdialoog |

**Bestanden:**
- `src/screens/SettingsScreen.js` (764 regels)
- `src/services/stallService.js`

---

### 9. Profiel

**Status: ✅ Volledig werkend**

| Feature | Status | Beschrijving |
|---------|--------|--------------|
| Avatar | ✅ | Gebruiker icoon |
| Account info | ✅ | Gebruikersnaam en rol |
| Navigatie naar instellingen | ✅ | Link naar Settings scherm |
| Over EggSense | ✅ | Versie info popup |
| Privacy beleid | ✅ | Placeholder popup |
| Hulp & Support | ✅ | Contact informatie |
| Uitloggen | ✅ | Met bevestiging |

**Bestanden:**
- `src/screens/ProfileScreen.js` (262 regels)

---

## 🔌 Services (API Integratie)

### API Configuratie (`api.js`)

```javascript
// BELANGRIJK: Wijzig dit naar je eigen IP-adres
const API_BASE_URL = "http://192.168.0.202:8080/api";
```

| Feature | Beschrijving |
|---------|-------------|
| Base URL | Configureerbaar backend endpoint |
| Timeout | 10 seconden |
| Request interceptor | Voegt automatisch Bearer token toe |
| Response interceptor | Logout bij 401/403 errors |

### Service Overzicht

| Service | Endpoints | Functies |
|---------|-----------|----------|
| **authService** | `/auth/*` | login, logout, checkAuth |
| **stallService** | `/stalls/*` | listStalls, getStall, createStall, updateStall, deleteStall |
| **productionService** | `/daily-productions/*` | createDailyProduction, getDailyProduction, listForStall, getByDate |
| **salesService** | `/sales/*` | listOrders, getOrder, createOrder, updateOrder, updateStatus, deleteOrder |
| **customerService** | `/customers/*` | listCustomers, getCustomer, getCustomerOrders, getCustomerStatistics, createCustomer, updateCustomer, deleteCustomer |
| **feedService** | `/feed-deliveries/*` | create, list, getById, getInventory |

---

## 🚀 Installatie & Setup

### Vereisten
- Node.js 18+
- npm of yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) of Android Emulator of Expo Go app

### Stappen

```bash
# 1. Navigeer naar frontend directory
cd eggSense_frontend

# 2. Installeer dependencies
npm install

# 3. Configureer API URL
# Open src/services/api.js en wijzig API_BASE_URL naar je backend IP

# 4. Start de development server
npm start
# of
expo start

# 5. Open de app
# - Scan QR code met Expo Go (Android/iOS)
# - Druk op 'w' voor web browser
# - Druk op 'a' voor Android emulator
# - Druk op 'i' voor iOS simulator
```

### Scripts

| Script | Commando | Beschrijving |
|--------|----------|--------------|
| Start | `npm start` | Start Expo development server |
| Android | `npm run android` | Start op Android emulator |
| iOS | `npm run ios` | Start op iOS simulator |
| Web | `npm run web` | Start in web browser |

---

## 🔧 TODO's & Verbeterpunten

### Hoge Prioriteit 🔴

| Feature | Status | Beschrijving |
|---------|--------|--------------|
| Export functionaliteit | ❌ Niet geïmplementeerd | PDF en Excel export werkt niet echt |
| Delen functionaliteit | ❌ Niet geïmplementeerd | Email en WhatsApp delen is mock |
| Offline support | ❌ Niet geïmplementeerd | App werkt niet zonder internet |
| Push notificaties | ❌ Niet geïmplementeerd | Geen alerts bij lage voorraad etc. |

### Medium Prioriteit 🟠

| Feature | Status | Beschrijving |
|---------|--------|--------------|
| Wachtwoord vergeten | ❌ Niet geïmplementeerd | Geen reset mogelijkheid |
| Account registratie | ❌ Niet geïmplementeerd | Alleen via beheerder |
| Profielfoto | ❌ Niet geïmplementeerd | Alleen standaard icoon |
| Dark mode | ❌ Niet geïmplementeerd | Alleen light theme |
| Taal selectie | ❌ Niet geïmplementeerd | Alleen Nederlands |
| Facturatie/PDF generatie | ❌ Niet geïmplementeerd | Geen facturen |
| Barcode scanner | ❌ Niet geïmplementeerd | Voor producten/eieren |

### Lage Prioriteit 🟢

| Feature | Status | Beschrijving |
|---------|--------|--------------|
| Productie geschiedenis bewerken | ⚠️ Beperkt | Alleen laatste dag bewerkbaar |
| Grafieken interactief | ⚠️ Basis | Geen touch/zoom functionaliteit |
| Gezondheidsnotities | ⚠️ Veld bestaat | Nog niet zichtbaar in UI |
| Afgekeurde eieren | ⚠️ Veld bestaat | Minimaal gebruikt in UI |
| Privacy/Voorwaarden pagina's | ⚠️ Placeholder | Alleen alert popups |

### Code Verbeteringen 💻

| Improvement | Beschrijving |
|-------------|--------------|
| TypeScript migratie | Van JS naar TS voor betere type safety |
| State management | Redux/Zustand voor complexe state |
| Component library | Herbruikbare componenten extraheren |
| Unit tests | Jest/React Testing Library |
| E2E tests | Detox of Maestro |
| Error boundaries | Betere foutafhandeling |
| Loading skeletons | Betere UX tijdens laden |

---

## ⚠️ Bekende Problemen

### Web Platform Issues

1. **Pointer Events Bug**
   - Sommige elementen zijn niet klikbaar op web
   - **Workaround**: Er zit een MutationObserver fix in `App.js` die `pointer-events: none` overschrijft

2. **Styling Inconsistenties**
   - Sommige native styling werkt anders op web
   - Schaduw effecten kunnen afwijken

### API Configuratie

1. **Hardcoded IP**
   - `API_BASE_URL` moet handmatig aangepast worden
   - Overweeg environment variables of runtime configuratie

### Navigatie

1. **CustomersScreen Import**
   - `CustomersScreen` importeert `CustomerDetailScreen` - dit is mogelijk niet de bedoelde functionaliteit
   - Zou een aparte klantenlijst moeten zijn

---

## 📊 Statistieken

| Metric | Waarde |
|--------|--------|
| Totaal aantal schermen | 11 |
| Totaal aantal services | 7 |
| Grootste bestand | ReportsScreen.js (1759 regels) |
| Kleinste scherm | ProfileScreen.js (262 regels) |
| Totaal regels code (schermen) | ~5.800+ regels |
| Ondersteunde platforms | iOS, Android, Web |

---

## 📝 Versie Geschiedenis

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| 1.0.0 | December 2024 | Initiële release |

---

## 👥 Contact & Support

- **Email**: support@eggsense.com
- **Telefoon**: +32 123 45 67 89
- **Ontwikkelaar**: EggSense Solutions

---

*© 2024 EggSense Solutions - Alle rechten voorbehouden*
