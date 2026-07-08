import { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Check } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';

interface QuizQuestion {
  id: string;
  question: string;
  correctAnswer: 'O' | 'X';
  explanation: string;
}

// TODO: API 연결 시 GET /quiz/questions로 대체
const MOCK_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: '길고양이 급식소는 아무곳에나 설치해도 된다.',
    correctAnswer: 'X',
    explanation: '급식소는 흙이 빈 정소에 설치하고 깨끗하게 관리해야 해요.',
  },
];

export default function QuizScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<'O' | 'X' | null>(null);
  const [answered, setAnswered] = useState(false);

  const question = MOCK_QUESTIONS[currentIndex];
  const isCorrect = userAnswer === question.correctAnswer;
  const progress = currentIndex + 1;
  const total = MOCK_QUESTIONS.length;

  const handleAnswer = (answer: 'O' | 'X') => {
    setUserAnswer(answer);
    setAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer(null);
      setAnswered(false);
    } else {
      // TODO: 퀴즈 완료 화면으로 이동
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.headerWrapper}>
          <HomeHeader style={styles.header} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>인지 훈련</Text>

          {/* 진행도 바 */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(progress / total) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progress} / {total}
            </Text>
          </View>

          {/* 질문 */}
          <Text style={styles.question}>{question.question}</Text>

          {/* O/X 선택지 */}
          <View style={styles.answersRow}>
            <Pressable
              style={[
                styles.answerCard,
                userAnswer === 'O' && styles.answerCardSelected,
              ]}
              onPress={() => handleAnswer('O')}
              disabled={answered}
            >
              <View style={styles.answerIconContainer}>
                {userAnswer === 'O' && (
                  <View style={styles.checkmark}>
                    <Check size={28} color="#fd6941" />
                  </View>
                )}
                <Text style={styles.answerLetter}>O</Text>
              </View>
            </Pressable>

            <Pressable
              style={[
                styles.answerCard,
                userAnswer === 'X' && styles.answerCardSelected,
              ]}
              onPress={() => handleAnswer('X')}
              disabled={answered}
            >
              <Text style={styles.answerLetter}>X</Text>
            </Pressable>
          </View>

          {/* 피드백 */}
          {answered && (
            <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
              <Text style={styles.feedbackEmoji}>{isCorrect ? '✓' : '💡'}</Text>
              <View style={styles.feedbackContent}>
                <Text style={styles.feedbackTitle}>
                  {isCorrect ? '정답입니다!' : `정답은 ${question.correctAnswer}!`}
                </Text>
                <Text style={styles.feedbackExplanation}>
                  {question.explanation}
                </Text>
              </View>
            </View>
          )}

          {/* 다음 버튼 */}
          {answered && (
            <Pressable
              style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>다음으로</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>

      <BottomNavigation activeTab="Quiz" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
  },
  headerWrapper: {
    paddingHorizontal: 26,
    paddingTop: 14,
    paddingBottom: 26,
  },
  header: {
    marginBottom: 0,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 26,
    paddingBottom: 40,
    gap: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3c3e3f',
    letterSpacing: -0.48,
    lineHeight: 31,
  },
  progressContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e6e6e7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fd6941',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fd6941',
    letterSpacing: -0.32,
  },
  question: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3c3e3f',
    letterSpacing: -0.36,
    lineHeight: 28,
    textAlign: 'center',
  },
  answersRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  answerCard: {
    width: 140,
    height: 160,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderRadius: 15,
    backgroundColor: '#fff3f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerCardSelected: {
    borderColor: '#fd6941',
    backgroundColor: '#fff3f0',
  },
  answerIconContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff3f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerLetter: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fd6941',
    lineHeight: 62,
  },
  feedback: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 10,
    gap: 12,
    alignItems: 'flex-start',
  },
  feedbackCorrect: {
    backgroundColor: '#e8f5e9',
  },
  feedbackWrong: {
    backgroundColor: '#fff9e6',
  },
  feedbackEmoji: {
    fontSize: 28,
  },
  feedbackContent: {
    flex: 1,
    gap: 4,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fd6941',
    letterSpacing: -0.32,
  },
  feedbackExplanation: {
    fontSize: 14,
    fontWeight: '400',
    color: '#3c3e3f',
    letterSpacing: -0.28,
    lineHeight: 20,
  },
  nextButton: {
    height: 48,
    backgroundColor: '#fd6941',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.36,
  },
  pressed: {
    opacity: 0.85,
  },
});
