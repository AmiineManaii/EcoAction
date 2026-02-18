import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMission, useUpdateMission } from '../../src/hooks/useMissions';
import { MissionForm } from '../../src/components/MissionForm';
import { useToast } from '../../src/components/Toast';
import { useTheme } from '../../src/theme/theme';

export default function MissionEditScreen() {
  const { id: idParam } = useLocalSearchParams<{ id?: string }>();
  const id = idParam ? Number(idParam) : undefined;
  const router = useRouter();
  const { data: mission } = useMission(id);
  const mutation = useUpdateMission(id as number);
  const { showToast } = useToast();
  const { theme } = useTheme();

  if (!id || !mission) return null;

  const handleSubmit = (values: Parameters<typeof mutation.mutate>[0]) => {
    mutation.mutate(values, {
      onSuccess: () => {
        showToast('✅ Mission mise à jour.', 'success');
        router.back();
      },
      onError: () => {
        showToast('Erreur lors de la mise à jour.', 'error');
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.colors.primary }]}>← Retour</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Modifier la mission</Text>
        <View style={{ width: 60 }} />
      </View>

      <MissionForm initialValues={mission} onSubmit={handleSubmit} submitLabel="💾 Mettre à jour" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 60 },
  backText: { fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
});