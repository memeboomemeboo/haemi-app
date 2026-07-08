import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AsyncDataState } from '@/shared/hooks/useAsyncData';

interface AsyncContainerProps<T> {
  state: AsyncDataState<T>;
  children: (data: T) => React.ReactNode;
  loadingMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
}

/**
 * 비동기 상태를 처리하는 컨테이너 컴포넌트
 * - 로딩 중: 로딩 스피너
 * - 에러: 에러 메시지 + 재시도 버튼
 * - 성공: children 렌더링
 */
export function AsyncContainer<T>({
  state,
  children,
  loadingMessage = '로딩 중...',
  errorTitle = '오류',
  errorMessage = '데이터를 불러올 수 없습니다.',
}: AsyncContainerProps<T>) {
  if (state.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fd6941" />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
      </View>
    );
  }

  if (state.isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>{errorTitle}</Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        <Pressable
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          onPress={() => state.refetch()}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  if (state.data) {
    return <>{children(state.data)}</>;
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ee2a2b',
    letterSpacing: -0.36,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.28,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#fd6941',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.32,
  },
  pressed: {
    opacity: 0.85,
  },
});
