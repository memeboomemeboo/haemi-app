import { useCallback, useEffect, useState } from 'react';

import {
  enterTrainingSession,
  submitTrainingAnswer,
  type TrainingQuestion,
  type TrainingSession,
} from '@/shared/api/training';

export type TrainingMode = 'loading' | 'active' | 'completed' | 'error';

export const useTraining = () => {
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [mode, setMode] = useState<TrainingMode>('loading');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setMode('loading');

    const startSession = async () => {
      try {
        const data = await enterTrainingSession();
        if (!isMounted) return;
        if (data.status === 'COMPLETED') {
          setSession(data);
          setMode('completed');
        } else {
          setSession(data);
          setMode('active');
        }
      } catch (error) {
        console.warn('Failed to start training session', error);
        if (isMounted) setMode('error');
      }
    };

    void startSession();
    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  const retry = useCallback(() => setRetryCount((c) => c + 1), []);

  const question: TrainingQuestion | null = session?.currentQuestion ?? null;
  const currentNumber = session?.currentQuestionNumber ?? 1;
  const total = session?.totalQuestionCount ?? 1;
  const progressPercent = `${(currentNumber / total) * 100}%` as `${number}%`;

  const isChoiceMode = question?.answerMode === 'CHOICE';
  const hasAnswered = isChoiceMode ? selectedOption !== null : textAnswer.trim().length > 0;

  const selectOption = useCallback(
    (option: string) => {
      if (selectedOption !== null || isSubmitting) return;
      setSelectedOption(option);
    },
    [selectedOption, isSubmitting],
  );

  const goToNext = useCallback(async () => {
    if (!hasAnswered || isSubmitting || !session || !question) return;

    setIsSubmitting(true);
    try {
      const next = await submitTrainingAnswer({
        sessionId: session.id,
        questionId: question.id,
        questionNumber: question.questionNumber,
        selectedOption: isChoiceMode ? (selectedOption ?? undefined) : undefined,
        textAnswer: !isChoiceMode ? textAnswer.trim() : undefined,
      });

      if (next.status === 'COMPLETED') {
        setSession(next);
        setMode('completed');
      } else {
        setSession(next);
        setSelectedOption(null);
        setTextAnswer('');
      }
    } catch (error) {
      console.warn('Failed to submit training answer', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [hasAnswered, isSubmitting, session, question, isChoiceMode, selectedOption, textAnswer]);

  return {
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
    feedback: session?.feedback ?? null,
  };
};
