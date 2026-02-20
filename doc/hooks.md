# 🪝 Hooks — `src/hooks/`

## `useAuth.tsx` — Gestion de la session

### Le contexte React

```ts
type AuthContextValue = {
  user: User | null;           // utilisateur connecté ou null
  session: AuthSession | null; // session complète
  isAuthenticated: boolean;    // true si connecté
  isInitializing: boolean;     // true pendant la lecture d'AsyncStorage
  login: (...) => Promise<void>;
  signup: (...) => Promise<void>;
  logout: () => Promise<void>;
};
```
Un **contexte** partage ces valeurs avec tous les composants de l'app.

### Restauration de la session au démarrage

```ts
useEffect(() => {
  const restoreSession = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: AuthSession = JSON.parse(stored);
        setSession(parsed);
      }
    } catch {
      // Si lecture impossible, on reste déconnecté
    } finally {
      setIsInitializing(false); // Toujours terminer l'initialisation
    }
  };
  restoreSession();
}, []);
```
Au démarrage de l'app, on lit AsyncStorage pour voir si une session existe.  
`isInitializing` reste `true` le temps de cette lecture (évite un flash de l'écran de login).

### Persistance de la session

```ts
const persistSession = async (next: AuthSession | null) => {
  setSession(next);                                          // mise à jour React
  if (next) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); // sauvegarde
  } else {
    await AsyncStorage.removeItem(STORAGE_KEY);             // suppression au logout
  }
};
```
À chaque changement de session, on synchronise AsyncStorage.

### Utilisation dans les composants

```ts
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider est requis...');
  return context;
}
```
Ce hook custom simplifie l'accès : au lieu de `useContext(AuthContext)`, on écrit `useAuth()`.  
La vérification `!context` protège contre un oubli du `AuthProvider`.

---

## `useMissions.ts` — Données des missions

### `useMissions()` — Lister toutes les missions

```ts
function useMissions() {
  const query = useQuery({
    queryKey: ['missions'],    // clé de cache unique
    queryFn: getMissions,      // fonction qui fetch les données
  });
  return { missions: query.data ?? [], ...query };
}
```
- `queryKey: ['missions']` : TanStack Query identifie cette donnée par cette clé
- `query.data ?? []` : si pas encore chargé, retourne un tableau vide (évite les erreurs)

### `useMission(id)` — Une mission par ID

```ts
function useMission(id: number | undefined) {
  return useQuery({
    queryKey: ['missions', id],   // cache différent par ID
    queryFn: () => getMission(id as number),
    enabled: typeof id === 'number', // ne fetch que si l'ID est valide
  });
}
```
`enabled: false` suspend la requête — utile quand l'ID n'est pas encore disponible.

### `useCreateMission()` et `useUpdateMission()` — Mutations

```ts
function useCreateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MissionPayload) => createMission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] }); // vide le cache
    },
  });
}
```
Après la création, `invalidateQueries` force un rechargement de la liste.

---

## `useToggleParticipation()` — Inscription avec Optimistic UI ✨

C'est le hook le plus important techniquement. Voici comment il fonctionne étape par étape :

```ts
function useToggleParticipation(missionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateMission(missionId, payload),
```

### Étape 1 — onMutate : mise à jour immédiate AVANT la réponse serveur

```ts
    onMutate: async (payload) => {
      // 1a. Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: ['missions', missionId] });
      await queryClient.cancelQueries({ queryKey: ['missions'] });

      // 1b. Sauvegarder l'état actuel (pour pouvoir revenir en arrière)
      const previousMission = queryClient.getQueryData<Mission>(['missions', missionId]);
      const previousMissions = queryClient.getQueryData<Mission[]>(['missions']);

      // 1c. Mettre à jour le cache IMMÉDIATEMENT (l'UI se met à jour tout de suite)
      queryClient.setQueryData<Mission>(['missions', missionId], (old) => {
        if (!old) return old;
        return { ...old, ...payload };   // fusion de l'ancien état avec le nouveau
      });

      // 1d. Mettre à jour aussi la liste
      queryClient.setQueryData<Mission[]>(['missions'], (old = []) =>
        old.map((m) => (m.id === missionId ? { ...m, ...payload } : m)),
      );

      return { previousMission, previousMissions }; // passé à onError pour rollback
    },
```

### Étape 2 — onError : rollback si le serveur échoue

```ts
    onError: (_err, _payload, context) => {
      // Restaurer l'ancien état sauvegardé à l'étape 1b
      if (context?.previousMission) {
        queryClient.setQueryData(['missions', missionId], context.previousMission);
      }
      if (context?.previousMissions) {
        queryClient.setQueryData(['missions'], context.previousMissions);
      }
    },
```
Si le serveur retourne une erreur, on remet le cache dans son état initial.  
L'utilisateur voit le changement revenir en arrière automatiquement.

### Étape 3 — onSettled : synchronisation finale

```ts
    onSettled: () => {
      // Dans tous les cas (succès ou erreur), resynchroniser avec le serveur
      queryClient.invalidateQueries({ queryKey: ['missions', missionId] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });
}
```
`onSettled` s'exécute toujours à la fin (succès ou erreur).  
On invalide pour garantir que l'UI affiche bien les données réelles du serveur.
