import type { ElderHomeSummary } from '../model/types';

/** 새 추억과 음성 답장이 모두 와있는 상태 (Figma node 1408:5601) */
export const MOCK_ELDER_HOME_SUMMARY: ElderHomeSummary = {
  memory: {
    status: 'new',
    unreadCount: 1,
    senderLabel: '딸 정은님',
    albumId: 'album-1',
  },
  dailyMessage: {
    status: 'received',
    senderLabel: '딸',
    durationLabel: '00:24',
    albumId: 'album-1',
  },
};
