import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useColorScheme } from '@/shared/hooks';
import { UserProvider } from '@/shared/context/UserContext';
import { initializeTestToken } from '@/shared/lib/auth';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // 앱 시작 시 테스트 토큰 설정 (개발용)
  // UserProvider 하이드레이션 전에 실행하여 레이스 조건 방지
  useEffect(() => {
    if (__DEV__) {
      initializeTestToken().catch((error) => {
        if (__DEV__) {
          console.warn('Failed to initialize test token:', error);
        }
      });
    }
  }, []);

  return (
    <UserProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Slot />
      </ThemeProvider>
    </UserProvider>
  );
}
