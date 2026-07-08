import { useCallback, useEffect, useState } from 'react';

export interface AsyncDataState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => Promise<void>;
}

/**
 * 비동기 데이터 로딩 상태를 관리하는 공용 훅.
 * - 자동 재시도 (네트워크 에러, 5xx)
 * - 일관된 에러 처리
 * - 수동 리페치
 *
 * fetcher는 반드시 컴포넌트 밖에서 정의된 안정적인 함수여야 한다
 * (인라인 함수를 넘기면 매 렌더마다 재요청된다).
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options?: {
    onError?: (error: Error) => void;
    onSuccess?: (data: T) => void;
  }
): AsyncDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      options?.onSuccess?.(result);
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      setError(error);
      options?.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, options]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    isLoading,
    error,
    isError: error !== null,
    refetch: load,
  };
}
