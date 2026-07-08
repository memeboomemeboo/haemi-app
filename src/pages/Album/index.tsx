import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlbumItems } from '@/entities/album';
import type { AlbumItem } from '@/entities/album/model/types';
import { AsyncContainer, BottomNavigation, Fab } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';
import { AlbumFilterTabs, type AlbumFilter } from '@/widgets/AlbumFilterTabs';
import { AlbumGrid } from '@/widgets/AlbumGrid';
import { AlbumEmptyState } from '@/widgets/AlbumEmptyState';

export default function AlbumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<AlbumFilter>('all');
  const albumState = useAlbumItems();

  const renderAlbumContent = (items: AlbumItem[]) => {
    const isEmpty = items.length === 0;
    return isEmpty ? <AlbumEmptyState /> : <AlbumGrid items={items} />;
  };

  return (
    <View style={styles.container}>
      {/* 스크롤과 무관하게 고정되는 영역: 해미 상단바 + 타이틀 + 필터 탭 */}
      <View style={[styles.fixedTop, { paddingTop: Math.max(insets.top, 20) }]}>
        <HomeHeader style={styles.header} />
        <Text style={styles.screenTitle}>기억 앨범</Text>
        <AlbumFilterTabs value={filter} onChange={setFilter} />
      </View>

      {/* AsyncContainer로 로딩/에러/성공 상태 관리 */}
      <AsyncContainer
        state={albumState}
        loadingMessage="앨범을 불러오는 중..."
        errorTitle="앨범 로드 실패"
        errorMessage="앨범을 불러올 수 없습니다. 다시 시도해주세요."
      >
        {(items: AlbumItem[]) => (
          <>
            {items.length === 0 ? (
              <View style={styles.emptyWrapper}>
                <AlbumEmptyState />
              </View>
            ) : (
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.gridContent}
                showsVerticalScrollIndicator={false}
              >
                <AlbumGrid items={items} />
              </ScrollView>
            )}
          </>
        )}
      </AsyncContainer>

      <Fab
        accessibilityLabel="앨범 추가"
        style={styles.fab}
        onPress={() => router.push('/album-register')}
      />

      <BottomNavigation activeTab="Album" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  fixedTop: {
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  header: {
    // Figma: 헤더는 좌우 26 여백(콘텐츠 16 + 10), 타이틀까지 26 간격
    paddingHorizontal: 10,
    marginBottom: 26,
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
  scroll: {
    flex: 1,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContent: {
    // Figma: 필터 탭(bottom 152)에서 그리드(top 195)까지 43, 그리드 폭 364(좌우 여백 14.5)
    paddingTop: 43,
    paddingHorizontal: 14,
    paddingBottom: 40,
  },
  fab: {
    bottom: 93,
  },
});
