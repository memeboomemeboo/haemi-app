import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Arrow } from '@/shared/ui';

import { COLORS, QUIZ_COMPLETE_IMAGE, QUIZ_FEEDBACK_CORRECT_IMAGE } from './constants';
import { type QuizAnswerValue, useQuiz } from './model/useQuiz';

export default function QuizScreen() {
  const router = useRouter();
  const {
    answerOptions,
    answerQuestion,
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
    selectedAnswer,
    total,
  } = useQuiz();

  const handleComplete = () => {
    router.replace('/elder-home' as Href);
  };

  useEffect(() => {
    if (mode === 'completed') {
      router.replace('/elder-home' as Href);
    }
  }, [mode, router]);

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
                  {question.hint && <Text style={styles.hintText}>{question.hint}</Text>}

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
              </View>

              <PrimaryButton label="홈으로" onPress={handleComplete} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

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
    gap: 24,
  },
  questionGroup: {
    alignItems: 'center',
    gap: 28,
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
    height: 181,
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
    fontSize: 64,
    fontWeight: '500',
    lineHeight: 83,
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
    paddingTop: 127,
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
});
