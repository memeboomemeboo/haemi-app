import { useState } from 'react';
import { colors, spacing, typography } from '@/shared/constants';
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authService, myPageService } from '@/shared/api';
import { Arrow, BottomNavigation } from '@/shared/ui';

type Gender = 'MALE' | 'FEMALE';

export default function ElderRegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<Gender>('FEMALE');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [checkingId, setCheckingId] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState(false);
  const [registering, setRegistering] = useState(false);

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) setPhoneNumber(digits);
    else if (digits.length <= 7) setPhoneNumber(`${digits.slice(0, 3)}-${digits.slice(3)}`);
    else setPhoneNumber(`${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`);
  };

  const handleBirthDateChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 4) setBirthDate(digits);
    else if (digits.length <= 6) setBirthDate(`${digits.slice(0, 4)}-${digits.slice(4)}`);
    else setBirthDate(`${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`);
  };

  const handleLoginIdChange = (value: string) => {
    setLoginId(value.replace(/[^a-zA-Z0-9._-]/g, ''));
    setIsIdAvailable(false);
  };

  const handleCheckId = async () => {
    if (!loginId.trim()) {
      Alert.alert('아이디 확인', '아이디를 입력해주세요.');
      return;
    }
    setCheckingId(true);
    try {
      const result = await authService.checkLoginIdAvailability(loginId.trim());
      setIsIdAvailable(result.available);
      Alert.alert('아이디 확인', result.available ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.');
    } catch {
      Alert.alert('확인 실패', '아이디 중복 확인을 다시 시도해주세요.');
    } finally {
      setCheckingId(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || phoneNumber.replace(/\D/g, '').length !== 11 || loginId.trim().length < 4 || !/^\d{6}$/.test(password)) {
      Alert.alert('입력 확인', '모든 정보를 올바르게 입력해주세요.');
      return;
    }
    if (!isIdAvailable) {
      Alert.alert('입력 확인', '아이디 중복 확인이 필요합니다.');
      return;
    }
    setRegistering(true);
    try {
      const family = await myPageService.getFamily();
      if (!family) {
        Alert.alert('가족 생성 필요', '어르신을 등록하려면 먼저 가족을 생성해주세요.');
        return;
      }
      await myPageService.registerElder({
        familyId: family.familyId,
        name: name.trim(),
        phone: phoneNumber.replace(/\D/g, ''),
        gender,
        loginId: loginId.trim(),
        pin: password,
      });
      Alert.alert('등록 완료', '어르신 계정이 생성되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('등록 실패', error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Pressable accessibilityRole="button" accessibilityLabel="뒤로 가기" hitSlop={10} onPress={() => router.back()}>
              <Arrow size={22} color={colors.light.label.neutral} style={styles.backArrow} />
            </Pressable>
            <Text style={styles.title}>어르신 등록</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>
              <Field label="어르신 성함">
                <TextInput style={styles.input} placeholder="어르신 성함" placeholderTextColor={colors.light.line.normal} value={name} onChangeText={setName} />
              </Field>
              <Field label="생년월일">
                <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.light.line.normal} value={birthDate} onChangeText={handleBirthDateChange} keyboardType="number-pad" maxLength={10} />
              </Field>
              <Field label="전화번호">
                <TextInput style={styles.input} placeholder="전화번호" placeholderTextColor={colors.light.line.normal} value={phoneNumber} onChangeText={handlePhoneChange} keyboardType="phone-pad" />
              </Field>
              <Field label="성별" gap={10}>
                <View style={styles.genderRow}>
                  <GenderButton label="남" active={gender === 'MALE'} onPress={() => setGender('MALE')} />
                  <GenderButton label="여" active={gender === 'FEMALE'} onPress={() => setGender('FEMALE')} />
                </View>
              </Field>
              <Field label="아이디">
                <View style={styles.idRow}>
                  <TextInput style={[styles.input, styles.idInput]} placeholder="아이디" placeholderTextColor={colors.light.line.normal} value={loginId} onChangeText={handleLoginIdChange} autoCapitalize="none" />
                  <Pressable style={styles.checkButton} onPress={handleCheckId} disabled={checkingId}>
                    <Text style={styles.checkButtonText}>{checkingId ? '확인 중' : '중복 확인'}</Text>
                  </Pressable>
                </View>
              </Field>
              <Field label="비밀번호">
                <TextInput style={styles.input} placeholder="숫자 6자리" placeholderTextColor={colors.light.line.normal} value={password} onChangeText={(value) => setPassword(value.replace(/\D/g, '').slice(0, 6))} secureTextEntry keyboardType="number-pad" />
              </Field>
            </View>

            <View style={styles.submitArea}>
              <Text style={styles.notice}>※이 계정은 어르신 권한으로 생성됩니다.</Text>
              <Pressable style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]} onPress={handleRegister} disabled={registering}>
                {registering ? <ActivityIndicator color={colors.light.background.normal} /> : <Text style={styles.submitText}>어르신 등록</Text>}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <BottomNavigation activeTab="Setting" />
    </View>
  );
}

function Field({ label, gap = 6, children }: { label: string; gap?: number; children: React.ReactNode }) {
  return <View style={[styles.field, { gap }]}><Text style={styles.label}>{label}</Text>{children}</View>;
}

function GenderButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.genderButton, active && styles.genderButtonActive]} onPress={onPress}>
      <Text style={[styles.genderText, active && styles.genderTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background.normal },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  header: { height: 61, paddingHorizontal: 27, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backArrow: { transform: [{ scaleX: -1 }] },
  title: { fontSize: typography.title.title2.bold.fontSize, lineHeight: 31, fontWeight: typography.title.title2.bold.fontWeight, letterSpacing: -0.48, color: colors.light.label.neutral },
  content: { flexGrow: 1, width: 330, alignSelf: 'center', paddingTop: 50, paddingBottom: 47, justifyContent: 'space-between' },
  form: { gap: 20 },
  field: { width: '100%' },
  label: { marginLeft: 8, fontSize: typography.label.medium.fontSize, lineHeight: 19, fontWeight: typography.body.medium.fontWeight, letterSpacing: -0.28, color: colors.light.label.assistive },
  input: { width: '100%', height: 45, borderRadius: 10, backgroundColor: colors.light.background.neutral, paddingHorizontal: 15, paddingVertical: 0, fontSize: typography.label.medium.fontSize, lineHeight: 18, color: colors.light.label.neutral, letterSpacing: -0.28 },
  genderRow: { height: 27, flexDirection: 'row', gap: 8 },
  genderButton: { width: 70, height: 27, borderRadius: 14, borderWidth: 1, borderColor: colors.light.label.disabled, alignItems: 'center', justifyContent: 'center' },
  genderButtonActive: { borderColor: colors.primary },
  genderText: { fontSize: typography.body.medium.fontSize, lineHeight: 21, fontWeight: typography.body.regular.fontWeight, letterSpacing: -0.32, color: colors.light.line.neutral },
  genderTextActive: { color: colors.primary, fontWeight: typography.body.medium.fontWeight },
  idRow: { flexDirection: 'row', gap: 6 },
  idInput: { flex: 1 },
  checkButton: { width: 101, height: 45, borderRadius: 10, backgroundColor: colors.light.fill.alternative, alignItems: 'center', justifyContent: 'center' },
  checkButtonText: { fontSize: typography.body.medium.fontSize, lineHeight: 21, fontWeight: typography.body.medium.fontWeight, letterSpacing: -0.32, color: colors.light.label.alternative },
  submitArea: { alignItems: 'center', gap: spacing.sm, marginTop: 87 },
  notice: { fontSize: typography.caption.regular.fontSize, lineHeight: 16, fontWeight: typography.body.regular.fontWeight, letterSpacing: -0.24, color: colors.light.label.assistive },
  submitButton: { width: 327, height: 48, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  submitText: { fontSize: typography.headline.headline1.semibold.fontSize, lineHeight: 26, fontWeight: typography.body.semibold.fontWeight, letterSpacing: -0.4, color: colors.light.background.neutral },
  pressed: { opacity: 0.78 },
});
