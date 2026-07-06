import { useColorScheme } from 'react-native';
import { tokens } from '@/shared/constants';

type ColorScheme = 'light' | 'dark';

export const useTheme = () => {
  const colorScheme = useColorScheme() as ColorScheme | null;
  const isDark = colorScheme === 'dark';

  const colors = isDark ? tokens.colors.dark : tokens.colors.light;
  const palette = tokens.colors.palette;
  const status = tokens.colors.status;
  const typography = tokens.typography;

  return {
    isDark,
    colorScheme: colorScheme || 'light',
    colors,
    palette,
    status,
    typography,
    tokens,
  };
};
