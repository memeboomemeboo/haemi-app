import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DailyMessageNotification } from '@/entities/elderHome';
import { useTheme } from '@/shared/hooks';
import { PlayTriangle } from '@/shared/ui';

interface ElderDailyMessageCardProps {
  notification: DailyMessageNotification;
  onPress?: () => void;
}

/** 하루 한마디(음성 메시지) 알림 카드 (Figma node 1408:5601 / 1472:3034 / 1438:2697) */
export const ElderDailyMessageCard = ({ notification, onPress }: ElderDailyMessageCardProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { title, subtitle } = getCopy(notification);
  const isPending = notification.status === 'pending';

  return (
    <Pressable
      style={({ pressed }) => [styles.container, isPending && styles.containerPending, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.iconCircle}>
        <PlayTriangle size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
};

function getCopy(notification: DailyMessageNotification): { title: string; subtitle: string } {
  if (notification.status === 'received') {
    return {
      title: '하루 한마디 도착',
      subtitle: `${notification.senderLabel ?? ''}이 보낸 음성 메세지 · ${notification.durationLabel ?? ''}`,
    };
  }
  return { title: '입력된 한마디가 없어요', subtitle: '아직 음성 메시지가 오지 않았어요' };
}

const createStyles = ({ colors, palette }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      width: '100%',
      height: 88,
      borderRadius: 15,
      backgroundColor: colors.background.normal,
      borderWidth: 1.5,
      borderColor: colors.fill.neutral,
      paddingHorizontal: 25,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 22,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 2,
    },
    containerPending: {
      backgroundColor: colors.background.neutral,
    },
    pressed: {
      opacity: 0.85,
    },
    iconCircle: {
      width: 41,
      height: 41,
      marginHorizontal: 4.5,
      borderRadius: 100,
      borderWidth: 1.087,
      borderColor: colors.primary,
      backgroundColor: palette.orange[97],
      justifyContent: 'center',
      alignItems: 'center',
    },
    textGroup: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 31.2,
      color: colors.label.neutral,
      letterSpacing: -0.48,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 20.8,
      color: colors.label.alternative,
      letterSpacing: -0.32,
    },
  });
