import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Arrow } from '@/shared/ui';

import { COLORS, QUIZ_COMPLETE_IMAGE } from './constants';
import { useTraining } from './model/useTraining';

export default function QuizScreen() {
  const router = useRouter();
  const {
    mode,
    question,
    currentNumber,
    total,
    progressPercent,
    isChoiceMode,
    selectedOption,
    textAnswer,
    setTextAnswer,
    hasAnswered,
    isSubmitting,
    selectOption,
    goToNext,
    retry,
  } = useTraining();

  const handleComplete = () => {
    router.replace('/');
  };

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
            <Text style={styles.headerText}>인지 훈련</Text>
          </View>

          {mode === 'loading' ? (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>문제를 준비하고 있어요...</Text>
            </View>
          ) : mode === 'error' ? (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>문제를 불러오지 못했어요.</Text>
              <PrimaryButton label="다시 시도" onPress={retry} />
            </View>
          ) : (
            <View style={styles.content}>
              <ProgressBar
                progress={currentNumber}
                progressPercent={progressPercent}
                total={total}
              />

              {mode === 'active' && question ? (
                <>
                  <View style={styles.quizContent}>
                    <View style={styles.questionGroup}>
                      <Text style={styles.questionText}>
                        <Text style={styles.questionPrefix}>Q. </Text>
                        {question.prompt}
                      </Text>

                      {isChoiceMode ? (
                        <View style={styles.optionsColumn}>
                          {(question.options ?? []).map((option) => (
                            <OptionCard
                              key={option}
                              label={option}
                              disabled={selectedOption !== null || isSubmitting}
                              isSelected={selectedOption === option}
                              onPress={() => selectOption(option)}
                            />
                          ))}
                        </View>
                      ) : (
                        <TextInput
                          value={textAnswer}
                          onChangeText={setTextAnswer}
                          placeholder="답을 입력하세요"
                          placeholderTextColor={COLORS.textAssistive}
                          style={styles.textInput}
                          multiline
                          editable={!isSubmitting}
                        />
                      )}
                    </View>
                  </View>

                  <PrimaryButton
                    label="다음으로"
                    disabled={!hasAnswered || isSubmitting}
                    onPress={() => void goToNext()}
                  />
                </>
              ) : (
                <>
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

                  <PrimaryButton label="다음으로" onPress={handleComplete} />
                </>
              )}
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

interface OptionCardProps {
  label: string;
  disabled: boolean;
  isSelected: boolean;
  onPress: () => void;
}

const OptionCard = ({ label, disabled, isSelected, onPress }: OptionCardProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} 선택`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        isSelected && styles.optionCardSelected,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={[styles.optionBadge, isSelected && styles.optionBadgeSelected]}>
        {isSelected && <Text style={styles.optionBadgeCheck}>✓</Text>}
      </View>
      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{label}</Text>
    </Pressable>
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
    gap: 36,
  },
  questionText: {
    width: '100%',
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
  optionsColumn: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
  },
  optionCardSelected: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  optionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBadgeSelected: {
    borderWidth: 0,
    backgroundColor: COLORS.primary,
  },
  optionBadgeCheck: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  optionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.44,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  textInput: {
    minHeight: 120,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.primarySoft,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.44,
    textAlignVertical: 'top',
  },
  completeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  pressed: {
    opacity: 0.75,
  },
});
