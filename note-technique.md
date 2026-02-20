# 📄 Note Technique — EcoAction
**Application mobile React Native — Bénévolat Environnemental**

---

## 1. Justification de l'architecture

### Expo Router (file-based routing)

Nous avons choisi **Expo Router** plutôt que React Navigation classique pour sa cohérence avec le modèle mental "fichier = écran". Cette approche réduit le boilerplate de configuration et facilite la maintenance : ajouter un écran revient à créer un fichier dans le bon dossier.

La navigation est organisée en deux niveaux :
- **Stack racine** (`app/_layout.tsx`) : gère l'entrée/sortie du flux d'authentification
- **Tab Navigator** (`app/(tabs)/_layout.tsx`) : espace principal avec garde d'authentification intégrée

La garde d'authentification est implémentée directement dans le layout des onglets via `<Redirect href="/auth/login" />`, ce qui centralise la logique de protection des routes authentifiées.

### Séparation en couches

```
Écrans  →  Hooks  →  API  →  JSON Server
```

Cette séparation garantit que chaque couche a une responsabilité unique :
- Les **écrans** s'occupent uniquement de l'affichage
- Les **hooks** gèrent la logique métier et l'état
- Les **fonctions API** s'occupent des appels réseau

Le fichier `src/utils/permissions.ts` centralise toutes les règles d'autorisation sous forme de fonctions pures, facilitant les tests unitaires.

### NativeWind (Tailwind CSS pour React Native)

NativeWind a été choisi pour uniformiser le style de l'application. Ses avantages :
- Classes utilitaires descriptives (`flex-1 rounded-2xl text-base`)
- Pas de `StyleSheet.create()` verbeux pour les styles statiques
- Design system cohérent via `tailwind.config.js`

Les couleurs dynamiques (thème light/dark) sont conservées en `style` inline car elles dépendent du contexte d'exécution.

---

## 2. Gestion des types TypeScript complexes

### Union types pour les statuts et types de missions

```ts
type MissionStatus = 'open' | 'full' | 'completed' | 'cancelled';
type MissionType = 'nettoyage_plage' | 'plantation_arbres' | ...;
```

Ces union types garantissent qu'aucune valeur invalide ne peut être assignée. TypeScript signalera une erreur à la compilation si une chaîne non prévue est utilisée.

### Type `MissionPayload` avec Omit et Partial

```ts
type MissionPayload = Omit<Mission, 'id' | 'createdAt' | 'slotsTaken' | 'status'>
  & Partial<Pick<Mission, 'status' | 'slotsTaken'>>;
```

Cette construction TypeScript avancée exprime exactement le contrat du formulaire de création :
- On **retire** les champs générés par le serveur (`id`, `createdAt`)
- On rend **optionnels** les champs que l'on peut fournir mais qui ont des valeurs par défaut

### Typage des icônes

```ts
const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = { ... };
```

`keyof typeof Ionicons.glyphMap` est un type dérivé automatiquement de la librairie Ionicons. Si un nom d'icône est mal orthographié, TypeScript l'intercepte à la compilation.

---

## 3. Stratégie de mise en cache TanStack Query

### Configuration globale

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,   // 1 minute
      gcTime: 300_000,     // 5 minutes
      retry: 2,
    },
  },
});
```

**Justification des valeurs :**
- `staleTime: 60 000 ms` : les données des missions changent peu fréquemment. Une minute sans refetch évite des requêtes réseau inutiles lors de la navigation entre écrans.
- `gcTime: 300 000 ms` : les données restent 5 minutes en mémoire après qu'un composant cesse de les utiliser. Cela permet des retours rapides sans rechargement.
- `retry: 2` : résilience aux erreurs réseau temporaires (réseau instable en situation de bénévolat terrain).

### Clés de cache hiérarchiques

```ts
const missionsKey = ['missions'] as const;
const missionKey = (id: number) => ['missions', id] as const;
```

Cette hiérarchie permet d'invalider intelligemment :
- `invalidateQueries({ queryKey: ['missions'] })` invalide la liste ET toutes les missions individuelles
- `invalidateQueries({ queryKey: ['missions', 5] })` invalide uniquement la mission n°5

### Optimistic UI pour l'inscription aux missions

```
Utilisateur clique → onMutate() → UI mise à jour immédiatement
                             ↓
                      Requête HTTP (background)
                             ↓
               Succès → onSettled() invalide le cache
               Échec  → onError() rollback vers l'état précédent
```

**Pourquoi ?** L'inscription est l'action la plus fréquente de l'app. Une latence perçue de 0ms améliore considérablement l'expérience utilisateur. En cas d'erreur réseau, le rollback automatique garantit la cohérence des données affichées.

Le snapshot (`previousMission`, `previousMissions`) est sauvegardé dans `onMutate` et passé à `onError` via le contexte de mutation, permettant une restauration exacte sans logique supplémentaire.

---

## Conclusion

L'architecture d'EcoAction privilégie la **lisibilité** (séparation claire des responsabilités), la **résilience** (retry + staleTime + optimistic UI) et la **cohérence** (types stricts + permissions centralisées). TanStack Query élimine la gestion manuelle des états de chargement et de cache, permettant de se concentrer sur la logique métier.
