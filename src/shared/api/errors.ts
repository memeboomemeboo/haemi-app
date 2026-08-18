/**
 * API 에러 클래스 정의
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super(401, 'Unauthorized', 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor() {
    super(403, 'Forbidden', 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(409, message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

// 사용자 친화적 에러 메시지 매핑
const ERROR_MESSAGE_MAP: Record<string, string> = {
  // 인증 에러
  'INVALID_CREDENTIALS': '이메일 또는 비밀번호가 잘못되었습니다.',
  'USER_NOT_FOUND': '등록되지 않은 계정입니다.',
  'ACCOUNT_LOCKED': '계정이 잠겼습니다. 관리자에게 문의하세요.',
  'UNAUTHORIZED': '인증이 필요합니다. 다시 로그인해주세요.',

  // 가입 관련
  'EMAIL_ALREADY_EXISTS': '이미 사용 중인 이메일입니다.',
  'EMAIL_VERIFICATION_REQUIRED': '이메일 인증이 필요합니다.',
  'WEAK_PASSWORD': '비밀번호가 너무 약합니다.',
  'INVALID_EMAIL': '유효한 이메일 형식을 입력해주세요.',

  // 그룹 관련
  'GROUP_NOT_FOUND': '그룹을 찾을 수 없습니다.',
  'GROUP_ALREADY_EXISTS': '이미 그룹이 존재합니다.',
  'INVITATION_EXPIRED': '만료된 초대입니다.',
  'INVITATION_NOT_FOUND': '초대를 찾을 수 없습니다.',

  // 권한 에러
  'FORBIDDEN': '이 작업을 수행할 권한이 없습니다.',
  'NOT_FOUND': '요청한 리소스를 찾을 수 없습니다.',
  'CONFLICT': '요청이 충돌합니다. 다시 시도해주세요.',

  // 서버 에러
  'INTERNAL_SERVER_ERROR': '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.',
  'SERVICE_UNAVAILABLE': '서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.',
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    // 에러 코드 기반 매핑
    if (error.code && ERROR_MESSAGE_MAP[error.code]) {
      return ERROR_MESSAGE_MAP[error.code];
    }

    // 상태 코드 기반 매핑
    if (error.statusCode === 401) {
      return ERROR_MESSAGE_MAP['UNAUTHORIZED'];
    }
    if (error.statusCode === 403) {
      return ERROR_MESSAGE_MAP['FORBIDDEN'];
    }
    if (error.statusCode === 404) {
      return ERROR_MESSAGE_MAP['NOT_FOUND'];
    }
    if (error.statusCode === 409) {
      return ERROR_MESSAGE_MAP['CONFLICT'];
    }
    if (error.statusCode >= 500) {
      return ERROR_MESSAGE_MAP['INTERNAL_SERVER_ERROR'];
    }

    // 개발환경에서만 원래 메시지 반환
    if (__DEV__) {
      return error.message;
    }

    // 프로덕션에서는 일반 메시지 반환
    return '요청 처리 중 오류가 발생했습니다.';
  }

  if (error instanceof NetworkError) {
    if (__DEV__) {
      return error.message;
    }
    return '네트워크 연결이 불안정합니다. 다시 시도해주세요.';
  }

  if (error instanceof Error) {
    if (__DEV__) {
      return error.message;
    }
    return '알 수 없는 오류가 발생했습니다.';
  }

  return '알 수 없는 오류가 발생했습니다.';
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};
