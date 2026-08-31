import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlbumDetail, useAlbumItems } from '@/entities/album';
import { useTheme } from '@/shared/hooks';
import { Arrow, Profile } from '@/shared/ui';

const sampleSource = require('../../../assets/images/album-sample.png');

const DEFAULT_QUESTION = '이 사진, 기억나세요?';
const DEFAULT_SENDER_RELATION = '가족';

interface ElderAlbumDetailScreenProps {
  id: string;
}

/** Figma node 1771:2811 — 어르신 추억 상세 */
export default function ElderAlbumDetailScreen({ id }: ElderAlbumDetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { item, isLoading } = useAlbumDetail(id);
  const { data: items } = useAlbumItems();

  const nextItemId = useMemo(() => {
    if (!items || items.length === 0) return null;
    const currentIndex = items.findIndex((candidate) => candidate.id === id);
    if (currentIndex === -1) return items[0].id;
    const nextIndex = (currentIndex + 1) % items.length;
    return items[nextIndex].id === id ? null : items[nextIndex].id;
  }, [items, id]);

  const handleNextStory = () => {
    if (nextItemId) {
      router.replace({ pathname: '/album/[id]', params: { id: nextItemId } });
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="이전으로"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Arrow color={colors.label.neutral} size={34} style={styles.backIcon} />
          <Text style={styles.headerText}>이전으로</Text>
        </Pressable>
        <Text style={styles.headerText}>추억 앨범</Text>
      </View>

      {isLoading && (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!isLoading && !item && (
        <View style={styles.centerFill}>
          <Text style={styles.emptyText}>추억을 찾을 수 없어요</Text>
        </View>
      )}

      {!isLoading && item && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <View style={styles.profileLeft}>
                <Profile size={47} color={colors.primary} />
                <Text style={styles.senderName}>{item.senderRelation ?? DEFAULT_SENDER_RELATION}</Text>
              </View>
              {(item.year || item.date) && (
                <Text style={styles.year}>{item.year ?? item.date}</Text>
              )}
            </View>

            {item.memo && <Text style={styles.memo}>{item.memo}</Text>}

            <View style={styles.questionBox}>
              <Text style={styles.questionText}>
                {`" ${item.conversation?.question ?? DEFAULT_QUESTION} "`}
              </Text>
            </View>

            {item.photos && item.photos.length > 0 && (
              <View style={styles.photoRow}>
                {item.photos.slice(0, 4).map((photo, index) => (
                  <Image
                    key={`${photo}-${index}`}
                    source={item.photoUrl ? { uri: item.photoUrl } : sampleSource}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ))}
              </View>
            )}
          </View>

          <Text style={styles.prompt}>
            {`${item.senderRelation ?? DEFAULT_SENDER_RELATION}과 ${item.title} 사진이에요.\n이때 이야기 조금 들려주실래요?`}
          </Text>

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이야기 전하기"
              onPress={() => router.push('/daily-message')}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>이야기 전하기</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="다음 이야기"
              disabled={!nextItemId}
              onPress={handleNextStory}
              style={({ pressed }) => [
                styles.secondaryButton,
                !nextItemId && styles.buttonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>다음 이야기</Text>
            </Pressable>
          </View>
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
      height: 42,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    backButton: {
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backIcon: {
      transform: [{ scaleX: -1 }],
    },
    headerText: {
      color: colors.label.neutral,
      fontSize: 32,
      fontWeight: '600',
      lineHeight: 42,
      letterSpacing: -0.64,
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
      paddingBottom: 40,
      gap: 24,
      alignItems: 'center',
    },
    card: {
      width: '100%',
      borderRadius: 15,
      backgroundColor: colors.background.normal,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
      padding: 18,
      gap: 12,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    profileLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 17,
    },
    senderName: {
      fontSize: 32,
      fontWeight: '600',
      color: colors.label.neutral,
      letterSpacing: -0.64,
    },
    year: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.label.assistive,
      letterSpacing: -0.36,
    },
    memo: {
      fontSize: 24,
      fontWeight: '500',
      lineHeight: 31.2,
      letterSpacing: -0.48,
      color: colors.label.alternative,
    },
    questionBox: {
      height: 80,
      borderRadius: 15,
      borderWidth: 1.5,
      borderColor: colors.line.alternative,
      justifyContent: 'center',
      alignItems: 'center',
    },
    questionText: {
      fontSize: 24,
      fontWeight: '500',
      letterSpacing: -0.48,
      color: colors.label.neutral,
    },
    photoRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    photo: {
      width: 148,
      height: 151,
      borderRadius: 15,
    },
    prompt: {
      fontSize: 32,
      fontWeight: '600',
      lineHeight: 41.6,
      letterSpacing: -0.64,
      color: colors.label.neutral,
      textAlign: 'center',
    },
    actionRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
    },
    primaryButton: {
      flex: 1,
      height: 69,
      borderRadius: 15,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    primaryButtonText: {
      fontSize: 28,
      fontWeight: '600',
      letterSpacing: -0.56,
      color: colors.background.normal,
    },
    secondaryButton: {
      flex: 1,
      height: 69,
      borderRadius: 15,
      backgroundColor: palette.orange[90],
      justifyContent: 'center',
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: 28,
      fontWeight: '600',
      letterSpacing: -0.56,
      color: colors.primary,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });
