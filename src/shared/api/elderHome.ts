import { get } from './client';
import type { SwaggerApiResponse } from '@/shared/types';

export interface ElderHomeGreeting {
  totalToday: number;
  unread: number;
}

export interface ElderHomeMemory {
  id: string;
  title: string;
  firstImageKey: string | null;
  responded: boolean;
}

export interface ElderHomeTraining {
  completedToday: boolean;
  streak: number;
}

export interface ElderHomeResponse {
  greeting: ElderHomeGreeting;
  recentMemories: ElderHomeMemory[];
  training: ElderHomeTraining;
}

export async function getElderHome(): Promise<ElderHomeResponse> {
  const res = await get<SwaggerApiResponse<ElderHomeResponse>>('/elder/home');
  return res.data;
}
