import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '@/shared/constants';
import type { UserRole } from '@/entities/group';

interface RoleSelectProps {
  onRoleSelect: (role: UserRole) => void;
}

export default function RoleSelectScreen({ onRoleSelect }: RoleSelectProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;

    // 어르신 선택 시 별도의 회원가입 화면으로 이동
    if (selectedRole === 'ELDER') {
      router.push('/elder-signup');
      return;
    }

    // 가족 선택 시 기존 흐름
    console.log('Selected role:', selectedRole);
    onRoleSelect(selectedRole);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(insets.top, 20) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.logo}>해미</Text>
          <Text style={styles.title}>어떤 역할로 시작할까요?</Text>
          <Text style={styles.subtitle}>보호자와 어르신 중 선택해주세요</Text>
        </View>

        <View style={styles.optionsSection}>
          {/* 보호자 옵션 */}
          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              selectedRole === 'FAMILY' && styles.optionCardSelected,
              pressed && styles.optionCardPressed,
            ]}
            onPress={() => setSelectedRole('FAMILY')}
          >
            <View style={styles.optionContent}>
              <View style={styles.roleIcon}>
                <Text style={styles.roleIconText}>👨‍👩‍👧</Text>
              </View>
              <Text style={styles.roleTitle}>보호자</Text>
              <Text style={styles.roleDescription}>
                어르신의 추억을 기록하고{'\n'}가족과 함께 공유합니다
              </Text>
            </View>
            {selectedRole === 'FAMILY' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </Pressable>

          {/* 어르신 옵션 */}
          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              selectedRole === 'ELDER' && styles.optionCardSelected,
              pressed && styles.optionCardPressed,
            ]}
            onPress={() => setSelectedRole('ELDER')}
          >
            <View style={styles.optionContent}>
              <View style={styles.roleIcon}>
                <Text style={styles.roleIconText}>👵</Text>
              </View>
              <Text style={styles.roleTitle}>어르신</Text>
              <Text style={styles.roleDescription}>
                보호자가 기록한 추억을{'\n'}함께 나눕니다
              </Text>
            </View>
            {selectedRole === 'ELDER' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            역할은 나중에 변경할 수 없으니 신중하게 선택해주세요.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.confirmButton,
            !selectedRole && styles.confirmButtonDisabled,
            pressed && styles.confirmButtonPressed,
          ]}
          disabled={!selectedRole}
          onPress={handleContinue}
        >
          <Text style={styles.confirmButtonText}>
            {selectedRole === 'FAMILY' ? '보호자로 계속' : selectedRole === 'ELDER' ? '어르신으로 계속' : '역할 선택'}
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 48,
    marginTop: 20,
  },
  logo: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 24,
    letterSpacing: -0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.light.label.strong,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.48,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.light.label.assistive,
    textAlign: 'center',
    letterSpacing: -0.32,
    lineHeight: 21,
  },
  optionsSection: {
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    backgroundColor: colors.light.fill.normal,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.light.line.neutral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCardSelected: {
    backgroundColor: colors.light.background.neutral,
    borderColor: colors.primary,
  },
  optionCardPressed: {
    opacity: 0.7,
  },
  optionContent: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  roleIcon: {
    marginBottom: 8,
  },
  roleIconText: {
    fontSize: 48,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.label.strong,
    letterSpacing: -0.4,
  },
  roleDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.label.assistive,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: -0.28,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkmarkText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.background.normal,
  },
  infoSection: {
    backgroundColor: colors.light.background.neutral,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.light.line.neutral,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.label.assistive,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: -0.28,
  },
  buttonContainer: {
    paddingHorizontal: 26,
    paddingTop: 16,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.light.fill.neutral,
  },
  confirmButtonPressed: {
    opacity: 0.8,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.background.normal,
    letterSpacing: -0.36,
  },
});
