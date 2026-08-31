import { get, post } from './client';
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
}

export async function enterTrainingSession(): Promise<TrainingSession> {
  const response = await post<SwaggerApiResponse<TrainingSession>>('/elder/training/session/enter');
  return response.data;
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
