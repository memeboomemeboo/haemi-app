import { useCallback, useState } from 'react';
import SignupScreen, { type GuardianSignupDraft } from './SignupScreen';
import RoleSelectScreen from '@/pages/RoleSelect';
import { ElderPinScreen, PinScreen, pinStorage } from '@/features/auth';
import { authService, getErrorMessage } from '@/shared/api';
import { useUserContext } from '@/shared/context/UserContext';
import { getOrCreateDeviceId, getRoleFromToken } from '@/shared/lib';
import type { TokenResponse } from '@/shared/types';

type AuthMode = 'role-select' | 'signup' | 'pin-setup' | 'guardian-pin' | 'elder-pin';
export default function AuthStack() {
  const [mode, setMode] = useState<AuthMode>('role-select');
  const [signupDraft, setSignupDraft] = useState<GuardianSignupDraft | null>(null);
  const [isSignupRegistered, setSignupRegistered] = useState(false);
  const { setToken, setRole } = useUserContext();
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
      await authService.setStoredRole('FAMILY');
      await pinStorage.saveLoginId(signupDraft.loginId);
    } catch (caught) {
      throw new Error(`로그인 정보 저장 실패: ${getErrorMessage(caught)}`);
    }
    setRole(getRoleFromToken(tokens.accessToken) ?? 'FAMILY');
    setToken(tokens.accessToken);
  }, [isSignupRegistered, setRole, setToken, signupDraft]);
  const loginWithPin = useCallback(async (pin: string) => {
    const loginId = await pinStorage.getLoginId();
    if (!loginId) throw new Error('저장된 아이디가 없습니다.');
    const tokens = await authService.loginWithPin({ loginId, pin, deviceId: await getOrCreateDeviceId() });
    await authService.setToken(tokens.accessToken);
    await authService.setRefreshToken(tokens.refreshToken);
    await authService.setStoredRole('FAMILY');
    setRole(getRoleFromToken(tokens.accessToken) ?? 'FAMILY');
    setToken(tokens.accessToken);
  }, [setRole, setToken]);
  const loginElderWithPin = useCallback(async (pin: string) => {
    const tokens = await authService.loginElderWithPin({ pin });
    await authService.setToken(tokens.accessToken);
    await authService.setStoredRole('ELDER');
    setRole('ELDER');
    setToken(tokens.accessToken);
  }, [setRole, setToken]);
  if (mode === 'role-select') return <RoleSelectScreen onElderSelect={() => setMode('elder-pin')} onGuardianSelect={() => setMode('guardian-pin')} />;
  if (mode === 'pin-setup') return <PinScreen mode="setup" onComplete={finishSignup} onBackToSignup={() => { setSignupRegistered(false); setMode('signup'); }} />;
  if (mode === 'guardian-pin') return <PinScreen mode="login" onComplete={loginWithPin} onBack={() => setMode('role-select')} onBackToSignup={() => setMode('signup')} />;
  if (mode === 'elder-pin') return <ElderPinScreen onComplete={loginElderWithPin} onBack={() => setMode('role-select')} />;
  return <SignupScreen onContinue={(draft) => { setSignupDraft(draft); setSignupRegistered(false); setMode('pin-setup'); }} onLoginPress={() => setMode('guardian-pin')} />;
}
