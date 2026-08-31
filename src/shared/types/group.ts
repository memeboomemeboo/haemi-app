/**
 * 그룹 관련 타입 정의
 */

import type { UserRole, Relation, NotificationPreference } from './common';

// 요청 타입
export interface CreateGroupRequest {
  relation: Relation;
  notificationPreference: NotificationPreference;
}

export interface CreateInvitationRequest {
  phoneNumber: string;
  relation: Relation;
}

export interface AcceptInvitationRequest {
  token: string;
}

// 엔티티 타입
export interface GroupMember {
  memberId: string;
  relation: Relation;
  role: UserRole;
  notificationPreference: NotificationPreference;
  joinedAt: string;
}

export interface Group {
  groupId: string;
  ownerMemberId: string;
  memberCount: number;
  createdAt: string;
  members: GroupMember[];
}

export interface Invitation {
  invitationId: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
}

// 응답 타입
export interface CreateGroupResponse {
  groupId: string;
  ownerMemberId: string;
}

export interface CreateInvitationResponse {
  invitationId: string;
  token: string;
  status: string;
  expiresAt: string;
}

export interface AcceptInvitationResponse {
  groupId: string;
  memberCount: number;
}

export interface GetMeResponse {
  id?: string;
  email?: string;
  name?: string;
  role?: UserRole;
  status?: string;
  totpEnabled?: boolean;
  createdAt?: string;
  memberId?: string;
  groupId?: string | null;
  group?: Group | null;
}
