import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

import { colors as baseColors } from './colors';

type ThemeMode = 'light' | 'dark';

type Theme = {
  mode: ThemeMode;
  colors: typeof baseColors;
};

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

// ☀️ Thème clair
const lightColors: typeof baseColors = {
  ...baseColors,
};

// 🌙 Thème sombre
const darkColors: typeof baseColors = {
  primary: '#52B788',
  primaryLight: '#74C69D',
  secondary: '#40916C',
  danger: '#E74C3C',
  background: '#0D1F17',
  text: '#E8F5EE',
  mutedText: '#74A98A',
  card: '#1A3027',
  border: '#2D4A39',
  inputBg: '#243D2F',
  chip: '#2D4A39',
  chipText: '#B7E4C7',
  accent: '#1B4332',
  shadow: '#000000',
  success: '#52B788',
  tabBar: '#1A3027',
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveInitialMode(deviceScheme: ColorSchemeName): ThemeMode {
  return deviceScheme === 'dark' ? 'dark' : 'light';
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(() => resolveInitialMode(deviceScheme));

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: {
        mode,
        colors: mode === 'dark' ? darkColors : lightColors,
      },
      toggleTheme: () => {
        setMode((current) => (current === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("ThemeProvider est requis autour de l'arbre de composants.");
  }

  return context;
}

export { ThemeProvider, useTheme };