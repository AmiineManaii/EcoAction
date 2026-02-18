import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Mission } from '../api/missions';
import { useTheme } from '../theme/theme';
import { useAuth } from '../hooks/useAuth';

type MissionCardProps = { mission: Mission };

const TYPE_LABELS: Record<string, string> = {
  nettoyage_plage: '🏖️ Nettoyage',
  plantation_arbres: '🌳 Plantation',
  atelier_zero_dechet: '♻️ Zéro déchet',
  sensibilisation: '📢 Sensibilisation',
  jardinage_urbain: '🌱 Jardinage',
  collecte_dechets: '🗑️ Collecte',
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: 'Ouverte', color: '#40916C' },
  full: { label: 'Complète', color: '#D4A017' },
  completed: { label: 'Terminée', color: '#6B7280' },
  cancelled: { label: 'Annulée', color: '#C0392B' },
};

export function MissionCard({ mission }: MissionCardProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const statusConf = STATUS_CONFIG[mission.status] ?? { label: mission.status, color: '#6B7280' };
  const slots = mission.slotsTotal - mission.slotsTaken;
  const fillPercent = Math.min((mission.slotsTaken / mission.slotsTotal) * 100, 100);
  const isRegistered = user ? mission.participants.includes(user.id) : false;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.shadow,
          transform: [{ scale: pressed ? 0.975 : 1 }],
          opacity: pressed ? 0.92 : 1,
        },
      ]}
      onPress={() => router.push({ pathname: '/(tabs)/mission-detail', params: { id: String(mission.id) } })}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: mission.imageUrl }} style={styles.image} />
        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusConf.color }]}>
          <Text style={styles.statusText}>{statusConf.label}</Text>
        </View>
        {/* Registered badge */}
        {isRegistered && (
          <View style={[styles.registeredBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.registeredText}>✓ Inscrit</Text>
          </View>
        )}
      </View>

      <View style={[styles.body, { backgroundColor: theme.colors.card }]}>
        <View style={styles.row}>
          <View style={[styles.typeChip, { backgroundColor: theme.colors.accent }]}>
            <Text style={[styles.typeText, { color: theme.colors.primary }]}>
              {TYPE_LABELS[mission.type] ?? mission.type}
            </Text>
          </View>
          <Text style={[styles.date, { color: theme.colors.mutedText }]}>
            📅 {new Date(mission.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </Text>
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
          {mission.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: theme.colors.mutedText }]}>📍 {mission.city}</Text>
          <Text style={[styles.meta, { color: theme.colors.mutedText }]}>⏱ {mission.durationHours}h</Text>
        </View>

        {/* Slots progress bar */}
        <View style={styles.slotsRow}>
          <View style={[styles.progressBg, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${fillPercent}%` as any,
                  backgroundColor: fillPercent >= 90 ? '#E74C3C' : theme.colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.slotsText, { color: theme.colors.mutedText }]}>
            {slots > 0 ? `${slots} place${slots > 1 ? 's' : ''} restante${slots > 1 ? 's' : ''}` : 'Complet'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', height: 170 },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  registeredBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  registeredText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  body: { padding: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  typeText: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 12 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 6, lineHeight: 22 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  meta: { fontSize: 13 },
  slotsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBg: { flex: 1, height: 5, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  slotsText: { fontSize: 12, minWidth: 110, textAlign: 'right' },
});
