import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlbumItems } from '@/entities/album';
import { useTheme } from '@/shared/hooks';
import { BackHeader, BottomNavigation } from '@/shared/ui';

const sampleSource = require('../../../assets/images/album-sample.png');

/** Figma node 1408:5813 — 어르신 추억앨범 목록 */
export default function ElderAlbumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: items, isLoading, refetch } = useAlbumItems();

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
      ) : !items || items.length === 0 ? (
        <View style={styles.centerFill}>
          <Text style={styles.emptyText}>아직 남겨진 추억이 없어요</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/album/[id]', params: { id: item.id } })}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <Image
                source={item.photoUrl ? { uri: item.photoUrl } : sampleSource}
                style={styles.photo}
                resizeMode="cover"
              />
              <View style={styles.cardInfo}>
                <Text style={styles.cardYear}>{item.year ?? item.date}</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.tags && item.tags.length > 0 && (
                  <View style={styles.tagRow}>
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <View key={`${tag}-${index}`} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
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
      backgroundColor: palette.orange[90],
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
