import { createContext, ReactNode, useContext, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/theme';

type ToastType = 'success' | 'error';

type ToastState = {
  visible: boolean;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function ToastProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [state, setState] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'success',
  });
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setState((current) => ({ ...current, visible: false }));
    });
  };

  const showToast = (message: string, type: ToastType = 'success') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState({
      visible: true,
      message,
      type,
    });

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    timeoutRef.current = setTimeout(hide, 2800);
  };

  const backgroundColor =
    state.type === 'success' ? theme.colors.secondary : theme.colors.danger;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {state.visible && (
        <View pointerEvents="none" style={styles.overlay}>
          <Animated.View
            style={[
              styles.toast,
              {
                backgroundColor,
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <Text style={styles.toastText}>{state.message}</Text>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('ToastProvider est requis autour de l’arbre de composants.');
  }

  return context;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 200,
    maxWidth: '90%',
  },
  toastText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});

export { ToastProvider, useToast };

