import { View, ScrollView, StyleSheet, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import * as Device from 'expo-device';
import { colors } from '@/shared/constants';
import { authService, elderService, getErrorMessage, setAuthToken, setRefreshToken } from '@/shared/api';
import { useUserContext } from '@/shared/context/UserContext';
import { useToast } from '@/shared/hooks';
import type { SignUpRequest, UserRole } from '@/shared/types';

interface SignupScreenProps {
  onSignupSuccess: () => void;
  onLoginPress: () => void;
}

const PASSWORD_REGEX = {
  minLength: /.{8,}/,
  hasLetter: /[a-zA-Z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*]/,
};

interface SignupState {
  step: 'role' | 'family' | 'elder-code' | 'elder-info';
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  code: string;
  phoneNumber: string;
  role: UserRole;
  isLoading: boolean;
  error: string;
}

export default function SignupScreen({ onSignupSuccess, onLoginPress }: SignupScreenProps) {
  const insets = useSafeAreaInsets();
  const { success: showSuccess, error: showError } = useToast();
  const { setToken, setRole: setUserRole } = useUserContext();
  const [state, setState] = useState<SignupState>({
    step: 'role',
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    code: '',
    phoneNumber: '',
    role: 'FAMILY',
    isLoading: false,
    error: '',
  });

  const validatePassword = (pwd: string): string => {
    if (!PASSWORD_REGEX.minLength.test(pwd)) {
      return '비밀번호는 8자 이상이어야 합니다.';
    }
    if (!PASSWORD_REGEX.hasLetter.test(pwd)) {
      return '영문자를 포함해야 합니다.';
    }
    if (!PASSWORD_REGEX.hasNumber.test(pwd)) {
      return '숫자를 포함해야 합니다.';
    }
    if (!PASSWORD_REGEX.hasSpecial.test(pwd)) {
      return '특수문자를 포함해야 합니다.';
    }
    return '';
  };

  const isValidEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr.trim());
  };

  const validateFamilyForm = (): string | null => {
    if (!state.name.trim()) return '이름을 입력해주세요.';
    if (!state.email.trim()) return '이메일을 입력해주세요.';
    if (!isValidEmail(state.email)) return '유효한 이메일 형식을 입력해주세요.';
    if (!state.password.trim()) return '비밀번호를 입력해주세요.';

    const passwordError = validatePassword(state.password);
    if (passwordError) return passwordError;

    if (state.password !== state.passwordConfirm) return '비밀번호가 일치하지 않습니다.';

    return null;
  };

  const validateElderCode = (): string | null => {
    if (!state.code.trim()) return '초대코드를 입력해주세요.';
    if (state.code.trim().length !== 6) return '초대코드는 6자리입니다.';
    return null;
  };

  const validateElderInfo = (): string | null => {
    if (!state.name.trim()) return '성함을 입력해주세요.';
    if (!state.phoneNumber.trim()) return '전화번호를 입력해주세요.';
    const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
    if (!phoneRegex.test(state.phoneNumber)) return '올바른 전화번호 형식을 입력해주세요.';
    return null;
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setState((prev) => ({
      ...prev,
      role: selectedRole,
      step: selectedRole === 'FAMILY' ? 'family' : 'elder-code',
      error: '',
    }));
  };

  const handleFamilySignup = async () => {
    const validationError = validateFamilyForm();
    if (validationError) {
      setState((prev) => ({ ...prev, error: validationError }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: '' }));

    try {
      const request: SignUpRequest = {
        email: state.email.trim(),
        password: state.password,
        name: state.name.trim(),
        role: 'FAMILY',
      };

      const response = await authService.signup(request);

      if (response.success) {
        showSuccess('회원가입에 성공했습니다!', {
          onDismiss: onSignupSuccess,
        });
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || '회원가입에 실패했습니다.',
          isLoading: false,
        }));
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  };

  const handleElderCodeNext = useCallback(() => {
    const error = validateElderCode();
    if (error) {
      setState((prev) => ({ ...prev, error }));
      return;
    }
    setState((prev) => ({ ...prev, step: 'elder-info', error: '' }));
  }, [state.code]);

  const handleElderSignup = async () => {
    const validationError = validateElderInfo();
    if (validationError) {
      setState((prev) => ({ ...prev, error: validationError }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: '' }));

    try {
      const deviceId = Device.modelId || Device.osBuildFingerprint || 'unknown-device';

      const response = await elderService.acceptElderInvitation({
        code: state.code.trim(),
        name: state.name.trim(),
        phoneNumber: state.phoneNumber.replace(/-/g, ''),
        deviceId,
      });

      if (!response.success) {
        throw new Error(response.message || '계정 생성에 실패했습니다.');
      }

      const { data } = response;

      await setAuthToken(data.accessToken);
      await setRefreshToken(data.refreshToken);

      setToken(data.accessToken);
      setUserRole('ELDER');

      showSuccess('어르신 계정이 생성되었습니다!', {
        onDismiss: onSignupSuccess,
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);

      if (errorMessage.includes('EX-F001E-01')) {
        showError('존재하지 않는 초대코드입니다.');
        setState((prev) => ({ ...prev, step: 'elder-code', isLoading: false }));
      } else if (errorMessage.includes('EX-F001E-02')) {
        showError('성함 불일치로 보류 중입니다. 가족분께 확인 후 다시 시도해주세요.');
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      } else if (errorMessage.includes('EX-F001E-03')) {
        showError('이미 등록된 전화번호입니다.');
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      } else if (errorMessage.includes('EX-F001E-04')) {
        showError('코드 시도 횟수를 초과했습니다. 새 코드를 받아주세요.');
        setState((prev) => ({ ...prev, step: 'elder-code', isLoading: false }));
      } else {
        showError(errorMessage);
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Indicator for Elder Flow */}
      {(state.step === 'elder-code' || state.step === 'elder-info') && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, state.step === 'elder-code' && styles.progressStepActive]}>
            <Text style={[styles.progressNumber, state.step === 'elder-code' && styles.progressNumberActive]}>
              1
            </Text>
            <Text style={[styles.progressLabel, state.step === 'elder-code' && styles.progressLabelActive]}>
              코드
            </Text>
          </View>
          <View style={styles.progressBar} />
          <View style={[styles.progressStep, state.step === 'elder-info' && styles.progressStepActive]}>
            <Text style={[styles.progressNumber, state.step === 'elder-info' && styles.progressNumberActive]}>
              2
            </Text>
            <Text style={[styles.progressLabel, state.step === 'elder-info' && styles.progressLabelActive]}>
              정보
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(insets.top, 20) }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {state.step === 'role' ? '해미에 가입' : state.step === 'family' ? '가족 가입' : state.step === 'elder-code' ? '초대코드 확인' : '정보 입력'}
        </Text>

        {state.error ? <Text style={styles.errorText}>{state.error}</Text> : null}

        {/* Role Selection Screen */}
        {state.step === 'role' && (
          <View style={styles.roleSection}>
            <Text style={styles.label}>역할 선택</Text>
            <View style={styles.roleButtons}>
              {(['FAMILY', 'ELDER'] as const).map((r) => (
                <Pressable
                  key={r}
                  style={[
                    styles.roleButton,
                    state.role === r && styles.roleButtonActive,
                  ]}
                  onPress={() => handleRoleSelect(r)}
                  disabled={state.isLoading}
                >
                  <Text style={[styles.roleButtonText, state.role === r && styles.roleButtonTextActive]}>
                    {r === 'FAMILY' ? '가족' : '어르신'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Family Signup Form */}
        {state.step === 'family' && (
          <>
            <Text style={styles.subtitle}>가족 보호자로 가입해주세요</Text>

            <View style={styles.formSection}>
              <Text style={styles.label}>이름</Text>
              <TextInput
                style={styles.input}
                placeholder="홍길동"
                placeholderTextColor={colors.light.label.disabled}
                value={state.name}
                onChangeText={(name) => setState((prev) => ({ ...prev, name }))}
                editable={!state.isLoading}
                maxLength={50}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.input}
                placeholder="example@haemi.kr"
                placeholderTextColor={colors.light.label.disabled}
                value={state.email}
                onChangeText={(email) => setState((prev) => ({ ...prev, email }))}
                editable={!state.isLoading}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor={colors.light.label.disabled}
                value={state.password}
                onChangeText={(password) => setState((prev) => ({ ...prev, password }))}
                editable={!state.isLoading}
                secureTextEntry
                maxLength={128}
              />
              <Text style={styles.hint}>
                • 8자 이상{'\n'}
                • 영문자, 숫자, 특수문자(! @ # $ % ^ & *) 포함
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호 확인"
                placeholderTextColor={colors.light.label.disabled}
                value={state.passwordConfirm}
                onChangeText={(passwordConfirm) => setState((prev) => ({ ...prev, passwordConfirm }))}
                editable={!state.isLoading}
                secureTextEntry
                maxLength={30}
              />
            </View>
          </>
        )}

        {/* Elder Code Input */}
        {state.step === 'elder-code' && (
          <>
            <Text style={styles.subtitle}>가족으로부터 받은 6자리 초대코드를 입력해주세요.</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>초대코드</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예) ABC123"
                  placeholderTextColor={colors.light.label.disabled}
                  maxLength={6}
                  value={state.code}
                  onChangeText={(code) => setState((prev) => ({ ...prev, code: code.toUpperCase(), error: '' }))}
                  editable={!state.isLoading}
                  keyboardType="default"
                  autoFocus
                  textContentType="none"
                />
                <Text style={styles.inputHint}>{state.code.length}/6</Text>
              </View>
            </View>
          </>
        )}

        {/* Elder Info Input */}
        {state.step === 'elder-info' && (
          <>
            <Text style={styles.subtitle}>어르신의 이름과 전화번호를 입력해주세요.</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>성함</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예) 김영희"
                  placeholderTextColor={colors.light.label.disabled}
                  value={state.name}
                  onChangeText={(name) => setState((prev) => ({ ...prev, name, error: '' }))}
                  editable={!state.isLoading}
                  maxLength={50}
                  autoFocus
                />
                <Text style={styles.inputHint}>{state.name.length}/50</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>전화번호</Text>
                <TextInput
                  style={styles.input}
                  placeholder="010-1234-5678"
                  placeholderTextColor={colors.light.label.disabled}
                  value={state.phoneNumber}
                  onChangeText={(phoneNumber) =>
                    setState((prev) => ({ ...prev, phoneNumber, error: '' }))
                  }
                  editable={!state.isLoading}
                  keyboardType="phone-pad"
                  maxLength={13}
                />
                <Text style={styles.inputHint}>예) 010-1234-5678</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {state.step === 'role' && (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                state.isLoading && styles.signupButtonDisabled,
                pressed && styles.signupButtonPressed,
              ]}
              onPress={() => {}}
              disabled={state.isLoading}
            >
              <Text style={styles.signupButtonText}>
                {state.role === 'FAMILY' ? '가족으로 가입' : '어르신으로 가입'}
              </Text>
            </Pressable>

            <Pressable onPress={onLoginPress} disabled={state.isLoading}>
              <Text style={styles.loginLink}>이미 계정이 있으신가요? 로그인</Text>
            </Pressable>
          </>
        )}

        {state.step === 'family' && (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                state.isLoading && styles.signupButtonDisabled,
                pressed && styles.signupButtonPressed,
              ]}
              onPress={handleFamilySignup}
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <ActivityIndicator color={colors.light.background.normal} />
              ) : (
                <Text style={styles.signupButtonText}>다음으로</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => setState((prev) => ({ ...prev, step: 'role', error: '' }))}
              disabled={state.isLoading}
            >
              <Text style={styles.loginLink}>역할 다시 선택</Text>
            </Pressable>
          </>
        )}

        {state.step === 'elder-code' && (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                (state.code.length !== 6 || state.isLoading) && styles.signupButtonDisabled,
                pressed && styles.signupButtonPressed,
              ]}
              onPress={handleElderCodeNext}
              disabled={state.isLoading || state.code.length !== 6}
            >
              <Text style={styles.signupButtonText}>다음으로</Text>
            </Pressable>

            <Pressable
              onPress={() => setState((prev) => ({ ...prev, step: 'role', error: '', code: '' }))}
              disabled={state.isLoading}
            >
              <Text style={styles.loginLink}>역할 다시 선택</Text>
            </Pressable>
          </>
        )}

        {state.step === 'elder-info' && (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                state.isLoading && styles.signupButtonDisabled,
                pressed && styles.signupButtonPressed,
              ]}
              onPress={handleElderSignup}
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <ActivityIndicator color={colors.light.background.normal} />
              ) : (
                <Text style={styles.signupButtonText}>가입 완료</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => setState((prev) => ({ ...prev, step: 'elder-code', error: '' }))}
              disabled={state.isLoading}
            >
              <Text style={styles.loginLink}>이전</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background.normal,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 26,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.light.label.strong,
    marginBottom: 8,
    letterSpacing: -0.56,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.light.label.assistive,
    marginBottom: 24,
    lineHeight: 20,
    letterSpacing: -0.28,
  },
  errorText: {
    fontSize: 14,
    color: colors.status.error,
    marginBottom: 16,
    backgroundColor: colors.status.error + '10',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  roleSection: {
    marginBottom: 32,
    marginTop: 16,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.light.line.neutral,
    backgroundColor: colors.light.fill.normal,
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.label.normal,
    letterSpacing: -0.32,
  },
  roleButtonTextActive: {
    color: colors.light.background.normal,
  },
  formSection: {
    marginBottom: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.label.normal,
    marginBottom: 8,
    letterSpacing: -0.32,
  },
  input: {
    backgroundColor: colors.light.fill.normal,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.light.label.normal,
    borderWidth: 1,
    borderColor: colors.light.line.neutral,
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: colors.light.label.assistive,
    marginTop: 8,
    lineHeight: 18,
    letterSpacing: -0.24,
  },
  inputHint: {
    fontSize: 12,
    color: colors.light.label.assistive,
    paddingHorizontal: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: colors.light.background.neutral,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.line.neutral,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressStepActive: {
    opacity: 1,
  },
  progressNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light.line.neutral,
    color: colors.light.label.assistive,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginBottom: 6,
  },
  progressNumberActive: {
    backgroundColor: colors.primary,
    color: colors.light.background.normal,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.light.label.assistive,
  },
  progressLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    width: 24,
    height: 2,
    backgroundColor: colors.light.line.neutral,
    marginHorizontal: 12,
  },
  buttonContainer: {
    paddingHorizontal: 26,
    paddingTop: 16,
    gap: 12,
  },
  signupButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonDisabled: {
    backgroundColor: colors.light.fill.neutral,
  },
  signupButtonPressed: {
    opacity: 0.8,
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.background.normal,
    letterSpacing: -0.36,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
