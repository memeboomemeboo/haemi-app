import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/shared/hooks';
import { Arrow } from '@/shared/ui';

interface DailyMessageHeaderProps {
  title: string;
  onBack: () => void;
}

/** Figma node 1408:5926 등 — 하루 한마디 플로우 공용 상단바 */
export function DailyMessageHeader({ title, onBack }: DailyMessageHeaderProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="이전으로"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Arrow color={colors.label.neutral} size={34} style={styles.backIcon} />
        <Text style={styles.headerText}>이전으로</Text>
      </Pressable>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    header: {
      height: 42,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 24,
      marginBottom: 44,
    },
    backButton: {
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backIcon: {
      transform: [{ scaleX: -1 }],
    },
    headerText: {
      color: colors.label.neutral,
      fontSize: 32,
      fontWeight: '600',
      lineHeight: 42,
      letterSpacing: -0.64,
    },
    pressed: {
      opacity: 0.7,
    },
  });
