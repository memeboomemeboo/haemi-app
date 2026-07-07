import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { HaemiHeader } from '@/components/haemi-header';

export default function ReportScreen() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogout = () => {
    setLogoutConfirmOpen(false);
    Alert.alert('로그아웃', '로그아웃되었습니다.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <HaemiHeader
        settingsOpen={settingsOpen}
        logoutConfirmOpen={logoutConfirmOpen}
        userLabel="박승아(seunga418)"
        onToggleSettings={() => setSettingsOpen((current) => !current)}
        onCloseSettings={() => setSettingsOpen(false)}
        onOpenLogoutConfirm={() => setLogoutConfirmOpen(true)}
        onCloseLogoutConfirm={() => setLogoutConfirmOpen(false)}
        onConfirmLogout={handleLogout}
      />
      <View style={styles.content}>
        <Text style={styles.title}>인지 리포트</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 14,
  },
  title: {
    color: '#3c3e3f',
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
  },
});
