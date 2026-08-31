/** 어르신 본인 계정 프로필 (보호자용 SeniorProfile과 별개 — 어르신 화면 로그인/인사말에 쓰임) */
export interface ElderProfile {
  id: string;
  /** 인사말에 쓰이는 존칭 이름 (예: 순자님) */
  honorificName: string;
}
