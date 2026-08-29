import type { AlbumItem } from '../model/types';

/** 어르신이 아직 답하지 않은 질문 (Figma node 1366:2572) */
const PENDING_CONVERSATION = {
  question: '이 사진, 기억나세요?',
  askedRelativeTime: '3일전',
};

export const MOCK_ALBUM_ITEMS: AlbumItem[] = [
  {
    id: 'album-1',
    title: '어린 시절 고향',
    date: '1975.04.',
    location: '구지면',
    description: '가족 나들이',
    year: '1975년',
    memo: '가족끼리 나들이에 갔던 날이에요',
    photos: ['photo-1', 'photo-2', 'photo-3', 'photo-4', 'photo-5'],
    conversation: {
      ...PENDING_CONVERSATION,
      answer: {
        authorName: '박영호 님',
        relativeTime: '2일전',
        time: '오후 3:20',
        tags: ['그리움', '행복'],
        quote: '그 냇가 참 좋았지... 친구들이랑 물고기 잡던 게 아직도 생생해.',
        audioDuration: '0:02',
      },
    },
  },
  {
    id: 'album-2',
    title: '안영세 서거일',
    date: '1980.04.',
    location: '구지면',
    description: '가족 나들이',
    year: '1980년',
    memo: '가족끼리 나들이에 갔던 날이에요',
    conversation: PENDING_CONVERSATION,
  },
  { id: 'album-3', title: '안영세 서거일', date: '1980.04.', location: '구지면', description: '가족 나들이' },
  { id: 'album-4', title: '안영세 서거일', date: '1980.04.', location: '구지면', description: '가족 나들이' },
  { id: 'album-5', title: '안영세 서거일', date: '1980.04.', location: '구지면', description: '가족 나들이' },
];
