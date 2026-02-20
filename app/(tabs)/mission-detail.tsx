import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View, Image, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useMission, useToggleParticipation, useDeleteMission } from '../../src/hooks/useMissions';
import { useTheme } from '../../src/theme/theme';
import { useToast } from '../../src/components/Toast';
import { useAuth } from '../../src/hooks/useAuth';
import { logParticipantChange } from '../../src/api/participantLogs';
import { getUsers, AppUser } from '../../src/api/users';
import { useUpdateMission } from '../../src/hooks/useMissions';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  open: { label: 'Ouverte', color: '#40916C', icon: 'checkmark-circle-outline' },
  full: { label: 'Complète', color: '#D4A017', icon: 'alert-circle-outline' },
  completed: { label: 'Terminée', color: '#6B7280', icon: 'checkmark-done-outline' },
  cancelled: { label: 'Annulée', color: '#C0392B', icon: 'close-circle-outline' },
};

export default function MissionDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id?: string }>();
  const id = idParam ? Number(idParam) : undefined;
  const router = useRouter();
  const { data: mission, isLoading, isError } = useMission(id);

  const toggleMutation = useToggleParticipation(id as number);
  const updateMutation = useUpdateMission(id as number); 
  const deleteMutation = useDeleteMission();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {});
  }, []);

  if (!id || isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-2" style={{ color: theme.colors.mutedText }}>Chargement...</Text>
      </View>
    );
  }

  if (isError || !mission) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme.colors.background }}>
        <Ionicons name="warning-outline" size={48} color={theme.colors.danger} />
        <Text className="mt-2" style={{ color: theme.colors.danger }}>Mission introuvable.</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 px-5 py-2.5 rounded-full"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <Text className="text-white font-bold">← Retour</Text>
        </Pressable>
      </View>
    );
  }

  const isOwner = user?.id === mission.creatorId;
  const isRegistered = user ? mission.participants.includes(user.id) : false;
  const slots = mission.slotsTotal - mission.slotsTaken;
  const fillPercent = Math.min((mission.slotsTaken / mission.slotsTotal) * 100, 100);
  const statusConf = STATUS_CONFIG[mission.status] ?? { label: mission.status, color: '#6B7280', icon: 'help-outline' };
  const canRegister = mission.status === 'open' && (isRegistered || slots > 0);


  const toggleRegistration = () => {
    if (!user) return;

    if (isOwner) {
      showToast('En tant que créateur, vous ne pouvez pas vous désinscrire.', 'error');
      logParticipantChange({
        missionId: mission.id,
        actingUserId: user.id,
        targetUserId: user.id,
        action: 'attempt_unsubscribe_creator',
        details: 'Le créateur a tenté de se désinscrire de sa propre mission.',
      }).catch(() => {});
      return;
    }

    const nextParticipants = isRegistered
      ? mission.participants.filter((pid) => pid !== user.id)
      : [...mission.participants, user.id];

     toggleMutation.mutate(
      { participants: nextParticipants, slotsTaken: nextParticipants.length },
      {
        onSuccess: () => {
          logParticipantChange({
            missionId: mission.id,
            actingUserId: user.id,
            targetUserId: user.id,
            action: isRegistered ? 'remove_participant' : 'add_participant',
            details: isRegistered ? "L'utilisateur s'est désinscrit." : "L'utilisateur s'est inscrit.",
          }).catch(() => {});
          showToast(
            !isRegistered ? '✅ Inscription confirmée !' : 'Désinscription confirmée.',
            'success',
          );
        },
        onError: () => {
          showToast("Erreur lors de l'opération. Réessayez.", 'error');
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative">
          <Image
  source={
    mission.imageUrl
      ? { uri: mission.imageUrl }
      : { uri: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg' }
  }
  className="w-full h-44"
/>
          <Pressable
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: theme.colors.card }}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
          </Pressable>
          <View
            className="absolute top-4 right-4 flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: statusConf.color }}
          >
            <Ionicons name={statusConf.icon} size={13} color="#fff" />
            <Text className="text-white font-bold text-sm">{statusConf.label}</Text>
          </View>
        </View>

        <View className="p-5" style={{ backgroundColor: theme.colors.background }}>
          <Text className="text-2xl font-extrabold mb-4 leading-8" style={{ color: theme.colors.text }}>
            {mission.title}
          </Text>

          
          <View className="flex-row flex-wrap gap-2 mb-4">
            {[
              { icon: 'location-outline' as const, label: mission.city },
              { icon: 'time-outline' as const, label: `${mission.durationHours}h` },
              {
                icon: 'calendar-outline' as const,
                label: new Date(mission.date).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                }),
              },
            ].map((chip) => (
              <View
                key={chip.label}
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: theme.colors.accent }}
              >
                <Ionicons name={chip.icon} size={13} color={theme.colors.primary} />
                <Text className="text-sm font-semibold" style={{ color: theme.colors.primary }}>
                  {chip.label}
                </Text>
              </View>
            ))}
          </View>

          
          <View
            className="p-3.5 rounded-2xl mb-3"
            style={{ backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}
          >
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Ionicons name="people-circle-outline" size={14} color={theme.colors.mutedText} />
              <Text className="text-xs font-bold tracking-wider" style={{ color: theme.colors.mutedText }}>
                ORGANISATEUR
              </Text>
            </View>
            <Text className="text-base font-medium" style={{ color: theme.colors.text }}>
              {mission.organizerName}
            </Text>
          </View>

         
          <View
            className="p-3.5 rounded-2xl mb-3"
            style={{ backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}
          >
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Ionicons name="map-outline" size={14} color={theme.colors.mutedText} />
              <Text className="text-xs font-bold tracking-wider" style={{ color: theme.colors.mutedText }}>
                ADRESSE
              </Text>
            </View>
            <Text className="text-base font-medium" style={{ color: theme.colors.text }}>
              {mission.address}
            </Text>
          </View>

      
          <View
            className="p-3.5 rounded-2xl mb-3"
            style={{ backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="people-outline" size={14} color={theme.colors.mutedText} />
                <Text className="text-xs font-bold tracking-wider" style={{ color: theme.colors.mutedText }}>
                  PLACES DISPONIBLES
                </Text>
              </View>
              <Text className="text-base font-bold" style={{ color: theme.colors.primary }}>
                {mission.slotsTaken}/{mission.slotsTotal}
              </Text>
            </View>
            <View
              className="h-2 rounded-full overflow-hidden mb-1.5"
              style={{ backgroundColor: theme.colors.border }}
            >
              <View
                style={{
                  width: `${fillPercent}%`,
                  height: '100%',
                  borderRadius: 999,
                  backgroundColor: fillPercent >= 90 ? '#E74C3C' : theme.colors.primary,
                }}
              />
            </View>
            <Text className="text-sm" style={{ color: theme.colors.mutedText }}>
              {slots > 0 ? `${slots} place${slots > 1 ? 's' : ''} restante${slots > 1 ? 's' : ''}` : '🔴 Complet'}
            </Text>
          </View>

         
          <Text className="text-lg font-bold mt-1 mb-2" style={{ color: theme.colors.text }}>
            Description
          </Text>
          <Text className="text-base leading-6 mb-6" style={{ color: theme.colors.mutedText }}>
            {mission.description}
          </Text>

        
          <View className="gap-3">
            <Pressable
              onPress={toggleRegistration}
              disabled={!canRegister || toggleMutation.isPending}
              className="py-4 rounded-2xl items-center"
              style={{
                backgroundColor: canRegister
                  ? isRegistered ? theme.colors.danger : theme.colors.primary
                  : theme.colors.border,
              }}
            >
              {toggleMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name={isRegistered ? 'close-circle-outline' : 'checkmark-circle-outline'}
                    size={20}
                    color="#fff"
                  />
                  <Text className="text-white text-base font-bold">
                    {isRegistered ? 'Se désinscrire' : "S'inscrire"}
                  </Text>
                </View>
              )}
            </Pressable>

            {isOwner && (
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => router.push({ pathname: '/(tabs)/mission-edit', params: { id: String(mission.id) } })}
                  className="flex-1 py-3.5 rounded-2xl items-center flex-row justify-center gap-2"
                  style={{ backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}
                >
                  <Ionicons name="pencil-outline" size={16} color={theme.colors.text} />
                  <Text className="font-semibold text-sm" style={{ color: theme.colors.text }}>Modifier</Text>
                </Pressable>
                <Pressable
                  onPress={handleDelete}
                  className="flex-1 py-3.5 rounded-2xl items-center flex-row justify-center gap-2"
                  style={{ backgroundColor: theme.colors.card, borderWidth: 1, borderColor: '#FECACA' }}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                  <Text className="font-semibold text-sm" style={{ color: theme.colors.danger }}>Supprimer</Text>
                </Pressable>
              </View>
            )}

         
            {isOwner && mission.participants.length > 0 && (
              <View
                className="p-3.5 rounded-2xl"
                style={{ backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}
              >
                <View className="flex-row items-center gap-1.5 mb-3">
                  <Ionicons name="list-outline" size={14} color={theme.colors.mutedText} />
                  <Text className="text-xs font-bold tracking-wider" style={{ color: theme.colors.mutedText }}>
                    PARTICIPANTS
                  </Text>
                </View>
                <View className="gap-2">
                  {mission.participants.map((pid) => {
                    const participant = users.find((u) => u.id === pid);
                    const label = participant ? participant.name : `Utilisateur #${pid}`;
                    const isCreator = pid === mission.creatorId;

                    return (
                      <View key={pid} className="flex-row items-center justify-between py-1.5">
                        <View className="flex-row items-center gap-2">
                          <Ionicons name="person-circle-outline" size={20} color={theme.colors.mutedText} />
                          <Text className="text-sm font-medium" style={{ color: theme.colors.text }}>
                            {label}{isCreator ? ' (Créateur)' : ''}
                          </Text>
                        </View>
                        <Pressable
                          disabled={isCreator}
                          onPress={() => {
                            if (isCreator) {
                              showToast('Le créateur ne peut pas être retiré.', 'error');
                              return;
                            }
                            const next = mission.participants.filter((idp) => idp !== pid);
                            updateMutation.mutate(
                              { participants: next, slotsTaken: next.length },
                              {
                                onSuccess: () => {
                                  logParticipantChange({
                                    missionId: mission.id,
                                    actingUserId: user?.id ?? null,
                                    targetUserId: pid,
                                    action: 'remove_participant',
                                    details: 'Le créateur a retiré un participant.',
                                  }).catch(() => {});
                                  showToast('Participation annulée.', 'success');
                                },
                              },
                            );
                          }}
                          className="px-3 py-1.5 rounded-full"
                          style={{
                            borderWidth: 1,
                            borderColor: isCreator ? theme.colors.border : '#FECACA',
                            opacity: isCreator ? 0.5 : 1,
                          }}
                        >
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: isCreator ? theme.colors.mutedText : theme.colors.danger }}
                          >
                            {isCreator ? 'Créateur 🔒' : 'Retirer'}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}