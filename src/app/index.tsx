import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import HomeScreen from '@/pages/Home';
import GroupCreateScreen from '@/pages/GroupCreate';
import GroupJoinScreen from '@/pages/GroupJoin';
import RoleSelectScreen from '@/pages/RoleSelect';
import RelationSelectScreen from '@/pages/RelationSelect';
import AuthStack from '@/widgets/AuthStack';
import { useUserGroup } from '@/entities/user';
import { useUserContext } from '@/shared/context/UserContext';
import { colors } from '@/shared/constants';
import type { Relation } from '@/entities/group';

export default function RootScreen() {
  const { token, role, relation, setRole, setRelation, setGroup } = useUserContext();
  const { group, isLoading: groupLoading } = useUserGroup();

  // 그룹 정보가 로드되었으면 Context에 저장
  useEffect(() => {
    if (group) {
      setGroup(group);
    }
  }, [group, setGroup]);

  //  로그인 상태 확인
  if (!token) {
    return <AuthStack />;
  }

  //  역할 확인 (로그인했으나 역할 선택 안 함)
  if (!role) {
    return (
      <RoleSelectScreen
        onRoleSelect={(selectedRole) => {
          setRole(selectedRole);
        }}
      />
    );
  }

  // 👨 3️⃣ 관계 확인 (로그인 및 역할 선택했으나 관계 미선택)
  if (!relation) {
    return (
      <RelationSelectScreen
        onRelationSelect={(selectedRelation: Relation) => {
          setRelation(selectedRelation);
        }}
      />
    );
  }

  // 📊 4️⃣ 그룹 로딩 중
  if (groupLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 👨‍👩‍👧 5️⃣ 그룹 선택 (역할과 관계는 있지만 그룹이 없음)
  if (!group) {
    if (role === 'GUARDIAN') {
      return <GroupCreateScreen />;
    } else if (role === 'ELDER') {
      return <GroupJoinScreen />;
    }
  }

  // 🏠 6️⃣ 모든 것이 준비됨 → 홈 화면
  return <HomeScreen />;
}
