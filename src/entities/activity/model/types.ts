/** 오늘의 활동 종류 — 서버와 공유하는 의미 단위 */
export type ActivityType = 'recall' | 'quiz' | 'letter';

export type ActivityStatus = 'completed' | 'inProgress' | 'arrived';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  status: ActivityStatus;
  /** status가 'arrived'일 때 도착한 개수 */
  arrivedCount?: number;
}
