import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { elderService, getErrorMessage } from '@/shared/api';
import { setAuthToken, setRefreshToken } from '@/shared/api/client';
import { useUserContext } from '@/shared/context/UserContext';
import { useToast } from '@/shared/hooks';
import * as Device from 'expo-device';

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

interface ElderSignupState {
  code: string;
  name: string;
  phoneNumber: string;
  isLoading: boolean;
  error: string | null;
}

export default function ElderSignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setToken, setRole } = useUserContext();
  const { success: showSuccess, error: showError } = useToast();
  const [state, setState] = useState<ElderSignupState>({
    code: '',
    name: '',
    phoneNumber: '',
    isLoading: false,
    error: null,
  });

  const validateForm = useCallback((): boolean => {
    if (!state.code.trim()) {
      setState((prev) => ({ ...prev, error: '초대코드를 입력해주세요.' }));
      return false;
    }

    if (state.code.trim().length !== 6) {
      setState((prev) => ({ ...prev, error: '초대코드는 6자리입니다.' }));
      return false;
    }

    if (!state.name.trim()) {
      setState((prev) => ({ ...prev, error: '성함을 입력해주세요.' }));
      return false;
    }

    if (!state.phoneNumber.trim()) {
      setState((prev) => ({ ...prev, error: '전화번호를 입력해주세요.' }));
      return false;
    }

    const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
    if (!phoneRegex.test(state.phoneNumber)) {
      setState((prev) => ({ ...prev, error: '올바른 전화번호 형식을 입력해주세요.' }));
      return false;
    }

    return true;
  }, [state.code, state.name, state.phoneNumber]);

  const handleSignup = useCallback(async () => {
    if (!validateForm()) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 기기 ID 가져오기
      const deviceId = Device.modelId || Device.osBuildFingerprint || 'unknown-device';

      // 어르신 초대 수락
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

      // 토큰 저장
      await setAuthToken(data.accessToken);
      await setRefreshToken(data.refreshToken);

      // 컨텍스트 업데이트
      setToken(data.accessToken);
      setRole('ELDER');

      showSuccess('어르신 계정이 생성되었습니다!', {
        onDismiss: () => router.replace('/'),
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);

      // 백엔드 예외 코드 처리
      if (errorMessage.includes('EX-F001E-01')) {
        showError('존재하지 않는 초대코드입니다.');
      } else if (errorMessage.includes('EX-F001E-02')) {
        showError('성함 불일치로 보류 중입니다. 가족분께 확인 후 다시 시도해주세요.');
      } else if (errorMessage.includes('EX-F001E-03')) {
        showError('이미 등록된 전화번호입니다.');
      } else if (errorMessage.includes('EX-F001E-04')) {
        showError('코드 시도 횟수를 초과했습니다. 새 코드를 받아주세요.');
      } else {
        showError(errorMessage);
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  }, [state.code, state.name, state.phoneNumber, validateForm, setToken, setRole, showSuccess, showError]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>어르신 계정 생성</Text>
          <Text style={styles.subtitle}>초대받은 정보를 입력해주세요.</Text>
        </View>

        {/* Error Message */}
        {state.error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{state.error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Code Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>초대코드</Text>
            <TextInput
              style={styles.input}
              placeholder="6자리 코드"
              placeholderTextColor="#999"
              maxLength={6}
              value={state.code}
              onChangeText={(code) => setState((prev) => ({ ...prev, code, error: null }))}
              editable={!state.isLoading}
              keyboardType="default"
            />
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>성함</Text>
            <TextInput
              style={styles.input}
              placeholder="예) 김영희"
              placeholderTextColor="#999"
              value={state.name}
              onChangeText={(name) => setState((prev) => ({ ...prev, name, error: null }))}
              editable={!state.isLoading}
              maxLength={50}
            />
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>전화번호</Text>
            <TextInput
              style={styles.input}
              placeholder="010-1234-5678"
              placeholderTextColor="#999"
              value={state.phoneNumber}
              onChangeText={(phoneNumber) =>
                setState((prev) => ({ ...prev, phoneNumber, error: null }))
              }
              editable={!state.isLoading}
              keyboardType="phone-pad"
              maxLength={13}
            />
          </View>
        </View>

        {/* Signup Button */}
        <Pressable
          onPress={handleSignup}
          disabled={state.isLoading}
          style={({ pressed }) => [
            styles.signupButton,
            {
              opacity: pressed || state.isLoading ? 0.6 : 1,
            },
          ]}
        >
          {state.isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.signupButtonText}>계정 생성</Text>
          )}
        </Pressable>

        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          disabled={state.isLoading}
          style={({ pressed }) => [
            styles.backButton,
            {
              opacity: pressed || state.isLoading ? 0.5 : 1,
            },
          ]}
        >
          <Text style={styles.backButtonText}>돌아가기</Text>
        </Pressable>
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
  errorBanner: {
    backgroundColor: colors.status.error,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
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
    lineHeight: 20.8,
    letterSpacing: -0.32,
    color: colors.label.neutral,
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line.alternative,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.label.normal,
  },
  signupButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  backButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line.alternative,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.label.neutral,
  },
});
