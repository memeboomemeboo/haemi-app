import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomNavigation, type NavigationTab } from '@/shared/ui';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('Home');

  return (
    <View style={styles.container}>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
