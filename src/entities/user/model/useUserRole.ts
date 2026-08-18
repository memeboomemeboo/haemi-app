import { useState, useCallback } from 'react';
import type { UserRole } from '@/entities/group';

interface UseUserRoleReturn {
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  setRole: (role: UserRole) => void;
}

// 임시 메모리 저장소 (실제로는 AsyncStorage나 다른 스토리지 사용)
let cachedRole: UserRole | null = null;

export const useUserRole = (): UseUserRoleReturn => {
  const [role, setRoleState] = useState<UserRole | null>(cachedRole);
  const [error, setError] = useState<string | null>(null);

  // 역할 저장 및 캐시 업데이트
  const saveRole = useCallback((newRole: UserRole) => {
    try {
      setRoleState(newRole);
      cachedRole = newRole;
      setError(null);

      // TODO: AsyncStorage에 저장
      // await AsyncStorage.setItem('user_role', newRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save role');
    }
  }, []);

  return {
    role,
    isLoading: false,
    error,
    setRole: saveRole,
  };
};
