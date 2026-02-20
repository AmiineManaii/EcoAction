import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, KeyboardAvoidingView,
  Platform, StyleSheet, Text, TextInput, View, Pressable, StatusBar,
} from 'react-native';

import { useAuth } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/theme/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isInitializing } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [opacity] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(30));
  const { theme } = useTheme();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isInitializing && isAuthenticated) router.replace('/(tabs)');
  }, [isAuthenticated, isInitializing]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Champs manquants', 'Email et mot de passe sont obligatoires.');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur lors de la connexion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />

      <Animated.View style={{ opacity, transform: [{ translateY }], flex: 1, justifyContent: 'center' }}>
        
        <View style={styles.logoSection}>
          <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={[styles.appName, { color: theme.colors.text }]}>EcoAction</Text>
          <Text style={[styles.tagline, { color: theme.colors.mutedText }]}>
            Agissons ensemble pour la planète
          </Text>
        </View>

       
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Connexion</Text>

          
          <View style={[styles.inputWrapper, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Email"
              placeholderTextColor={theme.colors.mutedText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          
          <View style={[styles.inputWrapper, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Mot de passe"
              placeholderTextColor={theme.colors.mutedText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>

         
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: theme.colors.primary, opacity: pressed || isSubmitting ? 0.8 : 1 },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Se connecter</Text>
            )}
          </Pressable>
        </View>

      
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.mutedText }]}>Pas encore de compte ?</Text>
          <Pressable onPress={() => router.push('/auth/signup')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}> Créer un compte</Text>
          </Pressable>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: 14, marginTop: 4 },
  card: {
    borderRadius: 24, padding: 24, borderWidth: 1,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12,
  },
  inputIcon: { fontSize: 18 },
  input: { flex: 1, fontSize: 15, padding: 0 },
  submitBtn: { padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: '700' },
});