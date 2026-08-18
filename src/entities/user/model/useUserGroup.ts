import { useState, useEffect } from 'react';
import { groupService, authService, getErrorMessage } from '@/shared/api';
import { useUserContext } from '@/shared/context/UserContext';
import type { Group, GetMeResponse } from '@/shared/types';

interface UserGroupState {
  group: Group | null;
  isLoading: boolean;
  error: string | null;
}

export const useUserGroup = () => {
  const { token } = useUserContext();
  const [state, setState] = useState<UserGroupState>({
    group: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!token) {
      setState({
        group: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    const loadUserGroup = async () => {
      try {
        // 1. 사용자 정보 조회 (groupId 포함)
        const meResponse = await authService.getMe();

        if (!meResponse.success) {
          throw new Error(meResponse.message || '사용자 정보를 불러올 수 없습니다.');
        }

        const userData = meResponse.data as any;
        const groupId = userData.groupId;

        console.log('[useUserGroup] 사용자 정보:', userData);
        console.log('[useUserGroup] groupId:', groupId);

        if (!groupId) {
          setState({
            group: null,
            isLoading: false,
            error: null,
          });
          return;
        }

        // 2. groupId가 있으면 그룹 상세 정보 조회
        const groupResponse = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/v1/groups/${groupId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!groupResponse.ok) {
          throw new Error(`그룹 조회 실패: ${groupResponse.status}`);
        }

        const groupData = await groupResponse.json();
        const group = groupData.data ?? null;

        console.log('[useUserGroup] 그룹 정보:', group);

        setState({
          group,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        console.warn('[useUserGroup] 그룹 로드 실패:', errorMessage);
        setState({
          group: null,
          isLoading: false,
          error: errorMessage,
        });
      }
    };

    loadUserGroup();
  }, [token]);

  return {
    group: state.group,
    isLoading: state.isLoading,
    error: state.error,
    hasGroup: state.group !== null,
  };
};
