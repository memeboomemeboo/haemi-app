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
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    const loadUserGroup = async () => {
      try {
        const meResponse = await authService.getMe();

        if (!isMounted) return;

        if (!meResponse.success) {
          throw new Error(meResponse.message || '사용자 정보를 불러올 수 없습니다.');
        }

        const userData = meResponse.data as any;
        const groupId = userData.groupId;

        if (__DEV__) {
          console.log('[useUserGroup] groupId 로드 완료');
        }

        if (!groupId) {
          if (isMounted) {
            setState({
              group: null,
              isLoading: false,
              error: null,
            });
          }
          return;
        }

        const groupResponse = await get<any>(`/groups/${groupId}`);

        if (isMounted) {
          setState({
            group: groupResponse?.data ?? null,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = getErrorMessage(err);
          console.warn('[useUserGroup] 그룹 로드 실패:', errorMessage);
          setState({
            group: null,
            isLoading: false,
            error: errorMessage,
          });
        }
      }
    };

    loadUserGroup();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return {
    group: state.group,
    isLoading: state.isLoading,
    error: state.error,
    hasGroup: state.group !== null,
  };
};
