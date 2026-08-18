import { useState, useEffect } from 'react';
import { authService, getErrorMessage, get } from '@/shared/api';
import { useUserContext } from '@/shared/context/UserContext';
import type { Group } from '@/shared/types';

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

        // 2. groupId가 있으면 그룹 상세 정보 조회 (동일한 토큰 사용)
        const groupResponse = await get<any>(`/groups/${groupId}`);

        const group = groupResponse?.data ?? null;

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
