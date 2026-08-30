import { useState } from 'react';
import { colors, spacing, typography } from '@/shared/constants';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';

import { myPageService } from '@/shared/api';
import { Arrow, BottomNavigation, Profile } from '@/shared/ui';

export default function FamilyCreateScreen() {
  const router = useRouter();
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('생성 전');
  const [isCreating, setIsCreating] = useState(false);
  const [familyId, setFamilyId] = useState<string>();
  const guardianCount = 1;
  const elderCount = 0;

  const generateCode = async () => {
    if (!familyName.trim()) {
      Alert.alert('가족 이름', '가족 이름을 입력해주세요.');
      return;
    }
    if (familyId) return;

    setIsCreating(true);
    try {
      const response = await myPageService.createFamily({ name: familyName.trim() });
      setFamilyId(response.familyId);
      setInviteCode(response.inviteCode);
    } catch (error) {
      Alert.alert('코드 생성 실패', error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.');
    } finally {
      setIsCreating(false);
    }
  };

  const copyCode = async () => {
    if (!familyId || inviteCode === '생성 전') {
      Alert.alert('초대코드', '먼저 초대 코드를 생성해주세요.');
      return;
    }
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert('복사 완료', '초대 코드가 클립보드에 복사됐어요.');
  };

  const createFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('가족 이름', '가족 이름을 입력해주세요.');
      return;
    }
    if (familyId) {
      router.replace('/my-page' as Href);
      return;
    }
    setIsCreating(true);
    try {
      const response = await myPageService.createFamily({ name: familyName.trim() });
      setFamilyId(response.familyId);
      setInviteCode(response.inviteCode);
      Alert.alert('가족 생성 완료', `초대코드: ${response.inviteCode}`, [
        { text: '확인', onPress: () => router.replace('/my-page' as Href) },
      ]);
    } catch (error) {
      Alert.alert('생성 실패', error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.');
    } finally {
      setIsCreating(false);
    }
  };

  const displayMembers = [{ id: 'me', name: '나', meta: '보호자', filled: true }];

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="뒤로 가기" hitSlop={10} onPress={() => router.back()}>
            <Arrow size={22} color={colors.light.label.neutral} style={styles.backArrow} />
          </Pressable>
          <Text style={styles.title}>가족 생성</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.intro}>
            <Text style={styles.introTitle}>가족을 만들고{`\n`}다른 보호자들을 초대하세요</Text>
            <Text style={styles.caption}>※ 한 가족에는 최대 4명까지 함께하실 수 있어요</Text>
          </View>

          <View style={styles.form}>
            <Field label="가족 이름">
              <TextInput style={styles.input} placeholder="이름" placeholderTextColor={colors.light.line.normal} value={familyName} onChangeText={setFamilyName} maxLength={30} editable={!familyId} />
            </Field>
            <Field label="초대코드">
              <View style={styles.codeRow}>
                <Pressable accessibilityRole="button" accessibilityLabel="초대 코드 복사" style={styles.codeBox} onPress={copyCode}>
                  <Text style={styles.code}>{inviteCode}</Text>
                  <MaterialIcons name="content-copy" size={19} color={colors.light.line.normal} />
                </Pressable>
                <Pressable style={styles.codeButton} onPress={generateCode} disabled={isCreating || Boolean(familyId)}>
                  {isCreating && !familyId ? <ActivityIndicator size="small" color={colors.light.label.alternative} /> : <Text style={styles.codeButtonText}>{familyId ? '생성 완료' : '코드 생성'}</Text>}
                </Pressable>
              </View>
            </Field>

            <View style={styles.familyListSection}>
              <View style={styles.listHeader}>
                <Text style={styles.label}>가족 목록</Text>
                <View style={styles.badges}>
                  <Text style={styles.badge}>보호자 {guardianCount}</Text>
                  <Text style={styles.badge}>어르신 {elderCount}/4</Text>
                </View>
              </View>
              <View style={styles.memberList}>
                {displayMembers.map((member) => <MemberCard key={member.id} {...member} />)}
              </View>
              <Pressable style={styles.addButton} onPress={() => router.push('/elder-register' as Href)}>
                <Text style={styles.addText}>+ 구성원 추가</Text>
              </Pressable>
            </View>
          </View>

        </ScrollView>
        <View style={styles.createFooter}>
          <Pressable style={({ pressed }) => [styles.createButton, pressed && styles.pressed]} onPress={createFamily} disabled={isCreating}>
            {isCreating ? <ActivityIndicator color={colors.light.background.normal} /> : <Text style={styles.createText}>가족 생성</Text>}
          </Pressable>
        </View>
      </SafeAreaView>
      <BottomNavigation activeTab="Setting" />
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text>{children}</View>;
}

function MemberCard({ name, meta, filled }: { name: string; meta: string; filled: boolean }) {
  return <View style={[styles.memberCard, filled && styles.memberCardFilled]}><Profile size={30} color={colors.primary} /><View><Text style={styles.memberName}>{name}</Text><Text style={styles.memberMeta}>{meta}</Text></View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background.normal }, safeArea: { flex: 1 },
  header: { height: 61, paddingHorizontal: 27, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backArrow: { transform: [{ scaleX: -1 }] }, title: { fontSize: typography.title.title2.bold.fontSize, lineHeight: 31, fontWeight: typography.title.title2.bold.fontWeight, letterSpacing: -0.48, color: colors.light.label.neutral },
  content: { width: 330, alignSelf: 'center', paddingTop: 6, paddingBottom: 18 },
  intro: { gap: 8 }, introTitle: { fontSize: typography.headline.headline1.semibold.fontSize, lineHeight: 26, fontWeight: typography.body.semibold.fontWeight, letterSpacing: -0.4, color: colors.light.label.neutral },
  caption: { fontSize: typography.caption.regular.fontSize, lineHeight: 16, letterSpacing: -0.24, color: colors.light.label.assistive }, form: { marginTop: 38, gap: 22 },
  field: { gap: 6 }, label: { marginLeft: 8, fontSize: typography.label.medium.fontSize, lineHeight: 19, fontWeight: typography.body.medium.fontWeight, letterSpacing: -0.28, color: colors.light.label.assistive },
  input: { height: 45, borderRadius: 10, backgroundColor: colors.light.background.neutral, paddingHorizontal: 15, fontSize: typography.label.medium.fontSize, color: colors.light.label.neutral },
  codeRow: { flexDirection: 'row', gap: 6 }, codeBox: { flex: 1, height: 45, borderRadius: 10, backgroundColor: colors.light.background.neutral, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  code: { fontSize: typography.label.medium.fontSize, lineHeight: 18, fontWeight: typography.body.semibold.fontWeight, letterSpacing: -0.28, color: colors.light.label.alternative },
  codeButton: { width: 101, height: 45, borderRadius: 10, backgroundColor: colors.light.fill.alternative, alignItems: 'center', justifyContent: 'center' }, codeButtonText: { fontSize: typography.body.medium.fontSize, fontWeight: typography.body.medium.fontWeight, color: colors.light.label.alternative },
  familyListSection: { gap: 9 }, listHeader: { minHeight: 25, marginHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, badges: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  badge: { minHeight: 23, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 3, backgroundColor: colors.palette.red[90], fontSize: typography.caption.regular.fontSize, lineHeight: 16, fontWeight: typography.body.medium.fontWeight, color: colors.primary, overflow: 'hidden' },
  memberList: { gap: 7 }, memberCard: { height: 54, borderRadius: 15, borderWidth: 1.5, borderColor: colors.light.background.neutral, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 11 }, memberCardFilled: { backgroundColor: colors.light.background.neutral, borderColor: colors.light.background.neutral },
  memberName: { fontSize: 15, lineHeight: 19, fontWeight: typography.body.semibold.fontWeight, color: colors.light.label.neutral }, memberMeta: { fontSize: 11, lineHeight: 14, fontWeight: typography.body.medium.fontWeight, color: colors.light.label.alternative },
  addButton: { height: 38, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 3 }, addText: { fontSize: typography.label.medium.fontSize, fontWeight: typography.body.semibold.fontWeight, color: colors.primary },
  createFooter: { paddingHorizontal: 36, paddingTop: 10, paddingBottom: spacing.md, backgroundColor: colors.light.background.normal },
  createButton: { width: '100%', height: 48, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, createText: { fontSize: typography.headline.headline1.semibold.fontSize, lineHeight: 26, fontWeight: typography.body.semibold.fontWeight, color: colors.light.background.neutral }, pressed: { opacity: 0.78 },
});
