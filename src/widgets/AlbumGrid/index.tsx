import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AlbumItem } from '@/entities/album';

const sampleSource = require('../../../assets/images/album-sample.png');

interface AlbumGridProps {
  items: AlbumItem[] | null;
  onItemPress?: (item: AlbumItem) => void;
}

export const AlbumGrid = ({ items, onItemPress }: AlbumGridProps) => {
  return (
    <View style={styles.grid}>
      {(items ?? []).map((item) => {
        const hasAnswer = Boolean(item.conversation?.answer);
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
              <Text style={styles.meta} numberOfLines={1}>
                {item.location} · {item.date}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#ffffff',
    borderRadius: 15,
    paddingHorizontal: 11,
    justifyContent: 'center',
    gap: 18,
    shadowColor: '#e6e6e7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },
  photoFrame: {
    width: 152,
    height: 108,
    borderRadius: 15,
    backgroundColor: '#ffffff',
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
    color: '#3c3e3f',
    letterSpacing: -0.36,
    lineHeight: 23,
  },
  statusBadge: {
    height: 21,
    paddingHorizontal: 2,
    minWidth: 45,
    borderRadius: 15,
    backgroundColor: '#c1c2c3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeAnswered: {
    backgroundColor: '#fd6941',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#5a5c5d',
    letterSpacing: -0.24,
  },
  statusBadgeTextAnswered: {
    color: '#f5f5f5',
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fd6941',
    letterSpacing: -0.24,
  },
});
