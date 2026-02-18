import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCreateMission } from '../../src/hooks/useMissions';
import { MissionForm } from '../../src/components/MissionForm';
import { useToast } from '../../src/components/Toast';
import { useTheme } from '../../src/theme/theme';

export default function NewMissionScreen() {
  const router = useRouter();
  const mutation = useCreateMission();
  const { showToast } = useToast();
  const { theme } = useTheme();

  const handleSubmit = (values: Parameters<typeof mutation.mutate>[0]) => {
    mutation.mutate(values, {
      onSuccess: () => {
        showToast('🎉 Mission créée avec succès !', 'success');
        router.back();
      },
      onError: () => {
        showToast('Erreur lors de la création de la mission.', 'error');
      },
    });
  };

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

      <MissionForm onSubmit={handleSubmit} submitLabel="🌿 Publier la mission" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 70 },
  backText: { fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
});