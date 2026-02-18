import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCreateMission } from '../../src/hooks/useMissions';
import { MissionForm } from '../../src/components/MissionForm';
import { useToast } from '../../src/components/Toast';
import { useTheme } from '../../src/theme/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { getUsers, AppUser } from '../../src/api/users';

export default function NewMissionScreen() {
  const router = useRouter();
  const mutation = useCreateMission();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [participants, setParticipants] = useState<number[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const users = await getUsers();
        setAllUsers(users);
      } catch {
        showToast("Impossible de charger les utilisateurs.", 'error');
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [showToast]);

  useEffect(() => {
    if (user?.id && !participants.includes(user.id)) {
      setParticipants((current) => [...current, user.id]);
    }
  }, [user, participants]);

  const handleSubmit = (values: Parameters<typeof mutation.mutate>[0]) => {
    if (!user?.id) {
      showToast('Vous devez être connecté pour créer une mission.', 'error');
      return;
    }

    const uniqueParticipants = Array.from(new Set(participants));
    if (!uniqueParticipants.includes(user.id)) {
      uniqueParticipants.push(user.id);
    }

    const payload = {
      ...values,
      creatorId: user.id,
      participants: uniqueParticipants,
      slotsTaken: uniqueParticipants.length,
      status: 'open',
      createdAt: new Date().toISOString(),
    } as any;

    mutation.mutate(payload, {
      onSuccess: () => {
        showToast('🎉 Mission créée avec succès !', 'success');
        router.back();
      },
      onError: () => {
        showToast('Erreur lors de la création de la mission.', 'error');
      },
    });
  };

  const participantUsers = useMemo(
    () => participants.map((id) => allUsers.find((u) => u.id === id)).filter(Boolean) as AppUser[],
    [participants, allUsers],
  );

  const selectableUsers = useMemo(
    () => allUsers.filter((u) => !participants.includes(u.id)),
    [allUsers, participants],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.colors.primary }]}>← Annuler</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Nouvelle mission</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <MissionForm onSubmit={handleSubmit} submitLabel="🌿 Publier la mission" />

        <View style={[styles.participantsCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
          <Text style={[styles.participantsTitle, { color: theme.colors.text }]}>Participants</Text>
          <Text style={[styles.participantsSubtitle, { color: theme.colors.mutedText }]}>
            Le créateur de la mission est toujours inscrit et ne peut pas être retiré.
          </Text>

          {isLoadingUsers ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.mutedText }]}>Chargement des utilisateurs...</Text>
            </View>
          ) : (
            <>
              <View style={styles.participantList}>
                {participantUsers.length === 0 ? (
                  <Text style={[styles.emptyParticipants, { color: theme.colors.mutedText }]}>
                    Aucun participant sélectionné pour le moment.
                  </Text>
                ) : (
                  participantUsers.map((u) => {
                    const isCreator = u.id === user?.id;
                    return (
                      <View key={u.id} style={styles.participantRow}>
                        <View>
                          <Text style={[styles.participantName, { color: theme.colors.text }]}>{u.name}</Text>
                          <Text style={[styles.participantMeta, { color: theme.colors.mutedText }]}>{u.email}</Text>
                        </View>
                        <Pressable
                          disabled={isCreator}
                          onPress={() =>
                            setParticipants((current) => current.filter((id) => id !== u.id))
                          }
                          style={[
                            styles.removeBtn,
                            {
                              borderColor: isCreator ? theme.colors.border : '#FECACA',
                              opacity: isCreator ? 0.6 : 1,
                            },
                          ]}
                        >
                          <Text style={[styles.removeText, { color: isCreator ? theme.colors.mutedText : theme.colors.danger }]}>
                            {isCreator ? 'Créateur 🔒' : 'Retirer'}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })
                )}
              </View>

              {selectableUsers.length > 0 && (
                <View style={styles.addSection}>
                  <Text style={[styles.addLabel, { color: theme.colors.mutedText }]}>Ajouter un participant</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {selectableUsers.map((u) => (
                      <Pressable
                        key={u.id}
                        onPress={() => {
                          setParticipants((current) => [...current, u.id]);
                          setSelectedUserId(u.id);
                        }}
                        style={({ pressed }) => [
                          styles.userChip,
                          {
                            backgroundColor:
                              selectedUserId === u.id ? theme.colors.primary : theme.colors.chip,
                            borderColor:
                              selectedUserId === u.id ? theme.colors.primary : theme.colors.border,
                            opacity: pressed ? 0.85 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.userChipText,
                            { color: selectedUserId === u.id ? '#fff' : theme.colors.text },
                          ]}
                        >
                          {u.name}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 70 },
  backText: { fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  participantsCard: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  participantsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  participantsSubtitle: { fontSize: 12, marginBottom: 12 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 13 },
  participantList: { gap: 8, marginBottom: 12 },
  emptyParticipants: { fontSize: 13, fontStyle: 'italic' },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  participantName: { fontSize: 14, fontWeight: '600' },
  participantMeta: { fontSize: 12 },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  removeText: { fontSize: 12, fontWeight: '600' },
  addSection: { marginTop: 8, gap: 6 },
  addLabel: { fontSize: 12, fontWeight: '600' },
  userChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  userChipText: { fontSize: 13, fontWeight: '500' },
});
