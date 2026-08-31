/**
 * 전역 사용자 상태 관리
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getAuthToken, authService, setOnUnauthorizedCallback } from '@/shared/api';
import { initializeTestToken } from '@/shared/lib/auth';
import { getRoleFromToken } from '@/shared/lib';
import type { UserRole, Relation, Group } from '@/shared/types';

interface UserContextType {
  token: string | null;
  role: UserRole | null;
  relation: Relation | null;
  phoneNumber: string | null;
  group: Group | null;
  isHydrating: boolean;
  setToken: (token: string | null) => void;
  setRole: (role: UserRole) => void;
  setRelation: (relation: Relation) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setGroup: (group: Group | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [relation, setRelationState] = useState<Relation | null>(null);
  const [phoneNumber, setPhoneNumberState] = useState<string | null>(null);
  const [group, setGroupState] = useState<Group | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  // 앱 시작 시 테스트 토큰 설정 및 저장된 토큰 복구 (hydration)
  useEffect(() => {
    const hydrateToken = async () => {
      try {
        // 1. 개발 환경에서 테스트 토큰 초기화 (hydration 전)
        await initializeTestToken();

        // 2. 저장된 토큰 복구
        const savedToken = await getAuthToken();
        if (savedToken) {
          // 역할은 액세스 토큰의 role 클레임으로 판별한다.
          // 서버 조회 없이 결정되므로 어르신·보호자 모두 같은 경로로 복구된다.
          const tokenRole = getRoleFromToken(savedToken);
          if (!tokenRole) {
            // 형식이 깨졌거나 우리가 모르는 role — 신뢰할 수 없으므로 미로그인 취급
            if (__DEV__) {
              console.warn('Failed to read role from saved token');
            }
            return;
          }

          setTokenState(savedToken);
          setRoleState(tokenRole);

          // 보호자만 프로필을 추가로 불러온다(어르신 전용 계정은 이 엔드포인트 접근 권한이 없다).
          // 실패하더라도 토큰 자체는 유효하므로 로그인 상태를 유지한다.
          if (tokenRole === 'FAMILY') {
            try {
              const meResponse = await authService.getMe();
              if (meResponse.success && meResponse.data?.role) {
                setRoleState(meResponse.data.role);
              }
            } catch (error) {
              if (__DEV__) {
                console.warn('Failed to load guardian profile during hydration:', error);
              }
            }
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('Failed to get auth token during hydration:', error);
        }
      } finally {
        setIsHydrating(false);
      }
    };

    hydrateToken();
  }, []);

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
  }, []);

  const setRelation = useCallback((newRelation: Relation) => {
    setRelationState(newRelation);
  }, []);

  const setPhoneNumber = useCallback((newPhoneNumber: string) => {
    setPhoneNumberState(newPhoneNumber);
  }, []);

  const setGroup = useCallback((newGroup: Group | null) => {
    setGroupState(newGroup);
  }, []);

  const logout = useCallback(() => {
    setTokenState(null);
    setRoleState(null);
    setRelationState(null);
    setPhoneNumberState(null);
    setGroupState(null);
  }, []);

  // 토큰 갱신 실패 시 자동 로그아웃 콜백 등록
  useEffect(() => {
    setOnUnauthorizedCallback(logout);
    return () => {
      setOnUnauthorizedCallback(null);
    };
  }, [logout]);

  const value: UserContextType = {
    token,
    role,
    relation,
    phoneNumber,
    group,
    isHydrating,
    setToken,
    setRole,
    setRelation,
    setPhoneNumber,
    setGroup,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};
