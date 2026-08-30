import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { MemoryNotification } from '@/entities/elderHome';
import { useTheme } from '@/shared/hooks';
import { Mail } from '@/shared/ui';

interface ElderMemoryCardProps {
  notification: MemoryNotification;
  onPress?: () => void;
}

/** 새 추억 알림 카드 — 상태에 따라 문구가 달라진다 (Figma node 1408:5601 / 1472:3034 / 1438:2697) */
export const ElderMemoryCard = ({ notification, onPress }: ElderMemoryCardProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { title, subtitle } = getCopy(notification);
  const showBadge = notification.status === 'new' && Boolean(notification.unreadCount);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.iconCircle}>
        <Mail size={26} color={theme.colors.primary} />
        {showBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notification.unreadCount}</Text>
          </View>
        )}
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

function getCopy(notification: MemoryNotification): { title: string; subtitle: string } {
  switch (notification.status) {
    case 'new':
      return {
        title: '새 추억이 왔어요',
        subtitle: `${notification.senderLabel ?? ''}이 추억을 보냈어요`,
      };
    case 'none-new':
      return { title: '추억 앨범을 확인해요', subtitle: '추억 앨범으로 기억을 돌아봐요' };
    case 'empty':
    default:
      return { title: '추억이 없어요', subtitle: '아직 추억 앨범이 채워지지 않았어요' };
  }
}

const createStyles = ({ colors, palette }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      width: '100%',
      height: 88,
      borderRadius: 15,
      backgroundColor: colors.background.normal,
      borderWidth: 1,
      borderColor: colors.label.disabled,
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
    pressed: {
      opacity: 0.85,
    },
    iconCircle: {
      width: 50,
      height: 50,
      borderRadius: 100,
      backgroundColor: palette.orange[97],
      justifyContent: 'center',
      alignItems: 'center',
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 20,
      height: 20,
      paddingHorizontal: 4,
      borderRadius: 10,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.background.normal,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.background.normal,
    },
    textGroup: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.label.neutral,
      letterSpacing: -0.4,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.label.assistive,
      letterSpacing: -0.32,
    },
  });
