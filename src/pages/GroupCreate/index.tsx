import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '@/shared/constants';
import { groupAPI, type Relation, type NotificationPreference } from '@/entities/group';
import { useUserContext } from '@/shared/context/UserContext';

interface GroupCreateState {
  groupName: string;
  inviteCode: string | null;
  isLoading: boolean;
  error: string | null;
  groupId: string | null;
  relation: Relation;
  notificationPreference: NotificationPreference;
}

export default function GroupCreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setGroup, relation, phoneNumber } = useUserContext();
  const [state, setState] = useState<GroupCreateState>({
    groupName: '',
    inviteCode: null,
    isLoading: false,
    error: null,
    groupId: null,
    relation: relation || 'SON',
    notificationPreference: 'ALL',
  });
  const [copied, setCopied] = useState(false);

  // 그룹이 생성되면 자동으로 홈으로 이동
  useEffect(() => {
    if (state.groupId && state.inviteCode) {
      const timer = setTimeout(() => {
        router.replace('/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.groupId, state.inviteCode, router]);

  const handleCreateGroup = async () => {
    if (!state.groupName.trim()) {
      setState(prev => ({ ...prev, error: '그룹명을 입력해주세요.' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await groupAPI.createGroup({
        relation: state.relation,
        notificationPreference: state.notificationPreference,
      });

      if (response.success) {
        const groupId = response.data.groupId;

        // Context에 그룹 정보 저장
        setGroup(response.data);

        setState(prev => ({
          ...prev,
          groupId,
          isLoading: false,
        }));

        // 초대코드 자동 생성
        try {
          const invitationResponse = await groupAPI.createInvitation(groupId, {
            phoneNumber: phoneNumber || '',
            relation: state.relation,
          });

          if (invitationResponse.success) {
            setState(prev => ({
              ...prev,
              inviteCode: invitationResponse.data.token,
            }));
          }
        } catch (inviteErr) {
          console.error('초대코드 생성 실패:', inviteErr);
          setState(prev => ({
            ...prev,
            error: '초대코드 생성에 실패했습니다.',
          }));
        }
      }
    } catch (err) {
      console.error('그룹 생성 실패:', err);
      setState(prev => ({
        ...prev,
        error: '그룹 생성에 실패했습니다. 다시 시도해주세요.',
        isLoading: false,
      }));
    }
  };

  const handleCopyCode = () => {
    if (state.inviteCode) {
      // TODO: 실제 클립보드 복사 구현
      // import { Clipboard } from 'react-native';
      // Clipboard.setString(state.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (state.inviteCode) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(insets.top, 20) }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>그룹이 생성되었습니다</Text>
          <Text style={styles.subtitle}>어르신에게 초대코드를 공유해주세요</Text>

          <View style={styles.successBox}>
            <Text style={styles.groupNameLabel}>그룹명</Text>
            <Text style={styles.groupNameValue}>{state.groupName}</Text>
          </View>

          <View style={styles.inviteCodeBox}>
            <Text style={styles.inviteCodeLabel}>초대코드</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.inviteCodeValue}>{state.inviteCode}</Text>
              <Pressable
                style={[styles.copyButton, copied && styles.copyButtonActive]}
                onPress={handleCopyCode}
              >
                <Text style={[styles.copyButtonText, copied && styles.copyButtonTextActive]}>
                  {copied ? '복사됨' : '복사'}
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.notice}>
            초대코드는 어르신이 그룹에 참여할 때 필요합니다.{'\n'}안전한 방법으로 공유해주세요.
          </Text>
        </ScrollView>

        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
            ]}
          >
            <Text style={styles.continueButtonText}>확인</Text>
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
        <Text style={styles.title}>그룹 생성</Text>
        <Text style={styles.subtitle}>어르신을 초대할 그룹을 만들어주세요</Text>

        <View style={styles.formSection}>
          <Text style={styles.label}>그룹명</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 김가족, 박할머니 가족"
            placeholderTextColor={colors.light.label.disabled}
            value={state.groupName}
            onChangeText={text => setState(prev => ({ ...prev, groupName: text, error: null }))}
            editable={!state.isLoading}
          />
          {state.error && <Text style={styles.errorText}>{state.error}</Text>}
        </View>

        <Text style={styles.infoText}>
          그룹은 최대 1개까지 생성할 수 있으며, 생성 후에는 그룹명을 변경할 수 있습니다.
        </Text>
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            (state.isLoading || !state.groupName.trim()) && styles.createButtonDisabled,
            pressed && styles.createButtonPressed,
          ]}
          onPress={handleCreateGroup}
          disabled={state.isLoading || !state.groupName.trim()}
        >
          <Text style={styles.createButtonText}>
            {state.isLoading ? '생성 중...' : '그룹 생성'}
          </Text>
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
    marginBottom: 24,
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
    fontSize: 16,
    color: colors.light.label.normal,
    borderWidth: 1,
    borderColor: colors.light.line.neutral,
  },
  errorText: {
    fontSize: 14,
    color: colors.status.error,
    marginTop: 8,
    letterSpacing: -0.28,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.label.assistive,
    lineHeight: 20,
    letterSpacing: -0.28,
  },
  successBox: {
    backgroundColor: colors.light.fill.normal,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.light.line.neutral,
  },
  groupNameLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.label.assistive,
    marginBottom: 8,
    letterSpacing: -0.28,
  },
  groupNameValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.label.strong,
    letterSpacing: -0.4,
  },
  inviteCodeBox: {
    backgroundColor: colors.light.fill.normal,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.light.line.neutral,
  },
  inviteCodeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.label.assistive,
    marginBottom: 8,
    letterSpacing: -0.28,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inviteCodeValue: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.4,
    fontFamily: 'Menlo',
  },
  copyButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  copyButtonActive: {
    backgroundColor: colors.status.success,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.background.normal,
    letterSpacing: -0.28,
  },
  copyButtonTextActive: {
    color: colors.light.background.normal,
  },
  notice: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.label.assistive,
    lineHeight: 21,
    letterSpacing: -0.28,
  },
  buttonContainer: {
    paddingHorizontal: 26,
    paddingTop: 16,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    backgroundColor: colors.light.fill.neutral,
  },
  createButtonPressed: {
    opacity: 0.8,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.background.normal,
    letterSpacing: -0.36,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonPressed: {
    opacity: 0.8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.background.normal,
    letterSpacing: -0.36,
  },
});
