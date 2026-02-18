import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthSession, login, register, User } from '../api/auth';

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
          setSession(parsed);
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

  // No token refresh logic needed; sessions persist until logout.

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
