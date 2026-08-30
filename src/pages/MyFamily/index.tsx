import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { myPageService, type FamilyDetailResponse } from '@/shared/api';
import { Arrow, BottomNavigation, Profile } from '@/shared/ui';

const C = { orange: '#fd6941', text: '#3c3e3f', assist: '#76787a', fill: '#f7f7f7', line: '#e8e8e9' };

export default function MyFamilyScreen() {
  const router = useRouter();
  const [family, setFamily] = useState<FamilyDetailResponse | null>();

  useFocusEffect(useCallback(() => {
    myPageService.getFamily()
      .then(setFamily)
      .catch(() => { setFamily(null); Alert.alert('불러오기 실패', '가족 정보를 불러오지 못했어요.'); });
  }, []));

  const elderNames = family?.elders.map((elder) => elder.name).join(' · ') ?? '';
  const members = family ? [
    ...family.elders.map((elder) => ({ id: `elder-${elder.elderId}`, name: elder.name, meta: `어르신${elder.roleLabel ? ` · ${elder.roleLabel}` : ''}` })),
    ...family.guardians.map((guardian) => ({ id: `guardian-${guardian.userId}`, name: guardian.name, meta: `보호자${guardian.roleLabel ? ` · ${guardian.roleLabel}` : ''}` })),
  ] : [];

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}><Pressable onPress={() => router.back()} hitSlop={10}><Arrow size={22} color={C.text} style={styles.backArrow} /></Pressable><Text style={styles.title}>우리 가족</Text></View>
        {family === undefined ? <View style={styles.loading}><ActivityIndicator color={C.orange} /></View> : <>
          <View style={styles.summaryHead}><Text style={styles.sectionTitle}>우리 가족</Text><Text style={styles.count}>어르신 {family?.elders.length ?? 0}명</Text></View>
          <View style={styles.summary}><Text style={styles.familyName}>{family?.name ?? '등록된 가족 없음'}</Text><Text numberOfLines={1} style={styles.people}>{elderNames ? `${elderNames} 님` : '-'}</Text></View>
          <View style={styles.divider} />
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.listHead}><Text style={styles.label}>가족 목록</Text><View style={styles.badges}><Text style={styles.badge}>보호자 {family?.guardians.length ?? 0}</Text><Text style={styles.badge}>어르신 {family?.elders.length ?? 0}/4</Text></View></View>
            {members.map((member, index) => <View key={member.id} style={[styles.member, index % 3 === 2 && styles.memberFilled]}><Profile size={32} color="#ff8062" /><View><Text style={styles.memberName}>{member.name}</Text><Text style={styles.meta}>{member.meta}</Text></View></View>)}
            {family && family.elders.length < 4 && <Pressable style={styles.add} onPress={() => router.push('/elder-register' as Href)}><Text style={styles.addText}>+ 구성원 추가</Text></Pressable>}
          </ScrollView>
        </>}
      </SafeAreaView>
      <BottomNavigation activeTab="Setting" tabs={['Home', 'Album', 'Report', 'Setting']} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#fff'},safe:{flex:1},loading:{flex:1,alignItems:'center',justifyContent:'center'},header:{height:61,paddingHorizontal:27,flexDirection:'row',alignItems:'center',gap:12},backArrow:{transform:[{scaleX:-1}]},title:{fontSize:24,fontWeight:'700',color:C.text},summaryHead:{marginTop:32,paddingHorizontal:24,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},sectionTitle:{fontSize:20,fontWeight:'600',color:C.text},count:{fontSize:18,color:C.assist},summary:{height:53,margin:24,marginTop:20,borderRadius:10,backgroundColor:'#fafafa',paddingHorizontal:17,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},familyName:{fontSize:18,color:C.orange},people:{flex:1,textAlign:'right',fontSize:18,color:C.text},divider:{height:4,backgroundColor:C.fill},content:{padding:36,paddingTop:40},listHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},label:{fontSize:14,color:C.assist},badges:{flexDirection:'row',gap:8},badge:{fontSize:12,color:C.orange,backgroundColor:'#fed7cd',borderRadius:10,paddingHorizontal:8,paddingVertical:3},member:{height:58,borderRadius:14,borderWidth:1,borderColor:C.line,flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:12,marginBottom:8},memberFilled:{backgroundColor:C.fill,borderColor:C.fill},memberName:{fontSize:15,fontWeight:'600',color:C.text},meta:{fontSize:11,color:C.assist,marginTop:2},add:{height:38,borderRadius:10,borderWidth:1,borderStyle:'dashed',borderColor:C.orange,alignItems:'center',justifyContent:'center',marginTop:9},addText:{fontSize:14,color:C.orange},
});
