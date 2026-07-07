import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlbumItems } from '@/entities/album';
import { BottomNavigation, Plus } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';
import { AlbumFilterTabs, type AlbumFilter } from '@/widgets/AlbumFilterTabs';
import { AlbumGrid } from '@/widgets/AlbumGrid';

export default function AlbumScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<AlbumFilter>('all');
  const { items } = useAlbumItems();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(insets.top, 20) }]}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />
        <Text style={styles.screenTitle}>기억 앨범</Text>
        <AlbumFilterTabs value={filter} onChange={setFilter} />
        <View style={styles.gridWrapper}>
          <AlbumGrid items={items} />
        </View>
      </ScrollView>

      {/* 앨범 추가 플로팅 버튼 */}
      <Pressable style={styles.fab}>
        <Plus size={40} color="#f5f5f5" />
      </Pressable>

      <BottomNavigation activeTab="Album" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3c3e3f',
    letterSpacing: -0.48,
    lineHeight: 31,
    marginBottom: 16,
    paddingHorizontal: 14,
  },
  gridWrapper: {
    marginTop: 28,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 93,
    width: 47,
    height: 47,
    borderRadius: 24,
    backgroundColor: '#fd6941',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
