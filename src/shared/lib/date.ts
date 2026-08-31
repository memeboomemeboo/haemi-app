const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/** "9월 8일 화요일" 형식으로 날짜를 표시한다 (어르신 홈 화면 등) */
export function formatKoreanDate(date: Date = new Date()): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAY_LABELS[date.getDay()]}요일`;
}
