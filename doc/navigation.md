# 🗺️ Navigation — Expo Router

## `app/_layout.tsx` — Layout racine

C'est le **point d'entrée** de toute l'application. Il enveloppe tout avec les providers.

```tsx
export default function RootLayout() {
  return (
    <SafeAreaProvider>
```
Gère les zones sûres (notch iPhone, barre de navigation Android). Tous les écrans pourront utiliser `SafeAreaView` grâce à ce provider.

```tsx
      <QueryClientProvider client={queryClient}>
```
Rend TanStack Query disponible dans toute l'app. `queryClient` est l'objet configuré dans `src/api/queryClient.ts`.

```tsx
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
```
Chaque provider ajoute son contexte : thème, session utilisateur, notifications toast.

```tsx
              <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="auth/signup" />
              </Stack>
```
`Stack` = navigation en pile (comme un historique de navigation).  
`headerShown: false` = pas de barre de titre automatique.  
`animation: 'slide_from_right'` = transition glissante vers la droite.

---

## `app/(tabs)/_layout.tsx` — Layout des onglets

### Garde d'authentification

```tsx
const { isAuthenticated, isInitializing } = useAuth();

if (isInitializing) {
  return <ActivityIndicator />; // Attendre la restauration de la session
}

if (!isAuthenticated) {
  return <Redirect href="/auth/login" />; // Redirection automatique
}
```
Si l'utilisateur n'est pas connecté, il est redirigé vers le login.  
`isInitializing` évite une redirection prématurée pendant le chargement d'AsyncStorage.

### Configuration des onglets

```tsx
<Tabs screenOptions={{
  tabBarActiveTintColor: theme.colors.primary,    // couleur onglet actif
  tabBarInactiveTintColor: theme.colors.mutedText, // couleur onglet inactif
  tabBarStyle: { height: 64, ... },               // style de la barre
}}>
```

### Icônes avec @expo/vector-icons

```tsx
<Tabs.Screen
  name="index"
  options={{
    title: 'Explorer',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="search-outline" size={size} color={color} />
    ),
  }}
/>
```
`color` et `size` sont fournis automatiquement par Expo Router selon l'état actif/inactif.

### Écrans cachés du tab bar

```tsx
<Tabs.Screen name="mission-detail" options={{ href: null }} />
<Tabs.Screen name="mission-edit" options={{ href: null }} />
<Tabs.Screen name="new-mission" options={{ href: null }} />
```
`href: null` = l'écran existe dans le système de navigation mais n'apparaît pas comme onglet.  
On y accède par `router.push()` depuis d'autres écrans.

---

## Navigation entre écrans

### Aller vers un écran

```tsx
const router = useRouter();

// Naviguer vers un écran
router.push('/(tabs)/new-mission');

// Naviguer avec des paramètres
router.push({ pathname: '/(tabs)/mission-detail', params: { id: String(mission.id) } });

// Remplacer l'écran actuel (sans historique)
router.replace('/auth/login');

// Revenir en arrière
router.back();
```

### Lire les paramètres dans l'écran cible

```tsx
// Dans mission-detail.tsx
const { id: idParam } = useLocalSearchParams<{ id?: string }>();
const id = idParam ? Number(idParam) : undefined;
```
`useLocalSearchParams` lit les paramètres de l'URL.  
On convertit `id` en nombre car les paramètres d'URL sont toujours des strings.
