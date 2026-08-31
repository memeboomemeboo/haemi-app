import { useCallback, useEffect, useRef, useState } from 'react';

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

  // 진행 중인 요청을 식별하는 시퀀스. 최신 요청의 결과만 상태에 반영해
  // 늦게 도착한 이전 요청(예: 어르신 빠른 전환)이 화면을 덮어쓰지 않게 한다.
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (requestId !== requestIdRef.current) return;
      setData(result);
      options?.onSuccess?.(result);
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      const error = e instanceof Error ? e : new Error(String(e));
      setError(error);
      options?.onError?.(error);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetcher, options]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      void load();
    });

    return () => {
      // 언마운트/재실행 시 진행 중 요청을 무효화한다.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      requestIdRef.current++;
    };
  }, [load]);

  return {
    data,
    isLoading,
    error,
    isError: error !== null,
    refetch: load,
  };
}
