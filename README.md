# EcoAction – Mini-projet React Native / Expo

## Objectif

Application mobile EcoAction permettant de découvrir, créer et gérer des missions de bénévolat environnemental, basée sur Expo, Expo Router, JSON Server et TanStack Query.

## Installation

```bash
cd ecoaction
npm install
```

## Lancement du backend JSON Server

```bash
npm run server
```

Par défaut, l’API est exposée sur `http://localhost:3001`. L’URL utilisée par l’application est lue depuis `EXPO_PUBLIC_API_URL` si définie, sinon `http://192.168.1.15:3001`.

Exemple pour un appareil physique sur le même réseau :

```bash
EXPO_PUBLIC_API_URL="http://192.168.1.15:3001" npx expo start
```

## Lancement de l’application

```bash
npm start
```

Puis choisir Android, iOS ou Web selon l’environnement.

## Navigation et écrans

- Expo Router avec `app/_layout.tsx` comme layout racine.
- Onglets `(tabs)` :
  - `app/(tabs)/index.tsx` : liste des missions EcoAction avec recherche et filtres.
  - `app/(tabs)/mission-detail.tsx` : détail d’une mission, inscription/désinscription, modification, suppression avec confirmation.
  - `app/(tabs)/new-mission.tsx` : création d’une mission (validation de base, bouton Annuler).
  - `app/(tabs)/mission-edit.tsx` : édition d’une mission existante (validation de base, bouton Annuler).
  - `app/(tabs)/profile.tsx` : écran de profil simulé avec accès à la page de connexion.
- Authentification simulée :
  - `app/auth/login.tsx` : écran de connexion simple (email/mot de passe) redirigeant vers les onglets.

## Données et API

- Backend mock : `db.json` servi par JSON Server.
- Couche API :
  - `src/api/client.ts` : wrapper HTTP générique.
  - `src/api/missions.ts` : types et appels CRUD pour les missions.
- Gestion des données :
  - `src/api/queryClient.ts` : configuration TanStack Query.
  - `src/hooks/useMissions.ts` : hooks `useMissions`, `useMission`, `useCreateMission`, `useUpdateMission`, `useDeleteMission`.

## Interface utilisateur

- Composants principaux :
  - `src/components/MissionCard.tsx` : carte de mission cliquable depuis la liste.
  - `src/components/MissionForm.tsx` : formulaire création/édition de mission.
  - `src/components/Loader.tsx`, `ErrorState.tsx`, `EmptyState.tsx` : composants d’état génériques.
- Thème :
  - `src/theme/colors.ts`, `src/theme/spacing.ts`, `src/theme/typography.ts`.

## Tests

Les tests sont basés sur Jest et `jest-expo`.

### Lancer les tests

```bash
npm test
```

Pour le mode watch :

```bash
npm run test:watch
```

La configuration de Jest se trouve dans `jest.config.cjs`. La collecte de couverture est activée et vise au moins 80 % de couverture globale sur les fichiers du dossier `src` et `app`.

## Vérification TypeScript

```bash
npm run typecheck
```

## Environnement de production

- Variable `EXPO_PUBLIC_API_URL` à définir pour pointer vers l’API JSON Server ou un backend réel.
- Les appels réseau passent par `src/api/client.ts`, ce qui facilite la sécurisation (authentification, headers supplémentaires, gestion d’erreurs centralisée).

## Utilisation fonctionnelle

1. Lancer JSON Server avec `npm run server`.
2. Lancer Expo avec `npm start`.
3. Dans l’application :
   - Parcourir la liste des missions depuis l’onglet principal, utiliser la recherche et les filtres.
   - Appuyer sur une carte pour accéder au détail, s’inscrire ou se désinscrire.
   - Créer une mission via l’écran de création.
   - Modifier ou supprimer une mission existante (avec confirmation).
   - Accéder à l’écran de connexion depuis l’onglet Profil.
