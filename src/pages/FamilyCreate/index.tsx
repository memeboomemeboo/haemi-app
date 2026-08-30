import { useState } from 'react';
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

const C = {
  primary: '#fd6941', text: '#3c3e3f', alternative: '#5a5c5d', assistive: '#76787a',
  line: '#e8e8e9', field: '#f7f7f7', button: '#dddedf', soft: '#fed7cd', white: '#ffffff',
};

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
            <Arrow size={22} color={C.text} style={styles.backArrow} />
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
              <TextInput style={styles.input} placeholder="이름" placeholderTextColor="#c1c2c3" value={familyName} onChangeText={setFamilyName} maxLength={30} editable={!familyId} />
            </Field>
            <Field label="초대코드">
              <View style={styles.codeRow}>
                <Pressable accessibilityRole="button" accessibilityLabel="초대 코드 복사" style={styles.codeBox} onPress={copyCode}>
                  <Text style={styles.code}>{inviteCode}</Text>
                  <MaterialIcons name="content-copy" size={19} color="#c1c2c3" />
                </Pressable>
                <Pressable style={styles.codeButton} onPress={generateCode} disabled={isCreating || Boolean(familyId)}>
                  {isCreating && !familyId ? <ActivityIndicator size="small" color={C.alternative} /> : <Text style={styles.codeButtonText}>{familyId ? '생성 완료' : '코드 생성'}</Text>}
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
            {isCreating ? <ActivityIndicator color={C.white} /> : <Text style={styles.createText}>가족 생성</Text>}
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
  return <View style={[styles.memberCard, filled && styles.memberCardFilled]}><Profile size={30} color="#ff8062" /><View><Text style={styles.memberName}>{name}</Text><Text style={styles.memberMeta}>{meta}</Text></View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white }, safeArea: { flex: 1 },
  header: { height: 61, paddingHorizontal: 27, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backArrow: { transform: [{ scaleX: -1 }] }, title: { fontSize: 24, lineHeight: 31, fontWeight: '700', letterSpacing: -0.48, color: C.text },
  content: { width: 330, alignSelf: 'center', paddingTop: 6, paddingBottom: 18 },
  intro: { gap: 8 }, introTitle: { fontSize: 20, lineHeight: 26, fontWeight: '600', letterSpacing: -0.4, color: C.text },
  caption: { fontSize: 12, lineHeight: 16, letterSpacing: -0.24, color: C.assistive }, form: { marginTop: 38, gap: 22 },
  field: { gap: 6 }, label: { marginLeft: 8, fontSize: 14, lineHeight: 19, fontWeight: '500', letterSpacing: -0.28, color: C.assistive },
  input: { height: 45, borderRadius: 10, backgroundColor: C.field, paddingHorizontal: 15, fontSize: 14, color: C.text },
  codeRow: { flexDirection: 'row', gap: 6 }, codeBox: { flex: 1, height: 45, borderRadius: 10, backgroundColor: C.field, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  code: { fontSize: 14, lineHeight: 18, fontWeight: '600', letterSpacing: -0.28, color: C.alternative },
  codeButton: { width: 101, height: 45, borderRadius: 10, backgroundColor: C.button, alignItems: 'center', justifyContent: 'center' }, codeButtonText: { fontSize: 16, fontWeight: '500', color: C.alternative },
  familyListSection: { gap: 9 }, listHeader: { minHeight: 25, marginHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, badges: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  badge: { minHeight: 23, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 3, backgroundColor: C.soft, fontSize: 12, lineHeight: 16, fontWeight: '500', color: C.primary, overflow: 'hidden' },
  memberList: { gap: 7 }, memberCard: { height: 54, borderRadius: 15, borderWidth: 1.5, borderColor: '#f5f5f5', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 11 }, memberCardFilled: { backgroundColor: C.field, borderColor: C.field },
  memberName: { fontSize: 15, lineHeight: 19, fontWeight: '600', color: C.text }, memberMeta: { fontSize: 11, lineHeight: 14, fontWeight: '500', color: C.alternative },
  addButton: { height: 38, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: C.primary, alignItems: 'center', justifyContent: 'center', marginTop: 3 }, addText: { fontSize: 14, fontWeight: '600', color: C.primary },
  createFooter: { paddingHorizontal: 36, paddingTop: 10, paddingBottom: 12, backgroundColor: C.white },
  createButton: { width: '100%', height: 48, borderRadius: 10, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }, createText: { fontSize: 20, lineHeight: 26, fontWeight: '600', color: C.field }, pressed: { opacity: 0.78 },
});
