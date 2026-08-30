import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authService, myPageService, type FamilyDetailResponse, type MyPageProfileResponse } from '@/shared/api';
import { useUserContext } from '@/shared/context/UserContext';
import { Arrow, BottomNavigation, Profile, Setting } from '@/shared/ui';

const C = { orange: '#fd6941', red: '#fc3803', text: '#3c3e3f', assist: '#76787a', fill: '#f7f7f7', alt: '#fafafa' };

export default function MyPageScreen() {
  const router = useRouter();
  const { logout } = useUserContext();
  const [profile, setProfile] = useState<MyPageProfileResponse>();
  const [family, setFamily] = useState<FamilyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextProfile, nextFamily] = await Promise.all([myPageService.getProfile(), myPageService.getFamily()]);
      setProfile(nextProfile);
      setFamily(nextFamily);
    } catch {
      Alert.alert('불러오기 실패', '마이페이지 정보를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const handleLogout = () => Alert.alert('로그아웃', '로그아웃하시겠어요?', [
    { text: '취소', style: 'cancel' },
    { text: '로그아웃', style: 'destructive', onPress: async () => { await authService.logout().catch(() => undefined); logout(); router.replace('/'); } },
  ]);

  const elderNames = family?.elders.map((elder) => elder.name).join(' · ') ?? '';
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="뒤로 가기" hitSlop={10} onPress={() => router.back()}><Arrow size={22} color={C.text} style={styles.backArrow} /></Pressable>
          <Text style={styles.title}>마이페이지</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={undefined}>
          <Pressable style={styles.profileCard} onPress={() => router.push('/profile-edit' as Href)}>
            {profile?.profileImageUrl ? <Image source={{ uri: profile.profileImageUrl }} style={styles.profileImage} /> : <Profile size={39} color="#ff8062" />}
            <Text style={styles.profileName}>{profile?.name ?? (loading ? '불러오는 중' : '-')}</Text>
            {loading ? <ActivityIndicator color={C.orange} /> : <Setting size={19} color={C.assist} />}
          </Pressable>
          <Section title="내 정보">
            <InfoRow label="이름" value={profile?.name ?? '-'} />
            <InfoRow label="생년월일" value={formatDate(profile?.birthDate)} />
            <InfoRow label="전화번호" value={formatPhone(profile?.phone)} />
            <InfoRow label="아이디" value={profile?.loginId ? `@${profile.loginId}` : '-'} last />
          </Section>
          <View style={styles.divider} />
          <Pressable style={styles.familySection} disabled={!family} onPress={() => router.push('/my-family' as Href)}>
            <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>우리 가족</Text><Text style={styles.familyCount}>어르신 {family?.elders.length ?? 0}명</Text></View>
            <View style={styles.familySummary}><Text style={styles.familyName}>{family?.name ?? '등록된 가족 없음'}</Text><Text numberOfLines={1} style={styles.familyPeople}>{elderNames ? `${elderNames} 님` : '-'}</Text></View>
          </Pressable>
          <View style={styles.divider} />
          <View style={styles.actions}>
            <ActionRow label="어르신 등록하기" onPress={() => router.push('/elder-register' as Href)} disabled={!family} />
            <ActionRow label="가족 생성하기" onPress={() => router.push('/family-create' as Href)} disabled={Boolean(family)} last />
            <Pressable style={styles.logoutButton} onPress={handleLogout}><Text style={styles.logoutText}>로그아웃</Text></Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNavigation activeTab="Setting" tabs={['Home', 'Album', 'Report', 'Setting']} />
    </View>
  );
}

function formatDate(value?: string): string { return value ? value.replaceAll('-', '.') : '-'; }
function formatPhone(value?: string): string {
  if (!value) return '-';
  const digits = value.replace(/\D/g, '');
  return digits.length === 11 ? digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : value;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.infoList}>{children}</View></View>; }
function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) { return <View style={[styles.infoRow, !last && styles.infoBorder]}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>; }
function ActionRow({ label, onPress, disabled = false, last = false }: { label: string; onPress: () => void; disabled?: boolean; last?: boolean }) { return <Pressable disabled={disabled} onPress={onPress} style={[styles.actionRow, !last && styles.infoBorder]}><Text style={[styles.actionText, disabled && styles.disabled]}>{label}</Text><Arrow size={18} color={disabled ? '#c1c2c3' : C.text} /></Pressable>; }

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#fff'},safe:{flex:1},header:{height:61,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:27},backArrow:{transform:[{scaleX:-1}]},title:{fontSize:24,fontWeight:'700',lineHeight:31,color:C.text,letterSpacing:-.48},scrollContent:{paddingBottom:24},profileCard:{height:64,marginHorizontal:20,marginTop:5,borderRadius:15,backgroundColor:C.fill,flexDirection:'row',alignItems:'center',gap:11,paddingHorizontal:13},profileImage:{width:39,height:39,borderRadius:20},profileName:{flex:1,fontSize:18,fontWeight:'600',color:C.text,letterSpacing:-.36},section:{paddingHorizontal:24,paddingTop:54,paddingBottom:24},sectionTitle:{fontSize:20,fontWeight:'600',lineHeight:26,color:C.text,letterSpacing:-.4},infoList:{marginTop:24},infoRow:{height:53,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},infoBorder:{borderBottomWidth:1.5,borderBottomColor:C.fill},infoLabel:{fontSize:18,fontWeight:'500',color:C.assist,letterSpacing:-.36},infoValue:{fontSize:18,fontWeight:'500',color:C.text,letterSpacing:-.36},divider:{height:4,backgroundColor:C.fill},familySection:{paddingHorizontal:24,paddingVertical:36},sectionHeading:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},familyCount:{fontSize:18,fontWeight:'500',color:C.assist},familySummary:{height:53,borderRadius:10,backgroundColor:C.alt,marginTop:24,paddingHorizontal:17,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},familyName:{fontSize:18,fontWeight:'500',color:C.orange},familyPeople:{flex:1,textAlign:'right',fontSize:18,fontWeight:'500',color:C.text},actions:{paddingHorizontal:24,paddingTop:24,paddingBottom:16},actionRow:{height:53,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},actionText:{fontSize:18,fontWeight:'500',color:C.text},disabled:{color:'#c1c2c3'},logoutButton:{height:36,borderRadius:10,backgroundColor:C.red,alignItems:'center',justifyContent:'center',marginTop:40},logoutText:{fontSize:18,fontWeight:'600',color:C.fill},
});
