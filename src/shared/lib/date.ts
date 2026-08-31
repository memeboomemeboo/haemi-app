const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/** "9월 8일 화요일" 형식으로 날짜를 표시한다 (어르신 홈 화면 등) */
export function formatKoreanDate(date: Date = new Date()): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAY_LABELS[date.getDay()]}요일`;
}

/** ISO 날짜 문자열을 "방금 전 / N분 전 / N시간 전 / N일 전"으로 표시한다 */
export function formatRelativeKoreanDate(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}
