import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { elderMemoryResponseService, uploadMediaFile } from '@/shared/api';
import { useTheme } from '@/shared/hooks';
import { Mic, Waveform } from '@/shared/ui';

const VOICE_RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  directory: 'document' as const,
};

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
    try {
      const { mediaRefId } = await uploadMediaFile({
        uri: recordedUri,
        mediaType: 'ELDER_RESPONSE_VOICE',
        filename: `voice-${Date.now()}.m4a`,
        contentType: 'audio/m4a',
      });
      await elderMemoryResponseService.postVoiceResponse(memoryId, mediaRefId);
      onSent();
    } catch {
      Alert.alert('전송하지 못했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      setIsSending(false);
    }
  };

  const canSend = hasRecorded && !isRecording && !isSending;

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
          <Mic size={48} color={colors.background.normal} />
        </Pressable>
        <Text style={styles.timer}>{formatDuration(elapsedSeconds)}</Text>

        {isRecording ? (
          <View style={styles.statusRow}>
            <Waveform size={20} color={colors.label.alternative} />
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
