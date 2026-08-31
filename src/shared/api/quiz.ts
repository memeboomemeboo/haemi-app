import { get, post } from './client';
import { ApiError } from './errors';
import type { SwaggerApiResponse } from '@/shared/types';

export type TrainingStatus = 'IN_PROGRESS' | 'COMPLETED';
export type TrainingStep = 'ORIENTATION' | 'RECALL' | 'LANGUAGE' | 'DELAYED_RECALL';
export type TrainingAnswerMode = 'CHOICE' | 'TEXT_OR_VOICE';

export interface TrainingQuestion {
  id: string;
  questionNumber: number;
  questionType: TrainingStep;
  answerMode: TrainingAnswerMode;
  prompt: string;
  imageKey?: string | null;
  options?: string[];
  hint?: string | null;
}

export interface TrainingResult {
  sessionId: string;
  participationSeconds: number;
  delayedRecallSuccessCount: number;
  completedAt: string;
  unlockedBadges: string[];
}

export interface TrainingSession {
  id: string;
  status: TrainingStatus;
  currentStep: TrainingStep;
  currentQuestionNumber: number;
  totalQuestionCount: number;
  startedAt: string;
  completedAt?: string | null;
  inactivityReminderSeconds?: number | null;
  feedback?: string | null;
  currentQuestion?: TrainingQuestion | null;
  result?: TrainingResult | null;
}

export interface CompleteTrainingQuestionRequest {
  sessionId: string;
  questionId: string;
  questionNumber: number;
  selectedOption?: string;
  textAnswer?: string;
  voiceMediaRefId?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerMode: TrainingAnswerMode;
  questionNumber: number;
  hint?: string | null;
  imageKey?: string | null;
}

const TRAINING_ENTER_PATH = '/elder/training/session/enter';
const ENTER_CONFLICT_RETRY_DELAY_MS = 350;

let enterSessionPromise: Promise<TrainingSession> | null = null;

const requestTrainingSession = async (): Promise<TrainingSession> => {
  try {
    const response = await post<SwaggerApiResponse<TrainingSession>>(TRAINING_ENTER_PATH);
    return response.data;
  } catch (error) {
    // 개발 모드의 React Strict Mode 등에서 직전 진입 요청과 서버 트랜잭션이
    // 겹친 경우, 세션 생성이 끝난 뒤 동일한 진입 API로 한 번만 이어간다.
    if (!(error instanceof ApiError) || error.statusCode !== 409) {
      throw error;
    }

    await new Promise<void>((resolve) => setTimeout(resolve, ENTER_CONFLICT_RETRY_DELAY_MS));

    try {
      const response = await post<SwaggerApiResponse<TrainingSession>>(TRAINING_ENTER_PATH);
      return response.data;
    } catch (retryError) {
      if (!(retryError instanceof ApiError) || retryError.statusCode !== 409) {
        throw retryError;
      }

      // 오늘 훈련을 이미 마친 사용자에게 서버가 충돌을 반환하는 경우에는
      // Swagger가 제공하는 결과 조회 API로 완료 화면을 복구한다.
      return getTrainingSessionResult();
    }
  }
};

export async function enterTrainingSession(): Promise<TrainingSession> {
  if (enterSessionPromise) {
    return enterSessionPromise;
  }

  enterSessionPromise = requestTrainingSession();

  try {
    return await enterSessionPromise;
  } finally {
    enterSessionPromise = null;
  }
}

export async function completeCurrentTrainingQuestion(
  request: CompleteTrainingQuestionRequest,
): Promise<TrainingSession> {
  const response = await post<SwaggerApiResponse<TrainingSession>>(
    '/elder/training/session/current-question/complete',
    request,
  );
  return response.data;
}

export async function getTrainingSessionResult(): Promise<TrainingSession> {
  const response = await get<SwaggerApiResponse<TrainingSession>>('/elder/training/session/result');
  return response.data;
}
