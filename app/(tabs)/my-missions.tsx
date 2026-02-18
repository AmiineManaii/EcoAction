import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMissions } from '../../src/hooks/useMissions';
import { MissionCard } from '../../src/components/MissionCard';
import { Loader } from '../../src/components/Loader';
import { ErrorState } from '../../src/components/ErrorState';
import { useTheme } from '../../src/theme/theme';

export default function MyMissionsScreen() {
  const { missions, isLoading, isError } = useMissions();
  const { theme } = useTheme();
  const participatedMissions = missions.filter((m) => m.isUserRegistered);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState message="Impossible de charger vos missions." />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Mes missions</Text>
        <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
          Missions auxquelles vous êtes inscrit(e)
        </Text>
      </View>

      {/* Stats bar */}
      <View style={[styles.statsBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{participatedMissions.length}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.mutedText }]}>Inscrite(s)</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {participatedMissions.filter((m) => m.status === 'open').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.mutedText }]}>À venir</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {participatedMissions.filter((m) => m.status === 'completed').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.mutedText }]}>Terminée(s)</Text>
        </View>
      </View>

      {participatedMissions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Aucune mission pour le moment</Text>
          <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}>
            Explorez les missions disponibles et inscrivez-vous pour agir pour la planète !
          </Text>
        </View>
      ) : (
        <FlatList
          data={participatedMissions}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <MissionCard mission={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 4 },
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, marginHorizontal: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});