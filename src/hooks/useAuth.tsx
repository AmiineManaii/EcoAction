import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthSession, login, register, User, refreshSession } from '../api/auth';

type AuthContextValue = {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = 'ecoaction.auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (stored) {
          const parsed: AuthSession = JSON.parse(stored);
          const expiresAt = new Date(parsed.accessTokenExpiresAt).getTime();

          if (expiresAt > Date.now()) {
            const refreshed = await refreshSession(parsed);
            setSession(refreshed);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed));
          } else {
            await AsyncStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch {
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, []);

  const persistSession = async (next: AuthSession | null) => {
    setSession(next);

    if (next) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  };

  useEffect(() => {
    if (!session) {
      return;
    }

    const expiresAtMs = new Date(session.accessTokenExpiresAt).getTime();
    const now = Date.now();
    const delay = Math.max(expiresAtMs - now - 60_000, 5_000);

    const id = setTimeout(() => {
      const refresh = async () => {
        try {
          const refreshed = await refreshSession(session);
          await persistSession(refreshed);
        } catch {
          await persistSession(null);
        }
      };

      refresh();
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [session]);

  const handleLogin = async (email: string, password: string) => {
    const next = await login(email, password);
    await persistSession(next);
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    const next = await register(name, email, password);
    await persistSession(next);
  };

  const handleLogout = async () => {
    await persistSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        isAuthenticated: Boolean(session),
        isInitializing,
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('AuthProvider est requis autour de l’arbre de composants.');
  }

  return context;
}

export { AuthProvider, useAuth };

