import { useColorScheme } from './useColorScheme';
import { Colors } from '@/shared/constants/legacy-theme';

/**
 * Legacy hook for backwards compatibility
 * New code should use useTheme() from @/shared/hooks instead
 */
export function useLegacyTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  return Colors[theme];
}
