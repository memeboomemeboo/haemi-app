import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Alarm, Setting } from '@/shared/ui/Icon';

const logoSource = require('../../../assets/images/haemi-logo.png');

interface HomeHeaderProps {
  onAlarmPress?: () => void;
  onSettingPress?: () => void;
}

export const HomeHeader = ({ onAlarmPress, onSettingPress }: HomeHeaderProps) => {
  return (
    <View style={styles.header}>
      <Image source={logoSource} style={styles.logo} resizeMode="contain" />
      <View style={styles.headerIcons}>
        <Pressable onPress={onAlarmPress} hitSlop={8}>
          <Alarm size={22} color="#dadbdc" />
        </Pressable>
        <Pressable onPress={onSettingPress} hitSlop={8}>
          <Setting size={24} color="#dadbdc" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 31,
    paddingHorizontal: 0,
  },
  logo: {
    width: 62,
    height: 24,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
});
