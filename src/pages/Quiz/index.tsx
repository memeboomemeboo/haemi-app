import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getQuizQuestions,
  submitQuizAnswer,
  endQuizSession,
  type QuizQuestion,
} from '@/shared/api/quiz';
import { BottomNavigation } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';
import { Circle } from '@/widgets/QuizAnswerCard/Circle';

// Figma MCP 에셋들 (localhost:3845)
const QUIZ_EMOJI = 'http://localhost:3845/assets/596d86be093839995361d77d7ec263267d8fbce7.png';

// Fallback 모의 데이터 (API 미연결 시)
const FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: '길고양이 급식소는 아무곳에나 설치해도 된다.',
    correctAnswer: 'X',
    explanation: '급식소는 허락받은 장소에 설치하고 깨끗하게 관리해야 해요.',
  },
];

type QuizMode = 'loading' | 'active' | 'completed';

interface SessionStats {
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  averageResponseTime: number;
}

export default function QuizScreen() {
  const [questions, setQuestions] = useState<QuizQuestion[]>(FALLBACK_QUESTIONS);
  const [mode, setMode] = useState<QuizMode>('loading');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<'O' | 'X' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<SessionStats | null>(null);

  // API에서 문제 로드
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setMode('loading');
        const data = await getQuizQuestions({ limit: 10 });
        setQuestions(data.length > 0 ? data : FALLBACK_QUESTIONS);
        setMode('active');
      } catch (error) {
        console.warn('Failed to load quiz questions from API, using fallback data');
        setQuestions(FALLBACK_QUESTIONS);
        setMode('active');
      }
    };

    loadQuestions();
  }, []);

  const question = questions[currentIndex];
  const isCorrect = userAnswer === question.correctAnswer;
  const progress = currentIndex + 1;
  const total = questions.length;

  const handleAnswer = async (answer: 'O' | 'X') => {
    setUserAnswer(answer);
    setAnswered(true);

    // 답변을 API로 전송
    try {
      setIsSubmitting(true);
      const question = questions[currentIndex];
      await submitQuizAnswer(question.id, answer);
    } catch (error) {
      console.warn('Failed to submit answer', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const isLastQuestion = currentIndex === questions.length - 1;

    if (isLastQuestion) {
      // 마지막 문제: 세션 종료 및 결과 표시
      try {
        setIsSubmitting(true);
        // TODO: sessionId로 세션 종료 및 결과 가져오기
        // const sessionResult = await endQuizSession(sessionId || '');
        // setStats({
        //   totalQuestions: sessionResult.totalQuestions,
        //   correctCount: sessionResult.correctCount,
        //   accuracy: sessionResult.accuracy,
        //   averageResponseTime: sessionResult.averageResponseTime,
        // });
        setMode('completed');
      } catch (error) {
        console.warn('Failed to end session', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // 다음 문제로 이동
      setCurrentIndex(currentIndex + 1);
      setUserAnswer(null);
      setAnswered(false);
    }
  };

  const handleRestart = () => {
    setMode('loading');
    setCurrentIndex(0);
    setUserAnswer(null);
    setAnswered(false);
    setStats(null);
    // 다시 로드
    window.location.reload?.();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.headerWrapper}>
          <HomeHeader style={styles.header} />
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.title}>인지 훈련</Text>

          {mode === 'loading' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fd6941" />
              <Text style={styles.loadingText}>문제를 준비하고 있어요...</Text>
            </View>
          )}

          {mode === 'active' && (
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
                  style={[
                    styles.answerCard,
                    userAnswer === 'O' && styles.answerCardSelected,
                  ]}
                  onPress={() => handleAnswer('O')}
                  disabled={answered}
                >
                  <Text style={styles.answerTextO}>O</Text>
                  <View style={styles.circleBadgeO}>
                    <Circle type="Check" />
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
          )}

          {mode === 'completed' && (
            <View style={styles.completedContainer}>
              <View style={styles.completedContent}>
                <Text style={styles.completedTitle}>완료!</Text>
                <Text style={styles.completedSubtitle}>
                  {questions.length}개 문제를 모두 풀었어요
                </Text>

                {stats && (
                  <View style={styles.statsBox}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>정답률</Text>
                      <Text style={styles.statValue}>{stats.accuracy}%</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>정답</Text>
                      <Text style={styles.statValue}>
                        {stats.correctCount} / {stats.totalQuestions}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>평균 시간</Text>
                      <Text style={styles.statValue}>
                        {stats.averageResponseTime.toFixed(1)}초
                      </Text>
                    </View>
                  </View>
                )}

                <Pressable
                  style={({ pressed }) => [
                    styles.restartButton,
                    pressed && styles.nextButtonPressed,
                  ]}
                  onPress={handleRestart}
                  disabled={isSubmitting}
                >
                  <Text style={styles.restartButtonText}>다시 풀기</Text>
                </Pressable>
              </View>
            </View>
          )}
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
  answerCard: {
    width: 151,
    height: 181,
    borderRadius: 6.688,
    backgroundColor: '#fff3f0',
  },
  answerCardSelected: {
    borderWidth: 0.4,
    borderColor: '#fd6941',
    shadowColor: '#fd6941',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  answerText: {
    position: 'absolute',
    fontSize: 64,
    fontWeight: '500',
    color: '#fd6941',
    letterSpacing: -1.28,
    lineHeight: 64,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.32,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  completedContent: {
    alignItems: 'center',
    gap: 28,
  },
  completedTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fd6941',
    letterSpacing: -0.64,
  },
  completedSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3c3e3f',
    letterSpacing: -0.36,
    textAlign: 'center',
  },
  statsBox: {
    width: '100%',
    gap: 16,
    paddingHorizontal: 20,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.28,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fd6941',
    letterSpacing: -0.28,
  },
  restartButton: {
    height: 42,
    width: '100%',
    backgroundColor: '#fd6941',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  restartButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
});
