import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/shared/hooks';

interface ElderActivityCardProps {
  onStartPress?: () => void;
}

/** 오늘의 인지 활동 시작 카드 (Figma node 1438:2697) */
export const ElderActivityCard = ({ onStartPress }: ElderActivityCardProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.textGroup}>
        <Text style={styles.title}>오늘의 인지 활동</Text>
        <Text style={styles.subtitle}>5분이면 충분해요. 오늘도 함께 해요!</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onStartPress}
      >
        <Text style={styles.buttonText}>활동 시작하기</Text>
      </Pressable>
    </View>
  );
};

const createStyles = ({ colors, palette }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      width: '100%',
      borderRadius: 15,
      backgroundColor: palette.orange[97],
      paddingHorizontal: 16,
      paddingVertical: 19,
      gap: 22,
    },
    textGroup: {
      gap: 10,
    },
    title: {
      fontSize: 28,
      fontWeight: '600',
      color: colors.label.neutral,
      letterSpacing: -0.56,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.label.alternative,
      letterSpacing: -0.36,
    },
    button: {
      height: 37,
      borderRadius: 10,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonPressed: {
      opacity: 0.85,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.background.normal,
      letterSpacing: -0.36,
    },
  });
