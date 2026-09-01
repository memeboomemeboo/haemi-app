import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAndroidBackHandler, useTheme } from '@/shared/hooks';
import { BackHeader } from '@/shared/ui';

import { useElderAlbum } from './model/useElderAlbum';

const sampleSource = require('../../../assets/images/album-sample.png');

const resolvePhotoSource = (imageKey?: string) =>
  imageKey && (imageKey.startsWith('http') || imageKey.startsWith('file'))
    ? { uri: imageKey }
    : sampleSource;

/** Figma node 1408:5813 — 어르신 추억앨범 목록 */
export default function ElderAlbumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors, palette } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { memories, isLoading, isError, refetch } = useElderAlbum();
  const hasFocusedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (hasFocusedRef.current) {
        void refetch();
      } else {
        hasFocusedRef.current = true;
      }
    }, [refetch]),
  );

  useAndroidBackHandler(
    useCallback(() => {
      router.replace('/elder-home');
      return true;
    }, [router]),
  );

  return (
    <View style={styles.container}>
      <BackHeader
        title="추억앨범"
        onBack={() => router.back()}
        style={[styles.header, { height: insets.top + 54, paddingTop: insets.top + 12 }]}
      />

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerFill}>
          <Text style={styles.emptyText}>추억을 불러오지 못했어요</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="추억 다시 불러오기"
            onPress={() => void refetch()}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : !memories || memories.length === 0 ? (
        <View style={styles.centerFill}>
          <Text style={styles.emptyText}>아직 남겨진 추억이 없어요</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {memories.map((memory) => (
            <Pressable
              key={memory.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/album/[id]', params: { id: memory.id } })}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.cardTop}>
                <Image
                  source={resolvePhotoSource(memory.imageKeys[0])}
                  style={styles.photo}
                  resizeMode="cover"
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardYear}>{memory.memoryYear}년</Text>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {memory.title}
                  </Text>
                </View>
              </View>
              {memory.creatorRoleLabel && (
                <View style={styles.tagRow}>
                  <View style={[styles.tag, { backgroundColor: palette.orange[90] }]}>
                    <Text style={styles.tagText}>{memory.creatorRoleLabel}</Text>
                  </View>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = ({ colors, palette }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.normal,
    },
    header: {
      paddingHorizontal: 20,
      marginBottom: 44,
    },
    pressed: {
      opacity: 0.85,
    },
    centerFill: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: '500',
      color: colors.label.assistive,
    },
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    retryText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.background.normal,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 20,
    },
    card: {
      height: 164,
      borderRadius: 15,
      backgroundColor: colors.background.normal,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
      paddingHorizontal: 17,
      paddingVertical: 15,
      gap: 15,
    },
    cardTop: {
      flexDirection: 'row',
      gap: 15,
    },
    photo: {
      width: 88,
      height: 88,
      borderRadius: 15,
    },
    cardInfo: {
      flex: 1,
      gap: 7,
      justifyContent: 'center',
    },
    cardYear: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.label.neutral,
      letterSpacing: -0.48,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.label.assistive,
      letterSpacing: -0.36,
    },
    tagRow: {
      flexDirection: 'row',
      gap: 8,
    },
    tag: {
      height: 31,
      paddingHorizontal: 10,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tagText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primary,
      letterSpacing: -0.32,
    },
  });
