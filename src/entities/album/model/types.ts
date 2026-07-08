/** 기억 앨범 항목 */
export interface AlbumItem {
  id: string;
  /** 카드 제목 (예: 가족과 함께한 기억) */
  title: string;
  /** 표시용 날짜 (예: 1980.04.) */
  date: string;
  /** 장소 (예: 구지면) */
  location: string;
  /** 부제 (예: 가족 나들이) */
  description: string;
  /** 사진 URL — 없으면 위젯이 기본 샘플 이미지를 보여준다 */
  photoUrl?: string;
}
