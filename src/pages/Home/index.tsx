import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BottomNavigation, type NavigationTab } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';
import { UserCard } from '@/widgets/UserCard';
import { HaemiSection } from '@/widgets/HaemiSection';
import { TodayActivities } from '@/widgets/TodayActivities';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('Home');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <HomeHeader />
        <UserCard />
        <HaemiSection />
        <TodayActivities />
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
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  spacer: {
    height: 20,
  },
});
