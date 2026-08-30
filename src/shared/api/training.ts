import { get, post } from './client';
import type { SwaggerApiResponse } from '@/shared/types';

export type TrainingStatus = 'IN_PROGRESS' | 'COMPLETED';
export type TrainingStep = 'ORIENTATION' | 'RECALL' | 'LANGUAGE' | 'DELAYED_RECALL';
export type AnswerMode = 'CHOICE' | 'TEXT_OR_VOICE';

export interface TrainingQuestion {
  id: string;
  questionNumber: number;
  questionType: TrainingStep;
  answerMode: AnswerMode;
  prompt: string;
  imageKey: string | null;
  options: string[] | null;
  hint: string | null;
}

export interface TrainingResult {
  sessionId: string;
  participationSeconds: number;
  delayedRecallSuccessCount: number;
  completedAt: string;
  unlockedBadges: ('DAYS_7' | 'DAYS_30' | 'DAYS_100')[];
}

export interface TrainingSession {
  id: string;
  status: TrainingStatus;
  currentStep: TrainingStep;
  currentQuestionNumber: number;
  totalQuestionCount: number;
  startedAt: string;
  completedAt: string | null;
  inactivityReminderSeconds: number;
  feedback: string | null;
  currentQuestion: TrainingQuestion | null;
  result: TrainingResult | null;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  questionNumber: number;
  selectedOption?: string;
  textAnswer?: string;
}

export async function enterTrainingSession(): Promise<TrainingSession> {
  const res = await post<SwaggerApiResponse<TrainingSession>>('/elder/training/session/enter');
  return res.data;
}

export async function submitTrainingAnswer(req: SubmitAnswerRequest): Promise<TrainingSession> {
  const res = await post<SwaggerApiResponse<TrainingSession>>(
    '/elder/training/session/current-question/complete',
    req,
  );
  return res.data;
}

export async function getTrainingResult(): Promise<TrainingSession> {
  const res = await get<SwaggerApiResponse<TrainingSession>>('/elder/training/session/result');
  return res.data;
}
