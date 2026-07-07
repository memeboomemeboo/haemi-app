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
      {(items ?? []).map((item) => (
        <Pressable key={item.id} style={styles.card} onPress={() => onItemPress?.(item)}>
          <View style={styles.photoFrame}>
            <Image
              source={item.photoUrl ? { uri: item.photoUrl } : sampleSource}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.date}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.location}</Text>
              </View>
            </View>
            <Text style={styles.description} numberOfLines={1}>
              {item.description}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 16,
    rowGap: 28,
  },
  card: {
    width: 174,
    height: 223,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    paddingHorizontal: 11,
    justifyContent: 'center',
    gap: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
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
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3c3e3f',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#fed7cd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fd6941',
    letterSpacing: -0.28,
    lineHeight: 18,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5a5c5d',
    letterSpacing: -0.28,
    lineHeight: 18,
  },
});
