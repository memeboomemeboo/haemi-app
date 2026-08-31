/** 추억 상세의 "주고 받은 이야기" — 어르신이 답한 내용 */
export interface AlbumConversationAnswer {
  /** 답변자 이름 (예: 박영호 님) */
  authorName: string;
  /** 상대 시간 (예: 2일전) */
  relativeTime: string;
  /** 시각 (예: 오후 3:20) */
  time: string;
  /** 감정 태그 (예: 그리움, 행복) */
  tags: string[];
  /** 답변 인용문 */
  quote: string;
  /** 음성 답변 길이 표시 (예: 0:02) */
  audioDuration: string;
}

/** 추억 상세의 "주고 받은 이야기" 스레드 */
export interface AlbumConversation {
  /** 보호자가 남긴 질문 */
  question: string;
  /** 질문을 남긴 상대 시간 (예: 3일전) */
  askedRelativeTime: string;
  /**
   * 어르신의 답변 — 실제로는 아직 답변 내용을 조회하는 API가 없어 항상 비어 있다.
   * responded 값으로 답변 여부만 알 수 있고, 내용은 백엔드 연동 전까지 표시할 수 없다.
   */
  answer?: AlbumConversationAnswer;
}

/** 보호자가 선택 가능한 어르신 (앨범 필터 탭, 등록 화면 대상 선택에 사용) */
export interface AlbumElderOption {
  id: string;
  name: string;
}

/** 기억 앨범 항목 */
export interface AlbumItem {
  id: string;
  /** 이 추억을 전달받는 어르신 id */
  elderId: string;
  /** 카드 제목 (예: 어린 시절 고향) */
  title: string;
  /** 이 추억을 전달받는 어르신 이름 (예: 박영호) — 상단 필터 탭 기준 */
  elderName: string;
  /** 장소 */
  location?: string;
  /** 사진 URL — 없으면 위젯이 기본 샘플 이미지를 보여준다 */
  photoUrl?: string;
  /** 상세 화면 표시용 연도 배지 (예: 1975년) */
  year?: string;
  /** 상세 화면의 전체 사진 목록 — 없으면 사진 없이 표시 */
  photos?: string[];
  /** 보호자 메모 */
  memo?: string;
  /** 어르신이 실제로 이 추억에 응답했는지 여부 */
  responded?: boolean;
  /** 주고 받은 이야기 스레드 — 어르신이 답변하면 그리드 카드에 "답변" 배지가 표시된다 */
  conversation?: AlbumConversation;
  /** 이 추억을 남긴 가족과의 관계 (예: 딸, 아들) — 어르신 상세 화면 프로필에 표시 */
  senderRelation?: string;
  /** 목록 카드에 표시할 태그 (예: 등장 인물) */
  tags?: string[];
}

/** 추억 등록 화면에서 새로 만들 때 필요한 입력 값 */
export interface NewAlbumItemInput {
  elderId: string;
  title: string;
  year: string;
  memo?: string;
  /** 업로드를 마치고 발급받은 mediaRefId 목록 */
  mediaRefIds?: string[];
  /** 어르신께 여쭤볼 한마디 */
  question: string;
  place?: string;
}
