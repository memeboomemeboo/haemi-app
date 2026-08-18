import { View, ScrollView, StyleSheet, Text, TextInput, Pressable, ActivityIndicator, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import * as Device from 'expo-device';
import { colors } from '@/shared/constants';
import { authService, elderService, groupService, getErrorMessage } from '@/shared/api';
import { setAuthToken, setRefreshToken } from '@/shared/api/client';
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
  step: 'role' | 'family' | 'family-invite-share' | 'elder';
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  code: string;
  phoneNumber: string;
  role: UserRole;
  isLoading: boolean;
  error: string;
  groupId?: string;
  invitationCode?: string;
  memberId?: string;
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

  const validateElderForm = (): string | null => {
    if (!state.code.trim()) return '초대코드를 입력해주세요.';
    if (state.code.trim().length !== 6) return '초대코드는 6자리입니다.';
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
      step: selectedRole === 'FAMILY' ? 'family' : 'elder',
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

      if (!response.success) {
        setState((prev) => ({
          ...prev,
          error: response.message || '회원가입에 실패했습니다.',
          isLoading: false,
        }));
        return;
      }

      const { data } = response;

      // 토큰 저장
      await setAuthToken(data.accessToken);
      if (data.refreshToken) {
        await setRefreshToken(data.refreshToken);
      }

      // UserContext에 토큰 저장
      setToken(data.accessToken);
      setUserRole('FAMILY');

      // 그룹 생성
      const groupResponse = await groupService.createGroup({
        relation: 'SON',
        notificationPreference: 'ALL',
      });

      if (!groupResponse.success || !groupResponse.data?.groupId) {
        throw new Error('그룹 생성에 실패했습니다.');
      }

      const groupId = groupResponse.data.groupId;

      // 초대 코드 생성 (임시 전화번호로 설정)
      const invitationResponse = await groupService.createInvitation(groupId, {
        phoneNumber: '', // 초대 코드 생성 시에는 전화번호 미필요
        relation: 'SON',
      });

      if (!invitationResponse.success || !invitationResponse.data?.token) {
        throw new Error('초대 코드 생성에 실패했습니다.');
      }

      // 초대 코드 공유 화면으로 이동
      setState((prev) => ({
        ...prev,
        step: 'family-invite-share',
        groupId,
        invitationCode: invitationResponse.data.token,
        memberId: data.memberId,
        isLoading: false,
      }));

      showSuccess('회원가입에 성공했습니다!');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  };

  const handleElderSignup = async () => {
    const validationError = validateElderForm();
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
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      } else if (errorMessage.includes('EX-F001E-02')) {
        showError('성함 불일치로 보류 중입니다. 가족분께 확인 후 다시 시도해주세요.');
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      } else if (errorMessage.includes('EX-F001E-03')) {
        showError('이미 등록된 전화번호입니다.');
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      } else if (errorMessage.includes('EX-F001E-04')) {
        showError('코드 시도 횟수를 초과했습니다. 새 코드를 받아주세요.');
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      } else {
        showError(errorMessage);
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      }
    }
  };

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(insets.top, 20) }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {state.step === 'role' ? '해미에 가입' : state.step === 'family' ? '가족 가입' : state.step === 'family-invite-share' ? '어르신을 초대해주세요' : '어르신 가입'}
        </Text>

        {state.error ? <Text style={styles.errorText}>{state.error}</Text> : null}

        {/* Role Selection Screen */}
        {state.step === 'role' && (
          <View style={styles.roleSection}>
            <Text style={styles.roleTitle}>어떤 역할로 가입하실까요?</Text>
            <View style={styles.roleCardsContainer}>
              {/* Family Card */}
              <Pressable
                style={({ pressed }) => [
                  styles.roleCard,
                  state.role === 'FAMILY' && styles.roleCardActive,
                  pressed && styles.roleCardPressed,
                ]}
                onPress={() => handleRoleSelect('FAMILY')}
                disabled={state.isLoading}
              >
                <Text style={styles.roleEmoji}>👨‍👩‍👧</Text>
                <Text style={styles.roleCardTitle}>가족</Text>
                <Text style={styles.roleCardDesc}>어르신의 추억을 기록하고{'\n'}가족과 함께 공유해요</Text>
                {state.role === 'FAMILY' && <Text style={styles.roleCheckmark}>✓</Text>}
              </Pressable>

              {/* Elder Card */}
              <Pressable
                style={({ pressed }) => [
                  styles.roleCard,
                  state.role === 'ELDER' && styles.roleCardActive,
                  pressed && styles.roleCardPressed,
                ]}
                onPress={() => handleRoleSelect('ELDER')}
                disabled={state.isLoading}
              >
                <Text style={styles.roleEmoji}>👵</Text>
                <Text style={styles.roleCardTitle}>어르신</Text>
                <Text style={styles.roleCardDesc}>보호자가 기록한 추억을{'\n'}함께 나눠요</Text>
                {state.role === 'ELDER' && <Text style={styles.roleCheckmark}>✓</Text>}
              </Pressable>
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

        {/* Family Invitation Share Screen */}
        {state.step === 'family-invite-share' && (
          <>
            <View style={styles.inviteSection}>
              <Text style={styles.inviteTitle}>어르신을 초대해주세요</Text>
              <Text style={styles.inviteSubtitle}>
                가족의 어르신이 이 코드를 입력하고 가입하면,{'\n'}함께 추억을 나눌 수 있습니다.
              </Text>

              <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>초대코드</Text>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{state.invitationCode}</Text>
                  <Pressable
                    onPress={() => {
                      if (state.invitationCode) {
                        Share.share({
                          message: `해미 초대코드: ${state.invitationCode}\n\n이 코드를 입력하여 어르신 계정을 만들어주세요.`,
                          title: '해미 초대코드',
                        });
                      }
                    }}
                    style={styles.copyButton}
                  >
                    <Text style={styles.copyButtonText}>복사</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  💡 어르신이 앱을 설치한 후 &lsquo;어르신으로 가입&rsquo; 을 선택하고 이 코드를 입력하면 됩니다.
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Elder Signup Form */}
        {state.step === 'elder' && (
          <>
            <Text style={styles.subtitle}>초대코드, 성함, 전화번호를 입력해주세요</Text>

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
          <Pressable onPress={onLoginPress} disabled={state.isLoading}>
            <Text style={styles.loginLink}>이미 계정이 있으신가요? 로그인</Text>
          </Pressable>
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

        {state.step === 'family-invite-share' && (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                state.isLoading && styles.signupButtonDisabled,
                pressed && styles.signupButtonPressed,
              ]}
              onPress={async () => {
                try {
                  await Share.share({
                    message: `해미 초대코드: ${state.invitationCode}\n\n이 코드를 입력하여 어르신 계정을 만들어주세요.`,
                    title: '해미 초대코드',
                  });
                } catch (err) {
                  if (__DEV__) console.error('Share failed:', err);
                }
              }}
              disabled={state.isLoading}
            >
              <Text style={styles.signupButtonText}>공유하기</Text>
            </Pressable>

            <Pressable
              onPress={onSignupSuccess}
              disabled={state.isLoading}
            >
              <Text style={styles.loginLink}>나중에</Text>
            </Pressable>
          </>
        )}

        {state.step === 'elder' && (
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
              onPress={() => setState((prev) => ({ ...prev, step: 'role', error: '', code: '', name: '', phoneNumber: '' }))}
              disabled={state.isLoading}
            >
              <Text style={styles.loginLink}>역할 다시 선택</Text>
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
    marginTop: 24,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.light.label.strong,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  roleCardsContainer: {
    gap: 12,
  },
  roleCard: {
    backgroundColor: colors.light.fill.normal,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.light.line.neutral,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  roleCardActive: {
    backgroundColor: colors.light.background.neutral,
    borderColor: colors.primary,
  },
  roleCardPressed: {
    opacity: 0.7,
  },
  roleEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  roleCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.label.strong,
    marginBottom: 8,
    letterSpacing: -0.36,
  },
  roleCardDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.light.label.assistive,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: -0.26,
  },
  roleCheckmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    color: colors.light.background.normal,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
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
  inviteSection: {
    marginVertical: 24,
  },
  inviteTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.light.label.strong,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.48,
  },
  inviteSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.light.label.assistive,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: -0.28,
  },
  codeContainer: {
    marginBottom: 32,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.label.normal,
    marginBottom: 8,
    letterSpacing: -0.28,
  },
  codeBox: {
    backgroundColor: colors.light.fill.normal,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.background.normal,
    letterSpacing: -0.24,
  },
  infoBox: {
    backgroundColor: colors.light.background.neutral,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.line.neutral,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.light.label.assistive,
    lineHeight: 18,
    letterSpacing: -0.26,
  },
});
