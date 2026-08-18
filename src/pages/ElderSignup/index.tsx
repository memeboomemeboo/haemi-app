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
  step: 'code' | 'info'; // 1단계: 코드, 2단계: 이름·전화
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
    step: 'code',
    code: '',
    name: '',
    phoneNumber: '',
    isLoading: false,
    error: null,
  });

  // 1단계: 코드 검증
  const validateCode = useCallback((): boolean => {
    if (!state.code.trim()) {
      setState((prev) => ({ ...prev, error: '초대코드를 입력해주세요.' }));
      return false;
    }

    if (state.code.trim().length !== 6) {
      setState((prev) => ({ ...prev, error: '초대코드는 6자리입니다.' }));
      return false;
    }

    return true;
  }, [state.code]);

  // 2단계: 이름·전화번호 검증
  const validateInfo = useCallback((): boolean => {
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
  }, [state.name, state.phoneNumber]);

  // 1단계에서 "다음" 버튼 클릭
  const handleCodeNext = useCallback(() => {
    if (!validateCode()) return;
    setState((prev) => ({ ...prev, step: 'info', error: null }));
  }, [validateCode]);

  // 2단계에서 "가입" 버튼 클릭
  const handleSignup = useCallback(async () => {
    if (!validateInfo()) return;

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
        setState((prev) => ({ ...prev, step: 'code' }));
      } else if (errorMessage.includes('EX-F001E-02')) {
        showError('성함 불일치로 보류 중입니다. 가족분께 확인 후 다시 시도해주세요.');
      } else if (errorMessage.includes('EX-F001E-03')) {
        showError('이미 등록된 전화번호입니다.');
      } else if (errorMessage.includes('EX-F001E-04')) {
        showError('코드 시도 횟수를 초과했습니다. 새 코드를 받아주세요.');
        setState((prev) => ({ ...prev, step: 'code' }));
      } else {
        showError(errorMessage);
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  }, [state.code, state.name, state.phoneNumber, validateInfo, setToken, setRole, showSuccess, showError]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, state.step === 'code' && styles.progressStepActive]}>
          <Text style={[styles.progressNumber, state.step === 'code' && styles.progressNumberActive]}>
            1
          </Text>
          <Text style={[styles.progressLabel, state.step === 'code' && styles.progressLabelActive]}>
            코드
          </Text>
        </View>
        <View style={styles.progressBar} />
        <View style={[styles.progressStep, state.step === 'info' && styles.progressStepActive]}>
          <Text style={[styles.progressNumber, state.step === 'info' && styles.progressNumberActive]}>
            2
          </Text>
          <Text style={[styles.progressLabel, state.step === 'info' && styles.progressLabelActive]}>
            정보
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {state.step === 'code' ? '초대코드 확인' : '정보 입력'}
          </Text>
          <Text style={styles.subtitle}>
            {state.step === 'code'
              ? '가족으로부터 받은 6자리 초대코드를 입력해주세요.'
              : '어르신의 이름과 전화번호를 입력해주세요.'}
          </Text>
        </View>

        {/* Error Message */}
        {state.error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {state.error}</Text>
          </View>
        )}

        {/* Step 1: Code Input */}
        {state.step === 'code' && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>초대코드</Text>
              <TextInput
                style={styles.input}
                placeholder="예) ABC123"
                placeholderTextColor="#bbb"
                maxLength={6}
                value={state.code}
                onChangeText={(code) => setState((prev) => ({ ...prev, code: code.toUpperCase(), error: null }))}
                editable={!state.isLoading}
                keyboardType="default"
                autoFocus
                textContentType="none"
              />
              <Text style={styles.inputHint}>{state.code.length}/6</Text>
            </View>
          </View>
        )}

        {/* Step 2: Info Input */}
        {state.step === 'info' && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>성함</Text>
              <TextInput
                style={styles.input}
                placeholder="예) 김영희"
                placeholderTextColor="#bbb"
                value={state.name}
                onChangeText={(name) => setState((prev) => ({ ...prev, name, error: null }))}
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
                placeholderTextColor="#bbb"
                value={state.phoneNumber}
                onChangeText={(phoneNumber) =>
                  setState((prev) => ({ ...prev, phoneNumber, error: null }))
                }
                editable={!state.isLoading}
                keyboardType="phone-pad"
                maxLength={13}
              />
              <Text style={styles.inputHint}>예) 010-1234-5678</Text>
            </View>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {state.step === 'code' && (
            <>
              <Pressable
                onPress={handleCodeNext}
                disabled={state.isLoading || state.code.length !== 6}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (state.code.length !== 6 || state.isLoading) && styles.primaryButtonDisabled,
                  pressed && styles.primaryButtonPressed,
                ]}
              >
                <Text style={styles.primaryButtonText}>다음으로</Text>
              </Pressable>

              <Pressable
                onPress={() => router.back()}
                disabled={state.isLoading}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.secondaryButtonPressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>돌아가기</Text>
              </Pressable>
            </>
          )}

          {state.step === 'info' && (
            <>
              <Pressable
                onPress={handleSignup}
                disabled={state.isLoading}
                style={({ pressed }) => [
                  styles.primaryButton,
                  state.isLoading && styles.primaryButtonDisabled,
                  pressed && styles.primaryButtonPressed,
                ]}
              >
                {state.isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>가입 완료</Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => setState((prev) => ({ ...prev, step: 'code', error: null }))}
                disabled={state.isLoading}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.secondaryButtonPressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>이전</Text>
              </Pressable>
            </>
          )}
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
  // Progress Indicator
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: colors.line.alternative,
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
    backgroundColor: colors.line.alternative,
    color: colors.label.alternative,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginBottom: 6,
  },
  progressNumberActive: {
    backgroundColor: colors.primary,
    color: '#ffffff',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.label.alternative,
  },
  progressLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    width: 24,
    height: 2,
    backgroundColor: colors.line.alternative,
    marginHorizontal: 12,
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
