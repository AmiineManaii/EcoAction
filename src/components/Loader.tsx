import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/theme';

export function Loader() {
  const { theme } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});