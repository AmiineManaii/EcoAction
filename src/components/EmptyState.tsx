import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/theme';

type EmptyStateProps = { message: string };

export function EmptyState({ message }: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.center}>
      <Text style={styles.icon}>🌿</Text>
      <Text style={[styles.text, { color: theme.colors.mutedText }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  text: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});