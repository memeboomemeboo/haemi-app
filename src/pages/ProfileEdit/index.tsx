import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors, spacing, typography } from '@/shared/constants';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  authService,
  myPageService,
  type ElderCardResponse,
  type GuardianRole,
} from '@/shared/api';
import { useAndroidBackHandler } from '@/shared/hooks';
import { Arrow, BottomNavigation, Calendar, Profile } from '@/shared/ui';

const ROLES: { value: GuardianRole; label: string }[] = [
  { value: 'GUARDIAN', label: '보호자' },
  { value: 'DAUGHTER', label: '딸' },
  { value: 'SON', label: '아들' },
  { value: 'GRANDDAUGHTER', label: '손녀' },
  { value: 'GRANDSON', label: '손자' },
  { value: 'OTHER', label: '기타' },
];

export default function ProfileEditScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [loginId, setLoginId] = useState('');
  const [originalLoginId, setOriginalLoginId] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string>();
  const [profileImageMediaRefId, setProfileImageMediaRefId] = useState<string>();
  const [elders, setElders] = useState<ElderCardResponse[]>([]);
  const [roles, setRoles] = useState<Record<string, GuardianRole>>({});
  const [loginIdChecked, setLoginIdChecked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    myPageService.getProfile()
      .then((profile) => {
        setName(profile.name);
        setBirthDate(profile.birthDate ?? '');
        setPhone(formatPhoneNumber(profile.phone ?? ''));
        setLoginId(profile.loginId);
        setOriginalLoginId(profile.loginId);
        setProfileImageUrl(profile.profileImageUrl);
        setElders(profile.elders ?? []);
        setRoles(Object.fromEntries((profile.elders ?? []).map((elder) => [elder.elderId, elder.role ?? 'OTHER'])));
      })
      .catch(() => Alert.alert('불러오기 실패', '프로필 정보를 불러오지 못했어요.'))
      .finally(() => setLoading(false));
  }, []);

  useAndroidBackHandler(
    useCallback(() => {
      router.replace('/my-page');
      return true;
    }, [router]),
  );

  const checkLoginId = async () => {
    const value = loginId.trim();
    if (value === originalLoginId) {
      setLoginIdChecked(true);
      Alert.alert('현재 사용 중인 아이디예요.');
      return;
    }
    if (value.length < 3) {
      Alert.alert('아이디는 3자 이상 입력해주세요.');
      return;
    }
    try {
      const result = await authService.checkLoginIdAvailability(value);
      setLoginIdChecked(result.available);
      Alert.alert(result.available ? '사용 가능한 아이디예요.' : '이미 사용 중인 아이디예요.');
    } catch {
      Alert.alert('확인 실패', '잠시 후 다시 시도해주세요.');
    }
  };

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '프로필 사진을 선택하려면 사진 접근 권한이 필요해요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const contentType = asset.mimeType ?? 'image/jpeg';
    const filename = asset.fileName ?? `profile-${Date.now()}.${contentType.split('/')[1] ?? 'jpg'}`;
    setUploading(true);
    try {
      const blob = await (await fetch(asset.uri)).blob();
      const upload = await myPageService.requestProfileImageUpload({
        originalFilename: filename,
        contentType,
        declaredSizeBytes: asset.fileSize ?? blob.size,
      });
      if (!upload.duplicate) {
        if (!upload.presignedUrl) throw new Error('Missing upload URL');
        const putResponse = await fetch(upload.presignedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': contentType },
          body: blob,
        });
        if (!putResponse.ok) throw new Error('Upload failed');
        setProfileImageUrl(await myPageService.confirmMediaUpload(upload.mediaRefId));
      } else if (upload.servingUrl) {
        setProfileImageUrl(upload.servingUrl);
      }
      setProfileImageMediaRefId(upload.mediaRefId);
    } catch {
      Alert.alert('사진 변경 실패', '사진을 업로드하지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const nextName = name.trim();
    const nextBirthDate = birthDate.trim();
    const nextPhone = phone.trim();
    const nextLoginId = loginId.trim();
    if (!nextName) {
      Alert.alert('이름을 입력해주세요.');
      return;
    }
    if (nextBirthDate && !/^\d{4}-\d{2}-\d{2}$/.test(nextBirthDate)) {
      Alert.alert('생년월일은 YYYY-MM-DD 형식으로 입력해주세요.');
      return;
    }
    if (nextPhone.replace(/\D/g, '').length !== 11) {
      Alert.alert('전화번호는 숫자 11자리로 입력해주세요.');
      return;
    }
    if (!nextLoginId || nextLoginId.length < 3) {
      Alert.alert('아이디는 3자 이상 입력해주세요.');
      return;
    }
    if (nextLoginId !== originalLoginId && !loginIdChecked) {
      Alert.alert('아이디 중복 확인을 해주세요.');
      return;
    }
    setSaving(true);
    try {
      await myPageService.updateProfile({
        name: nextName,
        birthDate: nextBirthDate,
        phone: nextPhone,
        loginId: nextLoginId,
        profileImageMediaRefId,
        elderRoles: roles,
      });
      Alert.alert('저장 완료', '프로필을 수정했어요.', [{ text: '확인', onPress: () => router.back() }]);
    } catch {
      Alert.alert('저장 실패', '잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Arrow size={22} color={colors.light.label.neutral} style={styles.backArrow} /></Pressable>
          <Text style={styles.title}>프로필 수정</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarWrap}>
            {profileImageUrl ? <Image source={{ uri: profileImageUrl }} style={styles.avatar} /> : <Profile size={87} color={colors.primary} />}
            <Pressable accessibilityRole="button" accessibilityLabel="프로필 이미지 편집" style={styles.camera} onPress={pickProfileImage} disabled={uploading}>
              {uploading ? <ActivityIndicator size="small" color={colors.primary} /> : <MaterialIcons name="photo-camera" size={17} color={colors.primary} />}
            </Pressable>
          </View>
          <Field label="이름">
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="이름을 입력해주세요" />
          </Field>
          <Field label="생년월일">
            <View style={styles.inputRow}>
              <TextInput style={styles.rowInput} value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />
              <Calendar size={16} color={colors.light.line.normal} />
            </View>
          </Field>
          <Field label="전화번호">
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={(value) => setPhone(formatPhoneNumber(value))}
              placeholder="010-0000-0000"
              keyboardType="number-pad"
              maxLength={13}
            />
          </Field>
          <Field label="아이디">
            <View style={styles.idRow}>
              <TextInput style={[styles.input, styles.idInput]} value={loginId} onChangeText={(value) => { setLoginId(value); setLoginIdChecked(value.trim() === originalLoginId); }} autoCapitalize="none" />
              <Pressable style={styles.checkButton} onPress={checkLoginId}><Text style={styles.checkText}>중복 확인</Text></Pressable>
            </View>
          </Field>
          {elders.length > 0 && <Field label="보호자 역할">{elders.map((elder) => <RoleCard key={elder.elderId} elder={elder} role={roles[elder.elderId] ?? 'OTHER'} onChange={(role) => setRoles((current) => ({ ...current, [elder.elderId]: role }))} />)}</Field>}
          <Pressable style={styles.save} onPress={save} disabled={saving || uploading}>{saving ? <ActivityIndicator color={colors.light.background.normal} /> : <Text style={styles.saveText}>저장</Text>}</Pressable>
        </ScrollView>
      </SafeAreaView>
      <BottomNavigation activeTab="Setting" />
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text>{children}</View>; }
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}
function RoleCard({ elder, role, onChange }: { elder: ElderCardResponse; role: GuardianRole; onChange: (role: GuardianRole) => void }) {
  return <View style={styles.roleCard}><View style={styles.roleTop}><Profile size={32} color={colors.primary} /><Text style={styles.roleName}>{elder.name}</Text></View><View style={styles.chips}>{ROLES.map((item) => <Pressable key={item.value} onPress={() => onChange(item.value)} style={[styles.chip, role === item.value && styles.chipActive]}><Text style={[styles.chipText, role === item.value && styles.chipTextActive]}>{item.label}</Text></Pressable>)}</View></View>;
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.light.background.normal},safe:{flex:1},center:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:colors.light.background.normal},header:{height:61,paddingHorizontal:27,flexDirection:'row',alignItems:'center',gap: spacing.md},backArrow:{transform:[{scaleX:-1}]},title:{fontSize: typography.title.title2.bold.fontSize,fontWeight: typography.title.title2.bold.fontWeight,color:colors.light.label.neutral},content:{paddingHorizontal:36,paddingBottom: spacing['3xl']},avatarWrap:{alignSelf:'center',marginTop: spacing.sm,marginBottom:31},avatar:{width:87,height:87,borderRadius:44},camera:{position:'absolute',right:-5,bottom:0,width:30,height:30,borderRadius:15,backgroundColor:colors.light.background.normal,alignItems:'center',justifyContent:'center'},field:{marginBottom:17},label:{fontSize: typography.label.medium.fontSize,color:colors.light.label.assistive,marginLeft:13,marginBottom:7},input:{height:45,borderRadius:11,backgroundColor:colors.light.background.neutral,paddingHorizontal:14,justifyContent:'center',fontSize: typography.label.medium.fontSize,color:colors.light.label.neutral},inputRow:{height:45,borderRadius:11,backgroundColor:colors.light.background.neutral,paddingHorizontal:14,flexDirection:'row',alignItems:'center'},rowInput:{flex:1,fontSize:typography.label.medium.fontSize,color:colors.light.label.neutral},idRow:{flexDirection:'row',gap:7},idInput:{flex:1},checkButton:{width:101,height:45,borderRadius:11,backgroundColor:colors.light.fill.alternative,alignItems:'center',justifyContent:'center'},checkText:{fontSize: typography.body.medium.fontSize,color:colors.light.label.neutral},roleCard:{backgroundColor:colors.light.background.neutral,borderRadius:11,padding:10,marginBottom:5},roleTop:{flexDirection:'row',alignItems:'center',gap:10},roleName:{fontSize:15,fontWeight: typography.body.medium.fontWeight,color:colors.light.label.neutral},chips:{flexDirection:'row',gap:6,marginTop:7},chip:{height:20,paddingHorizontal:9,borderRadius:10,borderWidth:1,borderColor:colors.light.line.neutral,justifyContent:'center'},chipActive:{borderColor:colors.primary},chipText:{fontSize:11,color:colors.light.line.normal},chipTextActive:{color:colors.primary},save:{height:49,borderRadius:10,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',marginTop: spacing.lg},saveText:{fontSize: typography.headline.headline1.semibold.fontSize,fontWeight: typography.body.semibold.fontWeight,color:colors.light.background.normal},
});
