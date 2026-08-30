import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, type ReactNode } from 'react';
import { colors } from '@/shared/constants';
import { authService, getErrorMessage } from '@/shared/api';
import type { GuardianRegisterRequest } from '@/shared/types';

export type GuardianSignupDraft = Omit<GuardianRegisterRequest, 'pin'>;

interface SignupScreenProps { onContinue: (draft: GuardianSignupDraft) => void; onLoginPress: () => void; }

export default function SignupScreen({ onContinue, onLoginPress }: SignupScreenProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState('');
  const [isUserIdAvailable, setUserIdAvailable] = useState(false);
  const [isCheckingUserId, setCheckingUserId] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const phoneDigits = phone.replace(/\D/g, '');
  const canSubmit = Boolean(name.trim() && birthDate.trim() && phoneDigits.length === 11 && userId.trim() && isUserIdAvailable && password && passwordConfirm);

  const normalizedBirthDate = birthDate.replace(/\D/g, '').replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');

  const handleBirthDateChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 6
      ? `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
      : digits.length > 4
        ? `${digits.slice(0, 4)}-${digits.slice(4)}`
        : digits;
    setBirthDate(formatted);
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    const formatted = digits.length > 7
      ? `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
      : digits.length > 3
        ? `${digits.slice(0, 3)}-${digits.slice(3)}`
        : digits;
    setPhone(formatted);
  };

  const checkUserIdAvailability = async () => {
    const trimmedUserId = userId.trim();
    if (trimmedUserId.length < 4) return setError('아이디는 4자 이상 입력해주세요.');
    setCheckingUserId(true);
    setError('');
    try {
      const result = await authService.checkLoginIdAvailability(trimmedUserId);
      setUserIdAvailable(result.available);
      setError(result.available ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.');
    } catch (caught) {
      setUserIdAvailable(false);
      setError(getErrorMessage(caught));
    } finally {
      setCheckingUserId(false);
    }
  };

  const handleSignup = async () => {
    if (!canSubmit) return setError('모든 정보를 입력해주세요.');
    if (userId.trim().length < 4) return setError('아이디는 4자 이상 입력해주세요.');
    if (password.length < 8) return setError('비밀번호는 8자 이상 입력해주세요.');
    if (password !== passwordConfirm) return setError('비밀번호가 일치하지 않습니다.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedBirthDate)) return setError('생년월일 8자리를 입력해주세요.');
    if (!/^01\d{8,9}$/.test(phoneDigits)) return setError('올바른 전화번호를 입력해주세요.');
    onContinue({ name: name.trim(), loginId: userId.trim(), password, birthDate: normalizedBirthDate, phone: phoneDigits });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { marginTop: insets.top + 12 }]}>
        <Pressable onPress={onLoginPress} hitSlop={12} accessibilityRole="button" accessibilityLabel="뒤로 가기">
          <Ionicons name="chevron-back" size={22} color={colors.light.label.neutral} />
        </Pressable>
        <Text style={styles.headerTitle}>회원 가입</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.steps}><View style={styles.step}><Text style={styles.stepNumber}>1</Text><Text style={styles.stepLabel}>정보입력</Text></View><View style={styles.stepLine} /><View style={styles.step}><Text style={styles.stepNumber}>2</Text><Text style={styles.stepLabel}>PIN설정</Text></View></View>
        <Text style={styles.title}>기본 정보를 입력해주세요</Text>
        <View style={styles.form}>
          <Field label="이름"><TextInput style={styles.input} placeholder="이름" value={name} onChangeText={setName} placeholderTextColor={colors.light.line.normal} /></Field>
          <Field label="생년월일"><View style={styles.iconInput}><TextInput style={styles.flexInput} placeholder="YYYY-MM-DD (예: 1950-01-01)" value={birthDate} onChangeText={handleBirthDateChange} keyboardType="number-pad" maxLength={10} placeholderTextColor={colors.light.line.normal} /><Ionicons name="calendar-outline" size={17} color={colors.light.label.assistive} /></View></Field>
          <Field label="전화번호"><TextInput style={styles.input} placeholder="010-1234-5678" value={phone} onChangeText={handlePhoneChange} keyboardType="phone-pad" maxLength={13} placeholderTextColor={colors.light.line.normal} /></Field>
          <Field label="아이디"><View style={styles.idRow}><TextInput style={[styles.input, styles.idInput]} placeholder="아이디" value={userId} onChangeText={(value) => { setUserId(value); setUserIdAvailable(false); setError(''); }} autoCapitalize="none" placeholderTextColor={colors.light.line.normal} /><Pressable style={[styles.checkButton, isUserIdAvailable && styles.availableButton]} onPress={checkUserIdAvailability} disabled={isCheckingUserId}><Text style={[styles.checkText, isUserIdAvailable && styles.availableText]}>{isCheckingUserId ? '확인 중' : isUserIdAvailable ? '사용 가능' : '중복 확인'}</Text></Pressable></View></Field>
          <Field label="비밀번호"><View style={styles.passwordGroup}><View style={styles.iconInput}><TextInput style={styles.flexInput} placeholder="비밀번호" value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} placeholderTextColor={colors.light.line.normal} /><Pressable onPress={() => setPasswordVisible((value) => !value)} hitSlop={10} accessibilityRole="button" accessibilityLabel={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}><Ionicons name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'} size={17} color={colors.light.label.assistive} /></Pressable></View><TextInput style={styles.input} placeholder="비밀번호 확인" value={passwordConfirm} onChangeText={setPasswordConfirm} secureTextEntry placeholderTextColor={colors.light.line.normal} /></View></Field>
        </View>
        {error ? <Text style={[styles.error, isUserIdAvailable && styles.success]}>{error}</Text> : null}
        <Pressable style={({ pressed }) => [styles.nextButton, !canSubmit && styles.nextButtonDisabled, pressed && styles.pressed]} onPress={handleSignup}><Text style={styles.nextText}>다음으로</Text></Pressable>
        <View style={styles.loginRow}><Text style={styles.loginGuide}>이미 계정이 있으신가요?</Text><Pressable onPress={onLoginPress}><Text style={styles.loginLink}>로그인</Text></Pressable></View>
      </ScrollView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text>{children}</View>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background.normal }, header: { height: 42, paddingHorizontal: 27, flexDirection: 'row', alignItems: 'center', gap: 12 }, headerTitle: { fontSize: 24, lineHeight: 31, fontWeight: '700', color: colors.light.label.neutral, letterSpacing: -0.48 },
  content: { flexGrow: 1, width: 330, alignSelf: 'center', paddingTop: 30, paddingBottom: 34 }, steps: { flexDirection: 'row', alignItems: 'center', gap: 8 }, step: { flexDirection: 'row', alignItems: 'center', gap: 8 }, stepNumber: { width: 24, height: 24, borderRadius: 12, textAlign: 'center', lineHeight: 24, backgroundColor: '#fed7cd', color: colors.primary, fontSize: 16, fontWeight: '600' }, stepLabel: { color: colors.light.label.assistive, fontSize: 16, fontWeight: '500', letterSpacing: -0.32 }, stepLine: { width: 10, height: 1, backgroundColor: colors.light.line.normal },
  title: { marginTop: 32, fontSize: 24, lineHeight: 31, fontWeight: '700', color: colors.light.label.neutral, letterSpacing: -0.48 }, form: { gap: 20, marginTop: 32 }, field: { gap: 6 }, label: { marginLeft: 8, color: colors.light.label.assistive, fontSize: 14, fontWeight: '500' }, input: { height: 45, borderRadius: 10, backgroundColor: colors.light.background.neutral, paddingHorizontal: 15, color: colors.light.label.neutral, fontSize: 14 },
  iconInput: { height: 45, borderRadius: 10, backgroundColor: colors.light.background.neutral, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' }, flexInput: { flex: 1, height: 45, color: colors.light.label.neutral, fontSize: 14 }, idRow: { flexDirection: 'row', gap: 6 }, idInput: { flex: 1 }, checkButton: { width: 101, height: 45, borderRadius: 10, backgroundColor: colors.light.fill.alternative, alignItems: 'center', justifyContent: 'center' }, checkText: { color: colors.light.label.alternative, fontSize: 16, fontWeight: '500' }, passwordGroup: { gap: 6 },
  availableButton: { backgroundColor: '#e8f7ee' }, availableText: { color: '#218a52' }, success: { color: '#218a52' },
  error: { color: colors.status.error, fontSize: 13, marginTop: 12, textAlign: 'center' }, nextButton: { height: 48, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 72 }, nextButtonDisabled: { backgroundColor: colors.light.fill.alternative }, pressed: { opacity: 0.8 }, nextText: { color: colors.light.fill.normal, fontSize: 20, fontWeight: '600' }, loginRow: { marginTop: 24, flexDirection: 'row', justifyContent: 'center', gap: 24 }, loginGuide: { color: colors.light.label.assistive, fontSize: 16, fontWeight: '500' }, loginLink: { color: colors.primary, fontSize: 16, fontWeight: '500', textDecorationLine: 'underline' },
});
