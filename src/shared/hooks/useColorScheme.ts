<<<<<<< HEAD:src/hooks/use-color-scheme.web.ts
import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
=======
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme, Platform } from 'react-native';
>>>>>>> ad83550 (feat: 아이콘 분류):src/shared/hooks/useColorScheme.ts

export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const colorScheme = useRNColorScheme();

  if (Platform.OS === 'web' && !hasHydrated) {
    return 'light';
  }

  return colorScheme;
}
