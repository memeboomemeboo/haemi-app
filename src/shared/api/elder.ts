/**
 * 어르신 참여 로그인 API
 */

import { post } from './client';
import type { ApiResponse } from '@/shared/types';

export interface ElderSignupRequest {
  name: string;
  phoneNumber: string;
  code: string;
  deviceId: string;
}

export interface ElderSignupResponse {
  elderId: string;
  groupId: string;
  elderName: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface ElderSessionRefreshRequest {
  refreshToken: string;
  deviceId: string;
}

export interface ElderSessionRefreshResponse {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export const elderService = {
  /**
   * 어르신 초대 수락 및 계정 생성
   * POST /api/v1/invitations/{code}/accept-elder
   */
  async acceptElderInvitation(
    request: ElderSignupRequest
  ): Promise<ApiResponse<ElderSignupResponse>> {
    return post<ApiResponse<ElderSignupResponse>>(
      `/invitations/${request.code}/accept-elder`,
      {
        name: request.name,
        phoneNumber: request.phoneNumber,
        deviceId: request.deviceId,
      },
      { skipAuth: true }
    );
  },

  /**
   * 어르신 세션 갱신
   * POST /api/v1/elder-sessions/refresh
   */
  async refreshElderSession(
    request: ElderSessionRefreshRequest
  ): Promise<ApiResponse<ElderSessionRefreshResponse>> {
    return post<ApiResponse<ElderSessionRefreshResponse>>(
      '/elder-sessions/refresh',
      request,
      { skipAuth: true }
    );
  },
};
