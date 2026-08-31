import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/hooks';
import { BackHeader, BottomNavigation } from '@/shared/ui';

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
  const { memories, isLoading, refetch } = useElderAlbum();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <View style={styles.container}>
      <BackHeader
        title="추억앨범"
        onBack={() => router.back()}
        style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}
      />

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.primary} />
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
                {memory.creatorRoleLabel && (
                  <View style={styles.tagRow}>
                    <View style={[styles.tag, { backgroundColor: palette.orange[90] }]}>
                      <Text style={styles.tagText}>{memory.creatorRoleLabel}</Text>
                    </View>
                  </View>
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <BottomNavigation activeTab="Album" />
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
      marginBottom: 24,
    },
    pressed: {
      opacity: 0.85,
    },
    centerFill: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 20,
      fontWeight: '500',
      color: colors.label.assistive,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 100,
      gap: 20,
    },
    card: {
      borderRadius: 15,
      backgroundColor: colors.background.normal,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
      padding: 15,
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
      marginTop: 6,
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
