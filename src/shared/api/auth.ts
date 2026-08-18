// 기본 API URL
const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn('⚠️ EXPO_PUBLIC_API_URL not set');
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  role: 'FAMILY' | 'ELDER' | 'INSTITUTION_ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
  totpCode?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    memberId: string;
    email: string;
    name: string;
    role: string;
    accessToken: string;
    refreshToken?: string;
  };
  message: string;
}

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

export const authService = {
  // 회원가입
  async signup(data: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = `회원가입 실패: ${response.status}`;
        try {
          const error = await response.json();
          errorMessage = error?.message || error?.data?.message || errorMessage;
        } catch {
          // JSON parsing failed
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ signup error:', message);
      throw err;
    }
  },

  // 로그인
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = `로그인 실패: ${response.status}`;
        try {
          const error = await response.json();
          errorMessage = error?.message || error?.data?.message || errorMessage;
        } catch {
          // JSON parsing failed
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('login error:', message);
      throw err;
    }
  },

  // 로그아웃
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch (err) {
      console.error('logout error:', err);
      throw err;
    }
  },

  // 현재 사용자 정보
  async getMe(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`사용자 정보 조회 실패: ${response.status}`);
      }

      return response.json();
    } catch (err) {
      console.error('getMe error:', err);
      throw err;
    }
  },
};
