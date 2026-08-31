import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import SignupScreen, { type GuardianSignupDraft } from '@/pages/Auth/SignupScreen';
import ElderLoginScreen from '@/pages/ElderLogin';
import ElderSignupScreen from '@/pages/ElderSignup';
import { PinScreen, pinStorage } from '@/features/auth';
import { authService, getErrorMessage } from '@/shared/api';
import { useUserContext } from '@/shared/context/UserContext';
import { colors } from '@/shared/constants';
import { getOrCreateDeviceId } from '@/shared/lib';
import type { TokenResponse } from '@/shared/types';

type AuthMode = 'loading' | 'signup' | 'pin-setup' | 'pin-login' | 'elder-login' | 'elder-setup';
export default function AuthStack() {
  const [mode, setMode] = useState<AuthMode>('loading');
  const [signupDraft, setSignupDraft] = useState<GuardianSignupDraft | null>(null);
  const [isSignupRegistered, setSignupRegistered] = useState(false);
  const { setToken, setRole } = useUserContext();
  // 이 기기에 어르신 아이디가 저장돼 있으면 어르신 PIN 로그인을 먼저 보여준다.
  useEffect(() => {
    void (async () => {
      if (await pinStorage.hasElderLoginId()) {
        setMode('elder-login');
        return;
      }
      setMode((await pinStorage.hasLoginId()) ? 'pin-login' : 'signup');
    })();
  }, []);
  const finishSignup = useCallback(async (pin: string) => {
    if (!signupDraft) throw new Error('회원가입 정보가 없습니다.');
    if (!isSignupRegistered) {
      try {
        await authService.registerGuardian({ ...signupDraft, pin });
        setSignupRegistered(true);
      } catch (caught) {
        throw new Error(`회원가입 실패: ${getErrorMessage(caught)}`);
      }
    }

    let tokens: TokenResponse;
    try {
      tokens = await authService.loginWithPassword({ loginId: signupDraft.loginId, password: signupDraft.password, deviceId: await getOrCreateDeviceId() });
    } catch (caught) {
      throw new Error(`회원가입은 완료됐지만 로그인에 실패했습니다: ${getErrorMessage(caught)}`);
    }

    try {
      await authService.setToken(tokens.accessToken);
      await authService.setRefreshToken(tokens.refreshToken);
      await pinStorage.saveLoginId(signupDraft.loginId);
    } catch (caught) {
      throw new Error(`로그인 정보 저장 실패: ${getErrorMessage(caught)}`);
    }
    setRole('FAMILY');
    setToken(tokens.accessToken);
  }, [isSignupRegistered, setRole, setToken, signupDraft]);
  const loginWithPin = useCallback(async (pin: string) => {
    const loginId = await pinStorage.getLoginId();
    if (!loginId) throw new Error('저장된 아이디가 없습니다.');
    const tokens = await authService.loginWithPin({ loginId, pin, deviceId: await getOrCreateDeviceId() });
    await authService.setToken(tokens.accessToken);
    await authService.setRefreshToken(tokens.refreshToken);
    setRole('FAMILY');
    setToken(tokens.accessToken);
  }, [setRole, setToken]);
  // 어르신 모드로 고정된 기기를 가족 로그인으로 되돌린다. 저장된 어르신 아이디를 지우지 않으면
  // 다음 실행에서도 다시 어르신 화면으로 들어와 보호자가 로그인할 수 없다.
  const leaveElderMode = useCallback(async () => {
    await pinStorage.clearElderLoginId();
    setMode((await pinStorage.hasLoginId()) ? 'pin-login' : 'signup');
  }, []);
  if (mode === 'loading') return <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>;
  if (mode === 'elder-login') return <ElderLoginScreen onGuardianLoginPress={leaveElderMode} />;
  if (mode === 'elder-setup') return <ElderSignupScreen onBack={() => setMode('signup')} />;
  if (mode === 'pin-setup') return <PinScreen mode="setup" onComplete={finishSignup} onBackToSignup={() => { setSignupRegistered(false); setMode('signup'); }} />;
  if (mode === 'pin-login') return <PinScreen mode="login" onComplete={loginWithPin} onBackToSignup={() => setMode('signup')} />;
  return <SignupScreen onContinue={(draft) => { setSignupDraft(draft); setSignupRegistered(false); setMode('pin-setup'); }} onLoginPress={() => setMode('pin-login')} onElderSetupPress={() => setMode('elder-setup')} />;
}
const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.light.background.normal } });
