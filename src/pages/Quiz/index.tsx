import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';
import { Circle } from '@/widgets/QuizAnswerCard/Circle';

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
    explanation: '급식소는 허락받은 장소에 설치하고 깨끗하게 관리해야 해요.',
  },
];

// Figma MCP 에셋들 (localhost:3845)
const QUIZ_EMOJI = 'http://localhost:3845/assets/596d86be093839995361d77d7ec263267d8fbce7.png';

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
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.headerWrapper}>
          <HomeHeader style={styles.header} />
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.title}>인지 훈련</Text>

          <View style={styles.quizSection}>
            {/* 진행도 바 섹션 (128-3119): gap 20 */}
            <View style={styles.progressRow}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(progress / total) * 100}%` },
                  ]}
                />
              </View>
              <View style={styles.progressLabel}>
                <Text style={styles.progressNumber}>{progress}</Text>
                <Text style={styles.progressSlash}> / </Text>
                <Text style={styles.progressTotal}>{total}</Text>
              </View>
            </View>

            {/* 질문 섹션 (128-3130): gap 55 */}
            <View style={styles.questionSection}>
              <Text style={styles.questionText}>
                <Text style={styles.qLabel}>Q. </Text>
                <Text>{question.question}</Text>
              </Text>

              {/* O/X 카드 (128-3132): gap 17 */}
              <View style={styles.answersRow}>
                <Pressable
                  style={styles.answerCardO}
                  onPress={() => handleAnswer('O')}
                  disabled={answered}
                >
                  <Text style={styles.answerTextO}>O</Text>
                  <View style={styles.circleBadgeO}>
                    <Circle type="Check" />
                  </View>
                </Pressable>

                <Pressable
                  style={styles.answerCardX}
                  onPress={() => handleAnswer('X')}
                  disabled={answered}
                >
                  <Text style={styles.answerTextX}>X</Text>
                  <View style={styles.circleBadgeX}>
                    <Circle type="Default" />
                  </View>
                </Pressable>
              </View>
            </View>

            {/* 피드백 + 버튼 (128-3129): gap 19 */}
            {answered && (
              <View style={styles.feedbackSection}>
                {/* 피드백 (128-3139): h 86, gap 24 */}
                <View style={styles.feedbackCard}>
                  <Image
                    source={QUIZ_EMOJI}
                    style={styles.feedbackEmoji}
                    contentFit="cover"
                  />
                  <View style={styles.feedbackText}>
                    <Text style={styles.feedbackTitle}>
                      {isCorrect ? '정답입니다!' : `정답은 ${question.correctAnswer}!`}
                    </Text>
                    <Text style={styles.feedbackExplanation}>
                      {question.explanation}
                    </Text>
                  </View>
                </View>

                {/* 버튼 (128-3146): h 42, rounded 10 */}
                <Pressable
                  style={({ pressed }) => [
                    styles.nextButton,
                    pressed && styles.nextButtonPressed,
                  ]}
                  onPress={handleNext}
                >
                  <Text style={styles.nextButtonText}>다음으로</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
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
  },
  header: {
    marginBottom: 0,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 36,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3c3e3f',
    letterSpacing: -0.48,
    lineHeight: 31,
    marginBottom: 12,
  },
  quizSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  progressRow: {
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#c1c2c3',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fd6941',
    borderRadius: 4,
  },
  progressLabel: {
    width: 50,
    flexDirection: 'row',
    gap: 4,
  },
  progressNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fd6941',
    letterSpacing: -0.4,
    width: 12,
  },
  progressSlash: {
    fontSize: 20,
    fontWeight: '600',
    color: '#c1c2c3',
    letterSpacing: -0.4,
  },
  progressTotal: {
    fontSize: 20,
    fontWeight: '600',
    color: '#c1c2c3',
    letterSpacing: -0.4,
    width: 15,
  },
  questionSection: {
    gap: 18,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#3c3e3f',
    letterSpacing: -0.4,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 8,
  },
  qLabel: {
    fontWeight: '600',
    color: '#fd6941',
  },
  answersRow: {
    flexDirection: 'row',
    gap: 17,
    marginBottom: 16,
  },
  answerCardO: {
    width: 151,
    height: 181,
    borderRadius: 6.688,
    backgroundColor: '#fff3f0',
    borderWidth: 0.4,
    borderColor: '#fd6941',
    shadowColor: '#fd6941',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  answerCardX: {
    width: 151,
    height: 181,
    borderRadius: 6.688,
    backgroundColor: '#fff3f0',
  },
  answerTextO: {
    position: 'absolute',
    fontSize: 64,
    fontWeight: '500',
    color: '#fd6941',
    letterSpacing: -1.28,
    left: 51.6,
    top: 48.6,
    lineHeight: 64,
  },
  answerTextX: {
    position: 'absolute',
    fontSize: 64,
    fontWeight: '500',
    color: '#fd6941',
    letterSpacing: -1.28,
    left: '50%',
    top: '50%',
    marginLeft: -20.5,
    marginTop: -41.5,
    lineHeight: 64,
  },
  circleBadgeO: {
    position: 'absolute',
    left: 8.6,
    top: 6.6,
    zIndex: 10,
  },
  circleBadgeX: {
    position: 'absolute',
    left: 9,
    top: 7,
    zIndex: 10,
  },
  feedbackSection: {
    gap: 12,
  },
  feedbackCard: {
    backgroundColor: '#f7f7f7',
    borderRadius: 15,
    height: 86,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  feedbackEmoji: {
    width: 42,
    height: 42,
  },
  feedbackText: {
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
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.28,
    lineHeight: 19,
  },
  // 버튼 (128-3146): h 42, rounded 10
  nextButton: {
    height: 42,
    backgroundColor: '#fd6941',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonPressed: {
    opacity: 0.85,
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
});
