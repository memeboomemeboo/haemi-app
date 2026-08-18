import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import HomeScreen from '@/pages/Home';
import ElderHomeScreen from '@/pages/ElderHome';
import GroupCreateScreen from '@/pages/GroupCreate';
import GroupJoinScreen from '@/pages/GroupJoin';
import RoleSelectScreen from '@/pages/RoleSelect';
import RelationSelectScreen from '@/pages/RelationSelect';
import AuthStack from '@/widgets/AuthStack';
import { useUserGroup } from '@/entities/user';
import { useUserContext } from '@/shared/context/UserContext';
import { colors } from '@/shared/constants';
import type { Relation } from '@/shared/types';

export default function RootScreen() {
  const { token, role, relation, isHydrating, setRole, setRelation, setGroup } = useUserContext();
  const { group, isLoading: groupLoading } = useUserGroup();

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

  // 그룹 로딩 중
  if (groupLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 그룹 선택 (그룹이 없음)
  if (!group) {
    // 관계 확인 (그룹 없고 관계 미선택)
    if (!relation) {
      return (
        <RelationSelectScreen
          onRelationSelect={(selectedRelation: Relation) => {
            setRelation(selectedRelation);
          }}
        />
      );
    }

    // 그룹 생성/참여
    if (role === 'FAMILY') {
      return <GroupCreateScreen />;
    } else if (role === 'ELDER') {
      return <GroupJoinScreen />;
    }
  }

  // 모든 것이 준비됨 → 역할에 따라 다른 홈 화면 표시
  if (role === 'ELDER') {
    return <ElderHomeScreen />;
  }

  return <HomeScreen />;
}
