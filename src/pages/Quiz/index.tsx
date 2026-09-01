import { Image } from 'expo-image';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Arrow } from '@/shared/ui';
import { uploadMediaFile } from '@/shared/api';
import { useAndroidBackHandler } from '@/shared/hooks';

import { COLORS, QUIZ_COMPLETE_IMAGE, QUIZ_FEEDBACK_CORRECT_IMAGE } from './constants';
import { type QuizAnswerValue, useQuiz } from './model/useQuiz';

export default function QuizScreen() {
  const router = useRouter();
  const {
    answerMode,
    answerOptions,
    answerQuestion,
    answerWithVoice,
    errorMessage,
    feedbackMessage,
    goToNext,
    hasAnswered,
    isSubmitting,
    mode,
    progress,
    progressPercent,
    question,
    retry,
    result,
    selectedAnswer,
    total,
  } = useQuiz();
  const [textAnswer, setTextAnswer] = useState('');

  const handleComplete = () => {
    router.replace('/elder-home' as Href);
  };

  useAndroidBackHandler(
    useCallback(() => {
      router.replace('/elder-home' as Href);
      return true;
    }, [router]),
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.screen}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이전으로"
              hitSlop={8}
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Arrow color={COLORS.text} size={34} style={styles.backIcon} />
              <Text style={styles.headerText}>이전으로</Text>
            </Pressable>
            <Text style={styles.headerText}>퀴즈</Text>
          </View>

          {mode === 'loading' ? (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>문제를 준비하고 있어요...</Text>
            </View>
          ) : mode === 'error' ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>인지 훈련을 시작할 수 없어요</Text>
              <Text style={styles.errorText}>
                {errorMessage ?? '잠시 후 다시 시도해주세요.'}
              </Text>
              <RetryButton label="다시 시도" onPress={retry} />
            </View>
          ) : mode === 'active' && question ? (
            <View style={styles.content}>
              <ProgressBar progress={progress} progressPercent={progressPercent} total={total} />

              <View style={styles.quizContent}>
                <View style={styles.questionGroup}>
                  <Text style={styles.questionText}>
                    <Text style={styles.questionPrefix}>Q. </Text>
                    {question.question}
                  </Text>
                  {question.imageKey && (
                    <Image
                      source={resolveQuestionImage(question.imageKey)}
                      style={styles.questionImage}
                      contentFit="cover"
                    />
                  )}
                  {question.hint && <Text style={styles.hintText}>💡 {question.hint}</Text>}

                  {answerMode === 'TEXT_OR_VOICE' ? (
                    <LanguageAnswer
                      key={question.id}
                      disabled={hasAnswered || isSubmitting}
                      textAnswer={textAnswer}
                      onChangeText={setTextAnswer}
                      onSubmitText={() => {
                        answerQuestion(textAnswer.trim());
                        setTextAnswer('');
                      }}
                      onSubmitVoice={answerWithVoice}
                    />
                  ) : (
                    <View style={styles.answersRow}>
                      {answerOptions.map((answer, index) => (
                        <AnswerCard
                          key={`${answer}-${index}`}
                          answer={answer}
                          disabled={hasAnswered || isSubmitting}
                          isSelected={selectedAnswer === answer}
                          onPress={() => answerQuestion(answer)}
                        />
                      ))}
                    </View>
                  )}
                </View>

                {hasAnswered && (
                  <View style={styles.feedbackCard}>
                    <Image
                      source={QUIZ_FEEDBACK_CORRECT_IMAGE}
                      style={styles.feedbackImage}
                      contentFit="contain"
                    />
                    <View style={styles.feedbackCopy}>
                      <Text style={styles.feedbackTitle}>답변을 기록했어요</Text>
                      <Text style={styles.feedbackText}>
                        {feedbackMessage ?? '다음 문제로 넘어가볼까요?'}
                      </Text>
                    </View>
                  </View>
                )}
                {errorMessage && <Text style={styles.submitErrorText}>{errorMessage}</Text>}
              </View>

              <PrimaryButton
                label="다음으로"
                disabled={!hasAnswered || isSubmitting}
                onPress={goToNext}
              />
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.completeContent}>
                <Image
                  source={QUIZ_COMPLETE_IMAGE}
                  style={styles.completeImage}
                  contentFit="contain"
                />
                <Text style={styles.completeText}>
                  오늘의 <Text style={styles.highlightText}>인지 훈련</Text>을{'\n'}
                  <Text style={styles.highlightText}>완료</Text>하셨어요!
                </Text>
                {result && (
                  <View style={styles.resultCard}>
                    <ResultItem
                      label="함께한 시간"
                      value={formatParticipationTime(result.participationSeconds)}
                    />
                    <View style={styles.resultDivider} />
                    <ResultItem
                      label="기억해낸 사진"
                      value={`${result.delayedRecallSuccessCount}개`}
                    />
                  </View>
                )}
                {(result?.unlockedBadges.length ?? 0) > 0 && (
                  <View style={styles.badgeNotice}>
                    <Text style={styles.badgeEmoji}>🏅</Text>
                    <Text style={styles.badgeNoticeText}>새로운 꾸준함 배지를 받았어요!</Text>
                  </View>
                )}
              </View>

              <PrimaryButton label="홈으로" onPress={handleComplete} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const sampleQuestionImage = require('../../../assets/images/album-sample.png');

const resolveQuestionImage = (imageKey: string) =>
  imageKey.startsWith('http') || imageKey.startsWith('file')
    ? { uri: imageKey }
    : sampleQuestionImage;

const formatParticipationTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}분 ${remainingSeconds}초` : `${remainingSeconds}초`;
};

const ResultItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.resultItem}>
    <Text style={styles.resultValue}>{value}</Text>
    <Text style={styles.resultLabel}>{label}</Text>
  </View>
);

interface LanguageAnswerProps {
  disabled: boolean;
  textAnswer: string;
  onChangeText: (value: string) => void;
  onSubmitText: () => void;
  onSubmitVoice: (mediaRefId: string) => Promise<void>;
}

const LanguageAnswer = ({
  disabled,
  textAnswer,
  onChangeText,
  onSubmitText,
  onSubmitVoice,
}: LanguageAnswerProps) => {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isRecording) return undefined;
    const startedAt = Date.now();
    const timer = setInterval(() => setRecordingSeconds(Math.floor((Date.now() - startedAt) / 1000)), 500);
    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(
    () => () => {
      if (recorder.isRecording) void recorder.stop().catch(() => undefined);
    },
    [recorder],
  );

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        await recorder.stop();
        setRecordedUri(recorder.uri);
        setIsRecording(false);
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        return;
      }

      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('마이크 권한이 필요해요', '음성으로 답하려면 마이크 권한을 허용해주세요.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecordingSeconds(0);
      setRecordedUri(null);
      setIsRecording(true);
    } catch {
      setIsRecording(false);
      Alert.alert('녹음할 수 없어요', '잠시 후 다시 시도해주세요.');
    }
  };

  const submitVoice = async () => {
    if (!recordedUri) return;
    try {
      setIsUploading(true);
      const upload = await uploadMediaFile({
        uri: recordedUri,
        mediaType: 'RESPONSE_VOICE',
        filename: `training-${Date.now()}.m4a`,
        contentType: 'audio/mp4',
        durationSeconds: Math.max(1, recordingSeconds),
      });
      await onSubmitVoice(upload.mediaRefId);
    } catch {
      Alert.alert('답변을 보내지 못했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.languageAnswer}>
      <View style={styles.answerModeTabs}>
        <Pressable
          onPress={() => setInputMode('voice')}
          style={[styles.answerModeTab, inputMode === 'voice' && styles.answerModeTabSelected]}
        >
          <Text style={[styles.answerModeText, inputMode === 'voice' && styles.answerModeTextSelected]}>말로 답하기</Text>
        </Pressable>
        <Pressable
          onPress={() => setInputMode('text')}
          style={[styles.answerModeTab, inputMode === 'text' && styles.answerModeTabSelected]}
        >
          <Text style={[styles.answerModeText, inputMode === 'text' && styles.answerModeTextSelected]}>글로 답하기</Text>
        </Pressable>
      </View>

      {inputMode === 'text' ? (
        <View style={styles.textAnswerContainer}>
          <TextInput
            style={styles.textAnswerInput}
            placeholder="떠오르는 이야기를 적어주세요"
            placeholderTextColor={COLORS.textAssistive}
            value={textAnswer}
            onChangeText={onChangeText}
            editable={!disabled}
            multiline
          />
          <Pressable
            disabled={disabled || textAnswer.trim().length === 0}
            onPress={onSubmitText}
            style={[styles.textSubmitButton, (disabled || !textAnswer.trim()) && styles.primaryButtonDisabled]}
          >
            <Text style={styles.textSubmitButtonText}>답변 기록하기</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.voiceAnswerContainer}>
          <Pressable
            accessibilityLabel={isRecording ? '녹음 멈추기' : '녹음 시작하기'}
            disabled={disabled || isUploading}
            onPress={() => void toggleRecording()}
            style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          >
            <Text style={styles.recordButtonIcon}>{isRecording ? '■' : '🎙️'}</Text>
          </Pressable>
          <Text style={styles.recordStatus}>
            {isRecording ? `${recordingSeconds}초 · 말씀을 듣고 있어요` : recordedUri ? '녹음이 준비됐어요' : '버튼을 눌러 말씀해주세요'}
          </Text>
          {recordedUri && !isRecording && (
            <Pressable disabled={disabled || isUploading} onPress={() => void submitVoice()} style={styles.textSubmitButton}>
              {isUploading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.textSubmitButtonText}>음성 답변 기록하기</Text>}
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

interface ProgressBarProps {
  progress: number;
  progressPercent: `${number}%`;
  total: number;
}

const ProgressBar = ({ progress, progressPercent, total }: ProgressBarProps) => {
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressPercent }]} />
      </View>
      <View style={styles.progressLabel}>
        <Text style={styles.progressCurrent}>{progress}</Text>
        <Text style={styles.progressMuted}>/</Text>
        <Text style={styles.progressMuted}>{total}</Text>
      </View>
    </View>
  );
};

interface AnswerCardProps {
  answer: QuizAnswerValue;
  disabled: boolean;
  isSelected: boolean;
  onPress: () => void;
}

const AnswerCard = ({ answer, disabled, isSelected, onPress }: AnswerCardProps) => {
  const isLongAnswer = answer.length > 2;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${answer} 선택`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.answerCard,
        isSelected && styles.answerCardSelected,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <AnswerBadge isSelected={isSelected} />
      <Text
        numberOfLines={isLongAnswer ? 2 : 1}
        adjustsFontSizeToFit={isLongAnswer}
        style={[styles.answerText, isLongAnswer && styles.answerTextLong]}
      >
        {answer}
      </Text>
    </Pressable>
  );
};

const AnswerBadge = ({ isSelected }: { isSelected: boolean }) => {
  return (
    <View style={[styles.answerBadge, isSelected && styles.answerBadgeSelected]}>
      {isSelected && <Text style={styles.answerBadgeCheck}>✓</Text>}
    </View>
  );
};

interface PrimaryButtonProps {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}

const PrimaryButton = ({ disabled = false, label, onPress }: PrimaryButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled,
        pressed && !disabled && styles.primaryButtonPressed,
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
};

interface RetryButtonProps {
  label: string;
  onPress: () => void;
}

const RetryButton = ({ label, onPress }: RetryButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.retryButton, pressed && styles.primaryButtonPressed]}
    >
      <Text style={styles.retryButtonText}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 402,
    paddingHorizontal: 19,
    paddingTop: 12,
  },
  header: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 44,
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
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 42,
    letterSpacing: -0.64,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textAssistive,
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  content: {
    flex: 1,
  },
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: 72,
    gap: 18,
  },
  errorTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.textAssistive,
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 32,
    textAlign: 'center',
  },
  progressRow: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 43,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    overflow: 'hidden',
    borderRadius: 100,
    backgroundColor: COLORS.line,
  },
  progressFill: {
    height: '100%',
    borderRadius: 100,
    backgroundColor: COLORS.primary,
  },
  progressLabel: {
    width: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 7,
  },
  progressCurrent: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    letterSpacing: -0.56,
  },
  progressMuted: {
    color: COLORS.line,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    letterSpacing: -0.56,
  },
  quizContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
  },
  questionGroup: {
    alignItems: 'center',
    gap: 18,
  },
  questionText: {
    width: '100%',
    maxWidth: 326,
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    letterSpacing: -0.56,
    textAlign: 'center',
  },
  questionPrefix: {
    color: COLORS.primary,
  },
  hintText: {
    width: '100%',
    maxWidth: 326,
    color: COLORS.textAssistive,
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
  },
  questionImage: {
    width: 242,
    height: 166,
    borderRadius: 15,
    backgroundColor: COLORS.fill,
  },
  answersRow: {
    width: 319,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 17,
  },
  answerCard: {
    width: 151,
    minHeight: 112,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: COLORS.primarySoft,
  },
  answerCardSelected: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  answerBadge: {
    position: 'absolute',
    left: 10,
    top: 10,
    width: 29,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
  },
  answerBadgeSelected: {
    borderWidth: 0,
    backgroundColor: COLORS.primary,
  },
  answerBadgeCheck: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  answerText: {
    color: COLORS.primary,
    fontSize: 42,
    fontWeight: '500',
    lineHeight: 55,
    letterSpacing: -1.28,
    textAlign: 'center',
  },
  answerTextLong: {
    width: '100%',
    paddingHorizontal: 14,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
  },
  feedbackCard: {
    height: 97,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: COLORS.fill,
  },
  feedbackImage: {
    width: 55,
    height: 55,
  },
  feedbackCopy: {
    flex: 1,
    gap: 4,
  },
  feedbackTitle: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  feedbackText: {
    color: COLORS.textAssistive,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 23,
    letterSpacing: -0.36,
  },
  submitErrorText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 26,
    textAlign: 'center',
  },
  completeContent: {
    alignItems: 'center',
    paddingTop: 56,
  },
  completeImage: {
    width: 150,
    height: 150,
    marginBottom: 44,
  },
  completeText: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    letterSpacing: -0.56,
    textAlign: 'center',
  },
  highlightText: {
    color: COLORS.primary,
  },
  resultCard: {
    width: '100%',
    minHeight: 105,
    marginTop: 34,
    paddingVertical: 18,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  resultValue: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  resultLabel: {
    color: COLORS.textAssistive,
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 23,
  },
  resultDivider: {
    width: 1,
    height: 49,
    backgroundColor: COLORS.line,
  },
  badgeNotice: {
    marginTop: 16,
    paddingHorizontal: 18,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    backgroundColor: COLORS.fill,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeNoticeText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  primaryButton: {
    height: 69,
    marginTop: 'auto',
    marginBottom: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: COLORS.primary,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    letterSpacing: -0.56,
  },
  retryButton: {
    minWidth: 157,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 30,
  },
  pressed: {
    opacity: 0.75,
  },
  textAnswerContainer: {
    width: '100%',
    gap: 16,
  },
  languageAnswer: {
    width: 326,
    gap: 14,
  },
  answerModeTabs: {
    height: 48,
    padding: 4,
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: COLORS.fill,
  },
  answerModeTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  answerModeTabSelected: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  answerModeText: {
    color: COLORS.textAssistive,
    fontSize: 17,
    fontWeight: '600',
  },
  answerModeTextSelected: {
    color: COLORS.primary,
  },
  voiceAnswerContainer: {
    alignItems: 'center',
    gap: 12,
  },
  recordButton: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 41,
    backgroundColor: COLORS.primary,
  },
  recordButtonActive: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 5,
  },
  recordButtonIcon: {
    color: COLORS.white,
    fontSize: 31,
  },
  recordStatus: {
    color: COLORS.textAssistive,
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
  },
  textAnswerInput: {
    width: '100%',
    minHeight: 120,
    padding: 18,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 30,
    textAlignVertical: 'top',
  },
  textSubmitButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  textSubmitButtonText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 30,
  },
});
