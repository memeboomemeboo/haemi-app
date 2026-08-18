import { View, ScrollView, StyleSheet, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { colors } from '@/shared/constants';
import { authService } from '@/shared/api/auth';
import { setCurrentAuthToken } from '@/shared/lib/auth';

interface LoginScreenProps {
  onLoginSuccess: (token: string) => void;
  onSignupPress: () => void;
}

export default function LoginScreen({ onLoginSuccess, onSignupPress }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({
        email: email.trim(),
        password,
      });

      if (response.success) {
        // 토큰 저장
        setCurrentAuthToken(response.data.accessToken);
        onLoginSuccess(response.data.accessToken);
      } else {
        setError(response.message || '로그인에 실패했습니다.');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || '로그인에 실패했습니다.';
      setError(message);
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
        <Text style={styles.title}>해미에 로그인</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
            placeholder="8자 이상"
            placeholderTextColor={colors.light.label.disabled}
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
            secureTextEntry
          />
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.loginButton,
            isLoading && styles.loginButtonDisabled,
            pressed && styles.loginButtonPressed,
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.light.background.normal} />
          ) : (
            <Text style={styles.loginButtonText}>로그인</Text>
          )}
        </Pressable>

        <Pressable onPress={onSignupPress} disabled={isLoading}>
          <Text style={styles.signupLink}>계정이 없으신가요? 가입하기</Text>
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
  buttonContainer: {
    paddingHorizontal: 26,
    paddingTop: 16,
    gap: 12,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: colors.light.fill.neutral,
  },
  loginButtonPressed: {
    opacity: 0.8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.background.normal,
    letterSpacing: -0.36,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
