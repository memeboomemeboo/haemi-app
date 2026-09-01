import { useCallback, useState } from 'react';
import { colors, spacing, typography } from '@/shared/constants';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authService, myPageService, type FamilyDetailResponse, type MyPageProfileResponse } from '@/shared/api';
import { useUserContext } from '@/shared/context/UserContext';
import { useAndroidBackHandler } from '@/shared/hooks';
import { Arrow, BottomNavigation, Profile, Setting } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';


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

  useAndroidBackHandler(
    useCallback(() => {
      router.replace('/');
      return true;
    }, [router]),
  );

  const handleLogout = () => Alert.alert('로그아웃', '로그아웃하시겠어요?', [
    { text: '취소', style: 'cancel' },
    { text: '로그아웃', style: 'destructive', onPress: async () => { await authService.logout().catch(() => undefined); logout(); router.replace('/'); } },
  ]);

  const elderNames = family?.elders.map((elder) => elder.name).join(' · ') ?? '';
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.headerContainer}>
          <HomeHeader showSetting={false} />
        </View>
        <View style={styles.pageTitle}>
          <Text style={styles.title}>마이페이지</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={undefined}>
          <Pressable style={styles.profileCard} onPress={() => router.push('/profile-edit' as Href)}>
            {profile?.profileImageUrl ? <Image source={{ uri: profile.profileImageUrl }} style={styles.profileImage} /> : <Profile size={39} color={colors.primary} />}
            <Text style={styles.profileName}>{profile?.name ?? (loading ? '불러오는 중' : '-')}</Text>
            {loading ? <ActivityIndicator color={colors.primary} /> : <Setting size={19} color={colors.light.label.assistive} />}
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
      <BottomNavigation activeTab="Setting" />
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
function ActionRow({ label, onPress, disabled = false, last = false }: { label: string; onPress: () => void; disabled?: boolean; last?: boolean }) { return <Pressable disabled={disabled} onPress={onPress} style={[styles.actionRow, !last && styles.infoBorder]}><Text style={[styles.actionText, disabled && styles.disabled]}>{label}</Text><Arrow size={18} color={disabled ? colors.light.line.normal : colors.light.label.neutral} /></Pressable>; }

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.light.background.normal},safe:{flex:1},headerContainer:{paddingHorizontal:20,paddingVertical:8},pageTitle:{height:61,flexDirection:'row',alignItems:'center',gap:spacing.md,paddingHorizontal:27},title:{fontSize:typography.title.title2.bold.fontSize,fontWeight:typography.title.title2.bold.fontWeight,lineHeight:31,color:colors.light.label.neutral,letterSpacing:-.48},scrollContent:{paddingBottom:spacing['2xl']},profileCard:{height:64,marginHorizontal:spacing.xl,marginTop:5,borderRadius:15,backgroundColor:colors.light.background.neutral,flexDirection:'row',alignItems:'center',gap:11,paddingHorizontal:13},profileImage:{width:39,height:39,borderRadius:spacing.xl},profileName:{flex:1,fontSize:typography.headline.headline2.semibold.fontSize,fontWeight:typography.headline.headline2.semibold.fontWeight,color:colors.light.label.neutral,letterSpacing:-.36},section:{paddingHorizontal:spacing['2xl'],paddingTop:54,paddingBottom:spacing['2xl']},sectionTitle:{fontSize:typography.headline.headline1.semibold.fontSize,fontWeight:typography.headline.headline1.semibold.fontWeight,lineHeight:26,color:colors.light.label.neutral,letterSpacing:-.4},infoList:{marginTop:spacing['2xl']},infoRow:{height:53,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},infoBorder:{borderBottomWidth:1.5,borderBottomColor:colors.light.background.neutral},infoLabel:{fontSize:typography.headline.headline2.medium.fontSize,fontWeight:typography.headline.headline2.medium.fontWeight,color:colors.light.label.assistive,letterSpacing:-.36},infoValue:{fontSize:typography.headline.headline2.medium.fontSize,fontWeight:typography.headline.headline2.medium.fontWeight,color:colors.light.label.neutral,letterSpacing:-.36},divider:{height:spacing.xs,backgroundColor:colors.light.background.neutral},familySection:{paddingHorizontal:spacing['2xl'],paddingVertical:36},sectionHeading:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},familyCount:{fontSize:typography.headline.headline2.medium.fontSize,fontWeight:typography.headline.headline2.medium.fontWeight,color:colors.light.label.assistive},familySummary:{height:53,borderRadius:10,backgroundColor:colors.light.background.alternative,marginTop:spacing['2xl'],paddingHorizontal:17,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:spacing.md},familyName:{fontSize:typography.headline.headline2.medium.fontSize,fontWeight:typography.headline.headline2.medium.fontWeight,color:colors.primary},familyPeople:{flex:1,textAlign:'right',fontSize:typography.headline.headline2.medium.fontSize,fontWeight:typography.headline.headline2.medium.fontWeight,color:colors.light.label.neutral},actions:{paddingHorizontal:spacing['2xl'],paddingTop:spacing['2xl'],paddingBottom:spacing.lg},actionRow:{height:53,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},actionText:{fontSize:typography.headline.headline2.medium.fontSize,fontWeight:typography.headline.headline2.medium.fontWeight,color:colors.light.label.neutral},disabled:{color:colors.light.line.normal},logoutButton:{height:36,borderRadius:10,backgroundColor:colors.status.error,alignItems:'center',justifyContent:'center',marginTop:spacing['4xl']},logoutText:{fontSize:typography.headline.headline2.semibold.fontSize,fontWeight:typography.headline.headline2.semibold.fontWeight,color:colors.light.background.neutral},
});
