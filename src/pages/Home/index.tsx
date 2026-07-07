import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSeniorProfile } from '@/entities/user';
import { useTodayActivities } from '@/entities/activity';
import { BottomNavigation } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';
import { UserCard } from '@/widgets/UserCard';
import { HaemiSection } from '@/widgets/HaemiSection';
import { TodayActivities } from '@/widgets/TodayActivities';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useSeniorProfile();
  const { activities } = useTodayActivities();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(insets.top, 20) }]}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />
        <UserCard profile={profile} />
        <HaemiSection />
        <TodayActivities activities={activities} />
      </ScrollView>

      <BottomNavigation activeTab="Home" />
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
  },
  contentContainer: {
    paddingHorizontal: 26,
    paddingBottom: 20,
  },
});
