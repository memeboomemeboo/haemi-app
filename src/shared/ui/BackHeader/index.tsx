import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/shared/hooks';
import { Arrow } from '@/shared/ui/Icon';

interface BackHeaderProps {
  title: string;
  onBack: () => void;
  style?: StyleProp<ViewStyle>;
}

/** "‹ 이전으로 / 제목" 형태의 큰 글씨 상단바. 여백은 호출부에서 style로 지정한다. */
export function BackHeader({ title, onBack, style }: BackHeaderProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.header, style]}>
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
