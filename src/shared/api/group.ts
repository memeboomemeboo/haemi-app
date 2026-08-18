/**
 * 그룹 API
 */

import { post, get } from './client';
import type {
  CreateGroupRequest,
  CreateInvitationRequest,
  AcceptInvitationRequest,
  CreateGroupResponse,
  CreateInvitationResponse,
  AcceptInvitationResponse,
  GetMeResponse,
} from '@/shared/types';
import type { ApiResponse } from '@/shared/types';

export const groupService = {
  async createGroup(
    data: CreateGroupRequest
  ): Promise<ApiResponse<CreateGroupResponse>> {
    return post<ApiResponse<CreateGroupResponse>>('/groups', data);
  },

  async createInvitation(
    groupId: string,
    data: CreateInvitationRequest
  ): Promise<ApiResponse<CreateInvitationResponse>> {
    return post<ApiResponse<CreateInvitationResponse>>(
      `/groups/${groupId}/invitations`,
      data
    );
  },

  async acceptInvitation(
    token: string
  ): Promise<ApiResponse<AcceptInvitationResponse>> {
    return post<ApiResponse<AcceptInvitationResponse>>(
      `/invitations/${token}/accept`,
      {}
    );
  },

  async getMe(): Promise<ApiResponse<GetMeResponse>> {
    return get<ApiResponse<GetMeResponse>>('/auth/me');
  },
};
