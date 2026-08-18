import { useState, useEffect } from 'react';
import { groupAPI } from '@/entities/group';
import { useUserContext } from '@/shared/context/UserContext';
import type { Group } from '@/entities/group';

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
        const response = await groupAPI.getMe();

        if (response.success && response.data) {
          setState({
            group: response.data.group ?? null,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            group: null,
            isLoading: false,
            error: response.message || '그룹 정보를 불러올 수 없습니다.',
          });
        }
      } catch (err) {
        console.error('Failed to load user group:', err);
        setState({
          group: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load user group',
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
