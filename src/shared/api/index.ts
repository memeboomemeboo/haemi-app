/**
 * API 서비스 인덱스
 */

// API 클라이언트
export {
  apiClient,
  setAuthToken,
  getAuthToken,
  setOnUnauthorizedCallback,
  fetchApi,
  get,
  post,
  patch,
  put,
  del,
} from './client';

// 에러 클래스
export {
  ApiError,
  NetworkError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  getErrorMessage,
  isApiError,
  isNetworkError,
} from './errors';

// 서비스
export { authService } from './auth';
export { groupService } from './group';
export { getElderHome } from './elderHome';
export type { ElderHomeResponse, ElderHomeGreeting, ElderHomeMemory, ElderHomeTraining } from './elderHome';
export { elderMemoryService } from './elderMemory';
export type { ElderMemorySummary, ElderMemoryDetail } from './elderMemory';
export { guardianMemoryService } from './guardianMemory';
export type {
  GuardianMemorySummary,
  GuardianMemoryDetail,
  CreateGuardianMemoryRequest,
  UpdateGuardianMemoryRequest,
} from './guardianMemory';
export { elderMemoryResponseService } from './elderMemoryResponse';
export type {
  MemoryResponse,
  MemoryResponseType,
  MemoryResponseEmotion,
  TranscriptionStatus,
} from './elderMemoryResponse';
export { requestMediaUpload, uploadMediaBytes, confirmMediaUpload, uploadMediaFile } from './media';
export type { MediaType, RequestMediaUploadInput, RequestMediaUploadResponse } from './media';
export { myPageService } from './my-page';
export type {
  GuardianRole,
  GuardianProfileResponse as MyPageProfileResponse,
  FamilyDetailResponse,
  ElderCardResponse,
  GuardianMemberResponse,
  UpdateGuardianProfileRequest,
  RegisterElderRequest,
  CreateFamilyRequest as MyPageCreateFamilyRequest,
  CreateFamilyResponse as MyPageCreateFamilyResponse,
} from './my-page';
