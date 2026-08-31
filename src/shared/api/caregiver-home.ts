import { get } from '@/shared/api/client';
import type { GuardianProfileResponse, SwaggerApiResponse } from '@/shared/types/auth';
import type {
  CaregiverActivitiesResponse,
  CaregiverHomeResponse,
} from '@/shared/types/caregiver-home';

export interface CaregiverHomeInitialData {
  home: CaregiverHomeResponse;
  profile: GuardianProfileResponse;
}

export async function getCaregiverHome(): Promise<CaregiverHomeInitialData> {
  const [homeResponse, profileResponse] = await Promise.all([
    get<SwaggerApiResponse<CaregiverHomeResponse>>('/guardian/home'),
    get<SwaggerApiResponse<GuardianProfileResponse>>('/guardian/profile'),
  ]);

  return {
    home: homeResponse.data,
    profile: profileResponse.data,
  };
}

export async function getCaregiverActivities(
  elderId: string,
  date = 'today',
): Promise<CaregiverActivitiesResponse> {
  const response = await get<SwaggerApiResponse<CaregiverActivitiesResponse>>(
    `/guardian/elders/${encodeURIComponent(elderId)}/activities?date=${encodeURIComponent(date)}`,
  );
  return response.data;
}
