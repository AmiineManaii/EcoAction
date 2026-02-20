# 📱 Écrans — `app/(tabs)/` et `app/auth/`

## `index.tsx` — Explorer les missions

### Filtres combinés

```tsx
const [query, setQuery] = useState('');           // texte de recherche
const [typeFilter, setTypeFilter] = useState<string | null>(null);
const [cityFilter, setCityFilter] = useState<string | null>(null);
const [openOnly, setOpenOnly] = useState<boolean | null>(null);
```
Chaque filtre a son propre état. `null` = "pas de filtre actif".

### Filtrage avec useMemo

```tsx
const filteredMissions = useMemo(
  () => missions.filter((mission) => {
    const matchesQuery = query.length === 0 ||
      mission.title.toLowerCase().includes(query.toLowerCase()) ||
      mission.description.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === null || mission.type === typeFilter;
    const matchesCity = cityFilter === null || mission.city === cityFilter;
    const matchesStatus = openOnly === null ||
      (openOnly ? mission.status === 'open' : mission.status !== 'open');
    return matchesQuery && matchesType && matchesCity && matchesStatus;
  }),
  [missions, query, typeFilter, cityFilter, openOnly], // recalcule seulement si ces valeurs changent
);
```
`useMemo` évite de recalculer le filtrage à chaque rendu.  
Il ne recalcule que quand `missions`, `query`, `typeFilter`, `cityFilter` ou `openOnly` changent.

### Villes dynamiques

```tsx
const cities = useMemo(
  () => Array.from(new Set(missions.map((m) => m.city))),
  [missions]
);
```
`Set` élimine les doublons automatiquement.  
`Array.from` convertit le Set en tableau pour pouvoir le mapper.

---

## `mission-detail.tsx` — Détail d'une mission

### Récupération de l'ID depuis l'URL

```tsx
const { id: idParam } = useLocalSearchParams<{ id?: string }>();
const id = idParam ? Number(idParam) : undefined;
```
L'URL contient `?id=5`, on extrait `"5"` puis on le convertit en nombre `5`.

### Calcul des places restantes

```tsx
const slots = mission.slotsTotal - mission.slotsTaken;
const fillPercent = Math.min((mission.slotsTaken / mission.slotsTotal) * 100, 100);
```
`fillPercent` est le pourcentage de remplissage pour la barre de progression.  
`Math.min(..., 100)` évite de dépasser 100% en cas d'inconsistance de données.

### Inscription/désinscription avec Optimistic UI

```tsx
const toggleRegistration = () => {
  if (!user) return;

  // Le créateur ne peut pas se désinscrire
  if (isOwner) {
    showToast('En tant que créateur, vous ne pouvez pas vous désinscrire.', 'error');
    return;
  }

  // Calcul du nouvel état des participants
  const nextParticipants = isRegistered
    ? mission.participants.filter((pid) => pid !== user.id)  // désinscription
    : [...mission.participants, user.id];                     // inscription

  // Envoi de la mutation (l'UI se met à jour IMMÉDIATEMENT grâce à onMutate)
  toggleMutation.mutate(
    { participants: nextParticipants, slotsTaken: nextParticipants.length },
    {
      onSuccess: () => { showToast('✅ Inscription confirmée !', 'success'); },
      onError: () => { showToast("Erreur lors de l'opération.", 'error'); },
    },
  );
};
```

---

## `my-missions.tsx` — Mes missions

```tsx
const participatedMissions = user
  ? missions.filter((m) => m.participants.includes(user.id))
  : [];
```
Filtre côté client : on garde uniquement les missions où l'ID de l'utilisateur est dans `participants`.

---

## `new-mission.tsx` — Créer une mission

### Chargement des utilisateurs pour ajouter des participants

```tsx
useEffect(() => {
  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const users = await getUsers();
      setAllUsers(users);
    } catch {
      showToast("Impossible de charger les utilisateurs.", 'error');
    } finally {
      setIsLoadingUsers(false); // toujours remettre à false
    }
  };
  loadUsers();
}, [showToast]); // se déclenche une seule fois au montage
```

### Le créateur est toujours ajouté automatiquement

```tsx
useEffect(() => {
  if (user?.id && !participants.includes(user.id)) {
    setParticipants((current) => [...current, user.id]);
  }
}, [user, participants]);
```
Dès que `user` est disponible, on l'ajoute aux participants.  
La vérification `!participants.includes` évite les doublons.

---

## `profile.tsx` — Profil

```tsx
const registeredCount = user
  ? missions.filter((m) => m.participants.includes(user.id)).length
  : 0;

const completedCount = user
  ? missions.filter((m) => m.participants.includes(user.id) && m.status === 'completed').length
  : 0;
```
Statistiques calculées à partir des données déjà en cache (pas de requête supplémentaire).

```tsx
<Switch
  value={theme.mode === 'dark'}
  onValueChange={toggleTheme}
  thumbColor={theme.mode === 'dark' ? theme.colors.primaryLight : '#f9fafb'}
  trackColor={{ false: '#d1d5db', true: theme.colors.primary }}
/>
```
Bascule du thème. `toggleTheme` inverse le mode dans le contexte et met à jour tous les composants.

---

## `login.tsx` et `signup.tsx` — Authentification

### Animation d'entrée

```tsx
const [opacity] = useState(new Animated.Value(0));      // commence invisible
const [translateY] = useState(new Animated.Value(30)); // commence décalé vers le bas

useEffect(() => {
  Animated.parallel([
    Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
  ]).start();
}, []);
```
`Animated.parallel` lance les deux animations en même temps.  
`useNativeDriver: true` exécute l'animation sur le thread natif (plus fluide).

### Redirection si déjà connecté

```tsx
useEffect(() => {
  if (!isInitializing && isAuthenticated) router.replace('/(tabs)');
}, [isAuthenticated, isInitializing]);
```
Si l'utilisateur est déjà connecté, il est redirigé automatiquement vers l'app.
