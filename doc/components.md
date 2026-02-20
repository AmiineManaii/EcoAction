# 🧩 Composants partagés — `src/components/`

## `MissionCard.tsx` — Carte de mission

### Icônes par type de mission

```tsx
const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  nettoyage_plage: 'water-outline',
  plantation_arbres: 'leaf-outline',
  atelier_zero_dechet: 'refresh-outline',
  sensibilisation: 'megaphone-outline',
  jardinage_urbain: 'flower-outline',
  collecte_dechets: 'trash-outline',
};
```
`keyof typeof Ionicons.glyphMap` = TypeScript vérifie que le nom d'icône existe vraiment dans Ionicons.

### Barre de progression des places

```tsx
const fillPercent = Math.min((mission.slotsTaken / mission.slotsTotal) * 100, 100);

<View style={{ width: `${fillPercent}%`, backgroundColor: fillPercent >= 90 ? '#E74C3C' : theme.colors.primary }} />
```
La barre devient rouge quand la mission est remplie à 90%+.

### Navigation vers le détail

```tsx
<Pressable
  onPress={() => router.push({ pathname: '/(tabs)/mission-detail', params: { id: String(mission.id) } })}
>
```
`String(mission.id)` : les paramètres d'URL doivent être des strings.

---

## `MissionForm.tsx` — Formulaire de mission

### Initialisation des champs

```tsx
const [title, setTitle] = useState(initialValues?.title ?? '');
```
`initialValues?.title` : accès optionnel (si `initialValues` est undefined, retourne undefined).  
`?? ''` : si undefined ou null, utilise une chaîne vide.  
Permet de réutiliser le même formulaire pour la création ET la modification.

### Sélecteur de type en grille

```tsx
<View className="flex-row flex-wrap gap-2 mb-1">
  {TYPES.map((t) => (
    <Pressable
      key={t.key}
      onPress={() => setType(t.key)}
      style={{ backgroundColor: type === t.key ? theme.colors.primary : theme.colors.chip }}
    >
      <Text style={{ color: type === t.key ? '#fff' : theme.colors.text }}>{t.label}</Text>
    </Pressable>
  ))}
</View>
```
La puce sélectionnée est mise en surbrillance. Style conditionnel avec l'opérateur ternaire.

### Soumission du formulaire

```tsx
const handleSubmit = () => {
  onSubmit({
    title, description, type, city, address, date,
    durationHours: Number(durationHours),  // conversion string → number
    slotsTotal: Number(slotsTotal),
    ...
  });
};
```
`Number(durationHours)` convertit la chaîne saisie dans `TextInput` en nombre.

---

## `Toast.tsx` — Notifications temporaires

### Le contexte Toast

```tsx
type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};
```
N'importe quel composant peut appeler `showToast()` grâce au contexte.

### Animation d'apparition/disparition

```tsx
const opacity = useRef(new Animated.Value(0)).current;
const translateY = useRef(new Animated.Value(20)).current;
```
`useRef` au lieu de `useState` : on ne veut pas de re-rendu lors du changement de valeur animée.

```tsx
const showToast = (message: string, type: ToastType = 'success') => {
  // 1. Annuler le timer précédent si le toast est déjà visible
  if (timeoutRef.current) clearTimeout(timeoutRef.current);

  setState({ visible: true, message, type });

  // 2. Animation d'entrée
  Animated.parallel([
    Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
  ]).start();

  // 3. Auto-disparition après 2.8 secondes
  timeoutRef.current = setTimeout(hide, 2800);
};
```

### Position fixe sur l'écran

```tsx
<View pointerEvents="none" style={{ position: 'absolute', bottom: 32, left: 0, right: 0 }}>
```
`position: 'absolute'` + `bottom: 32` = le toast flotte en bas de l'écran.  
`pointerEvents="none"` = le toast ne capture pas les clics (on peut cliquer derrière lui).

---

## `Loader.tsx`, `EmptyState.tsx`, `ErrorState.tsx`

Ces trois composants gèrent les états de l'interface :

```tsx
// Loader — affiché pendant isLoading
if (isLoading) return <Loader />;

// ErrorState — affiché pendant isError
if (isError) return <ErrorState message="..." />;

// EmptyState — affiché quand la liste est vide
if (filteredMissions.length === 0) return <EmptyState message="..." />;
```

Chaque composant est simple et réutilisable. Ils utilisent `useTheme()` pour s'adapter au mode sombre.
