<<<<<<< HEAD
# Mukaan-React-native-App-
=======
# Mukaan App

Eine moderne React Native App für die WordPress-Seite mukaan.de mit dunklem Design und gelben Akzenten.

## Features

- **Dunkles Design** mit gelben Akzenten (#FFD700)
- **Tab-Navigation** mit 6 Tabs: Startseite, Angebote, Tipps, PC, Apps, Suche
- **Startseite** mit aktuellen Beiträgen, Social-Media-Links und KabelKraft-Banner
- **Kategorien** mit Pull-to-Refresh und Infinite Scroll
- **Suchfunktion** für Beiträge
- **Detailansicht** mit HTML-Rendering, Share-Funktion und verwandten Beiträgen
- **Responsive Design** für verschiedene Bildschirmgrößen

## Technologien

- React Native mit Expo
- React Navigation (Stack & Bottom Tabs)
- react-native-render-html für HTML-Inhalte
- expo-blur für Blur-Effekte
- WordPress REST API Integration

## Installation

1. Stelle sicher, dass Node.js und npm installiert sind
2. Installiere Expo CLI: `npm install -g @expo/cli`
3. Klone das Repository
4. Installiere Dependencies: `npm install`
5. Starte die App: `npm start`

## Projektstruktur

```
src/
├── api/
│   └── wordpress.js          # WordPress API Integration
├── components/
│   ├── PostCard.js           # Beitrag-Karte Komponente
│   ├── SearchBar.js          # Suchleiste
│   └── RelatedPosts.js       # Verwandte Beiträge
├── navigation/
│   └── Tabs.js               # Tab-Navigation
└── screens/
    ├── HomeScreen.js         # Startseite
    ├── CategoryScreen.js     # Kategorie-Beiträge
    ├── SearchScreen.js       # Suchfunktion
    └── PostScreen.js         # Beitrag-Detailansicht
```

## API Integration

Die App nutzt die WordPress REST API von mukaan.de:
- Endpoint: `https://mukaan.de/wp-json/wp/v2`
- Unterstützt: Beiträge, Kategorien, Suche, verwandte Beiträge

## Design System

- **Hintergrund**: #000000 (Schwarz)
- **Karten**: #1a1a1a (Dunkelgrau)
- **Akzente**: #FFD700 (Gold)
- **Text**: #ffffff (Weiß), #cccccc (Hellgrau), #888888 (Grau)

## Features im Detail

### Startseite
- Header mit App-Titel
- Social-Media-Links (YouTube, Instagram, TikTok)
- KabelKraft-Banner mit Link
- Aktuelle Beiträge mit Pull-to-Refresh

### Kategorien
- Automatisches Laden von Kategorie-Beiträgen
- Pull-to-Refresh
- Infinite Scroll für weitere Beiträge
- Loading-States

### Suche
- Echtzeit-Suche in Beiträgen
- Clear-Funktion
- Leere Zustände für bessere UX

### Detailansicht
- Vollständiger Artikel mit HTML-Rendering
- Share-Funktion
- "Im Browser öffnen" Option
- Verwandte Beiträge
- Kategorie-Tags

## Entwicklung

### Starten der App
```bash
npm start
```

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web
```bash
npm run web
```

## Lizenz

Dieses Projekt ist für die Mukaan-Community entwickelt. 
>>>>>>> 823cda9 (Initialer Commit)
