/**
 * 그룹 관련 타입 (shared/types에서 재내보내기)
 * @deprecated shared/types를 직접 사용하세요
 */

export type { UserRole, Relation, NotificationPreference } from '@/shared/types';
export type {
  GroupMember,
  Group,
  Invitation,
  CreateGroupResponse,
  CreateInvitationResponse,
  AcceptInvitationResponse,
  GetMeResponse,
} from '@/shared/types';

// 하위 호환성 유지
export interface InvitationToken {
  invitationId: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
}
