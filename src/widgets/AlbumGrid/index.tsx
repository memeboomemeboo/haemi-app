import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AlbumItem } from '@/entities/album';
import { useTheme } from '@/shared/hooks';

const sampleSource = require('../../../assets/images/album-sample.png');

interface AlbumGridProps {
  items: AlbumItem[] | null;
  onItemPress?: (item: AlbumItem) => void;
}

export const AlbumGrid = ({ items, onItemPress }: AlbumGridProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.grid}>
      {(items ?? []).map((item) => {
        const hasAnswer = Boolean(item.conversation?.answer);
        const meta = [item.location, item.date ?? item.year].filter(Boolean).join(' · ');
        return (
          <Pressable key={item.id} style={styles.card} onPress={() => onItemPress?.(item)}>
            <View style={styles.photoFrame}>
              <Image
                source={item.photoUrl ? { uri: item.photoUrl } : sampleSource}
                style={styles.photo}
                resizeMode="cover"
              />
            </View>
            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={[styles.statusBadge, hasAnswer && styles.statusBadgeAnswered]}>
                  <Text style={[styles.statusBadgeText, hasAnswer && styles.statusBadgeTextAnswered]}>
                    {hasAnswer ? '답변' : '대기중'}
                  </Text>
                </View>
              </View>
              {meta.length > 0 && (
                <Text style={styles.meta} numberOfLines={1}>
                  {meta}
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      // 홀수 개일 때 마지막 카드는 왼쪽 정렬 (Figma node 68-3864)
      justifyContent: 'flex-start',
      alignSelf: 'center',
      width: 364,
      maxWidth: '100%',
      columnGap: 16,
      rowGap: 28,
    },
    card: {
      width: 174,
      height: 195,
      backgroundColor: colors.background.normal,
      borderRadius: 15,
      paddingHorizontal: 11,
      justifyContent: 'center',
      gap: 18,
      shadowColor: colors.fill.neutral,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 5,
      elevation: 3,
    },
    photoFrame: {
      width: 152,
      height: 108,
      borderRadius: 15,
      backgroundColor: colors.background.normal,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.12,
      shadowRadius: 3,
      elevation: 2,
    },
    photo: {
      width: '100%',
      height: '100%',
      opacity: 0.9,
    },
    info: {
      gap: 8,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 4,
    },
    title: {
      flexShrink: 1,
      fontSize: 18,
      fontWeight: '600',
      color: colors.label.neutral,
      letterSpacing: -0.36,
      lineHeight: 23,
    },
    statusBadge: {
      height: 21,
      paddingHorizontal: 2,
      minWidth: 45,
      borderRadius: 15,
      backgroundColor: colors.line.normal,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusBadgeAnswered: {
      backgroundColor: colors.primary,
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.label.alternative,
      letterSpacing: -0.24,
    },
    statusBadgeTextAnswered: {
      color: colors.label.buttonText,
    },
    meta: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.primary,
      letterSpacing: -0.24,
    },
  });
