import { useState } from 'react';
import LoginScreen from '@/pages/Auth/LoginScreen';
import SignupScreen from '@/pages/Auth/SignupScreen';
import { useUserContext } from '@/shared/context/UserContext';

type AuthMode = 'login' | 'signup';

export default function AuthStack() {
  const [mode, setMode] = useState<AuthMode>('login');
  const { setToken } = useUserContext();

  return mode === 'login' ? (
    <LoginScreen
      onLoginSuccess={(token: string) => {
        // 로그인 성공 → 토큰 저장 후 자동으로 다음 화면으로
        setToken(token);
      }}
      onSignupPress={() => setMode('signup')}
    />
  ) : (
    <SignupScreen
      onSignupSuccess={() => {
        // 회원가입 성공 → 로그인 화면으로 이동
        setMode('login');
      }}
      onLoginPress={() => setMode('login')}
    />
  );
}
