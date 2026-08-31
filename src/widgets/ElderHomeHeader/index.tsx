import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/shared/hooks';
import { Profile } from '@/shared/ui';

interface ElderHomeHeaderProps {
  honorificName: string;
  dateLabel: string;
  onProfilePress?: () => void;
}

/** 어르신 홈 상단 인사말 (Figma node 1408:5601) */
export const ElderHomeHeader = ({ honorificName, dateLabel, onProfilePress }: ElderHomeHeaderProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.textGroup}>
        <Text style={styles.name}>{honorificName}</Text>
        <Text style={styles.date}>{dateLabel}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="프로필"
        onPress={onProfilePress}
        style={styles.profileCircle}
      >
        <Profile size={53} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
};

const createStyles = ({ colors, palette }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      width: '100%',
    },
    textGroup: {
      gap: 9,
    },
    name: {
      fontSize: 28,
      fontWeight: '600',
      color: colors.label.neutral,
      letterSpacing: -0.56,
    },
    date: {
      fontSize: 20,
      fontWeight: '500',
      color: colors.label.assistive,
      letterSpacing: -0.4,
    },
    profileCircle: {
      width: 53,
      height: 53,
      borderRadius: 100,
      backgroundColor: palette.orange[97],
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
  });
