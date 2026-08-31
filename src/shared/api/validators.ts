/**
 * API 응답 검증 스키마 (Zod)
 */

import { z } from 'zod';

// 기본 타입
export const UserRoleSchema = z.enum(['FAMILY', 'ELDER', 'INSTITUTION_ADMIN']);
export const RelationSchema = z.enum(['SON', 'DAUGHTER', 'GRANDSON', 'GRANDDAUGHTER', 'CAREGIVER']);

// 사용자 정보
export const AuthUserSchema = z.object({
  memberId: z.string().uuid().optional(),
  id: z.string().uuid().optional(),
  email: z.string().email(),
  name: z.string().min(1),
  role: UserRoleSchema,
  status: z.string().optional(),
  groupId: z.string().uuid().optional().nullable(),
  totpEnabled: z.boolean().optional(),
  createdAt: z.string().datetime().optional(),
});

// 토큰
export const AuthTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
});

// 로그인/회원가입 응답
export const AuthResponseSchema = AuthUserSchema.merge(AuthTokensSchema);

// API 응답 래퍼
export const ApiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    success: z.boolean(),
    data: schema.optional(),
    message: z.string().optional(),
  });

export const AuthApiResponseSchema = ApiResponseSchema(AuthResponseSchema);

// 그룹 멤버
export const GroupMemberSchema = z.object({
  memberId: z.string().uuid(),
  relation: RelationSchema,
  role: UserRoleSchema,
  notificationPreference: z.enum(['ALL', 'IMPORTANT']).optional(),
  joinedAt: z.string().datetime(),
});

// 그룹
export const GroupSchema = z.object({
  groupId: z.string().uuid(),
  id: z.string().uuid().optional(),
  ownerMemberId: z.string().uuid(),
  memberCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  members: z.array(GroupMemberSchema).optional(),
});

export const GroupApiResponseSchema = ApiResponseSchema(GroupSchema);

// GetMe 응답 (사용자 + 그룹)
export const GetMeResponseSchema = AuthUserSchema.merge(
  z.object({
    group: GroupSchema.optional().nullable(),
  })
);

export const GetMeApiResponseSchema = ApiResponseSchema(GetMeResponseSchema);

// TOTP 설정
export const TotpSetupResponseSchema = z.object({
  secret: z.string().min(1),
  qrUri: z.string().url(),
  backupCodes: z.array(z.string()),
});

export const TotpSetupApiResponseSchema = ApiResponseSchema(TotpSetupResponseSchema);

// 검증 헬퍼
export const validateResponse = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const details = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      throw new Error(`Invalid API response: ${details}`);
    }
    throw error;
  }
};
