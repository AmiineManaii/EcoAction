import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Switch, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/theme/theme';
import { useMissions } from '../../src/hooks/useMissions';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { missions } = useMissions();
  const registeredCount = user ? missions.filter((m) => m.participants.includes(user.id)).length : 0;
  const completedCount = user
    ? missions.filter((m) => m.participants.includes(user.id) && m.status === 'completed').length
    : 0;

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
       
        <View style={[styles.profileCard, { backgroundColor: theme.colors.primary }]}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.name ?? 'EcoAction User'}</Text>
          <Text style={styles.email}>{user?.email ?? 'utilisateur@ecoaction.app'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🌿 Éco-bénévole</Text>
            </View>
          </View>
        </View>

        
        <View style={[styles.statsContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: theme.colors.primary }]}>{registeredCount}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.mutedText }]}>Inscriptions</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: theme.colors.primary }]}>{completedCount}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.mutedText }]}>Complétées</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: theme.colors.primary }]}>
              {registeredCount * 2}h
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.mutedText }]}>Bénévolat</Text>
          </View>
        </View>

        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>PRÉFÉRENCES</Text>

          <View style={[styles.settingRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingEmoji}>{theme.mode === 'dark' ? '🌙' : '☀️'}</Text>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  {theme.mode === 'dark' ? 'Mode sombre' : 'Mode clair'}
                </Text>
                <Text style={[styles.settingDesc, { color: theme.colors.mutedText }]}>
                  Changer l'apparence de l'app
                </Text>
              </View>
            </View>
            <Switch
              value={theme.mode === 'dark'}
              onValueChange={toggleTheme}
              thumbColor={theme.mode === 'dark' ? theme.colors.primaryLight : '#f9fafb'}
              trackColor={{ false: '#d1d5db', true: theme.colors.primary }}
            />
          </View>
        </View>

     
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>COMPTE</Text>

          {user ? (
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutBtn,
                { opacity: pressed ? 0.8 : 1, borderColor: theme.colors.danger },
              ]}
            >
              <Text style={styles.logoutEmoji}>🚪</Text>
              <Text style={[styles.logoutText, { color: theme.colors.danger }]}>Se déconnecter</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/auth/login')}
              style={[styles.loginBtn, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.loginText}>Se connecter</Text>
            </Pressable>
          )}
        </View>

       
        <Text style={[styles.footer, { color: theme.colors.mutedText }]}>
          🌍 EcoAction • Agir pour la planète
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  profileCard: {
    alignItems: 'center',
    padding: 32,
    paddingTop: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 16,
  },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', marginBottom: 12 },
  name: { color: '#fff', fontSize: 22, fontWeight: '800' },
  email: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  badgeRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },
  divider: { width: 1, marginHorizontal: 8 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingEmoji: { fontSize: 24 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingDesc: { fontSize: 12, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  logoutEmoji: { fontSize: 18 },
  logoutText: { fontSize: 16, fontWeight: '700' },
  loginBtn: { padding: 16, borderRadius: 16, alignItems: 'center' },
  loginText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { textAlign: 'center', padding: 24, fontSize: 13 },
});
