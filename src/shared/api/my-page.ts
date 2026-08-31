import { del, get, patch, post } from './client';
import { confirmMediaUpload, requestMediaUpload, type RequestMediaUploadResponse } from './media';
import type { SwaggerApiResponse } from '@/shared/types';

export type GuardianRole = 'GUARDIAN' | 'DAUGHTER' | 'SON' | 'GRANDDAUGHTER' | 'GRANDSON' | 'OTHER';

export interface ElderCardResponse {
  elderId: string;
  name: string;
  birthDate?: string;
  role?: GuardianRole;
  roleLabel?: string;
}

export interface GuardianProfileResponse {
  userId: string;
  name: string;
  loginId: string;
  phone?: string;
  birthDate?: string;
  profileImageUrl?: string;
  elders: ElderCardResponse[];
}

export interface GuardianMemberResponse {
  userId: string;
  name: string;
  role?: GuardianRole;
  roleLabel?: string;
  isMe: boolean;
}

export interface FamilyDetailResponse {
  familyId: string;
  name: string;
  memo?: string;
  profileImageUrl?: string;
  inviteCode?: string;
  guardians: GuardianMemberResponse[];
  elders: ElderCardResponse[];
}

export interface UpdateGuardianProfileRequest {
  name?: string;
  birthDate?: string;
  phone?: string;
  loginId?: string;
  profileImageMediaRefId?: string;
  elderRoles?: Record<string, GuardianRole>;
}

export interface RegisterElderRequest {
  familyId: string;
  name: string;
  birthDate?: string;
  loginId: string;
  pin: string;
  password?: string;
  phone: string;
  gender: string;
}

export interface CreateFamilyRequest {
  name: string;
  memo?: string;
  profileImageMediaRefId?: string;
}

export interface CreateFamilyResponse {
  familyId: string;
  inviteCode: string;
}

export const myPageService = {
  async getProfile(): Promise<GuardianProfileResponse> {
    const response = await get<SwaggerApiResponse<GuardianProfileResponse>>('/guardian/profile');
    return response.data;
  },

  async updateProfile(data: UpdateGuardianProfileRequest): Promise<void> {
    await patch<SwaggerApiResponse<void>>('/guardian/profile', data);
  },

  async getFamily(elderId?: string): Promise<FamilyDetailResponse | null> {
    const query = elderId ? `?elderId=${encodeURIComponent(elderId)}` : '';
    const response = await get<SwaggerApiResponse<FamilyDetailResponse | null>>(`/guardian/families/my${query}`);
    return response.data;
  },

  async createFamily(data: CreateFamilyRequest): Promise<CreateFamilyResponse> {
    const response = await post<SwaggerApiResponse<CreateFamilyResponse>>('/guardian/families', data);
    return response.data;
  },

  async registerElder(data: RegisterElderRequest): Promise<string> {
    const response = await post<SwaggerApiResponse<string>>('/guardian/elders', data);
    return response.data;
  },

  async changeElderRole(elderId: string, role: GuardianRole): Promise<void> {
    await patch<void>(`/guardian/elders/${elderId}/link/role`, { role });
  },

  async unlinkElder(elderId: string): Promise<void> {
    await del<void>(`/guardian/elders/${elderId}/link`);
  },

  async requestProfileImageUpload(data: {
    originalFilename: string;
    contentType: string;
    declaredSizeBytes: number;
  }): Promise<RequestMediaUploadResponse> {
    return requestMediaUpload({ mediaType: 'PROFILE_IMAGE', ...data });
  },

  confirmMediaUpload,
};
