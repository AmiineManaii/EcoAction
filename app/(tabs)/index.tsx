import { useRouter } from 'expo-router';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, View, Pressable, StatusBar } from 'react-native';
import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMissions } from '../../src/hooks/useMissions';
import { MissionCard } from '../../src/components/MissionCard';
import { Loader } from '../../src/components/Loader';
import { ErrorState } from '../../src/components/ErrorState';
import { EmptyState } from '../../src/components/EmptyState';
import { useTheme } from '../../src/theme/theme';

const TYPES = [
  { key: null, label: '🌍 Tous' },
  { key: 'nettoyage_plage', label: '🏖️ Nettoyage' },
  { key: 'plantation_arbres', label: '🌳 Plantation' },
  { key: 'atelier_zero_dechet', label: '♻️ Zéro déchet' },
  { key: 'sensibilisation', label: '📢 Sensibilisation' },
  { key: 'jardinage_urbain', label: '🌱 Jardinage' },
  { key: 'collecte_dechets', label: '🗑️ Collecte' },
];

const STATUSES = [
  { key: null, label: 'Tous statuts' },
  { key: true, label: '🟢 Ouvertes' },
  { key: false, label: '🔴 Fermées' },
];

export default function MissionsScreen() {
  const router = useRouter();
  const { missions, isLoading, isError } = useMissions();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [openOnly, setOpenOnly] = useState<boolean | null>(null);
  const { theme } = useTheme();

  const cities = useMemo(() => Array.from(new Set(missions.map((m) => m.city))), [missions]);

  const filteredMissions = useMemo(
    () =>
      missions.filter((mission) => {
        const matchesQuery =
          query.length === 0 ||
          mission.title.toLowerCase().includes(query.toLowerCase()) ||
          mission.description.toLowerCase().includes(query.toLowerCase());
        const matchesType = typeFilter === null || mission.type === typeFilter;
        const matchesCity = cityFilter === null || mission.city === cityFilter;
        const matchesStatus =
          openOnly === null || (openOnly ? mission.status === 'open' : mission.status !== 'open');
        return matchesQuery && matchesType && matchesCity && matchesStatus;
      }),
    [missions, query, typeFilter, cityFilter, openOnly],
  );

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState message="Impossible de charger les missions." />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <View>
          <Text style={[styles.logo, { color: theme.colors.primary }]}>🌿 EcoAction</Text>
          <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
            Missions de bénévolat environnemental
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/new-mission')}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: theme.colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.addBtnText}>+ Créer</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={[styles.searchWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Rechercher une mission..."
          placeholderTextColor={theme.colors.mutedText}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <Text style={{ color: theme.colors.mutedText, fontSize: 18 }}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Type Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {TYPES.map((t) => (
          <Pressable
            key={String(t.key)}
            onPress={() => setTypeFilter(t.key)}
            style={[
              styles.chip,
              {
                backgroundColor: typeFilter === t.key ? theme.colors.primary : theme.colors.chip,
                borderColor: typeFilter === t.key ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: typeFilter === t.key ? '#fff' : theme.colors.text }]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* City Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        <Pressable
          onPress={() => setCityFilter(null)}
          style={[
            styles.chip,
            {
              backgroundColor: cityFilter === null ? theme.colors.secondary : theme.colors.chip,
              borderColor: cityFilter === null ? theme.colors.secondary : theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.chipText, { color: cityFilter === null ? '#fff' : theme.colors.text }]}>
            📍 Toutes villes
          </Text>
        </Pressable>
        {cities.map((city) => (
          <Pressable
            key={city}
            onPress={() => setCityFilter(city)}
            style={[
              styles.chip,
              {
                backgroundColor: cityFilter === city ? theme.colors.secondary : theme.colors.chip,
                borderColor: cityFilter === city ? theme.colors.secondary : theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: cityFilter === city ? '#fff' : theme.colors.text }]}>
              {city}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {STATUSES.map((s) => (
          <Pressable
            key={String(s.key)}
            onPress={() => setOpenOnly(s.key)}
            style={[
              styles.chip,
              {
                backgroundColor: openOnly === s.key ? theme.colors.primary : theme.colors.chip,
                borderColor: openOnly === s.key ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: openOnly === s.key ? '#fff' : theme.colors.text }]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Results count */}
      <Text style={[styles.resultsCount, { color: theme.colors.mutedText }]}>
        {filteredMissions.length} mission{filteredMissions.length !== 1 ? 's' : ''} trouvée{filteredMissions.length !== 1 ? 's' : ''}
      </Text>

      {filteredMissions.length === 0 ? (
        <EmptyState message="Aucune mission ne correspond aux critères." />
      ) : (
        <FlatList
          data={filteredMissions}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <MissionCard mission={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  logo: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, marginTop: 2 },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  filterRow: { marginBottom: 6 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
  resultsCount: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
});