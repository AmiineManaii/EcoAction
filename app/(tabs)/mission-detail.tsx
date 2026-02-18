import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Image, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMission, useUpdateMission, useDeleteMission } from '../../src/hooks/useMissions';
import { useTheme } from '../../src/theme/theme';
import { useToast } from '../../src/components/Toast';
import { useAuth } from '../../src/hooks/useAuth';
import { request } from '../../src/api/client';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: '🟢 Ouverte', color: '#40916C' },
  full: { label: '🟡 Complète', color: '#D4A017' },
  completed: { label: '✅ Terminée', color: '#6B7280' },
  cancelled: { label: '🔴 Annulée', color: '#C0392B' },
};

export default function MissionDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id?: string }>();
  const id = idParam ? Number(idParam) : undefined;
  const router = useRouter();
  const { data: mission, isLoading, isError } = useMission(id);
  const updateMutation = useUpdateMission(id as number);
  const deleteMutation = useDeleteMission();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { user } = useAuth();

  if (!id || isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ fontSize: 32 }}>🌿</Text>
        <Text style={[{ color: theme.colors.mutedText, marginTop: 8 }]}>Chargement...</Text>
      </View>
    );
  }

  if (isError || !mission) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ fontSize: 32 }}>⚠️</Text>
        <Text style={[{ color: theme.colors.danger, marginTop: 8 }]}>Mission introuvable.</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.colors.primary }]}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>← Retour</Text>
        </Pressable>
      </View>
    );
  }

  const isOwner = user?.id === mission.creatorId;
  const isRegistered = user ? mission.participants.includes(user.id) : false;
  const slots = mission.slotsTotal - mission.slotsTaken;
  const fillPercent = Math.min((mission.slotsTaken / mission.slotsTotal) * 100, 100);
  const statusConf = STATUS_CONFIG[mission.status] ?? { label: mission.status, color: '#6B7280' };
  const canRegister = mission.status === 'open' && (isRegistered || slots > 0);

  const toggleRegistration = () => {
    if (!user) return;
    const nextParticipants = isRegistered
      ? mission.participants.filter((pid) => pid !== user.id)
      : [...mission.participants, user.id];
    const slotsTaken = nextParticipants.length;
    updateMutation.mutate(
      { participants: nextParticipants, slotsTaken },
      {
        onSuccess: () => {
          showToast(!isRegistered ? '✅ Inscription confirmée !' : 'Désinscription confirmée.', 'success');
        },
      },
    );
  };

  const handleDelete = () => {
    Alert.alert('Supprimer la mission', 'Cette action est irréversible. Confirmer ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          deleteMutation.mutate(mission.id, {
            onSuccess: () => {
              showToast('Mission supprimée.', 'success');
              router.back();
            },
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image + back button */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: mission.imageUrl }} style={styles.image} />
          <Pressable
            onPress={() => router.back()}
            style={[styles.backCircle, { backgroundColor: theme.colors.card }]}
          >
            <Text style={{ fontSize: 16 }}>←</Text>
          </Pressable>
          <View style={[styles.statusOverlay, { backgroundColor: statusConf.color }]}>
            <Text style={styles.statusText}>{statusConf.label}</Text>
          </View>
        </View>

        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{mission.title}</Text>

          {/* Meta chips row */}
          <View style={styles.metaRow}>
            <View style={[styles.metaChip, { backgroundColor: theme.colors.accent }]}>
              <Text style={[styles.metaChipText, { color: theme.colors.primary }]}>
                📍 {mission.city}
              </Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: theme.colors.accent }]}>
              <Text style={[styles.metaChipText, { color: theme.colors.primary }]}>⏱ {mission.durationHours}h</Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: theme.colors.accent }]}>
              <Text style={[styles.metaChipText, { color: theme.colors.primary }]}>
                📅 {new Date(mission.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Organizer */}
          <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.infoLabel, { color: theme.colors.mutedText }]}>ORGANISATEUR</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>🧑‍🤝‍🧑 {mission.organizerName}</Text>
          </View>

          {/* Address */}
          <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.infoLabel, { color: theme.colors.mutedText }]}>ADRESSE</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>📍 {mission.address}</Text>
          </View>

          {/* Slots */}
          <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.slotsHeader}>
              <Text style={[styles.infoLabel, { color: theme.colors.mutedText }]}>PLACES DISPONIBLES</Text>
              <Text style={[styles.slotsCount, { color: theme.colors.primary }]}>
                {mission.slotsTaken}/{mission.slotsTotal}
              </Text>
            </View>
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
            <Text style={[styles.slotsRemaining, { color: theme.colors.mutedText }]}>
              {slots > 0 ? `${slots} place${slots > 1 ? 's' : ''} restante${slots > 1 ? 's' : ''}` : '🔴 Complet'}
            </Text>
          </View>

          {/* Description */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: theme.colors.mutedText }]}>{mission.description}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              onPress={toggleRegistration}
              disabled={!canRegister || updateMutation.isPending}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: canRegister
                    ? isRegistered
                      ? theme.colors.danger
                      : theme.colors.primary
                    : theme.colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={styles.primaryBtnText}>
                {isRegistered ? '❌ Se désinscrire' : "✅ S'inscrire"}
              </Text>
            </Pressable>

            {isOwner && (
              <View style={styles.secondaryActions}>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/(tabs)/mission-edit', params: { id: String(mission.id) } })
                  }
                  style={[styles.secondaryBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.secondaryBtnText, { color: theme.colors.text }]}>✏️ Modifier</Text>
                </Pressable>
                <Pressable
                  onPress={handleDelete}
                  style={[styles.secondaryBtn, { backgroundColor: theme.colors.card, borderColor: '#FECACA' }]}
                >
                  <Text style={[styles.secondaryBtnText, { color: theme.colors.danger }]}>🗑️ Supprimer</Text>
                </Pressable>
              </View>
            )}

            {isOwner && mission.participants.length > 0 && (
              <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.infoLabel, { color: theme.colors.mutedText }]}>PARTICIPANTS</Text>
                <View style={{ gap: 8 }}>
                  {mission.participants.map((pid) => (
                    <View
                      key={pid}
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <Text style={[styles.infoValue, { color: theme.colors.text }]}>Utilisateur #{pid}</Text>
                      <Pressable
                        onPress={() => {
                          const next = mission.participants.filter((idp) => idp !== pid);
                          updateMutation.mutate(
                            { participants: next, slotsTaken: next.length },
                            { onSuccess: () => showToast('Participation annulée.', 'success') },
                          );
                        }}
                        style={[
                          styles.secondaryBtn,
                          {
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            backgroundColor: theme.colors.card,
                            borderColor: '#FECACA',
                          },
                        ]}
                      >
                        <Text style={[styles.secondaryBtnText, { color: theme.colors.danger }]}>Retirer</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', height: 260 },
  backCircle: {
    position: 'absolute', top: 16, left: 16,
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  statusOverlay: {
    position: 'absolute', top: 16, right: 16,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16, lineHeight: 32 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  metaChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  metaChipText: { fontSize: 13, fontWeight: '600' },
  infoCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  infoLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  infoValue: { fontSize: 15, fontWeight: '500' },
  slotsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  slotsCount: { fontSize: 16, fontWeight: '700' },
  progressBg: { height: 8, borderRadius: 999, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 999 },
  slotsRemaining: { fontSize: 13 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 4, marginBottom: 8 },
  description: { fontSize: 15, lineHeight: 24, marginBottom: 24 },
  actions: { gap: 12 },
  primaryBtn: { padding: 16, borderRadius: 16, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryActions: { flexDirection: 'row', gap: 12 },
  secondaryBtn: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
  secondaryBtnText: { fontSize: 14, fontWeight: '600' },
});
