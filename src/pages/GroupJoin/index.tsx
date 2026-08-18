import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { colors } from '@/shared/constants';
import { groupService, getErrorMessage } from '@/shared/api';
import { useToast } from '@/shared/hooks';
import { useUserContext } from '@/shared/context/UserContext';

interface JoinErrorType {
  code: 'NOT_FOUND' | 'EXPIRED' | 'DISABLED' | 'INVALID' | null;
  message: string;
}

interface GroupJoinState {
  inviteCode: string;
  isLoading: boolean;
  error: JoinErrorType;
  joined: boolean;
  groupId: string | null;
}

const ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: '존재하지 않는 초대코드입니다.',
  EXPIRED: '만료된 초대코드입니다.',
  DISABLED: '비활성화된 초대코드입니다.',
  INVALID: '유효하지 않은 코드 형식입니다.',
};

export default function GroupJoinScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { success: showSuccess } = useToast();
  const { setGroup } = useUserContext();
  const [state, setState] = useState<GroupJoinState>({
    inviteCode: '',
    isLoading: false,
    error: { code: null, message: '' },
    joined: false,
    groupId: null,
  });

  const handleJoinGroup = useCallback(async () => {
    const code = state.inviteCode.trim();

    if (!code) {
      setState((prev) => ({
        ...prev,
        error: { code: null, message: '초대코드를 입력해주세요.' },
      }));
      return;
    }

    if (code.length < 6) {
      setState((prev) => ({
        ...prev,
        error: { code: 'INVALID', message: ERROR_MESSAGES.INVALID },
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: { code: null, message: '' } }));

    try {
      const response = await groupService.acceptInvitation(code);

      if (!response.success) {
        throw new Error(response.message || '참여에 실패했습니다.');
      }

      setGroup(response.data);

      setState((prev) => ({
        ...prev,
        joined: true,
        groupId: response.data.groupId,
        isLoading: false,
      }));

      showSuccess('그룹에 참여했습니다!', {
        onDismiss: () => router.replace('/'),
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      let errorCode: 'NOT_FOUND' | 'EXPIRED' | 'DISABLED' | 'INVALID' = 'INVALID';

      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        errorCode = 'NOT_FOUND';
      } else if (errorMessage.includes('expired')) {
        errorCode = 'EXPIRED';
      } else if (errorMessage.includes('disabled')) {
        errorCode = 'DISABLED';
      }

      setState((prev) => ({
        ...prev,
        error: {
          code: errorCode,
          message: ERROR_MESSAGES[errorCode] || errorMessage,
        },
        isLoading: false,
      }));
    }
  }, [state.inviteCode, setGroup, showSuccess, router]);

  const handleInputChange = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      inviteCode: text.toUpperCase(),
      error: { code: null, message: '' },
    }));
  }, []);

  if (state.joined) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(insets.top, 20) }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>

          <Text style={styles.successTitle}>그룹에 참여했습니다</Text>
          <Text style={styles.successSubtitle}>가족과 함께 추억을 공유해보세요</Text>

          <View style={styles.successMessage}>
            <Text style={styles.successMessageText}>
              이제 보호자님과 추억을 함께 공유할 수 있습니다.
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.startButtonPressed,
            ]}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.startButtonText}>시작하기</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(insets.top, 20) }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>그룹 참여</Text>
        <Text style={styles.subtitle}>보호자님으로부터 받은 초대코드를 입력해주세요</Text>

        <View style={styles.formSection}>
          <Text style={styles.label}>초대코드</Text>
          <TextInput
            style={[styles.input, state.error.code && styles.inputError]}
            placeholder="초대코드 입력 (6자 이상)"
            placeholderTextColor={colors.light.label.disabled}
            value={state.inviteCode}
            onChangeText={handleInputChange}
            maxLength={20}
            autoCapitalize="characters"
            editable={!state.isLoading}
          />
          {state.error.message && <Text style={styles.errorText}>{state.error.message}</Text>}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>초대코드란?</Text>
          <Text style={styles.infoText}>
            초대코드는 보호자님이 그룹을 생성할 때 발급받은 코드입니다. 보호자님에게 문의해주세요.
          </Text>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            올바른 초대코드를 입력해야 그룹에 참여할 수 있습니다.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.joinButton,
            (state.isLoading || !state.inviteCode.trim()) && styles.joinButtonDisabled,
            pressed && styles.joinButtonPressed,
          ]}
          onPress={handleJoinGroup}
          disabled={state.isLoading || !state.inviteCode.trim()}
        >
          {state.isLoading ? (
            <ActivityIndicator color={colors.light.background.normal} />
          ) : (
            <Text style={styles.joinButtonText}>참여</Text>
          )}
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
    marginBottom: 8,
    letterSpacing: -0.56,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.light.label.assistive,
    marginBottom: 40,
    letterSpacing: -0.32,
    lineHeight: 21,
  },
  formSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.label.normal,
    marginBottom: 12,
    letterSpacing: -0.32,
  },
  input: {
    backgroundColor: colors.light.fill.normal,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.label.strong,
    borderWidth: 1,
    borderColor: colors.light.line.neutral,
    letterSpacing: 2,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  errorText: {
    fontSize: 14,
    color: colors.status.error,
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  infoBox: {
    backgroundColor: colors.light.background.neutral,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.label.strong,
    marginBottom: 8,
    letterSpacing: -0.28,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.label.assistive,
    lineHeight: 20,
    letterSpacing: -0.28,
  },
  noticeBox: {
    backgroundColor: colors.light.fill.alternative,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.light.line.neutral,
  },
  noticeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.label.assistive,
    lineHeight: 20,
    letterSpacing: -0.28,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.status.success,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  successIconText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.light.background.normal,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.light.label.strong,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.48,
  },
  successSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.36,
  },
  successMessage: {
    backgroundColor: colors.light.background.neutral,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  successMessageText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.light.label.normal,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: -0.32,
  },
  buttonContainer: {
    paddingHorizontal: 26,
    paddingTop: 16,
  },
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: colors.light.fill.neutral,
  },
  joinButtonPressed: {
    opacity: 0.8,
  },
  joinButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.background.normal,
    letterSpacing: -0.36,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonPressed: {
    opacity: 0.8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.background.normal,
    letterSpacing: -0.36,
  },
});
