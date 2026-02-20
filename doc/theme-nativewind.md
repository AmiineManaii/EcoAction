# 🎨 Thème & NativeWind

## Le système de thème (`src/theme/`)

### `colors.ts` — La palette de base (mode clair)

```ts
export const colors = {
  primary: '#2D6A4F',     // vert foncé — boutons principaux
  primaryLight: '#52B788', // vert clair — accents
  secondary: '#40916C',   // vert moyen — éléments secondaires
  danger: '#DC2626',      // rouge — erreurs, suppression
  background: '#F0F7F4',  // fond général
  card: '#FFFFFF',        // fond des cartes
  border: '#D8EDE4',      // bordures
  mutedText: '#6B8F7A',   // texte secondaire (gris-vert)
  text: '#1A2E25',        // texte principal
};
```

### `theme.tsx` — Le contexte de thème

```ts
const darkColors = {
  primary: '#52B788',     // plus clair pour contraster sur fond sombre
  background: '#0D1F17',  // fond très sombre
  card: '#1A3027',        // cartes légèrement plus claires
  ...
};
```

```tsx
function ThemeProvider({ children }) {
  const deviceScheme = useColorScheme(); // détecte le thème système
  const [mode, setMode] = useState(() => resolveInitialMode(deviceScheme));

  const value = useMemo(() => ({
    theme: {
      mode,
      colors: mode === 'dark' ? darkColors : lightColors,
    },
    toggleTheme: () => setMode((c) => c === 'light' ? 'dark' : 'light'),
  }), [mode]);
}
```

---

## NativeWind v2 — Tailwind CSS pour React Native

### Version utilisée

```
nativewind          : ^2.0.11  ✅ (stable sur Windows + Expo SDK 54)
tailwindcss         : ^3.3.2
```

> ⚠️ NativeWind **v4** cause des erreurs de résolution CSS sur Windows.
> Utiliser toujours la **v2** avec Expo.

---

### Installation

```bash
npm install nativewind@^2.0.11
npm install --save-dev tailwindcss@^3.3.2
```

---

### Configuration — `tailwind.config.js` (racine)

```js
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

---

### Configuration — `babel.config.js` (racine)

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],  // ← NativeWind v2 : plugin, pas preset
  };
};
```

> ⚠️ NativeWind v4 utilisait `presets`. La v2 utilise `plugins`.  
> Ne pas confondre les deux configurations.

---

### Fichier de types TypeScript — `nativewind-env.d.ts` (racine)

```ts
/// <reference types="nativewind/types" />
```

Ce fichier ajoute la prop `className` aux composants React Native dans TypeScript.  
Sans lui, VS Code affiche des erreurs rouges sous `className` même si l'app fonctionne.

**Il ne supprime PAS les autres vérifications TypeScript** — les vraies erreurs de syntaxe et de types continuent d'apparaître normalement.

### `tsconfig.json` — s'assurer que le fichier est inclus

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.d.ts",
    "nativewind-env.d.ts"
  ]
}
```

---

### Fichiers NON nécessaires avec NativeWind v2

```
❌ global.css       → uniquement requis par NativeWind v4
❌ metro.config.js  → uniquement requis par NativeWind v4
```

---

## Utilisation de NativeWind dans les composants

### Classes communes

```tsx
// Flex et layout
<View className="flex-1 flex-row items-center justify-between gap-2" />

// Padding et margin
<View className="p-4 px-3 py-2 m-2 mb-4 mx-4" />

// Bordures et arrondi
<View className="rounded-2xl rounded-full" />

// Texte
<Text className="text-base font-bold text-center" />

// Position absolue
<View className="absolute top-4 right-4" />
```

### Combiner NativeWind et styles dynamiques

NativeWind gère les classes **statiques**.  
Pour les valeurs **dynamiques** (couleurs du thème, largeur en %), on utilise `style` :

```tsx
<View
  className="rounded-full overflow-hidden h-1.5"      // ← NativeWind (statique)
  style={{ backgroundColor: theme.colors.border }}    // ← style dynamique
>
  <View
    style={{
      width: `${fillPercent}%`,                        // ← valeur calculée
      backgroundColor: theme.colors.primary,
    }}
  />
</View>
```

---

## `@expo/vector-icons` — Icônes Ionicons

Inclus dans Expo, aucune installation nécessaire.

```tsx
import { Ionicons } from '@expo/vector-icons';

<Ionicons name="search-outline" size={20} color={theme.colors.primary} />
```

### Icônes utilisées dans EcoAction

| Usage | Icône |
|---|---|
| Onglet Explorer | `search-outline` |
| Onglet Mes missions | `checkmark-circle-outline` |
| Onglet Profil | `person-outline` |
| Localisation | `location-outline` |
| Durée | `time-outline` |
| Date | `calendar-outline` |
| Participants | `people-outline` |
| Retour | `arrow-back` |
| Modifier | `pencil-outline` |
| Supprimer | `trash-outline` |
| Plantation | `leaf-outline` |
| Nettoyage | `water-outline` |
| Zéro déchet | `refresh-outline` |
| Sensibilisation | `megaphone-outline` |
| Jardinage | `flower-outline` |
| Collecte | `trash-outline` |