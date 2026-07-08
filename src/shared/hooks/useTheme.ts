import { useColorScheme } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/shared/constants';

type ColorScheme = 'light' | 'dark';

export const useTheme = () => {
  const colorScheme = useColorScheme() as ColorScheme | null;
  const isDark = colorScheme === 'dark';

  // Theme-aware colors
  const themeColors = isDark ? colors.dark : colors.light;
  const palette = colors.palette;
  const status = colors.status;

  return {
    isDark,
    colorScheme: colorScheme || 'light',

    // Colors
    colors: themeColors,
    palette,
    status,

    // Typography
    typography,

    // Spacing & Layout
    spacing,
    borderRadius,
  };
};
