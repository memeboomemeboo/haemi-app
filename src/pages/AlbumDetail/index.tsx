import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlbumDetail } from '@/entities/album';
import { Arrow, BottomNavigation, More } from '@/shared/ui';
import { AlbumConversation } from '@/widgets/AlbumConversation';
import { AlbumDetailPhotos } from '@/widgets/AlbumDetailPhotos';

interface AlbumDetailScreenProps {
  id: string;
}

export default function AlbumDetailScreen({ id }: AlbumDetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { item, isLoading } = useAlbumDetail(id);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.headerLeft}
          >
            <Arrow size={22} color="#3c3e3f" style={styles.backArrow} />
            <Text style={styles.headerTitle} numberOfLines={1}>
              {item?.title ?? ''}
            </Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="더보기" hitSlop={8}>
            <More size={24} color="#5a5c5d" />
          </Pressable>
        </View>
      </View>

      {isLoading && (
        <View style={styles.centerFill}>
          <ActivityIndicator color="#fd6941" />
        </View>
      )}

      {!isLoading && !item && (
        <View style={styles.centerFill}>
          <Text style={styles.notFoundText}>추억을 찾을 수 없어요</Text>
        </View>
      )}

      {!isLoading && item && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {item.photos && item.photos.length > 0 && <AlbumDetailPhotos photos={item.photos} />}

          <View style={styles.titleBlock}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{item.title}</Text>
              {item.year && (
                <View style={styles.yearBadge}>
                  <Text style={styles.yearBadgeText}>{item.year}</Text>
                </View>
              )}
            </View>

            {item.memo && (
              <View style={styles.memoBox}>
                <Text style={styles.memoLabel}>보호자 메모</Text>
                <Text style={styles.memoText}>{item.memo}</Text>
              </View>
            )}
          </View>

          {item.conversation && <AlbumConversation conversation={item.conversation} />}
        </ScrollView>
      )}

      <BottomNavigation activeTab="Album" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 31,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backArrow: {
    transform: [{ scaleX: -1 }],
  },
  headerTitle: {
    flexShrink: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#3c3e3f',
    letterSpacing: -0.48,
  },
  centerFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.36,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 40,
    gap: 46,
  },
  titleBlock: {
    gap: 13,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3c3e3f',
    letterSpacing: -0.4,
  },
  yearBadge: {
    height: 19,
    paddingHorizontal: 6,
    borderRadius: 100,
    backgroundColor: '#fed7cd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fd6941',
    letterSpacing: -0.24,
  },
  memoBox: {
    minHeight: 71,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 5,
    justifyContent: 'center',
  },
  memoLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fd6941',
    letterSpacing: -0.36,
  },
  memoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.32,
  },
});
