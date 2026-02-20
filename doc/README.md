# 🌿 EcoAction — Plateforme de Bénévolat Environnemental

Application mobile React Native permettant aux citoyens de découvrir, s'inscrire et gérer des missions de bénévolat environnemental (nettoyage, plantation d'arbres, ateliers zéro déchet…).

---

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le backend JSON Server
npx json-server --watch db.json --port 3001

# 3. Lancer l'application Expo
npx expo start
```

> ⚠️ Mettez à jour l'IP dans `src/api/client.ts` pour qu'elle corresponde à votre machine locale.

---

## 📦 Stack technique

| Couche | Technologie |
|---|---|
| Framework mobile | React Native + Expo SDK |
| Navigation | Expo Router (file-based) |
| Langage | TypeScript strict |
| Gestion des données | TanStack Query v5 |
| Styling | NativeWind (Tailwind CSS) |
| Icônes | @expo/vector-icons (Ionicons) |
| Backend (mock) | JSON Server |
| Persistance session | AsyncStorage |

---

## 📁 Structure du projet

```
├── app/                        ← Écrans (Expo Router)
│   ├── _layout.tsx             ← Layout racine (providers)
│   ├── (tabs)/
│   │   ├── _layout.tsx         ← Layout onglets
│   │   ├── index.tsx           ← Explorer les missions
│   │   ├── my-missions.tsx     ← Mes missions
│   │   ├── mission-detail.tsx  ← Détail d'une mission
│   │   ├── mission-edit.tsx    ← Modifier une mission
│   │   ├── new-mission.tsx     ← Créer une mission
│   │   └── profile.tsx         ← Profil utilisateur
│   └── auth/
│       ├── login.tsx           ← Connexion
│       └── signup.tsx          ← Inscription
│
├── src/
│   ├── api/                    ← Appels HTTP vers JSON Server
│   │   ├── client.ts           ← Fetch wrapper générique
│   │   ├── auth.ts             ← Login / Register
│   │   ├── missions.ts         ← CRUD missions
│   │   ├── users.ts            ← Lecture utilisateurs
│   │   ├── participantLogs.ts  ← Logs de participation
│   │   └── queryClient.ts      ← Configuration TanStack Query
│   ├── hooks/
│   │   ├── useAuth.tsx         ← Contexte d'authentification
│   │   └── useMissions.ts      ← Hooks React Query (+ Optimistic UI)
│   ├── components/
│   │   ├── MissionCard.tsx     ← Carte mission
│   │   ├── MissionForm.tsx     ← Formulaire mission
│   │   ├── Toast.tsx           ← Notifications
│   │   ├── Loader.tsx          ← Indicateur de chargement
│   │   ├── EmptyState.tsx      ← État vide
│   │   └── ErrorState.tsx      ← État d'erreur
│   ├── theme/
│   │   ├── colors.ts           ← Palette de couleurs
│   │   ├── theme.tsx           ← Contexte light/dark mode
│   │   ├── spacing.ts          ← Espacements
│   │   └── typography.ts       ← Typographies
│   └── utils/
│       └── permissions.ts      ← Logique d'autorisation
│
├── db.json                     ← Base de données JSON Server
├── tailwind.config.js          ← Config NativeWind
├── babel.config.js             ← Config Babel (NativeWind)
└── nativewind-env.d.ts         ← Types NativeWind
```

---

## 📖 Documentation détaillée

Consultez le dossier `doc/` pour une explication ligne par ligne de chaque fichier :

- [Architecture](./doc/architecture.md)
- [Couche API](./doc/api.md)
- [Authentification](./doc/auth.md)
- [Navigation](./doc/navigation.md)
- [Écrans](./doc/screens.md)
- [Composants](./doc/components.md)
- [Hooks & TanStack Query](./doc/hooks.md)
- [Thème & NativeWind](./doc/theme-nativewind.md)
- [Permissions](./doc/permissions.md)
- [Note Technique](./doc/note-technique.md)
