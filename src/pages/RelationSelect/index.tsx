import { View, ScrollView, StyleSheet, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { colors } from '@/shared/constants';
import { useUserContext } from '@/shared/context/UserContext';
import type { Relation } from '@/entities/group';

interface RelationSelectScreenProps {
  onRelationSelect: (relation: Relation, phoneNumber: string) => void;
}

const RELATION_OPTIONS: { value: Relation; label: string }[] = [
  { value: 'SON', label: '아들' },
  { value: 'DAUGHTER', label: '딸' },
  { value: 'OTHER', label: '기타' },
];

export default function RelationSelectScreen({ onRelationSelect }: RelationSelectScreenProps) {
  const insets = useSafeAreaInsets();
  const { setRelation, setPhoneNumber } = useUserContext();
  const [relation, setRelationState] = useState<Relation>('SON');
  const [phoneNumber, setPhoneNumberState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async () => {
    if (!phoneNumber.trim()) {
      setError('연락처를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Context에 저장
      setRelation(relation);
      setPhoneNumber(phoneNumber.trim());

      // 다음 화면으로 이동
      onRelationSelect(relation, phoneNumber.trim());
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
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
        <Text style={styles.title}>어르신과의 관계</Text>
        <Text style={styles.subtitle}>어르신과의 관계를 선택해주세요</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* 관계 선택 */}
        <View style={styles.relationSection}>
          <Text style={styles.label}>관계</Text>
          <View style={styles.relationButtonsContainer}>
            {RELATION_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.relationButton,
                  relation === option.value && styles.relationButtonActive,
                ]}
                onPress={() => setRelationState(option.value)}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.relationButtonText,
                    relation === option.value && styles.relationButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 연락처 입력 */}
        <View style={styles.formSection}>
          <Text style={styles.label}>연락처</Text>
          <TextInput
            style={styles.input}
            placeholder="010-1234-5678"
            placeholderTextColor={colors.light.label.disabled}
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumberState(text);
              if (error) setError('');
            }}
            editable={!isLoading}
            keyboardType="phone-pad"
            maxLength={20}
          />
          <Text style={styles.hint}>
            가족 그룹 초대 시 필요한 정보입니다.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            (!phoneNumber.trim() || isLoading) && styles.nextButtonDisabled,
            pressed && styles.nextButtonPressed,
          ]}
          onPress={handleNext}
          disabled={!phoneNumber.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.light.background.normal} />
          ) : (
            <Text style={styles.nextButtonText}>다음</Text>
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
    marginBottom: 32,
    letterSpacing: -0.32,
    lineHeight: 21,
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
  relationSection: {
    marginBottom: 32,
  },
  relationButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relationButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.line.neutral,
    backgroundColor: colors.light.fill.normal,
    alignItems: 'center',
  },
  relationButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  relationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.label.normal,
    letterSpacing: -0.32,
  },
  relationButtonTextActive: {
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
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.light.fill.neutral,
  },
  nextButtonPressed: {
    opacity: 0.8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.background.normal,
    letterSpacing: -0.36,
  },
});
