import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Arrow, BottomNavigation, Profile, Trash } from '@/shared/ui';
import { authService } from '@/shared/api/auth';
import { useUserContext } from '@/shared/context/UserContext';

const ORANGE = '#fd6941';
const ORANGE_SOFT = '#fed7cd';
const TEXT = '#3c3e3f';
const TEXT_ASSISTIVE = '#76787a';
const LINE_NORMAL = '#c1c2c3';
const FILL = '#f7f7f7';

type EditModal = 'id' | 'age' | 'password' | 'family' | null;

type FamilyMember = {
  id: string;
  name: string;
  relation: string;
};

export default function MemberEditScreen() {
  const router = useRouter();
  const { group } = useUserContext();
  const [activeModal, setActiveModal] = useState<EditModal>(null);
  const [name, setName] = useState('');
  const [familyCount, setFamilyCount] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const initializedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setIsLoading(true);
        const response = await authService.getMe();
        if (response.success && response.data) {
          setName(response.data.name || '');
        }
      } catch (error) {
        Alert.alert('정보 로드 실패', '사용자 정보를 불러오지 못했어요.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  // 그룹 정보로부터 가족 수 설정 (최초 1회만)
  useEffect(() => {
    if (initializedRef.current) return;
    if (group?.members) {
      initializedRef.current = true;
      setFamilyMembers(
        group.members.map((member) => ({
          id: member.memberId,
          name: member.relation,
          relation: member.relation,
        }))
      );
      setFamilyCount(`${group.members.length}명`);
    }
  }, [group]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('이름을 입력해주세요');
      return;
    }

    try {
      setIsSaving(true);
      await authService.updateProfile({
        name: name.trim(),
      });
      Alert.alert('저장 완료', '정보가 수정되었습니다.');
      router.back();
    } catch (error) {
      Alert.alert('저장 실패', '정보 수정에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="뒤로 가기"
              hitSlop={8}
              onPress={() => router.back()}
            >
              <Arrow color={TEXT} size={22} style={styles.backArrow} />
            </Pressable>
            <Text style={styles.title}>회원 정보 수정</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="연령 수정"
            style={({ pressed }) => [styles.profileBlock, pressed && styles.pressed]}
            onPress={() => setActiveModal('age')}
          >
            <View style={styles.profileAvatarLarge}>
              <Profile color="#ff7f60" size={87} />
            </View>
            <Text style={styles.profileName}>{name || '이름'}</Text>
          </Pressable>

          <View style={styles.infoSection}>
            <View style={styles.divider} />
            <View style={styles.infoContent}>
              <View style={styles.infoTop}>
                <Text style={styles.infoTitle}>기본 정보</Text>
                <View style={styles.rowList}>
                  <InfoRow
                    label="이름"
                    value={name}
                    onChangeText={setName}
                    onIconPress={() => setActiveModal('id')}
                  />
                  <InfoRow
                    label="가족"
                    value={familyCount}
                    onChangeText={setFamilyCount}
                    onIconPress={() => setActiveModal('family')}
                  />
                  <InfoRow
                    label="비밀번호"
                    value="••••••••"
                    onChangeText={() => {}}
                    onIconPress={() => setActiveModal('password')}
                    secureTextEntry={false}
                    editable={false}
                  />
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && !isSaving && styles.pressed,
                  isSaving && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={FILL} />
                ) : (
                  <Text style={styles.saveButtonText}>저장</Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNavigation activeTab="Report" />

      <IdEditModal visible={activeModal === 'id'} onClose={() => setActiveModal(null)} />
      <AgeEditModal visible={activeModal === 'age'} onClose={() => setActiveModal(null)} />
      <PasswordEditModal visible={activeModal === 'password'} onClose={() => setActiveModal(null)} />
      <FamilyEditModal
        visible={activeModal === 'family'}
        members={familyMembers}
        onClose={() => setActiveModal(null)}
      />
    </View>
  );
}

function InfoRow({
  label,
  value,
  onChangeText,
  onIconPress,
  secureTextEntry,
  editable,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onIconPress: () => void;
  secureTextEntry?: boolean;
  editable?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          editable={editable}
          style={styles.infoInput}
          cursorColor={ORANGE}
          selectionColor={ORANGE_SOFT}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} 상세 수정`}
          hitSlop={8}
          style={({ pressed }) => [styles.infoIconButton, pressed && styles.pressed]}
          onPress={onIconPress}
        >
          <Arrow color={TEXT} size={18} />
        </Pressable>
      </View>
    </View>
  );
}

function IdEditModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <FormModal visible={visible} height={199} width={270} onClose={onClose}>
      <View style={styles.formFields}>
        <ModalField label="새 이름" placeholder="새 이름" />
        <ModalField label="비밀번호" placeholder="비밀번호" secureTextEntry />
      </View>
      <ModalActions onCancel={onClose} onSave={onClose} />
    </FormModal>
  );
}

function AgeEditModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <FormModal visible={visible} height={199} width={270} onClose={onClose}>
      <View style={styles.formFields}>
        <ModalField label="연령" placeholder="연령" keyboardType="number-pad" />
        <ModalField label="비밀번호" placeholder="비밀번호" secureTextEntry />
      </View>
      <ModalActions onCancel={onClose} onSave={onClose} />
    </FormModal>
  );
}

function PasswordEditModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <FormModal visible={visible} height={276} width={270} onClose={onClose}>
      <View style={styles.formFields}>
        <ModalField label="아이디" placeholder="아이디" />
        <ModalField label="기존 비밀번호" placeholder="기존 비밀번호" secureTextEntry />
        <ModalField label="새 비밀번호" placeholder="새 비밀번호" secureTextEntry />
      </View>
      <ModalActions onCancel={onClose} onSave={onClose} />
    </FormModal>
  );
}

function FamilyEditModal({
  visible,
  members,
  onClose,
}: {
  visible: boolean;
  members: FamilyMember[];
  onClose: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalScrim}>
        <View style={styles.familyDialog}>
          <View style={styles.familyHeader}>
            <View style={styles.familyTitleRow}>
              <Text style={styles.familyTitle}>우리가족</Text>
              <Text style={styles.familyCount}>·</Text>
              <Text style={styles.familyCount}>{members.length}명</Text>
            </View>
          </View>
          <View style={styles.familyDivider} />

          <View style={styles.familyList}>
            {members.map((member) => (
              <View key={member.id} style={styles.familyRow}>
                <View style={styles.familyProfileGroup}>
                  <View style={styles.profileAvatarSmall}>
                    <Profile color="#ff7f60" size={42} />
                  </View>
                  <View style={styles.familyNameRow}>
                    <Text style={styles.familyName}>{member.name}</Text>
                    <Text style={styles.familyRelation}>{member.relation}</Text>
                  </View>
                </View>
                <Trash color={LINE_NORMAL} size={24} />
              </View>
            ))}
          </View>

          <View style={styles.familyActions}>
            <ModalActions onCancel={onClose} onSave={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FormModal({
  visible,
  height,
  width,
  children,
  onClose,
}: {
  visible: boolean;
  height: number;
  width: number;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalScrim}>
        <View style={[styles.formDialog, { height, width }]}>
          <View style={styles.formInner}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

function ModalField({
  label,
  placeholder,
  secureTextEntry,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <View style={styles.modalField}>
      <Text style={styles.modalFieldLabel}>{label}</Text>
      <TextInput
        style={styles.modalInput}
        placeholder={placeholder}
        placeholderTextColor={LINE_NORMAL}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function ModalActions({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  return (
    <View style={styles.modalActions}>
      <Pressable style={({ pressed }) => [styles.modalCancelButton, pressed && styles.pressed]} onPress={onCancel}>
        <Text style={styles.modalCancelText}>취소</Text>
      </Pressable>
      <Pressable style={({ pressed }) => [styles.modalSaveButton, pressed && styles.pressed]} onPress={onSave}>
        <Text style={styles.modalSaveText}>저장</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 402,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 7,
    paddingBottom: 24,
  },
  header: {
    width: 348,
    height: 31,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backArrow: {
    transform: [{ scaleX: -1 }],
  },
  title: {
    color: TEXT,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.48,
  },
  profileBlock: {
    marginTop: 38,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 25,
  },
  profileAvatarLarge: {
    width: 87,
    height: 87,
    borderRadius: 44,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE_SOFT,
  },
  profileAvatarSmall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE_SOFT,
  },
  profileName: {
    color: TEXT,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.48,
    textAlign: 'center',
  },
  infoSection: {
    marginTop: 44,
    height: 463,
    backgroundColor: '#ffffff',
  },
  divider: {
    height: 4,
    backgroundColor: FILL,
  },
  infoContent: {
    width: 353,
    height: 392,
    marginTop: 41,
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  infoTop: {
    gap: 39,
  },
  infoTitle: {
    color: TEXT,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  rowList: {
    gap: 40,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    width: 108,
    color: TEXT_ASSISTIVE,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    letterSpacing: -0.36,
  },
  infoValueWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoInput: {
    flex: 1,
    height: 31,
    padding: 0,
    color: TEXT,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    letterSpacing: -0.36,
  },
  infoIconButton: {
    width: 28,
    height: 31,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  saveButton: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
  },
  saveButtonText: {
    color: FILL,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '600',
    letterSpacing: -0.36,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  modalScrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  formDialog: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  formInner: {
    flex: 1,
    width: 237,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 22,
  },
  formFields: {
    width: '100%',
    gap: 16,
  },
  modalField: {
    gap: 4,
  },
  modalFieldLabel: {
    color: TEXT_ASSISTIVE,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
    letterSpacing: -0.32,
  },
  modalInput: {
    height: 30,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 0,
    color: TEXT,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
    letterSpacing: -0.28,
    backgroundColor: FILL,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  modalCancelButton: {
    minHeight: 26,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FILL,
  },
  modalSaveButton: {
    minHeight: 26,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
  },
  modalCancelText: {
    color: LINE_NORMAL,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.28,
  },
  modalSaveText: {
    color: FILL,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.28,
  },
  familyDialog: {
    width: 305,
    height: 539,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  familyHeader: {
    height: 66,
    justifyContent: 'center',
  },
  familyTitleRow: {
    width: 263,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  familyTitle: {
    color: TEXT,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  familyCount: {
    color: TEXT_ASSISTIVE,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
    letterSpacing: -0.32,
  },
  familyDivider: {
    height: 4,
    backgroundColor: FILL,
  },
  familyList: {
    width: 247,
    alignSelf: 'center',
    marginTop: 40,
    gap: 24,
  },
  familyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  familyProfileGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  familyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  familyName: {
    color: TEXT,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    letterSpacing: -0.36,
  },
  familyRelation: {
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  familyActions: {
    position: 'absolute',
    right: 14,
    bottom: 15,
  },
  pressed: {
    opacity: 0.72,
  },
});
