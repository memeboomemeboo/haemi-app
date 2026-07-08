import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '@/shared/ui';

export default function ReportScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>리포트</Text>
        </View>
      </SafeAreaView>
      <BottomNavigation activeTab="Report" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  title: {
    color: '#3c3e3f',
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
  },
});
