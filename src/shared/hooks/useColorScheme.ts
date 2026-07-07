import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme, Platform } from 'react-native';

export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (Platform.OS === 'web' && !hasHydrated) {
    return 'light';
  }

  return colorScheme;
}
