import { View, ScrollView, StyleSheet, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { colors } from '@/shared/constants';
import { authService, getErrorMessage } from '@/shared/api';
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

export default function SignupScreen({ onSignupSuccess, onLoginPress }: SignupScreenProps) {
  const insets = useSafeAreaInsets();
  const { success: showSuccess } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('FAMILY');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const validateForm = (): string | null => {
    if (!name.trim()) return '이름을 입력해주세요.';
    if (!password.trim()) return '비밀번호를 입력해주세요.';

    const passwordError = validatePassword(password);
    if (passwordError) return passwordError;

    if (password !== passwordConfirm) return '비밀번호가 일치하지 않습니다.';
    if (!email.trim()) return '이메일을 입력해주세요.';

    return null;
  };

  const handleSignup = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const request: SignUpRequest = {
        email: email.trim(),
        password,
        name: name.trim(),
        role,
      };

      const response = await authService.signup(request);

      if (response.success) {
        showSuccess('회원가입에 성공했습니다!', {
          onDismiss: onSignupSuccess,
        });
      } else {
        setError(response.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(insets.top, 20) }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>해미에 가입</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* 역할 선택 */}
        <View style={styles.roleSection}>
          <Text style={styles.label}>역할 선택</Text>
          <View style={styles.roleButtons}>
            {(['FAMILY', 'ELDER'] as const).map((r) => (
              <Pressable
                key={r}
                style={[
                  styles.roleButton,
                  role === r && styles.roleButtonActive,
                ]}
                onPress={() => setRole(r)}
                disabled={isLoading}
              >
                <Text style={[styles.roleButtonText, role === r && styles.roleButtonTextActive]}>
                  {r === 'FAMILY' ? '가족' : '어르신'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.input}
            placeholder="홍길동"
            placeholderTextColor={colors.light.label.disabled}
            value={name}
            onChangeText={setName}
            editable={!isLoading}
            maxLength={50}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            placeholder="example@haemi.kr"
            placeholderTextColor={colors.light.label.disabled}
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
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
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
            secureTextEntry
            maxLength={30}
          />
          <Text style={styles.hint}>
            • 8자 이상 30자 이하{'\n'}
            • 영문자, 숫자, 특수문자(! @ # $ % ^ & *) 포함
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호 확인"
            placeholderTextColor={colors.light.label.disabled}
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            editable={!isLoading}
            secureTextEntry
            maxLength={30}
          />
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.signupButton,
            isLoading && styles.signupButtonDisabled,
            pressed && styles.signupButtonPressed,
          ]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.light.background.normal} />
          ) : (
            <Text style={styles.signupButtonText}>다음으로</Text>
          )}
        </Pressable>

        <Pressable onPress={onLoginPress} disabled={isLoading}>
          <Text style={styles.loginLink}>이미 계정이 있으신가요? 로그인</Text>
        </Pressable>
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
    marginBottom: 32,
    letterSpacing: -0.56,
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
  },
  hint: {
    fontSize: 12,
    color: colors.light.label.assistive,
    marginTop: 8,
    lineHeight: 18,
    letterSpacing: -0.24,
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
