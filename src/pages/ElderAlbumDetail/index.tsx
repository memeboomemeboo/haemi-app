import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/hooks';
import { BackHeader, Profile } from '@/shared/ui';
import { useElderAlbum } from '@/pages/ElderAlbum/model/useElderAlbum';
import { useElderAlbumDetail } from './model/useElderAlbumDetail';

const sampleSource = require('../../../assets/images/album-sample.png');

const DEFAULT_SENDER_LABEL = '가족';

const resolvePhotoSource = (imageKey: string) =>
  imageKey.startsWith('http') || imageKey.startsWith('file') ? { uri: imageKey } : sampleSource;

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
  const { memory, isLoading, isError, refetch } = useElderAlbumDetail(id);
  const { memories } = useElderAlbum();

  const nextItemId = useMemo(() => {
    if (!memories || memories.length === 0) return null;
    const currentIndex = memories.findIndex((candidate) => candidate.id === id);
    if (currentIndex === -1) return memories[0].id;
    const nextIndex = (currentIndex + 1) % memories.length;
    return memories[nextIndex].id === id ? null : memories[nextIndex].id;
  }, [memories, id]);

  const handleNextStory = () => {
    if (nextItemId) {
      router.replace({ pathname: '/album/[id]', params: { id: nextItemId } });
    }
  };

  return (
    <View style={styles.container}>
      <BackHeader
        title="추억 앨범"
        onBack={() => router.back()}
        style={[styles.header, { height: insets.top + 54, paddingTop: insets.top + 12 }]}
      />

      {isLoading && (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!isLoading && isError && (
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
      )}

      {!isLoading && !isError && !memory && (
        <View style={styles.centerFill}>
          <Text style={styles.emptyText}>추억을 찾을 수 없어요</Text>
        </View>
      )}

      {!isLoading && memory && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <View style={styles.profileLeft}>
                <Profile size={47} color={colors.primary} />
                <Text style={styles.senderName}>{memory.creatorRoleLabel ?? DEFAULT_SENDER_LABEL}</Text>
              </View>
              <Text style={styles.year}>{memory.memoryYear}년</Text>
            </View>

            {memory.memo && <Text style={styles.memo}>{memory.memo}</Text>}

            <View style={styles.questionBox}>
              <Text style={styles.questionText}>{`" ${memory.message} "`}</Text>
            </View>

            {memory.imageKeys && memory.imageKeys.length > 0 && (
              <View style={styles.photoRow}>
                {memory.imageKeys.slice(0, 4).map((imageKey, index) => (
                  <Image
                    key={`${imageKey}-${index}`}
                    source={resolvePhotoSource(imageKey)}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ))}
              </View>
            )}
          </View>

          <Text style={styles.prompt}>
            {`${memory.creatorRoleLabel ?? DEFAULT_SENDER_LABEL}과 ${memory.title} 사진이에요.\n이때 이야기 조금 들려주실래요?`}
          </Text>

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이야기 전하기"
              onPress={() => router.push({ pathname: '/daily-message', params: { memoryId: id } })}
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
      paddingHorizontal: 20,
      marginBottom: 30,
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
      gap: 24,
      alignItems: 'center',
    },
    card: {
      width: 348,
      minHeight: 435,
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
