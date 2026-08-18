import type { UserRole, Group } from '@/entities/group';

/** 보호자가 돌보는 어르신 프로필 */
export interface SeniorProfile {
  id: string;
  /** 표시 이름 (예: 어머니) */
  name: string;
  age: number;
  /** 홈 카드에 노출되는 상태 문구 */
  statusMessage: string;
}

/** 사용자 정보 */
export interface User {
  id: string;
  role: UserRole;
  group: Group | null;
  profile: SeniorProfile | null;
}
