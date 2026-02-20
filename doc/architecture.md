# 🏗️ Architecture du projet EcoAction

## Vue d'ensemble

EcoAction suit une architecture **en couches** claire, séparant les responsabilités :

```
┌─────────────────────────────┐
│         Écrans (app/)       │  ← Ce que l'utilisateur voit
├─────────────────────────────┤
│     Hooks (src/hooks/)      │  ← Logique métier + gestion d'état
├─────────────────────────────┤
│       API (src/api/)        │  ← Communication avec le serveur
├─────────────────────────────┤
│     JSON Server (db.json)   │  ← Base de données mock
└─────────────────────────────┘
```

---

## 1. La navigation — Expo Router

Expo Router fonctionne comme Next.js : **le nom du fichier = l'URL**.

```
app/
├── _layout.tsx          → Route "/"      (racine)
├── (tabs)/
│   ├── _layout.tsx      → Route "/(tabs)"  (onglets)
│   ├── index.tsx        → Route "/(tabs)/" (page Explorer)
│   └── mission-detail   → Route "/(tabs)/mission-detail"
└── auth/
    ├── login.tsx        → Route "/auth/login"
    └── signup.tsx       → Route "/auth/signup"
```

Les parenthèses `(tabs)` sont un **groupe de routes** : elles n'apparaissent pas dans l'URL mais organisent les fichiers.

---

## 2. Le flux de données

```
JSON Server (port 3001)
      ↓  HTTP fetch
src/api/client.ts          ← wrapper fetch générique
      ↓
src/api/missions.ts        ← fonctions : getMissions(), createMission()…
      ↓
src/hooks/useMissions.ts   ← hooks React Query : useQuery, useMutation
      ↓
app/(tabs)/index.tsx       ← composant React qui affiche les données
```

---

## 3. Les Providers (fournisseurs de contexte)

Dans `app/_layout.tsx`, plusieurs providers enveloppent toute l'application :

```tsx
<SafeAreaProvider>           ← gère les zones sûres (notch, barre du bas)
  <QueryClientProvider>      ← fournit TanStack Query à tous les composants
    <ThemeProvider>          ← fournit le thème (light/dark)
      <AuthProvider>         ← fournit la session utilisateur
        <ToastProvider>      ← fournit les notifications
          <Stack>            ← navigation
```

Chaque provider utilise le pattern **React Context** : il partage des données avec tous ses enfants sans avoir à les passer manuellement de composant en composant (on appelle ça "prop drilling").

---

## 4. TanStack Query — gestion du cache

TanStack Query est le cœur de la gestion des données :

| Concept | Explication |
|---|---|
| `queryKey` | Identifiant unique de la donnée en cache (ex: `['missions']`) |
| `staleTime: 60 000` | La donnée est "fraîche" 1 minute — pas de refetch pendant ce délai |
| `gcTime: 300 000` | La donnée reste 5 min en cache même si plus aucun composant ne l'utilise |
| `useQuery` | Lit des données (GET) |
| `useMutation` | Modifie des données (POST, PATCH, DELETE) |
| `invalidateQueries` | Force un rechargement du cache après une mutation |

---

## 5. Optimistic UI — l'inscription instantanée

Sans Optimistic UI :
1. Utilisateur clique "S'inscrire"
2. Requête envoyée au serveur
3. **Attente…** (l'utilisateur voit un spinner)
4. Réponse reçue → UI mise à jour

Avec Optimistic UI (`useToggleParticipation`) :
1. Utilisateur clique "S'inscrire"
2. **UI mise à jour immédiatement** (optimisme : on suppose que ça va marcher)
3. Requête envoyée en arrière-plan
4. Si ✅ succès → on confirme
5. Si ❌ erreur → on **rollback** (on restaure l'état précédent)

---

## 6. Authentification

La session est stockée dans **AsyncStorage** (équivalent de localStorage sur mobile).

Au démarrage de l'app :
1. On lit AsyncStorage → si une session existe, on la restaure
2. Le `AuthProvider` met à jour `isAuthenticated`
3. Le layout des onglets redirige vers `/auth/login` si non authentifié

---

## 7. Thème Light / Dark

Le `ThemeProvider` détecte automatiquement le thème du système (`useColorScheme`).  
L'utilisateur peut basculer manuellement depuis son profil.  
Deux palettes de couleurs sont définies dans `theme.tsx` : `lightColors` et `darkColors`.
