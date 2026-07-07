import type { Activity } from '../model/types';

export const MOCK_TODAY_ACTIVITIES: Activity[] = [
  { id: 'activity-1', type: 'recall', title: '오늘의 회상', status: 'completed' },
  { id: 'activity-2', type: 'quiz', title: '인지 훈련', status: 'inProgress' },
  { id: 'activity-3', type: 'letter', title: '새 추억 답장', status: 'arrived', arrivedCount: 1 },
];
