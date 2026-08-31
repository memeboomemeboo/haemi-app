/**
 * 토스트 메시지 훅
 */

import { useCallback } from 'react';
import { Alert } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  onDismiss?: () => void;
}

export const useToast = () => {
  const show = useCallback((message: string, type: ToastType = 'info', options?: ToastOptions) => {
    // 개발 환경에서는 Alert 사용
    // 프로덕션에서는 커스텀 토스트 컴포넌트 사용 가능
    const title = {
      success: '성공',
      error: '오류',
      info: '알림',
      warning: '경고',
    }[type];

    Alert.alert(title, message, [
      {
        text: '확인',
        onPress: options?.onDismiss,
      },
    ]);
  }, []);

  const success = useCallback((message: string, options?: ToastOptions) => {
    show(message, 'success', options);
  }, [show]);

  const error = useCallback((message: string, options?: ToastOptions) => {
    show(message, 'error', options);
  }, [show]);

  const info = useCallback((message: string, options?: ToastOptions) => {
    show(message, 'info', options);
  }, [show]);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    show(message, 'warning', options);
  }, [show]);

  return { show, success, error, info, warning };
};
