import { Tabs, Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/theme/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { isAuthenticated, isInitializing } = useAuth();
  const { theme } = useTheme();

  if (isInitializing) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedText,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌿" label="Explorer" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="my-missions"
        options={{
          title: 'Mes missions',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✅" label="Mes missions" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profil" focused={focused} />,
        }}
      />

      {/* ✅ FIX: Ces écrans sont cachés du tab bar */}
      <Tabs.Screen
        name="mission-detail"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="mission-edit"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="new-mission"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});