import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { guardianDailyCareService, myPageService, uploadMediaFile } from '@/shared/api';
import { useAndroidBackHandler, useAsyncData, useTheme } from '@/shared/hooks';
import { Arrow, Mic } from '@/shared/ui';

const MEMO_MAX_LENGTH = 200;

type CareMode = 'voice' | 'text';

const VOICE_RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  directory: 'document' as const,
};

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDuration(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/** Figma 1325:6129 / 1338:10387 / 1340:10612 — 하루 한마디 (보호자) */
export default function GuardianDailyMessageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { data: profile, isLoading: isLoadingElders } = useAsyncData(myPageService.getProfile);
  const elders = profile?.elders ?? null;
  const [explicitElderId, setExplicitElderId] = useState<string | null>(null);
  const selectedElderId = explicitElderId ?? elders?.[0]?.elderId ?? null;

  const [mode, setMode] = useState<CareMode>('text');
  const [memo, setMemo] = useState('');

  // 보호자는 어르신 한 명당 하루에 한 번만 보낼 수 있어, 선택한 어르신에게
  // 오늘 이미 보낸 하루 한마디가 있는지 확인한다 (텍스트/음성 구분 없이 하나로 카운트)
  const sentHistoryFetcher = useCallback(
    () => (selectedElderId ? guardianDailyCareService.getSentHistory(selectedElderId) : Promise.resolve([])),
    [selectedElderId],
  );
  const { data: sentHistory, isLoading: isCheckingSentToday } = useAsyncData(sentHistoryFetcher);
  const sentToday = sentHistory?.find((item) => item.careDate === getTodayDateString()) ?? null;

  const audioRecorder = useAudioRecorder(VOICE_RECORDING_OPTIONS);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);

  const [isSending, setIsSending] = useState(false);

  useAndroidBackHandler(
    useCallback(() => {
      router.replace('/');
      return true;
    }, [router]),
  );

  useEffect(() => {
    if (!isRecording || recordingStartedAt === null) return undefined;
    const timerId = setInterval(() => {
      setElapsedSeconds((Date.now() - recordingStartedAt) / 1000);
    }, 100);
    return () => clearInterval(timerId);
  }, [isRecording, recordingStartedAt]);

  useEffect(
    () => () => {
      if (audioRecorder.isRecording) {
        void audioRecorder.stop().catch(() => undefined);
      }
    },
    [audioRecorder],
  );

  const startRecording = async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한이 필요해요', '음성을 녹음하려면 마이크 권한을 허용해주세요.');
      return;
    }

    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await audioRecorder.prepareToRecordAsync(VOICE_RECORDING_OPTIONS);
    audioRecorder.record();

    setElapsedSeconds(0);
    setRecordingStartedAt(Date.now());
    setHasRecorded(false);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    setIsRecording(false);
    setRecordingStartedAt(null);
    setHasRecorded(true);
    setRecordedUri(audioRecorder.uri);
    setRecordedDuration(elapsedSeconds);
  };

  const handleMicPress = () => {
    if (isRecording) {
      void stopRecording().catch(() =>
        Alert.alert('녹음을 저장하지 못했어요', '잠시 후 다시 시도해주세요.'),
      );
    } else {
      void startRecording().catch(() =>
        Alert.alert('녹음을 시작하지 못했어요', '잠시 후 다시 시도해주세요.'),
      );
    }
  };

  const canSend =
    Boolean(selectedElderId) &&
    !sentToday &&
    !isSending &&
    (mode === 'text' ? memo.trim().length > 0 : hasRecorded && !isRecording);

  const handleSend = async () => {
    if (!selectedElderId || !canSend) return;

    setIsSending(true);
    try {
      if (mode === 'text') {
        await guardianDailyCareService.sendText(selectedElderId, memo.trim());
      } else if (recordedUri) {
        const { mediaRefId } = await uploadMediaFile({
          uri: recordedUri,
          mediaType: 'GUARDIAN_DAILY_CARE_VOICE',
          filename: `daily-care-${Date.now()}.m4a`,
          contentType: 'audio/m4a',
        });
        await guardianDailyCareService.sendVoice(selectedElderId, {
          mediaRefId,
          durationSeconds: Math.round(recordedDuration),
        });
      }
      Alert.alert('보냈어요', '하루 한마디를 전달했어요.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('보내지 못했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Arrow size={22} color={colors.label.neutral} style={styles.backArrow} />
        </Pressable>
        <Text style={styles.headerTitle}>하루 한마디</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tabRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="음성 녹음"
            accessibilityState={{ selected: mode === 'voice' }}
            onPress={() => setMode('voice')}
            style={[styles.tabButton, mode === 'voice' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, mode === 'voice' && styles.tabButtonTextActive]}>
              음성 녹음
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="메모"
            accessibilityState={{ selected: mode === 'text' }}
            onPress={() => setMode('text')}
            style={[styles.tabButton, mode === 'text' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, mode === 'text' && styles.tabButtonTextActive]}>
              메모
            </Text>
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>보낼 분</Text>
          {isLoadingElders ? (
            <ActivityIndicator color={colors.primary} />
          ) : !elders || elders.length === 0 ? (
            <Text style={styles.emptyText}>등록된 어르신이 없어요</Text>
          ) : (
            <View style={styles.elderRow}>
              {elders.map((elder) => {
                const isSelected = elder.elderId === selectedElderId;
                return (
                  <Pressable
                    key={elder.elderId}
                    accessibilityRole="button"
                    onPress={() => setExplicitElderId(elder.elderId)}
                    style={[styles.elderChip, isSelected && styles.elderChipSelected]}
                  >
                    <Text style={[styles.elderChipText, isSelected && styles.elderChipTextSelected]}>
                      {elder.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {isCheckingSentToday ? (
          <ActivityIndicator color={colors.primary} />
        ) : sentToday ? (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              {sentToday.type === 'TEXT'
                ? '오늘은 이미 메모로 하루 한마디를 보냈어요.'
                : '오늘은 이미 음성으로 하루 한마디를 보냈어요.'}
            </Text>
            <Text style={styles.noticeSubtext}>하루에 한 번만 보낼 수 있어요. 내일 다시 보내주세요.</Text>
          </View>
        ) : mode === 'text' ? (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>메모</Text>
            <View style={styles.memoBox}>
              <TextInput
                multiline
                maxLength={MEMO_MAX_LENGTH}
                value={memo}
                onChangeText={setMemo}
                placeholder="가족끼리 나들이에 갔던 날이에요"
                placeholderTextColor={colors.line.normal}
                style={styles.memoInput}
                textAlignVertical="top"
              />
              <Text style={styles.memoCount}>
                {memo.length}/{MEMO_MAX_LENGTH}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>음성 녹음</Text>
            <View style={styles.voiceBox}>
              {isRecording ? (
                <>
                  <Text style={styles.voiceTimer}>{formatDuration(elapsedSeconds)}</Text>
                  <Text style={styles.voiceStatus}>말씀을 듣고 있어요...</Text>
                </>
              ) : hasRecorded ? (
                <>
                  <Text style={styles.voiceTimer}>{formatDuration(recordedDuration)}</Text>
                  <Text style={styles.voiceStatus}>녹음이 끝났어요</Text>
                </>
              ) : (
                <Text style={styles.voiceStatus}>마이크를 눌러 녹음을 시작해주세요</Text>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isRecording ? '녹음 정지' : '녹음 시작'}
                onPress={handleMicPress}
                style={({ pressed }) => [
                  styles.micButton,
                  isRecording && styles.micButtonRecording,
                  pressed && styles.pressed,
                ]}
              >
                <Mic size={28} color={colors.background.normal} />
              </Pressable>

              {hasRecorded && !isRecording && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="다시 녹음"
                  onPress={handleMicPress}
                  style={styles.reRecordButton}
                >
                  <Text style={styles.reRecordText}>다시 녹음</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="취소"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="보내기"
          disabled={!canSend}
          onPress={() => void handleSend()}
          style={[styles.sendButton, !canSend && styles.buttonDisabled]}
        >
          {isSending ? (
            <ActivityIndicator color={colors.background.normal} />
          ) : (
            <Text style={styles.sendButtonText}>보내기</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = ({ colors, palette, status }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.normal,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 27,
      marginBottom: 20,
    },
    backArrow: {
      transform: [{ scaleX: -1 }],
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.label.neutral,
      letterSpacing: -0.48,
    },
    content: {
      paddingHorizontal: 29,
      paddingBottom: 40,
      gap: 32,
    },
    tabRow: {
      flexDirection: 'row',
      height: 35,
      borderRadius: 10,
      backgroundColor: colors.label.disabled,
      padding: 2,
    },
    tabButton: {
      flex: 1,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabButtonActive: {
      backgroundColor: colors.background.normal,
    },
    tabButtonText: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.label.alternative,
      letterSpacing: -0.36,
    },
    tabButtonTextActive: {
      color: colors.label.neutral,
    },
    field: {
      gap: 12,
    },
    fieldLabel: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.label.alternative,
      letterSpacing: -0.36,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.label.assistive,
    },
    elderRow: {
      flexDirection: 'row',
      gap: 8,
    },
    elderChip: {
      height: 31,
      paddingHorizontal: 14,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: colors.label.disabled,
      backgroundColor: colors.background.normal,
      justifyContent: 'center',
      alignItems: 'center',
    },
    elderChipSelected: {
      borderColor: colors.primary,
    },
    elderChipText: {
      fontSize: 20,
      fontWeight: '400',
      color: colors.line.neutral,
      letterSpacing: -0.4,
    },
    elderChipTextSelected: {
      color: colors.primary,
    },
    noticeBox: {
      borderRadius: 10,
      backgroundColor: colors.background.neutral,
      padding: 20,
      gap: 6,
    },
    noticeText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.label.neutral,
      letterSpacing: -0.36,
    },
    noticeSubtext: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.label.assistive,
    },
    memoBox: {
      height: 164,
      borderRadius: 10,
      backgroundColor: colors.background.neutral,
      overflow: 'hidden',
    },
    memoInput: {
      flex: 1,
      paddingHorizontal: 17,
      paddingTop: 15,
      paddingBottom: 24,
      fontSize: 16,
      fontWeight: '500',
      color: colors.label.assistive,
      letterSpacing: -0.32,
    },
    memoCount: {
      position: 'absolute',
      right: 12,
      bottom: 10,
      fontSize: 14,
      fontWeight: '400',
      color: colors.line.normal,
      letterSpacing: -0.28,
    },
    voiceBox: {
      minHeight: 164,
      borderRadius: 10,
      backgroundColor: colors.background.neutral,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
      paddingVertical: 24,
    },
    voiceTimer: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.label.neutral,
      letterSpacing: -0.4,
    },
    voiceStatus: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.label.assistive,
    },
    micButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    micButtonRecording: {
      backgroundColor: status.error,
    },
    reRecordButton: {
      paddingHorizontal: 16,
      paddingVertical: 6,
    },
    reRecordText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.primary,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
      paddingHorizontal: 29,
      paddingBottom: 24,
    },
    cancelButton: {
      flex: 1,
      height: 34,
      borderRadius: 5,
      backgroundColor: palette.orange[90],
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 20,
      fontWeight: '500',
      color: colors.primary,
      letterSpacing: -0.4,
    },
    sendButton: {
      flex: 1,
      height: 35,
      borderRadius: 5,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonText: {
      fontSize: 20,
      fontWeight: '500',
      color: colors.background.normal,
      letterSpacing: -0.4,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.85,
    },
  });
