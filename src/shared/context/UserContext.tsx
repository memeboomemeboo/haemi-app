/**
 * 전역 사용자 상태 관리
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService, getAuthToken, setOnUnauthorizedCallback } from '@/shared/api';
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

        // 2. 저장된 토큰 복구 — role은 서버 왕복 없이 토큰 자체에서 읽는다
        // (보호자/어르신 모두 같은 경로로 복구되고, 프로필 조회 실패가 로그아웃을 유발하지 않는다)
        const savedToken = await getAuthToken();
        if (savedToken) {
          setTokenState(savedToken);
          // 1) 저장된 role이 있으면 그대로 사용 (로그인 시 setStoredRole로 기록됨)
          const savedRole = await authService.getStoredRole();
          if (savedRole) {
            setRoleState(savedRole);
          } else {
            // 2) 저장된 role이 없는 기존 설치는 토큰 자체에서 role을 읽어 마이그레이션한다
            //    (보호자/어르신 모두 같은 경로로 복구되고, 서버 왕복 실패가 로그아웃을 유발하지 않는다)
            const tokenRole = getRoleFromToken(savedToken);
            if (tokenRole) {
              setRoleState(tokenRole);
              await authService.setStoredRole(tokenRole);
            } else if (__DEV__) {
              console.warn('Failed to parse role from saved token');
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
    void authService.setStoredRole(null);
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
