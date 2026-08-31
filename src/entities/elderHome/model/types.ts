/** 새 추억 알림 상태 (Figma node 1408:5601 / 1472:3034 / 1438:2697) */
export type MemoryNotificationStatus = 'new' | 'none-new' | 'empty';

export interface MemoryNotification {
  status: MemoryNotificationStatus;
  /** 안 읽은 개수 — status가 'new'일 때만 사용 */
  unreadCount?: number;
  /** 보낸 사람 (예: 딸 정은님) */
  senderLabel?: string;
  /** 탭했을 때 이동할 추억 상세 id */
  albumId?: string;
}

/** 어르신께 하루 한마디를 물었을 때 답변 상태 */
export type DailyMessageStatus = 'received' | 'pending';

export interface DailyMessageNotification {
  status: DailyMessageStatus;
  /** 보낸 사람 (예: 딸) */
  senderLabel?: string;
  /** 음성 길이 표시 (예: 00:24) */
  durationLabel?: string;
  /** 탭했을 때 이동할 추억 상세 id */
  albumId?: string;
}

export interface ElderHomeSummary {
  memory: MemoryNotification;
  dailyMessage: DailyMessageNotification;
}
