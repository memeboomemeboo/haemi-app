import { useCallback, useState } from 'react';
import { colors, spacing, typography } from '@/shared/constants';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { myPageService, type FamilyDetailResponse } from '@/shared/api';
import { useAndroidBackHandler } from '@/shared/hooks';
import { BottomNavigation, Profile, Arrow } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';

export default function MyFamilyScreen() {
  const router = useRouter();
  const [family, setFamily] = useState<FamilyDetailResponse | null>();

  useFocusEffect(useCallback(() => {
    myPageService.getFamily()
      .then(setFamily)
      .catch(() => { setFamily(null); Alert.alert('불러오기 실패', '가족 정보를 불러오지 못했어요.'); });
  }, []));

  useAndroidBackHandler(
    useCallback(() => {
      router.replace('/my-page' as Href);
      return true;
    }, [router]),
  );

  const elderNames = family?.elders.map((elder) => elder.name).join(' · ') ?? '';
  const members = family ? [
    ...family.elders.map((elder) => ({ id: `elder-${elder.elderId}`, name: elder.name, meta: `어르신${elder.roleLabel ? ` · ${elder.roleLabel}` : ''}` })),
    ...family.guardians.map((guardian) => ({ id: `guardian-${guardian.userId}`, name: guardian.name, meta: `보호자${guardian.roleLabel ? ` · ${guardian.roleLabel}` : ''}` })),
  ] : [];

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.headerContainer}>
          <HomeHeader showSetting={false} />
        </View>
        <View style={styles.pageTitle}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Arrow size={22} color={colors.light.label.neutral} style={styles.backArrow} />
          </Pressable>
          <Text style={styles.title}>우리 가족</Text>
        </View>
        {family === undefined ? <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View> : <>
          <View style={styles.summaryHead}><Text style={styles.sectionTitle}>우리 가족</Text><Text style={styles.count}>어르신 {family?.elders.length ?? 0}명</Text></View>
          <View style={styles.summary}><Text style={styles.familyName}>{family?.name ?? '등록된 가족 없음'}</Text><Text numberOfLines={1} style={styles.people}>{elderNames ? `${elderNames} 님` : '-'}</Text></View>
          <View style={styles.divider} />
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.listHead}><Text style={styles.label}>가족 목록</Text><View style={styles.badges}><Text style={styles.badge}>보호자 {family?.guardians.length ?? 0}</Text><Text style={styles.badge}>어르신 {family?.elders.length ?? 0}/4</Text></View></View>
            {members.map((member, index) => <View key={member.id} style={[styles.member, index % 3 === 2 && styles.memberFilled]}><Profile size={32} color={colors.primary} /><View><Text style={styles.memberName}>{member.name}</Text><Text style={styles.meta}>{member.meta}</Text></View></View>)}
            {family && family.elders.length < 4 && <Pressable style={styles.add} onPress={() => router.push('/elder-register' as Href)}><Text style={styles.addText}>+ 구성원 추가</Text></Pressable>}
          </ScrollView>
        </>}
      </SafeAreaView>
      <BottomNavigation activeTab="Setting" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.light.background.normal},safe:{flex:1},loading:{flex:1,alignItems:'center',justifyContent:'center'},headerContainer:{paddingHorizontal:20,paddingVertical:8},pageTitle:{height:61,paddingHorizontal:27,flexDirection:'row',alignItems:'center',gap:12},backArrow:{transform:[{scaleX:-1}]},title:{fontSize: typography.title.title2.bold.fontSize,fontWeight: typography.title.title2.bold.fontWeight,color:colors.light.label.neutral},summaryHead:{marginTop: spacing['3xl'],paddingHorizontal: spacing['2xl'],flexDirection:'row',justifyContent:'space-between',alignItems:'center'},sectionTitle:{fontSize: typography.headline.headline1.semibold.fontSize,fontWeight: typography.body.semibold.fontWeight,color:colors.light.label.neutral},count:{fontSize: typography.headline.headline2.medium.fontSize,color:colors.light.label.assistive},summary:{height:53,margin: spacing['2xl'],marginTop: spacing.xl,borderRadius:10,backgroundColor:colors.light.background.alternative,paddingHorizontal:17,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap: spacing.md},familyName:{fontSize: typography.headline.headline2.medium.fontSize,color:colors.primary},people:{flex:1,textAlign:'right',fontSize: typography.headline.headline2.medium.fontSize,color:colors.light.label.neutral},divider:{height:4,backgroundColor:colors.light.background.neutral},content:{padding:36,paddingTop: spacing['4xl']},listHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom: spacing.md},label:{fontSize: typography.label.medium.fontSize,color:colors.light.label.assistive},badges:{flexDirection:'row',gap: spacing.sm},badge:{fontSize: typography.caption.regular.fontSize,color:colors.primary,backgroundColor:colors.palette.red[90],borderRadius:10,paddingHorizontal: spacing.sm,paddingVertical:3},member:{height:58,borderRadius:14,borderWidth:1,borderColor:colors.light.line.alternative,flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal: spacing.md,marginBottom: spacing.sm},memberFilled:{backgroundColor:colors.light.background.neutral,borderColor:colors.light.background.neutral},memberName:{fontSize:15,fontWeight: typography.body.semibold.fontWeight,color:colors.light.label.neutral},meta:{fontSize:11,color:colors.light.label.assistive,marginTop:2},add:{height:38,borderRadius:10,borderWidth:1,borderStyle:'dashed',borderColor:colors.primary,alignItems:'center',justifyContent:'center',marginTop:9},addText:{fontSize: typography.label.medium.fontSize,color:colors.primary},
});
