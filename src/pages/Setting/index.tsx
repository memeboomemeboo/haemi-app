import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/hooks';
import { BottomNavigation } from '@/shared/ui';

export default function SettingScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={styles.title}>설정</Text>
      </View>

      <BottomNavigation activeTab="Setting" />
    </View>
  );
}

const createStyles = ({ colors }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.normal,
    },
    content: {
      flex: 1,
      paddingHorizontal: 26,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.label.neutral,
      letterSpacing: -0.48,
      lineHeight: 31,
    },
  });
