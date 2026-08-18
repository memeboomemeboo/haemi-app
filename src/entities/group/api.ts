/**
 * @deprecated Use @/shared/api/group.ts (groupService) instead.
 * This file contains a duplicate implementation that doesn't sync with the centralized API client.
 * All new code should use: import { groupService } from '@/shared/api'
 */

import type { Group } from './types';

interface CreateGroupRequest {
  relation: string; // TODO: Confirm exact values from Swagger
  notificationPreference: 'ALL' | 'IMPORTANT' | 'NONE';
}

interface CreateGroupResponse {
  success: boolean;
  data: Group;
  message: string;
}

interface CreateInvitationRequest {
  phoneNumber: string;
  relation: 'SON' | 'DAUGHTER' | 'OTHER';
}

interface CreateInvitationResponse {
  success: boolean;
  data: {
    invitationId: string;
    token: string;
    status: 'PENDING';
    expiresAt: string;
  };
  message: string;
}

interface AcceptInvitationResponse {
  success: boolean;
  data: Group;
  message: string;
}

interface GetMeResponse {
  success: boolean;
  data: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    status?: string;
    totpEnabled?: boolean;
    createdAt?: string;
    memberId?: string;
    groupId?: string | null;
    group?: Group | null;
  };
  message: string;
}

// 기본 API URL (환경변수)
const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn('⚠️ EXPO_PUBLIC_API_URL not set');
}

let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
};

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

// 에러 메시지 안전화
const getSafeErrorMessage = (error: unknown, userMessage: string): string => {
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : String(error);
  }
  // 프로덕션에서는 사용자 친화적인 메시지만 반환
  return userMessage;
};

export const groupAPI = {
  // 현재 사용자 정보 조회
  async getMe(): Promise<GetMeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        const errorMessage = getSafeErrorMessage(
          error,
          '사용자 정보를 불러올 수 없습니다.'
        );
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (err) {
      console.error('getMe error:', err);
      throw err;
    }
  },

  // 그룹 생성
  async createGroup(payload: CreateGroupRequest): Promise<CreateGroupResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(
          error?.message || `Failed to create group: ${response.status}`
        );
      }

      return response.json();
    } catch (err) {
      console.error('createGroup error:', err);
      throw err;
    }
  },

  // 초대코드 생성
  async createInvitation(
    groupId: string,
    payload: CreateInvitationRequest
  ): Promise<CreateInvitationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/invitations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(
          error?.message || `Failed to create invitation: ${response.status}`
        );
      }

      return response.json();
    } catch (err) {
      console.error('createInvitation error:', err);
      throw err;
    }
  },

  // 초대코드 수락
  async acceptInvitation(token: string): Promise<AcceptInvitationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/${token}/accept`, {
        method: 'POST',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(
          error?.message || `Failed to accept invitation: ${response.status}`
        );
      }

      return response.json();
    } catch (err) {
      console.error('acceptInvitation error:', err);
      throw err;
    }
  },
};
