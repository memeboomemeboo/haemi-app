export type UserRole = 'GUARDIAN' | 'ELDER';
export type Relation = 'SON' | 'DAUGHTER' | 'OTHER';
export type NotificationPreference = 'ALL' | 'IMPORTANT';

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

export interface InvitationToken {
  invitationId: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
}
