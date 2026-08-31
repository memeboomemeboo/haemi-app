import { useCallback, useEffect, useMemo, useState } from 'react';

import { getErrorMessage } from '@/shared/api';
import {
  completeCurrentTrainingQuestion,
  enterTrainingSession,
  type QuizQuestion,
  type TrainingQuestion,
  type TrainingSession,
} from '@/shared/api/quiz';

export type QuizMode = 'loading' | 'active' | 'completed' | 'error';
export type QuizAnswerValue = string;

const EMPTY_OPTIONS = ['확인했어요'];

function toQuizQuestion(question: TrainingQuestion): QuizQuestion {
  const options = question.options && question.options.length > 0 ? question.options : EMPTY_OPTIONS;

  return {
    id: question.id,
    question: question.prompt,
    options,
    answerMode: question.answerMode,
    questionNumber: question.questionNumber,
    hint: question.hint,
    imageKey: question.imageKey,
  };
}

export const useQuiz = () => {
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [pendingSession, setPendingSession] = useState<TrainingSession | null>(null);
  const [mode, setMode] = useState<QuizMode>('loading');
  const [selectedAnswer, setSelectedAnswer] = useState<QuizAnswerValue | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadInitialSession = async () => {
      try {
        const trainingSession = await enterTrainingSession();

        if (!isMounted) {
          return;
        }

        setSession(trainingSession);
        setMode(trainingSession.status === 'COMPLETED' ? 'completed' : 'active');
      } catch (caught) {
        if (!isMounted) {
          return;
        }

        setSession(null);
        setMode('error');
        setErrorMessage(getErrorMessage(caught));
      }
    };

    void loadInitialSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const retry = useCallback(async () => {
    setMode('loading');
    setSelectedAnswer(null);
    setPendingSession(null);
    setFeedbackMessage(null);
    setErrorMessage(null);

    try {
      const trainingSession = await enterTrainingSession();
      setSession(trainingSession);
      setMode(trainingSession.status === 'COMPLETED' ? 'completed' : 'active');
    } catch (caught) {
      setSession(null);
      setMode('error');
      setErrorMessage(getErrorMessage(caught));
    }
  }, []);

  const question = session?.currentQuestion ? toQuizQuestion(session.currentQuestion) : null;
  const answerOptions = question?.options ?? EMPTY_OPTIONS;
  const progress = session?.currentQuestionNumber ?? question?.questionNumber ?? 1;
  const total = session?.totalQuestionCount ?? 1;
  const progressPercent = useMemo(() => {
    const safeTotal = Math.max(1, total);
    const safeProgress = Math.min(Math.max(1, progress), safeTotal);
    return `${(safeProgress / safeTotal) * 100}%` as `${number}%`;
  }, [progress, total]);
  const hasAnswered = selectedAnswer !== null;

  const answerQuestion = useCallback(
    async (answer: QuizAnswerValue) => {
      if (!session?.currentQuestion || hasAnswered || isSubmitting) {
        return;
      }

      const currentQuestion = session.currentQuestion;
      setSelectedAnswer(answer);
      setFeedbackMessage(null);
      setErrorMessage(null);

      try {
        setIsSubmitting(true);
        const nextSession = await completeCurrentTrainingQuestion({
          sessionId: session.id,
          questionId: currentQuestion.id,
          questionNumber: currentQuestion.questionNumber,
          selectedOption: currentQuestion.answerMode === 'CHOICE' ? answer : undefined,
          textAnswer: currentQuestion.answerMode === 'TEXT_OR_VOICE' ? answer : undefined,
        });

        setPendingSession(nextSession);
        setFeedbackMessage(nextSession.feedback || '답변을 기록했어요.');
      } catch (caught) {
        setSelectedAnswer(null);
        setErrorMessage(getErrorMessage(caught));
      } finally {
        setIsSubmitting(false);
      }
    },
    [hasAnswered, isSubmitting, session],
  );

  const answerWithVoice = useCallback(
    async (voiceMediaRefId: string) => {
      if (!session?.currentQuestion || hasAnswered || isSubmitting) {
        return;
      }

      const currentQuestion = session.currentQuestion;
      setSelectedAnswer('voice');
      setFeedbackMessage(null);
      setErrorMessage(null);

      try {
        setIsSubmitting(true);
        const nextSession = await completeCurrentTrainingQuestion({
          sessionId: session.id,
          questionId: currentQuestion.id,
          questionNumber: currentQuestion.questionNumber,
          voiceMediaRefId,
        });

        setPendingSession(nextSession);
        setFeedbackMessage(nextSession.feedback || '말씀해주신 답변을 기록했어요.');
      } catch (caught) {
        setSelectedAnswer(null);
        setErrorMessage(getErrorMessage(caught));
        throw caught;
      } finally {
        setIsSubmitting(false);
      }
    },
    [hasAnswered, isSubmitting, session],
  );

  const goToNext = useCallback(() => {
    if (!hasAnswered || !pendingSession) {
      return;
    }

    setSession(pendingSession);
    setPendingSession(null);
    setSelectedAnswer(null);
    setFeedbackMessage(null);

    if (pendingSession.status === 'COMPLETED' || !pendingSession.currentQuestion) {
      setMode('completed');
      return;
    }

    setMode('active');
  }, [hasAnswered, pendingSession]);

  const answerMode = session?.currentQuestion?.answerMode ?? 'CHOICE';

  return {
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
    selectedAnswer,
    result: session?.result ?? pendingSession?.result ?? null,
    total,
  };
};
