import { useCallback, useEffect, useState } from 'react';

interface AsyncDataState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * 비동기 데이터 로딩 상태를 관리하는 공용 훅.
 * fetcher는 반드시 컴포넌트 밖에서 정의된 안정적인 함수여야 한다
 * (인라인 함수를 넘기면 매 렌더마다 재요청된다).
 */
export function useAsyncData<T>(fetcher: () => Promise<T>): AsyncDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await fetcher());
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    const timeoutId = setTimeout(load, 0);
    return () => clearTimeout(timeoutId);
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
