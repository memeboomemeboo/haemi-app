import { View, Text } from 'react-native';
import { BottomNavigation } from '@/shared/ui';

export default function SettingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <Text>설정</Text>
      <BottomNavigation activeTab="Setting" />
    </View>
  );
}
