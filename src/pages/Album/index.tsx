import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlbumFilter, useAlbumItems } from '@/entities/album';
import { myPageService } from '@/shared/api';
import { useAsyncData, useTheme } from '@/shared/hooks';
import { BottomNavigation, Fab } from '@/shared/ui';
import { AlbumFilterTabs } from '@/widgets/AlbumFilterTabs';
import { AlbumGrid } from '@/widgets/AlbumGrid';
import { AlbumEmptyState } from '@/widgets/AlbumEmptyState';

const fetchGuardianProfile = () => myPageService.getProfile();

export default function AlbumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: items = [], isLoading, refetch } = useAlbumItems();
  const { data: profile } = useAsyncData(fetchGuardianProfile);
  const elders = useMemo(
    () => profile?.elders.map((elder) => ({ elderId: elder.elderId, name: elder.name })) ?? [],
    [profile],
  );
  const { filter, setFilter, filterOptions, visibleItems } = useAlbumFilter(items, elders);

  // 등록 화면에서 저장하고 돌아왔을 때 새 추억이 바로 보이도록 화면에 포커스될 때마다 다시 불러온다
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // API 연결 후에도 그대로 동작: 로딩이 끝났는데 사진이 없으면 빈 화면 표시
  const isEmpty = !isLoading && (visibleItems?.length ?? 0) === 0;

  return (
    <View style={styles.container}>
      <View style={[styles.fixedTop, { paddingTop: Math.max(insets.top, 20) + 28 }]}>
        <Text style={styles.screenTitle}>추억 앨범</Text>
        <AlbumFilterTabs options={filterOptions} value={filter} onChange={setFilter} />
      </View>

      {isEmpty ? (
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyContent}>
            <AlbumEmptyState />
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          <AlbumGrid
            items={visibleItems}
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
    emptyContent: {
      transform: [{ translateY: -28 }],
    },
    gridContent: {
      paddingTop: 31,
      paddingHorizontal: 14,
      paddingBottom: 40,
    },
    fab: {
      bottom: 124,
    },
  });
