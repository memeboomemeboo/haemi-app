import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AlbumItem } from '@/entities/album';
import { Profile } from '@/shared/ui';

const sampleSource = require('../../../assets/images/album-sample.png');

interface AlbumGridProps {
  items: AlbumItem[] | null;
  onItemPress?: (item: AlbumItem) => void;
}

export const AlbumGrid = ({ items, onItemPress }: AlbumGridProps) => {
  return (
    <View style={styles.grid}>
      {(items ?? []).map((item, index) => (
        <Pressable key={item.id} style={styles.card} onPress={() => onItemPress?.(item)}>
          <View style={styles.photoFrame}>
            <Image
              source={item.photoUrl ? { uri: item.photoUrl } : sampleSource}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
          <View style={styles.info}>
            <View style={styles.cardHeader}>
              <View style={styles.author}>
                <View style={styles.profile}>
                  <Profile size={16} color="#ff8463" />
                </View>
                <Text style={styles.authorText}>딸</Text>
              </View>
              <View style={[styles.status, index % 3 !== 0 && styles.statusAnswered]}>
                <Text style={[styles.statusText, index % 3 !== 0 && styles.statusTextAnswered]}>
                  {index % 3 === 0 ? '대기중' : '답변'}
                </Text>
              </View>
            </View>
            <Text style={styles.title} numberOfLines={1}>{item.description}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.date}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.location}</Text>
              </View>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    alignSelf: 'center',
    width: 337,
    maxWidth: '100%',
    gap: 16,
  },
  card: {
    width: '100%',
    height: 115,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  photoFrame: {
    width: 96,
    height: 96,
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
    width: 206,
    gap: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profile: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fed7cd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5a5c5d',
    letterSpacing: -0.32,
  },
  status: {
    minWidth: 56,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#c1c2c3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusAnswered: {
    backgroundColor: '#fd6941',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#5a5c5d',
    letterSpacing: -0.24,
  },
  statusTextAnswered: {
    color: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3c3e3f',
    letterSpacing: -0.4,
    lineHeight: 23,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    height: 25,
    paddingHorizontal: 8,
    borderRadius: 6,
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
});
