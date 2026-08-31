import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { authService, getErrorMessage } from '@/shared/api';
import { pinStorage } from '@/features/auth';
import { setAuthToken, setRefreshToken } from '@/shared/api/client';
import { useUserContext } from '@/shared/context/UserContext';
import { useToast } from '@/shared/hooks';
import { getOrCreateDeviceId } from '@/shared/lib';

const colors = {
  primary: '#fd6941',
  status: {
    error: '#ee2a2b',
  },
  label: {
    normal: '#0c0c0d',
    neutral: '#3c3e3f',
    alternative: '#5a5c5d',
  },
  line: {
    alternative: '#e8e8e9',
  },
};

interface ElderSetupState {
  loginId: string;
  pin: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * 어르신 최초 설정 화면.
 * 보호자가 어르신 계정을 등록(POST /guardian/elders)하며 정한 아이디·비밀번호를
 * 한 번 입력해 로그인하고, 아이디를 기기에 저장한다. 이후에는 PIN만으로 로그인한다.
 */
export default function ElderSignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setToken, setRole } = useUserContext();
  const { success: showSuccess, error: showError } = useToast();
  const [state, setState] = useState<ElderSetupState>({
    loginId: '',
    pin: '',
    isLoading: false,
    error: null,
  });

  const validate = useCallback((): boolean => {
    if (!state.loginId.trim()) {
      setState((prev) => ({ ...prev, error: '아이디를 입력해주세요.' }));
      return false;
    }
    if (!/^\d{6}$/.test(state.pin)) {
      setState((prev) => ({ ...prev, error: '비밀번호 6자리를 입력해주세요.' }));
      return false;
    }
    return true;
  }, [state.loginId, state.pin]);

  const handleSetup = useCallback(async () => {
    if (!validate()) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const loginId = state.loginId.trim();
    try {
      const deviceId = await getOrCreateDeviceId();
      const tokens = await authService.loginWithPin({ loginId, pin: state.pin, deviceId });

      await setAuthToken(tokens.accessToken);
      await setRefreshToken(tokens.refreshToken);
      await pinStorage.saveElderLoginId(loginId);

      setToken(tokens.accessToken);
      setRole('ELDER');

      showSuccess('로그인되었습니다!', {
        onDismiss: () => router.replace('/elder-home'),
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      showError('아이디 또는 비밀번호가 올바르지 않아요.');
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, [state.loginId, state.pin, validate, setToken, setRole, showSuccess, showError, router]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>어르신 설정</Text>
          <Text style={styles.subtitle}>
            가족이 알려준 아이디와 비밀번호 6자리를 입력해주세요.
          </Text>
        </View>

        {/* Error Message */}
        {state.error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {state.error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>아이디</Text>
            <TextInput
              style={styles.input}
              placeholder="가족이 알려준 아이디"
              placeholderTextColor="#bbb"
              value={state.loginId}
              onChangeText={(loginId) => setState((prev) => ({ ...prev, loginId, error: null }))}
              editable={!state.isLoading}
              maxLength={50}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              textContentType="username"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="숫자 6자리"
              placeholderTextColor="#bbb"
              value={state.pin}
              onChangeText={(pin) =>
                setState((prev) => ({ ...prev, pin: pin.replace(/\D/g, '').slice(0, 6), error: null }))
              }
              editable={!state.isLoading}
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry
              textContentType="password"
            />
            <Text style={styles.inputHint}>{state.pin.length}/6</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleSetup}
            disabled={state.isLoading || !state.loginId.trim() || state.pin.length !== 6}
            style={({ pressed }) => [
              styles.primaryButton,
              (state.isLoading || !state.loginId.trim() || state.pin.length !== 6) &&
                styles.primaryButtonDisabled,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            {state.isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>시작하기</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            disabled={state.isLoading}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
          >
            <Text style={styles.secondaryButtonText}>돌아가기</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  // Header
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36.4,
    letterSpacing: -0.56,
    color: colors.label.neutral,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20.8,
    letterSpacing: -0.32,
    color: colors.label.alternative,
  },
  // Error Message
  errorBanner: {
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcccb',
    padding: 12,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.status.error,
  },
  // Form
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20.8,
    letterSpacing: -0.32,
    color: colors.label.neutral,
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.line.alternative,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.label.normal,
    marginBottom: 6,
  },
  inputHint: {
    fontSize: 12,
    color: colors.label.alternative,
    paddingHorizontal: 4,
  },
  // Buttons
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: colors.line.alternative,
    opacity: 0.5,
  },
  primaryButtonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.line.alternative,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    backgroundColor: '#f5f5f5',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.label.neutral,
  },
});
