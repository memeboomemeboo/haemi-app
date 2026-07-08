import { useSyncExternalStore } from 'react';
import { Platform, useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const colorScheme = useRNColorScheme();

  if (Platform.OS === 'web' && !hasHydrated) {
    return 'light';
  }

  return colorScheme;
}
