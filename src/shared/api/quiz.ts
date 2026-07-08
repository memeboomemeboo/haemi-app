import { apiClient } from './client';

export interface QuizQuestion {
  id: string;
  question: string;
  correctAnswer: 'O' | 'X';
  explanation: string;
  category?: string;
  difficulty?: number;
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: 'O' | 'X';
  isCorrect: boolean;
  explanation: string;
  elapsedSeconds: number;
}

export interface QuizSession {
  sessionId: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  averageResponseTime: number;
}

/**
 * 퀴즈 문제 목록 조회
 * @param params - 조회 파라미터
 */
export async function getQuizQuestions(params?: {
  limit?: number;
  difficulty?: number;
  category?: string;
}): Promise<QuizQuestion[]> {
  const queryString = params
    ? `?${new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]) as [string, string][]
      ).toString()}`
    : '';

  return apiClient.get<QuizQuestion[]>(`/quiz/questions${queryString}`);
}

/**
 * 퀴즈 답변 제출
 */
export async function submitQuizAnswer(questionId: string, answer: 'O' | 'X'): Promise<QuizAnswer> {
  return apiClient.post<QuizAnswer>(`/quiz/${questionId}/answer`, { answer });
}

/**
 * 퀴즈 세션 결과 조회
 */
export async function getQuizSessionResult(sessionId: string): Promise<QuizSession> {
  return apiClient.get<QuizSession>(`/quiz/sessions/${sessionId}`);
}

/**
 * 퀴즈 세션 종료
 */
export async function endQuizSession(sessionId: string): Promise<QuizSession> {
  return apiClient.post<QuizSession>(`/quiz/sessions/${sessionId}/end`, {});
}
