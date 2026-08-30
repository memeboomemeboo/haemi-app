import { useCallback, useEffect, useMemo, useState } from 'react';

import { getQuizQuestions, submitQuizAnswer, type QuizQuestion } from '@/shared/api/quiz';

import { FALLBACK_QUESTIONS, QUIZ_LIMIT } from '../constants';

export type QuizMode = 'loading' | 'active' | 'completed';
export type QuizAnswerValue = 'O' | 'X';

const normalizeQuestions = (questions: QuizQuestion[]): QuizQuestion[] => {
  const availableQuestions = questions.length > 0 ? questions : FALLBACK_QUESTIONS;

  return availableQuestions.slice(0, QUIZ_LIMIT);
};

export const useQuiz = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(FALLBACK_QUESTIONS);
  const [mode, setMode] = useState<QuizMode>('loading');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<QuizAnswerValue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadQuestions = async () => {
      try {
        const data = await getQuizQuestions({ limit: QUIZ_LIMIT });

        if (isMounted) {
          setQuestions(normalizeQuestions(data));
        }
      } catch (error) {
        console.warn('Failed to load quiz questions from API, using fallback data', error);

        if (isMounted) {
          setQuestions(FALLBACK_QUESTIONS);
        }
      } finally {
        if (isMounted) {
          setCurrentIndex(0);
          setSelectedAnswer(null);
          setMode('active');
        }
      }
    };

    void loadQuestions();

    return () => {
      isMounted = false;
    };
  }, []);

  const question = questions[currentIndex] ?? FALLBACK_QUESTIONS[0];
  const progress = currentIndex + 1;
  const total = questions.length;
  const progressPercent = useMemo(
    () => `${(progress / total) * 100}%` as `${number}%`,
    [progress, total],
  );
  const hasAnswered = selectedAnswer !== null;
  const isCorrect = hasAnswered && selectedAnswer === question.correctAnswer;
  const isLastQuestion = currentIndex === questions.length - 1;

  const answerQuestion = useCallback(
    async (answer: QuizAnswerValue) => {
      if (hasAnswered || isSubmitting) {
        return;
      }

      setSelectedAnswer(answer);

      try {
        setIsSubmitting(true);
        await submitQuizAnswer(question.id, answer);
      } catch (error) {
        console.warn('Failed to submit answer', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [hasAnswered, isSubmitting, question.id],
  );

  const goToNext = useCallback(() => {
    if (!hasAnswered) {
      return;
    }

    if (isLastQuestion) {
      setMode('completed');
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedAnswer(null);
  }, [hasAnswered, isLastQuestion]);

  return {
    answerQuestion,
    goToNext,
    hasAnswered,
    isCorrect,
    isSubmitting,
    mode,
    progress,
    progressPercent,
    question,
    selectedAnswer,
    total,
  };
};
