import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { elderInboxService, getAuthToken } from '@/shared/api';
import { useAndroidBackHandler, useAsyncData, useTheme } from '@/shared/hooks';
import { BackHeader, Pause, PlayTriangle, Profile } from '@/shared/ui';

const API_ROOT = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

function resolveAudioUrl(mediaKey: string): string {
  if (/^https?:\/\//.test(mediaKey)) return mediaKey;
  if (mediaKey.startsWith('/')) return `${API_ROOT}${mediaKey}`;
  return `${API_ROOT}/api/v1/media/${encodeURIComponent(mediaKey)}`;
}

function subjectParticle(label: string): '이' | '가' {
  const lastCode = label.charCodeAt(label.length - 1);
  const isHangulSyllable = lastCode >= 0xac00 && lastCode <= 0xd7a3;
  return isHangulSyllable && (lastCode - 0xac00) % 28 !== 0 ? '이' : '가';
}

function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

/** Figma node 1881:3800 — 보호자가 보낸 하루 한마디 음성 재생 */
export default function ElderInboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: inbox, isLoading, isError, refetch } = useAsyncData(elderInboxService.getInbox);
  const messages = useMemo(
    () => inbox?.filter((item) => item.type === 'VOICE' && Boolean(item.mediaKey)) ?? [],
    [inbox],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentMessage = messages[currentIndex] ?? null;
  const [authToken, setAuthToken] = useState<string | null>(null);
  const player = useAudioPlayer(null, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);
  const pendingAutoPlayIdRef = useRef<string | null>(null);

  useAndroidBackHandler(
    useCallback(() => {
      router.replace('/elder-home');
      return true;
    }, [router]),
  );

  useEffect(() => {
    void getAuthToken().then(setAuthToken);
  }, []);

  useEffect(() => {
    if (!currentMessage?.mediaKey) return;

    player.replace({
      uri: resolveAudioUrl(currentMessage.mediaKey),
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
    pendingAutoPlayIdRef.current = currentMessage.id;
    if (!currentMessage.read) {
      void elderInboxService.markAsRead(currentMessage.id).catch(() => undefined);
    }
  }, [authToken, currentMessage, player]);

  useEffect(() => {
    if (
      status.isLoaded &&
      currentMessage &&
      pendingAutoPlayIdRef.current === currentMessage.id
    ) {
      pendingAutoPlayIdRef.current = null;
      player.play();
    }
  }, [currentMessage, player, status.isLoaded]);

  const duration = status.duration || currentMessage?.durationSeconds || 0;
  const progress = duration > 0 ? Math.min(status.currentTime / duration, 1) : 0;
  const senderLabel =
    currentMessage?.guardianRoleLabel ?? currentMessage?.guardianName ?? '가족';
  const hasNextMessage = currentIndex < messages.length - 1;

  const handleTogglePlayback = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish || (duration > 0 && status.currentTime >= duration)) {
      void player.seekTo(0).then(() => player.play());
      return;
    }
    player.play();
  };

  const handleReplay = () => {
    void player.seekTo(0).then(() => player.play());
  };

  const handleNext = () => {
    if (!hasNextMessage) return;
    player.pause();
    setCurrentIndex((index) => index + 1);
  };

  return (
    <View style={styles.container}>
      <BackHeader
        title="추억 답장"
        onBack={() => router.back()}
        style={[styles.header, { height: insets.top + 54, paddingTop: insets.top + 12 }]}
      />

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerFill}>
          <Text style={styles.stateText}>한마디를 불러오지 못했어요.</Text>
          <Pressable style={styles.retryButton} onPress={() => void refetch()}>
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : !currentMessage ? (
        <View style={styles.centerFill}>
          <Text style={styles.stateText}>아직 들을 수 있는 한마디가 없어요.</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.sender}>
            <Profile size={124} color={colors.primary} />
            <Text style={styles.senderLabel}>{senderLabel}</Text>
          </View>

          <Text style={styles.title}>
            {senderLabel}{subjectParticle(senderLabel)} 한마디를 남겼어요.
          </Text>

          <View style={styles.playerSection}>
            <View style={styles.playerCard}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={status.playing ? '일시정지' : '재생'}
                onPress={handleTogglePlayback}
                style={styles.playButton}
              >
                {status.playing ? (
                  <Pause size={20} color={colors.label.assistive} />
                ) : (
                  <PlayTriangle size={24} color={colors.label.assistive} />
                )}
              </Pressable>
              <View style={styles.track}>
                <View style={[styles.progress, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.duration}>{formatDuration(duration)}</Text>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                onPress={handleReplay}
                style={({ pressed }) => [styles.replayButton, pressed && styles.pressed]}
              >
                <Text style={styles.replayButtonText}>다시 듣기</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={!hasNextMessage}
                onPress={handleNext}
                style={({ pressed }) => [
                  styles.nextButton,
                  !hasNextMessage && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.nextButtonText}>다음 이야기</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
    },
    centerFill: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 18,
      paddingHorizontal: 20,
    },
    stateText: {
      fontSize: 20,
      fontWeight: '500',
      color: colors.label.assistive,
      textAlign: 'center',
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
    content: {
      paddingHorizontal: 20,
      paddingTop: 67,
      alignItems: 'center',
    },
    sender: {
      alignItems: 'center',
      gap: 12,
    },
    senderLabel: {
      fontSize: 36,
      lineHeight: 47,
      fontWeight: '600',
      letterSpacing: -0.72,
      color: colors.label.alternative,
    },
    title: {
      marginTop: 69,
      fontSize: 32,
      lineHeight: 42,
      fontWeight: '600',
      letterSpacing: -0.64,
      color: colors.label.neutral,
      textAlign: 'center',
    },
    playerSection: {
      width: '100%',
      marginTop: 69,
      gap: 18,
    },
    playerCard: {
      height: 94,
      borderRadius: 15,
      borderWidth: 1.5,
      borderColor: colors.line.alternative,
      paddingHorizontal: 14.5,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    playButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.fill.alternative,
      alignItems: 'center',
      justifyContent: 'center',
    },
    track: {
      flex: 1,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: colors.line.neutral,
      overflow: 'hidden',
    },
    progress: {
      height: '100%',
      borderRadius: 3.5,
      backgroundColor: colors.primary,
    },
    duration: {
      fontSize: 24,
      fontWeight: '500',
      letterSpacing: -0.48,
      color: colors.label.assistive,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 14,
    },
    replayButton: {
      flex: 1,
      height: 69,
      borderRadius: 15,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    replayButtonText: {
      fontSize: 28,
      fontWeight: '600',
      letterSpacing: -0.56,
      color: colors.background.normal,
    },
    nextButton: {
      flex: 1,
      height: 69,
      borderRadius: 15,
      backgroundColor: palette.orange[90],
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButtonText: {
      fontSize: 28,
      fontWeight: '600',
      letterSpacing: -0.56,
      color: colors.primary,
    },
    disabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.8,
    },
  });
