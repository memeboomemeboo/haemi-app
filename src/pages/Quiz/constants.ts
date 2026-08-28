import type { QuizQuestion } from '@/shared/api/quiz';

export const QUIZ_LIMIT = 5;

export const COLORS = {
  primary: '#fd6941',
  primarySoft: '#fff3f0',
  text: '#3c3e3f',
  textAssistive: '#76787a',
  line: '#c1c2c3',
  fill: '#f7f7f7',
  white: '#ffffff',
} as const;

export const QUIZ_FEEDBACK_CORRECT_IMAGE = require('../../../assets/images/quiz-feedback-clap.png');
export const QUIZ_FEEDBACK_WRONG_IMAGE = require('../../../assets/images/quiz-feedback-wrong.svg');
export const QUIZ_COMPLETE_IMAGE = require('../../../assets/images/quiz-complete-party.svg');

export const FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: '길고양이 급식소는 아무곳에나 설치해도 된다.',
    correctAnswer: 'X',
    explanation: '급식소는 허락받은 장소에 설치하고 깨끗하게 관리해야 해요.',
  },
  {
    id: 'q2',
    question: '약속된 시간에 가족과 대화하면 기억을 떠올리는 데 도움이 된다.',
    correctAnswer: 'O',
    explanation: '반복되는 대화는 하루 일을 차분히 떠올리는 데 도움이 돼요.',
  },
  {
    id: 'q3',
    question: '사진을 보며 이야기를 나누는 것은 추억 회상 활동이 될 수 있다.',
    correctAnswer: 'O',
    explanation: '익숙한 사진은 자연스럽게 이야기를 꺼내는 좋은 단서가 돼요.',
  },
  {
    id: 'q4',
    question: '인지 활동은 한 번에 오래 할수록 항상 더 좋다.',
    correctAnswer: 'X',
    explanation: '짧아도 꾸준히 참여하는 편이 부담 없이 이어가기 좋아요.',
  },
  {
    id: 'q5',
    question: '오늘의 퀴즈를 끝내면 활동 참여 기록에 도움이 된다.',
    correctAnswer: 'O',
    explanation: '퀴즈 완료 기록은 보호자가 활동 흐름을 살피는 데 도움이 돼요.',
  },
];
