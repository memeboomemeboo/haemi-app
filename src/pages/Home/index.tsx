import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useSeniorProfile } from '@/entities/user';
import { useTodayActivities } from '@/entities/activity';
import { BottomNavigation, type NavigationTab } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';
import { UserCard } from '@/widgets/UserCard';
import { HaemiSection } from '@/widgets/HaemiSection';
import { TodayActivities } from '@/widgets/TodayActivities';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('Home');
  const { profile } = useSeniorProfile();
  const { activities } = useTodayActivities();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentInset={{ bottom: 20 }}
      >
        <HomeHeader />
        <UserCard profile={profile} />
        <HaemiSection />
        <TodayActivities activities={activities} />
        <View style={styles.spacer} />
      </ScrollView>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 60,
  },
  spacer: {
    height: 20,
  },
});
