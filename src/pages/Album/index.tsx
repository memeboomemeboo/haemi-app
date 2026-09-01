import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlbumElders, useAlbumFilter, useAlbumItems } from '@/entities/album';
import { useAndroidBackHandler, useTheme } from '@/shared/hooks';
import { BottomNavigation, Fab } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';
import { AlbumFilterTabs } from '@/widgets/AlbumFilterTabs';
import { AlbumGrid } from '@/widgets/AlbumGrid';
import { AlbumEmptyState } from '@/widgets/AlbumEmptyState';

export default function AlbumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: elders } = useAlbumElders();
  // 어르신별 필터링 (Figma node 1325:8142 / 1386:2794) — 접근 가능한 어르신 수만큼 탭이 생긴다
  const { filter, setFilter, filterOptions, selectedElderId } = useAlbumFilter(elders);
  const { data: items, isLoading, refetch } = useAlbumItems(selectedElderId);

  // 등록 화면에서 저장하고 돌아왔을 때, 또는 필터 탭을 바꿨을 때 다시 불러온다
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useAndroidBackHandler(
    useCallback(() => {
      router.replace('/');
      return true;
    }, [router]),
  );

  const isEmpty = !isLoading && (items?.length ?? 0) === 0;

  return (
    <View style={styles.container}>
      {/* 스크롤과 무관하게 고정되는 영역: 해미 상단바 + 타이틀 + 필터 탭 */}
      <View style={[styles.fixedTop, { paddingTop: Math.max(insets.top, 20) }]}>
        <HomeHeader style={styles.header} />
        <Text style={styles.screenTitle}>추억 앨범</Text>
        <AlbumFilterTabs options={filterOptions} value={filter} onChange={setFilter} />
      </View>

      {isEmpty ? (
        <View style={styles.emptyWrapper}>
          <AlbumEmptyState />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          <AlbumGrid
            items={items ?? []}
            onItemPress={(item) => router.push(`/album/${item.id}` as Href)}
          />
        </ScrollView>
      )}

      <Fab
        accessibilityLabel="앨범 추가"
        style={styles.fab}
        onPress={() => router.push('/album-register')}
      />

      <BottomNavigation activeTab="Album" />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.normal,
    },
    fixedTop: {
      paddingHorizontal: 16,
      backgroundColor: colors.background.normal,
    },
    header: {
      // Figma: 헤더는 좌우 26 여백(콘텐츠 16 + 10), 타이틀까지 26 간격
      paddingHorizontal: 10,
      marginBottom: 26,
    },
    screenTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.label.neutral,
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
      bottom: 124,
    },
  });
