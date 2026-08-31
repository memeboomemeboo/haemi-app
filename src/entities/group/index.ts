/**
 * 그룹 엔티티 (shared/types에서 재내보내기)
 * @deprecated shared/api/groupService와 shared/types를 직접 사용하세요
 */

export { groupService } from '@/shared/api';
export type {
  Group,
  GroupMember,
  UserRole,
  Relation,
  NotificationPreference,
  Invitation as InvitationToken,
} from '@/shared/types';
