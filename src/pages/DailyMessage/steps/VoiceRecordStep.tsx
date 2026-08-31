import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { elderMemoryResponseService, uploadMediaFile } from '@/shared/api';
import { useTheme } from '@/shared/hooks';
import { Mic, Waveform } from '@/shared/ui';

const VOICE_RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  directory: 'document' as const,
};
const MAX_RECORDING_SECONDS = 60;

function formatDuration(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

interface VoiceRecordStepProps {
  memoryId: string;
  onSent: () => void;
}

/** Figma node 1408:5931 — 음성으로 이야기 전하기 (expo-audio 실제 녹음 + 서버 업로드) */
export function VoiceRecordStep({ memoryId, onSent }: VoiceRecordStepProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const audioRecorder = useAudioRecorder(VOICE_RECORDING_OPTIONS);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const isStoppingRef = useRef(false);
  const sendControllerRef = useRef<AbortController | null>(null);

  const stopRecording = useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      try {
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      } finally {
        setIsRecording(false);
        setRecordingStartedAt(null);
        setHasRecorded(uri !== null);
        setRecordedUri(uri);
      }

      if (!uri) {
        throw new Error('Recorded file URI is missing');
      }
    } finally {
      isStoppingRef.current = false;
    }
  }, [audioRecorder]);

  useEffect(() => {
    if (!isRecording || recordingStartedAt === null) return undefined;

    const timerId = setInterval(() => {
      const nextElapsedSeconds = (Date.now() - recordingStartedAt) / 1000;
      if (nextElapsedSeconds >= MAX_RECORDING_SECONDS) {
        setElapsedSeconds(MAX_RECORDING_SECONDS);
        void stopRecording().catch(() =>
          Alert.alert('녹음을 저장하지 못했어요', '잠시 후 다시 시도해주세요.'),
        );
        return;
      }
      setElapsedSeconds(nextElapsedSeconds);
    }, 100);

    return () => clearInterval(timerId);
  }, [isRecording, recordingStartedAt, stopRecording]);

  useEffect(
    () => () => {
      sendControllerRef.current?.abort();
      if (audioRecorder.isRecording) {
        void audioRecorder
          .stop()
          .then(() => setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }))
          .catch(() => undefined);
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
    setRecordedUri(null);
    setIsRecording(true);
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

  const handleReRecord = () => {
    void startRecording().catch(() =>
      Alert.alert('녹음을 시작하지 못했어요', '잠시 후 다시 시도해주세요.'),
    );
  };

  const handleSend = async () => {
    if (!recordedUri) return;

    setIsSending(true);
    const controller = new AbortController();
    sendControllerRef.current = controller;
    try {
      const { mediaRefId } = await uploadMediaFile({
        uri: recordedUri,
        mediaType: 'RESPONSE_VOICE',
        filename: `voice-${Date.now()}.m4a`,
        contentType: 'audio/mp4',
        durationSeconds: Math.max(1, Math.ceil(elapsedSeconds)),
        signal: controller.signal,
      });
      await elderMemoryResponseService.postVoiceResponse(
        memoryId,
        mediaRefId,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      onSent();
    } catch {
      if (controller.signal.aborted) return;
      Alert.alert('전송하지 못했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      if (sendControllerRef.current === controller) {
        sendControllerRef.current = null;
      }
      if (!controller.signal.aborted) {
        setIsSending(false);
      }
    }
  };

  const canSend = hasRecorded && recordedUri !== null && !isRecording && !isSending;

  return (
    <View style={styles.container}>
      <View style={styles.intro}>
        <Text style={styles.title}>편하게 말씀해주세요</Text>
        <Text style={styles.subtitle}>{`이야기를 들려주시면\n가족이 듣고 소중히 간직할거에요!`}</Text>
      </View>

      <View style={styles.recordArea}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isRecording ? '녹음 정지' : '녹음 시작'}
          onPress={handleMicPress}
          style={({ pressed }) => [styles.micCircle, pressed && styles.pressed]}
        >
          <Mic size={89} color={colors.background.normal} />
        </Pressable>
        <Text style={styles.timer}>{formatDuration(elapsedSeconds)}</Text>

        {isRecording ? (
          <View style={styles.statusRow}>
            <Waveform size={31} color={colors.label.alternative} />
            <Text style={styles.statusText}>말씀을 듣고 있어요....</Text>
          </View>
        ) : hasRecorded ? (
          <Text style={styles.statusText}>녹음이 끝났어요. 다시 들어보고 보내주세요</Text>
        ) : (
          <Text style={styles.statusText}>마이크를 눌러 녹음을 시작해주세요</Text>
        )}
      </View>

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="재녹음"
          disabled={!hasRecorded || isRecording || isSending}
          onPress={handleReRecord}
          style={[
            styles.secondaryButton,
            (!hasRecorded || isRecording || isSending) && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.secondaryButtonText}>재녹음</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="보내기"
          disabled={!canSend}
          onPress={() => void handleSend()}
          style={[styles.primaryButton, !canSend && styles.buttonDisabled]}
        >
          {isSending ? (
            <ActivityIndicator color={colors.background.normal} />
          ) : (
            <Text style={styles.primaryButtonText}>보내기</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingTop: 54,
      gap: 84,
    },
    intro: {
      alignItems: 'center',
      gap: 23,
    },
    title: {
      fontSize: 32,
      fontWeight: '600',
      lineHeight: 41.6,
      letterSpacing: -0.64,
      color: colors.label.neutral,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 24,
      fontWeight: '500',
      lineHeight: 31.2,
      letterSpacing: -0.48,
      color: colors.label.alternative,
      textAlign: 'center',
    },
    recordArea: {
      alignItems: 'center',
      gap: 32,
    },
    micCircle: {
      width: 148,
      height: 148,
      borderRadius: 74,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 25,
      elevation: 6,
    },
    timer: {
      fontSize: 24,
      fontWeight: '500',
      lineHeight: 31.2,
      letterSpacing: -0.48,
      color: colors.label.assistive,
      textAlign: 'center',
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
    },
    statusText: {
      fontSize: 24,
      fontWeight: '500',
      lineHeight: 31.2,
      letterSpacing: -0.48,
      color: colors.label.alternative,
      textAlign: 'center',
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    secondaryButton: {
      height: 69,
      width: 173,
      borderRadius: 15,
      backgroundColor: colors.line.neutral,
      justifyContent: 'center',
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: 28,
      fontWeight: '600',
      letterSpacing: -0.56,
      color: colors.label.assistive,
    },
    primaryButton: {
      height: 69,
      width: 173,
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
    buttonDisabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.85,
    },
  });
