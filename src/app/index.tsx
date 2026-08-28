import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import HomeScreen from '@/pages/Home';
import ElderHomeScreen from '@/pages/ElderHome';
import AuthStack from '@/widgets/AuthStack';
import { useUserGroup } from '@/entities/user';
import { useUserContext } from '@/shared/context/UserContext';
import { colors } from '@/shared/constants';

export default function RootScreen() {
  const { token, role, isHydrating, setRelation, setGroup } = useUserContext();
  const { group } = useUserGroup();

  // 그룹 정보가 로드되었으면 Context에 저장
  useEffect(() => {
    if (group) {
      setGroup(group);
      if (group.members && group.members.length > 0) {
        const userMember = group.members[0];
        setRelation(userMember.relation);
      }
    }
  }, [group, setGroup, setRelation]);

  // hydration 진행 중 로딩 표시
  if (isHydrating) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 로그인 상태 확인
  if (!token) {
    return <AuthStack />;
  }

  // 인증이 완료되면 그룹 유무와 관계없이 바로 홈으로 이동한다.
  // 그룹 생성·참여와 관계 설정은 마이페이지에서 별도로 진행한다.
  if (role === 'ELDER') {
    return <ElderHomeScreen />;
  }

  return <HomeScreen />;
}
