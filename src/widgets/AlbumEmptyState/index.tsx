import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/shared/hooks';
import { Illustration } from '@/shared/ui';

/** 앨범에 사진이 없을 때 표시 (Figma node 1326:9462 / 1386:2794) */
export const AlbumEmptyState = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.iconTitleGroup}>
        <Illustration name="emptyAlbum" width={96} height={96} />
        <Text style={styles.title}>아직 등록된 사진이 없어요</Text>
      </View>
      <Text style={styles.subtitle}>어르신께 추억을 전달드려보세요!</Text>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      width: 247,
      alignItems: 'center',
      gap: 20,
    },
    iconTitleGroup: {
      alignItems: 'center',
      gap: 9,
      width: '100%',
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.label.neutral,
      letterSpacing: -0.48,
      lineHeight: 31,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.label.assistive,
      letterSpacing: -0.32,
      lineHeight: 21,
      textAlign: 'center',
    },
  });
